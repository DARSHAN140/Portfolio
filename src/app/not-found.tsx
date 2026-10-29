import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[80vh] max-w-6xl flex-col justify-center px-5 pt-24 sm:px-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">Erreur 404 · valeur manquante</p>
      <h1 className="mt-6 text-[clamp(4rem,16vw,13rem)] font-medium leading-[0.85] tracking-[-0.06em]">
        Null<span className="font-serif font-normal italic text-accent">.</span>
      </h1>
      <p className="mt-6 max-w-md text-lg text-muted">Cette page n&apos;existe pas dans le jeu de données. Elle a peut-être été déplacée.</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/" className="rounded-full bg-fg px-6 py-3 text-sm font-medium text-bg hover:bg-accent">
          Retour à l&apos;accueil
        </Link>
        <button type="button" data-open-palette className="rounded-full border border-border px-6 py-3 text-sm hover:border-accent">
          Rechercher (⌘K)
        </button>
      </div>
    </section>
  );
}
