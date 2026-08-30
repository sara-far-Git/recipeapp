"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { usersApi, uploadApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import RecipeCard from "@/components/recipe/RecipeCard";
import { Loader2, Pencil, X, Camera, BookOpen, Heart, Users, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

function ProfilePageContent() {
  const params = useParams();
  const router = useRouter();
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

  const switchTab = (tab: "recipes" | "saved") => {
    setActiveTab(tab);
    const href = tab === "saved" ? `/profile/${username}?tab=saved` : `/profile/${username}`;
    router.replace(href, { scroll: false });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-cinnamon-500" />
      </div>
    );
  }

  if (!profile) {
    return <p className="text-center text-bark-300 py-20">משתמש לא נמצא</p>;
  }

  const displayRecipes = activeTab === "saved" ? savedRecipes : recipes;
  const recipeCount = isOwn ? recipes.length : profile.recipes_count;

  return (
    <div className="max-w-5xl mx-auto">
      {editOpen && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-bark-600/60 backdrop-blur-sm" onClick={() => setEditOpen(false)} />
          <div className="relative w-full sm:max-w-md bg-surface-50 border border-surface-300 shadow-warm-lg">
            <div className="flex items-center justify-between p-5 border-b border-surface-300">
              <h3 className="section-title text-bark-500">עריכת פרופיל</h3>
              <button
                onClick={() => setEditOpen(false)}
                className="p-1.5 hover:bg-surface-200 transition-colors text-bark-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  {editAvatar ? (
                    <img src={editAvatar} alt="" className="w-16 h-16 object-cover" />
                  ) : (
                    <div className="w-16 h-16 bg-cinnamon-50 border border-cinnamon-200 flex items-center justify-center">
                      <span className="text-2xl font-bold text-cinnamon-500">
                        {username[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <label className="absolute -bottom-1 -left-1 w-7 h-7 bg-cinnamon-500 flex items-center justify-center cursor-pointer hover:bg-cinnamon-600 transition-colors">
                    {avatarUploading ? (
                      <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                    ) : (
                      <Camera className="w-3.5 h-3.5 text-white" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={avatarUploading}
                    />
                  </label>
                </div>
                <p className="text-sm text-bark-300">לחצו על המצלמה להחלפת תמונה</p>
              </div>

              <div className="field-row">
                <label className="input-label">שם מלא</label>
                <input
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  placeholder="השם שיוצג"
                  className="input-dark"
                />
              </div>

              <div className="field-row">
                <label className="input-label">ביוגרפיה</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="ספרו קצת על עצמכם..."
                  rows={3}
                  className="input-dark resize-none"
                />
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={editSaving}
                className="w-full py-3.5 btn-fire font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {editSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "שמירת שינויים"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10 animate-fade-up">
        <div className="flex items-start gap-5 min-w-0">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover shrink-0"
              style={{ border: "1px solid rgba(232,235,231,0.12)" }}
            />
          ) : (
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center"
              style={{ background: "#3a2618" }}
            >
              <span className="text-3xl font-extrabold text-surface-50">
                {(profile.full_name || username)[0].toUpperCase()}
              </span>
            </div>
          )}
          <div className="min-w-0">
            <span className="eyebrow mb-2">
              <span className="plus-badge text-bark-500">
                <BookOpen className="w-3.5 h-3.5" strokeWidth={2.4} />
              </span>
              {isOwn ? "הספר שלכם" : "ספר מתכונים"}
            </span>
            <h1 className="display-md text-bark-500 leading-none mb-1">
              {profile.full_name || profile.username}
            </h1>
            <p className="text-bark-200 text-sm">@{profile.username}</p>
            {profile.bio && (
              <p className="text-bark-300 text-sm mt-3 leading-relaxed max-w-lg">{profile.bio}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isOwn && (
            <>
              <button onClick={openEdit} className="btn-outline h-12 min-h-0 px-4 text-sm">
                <Pencil className="w-4 h-4 ml-1.5" />
                עריכה
              </button>
              <Link href="/recipe/new" className="btn-block h-12 min-h-0 px-4 text-sm">
                <Plus className="w-4 h-4 ml-1.5" />
                מתכון חדש
              </Link>
            </>
          )}
          {currentUser && !isOwn && (
            <button
              onClick={handleFollow}
              className={cn("h-12 min-h-0 px-6 text-sm", isFollowing ? "btn-outline" : "btn-block")}
            >
              {isFollowing ? "עוקב/ת" : "מעקב"}
            </button>
          )}
        </div>
      </div>

      <div
        className="flex items-end gap-8 mb-8 pb-4 animate-fade-up"
        style={{ borderBottom: "1px solid rgba(232,235,231,0.12)", animationDelay: "60ms" }}
      >
        <Stat n={recipeCount} label="מתכונים" icon={BookOpen} />
        <Stat n={profile.followers_count} label="עוקבים" icon={Users} />
        <Stat n={profile.following_count} label="נעקבים" icon={Heart} />
      </div>

      <div className="flex items-center gap-1 mb-8 animate-fade-up" style={{ animationDelay: "90ms" }}>
        <TabButton active={activeTab === "recipes"} onClick={() => switchTab("recipes")}>
          המתכונים ({recipes.length})
        </TabButton>
        {isOwn && (
          <TabButton active={activeTab === "saved"} onClick={() => switchTab("saved")}>
            השמורים ({savedRecipes.length})
          </TabButton>
        )}
      </div>

      {displayRecipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {displayRecipes.map((recipe: any, i: number) => (
            <div
              key={recipe.id}
              className="animate-slide-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <RecipeCard recipe={recipe} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 animate-fade-up">
          <div className="w-16 h-16 mx-auto mb-4 card-surface flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-bark-200" />
          </div>
          <p className="section-title text-bark-500 mb-2">
            {activeTab === "saved" ? "אין מתכונים שמורים עדיין" : "אין מתכונים עדיין"}
          </p>
          {isOwn && activeTab === "recipes" && (
            <Link href="/recipe/new" className="btn-block mt-5 inline-flex">
              <Plus className="w-4 h-4 ml-1.5" />
              כתיבת מתכון
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ n, label, icon: Icon }: { n: number; label: string; icon: typeof BookOpen }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[13px] text-bark-200 mb-0.5">
        <Icon className="w-3.5 h-3.5 text-cinnamon-500" strokeWidth={1.8} />
        {label}
      </p>
      <p className="text-2xl font-extrabold text-bark-500 leading-none" style={{ letterSpacing: "-0.04em" }}>
        {n}
      </p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative px-4 py-2 text-sm font-bold transition-colors",
        active ? "text-cinnamon-500" : "text-bark-200 hover:text-bark-500"
      )}
    >
      {children}
      <span
        className="absolute bottom-0 right-4 left-4 h-[1.5px] bg-current"
        style={{
          transform: active ? "scaleX(1)" : "scaleX(0)",
          transformOrigin: "right",
          transition: "transform 0.35s cubic-bezier(0.16,1,0.3,1)",
        }}
      />
    </button>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-cinnamon-500" />
        </div>
      }
    >
      <ProfilePageContent />
    </Suspense>
  );
}
