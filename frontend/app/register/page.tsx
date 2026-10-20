"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { Eye, EyeOff, Plus } from "lucide-react";
import Logo from "@/components/brand/Logo";
import PageFrame from "@/components/ui/PageFrame";

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuth((s) => s.register);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault(); setError("");
  if (!acceptTerms) { setError("כדי להירשם צריך לאשר את תנאי השימוש ומדיניות הפרטיות"); return; }
  setLoading(true);
  try { await register({ email, username, password, full_name: fullName || undefined, accept_terms: true }); router.push("/"); }
  catch (err: any) {
  const d = err.response?.data?.detail;
  setError(typeof d === "string" ? d : Array.isArray(d) ? d.map((x: any) => x.msg).join(", ") : "שגיאה בהרשמה");
  }
  finally { setLoading(false); }
  };

  return (
  <PageFrame tone="terracotta" className="auth-experience">
  <div className="min-h-[76vh] flex items-center justify-center px-4">
  <div className="w-full max-w-md">
  <div className="auth-stage text-center mb-7 animate-fade-up">
          <Logo solid size={96} priority className="mx-auto mb-6 animate-float" />
          <span className="eyebrow mb-4">
            <span className="plus-badge text-cinnamon-500"><Plus className="w-3.5 h-3.5" strokeWidth={2.4} /></span>
            בחינם
          </span>
          <h1 className="display-lg text-bark-500">
            פותחים ספר משלכם
          </h1>
          <p className="text-bark-200 mt-3 text-[17px]">
            שומרים מתכונים וחוזרים אליהם מכל מכשיר
          </p>
  </div>

  <form onSubmit={handleSubmit} className="card-surface relative p-7 space-y-5 animate-slide-up opacity-0" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
          {error && (
  <div role="alert" className="p-3.5  bg-red-50 border border-red-200 text-red-800 text-sm font-medium animate-scale-in">{error}</div>
  )}
  <Input id="fullName" label="שם מלא" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="ישראל ישראלי" />
  <Input id="username" label="שם משתמש" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" required dir="ltr" />
  <Input id="email" label="אימייל" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required dir="ltr" />
  <div className="relative">
  <Input id="password" label="סיסמה" type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required dir="ltr" minLength={8} autoComplete="new-password" hint="לפחות 8 תווים" />
  <button type="button" onClick={() => setShowPass(!showPass)}
  aria-label={showPass ? "הסתרת הסיסמה" : "הצגת הסיסמה"}
  className="absolute left-1 top-[30px] inline-flex min-h-11 min-w-11 items-center justify-center text-bark-200 hover:text-cinnamon-500 transition-colors">
  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
  </button>
  </div>
  {/* Consent is asked for, not assumed: the box starts empty, and both the
      form and the Google button wait for it. */}
  <div className="flex items-start gap-3">
  <input id="acceptTerms" type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)}
  required aria-required="true"
  className="mt-1 h-5 w-5 flex-shrink-0 accent-[#275E50] cursor-pointer" />
  <label htmlFor="acceptTerms" className="text-sm text-bark-400 leading-relaxed cursor-pointer">
  קראתי ואני מסכים/ה ל<Link href="/terms" target="_blank" className="font-bold underline text-bark-500">תנאי השימוש</Link>{" "}
  ול<Link href="/privacy" target="_blank" className="font-bold underline text-bark-500">מדיניות הפרטיות</Link>,
  כולל שמירת הפרטים שמסרתי לצורך הפעלת החשבון.
  <span className="sr-only"> (הקישורים נפתחים בלשונית חדשה)</span>
  </label>
  </div>
  <Button type="submit" loading={loading} className="w-full" size="lg">הרשמה</Button>
  <div className="flex items-center gap-3 text-bark-200 text-xs">
  <span className="flex-1 h-px bg-surface-400" />
            <span className="font-bold">או</span>
  <span className="flex-1 h-px bg-surface-400" />
  </div>
  <GoogleSignInButton acceptTerms={acceptTerms} disabled={!acceptTerms} onSuccess={() => router.push("/")} onError={(msg) => setError(msg)} />
  {!acceptTerms && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && <p className="text-center text-xs text-bark-400">ההרשמה עם Google תיפתח אחרי סימון ההסכמה</p>}
  </form>

  <p className="text-center text-sm text-bark-300 mt-6 animate-fade-up" style={{ animationDelay: "250ms" }}>
  כבר יש לכם חשבון?{" "}
  <Link href="/login" className="text-cinnamon-500 font-bold hover:text-cinnamon-600 transition-colors inline-flex items-center min-h-[24px] px-1">התחברות</Link>
  </p>
  </div>
  </div>
  </PageFrame>
  );
}
