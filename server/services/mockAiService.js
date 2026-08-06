// ─── MOCK AI SERVICE ─────────────────────────────────────────────────────────
// This module SIMULATES what a real AI service will eventually produce.
// In Step 8, this file will be replaced by a real HTTP client that calls the
// Python AI service (which runs LangChain against an LLM).
//
// Why keep the mock in a separate file (instead of inlining the dummy data
// in the orchestrator)?
//   • When we swap in the real AI, we only change ONE line: the require in
//     generationOrchestrator.js. Every other file stays untouched.
//   • The interface — "give me a topic, get back { summary, flashcards, quiz }" —
//     is defined by this file. The real AI service will match the same shape.
//     That interface is the CONTRACT.
// ─────────────────────────────────────────────────────────────────────────────

// Given a topic string, return an object with the three pieces of study material
// the frontend needs. Shape MUST match what the frontend components expect:
//   • flashcards use { q, a }         (FlashcardList.vue reads .q and .a)
//   • quiz uses { question, choices, answerIndex }  (QuizCard.vue reads all three)
const generateStudyMaterial = (topic) => {

    // Template literals interpolate ${topic} into the string.
    const summary = `A concise explanation of ${topic}.`;

    const flashcards = [
        { q: `What is ${topic}?`,             a: `A short definition of ${topic}.` },
        { q: `Why is ${topic} important?`,    a: `Because it is relevant in many contexts.` },
        { q: `How does ${topic} work?`,       a: `It operates through its underlying principles.` }
    ];

    const quiz = [
        {
            question: `Which statement about ${topic} is true?`,
            choices: ['Option A', 'Option B', 'Option C'],
            answerIndex: 0
        },
        {
            question: `Why is ${topic} important?`,
            choices: ['Option A', 'Option B', 'Option C'],
            answerIndex: 2
        },
        {
            question: `${topic} is _____?`,
            choices: ['Useful', 'Careless', 'Unbiased'],
            answerIndex: 0
        },
        {
            question: `Which statement about ${topic} is NOT true?`,
            choices: ['Option A', 'Option B', 'Option C'],
            answerIndex: 1
        }
    ];

    // Shorthand for { summary: summary, flashcards: flashcards, quiz: quiz }
    return { summary, flashcards, quiz };
};

module.exports = { generateStudyMaterial };
