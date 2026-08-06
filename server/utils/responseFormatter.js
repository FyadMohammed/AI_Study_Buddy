// ─── RESPONSE FORMATTER ──────────────────────────────────────────────────────
// Every HTTP response from this server passes through one of these two helpers.
// This guarantees the frontend ALWAYS sees the same envelope shape:
//
//   { success: true,  data:  ... }   ← for successful requests
//   { success: false, error: ... }   ← for failed requests
//
// Without this, one endpoint might return { data: ... }, another { message: ... },
// another raw data — the frontend would need special-case logic for each shape.
// Centralising the shape here means the frontend can always do:
//     if (envelope.success) { use envelope.data } else { show envelope.error }
// ─────────────────────────────────────────────────────────────────────────────

// Arrow function returning an object literal.
// Note the parentheses around { ... } — without them, JavaScript would treat
// { ... } as a function BODY (block) instead of an object expression.
const success = (data) => ({
    success: true,
    data                    // shorthand for  data: data
});

const failure = (errorMessage) => ({
    success: false,
    error: errorMessage
});

// CommonJS export — anything on module.exports is what other files receive
// when they call require('./responseFormatter').
module.exports = { success, failure };
