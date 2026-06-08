import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { NotificationCenter } from "./NotificationCenter";

describe("NotificationCenter", () => {
  it("renders unread notifications with a mobile-friendly stacked action layout", () => {
    const markup = renderToStaticMarkup(
      <NotificationCenter
        notifications={[
          {
            id: 1,
            message: "Barang yang sesuai dengan laporan Anda ditemukan: iPhone 14 Pro",
            type: "match",
            date: "2024-09-23T00:00:00.000Z",
            read: false,
            userEmail: "user@example.com",
            metadata: {
              targetView: "match-results",
              matchId: 42,
            },
          },
        ]}
        onMarkAsRead={vi.fn()}
        onDeleteNotification={vi.fn()}
        onOpenNotification={vi.fn()}
      />,
    );

    expect(markup).toContain("flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between");
    expect(markup).toContain("flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2");
    expect(markup).toContain("w-full");
    expect(markup).toContain("sm:w-auto");
    expect(markup).toContain("flex flex-wrap items-center gap-2");
    expect(markup).toContain("Lihat Kecocokan");
    expect(markup).toContain("absolute right-4 top-4 rounded-sm text-red-600 hover:text-red-700 hover:bg-red-50 sm:hidden");
    expect(markup).toContain("hidden rounded-sm text-red-600 hover:text-red-700 hover:bg-red-50 sm:inline-flex");
  });
});
