export type StoredUser = {
  email: string;
  username: string;
  passwordHash?: string;
  password?: string;
};

export type UserData = {
  email: string;
  name: string;
  avatar: string;
  phone: string;
  address: string;
};

export type ReportFormData = {
  title: string;
  category: string;
  description: string;
  location: string;
  contact: string;
  image?: string;
};

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
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

export function buildUserDataFromAuthUser(user: SupabaseAuthUserLike | null | undefined): UserData {
  const email = user?.email ?? "";
  const metadata = user?.user_metadata ?? {};
  const metadataName = metadata.name ?? metadata.full_name ?? metadata.username;
  const metadataAvatar = metadata.avatar_url ?? metadata.avatar;
  const metadataPhone = metadata.phone;
  const metadataAddress = metadata.address;

  return {
    email,
    name:
      typeof metadataName === "string" && metadataName.trim()
        ? metadataName
        : email.split("@")[0] || "User",
    avatar: typeof metadataAvatar === "string" ? metadataAvatar : "",
    phone: typeof metadataPhone === "string" ? metadataPhone : "",
    address: typeof metadataAddress === "string" ? metadataAddress : "",
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
