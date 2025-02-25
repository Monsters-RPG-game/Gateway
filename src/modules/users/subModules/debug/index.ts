import type GetAllUsersDto from './dto.js';
import type * as types from '../../../../types/index.js';
import type { IUserEntity } from '../../entity.js';

export default class DebugGetAllUsersController implements types.IAbstractSubController<IUserEntity[]> {
  async execute(data: GetAllUsersDto, res: types.IResponse): Promise<IUserEntity[]> {
    const { reqController, user } = res.locals;

    return (
      await reqController.user.debugGetAll(data, {
        userId: user?.userId,
      })
    ).payload;
  }
}
