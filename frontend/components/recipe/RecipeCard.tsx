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

  // Eyebrow: difficulty · time (or kosher if no time)
  const eyebrowParts: string[] = [];
  if (diffLabel) eyebrowParts.push(diffLabel);
  if (totalTime > 0) eyebrowParts.push(`${totalTime} דק׳`);
  else if (kosherLabel) eyebrowParts.push(kosherLabel);

  return (
    <Link href={`/recipe/${recipe.id}`} className="group block">
      <article
        className="overflow-hidden transition-all duration-500 ease-out group-hover:-translate-y-2"
        style={{ borderRadius: 4, background: "#fff", border: "1px solid #e8dcc4", boxShadow: "0 2px 12px rgba(58,38,24,0.06)" }}>

        {/* ── Image / placeholder ─────────────────── */}
        <div className="relative overflow-hidden" style={{ aspectRatio: "1/1" }}>
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
              className="w-full h-full flex items-center justify-center transition-opacity duration-500"
              style={{ background: "linear-gradient(135deg, #c89668 0%, #a06f3f 55%, #6b4423 100%)" }}>
              <div className="w-20 h-20 text-white/80">
                <CardIcon index={recipe.id} />
              </div>
            </div>
          )}
        </div>

        {/* ── Content ─────────────────────────────── */}
        <div className="px-6 pt-5 pb-5">
          {/* Eyebrow */}
          {eyebrowParts.length > 0 && (
            <div className="text-center mb-3 text-xs font-semibold"
              style={{ color: "#8b3a1f", fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", letterSpacing: "0.04em" }}>
              — {eyebrowParts.join(" · ")} —
            </div>
          )}

          {/* Title */}
          <h3
            className="text-center line-clamp-2 transition-colors duration-300 group-hover:text-cinnamon-500 mb-3"
            style={{ fontFamily: "'Heebo', sans-serif", fontSize: 20, fontWeight: 700, color: "#3a2618", letterSpacing: "-0.02em", lineHeight: 1.3 }}>
            {recipe.title}
          </h3>

          {/* Description */}
          {recipe.description && (
            <p
              className="text-center line-clamp-2 mb-4"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontSize: 13, color: "#8a6f55", lineHeight: 1.6 }}>
              {recipe.description}
            </p>
          )}

          {/* Divider */}
          <div style={{ height: 1, background: "#e8dcc4", marginBottom: 14 }} />

          {/* Footer */}
          <div className="flex items-center justify-center gap-6">
            {totalTime > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-bark-300">
                <Clock className="w-3.5 h-3.5 text-cinnamon-400 flex-shrink-0" strokeWidth={1.6} />
                {totalTime} דק׳
              </span>
            )}
            <span className="flex items-center gap-1.5 text-xs text-bark-300">
              <Users className="w-3.5 h-3.5 text-cinnamon-400 flex-shrink-0" strokeWidth={1.6} />
              {recipe.servings || "—"} מנות
            </span>
            <button
              onClick={handleLike}
              className={cn("flex items-center gap-1.5 text-xs transition-all duration-300",
                liked ? "text-cinnamon-500" : "text-bark-200 hover:text-cinnamon-500")}>
              <Heart className={cn("w-3.5 h-3.5 transition-all duration-300 flex-shrink-0", liked && "fill-current", likeAnim && "scale-125")} strokeWidth={1.6} />
              {likesCount}
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default memo(RecipeCard);
