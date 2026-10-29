"use client";

/**
 * Effets globaux, en un seul écouteur chacun (léger) :
 *  - barre de progression de lecture
 *  - teinte d'accent qui évolue avec le défilement (le site "change" de couleur)
 *  - curseur personnalisé (souris uniquement, désactivé si "réduire les animations")
 *  - boutons magnétiques [data-magnetic]
 *  - halo des cartes .spotlight
 */
import { useEffect, useRef } from "react";
import { accent, HUE_MAX, HUE_MIN } from "@/lib/accent";

export default function Effects() {
  const bar = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const useCursor = finePointer && !reduced;
    if (useCursor) root.classList.add("has-cursor");

    let raf = 0;
    let hue = HUE_MIN;
    const pos = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    let magnet: HTMLElement | null = null;

    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      const target = e.target as Element | null;

      // Spotlight
      const spot = target?.closest?.(".spotlight") as HTMLElement | null;
      if (spot) {
        const r = spot.getBoundingClientRect();
        spot.style.setProperty("--mx", `${e.clientX - r.left}px`);
        spot.style.setProperty("--my", `${e.clientY - r.top}px`);
      }

      // Magnétique
      const m = (target?.closest?.("[data-magnetic]") as HTMLElement | null) ?? null;
      if (magnet && magnet !== m) magnet.style.transform = "";
      magnet = reduced ? null : m;
      if (magnet) {
        const r = magnet.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        magnet.style.transform = `translate(${dx * 0.25}px, ${dy * 0.3}px)`;
      }

      // Curseur : état actif + étiquette contextuelle
      if (useCursor && ring.current && label.current) {
        const interactive = target?.closest?.("a, button, [data-cursor], input[type=range], select, summary, label") as HTMLElement | null;
        const text = (target?.closest?.("[data-cursor]") as HTMLElement | null)?.dataset.cursor ?? "";
        ring.current.dataset.active = String(!!text);
        ring.current.style.opacity = interactive && !text ? "0.5" : "1";
        label.current.textContent = text;
      }
    };

    // Boucle "à la demande" : ne tourne que pendant un défilement ou un mouvement de souris
    let running = false;
    const tick = () => {
      const max = root.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;

      // Teinte : progresse avec la page (mise à jour par pas de 1° pour limiter les recalculs de style)
      const target = HUE_MIN + (HUE_MAX - HUE_MIN) * p;
      hue += (target - hue) * 0.08;
      if (Math.abs(hue - accent.hue) > 1) {
        accent.hue = hue;
        root.style.setProperty("--hue", hue.toFixed(0));
      }
      let busy = Math.abs(target - hue) > 0.5;

      if (useCursor && dot.current && ring.current) {
        ringPos.x += (pos.x - ringPos.x) * 0.18;
        ringPos.y += (pos.y - ringPos.y) * 0.18;
        dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
        ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
        busy ||= Math.abs(pos.x - ringPos.x) + Math.abs(pos.y - ringPos.y) > 0.5;
      }
      running = busy;
      if (busy) raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };

    const onLeave = () => {
      pos.x = pos.y = -100;
      wake();
    };

    const onPointer = (e: PointerEvent) => {
      onMove(e);
      wake();
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", wake, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    wake();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", wake);
      document.removeEventListener("pointerleave", onLeave);
      root.classList.remove("has-cursor");
    };
  }, []);

  return (
    <>
      <div
        ref={bar}
        className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-accent"
        style={{ transform: "scaleX(0)" }}
        aria-hidden
      />
      <div ref={dot} className="cursor-dot" aria-hidden />
      <div ref={ring} className="cursor-ring" aria-hidden>
        <span ref={label} />
      </div>
    </>
  );
}
