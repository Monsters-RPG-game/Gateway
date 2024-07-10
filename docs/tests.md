# Tests

TLDR;
## 1. Logic
## 2. Mocking
## 3. Fake data

## 1. Logic

We write tests to make sure that our software works. Each change in our code, no matter how small can break other elements. Writting them make sure, that everything is written just the way we need it.

Our application usses 3 types of tests. Fourth one is planned

- E2e - These tests are called "end to end". Philosophy behind them is to tests code, from "entry" to the end. For example, REST api e2e tests would send request to one of the endpoints and wait for response. Similar with websocket.

- Unit - Unit tests are made to test 1 function, class, or just part of some code. These tests are generaly created, to make sure that output from that part of the code does not break and does indeed return what we need it to return.

- Db - Database tests are testing database connection. In our applications, these tests are made to validate, if connection with selected database is working fine. Proper database tests should tests connection with selected databases. Lets say that we use mysql database in version 2. We write mocks, which would return data the same way, as version 2. Now lets say that we update to version 3, which returns data completly different. We would need to rewrite all our tests and mocks.

## 2. Mocking

Most of our tests use mocks. Mocks are drop-in replacemeents for already written code. Lets say that we got class, that connect to database. We do not want this class to connect in tests, because database might not be running in pipelines. We replace that class with fake class, which looks the same way and returns data just the same way, but does not connect to database. Mocks are usefull, because our tests can run much faster, while being easy to manipulate.

This service usses:
- Redis database
- RabbitMQ message broker
- Express as REST api
- WS for websocket connection

Each of these services is usefull, but having it working requires database or open ports or something else. Each of them is mocked in tests, so we can manipulate how data flows. 

### Redis
Currently, Redis is used to hold cached data or hold user's sessions, to make multiple instances of service cooperate properly. We use FakeRedis, to hold data in it, as drop-in replacement for Redis connection. It works the same way in terms of logic. 

You can: 
- Call it and insert fake user session, to have logged in user.

```ts
const fakeUser = fakeData.users[0] as IUserEntity;

accessToken = fakeAccessToken(fakeUser._id, 1);

await State.redis.addOidc(accessToken.key, accessToken.key, accessToken.body);
```

- Add cached user, so express middleware will not call fakeBroker, but fetch data from it

```ts
const fakeUser = fakeData.users[0] as IUserEntity;
const fakeProfile = fakeData.profiles[0] as IProfileEntity
await State.redis.addCachedUser({ account: fakeUser, profile: fakeProfile });
```

### RabbitMQ
RabbitMQ is replaced by fakeBroker. Instead of sending messages to other services, it looks for predefined callbacks, created before tests and return them. It can throw errors or return data, just like default rabbitMQ controller.

Example of fake broker, which will throw erorr

```ts
const fakeBroker = State.broker as FakeBroker;
fakeBroker.actions.push({
  shouldFail: true,
  returns: { payload: target, target: enums.EMessageTypes.Send },
});
```

Example of fake broker, which will return data

```ts
const fakeBroker = State.broker as FakeBroker;

fakeBroker.actions.push({
  shouldFail: false,
  returns: { payload: [], target: enums.EMessageTypes.Send },
});
```

After running each test, fakeRabbit will report in console, when it fired and to what target. In addition to that, you can run it in debug mode, which will also show stack of location, where it fired.

### Exoress
Express itself is not replaces. It just does not run on any ports, but is used by supertests, symulating whole experience or real application, alongside working middleware

### Websocket
Websocket connection is not also mocked. It just does not run on any ports.

You can run this code on many ways. Return data from fakeBroker, instead of cached redis, or other way around.

## 3. Fake data

In addition to having faked modules, there is fakedData. Fake data is a json file, that includes few examples of entities from other services. Most of them coresponde to faked user.  FakeUsers[0] will have FakeProfile[0], FakeSkills[0] etc connected to him. FakeUsers[1] will have FakeProfile[1] and fakeSkills[1] connected to him. This should make generating fake data easier while testing.
 