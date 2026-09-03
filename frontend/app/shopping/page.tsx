"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { shoppingApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import RecipeLoading from "@/components/ui/RecipeLoading";
import PageFrame from "@/components/ui/PageFrame";
import { ShoppingCart, Trash2, Plus, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ShoppingListPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [lists, setLists] = useState<any[]>([]);
  const [activeList, setActiveList] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState("");
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await shoppingApi.list();
      setLists(data);
      if (data.length > 0 && !activeList) setActiveList(data[0]);
    } catch {}
    setLoading(false);
  }, [activeList]);

  useEffect(() => {
    if (user) load();
    else setLoading(false);
  }, [user, load]);

  const applyList = (next: any) => {
    setActiveList(next);
    setLists((ls) => ls.map((l) => (l.id === next.id ? next : l)));
  };

  const persistItems = async (items: any[]) => {
    if (!activeList) return;
    const prev = activeList;
    applyList({ ...activeList, items });
    try {
      const { data } = await shoppingApi.updateItems(activeList.id, items);
      applyList(data);
    } catch {
      applyList(prev);
    }
  };

  const createList = async () => {
    const { data } = await shoppingApi.create();
    setLists((prev) => [data, ...prev]);
    setActiveList(data);
  };

  const toggleItem = (index: number) => {
    if (!activeList || index < 0 || index >= activeList.items.length) return;
    persistItems(
      activeList.items.map((item: any, i: number) =>
        i === index ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const removeItem = (index: number) => {
    if (!activeList) return;
    persistItems(activeList.items.filter((_: any, i: number) => i !== index));
  };

  const clearChecked = () => {
    if (!activeList) return;
    persistItems(activeList.items.filter((item: any) => !item.checked));
  };

  const addManualItem = async () => {
    const name = newItemName.trim();
    if (!activeList || !name || adding) return;
    setAdding(true);
    setNewItemName("");
    await persistItems([
      ...activeList.items,
      { name, amount: 0, unit: null, checked: false, from_recipe: null },
    ]);
    setAdding(false);
  };

  const deleteList = async (id: number) => {
    if (!confirm("למחוק את רשימת הקניות?")) return;
    await shoppingApi.delete(id);
    setLists((prev) => prev.filter((l) => l.id !== id));
    if (activeList?.id === id) setActiveList(null);
  };

  if (!user) {
    return (
      <PageFrame tone="terracotta" className="shopping-experience">
      <div className="max-w-xl mx-auto text-center py-20 animate-fade-up">
        <div className="w-20 h-20 card-surface flex items-center justify-center mx-auto mb-5">
          <ShoppingCart className="w-10 h-10 text-bark-200" />
        </div>
        <p className="section-title text-bark-500 mb-2">
          התחברו כדי לנהל רשימת קניות
        </p>
        <p className="text-bark-300 text-sm mb-6">כל המצרכים במקום אחד</p>
        <button onClick={() => router.push("/login")} className="btn-block">
          התחברות
        </button>
      </div>
      </PageFrame>
    );
  }

  if (loading) {
    return (
      <PageFrame tone="terracotta" className="shopping-experience">
        <RecipeLoading label="מסדרת את רשימת הקניות" />
      </PageFrame>
    );
  }

  const items = activeList?.items || [];
  const checkedCount = items.filter((i: any) => i.checked).length;
  const totalCount = items.length;
  const uncheckedItems = items
    .map((item: any, index: number) => ({ item, index }))
    .filter(({ item }: { item: any }) => !item.checked);
  const checkedItems = items
    .map((item: any, index: number) => ({ item, index }))
    .filter(({ item }: { item: any }) => item.checked);

  return (
    <PageFrame tone="terracotta" className="shopping-experience">
    <div className="max-w-2xl mx-auto relative z-10">
      <header className="experience-hero experience-hero--shopping flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7 animate-fade-up">
        <span className="shopping-hero-accent" aria-hidden="true" />
        <div>
          <span className="eyebrow mb-3">
            <span className="plus-badge text-bark-500">
              <Plus className="w-3.5 h-3.5" strokeWidth={2.4} />
            </span>
            ניהול קניות
          </span>
          <h1 className="display-lg text-bark-500">רשימת קניות</h1>
        </div>
        <button onClick={createList} className="flex items-center gap-2 btn-block text-sm shrink-0">
          <Plus className="w-4 h-4" /> רשימה חדשה
        </button>
      </header>

      {lists.length === 0 ? (
        <div className="text-center py-20 animate-fade-up">
          <div className="w-20 h-20 card-surface flex items-center justify-center mx-auto mb-5">
            <ShoppingCart className="w-10 h-10 text-bark-200" />
          </div>
          <p className="section-title text-bark-500 mb-2">אין רשימות קניות עדיין</p>
          <p className="text-bark-300 text-sm mb-6">צרו רשימה או הוסיפו מצרכים מדף מתכון</p>
          <button type="button" onClick={createList} className="btn-block">
            רשימה ראשונה
          </button>
        </div>
      ) : (
        <>
          {lists.length > 1 && (
            <div className="experience-tabs flex gap-2 mb-5 overflow-x-auto pb-2 animate-fade-up">
              {lists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => setActiveList(list)}
                  className={cn(
                    "px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all border",
                    activeList?.id === list.id
                      ? "btn-fire border-transparent text-cream-50"
                      : "bg-surface-50 border-surface-400 text-bark-300 hover:border-cinnamon-300 hover:text-cinnamon-500"
                  )}
                >
                  {list.name}
                </button>
              ))}
            </div>
          )}

          {activeList && (
            <div className="shopping-board card-surface overflow-hidden animate-fade-up">
              <div className="flex items-center justify-between px-5 py-4 border-b border-surface-300">
                <div>
                  <h2 className="section-title text-bark-500">{activeList.name}</h2>
                  <p className="text-xs text-bark-200 mt-0.5">
                    {checkedCount} מתוך {totalCount} פריטים
                    {totalCount > 0 && (
                      <span className="mr-2 text-cinnamon-500 font-semibold">
                        ({Math.round((checkedCount / totalCount) * 100)}%)
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {checkedCount > 0 && (
                    <button
                      type="button"
                      onClick={clearChecked}
                      className="px-3 py-2 text-xs font-bold text-cinnamon-500 hover:bg-cinnamon-50 transition-colors"
                    >
                      נקה נרכשים
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteList(activeList.id)}
                    className="p-2 text-bark-200 hover:text-red-500 hover:bg-red-50 transition-all"
                    aria-label="מחיקת הרשימה"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {totalCount > 0 && (
                <div className="h-1 bg-surface-300">
                  <div
                    className="h-full bg-cinnamon-500 transition-all duration-500"
                    style={{ width: `${(checkedCount / totalCount) * 100}%` }}
                  />
                </div>
              )}

              <form
                className="flex items-end gap-2 px-5 py-4 border-b border-surface-300"
                onSubmit={(e) => {
                  e.preventDefault();
                  addManualItem();
                }}
              >
                <input
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="הוסיפי פריט..."
                  className="input-dark flex-1"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={!newItemName.trim() || adding}
                  className="btn-fire h-11 min-h-0 px-4 disabled:opacity-30"
                >
                  {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span className="mr-1.5 text-sm">הוספה</span>
                </button>
              </form>

              {uncheckedItems.length > 0 && (
                <ul>
                  {uncheckedItems.map(({ item, index }: { item: any; index: number }) => (
                    <li
                      key={`open-${index}-${item.name}`}
                      className="flex items-stretch border-b border-surface-200 last:border-b-0 group hover:bg-surface-100/70"
                    >
                      <button
                        type="button"
                        onClick={() => toggleItem(index)}
                        role="checkbox"
                        aria-checked={false}
                        aria-label={`סימון ${item.name}`}
                        className="flex-1 flex items-center gap-3.5 px-5 py-4 text-right min-w-0 min-h-[64px] cursor-pointer"
                      >
                        <span className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-bark-200 group-hover:border-cinnamon-500 group-hover:bg-cinnamon-50 transition-colors" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {item.amount > 0 && (
                              <span className="text-sm font-semibold text-cinnamon-500 flex-shrink-0 bg-cinnamon-50 px-2 py-0.5">
                                {item.amount} {item.unit || ""}
                              </span>
                            )}
                            <span className="text-sm text-bark-500 font-medium">{item.name}</span>
                          </div>
                          {item.from_recipe && (
                            <p className="text-xs text-bark-200 mt-0.5">{item.from_recipe}</p>
                          )}
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="px-4 min-w-[48px] text-bark-200 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        aria-label={`מחיקת ${item.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {checkedItems.length > 0 && (
                <>
                  <div className="px-5 py-2.5 border-t border-surface-300 bg-surface-100">
                    <p className="text-xs text-bark-200 font-bold">נרכש ({checkedItems.length})</p>
                  </div>
                  <ul>
                    {checkedItems.map(({ item, index }: { item: any; index: number }) => (
                      <li
                        key={`done-${index}-${item.name}`}
                        className="flex items-stretch border-b border-surface-200 last:border-b-0 group"
                      >
                        <button
                          type="button"
                          onClick={() => toggleItem(index)}
                          role="checkbox"
                          aria-checked={true}
                          aria-label={`ביטול סימון ${item.name}`}
                          className="flex-1 flex items-center gap-3.5 px-5 py-3.5 text-right min-w-0 min-h-[56px] opacity-50 hover:opacity-80 cursor-pointer"
                        >
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-cinnamon-500 text-surface-100 flex items-center justify-center">
                            <Check className="w-4 h-4" strokeWidth={2.5} />
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {item.amount > 0 && (
                                <span className="text-sm text-bark-200 line-through flex-shrink-0">
                                  {item.amount} {item.unit || ""}
                                </span>
                              )}
                              <span className="text-sm text-bark-200 line-through truncate">{item.name}</span>
                            </div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="px-4 min-w-[48px] text-bark-200 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                          aria-label={`מחיקת ${item.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {totalCount === 0 && (
                <div className="text-center py-10">
                  <p className="text-bark-200 text-sm">הרשימה ריקה — הוסיפו פריט למעלה</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
    </PageFrame>
  );
}
