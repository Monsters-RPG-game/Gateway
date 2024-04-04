// eslint-disable-next-line max-classes-per-file
export class FullError extends Error {
  code = '000';
  status = 500;
}

export class InternalError extends FullError {
  constructor() {
    super('InternalError');
    this.message = 'Internal error. Try again later';
    this.name = 'InternalError';
    this.status = 500;
  }
}

export class IncorrectDataType extends FullError {
  constructor() {
    super('IncorrectDataType');
    this.message = 'Received request is not json type';
    this.name = 'IncorrectDataType';
    this.status = 400;
  }
}

/**
 * @openapi
 * components:
 *   schemas:
 *     MissingArgError:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Error name describing the error cause.
 *           example: 'MissingArgError'
 *         code:
 *           type: string
 *           description: Unique code associated with the error.
 *           example: '002'
 *         message:
 *           type: string
 *           description: Error message describing the error cause.
 *           pattern: "^Missing param: .+$"
 */
export class MissingArgError extends FullError {
  constructor(param: string) {
    super('MissingArgError');
    this.message = `Missing param: ${param}`;
    this.name = 'MissingArgError';
    this.status = 400;
  }
}

/**
 * @openapi
 * components:
 *   schemas:
 *     IncorrectArgError:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Error name describing the error cause.
 *           example: 'IncorrectArgError'
 *         code:
 *           type: string
 *           description: Unique code associated with the error.
 *           example: '003'
 *         message:
 *           example: 'Data not provided'
 *           description: Error message describing the incorrect parameter.
 *           type: string
 */
export class IncorrectArgError extends FullError {
  constructor(err: string) {
    super('IncorrectArgError');
    this.message = err;
    this.name = 'IncorrectArgError';
    this.status = 400;
  }
}

/**
 * @openapi
 * components:
 *   schemas:
 *     UnauthorizedError:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Error name describing the error cause.
 *           example: 'UnauthorizedError'
 *         code:
 *           type: string
 *           description: Unique code associated with the error.
 *           example: '005'
 *         message:
 *           description: Error message describing the error cause.
 *           type: string
 *           example: 'User not logged in'
 */
export class UnauthorizedError extends FullError {
  constructor() {
    super('UnauthorizedError');
    this.message = 'User not logged in';
    this.name = 'UnauthorizedError';
    this.status = 401;
  }
}

export class MissingProcessPlatformError extends FullError {
  constructor() {
    super('MissingProcessPlatformError');
    this.message = 'process.platform is missing';
    this.name = 'MissingProcessPlatformError';
    this.status = 500;
  }
}

/**
 * @openapi
 * components:
 *   schemas:
 *     IncorrectBodyTypeError:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Error name describing the error cause.
 *           example: 'IncorrectBodyTypeError'
 *         code:
 *           type: string
 *           description: Unique code associated with the error.
 *           example: '007'
 *         message:
 *           type: string
 *           description: Error message describing the error cause.
 *           pattern: "Incorrect body type. Data should be of type json"
 */
export class IncorrectBodyTypeError extends FullError {
  constructor() {
    super('IncorrectBodyTypeError');
    this.message = 'Incorrect body type. Data should be of type json';
    this.name = 'IncorrectBodyTypeError';
    this.status = 400;
  }
}

/**
 * @openapi
 * components:
 *   schemas:
 *     NoDataProvidedError:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Error name describing the error cause.
 *           example: 'NoDataProvidedError'
 *         code:
 *           type: string
 *           description: Unique code associated with the error.
 *           example: '008'
 *         message:
 *           example: 'No data provided'
 *           description: Error message describing the incorrect parameter.
 *           type: string
 */
export class NoDataProvidedError extends FullError {
  constructor() {
    super('NoDataProvidedError');
    this.message = 'No data provided';
    this.name = 'NoDataProvidedError';
    this.status = 400;
  }
}

export class IncorrectTargetError extends FullError {
  constructor() {
    super('IncorrectTargetError');
    this.message = 'Incorrect target';
    this.name = 'IncorrectTargetError';
    this.status = 400;
  }
}

/**
 * @openapi
 * components:
 *   schemas:
 *     MissingArgError:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Error name describing the error cause.
 *           example: 'MissingArgError'
 *         code:
 *           type: string
 *           description: Unique code associated with the error.
 *           example: '002'
 *         message:
 *           type: string
 *           description: Error message describing the error cause.
 *           pattern: "^Missing param: .+$"
 */
export class IncorrectTokenError extends FullError {
  constructor() {
    super('IncorrectTokenError');
    this.message = 'Provided key is incorrect';
    this.name = 'IncorrectTokenError';
    this.status = 400;
  }
}

/**
 * @openapi
 * components:
 *   schemas:
 *     IncorrectArgLengthError:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Error name describing the error cause.
 *           example: 'IncorrectArgLengthError'
 *         code:
 *           type: string
 *           description: Unique code associated with the error.
 *           example: '002'
 *         message:
 *           type: string
 *           description: Error message describing the error cause.
 *           pattern: "^Element has incorrect length: .+$"
 */
export class IncorrectArgLengthError extends FullError {
  constructor(target: string, min: number | undefined, max: number) {
    super('IncorrectArgLengthError');
    this.message =
      min === undefined
        ? `${target} should be less than ${max} characters`
        : min !== max
          ? `${target} should be more than ${min} and less than ${max} characters`
          : `${target} should be ${min} characters`;
    this.name = 'IncorrectArgLengthError';
    this.status = 400;
  }
}

/**
 * @openapi
 * components:
 *   schemas:
 *     IncorrectArgTypeError:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Error name describing the error cause.
 *           example: 'IncorrectArgTypeError'
 *         code:
 *           type: string
 *           description: Unique code associated with the error.
 *           example: '002'
 *         message:
 *           type: string
 *           description: Error message describing the error cause.
 *           pattern: "^Element has incorrect length: .+$"
 */
export class IncorrectArgTypeError extends FullError {
  constructor(err: string) {
    super('IncorrectArgTypeError');
    this.message = err;
    this.name = 'IncorrectArgTypeError';
    this.status = 400;
  }
}

export class UsernameAlreadyInUseError extends FullError {
  constructor() {
    super('UsernameAlreadyInUseError');
    this.message = 'Selected username is already in use';
    this.name = 'UsernameAlreadyInUseError';
    this.status = 400;
  }
}

export class ProviderNotInitialized extends FullError {
  constructor() {
    super('ProviderNotInitialized');
    this.message = 'Oidc provider not initialized';
    this.name = 'ProviderNotInitialized';
    this.status = 400;
  }
}

export class NoUserWithProvidedName extends FullError {
  constructor(names?: string[]) {
    super('NoUserWithProvidedName');
    this.message = names
      ? names.length === 1
        ? `User ${names.join(', ')} does not exist`
        : `Users ${names.join(', ')} does not exist`
      : 'No user with provided name';
    this.name = 'NoUserWithProvidedName';
    this.status = 400;
  }
}

export class ProfileNotInitialized extends FullError {
  constructor() {
    super('ProfileNotInitialized');
    this.message = 'User profile is not initialized';
    this.name = 'ProfileNotInitialized';
    this.status = 400;
  }
}

export class ElementTooShortError extends FullError {
  constructor(target: string, min: number) {
    super('ElementTooShortError');
    this.message = `Element ${target} is too short. Minimum length is ${min}`;
    this.name = 'ElementTooShortError';
    this.code = '021';
    this.status = 400;
  }
}

export class ElementTooLongError extends FullError {
  constructor(target: string, min: number) {
    super('ElementTooShortLongError');
    this.message = `Element ${target} is too long. Maximum length is ${min}`;
    this.name = 'ElementTooShortLongError';
    this.code = '022';
    this.status = 400;
  }
}

export class ActionNotAllowed extends FullError {
  constructor() {
    super('ActionNotAllowed');
    this.message = 'Action not allowed';
    this.name = 'ActionNotAllowed';
    this.code = '014';
    this.status = 400;
  }
}

export class NoPermissionToRemoveAccount extends FullError {
  constructor() {
    super('NoPermissionToRemoveAccount');
    this.message = 'No permission to remove account';
    this.name = 'NoPermissionToRemoveAccount';
    this.code = '015';
    this.status = 400;
  }
}

export class UserNotInFight extends FullError {
  constructor() {
    super('UserNotInFight');
    this.message = 'User is not fighting';
    this.name = 'UserNotInFight';
    this.code = '024';
    this.status = 400;
  }
}
