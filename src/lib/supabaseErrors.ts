type SupabaseLikeError = {
  message?: string | null;
};

export function getReadableSupabaseAuthError(
  error: SupabaseLikeError | null | undefined,
  fallbackMessage: string,
): string {
  const message = error?.message?.trim();

  if (!message) {
    return fallbackMessage;
  }

  if (message.toLowerCase().includes("auth session missing")) {
    return "Link reset password tidak valid atau sesi recovery tidak aktif. Silakan minta link baru.";
  }

  return message;
}
