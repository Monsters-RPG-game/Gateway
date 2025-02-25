export enum EConnectionMainTargets {
  User = 'user',
  Chat = 'chat',
  Fight = 'fight',
  Profile = 'profile',
  Message = 'messages',
}

export enum EUserSubTargets {
  GetName = 'getName',
  Register = 'register',
  DebugGetAll = 'debugGetAll',
  RemoveAccount = 'removeUser',
}

export enum EProfileSubTargets {
  Get = 'getProfile',
}

export enum EMessagesSubTargets {
  Send = 'send',
  Get = 'get',
  Read = 'read',
  GetUnread = 'getUnread',
}

export enum EChatSubTargets {
  Send = 'sendChatMessage',
  Get = 'getChatMessage',
  Read = 'readChatMessage',
  GetUnread = 'getUnreadChatMessages',
}
