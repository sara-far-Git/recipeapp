/**
 * הצהרת נגישות.
 *
 * Regulation 35 of the Equal Rights for Persons with Disabilities (Service
 * Accessibility Adjustments) Regulations, 2013, asks a site that serves the
 * public to publish a statement: what was made accessible and to which
 * standard, what still is not, how to reach whoever handles accessibility,
 * and when it was last updated.
 *
 * Everything claimed here is something the site really does. Where it falls
 * short, it says so: a statement that overclaims is worse than none, because
 * it tells someone a barrier is not there when it is. Update the lists and
 * the date (lib/legal) whenever that changes.
 *
 * The coordinator's name: an earlier version deliberately named no one (a
 * one-person site; the duty to appoint a coordinator falls on employers of 25
 * or more). The line stays a placeholder until the owner decides — fill it,
 * or set it to the role ("מפעילת האתר") rather than a name.
 */
import Link from "next/link";
import { LEGAL, UPDATED } from "@/lib/legal";
import { LegalPage, LegalSection, Detail, MailLink } from "@/components/ui/LegalPage";

export default function AccessibilityPage() {
  return (
    <LegalPage eyebrow="מדיניות האתר" title="הצהרת נגישות" updated={UPDATED.accessibility}>
      <LegalSection id="commitment" title="המחויבות שלנו">
        <p>
          Recipe Space (הבית של המתכונים) נועד לשמש כל אדם, לרבות אנשים עם מוגבלות. האתר
          הותאם לפי תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות),
          התשע&quot;ג-2013, ולפי התקן הישראלי ת&quot;י 5568, המבוסס על הנחיות WCAG 2.0 ברמה AA.
          בחלק מהנושאים יישמנו גם דרישות של WCAG 2.1.
        </p>
        <p>
          <b>רמת ההתאמה:</b> לפי הבדיקות שערכנו, האתר עומד בדרישות רמה AA, למעט החריגות
          הידועות שמפורטות בהמשך העמוד. רובן תלויות בתוכן של משתמשים או בשירותים חיצוניים.
        </p>
      </LegalSection>

      <LegalSection id="done" title="מה נעשה באתר">
        <ul className="list-disc pr-5 space-y-2">
          <li>האתר מוגדר בעברית ובכיוון ימין-לשמאל, כך שקוראי מסך מקריאים אותו נכון.</li>
          <li>
            אפשר להשתמש באתר במקלדת בלבד. כל רכיב שמקבל מיקוד מסומן במסגרת ברורה, כולל שדות
            טופס. במצב בישול אפשר לסמן מצרכים ושלבים גם ברווח או ב-Enter.
          </li>
          <li>
            הרכיב הראשון שמקבל מיקוד בכל עמוד הוא הקישור &quot;דילוג לתוכן הראשי&quot;, שמאפשר
            לעבור על פני התפריט.
          </li>
          <li>
            חלונות קופצים מוגדרים כתיבות דו-שיח: המיקוד נשאר בתוכם, מקש Escape סוגר אותם,
            ובסגירה המיקוד חוזר לכפתור שפתח אותם.
          </li>
          <li>
            לכל עמוד יש כותרת ראשית אחת ומבנה כותרות היררכי. לתמונות שנושאות מידע יש טקסט
            חלופי, ותמונות קישוטיות מוסתרות מקוראי מסך.
          </li>
          <li>
            לשדות הטפסים יש תוויות מקושרות. הודעות שגיאה מוקראות מיד כשהן מופיעות, וגם
            הודעות מצב, כמו &quot;נוסף לרשימת הקניות&quot;.
          </li>
          <li>לכפתורים שמסומנים באייקון בלבד יש שם שקוראי מסך מקריאים.</li>
          <li>
            בבוררים ובלשוניות, כמו רמת הקושי והקטגוריה בטופס המתכון, סינוני החיפוש ורשימות
            הקניות, קוראי מסך מקריאים איזו אפשרות בחורה.
          </li>
          <li>
            תפריט הניווט שנפתח על כל המסך שומר את המיקוד בתוכו, נסגר ב-Escape ומחזיר את
            המיקוד לכפתור שפתח אותו.
          </li>
          <li>
            ברשימות מתכונים יש כותרת לכל רשימה, כך שמבנה הכותרות אינו מדלג רמות.
          </li>
          <li>
            בטופס המתכון יש שדה לתיאור התמונה, וקוראי מסך מקריאים אותו במקום התמונה.
          </li>
          <li>
            מצב ההכנה מוצג במסך כהה בניגודיות גבוהה, וסיום הטיימר מוקרא בקוראי מסך.
          </li>
          <li>
            ניגודיות הצבעים של הטקסט נבדקה מול הדרישה של 4.5:1 (ו-3:1 לטקסט גדול), ותוקנה
            במקומות שבהם לא עמדה בה.
          </li>
          <li>
            האתר מכבד את ההגדרה &quot;צמצום תנועה&quot; של מערכת ההפעלה. מי שביקש אותה לא
            יראה את פתיח הלוגו ואת האנימציות. מילים מתחלפות בכותרות נעצרות אחרי סבב אחד,
            ואת פתיח הלוגו אפשר לדלג במקשי Tab או Escape. לפס התמונות המתחלף בעמוד הבית יש
            כפתור עצירה.
          </li>
          <li>
            האתר מתאים לכל רוחב מסך ותומך בהגדלת טקסט עד 200% בעזרת הדפדפן, בלי לאבד תוכן.
            שטח המגע של כל פקד הוא 24 פיקסלים לפחות.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="widget" title="תוסף נגישות">
        <p>
          באתר אין תוסף או סרגל נגישות. ההתאמות נבנו ישירות בקוד האתר, וזו הדרך שהתקנות
          והתקן דורשים. כדי להגדיל טקסט אפשר להשתמש בהגדלת הדפדפן (Ctrl ו-+, או ⌘ ו-+ במק).
          לצבעים בניגודיות גבוהה ולהקראה אפשר להשתמש בהגדרות הנגישות של מערכת ההפעלה.
        </p>
      </LegalSection>

      <LegalSection id="tested" title="איך נבדק האתר">
        <p>
          האתר נבדק בדפדפן Chrome עדכני במחשב, בניווט מקלדת בלבד, ובכלי בדיקה אוטומטיים
          לניגודיות, לתוויות ולמבנה הכותרות. <Detail value="[אם נבדק גם עם קורא מסך, לפרט כאן איזה: למשל NVDA עם Firefox, או VoiceOver באייפון — להשלמה]" />
        </p>
      </LegalSection>

      <LegalSection id="limits" title="מה עדיין אינו נגיש במלואו">
        <p>אנחנו ממשיכים לעבוד על החלקים האלה:</p>
        <ul className="list-disc pr-5 space-y-2">
          <li>
            מתכונים ותמונות מועלים בידי משתמשים. בטופס המתכון יש שדה לתיאור התמונה, אבל
            הוא אינו חובה. כשהוא ריק, שם המתכון משמש במקומו.
          </li>
          <li>
            כפתור הכניסה עם Google מגיע משרתי Google, ונגישותו באחריותה. אפשר תמיד להירשם
            ולהיכנס גם עם אימייל וסיסמה.
          </li>
          <li>האתר טרם נבדק בידי מורשה נגישות שירות או גורם חיצוני מוסמך.</li>
        </ul>
      </LegalSection>

      <LegalSection id="contact" title="נתקלתם בקושי? פנו אלינו">
        <p>
          אם משהו באתר חוסם אתכם, נשמח לדעת ונטפל בזה. כדאי לציין באיזה עמוד מדובר, באיזה
          דפדפן או מכשיר, ובאיזו טכנולוגיה מסייעת השתמשתם, אם בכלל. נשיב בתוך 7 ימי עסקים.
          אם תצטרכו, נמסור את המידע או את המתכון בדרך נגישה אחרת, למשל במייל.
        </p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 mt-2">
          <dt className="font-bold text-bark-500">רכז/ת נגישות:</dt>
          <dd><Detail value={LEGAL.accessibilityCoordinator} /></dd>
          <dt className="font-bold text-bark-500">אימייל:</dt>
          <dd><MailLink email={LEGAL.accessibilityEmail} /></dd>
          <dt className="font-bold text-bark-500">טלפון:</dt>
          <dd><Detail value={LEGAL.accessibilityPhone} /></dd>
          <dt className="font-bold text-bark-500">דואר:</dt>
          <dd><Detail value={LEGAL.address} /></dd>
        </dl>
      </LegalSection>

      <LegalSection id="physical" title="הסדרי נגישות במקום פיזי" last>
        <p>
          Recipe Space הוא שירות מקוון בלבד. אין לו מקום פיזי שמקבל קהל, ולכן אין הסדרי
          נגישות פיזיים לפרט. ראו גם את{" "}
          <Link href="/terms" className="underline font-semibold text-bark-500">תנאי השימוש</Link>{" "}
          ואת <Link href="/privacy" className="underline font-semibold text-bark-500">מדיניות הפרטיות</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
