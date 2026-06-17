const database = require('../db/connection');

const insertTopicStatement = database.prepare(`
    INSERT INTO topics (title, summary)
    VALUES (?, ?)
`);

const insertFlashcardStatement = database.prepare(`
    INSERT INTO flashcards (topic_id, question, answer)
    VALUES (?, ?, ?)
`);

const insertQuizQuestionStatement = database.prepare(`
    INSERT INTO quizzes (topic_id, question, choices_json, correct_index)
    VALUES (?, ?, ?, ?)
`);

const selectAllTopicsStatement = database.prepare(`
    SELECT id, title, created_at
    FROM topics
    ORDER BY created_at DESC
`);

const selectTopicByIdStatement = database.prepare(`
    SELECT id, title, summary, created_at
    FROM topics
    WHERE id = ?
`);

const selectFlashcardsByTopicStatement = database.prepare(`
    SELECT question, answer
    FROM flashcards
    WHERE topic_id = ?
`);

const selectQuizQuestionsByTopicStatement = database.prepare(`
    SELECT question, choices_json, correct_index
    FROM quizzes
    WHERE topic_id = ?
`);

const saveTopicTransaction = database.transaction((topicPayload) => {
    const { title, summary, flashcards, quiz } = topicPayload;

    const insertResult = insertTopicStatement.run(title, summary);
    const newTopicId = insertResult.lastInsertRowid;

    for (const flashcard of flashcards) {
        insertFlashcardStatement.run(newTopicId, flashcard.q, flashcard.a);
    }

    for (const quizQuestion of quiz) {
        insertQuizQuestionStatement.run(
            newTopicId,
            quizQuestion.question,
            JSON.stringify(quizQuestion.choices),
            quizQuestion.answerIndex
        );
    }

    return newTopicId;
});

const saveTopic = (topicPayload) => {
    return saveTopicTransaction(topicPayload);
};

const getAllTopics = () => {
    return selectAllTopicsStatement.all();
};

const getTopicById = (topicId) => {
    const topicRow = selectTopicByIdStatement.get(topicId);
    if (!topicRow) {
        return null;
    }

    const flashcardRows = selectFlashcardsByTopicStatement.all(topicId);
    const quizQuestionRows = selectQuizQuestionsByTopicStatement.all(topicId);

    return {
        id: topicRow.id,
        title: topicRow.title,
        summary: topicRow.summary,
        created_at: topicRow.created_at,
        flashcards: flashcardRows.map((row) => ({
            q: row.question,
            a: row.answer
        })),
        quiz: quizQuestionRows.map((row) => ({
            question: row.question,
            choices: JSON.parse(row.choices_json),
            answerIndex: row.correct_index
        }))
    };
};

module.exports = {
    saveTopic,
    getAllTopics,
    getTopicById
};
