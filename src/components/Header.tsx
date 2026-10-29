import Link from "next/link";
import { site } from "@/content/site";
import Island from "@/islands/Island";

const nav = [
  { href: "/projets", label: "Projets" },
  { href: "/demos", label: "Démos" },
  { href: "/#experience", label: "Parcours" },
  { href: "/blog", label: "Blog" },
];

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 bg-gradient-to-b from-bg via-bg/80 to-transparent" aria-hidden />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span className="sr-only">Accueil · </span>
          <span className="grid h-9 w-9 place-items-center rounded-full border border-border bg-bg/70 font-mono text-[11px] font-semibold backdrop-blur transition-colors group-hover:border-accent group-hover:text-accent">
            DA
          </span>
          <span className="hidden font-mono text-[11px] uppercase tracking-[0.2em] text-muted sm:block">
            {site.shortName}
          </span>
        </Link>

        <nav
          aria-label="Navigation principale"
          className="hidden items-center gap-1 rounded-full border border-border bg-bg/70 p-1 text-sm backdrop-blur-xl md:flex"
        >
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-full px-4 py-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-fg">
              <Island name="Scramble" props={{ text: item.label }} />
            </Link>
          ))}
          <Link href="/contact" className="rounded-full bg-fg px-4 py-1.5 font-medium text-bg transition-colors hover:bg-accent">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-2">
        <button
          type="button"
          data-open-recruiter
          className="hidden items-center gap-2 rounded-full border border-border bg-bg/70 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted backdrop-blur transition-colors hover:border-accent hover:text-fg lg:flex"
        >
          <span className="text-accent" aria-hidden>⚡</span> Vue recruteur
        </button>
        <button
          type="button"
          data-open-palette
          className="flex items-center gap-2 rounded-full border border-border bg-bg/70 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted backdrop-blur transition-colors hover:border-accent hover:text-fg"
        >
          <span className="md:hidden">Menu</span>
          <span className="hidden md:inline">Rechercher</span>
          <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-[10px] md:inline">⌘K</kbd>
        </button>
        </div>
      </div>
    </header>
  );
}
