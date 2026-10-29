import type { MetadataRoute } from "next";
import { site } from "@/content/site";

/**
 * Robots qui collectent des contenus pour ENTRAÎNER des IA : refusés.
 * Les assistants qui consultent le site à la demande d'un recruteur (recherche, navigation)
 * restent autorisés : un recruteur doit pouvoir te trouver par tous les moyens.
 */
const AI_CRAWLERS = [
  "GPTBot",
  "CCBot",
  "ClaudeBot",
  "anthropic-ai",
  "Google-Extended",
  "Applebot-Extended",
  "Bytespider",
  "meta-externalagent",
  "cohere-training-data-crawler",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/cv/"] },
      // Ta photo n'apparaît pas dans Google Images
      { userAgent: "Googlebot-Image", disallow: ["/images/"] },
      { userAgent: AI_CRAWLERS, disallow: "/" },
    ],
    sitemap: `${site.url.replace(/\/$/, "")}/sitemap.xml`,
  };
}
