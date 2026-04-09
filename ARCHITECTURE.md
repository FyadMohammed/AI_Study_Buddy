# AI Study Buddy - Architecture Blueprint

---

## System Architecture (Full Blueprint)

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                      USER (Browser)                                     │
│                                                                                         │
│   ┌──────────────┐     ┌──────────────────┐     ┌──────────────────────────────────┐   │
│   │  Types Topic  │     │  Reads Summary   │     │  Studies Flashcards & Quizzes   │   │
│   └──────┬───────┘     └────────▲─────────┘     └───────────────▲──────────────────┘   │
│          │ topic string         │ rendered views                 │ flip / answer         │
└──────────┼──────────────────────┼─────────────────────────────── ┼──────────────────────┘
           │                      │                                │
           ▼                      │                                │
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND — Vue 3 + Vite + TailwindCSS v4                         │
│                                http://localhost:5173                                     │
│                                                                                         │
│  ┌───────────────────────────────────────────────────────────────────────────────────┐  │
│  │                              Vue Router                                           │  │
│  │                                                                                   │  │
│  │          /home                    /study                    /history               │  │
│  │            │                        │                          │                   │  │
│  └────────────┼────────────────────────┼──────────────────────────┼───────────────────┘  │
│               │                        │                          │                      │
│               ▼                        ▼                          ▼                      │
│  ┌─────────────────┐    ┌──────────────────────────────┐    ┌──────────────────────┐   │
│  │                 │    │                              │    │                      │   │
│  │   HomePage.vue  │    │      StudyPage.vue           │    │  HistoryPage.vue     │   │
│  │                 │    │      (App.vue logic)         │    │                      │   │
│  │  - Welcome UI   │    │                              │    │  - GET /topics       │   │
│  │  - Navigate to  │    │  State:                      │    │  - List of past      │   │
│  │    /study       │    │   isLoading : boolean        │    │    topics            │   │
│  │                 │    │   studyData : object          │    │  - Click to reload   │   │
│  └─────────────────┘    │   error     : string         │    │    study data        │   │
│                         │                              │    │  - Timestamps        │   │
│                         │  Method:                     │    │                      │   │
│                         │   handleTopicSubmit()        │    └──────────────────────┘   │
│                         │     │                        │                               │
│                         │     │ fetch POST /generate   │                               │
│                         │     ▼                        │                               │
│                         │  Distributes data to:        │                               │
│                         └──┬──────────┬──────────┬─────┘                               │
│                            │          │          │                                      │
│                   props ▼  │ props ▼  │ props ▼  │                                      │
│                            │          │          │                                      │
│  ┌─────────────────┐  ┌───┴──────────┴──┐  ┌────┴────────────┐  ┌──────────────────┐  │
│  │ TopicInput.vue  │  │ SummaryCard.vue  │  │FlashcardList.vue│  │  QuizCard.vue    │  │
│  │                 │  │                  │  │                 │  │                  │  │
│  │ - Text input    │  │ - summary (prop) │  │ - flashcards   │  │ - quiz (prop)    │  │
│  │ - Validation    │  │ - Formatted text │  │   (prop)       │  │ - MCQ display    │  │
│  │ - Emits:        │  │ - Icon header    │  │ - Click-to-flip│  │ - Answer select  │  │
│  │   submitTopic ──┼──┼──> App.vue       │  │ - Q/A color    │  │ - Score tracking │  │
│  │                 │  │                  │  │   coding       │  │ - Result display │  │
│  │ State:          │  │ State:           │  │                │  │                  │  │
│  │  userTopic      │  │  (none)          │  │ State:         │  │ State:           │  │
│  │                 │  │                  │  │  flipped{}     │  │  selectedAnswers │  │
│  │                 │  │                  │  │                │  │  score           │  │
│  └─────────────────┘  └──────────────────┘  └────────────────┘  └──────────────────┘  │
│                                                                                         │
└──────────────────────────────────┬──────────────────────────────────────────────────────┘
                                   │
                                   │  HTTP Requests
                                   │  POST /generate  { topic }
                                   │  GET  /topics
                                   │  GET  /topics/:id
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                            BACKEND — Node.js + Express                                  │
│                                http://localhost:3000                                     │
│                                                                                         │
│  ┌───────────────────────────────────────────────────────────────────────────────────┐  │
│  │                            Middleware Layer                                        │  │
│  │                                                                                   │  │
│  │    ┌──────────────┐    ┌──────────────────┐    ┌────────────────────────────┐     │  │
│  │    │     CORS     │───>│  JSON Body       │───>│  Error Handler             │     │  │
│  │    │              │    │  Parser           │    │  (catch + format errors)   │     │  │
│  │    └──────────────┘    └──────────────────┘    └────────────────────────────┘     │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
│                                         │                                               │
│                                         ▼                                               │
│  ┌───────────────────────────────────────────────────────────────────────────────────┐  │
│  │                             Route Layer                                            │  │
│  │                                                                                   │  │
│  │   ┌───────────────────┐   ┌───────────────────────┐   ┌────────────────────────┐ │  │
│  │   │  GET /             │   │  POST /generate        │   │  Topic Routes          │ │  │
│  │   │                    │   │                         │   │                        │ │  │
│  │   │  Health check      │   │  1. Validate topic     │   │  GET  /topics          │ │  │
│  │   │  returns server    │   │  2. Call AI Service     │   │  ──> list all topics   │ │  │
│  │   │  status            │   │  3. Receive JSON       │   │                        │ │  │
│  │   │                    │   │  4. Save to Database    │   │  GET  /topics/:id      │ │  │
│  │   │                    │   │  5. Return response     │   │  ──> single topic +    │ │  │
│  │   │                    │   │     to frontend         │   │      flashcards + quiz │ │  │
│  │   └───────────────────┘   └───────────┬─────────────┘   └────────────┬───────────┘ │  │
│  │                                       │                              │             │  │
│  └───────────────────────────────────────┼──────────────────────────────┼─────────────┘  │
│                                          │                              │                │
│                          ┌───────────────┘                              │                │
│                          │                                              │                │
│  ┌───────────────────────┼──────────────────────────────────────────────┼─────────────┐  │
│  │                       │       Service Layer                          │             │  │
│  │                       │                                              │             │  │
│  │   ┌───────────────────▼──────────────┐    ┌──────────────────────────▼──────────┐ │  │
│  │   │  AI Service Client               │    │  Database Access Layer              │ │  │
│  │   │                                  │    │                                     │ │  │
│  │   │  - Sends POST to Python AI       │    │  - Insert topic + study data        │ │  │
│  │   │    service at :8001              │    │  - Query topics by user             │ │  │
│  │   │  - Receives structured JSON      │    │  - Query single topic by ID         │ │  │
│  │   │  - Handles timeout / retry       │    │  - Join flashcards + quizzes        │ │  │
│  │   │                                  │    │                                     │ │  │
│  │   └───────────────┬──────────────────┘    └──────────────────┬──────────────────┘ │  │
│  │                   │                                          │                    │  │
│  └───────────────────┼──────────────────────────────────────────┼────────────────────┘  │
│                      │                                          │                       │
└──────────────────────┼──────────────────────────────────────────┼───────────────────────┘
                       │                                          │
                       │  HTTP                                    │  DB Queries
                       │  POST /ai/generate { topic }             │  (SQL / Mongoose)
                       │                                          │
                       ▼                                          ▼
┌──────────────────────────────────────────┐  ┌──────────────────────────────────────────┐
│       AI SERVICE (Brain)                 │  │              DATABASE                     │
│       Python + FastAPI                   │  │              SQLite / MongoDB             │
│       http://localhost:8001              │  │                                           │
│                                          │  │  ┌───────────────────────────────────┐   │
│  ┌────────────────────────────────────┐ │  │  │          topics                    │   │
│  │          API Layer                 │ │  │  │  ┌─────────────────────────────┐   │   │
│  │                                    │ │  │  │  │ id          INTEGER PK      │   │   │
│  │  GET  /           ──> health check │ │  │  │  │ title       TEXT            │   │   │
│  │  POST /ai/generate ──> pipeline    │ │  │  │  │ summary     TEXT            │   │   │
│  │                                    │ │  │  │  │ created_at  DATETIME        │   │   │
│  └──────────────┬─────────────────────┘ │  │  │  └─────────────────────────────┘   │   │
│                 │                        │  │  │              │ 1                   │   │
│                 │ topic string           │  │  │              │                     │   │
│                 ▼                        │  │  │              │ has many             │   │
│  ┌────────────────────────────────────┐ │  │  │              ▼                     │   │
│  │        LangChain Pipeline          │ │  │  │  ┌─────────────────────────────┐   │   │
│  │                                    │ │  │  │  │       flashcards             │   │   │
│  │  ┌──────────────────────────────┐ │ │  │  │  │ id          INTEGER PK      │   │   │
│  │  │  Step 1: Summary Generation  │ │ │  │  │  │ topic_id    INTEGER FK ─────┼───┤   │
│  │  │                              │ │ │  │  │  │ question    TEXT            │   │   │
│  │  │  Prompt Template             │ │ │  │  │  │ answer      TEXT            │   │   │
│  │  │  ──> LLM Call                │ │ │  │  │  └─────────────────────────────┘   │   │
│  │  │  ──> Parse summary text      │ │ │  │  │              │ 1                   │   │
│  │  └──────────────┬───────────────┘ │ │  │  │              │                     │   │
│  │                 │ summary          │ │  │  │              │ has many             │   │
│  │                 ▼                  │ │  │  │              ▼                     │   │
│  │  ┌──────────────────────────────┐ │ │  │  │  ┌─────────────────────────────┐   │   │
│  │  │  Step 2: Flashcard Gen      │ │ │  │  │  │         quizzes              │   │   │
│  │  │                              │ │ │  │  │  │ id            INTEGER PK    │   │   │
│  │  │  Prompt + summary context    │ │ │  │  │  │ topic_id      INTEGER FK ───┼───┘   │
│  │  │  ──> LLM Call                │ │ │  │  │  │ question      TEXT          │       │
│  │  │  ──> Parse Q/A pairs         │ │ │  │  │  │ choices_json  TEXT          │       │
│  │  └──────────────┬───────────────┘ │ │  │  │  │ correct_index INTEGER      │       │
│  │                 │ flashcards[]     │ │  │  │  └─────────────────────────────┘       │
│  │                 ▼                  │ │  │  │                                        │
│  │  ┌──────────────────────────────┐ │ │  │  └────────────────────────────────────┘   │
│  │  │  Step 3: Quiz Generation    │ │ │  │                                            │
│  │  │                              │ │ │  └────────────────────────────────────────────┘
│  │  │  Prompt + summary + cards    │ │ │
│  │  │  ──> LLM Call                │ │ │
│  │  │  ──> Parse MCQ array         │ │ │
│  │  └──────────────┬───────────────┘ │ │
│  │                 │ quiz[]           │ │
│  │                 ▼                  │ │
│  │  ┌──────────────────────────────┐ │ │
│  │  │  Output Parser               │ │ │
│  │  │                              │ │ │
│  │  │  Combines into structured    │ │ │
│  │  │  JSON response:              │ │ │
│  │  │  {                           │ │ │
│  │  │    summary: "...",           │ │ │
│  │  │    flashcards: [{q, a}],     │ │ │
│  │  │    quiz: [{question,         │ │ │
│  │  │      choices, answerIndex}]  │ │ │
│  │  │  }                           │ │ │
│  │  └──────────────────────────────┘ │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │        Model Provider               │ │
│  │                                    │ │
│  │  HuggingFace / OpenAI / Local LLM │ │
│  │  Configurable via environment vars │ │
│  └────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

---

## Data Flow

```
 ┌──────┐        ┌───────────┐        ┌─────────┐        ┌──────────┐        ┌────────┐
 │ USER │──(1)──>│ TopicInput│──(2)──>│ App.vue │──(3)──>│ Express  │──(4)──>│   AI   │
 │      │        │   .vue    │        │         │        │ Backend  │        │Service │
 └──────┘        └───────────┘        └─────────┘        └──────────┘        └────────┘
                                                               │                  │
                                                               │    (5) JSON      │
                                                               │<─────────────────┘
                                                               │
                                                               │──(6)──> ┌────────┐
                                                               │         │Database│
                                                               │<──(7)── └────────┘
                                                               │
 ┌──────┐        ┌───────────┐        ┌─────────┐             │
 │ USER │<─(10)──│ Summary / │<─(9)──│ App.vue │<───(8)──────┘
 │      │        │ Flashcard │        │         │
 │      │        │ Quiz      │        │         │
 └──────┘        └───────────┘        └─────────┘

 Step │ Action
 ─────┼──────────────────────────────────────────────────────
  (1) │ User types a topic and clicks Generate
  (2) │ TopicInput emits submitTopic event to parent
  (3) │ App.vue sends POST /generate { topic } to Express
  (4) │ Express forwards topic to Python AI service
  (5) │ AI service runs LangChain pipeline, returns JSON
  (6) │ Express saves topic + study data to database
  (7) │ Database confirms write
  (8) │ Express returns full JSON response to frontend
  (9) │ App.vue stores response in studyData state
 (10) │ Child components render summary, flashcards, and quiz
```

### History Flow

```
 ┌──────┐        ┌──────────────┐        ┌─────────┐        ┌──────────┐        ┌────────┐
 │ USER │──(1)──>│ HistoryPage  │──(2)──>│ App.vue │──(3)──>│ Express  │──(4)──>│Database│
 │      │        │ .vue         │        │         │        │ Backend  │        │        │
 └──────┘        └──────────────┘        └─────────┘        └──────────┘        └────────┘
                                                               │                     │
                                                               │   (5) topic list    │
                                                               │<────────────────────┘
 ┌──────┐        ┌──────────────┐        ┌─────────┐          │
 │ USER │<──(8)──│ HistoryPage  │<──(7)──│ App.vue │<──(6)───┘
 │      │        │ .vue         │        │         │
 └──────┘        └──────────────┘        └─────────┘

 Step │ Action
 ─────┼──────────────────────────────────────────────────────
  (1) │ User navigates to /history
  (2) │ HistoryPage requests topic list from App.vue
  (3) │ App.vue sends GET /topics to Express
  (4) │ Express queries database for all topics
  (5) │ Database returns list of topics with metadata
  (6) │ Express returns topic list to frontend
  (7) │ App.vue passes data to HistoryPage
  (8) │ HistoryPage renders clickable topic list
```

---

## Component Relationship Map

```
                    ┌──────────────────────────────────────────────────┐
                    │                  Vue Router                       │
                    │                                                   │
                    │    /home ──────── /study ──────── /history        │
                    └───────┬──────────────┬──────────────┬────────────┘
                            │              │              │
                            ▼              ▼              ▼
                  ┌────────────┐  ┌────────────────┐  ┌────────────────┐
                  │ HomePage   │  │  StudyPage     │  │ HistoryPage    │
                  │ .vue       │  │  .vue          │  │ .vue           │
                  └────────────┘  └───────┬────────┘  └────────────────┘
                                          │
                                          │ manages state + distributes props
                                          │
          ┌───────────────┬───────────────┼───────────────┐
          │               │               │               │
   emit ▲ │        props ▼        props ▼        props ▼
          │               │               │               │
  ┌───────┴───────┐ ┌─────┴──────┐ ┌──────┴───────┐ ┌─────┴──────────┐
  │ TopicInput    │ │ Summary    │ │ Flashcard    │ │ QuizCard       │
  │ .vue          │ │ Card.vue   │ │ List.vue     │ │ .vue           │
  │               │ │            │ │              │ │                │
  │ Props: none   │ │ Props:     │ │ Props:       │ │ Props:         │
  │ Emits:        │ │  summary   │ │  flashcards[]│ │  quiz[]        │
  │  submitTopic  │ │  (String)  │ │  ({ q, a })  │ │  ({ question,  │
  │               │ │            │ │              │ │    choices,    │
  │ State:        │ │ State:     │ │ State:       │ │    answerIndex)│
  │  userTopic    │ │  (none)    │ │  flipped{}   │ │                │
  │               │ │            │ │              │ │ State:         │
  │               │ │            │ │              │ │  selectedAns{} │
  │               │ │            │ │              │ │  score         │
  └───────────────┘ └────────────┘ └──────────────┘ └────────────────┘
```

---

## Port Map

```
  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
  │   Frontend   │     │   Backend    │     │  AI Service  │     │   Database   │
  │              │     │              │     │              │     │              │
  │  :5173       │────>│  :3000       │────>│  :8001       │     │  file://     │
  │  (Vite Dev)  │     │  (Express)   │     │  (FastAPI)   │     │  (SQLite)    │
  └──────────────┘     └──────┬───────┘     └──────────────┘     └──────────────┘
                              │                                        ▲
                              │            DB read/write               │
                              └────────────────────────────────────────┘
```

---

## Database Entity Relationship

```
  ┌─────────────────────┐
  │       topics         │
  │─────────────────────│
  │ id        INTEGER PK│
  │ title     TEXT       │
  │ summary   TEXT       │
  │ created_at DATETIME  │
  └──────────┬──────────┘
             │
             │ 1 : N
             │
     ┌───────┴────────┐
     │                │
     ▼                ▼
┌──────────────┐  ┌──────────────────┐
│  flashcards  │  │     quizzes      │
│──────────────│  │──────────────────│
│ id       PK  │  │ id           PK  │
│ topic_id FK ─┤  │ topic_id     FK ─┤
│ question TEXT│  │ question     TEXT│
│ answer   TEXT│  │ choices_json TEXT│
└──────────────┘  │ correct_idx  INT│
                  └──────────────────┘

  Relationships:
  topics  1 ──── N  flashcards   (one topic has many flashcards)
  topics  1 ──── N  quizzes      (one topic has many quiz questions)
```

---

## Blueprint Description

This architecture follows a **three-tier client-server model** with four distinct service blocks:

### 1. Presentation Tier (Frontend) — Port 5173

A Vue 3 single-page application served by Vite's dev server. Vue Router manages three pages: Home (landing), Study (topic input + generated content), and History (past topics). The Study page orchestrates four child components — TopicInput collects user input via event emission, while SummaryCard, FlashcardList, and QuizCard receive data through props and handle their own interactive state (flipping cards, selecting quiz answers, tracking scores). TailwindCSS v4 provides a dark glassmorphism design system across all components.

### 2. Application Tier (Backend) — Port 3000

A Node.js Express server that acts as the central gateway between all other tiers. Incoming requests pass through a middleware pipeline (CORS, JSON parsing, error handling) before reaching the route layer. The route layer exposes three endpoint groups: health check (`GET /`), content generation (`POST /generate`), and topic retrieval (`GET /topics`, `GET /topics/:id`). A service layer beneath the routes separates two concerns — the AI Service Client handles HTTP communication with the Python AI service, while the Database Access Layer manages all read/write operations against the database.

### 3. Intelligence Tier (AI Service) — Port 8001

A Python FastAPI server housing a LangChain pipeline. When called, it runs a three-step sequential chain: (1) generate a summary from the topic using a prompt template and LLM call, (2) generate flashcard Q/A pairs using the summary as context, (3) generate quiz MCQs using both summary and flashcards as context. An output parser combines all three outputs into a single structured JSON response. The underlying model provider (HuggingFace, OpenAI, or a local LLM) is configurable via environment variables.

### 4. Data Tier (Database) — SQLite File

A relational database with three tables connected by foreign keys. The `topics` table stores each generated study session (title, summary, timestamp). The `flashcards` table stores individual Q/A pairs linked to their parent topic. The `quizzes` table stores MCQ questions with their choices and correct answer index, also linked to their parent topic. This one-to-many structure allows efficient retrieval of a complete study session in a single query with joins.
