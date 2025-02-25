export enum EControllers {
  Users = 'users',
  Profile = 'profile',
  Health = 'health',
  Messages = 'messages',
}

export enum EUserActions {
  Debug = 'debugUser',
  Details = 'detailsUsers',
  FinishLogout = 'finishLogout',
  FinishRegister = 'finishRegister',
  Login = 'login',
  RefreshToken = 'refreshToken',
  RemoveAccount = 'removeAccount',
  StartLogout = 'startLogout',
  StartRegister = 'startRegister',
  ValidateToken = 'validateToken',
}

export enum EProfileActions {
  Get = 'getProfile',
}

export enum EMessageActions {
  Get = 'getMessage',
  GetUnread = 'getUnreadMessage',
  Read = 'readMessage',
  Send = 'sendMessage',
}

export enum EHealthActions {
  Get = 'getHealth',
}
