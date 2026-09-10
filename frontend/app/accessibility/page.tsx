/**
 * הצהרת נגישות.
 *
 * Israeli law requires a site that serves the public to be accessible and to
 * say so in a statement of its own — including what was actually done, what
 * is still lacking, and who to contact about it.
 *
 * Everything claimed here is something the site really does. Where it falls
 * short, it says so: a statement that overclaims is worse than none, because
 * it tells someone a barrier is not there when it is.
 */

/* A statement is not complete without a way to reach someone. That is the
   part that has to be here — a personal name is not what makes it work, and
   the site is run by one person who would rather not publish hers. */
const ACCESSIBILITY_EMAIL = "recipespaceapp@gmail.com";

const UPDATED = "ספטמבר 2026";

export default function AccessibilityPage() {
  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="experience-hero text-center mb-12">
        <span className="eyebrow mb-4 justify-center">
          <span className="plus-badge text-bark-500" aria-hidden="true">
            <svg viewBox="0 0 12 12" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M6 1v10M1 6h10" />
            </svg>
          </span>
          מדיניות האתר
        </span>
        <h1 className="display-lg text-bark-500 mb-3">הצהרת נגישות</h1>
        <p className="text-bark-200 text-[15px] font-semibold">עודכן ב{UPDATED}</p>
      </div>

      <div className="space-y-0">
        <Section title="המחויבות שלנו">
          ספר המתכונים נועד לשמש כל אדם, לרבות אנשים עם מוגבלות. אנו פועלים
          להנגיש את האתר ברמה AA של הנחיות WCAG 2.1, שהן הבסיס לתקן הישראלי
          ת&quot;י 5568.
        </Section>

        <Section title="מה נעשה באתר">
          <ul className="space-y-2">
            <li>ניווט מלא במקלדת, עם סימון ברור של הפריט שבמיקוד.</li>
            <li>קישור &quot;דילוג לתוכן הראשי&quot; בתחילת כל עמוד.</li>
            <li>מבנה כותרות היררכי, וטקסט חלופי לתמונות שנושאות מידע.</li>
            <li>תוויות לקוראי מסך על כפתורים שמסומנים באייקון בלבד.</li>
            <li>ניגודיות צבעים שנבדקה מול הדרישה של 4.5:1 לטקסט רגיל.</li>
            <li>
              כיבוד ההעדפה &quot;צמצום תנועה&quot; של מערכת ההפעלה — מי שביקש
              פחות אנימציות, מקבל פחות.
            </li>
            <li>שטח מגע של 24 פיקסלים לפחות לכל פקד.</li>
            <li>האתר מוגדר בעברית ובכיוון ימין-לשמאל, כך שקוראי מסך קוראים אותו נכון.</li>
          </ul>
        </Section>

        <Section title="מגבלות שידועות לנו">
          <p className="mb-3">
            חלקים מסוימים עדיין אינם נגישים במלואם, ואנחנו עובדים עליהם:
          </p>
          <ul className="space-y-2">
            <li>
              מתכונים נכתבים בידי המשתמשים. תמונה שהועלתה בלי תיאור תישאר בלי
              טקסט חלופי, ואיננו יכולים להשלים אותו במקומם.
            </li>
            <li>
              עמוד הבית בנוי מלוחות עם תנועה. הם מכבדים את העדפת צמצום התנועה,
              אך לא נבדקו מול כל צירוף של דפדפן וקורא מסך.
            </li>
            <li>האתר לא עבר בדיקת נגישות של גורם חיצוני מוסמך.</li>
          </ul>
        </Section>

        <Section title="נתקלתם בקושי?">
          <p className="mb-3">
            אם משהו באתר חוסם אתכם — נשמח לדעת, וננסה לתקן. כדאי לציין באיזה
            עמוד מדובר, באיזה דפדפן או מכשיר, ובאיזו טכנולוגיה מסייעת אם
            השתמשתם באחת.
          </p>
          <p>
            <span className="font-bold text-bark-500">פניות בנושא נגישות:</span>
            <br />
            <a
              href={`mailto:${ACCESSIBILITY_EMAIL}`}
              className="text-cinnamon-500 font-semibold underline">
              {ACCESSIBILITY_EMAIL}
            </a>
          </p>
        </Section>

        <Section title="הסדרי נגישות במקום פיזי" last>
          ספר המתכונים הוא שירות מקוון בלבד ואינו מפעיל מקום המספק שירות לציבור,
          ולכן אין הסדרי נגישות פיזיים לפרט.
        </Section>
      </div>

      <div className="text-center mt-12 pt-6 border-t border-surface-300">
        <p className="text-bark-200 text-xs">עודכן ב{UPDATED}</p>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
  last = false,
}: {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <section className={last ? "py-6" : "py-6 border-b border-surface-300"}>
      <h2 className="section-title text-bark-500 mb-3">{title}</h2>
      <div className="text-bark-300 text-[15px] leading-relaxed">{children}</div>
    </section>
  );
}
