"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { usersApi, uploadApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import RecipeCard from "@/components/recipe/RecipeCard";
import Button from "@/components/ui/Button";
import { Loader2, Pencil, X, Camera, BookOpen, Heart, Users } from "lucide-react";
import { cn } from "@/lib/utils";

function ProfilePageContent() {
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
          try { const { data: savedData } = await usersApi.getSaved(username); setSavedRecipes(savedData); } catch {}
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
    try { const { data } = await uploadApi.upload(file); setEditAvatar(data.url); } catch {}
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
        <Loader2 className="w-8 h-8 animate-spin text-cinnamon-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <p className="text-center text-bark-300 py-20"
        style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}>
        משתמש לא נמצא
      </p>
    );
  }

  const displayRecipes = activeTab === "saved" ? savedRecipes : recipes;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Edit profile modal */}
      {editOpen && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-bark-600/60 backdrop-blur-sm" onClick={() => setEditOpen(false)} />
          <div className="relative w-full sm:max-w-md bg-surface-50 rounded-t-3xl sm:rounded-3xl border border-surface-300 shadow-warm-lg">
            <div className="flex items-center justify-between p-5 border-b border-surface-300">
              <h3 className="font-bold text-bark-500" style={{ fontFamily: "'Heebo', sans-serif" }}>עריכת פרופיל</h3>
              <button onClick={() => setEditOpen(false)}
                className="p-1.5 rounded-xl hover:bg-surface-200 transition-colors text-bark-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  {editAvatar ? (
                    <img src={editAvatar} alt="" className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-cinnamon-50 border border-cinnamon-200 flex items-center justify-center">
                      <span className="text-2xl font-bold text-cinnamon-500"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}>
                        {username[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <label className="absolute -bottom-1 -left-1 w-7 h-7 bg-cinnamon-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-cinnamon-600 transition-colors">
                    {avatarUploading
                      ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                      : <Camera className="w-3.5 h-3.5 text-white" />}
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={avatarUploading} />
                  </label>
                </div>
                <p className="text-sm text-bark-300">לחצי על המצלמה להחלפת תמונה</p>
              </div>

              <div className="field-row">
                <label className="input-label">שם מלא</label>
                <input value={editFullName} onChange={(e) => setEditFullName(e.target.value)}
                  placeholder="השם שיוצג" className="input-dark" />
              </div>

              <div className="field-row">
                <label className="input-label">ביוגרפיה</label>
                <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)}
                  placeholder="ספרי קצת על עצמך..." rows={3} className="input-dark resize-none" />
              </div>

              <button onClick={handleSaveProfile} disabled={editSaving}
                className="w-full py-3.5 rounded-xl btn-fire font-semibold disabled:opacity-40 flex items-center justify-center gap-2">
                {editSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "שמירת שינויים"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile header */}
      <div className="card-surface p-6 mb-6 animate-fade-up">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.username}
                className="w-24 h-24 rounded-full object-cover ring-2 ring-cinnamon-200" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-cinnamon-500 flex items-center justify-center">
                <span className="text-4xl font-bold text-white"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}>
                  {username[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h1 className="font-bold text-bark-500 text-xl leading-tight"
                  style={{ fontFamily: "'Heebo', sans-serif", letterSpacing: "-0.02em" }}>
                  {profile.full_name || profile.username}
                </h1>
                <p className="text-bark-200 text-sm">@{profile.username}</p>
              </div>
              {currentUser && !isOwn && (
                <button onClick={handleFollow}
                  className={cn("px-5 py-2 rounded-md text-sm font-semibold transition-all",
                    isFollowing ? "btn-outline" : "btn-fire")}>
                  {isFollowing ? "עוקב/ת" : "מעקב"}
                </button>
              )}
              {isOwn && (
                <button onClick={openEdit}
                  className="p-2.5 rounded-xl hover:bg-surface-200 transition-colors text-bark-200 hover:text-cinnamon-500">
                  <Pencil className="w-5 h-5" />
                </button>
              )}
            </div>

            {profile.bio && (
              <p className="text-bark-300 text-sm mb-3 leading-relaxed"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}>
                {profile.bio}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-100 border border-surface-300">
                <BookOpen className="w-4 h-4 text-cinnamon-500" />
                <span className="text-sm font-bold text-bark-500">{profile.recipes_count}</span>
                <span className="text-xs text-bark-200">מתכונים</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-100 border border-surface-300">
                <Users className="w-4 h-4 text-cinnamon-500" />
                <span className="text-sm font-bold text-bark-500">{profile.followers_count}</span>
                <span className="text-xs text-bark-200">עוקבים</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-100 border border-surface-300">
                <Heart className="w-4 h-4 text-cinnamon-500" />
                <span className="text-sm font-bold text-bark-500">{profile.following_count}</span>
                <span className="text-xs text-bark-200">נעקבים</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-400 mb-6 animate-fade-up" style={{ animationDelay: "60ms" }}>
        <button
          onClick={() => setActiveTab("recipes")}
          className={cn(
            "flex-1 pb-3.5 text-sm font-semibold text-center transition-all border-b-2",
            activeTab === "recipes"
              ? "border-cinnamon-500 text-cinnamon-500"
              : "border-transparent text-bark-200 hover:text-bark-400"
          )}>
          המתכונים ({recipes.length})
        </button>
        {isOwn && (
          <button
            onClick={() => setActiveTab("saved")}
            className={cn(
              "flex-1 pb-3.5 text-sm font-semibold text-center transition-all border-b-2",
              activeTab === "saved"
                ? "border-cinnamon-500 text-cinnamon-500"
                : "border-transparent text-bark-200 hover:text-bark-400"
            )}>
            השמורים ({savedRecipes.length})
          </button>
        )}
      </div>

      {/* Recipe grid */}
      {displayRecipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayRecipes.map((recipe: any, i: number) => (
            <div key={recipe.id} className="animate-slide-up opacity-0"
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: "forwards" }}>
              <RecipeCard recipe={recipe} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 animate-fade-up">
          <div className="w-16 h-16 mx-auto mb-4 card-surface flex items-center justify-center rounded-2xl">
            <BookOpen className="w-8 h-8 text-bark-100" />
          </div>
          <p className="text-bark-300 text-base" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}>
            {activeTab === "saved" ? "אין מתכונים שמורים עדיין" : "אין מתכונים עדיין"}
          </p>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-cinnamon-500" />
      </div>
    }>
      <ProfilePageContent />
    </Suspense>
  );
}
