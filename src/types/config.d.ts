export interface IConfigInterface {
  authorizationAddress: string;
  authorizationInnerAddress: string;
  corsOrigin: string[];
  httpPort: number;
  amqp: {
    url: string;
  };
  mongo: {
    url: string;
    db: string;
    testDb: string;
  };
  myAddress: string;
  myDomain: string;
  redisURL: string;
  socketPort: number;
  session: {
    secret: string;
    secured: boolean;
    trustProxy: boolean;
  };
  metrics: {
    loki: string;
  };
  repository: string;
  tokens: {
    domain: boolean;
  };
}
