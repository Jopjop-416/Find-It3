import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonResponse = (body: Record<string, unknown>, status = 200) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
};

type VerifyRequestBody = {
  token?: string;
};

type CloudflareVerifyResponse = {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ success: false, "error-codes": ["method-not-allowed"] });
  }

  const turnstileSecret = Deno.env.get("TURNSTILE_SECRET_KEY");

  if (!turnstileSecret) {
    return jsonResponse({ success: false, "error-codes": ["missing-turnstile-secret"] });
  }

  let body: VerifyRequestBody;

  try {
    body = await req.json();
  } catch {
    return jsonResponse({ success: false, "error-codes": ["invalid-json-body"] });
  }

  const token = body.token?.trim();

  if (!token) {
    return jsonResponse({ success: false, "error-codes": ["missing-input-response"] });
  }

  const formData = new FormData();
  formData.append("secret", turnstileSecret);
  formData.append("response", token);

  const remoteIp = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for");
  if (remoteIp) {
    formData.append("remoteip", remoteIp.split(",")[0].trim());
  }

  try {
    const verifyResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
      },
    );

    const result = (await verifyResponse.json()) as CloudflareVerifyResponse;

    return jsonResponse(
      {
        ...result,
        providerStatus: verifyResponse.status,
      },
    );
  } catch (error) {
    console.error("Turnstile siteverify request failed:", error);

    return jsonResponse(
      {
        success: false,
        "error-codes": ["siteverify-request-failed"],
      },
    );
  }
});
