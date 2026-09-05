"""
Find-It AI Matching Service — FastAPI entry point.

Endpoints:
  GET  /             Health check (minimal)
  GET  /health       Detailed health check (model status)
  POST /embed        Generate image embedding from URL or base64
  POST /similarity   Compute cosine similarity between two embeddings
"""

from __future__ import annotations

import logging
import time

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import ALLOWED_ORIGINS, ALGORITHM_VERSION, MODEL_DISPLAY_NAME
from app.schemas.api import (
    EmbedRequest,
    EmbedResponse,
    HealthResponse,
    SimilarityRequest,
    SimilarityResponse,
)
from app.services.embedding_service import (
    generate_embedding_from_base64,
    generate_embedding_from_url,
)
from app.services.similarity import cosine_similarity, cosine_similarity_to_percent

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Find-It AI Matching Service",
    description=(
        "Generates image embeddings with OpenCLIP and computes visual similarity "
        "for the Find-It lost & found matching system."
    ),
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routes ────────────────────────────────────────────────────────────────────


@app.get("/", tags=["health"])
def root() -> dict:
    return {
        "service": "Find-It AI Matching Service",
        "status": "running",
        "algorithm_version": ALGORITHM_VERSION,
        "model": MODEL_DISPLAY_NAME,
    }


@app.get("/health", response_model=HealthResponse, tags=["health"])
def health_check() -> HealthResponse:
    """
    Detailed health check.  Loads the model if not yet loaded so that
    the first /embed call does not suffer from cold-start latency.
    """
    try:
        from app.models.clip_model import get_clip_model

        clip = get_clip_model()
        return HealthResponse(
            status="ok",
            model=f"{clip.model_name}/{clip.pretrained}",
            dimension=clip.embedding_dim,
        )
    except Exception as exc:
        logger.exception("Health check failed: %s", exc)
        raise HTTPException(status_code=503, detail=f"Model unavailable: {exc}") from exc


@app.post("/embed", response_model=EmbedResponse, tags=["embedding"])
def create_embedding(request: EmbedRequest) -> EmbedResponse:
    """
    Generate a normalized image embedding vector.

    Accepts either:
    - `image_url` — a publicly accessible URL (e.g. Supabase Storage public URL)
    - `image_base64` — a raw or data-URI base64-encoded image string

    Returns:
    - `embedding` — list of floats (length = model embedding dimension)
    - `model` — model identifier
    - `dimension` — embedding length (e.g. 512 for ViT-B-32)
    - `source` — "url" or "base64"
    """
    if not request.image_url and not request.image_base64:
        raise HTTPException(
            status_code=422,
            detail="Provide either 'image_url' or 'image_base64'.",
        )

    start = time.perf_counter()

    try:
        if request.image_url:
            embedding = generate_embedding_from_url(request.image_url)
            source = "url"
        else:
            # image_base64 is guaranteed non-None here
            assert request.image_base64 is not None
            embedding = generate_embedding_from_base64(request.image_base64)
            source = "base64"

    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Unexpected error during embedding: %s", exc)
        raise HTTPException(status_code=500, detail=f"Embedding failed: {exc}") from exc

    elapsed = time.perf_counter() - start
    logger.info(
        "Embedding generated | source=%s | dim=%d | elapsed=%.3fs",
        source,
        len(embedding),
        elapsed,
    )

    from app.models.clip_model import get_clip_model

    clip = get_clip_model()
    return EmbedResponse(
        embedding=embedding,
        model=f"{clip.model_name}/{clip.pretrained}",
        dimension=len(embedding),
        source=source,
    )


@app.post("/similarity", response_model=SimilarityResponse, tags=["similarity"])
def compute_similarity(request: SimilarityRequest) -> SimilarityResponse:
    """
    Compute cosine similarity between two embedding vectors.

    Input:
    - `embedding_a`, `embedding_b` — two embedding vectors of equal length

    Output:
    - `cosine_similarity` — raw value in [-1, 1]
    - `visual_score_percent` — display-friendly 0-100 value (max(0, sim) * 100)

    IMPORTANT: `visual_score_percent` is a *visual similarity indicator*,
    not a probability that the items are the same object.
    """
    if len(request.embedding_a) != len(request.embedding_b):
        raise HTTPException(
            status_code=422,
            detail=(
                f"Embedding dimension mismatch: "
                f"{len(request.embedding_a)} vs {len(request.embedding_b)}"
            ),
        )

    sim = cosine_similarity(request.embedding_a, request.embedding_b)
    return SimilarityResponse(
        cosine_similarity=sim,
        visual_score_percent=cosine_similarity_to_percent(sim),
    )
