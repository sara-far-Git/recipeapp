"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { Eye, EyeOff } from "lucide-react";

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
          <svg viewBox="0 0 60 60" fill="none" stroke="#8b3a1f" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 mx-auto mb-6 animate-float">
            <path d="M8 14c0-1 1-2 2-2h18c2 0 4 1 5 3v34c-2-2-3-2-5-2H10c-1 0-2-1-2-2V14z" />
            <path d="M52 14c0-1-1-2-2-2H32c-2 0-4 1-5 3v34c2-2 3-2 5-2h18c1 0 2-1 2-2V14z" />
            <path d="M30 15v34" />
            <path d="M14 20h12M14 26h12M14 32h10" />
            <path d="M36 20h12M36 26h12M36 32h10" />
          </svg>
          <div className="inline-flex items-center gap-3 text-xs font-bold uppercase mb-3" style={{ color: "#5a3e2a", letterSpacing: "0.28em" }}>
            <span className="inline-block w-10 h-px" style={{ background: "#b8a385" }} />
            ברוכים הבאים
            <span className="inline-block w-10 h-px" style={{ background: "#b8a385" }} />
          </div>
          <h1 className="text-3xl font-bold text-bark-500" style={{ fontFamily: "'Heebo', sans-serif", letterSpacing: "-0.02em" }}>
            ספר המתכונים שלי
          </h1>
          <p className="text-bark-300 mt-3" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontSize: 17 }}>
            התחברו כדי לשתף ולגלות מתכונים
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card-surface p-7 space-y-5 animate-slide-up opacity-0" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium animate-scale-in">{error}</div>
          )}
          <Input id="email" label="אימייל" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required dir="ltr" />
          <div className="relative">
            <Input id="password" label="סיסמה" type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required dir="ltr" />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-3 top-[42px] text-bark-200 hover:text-cinnamon-500 transition-colors">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <Button type="submit" loading={loading} className="w-full" size="lg">התחברות</Button>
          <GoogleSignInButton onSuccess={() => router.push("/")} onError={(msg) => setError(msg)} />
        </form>

        <p className="text-center text-sm text-bark-300 mt-6 animate-fade-up" style={{ animationDelay: "250ms" }}>
          אין לך חשבון?{" "}
          <Link href="/register" className="text-cinnamon-500 font-bold hover:text-cinnamon-600 transition-colors">הרשמה</Link>
        </p>
      </div>
    </div>
  );
}
