import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { Dashboard } from "./Dashboard";

describe("Dashboard", () => {
  it("renders recent report cards with single-line title clamps to keep heights aligned", () => {
    const markup = renderToStaticMarkup(
      <Dashboard
        items={[
          {
            id: 1,
            title: "Judul barang hilang yang sangat panjang untuk dua baris",
            description: "Deskripsi singkat",
            category: "Dompet",
            type: "lost",
            location: "Ruang Kelas A",
            date: "2026-06-08",
            image: "/wallet.jpg",
            contact: "08123456789",
          },
        ]}
        onUpdateStatus={vi.fn().mockResolvedValue(true)}
        onOpenReturnVerification={vi.fn()}
        onApproveVerification={vi.fn().mockResolvedValue(true)}
        returnVerifications={[]}
      />,
    );

    expect(markup).toContain("line-clamp-1 text-sm font-semibold leading-snug");
  });

});
