import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        // "/profile/" stays crawlable: the API answers 404 for every profile
        // whose owner has not turned the public toggle on, so only the cooks
        // who asked to be found can be found.
        "/login", "/register", "/shopping", "/recipe/new",
        "/preview/", "/admin",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
