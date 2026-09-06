"use client";

/**
 * How the site is doing, for whoever runs it.
 *
 * Counts only — nobody's recipes, addresses or messages appear here. The
 * endpoint behind it answers 404 rather than 403 to anyone not named in the
 * server's configuration, so this page cannot be used to discover that there
 * is an admin area at all.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { adminApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import PageFrame from "@/components/ui/PageFrame";
import RecipeLoading from "@/components/ui/RecipeLoading";
import { BookOpen, Image as ImageIcon, Users } from "lucide-react";

type Stats = {
  users: {
    total: number;
    new_today: number;
    new_this_week: number;
    new_this_month: number;
    seen_today: number;
    seen_this_week: number;
    seen_this_month: number;
    never_signed_in: number;
  };
  recipes: { total: number; published: number; new_this_week: number };
  images: { count: number; bytes: number; quota_bytes_per_user: number };
};

const mb = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1);

export default function AdminPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "denied" | "error">("loading");

  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      setState("denied");
      return;
    }
    adminApi
      .stats()
      .then(({ data }) => {
        setStats(data);
        setState("ready");
      })
      .catch((err) => setState(err?.response?.status === 404 ? "denied" : "error"));
  }, [user]);

  if (state === "loading") {
    return (
      <PageFrame tone="sage">
        <RecipeLoading label="סופרת" kind="collection" />
      </PageFrame>
    );
  }

  if (state === "denied") {
    return (
      <PageFrame tone="sage">
        <div className="max-w-md mx-auto text-center py-20">
          <h1 className="display-md text-bark-500 mb-3">הדף לא נמצא</h1>
          <p className="text-bark-300 text-sm mb-4">
            אם זה הדף שלך, ההגדרה ADMIN_EMAILS בשרת צריכה להכיל בדיוק את
            הכתובת שאיתה נכנסת:
          </p>
          {user?.email && (
            <p
              className="card-surface inline-block px-4 py-2 mb-6 text-sm font-bold"
              style={{ direction: "ltr" }}>
              {user.email}
            </p>
          )}
          <Link href="/" className="btn-outline inline-flex">
            לדף הבית
          </Link>
        </div>
      </PageFrame>
    );
  }

  if (state === "error" || !stats) {
    return (
      <PageFrame tone="sage">
        <div className="max-w-md mx-auto text-center py-20">
          <h1 className="display-md text-bark-500 mb-3">לא הצלחנו לטעון</h1>
          <p className="text-bark-300 text-sm">
            ייתכן שהשרת עדיין מתעורר. נסי לרענן בעוד רגע.
          </p>
        </div>
      </PageFrame>
    );
  }

  const u = stats.users;

  return (
    <PageFrame tone="sage">
      <div className="max-w-4xl mx-auto">
        <header className="mb-9">
          <span className="eyebrow mb-2">מאחורי הקלעים</span>
          <h1 className="display-md text-bark-500 leading-none">מספרי האתר</h1>
        </header>

        <Section icon={Users} title="אנשים">
          <Figure n={u.total} label="נרשמו בסך הכול" big />
          <Figure n={u.seen_today} label="נכנסו היום" />
          <Figure n={u.seen_this_week} label="נכנסו השבוע" />
          <Figure n={u.seen_this_month} label="נכנסו החודש" />
          <Figure n={u.new_this_week} label="נרשמו השבוע" />
          <Figure n={u.never_signed_in} label="נרשמו ולא נכנסו" />
        </Section>

        <p className="text-bark-200 text-[13px] mb-9 leading-relaxed">
          כניסות נרשמות רק מהרגע שהתכונה הזאת עלתה לאוויר, אז מי שנכנס לפני כן
          ייספר כאן רק בכניסה הבאה שלו.
        </p>

        <Section icon={BookOpen} title="מתכונים">
          <Figure n={stats.recipes.total} label="בסך הכול" big />
          <Figure n={stats.recipes.published} label="מפורסמים" />
          <Figure n={stats.recipes.new_this_week} label="נוספו השבוע" />
        </Section>

        <Section icon={ImageIcon} title="תמונות">
          <Figure n={stats.images.count} label="תמונות שמורות" big />
          <Figure text={`${mb(stats.images.bytes)}MB`} label="נפח שתופסות" />
          <Figure
            text={`${mb(stats.images.quota_bytes_per_user)}MB`}
            label="מכסה למשתמש"
          />
        </Section>
      </div>
    </PageFrame>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Users;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="section-title text-bark-500 mb-4 flex items-center gap-2">
        <Icon className="w-4 h-4 text-cinnamon-500" strokeWidth={1.9} />
        {title}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">{children}</div>
    </section>
  );
}

function Figure({
  n,
  text,
  label,
  big,
}: {
  n?: number;
  text?: string;
  label: string;
  big?: boolean;
}) {
  return (
    <div className="card-surface p-5">
      <p
        className="profile-stat-number"
        style={{ letterSpacing: 0, fontSize: big ? undefined : "2.2rem" }}>
        {text ?? n?.toLocaleString("he-IL")}
      </p>
      <p className="text-[13px] text-bark-200 mt-1.5">{label}</p>
    </div>
  );
}
