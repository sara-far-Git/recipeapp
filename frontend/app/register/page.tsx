"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuth((s) => s.register);
  const [form, setForm] = useState({ username: "", email: "", password: "", full_name: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try { await register(form); router.push("/"); }
    catch (err: any) { const d = err.response?.data?.detail; setError(typeof d === "string" ? d : Array.isArray(d) ? d.map((x: any) => x.msg).join(", ") : "שגיאה בהרשמה"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-up">
          <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-3xl flex items-center justify-center text-4xl shadow-glow animate-float" style={{ background: "linear-gradient(135deg, #d47c3a 0%, #b86028 60%, #9a4d20 100%)" }}>
            🔥
          </div>
          <h1 className="font-display text-3xl font-bold text-bark-600">הצטרפו לקהילה</h1>
          <p className="text-smoke-400 mt-2">יצרו חשבון ותתחילו לשתף מתכונים</p>
        </div>

        <form onSubmit={handleSubmit} className="card-surface p-7 space-y-5 animate-slide-up opacity-0" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
          {error && <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium animate-scale-in">{error}</div>}
          <Input id="full_name" label="שם מלא" value={form.full_name} onChange={update("full_name")} placeholder="השם שלך" />
          <Input id="username" label="שם משתמש" value={form.username} onChange={update("username")} placeholder="username" required dir="ltr" />
          <Input id="email" label="אימייל" type="email" value={form.email} onChange={update("email")} placeholder="name@example.com" required dir="ltr" />
          <div className="relative">
            <Input id="password" label="סיסמה" type={showPass ? "text" : "password"} value={form.password} onChange={update("password")} placeholder="לפחות 8 תווים" required dir="ltr" minLength={8} />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-3 top-[38px] text-smoke-400 hover:text-bark-500 transition-colors">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <Button type="submit" loading={loading} className="w-full" size="lg">יצירת חשבון</Button>

          <GoogleSignInButton
            onSuccess={() => router.push("/")}
            onError={(msg) => setError(msg)}
          />
        </form>

        <p className="text-center text-sm text-smoke-400 mt-6 animate-fade-up" style={{ animationDelay: "250ms" }}>
          כבר יש לך חשבון? <Link href="/login" className="text-cinnamon-600 font-bold hover:text-cinnamon-500 transition-colors">התחברות</Link>
        </p>
      </div>
    </div>
  );
}
