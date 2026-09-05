"""
Pydantic schemas for the Find-It AI Service API.
"""

from __future__ import annotations

from pydantic import BaseModel
from typing import Optional


# ── Embedding ─────────────────────────────────────────────────────────────────


class EmbedRequest(BaseModel):
    """
    Request body for POST /embed.

    Provide exactly one of:
    - image_url: publicly accessible image URL (e.g. Supabase Storage public URL)
    - image_base64: base64-encoded image, with or without data-URI prefix
    """

    image_url: Optional[str] = None
    image_base64: Optional[str] = None


class EmbedResponse(BaseModel):
    """Response from POST /embed."""

    embedding: list[float]
    model: str           # e.g. "ViT-B-32/openai"
    dimension: int       # e.g. 512
    source: str          # "url" or "base64"


# ── Similarity ────────────────────────────────────────────────────────────────


class SimilarityRequest(BaseModel):
    """Request body for POST /similarity."""

    embedding_a: list[float]
    embedding_b: list[float]


class SimilarityResponse(BaseModel):
    """
    Response from POST /similarity.

    cosine_similarity   : raw value in [-1, 1]
    visual_score_percent: display-friendly 0-100 value

    NOTE: visual_score_percent is a *visual similarity indicator*, NOT a
    probability that the items are identical objects.
    """

    cosine_similarity: float
    visual_score_percent: float


# ── Health ────────────────────────────────────────────────────────────────────


class HealthResponse(BaseModel):
    """Response from GET /health."""

    status: str    # "ok" or "error"
    model: str     # e.g. "ViT-B-32/openai"
    dimension: int # e.g. 512
