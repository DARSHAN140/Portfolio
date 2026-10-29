import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjects, loadProjectBody } from "@/lib/content";
import CoverArt from "@/components/CoverArt";
import ProjectDemo from "@/components/ProjectDemo";
import Island from "@/islands/Island";

// Seuls les projets existants sont générés : toute autre URL renvoie une 404
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getProjects()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projets/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = (await getProjects()).find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/projets/${project.slug}` },
  };
}

export default async function ProjectPage({ params }: PageProps<"/projets/[slug]">) {
  const { slug } = await params;
  const projects = await getProjects();
  const index = projects.findIndex((p) => p.slug === slug);
  const project = projects[index];
  const Body = project ? await loadProjectBody(slug) : null;
  if (!project || !Body) notFound();
  const next = projects[(index + 1) % projects.length];

  const facts = [
    { k: "Année", v: project.year },
    ...(project.role ? [{ k: "Rôle", v: project.role }] : []),
    { k: "Stack", v: project.tags.join(" · ") },
    ...(project.demo ? [{ k: "Démo", v: "Disponible en ligne" }] : []),
  ];

  return (
    <article>
      <header className="mx-auto max-w-6xl px-5 pt-36 sm:px-8 sm:pt-44">
        <div className="mb-8 flex items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
          <Link href="/projets" className="link-underline hover:text-fg">← Index</Link>
          <span>
            Projet {String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
          </span>
        </div>
        <h1 className="text-[clamp(2.8rem,8vw,7rem)] font-medium leading-[0.9] tracking-[-0.05em]">{project.title}</h1>
        <p className="mt-8 max-w-2xl text-xl leading-relaxed text-muted">{project.summary}</p>

        <dl className="mt-12 grid gap-6 border-t border-border pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((f) => (
            <div key={f.k}>
              <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{f.k}</dt>
              <dd className="mt-2 text-sm">{f.v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 flex flex-wrap gap-3">
          {project.demo && (
            <a href="#demo" data-magnetic className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-fg">
              ▶ Tester la démo
            </a>
          )}
          {project.links.map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
              className="rounded-full border border-border px-6 py-3 text-sm transition-colors hover:border-accent">
              {l.label} ↗
            </a>
          ))}
        </div>
      </header>

      <div className="mx-auto mt-16 max-w-6xl px-5 sm:px-8">
        <div className="overflow-hidden rounded-3xl border border-border">
          <CoverArt kind={project.cover} seed={project.slug} className="block aspect-[16/7] w-full" />
        </div>
      </div>

      {project.metrics.length > 0 && (
        <dl className="mx-auto mt-16 grid max-w-6xl gap-px overflow-hidden px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
          {project.metrics.map((m) => (
            <div key={m.label} className="border-l border-border py-2 pl-6">
              <dd className="text-5xl font-medium tracking-tight text-accent">{m.value}</dd>
              <dt className="mt-2 text-sm text-muted">{m.label}</dt>
            </div>
          ))}
        </dl>
      )}

      <div className="mx-auto mt-20 grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_2fr]">
        <aside className="hidden lg:block">
          <p className="sticky top-28 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Étude de cas</p>
        </aside>
        <div className="prose max-w-2xl">
          <Body />
        </div>
      </div>

      {project.demo && (
        <section id="demo" className="mx-auto mt-24 max-w-6xl scroll-mt-24 px-5 sm:px-8">
          <p className="mb-6 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
            <span className="h-px w-10 bg-accent" />
            <Island name="Scramble" props={{ text: "Démo en ligne" }} />
          </p>
          <ProjectDemo demo={project.demo} />
        </section>
      )}

      {next && next.slug !== project.slug && (
        <Link href={`/projets/${next.slug}`} data-cursor="Suivant" className="group mx-auto mt-32 block max-w-6xl border-t border-border px-5 pt-10 sm:px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">Projet suivant</p>
          <p className="mt-4 flex items-center justify-between gap-6 text-[clamp(2.2rem,7vw,6rem)] font-medium leading-none tracking-[-0.045em] transition-colors group-hover:text-accent">
            {next.title}
            <span className="transition-transform duration-500 group-hover:translate-x-3" aria-hidden>→</span>
          </p>
        </Link>
      )}
    </article>
  );
}
