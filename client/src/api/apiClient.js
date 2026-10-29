// ─── API CLIENT ──────────────────────────────────────────────────────────────
// The single place in the frontend that knows how to talk to the backend.
//
// What it is:
//   Three functions, one per endpoint. Each one sends the request, unwraps the
//   response envelope, and either returns the payload or throws an Error with a
//   readable message.
//
// What it is for:
//   Before this file existed, App.vue called fetch() directly with a hardcoded
//   URL and unwrapped the envelope by hand. Every new page would have repeated
//   that. Now the base URL lives in one place, and the envelope is unwrapped in
//   one place.
//
// What it talks to:
//   - the Express server on port 3000
//   - HomePage.vue, StudyPage.vue and HistoryPage.vue, which call these
//     functions instead of using fetch()
//
// The deal these functions make with their callers:
//   SUCCESS -> return the data itself (not the envelope)
//   FAILURE -> throw an Error whose .message is safe to show a user
//   So every caller is a plain try/catch, and nobody checks `.success` twice.
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE_URL = 'http://localhost:3000';

// ── The shared part of every request ─────────────────────────────────
// Each of the three public functions below differs only in its URL and method,
// so the fetching, parsing and unwrapping lives here once.
const requestJson = async (path, options = {}) => {

    let responseEnvelope;

    try {
        const response = await fetch(`${API_BASE_URL}${path}`, options);

        // Parse FIRST, then inspect the envelope — not response.ok.
        // The backend signals failure inside the body, and sends a readable
        // sentence with it. A bare status code would throw that sentence away.
        responseEnvelope = await response.json();

    } catch (networkOrParsingError) {
        // Reaching here means one of two things:
        //   - the server is unreachable (fetch itself rejected)
        //   - the reply was not JSON at all
        // Neither gives the user anything useful, so replace it with a sentence
        // they can act on. The real error still goes to the console for us.
        console.error('[apiClient] request failed:', path, networkOrParsingError);
        throw new Error('Could not reach the server. Is it running?');
    }

    if (!responseEnvelope.success) {
        // The backend explained itself. Pass that sentence straight through.
        throw new Error(responseEnvelope.error || 'The server rejected the request.');
    }

    // Unwrap. Callers get the payload, never the envelope.
    return responseEnvelope.data;
};


// ── POST /generate ───────────────────────────────────────────────────
// Creates a new topic. Returns { id, summary, flashcards, quiz }.
export const generateTopic = (topic) => {
    return requestJson('/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
    });
};


// ── GET /topics ──────────────────────────────────────────────────────
// The history list. Returns an array of { id, title, created_at }.
// Deliberately lightweight — no flashcards or quiz questions.
export const getTopics = () => {
    return requestJson('/topics');
};


// ── GET /topics/:id ──────────────────────────────────────────────────
// One saved topic in full. Returns { id, title, summary, created_at,
// flashcards, quiz } — the same shape generateTopic returns, plus a title.
export const getTopicById = (topicId) => {
    return requestJson(`/topics/${topicId}`);
};
