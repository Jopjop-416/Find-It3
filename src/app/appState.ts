export type StoredUser = {
  email: string;
  username: string;
  passwordHash?: string;
  password?: string;
};

export type UserData = {
  id: string;
  email: string;
  name: string;
  avatar: string;
  phone: string;
  address: string;
  nim: string;
  isAdmin: boolean;
};

export type ReportFormData = {
  title: string;
  category: string;
  description: string;
  location: string;
  contact: string;
  image?: string;
};

export type ItemInsertPayload = ReportFormData & {
  type: string;
  status: string;
  date: string;
  reporter_id: string;
  reporter_name: string;
  reporter_email: string;
};

export type LegacyItemInsertPayload = Omit<ItemInsertPayload, "reporter_id" | "reporter_name" | "reporter_email">;
export type AppNotification = {
  id: number;
  message: string;
  type: "match" | "verification" | "success" | "info";
  date: string;
  read: boolean;
  user_id?: string;
  userEmail: string;
};

export type ReporterIdentityUpdate = {
  matchEmails: string[];
  payload: {
    reporter_name: string;
    reporter_email: string;
  };
};

export type ItemReturnVerification = {
  id: number;
  itemId: number;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  reporterPhone: string;
  reporterNim: string;
  handoverPhoto: string;
  verificationStatus: "pending" | "approved";
  submittedAt: string;
  approvedAt?: string | null;
  approvedBy?: string | null;
};

export function getEffectiveItemStatus(
  item: Record<string, unknown>,
  returnVerifications: ItemReturnVerification[] = [],
): string {
  const itemId =
    typeof item.id === "number"
      ? item.id
      : Number(item.id);
  const verificationRecord = returnVerifications.find(
    (record) => record.itemId === itemId,
  );

  if (verificationRecord?.verificationStatus === "approved") {
    return "verified_returned";
  }

  if (verificationRecord?.verificationStatus === "pending") {
    return "pending_verification";
  }

  return typeof item.status === "string" ? item.status : "";
}

export function parseStoredJson<T>(value: string | null, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

type SupabaseAuthUserLike = {
  id?: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
  app_metadata?: Record<string, unknown> | null;
};

export function buildUserDataFromAuthUser(user: SupabaseAuthUserLike | null | undefined): UserData {
  const email = user?.email ?? "";
  const metadata = user?.user_metadata ?? {};
  const appMetadata = user?.app_metadata ?? {};
  const metadataName = metadata.name ?? metadata.full_name ?? metadata.username;
  const metadataAvatar = metadata.avatar_url ?? metadata.avatar;
  const metadataPhone = metadata.phone;
  const metadataAddress = metadata.address;
  const metadataNim = metadata.nim;
  const metadataIsAdmin = appMetadata.is_admin;

  return {
    id: user?.id ?? "",
    email,
    name:
      typeof metadataName === "string" && metadataName.trim()
        ? metadataName
        : email.split("@")[0] || "User",
    avatar: typeof metadataAvatar === "string" ? metadataAvatar : "",
    phone: typeof metadataPhone === "string" ? metadataPhone : "",
    address: typeof metadataAddress === "string" ? metadataAddress : "",
    nim: typeof metadataNim === "string" ? metadataNim : "",
    isAdmin: Boolean(metadataIsAdmin),
  };
}

export function normalizeIndonesianPhone(value: string): string {
  const digits = value.replace(/[^\d+]/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("+62")) {
    return `62${digits.slice(3)}`;
  }

  if (digits.startsWith("62")) {
    return digits;
  }

  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }

  return digits;
}

export function formatIndonesianPhoneDisplay(value: string): string {
  const normalized = normalizeIndonesianPhone(value);

  if (!normalized.startsWith("62")) {
    return value;
  }

  return `0${normalized.slice(2)}`;
}

export function validateIndonesianPhone(value: string): {
  isValid: boolean;
  message: string;
} {
  const normalized = normalizeIndonesianPhone(value);
  const isValid = /^628\d{7,12}$/.test(normalized);

  if (!isValid) {
    return {
      isValid: false,
      message: "Nomor HP harus menggunakan format Indonesia yang valid.",
    };
  }

  return {
    isValid: true,
    message: "",
  };
}

export function buildWhatsAppUrl(phone: string, itemTitle: string): string {
  const normalized = normalizeIndonesianPhone(phone);
  const message = `Halo, saya dari website Found-It ingin menghubungi Anda terkait laporan barang "${itemTitle}".`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function getReporterDisplayName(item: Record<string, unknown>): string {
  const candidateNames = [
    item.name,
    item.username,
    item.user_name,
    item.full_name,
    item.reporterName,
    item.reporter_name,
  ];

  for (const candidate of candidateNames) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  const emailCandidate = item.email ?? item.user_email ?? item.reporterEmail ?? item.reporter_email;
  if (typeof emailCandidate === "string" && emailCandidate.includes("@")) {
    return emailCandidate.split("@")[0];
  }

  return "Pengguna Terdaftar";
}

export function buildItemInsertPayload(
  item: ReportFormData & { type: string },
  userData: UserData,
): ItemInsertPayload {
  return {
    ...item,
    status: item.type === "lost" ? "active" : "available",
    date: new Date().toISOString().split("T")[0],
    reporter_id: userData.id,
    reporter_name: userData.name.trim() || "Pengguna Terdaftar",
    reporter_email: userData.email.trim(),
  };
}

export function stripReporterIdentityFromItemPayload(
  item: ItemInsertPayload,
): LegacyItemInsertPayload {
  const { reporter_name: _reporterName, reporter_email: _reporterEmail, ...legacyItem } = item;
  return legacyItem;
}

export function isMissingReporterIdentityColumnError(
  error: { code?: string; message?: string | null } | null | undefined,
): boolean {
  if (!error) {
    return false;
  }

  return (
    error.code === "PGRST204"
    && typeof error.message === "string"
    && (
      error.message.includes("reporter_id")
      || error.message.includes("reporter_name")
      || error.message.includes("reporter_email")
    )
  );
}

export function buildSubmissionSuccessNotification(
  itemType: string,
  userEmail: string,
): AppNotification {
  return {
    id: Date.now(),
    message: `Laporan ${itemType === "lost" ? "kehilangan" : "penemuan"} berhasil disubmit`,
    type: "success",
    date: new Date().toISOString().split("T")[0],
    read: false,
    userEmail,
  };
}

export function buildReporterIdentityUpdate(
  previousEmail: string,
  nextUserData: Pick<UserData, "email" | "name">,
): ReporterIdentityUpdate {
  const matchEmails = Array.from(
    new Set([previousEmail.trim(), nextUserData.email.trim()].filter(Boolean)),
  );

  return {
    matchEmails,
    payload: {
      reporter_name: nextUserData.name.trim() || "Pengguna Terdaftar",
      reporter_email: nextUserData.email.trim(),
    },
  };
}

export function getItemStatusLabel(status: string): string {
  switch (status) {
    case "active":
      return "Masih Dicari";
    case "available":
      return "Tersedia";
    case "returned":
      return "Sudah Kembali";
    case "claimed":
      return "Sudah Diambil";
    case "pending_verification":
      return "Pending Verifikasi";
    case "verified_returned":
      return "Terverifikasi";
    default:
      return status;
  }
}

export function isReporterForItem(
  item: Record<string, unknown>,
  userEmail: string,
  userId?: string,
): boolean {
  return (
    (typeof item.reporter_id === "string" && Boolean(userId) && item.reporter_id === userId)
    || (typeof item.reporter_email === "string" && item.reporter_email === userEmail)
  );
}

export function shouldHideItemFromListings(
  item: Record<string, unknown>,
  returnVerifications: ItemReturnVerification[] = [],
): boolean {
  const effectiveStatus = getEffectiveItemStatus(item, returnVerifications);
  return effectiveStatus === "verified_returned" || effectiveStatus === "returned";
}

export async function createPasswordHash(password: string): Promise<string> {
  const encoded = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  const hex = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return `sha256:${hex}`;
}

export async function isPasswordMatch(
  password: string,
  storedPassword: string | undefined,
): Promise<boolean> {
  if (!storedPassword) {
    return false;
  }

  if (!storedPassword.startsWith("sha256:")) {
    return password === storedPassword;
  }

  return (await createPasswordHash(password)) === storedPassword;
}

export function getStoredUser(): StoredUser | null {
  return parseStoredJson<StoredUser | null>(
    localStorage.getItem("registeredUser"),
    null,
  );
}

export function validateReportData(formData: ReportFormData): {
  isValid: boolean;
  message: string;
} {
  const missingSelects = !formData.category.trim() || !formData.location.trim();

  if (missingSelects) {
    return {
      isValid: false,
      message: "Kategori dan lokasi wajib dipilih.",
    };
  }

  const phoneValidation = validateIndonesianPhone(formData.contact);
  if (!phoneValidation.isValid) {
    return phoneValidation;
  }

  return {
    isValid: true,
    message: "",
  };
}

export function validateImageFile(
  file: Pick<File, "size" | "type">,
  maxBytes = 2 * 1024 * 1024,
): {
  isValid: boolean;
  message: string;
} {
  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

  if (!allowedTypes.has(file.type)) {
    return {
      isValid: false,
      message: "Format gambar harus JPG, PNG, atau WebP.",
    };
  }

  if (file.size > maxBytes) {
    return {
      isValid: false,
      message: "Ukuran gambar maksimal 2MB.",
    };
  }

  return {
    isValid: true,
    message: "",
  };
}

export function compressImage(file: File, maxWidth = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}
