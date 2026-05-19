"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Search, Plus, User, LogOut, ShoppingCart } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: "rgba(239, 231, 215, 0.92)",
        backdropFilter: "blur(20px) saturate(140%)",
        WebkitBackdropFilter: "blur(20px) saturate(140%)",
        borderBottom: "1px solid #d9c79a",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"
            className="w-9 h-9 text-bark-500 group-hover:text-cinnamon-500 transition-colors duration-300">
            <path d="M8 14c0-1 1-2 2-2h18c2 0 4 1 5 3v34c-2-2-3-2-5-2H10c-1 0-2-1-2-2V14z" />
            <path d="M52 14c0-1-1-2-2-2H32c-2 0-4 1-5 3v34c2-2 3-2 5-2h18c1 0 2-1 2-2V14z" />
            <path d="M30 15v34" />
            <path d="M14 20h12M14 26h12M14 32h10" />
            <path d="M36 20h12M36 26h12M36 32h10" />
          </svg>
          <span className="hidden sm:inline text-xl font-bold text-bark-500 tracking-tight italic"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 }}>
            Recipes Book
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <NavIcon href="/search" active={pathname === "/search"} label="חיפוש">
            <Search className="w-[18px] h-[18px]" />
          </NavIcon>

          {user ? (
            <>
              <NavIcon href="/recipe/new" active={pathname === "/recipe/new"} label="חדש">
                <Plus className="w-[18px] h-[18px]" />
              </NavIcon>
              <NavIcon href="/shopping" active={pathname === "/shopping"} label="קניות">
                <ShoppingCart className="w-[18px] h-[18px]" />
              </NavIcon>
              <NavIcon href={`/profile/${user.username}`} active={pathname.startsWith("/profile")} label="פרופיל">
                <User className="w-[18px] h-[18px]" />
              </NavIcon>
              <div className="w-px h-5 mx-2" style={{ background: "#d9c79a" }} />
              <button onClick={() => { logout(); router.push("/"); }}
                className="p-2.5 rounded-xl text-bark-300 hover:text-cinnamon-600 hover:bg-cinnamon-50 transition-all duration-300"
                aria-label="יציאה">
                <LogOut className="w-[18px] h-[18px]" />
              </button>
            </>
          ) : (
            <Link href="/login" className="mr-2 px-5 py-2.5 rounded-xl btn-fire text-sm transition-all duration-200">
              התחברות
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

function NavIcon({ href, active, label, children }: { href: string; active: boolean; label?: string; children: React.ReactNode }) {
  return (
    <Link href={href} aria-label={label}
      className={cn(
        "p-2.5 rounded-xl transition-all duration-300 relative",
        active ? "text-cinnamon-500 bg-cinnamon-50" : "text-bark-300 hover:text-cinnamon-500 hover:bg-cinnamon-50/60"
      )}>
      {children}
      {active && (
        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full animate-scale-in"
          style={{ background: "#8b3a1f" }} />
      )}
    </Link>
  );
}
