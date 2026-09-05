"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { shoppingApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import PageFrame from "@/components/ui/PageFrame";
import { ShoppingCart } from "lucide-react";
import {
  HOLIDAY_COURSES,
  HOLIDAY_MEALS,
  allPickedRecipes,
  loadHolidayPlan,
  mealPickCount,
  mealPicks,
  type HolidayPlan,
} from "@/lib/holidayPlan";

export default function HolidayPlanPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [plan, setPlan] = useState<HolidayPlan | null>(null);
  const [shopping, setShopping] = useState(false);
  const [shopError, setShopError] = useState("");

  useEffect(() => {
    setPlan(loadHolidayPlan());
  }, []);

  const picked = useMemo(() => (plan ? allPickedRecipes(plan) : []), [plan]);

  const sendToShopping = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (picked.length === 0 || shopping) return;
    setShopping(true);
    setShopError("");
    try {
      const { data: lists } = await shoppingApi.list();
      const existing = lists.find((l: { name?: string }) => l.name === "קניות לראש השנה");
      const list = existing
        ? existing
        : (await shoppingApi.create("קניות לראש השנה")).data;
      for (const recipe of picked) {
        await shoppingApi.addRecipe(list.id, recipe.id, 1);
      }
      router.push("/shopping");
    } catch {
      setShopError("לא הצלחנו לבנות את רשימת הקניות. נסו שוב.");
    } finally {
      setShopping(false);
    }
  };

  return (
    <PageFrame tone="forest" className="holiday-experience">
      <div className="holiday-board">
        <header className="holiday-masthead animate-fade-up">
          <p className="holiday-kicker">ראש השנה</p>
          <h1 className="display-lg">ארבע סעודות</h1>
          <p className="holiday-lead">
            שתיים בלילה, שתיים ביום. נכנסים לסעודה, בוחרים מנה אחת מכל סוג, ואז
            אוספים קניות לכל השולחנות.
          </p>
        </header>

        {(["night", "day"] as const).map((when) => {
          const meals = HOLIDAY_MEALS.filter((meal) => meal.when === when);
          return (
            <section key={when} className="holiday-chapter">
              <p className="holiday-chapter-label">{when === "night" ? "לילה" : "יום"}</p>
              <ol className="holiday-ledger">
                {meals.map((meal, i) => {
                  const count = plan ? mealPickCount(plan, meal.id) : 0;
                  const titles = plan ? mealPicks(plan, meal.id).map((p) => p.title) : [];
                  const num = String(when === "night" ? i + 1 : i + 3).padStart(2, "0");
                  return (
                    <li key={meal.id}>
                      <Link href={`/holiday/${meal.id}`} className="holiday-ledger-row">
                        <span className="holiday-ledger-num" aria-hidden="true">{num}</span>
                        <span className="holiday-ledger-copy">
                          <span className="holiday-ledger-name">{meal.name}</span>
                          <span className="holiday-ledger-menu">
                            {titles.length === 0
                              ? "השולחן עדיין ריק"
                              : titles.join(" · ")}
                          </span>
                        </span>
                        <span className="holiday-ledger-count">
                          {count}/{HOLIDAY_COURSES.length}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}

        <section className="holiday-shop">
          <div>
            <p className="holiday-shop-title">קניות לכל החג</p>
            <p className="holiday-shop-copy">
              {picked.length === 0
                ? "אחרי שבוחרים מנות, כל המצרכים מתאספים לרשימה אחת."
                : `${picked.length} מתכונים מוכנים לרשימה.`}
            </p>
            {shopError && <p className="holiday-shop-error">{shopError}</p>}
          </div>
          <button
            type="button"
            className="holiday-shop-btn"
            disabled={picked.length === 0 || shopping}
            onClick={sendToShopping}
          >
            <ShoppingCart className="w-4 h-4" strokeWidth={2.2} />
            {shopping ? "אוספת מצרכים…" : "רשימת קניות"}
          </button>
        </section>
      </div>
    </PageFrame>
  );
}
