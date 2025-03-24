# How to start - docs

Last update: 07.01.2025

This file will try to explain, how to start this project, setup configs and databases.

> [!IMPORTANT]
> Before setting up this app, you should have already prepared [Authorizations server](https://github.com/Virus288/Authorizations). Authentication will not work, unless this service is up and running
> ps: This link should go to forked service in Monsters organization. If it does not and you found fork in Monsters organization, please create issue for it on github

TLDR;
1. [External connections](#1-external-connections)
2. [Configs](#2-configs)
3. [Preparing data](#3-preparing-data)
4. [Networking](#4-networking)

## 1. External connections

This application connects to:
- MongoDb
- RabbitMQ
- Redis
- Authorizations server

Authorizations server is standalone OIDC server, which manages user authentication. You can more details about it in `/docs/Oidc.md` file.

MongoDB is used to store data related to authentications. This service is proxying login/register requests to authentications and users microservice.

RabbitMq is used to send messages between other microservices

Redis is used to cache user authentication tokens, alongisde additional cache like user's profile.

> [!TIP]
> In addition to add 'connections', there are microservices, related to this project. If you want to set up whole infrastructure, please refear to [Head](https://github.com/Monsters-RPG-game/Head) project. Head will explain how to set up whole infrastructure.

## 2. Configs

This application uses 3 config files:
- devConfig.json
- prodConfig.json
- testConfig.json

DevConfig will be used, if you run your application with NODE_ENV=development. This config should be used while working on this application

ProdConfig will be used, if you run your application with NODE_ENV=production. This should be used in production env

TestConfig will be used, if you run your application on dev servers. This config only differs from production, that in code it will log debug logs and should connect to dev database.

Each config includes few elements:
```json
{
  "amqpURL": "rabbitUrl",
  "redisURL": "redis://:password@adress:port",
  "mongoURL": "mongodb://user:password@adress:port",
  "authorizationAddress": "http://localhost",
  "authorizationInnerAddress": "http://localhost",
  "myAddress": "http://localhost",
  "corsOrigin": ["http://localhost"]
  "httpPort": 80,
  "socketPort": 81,
  "myDomain": ".domain.com",
  "session": {
    "secret": "superSecretPasswordPleaseDoNotLeakIt",
    "secured": true,
    "trustProxy": true
  },
  "metrics": {
    "loki": "loki address"
  }
}
```

HttpPort is port, that application will use

MyAddress is address, that will be used to host this application. Make sure to include port, if default won't be used

CorsOrigin is list of website that will use this application. If you do not care about it, set ["*"]

mongoURL is address for mongoDB

authorizationAddress is address for authorization server, which should be utilized

authorizationInnerAddress is address for authorizations server located in k8s/docker network. This is meant for production env. For any other, simply copy value from `authorizationAddress`

redisURL is address for redis, which is used to cache data like user sessions and connection params

myDomain is domain, that this application will work on. It should be prefixed with dot. This config is used to set cookies, for production for whole domain with subdomains. Either add some random domain in /etc/hosts, or comment all ( atm 2 ) occurrences.

metrics is a config for open telemetry. Currently those json files include loki address, while .env file should include open telemetry address

session is config for express-session.
- Secret is secret, which should be used to generate cookies for session
- Secured is boolean, which is true, sets secured cookies. This is used, because localhost will not set secured cookies in modern browsers
- TrustProxy Is config, which will trust `X-Forwarded-For` cookie. Disabled it, unless your api is behind a load balancer like nginx

#### Dot env

In addition to this, there is also a need to have dot env file. This file should be loaded manually before starting this app, because data from .env is loaded to initialize metrics. This file should include:
```env
NODE_METRICS_ADDRESS=http://localhost:4318/v1
```

This address should not include full paths, but only prefix. Postfix for /metrics and /traces will be added manually. If you wish to use another postfixes, you need to manually rewrite package responsible for metrics. There is no other way to do it manually.

## 3. Preparing data

In order for this app to fully work, you will need to set up databases. Most likely, you already read README.MD and found out, that there is `migrate:dev` command. This command will set up basic collections in database. Those migrations include the most basic configs so in order to make them work, we need to modify them outselfs. If you already run this command, you will need to modify data in database.

> [!TIP]
> Those collections are explained in details in `Oidc.md` in part #2. Below text will try to explain, how to set them up in migrations, or manually in collections

> [!IMPORTANT]
> If you did not migrate data yet, read #3.1, otherwise, read #3.2

### 3.1 Modifying migrations to create data

You can find existing data migrations in `/src/migrations`. We are interested in file `actions/202441116000000_init_sample_client`. You should see 2 functions. We are interested in `up` function. Code should look something like this.

```ts
const client = new Client({
  clientId: 'register',
  redirectUrl: 'http://127.0.0.1/register',
  failUrl: 'http://127.0.0.1/failFallback',
});
const oidcClient = new OidcClient({
  clientId: 'oidcClient',
  clientSecret: 'superSecretPassword',
  clientGrant: 'authorization_code,refresh_token',
  redirectUrl: 'http://127.0.0.1/login',
  redirectLogoutUrl: 'http://127.0.0.1/logout',
});
```

Modify it based on configs, explained in `Oidc.md` in part #2. This file includes everything you need to know. 

### 3.2 Modifying data manually in collections 

In  order to modify existing data in mongooDB collection, you can either manually access it via `mongoosh`, or by using gui client, like mongo compass. Database name is `Gateway`

## 4. Networking

This app is constructed to work behind a reverse proxy. If you won't set it up, authorization might not work, but everything else should. This is done, to keep this app as close to production as possible. If you are working on linux, you can just set up nginx on your machine and map this app. You can find great example of how to map this, in `/docs/Oidc.md`

