"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { shoppingApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Button from "@/components/ui/Button";
import { ShoppingCart, Trash2, Plus, Check, Circle, Loader2 } from "lucide-react";
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
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-surface-200 flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="w-8 h-8 text-gray-600" />
        </div>
        <p className="text-gray-400 mb-4">התחברי כדי לנהל רשימת קניות</p>
        <Button onClick={() => router.push("/login")}>התחברות</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-cinnamon-600" />
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
      <div className="flex items-center justify-between mb-6 animate-fade-up">
        <h1 className="font-display text-2xl font-bold text-gray-100">רשימת קניות</h1>
        <button
          onClick={createList}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-200 border border-surface-400 text-gray-300 hover:border-cinnamon-300 hover:text-cinnamon-500 transition-all text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          רשימה חדשה
        </button>
      </div>

      {lists.length === 0 ? (
        <div className="text-center py-20 animate-fade-up">
          <div className="w-20 h-20 rounded-3xl bg-surface-200 flex items-center justify-center mx-auto mb-5">
            <ShoppingCart className="w-10 h-10 text-gray-600" />
          </div>
          <p className="text-gray-400 mb-2">אין רשימות קניות עדיין</p>
          <p className="text-sm text-gray-600">צרי רשימה או הוסיפי מצרכים מדף מתכון</p>
        </div>
      ) : (
        <>
          {/* List tabs */}
          {lists.length > 1 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 animate-fade-up">
              {lists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => setActiveList(list)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all border",
                    activeList?.id === list.id
                      ? "btn-fire border-transparent text-white"
                      : "bg-surface-200 border-surface-300 text-gray-400 hover:border-surface-300"
                  )}
                >
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
                  <h2 className="font-bold text-gray-100">{activeList.name}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {checkedCount} מתוך {totalCount} פריטים
                    {totalCount > 0 && (
                      <span className="mr-2 text-cinnamon-600">
                        ({Math.round((checkedCount / totalCount) * 100)}%)
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => deleteList(activeList.id)}
                  className="p-2 rounded-xl text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Progress bar */}
              {totalCount > 0 && (
                <div className="h-0.5 bg-surface-300">
                  <div
                    className="h-full bg-gradient-to-l from-fire-400 to-fire-600 transition-all duration-500"
                    style={{ width: `${(checkedCount / totalCount) * 100}%` }}
                  />
                </div>
              )}

              {/* Add manual item */}
              <div className="flex gap-2 px-5 py-3 border-b border-surface-300">
                <input
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addManualItem()}
                  placeholder="הוסיפי פריט..."
                  className="input-dark flex-1 py-2"
                />
                <button
                  onClick={addManualItem}
                  disabled={!newItemName.trim()}
                  className="px-3 py-2 rounded-xl btn-fire disabled:opacity-30 transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Unchecked items */}
              {uncheckedItems.length > 0 && (
                <ul>
                  {uncheckedItems.map((item: any) => {
                    const i = activeList.items.indexOf(item);
                    return (
                      <li
                        key={i}
                        className="flex items-center gap-3 px-5 py-3.5 border-b border-surface-300 last:border-b-0 group"
                      >
                        <button
                          onClick={() => toggleItem(i)}
                          className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-white/20 hover:border-fire-400 transition-all"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {item.amount > 0 && (
                              <span className="text-sm font-semibold text-cinnamon-600 flex-shrink-0" dir="ltr">
                                {item.amount} {item.unit || ""}
                              </span>
                            )}
                            <span className="text-sm text-gray-200 truncate">{item.name}</span>
                          </div>
                          {item.from_recipe && (
                            <p className="text-xs text-gray-600 mt-0.5">{item.from_recipe}</p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(i)}
                          className="p-1.5 rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                        >
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
                  <div className="px-5 py-2 border-t border-surface-300">
                    <p className="text-xs text-gray-600 font-medium">נרכש ({checkedItems.length})</p>
                  </div>
                  <ul>
                    {checkedItems.map((item: any) => {
                      const i = activeList.items.indexOf(item);
                      return (
                        <li
                          key={i}
                          className="flex items-center gap-3 px-5 py-3 border-b border-surface-300 last:border-b-0 group opacity-50"
                        >
                          <button onClick={() => toggleItem(i)} className="flex-shrink-0">
                            <Check className="w-5 h-5 text-cinnamon-600" />
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {item.amount > 0 && (
                                <span className="text-sm text-gray-500 line-through flex-shrink-0" dir="ltr">
                                  {item.amount} {item.unit || ""}
                                </span>
                              )}
                              <span className="text-sm text-gray-500 line-through truncate">{item.name}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeItem(i)}
                            className="p-1.5 rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                          >
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
                  <p className="text-gray-600 text-sm">הרשימה ריקה — הוסיפי פריט למעלה</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
