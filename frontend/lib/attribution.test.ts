import { describe, expect, it } from "vitest";
import { chefName, publicAttribution, canEditChef } from "./attribution";

describe("public recipe attribution", () => {
  it("omits hidden credits from recipes and public identities", () => {
    for (const full_name of ["שרה פרקש", "רבקי פרקש", "Sara Farkash"]) {
      const recipe = { author: { id: 3, username: "personal_account", full_name } };
      expect(chefName(recipe)).toBe("");
      const result = publicAttribution(recipe);
      expect(result.author.username).toBe("community-3");
      expect(result.author.full_name).toBe("מערכת האתר");
      expect(chefName(result)).toBe("");
    }
  });
  it("uses the recipe credit instead of the uploader", () => {
    const recipe = { chef_name: "שף לדוגמה", author: { attribution_hidden: true } };
    expect(chefName(recipe)).toBe("שף לדוגמה");
    expect(chefName({ ...recipe, chef_name: "שרה פרקש" })).toBe("");
  });
  it("retains ordinary public authors and limits the editor", () => {
    expect(chefName({ author: { full_name: "שף אחר" } })).toBe("שף אחר");
    expect(canEditChef({ email: "s3296900@gmail.com" })).toBe(true);
    expect(canEditChef({ email: "someone@example.com" })).toBe(false);
  });
});
