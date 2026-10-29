"use client";

/**
 * Démo : dashboard de ventes façon Power BI, sur données synthétiques.
 * Logique équivalente à un modèle en étoile + mesures DAX (CA, commandes, panier, N-1).
 */
import { useMemo, useState } from "react";
import { DemoShell, Kpi, Select, fmt, fmtInt, fmtMad, mulberry32, normal } from "./ui";

const REGIONS = ["Casablanca-Settat", "Rabat-Salé-Kénitra", "Fès-Meknès", "Marrakech-Safi", "Tanger-Tétouan"] as const;
const CATEGORIES = ["Électronique", "Maison", "Mode", "Sport", "Beauté"] as const;
const MONTHS = ["Janv.", "Févr.", "Mars", "Avr.", "Mai", "Juin", "Juil.", "Août", "Sept.", "Oct.", "Nov.", "Déc."];

type Row = { year: number; month: number; region: string; category: string; revenue: number; orders: number };

function generate(): Row[] {
  const rand = mulberry32(2025);
  const regionW = [1.6, 1.15, 0.85, 0.9, 0.8];
  const catBasket = [2400, 650, 420, 560, 310];
  const catVol = [110, 230, 340, 170, 260];
  const season = [0.85, 0.8, 0.95, 1, 1.05, 1, 1.1, 1.15, 1.0, 0.98, 1.2, 1.45];
  const rows: Row[] = [];
  for (const year of [2024, 2025]) {
    const growth = year === 2025 ? 1.12 : 1;
    REGIONS.forEach((region, r) =>
      CATEGORIES.forEach((category, c) =>
        season.forEach((s, month) => {
          const orders = Math.max(5, Math.round(catVol[c] * regionW[r] * s * growth * normal(rand, 1, 0.08)));
          const basket = catBasket[c] * normal(rand, 1, 0.05);
          rows.push({ year, month, region, category, orders, revenue: orders * basket });
        }),
      ),
    );
  }
  return rows;
}

const PERIODS = [
  { value: "all", label: "Année complète", months: [0, 11] },
  { value: "s1", label: "1er semestre", months: [0, 5] },
  { value: "s2", label: "2e semestre", months: [6, 11] },
  { value: "t4", label: "4e trimestre", months: [9, 11] },
] as const;
type PeriodKey = (typeof PERIODS)[number]["value"];

const ROWS = generate();
const W = 520;
const H = 240;
const PAD = { l: 60, r: 16, t: 14, b: 30 };

export default function SalesDashboard() {
  const rows = ROWS;
  const [region, setRegion] = useState("all");
  const [category, setCategory] = useState("all");
  const [period, setPeriod] = useState<PeriodKey>("all");
  const [hoverMonth, setHoverMonth] = useState<number | null>(null);
  const [hoverCat, setHoverCat] = useState<string | null>(null);

  const [m0, m1] = PERIODS.find((p) => p.value === period)!.months;

  const view = useMemo(() => {
    const keep = (r: Row) =>
      (region === "all" || r.region === region) && (category === "all" || r.category === category);
    const inPeriod = (r: Row) => r.month >= m0 && r.month <= m1;
    const sum = (rs: Row[]) =>
      rs.reduce((a, r) => ({ revenue: a.revenue + r.revenue, orders: a.orders + r.orders }), { revenue: 0, orders: 0 });

    const cur = rows.filter((r) => r.year === 2025 && keep(r) && inPeriod(r));
    const prev = rows.filter((r) => r.year === 2024 && keep(r) && inPeriod(r));
    const tot = sum(cur);
    const totPrev = sum(prev);

    const monthly = (y: number) =>
      MONTHS.map((_, m) => sum(rows.filter((r) => r.year === y && r.month === m && keep(r))).revenue);

    // Par catégorie : on garde le filtre région et période, pas le filtre catégorie (comme un visuel Power BI)
    const byCat = CATEGORIES.map((c) => ({
      name: c,
      value: sum(rows.filter((r) => r.year === 2025 && inPeriod(r) && r.category === c && (region === "all" || r.region === region))).revenue,
    })).sort((a, b) => b.value - a.value);

    return {
      revenue: tot.revenue,
      orders: tot.orders,
      basket: tot.orders ? tot.revenue / tot.orders : 0,
      growth: totPrev.revenue ? tot.revenue / totPrev.revenue - 1 : 0,
      cur: monthly(2025),
      prev: monthly(2024),
      byCat,
    };
  }, [rows, region, category, m0, m1]);

  // Graduations "rondes" (1, 2, 5 × 10^n)
  const raw = Math.max(...view.cur, ...view.prev) * 1.05;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = raw / mag > 5 ? mag * 2 : raw / mag > 2 ? mag : mag / 2;
  const yMax = Math.ceil(raw / step) * step;
  const x = (m: number) => PAD.l + (m / 11) * (W - PAD.l - PAD.r);
  const y = (v: number) => H - PAD.b - (v / yMax) * (H - PAD.t - PAD.b);
  const path = (vals: number[]) => vals.map((v, m) => `${m ? "L" : "M"}${x(m)} ${y(v)}`).join("");
  const ticks = Array.from({ length: Math.round(yMax / step) + 1 }, (_, i) => i * step);
  const catMax = Math.max(...view.byCat.map((c) => c.value));

  return (
    <DemoShell title="Dashboard des ventes" note="données synthétiques">
      {/* Filtres sur une ligne, au-dessus des visuels */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Select label="Région" value={region} onChange={setRegion}
          options={[{ value: "all", label: "Toutes" }, ...REGIONS.map((r) => ({ value: r, label: r }))]} />
        <Select label="Catégorie" value={category} onChange={setCategory}
          options={[{ value: "all", label: "Toutes" }, ...CATEGORIES.map((c) => ({ value: c, label: c }))]} />
        <Select label="Période (2025)" value={period} onChange={setPeriod}
          options={PERIODS.map((p) => ({ value: p.value, label: p.label }))} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Chiffre d'affaires" value={fmtMad(view.revenue)} />
        <Kpi label="Commandes" value={fmtInt(view.orders)} />
        <Kpi label="Panier moyen" value={`${fmtInt(view.basket)} MAD`} />
        <Kpi label="Évolution vs N-1" value={`${view.growth >= 0 ? "▲ +" : "▼ "}${fmt(view.growth * 100, 1)} %`} sub="même période 2024" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Courbe mensuelle */}
        <figure>
          <figcaption className="mb-1 flex flex-wrap items-center justify-between gap-2 text-sm font-medium">
            CA mensuel
            <span className="flex gap-4 text-[11px] font-normal text-muted">
              <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-accent" />2025</span>
              <span className="flex items-center gap-1.5"><span className="h-0 w-4 border-t-2 border-dashed border-[color:var(--neutral-mark)]" />2024</span>
            </span>
          </figcaption>
          <div className="relative">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
              aria-label="Chiffre d'affaires mensuel 2025 comparé à 2024"
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                const px = ((e.clientX - r.left) / r.width) * W;
                setHoverMonth(Math.max(0, Math.min(11, Math.round(((px - PAD.l) / (W - PAD.l - PAD.r)) * 11))));
              }}
              onMouseLeave={() => setHoverMonth(null)}>
              <rect x={x(m0) - 6} width={x(m1) - x(m0) + 12} y={PAD.t} height={H - PAD.t - PAD.b} fill="var(--accent-soft)" opacity={period === "all" ? 0 : 0.35} />
              {ticks.map((t) => (
                <g key={t}>
                  <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke="var(--border)" />
                  <text x={PAD.l - 8} y={y(t) + 4} fontSize="13" textAnchor="end" fill="var(--muted)">{t >= 1e6 ? `${fmt(t / 1e6, t % 1e6 ? 1 : 0)} M` : t >= 1e3 ? `${fmt(t / 1e3, 0)} k` : fmt(t, 0)}</text>
                </g>
              ))}
              {MONTHS.map((mo, m) => (m % 2 === 0 ? (
                <text key={mo} x={x(m)} y={H - 10} fontSize="13" textAnchor="middle" fill="var(--muted)">{mo}</text>
              ) : null))}
              <path d={path(view.prev)} fill="none" stroke="var(--neutral-mark)" strokeWidth={2} strokeDasharray="5 4" />
              <path d={path(view.cur)} fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinejoin="round" />
              {hoverMonth !== null && (
                <g>
                  <line x1={x(hoverMonth)} x2={x(hoverMonth)} y1={PAD.t} y2={H - PAD.b} stroke="var(--muted)" strokeDasharray="2 3" />
                  <circle cx={x(hoverMonth)} cy={y(view.cur[hoverMonth])} r={4.5} fill="var(--accent)" stroke="var(--surface)" strokeWidth={2} />
                  <circle cx={x(hoverMonth)} cy={y(view.prev[hoverMonth])} r={4} fill="var(--neutral-mark)" stroke="var(--surface)" strokeWidth={2} />
                </g>
              )}
            </svg>
            {hoverMonth !== null && (
              <div className="pointer-events-none absolute top-1 rounded-md border border-border bg-surface px-3 py-2 text-xs shadow-lg"
                style={{ left: `${(x(hoverMonth) / W) * 100}%`, transform: `translateX(${hoverMonth > 6 ? "-105%" : "5%"})` }}>
                <p className="font-medium">{MONTHS[hoverMonth]}</p>
                <p>2025 : {fmtMad(view.cur[hoverMonth])}</p>
                <p className="text-muted">2024 : {fmtMad(view.prev[hoverMonth])}</p>
              </div>
            )}
          </div>
        </figure>

        {/* Barres par catégorie */}
        <figure>
          <figcaption className="mb-2 text-sm font-medium">CA par catégorie</figcaption>
          <ul className="space-y-2.5">
            {view.byCat.map((c) => {
              const dim = category !== "all" && category !== c.name;
              return (
                <li key={c.name} className="text-xs" onMouseEnter={() => setHoverCat(c.name)} onMouseLeave={() => setHoverCat(null)}>
                  <div className="mb-1 flex justify-between gap-2">
                    <span>{c.name}</span>
                    <span className="font-mono text-muted">
                      {hoverCat === c.name ? `${fmt((c.value / view.byCat.reduce((s, x) => s + x.value, 0)) * 100, 1)} % du total` : fmtMad(c.value)}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-r bg-bg">
                    <div className="h-2.5 rounded-r transition-all"
                      style={{ width: `${(c.value / catMax) * 100}%`, background: "var(--accent)", opacity: dim ? 0.3 : 1 }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </figure>
      </div>
    </DemoShell>
  );
}
