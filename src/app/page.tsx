import Link from "next/link";
import { preload } from "react-dom";
import { site, skills, experiences, education, certifications } from "@/content/site";
import { getPosts, getProjects } from "@/lib/content";
import { formatDate } from "@/components/ui";
import CoverArt from "@/components/CoverArt";
import Island from "@/islands/Island";
import { BUILTIN_DEMOS } from "@/demos/registry";

const STAGES = [
  { kicker: "01 — Signal", title: "", body: "" },
  {
    kicker: "02 — Explorer",
    title: "Collecter, nettoyer, |explorer.|",
    body: "Python, SQL et Spark pour transformer des données brutes en jeux fiables, puis y trouver les structures cachées.",
  },
  {
    kicker: "03 — Modéliser",
    title: "Apprendre |des données.|",
    body: "Machine Learning supervisé et non supervisé, XGBoost, optimisation, et explicabilité avec SHAP pour que chaque prédiction se justifie.",
  },
  {
    kicker: "04 — Décider",
    title: "Rendre la donnée |utile.|",
    body: "Dashboards Power BI, applications Streamlit, API FastAPI déployées avec Docker : des outils que les équipes utilisent vraiment.",
  },
];

const MARQUEE_A = ["Python", "SQL", "Machine Learning", "XGBoost", "Power BI", "Spark", "FastAPI", "Docker"];
const MARQUEE_B = ["Feature engineering", "SHAP", "Data Warehouse", "DAX", "Kafka", "Streamlit", "MLflow", "Neo4j"];

function Kicker({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <p className="mb-10 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
      <span className="text-accent">{n}</span>
      <span className="h-px w-10 bg-border" />
      <Island name="Scramble" props={{ text: String(children) }} />
    </p>
  );
}

export default async function Home() {
  // Image principale (LCP) demandée en priorité, dans la bonne taille selon l'écran
  preload(site.cutout, {
    as: "image",
    fetchPriority: "high",
    imageSrcSet: `${site.cutoutSmall} 520w, ${site.cutout} 991w`,
    imageSizes: "(max-width: 1023px) 90vw, 50vw",
  });
  const [projects, posts] = await Promise.all([getProjects(), getPosts()]);
  const withDemo = projects.filter((p) => p.demo?.type === "builtin");
  const [firstName, ...rest] = site.shortName.split(" ");

  return (
    <>
      <Island
        name="ParticleHero"
        props={{
          cutout: site.cutout,
          cutoutSmall: site.cutoutSmall,
          depth: site.depth,
          firstName,
          lastName: rest.join(" "),
          role: site.role,
          availability: site.availability,
          location: site.location,
          coords: site.coords,
          stages: STAGES,
        }}
      />

      {/* Manifeste */}
      <section id="manifeste" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-32 sm:px-8 sm:py-44">
        <Kicker n="§">Manifeste</Kicker>
        <Island
          name="Manifesto"
          props={{
            text: "Ce qui me plaît dans la data, c'est le moment où un chiffre devient une décision. Je fais tout le parcours : de la donnée brute au modèle, jusqu'à l'outil que les équipes utilisent.",
            highlight: ["décision", "outil"],
          }}
        />
        <div className="mt-16 grid gap-8 border-t border-border pt-10 sm:grid-cols-3">
          {[
            { v: "Bac+5", l: "Ingénieur Big Data Analytics, UEMF Fès" },
            { v: `0${experiences.length}`, l: "expériences : banque, e-commerce, associatif" },
            { v: `0${withDemo.length}`, l: "démos à tester directement en ligne" },
          ].map((k) => (
            <div key={k.l}>
              <p className="text-5xl font-medium tracking-tight">{k.v}</p>
              <p className="mt-2 max-w-[16rem] text-sm text-muted">{k.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Marquee compétences */}
      <section aria-label="Technologies" className="overflow-hidden border-y border-border py-8">
        {[MARQUEE_A, MARQUEE_B].map((row, r) => (
          <div key={r} className={`marquee ${r ? "marquee-reverse mt-3" : ""}`} style={{ "--marquee-speed": r ? "46s" : "38s" } as React.CSSProperties}>
            {[...row, ...row].map((w, i) => (
              <span
                key={i}
                aria-hidden={i >= row.length}
                className={`flex shrink-0 items-center gap-8 pr-8 text-[clamp(2.5rem,7vw,6rem)] font-medium leading-none tracking-[-0.04em] ${r ? "text-outline" : ""}`}
              >
                {w}
                <span className="font-serif text-[0.5em] italic text-accent" aria-hidden>
                  ✦
                </span>
              </span>
            ))}
          </div>
        ))}
      </section>

      {/* Projets */}
      <section id="projets" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-32 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Kicker n="01">Projets sélectionnés</Kicker>
            <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-medium leading-[0.95] tracking-[-0.04em]">
              Du modèle <span className="font-serif font-normal italic text-accent">à l&apos;usage.</span>
            </h2>
          </div>
          <Link href="/projets" className="link-underline font-mono text-xs uppercase tracking-wider text-muted hover:text-fg">
            Tous les projets ({projects.length}) →
          </Link>
        </div>
        <div className="mt-16">
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
        </div>
      </section>

      {/* Démos */}
      <section id="demos" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20 sm:px-8">
        <Kicker n="02">Laboratoire</Kicker>
        <div className="grid gap-4 md:grid-cols-3">
          {withDemo.map((p, i) => {
            const d = p.demo?.type === "builtin" ? BUILTIN_DEMOS[p.demo.id] : null;
            return (
              <Link
                key={p.slug}
                href={`/projets/${p.slug}#demo`}
                data-cursor="Tester"
                className="spotlight group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-accent"
              >
                <div className="relative overflow-hidden">
                  <CoverArt kind={p.cover} seed={p.slug} className="block aspect-[4/3] w-full transition-transform duration-700 group-hover:scale-105" />
                  <span className="absolute left-4 top-4 rounded-full bg-bg/80 px-3 py-1 font-mono text-[10px] uppercase tracking-wider backdrop-blur">
                    Démo {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-medium tracking-tight">{d?.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted">{d?.description}</p>
                  <p className="mt-6 font-mono text-[11px] uppercase tracking-wider text-accent">Lancer la démo →</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Compétences : bento */}
      <section id="competences" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-32 sm:px-8">
        <Kicker n="03">Boîte à outils</Kicker>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {skills.map((s, i) => (
            <div
              key={s.category}
              className={`spotlight overflow-hidden rounded-2xl border border-border bg-surface p-7 ${i === 0 ? "lg:col-span-4 lg:row-span-2" : i === 1 ? "lg:col-span-2 lg:row-span-2" : "lg:col-span-2"}`}
            >
              {i === 0 && (
                <CoverArt kind="network" seed="skills" className="pointer-events-none absolute right-0 top-0 -z-10 hidden h-full w-1/2 opacity-40 [mask-image:linear-gradient(to_left,#000,transparent)] lg:block" />
              )}
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{String(i + 1).padStart(2, "0")}</p>
              <h3 className={`mt-3 font-medium tracking-tight ${i < 2 ? "text-3xl" : "text-xl"}`}>{s.category}</h3>
              <p className={`mt-3 max-w-sm text-sm leading-relaxed text-muted ${i < 2 ? "" : "hidden sm:block"}`}>{s.blurb}</p>
              <ul className={`mt-6 flex flex-wrap gap-2 ${i === 0 ? "lg:mt-16" : ""}`}>
                {s.items.map((it) => (
                  <li key={it} className="rounded-full border border-border px-3 py-1 text-sm text-muted transition-colors hover:border-accent hover:text-fg">
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Parcours */}
      <section id="experience" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20 sm:px-8">
        <Kicker n="04">Parcours</Kicker>
        <ol className="border-t border-border">
          {experiences.map((e) => (
            <li key={e.title + e.company} className="group grid gap-4 border-b border-border py-10 md:grid-cols-[12rem_1fr_1.1fr] md:gap-10">
              <p className="font-mono text-xs uppercase tracking-wider text-muted">{e.period}</p>
              <div>
                <h3 className="text-2xl font-medium tracking-tight transition-colors group-hover:text-accent">{e.company}</h3>
                <p className="mt-1 text-muted">{e.title}</p>
              </div>
              <ul className="space-y-2 text-sm leading-relaxed text-muted">
                {e.points.map((pt) => (
                  <li key={pt} className="flex gap-3">
                    <span className="text-accent" aria-hidden>→</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>

        <div className="mt-20 grid gap-12 md:grid-cols-2">
          <div>
            <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Formation</p>
            <ul className="space-y-6">
              {education.map((ed) => (
                <li key={ed.degree}>
                  <p className="text-lg font-medium tracking-tight">{ed.degree}</p>
                  <p className="mt-1 text-sm text-muted">{ed.school} · {ed.period}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-12 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
            <div>
              <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Certifications</p>
              <ul className="space-y-3 text-sm">
                {certifications.map((c) => (
                  <li key={c.name} className="flex justify-between gap-4 border-b border-border pb-3">
                    <span>{c.name}</span>
                    <span className="font-mono text-muted">{c.year}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Langues</p>
              <ul className="space-y-3 text-sm">
                {site.languages.map((l) => (
                  <li key={l.name} className="flex justify-between gap-4 border-b border-border pb-3">
                    <span>{l.name}</span>
                    <span className="text-muted">{l.level}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Blog */}
      {posts.length > 0 && (
        <section id="blog" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20 sm:px-8">
          <Kicker n="05">Notes</Kicker>
          <ul className="border-t border-border">
            {posts.slice(0, 3).map((p) => (
              <li key={p.slug} className="border-b border-border">
                <Link href={`/blog/${p.slug}`} data-cursor="Lire" className="group grid gap-2 py-8 md:grid-cols-[12rem_1fr_auto] md:items-baseline md:gap-10">
                  <span className="font-mono text-xs uppercase tracking-wider text-muted">{formatDate(p.date)}</span>
                  <span>
                    <span className="block text-2xl font-medium tracking-tight transition-colors group-hover:text-accent">{p.title}</span>
                    <span className="mt-2 block text-sm text-muted">{p.summary}</span>
                  </span>
                  <span className="hidden text-2xl transition-transform group-hover:translate-x-2 md:block" aria-hidden>→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Appel à l'action */}
      <section className="mx-auto max-w-6xl px-5 pt-24 sm:px-8">
        <Kicker n="06">Contact</Kicker>
        <div className="flex flex-col gap-12 md:flex-row md:items-end md:justify-between">
          <h2 className="text-[clamp(3.2rem,10vw,9rem)] font-medium leading-[0.85] tracking-[-0.05em]">
            Parlons
            <br />
            <span className="font-serif font-normal italic text-accent">données.</span>
          </h2>
          <Link
            href="/contact"
            data-magnetic
            data-cursor="Écrire"
            className="grid h-40 w-40 shrink-0 place-items-center rounded-full bg-accent text-center font-medium text-black transition-[transform,background] duration-300 ease-out hover:bg-fg sm:h-48 sm:w-48"
          >
            Me contacter
          </Link>
        </div>
        <p className="mt-10 max-w-md text-muted">
          Un poste ou un stage pré-embauche en data ? Je réponds rapidement, depuis {site.location} (
          <Island name="LocalTime" props={{}} />
          ).
        </p>
      </section>
    </>
  );
}
