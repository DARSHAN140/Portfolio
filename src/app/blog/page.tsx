import type { Metadata } from "next";
import Link from "next/link";
import { getPosts } from "@/lib/content";
import { formatDate } from "@/components/ui";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Blog",
  description: "Articles sur la data, le Machine Learning et la Business Intelligence.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <>
      <PageHeader
        kicker="Notes de terrain"
        title="Ce que"
        accent="j'apprends."
        intro="Méthodes, retours d'expérience et explications, écrits pour être compris aussi par des non-spécialistes."
      />
      <ul className="mx-auto max-w-6xl border-t border-border px-5 sm:px-8">
        {posts.map((p) => (
          <li key={p.slug} className="border-b border-border">
            <Link href={`/blog/${p.slug}`} data-cursor="Lire" className="group grid gap-2 py-10 md:grid-cols-[12rem_1fr_auto] md:items-baseline md:gap-10">
              <span className="font-mono text-xs uppercase tracking-wider text-muted">{formatDate(p.date)}</span>
              <span>
                <span className="block text-3xl font-medium tracking-tight transition-colors group-hover:text-accent">{p.title}</span>
                <span className="mt-3 block text-muted">{p.summary}</span>
              </span>
              <span className="hidden text-2xl transition-transform group-hover:translate-x-2 md:block" aria-hidden>→</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
