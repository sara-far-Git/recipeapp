export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="font-display text-3xl font-bold text-gray-100 mb-8">מדיניות פרטיות</h1>
      <div className="space-y-6 text-gray-400 leading-relaxed text-sm">
        <section className="card-surface p-5">
          <h2 className="font-bold text-gray-200 mb-3">מידע שאנו אוספים</h2>
          <p>אנו אוספים מידע שאתם מספקים בעת הרשמה: שם משתמש, כתובת אימייל וסיסמה מוצפנת. בכניסה עם Google — רק שם ואימייל ציבוריים. מתכונים, תגובות ורשימות קניות שאתם יוצרים נשמרים בשרתינו.</p>
        </section>
        <section className="card-surface p-5">
          <h2 className="font-bold text-gray-200 mb-3">שימוש במידע</h2>
          <p>המידע משמש לתפעול השירות בלבד — הצגת מתכונים, ניהול חשבון, רשימות קניות. איננו מוכרים מידע אישי לצדדים שלישיים.</p>
        </section>
        <section className="card-surface p-5">
          <h2 className="font-bold text-gray-200 mb-3">אבטחת מידע</h2>
          <p>סיסמאות מוצפנות עם bcrypt. תקשורת מוצפנת עם HTTPS. גישה למסד הנתונים מוגבלת לשרת בלבד.</p>
        </section>
        <section className="card-surface p-5">
          <h2 className="font-bold text-gray-200 mb-3">מחיקת מידע</h2>
          <p>תוכלו למחוק את חשבונכם ואת כל המידע הקשור אליו בכל עת על ידי פנייה אלינו.</p>
        </section>
        <section className="card-surface p-5">
          <h2 className="font-bold text-gray-200 mb-3">יצירת קשר</h2>
          <p>לשאלות בנושא פרטיות: <span className="text-fire-400">support@recipeapp.co.il</span></p>
        </section>
        <p className="text-gray-600 text-xs text-center">עדכון אחרון: מאי 2026</p>
      </div>
    </div>
  );
}
