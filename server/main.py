"""FastAPI service — the AI half of the system.

What this file is:
    Two endpoints. A health check, and the one that runs the LangChain pipeline.

What it is for:
    Keeping the LLM work in Python, where LangChain lives, behind a plain HTTP
    boundary. The Express server does not import LangChain, does not hold the
    API key, and does not know what a prompt template is — it just POSTs a topic
    to this service and gets JSON back.

What it talks to:
    - ai/pipeline.py, which does the actual work
    - server/services/aiServiceClient.js on the Node side, its only caller

Run it:
    cd server
    .\\venv\\Scripts\\activate
    uvicorn main:app --reload --port 8001
"""

import logging

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from ai.output_parser import PipelineError
from ai.pipeline import generate_study_material

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Study Buddy — AI Service")


class GenerateRequest(BaseModel):
    """The request body for POST /ai/generate.

    Pydantic validates incoming JSON against this class before the handler
    runs. A missing or empty topic never reaches the pipeline — FastAPI
    rejects it with a 422 automatically. Same idea as inputValidator.js on
    the Node side: check at the edge, not in the middle.
    """
    topic: str = Field(min_length=1, max_length=200)


@app.get("/")
def read_root():
    """Health check. Used to confirm the service is up."""
    return {"message": "AI Study Buddy API is running!"}


@app.post("/ai/generate")
def generate(request: GenerateRequest):
    """Run the three-step pipeline for one topic.

    Returns { summary, flashcards, quiz } — already in the shape the Vue
    components read.

    Two failure modes, deliberately given different status codes so the Node
    side can tell them apart:
      502  the model replied with something unusable (bad JSON, empty output).
           Retrying may well work — model output varies between runs.
      500  something else broke. Retrying probably will not help.
    """
    topic = request.topic.strip()
    logger.info("POST /ai/generate — topic: %s", topic)

    try:
        return generate_study_material(topic)

    except PipelineError as pipeline_error:
        # Expected-ish: the model misbehaved. Log the detail, send a sentence.
        logger.error("Pipeline produced unusable output: %s", pipeline_error)
        raise HTTPException(
            status_code=502,
            detail="The AI returned something we could not read. Please try again.",
        )

    except Exception as unexpected_error:
        # Unexpected: network, auth, a bug. Full stack trace to the log.
        logger.exception("Unexpected failure in the AI pipeline")
        raise HTTPException(
            status_code=500,
            detail="The AI service failed to generate study material.",
        )
