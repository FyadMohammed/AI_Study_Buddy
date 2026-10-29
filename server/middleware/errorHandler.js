// ─── ERROR HANDLER MIDDLEWARE ────────────────────────────────────────────────
// The last safety net in the server.
//
// What it is:
//   Express middleware that only runs when something has thrown and nothing
//   else caught it.
//
// What it is for:
//   Without this, an uncaught throw falls through to Express's own built-in
//   handler, which replies with an HTML error page. The frontend then calls
//   response.json() on that HTML, hits the '<', and shows the user
//   "Unexpected token '<'" — a JSON parsing error that says nothing about
//   what actually broke. This file guarantees that every single reply leaving
//   the server is the normal envelope shape, whatever happened upstream.
//
// What it talks to:
//   - responseFormatter, to build the failure envelope
//   - server/index.js, which registers it LAST with app.use(...)
//
// How Express knows it is an error handler:
//   By counting parameters. FOUR means error handler. THREE means ordinary
//   middleware. `next` must be declared even though it is never called here —
//   remove it and this silently becomes normal middleware that never fires.
// ─────────────────────────────────────────────────────────────────────────────

const responseFormatter = require('../utils/responseFormatter');

const errorHandler = (error, request, response, next) => {

    // ── Audience 1: the developer ─────────────────────────────────────
    // The whole Error object, so the terminal prints both the message and
    // the stack trace. This is the only record of what actually went wrong.
    console.error(
        `[errorHandler] ${request.method} ${request.originalUrl} failed:`,
        error
    );

    // If the response has already started streaming, Express must finish it
    // itself — we cannot send a second set of headers.
    if (response.headersSent) {
        return next(error);
    }

    // ── Audience 2: the user ──────────────────────────────────────────
    // A plain sentence. This handler has no idea which route threw or what
    // it was attempting, so the message must not pretend to know. Internal
    // error text (table names, SQL codes, file paths) never leaves here.
    //
    // 500 = "the server broke". Not 400, which would mean "your request was
    // wrong" and blame a client that did nothing out of the ordinary.
    response.status(500).json(responseFormatter.failure(
        'Something went wrong on the server. Please try again.'
    ));
};

module.exports = { errorHandler };
