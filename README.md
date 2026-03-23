<div align="center">

<!-- Replace with actual logo -->
<img src="docs/assets/purse-logo.png" alt="Purse Logo" width="180"/>

# Purse

### AI-Powered Financial Literacy & Empowerment for Nigerian Women

*Unlock your financial future — one saved naira at a time.*

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit-brightgreen?style=for-the-badge)](https://purse-app.vercel.app)
[![Interswitch Powered](https://img.shields.io/badge/Powered_By-Interswitch-0066FF?style=for-the-badge)](https://developer.interswitchgroup.com)
[![Enyata Buildathon 2026](https://img.shields.io/badge/Enyata_x_Interswitch-Buildathon_2026-7B2D8E?style=for-the-badge)]()

</div>

---

## The Problem

**36 million Nigerian women remain financially excluded.** In rural communities, the gap is even wider — women face limited banking access, low literacy, cultural barriers, and zero tailored tools. Existing solutions were not built for them.

| Stat | Source |
|------|--------|
| Women's financial inclusion sits at ~64% vs. higher for men | CBN NFIS / EFInA 2025 |
| 250,000+ women registered for EmpowerHER virtual financial literacy training | Federal Ministry of Women Affairs, 2025 |
| NFWP-SU targets 5 million women directly (25M indirectly) across all 36 states + FCT | World Bank, Feb 2026 ($540M) |
| 26,000+ Women Affinity Groups (WAGs) formed, saving over ₦4.9B collectively | NFWP Progress Reports |

The infrastructure is being built at policy level. **What's missing is the digital bridge** — a tool that meets these women where they are, teaches them finance in their language, and gives them real savings and payment power.

---

## The Solution

**Purse** is a mobile-first, AI-powered app that combines gamified financial education with real micro-savings and secure payments — all integrated with **Interswitch's payment infrastructure**. Designed specifically for women and girls in rural and underserved Nigeria.

Purse doesn't just teach finance. It **practices** it — every lesson unlocks real savings tools, every module completed improves your credit profile, every naira saved is secured on-chain for transparency.

---

## Key Features

### Financial Literacy (Gamified)
- Bite-sized modules: budgeting, saving, investing, entrepreneurship, digital safety
- Local dialect support (Hausa, Yoruba, Igbo) via voice and text
- Badges, rewards (airtime credits, cash bonuses), and certificates
- Low-data mode and offline access for rural connectivity

### AI Financial Advisor
- Personalized advice based on income patterns, expenses, and goals
- Smart nudges: *"Save ₦5,000 for school fees by next month"*
- Risk detection and gentle behavioral coaching
- Goal tracking with visual progress dashboards

### Micro-Savings & Goals
- Automated round-up savings on every transaction
- Daily/weekly auto-deposits via **Interswitch AutoPay**
- Group savings pots for Women Affinity Groups (WAGs)
- Goal categories: education, business startup, health, emergencies

### Secure Payments & Transfers (Interswitch-Powered)
- **IPG (Payment Gateway):** Collect payments, fund wallets, process subscriptions
- **Quickteller:** Bill payments (utilities, school fees), peer-to-peer transfers within WAGs
- **Transfers API:** Low-fee diaspora remittances to family members
- **AutoPay:** Recurring micro-savings deductions, automated goal contributions

### Community & Peer Mentoring
- Private WAG forums for sharing business tips and mutual support
- Moderated spaces safe for younger girls
- Peer mentoring matching based on goals and experience

### Blockchain Transparency
- Transaction logs and savings records on-chain for trust and auditability
- Group savings verification — every member can see the pot
- Financial discipline proof for loan/grant applications

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Mobile** | React Native (Expo) | Cross-platform mobile app |
| **Backend** | Node.js + Express | REST API, business logic |
| **AI/ML** | TensorFlow Lite, OpenAI API | Personalized advisor, NLP |
| **Payments** | **Interswitch IPG, Quickteller, AutoPay, Transfers** | Collections, bills, transfers, recurring |
| **Blockchain** | Solidity (Polygon L2) | Transparent savings ledger |
| **Database** | PostgreSQL + Redis | Persistent storage + caching |
| **Auth** | JWT + OTP (via Interswitch) | Secure authentication |
| **Hosting** | Vercel (frontend), Railway/Render (backend) | Live deployment |
| **Offline** | AsyncStorage + SQLite | Offline-first for rural areas |

---

## Architecture Overview

```mermaid
graph TB
    subgraph Client["Mobile App — React Native"]
        UI["UI Layer<br/>(Gamified Modules, Dashboard)"]
        State["State Management<br/>(Redux Toolkit)"]
        Offline["Offline Storage<br/>(SQLite + AsyncStorage)"]
    end

    subgraph Backend["Backend — Node.js + Express"]
        API["REST API Gateway"]
        Auth["Auth Service<br/>(JWT + OTP)"]
        AIEngine["AI Engine<br/>(TF Lite + OpenAI)"]
        PayService["Payment Service"]
        WAGService["WAG Manager"]
    end

    subgraph ISW["Interswitch APIs"]
        IPG["IPG<br/>Collections & Wallet Funding"]
        QT["Quickteller<br/>Bills & P2P Transfers"]
        AP["AutoPay<br/>Recurring Savings"]
        TF["Transfers<br/>Remittances"]
    end

    subgraph Chain["Blockchain — Polygon L2"]
        SC["Smart Contracts<br/>(Savings Ledger)"]
        Verify["Transaction Verification"]
    end

    subgraph Data["Data Layer"]
        DB[("PostgreSQL")]
        Cache[("Redis")]
        ML["ML Model Store"]
    end

    Client -->|HTTPS| Backend
    Backend --> ISW
    Backend --> Chain
    Backend --> Data
    PayService --> IPG
    PayService --> QT
    PayService --> AP
    PayService --> TF
    WAGService --> SC
    AIEngine --> ML
```

> Full architecture with detailed flow diagrams: [ARCHITECTURE.md](ARCHITECTURE.md)

---

## Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn
- React Native CLI / Expo CLI
- PostgreSQL 15+
- Redis
- Interswitch Developer Account ([Sign up here](https://developer.interswitchgroup.com))

### 1. Clone the Repository

```bash
git clone https://github.com/your-team/purse.git
cd purse
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Configure your `.env` with Interswitch sandbox credentials:

```env
# Interswitch Sandbox
ISW_CLIENT_ID=your_sandbox_client_id
ISW_SECRET_KEY=your_sandbox_secret_key
ISW_PASSPHRASE=your_sandbox_passphrase
ISW_BASE_URL=https://qa.interswitchng.com
ISW_PAYMENT_URL=https://qa.interswitchng.com/collections/api/v1/pay

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/purse_db
REDIS_URL=redis://localhost:6379

# AI
OPENAI_API_KEY=your_openai_key

# Blockchain (Polygon Mumbai Testnet)
POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
WALLET_PRIVATE_KEY=your_testnet_wallet_key
```

### 3. Install & Run

```bash
# Backend
cd server
npm install
npm run migrate
npm run dev

# Mobile App (new terminal)
cd client
npm install
npx expo start
```

### 4. Test Interswitch Integration

Use Interswitch sandbox test cards:

| Card Number | Expiry | CVV | PIN | OTP |
|-------------|--------|-----|-----|-----|
| 5060990580000217499 | 03/50 | 111 | 1111 | 123456 |

> See [Interswitch Developer Docs](https://developer.interswitchgroup.com) for full sandbox guide.

---

## Screenshots

<div align="center">

| Onboarding | Lessons | Savings Dashboard |
|:---:|:---:|:---:|
| <img src="docs/screenshots/onboarding.png" width="200"/> | <img src="docs/screenshots/lessons.png" width="200"/> | <img src="docs/screenshots/savings.png" width="200"/> |

| AI Advisor | WAG Group | Payments |
|:---:|:---:|:---:|
| <img src="docs/screenshots/ai-advisor.png" width="200"/> | <img src="docs/screenshots/wag-group.png" width="200"/> | <img src="docs/screenshots/payments.png" width="200"/> |

</div>

---

## Project Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Full technical architecture with Mermaid diagrams |
| [SCALABILITY-PLAN.md](SCALABILITY-PLAN.md) | 0–3 year growth plan, monetization, metrics |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute, code style, PR process |
| [PROJECT-DECISIONS.md](PROJECT-DECISIONS.md) | Key decisions, research findings, conventions |

---

## Team

| Name | Role | Contributions |
|------|------|--------------|
| [Member 1] | Full-Stack Developer | Backend API, Interswitch integration, blockchain |
| [Member 2] | Frontend / Mobile Developer | React Native app, UI/UX implementation |
| [Member 3] | AI / ML Engineer | Financial advisor model, NLP, recommendation engine |
| [Member 4] | Product & Design | UX research, wireframes, user testing, documentation |

---

## Alignment with National Programs

Purse is designed to complement and digitally extend ongoing national initiatives:

- **EmpowerHER Programme** — Extends the Federal Ministry of Women Affairs' financial literacy training (250K+ women) with practical digital tools
- **NFWP Scale-Up (NFWP-SU)** — Digitizes Women Affinity Groups (WAGs) formed under the $540M World Bank-supported program targeting 5M women
- **CBN NFIS** — Directly addresses the gender gap in financial inclusion by bringing rural women into the formal digital economy
- **We-FI Code** — Supports women entrepreneurs with credit-building tools and micro-business features

---

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with purpose at the Enyata x Interswitch Buildathon 2026**

*Empowering women. One naira at a time.*

</div>
