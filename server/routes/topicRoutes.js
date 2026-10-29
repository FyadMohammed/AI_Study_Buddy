// ─── TOPIC ROUTES ────────────────────────────────────────────────────────────
// The read side of the API — everything that looks up topics already saved.
//
// What it is:
//   An Express Router: a small, self-contained group of routes that index.js
//   mounts under one path prefix. Mounted at '/topics', so the '/' route below
//   answers GET /topics and the '/:id' route answers GET /topics/4.
//
// What it is for:
//   The history feature. The frontend lists past topics, the user clicks one,
//   and the whole thing reloads from the database instead of being generated
//   again. POST /generate writes; this file reads.
//
// What it talks to:
//   - databaseService, for the actual queries
//   - inputValidator.validateTopicId, to check the URL parameter
//   - responseFormatter, so these replies use the same envelope as every other
//     endpoint
//   - server/index.js, which mounts this router
//
// Why a Router instead of more app.get(...) lines in index.js:
//   index.js stays a wiring file. Routes that belong together live together,
//   and the '/topics' prefix is written in exactly one place.
// ─────────────────────────────────────────────────────────────────────────────

const express           = require('express');
const databaseService   = require('../services/databaseService');
const responseFormatter = require('../utils/responseFormatter');
const { validateTopicId } = require('../middleware/inputValidator');

const router = express.Router();

// ── GET /topics — the history list ───────────────────────────────────
// Returns a lightweight list: id, title and created_at only. No flashcards
// or quiz questions — the list view never shows them, and fetching them for
// every row would mean three queries per topic for data nobody reads.
router.get('/', (request, response, next) => {
    try {
        const topics = databaseService.getAllTopics();
        response.json(responseFormatter.success(topics));
    } catch (unexpectedError) {
        // Hand it to the error-handler middleware rather than replying here.
        // One place decides what a server failure looks like.
        next(unexpectedError);
    }
});

// ── GET /topics/:id — one full topic ─────────────────────────────────
// ':id' is a route parameter. Express pulls it out of the URL and puts it on
// request.params.id — always as a STRING, even when it looks like a number.
router.get('/:id', (request, response, next) => {

    // ── Step 1: validate the parameter ────────────────────────────────
    // Same contract as validateTopic: a result object, not an exception.
    // A junk id in the URL is expected traffic, not an emergency.
    const validation = validateTopicId(request.params.id);
    if (!validation.valid) {
        return response.status(400).json(responseFormatter.failure(validation.error));
    }

    try {
        // ── Step 2: look it up ────────────────────────────────────────
        // Use the CLEANED id — a real number, not the string from the URL.
        const topic = databaseService.getTopicById(validation.topicId);

        // ── Step 3: handle "valid id, no such row" ────────────────────
        // A well-formed request for something that does not exist is a 404,
        // not a 400 and not a 500. Nobody did anything wrong.
        if (topic === null) {
            return response.status(404).json(
                responseFormatter.failure('No topic found with that id.')
            );
        }

        // ── Step 4: success ───────────────────────────────────────────
        // databaseService has already translated the database's column names
        // (question/answer/correct_index) into the shape the Vue components
        // read (q/a/answerIndex). This route does no reshaping of its own.
        response.json(responseFormatter.success(topic));

    } catch (unexpectedError) {
        next(unexpectedError);
    }
});

module.exports = router;
