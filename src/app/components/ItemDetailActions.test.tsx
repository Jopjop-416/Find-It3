import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ItemDetailActions } from "./ItemDetailActions";

describe("ItemDetailActions", () => {
  it("stacks action buttons on mobile and restores a row layout on larger screens", () => {
    const markup = renderToStaticMarkup(
      <ItemDetailActions
        contact="08123456789"
        itemTitle="Dompet coklat"
        extraActions={[
          {
            key: "verify-found",
            label: "Verifikasi Barang Sudah Ditemukan",
            onClick: vi.fn(),
          },
        ]}
      />,
    );

    expect(markup).toContain("flex flex-col gap-2.5 sm:gap-3 border-t pt-4 sm:flex-row");
    expect(markup).toContain("h-auto w-full whitespace-normal");
    expect(markup).toContain("whitespace-normal");
  });

  it("can hide the contact button for the owner while keeping other actions", () => {
    const markup = renderToStaticMarkup(
      <ItemDetailActions
        contact="08123456789"
        itemTitle="Dompet coklat"
        showContact={false}
        extraActions={[
          {
            key: "verify-found",
            label: "Verifikasi Barang Sudah Ditemukan",
            onClick: vi.fn(),
          },
        ]}
      />,
    );

    expect(markup).not.toContain("Hubungi Pelapor");
    expect(markup).toContain("Verifikasi Barang Sudah Ditemukan");
  });

  it("can disable top border and top padding when bordered is false", () => {
    const markup = renderToStaticMarkup(
      <ItemDetailActions
        contact="08123456789"
        itemTitle="Dompet coklat"
        bordered={false}
      />,
    );

    expect(markup).not.toContain("border-t");
    expect(markup).not.toContain("pt-4");
    expect(markup).toContain("flex flex-col gap-2.5 sm:gap-3 sm:flex-row");
  });
});
