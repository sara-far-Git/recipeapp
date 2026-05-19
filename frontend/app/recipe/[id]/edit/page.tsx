"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { recipesApi, uploadApi } from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
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

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [instructions, setInstructions] = useState<Instruction[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await recipesApi.get(Number(params.id));
        if (user && data.author.id !== user.id) {
          router.push(`/recipe/${params.id}`);
          return;
        }
        setTitle(data.title || "");
        setDescription(data.description || "");
        setImageUrl(data.image_url || "");
        setPrepTime(data.prep_time_minutes || "");
        setCookTime(data.cook_time_minutes || "");
        setServings(data.servings || 4);
        setDifficulty(data.difficulty || "medium");
        setKosherType(data.kosher_type || "");
        setIngredients(
          data.ingredients?.length
            ? data.ingredients.map((i: any) => ({ amount: i.amount || 0, unit: i.unit || "", name: i.name }))
            : [{ amount: 0, unit: "", name: "" }]
        );
        setInstructions(
          data.instructions?.length
            ? data.instructions
            : [{ step: 1, text: "" }]
        );
      } catch {
        router.push("/");
      } finally {
        setLoading(false);
      }
    };
    if (user !== undefined) load();
  }, [params.id, user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 animate-spin rounded-full border-4 border-fire-500 border-t-transparent" />
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
        title,
        description: description || null,
        image_url: imageUrl || null,
        prep_time_minutes: prepTime || null,
        cook_time_minutes: cookTime || null,
        servings,
        difficulty,
        kosher_type: kosherType || null,
        ingredients: ingredients.filter((i) => i.name.trim()),
        instructions: instructions.filter((i) => i.text.trim()),
      });
      setSaveSuccess(true);
      setTimeout(() => router.push(`/recipe/${params.id}`), 1000);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      alert(typeof detail === "string" ? detail : "שגיאה בשמירת המתכון");
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {saveSuccess && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center">
          <div className="card-surface p-8 text-center rounded-3xl animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-gray-100 font-bold">המתכון עודכן בהצלחה!</p>
          </div>
        </div>
      )}

      <h1 className="font-display text-2xl font-bold text-gray-100 mb-6 animate-fade-up">עריכת מתכון</h1>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-6 animate-fade-up">
        {[1, 2, 3].map((s) => (
          <button
            key={s}
            onClick={() => setStep(s)}
            className={cn(
              "flex-1 h-1.5 rounded-full transition-all duration-500",
              step >= s ? "bg-gradient-to-l from-fire-400 to-fire-600" : "bg-white/[0.06]"
            )}
          />
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="space-y-4 animate-slide-up opacity-0" style={{ animationFillMode: "forwards" }}>
          <Input id="title" label="כותרת המתכון *" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="למשל: עוגת שוקולד קלאסית" required />

          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-1.5">תיאור קצר</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="input-dark resize-none" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-1.5">תמונה ראשית</label>
            {imageUrl ? (
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-surface-300">
                <img src={imageUrl} alt="recipe" className="w-full h-full object-cover" />
                <button onClick={() => setImageUrl("")} className="absolute top-3 left-3 p-2 bg-black/60 backdrop-blur-sm rounded-xl hover:bg-black/80 transition-colors">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            ) : (
              <button onClick={() => fileInputRef.current?.click()} disabled={imageUploading}
                className="w-full aspect-video rounded-2xl border-2 border-dashed border-white/[0.08] bg-surface-200/50 flex flex-col items-center justify-center gap-2 text-gray-600 hover:border-fire-500/30 hover:text-fire-300 transition-all duration-300">
                {imageUploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <><Upload className="w-8 h-8" /><span className="text-sm font-medium">העלי תמונה</span></>}
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input id="prep_time" label="זמן הכנה (דקות)" type="number" value={prepTime} onChange={(e) => setPrepTime(e.target.value ? Number(e.target.value) : "")} min={0} />
            <Input id="cook_time" label="זמן בישול (דקות)" type="number" value={cookTime} onChange={(e) => setCookTime(e.target.value ? Number(e.target.value) : "")} min={0} />
          </div>

          <Input id="servings" label="כמות סועדים" type="number" value={servings} onChange={(e) => setServings(Number(e.target.value) || 1)} min={1} />

          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-1.5">רמת קושי</label>
            <div className="flex gap-2">
              {DIFFICULTY_OPTIONS.map((opt) => (
                <button key={opt.value} type="button" onClick={() => setDifficulty(opt.value)}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border",
                    difficulty === opt.value ? "btn-fire border-transparent text-white" : "bg-surface-200 text-gray-400 border-white/[0.06] hover:border-white/[0.1]"
                  )}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-1.5">סוג כשרות</label>
            <select value={kosherType} onChange={(e) => setKosherType(e.target.value)} className="input-dark">
              {KOSHER_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>

          <Button onClick={() => setStep(2)} className="w-full" disabled={!title.trim()}>
            הבא — מצרכים <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="space-y-4 animate-slide-up opacity-0" style={{ animationFillMode: "forwards" }}>
          <h2 className="font-display text-lg font-bold text-gray-200">רשימת מצרכים</h2>

          {ingredients.map((ing, i) => (
            <div key={i} className="flex items-start gap-2 card-surface p-3 animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
              <GripVertical className="w-4 h-4 text-gray-700 mt-2.5 flex-shrink-0" />
              <div className="flex-1 grid grid-cols-[1fr_1fr_2fr] gap-2">
                <input type="number" placeholder="כמות" value={ing.amount || ""} onChange={(e) => updateIngredient(i, "amount", Number(e.target.value))} className="input-dark" min={0} step="any" />
                <input placeholder="יחידה" value={ing.unit} onChange={(e) => updateIngredient(i, "unit", e.target.value)} className="input-dark" />
                <input placeholder="שם המצרך" value={ing.name} onChange={(e) => updateIngredient(i, "name", e.target.value)} className="input-dark" />
              </div>
              {ingredients.length > 1 && (
                <button onClick={() => removeIngredient(i)} className="p-2 text-gray-700 hover:text-red-400 transition-colors mt-0.5">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          <button onClick={addIngredient} className="w-full py-3 rounded-xl border-2 border-dashed border-white/[0.06] text-gray-600 hover:border-fire-500/30 hover:text-fire-300 flex items-center justify-center gap-2 text-sm transition-all duration-300">
            <Plus className="w-4 h-4" /> הוספת מצרך
          </button>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep(1)} className="flex-1"><ArrowRight className="w-4 h-4" /> חזרה</Button>
            <Button onClick={() => setStep(3)} className="flex-1">הבא — שלבי הכנה <ArrowLeft className="w-4 h-4" /></Button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="space-y-4 animate-slide-up opacity-0" style={{ animationFillMode: "forwards" }}>
          <h2 className="font-display text-lg font-bold text-gray-200">שלבי הכנה</h2>

          {instructions.map((inst, i) => (
            <div key={i} className="flex items-start gap-2 card-surface p-3 animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-fire-500/15 text-fire-300 flex items-center justify-center text-sm font-bold mt-1">
                {inst.step}
              </span>
              <textarea value={inst.text} onChange={(e) => updateInstruction(i, e.target.value)} placeholder={`שלב ${inst.step}...`} rows={2} className="input-dark flex-1 resize-none" />
              {instructions.length > 1 && (
                <button onClick={() => removeInstruction(i)} className="p-2 text-gray-700 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          <button onClick={addInstruction} className="w-full py-3 rounded-xl border-2 border-dashed border-white/[0.06] text-gray-600 hover:border-fire-500/30 hover:text-fire-300 flex items-center justify-center gap-2 text-sm transition-all duration-300">
            <Plus className="w-4 h-4" /> הוספת שלב
          </button>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep(2)} className="flex-1"><ArrowRight className="w-4 h-4" /> חזרה</Button>
            <Button onClick={handleSubmit} loading={submitting} className="flex-1" disabled={!title.trim()}>
              <Check className="w-4 h-4" /> שמירת שינויים
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
