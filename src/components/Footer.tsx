import Link from "next/link";
import { site } from "@/content/site";
import Island from "@/islands/Island";

export default function Footer() {
  const links = [
    { href: site.links.linkedin, label: "LinkedIn" },
    { href: site.links.github, label: "GitHub" },
  ];
  return (
    <footer className="relative z-10 mt-32 overflow-hidden border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-14 sm:grid-cols-3 sm:px-8">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Disponibilité</p>
          <p className="mt-3 flex items-center gap-2 text-sm">
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
            {site.availability}
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Heure locale</p>
          <p className="mt-3 text-sm">
            <Island name="LocalTime" props={{ prefix: `${site.location} · ` }} />
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Ailleurs</p>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {links.map((l) => (
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noopener noreferrer" className="link-underline">
                  {l.label} ↗
                </a>
              </li>
            ))}
            <li>
              <a href={site.cv} target="_blank" rel="noopener" className="link-underline">
                CV ↗
              </a>
            </li>
            <li>
              <Link href="/contact" className="link-underline">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/stack" className="link-underline">
                Sous le capot
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <p
        className="text-outline pointer-events-none mt-16 select-none whitespace-nowrap text-center text-[18.5vw] font-semibold leading-[0.8] tracking-[-0.06em]"
        aria-hidden
      >
        DARSHAN AXEL
      </p>

      <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-3 px-5 py-6 font-mono text-[10px] uppercase tracking-[0.2em] text-muted sm:px-8">
        <p>© {new Date().getFullYear()} {site.name}</p>
        <Link href="/stack" className="hover:text-fg">Next.js · Three.js · Vercel · sécurisé par défaut →</Link>
      </div>
    </footer>
  );
}
