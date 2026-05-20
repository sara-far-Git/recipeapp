"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ChefHat, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { recipesApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useState, memo } from "react";
import { useRouter } from "next/navigation";

interface RecipeCardProps {
  recipe: any;
}

const difficultyLabels: Record<string, string> = { easy: "קל", medium: "בינוני", hard: "מאתגר" };
const difficultyColors: Record<string, string> = { easy: "#22c55e", medium: "#c47a52", hard: "#dc2626" };
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
  const diffLabel = difficultyLabels[recipe.difficulty] || "בינוני";
  const diffColor = difficultyColors[recipe.difficulty] || "#c47a52";
  const kosherLabel = recipe.kosher_type ? kosherLabels[recipe.kosher_type] : null;

  // Meta line: author · time · kosher · difficulty
  const metaParts: string[] = [recipe.author.full_name || recipe.author.username];
  if (totalTime > 0) metaParts.push(`${totalTime} דק׳`);
  if (kosherLabel) metaParts.push(kosherLabel);
  metaParts.push(diffLabel);

  return (
    <Link href={`/recipe/${recipe.id}`} className="group block">
      <article className="card-surface overflow-hidden transition-all duration-500 ease-out group-hover:-translate-y-1 group-hover:border-cinnamon-300"
        style={{ borderRadius: 12 }}>

        {/* Image — clean, no badges floating */}
        <div className="relative aspect-[5/4] overflow-hidden" style={{ background: "#e8dcc4" }}>
          {recipe.image_url ? (
            <Image src={recipe.image_url} alt={recipe.title} fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
          ) : (
            <div className="flex items-center justify-center h-full transition-opacity duration-500 group-hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #c89668, #a06f3f)" }}>
              <ChefHat className="w-12 h-12 text-white/80" />
            </div>
          )}
          {/* Single difficulty dot — minimal accent */}
          <span className="absolute top-3 left-3 w-2.5 h-2.5 rounded-full"
            style={{ background: diffColor, boxShadow: "0 0 0 3px rgba(255,255,255,0.9)" }}
            title={diffLabel} />
        </div>

        {/* Body — meta line, title, footer */}
        <div className="p-5">
          {/* Single meta line */}
          <div className="flex items-center justify-center gap-1.5 text-xs mb-2"
            style={{ color: "#8a6f55", fontFamily: "'Heebo', sans-serif" }}>
            {metaParts.map((p, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="w-0.5 h-0.5 rounded-full" style={{ background: "#b8a385" }} />}
                {p}
              </span>
            ))}
          </div>

          {/* Title */}
          <h3 className="text-center font-bold mb-3 line-clamp-2 transition-colors duration-300 group-hover:text-cinnamon-500"
            style={{ fontFamily: "'Heebo', sans-serif", fontSize: 17, fontWeight: 700, color: "#3a2618", letterSpacing: "-0.01em", lineHeight: 1.35 }}>
            {recipe.title}
          </h3>

          {/* Footer — like + rating */}
          <div className="flex items-center justify-center gap-5 pt-3" style={{ borderTop: "1px solid #efe7d7" }}>
            <button onClick={handleLike}
              className={cn("flex items-center gap-1.5 transition-all duration-300",
                liked ? "text-cinnamon-500" : "text-bark-200 hover:text-cinnamon-500")}>
              <Heart className={cn("w-4 h-4 transition-all duration-300", liked && "fill-current", likeAnim && "scale-125")} />
              <span className="font-semibold text-xs">{likesCount}</span>
            </button>
            {recipe.average_rating !== undefined && recipe.average_rating > 0 ? (
              <span className="flex items-center gap-1 text-cinnamon-500">
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
