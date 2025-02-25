import Validation from '../../../tools/validation.js';
import type { IAddKey } from './types.js';
import type { JWK } from 'jose';

export default class AddKey implements IAddKey {
  readonly kty: string;
  readonly n: string;
  readonly e: string;
  readonly d: string;
  readonly p: string;
  readonly q: string;
  readonly dp: string;
  readonly dq: string;
  readonly qi: string;

  constructor(data: JWK) {
    this.kty = data.kty;
    this.n = data.n as string;
    this.e = data.e as string;
    this.d = data.d as string;
    this.p = data.p as string;
    this.q = data.q as string;
    this.dp = data.dp as string;
    this.dq = data.dq as string;
    this.qi = data.qi as string;

    this.validate();
  }

  private validate(): void {
    new Validation(this.kty, 'kty').isDefined();
    new Validation(this.n, 'n').isDefined();
    new Validation(this.e, 'e').isDefined();
    new Validation(this.d, 'd').isDefined();
    new Validation(this.p, 'p').isDefined();
    new Validation(this.q, 'q').isDefined();
    new Validation(this.dp, 'dp').isDefined();
    new Validation(this.dq, 'dq').isDefined();
    new Validation(this.qi, 'qi').isDefined();
  }
}
