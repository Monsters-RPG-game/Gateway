# Mocks - docs

When you write code, good way of creating it is to chunk it. 1 function used as controller, other as model and other as view. There are other ways of writing code, but for in general, code should be written in SOLID way. While working with SOLID, in most cases you are able to push functions, which use external modules to their own modules. This way, each module can be easily mocked.

In simpler way, mocking if creating faked functions, based on original, which work the same way and do the same stuff, but for example locally, instead of on database.

Currently, this project includes mocks for mongoDB, rabbitMQ and Redis. Everything else is left as is in tests. In TestMode, MongoDB will be faked alongisde Redis. Rabbit will be left as is, to allow communication with other services.
