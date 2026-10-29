// ─── AI SERVICE CLIENT ───────────────────────────────────────────────────────
// The Express server's door to the Python AI service.
//
// What it is:
//   One function that POSTs a topic to the FastAPI service on port 8001 and
//   returns { summary, flashcards, quiz }.
//
// What it is for:
//   Everything that makes a cross-process call awkward — timeouts, retries,
//   turning HTTP status codes into useful messages — lives here, so the
//   orchestrator can call it like any other function and stay readable.
//
// What it talks to:
//   - the Python service: POST http://localhost:8001/ai/generate
//   - generationOrchestrator.js, its only caller
//
// Why a timeout matters here specifically:
//   An LLM call is not a database query. It takes seconds, and when the model
//   provider is having a bad day it can take forever. Without a deadline, one
//   stuck request holds a connection open indefinitely and the user stares at
//   a spinner with no end.
// ─────────────────────────────────────────────────────────────────────────────

const AI_SERVICE_URL   = process.env.AI_SERVICE_URL || 'http://localhost:8001';
const REQUEST_TIMEOUT_MS = 60000;   // one attempt gets 60 seconds
const MAX_ATTEMPTS       = 2;       // the first try, plus one retry
const RETRY_DELAY_MS     = 1000;

const sleep = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));

// ── One attempt, with a deadline ─────────────────────────────────────
// AbortController is how you cancel a fetch. We start a timer; if it fires
// before the response arrives, controller.abort() kills the request and fetch
// rejects. clearTimeout in `finally` stops the timer from firing after a
// response that did arrive in time.
const attemptRequest = async (topic) => {
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(`${AI_SERVICE_URL}/ai/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic }),
            signal: controller.signal
        });

        if (!response.ok) {
            // FastAPI puts its message in a `detail` field. If the body is not
            // JSON at all, fall back rather than letting .json() throw here.
            let detail = `AI service returned ${response.status}`;
            try {
                const errorBody = await response.json();
                if (errorBody && errorBody.detail) detail = errorBody.detail;
            } catch { /* body was not JSON — keep the generic message */ }

            const failure = new Error(detail);
            // 5xx means the service broke and a retry might work.
            // 4xx means we sent something wrong and a retry will not.
            failure.isRetryable = response.status >= 500;
            throw failure;
        }

        return await response.json();

    } finally {
        clearTimeout(timeoutHandle);
    }
};

// ── The public function: attempt, then retry once ────────────────────
const generateStudyMaterial = async (topic) => {
    let lastError;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            return await attemptRequest(topic);

        } catch (caughtError) {
            lastError = caughtError;

            // An aborted request shows up as an AbortError.
            const wasTimeout = caughtError.name === 'AbortError';

            // Retry a timeout, a network failure, or a 5xx. Do not retry a 4xx:
            // the request itself was wrong and sending it again wastes the
            // user's time and the model's tokens.
            const worthRetrying = wasTimeout || caughtError.isRetryable !== false;

            console.error(
                `[aiServiceClient] attempt ${attempt}/${MAX_ATTEMPTS} failed:`,
                wasTimeout ? `timed out after ${REQUEST_TIMEOUT_MS}ms` : caughtError.message
            );

            if (attempt < MAX_ATTEMPTS && worthRetrying) {
                await sleep(RETRY_DELAY_MS);
                continue;
            }
            break;
        }
    }

    // Every attempt failed. Throw a sentence the orchestrator can pass on;
    // the technical detail is already in the log above.
    if (lastError && lastError.name === 'AbortError') {
        throw new Error('The AI service took too long to respond. Please try again.');
    }
    throw new Error(
        lastError ? lastError.message : 'The AI service is unreachable.'
    );
};

module.exports = { generateStudyMaterial };
