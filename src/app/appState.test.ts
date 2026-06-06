import { describe, expect, it } from "vitest";
import {
  buildReporterIdentityUpdate,
  buildSubmissionSuccessNotification,
  buildItemInsertPayload,
  buildUserDataFromAuthUser,
  buildWhatsAppUrl,
  createPasswordHash,
  formatIndonesianPhoneDisplay,
  getReporterDisplayName,
  isMissingReporterIdentityColumnError,
  isPasswordMatch,
  normalizeIndonesianPhone,
  parseStoredJson,
  stripReporterIdentityFromItemPayload,
  validateImageFile,
  validateIndonesianPhone,
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
          phone: "08123456789",
          address: "Jl. Tlogomas No. 246, Malang",
        },
      }),
    ).toEqual({
      email: "rani@student.umm.ac.id",
      name: "Rani Permata",
      avatar: "data:image/jpeg;base64,abc",
      phone: "08123456789",
      address: "Jl. Tlogomas No. 246, Malang",
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
      phone: "",
      address: "",
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

  it("normalizes Indonesian phone numbers for storage and WhatsApp", () => {
    expect(normalizeIndonesianPhone("0812-3456-789")).toBe("628123456789");
    expect(normalizeIndonesianPhone("+62 812 3456 789")).toBe("628123456789");
    expect(formatIndonesianPhoneDisplay("628123456789")).toBe("08123456789");
  });

  it("validates Indonesian phone numbers", () => {
    expect(validateIndonesianPhone("08123456789")).toEqual({
      isValid: true,
      message: "",
    });

    expect(validateIndonesianPhone("071234")).toEqual({
      isValid: false,
      message: "Nomor HP harus menggunakan format Indonesia yang valid.",
    });
  });

  it("builds a WhatsApp URL from a reporter phone number", () => {
    expect(buildWhatsAppUrl("08123456789", "Buku Bahasa Indonesia")).toBe(
      "https://wa.me/628123456789?text=Halo%2C%20saya%20dari%20website%20Found-It%20ingin%20menghubungi%20Anda%20terkait%20laporan%20barang%20%22Buku%20Bahasa%20Indonesia%22.",
    );
  });

  it("prefers the stored reporter name when rendering item detail", () => {
    expect(
      getReporterDisplayName({
        reporter_name: "zakyumm",
        reporter_email: "zaky@student.umm.ac.id",
      }),
    ).toBe("zakyumm");
  });

  it("builds an item insert payload with reporter identity from the profile", () => {
    const payload = buildItemInsertPayload(
      {
        title: "Mouse Logitech",
        category: "Elektronik",
        description: "Mouse hitam",
        location: "Lab Komputer",
        contact: "628123456789",
        type: "lost",
      },
      {
        email: "zaky@student.umm.ac.id",
        name: "zakyumm",
        avatar: "",
        phone: "08123456789",
        address: "Malang",
      },
    );

    expect(payload).toMatchObject({
      title: "Mouse Logitech",
      status: "active",
      reporter_name: "zakyumm",
      reporter_email: "zaky@student.umm.ac.id",
    });

    expect(stripReporterIdentityFromItemPayload(payload)).not.toHaveProperty("reporter_name");
    expect(stripReporterIdentityFromItemPayload(payload)).not.toHaveProperty("reporter_email");
  });

  it("detects when the Supabase items schema is missing reporter identity columns", () => {
    expect(
      isMissingReporterIdentityColumnError({
        code: "PGRST204",
        message: "Could not find the 'reporter_email' column of 'items' in the schema cache",
      }),
    ).toBe(true);

    expect(
      isMissingReporterIdentityColumnError({
        code: "23505",
        message: "duplicate key value violates unique constraint",
      }),
    ).toBe(false);
  });

  it("builds a success notification for a submitted report", () => {
    const notification = buildSubmissionSuccessNotification("lost", "zaky@student.umm.ac.id");

    expect(notification).toMatchObject({
      message: "Laporan kehilangan berhasil disubmit",
      type: "success",
      read: false,
      userEmail: "zaky@student.umm.ac.id",
    });
  });

  it("builds an item reporter sync update for profile changes", () => {
    expect(
      buildReporterIdentityUpdate("kiki@student.umm.ac.id", {
        email: "kiki@student.umm.ac.id",
        name: "Kiki Nur Jaim",
      }),
    ).toEqual({
      matchEmails: ["kiki@student.umm.ac.id"],
      payload: {
        reporter_name: "Kiki Nur Jaim",
        reporter_email: "kiki@student.umm.ac.id",
      },
    });

    expect(
      buildReporterIdentityUpdate("kiki@student.umm.ac.id", {
        email: "kiki-baru@student.umm.ac.id",
        name: "Kiki Nur Jaim",
      }),
    ).toEqual({
      matchEmails: ["kiki@student.umm.ac.id", "kiki-baru@student.umm.ac.id"],
      payload: {
        reporter_name: "Kiki Nur Jaim",
        reporter_email: "kiki-baru@student.umm.ac.id",
      },
    });
  });
});
