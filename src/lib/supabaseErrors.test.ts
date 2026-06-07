import { describe, expect, it } from "vitest";
import { getReadableSupabaseAuthError } from "./supabaseErrors";

describe("getReadableSupabaseAuthError", () => {
  it("returns a recovery-specific message for missing auth session", () => {
    expect(
      getReadableSupabaseAuthError(
        { message: "Auth session missing!" },
        "Link reset password tidak valid atau sesi recovery tidak aktif. Silakan minta link baru.",
      ),
    ).toBe("Link reset password tidak valid atau sesi recovery tidak aktif. Silakan minta link baru.");
  });

  it("falls back to the provided message when no auth error is available", () => {
    expect(getReadableSupabaseAuthError(null, "Gagal mengganti password.")).toBe(
      "Gagal mengganti password.",
    );
  });

  it("passes through a specific provider error message", () => {
    expect(
      getReadableSupabaseAuthError(
        { message: "535 Authentication failed" },
        "Gagal mengirim link reset password.",
      ),
    ).toBe("535 Authentication failed");
  });
});
