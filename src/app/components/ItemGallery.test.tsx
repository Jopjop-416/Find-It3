import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ItemGallery } from "./ItemGallery";

describe("ItemGallery", () => {
  it("renders gallery cards with single-line title clamps to keep heights aligned", () => {
    const markup = renderToStaticMarkup(
      <ItemGallery
        items={[
          {
            id: 1,
            title: "Judul barang temuan yang sangat panjang untuk dua baris",
            description: "Deskripsi singkat",
            category: "Tas",
            type: "found",
            location: "Perpustakaan Pusat",
            date: "2026-06-08",
            image: "/bag.jpg",
            contact: "08123456789",
          },
        ]}
        onUpdateStatus={vi.fn().mockResolvedValue(true)}
        ownershipFilter="all"
        onOwnershipFilterChange={vi.fn()}
        onOpenReturnVerification={vi.fn()}
        onApproveVerification={vi.fn().mockResolvedValue(true)}
        returnVerifications={[]}
      />,
    );

    expect(markup).toContain("line-clamp-1 text-sm font-semibold leading-snug");
  });

  it("includes a Riwayat Anda ownership filter option", () => {
    const markup = renderToStaticMarkup(
      <ItemGallery
        items={[]}
        onUpdateStatus={vi.fn().mockResolvedValue(true)}
        ownershipFilter="history"
        onOwnershipFilterChange={vi.fn()}
        onOpenReturnVerification={vi.fn()}
        onApproveVerification={vi.fn().mockResolvedValue(true)}
        returnVerifications={[]}
      />,
    );

    expect(markup).toContain("Riwayat Anda");
  });

});
