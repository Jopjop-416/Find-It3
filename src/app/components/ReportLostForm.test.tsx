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
});
