"use client";

/**
 * Intègre une application hébergée ailleurs (Streamlit, Hugging Face, Power BI…).
 * - Rien n'est chargé tant que le visiteur ne clique pas (vie privée + performance).
 * - L'iframe est isolée (sandbox) et ne reçoit pas l'URL complète de la page (referrer).
 * - Seuls les hôtes de EMBED_HOSTS passent la validation au build ET la CSP.
 */
import { useState } from "react";

export default function EmbedDemo({ url, title, height }: { url: string; title: string; height: number }) {
  const [on, setOn] = useState(false);
  const host = new URL(url).hostname;

  if (!on) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface p-8 text-center"
        style={{ minHeight: Math.min(height, 420) }}
      >
        <p className="font-medium">{title}</p>
        <p className="max-w-md text-sm text-muted">
          Cette démo est hébergée sur <span className="font-mono">{host}</span>. Elle peut mettre quelques secondes à
          démarrer si elle était en veille.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => setOn(true)}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-bg hover:opacity-90">
            Lancer la démo
          </button>
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="rounded-md border border-border px-4 py-2 text-sm hover:border-accent">
            Ouvrir dans un onglet ↗
          </a>
        </div>
      </div>
    );
  }

  return (
    <iframe
      src={url}
      title={title}
      height={height}
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
      allow="fullscreen"
      className="w-full rounded-2xl border border-border bg-surface"
    />
  );
}
