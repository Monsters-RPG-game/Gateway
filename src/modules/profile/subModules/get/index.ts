import GetProfileDto from './dto.js';
import UserDetailsDto from '../../../users/subModules/details/dto.js';
import type * as types from '../../../../types/index.js';
import type { IProfileEntity } from '../../entity.js';

export default class GetProfileController implements types.IAbstractSubController<IProfileEntity | null> {
  async execute(data: GetProfileDto, res: types.IResponse): Promise<IProfileEntity | null> {
    const { reqController, user, logger } = res.locals;

    logger.debug('Profile - get', 'Fetching user profile');

    if (data.name && user?.login === data.name) {
      logger.debug('Profile - get', 'Fetch information about sender');
      return res.locals.profile as IProfileEntity;
    }

    const users = await reqController.user.getDetails([new UserDetailsDto({ name: data?.name, id: data?.id })], {
      userId: user?.userId,
    });

    if (
      !users?.payload ||
      users.payload.length === 0 ||
      (typeof users.payload === 'object' && Object.keys(users.payload).length === 0)
    ) {
      logger.debug('Profile - get', 'No user data');
      return null;
    }

    const userTarget = users.payload[0]!;
    const profileDto = new GetProfileDto({ id: userTarget._id as string });

    return (
      await reqController.profile.get(profileDto, {
        userId: user?.userId,
      })
    ).payload;
  }
}
