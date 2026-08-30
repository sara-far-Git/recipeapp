export default function PrivacyPage() {
  return (
  <div className="max-w-2xl mx-auto py-10">
  {/* Header */}
  <div className="text-center mb-12">
        <span className="eyebrow mb-4">
          <span className="eyebrow-rule" />
          מדיניות האתר
          <span className="eyebrow-rule" />
        </span>
        <h1 className="display-lg text-bark-500 font-extrabold mb-3">
          מדיניות פרטיות
        </h1>
        <p className="text-bark-100 text-[15px] font-semibold">
          בתוקף ממאי 2026
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
        <p className="text-bark-100 text-xs">עדכון אחרון: מאי 2026</p>
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
