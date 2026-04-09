# AI Study Buddy - Development Guide

## Project Overview

**AI Study Buddy** generates study materials (summaries, flashcards, quizzes) for any topic using a Vue 3 frontend and Express backend.

### Tech Stack
- **Frontend**: Vue 3 + Vite + TailwindCSS v4
- **Backend**: Node.js + Express
- **AI Service**: Python FastAPI (placeholder, not yet integrated)
- **Database**: Not yet integrated

---

## Progress Tracker

### Phase 1: Project Foundation - COMPLETE

- [x] Initialize Vue 3 + Vite project
- [x] Set up TailwindCSS v4 with Vite plugin
- [x] Create TopicInput component with validation
- [x] Build dark-themed glassmorphism UI
- [x] Set up Express backend with CORS
- [x] Create `POST /generate` endpoint (placeholder data)
- [x] Connect frontend to backend via fetch API
- [x] Add loading and error state handling

### Phase 2: Study Components - IN PROGRESS

- [x] SummaryCard component for displaying topic summaries
- [x] FlashcardList component with click-to-flip interaction
- [ ] Quiz component UI (data exists but no display component)
- [ ] Answer checking and scoring logic for quizzes

### Phase 3: AI Integration - NOT STARTED

- [ ] Set up Python FastAPI service with actual LLM calls
- [ ] Integrate LangChain for structured generation pipeline
- [ ] Connect Express backend to Python AI service
- [ ] Replace placeholder data with real AI responses
- [ ] Add prompt templates for summary, flashcards, and quiz generation

### Phase 4: Database & Persistence - NOT STARTED

- [ ] Choose and integrate database (SQLite or MongoDB)
- [ ] Create schema for topics, flashcards, and quizzes
- [ ] Save generated content to database
- [ ] Build topic history page
- [ ] Add `GET /topics` and `GET /topics/:id` endpoints

### Phase 5: Polish & Deploy - NOT STARTED

- [ ] User authentication (optional)
- [ ] Responsive design refinement
- [ ] Error handling improvements
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Deploy backend to Render/Railway

---

## What's Built So Far

### Frontend Components

**App.vue** — Main application component
- Manages state: `isLoading`, `studyData`, `error`
- `handleTopicSubmit()` calls the backend and updates state
- Conditionally renders SummaryCard and FlashcardList

**TopicInput.vue** — Input form
- Text field with v-model binding
- Validates non-empty input before emitting `submitTopic`
- Styled with gradient button and frosted glass container

**SummaryCard.vue** — Summary display
- Accepts `summary` prop (String)
- Purple icon header with "Topic Summary" label
- Glassmorphism card styling

**FlashcardList.vue** — Interactive flashcards
- Accepts `flashcards` prop (Array of `{ q, a }` objects)
- Click-to-flip functionality using reactive `flipped` state
- Color-coded labels: purple for Question, green for Answer

### Backend

**server/index.js** — Express server
- `GET /` — Health check
- `POST /generate` — Returns placeholder summary, 3 flashcards, and 1 quiz MCQ
- CORS enabled, runs on port 3000

**server/main.py** — Python FastAPI placeholder
- Single health check endpoint, no AI logic yet

---

## Next Steps (Recommended Order)

1. **Build the Quiz component** — Display quiz questions, handle answer selection, show score
2. **Integrate real AI** — Connect to an LLM API for actual content generation
3. **Add database** — Persist topics and study materials
4. **Build history page** — Let users revisit past topics
5. **Deploy** — Ship it

---

## Key Concepts Used

| Concept | Where It's Used |
|---------|----------------|
| Vue 3 Composition API | All components (`ref`, `reactive`, `emit`) |
| Conditional rendering | `v-if` for loading/error/data states in App.vue |
| List rendering | `v-for` for flashcards in FlashcardList.vue |
| Event handling | `@click` for flip, `@submit` for topic input |
| Props & Events | Parent-child communication between App and components |
| Fetch API | App.vue calling `POST /generate` |
| Express middleware | CORS, JSON body parsing in server/index.js |
| TailwindCSS v4 | Utility-first styling across all components |
