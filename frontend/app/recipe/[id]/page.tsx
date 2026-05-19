"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { recipesApi, shoppingApi, collectionsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Button from "@/components/ui/Button";
import StarRating from "@/components/ui/StarRating";
import {
  Heart, Bookmark, Clock, Users, ChefHat, ArrowRight,
  Minus, Plus, CookingPot, Check, Flag, MessageCircle, Send,
  ShoppingCart, Share2, FolderPlus, Star, X, Pencil, Trash2,
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

  // Servings calculator
  const [servingMultiplier, setServingMultiplier] = useState(1);

  // Cooking mode
  const [cookingMode, setCookingMode] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Ratings
  const [avgRating, setAvgRating] = useState(0);
  const [ratingsCount, setRatingsCount] = useState(0);
  const [userRating, setUserRating] = useState<number | null>(null);

  // Delete
  const [deleting, setDeleting] = useState(false);

  // Shopping list modal
  const [shoppingModalOpen, setShoppingModalOpen] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState<Set<number>>(new Set());
  const [shoppingLoading, setShoppingLoading] = useState(false);
  const [shoppingToast, setShoppingToast] = useState("");

  // Comments
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);

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
        setServingMultiplier(1);

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

  // Wake Lock for cooking mode
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator && cookingMode) {
          wakeLock = await (navigator as any).wakeLock.request("screen");
        }
      } catch {}
    };
    if (cookingMode) requestWakeLock();
    return () => {
      if (wakeLock) wakeLock.release();
    };
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
    const currentServings = recipe.servings * servingMultiplier;
    const newServings = Math.max(1, currentServings + delta);
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

  const toggleStep = (step: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(step)) next.delete(step);
      else next.add(step);
      return next;
    });
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
      setShoppingToast(`${toAdd.length} מצרכים נוספו לרשימת הקניות`);
      setTimeout(() => setShoppingToast(""), 3500);
    } catch {
      setShoppingToast("שגיאה בהוספה לרשימת קניות");
      setTimeout(() => setShoppingToast(""), 3500);
    }
    setShoppingLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm("למחוק את המתכון? פעולה זו בלתי הפיכה.")) return;
    setDeleting(true);
    try {
      await recipesApi.delete(recipe.id);
      router.push("/profile/" + user?.username);
    } catch {
      setDeleting(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `${recipe.title} - RecipeApp`;
    if (navigator.share) {
      try { await navigator.share({ title: text, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setShoppingToast("הקישור הועתק!");
      setTimeout(() => setShoppingToast(""), 3000);
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

  const handleReport = async (commentId: number) => {
    await recipesApi.reportComment(recipe.id, commentId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!recipe) return null;

  const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0);
  const currentServings = Math.round(recipe.servings * servingMultiplier);

  // Cooking mode UI
  if (cookingMode) {
    return (
      <div className="fixed inset-0 z-[100] bg-white overflow-auto">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold">{recipe.title}</h1>
            <Button variant="secondary" size="sm" onClick={() => setCookingMode(false)}>
              יציאה ממצב בישול
            </Button>
          </div>

          <div className="mb-8">
            <h2 className="font-bold text-lg mb-3">מצרכים ({currentServings} סועדים)</h2>
            <ul className="space-y-2">
              {scaledIngredients.map((ing: any, i: number) => (
                <li key={i} className="flex items-center gap-2 text-lg py-1 border-b border-gray-100">
                  <span className="font-medium text-primary-600 min-w-[4rem] text-left" dir="ltr">
                    {ing.amount} {ing.unit || ""}
                  </span>
                  <span>{ing.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-lg mb-3">שלבי הכנה</h2>
            <ol className="space-y-4">
              {recipe.instructions.map((inst: any) => (
                <li
                  key={inst.step}
                  onClick={() => toggleStep(inst.step)}
                  className={cn(
                    "p-4 rounded-xl border-2 cursor-pointer transition-all text-lg",
                    completedSteps.has(inst.step)
                      ? "border-green-400 bg-green-50 line-through text-gray-400"
                      : "border-gray-200 bg-white"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                        completedSteps.has(inst.step)
                          ? "bg-green-500 text-white"
                          : "bg-primary-100 text-primary-600"
                      )}
                    >
                      {completedSteps.has(inst.step) ? <Check className="w-4 h-4" /> : inst.step}
                    </span>
                    <p className="flex-1 leading-relaxed">{inst.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">

      {/* Toast notification */}
      {shoppingToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-2xl bg-surface-100 border border-white/10 text-sm text-gray-200 shadow-xl animate-fade-up">
          {shoppingToast}
        </div>
      )}

      {/* Shopping list ingredient selection modal */}
      {shoppingModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShoppingModalOpen(false)} />
          <div className="relative w-full sm:max-w-md bg-surface-100 rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
              <h3 className="font-bold text-gray-100">בחרי מצרכים לקנייה</h3>
              <button onClick={() => setShoppingModalOpen(false)} className="p-1.5 rounded-xl hover:bg-white/10 transition-colors text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4 space-y-1">
              <button
                onClick={() => {
                  if (selectedIngredients.size === scaledIngredients.length)
                    setSelectedIngredients(new Set());
                  else
                    setSelectedIngredients(new Set(scaledIngredients.map((_: any, i: number) => i)));
                }}
                className="w-full text-right text-xs text-fire-400 hover:text-fire-300 mb-2 px-1"
              >
                {selectedIngredients.size === scaledIngredients.length ? "בטלי הכל" : "בחרי הכל"}
              </button>

              {scaledIngredients.map((ing: any, i: number) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedIngredients((prev) => {
                      const next = new Set(prev);
                      if (next.has(i)) next.delete(i); else next.add(i);
                      return next;
                    });
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl text-right transition-all",
                    selectedIngredients.has(i)
                      ? "bg-fire-500/10 border border-fire-500/20"
                      : "bg-surface-200/50 border border-transparent opacity-50"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all",
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
                className="w-full py-3.5 rounded-2xl btn-fire font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {shoppingLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    הוסיפי {selectedIngredients.size} מצרכים לרשימה
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4 transition-colors"
      >
        <ArrowRight className="w-4 h-4" />
        <span className="text-sm">חזרה</span>
      </button>

      {/* Hero image */}
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 mb-6">
        {recipe.image_url ? (
          <Image src={recipe.image_url} alt={recipe.title} fill className="object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <ChefHat className="w-16 h-16 text-gray-300" />
          </div>
        )}
      </div>

      {/* Meta bar */}
      <div className="flex items-center justify-between mb-4">
        <Link
          href={`/profile/${recipe.author.username}`}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm">
            {recipe.author.username[0].toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium">{recipe.author.full_name || recipe.author.username}</p>
            <p className="text-xs text-gray-400">@{recipe.author.username}</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <button onClick={toggleLike} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <Heart className={cn("w-5 h-5", liked ? "fill-red-500 text-red-500" : "text-gray-500")} />
          </button>
          <span className="text-sm text-gray-500">{likesCount}</span>
          <button onClick={toggleSave} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <Bookmark className={cn("w-5 h-5", saved ? "fill-primary-500 text-primary-500" : "text-gray-500")} />
          </button>
          {user?.id === recipe.author.id && (
            <>
              <Link href={`/recipe/${recipe.id}/edit`} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500 hover:text-blue-500">
                <Pencil className="w-5 h-5" />
              </Link>
              <button onClick={handleDelete} disabled={deleting} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500 hover:text-red-500">
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">{recipe.title}</h1>
      {recipe.description && <p className="text-gray-600 mb-4">{recipe.description}</p>}

      {/* Rating */}
      <div className="flex items-center gap-4 mb-4">
        <StarRating
          rating={avgRating}
          count={ratingsCount}
          interactive
          userRating={userRating}
          onRate={handleRate}
        />
      </div>

      {/* Info chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {totalTime > 0 && (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 text-sm text-gray-600">
            <Clock className="w-4 h-4" /> {totalTime} דק׳
          </span>
        )}
        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 text-sm text-gray-600">
          <Users className="w-4 h-4" /> {recipe.servings} סועדים
        </span>
        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 text-sm text-gray-600">
          {difficultyLabels[recipe.difficulty] || recipe.difficulty}
        </span>
        {recipe.kosher_type && (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 text-sm text-gray-600">
            {kosherLabels[recipe.kosher_type] || recipe.kosher_type}
          </span>
        )}
      </div>

      {/* Cooking mode button */}
      {/* Action buttons */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Button onClick={() => setCookingMode(true)} variant="primary" size="lg">
          <CookingPot className="w-5 h-5 ml-2" />
          בישול
        </Button>
        <Button onClick={openShoppingModal} variant="secondary" size="lg">
          <ShoppingCart className="w-5 h-5 ml-2" />
          קניות
        </Button>
        <Button onClick={handleShare} variant="secondary" size="lg">
          <Share2 className="w-5 h-5 ml-2" />
          שיתוף
        </Button>
      </div>

      {/* Ingredients */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">מצרכים</h2>
          <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-3 py-1.5">
            <button onClick={() => handleServingsChange(-1)} className="p-1 hover:bg-gray-200 rounded-lg">
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium min-w-[5rem] text-center">{currentServings} סועדים</span>
            <button onClick={() => handleServingsChange(1)} className="p-1 hover:bg-gray-200 rounded-lg">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        <ul className="space-y-2">
          {scaledIngredients.map((ing: any, i: number) => (
            <li key={i} className="flex items-center gap-2 py-2 border-b border-gray-50">
              <span className="font-medium text-primary-600 min-w-[4rem] text-left" dir="ltr">
                {ing.amount} {ing.unit || ""}
              </span>
              <span className="text-gray-700">{ing.name}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Instructions */}
      <section className="mb-8">
        <h2 className="text-lg font-bold mb-4">שלבי הכנה</h2>
        <ol className="space-y-3">
          {recipe.instructions.map((inst: any) => (
            <li key={inst.step} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-gray-100">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold">
                {inst.step}
              </span>
              <p className="text-gray-700 leading-relaxed">{inst.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Comments */}
      <section>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          תגובות ({comments.length})
        </h2>

        {user && (
          <form onSubmit={handleComment} className="flex gap-2 mb-4">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="הוסיפו תגובה..."
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500"
            />
            <Button type="submit" loading={sendingComment} size="md">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        )}

        <div className="space-y-3">
          {comments.map((comment: any) => (
            <div key={comment.id} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <Link
                  href={`/profile/${comment.author.username}`}
                  className="text-sm font-medium hover:text-primary-500 transition-colors"
                >
                  @{comment.author.username}
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {new Date(comment.created_at).toLocaleDateString("he-IL")}
                  </span>
                  {user && (
                    <button
                      onClick={() => handleReport(comment.id)}
                      className="p-1 text-gray-300 hover:text-red-400 transition-colors"
                      title="דיווח על תגובה פוגענית"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-gray-700 text-sm">{comment.content}</p>
            </div>
          ))}

          {comments.length === 0 && (
            <p className="text-center text-gray-400 py-6">אין תגובות עדיין</p>
          )}
        </div>
      </section>
    </div>
  );
}
