import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ReturnVerificationForm } from "./ReturnVerificationForm";

describe("ReturnVerificationForm", () => {
  it("renders direct history claim copy for found items", () => {
    const markup = renderToStaticMarkup(
      <ReturnVerificationForm
        item={{
          id: 21,
          title: "Dompet coklat",
          description: "Dompet kulit coklat",
          category: "Dompet",
          location: "Ruang Kelas A",
          date: "2026-06-08",
        }}
        userData={{
          id: "user-1",
          email: "zaky@student.umm.ac.id",
          name: "zakyumm",
          phone: "08123456789",
          nim: "202310370311001",
        }}
        mode="history-claim"
        onBack={vi.fn()}
        onSubmit={vi.fn().mockResolvedValue(true)}
      />,
    );

    expect(markup).toContain("Serah Terima Barang Sudah Diambil");
    expect(markup).toContain("dipindahkan ke Riwayat Anda");
    expect(markup).toContain("Simpan ke Riwayat");
  });
});
