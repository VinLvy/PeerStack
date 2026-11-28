# PeerStack: Agentic Socratic Peer-Mentoring for Introductory Programming Courses

STACK 2026 by GDGoC ITB | Case 1: Smarter Campus and Learning | Team: Mepet Deadline

> **Status (semifinal, 30 November 2026): frontend prototype only.** The app has 11 screens, runs on synthetic data and keeps data in the browser. **AI behavior in the app is simulated.** There is no backend yet. Anything not marked "Built" below is planned.

- Repository: https://github.com/VinLvy/PeerStack (MIT, default branch: `nextjs-prototype`)
- Semifinal video UI branch: `main` (holds the exploratory Vite/React UI mockup shown in the semifinal video; the working Next.js prototype and test evidence live here on `nextjs-prototype`)
- Proposal: Submitted via STACK 2026 semifinal portal (not stored in this repository)

## What PeerStack is

First-semester Informatics students often get stuck debugging programming assignments outside lab hours. PeerStack is planned as a ticket system: a mentee submits a pseudonymous ticket, rules strip sensitive data, an AI role drafts two Socratic hints that withhold the solution, and a credentialed senior approves, edits or rejects the draft before anything reaches the mentee. The pilot targets one course (Algorithms in Java) and a weekly mentor cap of 3 tickets or 2.0 hours.

"Agentic" here means three narrow, prompt-defined AI roles (triage, hinting, integrity check) inside a fixed workflow with human approval. No AI role acts on a mentee on its own.

## Current status

| Component | Status | Check |
|---|---|---|
| Web app (Next.js, 11 screens, mobile-responsive) | Built | Synthetic data, browser storage only |
| Redaction rules (keys, emails, phone and student numbers, paths, names) | Built, runs in the browser | 15 unit tests |
| Integrity guardrail, rule layer | Built | 12 unit tests; caught none of the 5 leaks in Test C |
| Mentor controls (course badge, weekly cap, queue, hour log, CSV export) | Built as frontend demo | Demo only |
| Triage Agent | Simulated | Topic accuracy not tested |
| Socratic Hinting Agent | Simulated in the app | Tested offline in Test C |
| Backend (Supabase: Auth, PostgreSQL, row-level security, pgvector) | Planned, not started | 7 to 16 December |
| Gemini integration, server-side redaction, AI integrity judge | Planned | 7 to 16 December |

Starting and final Final Day versions will be tagged in this repository (`final-day-start` and `final-day-final`), and the semifinal submission snapshot will be tagged (`semifinal-2026-11-30`) upon submission.

## Run locally

Requirements: Node.js (v22 LTS) and npm. **No API key is needed**, because AI steps in the app are simulated.

```bash
npm install
npm run dev
```

Open http://localhost:3000. Run the unit tests with `npm test` (runs `vitest run`).

Demo access: running the prototype locally needs no account. The role switcher and mock sign-in are for demonstration only; production access control is planned through Supabase row-level security.

## Early tests (all on synthetic data)

| Test | What it was | Where |
|---|---|---|
| A. Mentor time | 4 seniors, 1 synthetic bug, writing hints vs reviewing a prepared draft (n = 4) | Held offline by Research Lead (not in repository; summary in Proposal Section 6.1) |
| B. Mentee task | 8 first-semester students, one scripted ticket flow (usability check) | Held offline by Research Lead (not in repository; summary in Proposal Section 6.1) |
| C. Hint and guardrail benchmark | 15 synthetic Java bugs x 2 prompts = 30 Gemini drafts, `gemini-3.5-flash-lite` | `results/testc/` and `scripts/testc/` |

Test C results (leaks = full or partial, labeled blind to prompt version and guardrail verdict by two team members): prompt v1 4 of 15 (1 full, 3 partial); prompt v2 1 of 15 (0 full, 1 partial). The rule-based guardrail passed all 5 leaks and falsely blocked 1 ordinary draft. Early indications only; see Section 6.1 of the proposal for limits.

Files in the Test C folder: the blinded labeling sheet (`results/testc/labeling-run-2026-11-27T10-33-20-336Z.csv`), the summary (`results/testc/summary-2026-11-27T10-57-27-889Z.json`), the run file mapping each draft to prompt v1 or v2 (`results/testc/run-2026-11-27T10-33-20-336Z.json`), and the script (`scripts/testc/benchmark_gemini_v2.mjs`).

To re-run Test C you need your own Gemini API key in `.env.local` (listed in `.gitignore`, never committed). Use synthetic data only; the free tier may use content to improve Google products.

## Known limitations

- Backend, persistence and live Gemini calls are not implemented. Data live in the browser only.
- The rule-based guardrail does not detect a fix described in words. An AI judgment layer is planned, and the mentor is the final gate.
- Redaction in the prototype runs client-side for demonstration. Production will re-run it on the server.
- Survey data (n = 44, one program, convenience sample) and all tests are early indications, not evidence of improved grades.
- Tickets and drafts for any future pilot are planned to be deleted 30 days after Final Day (15 January 2027).

## Disclosure of AI assistance

| Where | Tool | Role |
|---|---|---|
| Product (planned) | Google Gemini API | Triage, Socratic hint drafting, integrity check. A human mentor approves everything the mentee sees. Not active in the semifinal prototype. |
| Testing | Google Gemini API | Drafted hints in Test C, synthetic data only. |
| Testing | Claude (Anthropic) | Helped draft the Test C script; reviewed by the team. |
| Writing | Claude (Anthropic) | Helped draft and edit the abstract and proposal from the team's survey and references. |
| Coding | Antigravity (AI coding IDE) | Code generation, refactoring, debugging, and Test C tooling support in milestones M1 to M5. Per-milestone log: `AI_USAGE.md`. |
| Video UI mockup (branch `main`) | Google AI Studio | Generated the exploratory Vite/React UI mockup (`src/`, `design/`) on branch `main` shown in the semifinal video; not part of the Next.js prototype on `nextjs-prototype`. |

The team reviews, tests and corrects all AI output.

## Third-party resources

Next.js, React, Tailwind CSS, Monaco Editor and @monaco-editor/react, Vitest (MIT); TypeScript (Apache-2.0); lucide-react (ISC). Versions are pinned in `package.json`. A license scan of production dependencies on 27 November 2026 found 32 packages under permissive or weak-copyleft terms. Supabase (planned backend) and the Google Gemini API are used under their public terms. The topic list, synthetic bug set and demonstration data were written by the team. Details: Section 7.3 of the proposal.

## Team and contributions

| Member | Done so far | Planned |
|---|---|---|
| Davin Putra Fibrian (Team Leader) | Technical design, redaction rules and guardrail rules, prototype build, Test C benchmark | Gemini integration, Supabase backend, AI judgment layer |
| Alvin Widiantara | Screen UX and user-flow design, README, video script | Semifinal video, Final Day demo, usability fixes |
| Muhammad Farid Firdaus | Survey design and fieldwork (n = 44), Tests A and B | Usability sessions, pilot recruitment and data |

Universitas Bhinneka PGRI, Tulungagung.

## License

MIT. See `LICENSE`.