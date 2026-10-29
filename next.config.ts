import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import { EMBED_HOSTS } from "./src/config/security";

const isDev = process.env.NODE_ENV === "development";

/**
 * Content-Security-Policy (CSP)
 * Site statique => CSP sans nonce (recommandé par la doc Next.js pour garder le rendu statique).
 * Tout est servi depuis notre domaine : pas de CDN tiers, pas de tracker.
 * Les iframes de démo sont gérées par EMBED_HOSTS (src/config/security.ts).
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  "connect-src 'self'",
  // Seuls les hôtes de démo autorisés (src/config/security.ts) peuvent être intégrés
  `frame-src ${EMBED_HOSTS.map((h) => `https://${h}`).join(" ")}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Force HTTPS pendant 2 ans (Vercel sert déjà en HTTPS)
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Anti-clickjacking (doublon volontaire de frame-ancestors pour les vieux navigateurs)
  { key: "X-Frame-Options", value: "DENY" },
  // Empêche le navigateur de "deviner" le type MIME
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Désactive les API sensibles dont un portfolio n'a pas besoin
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // Interdit aux autres sites d'intégrer nos ressources (photo, CV…) dans leurs pages
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "Origin-Agent-Cluster", value: "?1" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  // Ne révèle pas "X-Powered-By: Next.js" (moins d'infos pour un attaquant)
  poweredByHeader: false,
  reactStrictMode: true,
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        // Photos : ni indexation en recherche d'images, ni usage pour entraîner des IA
        source: "/images/(.*)",
        headers: [
          { key: "X-Robots-Tag", value: "noimageindex, noai, noimageai" },
          // Cache CDN 1 jour, puis revalidation en arrière-plan (rapide ET à jour si tu changes la photo)
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
      {
        // Le CV n'est pas indexé par les moteurs (les recruteurs passent par le site)
        source: "/cv/(.*)",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, noai" },
          { key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" },
        ],
      },
      {
        // L'API ne doit jamais être mise en cache
        source: "/api/(.*)",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
