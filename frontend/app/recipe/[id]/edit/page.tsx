"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { recipesApi, uploadApi } from "@/lib/api";
import {
  Upload, Plus, Trash2, GripVertical, ArrowLeft, ArrowRight,
  Check, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Ingredient { amount: number; unit: string; name: string; }
interface Instruction { step: number; text: string; }

const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "קל" },
  { value: "medium", label: "בינוני" },
  { value: "hard", label: "מאתגר" },
];

const KOSHER_OPTIONS = [
  { value: "", label: "לא רלוונטי" },
  { value: "meat", label: "בשרי" },
  { value: "dairy", label: "חלבי" },
  { value: "pareve", label: "פרווה" },
  { value: "non_kosher", label: "לא כשר" },
];

const CATEGORY_OPTIONS = [
  "ראשונות", "עיקריות", "מאפים", "קינוחים", "סלטים", "משקאות",
];


export default function EditRecipePage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [prepTime, setPrepTime] = useState<number | "">("");
  const [cookTime, setCookTime] = useState<number | "">("");
  const [servings, setServings] = useState(4);
  const [difficulty, setDifficulty] = useState("medium");
  const [kosherType, setKosherType] = useState("");
  const [category, setCategory] = useState("");

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [instructions, setInstructions] = useState<Instruction[]>([]);

  useEffect(() => {
  const load = async () => {
  try {
  const { data } = await recipesApi.get(Number(params.id));
  if (user && data.author.id !== user.id) { router.push(`/recipe/${params.id}`); return; }
  setTitle(data.title || "");
  setDescription(data.description || "");
  setImageUrl(data.image_url || "");
  setPrepTime(data.prep_time_minutes || "");
  setCookTime(data.cook_time_minutes || "");
  setServings(data.servings || 4);
  setDifficulty(data.difficulty || "medium");
  setKosherType(data.kosher_type || "");
  setCategory(data.category || "");
  setIngredients(
  data.ingredients?.length
  ? data.ingredients.map((i: any) => ({ amount: i.amount || 0, unit: i.unit || "", name: i.name }))
  : [{ amount: 0, unit: "", name: "" }]
  );
  setInstructions(data.instructions?.length ? data.instructions : [{ step: 1, text: "" }]);
  } catch { router.push("/"); }
  finally { setLoading(false); }
  };
  if (user !== undefined) load();
  }, [params.id, user, router]);

  if (loading) {
  return (
  <div className="flex items-center justify-center min-h-[60vh]">
  <div className="w-8 h-8 animate-spin rounded-full border-4 border-surface-400 border-t-cinnamon-500" />
  </div>
  );
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  setImageUploading(true);
  try { const { data } = await uploadApi.upload(file); setImageUrl(data.url); } catch {}
  setImageUploading(false);
  };

  const addIngredient = () => setIngredients([...ingredients, { amount: 0, unit: "", name: "" }]);
  const removeIngredient = (i: number) => setIngredients(ingredients.filter((_, idx) => idx !== i));
  const updateIngredient = (i: number, field: keyof Ingredient, value: any) => {
  const c = [...ingredients]; c[i] = { ...c[i], [field]: value }; setIngredients(c);
  };
  const addInstruction = () => setInstructions([...instructions, { step: instructions.length + 1, text: "" }]);
  const removeInstruction = (i: number) =>
  setInstructions(instructions.filter((_, idx) => idx !== i).map((inst, idx) => ({ ...inst, step: idx + 1 })));
  const updateInstruction = (i: number, text: string) => {
  const c = [...instructions]; c[i] = { ...c[i], text }; setInstructions(c);
  };

  const handleSubmit = async () => {
  setSubmitting(true);
  try {
  await recipesApi.update(Number(params.id), {
  title, description: description || null, image_url: imageUrl || null,
  prep_time_minutes: prepTime || null, cook_time_minutes: cookTime || null,
  servings, difficulty, kosher_type: kosherType || null, category: category || null,
  ingredients: ingredients.filter((i) => i.name.trim()),
  instructions: instructions.filter((i) => i.text.trim()),
  });
  setSaveSuccess(true);
  setTimeout(() => router.push(`/recipe/${params.id}`), 1200);
  } catch (err: any) {
  const detail = err.response?.data?.detail;
  alert(typeof detail === "string" ? detail : "שגיאה בשמירת המתכון");
  }
  setSubmitting(false);
  };

  return (
  <div className="max-w-2xl md:max-w-3xl mx-auto">
  {saveSuccess && (
  <div className="fixed inset-0 z-[100] bg-bark-600/80 flex items-center justify-center">
  <div className="card-surface p-8 text-center  animate-scale-in">
  <div className="w-16 h-16 rounded-full bg-cinnamon-50 border border-cinnamon-200 flex items-center justify-center mx-auto mb-4">
  <Check className="w-8 h-8 text-cinnamon-500" />
  </div>
  <p className="text-bark-500 font-bold text-lg" style={{ fontFamily: "'Heebo', sans-serif" }}>
  המתכון עודכן בהצלחה!
  </p>
  </div>
  </div>
  )}

  {/* Page header */}
  <div className="text-center mb-10 animate-fade-up">
  <div className="inline-flex items-center gap-3 text-xs font-semibold uppercase mb-4"
  style={{ color: "#5a3e2a", letterSpacing: "0.28em", fontFamily: "'Heebo', sans-serif" }}>
  <span className="inline-block w-10 h-px bg-smoke-200" />
  עריכת מתכון
  <span className="inline-block w-10 h-px bg-smoke-200" />
  </div>
  <h1 className="text-bark-500"
  style={{ fontFamily: "'Heebo', sans-serif", fontSize: "clamp(1.8rem,3.5vw,2.4rem)", fontWeight: 800, letterSpacing: "-0.025em" }}>
  עדכון המתכון
  </h1>
  </div>

  {/* Step indicators */}
  <div className="flex items-center gap-3 mb-8 animate-fade-up">
  {[1, 2, 3].map((s) => (
  <button key={s} onClick={() => setStep(s)} className="flex items-center gap-2 flex-1">
  <div className={cn(
  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 flex-shrink-0",
  step > s ? "bg-cinnamon-50 text-cinnamon-500" :
  step === s ? "bg-cinnamon-500 text-white" :
  "bg-surface-200 text-bark-200"
  )}>
  {step > s ? <Check className="w-4 h-4" /> : s}
  </div>
  <span className={cn("text-sm font-semibold hidden sm:inline", step === s ? "text-bark-500" : "text-bark-200")}>
  {s === 1 ? "פרטים" : s === 2 ? "מצרכים" : "הכנה"}
  </span>
  {s < 3 && <div className={cn("flex-1 h-px", step > s ? "bg-cinnamon-300" : "bg-surface-400")} />}
  </button>
  ))}
  </div>

  {/* Step 1 */}
  {step === 1 && (
  <div className="space-y-6 animate-slide-up opacity-0" style={{ animationFillMode: "forwards" }}>
  <div className="field-row">
  <label className="input-label">כותרת המתכון *</label>
  <input value={title} onChange={(e) => setTitle(e.target.value)}
  placeholder="למשל: עוגת שוקולד קלאסית" className="input-dark" required />
  </div>

  <div className="field-row">
  <label className="input-label">תיאור קצר</label>
  <textarea value={description} onChange={(e) => setDescription(e.target.value)}
  rows={3} className="input-dark resize-none" />
  </div>

  <div>
  <label className="input-label mb-2">תמונה ראשית</label>
  {imageUrl ? (
  <div className="relative  overflow-hidden aspect-video" style={{ background: "#e8dcc4" }}>
  <img src={imageUrl} alt="recipe" className="w-full h-full object-cover" />
  <button onClick={() => setImageUrl("")}
  className="absolute top-3 left-3 p-2 bg-surface-50/80 backdrop-blur-sm  hover:bg-surface-50 transition-colors">
  <Trash2 className="w-4 h-4 text-red-500" />
  </button>
  </div>
  ) : (
  <button onClick={() => fileInputRef.current?.click()} disabled={imageUploading}
  className="w-full aspect-video  border-2 border-dashed border-surface-400 bg-surface-100 flex flex-col items-center justify-center gap-2 text-bark-200 hover:border-cinnamon-300 hover:text-cinnamon-500 transition-all duration-300">
  {imageUploading
  ? <Loader2 className="w-8 h-8 animate-spin text-cinnamon-500" />
  : <><Upload className="w-8 h-8" /><span className="text-sm font-medium">העלי תמונה</span></>}
  </button>
  )}
  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
  </div>

  <div className="grid grid-cols-2 gap-6">
  <div className="field-row">
  <label className="input-label">זמן הכנה (דקות)</label>
  <input type="number" inputMode="numeric" value={prepTime} onChange={(e) => setPrepTime(e.target.value ? Number(e.target.value) : "")}
  min={0} className="input-dark" />
  </div>
  <div className="field-row">
  <label className="input-label">זמן בישול (דקות)</label>
  <input type="number" inputMode="numeric" value={cookTime} onChange={(e) => setCookTime(e.target.value ? Number(e.target.value) : "")}
  min={0} className="input-dark" />
  </div>
  </div>

  <div className="field-row">
  <label className="input-label">כמות סועדים</label>
  <input type="number" inputMode="numeric" value={servings} onChange={(e) => setServings(Number(e.target.value) || 1)}
  min={1} className="input-dark" />
  </div>

  <div>
  <label className="input-label mb-3">רמת קושי</label>
  <div className="flex gap-2">
  {DIFFICULTY_OPTIONS.map((opt) => (
  <button key={opt.value} type="button" onClick={() => setDifficulty(opt.value)}
  className={cn(
  "flex-1 py-4  text-sm font-semibold transition-all duration-300 border",
  difficulty === opt.value
  ? "btn-fire border-transparent text-white"
  : "bg-surface-50 text-bark-300 border-surface-400 hover:border-cinnamon-300 hover:text-cinnamon-500"
  )}>
  {opt.label}
  </button>
  ))}
  </div>
  </div>

  <div className="field-row">
  <label className="input-label">סוג כשרות</label>
  <select value={kosherType} onChange={(e) => setKosherType(e.target.value)} className="input-dark">
  {KOSHER_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
  </select>
  </div>

  <div>
  <label className="input-label mb-3">קטגוריה</label>
  <div className="grid grid-cols-3 gap-2">
  {CATEGORY_OPTIONS.map((cat) => (
  <button key={cat} type="button" onClick={() => setCategory(cat === category ? "" : cat)}
  className={cn(
  "py-4 text-sm font-semibold transition-all border",
  category === cat
  ? "btn-fire border-transparent text-white"
  : "bg-surface-50 text-bark-300 border-surface-400 hover:border-cinnamon-300 hover:text-cinnamon-500"
  )}>
  {cat}
  </button>
  ))}
  </div>
  </div>

  <button onClick={() => setStep(2)} disabled={!title.trim()}
  className="w-full py-3.5  btn-fire font-semibold uppercase tracking-widest text-sm flex items-center justify-center gap-2 disabled:opacity-40">
  הבא — מצרכים <ArrowLeft className="w-4 h-4" />
  </button>
  </div>
  )}

  {/* Step 2 */}
  {step === 2 && (
  <div className="space-y-4 animate-slide-up opacity-0" style={{ animationFillMode: "forwards" }}>
  <h2 className="font-bold text-bark-500 text-lg" style={{ fontFamily: "'Heebo', sans-serif" }}>רשימת מצרכים</h2>

  {ingredients.map((ing, i) => (
  <div key={i} className="flex items-start gap-2 card-surface p-3 animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
  <GripVertical className="w-4 h-4 text-bark-100 mt-2.5 flex-shrink-0" />
  <div className="flex-1 grid grid-cols-[1fr_1fr_2fr] gap-2">
  <input type="number" placeholder="כמות" value={ing.amount || ""}
  onChange={(e) => updateIngredient(i, "amount", Number(e.target.value))}
  className="input-dark" min={0} step="any" />
  <input placeholder="יחידה" value={ing.unit}
  onChange={(e) => updateIngredient(i, "unit", e.target.value)} className="input-dark" />
  <input placeholder="שם המצרך" value={ing.name}
  onChange={(e) => updateIngredient(i, "name", e.target.value)} className="input-dark" />
  </div>
  {ingredients.length > 1 && (
  <button onClick={() => removeIngredient(i)}
  className="p-2 text-bark-100 hover:text-red-500 hover:bg-red-50  transition-colors mt-0.5">
  <Trash2 className="w-4 h-4" />
  </button>
  )}
  </div>
  ))}

  <button onClick={addIngredient}
  className="w-full py-3  border-2 border-dashed border-surface-400 text-bark-200 hover:border-cinnamon-300 hover:text-cinnamon-500 flex items-center justify-center gap-2 text-sm transition-all duration-300">
  <Plus className="w-4 h-4" /> הוספת מצרך
  </button>

  <div className="flex gap-3">
  <button onClick={() => setStep(1)}
  className="flex-1 py-3  btn-outline font-semibold text-sm flex items-center justify-center gap-2">
  <ArrowRight className="w-4 h-4" /> חזרה
  </button>
  <button onClick={() => setStep(3)}
  className="flex-1 py-3  btn-fire font-semibold text-sm flex items-center justify-center gap-2">
  הבא — שלבי הכנה <ArrowLeft className="w-4 h-4" />
  </button>
  </div>
  </div>
  )}

  {/* Step 3 */}
  {step === 3 && (
  <div className="space-y-4 animate-slide-up opacity-0" style={{ animationFillMode: "forwards" }}>
  <h2 className="font-bold text-bark-500 text-lg" style={{ fontFamily: "'Heebo', sans-serif" }}>שלבי הכנה</h2>

  {instructions.map((inst, i) => (
  <div key={i} className="flex items-start gap-3 card-surface p-4 animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
  <span className="flex-shrink-0 w-10 h-10 rounded-full bg-cinnamon-50 text-cinnamon-500 flex items-center justify-center text-sm font-bold border border-cinnamon-200 mt-0.5">
  {inst.step}
  </span>
  <textarea value={inst.text} onChange={(e) => updateInstruction(i, e.target.value)}
  placeholder={`שלב ${inst.step}...`} rows={2}
  className="input-dark flex-1 resize-none" />
  {instructions.length > 1 && (
  <button onClick={() => removeInstruction(i)}
  className="p-2 text-bark-100 hover:text-red-500 hover:bg-red-50  transition-colors">
  <Trash2 className="w-4 h-4" />
  </button>
  )}
  </div>
  ))}

  <button onClick={addInstruction}
  className="w-full py-3  border-2 border-dashed border-surface-400 text-bark-200 hover:border-cinnamon-300 hover:text-cinnamon-500 flex items-center justify-center gap-2 text-sm transition-all duration-300">
  <Plus className="w-4 h-4" /> הוספת שלב
  </button>

  <div className="flex gap-3">
  <button onClick={() => setStep(2)}
  className="flex-1 py-3  btn-outline font-semibold text-sm flex items-center justify-center gap-2">
  <ArrowRight className="w-4 h-4" /> חזרה
  </button>
  <button onClick={handleSubmit} disabled={submitting || !title.trim()}
  className="flex-1 py-3  btn-fire font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40">
  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
  שמירת שינויים
  </button>
  </div>
  </div>
  )}
  </div>
  );
}
