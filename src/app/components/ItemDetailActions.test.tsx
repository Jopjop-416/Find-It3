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

  it("protects contact information when user is not logged in: renders button without wa.me link or phone number", () => {
    const onNavigateToLogin = vi.fn();
    const markup = renderToStaticMarkup(
      <ItemDetailActions
        contact="08123456789"
        itemTitle="Dompet coklat"
        isLoggedIn={false}
        onNavigateToLogin={onNavigateToLogin}
      />,
    );

    // Shows the action button to prompt login
    expect(markup).toContain("Hubungi Pelapor");
    // Strictly does NOT render WhatsApp link
    expect(markup).not.toContain("wa.me");
    expect(markup).not.toContain("https://");
    // Strictly does NOT expose phone number in markup
    expect(markup).not.toContain("08123456789");
    expect(markup).toContain('type="button"');
  });

  it("renders a direct WhatsApp link when user is logged in", () => {
    const markup = renderToStaticMarkup(
      <ItemDetailActions
        contact="08123456789"
        itemTitle="Dompet coklat"
        isLoggedIn={true}
      />,
    );

    expect(markup).toContain("Hubungi Pelapor");
    expect(markup).toContain("https://wa.me/628123456789");
  });
});
