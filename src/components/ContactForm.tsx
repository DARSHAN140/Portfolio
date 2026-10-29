"use client";

import { useEffect, useRef, useState } from "react";

type Status = "idle" | "sending" | "success" | "error";

const inputClass =
  "w-full border-0 border-b border-border bg-transparent px-0 py-3 text-lg outline-none transition-colors placeholder:text-muted/50 focus:border-accent";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const startedAt = useRef(0);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    setFieldErrors({});

    const form = new FormData(e.currentTarget);
    const body = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      company: String(form.get("company") ?? ""),
      message: String(form.get("message") ?? ""),
      website: String(form.get("website") ?? ""),
      startedAt: startedAt.current,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFieldErrors(data.fieldErrors ?? {});
        setError(data.error ?? "Une erreur est survenue.");
        setStatus("error");
        return;
      }
      setStatus("success");
      (e.target as HTMLFormElement).reset();
    } catch {
      setError("Impossible de joindre le serveur. Vérifie ta connexion.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="py-10">
        <p className="text-3xl font-medium tracking-tight">Message <span className="font-serif font-normal italic text-accent">reçu.</span></p>
        <p className="mt-1 text-sm text-muted">Je vous réponds dans les plus brefs délais.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8">
      <div className="grid gap-8 sm:grid-cols-2">
        <Field label="Nom" name="name" error={fieldErrors.name}>
          <input id="name" name="name" required maxLength={100} autoComplete="name" className={inputClass} />
        </Field>
        <Field label="E-mail" name="email" error={fieldErrors.email}>
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={200}
            autoComplete="email"
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="Entreprise (facultatif)" name="company" error={fieldErrors.company}>
        <input id="company" name="company" maxLength={120} autoComplete="organization" className={inputClass} />
      </Field>
      <Field label="Message" name="message" error={fieldErrors.message}>
        <textarea id="message" name="message" required rows={5} maxLength={5000} className={inputClass} />
      </Field>

      {/* Pot de miel : caché aux humains et aux lecteurs d'écran */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">Ne pas remplir</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {error && (
        <p role="alert" className="text-sm text-[color:var(--risk-up)]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        data-magnetic
        className="rounded-full bg-accent px-8 py-4 text-sm font-medium text-black transition-colors hover:bg-fg disabled:opacity-60"
      >
        {status === "sending" ? "Envoi…" : "Envoyer"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="block font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-[color:var(--risk-up)]">{error}</p>}
    </div>
  );
}
