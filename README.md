# AI Study Buddy

**AI Study Buddy** is a full-stack web application that generates study materials (summaries, flashcards, and quizzes) for any topic. Built with **Vue 3 + TailwindCSS** on the frontend and **Node.js + Express** for the API. Designed as a learning project to demonstrate a complete UI-to-backend pipeline.

---

## How It Works

1. User types a study topic (e.g. "Fourier Transform").
2. Frontend sends the topic to the backend via `POST /generate`.
3. Backend returns structured JSON containing a summary, flashcards, and quiz data.
4. User reads the summary and studies with interactive flip flashcards.

---

## Features (Implemented)

- Topic input with validation
- AI-generated **summary** display
- Interactive **flashcards** (click to flip between question and answer)
- Loading and error state handling
- Dark-themed glassmorphism UI with gradients

## Features (Planned)

- Actual LLM/AI integration (currently returns placeholder data)
- **Quiz** component UI (data is generated but not displayed)
- Topic **history** and persistence (database)
- User authentication and profiles
- Spaced repetition scheduling

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vue 3 (Vite) + TailwindCSS v4 |
| Backend | Node.js + Express |
| AI Service | Python FastAPI (placeholder) |
| Database | Not yet integrated |

---

## Project Structure

```
AI_Study_Buddy/
├── client/                  # Vue 3 + TailwindCSS frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── TopicInput.vue       # Topic input form
│   │   │   ├── SummaryCard.vue      # Summary display card
│   │   │   └── FlashcardList.vue    # Interactive flip flashcards
│   │   ├── App.vue                  # Main app (state + API calls)
│   │   ├── main.js                  # Entry point
│   │   └── style.css                # TailwindCSS imports
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                  # Express backend
│   ├── index.js             # API server with /generate endpoint
│   ├── main.py              # Python FastAPI placeholder
│   └── package.json
│
├── README.md
└── DEVELOPMENT_GUIDE.md
```

---

## API Endpoints

### `POST /generate`

Accepts a topic and returns study materials.

**Request:**
```json
{ "topic": "Photosynthesis" }
```

**Response:**
```json
{
  "summary": "...",
  "flashcards": [{ "q": "...", "a": "..." }],
  "quiz": [{ "question": "...", "choices": ["a", "b", "c"], "answerIndex": 1 }]
}
```

> Note: Currently returns placeholder data. AI integration is planned.

---

## Development Setup

### Frontend
```bash
cd client
npm install
npm run dev
```
Runs on `http://localhost:5173`

### Backend
```bash
cd server
npm install
npm start        # or: npm run dev (with nodemon)
```
Runs on `http://localhost:3000`

### Python AI Service (placeholder)
```bash
cd server
python -m venv venv
.\venv\Scripts\activate   # Windows
pip install fastapi uvicorn
uvicorn main:app --reload --port 8001
```

---

## Future Improvements

- Integrate an LLM (via LangChain or direct API) for real content generation
- Add SQLite or MongoDB for topic persistence and history
- Build quiz interaction UI with answer checking and scoring
- Add user profiles and progress tracking
- Spaced repetition scheduling for flashcards
- Deployment to Vercel (frontend) and Render/Railway (backend)

---

## Contributing

Create branches per feature, keep commits small, and write short PR descriptions for major changes.
