"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { recipesApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useState, memo } from "react";
import { useRouter } from "next/navigation";

interface RecipeCardProps {
  recipe: any;
}

const difficultyLabels: Record<string, string> = { easy: "קל", medium: "בינוני", hard: "מאתגר" };
const kosherLabels: Record<string, string> = { meat: "בשרי", dairy: "חלבי", pareve: "פרווה", non_kosher: "לא כשר" };

// ── Line-art food icons — cycle by recipe id ──────────────────
function CardIcon({ index }: { index: number }) {
  const icons = [
    // Bowl
    <svg key="bowl" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 30c0 12 8 22 20 22s20-10 20-22" />
      <path d="M8 30h48" />
      <path d="M24 30c0 4 2 10 8 10s8-6 8-10" />
      <path d="M28 18c0-4 2-6 4-6s4 2 4 6" />
      <path d="M32 12v4" />
    </svg>,
    // Covered plate / dome
    <svg key="dome" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 36c0-10 8-18 18-18s18 8 18 18" />
      <path d="M8 36h48" />
      <path d="M32 18v-4" />
      <circle cx="32" cy="12" r="2" />
      <path d="M20 42h24" />
      <path d="M16 46h32" />
    </svg>,
    // Bread loaf
    <svg key="bread" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 32c0-10 4-16 16-16s16 6 16 16v14c0 2-2 4-4 4H20c-2 0-4-2-4-4V32z" />
      <path d="M12 32c0-10 8-16 20-16s20 6 20 16" />
      <path d="M24 32c0-4 2-6 8-6s8 2 8 6" />
    </svg>,
    // Teacup
    <svg key="cup" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 26h36l-4 20c0 2-2 4-4 4H22c-2 0-4-2-4-4l-4-20z" />
      <path d="M50 30h6c4 0 6 2 6 6s-2 6-6 6h-6" />
      <path d="M22 50c2 4 6 8 10 8s8-4 10-8" />
      <path d="M28 18c0-4 2-6 4-8" />
      <path d="M36 16c0-4 2-6 4-8" />
    </svg>,
    // Cake slice
    <svg key="cake" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 30l12-16 12 16" />
      <path d="M12 30h40v22c0 2-2 4-4 4H16c-2 0-4-2-4-4V30z" />
      <path d="M24 30v26M40 30v26" />
      <path d="M20 38h8M36 38h8" />
    </svg>,
    // Leaf / herb
    <svg key="leaf" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M32 54V24" />
      <path d="M32 24c0-12 10-18 18-18-2 10-8 18-18 18z" />
      <path d="M32 30c0-10-10-16-18-14 2 8 8 14 18 14z" />
      <path d="M32 38c0-8 6-14 14-14-2 6-6 12-14 14z" />
    </svg>,
  ];
  return icons[index % icons.length];
}

function RecipeCard({ recipe }: RecipeCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [liked, setLiked] = useState(recipe.is_liked);
  const [likesCount, setLikesCount] = useState(recipe.likes_count);
  const [likeAnim, setLikeAnim] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { router.push("/login"); return; }
    setLikeAnim(true); setTimeout(() => setLikeAnim(false), 400);
    const { data } = await recipesApi.toggleLike(recipe.id);
    setLiked(data.liked); setLikesCount(data.likes_count);
  };

  const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0);
  const diffLabel = difficultyLabels[recipe.difficulty] || "";
  const kosherLabel = recipe.kosher_type ? kosherLabels[recipe.kosher_type] : null;

  const tags = [diffLabel, kosherLabel].filter(Boolean) as string[];

  return (
    <Link href={`/recipe/${recipe.id}`} className="group block h-full">
      <article className="card-surface card-surface-hover h-full flex flex-col overflow-hidden">

        {/* ── Image / placeholder ─────────────────── */}
        <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
          {recipe.image_url ? (
            <Image
              src={recipe.image_url}
              alt={recipe.title}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: "#e8dcc4" }}>
              <div className="w-16 h-16 text-wood transition-transform duration-500 group-hover:scale-110">
                <CardIcon index={recipe.id} />
              </div>
            </div>
          )}

          {totalTime > 0 && (
            <span className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"
              style={{ background: "rgba(247,241,228,0.94)", color: "#3a2618" }}>
              <Clock className="w-3 h-3" strokeWidth={2} />
              {totalTime} דק׳
            </span>
          )}
        </div>

        {/* ── Content ─────────────────────────────── */}
        <div className="px-5 pt-5 pb-4 flex flex-col flex-1">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tags.map((t) => (
                <span key={t} className="badge badge-neutral">{t}</span>
              ))}
            </div>
          )}

          <h3
            className="line-clamp-2 text-bark-500 transition-colors duration-300 group-hover:text-cinnamon-500"
            style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.15 }}>
            {recipe.title}
          </h3>

          {recipe.description && (
            <p className="line-clamp-2 mt-2.5 text-bark-200 text-[14px] leading-relaxed">
              {recipe.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between gap-4 mt-5 pt-4 border-t border-surface-400">
            <span className="flex items-center gap-1.5 text-[13px] font-semibold text-bark-200">
              <Users className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.8} />
              {recipe.servings || "—"} מנות
            </span>
            <button
              onClick={handleLike}
              aria-label={liked ? "בטלו לייק" : "אהבתי"}
              className={cn("flex items-center gap-1.5 text-[13px] font-semibold transition-colors duration-300",
                liked ? "text-cinnamon-500" : "text-bark-100 hover:text-cinnamon-500")}>
              <Heart className={cn("w-4 h-4 transition-transform duration-300 flex-shrink-0", liked && "fill-current", likeAnim && "scale-125")} strokeWidth={1.8} />
              {likesCount}
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default memo(RecipeCard);
