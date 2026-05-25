import type { MetadataRoute } from "next";
import { getPublishedPortfolios } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const items = await getPublishedPortfolios();

  return [
    { url: siteUrl, lastModified: new Date() },
    { url: `${siteUrl}/portfolio`, lastModified: new Date() },
    { url: `${siteUrl}/about`, lastModified: new Date() },
    { url: `${siteUrl}/contact`, lastModified: new Date() },
    ...items.map((item) => ({
      url: `${siteUrl}/portfolio/${item.slug}`,
      lastModified: item.updatedAt
    }))
  ];
}
