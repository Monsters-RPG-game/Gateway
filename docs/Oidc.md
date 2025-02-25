# Oidc - docs

This application is meant to connect to [Oidc server](https://github.com/Virus288/Authorizations) as authrorizations server. This doc will try to explain, how to set up working clients and proper data to fully work with authorizations system.

> [!TIP]
> Server linked here goes to my personal projects. This link might be outdated so please make sure that there is no fork on `monsters` project. If there is, please raise a ticked related to it.

TLDR:
1. [Deeper dive](#1-deeper-dive)
1. [Clients](#1-clients)
1. [Diagrams](#1-diagrams)

## 1. Deeper dive

Instead of having specific version of authorizations, that this project would use, it was easier for me ( dev ) to utilize external server for authroziations. In addition to that, It was easier to divide traffic between services.

Simplified data flow of login request:

```text
┌───────┐   ┌──────────────┐
│Gateway│   │Authorizations│
└───┬───┘   └──────┬───────┘
    │              │        
    │  StartLogin  │        
    │─────────────>│        
    │              │        
    │ LoginSuccess │        
    │<─────────────│        
    │              │        
    │GetUserTokens │        
    │─────────────>│        
    │              │        
    │SendUserTokens│        
    │<─────────────│        
┌───┴───┐   ┌──────┴───────┐
│Gateway│   │Authorizations│
└───────┘   └──────────────┘
```

<details>
  <summary>Raw diagram</summary>
  
  Gateway -> Authorizations: StartLogin
  Authorizations -> Gateway: LoginSuccess
  Gateway -> Authorizations: GetUserTokens
  Authorizations -> Gateway: SendUserTokens

  Diagram made using Diagon 
</details>

So in summary, gateway creates information in redis, that user wants to login / register and is transferring user to authroziations service with pregenerated token and clients. After successful / unsuccessful action, user is transferred to gateway, which then transfers him to path, that was specified in client's config.

## 2. Clients

By default, oauth include clients, that define what should happen, after user fails / succeed. This doc will help you create clients, for this application, which will work with clients in Authorizations service. Because of how logic is created in this app, you will need at least 2 clients, defining what should happen on register / login. Lets start by defining first config, based on this example:

Below config is client created in Authorizations service.

```json
{
  "client_id": "oidcClient",
  "client_secret": "superSecretPasswordPleaseDoNotLeakIt",
  "grant_types": [
    "authorization_code",
    "refresh_token"
  ],
  "scope": "openid",
  "redirect_urls": [
    "https://api.server.com/user/login"
  ],
  "post_logout_redirect_uris": [
    "https://api.server.com/user/logout/finish"
  ]
}
```

> [!TIP]
> Above config should be explaied more in details in Authorizations server. 

As you can see, based on above example, we have a client called `oidcClient`, which has grant_types defined in a way, that it will allow gateway to get user's generated access token and refreshToken. User will be redirected to `https://api.server.com/user/login` after successful login and to `https://api.server.com/user/logout/finish` if that client was used to log user out. Another client will be used to register users.

There are 2 types of clients, that this app will use:
- `OidcClients` - client information, that connects it to Authorizations server
- `Clients` - clients, that are using in this application, to move users to frontends

Example of `Client`:

```json
{
  "clientId": "register",
  "redirectUrl": "https://front.server.com/register",
  "failUrl": "https://front.server.com/failFallback",
}
```

In this example, you can see client with id `register`. That client will be used to register accounts. `RedirectUrl` will be used to move user to fronted, after successful registration. `FailUrl` will be used to move user to frontend after he fails to register or declines to register on Authorizations server.

Example of `OidcClient`

```json
{
  "clientId": "login",
  "clientSecret": "anotherSuperSecretPassword",
  "redirectLogoutUrl": "https://api.server.com/logout",
  "clientGrant": "clientGrant",
  "redirectUrl": "https://api.server.com/login"
}
```

Based on this information, let's create example, which will work in practice. Lets assume, that frontend is running on `front.server.com`, authroziations server on `auth.server.com` and api server ( this app ) on `api.server.com`

- Authorizations - client

```json
{
  "client_id": "oidcClient",
  "client_secret": "superSecretPasswordPleaseDoNotLeakIt",
  "grant_types": [
    "authorization_code",
    "refresh_token"
  ],
  "scope": "openid",
  "post_logout_redirect_uris": [
    "https://api.server.com/user/logout/finish"
  ],
  "redirect_uris": [
    "https://api.server.com/user/login"
  ]
}
```

- Gateway - OidcClient

```json
{
  "clientId": "oidcClient",
  "clientSecret": "superSecretPasswordPleaseDoNotLeakIt",
  "redirectLogoutUrl": "https://api.server.com/user/logout/finish",
  "clientGrant": "authorization_code",
  "redirectUrl": "https://api.server.com/login"
}
```

- Gateway - client

```json
{
  "clientId": "login",
  "failUrl": "https://front.server.com/login",
  "redirectUrl": "https://front.server.com/login"
}
```

With this config we created 1 client for frontend `Gateway - client` and 1 client to "talk" between auth server and gateway. This client will be used to log in users.

In order to log in, frontend sends GET req, with client provided in search params. Example: `https://api.server.com/user/login?client=login`. Gateway then validates if this client is valid and  based on it, sends user to `https://auth.server.com/auth?client_id=oidcClient&redirect_url=https://api.server.com/user/login&nonce=nonce&response_type=code&scope=openid&code_challenge_method=S256&code_challenge=challenge`. As you can see, all oidc params are included in this url, based on `Gateway - oidcClient`.

Oidc server will then validate client and all params in this req. After user manages to log in, user will be redirected to `Authorizations - client - redirect_url`, which was also included in login url. In our example: `https://api.server.com/user/login`. Full url: `https://api.server.com/user/login?code=code&iss=https://Fauth.server.com`. Code in here will be used to create id token, refresh token and access token. Gateway, after receiving those tokens will save them in database and create tokens, between frontend and gateway.

At the end, after everything went correctly, user should be redirected to `Gateway - client - redirectUrl`. in our example: `https://front.server.com/login/?feedback=success`. Feedback is a flag for frontend, that everything went correctly, or incorrectly.

The same flow can be applied to registering users. Instead of creating additional client for Authorizations server, you can modify existing client to include registering redirect_urls like this:
```json
{
  "client_id": "oidcClient",
  "client_secret": "superSecretPasswordPleaseDoNotLeakIt",
  "grant_types": [
    "authorization_code",
    "refresh_token"
  ],
  "scope": "openid",
  "post_logout_redirect_uris": [
    "https://api.server.com/user/logout/finish"
  ],
  "redirect_uris": [
    "https://api.server.com/user/login",
    "https://api.server.com/user/register/finish"
    ]
}
```

But keep in mind, that client will be redirected to frontend's url, based on client that was used by frontend. You might want to create another client for this `Gateway - client`.


## 3. Diagrams

> [!TIP]
> These diagrams are simplified, to only show generalized flow of data. Deeper dive should be made in authroziations service. Some of diagrams will include `Users` service, due to its strong connection to user accounts.

- Login - success

```text
┌───────┐   ┌──────────────┐
│Gateway│   │Authorizations│
└───┬───┘   └──────┬───────┘
    │              │        
    │  StartLogin  │        
    │─────────────>│        
    │              │        
    │   Success    │        
    │<─────────────│        
    │              │        
    │GetUserTokens │        
    │─────────────>│        
    │              │        
    │SendUserTokens│        
    │<─────────────│        
┌───┴───┐   ┌──────┴───────┐
│Gateway│   │Authorizations│
└───────┘   └──────────────┘
```

<details>
  <summary>Raw diagram</summary>
  
  Gateway -> Authorizations: StartLogin
  Authorizations -> Gateway: Success
  Gateway -> Authorizations: GetUserTokens
  Authorizations -> Gateway: SendUserTokens

  Diagram made using Diagon 
</details>

- Register

```text
┌───────┐               ┌──────────────┐┌─────┐
│Gateway│               │Authorizations││Users│
└───┬───┘               └──────┬───────┘└──┬──┘
    │                          │           │   
    │      StartRegister       │           │   
    │─────────────────────────>│           │   
    │                          │           │   
    │         Success          │           │   
    │<─────────────────────────│           │   
    │                          │           │   
    │ValidateUsingObtainedToken│           │   
    │─────────────────────────>│           │   
    │                          │           │   
    │ValidateThatUserRegistered│           │   
    │<─────────────────────────│           │   
    │                          │           │   
    │            AddUserAccount│           │   
    │─────────────────────────────────────>│   
    │                          │           │   
    │               Confirm    │           │   
    │<─────────────────────────────────────│   
┌───┴───┐               ┌──────┴───────┐┌──┴──┐
│Gateway│               │Authorizations││Users│
└───────┘               └──────────────┘└─────┘
```

<details>
  <summary>Raw diagram</summary>
  
  Gateway -> Authorizations: StartRegister
  Authorizations -> Gateway: Success
  Gateway -> Authorizations: ValidateUsingObtainedToken
  Authorizations -> Gateway: ValidateThatUserRegistered
  Gateway -> Users: AddUserAccount
  Users -> Gateway: Confirm
  
  Diagram made using Diagon 
</details>

- Remove account

```text
┌───────┐  ┌──────────────┐┌─────┐
│Gateway│  │Authorizations││Users│
└───┬───┘  └──────┬───────┘└──┬──┘
    │             │           │   
    │RemoveAccount│           │   
    │────────────>│           │   
    │             │           │   
    │   Success   │           │   
    │<────────────│           │   
    │             │           │   
    │    RemoveUserAccount    │   
    │────────────────────────>│   
    │             │           │   
    │         Confirm         │   
    │<────────────────────────│   
┌───┴───┐  ┌──────┴───────┐┌──┴──┐
│Gateway│  │Authorizations││Users│
└───────┘  └──────────────┘└─────┘
```

<details>
  <summary>Raw diagram</summary>
  
  Gateway -> Authorizations: RemoveAccount
  Authorizations -> Gateway: Success
  Gateway -> Users: RemoveUserAccount
  Users -> Gateway: Confirm
  
  Diagram made using Diagon 
</details>