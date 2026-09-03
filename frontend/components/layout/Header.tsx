"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import Logo from "@/components/brand/Logo";
import { LogIn, Menu, Plus, Search, ShoppingCart, User } from "lucide-react";

const NAV_PAGES = [
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
  const [open, setOpen] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { setScrolled(window.scrollY >= 12); raf = 0; });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => { setOpen(false); }, [pathname, searchParams]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prev;
    };
  }, [open]);

  const isActive = (href: string) => {
    const [pathPart, queryPart] = href.split("?");
    const basePath = pathPart.split("#")[0];
    if (href === "/") return pathname === "/";
    if (!pathname.startsWith(basePath) || basePath === "/") return false;
    if (queryPart) {
      const lp = new URLSearchParams(queryPart);
      if (lp.has("tab")) return searchParams.get("tab") === lp.get("tab");
    }
    if (basePath.startsWith("/profile/")) return searchParams.get("tab") !== "saved";
    return true;
  };

  const extras = [
    { href: "/search", label: "חיפוש" },
    { href: user ? "/recipe/new" : "/login", label: "שמירת מתכון" },
    { href: user ? "/shopping" : "/login", label: "קניות" },
    { href: user ? `/profile/${user.username}` : "/login", label: "פרופיל" },
  ];
  const ctaHref = user ? "/recipe/new" : "/register";
  const ctaLabel = user ? "שמירת מתכון" : "הרשמה";

  return (
    <>
      <header
        className={cn("sticky top-0 z-[80]", isHome && "home-header")}
        style={{
          background: isHome
            ? "rgba(12, 24, 20, 0.94)"
            : open || scrolled ? "rgba(250, 248, 243, 0.88)" : "rgba(250, 248, 243, 0.45)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderBottom: `1px solid ${isHome ? "rgba(250,248,243,0.18)" : open || scrolled ? "rgba(31,42,38,0.12)" : "rgba(31,42,38,0.06)"}`,
          transition: "border-color 0.3s ease, background 0.3s ease",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              className={cn("logo-trigger gap-2", open && "is-open")}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? "סגירת התפריט" : "פתיחת התפריט"}
              onClick={() => setOpen((v) => !v)}
            >
              <Logo solid size={52} priority className="h-11 w-11 sm:h-[52px] sm:w-[52px] shrink-0" />
              <span className="hidden sm:inline-flex items-center gap-1.5 text-sm font-extrabold text-bark-500">
                <Menu className="w-4 h-4" strokeWidth={2.2} />
                תפריט
              </span>
            </button>

            <nav className="hidden lg:flex items-center gap-1" aria-label="ניווט ראשי">
              {NAV_PAGES.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn("site-header-link", active && "is-active")}
                    aria-current={active ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-2 shrink-0">
            <Link href="/search" className="site-header-action site-header-action-soft">
              <Search className="w-4 h-4" strokeWidth={2.1} />
              חיפוש
            </Link>
            {user && (
              <Link href="/shopping" className="site-header-action site-header-action-soft">
                <ShoppingCart className="w-4 h-4" strokeWidth={2.1} />
                קניות
              </Link>
            )}
            <Link href={ctaHref} className="site-header-action site-header-action-primary">
              <Plus className="w-4 h-4" strokeWidth={2.4} />
              {ctaLabel}
            </Link>
            {user ? (
              <Link
                href={`/profile/${user.username}`}
                className="site-header-icon-action"
                aria-label="פרופיל"
              >
                <User className="w-4 h-4" strokeWidth={2.1} />
              </Link>
            ) : (
              <Link href="/login" className="site-header-action site-header-action-soft">
                <LogIn className="w-4 h-4" strokeWidth={2.1} />
                כניסה
              </Link>
            )}
          </div>

          <Link href="/search" className="md:hidden site-header-icon-action" aria-label="חיפוש">
            <Search className="w-5 h-5" strokeWidth={2.2} />
          </Link>
        </div>
      </header>

      <div
        id="site-menu"
        className={cn("logo-menu", open && "is-open")}
        aria-hidden={!open}
      >
        <div className="logo-menu-slab" aria-hidden="true" />
        <div className="logo-menu-bg" aria-hidden="true" />
        <nav className="logo-menu-copy max-w-6xl mx-auto w-full" aria-label="תפריט האתר">
          <div className="logo-menu-brand">
            <Logo size={420} className="w-[min(78vw,26rem)] h-auto" />
          </div>
          {NAV_PAGES.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
              className={cn("logo-menu-link", isActive(link.href) && "is-active")}
            >
              <span className="num">{String(i + 1).padStart(2, "0")}</span>
              <span className="lbl">{link.label}</span>
            </Link>
          ))}
          <div className="logo-menu-extras">
            {extras.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                tabIndex={open ? 0 : -1}
                onClick={() => setOpen(false)}
                className={cn("logo-menu-extra", isActive(link.href) && "is-active")}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <button
                type="button"
                tabIndex={open ? 0 : -1}
                className="logo-menu-extra"
                onClick={() => { setOpen(false); logout(); router.push("/"); }}
              >
                יציאה
              </button>
            ) : (
              <Link
                href="/login"
                tabIndex={open ? 0 : -1}
                onClick={() => setOpen(false)}
                className="logo-menu-extra"
              >
                התחברות
              </Link>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}
