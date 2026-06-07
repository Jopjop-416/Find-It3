const AUTH_RECOVERY_QUERY_KEYS = [
  "code",
  "type",
  "token",
  "token_hash",
  "access_token",
  "refresh_token",
  "expires_at",
  "expires_in",
];

export type PasswordRecoveryUrlState = {
  recoveryCode: string | null;
  shouldShowResetPassword: boolean;
  cleanedUrl: string;
};

export function buildPasswordRecoveryRedirectUrl(rawUrl: string): string {
  const url = new URL(rawUrl);
  url.search = "";
  url.hash = "";
  url.searchParams.set("view", "reset-password");
  return url.toString();
}

export function getPasswordRecoveryUrlState(rawUrl: string): PasswordRecoveryUrlState {
  const url = new URL(rawUrl);
  const queryParams = url.searchParams;
  const hashParams = new URLSearchParams(url.hash.startsWith("#") ? url.hash.slice(1) : url.hash);

  const queryView = queryParams.get("view");
  const queryType = queryParams.get("type");
  const hashType = hashParams.get("type");
  const recoveryCode = queryParams.get("code");
  const hasHashTokens = hashParams.has("access_token") || hashParams.has("refresh_token");

  const shouldShowResetPassword = (
    queryView === "reset-password"
    || queryType === "recovery"
    || hashType === "recovery"
    || (hashType === "recovery" && hasHashTokens)
  );

  const cleanedParams = new URLSearchParams(queryParams);
  AUTH_RECOVERY_QUERY_KEYS.forEach((key) => cleanedParams.delete(key));

  if (shouldShowResetPassword) {
    cleanedParams.set("view", "reset-password");
  }

  const cleanedQuery = cleanedParams.toString();

  return {
    recoveryCode,
    shouldShowResetPassword,
    cleanedUrl: `${url.pathname}${cleanedQuery ? `?${cleanedQuery}` : ""}`,
  };
}
