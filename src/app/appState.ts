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
  metadata?: {
    targetView?: string;
    matchId?: number;
    itemId?: number;
  };
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

export type MatchScoreResult = {
  score: number;
  status: "candidate" | "matched" | "rejected";
  reason: string;
  /** Algorithm version tag for research comparison. */
  algorithmVersion?: string;
};

export type AutoMatchCandidate = {
  sourceItemId?: number;
  matchedItemId?: number;
  score: number;
  scoreStatus: MatchScoreResult["status"];
  reason: string;
};

export type UserMatchSummary = {
  matchId: number;
  score: number;
  status: string;
  reason: string;
  myItem: Record<string, unknown>;
  matchedItem: Record<string, unknown>;
  createdAt: string;
  // AI matching fields (null for legacy matches)
  visualScore: number | null;
  attributeScore: number | null;
  matchDetails: Record<string, unknown> | null;
  algorithmVersion: string | null;
  modelName: string | null;
};

export function buildDerivedMatchNotifications(
  notifications: AppNotification[],
  matches: UserMatchSummary[],
  userEmail: string,
  readMatchIds: number[] = [],
  dismissedMatchIds: number[] = [],
): AppNotification[] {
  const readMatchIdSet = new Set(readMatchIds);
  const dismissedMatchIdSet = new Set(dismissedMatchIds);

  const filteredNotifications = notifications.filter((notification) => {
    if (notification.type === "match" && typeof notification.metadata?.matchId === "number") {
      return !dismissedMatchIdSet.has(notification.metadata.matchId);
    }
    return true;
  });

  const existingMatchIds = new Set(
    filteredNotifications
      .filter((notification) => notification.type === "match")
      .map((notification) => notification.metadata?.matchId)
      .filter((matchId): matchId is number => typeof matchId === "number"),
  );

  const seenMatchIds = new Set<number>();
  const derivedNotifications = matches
    .filter((match) => {
      if (existingMatchIds.has(match.matchId) || dismissedMatchIdSet.has(match.matchId)) {
        return false;
      }
      if (seenMatchIds.has(match.matchId)) {
        return false;
      }
      seenMatchIds.add(match.matchId);
      return true;
    })
    .map((match) => ({
      id: -match.matchId,
      message: buildAutoMatchNotificationMessage(
        String(match.myItem.type ?? ""),
        String(match.myItem.title ?? ""),
        match.score,
      ),
      type: "match" as const,
      date: match.createdAt,
      read: readMatchIdSet.has(match.matchId),
      userEmail,
      metadata: {
        targetView: "match-results",
        matchId: match.matchId,
        itemId: typeof match.myItem.id === "number" ? match.myItem.id : Number(match.myItem.id),
      },
    }));

  return [...derivedNotifications, ...filteredNotifications].sort(
    (left, right) => new Date(right.date).getTime() - new Date(left.date).getTime(),
  );
}

export function getReturnVerificationForItem(
  item: Record<string, unknown>,
  returnVerifications: ItemReturnVerification[] = [],
): ItemReturnVerification | undefined {
  const itemId =
    typeof item.id === "number"
      ? item.id
      : Number(item.id);

  return returnVerifications.find((record) => record.itemId === itemId);
}

const MATCH_STOPWORDS = new Set([
  "yang",
  "dan",
  "di",
  "ke",
  "dari",
  "ada",
  "itu",
  "ini",
  "untuk",
  "dengan",
  "saya",
  "pada",
  "atau",
]);

const MATCH_SYNONYMS: Record<string, string> = {
  hp: "handphone",
  ponsel: "handphone",
  smartphone: "handphone",
  ktm: "kartu mahasiswa",
  kartuidentitas: "kartu identitas",
  idcard: "kartu identitas",
};

function normalizeMatchText(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeMatchText(value: unknown): string[] {
  return normalizeMatchText(value)
    .split(" ")
    .flatMap((token) => {
      if (!token || MATCH_STOPWORDS.has(token)) {
        return [];
      }

      const synonym = MATCH_SYNONYMS[token] ?? token;
      return synonym.split(" ").filter(Boolean);
    });
}

function calculateTokenOverlapScore(
  leftValue: unknown,
  rightValue: unknown,
  highScore: number,
  mediumScore: number,
): number {
  const leftTokens = new Set(tokenizeMatchText(leftValue));
  const rightTokens = new Set(tokenizeMatchText(rightValue));

  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0;
  }

  const overlapCount = Array.from(leftTokens).filter((token) => rightTokens.has(token)).length;
  const overlapRatio = overlapCount / Math.max(leftTokens.size, rightTokens.size);

  if (overlapRatio >= 0.6) {
    return highScore;
  }

  if (overlapRatio >= 0.3) {
    return mediumScore;
  }

  return 0;
}

function calculateLocationScore(leftValue: unknown, rightValue: unknown): number {
  const left = normalizeMatchText(leftValue);
  const right = normalizeMatchText(rightValue);

  if (!left || !right) {
    return 0;
  }

  if (left === right) {
    return 20;
  }

  const leftTokens = new Set(tokenizeMatchText(left));
  const rightTokens = new Set(tokenizeMatchText(right));
  const overlapCount = Array.from(leftTokens).filter((token) => rightTokens.has(token)).length;

  return overlapCount > 0 ? 10 : 0;
}

function calculateDateScore(leftValue: unknown, rightValue: unknown): number {
  if (typeof leftValue !== "string" || typeof rightValue !== "string") {
    return 0;
  }

  const leftDate = new Date(leftValue);
  const rightDate = new Date(rightValue);

  if (Number.isNaN(leftDate.getTime()) || Number.isNaN(rightDate.getTime())) {
    return 0;
  }

  const diffDays = Math.abs(leftDate.getTime() - rightDate.getTime()) / (1000 * 60 * 60 * 24);

  if (diffDays <= 1) {
    return 10;
  }

  if (diffDays <= 3) {
    return 6;
  }

  if (diffDays <= 7) {
    return 3;
  }

  return 0;
}

/**
 * LEGACY rule-based matching algorithm.
 *
 * Preserved for:
 * 1. Fallback when AI service is unavailable
 * 2. Research comparison (Legacy vs AI)
 * 3. Items without image embeddings
 *
 * DO NOT delete — this is the baseline algorithm for the research paper.
 */
export function calculateLegacyMatchScore(
  sourceItem: Record<string, unknown>,
  candidateItem: Record<string, unknown>,
): MatchScoreResult {
  const reasonParts: string[] = [];
  let score = 0;

  const sourceCategory = normalizeMatchText(sourceItem.category);
  const candidateCategory = normalizeMatchText(candidateItem.category);

  if (sourceCategory && sourceCategory === candidateCategory) {
    score += 30;
    reasonParts.push("Kategori sama");
  }

  const titleScore = calculateTokenOverlapScore(sourceItem.title, candidateItem.title, 20, 10);
  if (titleScore > 0) {
    score += titleScore;
    reasonParts.push(titleScore === 20 ? "Judul sangat mirip" : "Judul cukup mirip");
  }

  const descriptionScore = calculateTokenOverlapScore(
    sourceItem.description,
    candidateItem.description,
    15,
    8,
  );
  if (descriptionScore > 0) {
    score += descriptionScore;
    reasonParts.push(descriptionScore === 15 ? "Deskripsi cocok" : "Deskripsi cukup cocok");
  }

  const locationScore = calculateLocationScore(sourceItem.location, candidateItem.location);
  if (locationScore > 0) {
    score += locationScore;
    reasonParts.push(locationScore === 20 ? "Lokasi sama" : "Lokasi berdekatan");
  }

  const dateScore = calculateDateScore(sourceItem.date, candidateItem.date);
  if (dateScore > 0) {
    score += dateScore;
    reasonParts.push("Tanggal berdekatan");
  }

  if (sourceItem.image && candidateItem.image) {
    score += 5;
    reasonParts.push("Keduanya memiliki foto");
  }

  if (score >= 75) {
    return {
      score,
      status: "matched",
      reason: reasonParts.join(", "),
      algorithmVersion: "legacy-v1",
    };
  }

  if (score >= 60) {
    return {
      score,
      status: "candidate",
      reason: reasonParts.join(", "),
      algorithmVersion: "legacy-v1",
    };
  }

  return {
    score,
    status: "rejected",
    reason: reasonParts.join(", "),
    algorithmVersion: "legacy-v1",
  };
}

/**
 * Alias kept for backward compatibility with tests and any external callers.
 * @deprecated Use calculateLegacyMatchScore() directly.
 */
export const calculateMatchScore = calculateLegacyMatchScore;

export function findAutoMatchCandidates(
  sourceItem: Record<string, unknown>,
  candidateItems: Record<string, unknown>[],
): AutoMatchCandidate[] {
  const sourceType = typeof sourceItem.type === "string" ? sourceItem.type : "";
  const sourceReporterId = typeof sourceItem.reporter_id === "string" ? sourceItem.reporter_id : "";
  const targetType = sourceType === "lost" ? "found" : sourceType === "found" ? "lost" : "";
  const allowedStatuses = new Set(["active", "available"]);

  return candidateItems
    .filter((candidate) => {
      const candidateType = typeof candidate.type === "string" ? candidate.type : "";
      const candidateStatus = typeof candidate.status === "string" ? candidate.status : "";
      const candidateReporterId = typeof candidate.reporter_id === "string" ? candidate.reporter_id : "";
      const candidateId = typeof candidate.id === "number" ? candidate.id : Number(candidate.id);
      const sourceId = typeof sourceItem.id === "number" ? sourceItem.id : Number(sourceItem.id);

      return (
        candidateType === targetType
        && allowedStatuses.has(candidateStatus)
        && candidateId !== sourceId
        && (!sourceReporterId || !candidateReporterId || sourceReporterId !== candidateReporterId)
      );
    })
    .map((candidate) => {
      const result = calculateLegacyMatchScore(sourceItem, candidate);

      return {
        sourceItemId: typeof sourceItem.id === "number" ? sourceItem.id : Number(sourceItem.id),
        matchedItemId: typeof candidate.id === "number" ? candidate.id : Number(candidate.id),
        score: result.score,
        scoreStatus: result.status,
        reason: result.reason,
      };
    })
    .filter((candidate) => candidate.scoreStatus !== "rejected")
    .sort((left, right) => right.score - left.score);
}

export function shouldShowContactAction(
  item: Record<string, unknown>,
  currentUserEmail?: string,
  currentUserId?: string,
  isLoggedIn?: boolean,
): boolean {
  if (isReporterForItem(item, currentUserEmail ?? "", currentUserId)) {
    return false;
  }

  const isGuest = isLoggedIn === false || (!currentUserEmail && !currentUserId);
  if (isGuest) {
    return true;
  }

  return Boolean(item.contact);
}

export function buildAutoMatchNotificationMessage(
  itemType: string,
  itemTitle: string,
  score: number,
): string {
  const reportLabel = itemType === "lost" ? "laporan kehilangan" : "laporan temuan";
  return `Sistem menemukan kemungkinan kecocokan untuk ${reportLabel} "${itemTitle}" dengan skor ${score}%.`;
}

export function buildUserMatchSummaries(
  matches: Record<string, unknown>[],
  items: Record<string, unknown>[],
  currentUserEmail?: string,
  currentUserId?: string,
): UserMatchSummary[] {
  return matches
    .map((match) => {
      if (match.status === "dismissed") {
        return null;
      }

      const lostItemId = typeof match.lost_item_id === "number" ? match.lost_item_id : Number(match.lost_item_id);
      const foundItemId = typeof match.found_item_id === "number" ? match.found_item_id : Number(match.found_item_id);
      const lostItem = items.find((item) => Number(item.id) === lostItemId);
      const foundItem = items.find((item) => Number(item.id) === foundItemId);

      if (!lostItem || !foundItem) {
        return null;
      }

      const currentUserOwnsLost = isReporterForItem(lostItem, currentUserEmail ?? "", currentUserId);
      const currentUserOwnsFound = isReporterForItem(foundItem, currentUserEmail ?? "", currentUserId);

      if (!currentUserOwnsLost && !currentUserOwnsFound) {
        return null;
      }

      // Read AI matching fields (null-safe for legacy matches)
      const visualScore =
        typeof match.visual_score === "number" ? match.visual_score
        : match.visual_score != null ? Number(match.visual_score)
        : null;

      const attributeScore =
        typeof match.attribute_score === "number" ? match.attribute_score
        : match.attribute_score != null ? Number(match.attribute_score)
        : null;

      const matchDetails =
        match.match_details != null && typeof match.match_details === "object"
          ? (match.match_details as Record<string, unknown>)
          : null;

      return {
        matchId: typeof match.id === "number" ? match.id : Number(match.id),
        score: typeof match.score === "number" ? match.score : Number(match.score),
        status: typeof match.status === "string" ? match.status : "",
        reason: typeof match.match_reason === "string" ? match.match_reason : "",
        myItem: currentUserOwnsLost ? lostItem : foundItem,
        matchedItem: currentUserOwnsLost ? foundItem : lostItem,
        createdAt: typeof match.created_at === "string" ? match.created_at : "",
        visualScore,
        attributeScore,
        matchDetails,
        algorithmVersion: typeof match.algorithm_version === "string" ? match.algorithm_version : null,
        modelName: typeof match.model_name === "string" ? match.model_name : null,
      };
    })
    .filter((entry): entry is UserMatchSummary => Boolean(entry))
    .sort((left, right) => right.score - left.score);
}

export function getEffectiveItemStatus(
  item: Record<string, unknown>,
  returnVerifications: ItemReturnVerification[] = [],
): string {
  const verificationRecord = getReturnVerificationForItem(item, returnVerifications);

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
  const sanitizedItem = {
    title: item.title,
    category: item.category,
    description: item.description,
    location: item.location,
    contact: item.contact,
    image: item.image,
    type: item.type,
  };

  return {
    ...sanitizedItem,
    status: sanitizedItem.type === "lost" ? "active" : "available",
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
  return (
    effectiveStatus === "verified_returned"
    || effectiveStatus === "returned"
    || effectiveStatus === "claimed"
  );
}

export function shouldShowItemInHistory(
  item: Record<string, unknown>,
  returnVerifications: ItemReturnVerification[] = [],
): boolean {
  const effectiveStatus = getEffectiveItemStatus(item, returnVerifications);
  return (
    effectiveStatus === "verified_returned"
    || effectiveStatus === "returned"
    || effectiveStatus === "claimed"
  );
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
