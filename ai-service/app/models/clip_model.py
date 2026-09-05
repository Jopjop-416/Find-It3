"""
OpenCLIP model loader — singleton pattern so the model is loaded once.

Model: ViT-B-32 (openai pretrained)
Embedding dimension: 512
"""

from __future__ import annotations

import logging
from typing import Optional

import open_clip
import torch
from PIL import Image

logger = logging.getLogger(__name__)

_instance: Optional["CLIPModel"] = None


def get_clip_model() -> "CLIPModel":
    """Return singleton CLIP model instance (lazy loaded)."""
    global _instance
    if _instance is None:
        _instance = CLIPModel()
    return _instance


class CLIPModel:
    """
    Wraps OpenCLIP ViT-B-32 for image embedding generation.

    The model is loaded once at startup (or first use) and kept in memory.
    Inference runs on CPU by default; uses CUDA if available.
    """

    def __init__(
        self,
        model_name: str = "ViT-B-32",
        pretrained: str = "openai",
    ) -> None:
        from app.config import CLIP_MODEL, CLIP_PRETRAINED

        model_name = CLIP_MODEL or model_name
        pretrained = CLIP_PRETRAINED or pretrained

        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(
            "Loading OpenCLIP model '%s' (pretrained='%s') on device '%s' …",
            model_name,
            pretrained,
            self.device,
        )

        self.model, _, self.preprocess = open_clip.create_model_and_transforms(
            model_name,
            pretrained=pretrained,
        )
        self.model = self.model.to(self.device)
        self.model.eval()

        # Probe the actual embedding dimension
        with torch.no_grad():
            dummy = torch.zeros(1, 3, 224, 224).to(self.device)
            self.embedding_dim: int = self.model.encode_image(dummy).shape[-1]

        self.model_name = model_name
        self.pretrained = pretrained

        logger.info(
            "OpenCLIP model loaded. Embedding dimension: %d",
            self.embedding_dim,
        )

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def encode_image(self, image: Image.Image) -> list[float]:
        """
        Encode a PIL Image into a normalized embedding vector.

        Returns a list of floats (length = self.embedding_dim).
        The embedding is L2-normalized so cosine similarity == dot product.
        """
        tensor = self.preprocess(image).unsqueeze(0).to(self.device)

        with torch.no_grad():
            embedding = self.model.encode_image(tensor)

        # L2 normalize
        embedding = embedding / embedding.norm(dim=-1, keepdim=True)

        return embedding[0].cpu().numpy().tolist()
