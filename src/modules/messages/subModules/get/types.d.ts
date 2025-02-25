export interface IGetMessagesDto {
  page: number;
  target: string | undefined;
}

export interface IPreparedMessagesBody {
  sender: string;
  receiver: string;
  messages: number;
}
