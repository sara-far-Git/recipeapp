"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Bookmark, Clock, ChefHat, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { recipesApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface RecipeCardProps {
  recipe: {
    id: number; title: string; description?: string | null; image_url?: string | null;
    prep_time_minutes?: number | null; cook_time_minutes?: number | null; servings: number;
    difficulty: string; kosher_type?: string | null; likes_count: number; saves_count: number;
    comments_count?: number; average_rating?: number; ratings_count?: number;
    is_liked: boolean; is_saved: boolean;
    author: { id: number; username: string; full_name?: string | null; avatar_url?: string | null };
    created_at: string;
  };
}

const diffCfg: Record<string, { label: string; cls: string }> = {
  easy: { label: "קל", cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/15" },
  medium: { label: "בינוני", cls: "bg-fire-400/20 text-fire-200 border-fire-400/15" },
  hard: { label: "מאתגר", cls: "bg-ember-400/20 text-red-300 border-ember-400/15" },
};
const kosherLabels: Record<string, string> = { meat: "בשרי", dairy: "חלבי", pareve: "פרווה", non_kosher: "לא כשר" };

export default function RecipeCard({ recipe }: RecipeCardProps) {
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

  return (
    <Link href={`/recipe/${recipe.id}`} className="group block">
      <article className="card-surface card-surface-hover overflow-hidden">
        <div className="relative aspect-[16/10] bg-surface-300 overflow-hidden">
          {recipe.image_url ? (
            <Image src={recipe.image_url} alt={recipe.title} fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-110" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-surface-100 to-surface-400">
              <ChefHat className="w-14 h-14 text-smoke-500" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          <div className="absolute top-3 right-3 flex flex-col gap-1.5">
            {recipe.kosher_type && (
              <span className="badge bg-black/50 text-smoke-100 border border-white/10">{kosherLabels[recipe.kosher_type]}</span>
            )}
            <span className={cn("badge border", diff.cls)}>{diff.label}</span>
          </div>

          <button onClick={handleSave} className={cn(
            "absolute top-3 left-3 p-2.5 rounded-xl backdrop-blur-md transition-all duration-300",
            saved ? "bg-fire-500 text-white shadow-glow-sm" : "bg-black/40 text-smoke-200 border border-white/10 hover:bg-black/60"
          )}>
            <Bookmark className={cn("w-4 h-4", saved && "fill-current")} />
          </button>

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-fire-300 to-ember-400 flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-black/30">
                {(recipe.author.full_name || recipe.author.username).charAt(0)}
              </div>
              <span className="text-xs font-medium text-white/80 drop-shadow-lg">
                {recipe.author.full_name || recipe.author.username}
              </span>
            </div>
            {totalTime > 0 && (
              <span className="badge bg-black/50 text-white/80 border border-white/10 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {totalTime} דק׳
              </span>
            )}
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-gray-100 text-[15px] mb-1 line-clamp-1 group-hover:text-fire-300 transition-colors duration-300">
            {recipe.title}
          </h3>
          {recipe.description && (
            <p className="text-[13px] text-smoke-300 line-clamp-2 mb-3 leading-relaxed">{recipe.description}</p>
          )}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
            <div className="flex items-center gap-4">
              <button onClick={handleLike} className={cn("flex items-center gap-1.5 text-sm transition-all duration-300", liked ? "text-ember-300" : "text-smoke-400 hover:text-ember-300")}>
                <Heart className={cn("w-4 h-4 transition-all duration-300", liked && "fill-current", likeAnim && "scale-125")} />
                <span className="font-semibold text-xs">{likesCount}</span>
              </button>
              {recipe.average_rating !== undefined && recipe.average_rating > 0 && (
                <span className="flex items-center gap-1 text-sm text-fire-200">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="font-semibold text-xs">{recipe.average_rating.toFixed(1)}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
