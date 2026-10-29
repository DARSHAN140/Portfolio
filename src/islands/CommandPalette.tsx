"use client";

/**
 * Palette de commandes (⌘K / Ctrl+K, ou bouton "Menu").
 * Sert aussi de menu mobile : une seule interface, accessible au clavier.
 */
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

export type PaletteItem = {
  group: string;
  label: string;
  href: string;
  hint?: string;
  external?: boolean;
  /** Déclenche un événement au lieu de naviguer (ex. ouvrir la vue recruteur) */
  event?: string;
};

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

export default function CommandPalette({ items }: { items: PaletteItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const listId = useId();

  const results = useMemo(() => {
    const tokens = norm(query).split(/\s+/).filter(Boolean);
    return items.filter((it) => {
      const hay = norm(`${it.label} ${it.group} ${it.hint ?? ""}`);
      return tokens.every((t) => hay.includes(t));
    });
  }, [items, query]);

  const show = useCallback(() => {
    lastFocus.current = document.activeElement as HTMLElement | null;
    setQuery("");
    setIndex(0);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    lastFocus.current?.focus?.();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) close();
        else show();
      }
    };
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.("[data-open-palette]")) {
        e.preventDefault();
        show();
      }
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [open, show, close]);

  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const go = (it: PaletteItem | undefined) => {
    if (!it) return;
    setOpen(false);
    if (it.event) window.dispatchEvent(new CustomEvent(it.event));
    else if (it.external) window.open(it.href, "_blank", "noopener,noreferrer");
    else router.push(it.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[index]);
    } else if (e.key === "Tab") {
      e.preventDefault(); // garde le focus dans la palette
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center bg-black/70 backdrop-blur-md sm:pt-[14vh]" onMouseDown={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation rapide"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
        className="flex h-full w-full flex-col overflow-hidden border-border bg-surface shadow-2xl sm:h-auto sm:max-h-[70vh] sm:max-w-xl sm:rounded-2xl sm:border"
      >
        <div className="flex items-center gap-3 border-b border-border px-5">
          <span className="font-mono text-accent" aria-hidden>
            ›
          </span>
          <input
            ref={input}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            placeholder="Rechercher un projet, une démo…"
            className="h-16 flex-1 bg-transparent text-base outline-none placeholder:text-muted focus-visible:outline-none"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={results[index] ? `${listId}-${index}` : undefined}
            autoComplete="off"
            spellCheck={false}
          />
          <button type="button" onClick={close} className="rounded border border-border px-2 py-1 font-mono text-[10px] text-muted">
            ÉCHAP
          </button>
        </div>
        <ul id={listId} role="listbox" className="flex-1 overflow-y-auto p-2">
          {results.length === 0 && <li className="px-4 py-8 text-center text-sm text-muted">Aucun résultat.</li>}
          {results.map((it, i) => {
            const header = i === 0 || results[i - 1].group !== it.group ? it.group : null;
            return (
              <li key={it.group + it.href + it.label} role="presentation">
                {header && (
                  <p className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{header}</p>
                )}
                <div
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === index}
                  onMouseMove={() => setIndex(i)}
                  onClick={() => go(it)}
                  className="flex cursor-pointer items-center justify-between gap-4 rounded-lg px-3 py-3 text-sm aria-selected:bg-surface-2 aria-selected:text-accent"
                >
                  <span>{it.label}</span>
                  <span className="truncate font-mono text-[10px] uppercase tracking-wider text-muted">
                    {it.hint ?? ""}
                    {it.external ? " ↗" : ""}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="hidden items-center gap-4 border-t border-border px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-muted sm:flex">
          <span>↑↓ naviguer</span>
          <span>↵ ouvrir</span>
          <span>⌘K fermer</span>
        </div>
      </div>
    </div>
  );
}
