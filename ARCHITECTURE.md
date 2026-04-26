# AI Study Buddy — Architecture Documentation

## Overview

**AI Study Buddy** is a full-stack application that generates study materials — summaries, flashcards, and quizzes — from any user-provided topic. The system follows a layered architecture with four distinct components: a Vue 3 frontend handling user interaction and state management, a Node.js/Express backend organized into middleware, route, and service layers with dedicated modules for input validation, response formatting, and generation orchestration, a Python FastAPI service running a LangChain pipeline that makes sequential LLM calls to produce structured study content, and an SQLite database persisting topics and their associated materials. The frontend communicates exclusively through a centralized API Client, the backend delegates AI and database concerns to an orchestrator pattern in the service layer, and the AI service operates as an independent process reachable via HTTP — keeping each component independently testable, replaceable, and deployable.

## System Diagram

![AI Study Buddy Architecture](./diagram.png)

## Layer-by-Layer Breakdown

### Frontend (Vue 3 + TailwindCSS)

**Router** — Manages three routes: homepage, study, and history. On history item click, navigates to `/study/:id` to reload a saved topic.

**Main App** — Central state manager. Holds `isLoading`, `studyData`, and `error` state. Distributes data to child components via props. Has two data paths: `POST /generate` for new topics and `GET /topics/:id` for reloading saved topics. Receives `scoreComplete` event from Quiz Card.

**API Client** — Single point of contact between frontend and backend. Exposes three functions: `generateTopic(topic)`, `getTopics()`, and `getTopicById(id)`. Handles base URL configuration and error parsing. Main App calls the API Client via function calls and receives parsed data back.

**TopicInput** — Text input with validation. Emits `submitTopic` event to Main App when user submits a non-empty topic.

**FlashcardList** — Displays flashcards as interactive flip cards. Accepts a `flashcards` prop (array of `{ q, a }` objects). Uses reactive `flipped` state for click-to-flip interaction. Color-coded labels distinguish questions from answers.

**SummaryCard** — Displays the generated summary. Accepts a `summary` prop. Shows past topics with timestamps and supports reload by click.

**Quiz Card** — Displays MCQ questions. Handles answer selection, score tracking, and emits `scoreComplete` event back to Main App when the quiz is finished.

### Backend — Middleware Layer

**CORS** — Enables cross-origin requests from the frontend dev server.

**JSON Parser** — Parses incoming JSON request bodies.

**Error Handler** — Catches uncaught exceptions from the Route Layer and Service Layer. Returns a consistent error response shape to the frontend.

### Backend — Route Layer

**GET / (Health Check)** — Returns server status. Passes a status object to the Response Formatter.

**POST /generate** — Entry point for new topic generation. Receives the topic from the frontend, passes raw input to the Input Validator, and delegates the validated topic to the Generation Orchestrator in the Service Layer.

**Topic Routes** — Handles `GET /topics` (list all topics) and `GET /topics/:id` (single topic with flashcards and quiz). For `/topics/:id`, passes the ID to the Input Validator before querying.

**Input Validator** — Centralized validation module shared by both `POST /generate` and `GET /topics/:id`. Checks that the topic string is non-empty, enforces a character limit, sanitizes the input, and validates that IDs are integers. On validation failure, short-circuits to the Response Formatter with a validation error (bypassing the Service Layer entirely).

**Response Formatter** — Single exit point for all backend responses. Attaches topic IDs to responses and ensures a consistent shape across success and error paths. Every route and service result passes through this module before reaching the frontend.

### Backend — Service Layer

**Generation Orchestrator** — Coordinates the full `/generate` flow. Receives the validated topic from the Input Validator, calls the AI Service Client to produce study materials, receives the structured JSON response, then passes the AI results to the Database Service for persistence. Returns the saved data (with the database-generated ID) to the Response Formatter. On AI failure, formats an error response and sends it to the Response Formatter via the error path.

**AI Service Client** — Sends HTTP POST requests to the Python AI service at `/ai/generate`. Receives structured JSON containing summary, flashcards, and quiz data. Handles timeout and retry logic. On failure, returns an error to the Generation Orchestrator.

**Database Service** — Handles all database operations. Inserts topics and their associated study materials (flashcards, quizzes) into the database. Queries topics by user, queries single topics by ID with joined flashcards and quizzes. Returns saved data with the database-generated ID to the Response Formatter (for GET routes) or back to the Generation Orchestrator (for the generate flow).

### AI Service (Python FastAPI + LangChain)

**API Layer** — Exposes two endpoints: `GET /` for health check and `POST /ai/generate` to trigger the LangChain pipeline. Receives a topic string and passes it into the pipeline.

**LangChain Pipeline** — Runs three sequential LLM calls, each building on the output of the previous step:

Step 1 (Summary Generation) takes the topic string, constructs a prompt with summary context, makes an LLM call, and parses the summary text.

Step 2 (Flashcard Generation) takes the topic and the summary from Step 1, constructs a prompt, makes an LLM call, and parses Q/A pairs.

Step 3 (Quiz Generation) takes the topic, summary, and flashcards from the previous steps, constructs a prompt, makes an LLM call, and parses an MCQ array.

**Output Parser** — Assembles the three outputs into a single JSON response: `{ summary, flashcards: [{ q, a }], quiz: [{ question, choices, answerIndex }] }`.

### Database (SQLite)

Three tables with one-to-many relationships from `topics` to both `flashcards` and `quizzes`.

**topics** — `id` (INTEGER PK), `title` (TEXT), `summary` (TEXT), `created_at` (TIMESTAMP).

**flashcards** — `id` (INTEGER PK), `topic_id` (INTEGER FK → topics.id), `question` (TEXT), `answer` (TEXT).

**quizzes** — `id` (INTEGER PK), `topic_id` (INTEGER FK → topics.id), `question` (TEXT), `choices_json` (TEXT), `correct_index` (INTEGER).

## Request Flows

### 1. Generating a New Topic

1. User types a topic in TopicInput and submits.
2. TopicInput emits `submitTopic` to Main App.
3. Main App calls `apiClient.generateTopic(topic)`.
4. API Client sends `POST /generate` to the backend.
5. Request passes through Middleware Layer (CORS → JSON parser).
6. POST /generate route passes raw input to Input Validator.
7. Input Validator checks non-empty, character limit, and sanitization.
8. Validated topic passes to Generation Orchestrator.
9. Orchestrator calls AI Service Client with the topic string.
10. AI Service Client sends `HTTP POST /ai/generate(topic)` to the Python AI service.
11. LangChain pipeline runs: summary → flashcard generation → quiz generation.
12. Output Parser assembles structured JSON and returns it to the AI Service Client.
13. AI Service Client returns JSON response to the Orchestrator.
14. Orchestrator passes AI results to Database Service for persistence.
15. Database Service inserts into topics, flashcards, and quizzes tables.
16. Database Service returns saved data + database-generated ID.
17. Response Formatter attaches consistent response shape.
18. HTTP response travels back to API Client.
19. API Client parses response and returns data to Main App.
20. Main App distributes data to SummaryCard, FlashcardList, and Quiz Card via props.

### 2. Loading History List

1. User navigates to the history route.
2. History component triggers `apiClient.getTopics()`.
3. API Client sends `GET /topics` to the backend.
4. Request passes through Middleware Layer.
5. Topic Routes handler forwards the query to Database Service.
6. Database Service runs `SELECT` on topics table, ordered by `created_at DESC`.
7. Database Service sends query results to Response Formatter.
8. Response Formatter wraps data in consistent shape and sends HTTP response.
9. API Client parses response, returns to Main App.
10. History component renders the list of past topics with timestamps.

### 3. Reloading a Saved Topic

1. User clicks a topic in the History list.
2. History component tells the Router to navigate to `/study/:id`.
3. Main App reads the route params and calls `apiClient.getTopicById(id)`.
4. API Client sends `GET /topics/:id` to the backend.
5. Request passes through Middleware Layer.
6. Topic Routes handler passes the ID to Input Validator.
7. Input Validator checks that the ID is a valid integer.
8. Validated ID is forwarded to Database Service.
9. Database Service runs `SELECT` on topics joined with flashcards and quizzes.
10. Database Service sends query results to Response Formatter.
11. Response Formatter wraps data and sends HTTP response.
12. API Client parses response and returns to Main App.
13. Main App populates the study view with the saved topic's data.

### 4. Health Check

1. API Client (or external monitor) sends `GET /` to the backend.
2. Request passes through Middleware Layer.
3. GET / handler returns a status object to Response Formatter.
4. Response Formatter wraps and sends HTTP response.

## Error Handling

Three error paths exist in the system, each handled differently but all producing the same response shape.

**Validation Errors** — When the Input Validator detects invalid input (empty topic, exceeded character limit, non-integer ID), it short-circuits directly to the Response Formatter, bypassing the Service Layer entirely. The Response Formatter wraps the error and returns it to the frontend.

**AI Service Failures** — When the Python AI service times out or returns an error, the AI Service Client catches the failure and returns an error to the Generation Orchestrator. The Orchestrator formats an error object and passes it to the Response Formatter via the dashed error path. The frontend receives the error and displays it in the error state.

**Uncaught Exceptions** — Any unhandled error in the Route Layer or Service Layer is caught by the error handler middleware. It formats a generic error response and returns it to the frontend.

All error responses follow the shape: `{ success: false, error: "descriptive message" }`.
All success responses follow the shape: `{ success: true, data: { ... } }`.

## Database Schema

The database uses three tables connected by foreign keys. Each topic is the parent entity, with flashcards and quizzes as children.

A single topic generates one summary (stored in the topics table), multiple flashcards (each a question-answer pair), and multiple quiz questions (each an MCQ with choices stored as JSON and a correct answer index).

The `created_at` timestamp on the topics table drives the history feature, allowing the frontend to display topics in reverse chronological order.

`choices_json` in the quizzes table stores the MCQ options as a JSON string (e.g., `'["option A", "option B", "option C"]'`). This avoids creating a separate table for quiz choices, keeping the schema lean.

## Design Decisions

**Why a separate Generation Orchestrator?** The Orchestrator separates coordination logic from route handlers and keeps AI and database concerns decoupled. Without it, the POST /generate route would directly call the AI client, handle its response, call the database, handle persistence, and format the output — mixing routing, orchestration, and error handling in one place. The Orchestrator makes the service layer independently testable and keeps the route layer thin.

**Why Input Validator as a distinct module?** Centralizing validation in one module allows both POST /generate (validating topic strings) and GET /topics/:id (validating integer IDs) to share the same pipeline without duplicating logic inside each route handler. It also creates a clean short-circuit path: invalid input goes directly to the Response Formatter without touching the Service Layer.

**Why API Client on the frontend?** The API Client provides a single source of truth for HTTP communication. Main App depends on function calls (`generateTopic`, `getTopics`, `getTopicById`) rather than raw fetch calls with hardcoded URLs. This makes the frontend testable (mock the API Client), portable (change the base URL in one place), and readable (Main App code describes intent, not HTTP mechanics).

**Why Python AI service over in-process Node LLM calls?** Isolating the AI pipeline as a separate HTTP service means it can be scaled, restarted, or replaced without touching the Node backend. It also allows LangChain's Python ecosystem (prompt templates, output parsers, chain composition) to be used natively rather than through limited JavaScript ports. The HTTP boundary between backend and AI service makes the system language-agnostic at that interface.

**Why Response Formatter as a dedicated module?** A single exit point guarantees that every response — whether from a successful generation, a database query, a validation error, or an AI failure — follows the same shape. The frontend can rely on checking `success: true/false` without handling different formats from different endpoints.

**Why does Database Service return the ID rather than the Orchestrator?** The topic ID is generated by SQLite on insert. Since the Database Service performs the insert, it is the first module that knows the ID. Having it attach the ID and return the complete saved payload keeps responsibility local — the Orchestrator doesn't need to query the database a second time to retrieve what was just inserted.

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Vue 3 + Vite | Reactive UI with component architecture |
| Styling | TailwindCSS v4 | Utility-first CSS with dark theme |
| Backend | Node.js + Express | API server with layered architecture |
| AI Service | Python FastAPI | LLM pipeline host |
| AI Framework | LangChain | Sequential prompt chaining and output parsing |
| Database | SQLite | Lightweight relational persistence |

## Future Extensions

The architecture is designed to accommodate these additions without structural refactoring:

**Authentication middleware** slots into the Middleware Layer between JSON parser and the Route Layer.

**Caching layer** can be added between the Generation Orchestrator and AI Service Client to skip LLM calls for previously generated topics.

**Multiple AI providers** can be supported by making the AI Service Client an interface with swappable implementations behind it.

**Spaced repetition** can be added as a new service-layer module that reads flashcard history from the Database Service and schedules review sessions.

**Rate limiting** can be added as middleware to prevent abuse of the `/generate` endpoint.
