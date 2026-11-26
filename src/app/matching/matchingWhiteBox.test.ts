import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as attributeMatching from "./attributeMatching";
import { dateScore, calculateAttributeScores } from "./attributeMatching";
import {
  calculateAIMatchScore,
  calculateAttributeSubScore,
  calculateFinalMatchScore,
  determineMatchStatus,
  buildMatchReason,
} from "./aiMatching";
import { ALGORITHM_VERSION, MATCH_THRESHOLDS } from "./types";

// ── 1. White-Box Unit Tests (Implementasi Test Case Pre-Lab TC-01 s.d. TC-06) ──

describe("White-Box Statement & Branch Coverage: dateScore()", () => {
  it("TC-01: returns 0 when either input is not a string (Decision 1 - B1 True)", () => {
    // Arrange
    const lostDate: unknown = null;
    const foundDate: unknown = "2026-10-20";

    // Act
    const score = dateScore(lostDate, foundDate);

    // Assert
    expect(score).toBe(0);
  });

  it("TC-02: returns 0 when date format is invalid / NaN (Decision 2 - B3 True)", () => {
    // Arrange
    const lostDate = "invalid-date";
    const foundDate = "2026-10-20";

    // Act
    const score = dateScore(lostDate, foundDate);

    // Assert
    expect(score).toBe(0);
  });

  it("TC-03: returns 100 when date difference is <= 1 day (Decision 3 - B5 True)", () => {
    // Arrange
    const lostDate = "2026-10-20";
    const foundDate = "2026-10-21";

    // Act
    const score = dateScore(lostDate, foundDate);

    // Assert
    expect(score).toBe(100);
  });

  it("TC-04: returns 70 when date difference is <= 3 days (Decision 4 - B7 True)", () => {
    // Arrange
    const lostDate = "2026-10-20";
    const foundDate = "2026-10-23";

    // Act
    const score = dateScore(lostDate, foundDate);

    // Assert
    expect(score).toBe(70);
  });

  it("TC-05: returns 40 when date difference is <= 7 days (Decision 5 - B9 True)", () => {
    // Arrange
    const lostDate = "2026-10-20";
    const foundDate = "2026-10-26";

    // Act
    const score = dateScore(lostDate, foundDate);

    // Assert
    expect(score).toBe(40);
  });

  it("TC-06: returns 0 when date difference is > 7 days (Decision 5 - B10 False)", () => {
    // Arrange
    const lostDate = "2026-10-01";
    const foundDate = "2026-10-20";

    // Act
    const score = dateScore(lostDate, foundDate);

    // Assert
    expect(score).toBe(0);
  });
});

// ── 2. Unit Tests: Logika Penilaian & Status Sistem Pencocokan Barang ────────

describe("Unit Testing: Item Matching Scoring & Status (Positive & Negative)", () => {
  it("computes attribute scores and weighted final match score for matching items", () => {
    // Arrange
    const lostItem = {
      id: 101,
      type: "lost",
      category: "Elektronik",
      title: "HP Samsung Hitam",
      description: "Layar retak casing hitam",
      location: "GKB 1",
      date: "2026-10-20",
    };
    const foundItem = {
      id: 202,
      type: "found",
      category: "Elektronik",
      title: "Handphone Samsung Hitam",
      description: "Layar retak casing hitam",
      location: "GKB 1",
      date: "2026-10-21",
    };

    // Act
    const attr = calculateAttributeScores(lostItem, foundItem);
    const finalScore = calculateFinalMatchScore({ visual: 90, ...attr });
    const attrSubScore = calculateAttributeSubScore({ visual: 90, ...attr });

    // Assert
    expect(attr.category).toBe(100);
    expect(attr.date).toBe(100);
    expect(finalScore).toBeGreaterThanOrEqual(MATCH_THRESHOLDS.matched);
    expect(attrSubScore).toBe(100);
  });

  it("downgrades status to candidate when visual score guard triggers", () => {
    // Arrange
    const finalScore = 85;
    const suspiciousVisualScore = 25;

    // Act
    const status = determineMatchStatus(finalScore, suspiciousVisualScore);

    // Assert
    expect(status).toBe("candidate");
  });

  it("returns candidate when finalScore >= 65 and < 80, and rejected when < 65", () => {
    // Arrange
    const candidateScore = 70;
    const rejectedScore = 50;
    const visualScore = 70;

    // Act
    const candidateStatus = determineMatchStatus(candidateScore, visualScore);
    const rejectedStatus = determineMatchStatus(rejectedScore, visualScore);

    // Assert
    expect(candidateStatus).toBe("candidate");
    expect(rejectedStatus).toBe("rejected");
  });

  it("handles attribute mismatches and empty values cleanly", () => {
    // Arrange
    const emptySource = { category: "", title: "Kunci Motor", description: "Kunci Honda", location: "", date: "2026-10-20" };
    const mismatchCandidate = { category: "Dokumen", title: "Buku Tulis", description: "Buku catatan kuliah", location: "Kantin", date: "2026-10-20" };

    // Act
    const scores = calculateAttributeScores(emptySource, mismatchCandidate);

    // Assert
    expect(scores.category).toBe(0);
    expect(scores.title).toBe(0);
    expect(scores.description).toBe(0);
    expect(scores.location).toBe(0);
  });

  it("returns null from calculateAIMatchScore when items do not match (negative scenario)", () => {
    // Arrange
    const lostItem = {
      id: 1,
      type: "lost",
      category: "Elektronik",
      title: "Laptop Lenovo",
      description: "Laptop warna abu-abu",
      location: "GKB 3",
      date: "2026-09-01",
    };
    const foundItem = {
      id: 2,
      type: "found",
      category: "Aksesoris",
      title: "Kacamata Hitam",
      description: "Frame bulat di kantin",
      location: "Masjid AR Fachruddin",
      date: "2026-10-25",
    };

    // Act
    const result = calculateAIMatchScore(lostItem, foundItem, null, "ViT-B-32/openai");

    // Assert
    expect(result).toBeNull();
  });

  it("builds accurate Indonesian match reasons based on score breakdown", () => {
    // Arrange
    const breakdown = {
      visual: 82,
      category: 100,
      title: 100,
      description: 60,
      location: 50,
      date: 70,
      final: 81.5,
    };
    const source = { category: "Elektronik", location: "Perpustakaan" };
    const candidate = { category: "Elektronik", location: "Perpustakaan Pusat" };

    // Act
    const reasons = buildMatchReason(breakdown, source, candidate);

    // Assert
    expect(reasons).toContain("Kemiripan visual sangat tinggi (82.0%)");
    expect(reasons).toContain('Kategori sama: "Elektronik"');
    expect(reasons).toContain("Lokasi berdekatan");
    expect(reasons).toContain("Tanggal kejadian berdekatan (≤ 3 hari)");
  });

  it("builds reasons for medium visual, exact location, and 1-week date range", () => {
    // Arrange
    const breakdown = {
      visual: 65,
      category: 0,
      title: 0,
      description: 0,
      location: 100,
      date: 40,
      final: 65,
    };
    const source = { location: "GKB 2" };
    const candidate = { location: "GKB 2" };

    // Act
    const reasons = buildMatchReason(breakdown, source, candidate);

    // Assert
    expect(reasons).toContain("Kemiripan visual cukup tinggi (65.0%)");
    expect(reasons).toContain('Lokasi sama: "GKB 2"');
    expect(reasons).toContain("Tanggal kejadian dalam rentang 1 minggu");
  });
});

// ── 3. Implementasi Test Double (Stub, Mock, Spy) ────────────────────────────

describe("Test Doubles: Isolating Dependencies in Sistem Pencocokan Barang", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("VITE_AI_SERVICE_URL", "http://ai.local");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("Stub: returns healthy status using stubbed fetch response without real AI server", async () => {
    // Arrange (Test Double 1: Stub)
    const fetchStub = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "ok",
        model: "ViT-B-32/openai",
        dimension: 512,
      }),
    });
    vi.stubGlobal("fetch", fetchStub);
    const { checkAIServiceHealth } = await import("../../lib/aiService");

    // Act
    const health = await checkAIServiceHealth();

    // Assert
    expect(health).toEqual({
      status: "ok",
      model: "ViT-B-32/openai",
      dimension: 512,
    });
  });

  it("Stub: returns null when AI service responds with HTTP 500 error", async () => {
    // Arrange (Test Double 1: Stub for error simulation)
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchStub = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "Internal Server Error",
    });
    vi.stubGlobal("fetch", fetchStub);
    const { generateImageEmbedding } = await import("../../lib/aiService");

    // Act
    const embedding = await generateImageEmbedding("https://example.com/item.jpg");

    // Assert
    expect(embedding).toBeNull();
    expect(errorSpy).toHaveBeenCalled();
  });

  it("Mock: verifies exact POST request contract to /embed endpoint and returns vector", async () => {
    // Arrange (Test Double 2: Mock)
    const expectedVector = [0.12, -0.34, 0.56];
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        embedding: expectedVector,
        model: "ViT-B-32/openai",
        dimension: 512,
        source: "url",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const { generateImageEmbedding } = await import("../../lib/aiService");
    const targetImageUrl = "https://cdn.findit.local/dompet.jpg";

    // Act
    const embedding = await generateImageEmbedding(targetImageUrl);

    // Assert (Verify return value & interaction with dependency)
    expect(embedding).toEqual(expectedVector);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://ai.local/embed",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: targetImageUrl }),
      }),
    );
  });

  it("Spy: observes calculateAttributeScores inside calculateAIMatchScore without modifying it", () => {
    // Arrange (Test Double 3: Spy)
    const attrSpy = vi.spyOn(attributeMatching, "calculateAttributeScores");
    const lostItem = {
      id: 10,
      type: "lost",
      category: "Dompet",
      title: "Dompet Kulit Coklat",
      description: "Dompet berisi KTM UMM",
      location: "GKB 4",
      date: "2026-10-20",
    };
    const foundItem = {
      id: 20,
      type: "found",
      category: "Dompet",
      title: "Dompet Kulit Coklat",
      description: "Ditemukan dompet ada KTM UMM",
      location: "GKB 4",
      date: "2026-10-20",
    };

    // Act
    const result = calculateAIMatchScore(lostItem, foundItem, 92, "ViT-B-32/openai");

    // Assert
    expect(attrSpy).toHaveBeenCalledTimes(1);
    expect(attrSpy).toHaveBeenCalledWith(lostItem, foundItem);
    expect(result).not.toBeNull();
    expect(result?.status).toBe("matched");
    expect(result?.algorithmVersion).toBe(ALGORITHM_VERSION);
  });

  it("Spy: observes console.warn when AI service request times out (AbortError)", async () => {
    // Arrange (Test Double 3: Spy)
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetchStub = vi.fn().mockRejectedValue(new DOMException("The operation was aborted.", "AbortError"));
    vi.stubGlobal("fetch", fetchStub);
    const { generateImageEmbedding } = await import("../../lib/aiService");

    // Act
    const embedding = await generateImageEmbedding("data:image/png;base64,iVBORw0KGgo=");

    // Assert
    expect(embedding).toBeNull();
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toContain("timed out");
  });

  it("Stub & Spy: handles unconfigured URL and invalid embedding response gracefully", async () => {
    // Arrange (Test Double: Stub env + Spy console.warn)
    vi.stubEnv("VITE_AI_SERVICE_URL", "");
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { checkAIServiceHealth, generateImageEmbedding } = await import("../../lib/aiService");

    // Act
    const health = await checkAIServiceHealth();
    const embedding = await generateImageEmbedding("https://example.com/item.jpg");

    // Assert
    expect(health.status).toBe("unconfigured");
    expect(embedding).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
  });

  it("Stub: returns error health when fetch rejects and null when /embed payload is invalid", async () => {
    // Arrange
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchStub = vi
      .fn()
      .mockRejectedValueOnce(new Error("Network offline"))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ embedding: [] }),
      });
    vi.stubGlobal("fetch", fetchStub);
    const { checkAIServiceHealth, generateImageEmbedding } = await import("../../lib/aiService");

    // Act
    const health = await checkAIServiceHealth();
    const embedding = await generateImageEmbedding("https://example.com/item.jpg");

    // Assert
    expect(health).toEqual({ status: "error", message: "Network offline" });
    expect(embedding).toBeNull();
    expect(errorSpy).toHaveBeenCalled();
  });
});
