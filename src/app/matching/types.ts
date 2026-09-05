/**
 * Types and configuration constants for Find-It's AI multimodal matching system.
 *
 * IMPORTANT: All weights and thresholds here are initial values for the
 * prototype / research phase. They MUST be calibrated using a real test dataset
 * before drawing research conclusions.
 */

// ── Score Breakdown ────────────────────────────────────────────────────────────

/**
 * Per-dimension scores (each 0–100) that make up the final match score.
 *
 * `visual` comes from OpenCLIP cosine similarity (image embedding comparison).
 * All other dimensions are attribute-based text scores.
 */
export interface MatchScoreBreakdown {
  visual: number;       // 0-100 — image embedding cosine similarity
  category: number;     // 0-100 — exact match or token overlap
  title: number;        // 0-100 — token overlap (normalized)
  description: number;  // 0-100 — token overlap (normalized)
  location: number;     // 0-100 — exact or partial match
  date: number;         // 0-100 — proximity in days
  final: number;        // 0-100 — weighted composite score
}

/**
 * Full AI match result including breakdown and metadata.
 */
export interface AIMatchResult {
  lostItemId: number;
  foundItemId: number;
  breakdown: MatchScoreBreakdown;
  visualScore: number;          // copy of breakdown.visual (convenience)
  attributeScore: number;       // weighted attribute-only sub-score (0-100)
  finalScore: number;           // copy of breakdown.final (convenience)
  status: 'matched' | 'candidate' | 'rejected';
  reason: string[];             // human-readable reasons (Indonesian)
  algorithmVersion: string;     // e.g. "ai-v1"
  modelName: string;            // e.g. "ViT-B-32/openai"
}

// ── Match Weights ─────────────────────────────────────────────────────────────

/**
 * Weights for each scoring dimension.
 * Must sum to 1.0 (validated at runtime in development).
 *
 * NOTE: These are initial research weights. Calibrate using your test dataset.
 *
 * Rationale for current values:
 * - visual (0.60): image embedding is the primary differentiator in this system
 * - category (0.10): strong filter; same category items are much more likely to match
 * - location (0.10): physical proximity is a strong signal
 * - date (0.10): temporal proximity is also important
 * - title/description (0.05 each): supplementary text signals
 */
export const MATCH_WEIGHTS = {
  visual: 0.60,
  category: 0.10,
  title: 0.05,
  description: 0.05,
  location: 0.10,
  date: 0.10,
} as const satisfies Record<string, number>;

// ── Match Thresholds ──────────────────────────────────────────────────────────

/**
 * Final score thresholds.
 *
 * NOTE: These values need empirical calibration.
 * See docs/matching-calibration.md for methodology.
 *
 *  >= matched  → strong match → creates item_matches record + notifications
 *  >= candidate → possible match → creates item_matches record (candidate status)
 *  < candidate → rejected
 */
export const MATCH_THRESHOLDS = {
  matched: 80,    // finalScore >= 80 → strong match
  candidate: 65,  // finalScore >= 65 → possible match
} as const;

/**
 * Minimum visual score required for a "matched" status.
 *
 * Even if the final weighted score is >= matched threshold, a very low
 * visual similarity score is suspicious (two items with identical text
 * attributes but completely different images).
 *
 * Set to 0 to disable this guard (only use attribute scores).
 *
 * NOTE: Calibrate this value using your test dataset.
 */
export const MIN_VISUAL_SCORE_FOR_MATCH = 40; // percent (0-100)

// ── Algorithm Metadata ────────────────────────────────────────────────────────

export const ALGORITHM_VERSION = 'ai-v1';
export const LEGACY_ALGORITHM_VERSION = 'legacy-v1';
