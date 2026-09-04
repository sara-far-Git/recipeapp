"use client";

import Link from "next/link";
import Overlay from "@/components/ui/Overlay";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { recipesApi, scanApi, uploadApi, importApi } from "@/lib/api";
import Input from "@/components/ui/Input";
import {
  Camera, Upload, Plus, Trash2, GripVertical,
  ArrowLeft, ArrowRight, Check, Loader2, Sparkles, Link2, Mic, Square,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/categories";
import PageFrame from "@/components/ui/PageFrame";

/** `note: true` makes the row a heading between ingredients — "for the dough",
 *  "for the filling". Its `name` is the text; amount and unit are unused. */
interface Ingredient { amount: number; unit: string; name: string; note?: boolean; }
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

const AI_PLAN_LIMITS = [
  { label: "Free", value: "3 סריקות בחודש" },
  { label: "Pro", value: "30 סריקות בחודש" },
  { label: "חבילה", value: "20 סריקות ב־₪9.90" },
];


export default function NewRecipePage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const tickRef = useRef<number | null>(null);

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [scanError, setScanError] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [prepTime, setPrepTime] = useState<number | "">("");
  const [cookTime, setCookTime] = useState<number | "">("");
  const [servings, setServings] = useState(4);
  const [difficulty, setDifficulty] = useState("medium");
  const [kosherType, setKosherType] = useState("");
  const [category, setCategory] = useState("");
  const [isScanned, setIsScanned] = useState(false);

  const [ingredients, setIngredients] = useState<Ingredient[]>([{ amount: 0, unit: "", name: "" }]);
  const [instructions, setInstructions] = useState<Instruction[]>([{ step: 1, text: "" }]);
  const hasBasicDetails = title.trim().length > 0 && Boolean(category);
  const hasIngredients = ingredients.some((i) => i.name.trim());
  const hasInstructions = instructions.some((i) => i.text.trim());
  const canPublish = hasBasicDetails && hasIngredients && hasInstructions;

  useEffect(() => {
  if (!user && !useAuth.getState().isLoading) router.push("/login");
  }, [user, router]);

  useEffect(() => {
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  };

  const sendVoice = async (blob: Blob) => {
    const type = blob.type.split(";")[0] || "audio/webm";
    const ext = type.includes("mp4") ? "m4a" : type.includes("ogg") ? "ogg" : "webm";
    const file = new File([blob], `recipe.${ext}`, { type });
    setTranscribing(true);
    setScanError("");
    setScanSuccess(false);
    try {
      const { data } = await scanApi.voice(file);
      applyImported(data);
      setIsScanned(true);
      setScanSuccess(true);
      setTimeout(() => setScanSuccess(false), 5000);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setScanError(typeof detail === "string" ? detail : "שגיאה בתמלול ההקלטה. נסו שוב.");
    }
    setTranscribing(false);
  };

  const startRecording = async () => {
    if (recording || transcribing || scanning) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setScanError("הדפדפן לא תומך בהקלטה. נסו Chrome או Safari.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((t) =>
        MediaRecorder.isTypeSupported(t)
      );
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        stopTracks();
        setRecording(false);
        setRecordSecs(0);
        if (blob.size < 800) {
          setScanError("ההקלטה קצרה מדי. ספרו את המתכון בקול, אחר כך לחצו עצירה.");
          return;
        }
        sendVoice(blob);
      };
      recorderRef.current = rec;
      rec.start();
      setRecording(true);
      setRecordSecs(0);
      setScanError("");
      tickRef.current = window.setInterval(() => {
        setRecordSecs((s) => {
          if (s + 1 >= 180) {
            rec.stop();
            return 180;
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      setScanError("צריך אישור למיקרופון כדי להקליט מתכון.");
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
  };

  if (!user) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  setImageUploading(true);
  setImageError("");
  try {
  const { data } = await uploadApi.upload(file);
  setImageUrl(data.url);
  } catch (err: any) {
  // The server knows why — say so, instead of the same sentence for a file
  // that is too large, a session that expired, and storage that is off.
  const status = err?.response?.status;
  const detail = err?.response?.data?.detail;
  setImageError(
  status === 503
  ? "העלאת תמונות לא מוגדרת בשרת עדיין. אפשר לשמור את המתכון בלי תמונה."
  : status === 401
  ? "פג תוקף החיבור. התחברו שוב ונסו להעלות מחדש."
  : typeof detail === "string"
  ? detail
  : "לא הצלחנו להעלות את התמונה. נסו שוב, או שמרו בלי תמונה.",
  );
  }
  setImageUploading(false);
  };

  const applyImported = (data: any) => {
  setTitle(data.title || "");
  setDescription(data.description || "");
  if (data.prep_time_minutes) setPrepTime(data.prep_time_minutes);
  if (data.cook_time_minutes) setCookTime(data.cook_time_minutes);
  if (data.servings) setServings(data.servings);
  if (data.difficulty) setDifficulty(data.difficulty);
  if (data.kosher_type) setKosherType(data.kosher_type);
  if (data.category) setCategory(data.category);
  if (data.ingredients?.length)
  setIngredients(data.ingredients.map((ing: any) => ({ ...ing, amount: ing.amount ?? 0 })));
  if (data.instructions?.length) setInstructions(data.instructions);
  };

  const handleImportFromUrl = async () => {
  setImportError("");
  if (!importUrl.trim()) return;
  setImporting(true);
  try {
  const { data } = await importApi.fromUrl(importUrl.trim());
  applyImported(data);
  setIsScanned(true);
  setImportOpen(false);
  setImportUrl("");
  } catch (err: any) {
  const detail = err?.response?.data?.detail;
  setImportError(typeof detail === "string" ? detail : "שגיאה בייבוא המתכון");
  } finally {
  setImporting(false);
  }
  };

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  setScanning(true);
  setScanError("");
  setScanSuccess(false);
  try {
  const { data } = await scanApi.scan(file);
  applyImported(data);
  setIsScanned(true);
  setScanSuccess(true);
  setTimeout(() => setScanSuccess(false), 5000);
  } catch (err: any) {
  const detail = err?.response?.data?.detail;
  setScanError(typeof detail === "string" ? detail : "שגיאה בסריקת התמונה. נסו שוב.");
  }
  setScanning(false);
  e.target.value = "";
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
  if (!canPublish) return;
  setSubmitting(true);
  try {
  const { data } = await recipesApi.create({
  title, description: description || null, image_url: imageUrl || null,
  prep_time_minutes: prepTime || null, cook_time_minutes: cookTime || null,
  servings, difficulty, kosher_type: kosherType || null, category: category || null,
  ingredients: ingredients.filter((i) => i.name.trim()),
  instructions: instructions.filter((i) => i.text.trim()), is_scanned: isScanned,
  });
  router.push(`/recipe/${data.id}`);
  } catch (err: any) {
  const detail = err.response?.data?.detail;
  alert(typeof detail === "string" ? detail : Array.isArray(detail) ? detail.map((d: any) => d.msg).join(", ") : "שגיאה ביצירת המתכון");
  }
  setSubmitting(false);
  };

  return (
  <PageFrame tone="forest" className="recipe-editor-experience">
  <div className="max-w-2xl md:max-w-3xl mx-auto">
  {/* Scan overlay */}
  {(scanning || transcribing) && (
  <Overlay className="bg-bark-600/90 backdrop-blur-sm" label="השף הדיגיטלי עובד">
  <div className="card-surface p-8 text-center max-w-sm mx-4 animate-scale-in">
  <div className="relative w-20 h-20 mx-auto mb-5">
  <Sparkles className="w-10 h-10 text-cinnamon-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
  <div className="w-20 h-20 rounded-full border-4 border-surface-400 border-t-cinnamon-500 animate-spin" />
  </div>
  <h3 className="section-title text-bark-500 mb-2">
  השף הדיגיטלי עובד
  </h3>
  <p className="text-bark-300 text-sm">
    {transcribing ? "מתמלל את ההקלטה וממלא את המתכון..." : "מפענח את המתכון מהתמונה..."}
  </p>
  </div>
  </Overlay>
  )}

  {/* Page header */}
  <header className="experience-hero experience-hero--editor mb-7 animate-fade-up">
  <span className="eyebrow mb-3">
  <span className="plus-badge text-bark-500"><Plus className="w-3.5 h-3.5" strokeWidth={2.4} /></span>
  שמירת מתכון
  </span>
  <h1 className="display-lg text-bark-500 mb-3">
  שומרים מתכון
  </h1>
  <p className="text-bark-300 text-base">
  שמרו אותו פעם אחת, ברור ומסודר, כדי שיהיה קל לחזור אליו.
  </p>
  </header>

  {/* AI Scan card */}
  <div className="card-surface capture-action p-5 mb-3 animate-fade-up" style={{ animationDelay: "50ms" }}>
  <div className="flex items-center justify-between gap-4">
  <div>
  <h3 className="font-bold text-bark-500 mb-1 flex items-center gap-2">
  <Sparkles className="w-4 h-4 text-cinnamon-500" />
  השף הדיגיטלי
  </h3>
  <p className="text-sm text-bark-300">
  צלמו מתכון מספר, מחברת או דף ישן
  </p>
  </div>
  <button onClick={() => scanInputRef.current?.click()} disabled={scanning || recording || transcribing}
  className="flex-shrink-0 flex items-center gap-2 btn-block text-sm">
  <Camera className="w-4 h-4" /> סריקה
  </button>
  <input ref={scanInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleScan} />
  </div>
  </div>

  {scanSuccess && (
  <div className="flex items-center gap-2 p-3 mb-3  bg-cinnamon-50 border border-cinnamon-200 text-cinnamon-600 text-sm animate-fade-up">
  <Check className="w-4 h-4 flex-shrink-0" />
  המתכון זוהה בהצלחה. בדקו את הפרטים ועדכנו אם צריך.
  </div>
  )}
  {scanError && (
  <div className="flex items-center gap-2 p-3 mb-3  bg-red-50 border border-red-200 text-red-600 text-sm animate-fade-up">
  {scanError}
  </div>
  )}

  <div className="card-surface capture-action p-5 mb-3 animate-fade-up" style={{ animationDelay: "60ms" }}>
    <div className="flex items-center justify-between gap-4">
      <div>
        <h3 className="font-bold text-bark-500 mb-1 flex items-center gap-2">
          <Mic className="w-4 h-4 text-cinnamon-500" />
          הקלטה
        </h3>
        <p className="text-sm text-bark-300">
          {recording
            ? "אמרו שם, מצרכים ושלבי הכנה"
            : "הקליטו בקול ונמלא את השדות"}
        </p>
        {recording && (
          <p className="text-sm font-bold text-cinnamon-500 mt-2 tabular-nums">
            {String(Math.floor(recordSecs / 60)).padStart(2, "0")}:{String(recordSecs % 60).padStart(2, "0")}
            <span className="text-bark-200 font-medium mr-2"> / 03:00</span>
          </p>
        )}
      </div>
      {recording ? (
        <button
          type="button"
          onClick={stopRecording}
          className="flex-shrink-0 flex items-center gap-2 btn-fire text-sm"
        >
          <Square className="w-4 h-4 fill-current" />
          עצירה
        </button>
      ) : (
        <button
          type="button"
          onClick={startRecording}
          disabled={scanning || transcribing}
          className="flex-shrink-0 flex items-center gap-2 btn-block text-sm disabled:opacity-40"
        >
          <Mic className="w-4 h-4" />
          הקלטה
        </button>
      )}
    </div>
  </div>

  {/* Import from URL card */}
  <div className="card-surface capture-action p-5 mb-3 animate-fade-up" style={{ animationDelay: "75ms" }}>
  {!importOpen ? (
  <div className="flex items-center justify-between gap-4">
  <div>
  <h3 className="font-bold text-bark-500 mb-1 flex items-center gap-2">
  <Link2 className="w-4 h-4 text-cinnamon-500" />
  ייבוא מקישור
  </h3>
  <p className="text-sm text-bark-300">
  הדביקו קישור מבלוג מתכונים
  </p>
  </div>
  <button onClick={() => setImportOpen(true)}
  className="flex-shrink-0 flex items-center gap-2 btn-outline text-sm">
  <Link2 className="w-4 h-4" /> ייבוא
  </button>
  </div>
  ) : (
  <div className="space-y-3">
  <Input id="import_url" label="קישור למתכון" value={importUrl}
  onChange={(e) => setImportUrl(e.target.value)}
  placeholder="https://example.com/recipe/..." dir="ltr" disabled={importing} />
  {importError && (
  <div className="p-3  bg-red-50 border border-red-200 text-red-600 text-sm">{importError}</div>
  )}
  <div className="flex gap-2">
  <button onClick={handleImportFromUrl} disabled={importing || !importUrl.trim()}
  className="flex items-center gap-2 px-5 py-3.5 btn-fire text-sm font-semibold disabled:opacity-40">
  {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
  ייבוא
  </button>
  <button onClick={() => { setImportOpen(false); setImportUrl(""); setImportError(""); }} disabled={importing}
  className="px-5 py-3.5 btn-outline text-sm font-semibold">
  ביטול
  </button>
  </div>
  <p className="text-xs text-bark-200">תומך באתרים עם נתונים מובנים (schema.org/Recipe)</p>
  </div>
  )}
  </div>

  <div className="card-surface plan-strip p-4 mb-8 animate-fade-up" style={{ animationDelay: "90ms" }}>
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="grid grid-cols-3 gap-2 flex-1">
        {AI_PLAN_LIMITS.map((plan) => (
          <div key={plan.label} className="bg-surface-50/60 border border-surface-400 px-3 py-2 text-center">
            <p className="text-[11px] font-extrabold text-cinnamon-500">{plan.label}</p>
            <p className="text-xs sm:text-sm font-bold text-bark-500 leading-tight">{plan.value}</p>
          </div>
        ))}
      </div>
      <Link href="/pro" className="btn-outline text-sm px-5">
        פרטי Pro
      </Link>
    </div>
  </div>

  {/* Step indicators */}
  <div className="recipe-stepper flex items-center gap-3 mb-6 animate-fade-up" style={{ animationDelay: "100ms" }}>
  {[1, 2, 3].map((s) => (
  <button key={s} onClick={() => setStep(s)} className="flex items-center gap-2 flex-1" aria-current={step === s ? "step" : undefined}>
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

  <div className="card-surface recipe-step-note p-4 mb-8 animate-fade-up" style={{ animationDelay: "120ms" }}>
    <p className="text-sm font-bold text-bark-500 mb-1">
      {step === 1 ? "פרטי המתכון" : step === 2 ? "מצרכים" : "אופן ההכנה"}
    </p>
    <p className="text-sm text-bark-300 leading-relaxed">
      {step === 1
        ? "שם וקטגוריה מספיקים כדי להמשיך. את שאר הפרטים אפשר להשלים בהמשך."
        : step === 2
          ? "הוסיפו לפחות מצרך אחד. כמות ויחידה יכולות להישאר ריקות כשלא צריך."
          : "כתבו את השלבים לפי הסדר. מספיק שלב אחד כדי לשמור את המתכון."}
    </p>
  </div>

  {/* Step 1 */}
  {step === 1 && (
  <div className="space-y-6 animate-slide-up opacity-0" style={{ animationFillMode: "forwards" }}>
  <div className="field-row">
  <label className="input-label">כותרת המתכון *</label>
  <input value={title} onChange={(e) => setTitle(e.target.value)}
  placeholder="למשל: עוגת שוקולד קלאסית"
  className="input-dark" required />
  </div>

  <div className="field-row">
  <label className="input-label">תיאור קצר</label>
  <textarea value={description} onChange={(e) => setDescription(e.target.value)}
  placeholder="מה מיוחד במתכון, למתי הוא מתאים, או ממי הוא הגיע..." rows={3}
  className="input-dark resize-none" />
  </div>

  {/* Image upload */}
  <div>
  <label className="input-label mb-2">תמונה ראשית</label>
  {imageUrl ? (
  <div className="relative  overflow-hidden aspect-video" style={{ background: "#F4EEDF" }}>
  <img src={imageUrl} alt="recipe" className="w-full h-full object-cover" />
  <button onClick={() => setImageUrl("")}
  aria-label="הסרת תמונת המתכון"
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
  {imageError && (
  <p role="alert" className="mt-2 text-sm font-semibold" style={{ color: "#B3452B" }}>
  {imageError}
  </p>
  )}
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
  "flex-1 py-4 text-sm font-semibold transition-all duration-300 border",
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
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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

  <button onClick={() => setStep(2)} disabled={!hasBasicDetails}
  className="w-full btn-block text-sm flex items-center justify-center gap-2 disabled:opacity-40">
  הבא — מצרכים <ArrowLeft className="w-4 h-4" />
  </button>
  {!hasBasicDetails && (
    <p className="text-xs text-bark-200 text-center">
      צריך שם מתכון וקטגוריה כדי להמשיך.
    </p>
  )}
  </div>
  )}

  {/* Step 2 */}
  {step === 2 && (
  <div className="space-y-4 animate-slide-up opacity-0" style={{ animationFillMode: "forwards" }}>
  <h2 className="section-title text-bark-500">
  רשימת מצרכים
  </h2>
  <p className="text-sm text-bark-300 leading-relaxed">
    התחילו מהמצרכים החשובים. תמיד אפשר לערוך כמויות אחר כך.
  </p>

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
  <input type="number" placeholder="כמות" aria-label={`כמות למצרך ${i + 1}`} value={ing.amount || ""}
  onChange={(e) => updateIngredient(i, "amount", Number(e.target.value))}
  className="input-dark" min={0} step="any" />
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
  <h2 className="section-title text-bark-500">
  שלבי הכנה
  </h2>
  <p className="text-sm text-bark-300 leading-relaxed">
    כתבו כל פעולה בשלב נפרד. בזמן הבישול יהיה קל לסמן מה כבר נעשה.
  </p>

  {instructions.map((inst, i) => (
  <div key={i} className="flex items-start gap-3 card-surface p-4 animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
  <span className="recipe-stepper-num bg-cinnamon-50 text-cinnamon-500 mt-0.5">
  {inst.step}
  </span>
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
  <button onClick={handleSubmit} disabled={submitting || !canPublish}
  className="flex-1 py-3  btn-fire font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40">
  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
  פרסום מתכון
  </button>
  </div>
  {!canPublish && (
    <p className="text-xs text-bark-200 text-center">
      לפני פרסום צריך שם, קטגוריה, מצרך אחד ושלב הכנה אחד.
    </p>
  )}
  </div>
  )}
  </div>
  </PageFrame>
  );
}
