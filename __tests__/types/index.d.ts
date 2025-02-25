export { IProfileEntity } from '../../src/modules/profile/entity';
export { IAddProfileDto } from '../../src/modules/profile/add/types';
export { IGetProfileDto } from '../../src/modules/profile/get/types';
export { IRegisterDto } from '../../src/modules/user/register/types';
export { IUserDetailsDto } from '../../src/modules/user/details/types';

export * from './broker';

export interface IFakeOidcKey {
  key: string;
  body: Record<string, unknown>;
}
