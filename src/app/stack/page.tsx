import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Sous le capot",
  description: "Architecture, sécurité et infrastructure de ce portfolio : Next.js, Vercel, CI/CD, en-têtes de sécurité, API protégées.",
  alternates: { canonical: "/stack" },
};

type Box = { x: number; y: number; w: number; t: string; s: string; accent?: boolean };

const BOXES: Box[] = [
  { x: 20, y: 70, w: 170, t: "Visiteur", s: "navigateur · mobile" },
  { x: 250, y: 70, w: 200, t: "Vercel Edge", s: "CDN · HTTPS · en-têtes · WAF", accent: true },
  { x: 520, y: 20, w: 190, t: "Pages statiques", s: "pré-générées au build" },
  { x: 520, y: 120, w: 190, t: "Fonctions API", s: "serverless · Paris (cdg1)", accent: true },
  { x: 770, y: 60, w: 170, t: "Resend", s: "envoi des e-mails" },
  { x: 770, y: 120, w: 170, t: "Upstash Redis", s: "limitation de débit" },
  { x: 770, y: 180, w: 170, t: "API de modèle", s: "FastAPI · jeton secret" },
  { x: 20, y: 300, w: 170, t: "GitHub", s: "code · revue · Dependabot" },
  { x: 250, y: 300, w: 260, t: "Intégration continue", s: "lint · types · audit · CodeQL · tests", accent: true },
  { x: 570, y: 300, w: 170, t: "Déploiement", s: "aperçu par PR · prod sur main" },
];
const BH = 48;
const mid = (b: Box) => ({ cx: b.x + b.w / 2, cy: b.y + BH / 2, r: b.x + b.w, l: b.x, t: b.y, b: b.y + BH });

function Arrow({ d, dashed }: { d: string; dashed?: boolean }) {
  return <path d={d} fill="none" stroke="var(--muted)" strokeWidth={1.25} strokeDasharray={dashed ? "4 4" : undefined} markerEnd="url(#arrow)" />;
}

function Diagram() {
  const [v, edge, pages, fn, resend, redis, model, gh, ci, deploy] = BOXES.map(mid);
  return (
    <svg viewBox="0 0 960 370" className="w-full min-w-[720px]" role="img"
      aria-label="Architecture : le visiteur passe par le réseau Vercel Edge, qui sert les pages statiques ou appelle les fonctions API à Paris ; celles-ci utilisent Resend, Upstash Redis et l'API de modèle. Le code part de GitHub, passe l'intégration continue puis est déployé sur Vercel.">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill="var(--muted)" />
        </marker>
      </defs>
      <text x={20} y={14} fontSize="11" fill="var(--muted)" fontFamily="var(--font-geist-mono)" letterSpacing="2">REQUÊTE</text>
      <text x={20} y={286} fontSize="11" fill="var(--muted)" fontFamily="var(--font-geist-mono)" letterSpacing="2">LIVRAISON DU CODE</text>

      <Arrow d={`M${v.r} ${v.cy}H${edge.l - 4}`} />
      <Arrow d={`M${edge.r} ${edge.cy}C${edge.r + 35} ${edge.cy} ${pages.l - 35} ${pages.cy} ${pages.l - 4} ${pages.cy}`} />
      <Arrow d={`M${edge.r} ${edge.cy}C${edge.r + 35} ${edge.cy} ${fn.l - 35} ${fn.cy} ${fn.l - 4} ${fn.cy}`} />
      <Arrow d={`M${fn.r} ${fn.cy}C${fn.r + 25} ${fn.cy} ${resend.l - 25} ${resend.cy} ${resend.l - 4} ${resend.cy}`} />
      <Arrow d={`M${fn.r} ${fn.cy}H${redis.l - 4}`} />
      <Arrow d={`M${fn.r} ${fn.cy}C${fn.r + 25} ${fn.cy} ${model.l - 25} ${model.cy} ${model.l - 4} ${model.cy}`} />
      <Arrow d={`M${gh.r} ${gh.cy}H${ci.l - 4}`} />
      <Arrow d={`M${ci.r} ${ci.cy}H${deploy.l - 4}`} />
      <Arrow d={`M${deploy.cx} ${deploy.t}V${edge.b + 70}H${edge.cx}V${edge.b + 4}`} dashed />

      {BOXES.map((b) => (
        <g key={b.t}>
          <rect x={b.x} y={b.y} width={b.w} height={BH} rx={10} fill="var(--surface)" stroke={b.accent ? "var(--accent)" : "var(--border)"} />
          <text x={b.x + 14} y={b.y + 21} fontSize="14" fill="var(--fg)" fontWeight={500}>{b.t}</text>
          <text x={b.x + 14} y={b.y + 37} fontSize="11" fill="var(--muted)">{b.s}</text>
        </g>
      ))}
    </svg>
  );
}

const SECURITY = [
  ["Content-Security-Policy stricte", "Seuls les scripts du site s'exécutent ; aucune ressource externe, iframes limitées à une liste blanche."],
  ["HSTS, anti-clickjacking, nosniff", "HTTPS forcé pendant 2 ans, le site ne peut pas être intégré dans une autre page, pas de détournement de type MIME."],
  ["Isolation des ressources", "Cross-Origin-Resource-Policy : la photo et le CV ne peuvent pas être intégrés par d'autres sites."],
  ["Photo protégée", "Affichée uniquement via WebGL, non indexée par Google Images, interdite aux robots d'entraînement d'IA."],
  ["API durcies", "Même origine obligatoire, taille et format bornés, validation stricte (zod), limitation de débit, délais d'expiration."],
  ["Formulaire anti-spam", "Champ piège invisible, délai minimum de saisie, e-mails envoyés en texte brut uniquement."],
  ["Secrets côté serveur", "Clés stockées dans Vercel, validées au démarrage, jamais envoyées au navigateur."],
  ["Chaîne d'approvisionnement", "Dépendances surveillées (Dependabot, npm audit), analyse du code (CodeQL) à chaque modification."],
  ["Signalement de faille", "Fichier /.well-known/security.txt conforme à la RFC 9116."],
];

const QUALITY = [
  ["Pages statiques", "Pré-générées et servies depuis le CDN : chargement quasi instantané."],
  ["3D à la demande", "Chargée seulement si l'appareil le permet, mise en pause hors écran."],
  ["Accessibilité", "Navigation au clavier, palette ⌘K, respect de « réduire les animations », contrastes vérifiés."],
  ["Contenu validé", "Chaque projet est un fichier MDX dont les métadonnées sont vérifiées au build."],
  ["Tests automatiques", "Chaque commit : lint, typage, audit, build, puis tests de fumée (pages, en-têtes, API)."],
  ["Observabilité", "Sonde /api/health (état nominal ou dégradé), journaux structurés, mesures d'audience et de performance sans cookie."],
  ["Scalabilité", "Pages sur CDN et fonctions serverless : la capacité suit le trafic automatiquement, sans serveur à gérer."],
];

const CAP = [
  {
    part: "Pages et contenu",
    choice: "AP",
    why: "Servies par le CDN depuis des dizaines de régions. Chaque déploiement est atomique : tous les nœuds passent à la nouvelle version, sans état intermédiaire incohérent.",
  },
  {
    part: "Anti-spam (Redis)",
    choice: "AP par défaut, CP au choix",
    why: "Si Redis tombe, le formulaire reste disponible avec un compteur local (limite approximative). Un réglage permet de préférer l'exactitude et de refuser les requêtes.",
  },
  {
    part: "Formulaire de contact",
    choice: "CP",
    why: "Aucune donnée stockée sur le site : un message est soit transmis à l'e-mail, soit refusé avec une erreur claire. Jamais de message perdu en silence.",
  },
  {
    part: "Démos",
    choice: "Sans état",
    why: "Exécutées dans le navigateur du visiteur : aucun serveur à faire monter en charge, donc aucun compromis à faire.",
  },
];

export default function StackPage() {
  return (
    <>
      <PageHeader
        kicker="Colophon"
        title="Sous le"
        accent="capot."
        intro="Ce portfolio est aussi un projet : une architecture serverless, une intégration continue et une sécurité pensées comme pour une application en production."
      />
      <section className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="overflow-x-auto rounded-3xl border border-border bg-bg p-6 sm:p-10">
          <Diagram />
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <h2 className="text-3xl font-medium tracking-tight">
          Théorème CAP : <span className="font-serif font-normal italic text-accent">des choix assumés.</span>
        </h2>
        <p className="mt-4 max-w-2xl text-muted">
          En cas de panne réseau entre deux composants (P), un système distribué doit choisir entre cohérence (C) et
          disponibilité (A). Voici le choix fait pour chaque brique, et pourquoi.
        </p>
        {/* Tableau sur grand écran, cartes empilées sur mobile */}
        <div className="mt-10 border-t border-border" role="table" aria-label="Choix CAP par brique">
          <div role="row" className="hidden border-b border-border py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted md:grid md:grid-cols-[12rem_14rem_1fr] md:gap-6">
            <span role="columnheader">Brique</span>
            <span role="columnheader">Choix</span>
            <span role="columnheader">Pourquoi</span>
          </div>
          {CAP.map((c) => (
            <div key={c.part} role="row" className="grid gap-3 border-b border-border py-6 md:grid-cols-[12rem_14rem_1fr] md:gap-6">
              <span role="rowheader" className="font-medium">{c.part}</span>
              <span role="cell">
                <span className="inline-block rounded-full border border-accent px-3 py-1 font-mono text-xs text-accent">{c.choice}</span>
              </span>
              <span role="cell" className="text-sm leading-relaxed text-muted">{c.why}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-24 grid max-w-6xl gap-16 px-5 sm:px-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-8 text-3xl font-medium tracking-tight">
            Sécurité <span className="font-serif font-normal italic text-accent">par défaut.</span>
          </h2>
          <ul className="border-t border-border">
            {SECURITY.map(([t, d]) => (
              <li key={t} className="border-b border-border py-5">
                <p className="flex items-center gap-3 font-medium">
                  <span className="text-accent" aria-hidden>✓</span>
                  {t}
                </p>
                <p className="mt-1 pl-7 text-sm leading-relaxed text-muted">{d}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-8 text-3xl font-medium tracking-tight">
            Qualité <span className="font-serif font-normal italic text-accent">& performance.</span>
          </h2>
          <ul className="border-t border-border">
            {QUALITY.map(([t, d]) => (
              <li key={t} className="border-b border-border py-5">
                <p className="flex items-center gap-3 font-medium">
                  <span className="text-accent" aria-hidden>✓</span>
                  {t}
                </p>
                <p className="mt-1 pl-7 text-sm leading-relaxed text-muted">{d}</p>
              </li>
            ))}
          </ul>
          <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Stack</p>
          <p className="mt-3 text-sm leading-relaxed">
            Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Three.js / React Three Fiber · MDX · Zod · Vercel · Resend · Upstash · GitHub Actions
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {!site.links.github.includes("TODO") && (
              <a href={site.links.github} target="_blank" rel="noopener noreferrer" className="rounded-full border border-border px-5 py-2.5 text-sm hover:border-accent">
                Code source ↗
              </a>
            )}
            <Link href="/contact" className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-black hover:bg-fg">
              En parler
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
