import { EMessageTypes } from '../../src/enums';

export interface IBrokerAction {
  shouldFail: boolean;
  returns: {
    target: EMessageTypes.Credentials | EMessageTypes.Send;
    payload: Record<string, unknown> | Record<string, unknown>[] | null;
  };
}
