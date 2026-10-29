"use client";

/** Phrase-manifeste dont les mots s'allument au fil du défilement */
import { useEffect, useRef } from "react";

export default function Manifesto({ text, highlight }: { text: string; highlight: string[] }) {
  const root = useRef<HTMLParagraphElement>(null);
  const words = text.split(" ");
  const hl = new Set(highlight.map((w) => w.toLowerCase()));

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const spans = Array.from(el.querySelectorAll<HTMLSpanElement>("[data-w]"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      spans.forEach((s) => (s.style.opacity = "1"));
      return;
    }
    let raf = 0;
    const tick = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      const lit = p * spans.length;
      spans.forEach((s, i) => {
        s.style.opacity = String(Math.min(1, Math.max(0.45, lit - i + 0.45)));
      });
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      if (e.isIntersecting) raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return (
    <p
      ref={root}
      className="text-[clamp(2rem,5.6vw,4.8rem)] font-medium leading-[1.04] tracking-[-0.035em]"
    >
      <span className="sr-only">{text}</span>
      {words.map((w, i) => {
        const clean = w.replace(/[.,;:!?«»"]/g, "").toLowerCase();
        return (
          <span key={i} aria-hidden>
            <span
              data-w
              style={{ opacity: 0.45 }}
              className={`transition-opacity duration-200 ${hl.has(clean) ? "font-serif font-normal italic text-accent" : ""}`}
            >
              {w}
            </span>{" "}
          </span>
        );
      })}
    </p>
  );
}
