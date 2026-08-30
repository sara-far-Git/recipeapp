export default function TermsPage() {
  return (
  <div className="max-w-2xl mx-auto py-10">
  {/* Header */}
  <div className="text-center mb-12">
        <span className="eyebrow mb-4 justify-center">
          <span className="plus-badge text-bark-500" aria-hidden="true">
            <svg viewBox="0 0 12 12" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M6 1v10M1 6h10" /></svg>
          </span>
          תנאים משפטיים
        </span>
        <h1 className="display-lg text-bark-500 mb-3">
          תנאי שימוש
        </h1>
        <p className="text-bark-100 text-[15px] font-semibold">
          בתוקף ממאי 2026
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
        <p className="text-bark-100 text-xs">עדכון אחרון: מאי 2026</p>
  </div>
  </div>
  );
}

function TermsSection({ title, children, last = false }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
  <div className={!last ? "pb-8 mb-8 border-b border-surface-300" : ""}>
  <h2 className="section-title text-bark-500 mb-3">
  {title}
  </h2>
  <p className="text-bark-400 leading-relaxed" style={{ lineHeight: 1.75 }}>{children}</p>
  </div>
  );
}
