"use client";

import { useState } from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useAuth } from "@/lib/auth";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

interface GoogleSignInButtonProps {
  /** Called after the backend has issued our JWT and the user is hydrated. */
  onSuccess?: () => void;
  /** Called when the popup is dismissed or the backend rejects the token. */
  onError?: (message: string) => void;
  /** The person agreed to the terms and privacy policy before pressing it.
   *  Recorded only when this sign-in opens a new account. */
  acceptTerms?: boolean;
  /** Keeps the button from being used, e.g. until the consent box is ticked. */
  disabled?: boolean;
}

/**
 * Google Identity Services button. Renders nothing if the client ID isn't
 * configured at build time — that lets us ship the page without breaking
 * builds while ops are still wiring up Google credentials.
 */
export default function GoogleSignInButton({
  onSuccess,
  onError,
  acceptTerms = false,
  disabled = false,
}: GoogleSignInButtonProps) {
  const loginWithGoogle = useAuth((s) => s.loginWithGoogle);
  const [busy, setBusy] = useState(false);

  if (!GOOGLE_CLIENT_ID) {
  return null;
  }

  return (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
  <div className="w-full flex flex-col items-center gap-3">
  <div
  className="w-full flex justify-center"
  aria-busy={busy}
  aria-disabled={disabled || undefined}
  inert={disabled ? ("" as any) : undefined}
  style={{ opacity: busy || disabled ? 0.5 : 1, pointerEvents: busy || disabled ? "none" : "auto" }}
  >
  <GoogleLogin
  theme="outline"
  size="large"
  shape="rectangular"
  text="continue_with"
  locale="he"
  onSuccess={async (credentialResponse) => {
  const token = credentialResponse.credential;
  if (!token) {
  onError?.("Google did not return a token");
  return;
  }
  setBusy(true);
  try {
  await loginWithGoogle(token, acceptTerms);
  onSuccess?.();
  } catch (err: any) {
  const detail =
  err?.response?.data?.detail ||
  err?.message ||
  "שגיאה בהתחברות עם Google";
  onError?.(typeof detail === "string" ? detail : "שגיאה בהתחברות");
  } finally {
  setBusy(false);
  }
  }}
  onError={() => onError?.("Google sign-in was cancelled or failed")}
  />
  </div>
  </div>
  </GoogleOAuthProvider>
  );
}
