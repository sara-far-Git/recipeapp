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
}

/**
 * Google Identity Services button. Renders nothing if the client ID isn't
 * configured at build time — that lets us ship the page without breaking
 * builds while ops are still wiring up Google credentials.
 */
export default function GoogleSignInButton({
  onSuccess,
  onError,
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
  style={{ opacity: busy ? 0.6 : 1, pointerEvents: busy ? "none" : "auto" }}
  >
  <GoogleLogin
  theme="outline"
  size="large"
  shape="pill"
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
  await loginWithGoogle(token);
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
