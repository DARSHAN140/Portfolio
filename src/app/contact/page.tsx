import type { Metadata } from "next";
import { site } from "@/content/site";
import Island from "@/islands/Island";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contacter ${site.name} pour un poste ou un stage en data.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const links = [
    { label: "LinkedIn", href: site.links.linkedin },
    { label: "GitHub", href: site.links.github },
    { label: "CV (PDF)", href: site.cv },
  ];
  return (
    <section className="mx-auto grid max-w-6xl gap-16 px-5 pt-36 sm:px-8 sm:pt-44 lg:grid-cols-[1fr_1.1fr]">
      <div>
        <p className="mb-8 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
          <span className="h-px w-10 bg-accent" />
          <Island name="Scramble" props={{ text: "Contact" }} />
        </p>
        <h1 className="text-[clamp(3rem,8vw,6.5rem)] font-medium leading-[0.88] tracking-[-0.05em]">
          Parlons <span className="font-serif font-normal italic text-accent">données.</span>
        </h1>
        <p className="mt-8 max-w-md text-lg text-muted">
          Une offre de poste, un stage pré-embauche ou une question sur un projet ? Écrivez-moi, je réponds rapidement.
        </p>
        <dl className="mt-12 space-y-6 border-t border-border pt-8">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Basé à</dt>
            <dd className="mt-1">
              {site.location} · <Island name="LocalTime" props={{}} />
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Statut</dt>
            <dd className="mt-1 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
              {site.availability}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Ailleurs</dt>
            <dd className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
              {links.map((l) => (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="link-underline">
                  {l.label} ↗
                </a>
              ))}
            </dd>
          </div>
        </dl>
      </div>
      <div className="rounded-3xl border border-border bg-surface p-6 sm:p-10">
        <Island name="ContactForm" props={{}} />
      </div>
    </section>
  );
}
