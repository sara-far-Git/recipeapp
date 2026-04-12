"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { usersApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import RecipeCard from "@/components/recipe/RecipeCard";
import Button from "@/components/ui/Button";
import { UserCircle, Loader2 } from "lucide-react";
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
      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-5">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
              <UserCircle className="w-12 h-12 text-primary-400" />
            </div>
          )}

          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">
              {profile.full_name || profile.username}
            </h1>
            <p className="text-gray-500 text-sm">@{profile.username}</p>
            {profile.bio && <p className="text-gray-600 text-sm mt-2">{profile.bio}</p>}

            <div className="flex items-center gap-5 mt-3 text-sm">
              <span>
                <strong>{profile.recipes_count}</strong>{" "}
                <span className="text-gray-500">מתכונים</span>
              </span>
              <span>
                <strong>{profile.followers_count}</strong>{" "}
                <span className="text-gray-500">עוקבים</span>
              </span>
              <span>
                <strong>{profile.following_count}</strong>{" "}
                <span className="text-gray-500">נעקבים</span>
              </span>
            </div>
          </div>

          {currentUser && !isOwn && (
            <Button
              variant={isFollowing ? "secondary" : "primary"}
              size="sm"
              onClick={handleFollow}
            >
              {isFollowing ? "עוקב/ת" : "מעקב"}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("recipes")}
          className={cn(
            "flex-1 pb-3 text-sm font-medium text-center transition-colors border-b-2",
            activeTab === "recipes"
              ? "border-primary-500 text-primary-500"
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          המתכונים ({recipes.length})
        </button>
        {isOwn && (
          <button
            onClick={() => setActiveTab("saved")}
            className={cn(
              "flex-1 pb-3 text-sm font-medium text-center transition-colors border-b-2",
              activeTab === "saved"
                ? "border-primary-500 text-primary-500"
                : "border-transparent text-gray-500 hover:text-gray-700"
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
