// ─── GENERATION ORCHESTRATOR ─────────────────────────────────────────────────
// Coordinates the full "generate a topic" workflow.
// Its ONLY job is to call the right specialists in the right order and return
// a properly-formatted result. It does NOT do the work itself.
//
// Workflow:
//   1. Validate the input
//   2. Generate study material (dummy today, real AI later)
//   3. Save the result to the database
//   4. Return a formatted response envelope
//
// A general contractor on a construction site: doesn't lay bricks or wire
// electrics — coordinates the specialists in the right order.
// ─────────────────────────────────────────────────────────────────────────────

// Import the specialists this orchestrator will coordinate.
// Destructuring pulls named exports out of each required module.
const { validateTopic }        = require('../middleware/inputValidator');
const { generateStudyMaterial } = require('./mockAiService');
const databaseService           = require('./databaseService');
const responseFormatter         = require('../utils/responseFormatter');

const generate = (rawTopic) => {

    // ── Step 1: validate ──────────────────────────────────────────────
    const validation = validateTopic(rawTopic);
    if (!validation.valid) {
        // Early return with a failure envelope. No point running the rest of
        // the workflow if the input is bad — save the DB and AI work.
        return responseFormatter.failure(validation.error);
    }
    // From here on, use the CLEANED topic (whitespace trimmed).
    const cleanedTopic = validation.cleanedTopic;

    // ── Step 2: generate study material ───────────────────────────────
    // Right now this returns hard-coded strings with ${topic} interpolated.
    // In Step 8 we swap this line to call the real Python AI service.
    const studyMaterial = generateStudyMaterial(cleanedTopic);

    // ── Step 3: persist to database ───────────────────────────────────
    // databaseService.saveTopic runs an atomic transaction that inserts into
    // three tables (topics, flashcards, quizzes) and returns the new topic id.
    const savedTopicId = databaseService.saveTopic({
        title:      cleanedTopic,
        summary:    studyMaterial.summary,
        flashcards: studyMaterial.flashcards,
        quiz:       studyMaterial.quiz
    });

    // ── Step 4: return the success envelope ───────────────────────────
    // We include the id so the frontend can later reload this topic from
    // the history list (via GET /topics/:id — coming in Step 6).
    return responseFormatter.success({
        id:         savedTopicId,
        summary:    studyMaterial.summary,
        flashcards: studyMaterial.flashcards,
        quiz:       studyMaterial.quiz
    });
};

module.exports = { generate };
