import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { NewsCarousel } from "./NewsCarousel";

describe("NewsCarousel", () => {
  it("renders the browse by category section with category cards", () => {
    const markup = renderToStaticMarkup(<NewsCarousel />);

    expect(markup).toContain("Browse By Category");
    expect(markup).toContain("Cari barang anda berdasarkan kategori yang anda tetapkan");
    expect(markup).toContain("Elektronik");
    expect(markup).toContain("Buku");
    expect(markup).toContain("Kartu Identitas");
    expect(markup).toContain("Dompet");
    expect(markup).toContain("Tas");
    expect(markup).toContain("Kunci");
  });

  it("renders browse cards from the provided items", () => {
    const markup = renderToStaticMarkup(
      <NewsCarousel
        items={[
          {
            id: 1,
            title: "Laptop Asus",
            description: "Laptop hitam",
            category: "Elektronik",
            type: "lost",
            location: "Lab Komputer",
            date: "2026-06-07",
            image: "/a.jpg",
          },
        ]}
      />,
    );

    expect(markup).toContain("Semua Kategori");
    expect(markup).toContain("Laptop Asus");
    expect(markup).toContain("Lab Komputer");
  });

  it("renders browse cards as dialog triggers for item details", () => {
    const markup = renderToStaticMarkup(
      <NewsCarousel
        items={[
          {
            id: 1,
            title: "Laptop Asus",
            description: "Laptop hitam",
            category: "Elektronik",
            type: "lost",
            location: "Lab Komputer",
            date: "2026-06-07",
            image: "/a.jpg",
          },
        ]}
      />,
    );

    expect(markup).toContain('aria-haspopup="dialog"');
    expect(markup).toContain("Laptop Asus");
  });

  it("renders pending verification browse cards in gray like recent reports", () => {
    const markup = renderToStaticMarkup(
      <NewsCarousel
        items={[
          {
            id: 7,
            title: "Dompet Coklat",
            description: "Dompet kulit",
            category: "Dompet",
            type: "lost",
            location: "Perpustakaan",
            date: "2026-06-07",
            image: "/wallet.jpg",
          },
        ]}
        returnVerifications={[
          {
            id: 1,
            itemId: 7,
            reporterId: "user-1",
            reporterName: "Zaky",
            reporterEmail: "zaky@student.umm.ac.id",
            reporterPhone: "628123456789",
            reporterNim: "202310370311001",
            handoverPhoto: "data:image/png;base64,abc",
            verificationStatus: "pending",
            submittedAt: "2026-06-07T12:00:00.000Z",
          },
        ]}
      />,
    );

    expect(markup).toContain("bg-gray-200 text-gray-600");
    expect(markup).toContain("grayscale");
    expect(markup).toContain("bg-gray-500");
  });

});
