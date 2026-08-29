import type { MetadataRoute } from "next";
import { sections } from "@/lib/content";
import { getWriteups } from "@/lib/writeups";

const BASE = "https://jamesmagpantay.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: BASE, lastModified: now, priority: 1 },
    ...sections.map((s) => ({
      url: `${BASE}${s.href}`,
      lastModified: now,
      priority: 0.8,
    })),
    ...getWriteups().map((w) => ({
      url: `${BASE}/writeups/${w.slug}`,
      lastModified: new Date(w.date),
      priority: 0.6,
    })),
  ];
}
