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
});
