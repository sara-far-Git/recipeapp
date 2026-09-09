export default function TermsPage() {
  return (
  <div className="max-w-2xl mx-auto py-10">
  {/* Header */}
  <div className="experience-hero text-center mb-12">
        <span className="eyebrow mb-4 justify-center">
          <span className="plus-badge text-bark-500" aria-hidden="true">
            <svg viewBox="0 0 12 12" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M6 1v10M1 6h10" /></svg>
          </span>
          תנאים משפטיים
        </span>
        <h1 className="display-lg text-bark-500 mb-3">
          תנאי שימוש
        </h1>
        <p className="text-bark-200 text-[15px] font-semibold">
          בתוקף מספטמבר 2026
        </p>
  </div>

  {/* Sections */}
  <div className="space-y-0">
  <TermsSection title="השירות">
  ספר המתכונים הוא שירות מקוון לשמירה, כתיבה ושיתוף של מתכונים. השימוש בו אינו
  כרוך בתשלום. אנו רשאים לשנות את השירות, ואף להפסיקו, ונודיע על כך מראש
  ככל שניתן.
  </TermsSection>

  <TermsSection title="החשבון שלכם">
  הפרטים שתמסרו בהרשמה צריכים להיות נכונים. אתם אחראים לשמירת הסיסמה ולכל
  פעולה שתיעשה בחשבונכם. השירות אינו מיועד למי שטרם מלאו לו 14.
  </TermsSection>

  <TermsSection title="התוכן שאתם כותבים">
  התוכן שאתם מעלים נשאר שלכם. בהעלאתו אתם נותנים לנו רשות להציג אותו ולאחסן
  אותו לצורך הפעלת השירות, ולהציגו למשתמשים אחרים אם בחרתם לפרסמו. עליכם
  להעלות רק תוכן שמותר לכם להעלות — מתכון שהעתקתם ממקור מוגן אינו כזה.
  </TermsSection>

  <TermsSection title="שימוש הוגן">
  אין להשתמש בשירות כדי להעלות תוכן פוגעני, מפר זכויות או פרסומי, לנסות לחדור
  למערכת או לחשבונות אחרים, או להעמיס עליה בכוונה. אנו רשאים להסיר תוכן או
  לחסום חשבון שפועל כך.
  </TermsSection>

  <TermsSection title="פענוח בעזרת בינה מלאכותית">
  כשאתם מבקשים לפענח מתכון מתמונה, מהקלטה או מטקסט, התוכן נשלח לשירות חיצוני
  לצורך הפענוח, כמפורט במדיניות הפרטיות. הפענוח אינו מדויק תמיד — בדקו את
  התוצאה לפני שאתם מסתמכים עליה.
  </TermsSection>

  <TermsSection title="הגבלת אחריות">
  השירות ניתן &quot;כפי שהוא&quot;. המתכונים נכתבים בידי משתמשים ואיננו בודקים
  את נכונותם. איננו אחראים לתוצאות הבישול, לרגישויות או לאלרגיות, לכשרות
  המזון, או לנזק שייגרם משימוש במתכון. שימו לב במיוחד לאלרגנים ולזמני בישול
  של מזון מן החי — האחריות על כך היא שלכם.
  </TermsSection>

  <TermsSection title="זמינות וגיבוי">
  אנו משתדלים שהשירות יהיה זמין, אך איננו מתחייבים לכך. שמרו עותק משלכם
  למתכונים שחשובים לכם במיוחד.
  </TermsSection>

  <TermsSection title="סיום השימוש">
  תוכלו להפסיק להשתמש בשירות בכל עת ולבקש את מחיקת חשבונכם. אנו רשאים לסגור
  חשבון שמפר את התנאים האלה.
  </TermsSection>

  <TermsSection title="דין וסמכות שיפוט">
  על תנאים אלה חלים דיני מדינת ישראל, וסמכות השיפוט הבלעדית נתונה לבתי המשפט
  המוסמכים בישראל.
  </TermsSection>

  <TermsSection title="שינויים בתנאים" last>
  אנו רשאים לשנות תנאים אלה. שינוי מהותי יוצג באתר, והמשך שימוש לאחריו מהווה
  הסכמה. לשאלות:{" "}
  <span className="text-cinnamon-500 font-semibold">support@recipespace.co.il</span>
  </TermsSection>
  </div>

  <div className="text-center mt-12 pt-6 border-t border-surface-300">
        <p className="text-bark-200 text-xs">עדכון אחרון: ספטמבר 2026</p>
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
  <div className="text-bark-400 leading-relaxed" style={{ lineHeight: 1.75 }}>{children}</div>
  </div>
  );
}
