-- AI Study Buddy — database schema
-- Three tables: topics (parent) → flashcards, quizzes (children)
-- ON DELETE CASCADE ensures children are removed if the parent is removed.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS topics (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    summary     TEXT    NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS flashcards (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id  INTEGER NOT NULL,
    question  TEXT    NOT NULL,
    answer    TEXT    NOT NULL,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quizzes (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id       INTEGER NOT NULL,
    question       TEXT    NOT NULL,
    choices_json   TEXT    NOT NULL,
    correct_index  INTEGER NOT NULL,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_flashcards_topic ON flashcards(topic_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_topic    ON quizzes(topic_id);
CREATE INDEX IF NOT EXISTS idx_topics_created   ON topics(created_at DESC);
