import { describe, expect, it } from "vitest";
import {
  buildAutoMatchNotificationMessage,
  buildDerivedMatchNotifications,
  buildUserMatchSummaries,
  calculateMatchScore,
  buildReporterIdentityUpdate,
  buildSubmissionSuccessNotification,
  buildItemInsertPayload,
  buildUserDataFromAuthUser,
  buildWhatsAppUrl,
  createPasswordHash,
  formatIndonesianPhoneDisplay,
  getReporterDisplayName,
  getItemStatusLabel,
  getReturnVerificationForItem,
  getEffectiveItemStatus,
  isReporterForItem,
  isMissingReporterIdentityColumnError,
  isPasswordMatch,
  normalizeIndonesianPhone,
  parseStoredJson,
  findAutoMatchCandidates,
  shouldShowContactAction,
  shouldHideItemFromListings,
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
          nim: "202310370311111",
        },
      }),
    ).toEqual({
      id: "",
      email: "rani@student.umm.ac.id",
      name: "Rani Permata",
      avatar: "data:image/jpeg;base64,abc",
      phone: "08123456789",
      address: "Jl. Tlogomas No. 246, Malang",
      nim: "202310370311111",
      isAdmin: false,
    });
  });

  it("falls back to the email prefix when auth metadata has no display name", () => {
    expect(
      buildUserDataFromAuthUser({
        email: "budi@student.umm.ac.id",
        user_metadata: {},
      }),
    ).toMatchObject({
      id: "",
      email: "budi@student.umm.ac.id",
      name: "budi",
      phone: "",
      address: "",
      nim: "",
      isAdmin: false,
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
        id: "user-1",
        email: "zaky@student.umm.ac.id",
        name: "zakyumm",
        avatar: "",
        phone: "08123456789",
        address: "Malang",
        nim: "202310370311001",
        isAdmin: false,
      },
    );

    expect(payload).toMatchObject({
      title: "Mouse Logitech",
      status: "active",
      reporter_id: "user-1",
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

  it("provides item verification status and ownership helpers", () => {
    expect(getItemStatusLabel("pending_verification")).toBe("Pending Verifikasi");
    expect(
      getEffectiveItemStatus(
        { id: 7, status: "active" },
        [
          {
            id: 99,
            itemId: 7,
            reporterName: "Kiki",
            reporterEmail: "kiki@student.umm.ac.id",
            reporterPhone: "628123456789",
            reporterNim: "202310370311111",
            handoverPhoto: "data:image/png;base64,abc",
            verificationStatus: "pending",
            submittedAt: "2026-06-06T09:00:00.000Z",
          },
        ],
      ),
    ).toBe("pending_verification");
    expect(
      isReporterForItem(
        { reporter_email: "kiki@student.umm.ac.id" },
        "kiki@student.umm.ac.id",
      ),
    ).toBe(true);
    expect(
      isReporterForItem(
        { reporter_id: "user-2", reporter_email: "lama@student.umm.ac.id" },
        "baru@student.umm.ac.id",
        "user-2",
      ),
    ).toBe(true);
    expect(
      shouldHideItemFromListings(
        { id: 7, status: "active" },
        [
          {
            id: 100,
            itemId: 7,
            reporterName: "Kiki",
            reporterEmail: "kiki@student.umm.ac.id",
            reporterPhone: "628123456789",
            reporterNim: "202310370311111",
            handoverPhoto: "data:image/png;base64,abc",
            verificationStatus: "approved",
            submittedAt: "2026-06-06T10:00:00.000Z",
          },
        ],
      ),
    ).toBe(true);
    expect(
      getReturnVerificationForItem(
        { id: "7" },
        [
          {
            id: 100,
            itemId: 7,
            reporterName: "Kiki",
            reporterEmail: "kiki@student.umm.ac.id",
            reporterPhone: "628123456789",
            reporterNim: "202310370311111",
            handoverPhoto: "data:image/png;base64,abc",
            verificationStatus: "approved",
            submittedAt: "2026-06-06T10:00:00.000Z",
          },
        ],
      )?.itemId,
    ).toBe(7);
  });

  it("scores strong lost/found similarities as an automatic match", () => {
    const result = calculateMatchScore(
      {
        title: "Dompet coklat",
        description: "Dompet kulit coklat berisi KTM dan kartu mahasiswa",
        category: "Dompet",
        type: "lost",
        location: "Ruang Kelas A",
        date: "2026-06-08",
        image: "/lost-wallet.jpg",
      },
      {
        title: "Dompet kulit warna coklat",
        description: "Menemukan dompet coklat dengan kartu mahasiswa di dalamnya",
        category: "Dompet",
        type: "found",
        location: "Ruang Kelas A",
        date: "2026-06-08",
        image: "/found-wallet.jpg",
      },
    );

    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(result.status).toBe("matched");
    expect(result.reason).toContain("Kategori sama");
    expect(result.reason).toContain("Lokasi sama");
  });

  it("does not mark unrelated items as matched", () => {
    const result = calculateMatchScore(
      {
        title: "Laptop Asus",
        description: "Laptop hitam untuk praktikum",
        category: "Elektronik",
        type: "lost",
        location: "Lab Komputer",
        date: "2026-06-08",
        image: "/laptop.jpg",
      },
      {
        title: "Kunci motor Yamaha",
        description: "Kunci motor dengan gantungan merah",
        category: "Kunci",
        type: "found",
        location: "Parkiran Gedung B",
        date: "2026-06-01",
        image: "/key.jpg",
      },
    );

    expect(result.score).toBeLessThan(60);
    expect(result.status).toBe("rejected");
  });

  it("finds opposite-type candidates that exceed the smart matching threshold", () => {
    const matches = findAutoMatchCandidates(
      {
        id: 10,
        title: "Dompet coklat",
        description: "Dompet kulit coklat berisi KTM",
        category: "Dompet",
        type: "lost",
        location: "Ruang Kelas A",
        date: "2026-06-08",
        image: "/lost-wallet.jpg",
        reporter_id: "user-1",
      },
      [
        {
          id: 11,
          title: "Dompet kulit warna coklat",
          description: "Menemukan dompet coklat dengan kartu mahasiswa",
          category: "Dompet",
          type: "found",
          location: "Ruang Kelas A",
          date: "2026-06-08",
          image: "/found-wallet.jpg",
          status: "available",
          reporter_id: "user-2",
        },
        {
          id: 12,
          title: "Kunci motor",
          description: "Kunci dengan gantungan hitam",
          category: "Kunci",
          type: "found",
          location: "Parkiran Gedung B",
          date: "2026-06-01",
          image: "/key.jpg",
          status: "available",
          reporter_id: "user-3",
        },
      ],
    );

    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({
      matchedItemId: 11,
      scoreStatus: "matched",
    });
  });

  it("hides the contact action for the owner of a report", () => {
    expect(
      shouldShowContactAction(
        {
          reporter_id: "user-1",
          reporter_email: "zaky@student.umm.ac.id",
          contact: "08123456789",
        },
        "zaky@student.umm.ac.id",
        "user-1",
      ),
    ).toBe(false);

    expect(
      shouldShowContactAction(
        {
          reporter_id: "user-1",
          reporter_email: "zaky@student.umm.ac.id",
          contact: "08123456789",
        },
        "other@student.umm.ac.id",
        "user-2",
      ),
    ).toBe(true);
  });

  it("builds a readable notification message for a successful match", () => {
    expect(
      buildAutoMatchNotificationMessage("lost", "Dompet coklat", 86),
    ).toContain("kemungkinan kecocokan");
  });

  it("builds match summaries for the current user from item matches", () => {
    const summaries = buildUserMatchSummaries(
      [
        {
          id: 501,
          lost_item_id: 10,
          found_item_id: 11,
          score: 86,
          status: "matched",
          match_reason: "Kategori sama, lokasi sama",
          created_at: "2026-06-08T10:00:00.000Z",
        },
      ],
      [
        {
          id: 10,
          title: "Dompet coklat",
          type: "lost",
          reporter_id: "user-1",
          reporter_email: "zaky@student.umm.ac.id",
          location: "Ruang Kelas A",
          date: "2026-06-08",
          category: "Dompet",
          description: "Dompet kulit coklat",
          image: "/lost.jpg",
          contact: "08123456789",
        },
        {
          id: 11,
          title: "Dompet kulit warna coklat",
          type: "found",
          reporter_id: "user-2",
          reporter_email: "budi@student.umm.ac.id",
          location: "Ruang Kelas A",
          date: "2026-06-08",
          category: "Dompet",
          description: "Menemukan dompet coklat",
          image: "/found.jpg",
          contact: "081298765432",
        },
      ],
      "zaky@student.umm.ac.id",
      "user-1",
    );

    expect(summaries).toHaveLength(1);
    expect(summaries[0]).toMatchObject({
      matchId: 501,
      score: 86,
      myItem: { id: 10, title: "Dompet coklat" },
      matchedItem: { id: 11, title: "Dompet kulit warna coklat" },
    });
  });

  it("derives missing match notifications from stored match summaries", () => {
    const notifications = buildDerivedMatchNotifications(
      [],
      [
        {
          matchId: 501,
          score: 86,
          status: "matched",
          reason: "Kategori sama, lokasi sama",
          myItem: {
            id: 10,
            title: "Dompet coklat",
            type: "lost",
          },
          matchedItem: {
            id: 11,
            title: "Dompet kulit warna coklat",
            type: "found",
          },
          createdAt: "2026-06-08T10:00:00.000Z",
        },
      ],
      "zaky@student.umm.ac.id",
    );

    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toMatchObject({
      type: "match",
      userEmail: "zaky@student.umm.ac.id",
      metadata: {
        targetView: "match-results",
        matchId: 501,
      },
    });
  });
});
