export enum EUserMainTargets {
  Log = 'log',
  User = 'user',
  Chat = 'chat',
  Party = 'party',
  Stats = 'stats',
  Fight = 'fight',
  Profile = 'profile',
  Message = 'message',
  BugReport = 'bugReport',
  Inventory = 'inventory',
  CharacterState = 'characterState',
}

export enum EUserTargets {
  Register = 'register',
  Login = 'login',
  GetName = 'getName',
  Remove = 'removeUser',
  DebugGetAll = 'debugGetAll',
}

export enum EProfileTargets {
  Create = 'createProfile',
  Get = 'getProfile',
}

export enum EItemsTargets {
  Get = 'getItem',
  Use = 'useItem',
  Drop = 'dropItem',
}

export enum EMessagesTargets {
  Send = 'send',
  Get = 'get',
  Read = 'read',
  GetUnread = 'getUnread',
}

export enum EChatTargets {
  Send = 'sendChatMessage',
  Get = 'getChatMessage',
  Read = 'readChatMessage',
  GetUnread = 'getUnreadChatMessages',
}

export enum EFightsTargets {
  Attack = 'attack',
  CreateFight = 'createFight',
  Leave = 'leave',
  GetLogs = 'getLogs',
  GetFights = 'getFights',
}

export enum EPartyTargets {
  Get = 'getParty',
}

export enum ECharacterStateTargets {
  ChangeState = 'changeState',
}

export enum EBugReportTargets {
  AddBugReport = 'addBugReport',
  GetBugReport = 'getBugReport',
}

export enum EStatsTargets {
  GetStats = 'getStats',
}
