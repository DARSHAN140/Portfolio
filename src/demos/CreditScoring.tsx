"use client";

/**
 * Démo pédagogique : régression logistique aux coefficients ILLUSTRATIFS.
 * Pour un modèle linéaire, la contribution de chaque variable au log-odds,
 * w_i × (x_i − moyenne_i), correspond exactement à sa valeur SHAP.
 * Ce n'est pas le modèle de Bank of Africa (confidentiel).
 */
import { useMemo, useState } from "react";
import { DemoShell, Slider, fmt, fmtInt, fmtPct } from "./ui";

type Contract = "cdi" | "cdd" | "independant";

type Profile = {
  income: number; // MAD / mois
  debtRatio: number; // %
  seniority: number; // années
  incidents: number; // 12 derniers mois
  duration: number; // mois
  contract: Contract;
};

const AVERAGE: Profile = { income: 9000, debtRatio: 30, seniority: 5, incidents: 0.3, duration: 48, contract: "cdi" };
const CONTRACT_EFFECT: Record<Contract, number> = { cdi: -0.3, cdd: 0.35, independant: 0.2 };
const CONTRACT_MEAN = 0.6 * CONTRACT_EFFECT.cdi + 0.25 * CONTRACT_EFFECT.cdd + 0.15 * CONTRACT_EFFECT.independant;
const INTERCEPT = -2.45; // ≈ 8 % de défaut pour un profil moyen

const PRESETS: Record<string, Profile> = {
  "Profil solide": { income: 18000, debtRatio: 18, seniority: 9, incidents: 0, duration: 36, contract: "cdi" },
  "Profil moyen": { income: 9000, debtRatio: 30, seniority: 4, incidents: 0, duration: 48, contract: "cdi" },
  "Profil fragile": { income: 5000, debtRatio: 48, seniority: 1, incidents: 2, duration: 72, contract: "cdd" },
};

function explain(p: Profile) {
  const c = [
    { label: "Revenu mensuel", value: -0.9 * (Math.log(p.income) - Math.log(AVERAGE.income)) },
    { label: "Taux d'endettement", value: 0.05 * (p.debtRatio - AVERAGE.debtRatio) },
    { label: "Ancienneté emploi", value: -0.09 * (Math.min(p.seniority, 15) - AVERAGE.seniority) },
    { label: "Incidents de paiement", value: 0.75 * (p.incidents - AVERAGE.incidents) },
    { label: "Durée du crédit", value: 0.012 * (p.duration - AVERAGE.duration) },
    { label: "Type de contrat", value: CONTRACT_EFFECT[p.contract] - CONTRACT_MEAN },
  ];
  const logit = INTERCEPT + c.reduce((s, x) => s + x.value, 0);
  const prob = 1 / (1 + Math.exp(-logit));
  return { prob, contributions: c.sort((a, b) => Math.abs(b.value) - Math.abs(a.value)) };
}

const DECISIONS = [
  { max: 0.1, label: "Favorable", icon: "✓", cls: "text-[color:var(--risk-down)]" },
  { max: 0.25, label: "À étudier", icon: "!", cls: "text-amber-400" },
  { max: 1, label: "Défavorable", icon: "✕", cls: "text-[color:var(--risk-up)]" },
];

export default function CreditScoring() {
  const [p, setP] = useState<Profile>(PRESETS["Profil moyen"]);
  const set = <K extends keyof Profile>(k: K) => (v: Profile[K]) => setP((s) => ({ ...s, [k]: v }));
  const { prob, contributions } = useMemo(() => explain(p), [p]);
  const decision = DECISIONS.find((d) => prob < d.max) ?? DECISIONS[2];
  const maxAbs = Math.max(0.5, ...contributions.map((c) => Math.abs(c.value)));

  return (
    <DemoShell title="Simulateur de score crédit" note="modèle pédagogique">
      <div className="mb-5 flex flex-wrap gap-2">
        {Object.keys(PRESETS).map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setP(PRESETS[name])}
            className="rounded-md border border-border px-3 py-1 text-xs hover:border-accent"
          >
            {name}
          </button>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Entrées */}
        <div className="space-y-4">
          <Slider label="Revenu mensuel net" value={p.income} min={3000} max={40000} step={500}
            display={`${fmtInt(p.income)} MAD`} onChange={set("income")} />
          <Slider label="Taux d'endettement" value={p.debtRatio} min={0} max={70}
            display={`${p.debtRatio} %`} onChange={set("debtRatio")} />
          <Slider label="Ancienneté dans l'emploi" value={p.seniority} min={0} max={30}
            display={`${p.seniority} an${p.seniority > 1 ? "s" : ""}`} onChange={set("seniority")} />
          <Slider label="Incidents de paiement (12 mois)" value={p.incidents} min={0} max={5}
            display={String(p.incidents)} onChange={set("incidents")} />
          <Slider label="Durée du crédit" value={p.duration} min={12} max={84} step={6}
            display={`${p.duration} mois`} onChange={set("duration")} />
          <fieldset className="text-sm">
            <legend className="mb-1.5">Type de contrat</legend>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["cdi", "CDI"],
                  ["cdd", "CDD"],
                  ["independant", "Indépendant"],
                ] as const
              ).map(([v, l]) => (
                <label
                  key={v}
                  className={`cursor-pointer rounded-md border px-3 py-1 text-xs ${p.contract === v ? "border-accent bg-accent-soft" : "border-border"}`}
                >
                  <input type="radio" name="contract" value={v} checked={p.contract === v}
                    onChange={() => set("contract")(v)} className="sr-only" />
                  {l}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        {/* Résultat */}
        <div>
          <p className="text-sm text-muted">Probabilité de défaut estimée</p>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="text-4xl font-semibold tracking-tight">{fmtPct(prob)}</span>
            <span className={`text-sm font-medium ${decision.cls}`}>
              <span aria-hidden>{decision.icon} </span>
              {decision.label}
            </span>
          </div>

          {/* Jauge avec seuils */}
          <div className="relative mt-3 h-2 rounded-full bg-bg" role="img"
            aria-label={`Risque ${fmtPct(prob)}, seuils à 10 % et 25 %`}>
            <div className="h-2 rounded-full bg-accent transition-all" style={{ width: `${Math.min(prob / 0.5, 1) * 100}%` }} />
            {[0.1, 0.25].map((t) => (
              <span key={t} className="absolute top-[-3px] h-3.5 w-px bg-muted" style={{ left: `${(t / 0.5) * 100}%` }} />
            ))}
          </div>
          <div className="mt-1 flex justify-between font-mono text-[10px] text-muted">
            <span>0 %</span><span>10 %</span><span>25 %</span><span>50 %+</span>
          </div>

          <p className="mt-6 mb-2 text-sm font-medium">Pourquoi ce score ? (contributions type SHAP)</p>
          <ul className="space-y-2">
            {contributions.map((c) => {
              const up = c.value > 0;
              const w = (Math.abs(c.value) / maxAbs) * 50;
              return (
                <li key={c.label} className="grid grid-cols-[minmax(0,9.5rem)_1fr_3.5rem] items-center gap-2 text-xs">
                  <span className="truncate">{c.label}</span>
                  <span className="relative h-3">
                    <span className="absolute inset-y-0 left-1/2 w-px bg-border" />
                    <span
                      className="absolute inset-y-0 rounded-sm transition-all"
                      style={{
                        left: up ? "50%" : `${50 - w}%`,
                        width: `${w}%`,
                        background: up ? "var(--risk-up)" : "var(--risk-down)",
                      }}
                    />
                  </span>
                  <span className="text-right font-mono text-muted">
                    {Math.abs(c.value) < 0.005 ? "= 0,00" : `${up ? "▲ +" : "▼ −"}${fmt(Math.abs(c.value), 2)}`}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 flex gap-4 text-[11px] text-muted">
            <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm" style={{ background: "var(--risk-up)" }} />▲ augmente le risque</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm" style={{ background: "var(--risk-down)" }} />▼ réduit le risque</span>
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-muted">
            Coefficients illustratifs, aucune donnée réelle. Contributions exprimées en log-odds par rapport à un client moyen.
          </p>
        </div>
      </div>
    </DemoShell>
  );
}
