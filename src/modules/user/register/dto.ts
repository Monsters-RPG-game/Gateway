import Validation from '../../../tools/validation/index.js';
import type { IRegisterDto } from './types.js';

/**
 * @openapi
 * components:
 *   schemas:
 *     IRegisterDto:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           maxLength: 200
 *         login:
 *           type: string
 *           minLength: 3
 *           maxLength: 30
 *           pattern: "^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$"
 *         password:
 *           type: string
 *           minLength: 6
 *           maxLength: 200
 *           pattern: "^.*(?=.{6,})(?=.*[a-zA-Z])(?=.*\\d).*$"
 *           description: Password should contain at least 1 digit, 6 letters, 1 uppercase letter, and 1 lowercase letter.
 */
export default class RegisterDto implements IRegisterDto {
  email: string;
  login: string;
  password: string;

  constructor(data: IRegisterDto) {
    this.email = data.email?.trim();
    this.login = data.login?.trim();
    this.password = data.password;

    this.validate();
  }

  validate(): void {
    new Validation(this.email, 'email').isDefined();
    new Validation(this.login, 'login').isDefined();
    new Validation(this.password, 'password').isDefined();
  }
}