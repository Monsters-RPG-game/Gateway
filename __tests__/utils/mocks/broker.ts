import Broker from '../../../src/connections/broker/index.js';
import type * as types from '../../../src/types/connection.js';
import * as enums from '../../../src/enums/index.js';
import { IBrokerAction } from '../../types/broker.js';
import Log from 'simpl-loggar'
import chalk from 'chalk';
import { IUserBrokerInfo } from '../../../src/types/user.js';

export default class FakeBroker extends Broker {
  private _actions: { action: IBrokerAction, subTarget: types.IRabbitSubTargets }[] = [];
  private _stats: { target: types.IRabbitTargets, subTarget: types.IRabbitSubTargets, stack: string, success: boolean, reason?: string }[] = []
  private _debug: boolean = false

  constructor() {
    super();
  }

  get stats(): { target: types.IRabbitTargets, subTarget: types.IRabbitSubTargets, stack: string, success: boolean, reason?: string }[] {
    return this._stats;
  }

  private get actions(): { action: IBrokerAction, subTarget: types.IRabbitSubTargets }[] {
    return this._actions;
  }

  private set actions(value: { action: IBrokerAction, subTarget: types.IRabbitSubTargets }[]) {
    this._actions = value;
  }

  get debug(): boolean {
    return this._debug
  }

  set debug(val: boolean) {
    this._debug = val
  }

  override async init(): Promise<void> {
    return new Promise(resolve => {
      Log.error('Fake broker', "Sorry, but you cannot init faked rabbit")
      resolve()
    })
  }

  override close(): void {
    Log.error('Fake broker', "Sorry, but you cannot init faked rabbit")
  }

  override sendLocally<T extends types.IRabbitSubTargets>(
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
    _locals: IUserBrokerInfo,
    _service: enums.EServices,
    _payload?: types.IRabbitConnectionData[T],
  ): void {
    const actionIndex = (this.actions.findIndex(a => a.subTarget === subTarget));
    const action = this.actions[actionIndex]?.action

    Log.debug('Fake broker', `Action for target: ${target} and subTarget: ${subTarget}`, action)

    delete this.actions[actionIndex]
    this.actions = this.actions.filter(a => a)

    if (!action) {
      this.stats.push({ target, subTarget, stack: (new Error()).stack as string, success: false, reason: "No callback provided" })

      return resolve({ type: enums.EMessageTypes.Send, payload: {} });
    }

    if (action!.shouldFail) {
      this.stats.push({ target, subTarget, stack: (new Error()).stack as string, success: true, reason: "Should fail" })

      reject(action.returns.payload);
    } else {
      this.stats.push({ target, subTarget, stack: (new Error()).stack as string, success: true })

      resolve({
        type: action.returns.target as Omit<enums.EMessageTypes, enums.EMessageTypes.Heartbeat>,
        payload: action.returns.payload,
      });
    }
  }

  clearActions(): void {
    this.actions = []
  }

  addAction(action: IBrokerAction, subTarget: types.IRabbitSubTargets): void {
    Log.debug("Fake broker", 'Adding new action', action, subTarget)
    this.actions.push({ action, subTarget })
  }

  getStats(): void {
    let succeed = this.stats.filter(s => s.success)
    let failed = this.stats.filter(s => !s.success)

    if (!this.debug) {
      succeed = succeed.map(s => {
        return {
          ...s,
          stack: ''
        }
      })
      failed = failed.map(f => {
        return {
          ...f,
          stack: ''
        }
      })

      if (succeed.length > 0) {
        console.info(chalk.bgGreen(chalk.black('Fake rabbit - passed')))
        console.info(succeed.map(s => `${s.target} : ${s.subTarget}`))
      }

      if (failed.length > 0) {
        console.info(chalk.bgRed(chalk.black('Fake rabbit - failed')))
        console.info(failed.map(f => `${f.target} : ${f.subTarget} - ${f.reason}`))
      }

      return
    }

    if (succeed.length > 0) {
      console.info(chalk.bgGreen('Fake rabbit - passed'))
      succeed.forEach(s => Log.debug('Fake rabbit', s))
    }

    if (failed.length > 0) {
      console.info(chalk.bgRed('Fake rabbit - failed'))
      failed.forEach(f => Log.debug('Fake rabbit', f))
    }
  }
}
