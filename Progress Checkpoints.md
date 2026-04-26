# AI Study Buddy — Progress Checkpoints

Progress measured against the [ARCHITECTURE.md](ARCHITECTURE.md) blueprint. Each component listed below is a block from the architecture diagram. Percentage reflects how much of the *intended* behavior of that block currently exists in code.

---

## Overall Progress

| Tier | Progress |
|------|----------|
| Frontend (Vue 3) | **38%** |
| Backend — Middleware Layer | **67%** |
| Backend — Route Layer | **28%** |
| Backend — Service Layer | **0%** |
| AI Service (Python) | **10%** |
| Database (SQLite) | **0%** |
| Documentation | **100%** |
| **Total system** | **~24%** |

---

## Frontend (Vue 3 + TailwindCSS)

| Component | Status | % | Notes |
|-----------|--------|---|-------|
| TopicInput | Built | **100%** | Input + validation + `submitTopic` emit working ([TopicInput.vue](client/src/components/TopicInput.vue)) |
| FlashcardList | Built | **100%** | Click-to-flip with reactive `flipped` state ([FlashcardList.vue](client/src/components/FlashcardList.vue)) |
| SummaryCard | Built | **80%** | Renders summary prop. Missing: timestamp display + reload-on-click ([SummaryCard.vue](client/src/components/SummaryCard.vue)) |
| Main App | Partial | **45%** | Has `isLoading`, `studyData`, `error`, and `POST /generate` flow. Missing: route param handling, `GET /topics/:id` path, `scoreComplete` listener ([App.vue](client/src/App.vue)) |
| Quiz Card | Not built | **0%** | MCQ display, answer selection, score tracking, `scoreComplete` emit |
| API Client | Not built | **0%** | Currently raw `fetch()` inside App.vue. Needs `generateTopic`, `getTopics`, `getTopicById` |
| Router | Not built | **0%** | `vue-router` not installed. No `/home`, `/study/:id`, `/history` routes |
| HistoryPage | Not built | **0%** | List view of past topics with timestamps |
| StudyPage | Not built | **0%** | Currently App.vue serves all roles. Needs split for routing |

---

## Backend — Middleware Layer

| Component | Status | % | Notes |
|-----------|--------|---|-------|
| CORS | Built | **100%** | `app.use(cors())` ([index.js:5](server/index.js#L5)) |
| JSON Parser | Built | **100%** | `app.use(express.json())` ([index.js:6](server/index.js#L6)) |
| Error Handler | Not built | **0%** | No error-handling middleware defined |

---

## Backend — Route Layer

| Component | Status | % | Notes |
|-----------|--------|---|-------|
| GET / (Health Check) | Built | **100%** | Returns status JSON ([index.js:8-12](server/index.js#L8-L12)) |
| POST /generate | Stub | **30%** | Endpoint exists but returns hardcoded dummy data. No AI call, no DB persistence, no orchestrator delegation ([index.js:14-44](server/index.js#L14-L44)) |
| Input Validator | Minimal | **10%** | Inline `if (!topic)` check only. No char-limit, no sanitization, no integer-ID validation, not a separate module |
| Response Formatter | Not built | **0%** | Raw `res.json()` calls; no consistent `{ success, data }` envelope |
| Topic Routes (`GET /topics`, `GET /topics/:id`) | Not built | **0%** | History list and single-topic reload endpoints |

---

## Backend — Service Layer

| Component | Status | % | Notes |
|-----------|--------|---|-------|
| Generation Orchestrator | Not built | **0%** | Coordinates AI call → DB save → response shaping |
| AI Service Client | Not built | **0%** | HTTP POST to Python `/ai/generate` with timeout/retry |
| Database Service | Not built | **0%** | All SQLite read/write logic |

---

## AI Service (Python FastAPI + LangChain)

| Component | Status | % | Notes |
|-----------|--------|---|-------|
| API Layer — `GET /` health | Built | **100%** | FastAPI app + health endpoint ([main.py](server/main.py)) |
| API Layer — `POST /ai/generate` | Not built | **0%** | Pipeline trigger endpoint missing |
| LangChain Step 1 — Summary | Not built | **0%** | Prompt template + LLM call + parse |
| LangChain Step 2 — Flashcards | Not built | **0%** | Takes topic + summary, outputs Q/A pairs |
| LangChain Step 3 — Quiz | Not built | **0%** | Takes topic + summary + flashcards, outputs MCQ array |
| Output Parser | Not built | **0%** | Assembles three step outputs into final JSON |

LangChain itself is not yet installed in the Python environment.

---

## Database (SQLite)

| Component | Status | % | Notes |
|-----------|--------|---|-------|
| SQLite setup / connection | Not built | **0%** | No driver installed (`sqlite3`/`better-sqlite3`), no DB file initialized |
| `topics` table | Not built | **0%** | `id`, `title`, `summary`, `created_at` |
| `flashcards` table | Not built | **0%** | `id`, `topic_id` FK, `question`, `answer` |
| `quizzes` table | Not built | **0%** | `id`, `topic_id` FK, `question`, `choices_json`, `correct_index` |

---

## Documentation

| Document | Status | % |
|----------|--------|---|
| README.md | Complete | **100%** |
| DEVELOPMENT_GUIDE.md | Complete | **100%** |
| ARCHITECTURE.md | Complete | **100%** |
| diagram.png | Complete | **100%** |

---

## What to Build Next (Recommended Order)

The dependency chain in the blueprint suggests building bottom-up so each layer has something real to call:

1. **Quiz Card component** — closes out the frontend's display surface so the existing `POST /generate` dummy data is fully visualized.
2. **SQLite + Database Service** — schema first, then the Node module that reads/writes it.
3. **Refactor `POST /generate`** — extract Input Validator, Response Formatter, and Generation Orchestrator into separate modules. Wire the Orchestrator → Database Service so generated content gets persisted (still using dummy AI output).
4. **Topic Routes** (`GET /topics`, `GET /topics/:id`) — needed before history flow can exist.
5. **Frontend API Client + Vue Router + HistoryPage + StudyPage split** — enables history navigation and reload.
6. **Python `POST /ai/generate` endpoint + LangChain pipeline** — replaces the dummy data path.
7. **AI Service Client in Node** — Orchestrator calls Python instead of returning hardcoded values.
8. **Error Handler middleware** — unified error path once real failures can occur.
