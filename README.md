# AI Study Buddy

A full-stack study tool that turns any topic into a summary, a set of flashcards, and an interactive quiz, then keeps every topic so you can come back to it.

Built as a learning project covering Vue 3, Express, SQLite, and a LangChain pipeline behind a FastAPI service.

---

## Quick Start

Three processes run together. Open three terminals.

**0. One-time setup**

```bash
# Node dependencies
cd client && npm install && cd ..
cd server && npm install

# Python virtual environment for the AI service (still inside server/)
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt

# Configuration — one file, read by both Express and Python
copy .env.example .env
```

Open `server/.env` and paste your Anthropic API key into `ANTHROPIC_API_KEY=`.
Leave `USE_MOCK_AI=false` so Express calls the real pipeline. Set it to `true` to
run with hard-coded placeholder content and no key at all.

**1. AI service** (Python FastAPI, port 8001)
```bash
cd server
.\.venv\Scripts\activate
uvicorn main:app --reload --port 8001
```

**2. Backend** (Express, port 3000)
```bash
cd server
npm start
```
`npm start` passes `--env-file-if-exists=.env` to Node, which is how `.env` is
loaded. A bare `node index.js` does not read it.

**3. Frontend** (Vue 3 + Vite, port 5173)
```bash
cd client
npm run dev
```

Open http://localhost:5173, type a topic, click **Generate**.

---

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | Vue 3 (Vite) + Vue Router + TailwindCSS v4 |
| Backend | Node.js + Express + better-sqlite3 |
| AI service | Python FastAPI + LangChain + Anthropic Claude |
| Database | SQLite, three tables, file at `server/data/study.db` |

---

## How It Works

1. **HomePage** takes a topic and calls `POST /generate` through `apiClient.js`.
2. Express validates the topic, asks the Python service for study material, saves it in SQLite in one transaction, and returns the new topic's id.
3. The frontend navigates to `/study/:id`. **StudyPage** always loads a topic by id from `GET /topics/:id`, so a freshly generated topic and one reopened from history render through the same path.
4. **HistoryPage** lists every saved topic from `GET /topics`, newest first.

For the full system design, see [ARCHITECTURE.md](ARCHITECTURE.md) and `diagram.png`.

---

## API (Express, port 3000)

Every response is wrapped in an envelope, so a caller can tell success from
failure with a single property check and never has to consult the status code.

```json
{ "success": true,  "data": ... }
{ "success": false, "error": "a sentence safe to show the user" }
```

### `POST /generate`
Request: `{ "topic": "Photosynthesis" }`

Success:
```json
{
  "success": true,
  "data": {
    "id": 9,
    "summary": "...",
    "flashcards": [{ "q": "...", "a": "..." }],
    "quiz": [{ "question": "...", "choices": ["a", "b", "c"], "answerIndex": 1 }]
  }
}
```
`400` for a missing, empty, or over-long topic. A failure further down (AI service, database) also comes back as a failure envelope.

### `GET /topics`
The history list: `{ success: true, data: [{ id, title, created_at }] }`, newest first. Deliberately lightweight, no flashcards or quiz.

### `GET /topics/:id`
One saved topic in full, including flashcards and quiz. `400` if the id is not a positive whole number, `404` if no such topic exists.

### `GET /`
Health check.

---

## The AI pipeline (FastAPI, port 8001)

`POST /ai/generate` with `{ "topic": "..." }` runs three LangChain steps in order, each one feeding the next:

1. **Summary** — topic in, a plain-language explanation out.
2. **Flashcards** — receives the summary, so the cards test what was actually taught rather than drifting onto unrelated facts.
3. **Quiz** — receives the summary *and* the flashcards, so questions cover the material without repeating the cards.

`ai/output_parser.py` then enforces the shape the frontend reads. Model replies are not trusted to be clean JSON: code fences, stray prose and malformed entries are handled there rather than reaching Vue as `undefined`.

The service answers `502` when the model's output was unusable (a retry may work) and `500` for anything else. The Express side, in `aiServiceClient.js`, applies a 60-second timeout and retries once on a timeout or a 5xx, never on a 4xx.

The Express server never imports LangChain and never sees the API key. It only knows the Python service's URL.

---

## Project Structure

```
AI_Study_Buddy/
├── client/                         # Vue 3 + Vue Router + Tailwind
│   └── src/
│       ├── api/apiClient.js        # the only place that calls the backend
│       ├── router/index.js         # /, /study/:id, /history
│       ├── pages/
│       │   ├── HomePage.vue        # topic box, navigates to /study/:id
│       │   ├── StudyPage.vue       # loads one topic by id, renders the three cards
│       │   └── HistoryPage.vue     # list of past topics
│       ├── components/
│       │   ├── TopicInput.vue
│       │   ├── SummaryCard.vue
│       │   ├── FlashcardList.vue   # click-to-flip
│       │   └── QuizCard.vue        # one question at a time, score at the end
│       ├── App.vue                 # header, nav, <RouterView />
│       └── main.js
├── server/
│   ├── index.js                    # Express wiring: middleware, routes, error handler
│   ├── routes/topicRoutes.js       # GET /topics, GET /topics/:id
│   ├── middleware/
│   │   ├── inputValidator.js       # validateTopic, validateTopicId
│   │   └── errorHandler.js         # last-resort 500 envelope
│   ├── services/
│   │   ├── generationOrchestrator.js
│   │   ├── aiServiceClient.js      # HTTP client for the Python service, timeout + retry
│   │   ├── mockAiService.js        # placeholder content when USE_MOCK_AI=true
│   │   └── databaseService.js      # prepared statements, one transaction per topic
│   ├── utils/responseFormatter.js  # the envelope
│   ├── db/                         # schema.sql, connection.js
│   ├── main.py                     # FastAPI: GET /, POST /ai/generate
│   ├── ai/                         # model.py, the three chains, pipeline.py, output_parser.py
│   ├── requirements.txt
│   └── .env.example
├── ARCHITECTURE.md
├── diagram.png                     # the binding system diagram
└── README.md
```
