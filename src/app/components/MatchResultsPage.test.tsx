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
});
