/**
 * Hôtes autorisés pour les démos intégrées (iframe).
 * - Utilisé par la CSP (frame-src) dans next.config.ts
 * - Utilisé par la validation des projets : un projet qui intègre un domaine
 *   absent de cette liste fait ÉCHOUER le build (impossible de l'oublier).
 *
 * Ajoute ici un hôte seulement si tu lui fais confiance.
 */
export const EMBED_HOSTS = [
  "*.streamlit.app", // Streamlit Community Cloud
  "*.hf.space", // Hugging Face Spaces (Gradio / Streamlit / Docker)
  "app.powerbi.com", // Power BI "Publier sur le web"
  "public.tableau.com", // Tableau Public
  "lookerstudio.google.com", // Looker Studio
  "www.youtube-nocookie.com", // Vidéo de démo (mode sans cookies)
] as const;

export function isAllowedEmbedUrl(raw: string): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  return EMBED_HOSTS.some((pattern) =>
    pattern.startsWith("*.")
      ? url.hostname.endsWith(pattern.slice(1)) && url.hostname.length > pattern.length - 1
      : url.hostname === pattern,
  );
}
