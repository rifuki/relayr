import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://relayr.rifuki.dev",
      lastModified: "2025-06-26T20:11:20.022Z",
      changeFrequency: "weekly",
      priority: 1.0,
    },

    {
      url: "https://relayr.rifuki.dev/transfer/send",
      lastModified: "2025-06-26T20:11:20.022Z",
      changeFrequency: "weekly",
      priority: 0.5,
    },

    {
      url: "https://relayr.rifuki.dev/transfer/receive",
      lastModified: "2025-06-26T20:11:20.022Z",
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];
}
