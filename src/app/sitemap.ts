import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const lastModified = new Date();
  return [
    { url: base, lastModified, changeFrequency: "daily", priority: 1 },
    { url: `${base}/search`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/pricing`, lastModified, changeFrequency: "monthly", priority: 0.4 },
  ];
}
