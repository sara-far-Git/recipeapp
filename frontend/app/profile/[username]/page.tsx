"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { usersApi, uploadApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import RecipeCard from "@/components/recipe/RecipeCard";
import Button from "@/components/ui/Button";
import { UserCircle, Loader2, Pencil, X, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { user: currentUser } = useAuth();
  const username = params.username as string;

  const [profile, setProfile] = useState<any>(null);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"recipes" | "saved">(
    searchParams.get("tab") === "saved" ? "saved" : "recipes"
  );
  const [isFollowing, setIsFollowing] = useState(false);

  // Edit profile
  const [editOpen, setEditOpen] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const isOwn = currentUser?.username === username;

  useEffect(() => {
    const load = async () => {
      try {
        const { data: profileData } = await usersApi.getProfile(username);
        setProfile(profileData);
        const { data: recipesData } = await usersApi.getRecipes(username);
        setRecipes(recipesData);

        if (isOwn) {
          try {
            const { data: savedData } = await usersApi.getSaved(username);
            setSavedRecipes(savedData);
          } catch {}
        }

        if (currentUser && !isOwn) {
          const { data: following } = await usersApi.getFollowing(currentUser.username);
          setIsFollowing(following.some((u: any) => u.username === username));
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, [username, currentUser, isOwn]);

  const openEdit = () => {
    setEditFullName(profile.full_name || "");
    setEditBio(profile.bio || "");
    setEditAvatar(profile.avatar_url || "");
    setEditOpen(true);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const { data } = await uploadApi.upload(file);
      setEditAvatar(data.url);
    } catch {}
    setAvatarUploading(false);
  };

  const handleSaveProfile = async () => {
    setEditSaving(true);
    try {
      const { data } = await usersApi.updateMe({
        full_name: editFullName || undefined,
        bio: editBio || undefined,
        avatar_url: editAvatar || undefined,
      });
      setProfile((prev: any) => ({ ...prev, ...data }));
      setEditOpen(false);
    } catch {}
    setEditSaving(false);
  };

  const handleFollow = async () => {
    const { data } = await usersApi.toggleFollow(username);
    setIsFollowing(data.following);
    setProfile((prev: any) => ({
      ...prev,
      followers_count: prev.followers_count + (data.following ? 1 : -1),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!profile) {
    return <p className="text-center text-gray-400 py-20">משתמש לא נמצא</p>;
  }

  const displayRecipes = activeTab === "saved" ? savedRecipes : recipes;

  return (
    <div className="max-w-3xl mx-auto">

      {/* Edit profile modal */}
      {editOpen && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditOpen(false)} />
          <div className="relative w-full sm:max-w-md bg-surface-100 rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
              <h3 className="font-bold text-gray-100">עריכת פרופיל</h3>
              <button onClick={() => setEditOpen(false)} className="p-1.5 rounded-xl hover:bg-white/10 transition-colors text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  {editAvatar ? (
                    <img src={editAvatar} alt="" className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-surface-300 flex items-center justify-center">
                      <UserCircle className="w-10 h-10 text-gray-600" />
                    </div>
                  )}
                  <label className="absolute -bottom-1 -left-1 w-7 h-7 bg-fire-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-fire-400 transition-colors">
                    {avatarUploading ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Camera className="w-3.5 h-3.5 text-white" />}
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={avatarUploading} />
                  </label>
                </div>
                <p className="text-sm text-gray-500">לחצי על המצלמה להחלפת תמונה</p>
              </div>

              {/* Full name */}
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-1.5">שם מלא</label>
                <input value={editFullName} onChange={(e) => setEditFullName(e.target.value)} placeholder="השם שיוצג" className="input-dark w-full" />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-1.5">ביוגרפיה</label>
                <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="ספרי קצת על עצמך..." rows={3} className="input-dark w-full resize-none" />
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={editSaving}
                className="w-full py-3.5 rounded-2xl btn-fire font-semibold text-white disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {editSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "שמירת שינויים"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile header */}
      <div className="card-surface p-6 mb-6 animate-fade-up">
        <div className="flex items-start gap-5">
          <div className="relative flex-shrink-0">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.username} className="w-20 h-20 rounded-full object-cover ring-2 ring-fire-500/20" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-cinnamon-50 flex items-center justify-center">
                <UserCircle className="w-12 h-12 text-cinnamon-600/60" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="font-display text-xl font-bold text-gray-100">
                  {profile.full_name || profile.username}
                </h1>
                <p className="text-gray-500 text-sm">@{profile.username}</p>
              </div>
              {currentUser && !isOwn && (
                <Button variant={isFollowing ? "secondary" : "primary"} size="sm" onClick={handleFollow}>
                  {isFollowing ? "עוקב/ת" : "מעקב"}
                </Button>
              )}
              {isOwn && (
                <button onClick={openEdit} className="p-2 rounded-xl hover:bg-surface-200 transition-colors text-gray-500 hover:text-cinnamon-500">
                  <Pencil className="w-5 h-5" />
                </button>
              )}
            </div>

            {profile.bio && <p className="text-gray-400 text-sm mt-2 leading-relaxed">{profile.bio}</p>}

            <div className="flex items-center gap-5 mt-3 text-sm">
              <span>
                <strong className="text-gray-100">{profile.recipes_count}</strong>{" "}
                <span className="text-gray-500">מתכונים</span>
              </span>
              <span>
                <strong className="text-gray-100">{profile.followers_count}</strong>{" "}
                <span className="text-gray-500">עוקבים</span>
              </span>
              <span>
                <strong className="text-gray-100">{profile.following_count}</strong>{" "}
                <span className="text-gray-500">נעקבים</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.08] mb-6 animate-fade-up" style={{ animationDelay: "60ms" }}>
        <button
          onClick={() => setActiveTab("recipes")}
          className={cn(
            "flex-1 pb-3 text-sm font-semibold text-center transition-colors border-b-2",
            activeTab === "recipes"
              ? "border-fire-500 text-cinnamon-600"
              : "border-transparent text-gray-500 hover:text-gray-300"
          )}
        >
          המתכונים ({recipes.length})
        </button>
        {isOwn && (
          <button
            onClick={() => setActiveTab("saved")}
            className={cn(
              "flex-1 pb-3 text-sm font-semibold text-center transition-colors border-b-2",
              activeTab === "saved"
                ? "border-fire-500 text-cinnamon-600"
                : "border-transparent text-gray-500 hover:text-gray-300"
            )}
          >
            השמורים ({savedRecipes.length})
          </button>
        )}
      </div>

      {/* Recipes grid */}
      {displayRecipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayRecipes.map((recipe: any) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400 py-16">
          {activeTab === "saved" ? "אין מתכונים שמורים עדיין" : "אין מתכונים עדיין"}
        </p>
      )}
    </div>
  );
}
