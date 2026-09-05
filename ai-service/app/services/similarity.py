"""
Cosine similarity helper.

We keep this separate so it can be imported by both the API layer
and any future batch-processing scripts without pulling in FastAPI.
"""

from __future__ import annotations

import numpy as np


def cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    """
    Compute cosine similarity between two embedding vectors.

    Returns a float in the range [-1, 1].
    For L2-normalized embeddings (which our CLIP model produces),
    this is equivalent to the dot product.

    NOTE: Do NOT interpret this raw value as a probability.
    Use it only as a *visual similarity* indicator after calibration.
    """
    a = np.array(vec_a, dtype=np.float32)
    b = np.array(vec_b, dtype=np.float32)

    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)

    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0

    return float(np.dot(a, b) / (norm_a * norm_b))


def cosine_similarity_to_percent(similarity: float) -> float:
    """
    Map cosine similarity [-1, 1] to a 0-100 percent scale.

    IMPORTANT: This is a *display* transformation only.
    It does NOT imply that the percent equals probability of being the same item.

    For CLIP/OpenCLIP in the semantic visual domain:
      - Similarity near 1.0 → very similar visual content
      - Similarity near 0.0 → visually unrelated
      - Similarity < 0 → rare; treated as 0 for display purposes

    The mapping  max(0, similarity) * 100  is used here.
    Re-evaluate this transformation after testing with your own dataset.
    """
    return round(max(0.0, similarity) * 100, 2)
