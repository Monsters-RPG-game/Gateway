import type * as enums from '../../enums/index.js';
import type * as types from '../../types/index.js';

export default abstract class ReqController {
  private readonly _sendReq: <T extends types.IRabbitSubTargets>(
    service: enums.EServices,
    mainTarget: types.IRabbitTargets,
    subTarget: T,
    userData: types.IUserBrokerInfo,
    data?: types.IRabbitConnectionData[T],
  ) => Promise<types.IBaseBrokerResponse>;
  private readonly _service: enums.EServices;

  constructor(
    service: enums.EServices,
    sendReq: <T extends types.IRabbitSubTargets>(
      service: enums.EServices,
      mainTarget: types.IRabbitTargets,
      subTarget: T,
      userData: types.IUserBrokerInfo,
      data?: types.IRabbitConnectionData[T],
    ) => Promise<types.IBaseBrokerResponse>,
  ) {
    this._sendReq = sendReq;
    this._service = service;
  }

  protected get sendReq(): <T extends types.IRabbitSubTargets>(
    service: enums.EServices,
    mainTarget: types.IRabbitTargets,
    subTarget: T,
    userData: types.IUserBrokerInfo,
    data?: types.IRabbitConnectionData[T],
  ) => Promise<types.IBaseBrokerResponse> {
    return this._sendReq;
  }

  protected get service(): enums.EServices {
    return this._service;
  }
}
