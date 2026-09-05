/**
 * Find-It AI Service client.
 *
 * This module calls the Python FastAPI AI service to:
 * 1. Generate image embeddings via OpenCLIP (ViT-B-32, 512 dims)
 * 2. Check service availability
 *
 * SECURITY:
 * - Only uses VITE_AI_SERVICE_URL (no secret keys exposed to frontend)
 * - All Supabase service-role operations happen server-side in the AI service
 *
 * USAGE:
 *   const embedding = await generateImageEmbedding(imageUrl);
 *   // embedding is number[] | null (null = AI unavailable → use legacy fallback)
 */

const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL as string | undefined;

/** How long to wait for the embed endpoint (ms). */
const EMBED_TIMEOUT_MS = 30_000;

/** How long to wait for the health check (ms). */
const HEALTH_TIMEOUT_MS = 5_000;

// ── Types ────────────────────────────────────────────────────────────────────

export interface EmbedResponse {
  embedding: number[];
  model: string;
  dimension: number;
  source: 'url' | 'base64';
}

export interface AIServiceHealth {
  status: 'ok' | 'error' | 'unconfigured';
  model?: string;
  dimension?: number;
  message?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getServiceUrl(): string | null {
  if (!AI_SERVICE_URL || !AI_SERVICE_URL.trim()) {
    return null;
  }
  return AI_SERVICE_URL.replace(/\/$/, ''); // strip trailing slash
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Check whether the AI service is reachable and the model is loaded.
 *
 * Returns a health object — never throws.
 */
export async function checkAIServiceHealth(): Promise<AIServiceHealth> {
  const base = getServiceUrl();

  if (!base) {
    return {
      status: 'unconfigured',
      message: 'VITE_AI_SERVICE_URL is not set — AI matching disabled.',
    };
  }

  try {
    const response = await fetchWithTimeout(
      `${base}/health`,
      { method: 'GET' },
      HEALTH_TIMEOUT_MS,
    );

    if (!response.ok) {
      return { status: 'error', message: `AI service returned HTTP ${response.status}` };
    }

    const data = await response.json() as { status: string; model?: string; dimension?: number };
    return {
      status: data.status === 'ok' ? 'ok' : 'error',
      model: data.model,
      dimension: data.dimension,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { status: 'error', message };
  }
}

/**
 * Generate an image embedding vector from a public URL or base64 data URI.
 *
 * @param imageData - A public URL (starting with http/https) OR a base64 data URI.
 * @returns A normalized 512-dimensional embedding vector, or `null` if the
 *          AI service is unavailable / embedding failed (use legacy fallback).
 */
export async function generateImageEmbedding(
  imageData: string,
): Promise<number[] | null> {
  const base = getServiceUrl();

  if (!base) {
    console.warn('[aiService] VITE_AI_SERVICE_URL not configured — skipping AI embedding.');
    return null;
  }

  if (!imageData || !imageData.trim()) {
    return null;
  }

  const isUrl =
    imageData.startsWith('http://') ||
    imageData.startsWith('https://');

  const body = isUrl
    ? JSON.stringify({ image_url: imageData })
    : JSON.stringify({ image_base64: imageData });

  try {
    const response = await fetchWithTimeout(
      `${base}/embed`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      },
      EMBED_TIMEOUT_MS,
    );

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error(
        `[aiService] /embed returned HTTP ${response.status}:`,
        text.slice(0, 200),
      );
      return null;
    }

    const data = await response.json() as EmbedResponse;

    if (!Array.isArray(data.embedding) || data.embedding.length === 0) {
      console.error('[aiService] /embed returned invalid embedding:', data);
      return null;
    }

    return data.embedding;
  } catch (err) {
    const isAbort = err instanceof DOMException && err.name === 'AbortError';
    if (isAbort) {
      console.warn('[aiService] /embed timed out after', EMBED_TIMEOUT_MS, 'ms');
    } else {
      console.warn('[aiService] /embed failed:', err);
    }
    return null;
  }
}
