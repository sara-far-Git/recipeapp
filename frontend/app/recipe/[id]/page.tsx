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
  ShoppingCart, Share2, Star, X, Pencil, Trash2, Timer,
} from "lucide-react";

const HIDDEN_AUTHORS = new Set(["שרי פרקש", "רבקי פרקש"]);
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
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerTotal, setTimerTotal] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [ratingsCount, setRatingsCount] = useState(0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [shoppingModalOpen, setShoppingModalOpen] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState<Set<number>>(new Set());
  const [shoppingLoading, setShoppingLoading] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

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
  } catch { router.push("/"); }
  finally { setLoading(false); }
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

  useEffect(() => {
  if (!timerRunning || timerRemaining <= 0) return;
  const id = setInterval(() => {
  setTimerRemaining((prev) => {
  if (prev <= 1) { setTimerRunning(false); return 0; }
  return prev - 1;
  });
  }, 1000);
  return () => clearInterval(id);
  }, [timerRunning, timerRemaining]);

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
  setLiked(data.liked); setLikesCount(data.likes_count);
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
  setUserRating(score); setAvgRating(data.average_rating); setRatingsCount(data.ratings_count);
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
  if (lists.length === 0) { const { data: newList } = await shoppingApi.create("רשימת קניות"); listId = newList.id; }
  else { listId = lists[0].id; }
  const { data: currentList } = await shoppingApi.get(listId);
  const existing = currentList.items || [];
  const toAdd = scaledIngredients
  .filter((_: any, i: number) => selectedIngredients.has(i))
  .map((ing: any) => ({ name: ing.name, amount: ing.amount || 0, unit: ing.unit || null, checked: false, from_recipe: recipe.title }));
  await shoppingApi.updateItems(listId, [...existing, ...toAdd]);
  setShoppingModalOpen(false);
  showToast(`${toAdd.length} מצרכים נוספו לרשימה`);
  } catch { showToast("שגיאה בהוספה לרשימת קניות"); }
  setShoppingLoading(false);
  };

  const handleDelete = async () => {
  if (!confirm("למחוק את המתכון? פעולה זו בלתי הפיכה.")) return;
  setDeleting(true);
  try { await recipesApi.delete(recipe.id); router.push("/profile/" + user?.username); }
  catch { setDeleting(false); }
  };

  const handleShare = async () => {
  const url = window.location.href;
  if (navigator.share) { try { await navigator.share({ title: recipe.title, url }); } catch {} }
  else { await navigator.clipboard.writeText(url); showToast("הקישור הועתק!"); }
  };

  const handleComment = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!newComment.trim() || !user) return;
  setSendingComment(true);
  try {
  const { data } = await recipesApi.addComment(recipe.id, newComment.trim());
  setComments((prev) => [data, ...prev]); setNewComment("");
  } catch {}
  setSendingComment(false);
  };

  if (loading) {
  return (
  <div className="flex items-center justify-center min-h-[60vh]">
  <div className="w-8 h-8 animate-spin rounded-full border-4 border-surface-400 border-t-cinnamon-500" />
  </div>
  );
  }
  if (!recipe) return null;

  const hideAuthor = HIDDEN_AUTHORS.has(recipe.author?.full_name);
  const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0);
  const currentServings = Math.round(recipe.servings * servingMultiplier);

  // ── Cooking mode — intentionally dark for kitchen readability ──────────────
  if (cookingMode) {
  const fmtTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  const toggleIngredient = (i: number) => setCheckedIngredients((prev) => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
  const setTimer = (mins: number) => { setTimerRemaining(mins * 60); setTimerTotal(mins * 60); setTimerRunning(false); };

  return (
  <div className="fixed inset-0 z-[100] overflow-auto" style={{ background: "#1a1008" }}>
  <div className="max-w-2xl mx-auto px-4 py-6 pb-12">

  {/* Header */}
  <div className="flex items-center justify-between mb-6">
  <h1 className="text-xl font-bold text-amber-100 flex-1 ml-4" style={{ fontFamily: "'Heebo', sans-serif" }}>{recipe.title}</h1>
  <button onClick={() => setCookingMode(false)}
  className="px-4 py-2 bg-amber-900/40 border border-amber-700/40 text-amber-200 text-sm hover:bg-amber-900/60 transition-all flex-shrink-0">
  יציאה ממצב הכנה
  </button>
  </div>

  {/* Timer */}
  <div className="bg-amber-950/60 border border-amber-800/30 p-5 mb-5">
  <h2 className="font-bold text-amber-100 mb-3 flex items-center gap-2 text-sm">
  <Timer className="w-4 h-4 text-amber-400" /> טיימר
  </h2>
  <div className="flex gap-2 mb-4 flex-wrap">
  {[5, 10, 15, 20, 30].map((m) => (
  <button key={m} onClick={() => setTimer(m)}
  className="px-3 py-1.5 text-xs font-semibold bg-amber-900/60 border border-amber-700/40 text-amber-300 hover:bg-amber-800/60 transition-all">
  {m} דק׳
  </button>
  ))}
  </div>
  <div className="text-center mb-3">
  <span className="text-5xl font-mono tabular-nums tracking-widest"
  style={{ color: timerRemaining > 0 && timerRunning && timerRemaining <= 60 ? "#f87171" : "#fde68a" }}>
  {fmtTime(timerRemaining)}
  </span>
  </div>
  {timerTotal > 0 && (
  <div className="h-1 bg-amber-900/60 mb-4">
  <div className="h-full bg-amber-500 transition-all duration-1000"
  style={{ width: `${(timerRemaining / timerTotal) * 100}%` }} />
  </div>
  )}
  <div className="flex gap-2 justify-center">
  <button onClick={() => setTimerRunning((r) => !r)} disabled={timerRemaining === 0}
  className="px-6 py-2 text-sm font-semibold bg-amber-700 text-white hover:bg-amber-600 transition-all disabled:opacity-40">
  {timerRunning ? "עצירה" : "התחל"}
  </button>
  <button onClick={() => { setTimerRemaining(timerTotal); setTimerRunning(false); }} disabled={timerTotal === 0}
  className="px-4 py-2 text-sm bg-amber-900/60 border border-amber-700/40 text-amber-300 hover:bg-amber-800/60 transition-all disabled:opacity-40">
  איפוס
  </button>
  </div>
  </div>

  {/* Ingredients — checkable */}
  <div className="bg-amber-950/60 border border-amber-800/30 p-5 mb-5">
  <div className="flex items-center justify-between mb-4">
  <h2 className="font-bold text-amber-100 flex items-center gap-2 text-sm">
  <Users className="w-4 h-4 text-amber-400" /> מצרכים ({currentServings} סועדים)
  </h2>
  {checkedIngredients.size > 0 && (
  <button onClick={() => setCheckedIngredients(new Set())}
  className="text-xs text-amber-500 hover:text-amber-400 transition-colors">
  נקה הכל
  </button>
  )}
  </div>
  <ul className="space-y-1">
  {scaledIngredients.map((ing: any, i: number) => (
  <li key={i} onClick={() => toggleIngredient(i)}
  className={cn("flex items-center gap-3 py-2.5 cursor-pointer select-none border-b border-amber-900/40 last:border-b-0 transition-opacity",
  checkedIngredients.has(i) && "opacity-40")}>
  <div className={cn("w-5 h-5 flex-shrink-0 border-2 flex items-center justify-center transition-all",
  checkedIngredients.has(i) ? "bg-amber-600 border-amber-600" : "border-amber-700/60")}>
  {checkedIngredients.has(i) && <Check className="w-3 h-3 text-white" />}
  </div>
  <span className={cn("font-semibold text-amber-400 min-w-[5rem] text-sm", checkedIngredients.has(i) && "line-through")} dir="ltr">
  {ing.amount} {ing.unit || ""}
  </span>
  <span className={cn("text-amber-100", checkedIngredients.has(i) && "line-through")}>{ing.name}</span>
  </li>
  ))}
  </ul>
  </div>

  {/* Steps */}
  <h2 className="font-bold text-amber-100 mb-4 text-sm">שלבי הכנה</h2>
  <ol className="space-y-3">
  {recipe.instructions.map((inst: any) => (
  <li key={inst.step}
  onClick={() => setCompletedSteps((prev) => { const n = new Set(prev); if (n.has(inst.step)) n.delete(inst.step); else n.add(inst.step); return n; })}
  className={cn("p-4 border-2 cursor-pointer transition-all select-none",
  completedSteps.has(inst.step) ? "border-amber-600/40 bg-amber-800/20" : "border-amber-900/40 bg-amber-950/40 hover:border-amber-800/40")}>
  <div className="flex items-start gap-3">
  <span className={cn("flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
  completedSteps.has(inst.step) ? "bg-amber-600 text-white" : "bg-amber-900/60 text-amber-400")}>
  {completedSteps.has(inst.step) ? <Check className="w-4 h-4" /> : inst.step}
  </span>
  <p className={cn("flex-1 leading-relaxed text-sm", completedSteps.has(inst.step) ? "line-through text-amber-700" : "text-amber-100")}>
  {inst.text}
  </p>
  </div>
  </li>
  ))}
  </ol>

  </div>
  </div>
  );
  }

  // ── Main page ──────────────────────────────────────────────────────────────
  return (
  <div className="max-w-3xl mx-auto">
  {/* Toast */}
  {toast && (
  <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] px-5 py-3  bg-bark-500 text-white text-sm shadow-warm-lg animate-fade-up whitespace-nowrap">
  {toast}
  </div>
  )}

  {/* Shopping modal */}
  {shoppingModalOpen && (
  <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center">
  <div className="absolute inset-0 bg-bark-600/60 backdrop-blur-sm" onClick={() => setShoppingModalOpen(false)} />
  <div className="relative w-full sm:max-w-md bg-surface-50  border border-surface-300 shadow-warm-lg max-h-[80vh] flex flex-col">
  <div className="flex items-center justify-between p-5 border-b border-surface-300">
  <h3 className="font-bold text-bark-500" style={{ fontFamily: "'Heebo', sans-serif" }}>בחרי מצרכים לקנייה</h3>
  <button onClick={() => setShoppingModalOpen(false)} className="p-1.5  hover:bg-surface-200 text-bark-200 transition-colors">
  <X className="w-5 h-5" />
  </button>
  </div>
  <div className="overflow-y-auto flex-1 p-4 space-y-1">
  <button
  onClick={() => setSelectedIngredients(
  selectedIngredients.size === scaledIngredients.length
  ? new Set() : new Set(scaledIngredients.map((_: any, i: number) => i))
  )}
  className="w-full text-right text-xs text-cinnamon-600 hover:text-cinnamon-500 mb-2 px-1 transition-colors">
  {selectedIngredients.size === scaledIngredients.length ? "בטלי הכל" : "בחרי הכל"}
  </button>
  {scaledIngredients.map((ing: any, i: number) => (
  <button key={i}
  onClick={() => setSelectedIngredients((prev) => { const n = new Set(prev); if (n.has(i)) n.delete(i); else n.add(i); return n; })}
  className={cn("w-full flex items-center gap-3 p-3  text-right transition-all",
  selectedIngredients.has(i) ? "bg-cinnamon-50 border border-cinnamon-200" : "bg-surface-100 border border-transparent opacity-60")}>
  <div className={cn("w-5 h-5  border-2 flex items-center justify-center flex-shrink-0",
  selectedIngredients.has(i) ? "bg-cinnamon-500 border-cinnamon-500" : "border-surface-400")}>
  {selectedIngredients.has(i) && <Check className="w-3 h-3 text-white" />}
  </div>
  <span className="flex-1 text-sm text-bark-500">{ing.name}</span>
  <span className="text-sm text-bark-300 font-medium" dir="ltr">{ing.amount || ""} {ing.unit || ""}</span>
  </button>
  ))}
  </div>
  <div className="p-4 border-t border-surface-300">
  <button onClick={handleShoppingConfirm} disabled={selectedIngredients.size === 0 || shoppingLoading}
  className="w-full py-3.5  btn-fire font-semibold disabled:opacity-40 flex items-center justify-center gap-2">
  {shoppingLoading
  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
  : <><ShoppingCart className="w-4 h-4" />הוסיפי {selectedIngredients.size} מצרכים</>}
  </button>
  </div>
  </div>
  </div>
  )}

  {/* Back */}
  <button onClick={() => router.back()}
  className="flex items-center gap-1.5 text-bark-300 hover:text-cinnamon-500 mb-5 transition-colors text-sm">
  <ArrowRight className="w-4 h-4" /> חזרה
  </button>

  {/* Hero image */}
  <div className="relative  overflow-hidden mb-6 animate-fade-up" style={{ aspectRatio: "5/3", background: "#e8dcc4" }}>
  {recipe.image_url ? (
  <Image src={recipe.image_url} alt={recipe.title} fill className="object-cover" />
  ) : (
  <div className="flex items-center justify-center h-full">
  <ChefHat className="w-16 h-16 text-bark-100" />
  </div>
  )}
  {recipe.kosher_type && (
  <span className="absolute top-4 right-4 px-3 py-1  bg-surface-50/80 backdrop-blur-sm text-xs font-semibold text-bark-500">
  {kosherLabels[recipe.kosher_type]}
  </span>
  )}
  </div>

  {/* Meta eyebrow */}
  <div className="text-center mb-4 animate-fade-up" style={{ animationDelay: "40ms" }}>
  <div className="inline-flex items-center gap-2 text-sm font-semibold text-cinnamon-500"
  style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}>
  {!hideAuthor && <>{recipe.author.full_name || recipe.author.username}</>}
  {!hideAuthor && totalTime > 0 && <span className="text-bark-100 font-normal">·</span>}
  {totalTime > 0 && <>{totalTime} דק׳</>}
  {recipe.kosher_type && <><span className="text-bark-100 font-normal">·</span>{kosherLabels[recipe.kosher_type]}</>}
  </div>
  </div>

  {/* Title */}
  <div className="text-center mb-5 animate-fade-up" style={{ animationDelay: "60ms" }}>
  <h1 className="text-bark-500 mb-3"
  style={{ fontFamily: "'Heebo', sans-serif", fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.1 }}>
  {recipe.title}
  </h1>
  {recipe.description && (
  <p className="text-bark-300 max-w-xl mx-auto text-base leading-relaxed"
  style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}>
  {recipe.description}
  </p>
  )}
  </div>

  {/* Rating */}
  <div className="flex justify-center mb-6 animate-fade-up" style={{ animationDelay: "80ms" }}>
  <StarRating rating={avgRating} count={ratingsCount} interactive userRating={userRating} onRate={handleRate} />
  </div>

  {/* Action row: author + like/save/share */}
  <div className="flex items-center justify-between mb-6 pb-6 animate-fade-up" style={{ borderBottom: "1px solid #e8dcc4", animationDelay: "100ms" }}>
  {hideAuthor ? <div /> : (
  <Link href={`/profile/${recipe.author.username}`}
  className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
  style={{ background: "#8b3a1f" }}>
  {recipe.author.username[0].toUpperCase()}
  </div>
  <div>
  <p className="text-sm font-semibold text-bark-500">{recipe.author.full_name || recipe.author.username}</p>
  <p className="text-xs text-bark-200">@{recipe.author.username}</p>
  </div>
  </Link>
  )}

  <div className="flex items-center gap-1">
  <button onClick={toggleLike} className="p-2.5  hover:bg-surface-200 transition-colors group">
  <Heart className={cn("w-5 h-5 transition-all", liked ? "fill-cinnamon-500 text-cinnamon-500" : "text-bark-200 group-hover:text-cinnamon-400")} />
  </button>
  <span className="text-sm text-bark-300 min-w-[1.5rem]">{likesCount}</span>
  <button onClick={toggleSave} className="p-2.5  hover:bg-surface-200 transition-colors group">
  <Bookmark className={cn("w-5 h-5 transition-all", saved ? "fill-cinnamon-500 text-cinnamon-500" : "text-bark-200 group-hover:text-cinnamon-400")} />
  </button>
  <button onClick={handleShare} className="p-2.5  hover:bg-surface-200 transition-colors text-bark-200 hover:text-bark-400">
  <Share2 className="w-5 h-5" />
  </button>
  {user?.id === recipe.author.id && (
  <>
  <Link href={`/recipe/${recipe.id}/edit`}
  className="p-2.5  hover:bg-surface-200 transition-colors text-bark-200 hover:text-cinnamon-500">
  <Pencil className="w-5 h-5" />
  </Link>
  <button onClick={handleDelete} disabled={deleting}
  className="p-2.5  hover:bg-red-50 transition-colors text-bark-200 hover:text-red-500">
  <Trash2 className="w-5 h-5" />
  </button>
  </>
  )}
  </div>
  </div>

  {/* Stats strip — non-interactive, visually distinct from buttons */}
  <div className="grid grid-cols-3 gap-3 mb-8 animate-fade-up" style={{ animationDelay: "120ms" }}>
  {totalTime > 0 && (
  <div className="p-4 text-center" style={{ background: "#ede7d6", border: "1px solid #ddd0b4" }}>
  <Clock className="w-5 h-5 text-cinnamon-500 mx-auto mb-1.5" />
  <div className="text-sm font-bold text-bark-500">{totalTime} דק׳</div>
  <div className="text-xs text-bark-200">זמן כולל</div>
  </div>
  )}
  <div className="p-4 text-center" style={{ background: "#ede7d6", border: "1px solid #ddd0b4" }}>
  <Users className="w-5 h-5 text-cinnamon-500 mx-auto mb-1.5" />
  <div className="text-sm font-bold text-bark-500">{recipe.servings}</div>
  <div className="text-xs text-bark-200">סועדים</div>
  </div>
  <div className="p-4 text-center" style={{ background: "#ede7d6", border: "1px solid #ddd0b4" }}>
  <ChefHat className="w-5 h-5 text-cinnamon-500 mx-auto mb-1.5" />
  <div className="text-sm font-bold text-bark-500">{difficultyLabels[recipe.difficulty] || "בינוני"}</div>
  <div className="text-xs text-bark-200">רמת קושי</div>
  </div>
  </div>

  {/* CTA buttons — clearly interactive (btn-fire / btn-outline) */}
  <div className="grid grid-cols-3 gap-3 mb-10 animate-fade-up" style={{ animationDelay: "140ms" }}>
  <button onClick={() => setCookingMode(true)}
  className="flex flex-col items-center gap-2 py-4 btn-fire font-semibold text-sm w-full">
  <CookingPot className="w-5 h-5" /> מצב הכנה
  </button>
  <button onClick={openShoppingModal}
  className="flex flex-col items-center gap-2 py-4 w-full font-semibold text-sm btn-outline">
  <ShoppingCart className="w-5 h-5" /> קניות
  </button>
  <button onClick={handleShare}
  className="flex flex-col items-center gap-2 py-4 w-full font-semibold text-sm btn-outline">
  <Share2 className="w-5 h-5" /> שיתוף
  </button>
  </div>

  {/* Ingredients */}
  <section className="mb-10 animate-fade-up" style={{ animationDelay: "160ms" }}>
  <div className="flex items-center justify-between mb-4">
  <h2 className="font-bold text-bark-500 text-xl" style={{ fontFamily: "'Heebo', sans-serif", letterSpacing: "-0.02em" }}>
  מצרכים
  </h2>
  <div className="flex items-center gap-2 card-surface px-3 py-1.5">
  <button onClick={() => handleServingsChange(-1)} className="p-0.5 hover:text-cinnamon-500 text-bark-200 transition-colors">
  <Minus className="w-4 h-4" />
  </button>
  <span className="text-sm font-semibold text-bark-500 min-w-[5rem] text-center">{currentServings} סועדים</span>
  <button onClick={() => handleServingsChange(1)} className="p-0.5 hover:text-cinnamon-500 text-bark-200 transition-colors">
  <Plus className="w-4 h-4" />
  </button>
  </div>
  </div>
  <div className="card-surface divide-y divide-surface-300">
  {scaledIngredients.map((ing: any, i: number) => (
  <div key={i} className="flex items-center gap-3 px-5 py-3.5">
  <span className="w-2 h-2 rounded-full bg-cinnamon-500 flex-shrink-0" />
  <span className="font-semibold text-cinnamon-500 min-w-[5rem] text-sm" dir="ltr">
  {ing.amount} {ing.unit || ""}
  </span>
  <span className="text-bark-400 text-sm">{ing.name}</span>
  </div>
  ))}
  </div>
  </section>

  {/* Instructions */}
  <section className="mb-10 animate-fade-up" style={{ animationDelay: "180ms" }}>
  <h2 className="font-bold text-bark-500 text-xl mb-5" style={{ fontFamily: "'Heebo', sans-serif", letterSpacing: "-0.02em" }}>
  אופן ההכנה
  </h2>
  <ol className="space-y-4">
  {recipe.instructions.map((inst: any) => (
  <li key={inst.step} className="flex items-start gap-4 card-surface p-5">
  <span className="flex-shrink-0 w-9 h-9 rounded-full bg-cinnamon-50 text-cinnamon-500 flex items-center justify-center text-sm font-bold border border-cinnamon-200 mt-0.5">
  {inst.step}
  </span>
  <p className="text-bark-400 leading-relaxed flex-1" style={{ lineHeight: 1.7 }}>{inst.text}</p>
  </li>
  ))}
  </ol>
  </section>

  {/* Comments */}
  <section className="animate-fade-up" style={{ animationDelay: "200ms" }}>
  <h2 className="font-bold text-bark-500 text-xl mb-5 flex items-center gap-2"
  style={{ fontFamily: "'Heebo', sans-serif", letterSpacing: "-0.02em" }}>
  <MessageCircle className="w-5 h-5 text-cinnamon-500" />
  תגובות ({comments.length})
  </h2>

  {user && (
  <form onSubmit={handleComment} className="flex gap-2 mb-5">
  <input value={newComment} onChange={(e) => setNewComment(e.target.value)}
  placeholder="הוסיפי תגובה..." className="input-dark flex-1" />
  <button type="submit" disabled={sendingComment || !newComment.trim()}
  className="px-4  btn-fire disabled:opacity-40 transition-all">
  <Send className="w-4 h-4" />
  </button>
  </form>
  )}

  <div className="space-y-3">
  {comments.map((comment: any) => (
  <div key={comment.id} className="card-surface p-4">
  <div className="flex items-center justify-between mb-2">
  <Link href={`/profile/${comment.author.username}`}
  className="text-sm font-semibold text-cinnamon-500 hover:text-cinnamon-600 transition-colors">
  {comment.author.full_name || comment.author.username}
  </Link>
  <div className="flex items-center gap-2">
  <span className="text-xs text-bark-200">{new Date(comment.created_at).toLocaleDateString("he-IL")}</span>
  {user && (
  <button onClick={() => recipesApi.reportComment(recipe.id, comment.id)}
  className="p-1 text-bark-100 hover:text-red-400 transition-colors">
  <Flag className="w-3.5 h-3.5" />
  </button>
  )}
  </div>
  </div>
  <p className="text-bark-400 text-sm leading-relaxed">{comment.content}</p>
  </div>
  ))}
  {comments.length === 0 && (
  <p className="text-center text-bark-200 py-8 text-sm"
  style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}>
  אין תגובות עדיין — היי הראשונה!
  </p>
  )}
  </div>
  </section>
  </div>
  );
}
