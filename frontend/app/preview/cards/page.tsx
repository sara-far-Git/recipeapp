"use client";

/**
 * Local preview of the recipe card — not part of the site.
 * The real RecipeCard with stand-in data, so what shows here is exactly what
 * the grid renders. Kept out of the index and out of the sitemap.
 */
import RecipeCard from "@/components/recipe/RecipeCard";

const MOCK = [
  {
    id: 1,
    title: "עוגת גבינה וריבת חלב",
    description: "שכבת בצק פריך, גבינה אפויה ורוטב חלב מעל. יוצאת בדיוק כמו של סבתא.",
    image_url: null,
    category: "קינוחים",
    difficulty: "medium",
    kosher_type: "dairy",
    servings: 12,
    prep_time_minutes: 25,
    cook_time_minutes: 45,
    likes_count: 24,
    is_liked: true,
    is_published: true,
  },
  {
    id: 2,
    title: "פסטה ברוטב עגבניות ובזיליקום",
    description: "רוטב שמתבשל לאט עם שום ועגבניות מרוסקות. עשרים דקות, וארוחה על השולחן.",
    image_url: null,
    category: "עיקריות",
    difficulty: "easy",
    kosher_type: "pareve",
    servings: 4,
    prep_time_minutes: 10,
    cook_time_minutes: 20,
    likes_count: 8,
    is_liked: false,
    is_published: true,
  },
  {
    id: 3,
    title: "לחם כפרי בסיר",
    description: "בצק שנח כל הלילה ונאפה בסיר יצוקה. קרום פריך וריח שממלא את הבית.",
    image_url: null,
    category: "מאפים",
    difficulty: "hard",
    kosher_type: "pareve",
    servings: 8,
    prep_time_minutes: 30,
    cook_time_minutes: 50,
    likes_count: 41,
    is_liked: false,
    is_published: true,
  },
  {
    id: 4,
    title: "מרק ירקות שורש",
    description: "גזר, בטטה ודלעת שנצלים לפני הבישול, ואז נטחנים לקטיפה.",
    image_url: null,
    category: "ראשונות",
    difficulty: "easy",
    kosher_type: "pareve",
    servings: 6,
    prep_time_minutes: 15,
    cook_time_minutes: 35,
    likes_count: 3,
    is_liked: false,
    is_published: true,
  },
  {
    id: 5,
    title: "סלט עגבניות ופטרוזיליה",
    description: "חיתוך דק, לימון, שמן זית טוב ומלח גס. הכי פשוט והכי נגמר ראשון.",
    image_url: null,
    category: "סלטים",
    difficulty: "easy",
    kosher_type: "pareve",
    servings: 4,
    prep_time_minutes: 12,
    cook_time_minutes: 0,
    likes_count: 15,
    is_liked: true,
    is_published: true,
  },
  {
    id: 6,
    title: "לימונדה עם נענע וג'ינג'ר",
    description: "סחיטה טרייה, קצת ג'ינג'ר מגורד וסירופ קל. מצנן ברגע.",
    image_url: null,
    category: "משקאות",
    difficulty: "easy",
    kosher_type: "pareve",
    servings: 6,
    prep_time_minutes: 8,
    cook_time_minutes: 0,
    likes_count: 6,
    is_liked: false,
    is_published: false,
  },
];

export default function CardsPreview() {
  return (
    <div className="py-8">
      <header className="mb-10 max-w-2xl">
        <p className="eyebrow mb-3">תצוגה מקומית</p>
        <h1 className="display-lg text-bark-500 mb-3">כרטיסי מתכון</h1>
        <p className="text-bark-200 text-[15px] leading-relaxed">
          הקומפוננטה האמיתית עם נתוני דמה. שש הקטגוריות, כל אחת עם גוון הלשונית שלה.
          הכרטיס האחרון הוא טיוטה. העבירו עכבר על כרטיס — הכרטיסים שמאחור נשלפים.
        </p>
      </header>

      <section className="mb-14">
        <h2 className="section-title text-bark-500 mb-5">על קרם</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-9">
          {MOCK.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      </section>

      {/* the profile page's canvas — where the card wore its own fallback tone
          and stopped matching the rest of the site */}
      <section
        className="profile-experience rounded-[var(--r-lg)] p-6 sm:p-9 mb-14"
        style={{ background: "#C8D5B7" }}>
        <h2 className="section-title text-bark-500 mb-5">על מרווה — האזור האישי</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-9">
          {MOCK.slice(0, 3).map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      </section>

      <section
        className="rounded-[var(--r-lg)] p-6 sm:p-9"
        style={{ background: "#1E4D45" }}>
        <h2 className="section-title mb-5" style={{ color: "#FAF8F3" }}>
          על ירוק
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-9">
          {MOCK.slice(0, 3).map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      </section>
    </div>
  );
}
