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
});
