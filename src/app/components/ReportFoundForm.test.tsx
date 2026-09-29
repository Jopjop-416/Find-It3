import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ReportFoundForm } from "./ReportFoundForm";

describe("ReportFoundForm", () => {
  it("renders the direct resolve flow for lost items without pending language", () => {
    const markup = renderToStaticMarkup(
      <ReportFoundForm
        onSubmit={vi.fn().mockResolvedValue(true)}
        onRequireLogin={vi.fn()}
        onRequireProfileCompletion={vi.fn()}
        isLoggedIn
        userPhone="08123456789"
        mode="resolve-lost"
        presetData={{
          sourceLostItemId: 9,
          title: "Dompet coklat",
          category: "Dompet",
          description: "Dompet kulit coklat",
          location: "Ruang Kelas A",
          image: "/wallet.jpg",
        }}
      />,
    );

    expect(markup).toContain("Konfirmasi Barang Sudah Ditemukan");
    expect(markup).toContain("langsung dipindahkan ke riwayat tanpa proses pending");
    expect(markup).toContain("Tandai Sudah Ditemukan");
  });

  it("renders the clickable upload area identical to Foto Serah Terima", () => {
    const markup = renderToStaticMarkup(
      <ReportFoundForm
        onSubmit={vi.fn().mockResolvedValue(true)}
        onRequireLogin={vi.fn()}
        onRequireProfileCompletion={vi.fn()}
        isLoggedIn
        userPhone="08123456789"
      />,
    );

    expect(markup).toContain("Upload foto barang");
    expect(markup).toContain("JPG, PNG, atau WebP maksimal 2MB");
    expect(markup).toContain('id="found-item-photo"');
    expect(markup).toContain('for="found-item-photo"');
  });

  it("renders Edit Laporan Penemuan Barang with initial data and action buttons", () => {
    const onCancel = vi.fn();
    const markup = renderToStaticMarkup(
      <ReportFoundForm
        onSubmit={vi.fn().mockResolvedValue(true)}
        onRequireLogin={vi.fn()}
        onRequireProfileCompletion={vi.fn()}
        isLoggedIn
        userPhone="08123456789"
        mode="edit"
        initialData={{
          id: 20,
          title: "Flashdisk Sandisk 64GB",
          category: "Elektronik",
          description: "Warna merah hitam ditemukan di lab",
          location: "Lab Komputer",
          image: "/sandisk.jpg",
          date: "2026-06-02",
        }}
        onCancel={onCancel}
      />,
    );

    expect(markup).toContain("Edit Laporan Penemuan Barang");
    expect(markup).toContain("Flashdisk Sandisk 64GB");
    expect(markup).toContain("Warna merah hitam ditemukan di lab");
    expect(markup).toContain("Batal");
    expect(markup).toContain("Simpan Perubahan Laporan");
  });
});
