# AI Usage & Attribution Log

This file records AI-assisted implementation work per milestone for transparency in STACK 2026 judging.

## Milestone M1 (Antigravity-Assisted)

- Generated initial project configuration: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `vitest.config.ts`, `app/globals.css`.
- Generated core types and synthetic seed data: `lib/types.ts`, `lib/mock-data.ts`.
- Generated state provider and global chrome: `components/demo-store-provider.tsx`, `components/app-shell.tsx`, `app/layout.tsx`.
- Generated entry and consent pages: `app/page.tsx`, `app/login/page.tsx`, `app/consent/page.tsx`.
- Note: All simulated labels, sample Java tickets, and seed metrics are synthetic and run locally without external API calls.

## Milestone M2 (Antigravity-Assisted)

- Implemented real deterministic redaction and unit tests: `lib/redact.ts`, `lib/__tests__/redact.test.ts`.
- Implemented real deterministic guardrail helper required by pipeline Step 4: `lib/guardrail.ts`.
- Implemented simulated agentic pipeline: `lib/mock-ai.ts`.
- Implemented Java Monaco editor wrapper and 5-step pipeline visualization: `components/java-code-editor.tsx`, `components/pipeline-stepper.tsx`.
- Implemented Mentee ticket submission and ticket list routes: `app/mentee/new/page.tsx`, `app/mentee/tickets/page.tsx`.

## Milestone M3 (Antigravity-Assisted)

- Switched Vitest config to `vitest.config.mjs` and added Guardrail #1/#2 unit tests in `lib/__tests__/guardrail.test.ts` (12 test cases).
- Implemented Mentor Queue with Weekly Cap lock: `app/mentor/queue/page.tsx`.
- Implemented 2-column Mentor Review Workspace with live review timer, Guardrail #2 test helper, Approve/Edit/Reject flow: `app/mentor/tickets/[id]/page.tsx`.
- Implemented Verified Hour Log and client-side CSV export: `app/mentor/hours/page.tsx`.

## Milestone M4 (Antigravity-Assisted)

- Implemented Mentee ticket detail, expandable Hint 2, simulated 1-round follow-up, and Clarity/Unblocked rating page: `app/mentee/tickets/[id]/page.tsx`.
- Implemented Admin Credential verification queue: `app/admin/credentials/page.tsx`.
- Implemented Admin Pilot Metrics M1-M8 live dashboard with synthetic data toggle: `app/admin/metrics/page.tsx`.
- Updated `README.md`, `DECISIONS.md`, and `AI_USAGE.md` with known limitations and milestone attribution.
- Expanded `README.md` into a full project, architecture, route, guardrail/redaction, metrics, and proposal-sync reference.

## Milestone M5 (Test C tooling)

- Added the offline Test C benchmark script (`scripts/testc/benchmark_gemini_v2.mjs`), drafted with Claude (Anthropic) and reviewed by the team.
- Antigravity assisted with the rule-by-rule guardrail comparison (`lib/guardrail.ts` vs `scripts/testc/benchmark_gemini_v2.mjs`), `package.json` npm scripts and MIT license metadata, `.gitignore` rules, and Test C documentation in `README.md` and `AI_USAGE.md`.
- Files touched: `scripts/testc/benchmark_gemini_v2.mjs`, `package.json`, `.gitignore`, `README.md`, `AI_USAGE.md`.
