# Purse — Technical Architecture

> AI-Powered Financial Literacy & Empowerment Platform for Nigerian Women

This document details the full technical architecture of Purse, including system design, data flows, Interswitch payment integration, blockchain transparency layer, and AI advisory engine.

---

## Table of Contents

- [High-Level System Architecture](#high-level-system-architecture)
- [User Journey Flow](#user-journey-flow)
- [Interswitch Payment Integration](#interswitch-payment-integration)
- [AI & Backend Flow](#ai--backend-flow)
- [Blockchain Transparency Layer](#blockchain-transparency-layer)
- [Data Architecture & Security](#data-architecture--security)
- [Offline-First Strategy](#offline-first-strategy)
- [API Design](#api-design)

---

## High-Level System Architecture

```mermaid
graph TB
    subgraph Mobile["Mobile App — React Native (Expo)"]
        direction TB
        UILayer["UI Layer<br/>Gamified Modules | Dashboard | WAG Chat"]
        StateM["State Management — Redux Toolkit"]
        OfflineDB["Offline Store — SQLite + AsyncStorage"]
        TFLite["TF Lite — On-Device ML"]
    end

    subgraph Gateway["API Gateway — Node.js + Express"]
        direction TB
        Router["Route Handler + Validation"]
        AuthMW["Auth Middleware — JWT + OTP"]
        RateLimit["Rate Limiter — express-rate-limit"]
    end

    subgraph Services["Microservices Layer"]
        direction TB
        UserSvc["User Service<br/>Registration, KYC Lite, Profiles"]
        LearnSvc["Learning Service<br/>Modules, Progress, Badges"]
        AISvc["AI Advisory Service<br/>Personalization, Nudges, Goals"]
        PaySvc["Payment Service<br/>Interswitch Integration Hub"]
        WAGSvc["WAG Service<br/>Groups, Savings Pots, Forums"]
        NotifSvc["Notification Service<br/>Push, SMS, In-App"]
    end

    subgraph ISW["Interswitch APIs"]
        direction TB
        IPG["IPG<br/>Card Collections<br/>Wallet Funding"]
        Quickteller["Quickteller<br/>Bills Payment<br/>P2P Transfers"]
        AutoPay["AutoPay<br/>Recurring Savings<br/>Auto-Deductions"]
        Transfers["Transfers API<br/>Interbank<br/>Remittances"]
    end

    subgraph Blockchain["Blockchain — Polygon L2"]
        direction TB
        SavingsContract["SavingsLedger.sol<br/>Transparent Records"]
        WAGContract["WAGPool.sol<br/>Group Savings Verification"]
        Explorer["Block Explorer<br/>Public Audit Trail"]
    end

    subgraph DataLayer["Data Layer"]
        direction TB
        PG[("PostgreSQL<br/>Primary Store")]
        Redis[("Redis<br/>Cache + Sessions")]
        S3["Object Storage<br/>Lesson Media, Avatars"]
        MLStore["ML Model Registry"]
    end

    Mobile -->|HTTPS / REST| Gateway
    Gateway --> Services
    PaySvc --> ISW
    WAGSvc --> Blockchain
    AISvc --> MLStore
    Services --> DataLayer
    NotifSvc -->|FCM / SMS Gateway| Mobile
```

---

## User Journey Flow

```mermaid
flowchart TD
    A["Download Purse App"] --> B["Onboarding"]
    B --> B1["Phone Number + OTP Verification"]
    B1 --> B2["KYC Lite — Name, State, WAG ID (optional)"]
    B2 --> B3["Financial Literacy Assessment<br/>(5 quick questions)"]
    B3 --> C["Personalized Dashboard"]

    C --> D["Learning Path"]
    C --> E["Savings & Payments"]
    C --> F["Community (WAG)"]
    C --> G["AI Advisor"]

    D --> D1["Gamified Lesson Modules"]
    D1 --> D2{"Module Complete?"}
    D2 -->|Yes| D3["Badge + Reward<br/>(Airtime / Cash Bonus)"]
    D3 --> D4["Unlock Next Module"]
    D2 -->|No| D1
    D3 --> D5["Certificate on Completion"]

    E --> E1["Set Savings Goal<br/>(Education, Business, Health)"]
    E1 --> E2["Fund Wallet<br/>via Interswitch IPG"]
    E2 --> E3["Enable AutoPay<br/>Recurring Micro-Savings"]
    E3 --> E4["Track Progress<br/>On-Chain Verification"]
    E --> E5["Pay Bills<br/>via Quickteller"]
    E --> E6["Send/Receive Money<br/>via Transfers API"]

    F --> F1["Join/Create WAG Group"]
    F1 --> F2["Group Savings Pot<br/>(Smart Contract)"]
    F2 --> F3["Contribute Weekly"]
    F3 --> F4["Rotating Payouts<br/>or Goal-Based Release"]
    F --> F5["Peer Forum<br/>Moderated Chat"]

    G --> G1["Chat with AI Advisor"]
    G1 --> G2["Get Personalized Tips"]
    G2 --> G3["Spending Analysis"]
    G3 --> G4["Goal Adjustments"]
    G4 --> G5["Credit Score Building"]

    style A fill:#7B2D8E,color:#fff
    style C fill:#0066FF,color:#fff
    style D3 fill:#28A745,color:#fff
    style E2 fill:#0066FF,color:#fff
    style F2 fill:#F59E0B,color:#fff
    style G1 fill:#7B2D8E,color:#fff
```

---

## Interswitch Payment Integration

### Payment Flow Architecture

```mermaid
sequenceDiagram
    participant User as Purse User
    participant App as Mobile App
    participant API as Purse Backend
    participant ISW as Interswitch API
    participant Chain as Polygon L2

    Note over User,Chain: --- Wallet Funding (IPG) ---
    User->>App: Tap "Fund Wallet"
    App->>API: POST /api/v1/payments/fund
    API->>API: Generate transaction ref + MAC hash
    API->>ISW: POST /collections/api/v1/pay (IPG)
    ISW-->>App: Redirect to payment page
    User->>ISW: Enter card details + OTP
    ISW-->>API: Payment callback (success/fail)
    API->>API: Credit user wallet in DB
    API->>Chain: Log transaction hash on-chain
    API-->>App: Wallet updated + receipt

    Note over User,Chain: --- Recurring Savings (AutoPay) ---
    User->>App: Enable auto-save (₦200/day)
    App->>API: POST /api/v1/savings/autopay
    API->>ISW: Register recurring charge (AutoPay)
    ISW-->>API: Token stored for recurring
    loop Daily at scheduled time
        ISW->>API: Charge notification
        API->>API: Deduct + credit savings goal
        API->>Chain: Log savings entry on-chain
        API-->>App: Push notification "₦200 saved!"
    end

    Note over User,Chain: --- Bill Payment (Quickteller) ---
    User->>App: Pay electricity bill
    App->>API: POST /api/v1/payments/bills
    API->>ISW: POST /quickteller/bills/payment
    ISW-->>API: Payment confirmation
    API-->>App: Receipt + confirmation

    Note over User,Chain: --- P2P Transfer (Transfers) ---
    User->>App: Send ₦5,000 to sister
    App->>API: POST /api/v1/transfers/send
    API->>ISW: POST /transfers/funds
    ISW-->>API: Transfer confirmation
    API->>Chain: Log transfer on-chain
    API-->>App: "Sent! Sister receives ₦5,000"
```

### Interswitch API Integration Details

| API | Endpoint (Sandbox) | Use Case | Auth |
|-----|-------------------|----------|------|
| **IPG** | `POST /collections/api/v1/pay` | Card payments, wallet funding | MAC (SHA-512) |
| **Quickteller Bills** | `POST /api/v2/quickteller/payments` | Utility bills, airtime, school fees | Bearer Token |
| **Quickteller Transfer** | `POST /api/v2/quickteller/transfers` | P2P within same bank | Bearer Token |
| **AutoPay** | `POST /api/v1/recurring/setup` | Recurring savings deductions | Token + MAC |
| **Transfers** | `POST /api/v2/transfers/funds` | Interbank, remittances | Bearer Token |

**Sandbox Base URL:** `https://qa.interswitchng.com`
**Production Base URL:** `https://saturn.interswitchng.com`

### Security Measures
- MAC hash generation using SHA-512 (client_id + secret + timestamp + transaction_ref)
- All callbacks verified via signature validation
- Card tokens stored encrypted, never raw card data
- PCI-DSS compliance via Interswitch's hosted payment page (IPG redirect)

---

## AI & Backend Flow

```mermaid
flowchart TB
    subgraph Input["User Input Sources"]
        Trans["Transaction History"]
        Goals["Savings Goals"]
        Lessons["Lesson Progress"]
        Profile["User Profile"]
        Chat["Chat Messages"]
    end

    subgraph Processing["AI Processing Pipeline"]
        direction TB
        NLP["NLP Engine<br/>(Intent Recognition)"]
        Categorize["Spending Categorizer<br/>(TF Lite — On-Device)"]
        Predict["Savings Predictor<br/>(Time Series Model)"]
        Recommend["Lesson Recommender<br/>(Collaborative Filtering)"]
        Advisor["Financial Advisor<br/>(LLM — Cloud API)"]
    end

    subgraph Output["AI Outputs"]
        Nudge["Smart Nudges<br/>'You saved 20% less this week'"]
        Tips["Personalized Tips<br/>'Try the round-up feature'"]
        Path["Learning Path<br/>Next best module"]
        Risk["Risk Alerts<br/>'Unusual spending detected'"]
        Credit["Credit Score<br/>Built from behavior data"]
    end

    Input --> Processing
    Processing --> Output

    subgraph Offline["Offline Capability"]
        LocalML["TF Lite Models<br/>Categorization + Basic Nudges"]
        Queue["Action Queue<br/>Syncs when online"]
    end

    Categorize -.->|"Works offline"| LocalML
    Nudge -.->|"Queued if offline"| Queue
```

### AI Model Details

| Model | Type | Runtime | Purpose |
|-------|------|---------|---------|
| Spending Categorizer | Classification (TF Lite) | On-device | Categorize transactions into food, transport, education, etc. |
| Savings Predictor | Time Series (LSTM) | Cloud | Predict optimal savings amounts based on income patterns |
| Lesson Recommender | Collaborative Filtering | Cloud | Suggest next module based on similar user patterns |
| Financial Advisor | LLM (GPT-4 / fine-tuned) | Cloud | Conversational advice, goal planning, Q&A |
| Risk Detector | Anomaly Detection | Cloud | Flag unusual spending, potential fraud |

---

## Blockchain Transparency Layer

```mermaid
flowchart LR
    subgraph OnChain["Polygon L2 — On-Chain"]
        SL["SavingsLedger.sol"]
        WP["WAGPool.sol"]
        Events["Event Logs"]
    end

    subgraph OffChain["Off-Chain (Backend)"]
        PaymentSvc["Payment Service"]
        WAGMgr["WAG Manager"]
        Indexer["Event Indexer"]
    end

    subgraph UserFacing["User-Facing"]
        Dashboard["Savings Dashboard<br/>'Verified on blockchain'"]
        WAGView["WAG Pool View<br/>'All contributions visible'"]
        Proof["Financial Proof<br/>For loan applications"]
    end

    PaymentSvc -->|"savingsDeposit(user, amount, goal)"| SL
    WAGMgr -->|"contribute(wagId, member, amount)"| WP
    SL --> Events
    WP --> Events
    Events --> Indexer
    Indexer --> Dashboard
    Indexer --> WAGView
    Indexer --> Proof
```

### Smart Contracts

**SavingsLedger.sol**
- Records every savings deposit/withdrawal with timestamp
- Immutable proof of financial discipline
- Query function: `getSavingsHistory(address user)` returns full trail
- Used by partner MFIs to verify creditworthiness

**WAGPool.sol**
- Manages group savings pools for Women Affinity Groups
- Tracks individual contributions per member
- Supports rotating payout schedules (ajo/esusu style)
- Requires multi-sig for withdrawals above threshold
- Emits events for real-time dashboard updates

### Why Blockchain?
Rural women in WAGs often distrust informal savings due to past losses from fraud or mismanagement. On-chain records provide:
1. **Transparency** — Every member sees every contribution
2. **Immutability** — No one can alter the records
3. **Proof** — Verifiable savings history for loan/grant applications
4. **Trust** — Removes need for a single trusted intermediary

---

## Data Architecture & Security

```mermaid
flowchart TB
    subgraph Security["Security Layers"]
        direction TB
        TLS["TLS 1.3<br/>All traffic encrypted"]
        JWT["JWT Auth<br/>Short-lived tokens"]
        OTP["OTP Verification<br/>Phone-based"]
        Encrypt["AES-256 Encryption<br/>Sensitive data at rest"]
        RBAC["Role-Based Access<br/>User / WAG Admin / System"]
    end

    subgraph DataStore["Data Storage"]
        direction TB
        PG["PostgreSQL"]
        PGContent["Users, Transactions,<br/>Lessons, Goals, WAGs"]
        Redis2["Redis"]
        RedisContent["Sessions, OTP Codes,<br/>Rate Limit Counters, Cache"]
        S3Store["Object Storage (S3)"]
        S3Content["Lesson Media, Audio,<br/>User Avatars"]
    end

    subgraph Privacy["Data Privacy"]
        direction TB
        Min["Data Minimization<br/>Collect only what's needed"]
        Consent["Explicit Consent<br/>NDPR compliant"]
        Audit["Audit Logs<br/>All admin actions logged"]
        Retention["Data Retention Policy<br/>Auto-purge after 3 years"]
    end

    Security --> DataStore
    DataStore --> Privacy
```

### Database Schema (Core Tables)

```
users           — id, phone, name, state, lga, wag_id, kyc_status, created_at
wallets         — id, user_id, balance, currency, updated_at
transactions    — id, user_id, type, amount, reference, isw_ref, status, tx_hash, created_at
savings_goals   — id, user_id, name, target, current, auto_amount, frequency, created_at
lessons         — id, title, category, difficulty, content_url, dialect
user_progress   — id, user_id, lesson_id, score, completed, badge_earned, completed_at
wags            — id, name, state, admin_id, pool_balance, contract_address, created_at
wag_members     — id, wag_id, user_id, role, joined_at
wag_contributions — id, wag_id, user_id, amount, tx_hash, created_at
ai_interactions — id, user_id, message, response, context, created_at
```

### Security Compliance
- **NDPR** (Nigeria Data Protection Regulation) — Consent-based data collection, right to deletion
- **PCI-DSS** — No raw card data stored; all card handling via Interswitch hosted page
- **OWASP Top 10** — Input validation, parameterized queries, rate limiting, CSRF protection
- **Interswitch Security** — MAC hash verification on all callbacks, IP whitelisting for webhooks

---

## Offline-First Strategy

```mermaid
flowchart LR
    subgraph Online["Online Mode"]
        Full["Full Features<br/>AI Advisor, Payments,<br/>Real-time Sync"]
    end

    subgraph Offline["Offline Mode"]
        Lessons2["Cached Lessons<br/>(Pre-downloaded)"]
        Track["Savings Tracker<br/>(Local SQLite)"]
        BasicAI["Basic Nudges<br/>(TF Lite on-device)"]
        Queue2["Action Queue<br/>(Pending transactions)"]
    end

    subgraph Sync["Reconnection"]
        SyncEngine["Sync Engine"]
        Resolve["Conflict Resolution<br/>(Server wins for financial data)"]
        Push["Push queued transactions<br/>to Interswitch"]
    end

    Online -->|"Connection lost"| Offline
    Offline -->|"Connection restored"| Sync
    Sync -->|"Synced"| Online
```

**Offline capabilities:**
- 20+ lesson modules pre-cached on first sync (~5MB total, optimized for low storage)
- Savings goal tracker works fully offline
- Basic spending categorization via TF Lite
- Transaction queue holds up to 50 pending operations
- Automatic sync with conflict resolution on reconnect (server-authoritative for financial data)

**USSD Fallback:**
- For feature phone users, core features accessible via USSD short code
- Check balance, make savings deposit, view next lesson
- Integrates with backend via USSD gateway provider

---

## API Design

### Base URL
- **Development:** `http://localhost:3000/api/v1`
- **Staging:** `https://api-staging.purse-app.com/api/v1`
- **Production:** `https://api.purse-app.com/api/v1`

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register with phone + OTP |
| POST | `/auth/verify` | Verify OTP |
| POST | `/auth/login` | Login with phone + OTP |
| GET | `/users/me` | Get current user profile |
| PUT | `/users/me` | Update profile |
| GET | `/lessons` | List available lessons |
| GET | `/lessons/:id` | Get lesson content |
| POST | `/lessons/:id/complete` | Mark lesson complete, earn badge |
| GET | `/savings/goals` | List user's savings goals |
| POST | `/savings/goals` | Create new savings goal |
| POST | `/savings/autopay` | Enable AutoPay recurring savings |
| POST | `/payments/fund` | Fund wallet via Interswitch IPG |
| POST | `/payments/bills` | Pay bill via Quickteller |
| POST | `/transfers/send` | Send money via Transfers API |
| GET | `/wallet/balance` | Get wallet balance |
| GET | `/wallet/transactions` | Transaction history |
| GET | `/wags` | List user's WAGs |
| POST | `/wags` | Create a WAG |
| POST | `/wags/:id/contribute` | Contribute to WAG pool |
| GET | `/wags/:id/pool` | View pool status (on-chain verified) |
| POST | `/ai/chat` | Chat with AI advisor |
| GET | `/ai/insights` | Get personalized financial insights |

### Response Format

```json
{
  "success": true,
  "data": { },
  "message": "Operation successful",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

### Error Format

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Wallet balance is below the requested amount"
  }
}
```

---

*This architecture is designed to be production-ready while remaining achievable within the Buildathon timeline. The MVP will focus on core flows (onboarding → lessons → savings → Interswitch payments) with blockchain and advanced AI features as stretch goals.*
