# PeerStack Architecture & Design Decisions

This document logs technical choices, pinned dependency versions, and scope decisions made during the STACK 2026 Semifinal Frontend Prototype build.

## Pinned Package Versions (Milestone M1)

All dependencies are pinned to exact versions in `package.json` for reproducible `npm install && npm run dev` execution without external API keys:

- `next`: `16.4.6` (meets >= 16.4.5 security release requirement)
- `react`: `19.3.1`
- `react-dom`: `19.3.1`
- `lucide-react`: `1.81.0`
- `@monaco-editor/react`: `4.7.0`
- `monaco-editor`: `0.58.0` (satisfies `@monaco-editor/react` peer dependency)
- `tailwindcss`: `4.3.5`
- `@tailwindcss/postcss`: `4.3.5`
- `typescript`: `7.0.2`
- `vitest`: `5.1.2`

## Milestone M1 Decisions

1. **Frontend-only state with future-proof schema:** `DemoStoreProvider` stores synthetic seed data and session actions in React Context synced to `localStorage` (`peerstack_demo_store_v1`). TypeScript interfaces in `lib/types.ts` use `snake_case` field names (`mentee_id`, `course_id`, `topic_id`, `description_sanitized`, `code_sanitized`, `error_log_sanitized`, `status`, `arm`, `claimed_at`, `delivered_at`, `is_synthetic`, `hint_1`, `hint_2`) to keep Final Phase Supabase wiring clean.
2. **Hydration safety:** Initial render uses deterministic `createInitialDemoState()`. Browser `localStorage` reads happen only inside `useEffect`, and all reads/writes are wrapped in `try/catch`.
3. **Visual guidelines:** Since `DESIGN.md` is not present in the repository, Tailwind CSS v4 `@theme` tokens and component styles follow Section 6 of `PeerStack_Frontend_PRD.md` (Light Mode `#F8FAFC` background, `#FFFFFF` cards, `#E2E8F0` borders, `#0F172A` text/code contrast, minimum 14px-15px body/code sizes for 1080p video readability).
4. **Zero-friction demo navigation + consent flow:** Quick-entry cards on `/` and the persistent top-bar Demo Role Switcher allow instant 1-click role switching during the 2-minute demo, while `/login` and `/consent` demonstrate the participant onboarding and 3-checkbox consent flow.
5. **Admin Metrics M1-M8 mapping:** Because `PeerStack_Frontend_PRD.md` specifies M1 (Assisted vs Manual arm comparison) and leaves M2-M8 labels open for the proposal, `/admin/metrics` will map M1-M8 to core PeerStack pilot indicators (Review Time Comparison, Unblocked Rate, Clarity Rating, Guardrail Interceptions, Redaction Coverage, Weekly Cap Compliance, Draft Disposition, and Resolution Throughput), clearly badged `Simulated Pilot Data`.

## Milestone M2 Decisions

1. **Regex redaction ordering (`lib/redact.ts`):** Google API keys (`AIza...`) and explicit secret assignments run before standalone 8-10 digit campus ID matching, and Indonesian phone numbers (`+62`/`08`) also run before standalone numeric IDs so embedded digits inside API keys or phone numbers are never double-redacted or corrupted. Non-`java.*`/`javax.*` stack trace packages are replaced with `[REDACTED_PACKAGE]` while preserving class, method, file, and line info.
2. **Monaco Editor SSR safety & fallback (`components/java-code-editor.tsx`):** `@monaco-editor/react` (`4.7.0`) is loaded inside a `"use client"` component via `next/dynamic(..., { ssr: false })` with `language="java"` and `vs-dark` theme, plus an instant dark line-numbered fallback toggle for offline/restricted browser environments.
3. **Simulated pipeline transparency (`lib/mock-ai.ts`, `components/pipeline-stepper.tsx`):** Step 1 runs real `redact()` and Step 4 runs real `checkGuardrail()`, while Triage and Socratic Hinting are explicitly badged `Simulated`. A `"Skip Animation"` button allows fast verification without waiting 2.5 seconds.

## Milestone M3 Decisions

1. **Vitest ESM config (`vitest.config.mjs`):** Replaced `vitest.config.ts` with `vitest.config.mjs` to avoid Vite native ESM config warnings.
2. **Real-time Guardrail #2 evaluation (`app/mentor/tickets/[id]/page.tsx`):** Runs `checkGuardrail()` live while editing hints and again on submit. Includes a 1-click `"Test Guardrail (Paste Full Solution)"` button plus `"Restore Draft"` so the 2-minute demo can showcase a block and recover seamlessly.
3. **Weekly Cap accounting (`components/demo-store-provider.tsx`):** Counts all tickets with `claimed_by === mentor.id` (claimed/in-review, delivered, or closed) toward `MENTOR_WEEKLY_TICKET_CAP = 3`, allowing mentors to finish tickets they already claimed while disabling `"Claim & Review"` on new unclaimed tickets once the cap is reached.
4. **Minute-accurate Hour Log visibility (`app/mentor/hours/page.tsx`):** Displays hours to 2 decimal places (`totalMinutes / 60`) alongside raw minutes so short demo reviews visibly increment the verified hour counter without fabricating review time.

## Milestone M4 Decisions

1. **Follow-up sanitization (`app/mentee/tickets/[id]/page.tsx`):** Even though the 1-round follow-up is simulated (`0/1 used`), submitted follow-up text still passes through `redact()` before saving to local state.
2. **Live Synthetic Filter (`app/admin/metrics/page.tsx`):** Pre-seeded tickets (`#T-101`, `#T-102`, `#T-103`) carry `is_synthetic: true`, while tickets created during the interactive session carry `is_synthetic: false`, making the `"Include Synthetic Seed Data"` toggle reflect real session activity immediately.
3. **Mobile responsiveness & 1080p readability:** Kept minimum 14px-15px typography, `#0F172A`/`vs-dark` code blocks, and responsive stacking (`grid-cols-1 md:grid-cols-2`) below `768px`.
