/**
 * Système de contenu : chaque projet et chaque article est UN fichier MDX.
 *   src/content/projects/<slug>.mdx   →  /projets/<slug>
 *   src/content/blog/<slug>.mdx       →  /blog/<slug>
 * Le fichier exporte `meta` (validé ici) et son corps est la page détaillée.
 * Un meta invalide fait échouer le build avec un message clair : impossible de publier une erreur.
 */
import fs from "node:fs";
import path from "node:path";
import { cache, type ComponentType } from "react";
import { z } from "zod";
import { isAllowedEmbedUrl, EMBED_HOSTS } from "@/config/security";
import { BUILTIN_DEMO_IDS } from "@/demos/registry";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const httpsUrl = z.url({ protocol: /^https$/ });

const demoSchema = z.discriminatedUnion("type", [
  // Démo codée dans le portfolio (src/demos)
  z.object({ type: z.literal("builtin"), id: z.enum(BUILTIN_DEMO_IDS) }),
  // Application hébergée ailleurs, intégrée en iframe isolée (Streamlit, HF Spaces, Power BI…)
  z.object({
    type: z.literal("embed"),
    url: httpsUrl.refine(isAllowedEmbedUrl, {
      message: `Hôte non autorisé. Ajoute-le à EMBED_HOSTS (src/config/security.ts). Autorisés : ${EMBED_HOSTS.join(", ")}`,
    }),
    title: z.string().min(3),
    height: z.number().int().min(300).max(1200).default(640),
  }),
  // Simple lien vers une démo externe
  z.object({ type: z.literal("link"), url: httpsUrl, label: z.string().default("Ouvrir la démo") }),
]);

export const projectMetaSchema = z.object({
  title: z.string().min(3),
  year: z.string().regex(/^\d{4}$/),
  summary: z.string().min(10).max(220),
  tags: z.array(z.string()).min(1),
  featured: z.boolean().default(false),
  /** Ordre d'affichage (plus petit = en premier) */
  order: z.number().default(100),
  /** Chiffres clés affichés en tuiles (laisse vide plutôt que d'inventer) */
  metrics: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
  links: z.array(z.object({ label: z.string(), url: httpsUrl })).default([]),
  demo: demoSchema.optional(),
  /** Visuel génératif de couverture */
  cover: z.enum(["waterfall", "scatter", "line", "network", "bars", "grid"]).default("network"),
  /** Ton rôle sur le projet (affiché dans la fiche) */
  role: z.string().optional(),
  /** true = n'apparaît pas sur le site (brouillon) */
  draft: z.boolean().default(false),
});

export const postMetaSchema = z.object({
  title: z.string().min(3),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  summary: z.string().min(10).max(220),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
});

export type ProjectMeta = z.output<typeof projectMetaSchema>;
export type PostMeta = z.output<typeof postMetaSchema>;
export type Project = ProjectMeta & { slug: string };
export type Post = PostMeta & { slug: string };

function listSlugs(dir: string) {
  const abs = path.join(process.cwd(), "src", "content", dir);
  return fs
    .readdirSync(abs)
    .filter((f) => f.endsWith(".mdx") && !f.startsWith("_"))
    .map((f) => f.replace(/\.mdx$/, ""))
    .filter((slug) => {
      if (!SLUG.test(slug)) throw new Error(`Nom de fichier invalide : ${dir}/${slug}.mdx (minuscules, chiffres et tirets)`);
      return true;
    });
}

function parseOrThrow<T extends z.ZodType>(schema: T, data: unknown, file: string): z.output<T> {
  const res = schema.safeParse(data);
  if (!res.success) {
    throw new Error(`\n❌ meta invalide dans ${file} :\n${z.prettifyError(res.error)}\n`);
  }
  return res.data;
}

type MdxModule = { default: ComponentType; meta?: unknown };

export const getProjects = cache(async (): Promise<Project[]> => {
  const items = await Promise.all(
    listSlugs("projects").map(async (slug) => {
      const mod: MdxModule = await import(`@/content/projects/${slug}.mdx`);
      return { slug, ...parseOrThrow(projectMetaSchema, mod.meta, `projects/${slug}.mdx`) };
    }),
  );
  return items
    .filter((p) => !p.draft)
    .sort((a, b) => a.order - b.order || b.year.localeCompare(a.year));
});

export const getPosts = cache(async (): Promise<Post[]> => {
  const items = await Promise.all(
    listSlugs("blog").map(async (slug) => {
      const mod: MdxModule = await import(`@/content/blog/${slug}.mdx`);
      return { slug, ...parseOrThrow(postMetaSchema, mod.meta, `blog/${slug}.mdx`) };
    }),
  );
  return items.filter((p) => !p.draft).sort((a, b) => b.date.localeCompare(a.date));
});

/** Charge le contenu MDX d'un slug déjà validé (jamais un chemin fourni par l'URL brute) */
export async function loadProjectBody(slug: string) {
  const known = (await getProjects()).some((p) => p.slug === slug);
  if (!known) return null;
  return ((await import(`@/content/projects/${slug}.mdx`)) as MdxModule).default;
}

export async function loadPostBody(slug: string) {
  const known = (await getPosts()).some((p) => p.slug === slug);
  if (!known) return null;
  return ((await import(`@/content/blog/${slug}.mdx`)) as MdxModule).default;
}
