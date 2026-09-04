"use client";

import { useState, useRef, useEffect } from "react";
import Overlay from "@/components/ui/Overlay";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { recipesApi, uploadApi } from "@/lib/api";
import RecipeLoading from "@/components/ui/RecipeLoading";
import {
  Upload, Plus, Trash2, GripVertical, ArrowLeft, ArrowRight,
  Check, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/categories";
import PageFrame from "@/components/ui/PageFrame";

/** `amount` is the raw text while editing — `Number("0.")` is 0, so parsing
 *  on every keystroke made a decimal point impossible to type. */
interface Ingredient { amount: number | string; unit: string; name: string; note?: boolean; }
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

const CATEGORY_OPTIONS = CATEGORIES.map((c) => c.name);


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
  ? data.ingredients.map((i: any) => ({ amount: i.amount || 0, unit: i.unit || "", name: i.name, note: !!i.note }))
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
  <RecipeLoading label="מוציאה את המתכון לעבודה" kind="recipe" />
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
  /** Drops a heading in at a given position rather than only at the end. */
  const addNoteAt = (i: number) =>
  setIngredients([
  ...ingredients.slice(0, i),
  { amount: 0, unit: "", name: "", note: true },
  ...ingredients.slice(i),
  ]);
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
  ingredients: ingredients
  .filter((i) => i.name.trim())
  .map((i) => ({ ...i, amount: i.note ? 0 : Number(i.amount) || 0 })),
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
  <PageFrame tone="plum" className="recipe-editor-experience">
  <div className="max-w-2xl md:max-w-3xl mx-auto">
  {saveSuccess && (
  <Overlay className="bg-bark-600/80" label="המתכון עודכן">
  <div className="card-surface p-8 text-center  animate-scale-in">
  <div className="w-16 h-16 rounded-full bg-cinnamon-50 border border-cinnamon-200 flex items-center justify-center mx-auto mb-4">
  <Check className="w-8 h-8 text-cinnamon-500" />
  </div>
  <p className="section-title text-bark-500">
  המתכון עודכן בהצלחה!
  </p>
  </div>
  </Overlay>
  )}

  {/* Page header */}
  <header className="experience-hero experience-hero--editor mb-7 animate-fade-up">
  <span className="eyebrow mb-3">
  <span className="plus-badge text-bark-500"><Plus className="w-3.5 h-3.5" strokeWidth={2.4} /></span>
  עריכת מתכון
  </span>
  <h1 className="display-lg text-bark-500">
  עדכון המתכון
  </h1>
  </header>

  {/* Step indicators */}
  <div className="recipe-stepper flex items-center gap-3 mb-8 animate-fade-up">
  {[1, 2, 3].map((s) => (
  <button key={s} onClick={() => setStep(s)} className="flex items-center gap-2 flex-1">
  <div className={cn(
  "recipe-stepper-num transition-all duration-300",
  step > s ? "bg-cinnamon-50 text-cinnamon-500" :
  step === s ? "bg-cinnamon-500 text-cream-50" :
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
  <div className="relative  overflow-hidden aspect-video" style={{ background: "#F4EEDF" }}>
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
  : <><Upload className="w-8 h-8" /><span className="text-sm font-medium">העלאת תמונה</span></>}
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
  ? "btn-fire border-transparent text-cream-50"
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
  <label className="input-label mb-3">קטגוריה <span className="text-red-500">*</span></label>
  <div className="grid grid-cols-3 gap-2">
  {CATEGORY_OPTIONS.map((cat) => (
  <button key={cat} type="button" onClick={() => setCategory(cat === category ? "" : cat)}
  className={cn(
  "py-4 text-sm font-semibold transition-all border",
  category === cat
  ? "btn-fire border-transparent text-cream-50"
  : "bg-surface-50 text-bark-300 border-surface-400 hover:border-cinnamon-300 hover:text-cinnamon-500"
  )}>
  {cat}
  </button>
  ))}
  </div>
  </div>

  <button onClick={() => setStep(2)} disabled={!title.trim() || !category}
  className="w-full btn-block text-sm flex items-center justify-center gap-2 disabled:opacity-40">
  הבא — מצרכים <ArrowLeft className="w-4 h-4" />
  </button>
  </div>
  )}

  {/* Step 2 */}
  {step === 2 && (
  <div className="space-y-4 animate-slide-up opacity-0" style={{ animationFillMode: "forwards" }}>
  <h2 className="section-title text-bark-500">רשימת מצרכים</h2>

  {ingredients.map((ing, i) => (
  <div key={i}>
  {/* slip a heading in above this row */}
  <button type="button" onClick={() => addNoteAt(i)} className="ingredient-divider">
  <span><Plus className="w-3 h-3" strokeWidth={2.6} /> הוספת כותרת</span>
  </button>
  <div className={cn("flex items-start gap-2 card-surface p-3 animate-fade-up", ing.note && "is-note")} style={{ animationDelay: `${i * 40}ms` }}>
  <GripVertical className="w-4 h-4 text-bark-200 mt-2.5 flex-shrink-0" />
  {ing.note ? (
  <div className="flex-1">
  <input placeholder="כותרת — למשל: לבצק" aria-label={`כותרת ${i + 1}`} value={ing.name}
  onChange={(e) => updateIngredient(i, "name", e.target.value)} className="input-dark font-bold" />
  </div>
  ) : (
  <div className="flex-1 grid grid-cols-1 sm:grid-cols-[1fr_1fr_2fr] gap-2">
  <input type="number" placeholder="כמות" aria-label={`כמות למצרך ${i + 1}`} value={ing.amount ?? ""}
  onChange={(e) => updateIngredient(i, "amount", e.target.value)}
  className="input-dark" min={0} step="any" inputMode="decimal" />
  <input placeholder="יחידה" aria-label={`יחידה למצרך ${i + 1}`} value={ing.unit}
  onChange={(e) => updateIngredient(i, "unit", e.target.value)} className="input-dark" />
  <input placeholder="שם המצרך" aria-label={`שם מצרך ${i + 1}`} value={ing.name}
  onChange={(e) => updateIngredient(i, "name", e.target.value)} className="input-dark" />
  </div>
  )}
  {ingredients.length > 1 && (
  <button onClick={() => removeIngredient(i)}
  aria-label={ing.note ? `מחיקת כותרת ${i + 1}` : `מחיקת מצרך ${i + 1}`}
  className="p-2 text-bark-200 hover:text-red-500 hover:bg-red-50  transition-colors mt-0.5">
  <Trash2 className="w-4 h-4" />
  </button>
  )}
  </div>
  </div>
  ))}
  {/* and one at the very end */}
  <button type="button" onClick={() => addNoteAt(ingredients.length)} className="ingredient-divider">
  <span><Plus className="w-3 h-3" strokeWidth={2.6} /> הוספת כותרת</span>
  </button>

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
  <h2 className="section-title text-bark-500">שלבי הכנה</h2>

  {instructions.map((inst, i) => (
  <div key={i} className="recipe-instruction-row card-surface animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
  <span className="recipe-step-number" aria-hidden="true">
  {inst.step}
  </span>
  <div className="recipe-step-fields">
  <textarea value={inst.text} onChange={(e) => updateInstruction(i, e.target.value)}
  aria-label={`שלב הכנה ${inst.step}`}
  placeholder={`שלב ${inst.step}...`} rows={2}
  className="input-dark flex-1 resize-none" />
  {instructions.length > 1 && (
  <button onClick={() => removeInstruction(i)}
  aria-label={`מחיקת שלב ${inst.step}`}
  className="p-2 text-bark-200 hover:text-red-500 hover:bg-red-50  transition-colors">
  <Trash2 className="w-4 h-4" />
  </button>
  )}
  </div>
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
  </PageFrame>
  );
}
