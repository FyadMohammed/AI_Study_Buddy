# QUIZ.md

**Closed book.** No repo, no editor, no search, no `Notes.md`, no LLM. Paper or a blank text file only. ~90 minutes. Write into the ANSWER SHEET at the bottom.

If you cannot answer a question, write "don't know" and move on. A blank is data. A guess dressed as an answer is not.

Do not open `QUIZ_KEY.md` until every question has something written under it.

---

### Q1 — TRACE · the request path · `TopicInput.vue`, `App.vue`, `index.js`, `generationOrchestrator.js`

A user types `Mitosis` and clicks Generate. Name every function that executes, in order, from the click until the summary text is visible on screen. For each one, state what it hands to the next thing in the chain. Include the component-to-component hops, not just the server ones.

---

### Q2 — DESIGN · response envelope · `utils/responseFormatter.js`

Every response leaves the server wrapped rather than bare. Suppose it did not — suppose each route returned its payload directly. Name the concrete extra work each frontend call site would have to do, and name one real cost the wrapper imposes that returning bare payloads does not.

---

### Q3 — BLANK-FILE · response envelope · `server/utils/responseFormatter.js`

Write the file.

**Spec.** A module exposing exactly two functions. One takes an arbitrary payload and produces the object every successful response body must be. One takes a message string and produces the object every failed response body must be. Both shapes must be distinguishable by a single property check on the consumer side. Neither throws. Include the export.

---

### Q4 — FAILURE · validation contract · `middleware/inputValidator.js`

Suppose the first guard in `validateTopic` — the one that runs before anything else touches the input — were deleted, so the function proceeds straight to trimming.

Give: (a) one concrete request body that now fails, (b) what the server sends back, including the HTTP status code and whether the body is JSON, (c) the exact category of thing the user sees in the browser. Be specific on (c); "an error" is not an answer.

---

### Q5 — BLANK-FILE · validation contract · `server/middleware/inputValidator.js` → `validateTopic`

Write the function and its export.

**Spec.** Takes one argument of unknown type. Returns a plain object, never throws, never sends a response.
- Non-string input → rejected, with a reason.
- String that is empty once surrounding whitespace is removed → rejected, with a reason.
- String longer than a fixed maximum (200) once trimmed → rejected, with a reason that states the maximum.
- Otherwise → accepted, and the caller must receive the trimmed value, not the original.
- The caller must be able to tell accepted from rejected without a `try/catch`.

Pull the maximum out as a named constant.

---

### Q6 — DEBUG · component state lifetime · `App.vue`, `QuizCard.vue`

Symptom: a user generates topic A, plays the quiz to the end, sees the final score screen. They then type topic B and hit Generate. The summary updates to topic B. The flashcards update to topic B. The quiz panel still shows topic A's final score screen.

Name the first three places you look, in order, and say why that order. Then name the fix.

---

### Q7 — TRACE · atomic persistence · `services/databaseService.js`

`saveTopic` is called with a payload containing one summary, three flashcards, and four quiz questions.

(a) How many SQL statements execute, and in what order?
(b) Where does the value that ties the child rows to the parent row come from, and at what moment does it first exist?
(c) The fourth quiz insert throws. What is now in the `topics` table? What is in `flashcards`? Why?

---

### Q8 — DESIGN · the mock/real seam · `services/mockAiService.js`, `services/generationOrchestrator.js`

The placeholder study-material generator lives in its own module rather than inline in the orchestrator.

State the exact change set — which files, and roughly how many lines in each — needed to swap in the real AI service under the current arrangement. Then state the change set if the placeholder data were instead written inline in the orchestrator. Then name the one thing the current arrangement does **not** protect you from.

---

### Q9 — FAILURE · JSON-in-TEXT column · `services/databaseService.js`, `db/schema.sql`

Suppose the quiz insert passed the choices array to the database as-is, instead of converting it first.

(a) Does this fail on write or on read? (b) What is the observable result — an exception, a wrong value, or silence? (c) If it were to fail on read instead, what would the frontend render? Answer both branches; only one is real, and say which.

---

### Q10 — BLANK-FILE · orchestration · `server/services/generationOrchestrator.js` → `generate`

Write the module.

**Spec.** One exported function taking raw, untrusted topic input from an HTTP body. It must:
- reject invalid input without doing any generation or database work, returning the standard failure body carrying the validation reason;
- otherwise produce study material from the cleaned input;
- persist that material, obtaining a database-assigned identifier;
- return the standard success body containing that identifier plus the three pieces of study material.

It performs none of validation, generation, persistence, or formatting itself. It coordinates four collaborators. Name them and their imports.

---

### Q11 — FAILURE · status codes vs. envelope · `server/index.js`

Suppose the `POST /generate` handler were changed to always respond `200`, regardless of outcome.

(a) Does the browser UI behave any differently? Answer yes or no and justify it from what `App.vue` actually checks.
(b) Name two things that are now broken even though the UI is not.
(c) The fact that (a) has the answer it has is simultaneously a design strength and a design weakness. State both in one sentence each.

---

### Q12 — GAP · unbuilt route layer · `server/routes/topicRoutes.js` (does not exist)

Specify the full contract for both endpoints this file must expose — the list of saved topics, and one saved topic with its materials.

For each: URL and method, where the input comes from, the exact success body, and **every** failure case with its status code. Then name the one failure case the existing validator module cannot currently handle, and what you would add to it.

---

### Q13 — DEBUG · error surfacing · `App.vue`, `generationOrchestrator.js`, `index.js`

Symptom: a user clicks Generate. The loading indicator appears, then the error banner shows:

`Unexpected token '<', "<!DOCTYPE"... is not valid JSON`

Nothing about this message mentions the actual problem. Name the first three places you look, in order, and say what each one would tell you. Then state, in one sentence, the structural reason this message is what the user sees rather than a description of the real fault.

---

### Q14 — TRACE + GAP · sync → async · `server/index.js`, `generationOrchestrator.js`, `services/aiServiceClient.js` (does not exist)

Today the entire `/generate` server chain is synchronous. When the placeholder generator is replaced by a network call to the AI service, that stops being true.

(a) Name every function whose signature or call site must change, in the order you would change them.
(b) You change the innermost one and the orchestrator, but forget the route handler. Describe precisely what the server sends, what status code it sends, and what the user sees — noting that the underlying generation actually succeeded.
(c) Name the thing Express 4 does *not* do for you here, and what that costs.

---

### Q15 — BLANK-FILE · centralizing side effects · `client/src/api/apiClient.js` (does not exist)

Write the module.

**Spec.** Three exported functions: create a topic from a string; list all saved topics; fetch one saved topic by id. The base URL appears exactly once in the file. Each function returns the *payload* to its caller — no caller should ever see the envelope. Any failure, whether the server reported it or the network did, reaches the caller as a thrown error carrying the most specific message available.

Then state what `handleTopicSubmit` in `App.vue` shrinks to once this file exists.

---

### Q16 — FAILURE · pragmas and connection setup · `server/db/connection.js`, `server/db/schema.sql`

Suppose the line in `connection.js` that enables foreign key enforcement were deleted.

(a) Does the cascade-delete behavior change? Answer yes or no.
(b) Justify it from what else happens during connection setup.
(c) Does the normal generate-and-save flow change at all?

Think before answering (a). The obvious answer is not the answer.

---

### Q17 — GAP · the AI output contract · `server/ai/` (does not exist), `mockAiService.js`, `FlashcardList.vue`, `QuizCard.vue`

The Python service must return study material that the existing frontend renders with **zero** component changes.

(a) Write out the exact JSON shape it must produce, including nested key names and value types.
(b) Name the three separate places in the current codebase that independently depend on that shape, and say what enforces agreement between them today.
(c) Name the three most likely ways an LLM violates this contract, and for each, where in the stack the violation first surfaces.

---

### Q18 — DESIGN · service boundaries · whole system

The architecture puts the AI pipeline behind an HTTP boundary in a separate Python process rather than calling the model directly from the Node backend.

Argue the case **against** that decision, specific to this project as it stands on 6 August with a demo on the 13th. What does the boundary concretely cost you here — in hours, in failure modes, in demo-day operations? Then state the one thing you would lose by collapsing it, and whether that loss is worth paying for given who is watching.

---
---

# ANSWER SHEET

**Q1 —**
handleGenerate-> emit()-> handleTopicSubmit->
I have a bit difficulties in understanding handleTopicSubmit
what I understand is that first the try block is executed. 
A request is sent to the localhost using POST method. However
I have forgotten what is POST method. Which is expected to recieve
a response with a body which will be turned into a string from JSON
format. ( I have took reference from the TopicInput.vue and App.vue
Didn't understood the index.js and generation orchestrator

**Q2 —**
Don't know really

**Q3 —**


**Q4 —**
(a)
(b)
(c)


**Q5 —**


**Q6 —**
1.
2.
3.
Fix:


**Q7 —**
(a)
(b)
(c)


**Q8 —**
Current arrangement:
Inline arrangement:
Does not protect against:


**Q9 —**
(a)
(b)
(c)


**Q10 —**


**Q11 —**
(a)
(b)
(c) Strength:
    Weakness:


**Q12 —**
List endpoint:
Single endpoint:
Case the validator cannot handle:


**Q13 —**
1.
2.
3.
Structural reason:


**Q14 —**
(a)
(b)
(c)


**Q15 —**
Module:

handleTopicSubmit becomes:


**Q16 —**
(a)
(b)
(c)


**Q17 —**
(a)
(b)
(c)


**Q18 —**
Cost in hours:
Cost in failure modes:
Cost on demo day:
What is lost by collapsing it:
Worth it:
