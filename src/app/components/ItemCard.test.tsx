import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ItemCard, ItemCardDetail } from "./ItemCard";
import { Dialog } from "./ui/dialog";

describe("ItemCard", () => {
  const sampleLostItem = {
    id: 101,
    title: "KTM Mahasiswa UMM",
    description: "KTM berwarna merah atas nama Ahmad",
    category: "Kartu Identitas",
    type: "lost",
    status: "active",
    location: "GKB 1 Lantai 3",
    date: "2026-06-10",
    image: "/ktm.jpg",
    contact: "081234567890",
    reporter_id: "user-1",
    reporter_email: "ahmad@student.umm.ac.id",
    reporter_name: "Ahmad",
  };

  const sampleFoundItem = {
    id: 102,
    title: "Kunci Motor Honda",
    description: "Kunci motor gantungan boneka biru",
    category: "Kunci",
    type: "found",
    status: "available",
    location: "Parkiran Helipad",
    date: "2026-06-11",
    image: "/kunci.jpg",
    contact: "089876543210",
    reporter_id: "user-2",
    reporter_email: "budi@student.umm.ac.id",
    reporter_name: "Budi",
  };

  it("renders card preview with title, category, type banner, location and formatted date", () => {
    const markup = renderToStaticMarkup(<ItemCard item={sampleLostItem} />);

    expect(markup).toContain("KTM Mahasiswa UMM");
    expect(markup).toContain("Kartu Identitas");
    expect(markup).toContain("Hilang");
    expect(markup).toContain("GKB 1 Lantai 3");
    expect(markup).toContain("aspect-[16/10]");
    expect(markup).toContain("line-clamp-1 text-sm font-semibold leading-snug");
    expect(markup).toContain('aria-haspopup="dialog"');
  });

  it("renders found item banner with Ditemukan", () => {
    const markup = renderToStaticMarkup(<ItemCard item={sampleFoundItem} />);

    expect(markup).toContain("Kunci Motor Honda");
    expect(markup).toContain("Ditemukan");
    expect(markup).toContain("Parkiran Helipad");
  });

  it("renders pending verification style on preview card", () => {
    const verification = {
      id: 50,
      itemId: 101,
      reporterId: "user-1",
      reporterName: "Ahmad",
      reporterEmail: "ahmad@student.umm.ac.id",
      reporterPhone: "081234567890",
      reporterNim: "202310370311999",
      handoverPhoto: "https://example.com/photo.jpg",
      verificationStatus: "pending",
      submittedAt: "2026-06-12T10:00:00Z",
    };

    const markup = renderToStaticMarkup(
      <ItemCard
        item={sampleLostItem}
        returnVerifications={[verification]}
      />,
    );

    expect(markup).toContain("bg-gray-200 text-gray-600");
    expect(markup).toContain("grayscale");
    expect(markup).toContain("bg-gray-500");
  });

  it("renders modal details, verification data and admin approve action in ItemCardDetail", () => {
    const verification = {
      id: 50,
      itemId: 101,
      reporterId: "user-1",
      reporterName: "Ahmad",
      reporterEmail: "ahmad@student.umm.ac.id",
      reporterPhone: "081234567890",
      reporterNim: "202310370311999",
      handoverPhoto: "https://example.com/photo.jpg",
      verificationStatus: "pending",
      submittedAt: "2026-06-12T10:00:00Z",
    };

    const markup = renderToStaticMarkup(
      <Dialog>
        <ItemCardDetail
          item={sampleLostItem}
          returnVerifications={[verification]}
          isAdminUser={true}
          onApproveVerification={vi.fn().mockResolvedValue(true)}
        />
      </Dialog>,
    );

    expect(markup).toContain("Data Verifikasi Serah Terima");
    expect(markup).toContain("Ahmad");
    expect(markup).toContain("202310370311999");
    expect(markup).toContain("Verifikasi Admin");
  });

  it("shows return verification section for items in history in ItemCardDetail", () => {
    const verification = {
      id: 51,
      itemId: 101,
      reporterId: "user-1",
      reporterName: "Ahmad",
      reporterEmail: "ahmad@student.umm.ac.id",
      reporterPhone: "081234567890",
      reporterNim: "202310370311999",
      handoverPhoto: "https://example.com/photo.jpg",
      verificationStatus: "approved",
      submittedAt: "2026-06-12T10:00:00Z",
    };

    const returnedItem = {
      ...sampleLostItem,
      status: "returned",
    };

    const markup = renderToStaticMarkup(
      <Dialog>
        <ItemCardDetail
          item={returnedItem}
          returnVerifications={[verification]}
          ownershipFilter="history"
        />
      </Dialog>,
    );

    expect(markup).toContain("Data Verifikasi Serah Terima");
    expect(markup).toContain("202310370311999");
  });

  it("renders verify-found action for lost item reporter when active in ItemCardDetail", () => {
    const markup = renderToStaticMarkup(
      <Dialog>
        <ItemCardDetail
          item={sampleLostItem}
          currentUserEmail="ahmad@student.umm.ac.id"
          currentUserId="user-1"
          canUpdateStatus={true}
          onOpenReturnVerification={vi.fn()}
        />
      </Dialog>,
    );

    expect(markup).toContain("Verifikasi Barang Sudah Ditemukan");
  });

  it("renders mark-claimed action for found item reporter when available in ItemCardDetail", () => {
    const markup = renderToStaticMarkup(
      <Dialog>
        <ItemCardDetail
          item={sampleFoundItem}
          currentUserEmail="budi@student.umm.ac.id"
          currentUserId="user-2"
          canUpdateStatus={true}
          onOpenReturnVerification={vi.fn()}
        />
      </Dialog>,
    );

    expect(markup).toContain("Tandai Sudah Diambil");
  });
});
