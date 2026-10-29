"use client";

/**
 * "Vue recruteur" : l'essentiel en 30 secondes, adapté au poste visé.
 * S'ouvre depuis tout élément [data-open-recruiter], le bouton flottant, ou l'URL ?recruteur.
 * Imprimable (une page A4 propre) et partageable (copie du lien).
 */
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type Role = { id: string; label: string; brings: string[]; tools: string[]; projects: { slug: string; title: string }[] };

type Props = {
  name: string;
  role: string;
  location: string;
  availability: string;
  pitch: string;
  highlights: string[];
  roles: Role[];
  languages: { name: string; level: string }[];
  education: string;
  cv: string;
  linkedin?: string;
};

export default function RecruiterView(p: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(p.roles[0]?.id);
  const [fab, setFab] = useState(false);
  const [copied, setCopied] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const show = useCallback(() => {
    lastFocus.current = document.activeElement as HTMLElement | null;
    setOpen(true);
  }, []);
  const close = useCallback(() => {
    setOpen(false);
    lastFocus.current?.focus?.();
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.("[data-open-recruiter]")) {
        e.preventDefault();
        show();
      }
    };
    const onScroll = () => setFab(window.scrollY > window.innerHeight * 2.4); // après le hero
    document.addEventListener("click", onClick);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("open-recruiter", show);
    if (new URLSearchParams(window.location.search).has("recruteur")) queueMicrotask(show);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("open-recruiter", show);
    };
  }, [show]);

  useEffect(() => {
    if (!open) return;
    const el = dialog.current;
    el?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab" && el) {
        // Piège à focus : la navigation clavier reste dans la fenêtre
        const items = el.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const copyLink = async () => {
    const url = `${window.location.origin}/?recruteur`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Lien du profil :", url);
    }
  };

  const print = () => {
    document.documentElement.classList.add("print-recruiter");
    const done = () => {
      document.documentElement.classList.remove("print-recruiter");
      window.removeEventListener("afterprint", done);
    };
    window.addEventListener("afterprint", done);
    window.print();
  };

  const role = p.roles.find((r) => r.id === tab) ?? p.roles[0];

  return (
    <>
      {/* Bouton flottant */}
      <button
        type="button"
        onClick={show}
        data-cursor="30 s"
        className={`fixed bottom-5 right-5 z-[65] flex items-center gap-2 rounded-full border border-border bg-bg/80 py-2 pl-3 pr-4 text-sm shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-accent print:hidden ${fab && !open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"}`}
        aria-label="Ouvrir la vue recruteur"
      >
        <span className="grid h-6 w-6 place-items-center rounded-full bg-accent text-[11px] font-bold text-black">⚡</span>
        Vue recruteur
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted">30 s</span>
      </button>

      {open && (
        <div className="recruiter-overlay fixed inset-0 z-[85] flex justify-end bg-black/70 backdrop-blur-sm" onMouseDown={close}>
          <div
            ref={dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="recruiter-title"
            tabIndex={-1}
            onMouseDown={(e) => e.stopPropagation()}
            data-recruiter-sheet
            className="recruiter-sheet h-full w-full max-w-2xl overflow-y-auto border-l border-border bg-surface outline-none"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface/90 px-6 py-4 backdrop-blur print:hidden">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">⚡ Vue recruteur · 30 secondes</p>
              <button type="button" onClick={close} className="rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-muted hover:text-fg">
                Fermer · Échap
              </button>
            </div>

            <div className="space-y-10 px-6 py-8 sm:px-10">
              <header>
                <h2 id="recruiter-title" className="text-4xl font-medium tracking-tight sm:text-5xl">{p.name}</h2>
                <p className="mt-2 text-lg text-accent">{p.role}</p>
                <p className="mt-4 text-lg leading-relaxed">{p.pitch}</p>
                <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Statut</dt>
                    <dd className="mt-1 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
                      {p.availability.replace(/^Disponible\s*:\s*/i, "Disponible · ")}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Basé à</dt>
                    <dd className="mt-1">{p.location}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Formation</dt>
                    <dd className="mt-1">{p.education}</dd>
                  </div>
                </dl>
              </header>

              <section>
                <h3 className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Points clés</h3>
                <ul className="space-y-3">
                  {p.highlights.map((h) => (
                    <li key={h} className="flex gap-3">
                      <span className="text-accent" aria-hidden>→</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Pour quel poste ?</h3>
                <div role="tablist" aria-label="Poste visé" className="flex flex-wrap gap-2 print:hidden">
                  {p.roles.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      role="tab"
                      aria-selected={r.id === role.id}
                      onClick={() => setTab(r.id)}
                      className={`rounded-full border px-4 py-1.5 text-sm ${r.id === role.id ? "border-accent bg-accent text-black" : "border-border hover:border-accent"}`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
                <div role="tabpanel" className="mt-6 rounded-2xl border border-border bg-bg p-6">
                  <p className="text-sm text-muted">
                    Ce que j&apos;apporte comme <span className="text-fg">{role.label}</span>
                  </p>
                  <ul className="mt-4 space-y-2">
                    {role.brings.map((b) => (
                      <li key={b} className="flex gap-3 text-sm leading-relaxed">
                        <span className="text-accent" aria-hidden>✓</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {role.tools.map((t) => (
                      <span key={t} className="rounded-full border border-border px-3 py-1 font-mono text-[11px]">{t}</span>
                    ))}
                  </div>
                  <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Projets à regarder</p>
                  <ul className="mt-2 space-y-1">
                    {role.projects.map((pr) => (
                      <li key={pr.slug}>
                        <Link href={`/projets/${pr.slug}`} onClick={() => setOpen(false)} className="link-underline text-sm hover:text-accent">
                          {pr.title} →
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Langues</h3>
                <p className="text-sm">{p.languages.map((l) => `${l.name} (${l.level})`).join(" · ")}</p>
              </section>

              <section className="grid gap-3 sm:grid-cols-2 print:hidden">
                <a href={p.cv} target="_blank" rel="noopener" className="rounded-full bg-accent px-5 py-3 text-center text-sm font-medium text-black hover:bg-fg">
                  Télécharger le CV (PDF)
                </a>
                <Link href="/contact" onClick={() => setOpen(false)} className="rounded-full border border-border px-5 py-3 text-center text-sm hover:border-accent">
                  Proposer un entretien
                </Link>
                {p.linkedin && (
                  <a href={p.linkedin} target="_blank" rel="noopener noreferrer" className="rounded-full border border-border px-5 py-3 text-center text-sm hover:border-accent">
                    Voir le profil LinkedIn ↗
                  </a>
                )}
                <button type="button" onClick={copyLink} className="rounded-full border border-border px-5 py-3 text-sm hover:border-accent">
                  {copied ? "Lien copié ✓" : "Copier le lien pour l'équipe"}
                </button>
                <button type="button" onClick={print} className="rounded-full border border-border px-5 py-3 text-sm hover:border-accent sm:col-span-2">
                  Imprimer / enregistrer en PDF
                </button>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
