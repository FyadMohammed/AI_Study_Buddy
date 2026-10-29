"""The three-step pipeline, run in order.

What this file is:
    The conductor. It runs summary -> flashcards -> quiz, feeding each step's
    output into the next, then hands everything to the output parser.

Why it is separate from main.py:
    main.py is HTTP — request in, response out. This file is the actual work.
    Keeping them apart means the pipeline can be run and tested from a plain
    Python script with no web server involved, and main.py stays a thin handler.
    It is the same split as generationOrchestrator.js on the Node side.

What it talks to:
    - the three chain modules
    - ai/output_parser.py
    - main.py, its only caller
"""

import logging

from . import flashcard_chain, quiz_chain, summary_chain
from .output_parser import build_response

logger = logging.getLogger(__name__)


def generate_study_material(topic: str) -> dict:
    """Run all three steps for one topic.

    Returns the finished payload in the shape the Vue components read.
    Raises PipelineError (from output_parser) when the model's output cannot
    be used.

    Note the data flowing forward: step 2 gets step 1's output, step 3 gets
    both. That is the whole argument for a chain rather than one big prompt —
    each step can see what the previous one actually produced.
    """
    logger.info("Pipeline starting for topic: %s", topic)

    # ── Step 1 ────────────────────────────────────────────────────────
    summary = summary_chain.run(topic)
    logger.info("Step 1 done — summary is %d characters", len(summary))

    # ── Step 2 ── receives the summary ────────────────────────────────
    flashcards = flashcard_chain.run(topic, summary)
    logger.info("Step 2 done — %d flashcards", len(flashcards))

    # ── Step 3 ── receives the summary AND the flashcards ─────────────
    quiz = quiz_chain.run(topic, summary, flashcards)
    logger.info("Step 3 done — %d quiz questions", len(quiz))

    # ── Assemble and enforce the frontend's shape ─────────────────────
    return build_response(summary, flashcards, quiz)
