"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { shoppingApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Button from "@/components/ui/Button";
import {
  ShoppingCart, Trash2, Plus, Check, Circle, Loader2,
} from "lucide-react";

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
      if (data.length > 0 && !activeList) {
        setActiveList(data[0]);
      }
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
    const items = [...activeList.items, { name: newItemName.trim(), amount: 0, unit: null, checked: false, from_recipe: null }];
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
        <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-400 mb-4">התחברו כדי לנהל רשימת קניות</p>
        <Button onClick={() => router.push("/login")}>התחברות</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const checkedCount = activeList?.items?.filter((i: any) => i.checked).length || 0;
  const totalCount = activeList?.items?.length || 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">רשימת קניות</h1>
        <Button variant="secondary" size="sm" onClick={createList}>
          <Plus className="w-4 h-4 ml-1" />
          רשימה חדשה
        </Button>
      </div>

      {lists.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">אין רשימות קניות עדיין</p>
          <p className="text-sm text-gray-400">צרו רשימה או הוסיפו מצרכים מדף מתכון</p>
        </div>
      ) : (
        <>
          {lists.length > 1 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {lists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => setActiveList(list)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                    activeList?.id === list.id
                      ? "bg-primary-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {list.name}
                </button>
              ))}
            </div>
          )}

          {activeList && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <div>
                  <h2 className="font-bold">{activeList.name}</h2>
                  <p className="text-xs text-gray-400">{checkedCount}/{totalCount} פריטים</p>
                </div>
                <button onClick={() => deleteList(activeList.id)} className="p-2 text-gray-300 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Add manual item */}
              <div className="flex gap-2 px-5 py-3 border-b border-gray-50">
                <input
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addManualItem()}
                  placeholder="הוסיפו פריט..."
                  className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-500"
                />
                <Button size="sm" onClick={addManualItem} disabled={!newItemName.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Items */}
              <ul>
                {activeList.items?.map((item: any, i: number) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 last:border-b-0"
                  >
                    <button onClick={() => toggleItem(i)}>
                      {item.checked ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300" />
                      )}
                    </button>
                    <div className={`flex-1 ${item.checked ? "line-through text-gray-400" : ""}`}>
                      <div className="flex items-center gap-2">
                        {item.amount > 0 && (
                          <span className="text-sm font-medium text-primary-600" dir="ltr">
                            {item.amount} {item.unit || ""}
                          </span>
                        )}
                        <span className="text-sm">{item.name}</span>
                      </div>
                      {item.from_recipe && (
                        <p className="text-xs text-gray-400 mt-0.5">{item.from_recipe}</p>
                      )}
                    </div>
                    <button onClick={() => removeItem(i)} className="p-1 text-gray-300 hover:text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>

              {totalCount === 0 && (
                <p className="text-center text-gray-400 py-8 text-sm">הרשימה ריקה</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
