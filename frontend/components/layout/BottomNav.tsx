"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Home, Search, Plus, Bookmark, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const { user } = useAuth();
  const pathname = usePathname();
  if (!user) return null;

  const items = [
    { href: "/", icon: Home, label: "ראשי" },
    { href: "/search", icon: Search, label: "חיפוש" },
    { href: "/recipe/new", icon: Plus, label: "חדש", special: true },
    { href: `/profile/${user.username}?tab=saved`, icon: Bookmark, label: "שמורים" },
    { href: `/profile/${user.username}`, icon: User, label: "פרופיל" },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 sm:hidden"
      style={{ background: "#f5efe2", borderTop: "1px solid #d9c79a", boxShadow: "0 -4px 20px rgba(58,38,24,0.06)" }}>
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href.split("?")[0]));
          if (item.special) {
            return (
              <Link key={item.href} href={item.href} className="flex flex-col items-center -mt-5">
                <div className="rounded-2xl flex items-center justify-center active:scale-90 transition-all duration-200"
                  style={{ width: 52, height: 52, background: "#8b3a1f", boxShadow: "0 4px 12px rgba(139,58,31,0.32)" }}>
                  <item.icon className="w-5 h-5 text-white stroke-[2.5]" />
                </div>
              </Link>
            );
          }
          return (
            <Link key={item.href} href={item.href}
              className={cn("flex flex-col items-center gap-1 px-3 py-1.5 transition-all duration-300",
                active ? "text-cinnamon-500" : "text-bark-300")}>
              <item.icon className={cn("w-5 h-5", active && "stroke-[2.5]")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
