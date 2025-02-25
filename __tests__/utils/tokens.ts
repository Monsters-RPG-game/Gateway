import KeyController from '../../src/modules/keys/index.js'
import FakeBroker from './mocks/broker.js'
import FakeRedis from './mocks/redis.js'
import State from '../../src/tools/state.js'
import fakeProfiles from './fakeData/profiles.json'
import TokensController from '../../src/modules/tokens/index.js';
import KeyRepository from '../../src/modules/keys/repository/index.js';
import KeyModel from '../../src/modules/keys/model.js';
import { IUserEntity } from '../../src/modules/users/entity.js';
import { EProfileSubTargets, EUserSubTargets } from '../../src/enums/target.js';
import { IProfileEntity } from '../../src/modules/profile/entity.js';
import { EMessageTypes } from '../../src/enums/connections.js';
import Log from 'simpl-loggar'

export default class Tokens {
  private _keyRepo: KeyRepository
  private _tokenController: TokensController
  private accessor baseUser: IUserEntity & Record<string, unknown> = {} as unknown as IUserEntity & Record<string, unknown>
  private accessor privateKey: string | null = null

  constructor(user: IUserEntity) {
    this.baseUser.userId = user._id as string
    this.baseUser._id = user._id as string
    this.baseUser.login = user.login

    this._keyRepo = new KeyRepository(KeyModel)
    this._tokenController = new TokensController(user._id as string);
  }

  private get tokenController(): TokensController {
    return this._tokenController
  }

  private get keyRepo(): KeyRepository {
    return this._keyRepo
  }

  /**
  * Create new private key in database and save it locally
  */
  async createKey(): Promise<string> {
    return new Promise((resolve, reject) => {
      new KeyController().createKeys().then((keys) => {
      this.privateKey = keys[0]!
      resolve(keys[0]!)
    }).catch(err => {
        Log.error('Tokens', 'Got error while creating key', (err as Error).message, (err as Error).stack)
        reject(err as Error)
      })
    })
  }

  /**
   * Add id of private key, created by another controller
   */
  addKey(keyId: string): void {
    this.privateKey = keyId
  }

  async createAccessToken(): Promise<string> {
    const userToken = await this.tokenController.createAccessToken(this.baseUser)
    await State.redis.addUserTokens(this.baseUser._id as string, 'test', 'test') // It doesn't matter, if keys are valid or not, code will only check if they exist, because they get auto removed after they expire

    return userToken
  }

  async cleanUp(): Promise<void> {
    if(this.privateKey) await this.keyRepo.remove(this.privateKey);
    (State.redis as FakeRedis).cleanUp();
  }

  /**
  * Create basic fakeBroker responses for full user authorization
  * @param fakeBroker Fake broker used for sending messages
  * @param userProfile: Optional user profile. if not provided, default `fakeProfiles.data[0]` will be returned
  */
  async initLoginParams(fakeBroker: FakeBroker, userProfile?: IProfileEntity): Promise<void> {
      fakeBroker.addAction({
        shouldFail: false,
        returns: { payload: [this.baseUser as Record<string, unknown>], target: EMessageTypes.Send },
      }, EUserSubTargets.GetName)
      fakeBroker.addAction({
        shouldFail: false,
        returns: { payload: [this.baseUser as Record<string, unknown>], target: EMessageTypes.Send },
      }, EUserSubTargets.GetName)
      fakeBroker.addAction({
        shouldFail: false,
        returns: { payload: (userProfile as IProfileEntity & Record<string, unknown>) ?? fakeProfiles.data[0] as Record<string, unknown>, target: EMessageTypes.Send },
      }, EProfileSubTargets.Get)
  }

  async initLoginParamsForWebsocket(fakeBroker: FakeBroker, userProfile?: IProfileEntity): Promise<void> {
      fakeBroker.addAction({
        shouldFail: false,
        returns: { payload: [this.baseUser as Record<string, unknown>], target: EMessageTypes.Send },
      }, EUserSubTargets.GetName)
      fakeBroker.addAction({
        shouldFail: false,
        returns: { payload: [this.baseUser as Record<string, unknown>], target: EMessageTypes.Send },
      }, EUserSubTargets.GetName)
      fakeBroker.addAction({
        shouldFail: false,
        returns: { payload: [this.baseUser as Record<string, unknown>], target: EMessageTypes.Send },
      }, EUserSubTargets.GetName)
      fakeBroker.addAction({
        shouldFail: false,
        returns: { payload: (userProfile as IProfileEntity & Record<string, unknown>) ?? fakeProfiles.data[0] as Record<string, unknown>, target: EMessageTypes.Send },
      }, EProfileSubTargets.Get)
  }
}

