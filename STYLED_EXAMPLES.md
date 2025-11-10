# Visually Rich Mermaid Examples

These examples demonstrate advanced styling capabilities that Mermaid.js supports.

## 1. Styled Flowchart - Project Workflow

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'primaryColor':'#ff6b6b','primaryTextColor':'#fff','primaryBorderColor':'#c92a2a','lineColor':'#495057','secondaryColor':'#4ecdc4','tertiaryColor':'#ffe66d','fontSize':'16px'}}}%%
graph TB
    Start([🚀 Start Project]) --> Planning[📋 Planning Phase]
    Planning --> Design[🎨 Design]
    Planning --> Research[🔬 Research]

    Design --> Review1{👥 Design Review}
    Research --> Review1

    Review1 -->|Approved ✅| Development[💻 Development]
    Review1 -->|Revisions Needed ⚠️| Planning

    Development --> Testing[🧪 Testing]
    Testing --> Review2{🔍 QA Review}

    Review2 -->|Pass ✅| Deploy[🚀 Deploy]
    Review2 -->|Fail ❌| Development

    Deploy --> Monitor[📊 Monitor]
    Monitor --> End([✨ Success!])

    style Start fill:#ff6b6b,stroke:#c92a2a,stroke-width:3px,color:#fff
    style End fill:#51cf66,stroke:#2f9e44,stroke-width:3px,color:#fff
    style Deploy fill:#4ecdc4,stroke:#22b8cf,stroke-width:3px
    style Testing fill:#ffe66d,stroke:#ffd43b
    style Development fill:#a78bfa,stroke:#7c3aed,color:#fff
```

## 2. Professional Sequence Diagram - E-commerce Checkout

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'primaryColor':'#667eea','secondaryColor':'#764ba2','tertiaryColor':'#f093fb','primaryTextColor':'#fff','lineColor':'#667eea','fontSize':'14px'}}}%%
sequenceDiagram
    autonumber
    actor Customer as 👤 Customer
    participant UI as 🖥️ Web App
    participant API as ⚙️ API Server
    participant Auth as 🔐 Auth Service
    participant Payment as 💳 Payment Gateway
    participant DB as 🗄️ Database

    Customer->>+UI: Add items to cart
    UI->>+API: GET /cart
    API->>+DB: Fetch cart data
    DB-->>-API: Cart items
    API-->>-UI: Cart contents

    Customer->>+UI: Proceed to checkout
    UI->>+Auth: Verify session
    Auth-->>-UI: Session valid ✅

    UI->>+Customer: Request payment info
    Customer->>-UI: Enter card details

    UI->>+API: POST /checkout
    API->>+Payment: Process payment

    alt Payment Successful
        Payment-->>API: Success ✅
        API->>DB: Create order
        DB-->>API: Order created
        API-->>UI: Order confirmed
        UI-->>Customer: Thank you! 🎉
    else Payment Failed
        Payment-->>API: Failed ❌
        API-->>UI: Payment error
        UI-->>Customer: Please retry
    end

    deactivate API
```

## 3. Modern Class Diagram - Microservices Architecture

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'primaryColor':'#4f46e5','secondaryColor':'#7c3aed','tertiaryColor':'#ec4899','primaryTextColor':'#fff','fontSize':'13px'}}}%%
classDiagram
    class ApiGateway {
        <<service>>
        +String baseUrl
        +Map~String,Service~ routes
        +authenticate(token)
        +routeRequest(request)
        +loadBalance()
    }

    class UserService {
        <<microservice>>
        +createUser(userData)
        +getUserById(id)
        +updateUser(id, data)
        +deleteUser(id)
        -validateEmail(email)
        -hashPassword(password)
    }

    class OrderService {
        <<microservice>>
        +createOrder(orderData)
        +getOrderById(id)
        +updateOrderStatus(id, status)
        +cancelOrder(id)
        -calculateTotal(items)
        -validateInventory(items)
    }

    class PaymentService {
        <<microservice>>
        +processPayment(paymentData)
        +refundPayment(transactionId)
        +getPaymentStatus(transactionId)
        -encryptCardData(cardInfo)
        -callPaymentGateway(data)
    }

    class NotificationService {
        <<microservice>>
        +sendEmail(recipient, template)
        +sendSMS(phone, message)
        +sendPushNotification(userId, data)
        -queueMessage(message)
    }

    class Database {
        <<storage>>
        +query(sql)
        +transaction(operations)
        +backup()
    }

    ApiGateway --> UserService : routes to
    ApiGateway --> OrderService : routes to
    ApiGateway --> PaymentService : routes to
    ApiGateway --> NotificationService : routes to

    UserService --> Database : stores data
    OrderService --> Database : stores data
    PaymentService --> Database : logs transactions

    OrderService ..> PaymentService : calls
    OrderService ..> NotificationService : notifies
    PaymentService ..> NotificationService : notifies
```

## 4. Colorful State Diagram - Order Processing

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'primaryColor':'#14b8a6','secondaryColor':'#8b5cf6','tertiaryColor':'#f59e0b','noteBkgColor':'#fef3c7','noteBorderColor':'#f59e0b','fontSize':'14px'}}}%%
stateDiagram-v2
    [*] --> Pending : Order Created 📝

    Pending --> Processing : Payment Received 💰
    Pending --> Cancelled : Customer Cancelled ❌

    Processing --> Shipped : Items Packed 📦
    Processing --> OnHold : Issue Detected ⚠️
    Processing --> Cancelled : Payment Failed ❌

    OnHold --> Processing : Issue Resolved ✅
    OnHold --> Cancelled : Cannot Resolve ❌

    Shipped --> InTransit : Picked Up 🚚
    InTransit --> Delivered : Delivered ✅
    InTransit --> ReturnInitiated : Return Requested 🔄

    Delivered --> Completed : 30 Days Passed ✨
    Delivered --> ReturnInitiated : Customer Returns 🔄

    ReturnInitiated --> Returned : Item Received Back
    Returned --> Refunded : Money Returned 💵

    Completed --> [*]
    Refunded --> [*]
    Cancelled --> [*]

    note right of Pending
        New orders wait here
        for payment confirmation
    end note

    note right of Delivered
        Success! Order complete.
        Money held for 30 days.
    end note
```

## 5. Advanced Architecture Diagram - Cloud Infrastructure

```mermaid
architecture-beta
    group internet(cloud)[Internet 🌐]
    group dmz(cloud)[DMZ Zone 🛡️]
    group app_tier(server)[Application Tier ⚙️]
    group data_tier(database)[Data Tier 💾]
    group monitoring(server)[Monitoring 📊]

    service cdn(internet)[CDN] in internet
    service waf(cloud)[WAF/Firewall] in dmz
    service lb(server)[Load Balancer] in dmz

    service web1(server)[Web Server 1] in app_tier
    service web2(server)[Web Server 2] in app_tier
    service api1(server)[API Server 1] in app_tier
    service api2(server)[API Server 2] in app_tier
    service cache(disk)[Redis Cache] in app_tier
    service queue(disk)[Message Queue] in app_tier

    service primary_db(database)[Primary DB] in data_tier
    service replica_db(database)[Replica DB] in data_tier
    service backup(disk)[Backup Storage] in data_tier

    service prometheus(server)[Prometheus] in monitoring
    service grafana(server)[Grafana] in monitoring
    service elk(server)[ELK Stack] in monitoring

    cdn:B --> T:waf
    waf:B --> T:lb
    lb:B --> T:web1
    lb:B --> T:web2

    web1:R --> L:api1
    web1:R --> L:api2
    web2:R --> L:api1
    web2:R --> L:api2

    api1:B --> T:cache
    api2:B --> T:cache
    api1:R --> L:queue
    api2:R --> L:queue

    api1:B --> T:primary_db
    api2:B --> T:primary_db
    primary_db:R --> L:replica_db
    primary_db:B --> T:backup

    web1:B --> T:prometheus
    api1:B --> T:prometheus
    primary_db:B --> T:elk
    prometheus:R --> L:grafana
```

## 6. Styled Gantt Chart - Product Launch Timeline

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'primaryColor':'#8b5cf6','secondaryColor':'#ec4899','tertiaryColor':'#f59e0b','primaryTextColor':'#fff','fontSize':'13px'}}}%%
gantt
    title 🚀 Product Launch Timeline - Q1 2025
    dateFormat YYYY-MM-DD

    section Research & Planning 📋
    Market Research           :done,    research, 2025-01-01, 2025-01-15
    Competitor Analysis       :done,    comp,     2025-01-05, 2025-01-20
    Product Requirements      :active,  req,      2025-01-15, 2025-02-01

    section Design 🎨
    UX Research              :         ux,       2025-01-20, 2025-02-10
    UI Mockups               :         ui,       2025-02-01, 2025-02-20
    Design System            :         ds,       2025-02-10, 2025-02-25
    User Testing             :         test,     2025-02-20, 2025-03-05

    section Development 💻
    Backend API              :         api,      2025-02-05, 2025-03-15
    Frontend Development     :         fe,       2025-02-15, 2025-03-25
    Database Setup           :         db,       2025-02-05, 2025-02-15
    Integration              :         int,      2025-03-10, 2025-03-30

    section Testing 🧪
    Unit Testing             :         unit,     2025-03-01, 2025-03-25
    Integration Testing      :         itest,    2025-03-15, 2025-04-05
    QA Testing               :         qa,       2025-03-25, 2025-04-10
    Performance Testing      :         perf,     2025-04-01, 2025-04-10

    section Launch 🎉
    Beta Release             :crit,    beta,     2025-04-05, 2025-04-15
    Marketing Campaign       :crit,    market,   2025-04-10, 2025-04-30
    Production Deploy        :crit,    prod,     2025-04-15, 2025-04-20
    Post-Launch Monitoring   :         monitor,  2025-04-20, 2025-05-05
```

## 7. Vibrant XY Chart - Sales Performance

```mermaid
xychart-beta
    title "📈 Quarterly Sales Performance (in thousands)"
    x-axis [Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec]
    y-axis "Revenue ($K)" 0 --> 150
    bar [45, 52, 48, 75, 82, 78, 92, 98, 105, 112, 125, 142]
    line [40, 50, 55, 70, 80, 85, 90, 95, 100, 110, 120, 140]
```

## 8. Complex Sankey Diagram - User Journey

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor":"#667eea","fontSize":"14px"}}}%%
sankey-beta

%% Traffic Sources
Google Organic,Homepage,8500
Facebook Ads,Homepage,4200
LinkedIn,Homepage,2800
Direct Traffic,Homepage,3500
Email Campaign,Homepage,2000

%% Homepage to Main Sections
Homepage,Product Pages,7500
Homepage,Pricing,5200
Homepage,Blog,4800
Homepage,About,2500

%% Product Pages Journey
Product Pages,Free Trial,3800
Product Pages,Contact Sales,2200
Product Pages,Exit,1500

%% Pricing Journey
Pricing,Free Trial,2500
Pricing,Contact Sales,1800
Pricing,Exit,900

%% Conversions
Free Trial,Signup Complete,5200
Free Trial,Abandoned,1100

Contact Sales,Demo Scheduled,3200
Contact Sales,No Response,800

%% Final Outcomes
Signup Complete,Paid Conversion,3800
Signup Complete,Free User,1400

Demo Scheduled,Closed Won,2400
Demo Scheduled,Closed Lost,800
```

## Usage Notes

All these examples can be customized further by:

1. **Changing Colors**: Modify `primaryColor`, `secondaryColor`, `tertiaryColor`
2. **Adjusting Fonts**: Change `fontSize` in themeVariables
3. **Applying Themes**: Use 'default', 'dark', 'forest', 'neutral', or 'base'
4. **Adding Styles**: Use inline style commands for specific elements
5. **Using Emojis**: Add visual interest with Unicode emojis

## Color Palette Examples

**Professional Blue**:
```
primaryColor: '#3b82f6'
secondaryColor: '#1e40af'
tertiaryColor: '#93c5fd'
```

**Modern Purple**:
```
primaryColor: '#8b5cf6'
secondaryColor: '#7c3aed'
tertiaryColor: '#c4b5fd'
```

**Vibrant Gradient**:
```
primaryColor: '#ec4899'
secondaryColor: '#f43f5e'
tertiaryColor: '#fda4af'
```
