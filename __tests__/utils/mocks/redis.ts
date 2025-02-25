import { ClientRateLimitInfo } from 'express-rate-limit';
import Redis from '../../../src/connections/redis/index.js'
import { ERedisTargets } from '../../../src/enums/redis.js';
import { ISessionTokenData } from '../../../src/types/tokens.js';
import { ICachedUser, IUserSession } from '../../../src/types/user.js';
import { IUserEntity } from '../../../src/modules/users/entity.js';
import { IProfileEntity } from '../../../src/modules/profile/entity.js';

export default class FakeRedis extends Redis {
  private accessor fakeParams: Record<string, unknown[]> = {}

  override async init(): Promise<void> {
    //
  }

  cleanUp(): void {
    this.fakeParams = {}
  }

  override async getCachedUser(_id: string): Promise<ICachedUser | null> {
    return new Promise(resolve => {
      if(!this.fakeParams.cachedUsers) this.fakeParams.cachedUsers = []
      resolve(this.fakeParams.cachedUsers![0] as ICachedUser | null)
    })
  }

  override async getSession(_session: string): Promise<IUserSession | null> {
    return new Promise(resolve => {
      if(!this.fakeParams.sessions) this.fakeParams.session = []
      resolve(this.fakeParams.sessions![0] as IUserSession | null)
    })
  }

  override async getSessionToken(_id: string): Promise<ISessionTokenData | null> {
    return new Promise(resolve => {
      if(!this.fakeParams.sessionTokens) this.fakeParams.sessionTokens = []
      resolve(this.fakeParams.sessionTokens![0] as ISessionTokenData | null)
    })
  }

  override async getSessionTokenId(_userId: string): Promise<string | null> {
    return new Promise(resolve => {
      if(!this.fakeParams.sessionTokenId) this.fakeParams.sessionTokenId = []
      resolve(this.fakeParams.sessionTokenId![0] as string | null)
    })
  }

  override async getSessionTokenTTL(_sessionId: string): Promise<number> {
    return new Promise(resolve => {
      resolve(1)
    })
  }

  override async getUserToken(userId: string): Promise<{ accessToken: string | null; refreshToken: string | null }> {
    return new Promise(resolve =>  {
      if(!this.fakeParams.userToken) this.fakeParams.userToken = []
      const data = this.fakeParams.userToken as {userId: string, accessToken: string, refreshToken: string}[]
      const target = (data).find(e => e.userId === userId)
      resolve({ accessToken: target?.accessToken ? target.accessToken : null, refreshToken: target?.refreshToken ? target.refreshToken : null })
    })
  }

  override setExpirationDate(_target: ERedisTargets | string, _ttl: number): Promise<void> {
    return new Promise(resolve => {
      resolve()
    })
  }

  override async setRateLimit(_ip: string): Promise<ClientRateLimitInfo> {
    return new Promise(resolve => {
      if(!this.fakeParams.rateLimit) this.fakeParams.rateLimit = []
      resolve(this.fakeParams.rateLimit![0] as ClientRateLimitInfo)
    })
  }

  override async removeCachedUser(_target: string): Promise<void> {
    return new Promise(resolve => {
      resolve()
    })
  }

  override async updateCachedUser(
    _id: string,
    _value: {
      profile?: Partial<IProfileEntity>;
      account?: Partial<IUserEntity>;
    },
  ): Promise<void> {
    return new Promise(resolve => {
      resolve()
    })
  }

  override async addCachedUser(_user: { account: IUserEntity; profile: IProfileEntity }): Promise<void> {
    return new Promise(resolve => {
      resolve()
    })
  }

  override async addSessionToken(_id: string, _sessionData: ISessionTokenData, _eol: Date): Promise<void> {
    return new Promise(resolve => {
      resolve()
    })
  }

  override async addAccessToken(_userId: string, _token: string): Promise<void> {
    return new Promise(resolve => {
      resolve()
    })
  }

  override async addRefreshToken(_userId: string, _token: string): Promise<void> {
    return new Promise(resolve => {
      resolve()
    })
  }

  override async removeAccessToken(_userId: string): Promise<void> {
    return new Promise(resolve => {
      resolve()
    })
  }

  override async removeRefreshToken(_userId: string): Promise<void> {
    return new Promise(resolve => {
      resolve()
    })
  }

  override async removeSessionToken(_sessionId: string): Promise<void> {
    return new Promise(resolve => {
      resolve()
    })
  }

  override async removeSessionTokenId(_userId: string): Promise<void> {
    return new Promise(resolve => {
      resolve()
    })
  }

  override async removeUserTokens(_userId: string): Promise<void> {
    return new Promise(resolve => {
      resolve()
    })
  }

  override async addUserTokens(userId: string, accessToken: string, refreshToken: string): Promise<void> {
    return new Promise(resolve => {
      if(!this.fakeParams.userToken) this.fakeParams.userToken = []
      this.fakeParams.userToken.push({userId, accessToken, refreshToken})
      resolve()
    })
  }

  override async decrementRateLimit(_ip: string): Promise<void> {
    return new Promise(resolve => {
      resolve()
    })
  }

  override async addSession(_session: string, _sessionData: IUserSession): Promise<void> {
    return new Promise(resolve => {
      resolve()
    })
  }

  override async removeSession(_session: string): Promise<void> {
    return new Promise(resolve => {
      resolve()
    })
  }

  override async removeRateLimit(_ip: string): Promise<void> {
    return new Promise(resolve => {
      resolve()
    })
  }
}
