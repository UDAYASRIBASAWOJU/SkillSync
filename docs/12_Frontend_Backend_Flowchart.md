# 12 Frontend and Backend Flow Chart

This file captures the end-to-end flow between the React frontend and SkillSync backend microservices.

## 1) System Flow (Frontend to Backend)

```mermaid
flowchart LR
    U[User Browser]
    FE[React Frontend\nVite + TypeScript\nRedux + React Query]
    AX[Axios Client\nJWT + Refresh Interceptors]
    GW[API Gateway]
    EU[Eureka Service Discovery]
    CS[Config Server]

    AUTH[Auth Service]
    USER[User Service]
    SKILL[Skill Service]
    SESSION[Session Service]
    PAYMENT[Payment Service]
    NOTIF[Notification Service]

    DBA[(Auth DB)]
    DBU[(User DB)]
    DBSK[(Skill DB)]
    DBS[(Session DB)]
    DBP[(Payment DB)]
    DBN[(Notification DB)]

    REDIS[(Redis Cache)]
    RABBIT[(RabbitMQ)]

    U --> FE
    FE --> AX
    AX --> GW

    GW --> EU
    GW --> CS

    GW --> AUTH
    GW --> USER
    GW --> SKILL
    GW --> SESSION
    GW --> PAYMENT
    GW --> NOTIF

    AUTH --> DBA
    USER --> DBU
    SKILL --> DBSK
    SESSION --> DBS
    PAYMENT --> DBP
    NOTIF --> DBN

    AUTH <--> REDIS
    USER <--> REDIS
    SKILL <--> REDIS
    SESSION <--> REDIS
    NOTIF <--> REDIS

    SESSION --> RABBIT
    PAYMENT --> RABBIT
    RABBIT --> NOTIF
```

## 2) Request Lifecycle (REST API)

```mermaid
sequenceDiagram
    autonumber
    participant B as Browser UI
    participant F as React Component
    participant Q as React Query
    participant A as Axios Interceptor
    participant G as API Gateway
    participant S as Target Microservice
    participant D as Service Database

    B->>F: User action (click/submit)
    F->>Q: query/mutation trigger
    Q->>A: HTTP request
    A->>A: Attach Bearer token
    A->>G: /api/... request
    G->>S: Route by path + validate auth
    S->>D: Read/Write data
    D-->>S: Result
    S-->>G: JSON response
    G-->>A: Response
    A-->>Q: Parsed data
    Q-->>F: Cached state update
    F-->>B: UI re-render

    alt Access token expired
        G-->>A: 401
        A->>G: POST /api/auth/refresh
        G-->>A: New token/session
        A->>G: Retry original request
        G-->>A: Success response
    end
```

## 3) Real-Time Notification Flow (WebSocket + STOMP)

```mermaid
sequenceDiagram
    autonumber
    participant N as Navbar (Frontend)
    participant NS as notificationService.ts
    participant G as API Gateway
    participant W as /ws/notifications
    participant NO as Notification Service
    participant DB as Notification DB

    N->>NS: subscribeToNotifications(listener)
    NS->>G: STOMP connect (ws/wss)
    G->>W: Upgrade + route socket
    NS->>W: Subscribe /user/queue/notifications

    NO->>DB: Save notification
    NO-->>W: Push notification payload
    W-->>NS: STOMP message
    NS-->>N: listener(payload)

    N->>N: invalidate notifications queries
    N->>G: GET /api/notifications/unread/count
    G->>NO: Forward request
    NO-->>G: unread count
    G-->>N: updated count
```

## 4) Group Messaging Flow (Current Frontend Behavior)

```mermaid
flowchart TD
    A[GroupDetailPage Open] --> B{User joined or admin?}
    B -- No --> C[Show join prompt]
    B -- Yes --> D[Enable message list query]
    D --> E[Poll every 4 seconds]
    E --> F[GET /api/groups/{id}/messages]
    F --> G[Render discussion list]
    G --> E

    H[Post message] --> I[POST /api/groups/{id}/message]
    I --> J[Invalidate discussions query]
    J --> F
```

## Notes

- Notifications are real-time from WebSocket events, then REST data is refreshed.
- Group discussion in frontend currently uses polling (4s), not a WebSocket stream.
- API Gateway is the single entry point for frontend requests.
- Services use database-per-service design and may communicate via events (RabbitMQ).
