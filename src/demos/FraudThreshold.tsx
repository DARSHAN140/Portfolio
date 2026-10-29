"use client";

/**
 * Démo : choisir un seuil d'alerte sur un score d'anomalie.
 * Données 100 % synthétiques, générées dans le navigateur.
 */
import { useMemo, useState } from "react";
import { DemoShell, Kpi, Slider, fmtInt, fmtPct, mulberry32, normal } from "./ui";

type Tx = { hour: number; amount: number; fraud: boolean; score: number };

function generate(): Tx[] {
  const rand = mulberry32(7);
  const txs: Omit<Tx, "score">[] = [];
  for (let i = 0; i < 640; i++) {
    const fraud = rand() < 0.035;
    const hour = fraud
      ? (normal(rand, 3, 2.2) + 24) % 24
      : Math.min(23.9, Math.max(0, normal(rand, 14, 3.8)));
    const amount = Math.exp(fraud ? normal(rand, Math.log(2200), 0.75) : normal(rand, Math.log(380), 0.8));
    txs.push({ hour, amount: Math.min(Math.max(amount, 12), 30000), fraud });
  }
  // Score d'anomalie : montant inhabituel + heure inhabituelle + bruit
  return txs.map((t) => {
    const zAmount = (Math.log(t.amount) - Math.log(380)) / 0.8;
    const night = Math.max(0, 1 - Math.min(Math.abs(t.hour - 3), 24 - Math.abs(t.hour - 3)) / 6);
    const raw = 0.9 * zAmount + 2.2 * night + normal(rand, 0, 0.55);
    return { ...t, score: Math.round(100 / (1 + Math.exp(-(raw - 1.6) * 1.3))) };
  });
}

const DATA = generate();
const W = 640;
const H = 300;
const PAD = { l: 52, r: 12, t: 28, b: 34 };
const xScale = (h: number) => PAD.l + (h / 24) * (W - PAD.l - PAD.r);
const yMin = Math.log10(10);
const yMax = Math.log10(30000);
const yScale = (a: number) => H - PAD.b - ((Math.log10(a) - yMin) / (yMax - yMin)) * (H - PAD.t - PAD.b);

export default function FraudThreshold() {
  const data = DATA;
  const [threshold, setThreshold] = useState(60);
  const [hover, setHover] = useState<Tx | null>(null);

  const m = useMemo(() => {
    let tp = 0, fp = 0, fn = 0, tn = 0;
    for (const t of data) {
      const flagged = t.score >= threshold;
      if (flagged && t.fraud) tp++;
      else if (flagged) fp++;
      else if (t.fraud) fn++;
      else tn++;
    }
    return { tp, fp, fn, tn, precision: tp + fp ? tp / (tp + fp) : 0, recall: tp + fn ? tp / (tp + fn) : 0 };
  }, [data, threshold]);

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = e.currentTarget;
    const r = svg.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    const y = ((e.clientY - r.top) / r.height) * H;
    let best: Tx | null = null;
    let bestD = 14 * 14;
    for (const t of data) {
      const d = (xScale(t.hour) - x) ** 2 + (yScale(t.amount) - y) ** 2;
      if (d < bestD) { bestD = d; best = t; }
    }
    setHover(best);
  }

  return (
    <DemoShell title="Seuil de détection de fraude" note="données synthétiques">
      <Slider label="Seuil d'alerte (score d'anomalie)" value={threshold} min={5} max={95}
        display={`≥ ${threshold}`} onChange={setThreshold} />

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Précision" value={fmtPct(m.precision, 0)} sub="alertes qui sont de vraies fraudes" />
        <Kpi label="Rappel" value={fmtPct(m.recall, 0)} sub="fraudes détectées" />
        <Kpi label="Fraudes ratées" value={fmtInt(m.fn)} sub={`sur ${m.tp + m.fn}`} />
        <Kpi label="Clients bloqués à tort" value={fmtInt(m.fp)} sub={`sur ${m.fp + m.tn}`} />
      </div>

      <div className="relative mt-6">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" onMouseMove={onMove} onMouseLeave={() => setHover(null)}
          role="img" aria-label="Nuage de points des transactions : heure en abscisse, montant en ordonnée (échelle logarithmique)">
          {/* Grille et axes */}
          {[10, 100, 1000, 10000].map((v) => (
            <g key={v}>
              <line x1={PAD.l} x2={W - PAD.r} y1={yScale(v)} y2={yScale(v)} stroke="var(--border)" />
              <text x={PAD.l - 8} y={yScale(v) + 4} textAnchor="end" fontSize="12" fill="var(--muted)">
                {fmtInt(v)}
              </text>
            </g>
          ))}
          {[0, 6, 12, 18, 24].map((h) => (
            <text key={h} x={xScale(h)} y={H - 12} textAnchor="middle" fontSize="12" fill="var(--muted)">{h} h</text>
          ))}
          <text x={PAD.l - 8} y={12} fontSize="12" fill="var(--muted)" textAnchor="start">
            Montant (MAD, échelle log) ↑
          </text>

          {/* Transactions normales d'abord, fraudes au-dessus */}
          {data.filter((t) => !t.fraud).map((t, i) => {
            const flagged = t.score >= threshold;
            return (
              <circle key={i} cx={xScale(t.hour)} cy={yScale(t.amount)} r={flagged ? 4 : 2.6}
                fill={flagged ? "var(--accent)" : "var(--neutral-mark)"}
                stroke={flagged ? "var(--surface)" : "none"} strokeWidth={1.5} opacity={flagged ? 1 : 0.8} />
            );
          })}
          {data.filter((t) => t.fraud).map((t, i) => {
            const flagged = t.score >= threshold;
            const x = xScale(t.hour), y = yScale(t.amount), s = 6;
            return (
              <path key={i} d={`M${x} ${y - s}L${x + s} ${y}L${x} ${y + s}L${x - s} ${y}Z`}
                fill="var(--risk-up)" stroke={flagged ? "var(--accent)" : "var(--surface)"} strokeWidth={flagged ? 2.5 : 1.5} />
            );
          })}
          {hover && (
            <circle cx={xScale(hover.hour)} cy={yScale(hover.amount)} r={9} fill="none" stroke="var(--fg)" strokeWidth={1.5} />
          )}
        </svg>
        {hover && (
          <div className="pointer-events-none absolute right-2 top-2 rounded-md border border-border bg-surface px-3 py-2 text-xs shadow-lg">
            <p className="font-medium">{hover.fraud ? "Fraude (réelle)" : "Transaction normale"}</p>
            <p className="text-muted">
              {fmtInt(hover.amount)} MAD · {Math.floor(hover.hour)} h {String(Math.round((hover.hour % 1) * 60)).padStart(2, "0")}
            </p>
            <p className="text-muted">
              Score {hover.score} → {hover.score >= threshold ? "alerte" : "pas d'alerte"}
            </p>
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-muted">
        <span className="flex items-center gap-1.5"><svg width="10" height="10"><circle cx="5" cy="5" r="3" fill="var(--neutral-mark)" /></svg>Normale</span>
        <span className="flex items-center gap-1.5"><svg width="12" height="12"><path d="M6 0L12 6L6 12L0 6Z" fill="var(--risk-up)" /></svg>Fraude réelle</span>
        <span className="flex items-center gap-1.5"><svg width="10" height="10"><circle cx="5" cy="5" r="4" fill="var(--accent)" /></svg>Alerte déclenchée</span>
      </div>
      <p className="mt-3 text-[11px] text-muted">
        Baisser le seuil attrape plus de fraudes mais bloque plus de clients honnêtes : le bon seuil dépend du coût de chaque erreur.
      </p>
    </DemoShell>
  );
}
