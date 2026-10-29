"""Turning unreliable model text into reliable JSON.

What this file is:
    Two helpers. One pulls JSON out of a model's reply. The other assembles the
    three chain outputs into the exact shape the frontend expects.

Why it exists at all:
    A language model asked for JSON usually returns JSON — but not always. It
    may wrap it in a ```json fence, add "Here you go:" in front, or add a
    closing remark after. None of that is valid JSON, and json.loads() refuses
    all of it. This file is where that unreliability is absorbed, once, instead
    of being handled three times in three chains.

What it talks to:
    - the three chain modules, which call extract_json on their raw replies
    - main.py, which calls build_response to assemble the final payload
"""

import json
import re
from typing import Any


class PipelineError(Exception):
    """Raised when the model's output cannot be used.

    A named exception type means main.py can tell "the model returned nonsense"
    apart from "the network died", and reply differently to each.
    """


def extract_json(raw_text: str, expect: type = dict) -> Any:
    """Pull a JSON value out of a model reply.

    Three attempts, cheapest first:
      1. Parse the whole string. Works when the model behaved.
      2. Strip a markdown code fence, then parse. Very common.
      3. Grab the first {...} or [...] span in the text, then parse.

    `expect` is dict or list — whichever the caller asked the model for. It is
    checked, because a model that returns the wrong container is a failure the
    caller must hear about rather than discover three layers later.
    """
    text = (raw_text or "").strip()

    if not text:
        raise PipelineError("The model returned an empty response.")

    candidates = [text]

    # Attempt 2: ```json ... ``` or plain ``` ... ```
    fenced = re.search(r"```(?:json)?\s*(.*?)```", text, re.DOTALL)
    if fenced:
        candidates.append(fenced.group(1).strip())

    # Attempt 3: the first balanced-looking object or array in the text.
    opener, closer = ("[", "]") if expect is list else ("{", "}")
    start = text.find(opener)
    end = text.rfind(closer)
    if start != -1 and end > start:
        candidates.append(text[start:end + 1])

    for candidate in candidates:
        try:
            parsed = json.loads(candidate)
        except json.JSONDecodeError:
            continue

        if isinstance(parsed, expect):
            return parsed

    raise PipelineError(
        f"The model did not return valid {expect.__name__} JSON. "
        f"First 200 characters of what it sent: {text[:200]}"
    )


def build_response(summary: str, flashcards: list, quiz: list) -> dict:
    """Assemble the final payload and enforce the frontend's shape.

    This is the contract boundary. The Vue components read:
        flashcards -> card.q  and  card.a
        quiz       -> .question, .choices, .answerIndex

    Note that the DATABASE uses different column names (question / answer /
    correct_index) and databaseService.js translates on the way in. Python must
    emit the JAVASCRIPT names, not the database ones. Getting this backwards
    produces a pipeline that runs perfectly and renders blank cards.

    Anything malformed is dropped here rather than being allowed downstream,
    where it would reach Vue as `undefined` and fail silently.
    """
    clean_flashcards = []
    for card in flashcards:
        if not isinstance(card, dict):
            continue
        question = str(card.get("q", "")).strip()
        answer = str(card.get("a", "")).strip()
        if question and answer:
            clean_flashcards.append({"q": question, "a": answer})

    clean_quiz = []
    for item in quiz:
        if not isinstance(item, dict):
            continue

        question = str(item.get("question", "")).strip()
        choices = item.get("choices")
        answer_index = item.get("answerIndex")

        if not question or not isinstance(choices, list) or len(choices) < 2:
            continue
        if not isinstance(answer_index, int):
            continue
        # An index pointing outside the list would crash QuizCard.vue.
        if not (0 <= answer_index < len(choices)):
            continue

        clean_quiz.append({
            "question": question,
            "choices": [str(choice) for choice in choices],
            "answerIndex": answer_index,
        })

    if not summary.strip():
        raise PipelineError("The pipeline produced an empty summary.")
    if not clean_flashcards:
        raise PipelineError("The pipeline produced no usable flashcards.")
    if not clean_quiz:
        raise PipelineError("The pipeline produced no usable quiz questions.")

    return {
        "summary": summary.strip(),
        "flashcards": clean_flashcards,
        "quiz": clean_quiz,
    }
