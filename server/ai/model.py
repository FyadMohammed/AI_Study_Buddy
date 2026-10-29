"""Shared model setup for every chain in the pipeline.

What this file is:
    One place that builds the Claude client, so the three chains don't each
    configure their own.

What it is for:
    Changing the model or the temperature should be a one-line change in `.env`,
    not a hunt through three files.

What it talks to:
    - the ANTHROPIC_API_KEY and AI_MODEL values in server/.env
    - summary_chain.py, flashcard_chain.py, quiz_chain.py
"""

import os
from functools import lru_cache

from dotenv import load_dotenv
from langchain_anthropic import ChatAnthropic

# Reads server/.env into the environment. Safe to call more than once.
load_dotenv()

DEFAULT_MODEL = "claude-opus-5-5"


@lru_cache(maxsize=1)
def get_model() -> ChatAnthropic:
    """Build the chat model once and reuse it.

    lru_cache means the client is constructed on the first call and the same
    object is handed back afterwards — three chains, one client.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError(
            "ANTHROPIC_API_KEY is not set. Copy server/.env.example to "
            "server/.env and put your key in it."
        )

    return ChatAnthropic(
        model=os.getenv("AI_MODEL", DEFAULT_MODEL),
        api_key=api_key,
        max_tokens=4000,
        timeout=90,
    )
