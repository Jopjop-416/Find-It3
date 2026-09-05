/**
 * Attribute-based scoring for Find-It matching.
 *
 * Each function returns a score in the range 0–100.
 * The legacy text utilities from appState.ts are preserved and re-used here.
 */

// ── Internal text helpers (same logic as appState.ts, kept in sync) ─────────

const MATCH_STOPWORDS = new Set([
  'yang', 'dan', 'di', 'ke', 'dari', 'ada', 'itu', 'ini', 'untuk',
  'dengan', 'saya', 'pada', 'atau',
]);

const MATCH_SYNONYMS: Record<string, string> = {
  hp: 'handphone',
  ponsel: 'handphone',
  smartphone: 'handphone',
  ktm: 'kartu mahasiswa',
  kartuidentitas: 'kartu identitas',
  idcard: 'kartu identitas',
};

function normalizeText(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(value: unknown): string[] {
  return normalizeText(value)
    .split(' ')
    .flatMap((token) => {
      if (!token || MATCH_STOPWORDS.has(token)) return [];
      const synonym = MATCH_SYNONYMS[token] ?? token;
      return synonym.split(' ').filter(Boolean);
    });
}

function tokenOverlapScore(
  a: unknown,
  b: unknown,
  highScore = 100,
  medScore = 60,
): number {
  const tokA = new Set(tokenize(a));
  const tokB = new Set(tokenize(b));
  if (tokA.size === 0 || tokB.size === 0) return 0;
  const overlap = Array.from(tokA).filter((t) => tokB.has(t)).length;
  const ratio = overlap / Math.max(tokA.size, tokB.size);
  if (ratio >= 0.6) return highScore;
  if (ratio >= 0.3) return medScore;
  return 0;
}

// ── Public attribute scoring functions ────────────────────────────────────────

/**
 * Category score — exact match only (categories are from a fixed dropdown).
 * Returns 0 or 100.
 */
export function categoryScore(a: unknown, b: unknown): number {
  const catA = normalizeText(a);
  const catB = normalizeText(b);
  if (!catA || !catB) return 0;
  return catA === catB ? 100 : 0;
}

/**
 * Title score based on token overlap.
 * Returns 0, 60, or 100.
 */
export function titleScore(a: unknown, b: unknown): number {
  return tokenOverlapScore(a, b, 100, 60);
}

/**
 * Description score based on token overlap.
 * Returns 0, 60, or 100.
 */
export function descriptionScore(a: unknown, b: unknown): number {
  return tokenOverlapScore(a, b, 100, 60);
}

/**
 * Location score.
 * Exact match → 100, any common token → 50, no match → 0.
 */
export function locationScore(a: unknown, b: unknown): number {
  const locA = normalizeText(a);
  const locB = normalizeText(b);
  if (!locA || !locB) return 0;
  if (locA === locB) return 100;
  const tokA = new Set(tokenize(locA));
  const tokB = new Set(tokenize(locB));
  const overlap = Array.from(tokA).filter((t) => tokB.has(t)).length;
  return overlap > 0 ? 50 : 0;
}

/**
 * Date proximity score.
 *
 * <= 1 day  → 100
 * <= 3 days → 70
 * <= 7 days → 40
 * > 7 days  → 0
 */
export function dateScore(a: unknown, b: unknown): number {
  if (typeof a !== 'string' || typeof b !== 'string') return 0;
  const da = new Date(a);
  const db = new Date(b);
  if (Number.isNaN(da.getTime()) || Number.isNaN(db.getTime())) return 0;
  const diffDays = Math.abs(da.getTime() - db.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays <= 1) return 100;
  if (diffDays <= 3) return 70;
  if (diffDays <= 7) return 40;
  return 0;
}

// ── Composite attribute score ─────────────────────────────────────────────────

export interface AttributeScores {
  category: number;
  title: number;
  description: number;
  location: number;
  date: number;
}

/**
 * Calculate all attribute scores in one call.
 */
export function calculateAttributeScores(
  source: Record<string, unknown>,
  candidate: Record<string, unknown>,
): AttributeScores {
  return {
    category: categoryScore(source.category, candidate.category),
    title: titleScore(source.title, candidate.title),
    description: descriptionScore(source.description, candidate.description),
    location: locationScore(source.location, candidate.location),
    date: dateScore(source.date, candidate.date),
  };
}
