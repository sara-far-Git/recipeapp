"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import RecipeIcon from "@/components/ui/RecipeIcon";
import { recipesApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useState, memo } from "react";
import { useRouter } from "next/navigation";

interface RecipeCardProps {
  recipe: any;
}

const difficultyLabels: Record<string, string> = { easy: "קל", medium: "בינוני", hard: "מאתגר" };
const kosherLabels: Record<string, string> = { meat: "בשרי", dairy: "חלבי", pareve: "פרווה", non_kosher: "לא כשר" };


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
  const tags = [recipe.category, diffLabel, kosherLabel].filter(Boolean) as string[];
  const hasImage = Boolean(recipe.image_url);
  const isDraft = recipe.is_published === false;

  return (
    <div className="recipe-card-shell group">
    <article className="recipe-card card-surface card-surface-hover h-full flex flex-col overflow-hidden">
      <span className="recipe-card-strap" aria-hidden="true" />
      <Link href={`/recipe/${recipe.id}`} className="flex flex-col flex-1 min-h-0">
        <div className="relative overflow-hidden shrink-0" style={{ aspectRatio: "4/3" }}>
          {hasImage ? (
            <Image
              src={recipe.image_url}
              alt={recipe.title}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="recipe-card-fallback absolute inset-0 p-4">
              <div
                className="h-full flex flex-col justify-between p-4 rounded-md"
                style={{ border: "1px solid rgba(39,94,80,0.14)" }}>
                <div className="flex items-start justify-between gap-3">
                  <span className="eyebrow text-[11px]">{recipe.category || "מתכון"}</span>
                  <div className="w-9 h-9 text-bark-500/50">
                    <RecipeIcon category={recipe.category} />
                  </div>
                </div>
                <h3 className="card-title text-bark-500 line-clamp-3 group-hover:text-cinnamon-500 transition-colors">
                  {recipe.title}
                </h3>
                <span className="block h-px w-10" style={{ background: "#D97757" }} />
              </div>
            </div>
          )}

          {isDraft && (
            <span className="recipe-card-draft absolute top-3 left-3 px-2.5 py-1 text-[11px] font-bold">
              טיוטה
            </span>
          )}

          {totalTime > 0 && (
            <span className="recipe-card-time absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold">
              <Clock className="w-3 h-3" strokeWidth={2} />
              {totalTime} דק׳
            </span>
          )}
        </div>

        <div className="px-5 pt-4 pb-4 flex flex-col flex-1">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {tags.map((t) => (
                <span key={t} className="badge badge-neutral">{t}</span>
              ))}
            </div>
          )}

          {hasImage && (
            <h3 className="card-title line-clamp-2 text-bark-500 transition-colors duration-300 group-hover:text-cinnamon-500">
              {recipe.title}
            </h3>
          )}

          {recipe.description && (
            <p className={cn("line-clamp-2 text-bark-200 text-[14px] leading-relaxed", hasImage && "mt-2")}>
              {recipe.description}
            </p>
          )}

        </div>
      </Link>

      <div className="px-5 pb-4">
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-surface-400">
            <span className="flex items-center gap-1.5 text-[13px] font-semibold text-bark-200">
              <Users className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.8} />
              {recipe.servings || "—"} מנות
            </span>
            <button
              type="button"
              onClick={handleLike}
              aria-label={liked ? "בטלו לייק" : "אהבתי"}
              className={cn("flex items-center gap-1.5 text-[13px] font-semibold transition-colors duration-300 min-h-[24px] px-1 -mx-1",
                liked ? "text-cinnamon-500" : "text-bark-200 hover:text-cinnamon-500")}>
              <Heart className={cn("w-4 h-4 transition-transform duration-300 flex-shrink-0", liked && "fill-current", likeAnim && "scale-125")} strokeWidth={1.8} />
              {likesCount}
            </button>
          </div>
      </div>
    </article>
    </div>
  );
}

export default memo(RecipeCard);
