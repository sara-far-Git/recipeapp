const HIDDEN_NAMES = new Set(["שרה פרקש", "שרי פרקש", "רבקי פרקש", "רבקה פרקש", "sara farkash", "sarah farkash", "rivky farkash", "rivki farkash"]);
export const isHiddenName = (name?: string | null) => HIDDEN_NAMES.has((name || "").trim().toLowerCase().replace(/\s+/g, " "));
export const hiddenAuthor = (author: any) => Boolean(author?.attribution_hidden || isHiddenName(author?.full_name) || isHiddenName(author?.username));
export const chefName = (recipe: any): string => {
  const credit = recipe?.chef_name?.trim();
  if (credit && !isHiddenName(credit)) return credit;
  return hiddenAuthor(recipe?.author) ? "" : recipe?.author?.full_name || recipe?.author?.username || "";
};
export const canEditChef = (user: any) => user?.email?.trim().toLowerCase() === "s3296900@gmail.com";

// Compatibility with an API deployment that still returns the old public identity.
export function publicAttribution(value: any): any {
  if (Array.isArray(value)) return value.map(publicAttribution);
  if (!value || typeof value !== "object") return value;
  const result = Object.fromEntries(Object.entries(value).map(([key, item]) => [key, publicAttribution(item)]));
  if (typeof result.username === "string" && hiddenAuthor(result)) {
    return { ...result, full_name: "מערכת האתר", username: `community-${result.id}`, bio: null, avatar_url: null, attribution_hidden: true };
  }
  return result;
}
