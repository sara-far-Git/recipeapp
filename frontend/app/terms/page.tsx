export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="font-display text-3xl font-bold text-gray-100 mb-8">תנאי שימוש</h1>
      <div className="space-y-6 text-gray-400 leading-relaxed text-sm">
        <section className="card-surface p-5">
          <h2 className="font-bold text-gray-200 mb-3">שימוש בשירות</h2>
          <p>RecipeApp הוא שירות לשיתוף מתכונים. בשימוש בשירות אתם מסכימים לפרסם תוכן מקורי בלבד שאינו מפר זכויות יוצרים.</p>
        </section>
        <section className="card-surface p-5">
          <h2 className="font-bold text-gray-200 mb-3">תוכן משתמשים</h2>
          <p>אתם אחראים לתוכן שאתם מפרסמים. תוכן פוגעני, פרסומי או מפר זכויות יוצרים עלול להוביל להסרה ולחסימת חשבון.</p>
        </section>
        <section className="card-surface p-5">
          <h2 className="font-bold text-gray-200 mb-3">הגבלת אחריות</h2>
          <p>השירות ניתן "כפי שהוא". איננו אחראים לדיוק המתכונים, תוצאות בישול, או נזקים ישירים ועקיפים.</p>
        </section>
        <section className="card-surface p-5">
          <h2 className="font-bold text-gray-200 mb-3">שינויים בתנאים</h2>
          <p>אנו שומרים לעצמנו את הזכות לשנות תנאים אלו בכל עת. המשך שימוש לאחר שינוי מהווה הסכמה לתנאים החדשים.</p>
        </section>
        <p className="text-gray-600 text-xs text-center">עדכון אחרון: מאי 2026</p>
      </div>
    </div>
  );
}
