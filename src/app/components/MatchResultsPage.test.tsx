import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { MatchResultsPage } from "./MatchResultsPage";

describe("MatchResultsPage", () => {
  it("renders match summaries and highlights the selected match", () => {
    const markup = renderToStaticMarkup(
      <MatchResultsPage
        matches={[
          {
            matchId: 501,
            score: 86,
            status: "matched",
            reason: "Kategori sama, lokasi sama",
            myItem: {
              id: 10,
              title: "Dompet coklat",
              description: "Dompet kulit coklat",
              category: "Dompet",
              type: "lost",
              location: "Ruang Kelas A",
              date: "2026-06-08",
              image: "/lost.jpg",
              contact: "08123456789",
              reporter_id: "user-1",
              reporter_email: "zaky@student.umm.ac.id",
            },
            matchedItem: {
              id: 11,
              title: "Dompet kulit warna coklat",
              description: "Menemukan dompet coklat",
              category: "Dompet",
              type: "found",
              location: "Ruang Kelas A",
              date: "2026-06-08",
              image: "/found.jpg",
              contact: "081298765432",
              reporter_id: "user-2",
              reporter_email: "budi@student.umm.ac.id",
            },
            createdAt: "2026-06-08T10:00:00.000Z",
          },
        ]}
        currentUserEmail="zaky@student.umm.ac.id"
        currentUserId="user-1"
        selectedMatchId={501}
        onOpenReturnVerification={vi.fn()}
      />,
    );

    expect(markup).toContain("Kemungkinan Kecocokan");
    expect(markup).toContain("86% cocok");
    expect(markup).toContain("border border-orange-500");
    expect(markup).not.toContain("border-l-4");
    expect(markup).toContain("Dompet kulit warna coklat");
  });

  it("renders circular progress gauges for AI visual similarity and score breakdown", () => {
    const markup = renderToStaticMarkup(
      <MatchResultsPage
        matches={[
          {
            matchId: 502,
            score: 92,
            status: "matched",
            reason: "Kemiripan visual tinggi; Lokasi identik",
            algorithmVersion: "ai-v1",
            visualScore: 89.4,
            modelName: "OpenCLIP/ViT-B-32",
            matchDetails: {
              category: 100,
              title: 40,
              description: 75,
              location: 100,
              date: 90,
            },
            myItem: {
              id: 20,
              title: "Kunci Motor Honda",
              type: "lost",
            },
            matchedItem: {
              id: 21,
              title: "Ditemukan kunci Honda",
              type: "found",
            },
            createdAt: "2026-06-08T10:00:00.000Z",
          },
        ]}
        onOpenReturnVerification={vi.fn()}
      />,
    );

    // Header score gauge
    expect(markup).toContain("92% cocok");
    expect(markup).toContain("AI Matching");

    // Visual Similarity circular card
    expect(markup).toContain("Kemiripan Visual (AI)");
    expect(markup).toContain("Visual Similarity");
    expect(markup).toContain("89.4%");

    // Detail breakdown cards
    expect(markup).toContain("Detail Skor");
    expect(markup).toContain("Kategori");
    expect(markup).toContain("Judul");
    expect(markup).toContain("Deskripsi");
    expect(markup).toContain("Lokasi");
    expect(markup).toContain("Tanggal");

    // Circular SVG rendering check
    expect(markup).toContain("<svg");
    expect(markup).toContain("stroke-dasharray");
  });
});
