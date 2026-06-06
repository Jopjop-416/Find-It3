import { supabase } from "./supabase";

type TurnstileVerifyResponse = {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
  providerStatus?: number;
};

export async function verifyTurnstileToken(token: string) {
  if (!supabase) {
    return {
      success: false,
      message: "Supabase belum dikonfigurasi. CAPTCHA tidak bisa diverifikasi.",
    };
  }

  const { data, error } = await supabase.functions.invoke<TurnstileVerifyResponse>(
    "turnstile-verify",
    {
      body: { token },
    },
  );

  if (error) {
    return {
      success: false,
      message: `Verifikasi CAPTCHA gagal. ${error.message}`,
    };
  }

  if (!data?.success) {
    const errorCodes = data?.["error-codes"] ?? [];
    const readableErrors = errorCodes.length > 0
      ? ` (${errorCodes.join(", ")})`
      : "";

    return {
      success: false,
      message: `CAPTCHA belum lolos. Silakan ulangi verifikasi.${readableErrors}`,
      errorCodes,
    };
  }

  return {
    success: true,
  };
}
