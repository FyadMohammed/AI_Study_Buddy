# AI Study Buddy

A full-stack study tool that turns any topic into a summary, a set of flashcards, and an interactive quiz.

Built as a learning project covering Vue 3, Express, and FastAPI.

---

## Quick Start

Three processes run together. Open three terminals.

**1. Frontend** (Vue 3 + Vite, port 5173)
```bash
cd client
npm install
npm run dev
```

**2. Backend** (Express, port 3000)
```bash
cd server
npm install
npm start
```

**3. AI service** (Python FastAPI, port 8001)
```bash
cd server
python -m venv venv
.\venv\Scripts\activate
pip install fastapi uvicorn
uvicorn main:app --reload --port 8001
```

Open http://localhost:5173, type a topic, click **Generate**.

---

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | Vue 3 (Vite) + TailwindCSS v4 |
| Backend | Node.js + Express |
| AI service | Python FastAPI |

---

## How It Works

1. User submits a topic from the **TopicInput** component.
2. `App.vue` sends `POST /generate` to the Express backend.
3. Express returns a JSON payload with `summary`, `flashcards`, and `quiz`.
4. The UI renders the **SummaryCard**, **FlashcardList** (click-to-flip), and **QuizCard** (one question at a time, score at the end).

For the full system design, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## API

### `POST /generate`

Request:
```json
{ "topic": "Photosynthesis" }
```

Response:
```json
{
  "summary": "...",
  "flashcards": [{ "q": "...", "a": "..." }],
  "quiz": [{ "question": "...", "choices": ["a", "b", "c"], "answerIndex": 1 }]
}
```

### `GET /`
Health check. Returns `{ message: "AI Study Buddy API (Express) is running!" }`.

---

## Project Structure

```
AI_Study_Buddy/
├── client/                       # Vue 3 + TailwindCSS frontend
│   └── src/
│       ├── components/
│       │   ├── TopicInput.vue     # Topic submission form
│       │   ├── SummaryCard.vue    # Summary display
│       │   ├── FlashcardList.vue  # Click-to-flip flashcards
│       │   └── QuizCard.vue       # Multi-step quiz with score
│       ├── App.vue                # State + API call
│       └── main.js
├── server/
│   ├── index.js                   # Express API
│   └── main.py                    # FastAPI service
├── ARCHITECTURE.md                # System blueprint + diagram
└── README.md
```
