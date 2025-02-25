export interface IConfigInterface {
  amqpURL: string;
  authorizationAddress: string;
  authorizationInnerAddress: string;
  corsOrigin: string[];
  httpPort: number;
  mongoURL: string;
  myAddress: string;
  myDomain: string;
  redisURL: string;
  socketPort: number;
  session: {
    secret: string;
    secured: boolean;
    trustProxy: boolean;
  };
}
