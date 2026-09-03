"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { BookOpen, Home, Search, Plus, Bookmark, User, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const { user } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const items = user
    ? [
      { href: "/", icon: Home, label: "ראשי" },
      { href: "/search", icon: Search, label: "חיפוש" },
      { href: "/recipe/new", icon: Plus, label: "שמירה", special: true },
      { href: `/profile/${user.username}?tab=saved`, icon: Bookmark, label: "שמורים" },
      { href: `/profile/${user.username}`, icon: User, label: "פרופיל" },
    ]
    : [
      { href: "/", icon: Home, label: "ראשי" },
      { href: "/search", icon: Search, label: "חיפוש" },
      { href: "/register", icon: Plus, label: "הרשמה", special: true },
      { href: "/#categories", icon: BookOpen, label: "קטגוריות" },
      { href: "/login", icon: LogIn, label: "כניסה" },
    ];

  return (
  <nav
  className="bottom-nav fixed bottom-0 inset-x-0 z-50 sm:hidden"
      style={{
        background: "rgba(11,42,32,0.96)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderTop: "1px solid rgba(250,248,243,0.18)",
      }}>
  <div className="flex items-center justify-around h-16 px-2">
  {items.map((item) => {
  const [pathPart, queryPart] = item.href.split("?");
  const basePath = pathPart;
  const active = (() => {
  if (item.href === "/") return pathname === "/";
  if (!pathname.startsWith(basePath) || basePath === "/") return false;
  if (queryPart) {
  const lp = new URLSearchParams(queryPart);
  if (lp.has("tab")) return searchParams.get("tab") === lp.get("tab");
  }
  if (basePath.includes("/profile/")) return searchParams.get("tab") !== "saved";
  return true;
  })();

  if (item.special) {
  return (
  <Link key={item.href} href={item.href} className="flex flex-col items-center -mt-5" aria-label={item.label}>
  <div
  className="flex items-center justify-center transition-transform duration-200 active:scale-90"
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 999,
                    background: "#2F6B5D",
                    boxShadow: "0 8px 20px -6px rgba(0,0,0,0.45)",
                  }}>
                  <item.icon className="w-5 h-5 text-forest-300 stroke-[2.5]" />
  </div>
  </Link>
  );
  }

  return (
  <Link
  key={item.href}
  href={item.href}
  className={cn(
                "relative flex flex-col items-center gap-1 px-3 py-1.5 transition-all duration-300",
                active ? "text-cinnamon-300" : "text-forest-100",
              )}>
  <item.icon
  className={cn("w-5 h-5 transition-all duration-300", active && "stroke-[2.5]")}
  strokeWidth={active ? 2.5 : 2}
  />
              <span className="text-[10px] font-bold">{item.label}</span>
  {active && (
  <span
  className="absolute -top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cinnamon-500 animate-scale-in"
  />
  )}
  </Link>
  );
  })}
  </div>
  </nav>
  );
}
