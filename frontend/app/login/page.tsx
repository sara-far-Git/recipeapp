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
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-up">
          <div
            className="w-[72px] h-[72px] mx-auto mb-5 rounded-3xl flex items-center justify-center text-4xl shadow-glow animate-float"
            style={{ background: "linear-gradient(135deg, #d47c3a 0%, #b86028 60%, #9a4d20 100%)" }}
          >
            🔥
          </div>
          <h1 className="font-display text-3xl font-bold text-bark-600">ברוכים הבאים</h1>
          <p className="text-smoke-400 mt-2">התחברו כדי לשתף ולגלות מתכונים</p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="card-surface p-7 space-y-5 animate-slide-up opacity-0"
          style={{ animationDelay: "100ms", animationFillMode: "forwards" }}
        >
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium animate-scale-in">
              {error}
            </div>
          )}
          <Input id="email" label="אימייל" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required dir="ltr" />
          <div className="relative">
            <Input id="password" label="סיסמה" type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required dir="ltr" />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute left-3 top-[38px] text-smoke-400 hover:text-bark-500 transition-colors"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <Button type="submit" loading={loading} className="w-full" size="lg">התחברות</Button>

          <GoogleSignInButton
            onSuccess={() => router.push("/")}
            onError={(msg) => setError(msg)}
          />
        </form>

        <p className="text-center text-sm text-smoke-400 mt-6 animate-fade-up" style={{ animationDelay: "250ms" }}>
          אין לך חשבון?{" "}
          <Link href="/register" className="text-cinnamon-600 font-bold hover:text-cinnamon-500 transition-colors">
            הרשמה
          </Link>
        </p>
      </div>
    </div>
  );
}
