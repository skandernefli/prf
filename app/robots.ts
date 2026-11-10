import type { MetadataRoute } from "next";

const siteUrl = "https://www.skandernefli.eu";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/test",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
