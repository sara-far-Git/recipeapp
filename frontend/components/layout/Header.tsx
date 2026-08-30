"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Search, Plus, User, LogOut, ShoppingCart } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import Logo from "@/components/brand/Logo";

const NAV_ALWAYS = [
  { href: "/", label: "בית" },
  { href: "/search", label: "מתכונים" },
  { href: "/#categories", label: "קטגוריות" },
];

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { setScrolled(window.scrollY >= 12); raf = 0; });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  const navLinks = NAV_ALWAYS;

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: scrolled ? "rgba(12, 24, 20, 0.72)" : "rgba(12, 24, 20, 0.45)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderBottom: `1px solid ${scrolled ? "rgba(232,235,231,0.12)" : "rgba(232,235,231,0.06)"}`,
        transition: "border-color 0.3s ease, background 0.3s ease",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Brand — RTL right side (first in DOM) */}
        <Link href="/" className="flex items-center flex-shrink-0" aria-label="ספר המתכונים — דף הבית">
          <Logo size={52} priority className="h-11 w-11 sm:h-[52px] sm:w-[52px]" />
        </Link>

        {/* Center nav — desktop only */}
        <nav className="hidden sm:flex items-center gap-1">
          {navLinks.map((link) => {
            const [pathPart, queryPart] = link.href.split("?");
            const basePath = pathPart.split("#")[0];
            const isActive = (() => {
              if (link.href === "/") return pathname === "/";
              if (!pathname.startsWith(basePath) || basePath === "/") return false;
              if (queryPart) {
                const lp = new URLSearchParams(queryPart);
                if (lp.has("tab")) return searchParams.get("tab") === lp.get("tab");
              }
              if (basePath.startsWith("/profile/")) return searchParams.get("tab") !== "saved";
              return true;
            })();
            return (
              <NavTab key={link.href} href={link.href} active={isActive}>
                {link.label}
              </NavTab>
            );
          })}
        </nav>

        {/* Actions — RTL left side (last in DOM) */}
        <div className="flex items-center gap-1">
          <NavIcon href="/search" active={pathname === "/search"} label="חיפוש">
            <Search className="w-[18px] h-[18px]" strokeWidth={1.8} />
          </NavIcon>
          <NavIcon
            href={user ? "/recipe/new" : "/login"}
            active={pathname === "/recipe/new"}
            label="מתכון חדש">
            <Plus className="w-[18px] h-[18px]" strokeWidth={1.8} />
          </NavIcon>
          <NavIcon
            href={user ? "/shopping" : "/login"}
            active={pathname === "/shopping"}
            label="קניות">
            <ShoppingCart className="w-[18px] h-[18px]" strokeWidth={1.8} />
          </NavIcon>
          <NavIcon
            href={user ? `/profile/${user.username}` : "/login"}
            active={pathname.startsWith("/profile")}
            label="פרופיל"
            className="hidden sm:flex">
            <User className="w-[18px] h-[18px]" strokeWidth={1.8} />
          </NavIcon>
          {user ? (
            <>
              <div className="w-px h-5 mx-2 flex-shrink-0 bg-cream-100/20" />
              <button
                onClick={() => { logout(); router.push("/"); }}
                className="w-9 h-9 flex items-center justify-center rounded-full text-cream-200 hover:text-cinnamon-300 hover:bg-cream-100/10 transition-all duration-300"
                aria-label="יציאה">
                <LogOut className="w-[18px] h-[18px]" strokeWidth={1.8} />
              </button>
            </>
          ) : (
            <Link href="/login" className="mr-2 btn-cream h-10 px-6 text-sm" style={{ minHeight: 40 }}>
              התחברות
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function NavTab({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative px-4 py-2 text-sm font-bold transition-colors duration-200",
        active ? "text-cinnamon-300" : "text-cream-200 hover:text-cream-100",
      )}>
      {children}
      <span
        className="absolute bottom-1 right-4 left-4 h-[1.5px] bg-current origin-right"
        style={{
          transform: active ? "scaleX(1)" : "scaleX(0)",
          transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)",
        }}
      />
      {!active && (
        <span className="absolute bottom-1 right-4 left-4 h-[1.5px] bg-current origin-right scale-x-0 group-hover:scale-x-100"
          style={{ transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)" }} />
      )}
    </Link>
  );
}

function NavIcon({
  href, active, label, children, className,
}: {
  href: string; active: boolean; label?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "relative w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300",
        active
          ? "text-cinnamon-300 bg-cream-100/10"
          : "text-cream-200 hover:text-cinnamon-300 hover:bg-cream-100/10",
        className,
      )}>
      {children}
    </Link>
  );
}
