// ─── INPUT VALIDATOR ─────────────────────────────────────────────────────────
// A shared module that any route or service can call to check user input.
// It doesn't send HTTP responses itself — it just reports whether the input
// is valid. The caller decides what to do with the answer.
//
// Why extract this from the route handler?
//   1. Later routes (like GET /topics/:id) can reuse the same pattern
//   2. Validation can be tested WITHOUT spinning up an Express server
//   3. Route handlers stay short and focused on HTTP-only concerns
// ─────────────────────────────────────────────────────────────────────────────

// A constant declared UPPER_SNAKE_CASE by convention means "value shouldn't change
// at runtime". Pull magic numbers out of code so future changes happen in one place.
const MAXIMUM_TOPIC_LENGTH = 200;

// The validator returns a small result object rather than throwing an error.
// This makes the "invalid input" path a normal branch in the caller's code,
// not an exception to catch. Exceptions are for UNEXPECTED failures;
// invalid user input is EXPECTED and predictable, so plain returns are cleaner.
const validateTopic = (rawTopic) => {

    // Guard clause: reject anything that isn't a string BEFORE calling .trim()
    // on it (which would throw a TypeError on numbers, null, undefined, etc.).
    // typeof always returns a string, so the comparison is safe.
    if (typeof rawTopic !== 'string') {
        return { valid: false, error: 'Topic must be a string' };
    }

    // .trim() removes leading/trailing whitespace. Without this, "   " would
    // pass the "non-empty" check and get saved as a blank topic.
    const trimmedTopic = rawTopic.trim();

    if (trimmedTopic.length === 0) {
        return { valid: false, error: 'Topic cannot be empty' };
    }

    if (trimmedTopic.length > MAXIMUM_TOPIC_LENGTH) {
        // Template literal (backticks) lets us interpolate the constant.
        return {
            valid: false,
            error: `Topic must be ${MAXIMUM_TOPIC_LENGTH} characters or fewer`
        };
    }

    // Return the CLEANED value alongside the valid flag. Callers should use
    // cleanedTopic (not the raw input), so downstream code sees consistent data.
    return { valid: true, cleanedTopic: trimmedTopic };
};

module.exports = { validateTopic };
