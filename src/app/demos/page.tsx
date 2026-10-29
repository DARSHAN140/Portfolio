import type { Metadata } from "next";
import Link from "next/link";
import { getProjects } from "@/lib/content";
import ProjectDemo from "@/components/ProjectDemo";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Démos live",
  description: "Démos interactives de projets data : scoring crédit explicable, détection de fraude, dashboard de ventes.",
  alternates: { canonical: "/demos" },
};

export default async function DemosPage() {
  const projects = (await getProjects()).filter((p) => p.demo);
  return (
    <>
      <PageHeader
        kicker="Laboratoire"
        title="Démos"
        accent="live."
        intro="Des versions interactives de mes projets, à manipuler directement. Elles tournent dans votre navigateur sur des données synthétiques : aucune donnée n'est collectée."
      />
      <div className="mx-auto max-w-6xl space-y-28 px-5 sm:px-8">
        {projects.map((p, i) => (
          <section key={p.slug} aria-labelledby={`demo-${p.slug}`}>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-t border-border pt-8">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Démo {String(i + 1).padStart(2, "0")}</p>
                <h2 id={`demo-${p.slug}`} className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">{p.title}</h2>
              </div>
              <Link href={`/projets/${p.slug}`} className="link-underline font-mono text-xs uppercase tracking-wider text-muted hover:text-fg">
                Contexte et méthode →
              </Link>
            </div>
            <ProjectDemo demo={p.demo!} />
          </section>
        ))}
      </div>
    </>
  );
}
