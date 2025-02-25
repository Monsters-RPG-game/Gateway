# Diagrams - data flow

This file represents simplified flow of data, from user sending a message, to user receiving feedback. This diagram does not include logic inside microservices.

Last update: 05.01.2025

- Diagram for requests related to microservices

```text
 ┌──────────────────┐                                               
 │User sends request│                                               
 └─────────┬────────┘                                               
  ┌────────▽───────┐                                                
  │Express received│                                                
  │message         │                                                
  └────────┬───────┘                                                
┌──────────▽──────────┐                                             
│Express moves message│                                             
│to controller        │                                             
└──────────┬──────────┘                                             
  ┌────────▽────────┐                                               
  │Controller       │                                               
  │validates message│                                               
  └────────┬────────┘                                               
    _______▽________        ┌───────────────┐                       
   ╱                ╲       │Send message to│                       
  ╱ Is message valid ╲______│microservice   │                       
  ╲                  ╱yes   └───────┬───────┘                       
   ╲________________╱      ┌────────▽────────┐                      
           │no             │Wait for feedback│                      
 ┌─────────▽────────┐      └────────┬────────┘                      
 │Send back -       │          _____▽_____      ┌──────────────────┐
 │Request is invalid│         ╱           ╲     │Send back -       │
 └──────────────────┘        ╱ Did message ╲____│Request is invalid│
                             ╲ throw error ╱yes └──────────────────┘
                              ╲___________╱                         
                                    │no                             
                         ┌──────────▽──────────┐                    
                         │Send callback to user│                    
                         └─────────────────────┘                    
```

<details>
  <summary>Raw diagram</summary>

  "User sends request"
  "Express received message"
  "Express moves message to controller"
  "Controller validates message"

  if ("Is message valid") { 
      "Send message to microservice"
      "Wait for feedback"
      if ("Did message throw error") {
          return "Send back - Request is invalid"
      } else {
          return "Send callback to user"
      }
  } else {                                             
    return "Send back - Request is invalid"
  }

  Diagram made using Diagon 
</details>

- Diagram for requests related to authentication - login logic

```text
 ┌──────────────────┐                                                      
 │User sends request│                                                      
 └─────────┬────────┘                                                      
  ┌────────▽───────┐                                                       
  │Express received│                                                       
  │message         │                                                       
  └────────┬───────┘                                                       
┌──────────▽──────────┐                                                    
│Express moves message│                                                    
│to controller        │                                                    
└──────────┬──────────┘                                                    
  ┌────────▽────────┐                                                      
  │Controller       │                                                      
  │validates message│                                                      
  └────────┬────────┘                                                      
    _______▽________      ┌──────────────────────┐                         
   ╱                ╲     │Move user to          │                         
  ╱ Is message valid ╲____│authorizations service│                         
  ╲                  ╱yes └───────────┬──────────┘                         
   ╲________________╱    ┌────────────▽────────────┐                       
           │no           │Wait for user to be moved│                       
 ┌─────────▽────────┐    │back to this server      │                       
 │Send back -       │    └────────────┬────────────┘                       
 │Request is invalid│    ┌────────────▽────────────┐                       
 └──────────────────┘    │User gets moved. Validate│                       
                         │url search params        │                       
                         └────────────┬────────────┘                       
                                 _____▽______         ┌───────────────┐    
                                ╱            ╲        │Get tokens from│    
                               ╱ Is code in   ╲_______│authorizations │    
                               ╲ params valid ╱yes    └───────┬───────┘    
                                ╲____________╱          ┌─────▽─────┐      
                                      │no               │Save tokens│      
                           ┌──────────▽──────────┐      │in database│      
                           │Move user to frontend│      └─────┬─────┘      
                           │- invalid request    │┌───────────▽───────────┐
                           └─────────────────────┘│Generate access and    │
                                                  │refresh tokens for user│
                                                  └───────────┬───────────┘
                                                   ┌──────────▽─────────┐  
                                                   │Move user to        │  
                                                   │frontend - logged in│  
                                                   └────────────────────┘  
```

<details>
  <summary>Raw diagram</summary>

  "User sends request"
  "Express received message"
  "Express moves message to controller"
  "Controller validates message"

  if ("Is message valid") { 
      "Move user to authorizations service"
      "Wait for user to be moved back to this server"
      "User gets moved. Validate url search params"
      if ("Is code in params valid") {
          "Get tokens from authorizations"
          "Save tokens in database"
          "Generate access and refresh tokens for user"
          return "Move user to frontend - logged in"
      } else {
          return "Move user to frontend - invalid request"
      }
  } else {                                             
    return "Send back - Request is invalid"
  }

  Diagram made using Diagon 
</details>
