# TrustEscrow AI - Building Phase Plan

We will execute in strict, testable phases with acceptance checks.

## Phase 0: Foundation and monorepo setup

- Create workspace structure and shared TypeScript config.
- Configure Prisma and PostgreSQL connection.
- Configure lint, format, env templates, and scripts.
- Add initial README sections: architecture, local setup, run commands.

Verification:
- Install succeeds.
- Typecheck passes for all packages.
- Prisma connects and migration runs.

## Phase 1: Auth and user profiles

- Implement register/login with JWT.
- Add password hashing and auth middleware.
- Implement profile fields: skills, rating, trustScore, experience, portfolio.
- Build frontend auth screens and session store with Zustand.
- README update: auth endpoints and sample requests.

Verification:
- Client and freelancer registration works.
- Login returns JWT.
- Protected route rejects invalid token and accepts valid token.

## Phase 2: Freelancer discovery

- Build GET /freelancers with skills and rating filters.
- Build search page with filter controls and freelancer cards.
- Include trustScore and profile details in UI.
- README update: filter query examples.

Verification:
- Filter by skills returns correct subset.
- Filter by rating threshold works.
- UI reflects backend filtering correctly.

## Phase 3: Project creation + AI requirement parser

- Build project creation API with raw description.
- Implement parseRequirements service.
- Integrate OpenAI with safe fallback mock mode.
- Persist AI output as milestones and criteria.
- Build create-project frontend flow.
- README update: AI parser behavior and response schema.

Verification:
- Raw vague prompt creates structured milestones.
- Deliverables and criteria are saved.
- Project appears in dashboard.

## Phase 4: Milestones and escrow wallet simulation

- Add walletBalance to users.
- Implement deposit, lock, release transactions.
- Enforce milestone funding flow.
- Add project detail UI for milestone states and payment state.
- README update: transaction types and escrow lifecycle.

Verification:
- Deposit changes wallet balance.
- Funding locks amount.
- Invalid funding operations are blocked.

## Phase 5: Real-time chat with project scoping

- Integrate Socket.io on server and Next.js client.
- Implement project-room based 1-to-1 chat.
- Persist text and file URL messages.
- Build chat page with real-time updates.
- README update: socket events and chat API fallback.

Verification:
- Two users exchange messages in real time.
- Reload retains message history.
- Messages stay isolated per project room.

## Phase 6: Submission, pre-approval lock, and validation engine

- Add draft and final submission flow.
- Add draftApproved boolean and enforcement logic.
- Implement structured and creative validation modes.
- Save validation reports with score components.
- README update: validation payloads and report schema.

Verification:
- Draft submission can be approved by client.
- Final submission enforces lock rules.
- Validation returns structured report for both work types.

## Phase 7: Hybrid scoring and automated decision

- Implement final score calculator with strict weights.
- Add release or dispute branching with threshold 70.
- Integrate timeliness and revision metrics.
- Update trust scores and dispute history impact.
- README update: scoring formula and decision matrix.

Verification:
- Controlled test data produces expected score.
- Score at least 70 releases payment.
- Score below 70 creates dispute with explanation.

## Phase 8: Dashboard and end-to-end polish

- Finalize role-based dashboard views.
- Add Framer Motion transitions.
- Improve minimal modern UI consistency with shadcn.
- Add validation report page and payment timeline clarity.
- README update: demo walkthrough and screenshots placeholders.

Verification:
- Full demo flow works from registration to release/dispute.
- No broken route in primary flow.
- Basic responsive behavior works on desktop and mobile.

## Phase 9: Stability and test pass

- Add integration tests for core APIs.
- Add smoke test script for demo flow.
- Fix defects from test runs.
- Final README pass with known limitations and next steps.

Verification:
- Test suite passes.
- Manual demo checklist passes.
- Build and run commands validated from clean install.

## Execution Cadence Agreement

To avoid slow progress from one-step-only iteration:

- We will execute in batches of 5-6 steps when change risk is manageable.
- If a batch has high complexity or deeper refactors, we will use 2-3 step batches.
- After each batch, both of us verify API behavior, UI flow, and data persistence before continuing.
- README will be updated side by side during every batch.
