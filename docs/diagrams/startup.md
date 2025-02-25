# Diagrams - startup

This file represents simplified startup flow of this application.

Last update: 05.01.2025

```text
┌───────────────────────────────────────────┐    
│Start                                      │    
└┬──────────┬───────┬───────┬───────┬──────┬┘    
┌▽────────┐┌▽─────┐┌▽─────┐┌▽─────┐┌▽────┐┌▽────┐
│Bootstrap││Router││Broker││Socket││Redis││Mongo│
└─────────┘└┬─────┘└──────┘└┬─────┘└─────┘└─────┘
┌───────────▽───────┐┌──────▽───────────────┐    
│"Wait for messages"││"Wait for connections"│    
└───────────────────┘└──────────────────────┘    
```

<details>
  <summary>Raw diagram</summary>
  
  Start -> Bootstrap
  Start -> Router -> "Wait for messages"
  Start -> Broker
  Start -> Socket -> "Wait for connections"
  Start -> Redis
  Start -> Mongo

  Diagram made using Diagon 
</details>
