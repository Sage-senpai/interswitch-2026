# Project Decisions Log

This document tracks key architectural decisions, research findings, and conventions for the Purse project. It serves as a living record so every team member understands the "why" behind our choices.

---

## Conventions

| Area | Convention | Reason |
|------|-----------|--------|
| Language | TypeScript (strict) for client + server | Type safety reduces bugs in financial logic |
| Mobile Framework | React Native with Expo | Cross-platform, fast iteration, good offline support |
| Backend | Node.js + Express | JS ecosystem consistency, large Interswitch SDK community |
| Database | PostgreSQL (primary) + Redis (cache) | ACID compliance for financial data; Redis for session/cache |
| Blockchain | Polygon L2 (Solidity) | Low gas fees, Ethereum compatibility, suitable for micro-transactions |
| API Style | REST with versioned endpoints (`/api/v1/`) | Simplicity, broad tooling support, matches Interswitch patterns |
| Auth | JWT + OTP verification | Standard for mobile fintech; OTP for rural users without email |
| Payments | All Interswitch calls via `services/payment/` module | Single integration point, easy to mock/test/swap |
| AI | TensorFlow Lite (on-device) + OpenAI API (cloud) | Hybrid: basic predictions offline, complex advice online |
| Commit Style | Conventional Commits | Clear history for judges reviewing contributions |

---

## Key Decisions

### D-001: Mobile-First, Not Web-First
**Date:** Pre-hackathon planning
**Decision:** Build React Native mobile app as primary interface, not a web app.
**Rationale:** Target users (rural Nigerian women) access internet primarily via smartphones. GSMA data shows 60%+ mobile internet penetration in Nigeria vs. limited desktop access in rural areas. WAG meetings happen in person — members need a phone app, not a laptop.
**Trade-off:** Slightly harder for judges to test (need Expo Go or hosted web preview). Mitigated by deploying Expo web build to Vercel as a fallback.

### D-002: Interswitch as Sole Payment Provider
**Date:** Pre-hackathon planning
**Decision:** Use only Interswitch APIs for all payment flows (no Paystack, Flutterwave, etc.).
**Rationale:** Buildathon requirement — must use Interswitch APIs. Also strategically sound: Interswitch has deepest penetration in rural agent banking networks, which aligns with our user base.
**APIs Selected:**
- **IPG** — Wallet funding, card collections, subscription payments
- **Quickteller** — Bill payments (utilities, school fees), intra-bank transfers
- **AutoPay** — Recurring micro-savings deductions (daily/weekly)
- **Transfers** — Cross-bank remittances (diaspora → family)

### D-003: Polygon L2 Over Ethereum Mainnet or Solana
**Date:** Pre-hackathon planning
**Decision:** Use Polygon (Matic) Layer 2 for blockchain transparency layer.
**Rationale:** Gas fees on Ethereum mainnet would make micro-transaction logging impractical (₦50 savings shouldn't cost ₦500 in gas). Polygon offers <$0.01 transactions with Ethereum security guarantees. Solana is faster but less battle-tested for financial auditability and has had network stability issues.
**Trade-off:** Slightly less decentralized than mainnet. Acceptable for transparency/audit use case (not DeFi).

### D-004: Hybrid AI Architecture (On-Device + Cloud)
**Date:** Pre-hackathon planning
**Decision:** Run basic ML predictions on-device (TF Lite), complex NLP via cloud API.
**Rationale:** Rural users have intermittent connectivity. Basic features (spending categorization, simple savings nudges) must work offline. Complex features (conversational advisor, personalized lesson paths) use cloud when available.
**Trade-off:** Two model pipelines to maintain. Worth it for offline-first reliability.

### D-005: Flat Repo Structure Over Monorepo Tooling
**Date:** Pre-hackathon planning
**Decision:** Use simple `client/` + `server/` + `contracts/` structure, no Nx/Turborepo.
**Rationale:** 3-day hackathon. Enterprise monorepo tooling adds setup overhead with no benefit at this scale. Judges see clean structure at root level. All docs (README, ARCHITECTURE, SCALABILITY-PLAN) visible at repo root.

---

## Research Findings

### R-001: EmpowerHER Programme Alignment
- Federal Ministry of Women Affairs launched EmpowerHER in 2025
- 250,000+ women registered for free virtual financial/digital literacy training
- Targets 10 million women by 2030
- Includes gamified elements, certification, prizes
- **Purse opportunity:** Serve as the digital tool platform that extends EmpowerHER training into practical daily use

### R-002: NFWP Scale-Up (NFWP-SU)
- Launched February 2026, $540M World Bank-supported
- Expanding to all 36 states + FCT (from initial 6 states)
- Targets 5 million women directly, 25 million indirectly
- Previous phases: 26,000+ WAGs formed, ₦4.9B+ saved, loans disbursed
- **Purse opportunity:** Digitize WAG savings, provide the tech layer for group financial management

### R-003: CBN Financial Inclusion Gender Gap
- Women's financial inclusion at ~64% (men significantly higher)
- NFIS targets 95-98% inclusion with focus on women, rural areas, youth
- Agent banking guidelines updated October 2025
- We-FI Code (2024) for women entrepreneurs
- **Purse opportunity:** Bridge the gender gap with a women-specific financial tool integrated into formal banking rails (via Interswitch)

### R-004: Interswitch API Capabilities
- **IPG:** Redirect/inline payment collection, supports Verve/Mastercard/Visa. MAC authentication with client ID + secret. Sandbox at `qa.interswitchng.com`
- **Quickteller:** Bill payment (airtime, electricity, cable), funds transfer. REST API with category-based biller lookup
- **AutoPay:** Token-based recurring billing from initial card authorization. Ideal for automated savings
- **Transfers:** Interbank transfers via Interswitch switching network. Real-time settlement
- **Developer Portal:** `developer.interswitchgroup.com` — sandbox credentials issued per application

### R-005: Rural UX Requirements
- Low literacy: Voice-first, icon-heavy UI, minimal text
- Low connectivity: Offline-capable, low-data mode (<1MB per session)
- Feature phones: USSD fallback integration for ultra-rural areas
- Trust: OTP verification, transaction receipts via SMS, blockchain proof
- Language: Hausa, Yoruba, Igbo support minimum (covers ~65% of population)

---

## Future Decisions (To Be Made During Hackathon)

- [ ] Exact Interswitch sandbox configuration and API version
- [ ] AI model selection for financial advisor (fine-tuned vs. prompt-engineered)
- [ ] Specific WAG features for MVP vs. post-hackathon
- [ ] USSD integration scope for MVP
- [ ] Demo day presentation strategy

---

*Last updated: Pre-hackathon planning phase*
