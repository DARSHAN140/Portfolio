"use client";

/**
 * Hero "Signal" : section collante de 300 vh.
 * Le défilement fait passer la scène par 4 états ; le texte HTML suit.
 * Sans WebGL ou avec "réduire les animations" : portrait statique, mêmes textes.
 */
import Link from "next/link";
import { lazy, Suspense, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { SceneState } from "@/three/ParticleScene";

const ParticleScene = lazy(() => import("@/three/ParticleScene"));
type Attrs = Awaited<ReturnType<typeof import("@/three/ParticleScene").buildAttributes>>;

export type HeroStage = { kicker: string; title: string; body: string };

type Props = {
  cutout: string;
  cutoutSmall: string;
  depth: string;
  firstName: string;
  lastName: string;
  role: string;
  availability: string;
  location: string;
  coords: string;
  stages: HeroStage[];
};

let webgl: boolean | undefined;
const hasWebGL = () => {
  if (webgl === undefined) {
    try {
      const c = document.createElement("canvas");
      webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webgl = false;
    }
  }
  return webgl;
};
const RM = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(RM);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
/**
 * La 3D complète est réservée aux ordinateurs (souris, grand écran, processeur correct).
 * Sur mobile / connexion économe : version légère en CSS, sans télécharger Three.js (~150 ko gzip).
 */
const canAnimate = () => {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  return (
    !window.matchMedia(RM).matches &&
    window.matchMedia("(pointer: fine)").matches &&
    window.innerWidth >= 1024 &&
    !nav.connection?.saveData &&
    (nav.hardwareConcurrency ?? 8) >= 4 &&
    (nav.deviceMemory ?? 8) >= 4 &&
    hasWebGL()
  );
};

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export default function ParticleHero(props: Props) {
  const { cutout, cutoutSmall, depth, firstName, lastName, role, availability, location, coords, stages } = props;
  const enabled = useSyncExternalStore(subscribe, canAnimate, () => false);
  const [attrs, setAttrs] = useState<Attrs | null>(null);
  const [visible, setVisible] = useState(true);
  const [mobile, setMobile] = useState(false);
  const section = useRef<HTMLElement>(null);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const counter = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const photo = useRef<HTMLDivElement>(null);
  const scene = useRef<SceneState>({ stage: 0, mouse: { x: 9, y: 9 }, intro: 0 });

  // Prépare la 3D APRÈS l'affichage de la page, quand le navigateur est inactif (ne ralentit pas le chargement)
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    let idle = 0;
    const start = () => {
      const run = () => {
        const isMobile = window.innerWidth < 1024;
        import("@/three/ParticleScene").then(({ buildAttributes }) =>
          buildAttributes(cutout, depth, isMobile ? 150 : 210).then((a) => {
            if (!alive) return;
            setMobile(isMobile);
            setAttrs(a);
          }),
        );
      };
      if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(run, { timeout: 1500 });
      else idle = window.setTimeout(run, 400); // Safari ancien
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      alive = false;
      window.removeEventListener("load", start);
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
      clearTimeout(idle);
    };
  }, [enabled, cutout, depth]);

  // Boucle : défilement → état de la scène + textes
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    let raf = 0;
    let smooth = 0;
    const start = performance.now();
    let running = false;
    // La boucle ne tourne que lorsque le hero est à l'écran (économie de batterie)
    const io = new IntersectionObserver(
      ([e]) => {
        setVisible(e.isIntersecting);
        if (e.isIntersecting && !running) {
          running = true;
          raf = requestAnimationFrame(tick);
        } else if (!e.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 },
    );
    const onMove = (e: PointerEvent) => {
      scene.current.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      scene.current.mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onLeave = () => {
      scene.current.mouse.x = 9;
      scene.current.mouse.y = 9;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    const tick = () => {
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = clamp(-r.top / Math.max(total, 1));
      // Paliers : chaque étape reste stable sur ~60 % de son défilement, la transition se fait au milieu
      const raw = p * (stages.length - 1);
      const base = Math.floor(raw);
      const f = clamp((raw - base - 0.3) / 0.4);
      const target = Math.min(stages.length - 1, base + f * f * (3 - 2 * f));
      smooth += (target - smooth) * 0.08;
      if (Math.abs(target - smooth) < 0.001) smooth = target; // stabilise (évite des micro-mouvements)
      scene.current.stage = smooth;
      scene.current.intro = clamp((performance.now() - start) / 2600);

      textRefs.current.forEach((t, i) => {
        if (!t) return;
        const o = clamp(1 - Math.abs(smooth - i) * 2);
        t.style.opacity = String(o);
        t.style.transform = `translateY(${(i - smooth) * 40}px)`;
        t.style.pointerEvents = o > 0.5 ? "auto" : "none";
        t.setAttribute("aria-hidden", o > 0.5 ? "false" : "true");
      });
      const active = Math.round(smooth);
      dotRefs.current.forEach((d, i) => d?.setAttribute("data-active", String(i === active)));
      if (counter.current) counter.current.textContent = String(active + 1).padStart(2, "0");
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      // Version légère : la photo s'efface doucement quand on avance dans le récit
      if (photo.current) {
        photo.current.style.opacity = photo.current.dataset.hidden ? "0" : String(1 - Math.min(smooth, 1) * 0.8);
        photo.current.style.transform = `translateY(${-Math.min(smooth, 1) * 30}px)`;
      }
      if (running) raf = requestAnimationFrame(tick);
    };
    io.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [stages.length]);

  const goTo = (i: number) => {
    const el = section.current;
    if (!el) return;
    const total = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: el.offsetTop + (total * i) / (stages.length - 1), behavior: "smooth" });
  };

  const show3D = enabled && attrs;

  return (
    <section
      ref={section}
      className="relative h-[300vh] select-none"
      aria-label="Présentation"
      // La photo n'est pas proposée au téléchargement (clic droit / glisser)
      onContextMenu={(e) => {
        if ((e.target as Element).closest("[data-protect]")) e.preventDefault();
      }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Halo d'ambiance */}
        <div
          className="pointer-events-none absolute left-[-12%] top-[18%] h-[60vh] w-[60vh] rounded-full opacity-20 blur-[130px] md:opacity-25"
          style={{ background: "var(--accent)" }}
          aria-hidden
        />

        {/* Portrait statique (avant chargement / sans WebGL / animations réduites) */}
        <div
          ref={photo}
          data-hidden={show3D ? "1" : undefined}
          className={`pointer-events-none absolute inset-x-0 top-0 flex h-[62%] items-start justify-center pt-16 lg:inset-y-0 lg:right-auto lg:h-auto lg:w-[52%] lg:items-end lg:pt-0 ${show3D ? "opacity-0 transition-opacity duration-1000" : ""}`}
          aria-hidden
          data-protect
        >
          <div className="hero-lite relative h-full max-h-full lg:h-[80%]">
            {/* eslint-disable-next-line @next/next/no-img-element -- image LCP, aussi utilisée hors Next (aperçu) */}
            <img
              src={cutout}
              srcSet={`${cutoutSmall} 520w, ${cutout} 991w`}
              sizes="(max-width: 1023px) 90vw, 50vw"
              width={991}
              height={900}
              alt=""
              draggable={false}
              fetchPriority="high"
              decoding="async"
              className="h-full w-auto object-contain [filter:saturate(0.45)_contrast(1.06)_brightness(0.92)]"
              style={{ maskImage: "linear-gradient(to bottom, #000 45%, transparent 92%)" }}
            />
          </div>
        </div>

        {show3D && (
          <div className="absolute inset-0" aria-hidden data-protect>
            <Suspense fallback={null}>
              <ParticleScene
                attrs={attrs}
                state={scene}
                paused={!visible}
                offset={mobile ? [0, 1.05, 0.5] : [-1.75, -0.35, 0.82]}
              />
            </Suspense>
          </div>
        )}

        {/* Voile en bas sur mobile : garde le texte lisible au-dessus des particules */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[58%] bg-gradient-to-t from-bg via-bg/85 to-transparent lg:hidden" aria-hidden />

        {/* Textes par étape */}
        <div className="relative z-10 mx-auto grid h-full max-w-6xl items-end px-5 pb-28 sm:px-8 lg:items-center lg:justify-items-end lg:pb-0">
          {stages.map((s, i) => (
            <div
              key={s.kicker}
              ref={(n) => {
                textRefs.current[i] = n;
              }}
              className="col-start-1 row-start-1 max-w-xl will-change-transform"
              style={{ opacity: i === 0 ? 1 : 0 }}
            >
              <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.25em] text-accent">{s.kicker}</p>
              {i === 0 ? (
                <>
                  <h1 className="text-[clamp(3.2rem,11vw,8.5rem)] font-medium leading-[0.86] tracking-[-0.045em]">
                    {firstName}
                    <br />
                    <span className="font-serif font-normal italic tracking-[-0.02em] text-accent">{lastName}</span>
                  </h1>
                  <p className="mt-6 max-w-md text-lg text-muted">{role}</p>
                  <p className="mt-3 inline-flex items-center gap-2 font-mono text-xs text-muted">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                    </span>
                    {availability}
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <button
                      type="button"
                      data-open-recruiter
                      data-magnetic
                      className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-fg"
                    >
                      ⚡ Mon profil en 30 secondes
                    </button>
                    <Link href="/projets" className="rounded-full border border-border bg-bg/60 px-6 py-3 text-sm backdrop-blur transition-colors hover:border-accent">
                      Voir les projets
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-[clamp(2.4rem,6.5vw,5.2rem)] font-medium leading-[0.95] tracking-[-0.04em]">
                    {s.title.split("|").map((part, k) =>
                      k % 2 ? (
                        <span key={k} className="font-serif font-normal italic text-accent">{part}</span>
                      ) : (
                        <span key={k}>{part}</span>
                      ),
                    )}
                  </h2>
                  <p className="mt-6 max-w-md text-base leading-relaxed text-muted sm:text-lg">{s.body}</p>
                </>
              )}
            </div>
          ))}
        </div>

        {/* HUD */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 mx-auto flex max-w-6xl items-end justify-between px-5 pb-6 font-mono text-[10px] uppercase tracking-[0.2em] text-muted sm:px-8">
          <div className="space-y-1">
            <p>{location} · {coords}</p>
            <p className="flex items-center gap-3">
              <span>
                <span ref={counter}>01</span> / {String(stages.length).padStart(2, "0")}
              </span>
              <span className="relative h-px w-24 bg-border">
                <span ref={bar} className="absolute inset-0 origin-left bg-accent" style={{ transform: "scaleX(0)" }} />
              </span>
            </p>
          </div>
          <a href="#manifeste" className="pointer-events-auto hidden items-center gap-2 hover:text-fg sm:flex" data-cursor="Passer">
            Passer l&apos;intro ↓
          </a>
        </div>

        {/* Navigation entre étapes */}
        <nav aria-label="Étapes" className="absolute left-5 top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-3 sm:left-8 xl:flex">
          {stages.map((s, i) => (
            <button
              key={s.kicker}
              type="button"
              ref={(n) => {
                dotRefs.current[i] = n;
              }}
              onClick={() => goTo(i)}
              className="group flex flex-row-reverse items-center justify-end gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted data-[active=true]:text-fg"
              aria-label={`Aller à l'étape ${i + 1}`}
            >
              <span className="opacity-0 transition-opacity group-hover:opacity-100 group-data-[active=true]:opacity-100">
                {s.kicker.replace(/^\d+\s*—\s*/, "")}
              </span>
              <span className="h-px w-6 bg-current transition-all group-data-[active=true]:w-10 group-data-[active=true]:bg-accent" />
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}
