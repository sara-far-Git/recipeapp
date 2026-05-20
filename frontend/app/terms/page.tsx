export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto py-10">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-3 text-xs font-semibold uppercase mb-4"
          style={{ color: "#5a3e2a", letterSpacing: "0.28em", fontFamily: "'Heebo', sans-serif" }}>
          <span className="inline-block w-10 h-px bg-smoke-200" />
          תנאים משפטיים
          <span className="inline-block w-10 h-px bg-smoke-200" />
        </div>
        <h1 className="text-bark-500 mb-3"
          style={{ fontFamily: "'Heebo', sans-serif", fontSize: "clamp(2rem,4vw,2.8rem)", fontWeight: 800, letterSpacing: "-0.025em" }}>
          תנאי שימוש
        </h1>
        <p className="text-cinnamon-500" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontSize: 16 }}>
          Effective May 2026
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-0">
        <TermsSection title="שימוש בשירות">
          RecipeApp הוא שירות לשיתוף מתכונים. בשימוש בשירות אתם מסכימים לפרסם תוכן מקורי בלבד שאינו מפר זכויות יוצרים. השירות מיועד לשימוש אישי בלבד.
        </TermsSection>

        <TermsSection title="תוכן משתמשים">
          אתם אחראים לתוכן שאתם מפרסמים. תוכן פוגעני, פרסומי או מפר זכויות יוצרים עלול להוביל להסרה ולחסימת חשבון. אנו שומרים לעצמנו את הזכות להסיר כל תוכן לפי שיקול דעתנו.
        </TermsSection>

        <TermsSection title="הגבלת אחריות">
          השירות ניתן &quot;כפי שהוא&quot;. איננו אחראים לדיוק המתכונים, תוצאות בישול, או נזקים ישירים ועקיפים הנובעים מהשימוש בשירות.
        </TermsSection>

        <TermsSection title="שינויים בתנאים" last>
          אנו שומרים לעצמנו את הזכות לשנות תנאים אלו בכל עת. המשך שימוש לאחר שינוי מהווה הסכמה לתנאים החדשים. נודיע על שינויים מהותיים בדוא&quot;ל.
        </TermsSection>
      </div>

      <div className="text-center mt-12 pt-6 border-t border-surface-300">
        <p className="text-bark-200 text-xs" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}>
          עדכון אחרון: מאי 2026
        </p>
      </div>
    </div>
  );
}

function TermsSection({ title, children, last = false }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={!last ? "pb-8 mb-8 border-b border-surface-300" : ""}>
      <h2 className="font-bold text-bark-500 mb-3 text-lg" style={{ fontFamily: "'Heebo', sans-serif", letterSpacing: "-0.02em" }}>
        {title}
      </h2>
      <p className="text-bark-400 leading-relaxed" style={{ lineHeight: 1.75 }}>{children}</p>
    </div>
  );
}
