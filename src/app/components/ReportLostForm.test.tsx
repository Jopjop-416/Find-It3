import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ReportLostForm } from "./ReportLostForm";

describe("ReportLostForm", () => {
  it("renders the clickable upload area identical to Foto Serah Terima", () => {
    const markup = renderToStaticMarkup(
      <ReportLostForm
        onSubmit={vi.fn().mockResolvedValue(true)}
        onRequireLogin={vi.fn()}
        onRequireProfileCompletion={vi.fn()}
        isLoggedIn
        userPhone="08123456789"
      />,
    );

    expect(markup).toContain("Foto Barang (Opsional)");
    expect(markup).toContain("Upload foto barang");
    expect(markup).toContain("JPG, PNG, atau WebP maksimal 2MB");
    expect(markup).toContain('id="lost-item-photo"');
    expect(markup).toContain('for="lost-item-photo"');
  });

  it("renders Edit Laporan Kehilangan Barang with initial data and action buttons", () => {
    const onCancel = vi.fn();
    const markup = renderToStaticMarkup(
      <ReportLostForm
        onSubmit={vi.fn().mockResolvedValue(true)}
        onRequireLogin={vi.fn()}
        onRequireProfileCompletion={vi.fn()}
        isLoggedIn
        userPhone="08123456789"
        mode="edit"
        initialData={{
          id: 10,
          title: "MacBook Pro M2",
          category: "Elektronik",
          description: "Warna Space Gray ada stiker GitHub",
          location: "Perpustakaan Pusat",
          image: "/macbook.jpg",
          date: "2026-06-01",
        }}
        onCancel={onCancel}
      />,
    );

    expect(markup).toContain("Edit Laporan Kehilangan Barang");
    expect(markup).toContain("MacBook Pro M2");
    expect(markup).toContain("Warna Space Gray ada stiker GitHub");
    expect(markup).toContain("Batal");
    expect(markup).toContain("Simpan Perubahan Laporan");
  });
});
