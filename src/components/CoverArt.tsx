/**
 * Visuels génératifs des projets (SVG, déterministes, aux couleurs de l'accent).
 * Aucun fichier image à produire : chaque projet a une "couverture" cohérente.
 * Pour une vraie capture, ajoute plutôt une image dans le contenu MDX.
 */
export type CoverKind = "waterfall" | "scatter" | "line" | "network" | "bars" | "grid";

function seeded(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

const W = 400;
const H = 300;

export default function CoverArt({ kind, seed, className = "" }: { kind: CoverKind; seed: string; className?: string }) {
  const r = seeded(seed);
  const grid = (
    <g stroke="rgb(255 255 255 / 0.06)">
      {Array.from({ length: 9 }, (_, i) => (
        <line key={`v${i}`} x1={(i * W) / 8} x2={(i * W) / 8} y1={0} y2={H} />
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <line key={`h${i}`} y1={(i * H) / 6} y2={(i * H) / 6} x1={0} x2={W} />
      ))}
    </g>
  );

  let body: React.ReactNode = null;
  if (kind === "waterfall") {
    let acc = 150;
    body = Array.from({ length: 8 }, (_, i) => {
      const d = (r() - 0.45) * 70;
      const y0 = acc;
      acc -= d;
      const up = d > 0;
      return (
        <rect key={i} x={40 + i * 42} width={28} y={Math.min(y0, acc)} height={Math.max(4, Math.abs(d))} rx={3}
          fill={up ? "var(--accent)" : "transparent"} stroke="var(--accent)" strokeWidth={1.5} opacity={0.4 + (i / 8) * 0.6} />
      );
    });
  } else if (kind === "scatter") {
    body = Array.from({ length: 140 }, (_, i) => {
      const cl = i % 3;
      const cx = [110, 250, 300][cl] + (r() + r() + r() - 1.5) * 70;
      const cy = [190, 110, 210][cl] + (r() + r() + r() - 1.5) * 60;
      const out = i % 23 === 0;
      return out ? (
        <rect key={i} x={cx - 4} y={cy - 4} width={8} height={8} transform={`rotate(45 ${cx} ${cy})`} fill="var(--accent)" />
      ) : (
        <circle key={i} cx={cx} cy={cy} r={2.2} fill="rgb(255 255 255 / 0.55)" />
      );
    });
  } else if (kind === "line") {
    const pts = Array.from({ length: 13 }, (_, i) => [20 + i * 30, 230 - i * 9 - r() * 45 - (i > 9 ? 25 : 0)]);
    const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join("");
    const prev = pts.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1] + 30 + r() * 15}`).join("");
    body = (
      <>
        <path d={`${d}L${pts[12][0]} ${H}L20 ${H}Z`} fill="var(--accent)" opacity={0.12} />
        <path d={prev} fill="none" stroke="rgb(255 255 255 / 0.3)" strokeWidth={1.5} strokeDasharray="5 5" />
        <path d={d} fill="none" stroke="var(--accent)" strokeWidth={2.5} strokeLinejoin="round" />
        {pts.map((p, i) => (i % 3 === 0 ? <circle key={i} cx={p[0]} cy={p[1]} r={4} fill="var(--bg)" stroke="var(--accent)" strokeWidth={2} /> : null))}
      </>
    );
  } else if (kind === "network") {
    const layers = [4, 6, 6, 2];
    const nodes = layers.map((n, l) => Array.from({ length: n }, (_, k) => [60 + l * 95, 150 + (k - (n - 1) / 2) * 42]));
    body = (
      <>
        {nodes.slice(0, -1).flatMap((layer, l) =>
          layer.flatMap((a, i) =>
            nodes[l + 1].map((b, j) => (
              <line key={`${l}-${i}-${j}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="var(--accent)" strokeWidth={1} opacity={0.15 + r() * 0.4} />
            )),
          ),
        )}
        {nodes.flat().map((n, i) => (
          <circle key={i} cx={n[0]} cy={n[1]} r={7} fill="var(--bg)" stroke="var(--accent)" strokeWidth={2} />
        ))}
      </>
    );
  } else if (kind === "bars") {
    body = Array.from({ length: 10 }, (_, i) => {
      const h = 40 + r() * 120 + i * 8;
      return <rect key={i} x={30 + i * 35} y={H - 30 - h} width={22} height={h} rx={3} fill="var(--accent)" opacity={0.3 + (i / 10) * 0.7} />;
    });
  } else {
    body = (
      <>
        {[0, 1, 2].map((c) => (
          <g key={c}>
            <rect x={30 + c * 120} y={40} width={100} height={22} rx={4} fill="var(--accent)" opacity={0.85 - c * 0.25} />
            {Array.from({ length: 5 }, (_, k) => (
              <rect key={k} x={30 + c * 120} y={76 + k * 38} width={100} height={28} rx={4} fill="none"
                stroke="rgb(255 255 255 / 0.25)" strokeDasharray={k === Math.floor(r() * 5) ? "0" : "3 3"} />
            ))}
          </g>
        ))}
      </>
    );
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-hidden preserveAspectRatio="xMidYMid slice">
      <rect width={W} height={H} fill="var(--surface)" />
      {grid}
      {body}
    </svg>
  );
}
