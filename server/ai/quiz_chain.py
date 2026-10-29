"""Step 3 of the pipeline: topic + summary + flashcards -> quiz.

What this file is:
    A chain that asks for multiple-choice questions as JSON.

Why it receives BOTH earlier outputs:
    It gets the summary so the questions cover the material that was taught, and
    the flashcards so it can avoid asking the same things again in the same
    words. This is the step where a sequential pipeline earns its keep — one
    mega-prompt asking for all three artifacts at once cannot see its own
    earlier output and routinely repeats itself.

The shape it must produce:
    answerIndex is a NUMBER — the position of the correct choice in the list,
    counting from 0. QuizCard.vue compares the clicked index against it. A
    letter ("B") or the answer text would both render a quiz that marks every
    answer wrong.

What it talks to:
    - ai/model.py, ai/output_parser.py
    - ai/pipeline.py, which passes it steps 1 and 2
"""

import json

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

from .model import get_model
from .output_parser import extract_json

QUIZ_PROMPT = ChatPromptTemplate.from_messages([
    (
        "system",
        "You write multiple-choice quiz questions. You reply with a JSON array "
        "and nothing else — no explanation, no commentary, no markdown fence.",
    ),
    (
        "human",
        "Write 4 multiple-choice questions for the topic below.\n\n"
        "Rules:\n"
        "- Base them on the summary.\n"
        "- Do not repeat what the flashcards already ask.\n"
        "- Exactly 3 choices per question.\n"
        "- The wrong choices must be plausible, not obviously silly.\n"
        '- "answerIndex" is the POSITION of the correct choice: 0, 1 or 2.\n'
        "- Vary which position is correct.\n\n"
        "Reply with a JSON array in exactly this shape:\n"
        '[{{"question": "...", "choices": ["a", "b", "c"], "answerIndex": 0}}]\n\n'
        "Topic: {topic}\n\n"
        "Summary:\n{summary}\n\n"
        "Flashcards already written:\n{flashcards}",
    ),
])


def run(topic: str, summary: str, flashcards: list) -> list:
    """Generate the quiz from the topic plus both earlier steps."""
    chain = QUIZ_PROMPT | get_model() | StrOutputParser()

    raw_reply = chain.invoke({
        "topic": topic,
        "summary": summary,
        # The flashcards are a Python list; the prompt needs text.
        "flashcards": json.dumps(flashcards, indent=2),
    })

    return extract_json(raw_reply, expect=list)
