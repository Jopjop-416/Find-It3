/**
 * AI-based multimodal matching engine for Find-It.
 *
 * Combines:
 * 1. Visual similarity (OpenCLIP embedding cosine similarity)
 * 2. Attribute scores (category, title, description, location, date)
 * into a weighted final match score.
 *
 * The legacy algorithm is preserved in appState.ts as calculateLegacyMatchScore().
 */

import { calculateAttributeScores } from './attributeMatching';
import {
  ALGORITHM_VERSION,
  MATCH_THRESHOLDS,
  MATCH_WEIGHTS,
  MIN_VISUAL_SCORE_FOR_MATCH,
  type AIMatchResult,
  type MatchScoreBreakdown,
} from './types';

// ── Final Score Calculation ───────────────────────────────────────────────────

/**
 * Calculate the weighted final match score from a breakdown.
 *
 * Formula:
 *   finalScore = sum(dimension_score × weight) for each dimension
 *
 * Result is rounded to 1 decimal place and clamped to [0, 100].
 */
export function calculateFinalMatchScore(
  breakdown: Omit<MatchScoreBreakdown, 'final'>,
): number {
  const weighted =
    breakdown.visual      * MATCH_WEIGHTS.visual +
    breakdown.category    * MATCH_WEIGHTS.category +
    breakdown.title       * MATCH_WEIGHTS.title +
    breakdown.description * MATCH_WEIGHTS.description +
    breakdown.location    * MATCH_WEIGHTS.location +
    breakdown.date        * MATCH_WEIGHTS.date;

  return Math.round(Math.min(100, Math.max(0, weighted)) * 10) / 10;
}

/**
 * Calculate the attribute-only sub-score (visual excluded).
 * Used for transparency and display.
 */
export function calculateAttributeSubScore(
  breakdown: Omit<MatchScoreBreakdown, 'final'>,
): number {
  // Renormalize weights excluding visual
  const attributeWeightTotal =
    MATCH_WEIGHTS.category +
    MATCH_WEIGHTS.title +
    MATCH_WEIGHTS.description +
    MATCH_WEIGHTS.location +
    MATCH_WEIGHTS.date;

  if (attributeWeightTotal === 0) return 0;

  const weighted =
    breakdown.category    * (MATCH_WEIGHTS.category    / attributeWeightTotal) +
    breakdown.title       * (MATCH_WEIGHTS.title        / attributeWeightTotal) +
    breakdown.description * (MATCH_WEIGHTS.description  / attributeWeightTotal) +
    breakdown.location    * (MATCH_WEIGHTS.location     / attributeWeightTotal) +
    breakdown.date        * (MATCH_WEIGHTS.date         / attributeWeightTotal);

  return Math.round(Math.min(100, Math.max(0, weighted)) * 10) / 10;
}

// ── Match Status ──────────────────────────────────────────────────────────────

/**
 * Determine match status based on final score and visual score guard.
 *
 * Even if finalScore >= matched threshold, a very low visual score
 * (< MIN_VISUAL_SCORE_FOR_MATCH) downgrades the status to 'candidate'
 * to prevent false positives from identical text but different images.
 */
export function determineMatchStatus(
  finalScore: number,
  visualScore: number,
): AIMatchResult['status'] {
  if (finalScore >= MATCH_THRESHOLDS.matched) {
    // Apply visual score guard only when visual data is available (>0)
    if (visualScore > 0 && visualScore < MIN_VISUAL_SCORE_FOR_MATCH) {
      // Suspicious: high attribute match but low visual similarity
      return 'candidate';
    }
    return 'matched';
  }

  if (finalScore >= MATCH_THRESHOLDS.candidate) {
    return 'candidate';
  }

  return 'rejected';
}

// ── Match Reason Builder ───────────────────────────────────────────────────────

/**
 * Build an array of human-readable match reasons in Indonesian.
 *
 * Only includes dimensions that actually contributed positively.
 * Does NOT fabricate reasons for dimensions with 0 score.
 */
export function buildMatchReason(
  breakdown: MatchScoreBreakdown,
  source: Record<string, unknown>,
  candidate: Record<string, unknown>,
): string[] {
  const reasons: string[] = [];

  // Visual
  if (breakdown.visual >= 80) {
    reasons.push(`Kemiripan visual sangat tinggi (${breakdown.visual.toFixed(1)}%)`);
  } else if (breakdown.visual >= 60) {
    reasons.push(`Kemiripan visual cukup tinggi (${breakdown.visual.toFixed(1)}%)`);
  } else if (breakdown.visual >= 40) {
    reasons.push(`Terdapat kemiripan visual (${breakdown.visual.toFixed(1)}%)`);
  }

  // Category
  if (breakdown.category === 100) {
    const cat = String(source.category ?? '');
    reasons.push(cat ? `Kategori sama: "${cat}"` : 'Kategori sama');
  }

  // Title
  if (breakdown.title >= 60) {
    reasons.push('Nama/judul barang sangat mirip');
  } else if (breakdown.title > 0) {
    reasons.push('Nama/judul barang cukup mirip');
  }

  // Description
  if (breakdown.description >= 60) {
    reasons.push('Deskripsi barang cocok');
  } else if (breakdown.description > 0) {
    reasons.push('Deskripsi barang cukup cocok');
  }

  // Location
  if (breakdown.location === 100) {
    const loc = String(source.location ?? '');
    reasons.push(loc ? `Lokasi sama: "${loc}"` : 'Lokasi sama');
  } else if (breakdown.location > 0) {
    reasons.push('Lokasi berdekatan');
  }

  // Date
  if (breakdown.date === 100) {
    reasons.push('Tanggal kejadian berdekatan (≤ 1 hari)');
  } else if (breakdown.date === 70) {
    reasons.push('Tanggal kejadian berdekatan (≤ 3 hari)');
  } else if (breakdown.date === 40) {
    reasons.push('Tanggal kejadian dalam rentang 1 minggu');
  }

  // Fallback if no reasons built (shouldn't normally happen)
  if (reasons.length === 0 && breakdown.final > 0) {
    reasons.push('Terdapat beberapa kesamaan atribut');
  }

  return reasons;
}

// ── Main AI Matching Function ──────────────────────────────────────────────────

/**
 * Calculate AI multimodal match score between a source item and a candidate.
 *
 * @param sourceItem    - The newly submitted item (lost or found)
 * @param candidateItem - An item from the opposite type to compare against
 * @param visualSimilarityPercent - Visual similarity score in 0-100 range,
 *                                   or null if no embedding is available for either item
 * @param modelName     - Display name of the embedding model used
 *
 * @returns AIMatchResult or null if the match is rejected (score below candidate threshold)
 */
export function calculateAIMatchScore(
  sourceItem: Record<string, unknown>,
  candidateItem: Record<string, unknown>,
  visualSimilarityPercent: number | null,
  modelName: string = 'unknown',
): AIMatchResult | null {
  // Attribute scores
  const attrScores = calculateAttributeScores(sourceItem, candidateItem);

  // Visual score — use 0 when no embedding is available
  const visualScore = visualSimilarityPercent ?? 0;

  const breakdown: Omit<MatchScoreBreakdown, 'final'> = {
    visual:      visualScore,
    category:    attrScores.category,
    title:       attrScores.title,
    description: attrScores.description,
    location:    attrScores.location,
    date:        attrScores.date,
  };

  const finalScore = calculateFinalMatchScore(breakdown);
  const status = determineMatchStatus(finalScore, visualScore);

  if (status === 'rejected') {
    return null;
  }

  const fullBreakdown: MatchScoreBreakdown = { ...breakdown, final: finalScore };
  const attributeScore = calculateAttributeSubScore(breakdown);

  const lostItemId =
    sourceItem.type === 'lost'
      ? Number(sourceItem.id)
      : Number(candidateItem.id);

  const foundItemId =
    sourceItem.type === 'found'
      ? Number(sourceItem.id)
      : Number(candidateItem.id);

  return {
    lostItemId,
    foundItemId,
    breakdown: fullBreakdown,
    visualScore,
    attributeScore,
    finalScore,
    status,
    reason: buildMatchReason(fullBreakdown, sourceItem, candidateItem),
    algorithmVersion: ALGORITHM_VERSION,
    modelName,
  };
}
