export interface IGetUnreadMessagesDto {
  page: number;
}

export interface IUnreadMessage {
  lastMessage: number;
  unread: number;
  chatId: string;
  participants: string[];
}
