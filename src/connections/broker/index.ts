import amqplib from 'amqplib';
import Log from 'simpl-loggar';
import Controller from './controller.js';
import * as enums from '../../enums/index.js';
import { InternalError } from '../../errors/index.js';
import getConfig from '../../tools/configLoader.js';
import { generateRandomName, sleep } from '../../utils/index.js';
import type Communicator from './controller.js';
import type { IHealth } from '../../modules/health/subModules/get/types.js';
import type * as types from '../../types/index.js';

export default class Broker {
  private _closed: boolean = false;
  private _connection: amqplib.Connection | null = null;
  private _connectionTries = 0;
  private _channelTries = 0;
  private _services: {
    [key in types.IAvailableServices]: { timeout: NodeJS.Timeout | null; retries: number; dead: boolean };
  } = {
    [enums.EServices.Users]: { timeout: null, retries: 0, dead: true },
    [enums.EServices.Messages]: { timeout: null, retries: 0, dead: true },
  };
  private readonly _controller: Controller;
  private _channel: amqplib.Channel | null = null;
  private _queueName: string | undefined = undefined;

  private closeDeadQueue = async (target: types.IAvailableServices): Promise<void> => {
    switch (target) {
      case enums.EServices.Users:
        await this.channel!.purgeQueue(enums.EAmqQueues.Users);
        break;
      case enums.EServices.Messages:
        await this.channel!.purgeQueue(enums.EAmqQueues.Messages);
        break;
      default:
        Log.error('Socket', 'Got req to close socket that does not exist');
    }
    return this.controller.fulfillDeadQueue(target);
  };

  constructor() {
    this._controller = new Controller();
  }

  private get queueName(): string | undefined {
    return this._queueName;
  }

  private set queueName(value: string | undefined) {
    this._queueName = value;
  }

  private get closed(): boolean {
    return this._closed;
  }

  private set closed(value: boolean) {
    this._closed = value;
  }

  get channel(): amqplib.Channel | null {
    return this._channel;
  }

  private get controller(): Communicator {
    return this._controller;
  }

  getHealth(): IHealth {
    const data: Partial<IHealth> = { alive: 0 };
    Object.entries(this._services).forEach(([k, v]) => {
      data[k as enums.EServices] = !v.dead;
    });
    data.alive = Math.round(process.uptime());

    return data as IHealth;
  }

  async init(): Promise<void> {
    await this.initCommunication();
  }

  sendLocally<T extends types.IRabbitSubTargets>(
    target: types.IRabbitTargets,
    subTarget: T,
    resolve: (
      value:
        | { type: Omit<enums.EMessageTypes, enums.EMessageTypes.Heartbeat>; payload: unknown }
        | PromiseLike<{
            type: Omit<enums.EMessageTypes, enums.EMessageTypes.Heartbeat>;
            payload: unknown;
          }>,
    ) => void,
    reject: (reason?: unknown) => void,
    userData: types.IUserBrokerInfo,
    service: enums.EServices,
    payload?: types.IRabbitConnectionData[T],
  ): void {
    const queue = this._services[service as types.IAvailableServices];
    if (queue.dead) {
      Log.error('Rabbit', `Throwing internal error, due to dead queue ${service}`);
      throw new InternalError();
    }
    return this.controller.sendLocally(target, subTarget, resolve, reject, userData, service, this.channel!, payload);
  }

  close(): void {
    this.closed = true;
    this.cleanAll();
    if (this._connection) {
      this._connection
        .close()
        .then(() => {
          this.cleanAll();
        })
        .catch(() => undefined);
    }
  }

  private async reconnect(): Promise<void> {
    this.close();
    await this.initCommunication();
  }

  private async initCommunication(): Promise<void> {
    if (this._connectionTries++ > Number(enums.ERabbit.RetryLimit)) {
      Log.error('Rabbit', 'Gave up connecting to rabbit. Is rabbit dead?');
      throw new Error('Gave up connecting to rabbit. Is rabbit dead?');
    }

    try {
      const connection = await amqplib.connect(getConfig().amqpURL);

      Log.log('Rabbit', 'Connected to rabbit');
      this._connection = connection;
      connection.on('close', () => this.close());
      connection.on('error', async () => this.reconnect());
      await this.createChannels();
    } catch (err) {
      if (this.closed) return;
      Log.warn('Rabbit', 'Error connecting to RabbitMQ, retrying in 1 second');
      const error = err as types.IFullError;
      Log.error('Rabbit', error.message, error.stack);
      await sleep(1000);
      await this.initCommunication();
    }
  }

  private async createChannels(): Promise<void> {
    if (this.channel) return;
    if (this._channelTries++ > parseInt(Number(enums.ERabbit.RetryLimit).toString())) {
      Log.error('Rabbit', 'Error creating rabbit connection channel, stopped retrying');
      throw new Error('Rabbit died');
    }

    try {
      const channel = await this._connection!.createChannel();

      Log.log('Rabbit', 'Channel connected');
      this._channel = channel;
      this.listen();
      await this.createQueue();
    } catch (err) {
      if (this.closed) return;
      const error = err as types.IFullError;
      Log.error(
        'Rabbit',
        `Error creating rabbit connection channel, retrying in 1 second: ${(err as types.IFullError).message}`,
      );
      Log.error('Rabbit', error.message, error.stack);

      await sleep(1000);
      await this.createChannels();
    }
  }

  private listen(): void {
    this.channel!.on('close', () => this.cleanAll());
    this.channel!.on('error', () => this.reconnectChannel());
  }

  private async createQueue(): Promise<void> {
    const filtered = Object.entries(enums.EAmqQueues)
      .filter((e) => e[1] !== enums.EAmqQueues.Gateway)
      .map((e) => e[1]);
    await Promise.all(
      Object.values(filtered).map(async (queue) => {
        await this.channel!.assertQueue(queue, { durable: true });
      }),
    );
    this.queueName = `${enums.EAmqQueues.Gateway}-${generateRandomName()}`;
    await this.channel!.assertQueue(this.queueName, { durable: true });

    await this.channel!.assertExchange(enums.EAmqQueues.Gateway, 'fanout', { durable: true });
    await this.channel!.bindQueue(this.queueName, enums.EAmqQueues.Gateway, '');

    await this.channel!.consume(
      this.queueName,
      (message) => {
        if (!message) return Log.error('Rabbit', 'Received empty message');
        const payload = JSON.parse(message.content.toString()) as types.IRabbitMessage;
        if (payload.target === enums.EMessageTypes.Heartbeat) {
          return this.validateHeartbeat(payload.payload as types.IAvailableServices);
        }
        return this.errorWrapper(() => this.controller.sendExternally(payload));
      },
      { noAck: true },
    );
    this.validateConnections();
  }

  private validateHeartbeat(target: types.IAvailableServices): void {
    const service = this._services[target];
    clearTimeout(service.timeout!);

    if (service.dead) {
      Log.log(target, 'Resurrected');
    }

    this._services[target] = {
      ...this._services[target],
      timeout: setTimeout(() => this.checkHeartbeat(target), 30000),
      dead: false,
      retries: 0,
    };
  }

  private validateConnections(): void {
    const services = Object.entries(this._services);
    services.forEach((service) => {
      if (service[1].dead) {
        Log.log('Rabbit', 'Reviving service');
        this.retryHeartbeat(service[0] as types.IAvailableServices);
      } else {
        service[1].timeout = setTimeout(() => this.checkHeartbeat(service[0] as types.IAvailableServices), 30000);
      }
    });
  }

  private retryHeartbeat(target: types.IAvailableServices): void {
    const service = this._services[target];
    service.dead = true;
    if (service.retries >= 10) {
      Log.error(target, `Is down!. Stopped retrying after ${service.retries} retries.`);
      this.closeDeadQueue(target).catch((err) => {
        Log.error('Rabbit', "Couldn't clear queue");
        const error = err as types.IFullError;
        Log.error('Rabbit', error.message, error.stack);
      });
    } else {
      Log.warn(target, `Is down!. Trying to connect for ${service.retries + 1} time.`);
      this.controller.sendHeartbeat(this.channel!, target);
      service.timeout = setTimeout(() => this.retryHeartbeat(target), 5000);
      service.retries++;
    }
  }

  private checkHeartbeat(target: types.IAvailableServices): void {
    this.controller.sendHeartbeat(this.channel!, target);
    this._services[target].timeout = setTimeout(() => this.retryHeartbeat(target), 5000);
  }

  private async closeChannel(): Promise<void> {
    await Promise.all(
      Object.values(enums.EAmqQueues).map(async (queue) => {
        await this.channel!.purgeQueue(queue);
        await this.channel!.deleteQueue(queue);
      }),
    );

    await this.channel!.close();
    this._channel = null;
    this._channelTries = 0;
  }

  private async reconnectChannel(): Promise<void> {
    try {
      Log.error('Rabbit', 'Got err. Reconnecting');
      await this.closeChannel();
      await this.createChannels();
    } catch (err) {
      const error = err as types.IFullError;
      Log.error('Rabbit', "Couldn't create channels");
      Log.error('Rabbit', error.message, error.stack);
    }
  }

  private cleanAll(): void {
    this._channel = null;
    this._connectionTries = 0;
    this._channelTries = 0;
    Object.entries(this._services).forEach((s) => {
      clearTimeout(s[1].timeout!);
      delete this._services[s[0] as types.IAvailableServices];
    });
  }

  private errorWrapper(func: () => void): void {
    try {
      return func();
    } catch (err) {
      const error = err as types.IFullError;
      return Log.error('Rabbit', error.message, error.stack);
    }
  }
}
