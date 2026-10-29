import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/content/site";
import { getPosts, loadPostBody } from "@/lib/content";
import { formatDate } from "@/components/ui";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = (await getPosts()).find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.summary, publishedTime: post.date },
  };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = (await getPosts()).find((p) => p.slug === slug);
  const Content = post ? await loadPostBody(slug) : null;
  if (!post || !Content) notFound();

  return (
    <article className="mx-auto max-w-3xl px-5 pt-36 sm:px-8 sm:pt-44">
      <Link href="/blog" className="link-underline font-mono text-[11px] uppercase tracking-[0.25em] text-muted hover:text-fg">
        ← Notes
      </Link>
      <h1 className="mt-10 text-[clamp(2.4rem,6vw,4.5rem)] font-medium leading-[0.95] tracking-[-0.04em]">{post.title}</h1>
      <p className="mt-6 text-xl leading-relaxed text-muted">{post.summary}</p>
      <p className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-y border-border py-4 font-mono text-[11px] uppercase tracking-wider text-muted">
        <span>{formatDate(post.date)}</span>
        <span>{site.shortName}</span>
        {post.tags.map((t) => (
          <span key={t} className="text-accent">#{t}</span>
        ))}
      </p>
      <div className="prose mt-12">
        <Content />
      </div>
    </article>
  );
}
