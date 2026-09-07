import RecipeLoading from "@/components/ui/RecipeLoading";

const KINDS = [
  { id: "shopping", label: "קניות" },
  { id: "search", label: "חיפוש" },
  { id: "collection", label: "אוסף" },
  { id: "recipe", label: "מתכון" },
] as const;

export default function LoaderPreviewPage() {
  return (
    <div className="min-h-[100svh] px-6 py-16" style={{ background: "#E3CFB2" }}>
      <p className="eyebrow text-center mb-10" style={{ color: "#1E4D45" }}>אנימציות טעינה</p>
      <div className="max-w-4xl mx-auto grid gap-8 sm:grid-cols-2">
        {KINDS.map((kind) => (
          <div key={kind.id} className="text-center">
            <RecipeLoading kind={kind.id} label={kind.label} />
            <p className="mt-2 text-sm font-bold" style={{ color: "#1E4D45" }}>{kind.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
