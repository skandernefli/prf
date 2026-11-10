import type { MetadataRoute } from "next";

const siteUrl = "https://www.skandernefli.eu";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl },
    { url: `${siteUrl}/privacy` },
  ];
}
