import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { NewsCarousel } from "./NewsCarousel";

describe("NewsCarousel", () => {
  it("renders the banner image", () => {
    const markup = renderToStaticMarkup(<NewsCarousel />);

    expect(markup).toContain("Cara Melaporkan Barang Hilang Dengan Efektif");
  });

  it("does not render the browse by category section", () => {
    const markup = renderToStaticMarkup(<NewsCarousel />);

    expect(markup).not.toContain("Browse By Category");
    expect(markup).not.toContain("Cari barang anda berdasarkan kategori yang anda tetapkan");
    expect(markup).not.toContain("Semua Kategori");
  });
});
