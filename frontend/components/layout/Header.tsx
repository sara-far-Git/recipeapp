"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Search, Plus, User, LogOut, ShoppingCart, Bookmark } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

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
  background: "rgba(247,241,228,0.92)",
  backdropFilter: "blur(20px) saturate(140%)",
  WebkitBackdropFilter: "blur(20px) saturate(140%)",
  borderBottom: "1px solid #d9c79a",
  boxShadow: scrolled ? "0 4px 20px rgba(58,38,24,0.06)" : "none",
  transition: "box-shadow 0.3s ease",
  }}
  >
  <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

  {/* Brand — RTL right side (first in DOM) */}
  <Link href="/"
  className="flex items-center gap-2.5 group flex-shrink-0 animate-fade-up"
  style={{ animationDelay: "0ms" }}>
  <svg viewBox="0 0 60 60" fill="none" stroke="#3a2618" strokeWidth={1.4}
  strokeLinecap="round" strokeLinejoin="round"
  className="w-9 h-9 sm:w-10 sm:h-10 group-hover:stroke-cinnamon-500 transition-all duration-300">
  <path d="M8 14c0-1 1-2 2-2h18c2 0 4 1 5 3v34c-2-2-3-2-5-2H10c-1 0-2-1-2-2V14z" />
  <path d="M52 14c0-1-1-2-2-2H32c-2 0-4 1-5 3v34c2-2 3-2 5-2h18c1 0 2-1 2-2V14z" />
  <path d="M30 15v34" />
  <path d="M14 20h12M14 26h12M14 32h10" />
  <path d="M36 20h12M36 26h12M36 32h10" />
  </svg>
  <span
  className="hidden sm:inline text-bark-500 group-hover:text-cinnamon-500 transition-colors duration-300"
  style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 600, fontStyle: "italic" }}>
  Recipes Book
  </span>
  </Link>

  {/* Center nav tabs — desktop only */}
  <nav
  className="hidden sm:flex items-center gap-0 animate-fade-up"
  style={{ animationDelay: "60ms" }}>
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

  {/* Right-action icons — RTL left side (last in DOM) */}
  <div
  className="flex items-center gap-0.5 animate-fade-up"
  style={{ animationDelay: "120ms" }}>
  <NavIcon href="/search" active={pathname === "/search"} label="חיפוש">
  <Search className="w-[18px] h-[18px]" strokeWidth={1.6} />
  </NavIcon>

  {user ? (
  <>
  <NavIcon href="/recipe/new" active={pathname === "/recipe/new"} label="מתכון חדש">
  <Plus className="w-[18px] h-[18px]" strokeWidth={1.6} />
  </NavIcon>
  <NavIcon href="/shopping" active={pathname === "/shopping"} label="קניות">
  <ShoppingCart className="w-[18px] h-[18px]" strokeWidth={1.6} />
  </NavIcon>
  <NavIcon
  href={`/profile/${user.username}`}
  active={pathname.startsWith("/profile")}
  label="פרופיל"
  className="hidden sm:flex">
  <User className="w-[18px] h-[18px]" strokeWidth={1.6} />
  </NavIcon>
  <div className="w-px h-5 mx-2 flex-shrink-0" style={{ background: "#d9c79a" }} />
  <button
  onClick={() => { logout(); router.push("/"); }}
  className="w-9 h-9 flex items-center justify-center rounded-full text-bark-300 hover:text-cinnamon-500 hover:bg-cinnamon-50 transition-all duration-300"
  aria-label="יציאה">
  <LogOut className="w-[18px] h-[18px]" strokeWidth={1.6} />
  </button>
  </>
  ) : (
  <Link href="/login"
  className="mr-2 px-5 py-2  btn-fire text-sm">
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
  "group relative flex items-center gap-1 px-3.5 py-1 transition-colors duration-250",
  "text-[13px] font-semibold uppercase",
  active ? "text-cinnamon-500" : "text-bark-300 hover:text-cinnamon-500",
  )}
  style={{ letterSpacing: "0.18em", fontFamily: "'Heebo', sans-serif" }}>
  {/* Opening em-dash */}
  <span
  className={cn(
  "transition-opacity duration-250",
  active ? "opacity-100" : "opacity-0 group-hover:opacity-100",
  )}
  style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, color: "#b8a385", letterSpacing: 0 }}>
  —
  </span>
  {children}
  {/* Closing em-dash */}
  <span
  className={cn(
  "transition-opacity duration-250",
  active ? "opacity-100" : "opacity-0 group-hover:opacity-100",
  )}
  style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, color: "#b8a385", letterSpacing: 0 }}>
  —
  </span>
  {/* Underline sweep */}
  <span
  className="absolute bottom-0 right-0 left-0 h-px bg-cinnamon-500 origin-right scale-x-0 group-hover:scale-x-100"
  style={{
  transform: active ? "scaleX(1)" : undefined,
  transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)",
  }}
  />
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
  ? "text-cinnamon-500 bg-cinnamon-50"
  : "text-bark-300 hover:text-cinnamon-500 hover:bg-cinnamon-50",
  className,
  )}>
  {children}
  {active && (
  <span
  className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cinnamon-500 animate-scale-in"
  />
  )}
  </Link>
  );
}
