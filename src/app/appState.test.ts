import { describe, expect, it } from "vitest";
import {
  buildUserDataFromAuthUser,
  createPasswordHash,
  isPasswordMatch,
  parseStoredJson,
  validateImageFile,
  validateReportData,
} from "./appState";

describe("app state helpers", () => {
  it("falls back when stored JSON is corrupted", () => {
    expect(parseStoredJson("not-json", { ok: true })).toEqual({ ok: true });
  });

  it("creates a non-plaintext password hash that can be verified", async () => {
    const hash = await createPasswordHash("password123");

    expect(hash).not.toBe("password123");
    expect(hash).toMatch(/^sha256:/);
    await expect(isPasswordMatch("password123", hash)).resolves.toBe(true);
    await expect(isPasswordMatch("wrong-password", hash)).resolves.toBe(false);
  });

  it("supports legacy plaintext passwords during migration", async () => {
    await expect(isPasswordMatch("password123", "password123")).resolves.toBe(true);
  });

  it("rejects report data without category or location", () => {
    expect(
      validateReportData({
        title: "Dompet",
        category: "",
        description: "Dompet coklat",
        location: "",
        contact: "user@example.com",
      }),
    ).toEqual({
      isValid: false,
      message: "Kategori dan lokasi wajib dipilih.",
    });
  });

  it("builds user data from a Supabase auth user", () => {
    expect(
      buildUserDataFromAuthUser({
        email: "rani@student.umm.ac.id",
        user_metadata: {
          name: "Rani Permata",
          avatar_url: "data:image/jpeg;base64,abc",
        },
      }),
    ).toEqual({
      email: "rani@student.umm.ac.id",
      name: "Rani Permata",
      avatar: "data:image/jpeg;base64,abc",
    });
  });

  it("falls back to the email prefix when auth metadata has no display name", () => {
    expect(
      buildUserDataFromAuthUser({
        email: "budi@student.umm.ac.id",
        user_metadata: {},
      }),
    ).toMatchObject({
      email: "budi@student.umm.ac.id",
      name: "budi",
    });
  });

  it("validates image mime type and size before processing", () => {
    expect(validateImageFile({ type: "image/svg+xml", size: 1000 })).toEqual({
      isValid: false,
      message: "Format gambar harus JPG, PNG, atau WebP.",
    });

    expect(validateImageFile({ type: "image/png", size: 2 * 1024 * 1024 + 1 })).toEqual({
      isValid: false,
      message: "Ukuran gambar maksimal 2MB.",
    });

    expect(validateImageFile({ type: "image/png", size: 1000 })).toEqual({
      isValid: true,
      message: "",
    });
  });
});
