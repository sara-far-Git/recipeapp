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

export default function LoginPage() {
  const router = useRouter();
  const login = useAuth((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault(); setError(""); setLoading(true);
  try { await login(email, password); router.push("/"); }
  catch (err: any) {
  const d = err.response?.data?.detail;
  setError(typeof d === "string" ? d : Array.isArray(d) ? d.map((x: any) => x.msg).join(", ") : "שגיאה בהתחברות");
  }
  finally { setLoading(false); }
  };

  return (
  <div className="min-h-[85vh] flex items-center justify-center px-4">
  <div className="w-full max-w-md">
  <div className="text-center mb-10 animate-fade-up">
          <Logo solid size={96} priority className="mx-auto mb-6 animate-float" />
          <span className="eyebrow mb-4">
            <span className="plus-badge text-cinnamon-500"><Plus className="w-3.5 h-3.5" strokeWidth={2.4} /></span>
            כניסה
          </span>
          <h1 className="display-lg text-bark-500">
            חוזרים לספר
          </h1>
          <p className="text-bark-200 mt-3 text-[17px]">
            המתכונים של הבית ורשימת הקניות מחכים בפנים
          </p>
  </div>

        <form onSubmit={handleSubmit} className="card-surface relative p-7 space-y-5 animate-slide-up opacity-0" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
          {error && (
  <div className="p-3.5  bg-red-50 border border-red-200 text-red-700 text-sm font-medium animate-scale-in">{error}</div>
  )}
  <Input id="email" label="אימייל" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required dir="ltr" />
  <div className="relative">
  <Input id="password" label="סיסמה" type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required dir="ltr" />
  <button type="button" onClick={() => setShowPass(!showPass)}
  aria-label={showPass ? "הסתרת הסיסמה" : "הצגת הסיסמה"}
  className="absolute left-3 top-[42px] text-bark-200 hover:text-cinnamon-500 transition-colors">
  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
  </button>
  </div>
  <Button type="submit" loading={loading} className="w-full" size="lg">התחברות</Button>
  <div className="flex items-center gap-3 text-bark-200 text-xs">
  <span className="flex-1 h-px bg-surface-400" />
            <span className="font-bold">או</span>
  <span className="flex-1 h-px bg-surface-400" />
  </div>
  <GoogleSignInButton onSuccess={() => router.push("/")} onError={(msg) => setError(msg)} />
  </form>

  <p className="text-center text-sm text-bark-300 mt-6 animate-fade-up" style={{ animationDelay: "250ms" }}>
  אין לכם חשבון?{" "}
  <Link href="/register" className="text-cinnamon-500 font-bold hover:text-cinnamon-600 transition-colors">הרשמה</Link>
  </p>
  </div>
  </div>
  );
}
