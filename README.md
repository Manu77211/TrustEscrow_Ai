# TrustEscrow AI

TrustEscrow AI is a full-stack platform for freelance project execution where trust is enforced by measurable validation, not subjective approval.

This system is built as an AI-powered escrow and validation layer:
- Client payments are held in milestone escrow.
- Freelancer submissions are validated using AI-assisted logic.
- Final release decisions are made through a hybrid score.

## Core Differentiation

TrustEscrow AI is not:
- A generic freelance marketplace.
- A plain escrow wallet.

TrustEscrow AI is:
- An objective trust layer for freelance delivery.
- A proof-of-work based release system.
- A fairness-focused workflow combining AI signals, client feedback, and platform metrics.

## Product Vision

Freelance disputes happen because approvals are often opinion-driven and poorly structured. TrustEscrow AI solves this by introducing:
- AI requirement structuring from vague client descriptions.
- Milestone-based escrow.
- Submission validation for structured and creative work.
- Hybrid score-driven auto release or dispute triggers.

## Primary User Roles

1. Client
2. Freelancer

Both roles support:
- JWT authentication.
- Profile management (skills, experience, ratings, portfolio).

## MVP Scope

### 1) Auth and Profiles
- Register/login with JWT.
- Role support: CLIENT, FREELANCER.
- Profile data with trust-related fields.

### 2) Freelancer Discovery
- Search by skill tags.
- Filter by rating and experience.
- View profile quality indicators (trust score, completion context, validation performance).

### 3) Project and Milestone Workflow
- Client creates project from raw description.
- AI parser structures requirements into milestones, deliverables, and validation criteria.
- Client selects freelancer and funds milestones.

### 4) Real-Time Project Chat
- Project-scoped 1-to-1 chat using Socket.io.
- Supports text and file URL sharing.
- All messages stored in database.

### 5) Submission and Validation
- Draft and final submission flow.
- Pre-approval lock to reduce unfair rejection after approved direction.
- Validation engine supports:
	- Structured work (tests/checks with numeric score).
	- Creative work (non-binary quality report).

### 6) Hybrid Scoring and Decision Engine
Final score formula:

Final Score = 0.4 * AI Score + 0.4 * Client Rating + 0.2 * Platform Metrics

Decision rule:
- Score >= 70: release escrow payment.
- Score < 70: trigger dispute process.

### 7) Dispute and Reputation
- AI-generated explanation of gaps and failures.
- Requirement vs delivery comparison.
- Reputation impact via trust score adjustments.

## Required Tech Stack

### Frontend
- Next.js (App Router)
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Zustand
- TypeScript

### Backend
- Node.js + Express
- Socket.io
- TypeScript

### Database
- PostgreSQL
- Prisma ORM

### AI Layer
- OpenAI API (with safe mock fallback mode for local development)

## Planned Repository Structure

Root:
- /client: Next.js app
- /server: Express API + Socket.io
- /shared: common types, constants, validation contracts

## Local Setup

### Prerequisites
- Node.js 20+
- npm 10+
- PostgreSQL 15+

### 1) Install dependencies

From repository root:

```bash
npm install
```

### 2) Configure environment variables

Server:
- Copy server/.env.example to server/.env
- Update values as needed

Neon recommended setup for Prisma:
- DATABASE_URL: Neon pooled connection (runtime)
- DIRECT_URL: Neon direct connection (migrations)

Why this matters:
- Prisma with pooled-only URLs can fail on migrations in some setups.
- Using DIRECT_URL avoids those migration issues while keeping pooled runtime performance.

Client:
- Copy client/.env.example to client/.env.local

### 3) Run Prisma migration

```bash
npm run prisma:migrate -w @trustescrow/server
```

### 4) Start development servers

Run both client and server:

```bash
npm run dev
```

Or run separately:

```bash
npm run dev:server
npm run dev:client
```

### 5) Build / type check

```bash
npm run build
npm run typecheck
```

## API Base URL

- Server: http://localhost:4000/api
- Client: http://localhost:3000

## Implemented APIs (Phase 1)

### Auth

- POST /api/auth/register
- POST /api/auth/login

### User Profile

- GET /api/users/me (protected, Bearer token)

### Health

- GET /api/health

## Implemented APIs (Phase 2 + Phase 3 baseline)

### Freelancer Discovery

- GET /api/freelancers?skills=react,node&rating=4

### Projects

- GET /api/projects (protected)
- POST /api/projects (protected, CLIENT only)
- GET /api/projects/:projectId (protected)
- POST /api/projects/:projectId/assign (protected, CLIENT only)

Project create payload:

```json
{
	"title": "Landing page redesign",
	"description": "Need a modern landing page for fintech product...",
	"workType": "STRUCTURED"
}
```

Behavior:
- On project creation, parseRequirements(description) runs.
- Parsed milestones, deliverables, and validation criteria are stored.
- Milestones are auto-created from parser output.

Current parser mode:
- Deterministic fallback parser (MVP-safe).
- Structured to swap with OpenAI integration in upcoming phase.

## Auth Request Examples

Register client:

```json
{
	"name": "Client One",
	"email": "client1@example.com",
	"password": "password123",
	"role": "CLIENT",
	"skills": ["management"],
	"experience": "2 years",
	"portfolio": ["https://portfolio.example/client1"]
}
```

Register freelancer:

```json
{
	"name": "Freelancer One",
	"email": "freelancer1@example.com",
	"password": "password123",
	"role": "FREELANCER",
	"skills": ["react", "node"],
	"experience": "4 years",
	"portfolio": ["https://portfolio.example/freelancer1"]
}
```

Login:

```json
{
	"email": "client1@example.com",
	"password": "password123"
}
```

Success response shape:

```json
{
	"token": "jwt-token",
	"user": {
		"id": "string",
		"name": "string",
		"email": "string",
		"role": "CLIENT | FREELANCER",
		"skills": ["string"],
		"rating": 0,
		"trustScore": 50,
		"experience": "string",
		"portfolio": ["string"]
	}
}
```

Protected profile request header:

```text
Authorization: Bearer <jwt-token>
```

## Core Data Entities

- Users
- Projects
- Milestones
- Messages
- Transactions
- ValidationReports

## End-to-End Demo Flow (Must Work)

1. Client registers.
2. Freelancer registers.
3. Client creates project.
4. AI structures requirements.
5. Client selects freelancer.
6. Chat exchange happens in project room.
7. Freelancer submits work.
8. Validation engine produces report.
9. Hybrid score is calculated.
10. Payment is released or dispute is triggered.

## Visual Frontend Flow (Available Now)

- /dashboard: role-aware overview and project list
- /freelancers: filter and browse freelancer cards
- /projects/create: create project and trigger AI requirement parsing
- /projects/[id]: view parsed requirements, milestones, and assign freelancer

Auth pages:
- /login
- /register

## Frontend UI Architecture (Current)

- Shared shell:
	- App-wide layout uses reusable AppShell with responsive navbar + footer.
	- Role-aware navigation hides client-only actions for freelancers.
- Reusable UI primitives:
	- client/components/ui/primitives.tsx provides Button, Card, Input, Textarea, Select, Pill, and PageIntro.
	- New route updates consume these primitives for consistent spacing, typography, and states.
- Motion and transitions:
	- Route sections use Framer Motion entrance transitions.
	- Global styles include smoother color/background transitions and clearer text contrast.

Polished routes now aligned to shared UI pattern:
- / (landing)
- /login
- /register
- /dashboard
- /freelancers
- /projects/create
- /projects/[id]

## Build Strategy

Execution is phase-based with strict acceptance checks at each phase.

To optimize speed, implementation batches will be grouped by dependency and risk:
- Low-risk linked phases can be done 5-6 steps at a time.
- Medium/high-change phases can be done 2-3 steps at a time.
- Every batch ends with verification before moving forward.

Detailed phase plan is documented in BUILDING_PHASE_PLAN.md.

## Current Status

- Phase 0 foundations are in place:
	- Monorepo workspace configured (client, server, shared).
	- Prisma + PostgreSQL wiring completed.
	- Base Express + Socket.io server running.
- Phase 1 baseline delivered:
	- Functional JWT register/login APIs.
	- Protected /api/users/me route.
	- Next.js login/register pages with Zustand auth state.
- Phase 2 baseline delivered:
	- Freelancer discovery API with skill/rating filters.
	- Visual discovery page wired to real backend.
- Phase 3 baseline delivered:
	- Project creation API with requirement parser service.
	- Milestones auto-generated and persisted.
	- Project detail page with milestone and parser report view.
	- Client-side freelancer assignment flow.