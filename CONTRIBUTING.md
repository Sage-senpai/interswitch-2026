# Contributing to Purse

Thank you for your interest in contributing to Purse! This project empowers women and girls in rural Nigeria through AI-powered financial literacy and micro-savings tools.

## Table of Contents

- [Team Structure](#team-structure)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Branch Naming](#branch-naming)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Non-Technical Contributions](#non-technical-contributions)

---

## Team Structure

| Role | Responsibilities |
|------|-----------------|
| Full-Stack Developer | Backend API, Interswitch integration, blockchain smart contracts |
| Frontend / Mobile Developer | React Native app, UI components, offline mode |
| AI / ML Engineer | Financial advisor model, NLP chatbot, recommendation engine |
| Product & Design | UX research, wireframes, user testing, documentation |

Every team member must have visible GitHub contributions — this is a hackathon requirement.

---

## Getting Started

1. Clone the repo and follow setup instructions in [README.md](README.md#getting-started)
2. Create a feature branch from `main`
3. Make your changes
4. Open a pull request

---

## Development Workflow

```
main (production-ready)
 └── feature/your-feature-name
 └── fix/bug-description
 └── docs/documentation-update
```

1. Pull latest `main` before creating a branch
2. Work in small, focused commits
3. Test locally before pushing
4. Open a PR with a clear description

---

## Branch Naming

Use the following prefixes:

| Prefix | Use Case |
|--------|----------|
| `feature/` | New functionality (e.g., `feature/ai-advisor-chatbot`) |
| `fix/` | Bug fixes (e.g., `fix/payment-timeout-handling`) |
| `docs/` | Documentation changes (e.g., `docs/update-architecture`) |
| `style/` | UI/UX changes (e.g., `style/onboarding-redesign`) |
| `refactor/` | Code restructuring (e.g., `refactor/payment-service`) |

---

## Commit Messages

Follow conventional commits:

```
type(scope): short description

Examples:
feat(payments): integrate Interswitch IPG for wallet funding
fix(ai): correct savings prediction model bias
docs(readme): add Interswitch sandbox setup instructions
style(onboarding): improve low-literacy user flow
test(wag): add unit tests for group savings logic
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

## Pull Request Process

1. **Title:** Brief, descriptive (e.g., "Add Interswitch AutoPay recurring savings")
2. **Description:** What changed, why, and how to test
3. **Link related issues** if applicable
4. **Request review** from at least one teammate
5. **All checks must pass** before merging

### PR Template

```markdown
## What does this PR do?
[Brief description]

## How to test
[Step-by-step testing instructions]

## Screenshots (if UI change)
[Attach screenshots]

## Interswitch API used (if applicable)
[IPG / Quickteller / AutoPay / Transfers]
```

---

## Code Style

### JavaScript / TypeScript
- Use ESLint + Prettier (config included in repo)
- Prefer `const` over `let`, avoid `var`
- Use async/await over raw promises
- Meaningful variable names (no single letters except loop counters)

### React Native
- Functional components with hooks
- Keep components small and focused
- Use StyleSheet.create for styles (no inline objects)

### Backend (Node.js)
- Express route handlers stay thin — business logic in services
- All Interswitch API calls go through `services/payment/`
- Validate inputs at controller level
- Handle errors with centralized middleware

### Smart Contracts (Solidity)
- Follow OpenZeppelin patterns
- All functions documented with NatSpec
- Test with Hardhat before deployment

---

## Non-Technical Contributions

Designers, PMs, and other non-technical team members — your contributions matter and must be visible on GitHub:

- **UX Research:** Add findings to `docs/ux-research/`
- **Wireframes:** Export and commit to `docs/wireframes/`
- **User Testing Notes:** Document in `docs/user-testing/`
- **Product Specs:** Write feature specs in `docs/specs/`
- **Copy & Content:** Commit lesson content, UI copy, translations to `client/assets/content/`
- **Meeting Notes & Decisions:** Update `PROJECT-DECISIONS.md`

> Tip: Use GitHub's web editor to create/edit markdown files directly if you're not comfortable with git CLI.

---

## Questions?

Open an issue or reach out to the team lead. Let's build something that changes lives.
