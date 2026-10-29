import type { Metadata } from "next";
import { getProjects } from "@/lib/content";
import PageHeader from "@/components/PageHeader";
import Island from "@/islands/Island";

export const metadata: Metadata = {
  title: "Projets",
  description: "Projets data : Machine Learning, Big Data, Business Intelligence et applications, avec démos testables.",
  alternates: { canonical: "/projets" },
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <>
      <PageHeader
        kicker={`Index · ${String(projects.length).padStart(2, "0")} projets`}
        title="Projets"
        accent="& expériences."
        intro="Du nettoyage des données au déploiement : chaque projet détaille le contexte, la méthode et les résultats. Ceux marqués « Démo live » se testent en ligne."
      />
      <section className="mx-auto max-w-6xl px-5 sm:px-8">
        <Island
          name="ProjectIndex"
          props={{
            items: projects.map((p) => ({
              slug: p.slug,
              title: p.title,
              year: p.year,
              summary: p.summary,
              tags: p.tags,
              demo: !!p.demo,
              cover: p.cover,
            })),
          }}
        />
      </section>
    </>
  );
}
