"""Step 2 of the pipeline: topic + summary -> flashcards.

What this file is:
    A chain that asks for a JSON array of question/answer pairs.

Why it receives the summary:
    This is the point of a sequential pipeline. The model is not asked "write
    flashcards about mitosis" in isolation — it is asked to write flashcards
    about THIS explanation of mitosis. The cards then test what the summary
    actually taught, instead of drifting onto facts the user never read.

What it talks to:
    - ai/model.py for the Claude client
    - ai/output_parser.py to survive imperfect JSON
    - ai/pipeline.py, which passes it step 1's output
"""

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

from .model import get_model
from .output_parser import extract_json

FLASHCARD_PROMPT = ChatPromptTemplate.from_messages([
    (
        "system",
        "You create flashcards. You reply with a JSON array and nothing else — "
        "no explanation before it, no commentary after it, no markdown fence.",
    ),
    (
        "human",
        "Write 5 flashcards for the topic below, based on the summary provided.\n\n"
        "Rules:\n"
        "- Each card tests ONE idea.\n"
        "- The question is a real question, not a topic label.\n"
        "- The answer is one or two sentences.\n"
        "- Only use material covered in the summary.\n\n"
        "Reply with a JSON array in exactly this shape:\n"
        '[{{"q": "the question", "a": "the answer"}}]\n\n'
        "Topic: {topic}\n\n"
        "Summary:\n{summary}",
    ),
])


def run(topic: str, summary: str) -> list:
    """Generate flashcards from the topic and the summary from step 1."""
    chain = FLASHCARD_PROMPT | get_model() | StrOutputParser()
    raw_reply = chain.invoke({"topic": topic, "summary": summary})

    # The model was told to return an array. extract_json checks that it did,
    # and rescues the common near-misses (code fences, stray prose).
    return extract_json(raw_reply, expect=list)
