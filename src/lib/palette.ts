import { site } from "@/content/site";
import { getPosts, getProjects } from "@/lib/content";
import { BUILTIN_DEMOS } from "@/demos/registry";
import type { PaletteItem } from "@/islands/CommandPalette";

/** Contenu de la palette ⌘K, généré automatiquement depuis le contenu du site */
export async function getPaletteItems(): Promise<PaletteItem[]> {
  const [projects, posts] = await Promise.all([getProjects(), getPosts()]);
  const items: PaletteItem[] = [
    { group: "Pages", label: "Accueil", href: "/", hint: "/" },
    { group: "Pages", label: "Projets", href: "/projets", hint: `${projects.length} projets` },
    { group: "Pages", label: "Démos live", href: "/demos", hint: "à tester" },
    { group: "Pages", label: "Parcours", href: "/#experience", hint: "expérience" },
    { group: "Pages", label: "Blog", href: "/blog", hint: `${posts.length} article${posts.length > 1 ? "s" : ""}` },
    { group: "Pages", label: "Contact", href: "/contact", hint: "écrire" },
    { group: "Pages", label: "Sous le capot", href: "/stack", hint: "architecture · sécurité" },
    ...projects.map((p) => ({ group: "Projets", label: p.title, href: `/projets/${p.slug}`, hint: p.year })),
    ...projects
      .filter((p) => p.demo?.type === "builtin")
      .map((p) => ({
        group: "Démos",
        label: p.demo?.type === "builtin" ? BUILTIN_DEMOS[p.demo.id].title : p.title,
        href: `/projets/${p.slug}#demo`,
        hint: "interactive",
      })),
    ...posts.map((p) => ({ group: "Articles", label: p.title, href: `/blog/${p.slug}`, hint: p.date.slice(0, 4) })),
    { group: "Actions", label: "Télécharger le CV", href: site.cv, hint: "PDF", external: true },
    { group: "Actions", label: "Vue recruteur (30 s)", href: "/?recruteur", hint: "résumé", event: "open-recruiter" },
  ];
  if (!site.links.linkedin.includes("TODO")) items.push({ group: "Actions", label: "LinkedIn", href: site.links.linkedin, external: true });
  if (!site.links.github.includes("TODO")) items.push({ group: "Actions", label: "GitHub", href: site.links.github, external: true });
  return items;
}
