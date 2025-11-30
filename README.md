# AI Study Buddy

**AI Study Buddy** is a compact full‑stack project that generates concise explanations, flashcards, and short quizzes for any study topic. It’s built with **Vue 3 + TailwindCSS** on the frontend, **Node + Express** for the API, **SQLite** for local persistence, and a small Python AI service (with LangChain integration) for generation. This repo was designed as a focused 10‑day sprint project to demonstrate a complete pipeline (UI → backend → AI → DB) suitable for portfolios and interviews.

---

## Quick demo (what it does)
1. User types a study topic (e.g. "Fourier Transform").
2. Frontend sends the topic to the backend `POST /generate` endpoint.
3. Backend forwards the request to the local AI service (LangChain pipeline) which returns structured JSON:
   - `summary` — short explanation
   - `flashcards` — array of Q/A pairs
   - `quiz` — array of MCQs
4. Backend saves the generated content in the database and returns it to the frontend.
5. User reads the summary, studies flashcards, or takes the quick quiz. Past topics are visible from History.

---

## Features
- Topic input and immediate AI-generated **summary**
- Generated **flashcards** (Q/A) to study
- Short **quiz** (Multiple Choice Questions)
- **History** of saved topics and results
- Local persistence with SQLite
- Clean responsive UI using TailwindCSS and Vue components
- AI orchestration via LangChain (summary → flashcards → quiz)

---

## Tech Stack
- Frontend: Vue 3 (Vite) + TailwindCSS
- Backend: Node.js + Express
- Database: SQLite (better-sqlite3 or Sequelize)
- AI Service: Python (FastAPI or Flask) + Hugging Face models (small T5/Flan or local LLM) + LangChain
- Dev / Deployment: Git, Vercel/Netlify (frontend), Render/Railway (backend)

---

## Folder structure (recommended)
```
ai-study-buddy/
├─ client/               # Vue + Tailwind frontend (Vite)
│  ├─ src/
│  │  ├─ components/     # TopicInput.vue, ResultCard.vue, HistoryList.vue, etc.
│  │  ├─ assets/         # main.css (Tailwind imports)
│  │  └─ App.vue
│  └─ index.html
├─ server/               # Node + Express backend
│  ├─ routes/
│  │  ├─ generate.js     # POST /generate
│  │  └─ topics.js       # GET /topics, POST /save
│  ├─ db/                # SQLite schema and migrations
│  └─ index.js
├─ ai_service/           # Python AI server (FastAPI/Flask)
│  ├─ main.py            # endpoints (generate_summary)
│  ├─ chain.py           # LangChain chain definitions
│  └─ model_utils.py     # model loading / helpers
└─ README.md
```

---

## API Endpoints (minimum)
- `POST /generate`
  - Request body: `{ "topic": "string", "userId": "optional" }`
  - Behavior: calls AI service, saves result to DB, returns structured JSON
  - Response example:
    ```json
    {
      "summary": "...",
      "flashcards": [{"q":"...","a":"..."}],
      "quiz": [{"question":"...","choices":["a","b","c"],"answerIndex":1}]
    }
    ```

- `GET /topics`
  - Returns a list of stored topics and metadata for the current user.

- `GET /topics/:id`
  - Returns stored detail for a single topic (summary, flashcards, quiz).

- `POST /save` (optional)
  - Save user-generated or edited content into the DB.

---

## Database Schema (simple)
- `users` (optional): `id, email, password_hash, created_at`
- `topics`: `id, user_id (nullable), title, summary, created_at`
- `flashcards`: `id, topic_id, question, answer`
- `quizzes`: `id, topic_id, question, choices_json, correct_index`

Use foreign keys (`topic_id`) to connect flashcards and quizzes to their topic.

---

## LangChain & AI notes
- LangChain is used to orchestrate the generation steps. Typical chain flow:
  1. Prompt → generate `summary`.
  2. Prompt (with summary context) → generate `flashcards` (2–4 Q/A pairs).
  3. Prompt (with summary + flashcards) → generate `quiz` (2–3 MCQs).

- Use prompt templates and output parsers to get stable JSON back from the model.
- Start with small, fast models (Flan-T5, distilled T5) during development and switch to larger models when ready.
- If you plan to host a custom model later, expose a small HTTP interface that the Node backend can call.

---

## Development Setup (local)
1. Clone repo
   ```bash
   git clone <your-repo-url>
   cd ai-study-buddy
   ```
2. Frontend
   ```bash
   cd client
   npm install
   npm run dev
   ```
3. Backend
   ```bash
   cd ../server
   npm install
   # configure .env (DB path, AI service URL)
   node index.js
   ```
4. AI Service (Python)
   ```bash
   cd ../ai_service
   python -m venv .venv
   source .venv/bin/activate  # or .\venv\Scripts\activate on Windows
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8001
   ```
5. Point backend `.env` to `http://localhost:8001` for AI calls.

---

## Deployment Notes
- Frontend: deploy to Vercel/Netlify (Vite builds easily). Configure environment variables for the backend URL.
- Backend: Render or Railway (Docker or Node environment). Ensure your DB is persistent (Postgres recommended for production).
- AI Service: Host on a GPU-enabled service if using large models. For prototype, small CPU models are okay.

---

## Interview talking points
- Explain the pipeline: Vue UI → Express API → LangChain-powered Python service → SQLite storage.
- Explain why LangChain: structured orchestration of multi-step LLM tasks and reusability of prompt templates.
- Discuss trade-offs: SQLite vs Postgres, small local model vs hosted larger model, latency & cost considerations.

---

## Future improvements
- Add Spaced-Repetition scheduling for flashcards (SRS).
- Use a vector DB (FAISS, Milvus, or Pinecone) for semantic search over all studied content.
- Add user profiles and progress analytics.
- Convert frontend to React Native or use Capacitor for Play Store distribution.

---

## Contributing
This project is yours — hack aggressively. Create branches per feature, keep commits small, and write a short PR description for major changes.

---

