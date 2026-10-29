"use client";

/** Texte qui se "décode" (effet données) à l'apparition et au survol */
import { useEffect, useRef } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=/<>";

export default function Scramble({ text, className = "" }: { text: string; className?: string }) {
  const el = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = el.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const run = () => {
      cancelAnimationFrame(raf);
      const start = performance.now();
      const dur = 650;
      const step = () => {
        const p = Math.min(1, (performance.now() - start) / dur);
        const fixed = Math.floor(p * text.length);
        let out = "";
        for (let i = 0; i < text.length; i++) {
          const ch = text[i];
          out += i < fixed || ch === " " ? ch : CHARS[Math.floor(Math.random() * CHARS.length)];
        }
        node.textContent = out;
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          run();
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(node);
    const host = node.closest("a, button") ?? node;
    host.addEventListener("pointerenter", run);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      host.removeEventListener("pointerenter", run);
    };
  }, [text]);

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span ref={el} aria-hidden>
        {text}
      </span>
    </span>
  );
}
