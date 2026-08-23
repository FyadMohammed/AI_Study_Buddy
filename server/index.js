// ─── EXPRESS SERVER ENTRY POINT ──────────────────────────────────────────────
// This file's job is to WIRE THINGS UP:
//   • Load the framework and middleware
//   • Register route handlers (which delegate to services)
//   • Start listening on a port
//
// Notice how thin each route handler is now — no business logic lives here.
// Routes are HTTP-shaped adapters around service function calls.
// ─────────────────────────────────────────────────────────────────────────────

const express                = require('express');
const cors                   = require('cors');
const generationOrchestrator = require('./services/generationOrchestrator');
const responseFormatter      = require('./utils/responseFormatter');

const app = express();

// ── Middleware (runs on every request, in order) ─────────────────────
// cors():         allows the frontend on :5173 to call this server on :3000
// express.json(): parses incoming JSON request bodies into req.body objects
app.use(cors());
app.use(express.json());

// ── GET / — health check ─────────────────────────────────────────────
// Uses the same envelope pattern as every other endpoint, for consistency.
app.get('/', (request, response) => {
    response.json(responseFormatter.success({
        message: 'AI Study Buddy API (Express) is running!'
    }));
});

// ── TEMPORARY: fake network latency ──────────────────────────────────
// The mock AI answers in about a millisecond, which makes the frontend's
// loading spinner and error states impossible to actually look at. This
// pauses the handler so those states last long enough to see and test.
//
// DELETE THIS BLOCK when the Python AI service is wired in — a real LLM
// call brings 5-15 seconds of its own latency and won't need faking.
const ARTIFICIAL_DELAY_MS = 1200;
const sleep = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));

// ── POST /generate — thin handler ────────────────────────────────────
// Everything of substance happens in the orchestrator. This handler only:
//   1. Pulls the topic out of the request body
//   2. Delegates to the orchestrator (which returns a formatted envelope)
//   3. Picks an HTTP status code based on success/failure
//   4. Sends the envelope back as JSON
app.post('/generate', async (request, response) => {
    // Destructure with fallback: if request.body is undefined (no body sent),
    // fall back to {} so destructuring doesn't throw.
    const { topic } = request.body || {};

    await sleep(ARTIFICIAL_DELAY_MS);   // TEMPORARY — see note above

    const resultEnvelope = generationOrchestrator.generate(topic);

    // Ternary: 200 (OK) if the workflow succeeded, 400 (Bad Request) if it
    // failed for input reasons. Later we might add 500 for unexpected errors.
    const httpStatus = resultEnvelope.success ? 200 : 400;

    response.status(httpStatus).json(resultEnvelope);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Express server listening on port ${PORT}`));
