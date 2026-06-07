import { describe, expect, it } from "vitest";
import {
  buildPasswordRecoveryRedirectUrl,
  getPasswordRecoveryUrlState,
} from "./authRecovery";

describe("auth recovery helpers", () => {
  it("builds the reset-password redirect from the current location", () => {
    expect(
      buildPasswordRecoveryRedirectUrl("https://found-it.vercel.app/?view=forgot-password"),
    ).toBe("https://found-it.vercel.app/?view=reset-password");
  });

  it("detects hash-based Supabase recovery redirects", () => {
    expect(
      getPasswordRecoveryUrlState(
        "https://found-it.vercel.app/#access_token=token123&refresh_token=refresh123&type=recovery",
      ),
    ).toEqual({
      recoveryCode: null,
      shouldShowResetPassword: true,
      cleanedUrl: "/?view=reset-password",
    });
  });

  it("detects code-based recovery redirects and removes auth params from the URL", () => {
    expect(
      getPasswordRecoveryUrlState(
        "https://found-it.vercel.app/?code=abc123&type=recovery",
      ),
    ).toEqual({
      recoveryCode: "abc123",
      shouldShowResetPassword: true,
      cleanedUrl: "/?view=reset-password",
    });
  });

  it("keeps unrelated URLs untouched", () => {
    expect(
      getPasswordRecoveryUrlState("https://found-it.vercel.app/?view=login"),
    ).toEqual({
      recoveryCode: null,
      shouldShowResetPassword: false,
      cleanedUrl: "/?view=login",
    });
  });
});
