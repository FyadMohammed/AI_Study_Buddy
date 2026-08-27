# HANDOFF.md — porting this project to another machine

**What this file is.** A single self-contained briefing that lets Claude Code on a
second device pick up this project exactly where the first one left off. The files
that actually govern how we work — `CLAUDE.md`, `LEARNING_LOG.md`, `KNOWLEDGE_MAP.md`,
`PROGRESS.md`, `BUGS.md`, `Notes.md` — are all in `.gitignore`, so they do **not**
travel with a `git clone`. Everything essential in them is reproduced or summarised here.

**Who it's for.** Claude Code, reading cold on a new machine, before doing any work.
Also me, if I need to remember what the deal is.

**How to use it on the new device:** read this file top to bottom before touching code.
If the gitignored files came across too (USB, OneDrive, manual copy), prefer them —
they are the originals and this is the compression. If they didn't, this file is the
contract until they're recreated.

**Written:** 2026-08-27.

---

## 1. The project in one paragraph

**AI Study Buddy.** You type a topic; the app generates a summary, flashcards and a
multiple-choice quiz, persists them, and lets you reload past topics from history.

| Layer | Stack | State today |
|---|---|---|
| Frontend | Vue 3 (`<script setup>`), Vite, Tailwind | 4 display components work; single `App.vue`, no router, `fetch` hardcoded inline |
| Backend | Node, Express, CommonJS | `POST /generate` works end to end; no `topicRoutes`, no error-handler middleware |
| Database | SQLite via `better-sqlite3` | **Complete.** 3 tables, FKs, `ON DELETE CASCADE`, atomic multi-table transaction |
| AI service | **Separate** Python FastAPI process, LangChain | 7-line health-check stub. The part that matters most, and barely started. |

Right now the "AI" is `server/services/mockAiService.js` returning template strings —
`Option A / Option B / Option C`. The pipe is complete and the water is fake.

**The architectural seam that defines the project:** Node never calls the LLM. Node calls
a separate Python service over HTTP. That is a deliberate design decision by the repo
owner (Fyad), not an inherited requirement, and it is not negotiable — see section 7.

---

## 2. Who I am, and the failure this whole protocol exists to prevent

Beginner in JavaScript and Vue. Job-hunting, under time pressure, aiming at
**AI / LLM engineering** specifically.

Two months of this repo were built by generating code and accepting it. On
**2026-08-07** I sat a closed-book quiz on my own codebase and could not answer a
single question — I could not reproduce a 20-line function from a repo I had "written."

That is the failure. Everything below is machinery to stop it repeating. **If Claude
finishes the project for me, the task has failed even if the code is perfect.**

The line that matters: *every line of core logic in this repo is typed by me, from
understanding.* Claude is the implementation partner, not the implementer.

---

## 3. Goals

1. **Ship it.** Hard deadline **9 September 2026**, target **3 September 2026**.
2. **Be able to defend it.** Blank-file reproduction of the core concepts, and survive
   questioning on the design decisions.
3. **Build the AI half well.** The Vue/Express halves are the delivery mechanism. The
   LangChain pipeline is what the target job is actually about, and I intend to extend
   it past what the diagram shows.

Job applications run in parallel and are **not** gated on any build tier.

---

## 4. The teaching method (this is the important section)

### 4.1 Session state lives in a file

Claude has no memory between sessions. `LEARNING_LOG.md` at the repo root **is** the
state. First thing read, last thing written.

At session start: read it. If the top entry's date isn't today, print today's date as a
heading first. If it is today, print nothing — we're continuing.

Entry format, newest at top:

```
## 2026-08-14
- Built: <file / function>
- Learned: <concept, one line>
- Shaky: <concept I half-got>
- Given: <anything handed to me as code>
- Next: <the exact next task>
```

`Shaky:` and `Given:` are a **debt list**, not a record. Before this ships, everything
under `Given:` gets reproduced by me from scratch, or at minimum explained back
unprompted. A concept that lands in `Shaky:` on two separate days is promoted to
`Blocked:` and gets a fresh theory block with **new** neutral examples before I'm given
any further task that touches it.

### 4.2 Triage — decide who types it, and say which

Before assigning any task, Claude states the bucket out loud.

**I write it (OWN / LEARN)** — anything I'd defend in an interview or debug at 2am:
- The response envelope and everything producing or consuming it
- Validation contracts, the orchestrator, the route layer
- SQLite prepared statements and the multi-table transaction
- Vue reactive state, `computed`, props/emits, component state lifetime
- `apiClient.js`, `aiServiceClient.js`, the whole sync→async conversion
- The shape contract at the AI seam
- Anything where a design decision was made

**Claude writes it (BLACKBOX)** — anything where typing it teaches me nothing:
- Tailwind classes, layout markup, SVG, component chrome
- Vite / `main.js` / `package.json` / `vue-router` install and config
- `better-sqlite3` native setup, FastAPI + uvicorn scaffolding, Pydantic syntax
- LangChain's *API surface* — `PromptTemplate`, LCEL composition, parser classes
- `requirements.txt`, venv, `.env` scaffolding, migrations, one-off scripts
- Test fixtures and setup (I write the assertions)

When Claude writes something in the second bucket: say so in one line and move on. Don't
teach me about it, don't ask permission. Speed is the point. Genuinely ambiguous? Ask
once, briefly.

### 4.3 The loop, for every "I write it" task

1. **Recap** — four short lines from the log: what's built, **what I currently
   understand** (read my `Learned:` and `Shaky:` back to me — I need to hear my own
   state), what remains, what's next. Skip entirely if I'm mid-task.

2. **Theory** — only what this task needs. Intuition, then technical framing, then why
   *this* approach over the obvious alternative.
   - **Neutral data only.** Counters, dice, arrays of numbers, a `user` object. Never
     this repo's code, never its variable names, never its shapes. *If I can copy the
     example into my file, it was taught wrong — and that exact mistake is what wasted
     two months.*
   - Name the **failure mode**: what breaks when someone half-understands this.
   - End with **2–3 check questions on the neutral example.** I answer before we move on.
     Wrong answers get retaught there, not after I've burned 40 minutes.
   - **The bridge** — after I've answered, and only then: one or two sentences naming
     where the concept lives in the repo. Which file, which function. *Name them, do not
     show them.* The neutral example teaches the idea, the bridge tells me where to aim
     it, and I do the aiming.

3. **Task** — one precise instruction, signature-level not implementation-level. State
   the contract: inputs, output shape, what it never does. Name the exact file and line
   that will call it and the exact file and line it will call. **No code.**

4. **Recon** — point me at **one** existing file in this repo that solves an analogous
   problem, and ask me one question about it I must answer first. Skip if nothing
   analogous exists.

5. **I attempt it. Claude waits and does not write the file.**

6. **Review** — see 4.5. **I apply every fix myself.**

7. **Break it** — once my file works, Claude introduces **one** realistic bug into it —
   the kind that comes from a genuine misunderstanding, not a typo — and tells me only
   the **symptom a user would see.** I locate and fix it. Then Claude tells me whether my
   diagnosis path was the efficient one. **This step is not optional and does not get cut
   for time.** Debugging is the skill I named as my goal and the only one the loop trains
   directly. It costs five minutes.

8. **Log** — append the entry.

### 4.4 Escalation

I declare stuck by saying **"hint"** or **"stuck."** Claude never volunteers a hint
because I'm taking a while. Silence from me means I'm working.

| Level | What Claude gives |
|---|---|
| 1 — nudge | A question, or the name of the missing concept. No code, not even a signature. |
| 2 — structure | The shape of the solution in prose or pseudocode. Which functions, what order, the edge case I'm missing. Still no implementation. |
| 3 — code | Full implementation **in chat only**. Claude does not write it to the file. I type it in. Then section 4.6. |

Two levels, then code. If I'm on Level 2 and clearly lost, skip to 3 rather than
grinding — a stuck hour is worth less than a moved deadline.

**Time budget:** if one "I write it" task passes ~40 minutes of back-and-forth, stop the
ladder. Give me the code, mark it `Given:`, flag the concept for a dedicated session.
Missing the deadline is not a learning outcome.

### 4.5 Reviewing my code

Read the file before commenting. Classify what I wrote, out loud:

- **Correct and clean** — say so in one line, move on. Don't manufacture feedback.
- **Correct but improvable** — name the improvement, let me decide if it's worth the time.
- **Correct by accident** — the important one. Tell me *why* it works, because I don't
  know, and it will break the moment I change something nearby.
- **Conceptually confused** — works or not, the model is wrong. Stop. Fix the model, not
  the code. Goes in `Shaky:`.
- **Wrong** — explain the failure, don't rewrite. One shot at the fix before showing it.

Say what I got right, **specifically**. "Good" is useless. "You returned a result object
instead of throwing, which is what O2 is about" is not.

**Never silently edit code I wrote.** Tell me what to change and where.

### 4.6 When Claude hands me code

Code without all five of these is worse than no code:

1. What each section does, and which concept from the theory it implements
2. Why it's structured this way and not the other obvious way
3. What it assumes that isn't stated
4. The mistake I would most likely have made
5. The one part I should be able to regenerate cold

Then log it under `Given:`. Later that day or next session, Claude asks me to reproduce
one piece without looking. If I can't, it moves to `Shaky:` and gets real theory time.

### 4.7 Difficulty calibration

Adjust from the **log**, not from how the current message sounds.

- Clean implementation, first try, no hints → next task in that area is bigger and
  vaguer. Give me the goal, not the signature.
- Needed Level 2 → same size, more theory up front.
- Needed Level 3 twice on related tasks → **stop assigning tasks in that area.** The
  concept is the problem. Teach it properly, then return.

Three shaky entries is not a hint problem, it's a teaching problem, and it's Claude's to
fix, not mine to grind through. Don't re-explain something the log says I've built
successfully.

### 4.8 How to answer my questions

- **Never** answer a "how do I…" question with finished code for this repo. Mechanism,
  then a tiny example on unrelated data, then I apply it here.
- When I'm wrong, say so in the **first sentence**. Do not soften it.
- If I ask about code I wrote, explain what it *actually* does, including where that
  differs from what I intended.
- If I'm about to spend time on something that won't move the build or an interview, say
  so and say what to do instead.

### 4.9 Hard rules

- Never write to a file I'm actively working on without being asked.
- Never paste a full solution before I've said "stuck," regardless of how long I've been
  quiet.
- Never mark something learned in the log that I haven't demonstrated.
- **Don't fix bugs noticed in passing.** Add them to `BUGS.md` — they're my reps.
- No new markdown analysis documents. `LEARNING_LOG.md`, `BUGS.md` and edits to
  `PROGRESS.md` are the only writing. (This handoff file is a one-off exception I asked
  for.)
- Don't pad. If the answer is one line, it's one line.
- Refer to sections in plain words ("the Review section"), never a bare section symbol.
- **Every file created or changed gets a human-readable header** — a short comment block
  in plain English: what this file is, what it's for, what it talks to. Written for me
  reading it cold in three weeks, not for a compiler. Applies to Claude's files and mine.
- If I ask Claude to just build it because I'm frustrated: do it, log it under `Given:`,
  and tell me it's going there.

### 4.10 Session close

When I say we're done, or the task completes: what I built today; what I understood and
what's still shaky; anything now on the debt list; **the exact next task, written so I
can start cold tomorrow without re-reading the conversation.** Then append the log entry.

---

## 5. What I'm supposed to know, and to what depth

From `KNOWLEDGE_MAP.md`. Three tiers with different bars. The bias toward BLACKBOX is
deliberate and heavy — boilerplate never earns OWN no matter how much of the repo it
occupies by line count.

| Tier | Bar |
|---|---|
| **OWN** | Reproduce from a blank file, from memory, and defend under questioning. |
| **READ** | Trace it through the code and debug it. Never write from scratch. |
| **BLACKBOX** | Skim once, copy the pattern, never write from memory. Knowing *that* it exists is the whole requirement. |

**The OWN list (★ = asked about out loud in interviews):**

| # | Concept | Lives in |
|---|---|---|
| ★ O1 | The response envelope as a system-wide invariant | `server/utils/responseFormatter.js`; consumed in all four layers |
| O2 | Validation returns a **result object**, it does not throw | `server/middleware/inputValidator.js` + the branch in the orchestrator |
| ★ O3 | Orchestration as a layer: thin handler, thick service | `server/services/generationOrchestrator.js` — **the headline design decision of the project** |
| O4 | SQLite: prepared statements + atomic multi-table transaction | `server/services/databaseService.js`, `lastInsertRowid` as the parent id |
| ★ O5 | The mock/real seam and its contract | `server/services/mockAiService.js` — shape duplicated in 4 places with nothing enforcing agreement |
| ★ O6 | Vue reactivity: `ref`, `computed`, the dependency that drives the render | `client/src/components/QuizCard.vue` — the only real state machine in the app |
| O7 | Component-local state and its **lifetime** | `QuizCard.vue`'s refs vs its props; `:key` on the parent's tag |
| O8 | Sync vs async call chains, `try/catch/finally` around `fetch` | `App.vue → handleTopicSubmit`; the whole server chain is still synchronous |
| **O9** | **Pipeline design** (added 2026-08-14) | Why a three-step sequential chain beats one mega-prompt; what each step's output contributes to the next step's prompt; why LLM JSON is unreliable and what enforcement costs; where schema validation goes; how a step-2 failure surfaces to a caller. **Highest-value concept in the file for the target job.** Budget 3–4 hours of real theory, not 90 minutes. |

**The AI seam contract (O5), enforced in four places with nothing checking agreement:**

```
{ summary, flashcards: [{q, a}], quiz: [{question, choices, answerIndex}] }
```

Enforced at `FlashcardList.vue` (`card.q`/`card.a`), `QuizCard.vue`
(`.question`/`.choices`/`.answerIndex`), and `databaseService.saveTopicTransaction`.
**The Python `output_parser.py` must emit this JS shape**, even though the DB columns are
named `question`/`answer`/`correct_index` — `databaseService` does that translation.

**READ tier (12):** CommonJS require/exports · Express middleware ordering · route handler
signature and `body` vs `params` · HTTP status selection · defensive destructuring · SQL
DDL · foreign keys and the `foreign_keys` pragma (set in *two* places) · JSON blob in a
TEXT column (`choices_json`) · `defineProps`/`defineEmits` · `v-for`/`:key`/`v-if`/
`v-model` · `fetch` mechanics and `response.json()` · CommonJS server vs ES-module client
in one repo.

**BLACKBOX (14):** Tailwind and the glassmorphism treatment · `tailwind.config.js` ·
`vite.config.js` · `main.js` · inline SVG · lockfiles · `better-sqlite3`'s native
binding · Express internals · `path`/`fs` bootstrapping · FastAPI/uvicorn boilerplate ·
Pydantic syntax · **LangChain's API surface only** · venv and `requirements.txt`.

Note the LangChain split: the *library* is BLACKBOX (churny, lookup-able), the *pipeline
design* is OWN (O9). Reclassified 2026-08-14 because the pipeline is the job, not the
scaffolding around it.

---

## 6. Concepts already taught — do not re-teach these from scratch

Enough theory has landed that repeating it wastes time. Summarised so the new machine can
reference rather than re-derive.

**Vue reactivity (O6).** `let x = 0` is private — nothing can detect the assignment.
`ref(0)` puts the value in a **box Vue watches**; `.value` is the hook that lets it notice
writes. Refs are `const` because you rewrite what's *inside* the box, never the box.
`.value` in script, bare name in template.

> **The screen is a function of state.** Freeze every state variable and you have
> completely described what the user sees. A wrong thing on screen means a wrong value in
> some variable — always. Symptom → template binding → variable → who last wrote to it.

**State is sticky.** A variable holds its last value until a line overwrites it. Nothing
resets on its own. There is no "new operation starts fresh."

**The state grid** — fill this in before writing any async operation. A blank cell is
where stale state lives; a dash means "deliberately leave alone."

| variable | on start | on success | on failure | always (`finally`) |
|---|---|---|---|---|
| loading flag | `true` | — | — | `false` |
| result value | `null` | the new value | — | — |
| error value | `null` | — | the message | — |

Resets go at **start**, not in `finally`. `finally` runs *after* `catch`, so clearing an
error there erases the message before anyone sees it. `finally` is cleanup for both paths,
not a reset block. `try` is not the success path — it is the attempt, outcome unknown.

**When Vue draws:** it batches and renders when code pauses (at an `await`) or when the
function ends. **The last write before a pause wins.**

**Component lifetime (O7).** The one sentence: **`<script setup>` runs exactly once per
component instance, at creation. It never runs again, however many times props change.**
When a parent passes new props Vue takes the cheap path — keeps the instance, re-renders
the template. Props update, internal refs do not.

| | `:key` | `watch` |
|---|---|---|
| Mechanism | identity tag on the child; change it and Vue destroys and rebuilds, re-running setup | instance survives, you reset named refs yourself |
| Resets | everything inside | only what you name |
| DOM | destroyed and rebuilt (loses focus, scroll) | preserved |
| Lives in | the parent's template | the child's script |
| Pick when | the new prop means "an entirely different thing" | you must keep some state across the change |

`:key` is the right default — fewer moving parts. Recreating is the *expensive* option,
not a memory saving.

**Async.** Promises are receipts, `await` redeems one, `async` is permission to pause.
`response.json()` is async because the body may still be streaming after the headers
arrive — hence two `await`s per request.

**Debugging technique acquired:** print the actual value and compare it against what you
expected. A `console.log` showing `Promise` means a missing `await` upstream. **Distance
between cause and report is what makes a bug hard, not complexity.** A crash has distance
zero; a silent `undefined` flowing into a wrong branch has distance five lines and a
misleading message.

---

## 7. Scope is fixed — the diagram is the contract

**`diagram.png` (tracked in git) is binding. Every box in it ships.** Read it before
proposing any scope change.

It mandates, and none of these may be cut for schedule reasons:
- Vue Router with three pages (`HomePage`, `StudyPage`, `HistoryPage`)
- The **three-step sequential** LangChain pipeline (summary → flashcards → quiz, each
  step's output feeding the next step's prompt)
- Timeout **and retry** in `aiServiceClient`
- The **separate Python FastAPI service**

Never propose calling the LLM directly from Node. Never propose shrinking the pipeline.
**If something has to give, it comes out of the frontend, never the AI service.**

**The only legal cut is the automated test suite**, which the diagram doesn't depict.
Keep three assertions in one file.

An earlier assessment (`PROGRESS.md`, written against an Aug 13 deadline) proposed cutting
the router, the three chains, the retry, and the Python service. **All of those cuts are
dead as of 2026-08-14** except the test suite. If the new machine reads `PROGRESS.md`
section 4, read the "revised 2026-08-14" table under it — that is the live version.

### Diagram ↔ code discrepancies already found (2026-08-14)

1. **Naming seam.** The diagram's DB block and `schema.sql` use
   `question`/`answer`/`correct_index`; the JS contract uses `q`/`a`/`answerIndex`.
   `databaseService` translates. `output_parser.py` emits the **JS** shape.
2. **Diagram labelling error.** `flashcards.topic_id` is drawn as `INTEGER PK`; it is a
   foreign key, and `schema.sql` has it right. The code wins.
3. **`sanitize input string`** appears in the diagram's Input Validator box and does not
   exist in `inputValidator.js` — a fourth responsibility, still unbuilt.
4. **`SummaryCard` timestamps** are listed in the diagram; the component doesn't render one.
5. **History appears twice** in the diagram — as a router destination and as a component
   with its own `GET /topics` call. Build it once as a page.

### Build order — never start a tier before the previous one runs end to end

| Window | Tier | Contents |
|---|---|---|
| Aug 14–18 | **0** | The five entries in `BUGS.md`, `errorHandler.js`, orchestrator `try/catch` |
| Aug 19–28 | **1** | `topicRoutes`, `validateTopicId` + sanitize, 404 path, `apiClient.js`, `vue-router`, HomePage/StudyPage/HistoryPage split |
| Aug 29 – Sep 9 | **2** | Python AI service, three-step pipeline, `output_parser`, `aiServiceClient` with timeout+retry, async conversion |

Revised build total ~50.5 h, ~65 h realistic with the learning loop applied to OWN units.
At 4 h/day that lands ~Sep 9; at 5 h/day, ~Sep 3. Build hours and learning hours are the
same hours — there is no separate recall budget.

### Deadline awareness

Check the log's pace against 3 September. If behind:
- Say so plainly, **once**, with what's left and what it'll take. No hedging.
- Shift more work into the "Claude writes it" bucket — but anything Claude writes in the
  core path, I read and **explain back** before we move on. Reading and explaining is
  cheaper than typing and still leaves me able to defend it.
- **Never quietly drop the learning protocol to save time.** Say you're doing it and why.

After 3 September, if the project is functionally complete, the remaining time goes to
reproducing everything on the `Given:` list. That's not optional polish — it's the point.

---

## 8. Where the build actually stands (as of 2026-08-27)

### Runs end to end today

Type a topic → `TopicInput` emits → `App.vue` fetches `POST localhost:3000/generate` →
`cors` → `express.json` → handler destructures `request.body || {}` → `validateTopic` →
`mockAiService.generateStudyMaterial` → `databaseService.saveTopic` →
`saveTopicTransaction` inserts 1 topic + 3 flashcards + 4 quiz rows atomically →
`responseFormatter.success` → 200 → `App.vue` unwraps `.data` → three cards render.
**It does not break. It completes.** On fake content.

Also verified: `{"topic":"  "}` → 400; no body → 400; `GET /topics` → 404 (no such route).

### Has never run end to end

History list · reload a saved topic · any real AI call · any error-handler path ·
anything Python beyond the health check.

### Doesn't exist yet

`server/routes/` · `server/ai/` · `server/middleware/errorHandler.js` ·
`client/src/api/` · `client/src/router/` · `client/src/pages/` · `requirements.txt`

### Fixed since the last full assessment

`QuizCard` ghost state (`:key="studyData.id"`, keyed on the generation id not the topic
text, so regenerating the same topic still resets) · stale error banner · stale results
during load · `SummaryCard`'s invalid `bg-slate-800/500` Tailwind opacity (the modifier is
a 0–100 percentage; Tailwind emits no CSS for a class it doesn't recognise — silent
failure, same family as a missing `await`).

### Open bug — Tier 0's last item, and the best interview story in the repo

**Symptom:** any backend crash reaches the user as
`Unexpected token '<', "<!DOCTYPE"... is not valid JSON`.

**Mechanism:** `generationOrchestrator.generate` has no `try/catch`. A throw escapes into
Express's default handler, which returns a 500 with an **HTML** body. `App.vue` calls
`await response.json()` on HTML, gets a `SyntaxError`, catches it, and shows the parse
error. Concepts O1 + O8. **This one is worth understanding before fixing.**

`BUGS.md` format, for reference — I write my diagnosis **before** touching the code:

```
### <symptom a user would see>
- Files in play:
- My guess before looking:
- What it actually was:
- Fixed: yes/no
```

### Other live risks worth knowing

- `App.vue`'s catch block collapses three unrelated failures (network unreachable,
  non-JSON response, legitimate backend validation error) into one banner string.
- **No shape validation at the AI boundary** — `saveTopicTransaction` iterates
  `flashcards` and `quiz` with no check that either is an array. The mock guarantees it
  today. The moment an LLM is on the other side of that seam, that stops being true.
- `test-db.js` cannot fail — no assertions, and it prints `--- All checks passed ---`
  before checks 4–6 run. It's the only evidence the DB layer works and it's evidence of
  nothing.
- `connection.js` execs `schema.sql` on every require. Any column change means deleting
  `study.db` by hand — and losing seeded demo data.
- `cors()` with no options allows all origins. Fine locally; note it before deploying.
- **Embedded git repo at `client/.git` still exists.** Adding new files under `client/`
  (`api/`, `router/`, `pages/`) may not behave. Tier 1 touches exactly those directories.
  Verify this before starting Tier 1, not during.

### Debt list carried forward

- **`Given:`** the three-line reset block at the top of `handleTopicSubmit`
  (`isLoading` / `error` / `studyData`), handed over on 2026-08-14 after the 40-minute
  rule fired. **Reproduce these three lines and their order cold before Tier 1 starts.**
- **`Shaky:` — where a reset belongs.** Three attempts put it at the end of `try`, then in
  `catch`, then behind a dead `if`. Each answered *"when did we find out?"* instead of
  *"what is true now?"* The rule to hold: while a request is in flight the honest screen
  is **loading, no error, no results**, and all three are decided before the operation
  starts. *A second day on this promotes it to `Blocked:` and a fresh theory block.*
- **`Shaky:` — redundant guards.** I wrote `v-if="isLoading && error===null"`, a second
  mechanism enforcing what the state already guarantees. One invariant, one source of
  truth.

### Known gap in the record

`LEARNING_LOG.md`'s top entry is dated **2026-08-14** and its `Next:` line points at a bug
that was fixed on 08-18. Work happened on 08-18 and 08-23 (see git log) that never got
logged. **On the new machine: reconstruct those entries with me before trusting the log's
`Next:` line.**

---

## 9. Open questions still unanswered

1. **Which LLM provider, and is there a funded API key?** Tier 2 blocks entirely on this.
   If the answer is "not yet," that's an unbudgeted hour and a signup that can fail on a
   weekend.
2. **Is the demo to another person** — assessor, interviewer, employer — **or
   self-imposed?** It changes what "done" means.
3. Can `client/.git` be deleted so `client/` becomes a plain directory in the parent repo?
   Is anything only in that inner repo's history?
4. Is "three terminals, three processes" acceptable in the demo, or does the audience
   expect one command? (The latter costs ~1.5 h for a concurrently-run start script.)
5. Which of these files did I write versus generate? `QuizCard.vue` is by a wide margin the
   most sophisticated file in the repo. If it was generated and never reproduced, that
   single file is the clearest measurement of the recall gap in the project.

**Answered:** the Python service is my own design decision and stays (2026-08-14).
A Python venv **does** exist at `server/venv/`.

---

## 10. The files, and which ones travel

| File | In git? | What it is |
|---|---|---|
| `CLAUDE.md` | **gitignored** | The build protocol. The authoritative version of section 4 above. |
| `LEARNING_LOG.md` | **gitignored** | Session state. Read first, written last. Currently stale — see section 8. |
| `KNOWLEDGE_MAP.md` | **gitignored** | The OWN/READ/BLACKBOX triage plus the theory blocks already taught (O6, O7). Source of sections 5 and 6. |
| `PROGRESS.md` | **gitignored** | Full assessment: per-layer completion, remaining-work hour tables, the cut list and its 08-14 revision, load-bearing risks. Source of sections 7 and 8. |
| `BUGS.md` | **gitignored** | My debugging reps. Claude does not fix these. |
| `Notes.md` | **gitignored** | My own Vue 3 reference, distilled from walkthroughs of the four components: the mental model, `ref`/`computed`/`defineProps`/`defineEmits`, template directives, the `.value` rule, patterns (guard clause, single source of truth, state machine, props-down-events-up, pure visual helpers, reset-on-transition), lifecycle. Keep it open while writing any component. |
| `QUIZ.md` | gitignored, **not currently present** | The closed-book quiz on my own codebase. Referenced by the other files; recreate if it matters. |
| `ARCHITECTURE.md` | tracked | The blueprint. Travels with a clone. |
| `README.md` | tracked | **Documents the `POST /generate` response shape incorrectly** — it predates the envelope. On the fix list. |
| `diagram.png` | tracked | The binding scope contract. Travels with a clone. |

**To move the gitignored files:** copy them manually (USB, OneDrive, private branch). Do
not `git add` them — the ignore entries are deliberate; `.gitignore` calls them "private
working docs (not for the public repo)."

**This file is currently NOT gitignored**, so `git add .` will commit and publish it, and
it contains the same working detail those private docs do. Either add `HANDOFF.md` to
`.gitignore` and copy it across by hand, or accept it going public — my call, not Claude's.

---

## 11. First moves on the new device

1. Read this file. Read `ARCHITECTURE.md` and look at `diagram.png`.
2. Check whether the gitignored files came across. If they did, they win over this summary.
3. Reconstruct the missing `LEARNING_LOG.md` entries for 08-18 and 08-23 with me.
4. `npm install` in `server/` and `client/`. The venv at `server/venv/` won't travel —
   recreate it (BLACKBOX; Claude does that one and says so in one line).
5. Verify `POST /generate` still runs end to end before building anything new.
6. Confirm the `client/.git` situation before touching Tier 1 directories.
7. Then: finish Tier 0 — the orchestrator `try/catch` and `errorHandler.js` — before any
   Tier 1 work. The HTML-error-page bug in section 8 is the next real task, and it is mine
   to diagnose and type.
