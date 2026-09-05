"""
Configuration for Find-It AI Service.
All settings loaded from environment variables / .env file.
"""

import os
from dotenv import load_dotenv

load_dotenv()

# ── CLIP Model ──────────────────────────────────────────────────────────────
CLIP_MODEL: str = os.getenv("CLIP_MODEL", "ViT-B-32")
CLIP_PRETRAINED: str = os.getenv("CLIP_PRETRAINED", "openai")
# ViT-B-32 (openai) produces 512-dimensional embeddings — matches DB vector(512)

# ── Supabase (server-side only, NEVER expose to frontend) ───────────────────
SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

# ── Server ───────────────────────────────────────────────────────────────────
HOST: str = os.getenv("HOST", "127.0.0.1")
PORT: int = int(os.getenv("PORT", "8000"))

# ── CORS ─────────────────────────────────────────────────────────────────────
# Comma-separated list of allowed origins
ALLOWED_ORIGINS: list[str] = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    if origin.strip()
]

# ── Matching ─────────────────────────────────────────────────────────────────
# Minimum cosine similarity to even return a candidate from vector search
VECTOR_MATCH_THRESHOLD: float = float(os.getenv("VECTOR_MATCH_THRESHOLD", "0.30"))
# How many top candidates to retrieve from vector search before attribute scoring
VECTOR_MATCH_COUNT: int = int(os.getenv("VECTOR_MATCH_COUNT", "20"))

# ── Algorithm meta ────────────────────────────────────────────────────────────
ALGORITHM_VERSION: str = "ai-v1"
MODEL_DISPLAY_NAME: str = f"OpenCLIP/{CLIP_MODEL}/{CLIP_PRETRAINED}"
