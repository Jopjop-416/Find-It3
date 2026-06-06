import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          theme?: "light" | "dark" | "auto";
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: (errorCode?: string) => void;
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove?: (widgetId?: string) => void;
    };
  }
}

let turnstileScriptPromise: Promise<void> | null = null;

const loadTurnstileScript = () => {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.turnstile) {
    return Promise.resolve();
  }

  if (!turnstileScriptPromise) {
    turnstileScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>(
        'script[data-turnstile-script="true"]',
      );

      if (existingScript) {
        if (window.turnstile) {
          resolve();
          return;
        }

        existingScript.addEventListener("load", () => resolve(), { once: true });
        existingScript.addEventListener("error", () => reject(new Error("Failed to load Turnstile")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.dataset.turnstileScript = "true";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Turnstile"));
      document.head.appendChild(script);
    });
  }

  return turnstileScriptPromise;
};

interface TurnstileWidgetProps {
  siteKey?: string;
  onTokenChange: (token: string | null) => void;
  resetSignal?: number;
}

export function TurnstileWidget({
  siteKey,
  onTokenChange,
  resetSignal = 0,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [errorCode, setErrorCode] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!siteKey) {
      setStatus("idle");
      setErrorCode(null);
      return () => {
        isMounted = false;
      };
    }

    setStatus("loading");
    setErrorCode(null);

    loadTurnstileScript()
      .then(() => {
        if (isMounted) {
          setStatus("ready");
        }
      })
      .catch(() => {
        if (isMounted) {
          setStatus("error");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [siteKey]);

  useEffect(() => {
    if (status !== "ready" || !siteKey || !containerRef.current || !window.turnstile) {
      return;
    }

    containerRef.current.innerHTML = "";

    try {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: "light",
        callback: (token: string) => {
          onTokenChange(token);
        },
        "expired-callback": () => {
          onTokenChange(null);
        },
        "error-callback": (code?: string) => {
          onTokenChange(null);
          setErrorCode(code ?? null);
          setStatus("error");
        },
      });
    } catch {
      onTokenChange(null);
      setStatus("error");
    }

    return () => {
      if (widgetIdRef.current && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
      } else if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
      widgetIdRef.current = null;
    };
  }, [onTokenChange, siteKey, status]);

  useEffect(() => {
    if (!resetSignal || !widgetIdRef.current || !window.turnstile) {
      return;
    }

    window.turnstile.reset(widgetIdRef.current);
    onTokenChange(null);
  }, [onTokenChange, resetSignal]);

  if (!siteKey) {
    return (
      <div className="rounded-sm border border-dashed border-orange-300 bg-orange-50 px-4 py-3 text-sm text-orange-900">
        Turnstile belum dikonfigurasi di environment.
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="rounded-sm border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
        Memuat CAPTCHA...
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
        CAPTCHA gagal dimuat. Cek site key Turnstile dan domain widget di Cloudflare
        {errorCode ? ` (${errorCode}).` : "."}
      </div>
    );
  }

  return <div ref={containerRef} className="min-h-[65px]" />;
}
