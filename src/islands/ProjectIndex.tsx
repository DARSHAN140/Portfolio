"use client";

/**
 * Index des projets façon éditorial : grandes lignes numérotées.
 * Au survol (souris), une vignette générative suit le curseur.
 */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import CoverArt, { type CoverKind } from "@/components/CoverArt";

export type IndexItem = {
  slug: string;
  title: string;
  year: string;
  summary: string;
  tags: string[];
  demo: boolean;
  cover: CoverKind;
};

export default function ProjectIndex({ items }: { items: IndexItem[] }) {
  const [active, setActive] = useState<number | null>(null);
  const preview = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: -1, y: -1, cx: -1, cy: -1 });
  const showing = active !== null;

  useEffect(() => {
    const el = preview.current;
    if (!el || !showing) return; // aucune boucle tant qu'aucune vignette n'est affichée
    let raf = 0;
    const target = pointer.current;
    const cur = { x: target.cx < 0 ? target.x : target.cx, y: target.cy < 0 ? target.y : target.cy };
    const move = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
    };
    const tick = () => {
      cur.x += (target.x - cur.x) * 0.14;
      cur.y += (target.y - cur.y) * 0.14;
      const tilt = Math.max(-12, Math.min(12, (target.x - cur.x) * 0.15));
      target.cx = cur.x;
      target.cy = cur.y;
      el.style.transform = `translate3d(${cur.x + 28}px, ${cur.y - 110}px, 0) rotate(${tilt}deg)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
    };
  }, [showing]);

  return (
    <div onPointerLeave={() => setActive(null)}>
      <ol className="border-t border-border">
        {items.map((p, i) => (
          <li key={p.slug} className="border-b border-border">
            <Link
              href={`/projets/${p.slug}`}
              data-cursor="Ouvrir"
              onPointerEnter={(e) => {
                if (e.pointerType !== "mouse") return;
                pointer.current.x = e.clientX;
                pointer.current.y = e.clientY;
                setActive(i);
              }}
              className={`group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 py-7 transition-colors sm:grid-cols-[4rem_1fr_auto_auto] sm:py-9 ${active !== null && active !== i ? "text-muted/60" : ""}`}
            >
              <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-0">
                <span className="block text-[clamp(1.6rem,4.6vw,3.6rem)] font-medium leading-none tracking-[-0.035em] transition-transform duration-500 group-hover:translate-x-3">
                  {p.title}
                </span>
                <span className="mt-3 block max-w-xl text-sm text-muted sm:hidden">{p.summary}</span>
                <span className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-wider text-muted">
                  {p.demo && <span className="text-accent">● Démo live</span>}
                  {p.tags.slice(0, 4).map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </span>
              </span>
              <span className="hidden font-mono text-xs text-muted sm:block">{p.year}</span>
              <span
                className="self-center text-2xl transition-all duration-500 group-hover:-rotate-45 group-hover:text-accent"
                aria-hidden
              >
                →
              </span>
            </Link>
          </li>
        ))}
      </ol>

      {/* Vignette flottante (souris uniquement) */}
      <div
        ref={preview}
        className="pointer-events-none fixed left-0 top-0 z-50 hidden w-[300px] overflow-hidden rounded-xl border border-border shadow-2xl transition-[opacity,scale] duration-300 [@media(pointer:fine)]:block"
        style={{ opacity: active === null ? 0 : 1, scale: active === null ? "0.85" : "1" }}
        aria-hidden
      >
        {items.map((p, i) => (
          <div key={p.slug} className={i === active ? "block" : "hidden"}>
            <CoverArt kind={p.cover} seed={p.slug} className="block aspect-[4/3] w-full" />
            <p className="bg-surface px-4 py-3 text-xs leading-relaxed text-muted">{p.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
