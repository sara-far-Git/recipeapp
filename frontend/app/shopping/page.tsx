"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { shoppingApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { ShoppingCart, Trash2, Plus, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ShoppingListPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [lists, setLists] = useState<any[]>([]);
  const [activeList, setActiveList] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState("");

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

  const createList = async () => {
    const { data } = await shoppingApi.create();
    setLists((prev) => [data, ...prev]);
    setActiveList(data);
  };

  const toggleItem = async (index: number) => {
    if (!activeList) return;
    const items = [...activeList.items];
    items[index] = { ...items[index], checked: !items[index].checked };
    const { data } = await shoppingApi.updateItems(activeList.id, items);
    setActiveList(data);
  };

  const removeItem = async (index: number) => {
    if (!activeList) return;
    const items = activeList.items.filter((_: any, i: number) => i !== index);
    const { data } = await shoppingApi.updateItems(activeList.id, items);
    setActiveList(data);
  };

  const addManualItem = async () => {
    if (!activeList || !newItemName.trim()) return;
    const items = [
      ...activeList.items,
      { name: newItemName.trim(), amount: 0, unit: null, checked: false, from_recipe: null },
    ];
    const { data } = await shoppingApi.updateItems(activeList.id, items);
    setActiveList(data);
    setNewItemName("");
  };

  const deleteList = async (id: number) => {
    await shoppingApi.delete(id);
    setLists((prev) => prev.filter((l) => l.id !== id));
    if (activeList?.id === id) setActiveList(null);
  };

  if (!user) {
    return (
      <div className="text-center py-20 animate-fade-up">
        <div className="w-20 h-20 card-surface flex items-center justify-center mx-auto mb-5 rounded-3xl">
          <ShoppingCart className="w-10 h-10 text-bark-100" />
        </div>
        <p className="text-bark-400 mb-2 font-semibold" style={{ fontFamily: "'Heebo', sans-serif" }}>
          התחברי כדי לנהל רשימת קניות
        </p>
        <p className="text-bark-300 text-sm mb-6" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}>
          שמרי את כל המצרכים במקום אחד
        </p>
        <button onClick={() => router.push("/login")}
          className="px-7 py-3 rounded-md btn-fire font-semibold uppercase tracking-widest text-sm">
          התחברות
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-cinnamon-500" />
      </div>
    );
  }

  const checkedCount = activeList?.items?.filter((i: any) => i.checked).length || 0;
  const totalCount = activeList?.items?.length || 0;
  const uncheckedItems = activeList?.items?.filter((i: any) => !i.checked) || [];
  const checkedItems = activeList?.items?.filter((i: any) => i.checked) || [];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-up">
        <div>
          <div className="inline-flex items-center gap-3 text-xs font-semibold uppercase mb-2"
            style={{ color: "#5a3e2a", letterSpacing: "0.28em", fontFamily: "'Heebo', sans-serif" }}>
            <span className="inline-block w-8 h-px bg-smoke-200" />
            ניהול קניות
            <span className="inline-block w-8 h-px bg-smoke-200" />
          </div>
          <h1 className="text-bark-500"
            style={{ fontFamily: "'Heebo', sans-serif", fontSize: "clamp(1.8rem,3.5vw,2.4rem)", fontWeight: 800, letterSpacing: "-0.025em" }}>
            רשימת קניות
          </h1>
        </div>
        <button onClick={createList}
          className="flex items-center gap-2 px-5 py-2.5 rounded-md btn-fire text-sm font-semibold uppercase tracking-widest">
          <Plus className="w-4 h-4" /> רשימה חדשה
        </button>
      </div>

      {lists.length === 0 ? (
        <div className="text-center py-20 animate-fade-up">
          <div className="w-20 h-20 card-surface flex items-center justify-center mx-auto mb-5 rounded-3xl">
            <ShoppingCart className="w-10 h-10 text-bark-100" />
          </div>
          <p className="text-bark-400 font-semibold mb-2" style={{ fontFamily: "'Heebo', sans-serif" }}>
            אין רשימות קניות עדיין
          </p>
          <p className="text-bark-300 text-sm" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}>
            צרי רשימה או הוסיפי מצרכים מדף מתכון
          </p>
        </div>
      ) : (
        <>
          {/* List tabs */}
          {lists.length > 1 && (
            <div className="flex gap-2 mb-5 overflow-x-auto pb-2 animate-fade-up">
              {lists.map((list) => (
                <button key={list.id} onClick={() => setActiveList(list)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border",
                    activeList?.id === list.id
                      ? "btn-fire border-transparent text-white"
                      : "bg-surface-50 border-surface-400 text-bark-300 hover:border-cinnamon-300 hover:text-cinnamon-500"
                  )}>
                  {list.name}
                </button>
              ))}
            </div>
          )}

          {activeList && (
            <div className="card-surface overflow-hidden animate-fade-up">
              {/* List header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-surface-300">
                <div>
                  <h2 className="font-bold text-bark-500" style={{ fontFamily: "'Heebo', sans-serif" }}>
                    {activeList.name}
                  </h2>
                  <p className="text-xs text-bark-200 mt-0.5">
                    {checkedCount} מתוך {totalCount} פריטים
                    {totalCount > 0 && (
                      <span className="mr-2 text-cinnamon-500 font-semibold">
                        ({Math.round((checkedCount / totalCount) * 100)}%)
                      </span>
                    )}
                  </p>
                </div>
                <button onClick={() => deleteList(activeList.id)}
                  className="p-2 rounded-xl text-bark-100 hover:text-red-500 hover:bg-red-50 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Progress bar */}
              {totalCount > 0 && (
                <div className="h-1 bg-surface-300">
                  <div className="h-full bg-cinnamon-500 transition-all duration-500"
                    style={{ width: `${(checkedCount / totalCount) * 100}%` }} />
                </div>
              )}

              {/* Add manual item */}
              <div className="flex gap-2 px-5 py-3 border-b border-surface-300">
                <input value={newItemName} onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addManualItem()}
                  placeholder="הוסיפי פריט..."
                  className="input-dark flex-1" />
                <button onClick={addManualItem} disabled={!newItemName.trim()}
                  className="px-4 py-2.5 rounded-xl btn-fire disabled:opacity-30 transition-all">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Unchecked items */}
              {uncheckedItems.length > 0 && (
                <ul>
                  {uncheckedItems.map((item: any) => {
                    const i = activeList.items.indexOf(item);
                    return (
                      <li key={i}
                        className="flex items-center gap-3 px-5 py-4 border-b border-surface-200 last:border-b-0 group hover:bg-surface-100/50 transition-colors">
                        <button onClick={() => toggleItem(i)}
                          className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-surface-400 hover:border-cinnamon-400 transition-all" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {item.amount > 0 && (
                              <span className="text-sm font-semibold text-cinnamon-500 flex-shrink-0 bg-cinnamon-50 px-2 py-0.5 rounded-md" dir="ltr">
                                {item.amount} {item.unit || ""}
                              </span>
                            )}
                            <span className="text-sm text-bark-400 truncate">{item.name}</span>
                          </div>
                          {item.from_recipe && (
                            <p className="text-xs text-bark-200 mt-0.5">{item.from_recipe}</p>
                          )}
                        </div>
                        <button onClick={() => removeItem(i)}
                          className="p-1.5 rounded-lg text-bark-100 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* Checked items */}
              {checkedItems.length > 0 && (
                <>
                  <div className="px-5 py-2.5 border-t border-surface-300 bg-surface-100">
                    <p className="text-xs text-bark-200 font-semibold uppercase tracking-wide">נרכש ({checkedItems.length})</p>
                  </div>
                  <ul>
                    {checkedItems.map((item: any) => {
                      const i = activeList.items.indexOf(item);
                      return (
                        <li key={i}
                          className="flex items-center gap-3 px-5 py-3.5 border-b border-surface-200 last:border-b-0 group opacity-50">
                          <button onClick={() => toggleItem(i)} className="flex-shrink-0">
                            <Check className="w-5 h-5 text-cinnamon-500" />
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {item.amount > 0 && (
                                <span className="text-sm text-bark-200 line-through flex-shrink-0" dir="ltr">
                                  {item.amount} {item.unit || ""}
                                </span>
                              )}
                              <span className="text-sm text-bark-200 line-through truncate">{item.name}</span>
                            </div>
                          </div>
                          <button onClick={() => removeItem(i)}
                            className="p-1.5 rounded-lg text-bark-100 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}

              {totalCount === 0 && (
                <div className="text-center py-10">
                  <p className="text-bark-200 text-sm" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}>
                    הרשימה ריקה — הוסיפי פריט למעלה
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
