export default function PrivacyPage() {
  return (
  <div className="max-w-2xl mx-auto py-10">
  {/* Header */}
  <div className="experience-hero text-center mb-12">
        <span className="eyebrow mb-4 justify-center">
          <span className="plus-badge text-bark-500" aria-hidden="true">
            <svg viewBox="0 0 12 12" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M6 1v10M1 6h10" /></svg>
          </span>
          מדיניות האתר
        </span>
        <h1 className="display-lg text-bark-500 mb-3">
          מדיניות פרטיות
        </h1>
        <p className="text-bark-200 text-[15px] font-semibold">
          בתוקף מספטמבר 2026
        </p>
  </div>

  {/* Sections */}
  <div className="space-y-0">
  <PolicySection title="מידע שאנו אוספים">
  בהרשמה: שם משתמש, כתובת אימייל וסיסמה השמורה מוצפנת. בכניסה עם Google — השם
  והאימייל בלבד, כפי שגוגל מוסרת אותם. בשימוש: המתכונים, התגובות, הדירוגים
  ורשימות הקניות שיצרתם, והתמונות שהעליתם. כן נשמר מועד הכניסה האחרונה שלכם,
  לצורך תפעול השירות.
  </PolicySection>

  <PolicySection title="עיבוד בעזרת בינה מלאכותית">
  כשאתם מבקשים מהאתר לפענח מתכון מתמונה, מהקלטה או מטקסט, התוכן הזה נשלח
  לשירות של OpenAI לצורך הפענוח, ומשם חוזרת התוצאה. כלומר תמונה או הקלטה
  שתעלו לפענוח יוצאות מהשרת שלנו אל צד שלישי. זה קורה רק כשאתם מבקשים זאת —
  מתכון שנכתב ידנית אינו נשלח לשום מקום. איננו שולחים לשם את הפרטים המזהים
  שלכם.
  </PolicySection>

  <PolicySection title="שימוש במידע">
  המידע משמש לתפעול השירות בלבד — הצגת מתכונים, ניהול חשבון, חיפוש ורשימות
  קניות. איננו מוכרים מידע אישי, איננו מעבירים אותו למפרסמים, ואיננו משתמשים
  בו לפרסום ממוקד. אין באתר כלי מעקב או ניתוח תנועה של צד שלישי.
  </PolicySection>

  <PolicySection title="מה נשמר בדפדפן שלכם">
  איננו משתמשים בעוגיות מעקב. הדפדפן שומר את אסימון ההתחברות שלכם כדי שלא
  תצטרכו להתחבר מחדש בכל כניסה, ואת ההעדפות שבחרתם. זהו מידע הדרוש לתפעול
  השירות, והוא נמחק ביציאה מהחשבון או בניקוי נתוני הדפדפן.
  </PolicySection>

  <PolicySection title="שיתוף עם צדדים שלישיים">
  מלבד שירות הבינה המלאכותית שתואר למעלה, המידע נשמר אצל ספקי התשתית
  המפעילים עבורנו את השרת ואת מסד הנתונים. הם מעבדים אותו עבורנו בלבד. נמסור
  מידע לגורם נוסף רק אם נידרש לכך על פי דין.
  </PolicySection>

  <PolicySection title="אבטחת מידע">
  סיסמאות נשמרות מוצפנות ב-bcrypt ואינן ניתנות לשחזור. התקשורת מוצפנת ב-HTTPS.
  הגישה למסד הנתונים מוגבלת לשרת בלבד. שום שיטת אבטחה אינה מושלמת, ואיננו
  יכולים להבטיח הגנה מוחלטת.
  </PolicySection>

  <PolicySection title="הזכויות שלכם">
  אתם רשאים לעיין במידע השמור עליכם, לבקש את תיקונו ולבקש את מחיקתו. מתכון
  ניתן למחוק ישירות מהאתר. למחיקת החשבון כולו — פנו אלינו, והוא יימחק על
  מתכוניו ותגובותיו. המחיקה סופית ואינה הפיכה.
  </PolicySection>

  <PolicySection title="גיל">
  השירות אינו מיועד לילדים מתחת לגיל 14. אם נודע לנו שנפתח חשבון בידי ילד
  מתחת לגיל זה, נמחק אותו.
  </PolicySection>

  <PolicySection title="שינויים במדיניות">
  אם נשנה את המדיניות, נעדכן את התאריך שבתחתית העמוד. שינוי מהותי יוצג
  באתר עצמו.
  </PolicySection>

  <PolicySection title="יצירת קשר" last>
  לשאלות בנושא פרטיות, לעיון במידע או למחיקתו:{" "}
  <a href="mailto:recipespaceapp@gmail.com" className="text-cinnamon-500 font-semibold underline">recipespaceapp@gmail.com</a>
  </PolicySection>
  </div>

  <div className="text-center mt-12 pt-6 border-t border-surface-300">
        <p className="text-bark-200 text-xs">עדכון אחרון: ספטמבר 2026</p>
  </div>
  </div>
  );
}

function PolicySection({ title, children, last = false }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
  <div className={!last ? "pb-8 mb-8 border-b border-surface-300" : ""}>
  <h2 className="section-title text-bark-500 mb-3">
  {title}
  </h2>
  <div className="text-bark-400 leading-relaxed" style={{ lineHeight: 1.75 }}>{children}</div>
  </div>
  );
}
