"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Search, Plus, User, LogOut, ShoppingCart, Flame } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 glass-strong border-b border-white/[0.05]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fire-300 via-fire-500 to-ember-400 flex items-center justify-center group-hover:animate-pulse-glow transition-all duration-300 shadow-glow-sm">
              <Flame className="w-5 h-5 text-white drop-shadow-md" />
            </div>
          </div>
          <span className="hidden sm:inline font-display text-xl font-bold text-fire tracking-tight">
            RecipeApp
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <NavIcon href="/search" active={pathname === "/search"}>
            <Search className="w-[18px] h-[18px]" />
          </NavIcon>

          {user ? (
            <>
              <NavIcon href="/recipe/new" active={pathname === "/recipe/new"}>
                <Plus className="w-[18px] h-[18px]" />
              </NavIcon>
              <NavIcon href="/shopping" active={pathname === "/shopping"}>
                <ShoppingCart className="w-[18px] h-[18px]" />
              </NavIcon>
              <NavIcon href={`/profile/${user.username}`} active={pathname.startsWith("/profile")}>
                <User className="w-[18px] h-[18px]" />
              </NavIcon>
              <div className="w-px h-5 bg-white/[0.06] mx-2" />
              <button
                onClick={() => { logout(); router.push("/"); }}
                className="p-2.5 rounded-xl text-smoke-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
              >
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

function NavIcon({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "p-2.5 rounded-xl transition-all duration-300 relative",
        active ? "text-fire-300 bg-fire-400/10" : "text-smoke-300 hover:text-smoke-100 hover:bg-white/[0.04]"
      )}
    >
      {children}
      {active && <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-fire-400 animate-scale-in" />}
    </Link>
  );
}
