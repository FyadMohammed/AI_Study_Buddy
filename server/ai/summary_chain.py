"""Step 1 of the pipeline: topic -> summary.

What this file is:
    One LangChain chain. Takes a topic string, returns a few paragraphs of plain
    prose explaining it.

Where it sits:
    First of three. Its output is fed into the prompts of steps 2 and 3, so that
    the flashcards and the quiz describe the same material as the summary rather
    than three independent takes on the topic.

What it talks to:
    - ai/model.py for the Claude client
    - ai/pipeline.py, which runs the three steps in order
"""

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

from .model import get_model

# A PromptTemplate rather than an f-string: the {topic} placeholder is filled in
# by the chain at run time, the text stays reviewable as text, and the prompt can
# be changed without touching the code around it.
SUMMARY_PROMPT = ChatPromptTemplate.from_messages([
    (
        "system",
        "You write study material for someone meeting a topic for the first "
        "time. Be concrete and plain. No preamble, no sign-off, no markdown "
        "headings — just the explanation itself.",
    ),
    (
        "human",
        "Explain the topic below in 3 to 4 short paragraphs.\n\n"
        "Cover what it is, why it matters, and how it works.\n"
        "Define any term a beginner would not already know.\n\n"
        "Topic: {topic}",
    ),
])


def run(topic: str) -> str:
    """Generate the summary for a topic.

    The `|` operator composes the chain: the filled prompt goes to the model,
    the model's reply goes to StrOutputParser, which pulls the plain text out
    of the response object.
    """
    chain = SUMMARY_PROMPT | get_model() | StrOutputParser()
    return chain.invoke({"topic": topic}).strip()
