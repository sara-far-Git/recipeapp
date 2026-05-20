export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto py-10">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-3 text-xs font-semibold uppercase mb-4"
          style={{ color: "#5a3e2a", letterSpacing: "0.28em", fontFamily: "'Heebo', sans-serif" }}>
          <span className="inline-block w-10 h-px bg-smoke-200" />
          מדיניות האתר
          <span className="inline-block w-10 h-px bg-smoke-200" />
        </div>
        <h1 className="text-bark-500 mb-3"
          style={{ fontFamily: "'Heebo', sans-serif", fontSize: "clamp(2rem,4vw,2.8rem)", fontWeight: 800, letterSpacing: "-0.025em" }}>
          מדיניות פרטיות
        </h1>
        <p className="text-cinnamon-500" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontSize: 16 }}>
          Effective May 2026
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-0">
        <PolicySection title="מידע שאנו אוספים">
          אנו אוספים מידע שאתם מספקים בעת הרשמה: שם משתמש, כתובת אימייל וסיסמה מוצפנת. בכניסה עם Google — רק שם ואימייל ציבוריים. מתכונים, תגובות ורשימות קניות שאתם יוצרים נשמרים בשרתינו.
        </PolicySection>

        <PolicySection title="שימוש במידע">
          המידע משמש לתפעול השירות בלבד — הצגת מתכונים, ניהול חשבון, רשימות קניות. איננו מוכרים מידע אישי לצדדים שלישיים ואיננו משתמשים בו לפרסום ממוקד.
        </PolicySection>

        <PolicySection title="אבטחת מידע">
          סיסמאות מוצפנות עם bcrypt. תקשורת מוצפנת עם HTTPS. גישה למסד הנתונים מוגבלת לשרת בלבד. אנו מקפידים על עדכוני אבטחה שוטפים.
        </PolicySection>

        <PolicySection title="מחיקת מידע">
          תוכלו למחוק את חשבונכם ואת כל המידע הקשור אליו בכל עת על ידי פנייה אלינו. מחיקת החשבון היא סופית ובלתי הפיכה.
        </PolicySection>

        <PolicySection title="יצירת קשר" last>
          לשאלות בנושא פרטיות:{" "}
          <span className="text-cinnamon-500 font-semibold">support@recipeapp.co.il</span>
        </PolicySection>
      </div>

      <div className="text-center mt-12 pt-6 border-t border-surface-300">
        <p className="text-bark-200 text-xs" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}>
          עדכון אחרון: מאי 2026
        </p>
      </div>
    </div>
  );
}

function PolicySection({ title, children, last = false }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={!last ? "pb-8 mb-8 border-b border-surface-300" : ""}>
      <h2 className="font-bold text-bark-500 mb-3 text-lg" style={{ fontFamily: "'Heebo', sans-serif", letterSpacing: "-0.02em" }}>
        {title}
      </h2>
      <p className="text-bark-400 leading-relaxed" style={{ lineHeight: 1.75 }}>{children}</p>
    </div>
  );
}
