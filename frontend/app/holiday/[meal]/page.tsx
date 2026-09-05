"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { searchApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import PageFrame from "@/components/ui/PageFrame";
import RecipeLoading from "@/components/ui/RecipeLoading";
import { cn } from "@/lib/utils";
import {
  HOLIDAY_COURSES,
  getMeal,
  loadHolidayPlan,
  mealPickCount,
  saveHolidayPlan,
  toPick,
  type HolidayPlan,
} from "@/lib/holidayPlan";

const OPTIONS = 4;

export default function HolidayMealPage() {
  const params = useParams();
  const { isLoading: authLoading } = useAuth();
  const mealId = String(params.meal || "");
  const meal = getMeal(mealId);

  const [plan, setPlan] = useState<HolidayPlan | null>(null);
  const [options, setOptions] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPlan(loadHolidayPlan());
  }, []);

  useEffect(() => {
    if (authLoading || !meal) return;
    let cancelled = false;
    setLoading(true);
    Promise.all(
      HOLIDAY_COURSES.map(async (course) => {
        try {
          const seen = new Set<number>();
          const rows: any[] = [];
          const searches = course.queries?.length
            ? course.queries.map((q) => searchApi.search({ q, limit: 20 }))
            : [searchApi.search({ category: course.category, limit: 20 })];
          const results = await Promise.all(searches);
          for (const res of results) {
            for (const recipe of res.data || []) {
              if (seen.has(recipe.id)) continue;
              seen.add(recipe.id);
              rows.push(recipe);
              if (rows.length >= OPTIONS) break;
            }
            if (rows.length >= OPTIONS) break;
          }
          return [course.id, rows] as const;
        } catch {
          return [course.id, []] as const;
        }
      }),
    ).then((rows) => {
      if (cancelled) return;
      setOptions(Object.fromEntries(rows));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [authLoading, meal]);

  const choose = (courseId: string, recipe: any) => {
    if (!plan || !meal) return;
    const current = plan.picks[meal.id]?.[courseId];
    const nextPick = current?.id === recipe.id ? null : toPick(recipe);
    const next: HolidayPlan = {
      picks: {
        ...plan.picks,
        [meal.id]: {
          ...plan.picks[meal.id],
          [courseId]: nextPick,
        },
      },
    };
    setPlan(next);
    saveHolidayPlan(next);
  };

  if (!meal) {
    return (
      <PageFrame tone="forest" className="holiday-experience">
        <div className="holiday-board">
          <p className="holiday-lead">הסעודה הזאת לא קיימת.</p>
          <Link href="/holiday" className="holiday-back">חזרה לראש השנה</Link>
        </div>
      </PageFrame>
    );
  }

  const filled = plan ? mealPickCount(plan, meal.id) : 0;

  return (
    <PageFrame tone="forest" className="holiday-experience">
      <div className="holiday-board">
        <header className="holiday-masthead animate-fade-up">
          <Link href="/holiday" className="holiday-kicker holiday-kicker-link">
            ראש השנה
          </Link>
          <h1 className="display-lg">{meal.name}</h1>
          <p className="holiday-lead">
            {meal.when === "night" ? "סעודת לילה" : "סעודת יום"}
            {plan ? ` · ${filled} מתוך ${HOLIDAY_COURSES.length}` : ""}
          </p>
        </header>

        {loading || !plan ? (
          <RecipeLoading label="מסדרת את המנות" kind="search" />
        ) : (
          <div className="holiday-courses">
            {HOLIDAY_COURSES.map((course, index) => {
              const recipes = options[course.id] || [];
              const selectedId = plan.picks[meal.id]?.[course.id]?.id;
              return (
                <section key={course.id} className="holiday-course">
                  <div className="holiday-course-head">
                    <span className="holiday-course-num">{String(index + 1).padStart(2, "0")}</span>
                    <h2 className="holiday-course-name">{course.name}</h2>
                  </div>
                  {recipes.length === 0 ? (
                    <p className="holiday-empty">עוד אין כאן מתכונים. אפשר להוסיף מהספר ואז לבחור.</p>
                  ) : (
                    <div className="holiday-choices">
                      {recipes.map((recipe) => {
                        const selected = selectedId === recipe.id;
                        return (
                          <button
                            key={recipe.id}
                            type="button"
                            onClick={() => choose(course.id, recipe)}
                            className={cn("holiday-choice", selected && "is-selected")}
                            aria-pressed={selected}
                          >
                            <span className="holiday-choice-photo">
                              {recipe.image_url ? (
                                <Image
                                  src={recipe.image_url}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 640px) 50vw, 180px"
                                />
                              ) : (
                                <span className="holiday-choice-fallback">{recipe.title.slice(0, 1)}</span>
                              )}
                            </span>
                            <span className="holiday-choice-title">{recipe.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })}
            <Link href="/holiday" className="holiday-back">חזרה לארבע הסעודות</Link>
          </div>
        )}
      </div>
    </PageFrame>
  );
}
