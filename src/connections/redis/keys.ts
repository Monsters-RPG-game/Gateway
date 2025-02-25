import * as enums from '../../enums/index.js';

export default class RedisKeys {
  static rateLimit(ip: string): string {
    return `rateLimit:${ip}`;
  }

  static session(id: string): string {
    return `session:${id}`;
  }

  static sessionTokenId(userId: string): string {
    return `sessionTokensId:${userId}`;
  }

  static sessionToken(id: string): string {
    return `sessionToken:${id}`;
  }

  static accessToken(userId: string): string {
    return `accessToken:${userId}`;
  }

  static refreshToken(userId: string): string {
    return `refreshToken:${userId}`;
  }

  static userCache(userId: string): string {
    return `${enums.ERedisTargets.CachedUser}:${userId}`;
  }
}
