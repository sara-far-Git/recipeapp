"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Bookmark, Clock, ChefHat, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { recipesApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useState, memo } from "react";
import { useRouter } from "next/navigation";

interface RecipeCardProps {
  recipe: any;
}

const diffCfg: Record<string, { label: string; cls: string }> = {
  easy:   { label: "קל",     cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  medium: { label: "בינוני", cls: "bg-cinnamon-50 text-cinnamon-600 border border-cinnamon-100" },
  hard:   { label: "מאתגר",  cls: "bg-red-50 text-red-700 border border-red-200" },
};
const kosherLabels: Record<string, string> = { meat: "בשרי", dairy: "חלבי", pareve: "פרווה", non_kosher: "לא כשר" };

function RecipeCard({ recipe }: RecipeCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [liked, setLiked] = useState(recipe.is_liked);
  const [likesCount, setLikesCount] = useState(recipe.likes_count);
  const [saved, setSaved] = useState(recipe.is_saved);
  const [likeAnim, setLikeAnim] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { router.push("/login"); return; }
    setLikeAnim(true); setTimeout(() => setLikeAnim(false), 400);
    const { data } = await recipesApi.toggleLike(recipe.id);
    setLiked(data.liked); setLikesCount(data.likes_count);
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { router.push("/login"); return; }
    const { data } = await recipesApi.toggleSave(recipe.id);
    setSaved(data.saved);
  };

  const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0);
  const diff = diffCfg[recipe.difficulty] || diffCfg.medium;
  const kosherLabel = recipe.kosher_type ? kosherLabels[recipe.kosher_type] : null;

  return (
    <Link href={`/recipe/${recipe.id}`} className="group block">
      <article className="card-surface card-surface-hover overflow-hidden">
        <div className="relative aspect-[4/3] overflow-hidden" style={{ background: "#e8dcc4" }}>
          {recipe.image_url ? (
            <Image src={recipe.image_url} alt={recipe.title} fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
          ) : (
            <div className="flex items-center justify-center h-full" style={{ background: "linear-gradient(135deg, #e8dcc4, #d9c79a)" }}>
              <ChefHat className="w-14 h-14 text-bark-100" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          <div className="absolute top-3 right-3 flex flex-col gap-1.5">
            {kosherLabel ? (
              <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold backdrop-blur-md"
                style={{ background: "rgba(58,38,24,0.62)", color: "#f5efe2", border: "1px solid rgba(255,255,255,0.18)", letterSpacing: "0.04em" }}>
                {kosherLabel}
              </span>
            ) : null}
            <span className={cn("px-2.5 py-1 rounded-md text-[11px] font-semibold backdrop-blur-md", diff.cls)} style={{ letterSpacing: "0.04em" }}>
              {diff.label}
            </span>
          </div>

          <button onClick={handleSave} aria-label={saved ? "הסר משמורים" : "שמור מתכון"}
            className={cn("absolute top-3 left-3 p-2 rounded-lg backdrop-blur-md transition-all duration-300",
              saved ? "text-white" : "text-white/80 hover:text-white")}
            style={{
              background: saved ? "#8b3a1f" : "rgba(58,38,24,0.5)",
              border: saved ? "1px solid #8b3a1f" : "1px solid rgba(255,255,255,0.18)",
            }}>
            <Bookmark className={cn("w-4 h-4", saved && "fill-current")} />
          </button>

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                style={{ background: "#8b3a1f", boxShadow: "0 0 0 2px rgba(0,0,0,0.18)" }}>
                {(recipe.author.full_name || recipe.author.username).charAt(0)}
              </div>
              <span className="text-xs font-medium text-white/90 drop-shadow-md">
                {recipe.author.full_name || recipe.author.username}
              </span>
            </div>
            {totalTime > 0 ? (
              <span className="px-2 py-1 rounded-md text-[11px] font-semibold backdrop-blur-md flex items-center gap-1"
                style={{ background: "rgba(58,38,24,0.62)", color: "#f5efe2", border: "1px solid rgba(255,255,255,0.18)" }}>
                <Clock className="w-3 h-3" /> {totalTime} דק׳
              </span>
            ) : null}
          </div>
        </div>

        <div className="p-5 text-center">
          <div className="inline-flex items-center gap-2 mb-2.5 text-[10px] font-bold uppercase"
            style={{ color: "#8b3a1f", letterSpacing: "0.2em", fontFamily: "'Heebo', sans-serif" }}>
            <span>—</span>
            {kosherLabel ? <span>{kosherLabel} ·</span> : null}
            <span>{diff.label}</span>
            <span>—</span>
          </div>

          <h3 className="font-bold text-bark-500 mb-2 line-clamp-1 group-hover:text-cinnamon-500 transition-colors duration-300"
            style={{ fontFamily: "'Heebo', sans-serif", fontSize: 19, letterSpacing: "-0.01em", lineHeight: 1.3 }}>
            {recipe.title}
          </h3>
          {recipe.description ? (
            <p className="text-sm text-bark-200 line-clamp-2 mb-4 leading-relaxed" style={{ fontFamily: "'Heebo', sans-serif" }}>
              {recipe.description}
            </p>
          ) : null}

          <div className="flex items-center justify-center gap-5 pt-4" style={{ borderTop: "1px solid #e8dcc4" }}>
            <button onClick={handleLike}
              className={cn("flex items-center gap-1.5 text-sm transition-all duration-300", liked ? "text-cinnamon-500" : "text-bark-200 hover:text-cinnamon-500")}>
              <Heart className={cn("w-4 h-4 transition-all duration-300", liked && "fill-current", likeAnim && "scale-125")} />
              <span className="font-semibold text-xs">{likesCount}</span>
            </button>
            {recipe.average_rating !== undefined && recipe.average_rating > 0 ? (
              <span className="flex items-center gap-1 text-sm text-cinnamon-400">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="font-semibold text-xs">{recipe.average_rating.toFixed(1)}</span>
              </span>
            ) : null}
          </div>
        </div>
      </article>
    </Link>
  );
}

export default memo(RecipeCard);
