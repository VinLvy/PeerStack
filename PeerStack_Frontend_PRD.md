# PeerStack Semifinal Frontend Prototype PRD (v1.1, UI + Mock State, reviewed)

Project: PeerStack: Agentic Socratic Peer-Mentoring for Introductory Programming Courses
Competition: STACK 2026 by GDGoC ITB, Case 1 (Smarter Campus and Learning)
Team: Mepet Deadline (Universitas Bhinneka PGRI - Informatics)
Target Stage: Semifinal Interactive Prototype (No live backend/database required per STACK 2026 Semifinal FAQ)
Audience of this file: The coding agent (Antigravity) and the developer (Alvin / Davin). Read the entire file before writing any code.

---

## 0. Agent Operating Rules (Read First)

1. **Scope discipline:** This is a **frontend-only interactive prototype** for the Semifinal Round. Do NOT install or configure Supabase, PostgreSQL, or the Google Gemini SDK yet. All persistence uses React Context + `localStorage` with synthetic seed data.
2. **Build in milestone order (Section 7).** Finish and verify one milestone before starting the next.
3. **English UI only:** All labels, buttons, placeholders, sample tickets, and hints must be in clear, natural English (required by STACK 2026 rules and for the 2-minute English video).
4. **Honesty & Demo Mode:** Every page MUST display the prototype banner (Section 5.1). Never present simulated AI responses or synthetic metrics as live production data.
5. **Real client-side deterministic rules:** Do NOT fake the redaction or the basic guardrail. Implement real regex redaction (`lib/redact.ts`) and real deterministic guardrail checks (`lib/guardrail.ts`) in the browser so live typing during the video demo works genuinely.
6. **Future-proof data shapes:** Keep TypeScript types aligned with the planned Final Phase schema (Mentee, Mentor, Admin, Tickets, Drafts, Messages, Ratings, Hour Logs) so backend wiring in December is clean.
7. **Design consistency:** If `DESIGN.md` exists in the repo, follow it strictly. If `DESIGN.md` is not present, follow the Visual Guidelines in Section 6.
8. **AI disclosure log:** Maintain `AI_USAGE.md` and `DECISIONS.md`. After each milestone, append which files were generated/assisted by Antigravity and any design choices made.
9. **Plain ASCII punctuation:** Use plain ASCII punctuation in code, comments, and UI copy. Avoid em dashes or smart quotes.
10. **Ownership:** Alvin owns the screens, visual design, mock state and README. Davin owns and reviews `lib/redact.ts`, `lib/guardrail.ts` and their tests, because the team must be able to explain this logic to judges. Do not rewrite those two files without Davin's review.
11. **Hydration safety:** Read `localStorage` only in `useEffect` (client side) so the first render matches the server render. Wrap every `localStorage` read and write in `try/catch`. Components that use `next/dynamic` with `ssr: false` must be Client Components.
12. **Honest labels:** Anything simulated (AI steps, similar-ticket suggestion, follow-up reply, pilot metrics) must carry a visible `Simulated` label. Nothing may imply a live backend, a live AI call, or real student data.

---

## 1. Product Summary & Semifinal Goal

PeerStack is a mobile-responsive web application for introductory programming courses (pilot course: **Algorithms**, using **Java** as the programming language for student assignments).

When a first-semester student (Mentee) gets stuck debugging Java code outside lab hours, they submit a pseudonymous help ticket (code snippet, error log, and "what I already tried"). Automated steps remove sensitive strings (redaction), isolate the bug (Triage), draft two Socratic hints without giving away the full solution (Socratic Hinting), and check for solution leaks (Integrity Guardrail #1). A senior student with a verified high grade (Peer Mentor) reviews, edits, or rejects the draft within a capped weekly workload. Any mentor edit is re-checked by Integrity Guardrail #2 before delivery. The Mentee receives the hints, rates clarity, and marks whether they are unblocked.

### What This Prototype Must Demonstrate (for the 2-Minute Semifinal Video)
- **Complete visual user journey:** Mentee submits a Java ticket -> Redaction & Agentic pipeline runs -> Mentor reviews, tests the Guardrail block, approves/sends -> Mentee receives hints & rates -> Mentor checks Verified Hour Log -> Supervisor views aggregate metrics & credential queue.
- **Zero-friction demo switching:** A persistent top-bar **Demo Role Switcher** (`Mentee` | `Mentor` | `Admin`) and a **Reset Demo Data** button so the presenter can record the 2-minute video smoothly in one take.

---

## 2. Tech Stack (Frontend-Only Semifinal)

- **Framework:** Next.js 16 (App Router), React 19, TypeScript (strict mode).
- **Styling:** Tailwind CSS v4 (CSS-first `@theme` config).
- **Code Editor:** `@monaco-editor/react` configured with `language="java"` (editable for Mentee, read-only with highlighted failing lines for Mentor).
  - *Fallback rule:* If `@monaco-editor/react` has a React 19 peer-dependency conflict or SSR issue, load it via `next/dynamic(..., { ssr: false })` or use a clean dark-themed code editor fallback with line numbers, and log the choice in `DECISIONS.md`.
- **Icons:** `lucide-react`.
- **State & Storage:** React Context (`DemoStoreProvider`) synced to `localStorage` with instant reset to seed data.
- **No external API keys required:** App must run out of the box with `npm install && npm run dev`.
- **Tests:** `vitest` for `lib/redact.ts` and `lib/guardrail.ts` (`npm test`). Use the latest stable versions of all packages, pin the installed versions, and record them in `DECISIONS.md`. Next.js must be 16.4.5 or newer (security release of 3 Nov 2026); check with `npm ls next`.

---

## 3. Data Shapes & Synthetic Seed Data (`lib/mock-data.ts`)

### 3.1 Course & Topics (Java)
- **Course:** `Algorithms (Java)` (`code: "IF101"`, `language: "java"`)
- **Topics:**
  1. `Recursion` - "Base case, recursive step, call stack, preventing StackOverflowError."
  2. `Loops` - "for, while, do-while loop bounds, off-by-one errors, infinite loops."
  3. `Arrays` - "0-based indexing, array.length, ArrayIndexOutOfBoundsException."
  4. `Sorting` - "Bubble sort, selection sort, insertion sort, swap logic, loop boundaries."
  5. `Searching` - "Linear search, binary search mid-point calculation, loop termination."
  6. `Basic Complexity` - "Nested loop growth, O(1), O(n), O(n^2) time intuition."

### 3.2 Demo Users (Pre-seeded)
- **Mentee:** `Student #A42` (Pseudonym shown to mentors: `Mentee-A42`, Semester 1, Consent: toggleable for demo).
- **Mentor:** `Raka Pratama` (fictional persona, Semester 5, Verified Badge: `Algorithms - Grade A`, Weekly Cap: `3 tickets/week`, Current Week Load: `1 / 3 tickets`, Logged Time: `0.4 / 2.0 hrs`).
- **Admin / Course Supervisor:** `Supervisor (Demo)` (Course Supervisor, Informatics; fictional persona, not a real person).

### 3.3 Hero Synthetic Ticket (Pre-filled option on Mentee Form + Seeded Queue)
Provide a one-click **"Load Sample Java Bug"** button on `/mentee/new` so the presenter does not have to type during the video. Clicking it fills:
- **Topic:** `Recursion`
- **Code (Java) - intentionally contains fake sensitive data to demo Redaction:**
```java
// Author: Budi Santoso | NIM: 24010099 | Email: budi.demo@example.com
// Debug key: AIzaSyFakeKeyForDemo1234567890123456789
public class FactorialDemo {
    public static int factorial(int n) {
        return n * factorial(n - 1);
    }

    public static void main(String[] args) {
        System.out.println(factorial(5));
    }
}
```
- **Error Log:**
```text
Exception in thread "main" java.lang.StackOverflowError
    at FactorialDemo.factorial(FactorialDemo.java:5)
    at FactorialDemo.factorial(FactorialDemo.java:5)
    at FactorialDemo.factorial(FactorialDemo.java:5)
```
- **What I already tried:**
  `"I tried changing int to long because I thought 5! was too large, and checked my syntax, but it still throws a StackOverflowError immediately when I run it."`

### 3.4 Additional Seeded Tickets (for a Realistic Queue & History)
Include 3 pre-seeded tickets in `lib/mock-data.ts`:
1. **Ticket #T-101 (`pending_review`, `assisted` arm):** Topic `Arrays` - `ArrayIndexOutOfBoundsException` in a `for (int i = 0; i <= arr.length; i++)` Java loop. Has AI draft ready (`Guardrail #1: Passed`).
2. **Ticket #T-102 (`pending_review`, `manual` arm):** Topic `Sorting` - Bubble sort not swapping properly in Java. Demonstrates the **Manual Arm** (no AI draft shown, for validation metric M1 comparison).
3. **Ticket #T-103 (`closed`, `assisted` arm):** Topic `Loops` - Already reviewed and delivered to `Mentee-A42`, rated `5/5 Clarity` and `Yes, unblocked`, contributing to Mentor's Hour Log and Admin Metrics.

---

## 4. Client-Side Logic (Real Rules + Simulated AI)

### 4.1 Real Deterministic Redaction (`lib/redact.ts`)
Must actually run on any text submitted by the Mentee before displaying the sanitized ticket. Return `{ sanitizedText, redactionsCount, redactedTypes }`:
- Emails -> `[REDACTED_EMAIL]`
- Student IDs / NIM (e.g., `NIM:\s*\d{6,12}` or 8-10 digit campus ID patterns) -> `[REDACTED_STUDENT_ID]`
- Author/Name comments (e.g., `Author:\s*[A-Za-z ]+`) -> `Author: [REDACTED_NAME]`
- Phone numbers (`+62...`, `08...`) -> `[REDACTED_PHONE]`
- Google API keys (`AIza[0-9A-Za-z_\-]{20,}`) -> `[REDACTED_API_KEY]`
- Assignments like `(api[_-]?key|secret|token|password)\s*[:=]\s*\S+` -> `$1=[REDACTED_SECRET]`
- File paths (`/home/<user>/`, `/Users/<user>/`, `C:\Users\<user>\`) -> `[REDACTED_PATH]`
- Java stack traces: keep `java.*` and `javax.*` frames, the class name, method, file name and line number; replace any other package prefix with `[REDACTED_PACKAGE]` (student or university names can hide in package names).
- Required tests (`vitest`): at least 15 cases, including fake keys, mixed text, and ordinary Java code that must stay unchanged.

### 4.2 Real Deterministic Integrity Guardrail (`lib/guardrail.ts`)
Must actually run on **both** the simulated AI draft and any text the Mentor edits/writes before sending. Return `{ verdict: 'pass' | 'flag' | 'block', reason: string }`:
- **`block`** if the text contains:
  - A fenced code block (` ``` `)
  - A full Java method signature with body (e.g., regex matching `(public|private|protected)?\s*(static)?\s*(int|void|long|double|boolean|String)\s+\w+\s*\([^)]*\)\s*\{`)
  - A complete `if (...) return ...;` solution statement combined with a recursive/loop return (e.g., `if\s*\(\s*n\s*<=\s*[01]\s*\)\s*return\s*1`)
  - More than 2 lines containing semicolons `;` (indicative of multi-line replacement code).
- **`flag`** if the text contains 2 or more inline code spans (`` `...` ``) longer than 35 characters.
- **`pass`** otherwise.
- **Honesty note:** these are heuristics, not proof of safety. The `if (n <= 1) return 1` pattern is a demo-specific example, so add one or two more generic patterns and write the known limits in `README.md` ("rule-based guardrail, not guaranteed to catch every leak; the mentor remains the final gate"). Required tests: at least 12 cases covering block, flag and pass, including a legitimate Socratic hint that must pass.
- **UI Behavior:**
  - If `block`: Disable/reject sending, show a clear red alert banner explaining why it was blocked, and prompt the mentor to revise into a Socratic hint.
  - If `flag`: Show an amber warning banner and require the mentor to tick `"I confirm this does not give away the full solution"` before sending.

### 4.3 Simulated Agentic Pipeline (`lib/mock-ai.ts`)
When Mentee submits a ticket, show an interactive **Pipeline Progress Stepper** (~2.5 seconds total, or instant-skip button for fast testing):
1. **Step 1 - Deterministic Redaction (No AI):** Runs real `redact()` and shows exact count (e.g., `"3 sensitive items removed before AI call"`).
2. **Step 2 - Triage Agent (Simulated):** Identifies topic, highlights failing lines (e.g., lines 4-6 for `FactorialDemo`), and notes `"1 similar past ticket found"`.
3. **Step 3 - Socratic Hinting Agent (Simulated):** Generates two syllabus-aligned hints:
   - *For Recursion / FactorialDemo:*
     - **Hint 1 (Guiding Question):** `"Trace factorial(5) step by step on paper: what values of n get passed into factorial(n - 1) after n reaches 1 and 0? When does the method stop calling itself?"`
     - **Hint 2 (Specific Pointer):** `"Look closely at lines 4-6. Every recursive method in our Algorithms syllabus needs a stopping condition (base case) before making the recursive call. What should factorial(0) or factorial(1) return?"`
   - *For any other custom Java input:* Generate sensible generic Socratic hints tailored to the selected topic (`Loops`, `Arrays`, `Sorting`, `Searching`, `Basic Complexity`).
4. **Step 4 - Integrity Guardrail #1:** Runs real `checkGuardrail()` on the draft (`Passed - 0 full solutions detected`).
5. **Step 5 - Routed to Mentor Queue:** Ticket status becomes `pending_review`. Show CTA button: `"Switch to Mentor View to Review This Ticket ->"`.

### 4.4 Weekly Cap Logic
- Default `MENTOR_WEEKLY_TICKET_CAP = 3`.
- Count tickets claimed by the mentor in the current session/seed.
- When `claimedCount >= 3`, disable the `"Claim Ticket"` button on `/mentor/queue` and display an info banner: `"Weekly cap reached (3/3 tickets). Queue paused to prevent mentor burnout."`

---

## 5. Routes & Screen Specifications (App Router)

### 5.1 Global Chrome (Visible on Every Page)
1. **Prototype Honesty Banner (Top slim bar):**
   - Text: `"Interactive Frontend Prototype for STACK 2026 Semifinal | Simulated AI & Synthetic Data | Live Backend Planned for Final Round"`
2. **Navigation Header + Demo Role Switcher:**
   - Brand logo: **PeerStack**
   - Role-specific nav links (e.g., Mentee: `New Ticket`, `My Tickets`; Mentor: `Ticket Queue`, `My Hours`; Admin: `Credentials`, `Pilot Metrics`).
   - Right side: Compact **Demo Role Switcher** (`Mentee` | `Mentor` | `Admin`) + subtle `Reset Demo` icon button.

### 5.2 Screens

| Route | Role | Key UI Elements & Interactions |
|---|---|---|
| `/` | All | Clean landing screen with PeerStack value prop and 3 quick-entry role cards (`Enter as Mentee`, `Enter as Peer Mentor`, `Enter as Course Supervisor`). |
| `/login` | All | Simple mock sign-in form (shows pre-filled demo credentials; clicking Sign In routes to `/consent` or role home). |
| `/consent` | Mentee/Mentor | Required checkboxes: (1) 18+ age confirmation, (2) Pseudonymous visibility & supervisor abuse-override policy, (3) Redacted code processed by AI (Google Gemini API in production) and 30-day retention policy. The consent screen must state that in this prototype no data leaves the browser. Button `"Accept & Continue"` unlocks dashboard. |
| `/mentee/new` | Mentee | Header showing `"Pseudonym: Mentee-A42"`. Course locked to `Algorithms (Java)`. Topic dropdown. Button `"Load Sample Java Bug"`. Monaco Editor (`language="java"`). Error Log textarea. Required `"What I already tried"` textarea (min 20 chars). Submit button triggers the **Agentic Pipeline Stepper** modal/view before routing to `/mentee/tickets/[id]`. |
| `/mentee/tickets` | Mentee | List of own tickets with status chips (`Pending Review`, `Hints Delivered`, `Closed`). |
| `/mentee/tickets/[id]` | Mentee | Shows sanitized ticket summary, pipeline status, and when delivered: **Hint 1** visible + **Hint 2** inside an expandable `"Need a closer pointer?"` card. Includes optional 1-round follow-up box (marked `0/1 used`, simulated, no real reply), **Clarity Rating (1-5 stars)**, and **Unblocked Status** (`Yes, unblocked` / `Partly` / `No, still stuck`). |
| `/mentor/queue` | Mentor | Profile bar with green badge `Verified Mentor: Algorithms (Grade A)`. **Weekly Cap Widget** (`1 / 3 Tickets` & `0.4 / 2.0 hrs`). List of open tickets showing pseudonym, topic, age, `AI Draft Ready` or `Manual Arm` badge, and `"Claim & Review"` button. |
| `/mentor/tickets/[id]` | Mentor | **2-column workspace (Key Demo Screen):** Left column = Sanitized Ticket (Redaction badge showing stripped items, read-only Java Monaco Editor with failing lines highlighted, Error Log, "What I already tried", collapsible "Similar Past Ticket" labeled Simulated). Right column = Live Review Timer (`00:45`), Triage Summary, editable Hint 1 & Hint 2 fields (for `assisted` arm) or blank editor (for `manual` arm), a helper button `"Test Guardrail (Paste Full Solution)"` (optional convenience for demo), and action buttons: `Approve & Send`, `Save Edits & Send`, `Reject Draft & Write Own` (requires reason). Runs **Integrity Guardrail #2** on submit! |
| `/mentor/hours` | Mentor | Summary cards (`Total Verified Hours`, `Tickets Resolved`, `Avg. Clarity Rating`). Table of reviewed tickets (Date, Topic, Review Minutes, Action, Rating). Button `"Export Verification Record (CSV)"` (triggers a real client-side CSV download) with honest label: `"Planned incentive format - subject to Study Program SKPI/certificate approval"`. |
| `/admin/credentials` | Admin | Table of pending/verified senior mentors (Name, Semester, Course, Grade `A`/`AB`, Academic Integrity status) with working `Verify Badge` / `Reject` buttons. |
| `/admin/metrics` | Admin | Displays Metrics **M1 to M8** in clean cards and tables (clearly badged `Simulated Pilot Data`, updates live when new demo tickets are reviewed and rated!). Includes a toggle `"Include Synthetic Seed Data"`. |

---

## 6. Visual & UX Guidelines (Fallback if `DESIGN.md` is Absent)

- **Theme:** Clean, calm academic Light Mode (`#F8FAFC` page background, `#FFFFFF` cards, `#E2E8F0` borders, `#0F172A` primary text).
- **Code Blocks / Monaco:** Dark Slate theme (`#0F172A` / `vs-dark`) for strong visual contrast on 1080p video.
- **Semantic Colors (aligned with Proposal Figure 1):**
  - User Action / Primary CTA: Indigo/Blue (`#2563EB`)
  - AI Agent Steps / Drafts: Soft Blue (`#EFF6FF` bg, `#1D4ED8` border/text)
  - Human Mentor / Verified Badge / Pass: Emerald (`#059669`)
  - Integrity Guardrail Block: Rose/Red (`#DC2626`)
  - Warning / Flag / Mentee Highlight: Amber (`#D97706`)
  - Deterministic Redaction / Neutral: Slate (`#64748B`)
- **Video Readability (1080p):** Minimum `14px` body and code font size. Generous whitespace. No cluttered sidebars.
- **Mobile Responsive:** Stack 2-column layouts to 1 column on screens `< 768px`.

---

## 7. Build Order (Target: 26-28 Nov 2026)

| Milestone | Target | Deliverable & Done Criteria |
|---|---|---|
| **M1** | 26 Nov | Initialize Next.js 16 + Tailwind v4 + `lucide-react` + `@monaco-editor/react`. Build Global Layout (Prototype Banner + Nav + Demo Role Switcher + Reset Demo), `DemoStoreProvider` with `localStorage`, and `lib/mock-data.ts` (Java tickets). Build `/`, `/login`, and `/consent`. |
| **M2** | 26 Nov | Build real `lib/redact.ts` and `lib/mock-ai.ts`. Build `/mentee/new` (with `"Load Sample Java Bug"` button, Java Monaco Editor, required "what I tried" field, and the 5-step Agentic Pipeline visualization) and `/mentee/tickets`. |
| **M3** | 27 Nov | Build real `lib/guardrail.ts`. Build `/mentor/queue` (with Verified Badge & Weekly Cap), `/mentor/tickets/[id]` (2-column workspace, live review timer, Approve/Edit/Reject, Guardrail #2 block/pass flow), and `/mentor/hours` (with client-side CSV export). |
| **M4** | 27-28 Nov | Build `/mentee/tickets/[id]` (expandable Hint 2, 1-round follow-up, 1-5 rating, unblocked status), `/admin/credentials`, and `/admin/metrics` (live-updating M1-M8 tables). Mobile responsiveness pass, clean `README.md`, `DECISIONS.md`, and `AI_USAGE.md`. |
| **Video & Submit** | 29-30 Nov | Full 2-minute English video rehearsal & 1080p screen recording (Alvin), Proposal sync (Davin updates the Development Plan status in the proposal and attaches prototype screenshots, labeled as a prototype), final submission before 30 Nov 23:59 WIB. |


**Cut order if time runs short (today is 26 Nov, M1 and M2 share a day):** 1) `/` landing page (go straight to `/login`), 2) follow-up box, 3) "Similar Past Ticket", 4) CSV export, 5) `/login` (use the role switcher only). Never cut: `/mentee/new` with Load Sample Java Bug, the pipeline stepper, `/mentor/tickets/[id]` with Guardrail #2, delivery to the mentee, rating, and `/admin/metrics`.

---

## 8. Acceptance Criteria (Video-Ready Checklist)

- [ ] **AC1:** `npm run dev` starts cleanly with zero env vars or API keys required.
- [ ] **AC2:** Prototype banner is visible on every page; Role Switcher and Reset Demo work reliably.
- [ ] **AC3:** On `/mentee/new`, clicking `"Load Sample Java Bug"` and submitting strips the fake name, NIM, email, and API key via real regex redaction; none of those strings appear in the Mentor view.
- [ ] **AC4:** The 5-step Agentic Pipeline visually shows Redaction -> Triage -> Socratic Hints -> Guardrail #1 -> Routed to Mentor.
- [ ] **AC5:** On `/mentor/tickets/[id]`, pasting a full Java solution (or fenced code block) triggers **Integrity Guardrail #2 (Blocked)** and prevents sending until revised.
- [ ] **AC6:** Approving/sending hints updates the ticket status to `delivered`, increments the Mentor's weekly load & hour log, and makes the hints immediately visible on `/mentee/tickets/[id]`.
- [ ] **AC7:** Mentee can expand Hint 2, submit Clarity Rating (1-5) and Unblocked status, and `/admin/metrics` reflects the updated counts.
- [ ] **AC8:** Claiming 3 tickets triggers the Weekly Cap lock on `/mentor/queue`.
- [ ] **AC9:** All UI copy, sample Java code, and hints are 100% in clear English and readable at 1080p.
- [ ] **AC10:** `npm test` passes for `lib/redact.ts` and `lib/guardrail.ts` (cases listed in Sections 4.1 and 4.2).
- [ ] **AC11:** No hydration warnings in the browser console after loading each route and after Reset Demo.
- [ ] **AC12:** `README.md` lists known limitations: AI steps are simulated, guardrail is rule-based, data lives only in `localStorage`, nothing leaves the browser.
- [ ] **AC13:** Every simulated element carries a visible `Simulated` label (Section 0, rule 12).

---

## 9. Copy-Paste Prompts for Antigravity (For Alvin)

Paste these one by one into Antigravity after placing this file in the project root as `PRD.md`:

- **Milestone M1:**
  > Read `PRD.md` fully (and `DESIGN.md` if present). Implement **Milestone M1 only**. Follow Section 0 rules strictly: no Supabase, no Gemini SDK, English UI only, Java for course tickets, plain ASCII punctuation. When done, verify `npm run build` passes, update `DECISIONS.md` and `AI_USAGE.md`, summarize what was built, and stop.

- **Milestone M2:**
  > Implement **Milestone M2 only** from `PRD.md`: real client-side `lib/redact.ts`, simulated pipeline `lib/mock-ai.ts`, `/mentee/new` with Java Monaco Editor and "Load Sample Java Bug", the 5-step Agentic Pipeline view, and `/mentee/tickets`. Verify `npm run build` passes, update `DECISIONS.md` and `AI_USAGE.md`, and stop.

- **Milestone M3:**
  > Implement **Milestone M3 only** from `PRD.md`: real deterministic `lib/guardrail.ts`, `/mentor/queue` with Weekly Cap, `/mentor/tickets/[id]` 2-column review workspace with live timer and Guardrail #2 blocking, and `/mentor/hours` with CSV export. Verify `npm run build` passes, update `DECISIONS.md` and `AI_USAGE.md`, and stop.

- **Milestone M4:**
  > Implement **Milestone M4 only** from `PRD.md`: `/mentee/tickets/[id]` (delivery, expandable Hint 2, rating, unblocked status), `/admin/credentials`, `/admin/metrics` (live M1-M8 tables), mobile responsiveness polish, and `README.md`. Verify all Acceptance Criteria in Section 8 and run `npm run build`. Update `DECISIONS.md` and `AI_USAGE.md`.

- **Audit (run before recording the video):**
  > Audit the code against `PRD.md` Sections 0, 4, 5 and 8. Output a table: requirement | status | file | fix needed. Check for hydration warnings, missing `Simulated` labels, and any wording that implies a live backend or live AI. Do not change code yet.

---

## 10. Ownership and Handoff to the Final Phase

- **Semifinal (this file):** frontend prototype only. The Semifinal FAQ states that a prototype (Figma or another tool) is expected and that an MVP is not required before the Final Round.
- **Final Phase (7-16 Dec):** Davin adds the real backend (Supabase, Gemini API, row-level security, arm assignment, data-terms gate) from the separate backend PRD (`PeerStack_Prototype_PRD.md`), reusing this repository, so Final Day does not start from an empty repository.
- **Keep TypeScript types aligned with the planned schema** so wiring is clean: use `snake_case` field names that match the database (`mentee_id`, `course_id`, `topic_id`, `description_sanitized`, `code_sanitized`, `error_log_sanitized`, `status`, `arm`, `claimed_at`, `delivered_at`, `is_synthetic`). Store delivered text as `hint_1` and `hint_2` on the message object (the backend PRD stores one `body`; Davin will reconcile it to two hint fields).
- **Roles in the proposal:** Alvin (Product Communication Lead: screens, README, video), Davin (Technical Lead: redaction, guardrail, review, Final Day backend).
