import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { MatchResultsPage } from "./MatchResultsPage";

describe("MatchResultsPage", () => {
  it("renders match summaries with ItemCards, badges, big score, and highlights the selected match", () => {
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

    // Page title and 2-column layout
    expect(markup).toContain("Kemungkinan Kecocokan");
    expect(markup).toContain("grid-cols-1 lg:grid-cols-2");

    // Top ItemCards with titles and banners
    expect(markup).toContain("Laporan Anda");
    expect(markup).toContain("Barang Temuan");
    expect(markup).toContain("Dompet coklat");
    expect(markup).toContain("Dompet kulit warna coklat");
    expect(markup).toContain("Hilang");
    expect(markup).toContain("Ditemukan");

    // Badges
    expect(markup).toContain("86% cocok");
    expect(markup).toContain("✓ Kecocokan Kuat");

    // Score and headline
    expect(markup).toContain("86");
    expect(markup).toContain("Sangat mungkin barang yang sama");

    // Assessment breakdown
    expect(markup).toContain("Rincian penilaian");
    expect(markup).toContain("Lokasi kejadian");
    expect(markup).toContain("Tanggal laporan");
    expect(markup).toContain("Kategori barang");
    expect(markup).toContain("Deskripsi barang");
    expect(markup).toContain("Judul barang");

    // Collapsibles must NOT be present
    expect(markup).not.toContain("Tentang skor ini");
    expect(markup).not.toContain("Lihat foto &amp; detail kedua barang");

    // Selected state and bottom action buttons
    expect(markup).toContain("border border-orange-500");
    expect(markup).toContain("Hubungi Pelapor");
    expect(markup).toContain("Verifikasi Barang Sudah Ditemukan");
  });

  it("renders AI visual similarity, horizontal progress bars, and AI Matching badge", () => {
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

    // Badges
    expect(markup).toContain("92% cocok");
    expect(markup).toContain("AI Matching");

    // Big score headline
    expect(markup).toContain("92");
    expect(markup).toContain("Sangat mungkin barang yang sama");

    // Assessment breakdown with AI photo similarity
    expect(markup).toContain("Rincian penilaian");
    expect(markup).toContain("Kemiripan foto");
    expect(markup).toContain("Foto kedua barang dinilai identik oleh AI.");
    expect(markup).toContain("89%");
    expect(markup).toContain("style=\"width:89.4%\"");

    // Item titles in ItemCards
    expect(markup).toContain("Kunci Motor Honda");
    expect(markup).toContain("Ditemukan kunci Honda");

    // Collapsibles removed
    expect(markup).not.toContain("Tentang skor ini");
    expect(markup).not.toContain("Lihat foto &amp; detail kedua barang");
  });

  it("renders empty state correctly when there are no matches (guest user)", () => {
    const markup = renderToStaticMarkup(
      <MatchResultsPage
        matches={[]}
        currentUserEmail=""
        currentUserId=""
        onOpenReturnVerification={vi.fn()}
        onNavigateToLogin={vi.fn()}
      />,
    );

    expect(markup).toContain("Kemungkinan Kecocokan");
    expect(markup).toContain("Belum ada kemungkinan kecocokan untuk laporan Anda.");
    expect(markup).toContain("Silakan masuk ke akun Anda");
    expect(markup).toContain("Masuk ke Akun");
  });

  it("renders empty state correctly when there are no matches (logged-in user)", () => {
    const markup = renderToStaticMarkup(
      <MatchResultsPage
        matches={[]}
        currentUserEmail="user@example.com"
        currentUserId="user-123"
        onOpenReturnVerification={vi.fn()}
      />,
    );

    expect(markup).toContain("Kemungkinan Kecocokan");
    expect(markup).toContain("Belum ada kemungkinan kecocokan untuk laporan Anda.");
    expect(markup).toContain("Kecocokan akan otomatis muncul ketika ada laporan barang hilang atau temuan");
    expect(markup).not.toContain("Masuk ke Akun");
  });
});
