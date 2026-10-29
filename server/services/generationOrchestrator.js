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
// Two sources of study material. The real one calls the Python AI service;
// the mock returns hard-coded strings and cannot fail.
//
// USE_MOCK_AI=true in server/.env keeps the app working before an API key
// exists, and makes frontend work possible without spending tokens. Anything
// else uses the real pipeline.
const mockAiService = require('./mockAiService');
const aiServiceClient = require('./aiServiceClient');

const USE_MOCK_AI = process.env.USE_MOCK_AI === 'true';
const generateStudyMaterial = USE_MOCK_AI
    ? mockAiService.generateStudyMaterial
    : aiServiceClient.generateStudyMaterial;
const databaseService           = require('./databaseService');
const responseFormatter         = require('../utils/responseFormatter');

const generate = async (rawTopic) => {

    // ── Step 1: validate ──────────────────────────────────────────────
    const validation = validateTopic(rawTopic);
    if (!validation.valid) {
        // Early return with a failure envelope. No point running the rest of
        // the workflow if the input is bad — save the DB and AI work.
        return responseFormatter.failure(validation.error);
    }
    try{
        // From here on, use the CLEANED topic (whitespace trimmed).
    const cleanedTopic = validation.cleanedTopic;

    // ── Step 2: generate study material ───────────────────────────────
    // Right now this returns hard-coded strings with ${topic} interpolated.
    // In Step 8 we swap this line to call the real Python AI service.
    // await, because this is now an HTTP call to the Python service.
    // Forget the await here and studyMaterial becomes a Promise, every field
    // below reads as undefined, and the failure surfaces three layers away.
    const studyMaterial = await generateStudyMaterial(cleanedTopic);

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
    }catch(unexpectedError){
        console.error(unexpectedError);
        return responseFormatter.failure('Failed to generate the study material. Please try again');
    }
    
};

module.exports = { generate };