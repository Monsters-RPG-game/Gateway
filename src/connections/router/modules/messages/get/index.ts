import GetMessagesDto from '../../../../../modules/messages/subModules/get/dto.js';
import AbstractRouter from '../../../../../tools/abstractions/router.js';
import type { IGetMessagesReq } from './types.js';
import type { EControllers, EMessageActions } from '../../../../../enums/controllers.js';
import type { IFullMessageEntity } from '../../../../../modules/messages/entity.js';
import type { IPreparedMessagesBody } from '../../../../../modules/messages/subModules/get/types.js';
import type { IResponse } from '../../../../../types/requests.js';

export default class MessagesRouter extends AbstractRouter<EControllers.Messages, EMessageActions.Get> {
  async execute(
    req: IGetMessagesReq,
    res: IResponse,
  ): Promise<Record<string, IPreparedMessagesBody> | IFullMessageEntity[]> {
    const dto = new GetMessagesDto(req.query);

    return this.controller.execute(dto, res);
  }
}
