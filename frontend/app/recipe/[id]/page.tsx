"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { recipesApi, shoppingApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Button from "@/components/ui/Button";
import StarRating from "@/components/ui/StarRating";
import {
  Heart, Bookmark, Clock, Users, ChefHat, ArrowRight,
  Minus, Plus, CookingPot, Check, Flag, MessageCircle, Send,
  ShoppingCart, Share2, Star, X, Pencil, Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const difficultyLabels: Record<string, string> = { easy: "קל", medium: "בינוני", hard: "מאתגר" };
const kosherLabels: Record<string, string> = { meat: "בשרי", dairy: "חלבי", pareve: "פרווה", non_kosher: "לא כשר" };

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [servingMultiplier, setServingMultiplier] = useState(1);
  const [cookingMode, setCookingMode] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [avgRating, setAvgRating] = useState(0);
  const [ratingsCount, setRatingsCount] = useState(0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Shopping modal
  const [shoppingModalOpen, setShoppingModalOpen] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState<Set<number>>(new Set());
  const [shoppingLoading, setShoppingLoading] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await recipesApi.get(Number(params.id));
        setRecipe(data);
        setLiked(data.is_liked);
        setLikesCount(data.likes_count);
        setSaved(data.is_saved);
        setAvgRating(data.average_rating || 0);
        setRatingsCount(data.ratings_count || 0);
        setUserRating(data.user_rating ?? null);
        const { data: commentData } = await recipesApi.getComments(Number(params.id));
        setComments(commentData);
      } catch {
        router.push("/");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id, router]);

  useEffect(() => {
    let wakeLock: any = null;
    if (cookingMode && "wakeLock" in navigator) {
      (navigator as any).wakeLock.request("screen").then((wl: any) => { wakeLock = wl; }).catch(() => {});
    }
    return () => { if (wakeLock) wakeLock.release(); };
  }, [cookingMode]);

  const scaledIngredients = useMemo(() => {
    if (!recipe) return [];
    return recipe.ingredients.map((ing: any) => ({
      ...ing,
      amount: Math.round(ing.amount * servingMultiplier * 100) / 100,
    }));
  }, [recipe, servingMultiplier]);

  const handleServingsChange = (delta: number) => {
    if (!recipe) return;
    const newServings = Math.max(1, recipe.servings * servingMultiplier + delta);
    setServingMultiplier(newServings / recipe.servings);
  };

  const toggleLike = async () => {
    if (!user) { router.push("/login"); return; }
    const { data } = await recipesApi.toggleLike(recipe.id);
    setLiked(data.liked);
    setLikesCount(data.likes_count);
  };

  const toggleSave = async () => {
    if (!user) { router.push("/login"); return; }
    const { data } = await recipesApi.toggleSave(recipe.id);
    setSaved(data.saved);
  };

  const handleRate = async (score: number) => {
    if (!user) { router.push("/login"); return; }
    try {
      const { data } = await recipesApi.rate(recipe.id, score);
      setUserRating(score);
      setAvgRating(data.average_rating);
      setRatingsCount(data.ratings_count);
    } catch {}
  };

  const openShoppingModal = () => {
    if (!user) { router.push("/login"); return; }
    setSelectedIngredients(new Set(scaledIngredients.map((_: any, i: number) => i)));
    setShoppingModalOpen(true);
  };

  const handleShoppingConfirm = async () => {
    setShoppingLoading(true);
    try {
      const { data: lists } = await shoppingApi.list();
      let listId: number;
      if (lists.length === 0) {
        const { data: newList } = await shoppingApi.create("רשימת קניות");
        listId = newList.id;
      } else {
        listId = lists[0].id;
      }
      const { data: currentList } = await shoppingApi.get(listId);
      const existing = currentList.items || [];
      const toAdd = scaledIngredients
        .filter((_: any, i: number) => selectedIngredients.has(i))
        .map((ing: any) => ({
          name: ing.name,
          amount: ing.amount || 0,
          unit: ing.unit || null,
          checked: false,
          from_recipe: recipe.title,
        }));
      await shoppingApi.updateItems(listId, [...existing, ...toAdd]);
      setShoppingModalOpen(false);
      showToast(`${toAdd.length} מצרכים נוספו לרשימה`);
    } catch {
      showToast("שגיאה בהוספה לרשימת קניות");
    }
    setShoppingLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm("למחוק את המתכון? פעולה זו בלתי הפיכה.")) return;
    setDeleting(true);
    try {
      await recipesApi.delete(recipe.id);
      router.push("/profile/" + user?.username);
    } catch { setDeleting(false); }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: recipe.title, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      showToast("הקישור הועתק!");
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    setSendingComment(true);
    try {
      const { data } = await recipesApi.addComment(recipe.id, newComment.trim());
      setComments((prev) => [data, ...prev]);
      setNewComment("");
    } catch {}
    setSendingComment(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 animate-spin rounded-full border-4 border-fire-500 border-t-transparent" />
      </div>
    );
  }
  if (!recipe) return null;

  const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0);
  const currentServings = Math.round(recipe.servings * servingMultiplier);

  // ── Cooking mode ──────────────────────────────────────────────────────────
  if (cookingMode) {
    return (
      <div className="fixed inset-0 z-[100] overflow-auto" style={{ background: "#0f0c08" }}>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-display text-xl font-bold text-gray-100">{recipe.title}</h1>
            <button
              onClick={() => setCookingMode(false)}
              className="px-4 py-2 rounded-xl bg-surface-200 border border-white/[0.06] text-gray-300 text-sm hover:border-white/[0.1] transition-all"
            >
              יציאה ממצב בישול
            </button>
          </div>

          <div className="card-surface p-5 mb-6">
            <h2 className="font-bold text-gray-100 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-fire-400" />
              מצרכים ({currentServings} סועדים)
            </h2>
            <ul className="space-y-2">
              {scaledIngredients.map((ing: any, i: number) => (
                <li key={i} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-b-0">
                  <span className="font-semibold text-fire-400 min-w-[5rem] text-sm" dir="ltr">
                    {ing.amount} {ing.unit || ""}
                  </span>
                  <span className="text-gray-200">{ing.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-gray-100 mb-4">שלבי הכנה</h2>
            <ol className="space-y-3">
              {recipe.instructions.map((inst: any) => (
                <li
                  key={inst.step}
                  onClick={() => {
                    setCompletedSteps((prev) => {
                      const next = new Set(prev);
                      if (next.has(inst.step)) next.delete(inst.step); else next.add(inst.step);
                      return next;
                    });
                  }}
                  className={cn(
                    "p-4 rounded-2xl border-2 cursor-pointer transition-all",
                    completedSteps.has(inst.step)
                      ? "border-fire-500/40 bg-fire-500/10"
                      : "border-white/[0.06] bg-surface-200/50 hover:border-white/[0.1]"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                      completedSteps.has(inst.step)
                        ? "bg-fire-500 text-white"
                        : "bg-fire-500/15 text-fire-300"
                    )}>
                      {completedSteps.has(inst.step) ? <Check className="w-4 h-4" /> : inst.step}
                    </span>
                    <p className={cn(
                      "flex-1 leading-relaxed text-sm",
                      completedSteps.has(inst.step) ? "line-through text-gray-600" : "text-gray-200"
                    )}>{inst.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // ── Main page ──────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-2xl bg-surface-100 border border-white/10 text-sm text-gray-200 shadow-xl animate-fade-up whitespace-nowrap">
          {toast}
        </div>
      )}

      {/* Shopping modal */}
      {shoppingModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShoppingModalOpen(false)} />
          <div className="relative w-full sm:max-w-md bg-surface-100 rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
              <h3 className="font-bold text-gray-100">בחרי מצרכים לקנייה</h3>
              <button onClick={() => setShoppingModalOpen(false)} className="p-1.5 rounded-xl hover:bg-white/10 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-1">
              <button
                onClick={() => setSelectedIngredients(
                  selectedIngredients.size === scaledIngredients.length
                    ? new Set()
                    : new Set(scaledIngredients.map((_: any, i: number) => i))
                )}
                className="w-full text-right text-xs text-fire-400 hover:text-fire-300 mb-2 px-1"
              >
                {selectedIngredients.size === scaledIngredients.length ? "בטלי הכל" : "בחרי הכל"}
              </button>
              {scaledIngredients.map((ing: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedIngredients((prev) => {
                    const next = new Set(prev);
                    if (next.has(i)) next.delete(i); else next.add(i);
                    return next;
                  })}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl text-right transition-all",
                    selectedIngredients.has(i)
                      ? "bg-fire-500/10 border border-fire-500/20"
                      : "bg-surface-200/50 border border-transparent opacity-50"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0",
                    selectedIngredients.has(i) ? "bg-fire-500 border-fire-500" : "border-white/20"
                  )}>
                    {selectedIngredients.has(i) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="flex-1 text-sm text-gray-200">{ing.name}</span>
                  <span className="text-sm text-gray-500 font-medium" dir="ltr">
                    {ing.amount || ""} {ing.unit || ""}
                  </span>
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-white/[0.06]">
              <button
                onClick={handleShoppingConfirm}
                disabled={selectedIngredients.size === 0 || shoppingLoading}
                className="w-full py-3.5 rounded-2xl btn-fire font-semibold text-white disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {shoppingLoading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><ShoppingCart className="w-4 h-4" />הוסיפי {selectedIngredients.size} מצרכים</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 mb-5 transition-colors text-sm">
        <ArrowRight className="w-4 h-4" />
        חזרה
      </button>

      {/* Hero image */}
      <div className="relative aspect-video rounded-3xl overflow-hidden bg-surface-200 mb-6 animate-fade-up">
        {recipe.image_url ? (
          <Image src={recipe.image_url} alt={recipe.title} fill className="object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <ChefHat className="w-16 h-16 text-gray-700" />
          </div>
        )}
        {recipe.kosher_type && (
          <span className="absolute top-3 right-3 badge bg-black/60 text-gray-300 backdrop-blur-sm">
            {kosherLabels[recipe.kosher_type]}
          </span>
        )}
      </div>

      {/* Author + actions */}
      <div className="flex items-center justify-between mb-4 animate-fade-up" style={{ animationDelay: "60ms" }}>
        <Link href={`/profile/${recipe.author.username}`} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 rounded-full bg-fire-500/20 flex items-center justify-center text-fire-300 font-bold text-sm">
            {recipe.author.username[0].toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-200">{recipe.author.full_name || recipe.author.username}</p>
            <p className="text-xs text-gray-500">@{recipe.author.username}</p>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          <button onClick={toggleLike} className="p-2 rounded-xl hover:bg-white/[0.06] transition-colors">
            <Heart className={cn("w-5 h-5", liked ? "fill-red-500 text-red-500" : "text-gray-500")} />
          </button>
          <span className="text-sm text-gray-500 min-w-[1.5rem]">{likesCount}</span>
          <button onClick={toggleSave} className="p-2 rounded-xl hover:bg-white/[0.06] transition-colors">
            <Bookmark className={cn("w-5 h-5", saved ? "fill-fire-400 text-fire-400" : "text-gray-500")} />
          </button>
          {user?.id === recipe.author.id && (
            <>
              <Link href={`/recipe/${recipe.id}/edit`} className="p-2 rounded-xl hover:bg-white/[0.06] transition-colors text-gray-500 hover:text-fire-300">
                <Pencil className="w-5 h-5" />
              </Link>
              <button onClick={handleDelete} disabled={deleting} className="p-2 rounded-xl hover:bg-white/[0.06] transition-colors text-gray-500 hover:text-red-400">
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Title + description */}
      <div className="mb-4 animate-fade-up" style={{ animationDelay: "80ms" }}>
        <h1 className="font-display text-2xl font-bold text-gray-100 mb-2">{recipe.title}</h1>
        {recipe.description && <p className="text-gray-400 leading-relaxed">{recipe.description}</p>}
      </div>

      {/* Rating */}
      <div className="mb-5 animate-fade-up" style={{ animationDelay: "100ms" }}>
        <StarRating rating={avgRating} count={ratingsCount} interactive userRating={userRating} onRate={handleRate} />
      </div>

      {/* Info chips */}
      <div className="flex flex-wrap gap-2 mb-6 animate-fade-up" style={{ animationDelay: "120ms" }}>
        {totalTime > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-200 border border-white/[0.06] text-sm text-gray-400">
            <Clock className="w-3.5 h-3.5 text-fire-400" /> {totalTime} דק׳
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-200 border border-white/[0.06] text-sm text-gray-400">
          <Users className="w-3.5 h-3.5 text-fire-400" /> {recipe.servings} סועדים
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-200 border border-white/[0.06] text-sm text-gray-400">
          {difficultyLabels[recipe.difficulty] || recipe.difficulty}
        </span>
      </div>

      {/* CTA buttons */}
      <div className="grid grid-cols-3 gap-3 mb-8 animate-fade-up" style={{ animationDelay: "140ms" }}>
        <button
          onClick={() => setCookingMode(true)}
          className="flex flex-col items-center gap-2 py-4 rounded-2xl btn-fire font-semibold text-sm"
        >
          <CookingPot className="w-5 h-5" />
          מצב בישול
        </button>
        <button
          onClick={openShoppingModal}
          className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-surface-200 border border-white/[0.06] text-gray-300 hover:border-fire-500/30 hover:text-fire-300 transition-all text-sm font-semibold"
        >
          <ShoppingCart className="w-5 h-5" />
          קניות
        </button>
        <button
          onClick={handleShare}
          className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-surface-200 border border-white/[0.06] text-gray-300 hover:border-white/[0.1] transition-all text-sm font-semibold"
        >
          <Share2 className="w-5 h-5" />
          שיתוף
        </button>
      </div>

      {/* Ingredients */}
      <section className="mb-8 animate-fade-up" style={{ animationDelay: "160ms" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-gray-100">מצרכים</h2>
          <div className="flex items-center gap-2 bg-surface-200 border border-white/[0.06] rounded-xl px-3 py-1.5">
            <button onClick={() => handleServingsChange(-1)} className="p-0.5 hover:text-fire-300 text-gray-500 transition-colors">
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-gray-200 min-w-[5rem] text-center">{currentServings} סועדים</span>
            <button onClick={() => handleServingsChange(1)} className="p-0.5 hover:text-fire-300 text-gray-500 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="card-surface divide-y divide-white/[0.04]">
          {scaledIngredients.map((ing: any, i: number) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <span className="font-semibold text-fire-400 min-w-[5rem] text-sm text-left" dir="ltr">
                {ing.amount} {ing.unit || ""}
              </span>
              <span className="text-gray-200 text-sm">{ing.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Instructions */}
      <section className="mb-8 animate-fade-up" style={{ animationDelay: "180ms" }}>
        <h2 className="font-display text-lg font-bold text-gray-100 mb-4">שלבי הכנה</h2>
        <ol className="space-y-3">
          {recipe.instructions.map((inst: any) => (
            <li key={inst.step} className="flex items-start gap-3 card-surface p-4">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-fire-500/15 text-fire-300 flex items-center justify-center text-sm font-bold mt-0.5">
                {inst.step}
              </span>
              <p className="text-gray-300 leading-relaxed text-sm flex-1">{inst.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Comments */}
      <section className="animate-fade-up" style={{ animationDelay: "200ms" }}>
        <h2 className="font-display text-lg font-bold text-gray-100 mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-fire-400" />
          תגובות ({comments.length})
        </h2>

        {user && (
          <form onSubmit={handleComment} className="flex gap-2 mb-5">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="הוסיפי תגובה..."
              className="input-dark flex-1"
            />
            <button
              type="submit"
              disabled={sendingComment || !newComment.trim()}
              className="px-4 rounded-xl btn-fire disabled:opacity-40 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="space-y-3">
          {comments.map((comment: any) => (
            <div key={comment.id} className="card-surface p-4">
              <div className="flex items-center justify-between mb-2">
                <Link href={`/profile/${comment.author.username}`} className="text-sm font-semibold text-fire-400 hover:text-fire-300 transition-colors">
                  {comment.author.full_name || comment.author.username}
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">{new Date(comment.created_at).toLocaleDateString("he-IL")}</span>
                  {user && (
                    <button onClick={() => recipesApi.reportComment(recipe.id, comment.id)} className="p-1 text-gray-700 hover:text-red-400 transition-colors">
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{comment.content}</p>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-center text-gray-600 py-8 text-sm">אין תגובות עדיין — היי הראשונה!</p>
          )}
        </div>
      </section>
    </div>
  );
}
