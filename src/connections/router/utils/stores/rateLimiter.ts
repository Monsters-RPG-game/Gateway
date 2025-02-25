import Log from 'simpl-loggar';
import State from '../../../../tools/state.js';
import type { IncrementResponse, Store } from 'express-rate-limit';

export default class RateLimitStore implements Store {
  private readonly _filter: RegExp = /\b(?:\d{1,3}\.){3}\d{1,3}\b/gu;

  private get filter(): RegExp {
    return this._filter;
  }
  /**
   * Increment request count for a given IP address.
   * If target is local address like ::1 or other, its by default inserted.
   * @param key Client's ip address or key .
   * @returns Incremented session data.
   */
  @Log.decorateDebug('RateLimiter', 'Incrementing')
  async increment(key: string): Promise<IncrementResponse> {
    const target = key === '::1' ? key : key.match(this.filter)![0];
    return State.redis.setRateLimit(target);
  }

  /**
   * Reset the request count for a given user.
   * @param key Client's ip or key.
   */
  @Log.decorateDebug('RateLimiter', 'Resetting keys')
  async resetKey(key: string): Promise<void> {
    const target = key === '::1' ? key : key.match(this.filter)![0];
    await State.redis.removeRateLimit(target);
  }

  /**
   * Decrease hits for selected user.
   * @param key Client's ip or key.
   */
  @Log.decorateDebug('RateLimiter', 'Decrementing')
  async decrement(key: string): Promise<void> {
    const target = key === '::1' ? key : key.match(this.filter)![0];
    await State.redis.decrementRateLimit(target);
  }
}
