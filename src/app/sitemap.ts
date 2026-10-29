import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { getPosts, getProjects } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.url.replace(/\/$/, "");
  const [projects, posts] = await Promise.all([getProjects(), getPosts()]);
  const pages = ["", "/demos", "/projets", "/blog", "/contact", "/stack"].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
  return [
    ...pages,
    ...projects.map((p) => ({ url: `${base}/projets/${p.slug}`, priority: 0.7 })),
    ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.date, priority: 0.6 })),
  ];
}
