"""
Image embedding service.

Handles:
- Fetching image from URL (with retry)
- Decoding base64 images
- Preprocessing and encoding with OpenCLIP
"""

from __future__ import annotations

import base64
import logging
from io import BytesIO

import requests
from PIL import Image

logger = logging.getLogger(__name__)

# Maximum image size before downsampling (width × height pixels)
MAX_IMAGE_PIXELS = 89_478_485  # PIL default safety limit
# Timeout for image download (seconds)
DOWNLOAD_TIMEOUT = 20
# Maximum download retries
MAX_RETRIES = 3


def _open_image_safe(data: bytes) -> Image.Image:
    """Open image bytes as RGB PIL Image."""
    Image.MAX_IMAGE_PIXELS = MAX_IMAGE_PIXELS
    image = Image.open(BytesIO(data)).convert("RGB")
    return image


def _fetch_image_from_url(url: str) -> Image.Image:
    """Download an image from a URL (with basic retry logic)."""
    last_error: Exception | None = None

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = requests.get(url, timeout=DOWNLOAD_TIMEOUT)
            response.raise_for_status()
            return _open_image_safe(response.content)
        except Exception as exc:
            last_error = exc
            logger.warning(
                "Image download attempt %d/%d failed for '%s': %s",
                attempt,
                MAX_RETRIES,
                url[:80],
                exc,
            )

    raise RuntimeError(
        f"Failed to download image from URL after {MAX_RETRIES} attempts: {last_error}"
    )


def _fetch_image_from_base64(b64_data: str) -> Image.Image:
    """
    Decode a base64-encoded image (with or without data-URI prefix).
    Supports:  'data:image/jpeg;base64,<data>'  or  raw base64 string.
    """
    if "," in b64_data:
        # Strip data-URI header: 'data:image/jpeg;base64,<actual_data>'
        b64_data = b64_data.split(",", 1)[1]

    try:
        image_bytes = base64.b64decode(b64_data)
    except Exception as exc:
        raise ValueError(f"Invalid base64 image data: {exc}") from exc

    return _open_image_safe(image_bytes)


def generate_embedding_from_url(image_url: str) -> list[float]:
    """
    Full pipeline:  URL → PIL Image → OpenCLIP → normalized embedding.
    """
    from app.models.clip_model import get_clip_model

    image = _fetch_image_from_url(image_url)
    model = get_clip_model()
    return model.encode_image(image)


def generate_embedding_from_base64(b64_data: str) -> list[float]:
    """
    Full pipeline:  base64 string → PIL Image → OpenCLIP → normalized embedding.
    """
    from app.models.clip_model import get_clip_model

    image = _fetch_image_from_base64(b64_data)
    model = get_clip_model()
    return model.encode_image(image)
