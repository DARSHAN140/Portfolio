/**
 * API de démo "proxifiées" : quand tu déploies un vrai modèle (ex. ton API FastAPI
 * sur Render, Railway ou Hugging Face), le navigateur n'appelle JAMAIS ton API directement.
 * Il appelle /api/demo/<id> sur ton portfolio, qui :
 *   - vérifie l'origine, la taille et le format de la requête,
 *   - limite le nombre d'appels par IP,
 *   - ajoute un jeton secret connu seulement de ton API (DEMO_API_TOKEN),
 *   - coupe la requête au bout de quelques secondes,
 *   - ne renvoie que du JSON.
 * L'URL réelle et le jeton restent dans les variables d'environnement Vercel.
 */
export type DemoApi = {
  /** Variable d'environnement contenant l'URL complète de l'endpoint (https) */
  urlEnv: string;
  /** Taille maximale du corps JSON envoyé (octets) */
  maxBytes: number;
  /** Requêtes autorisées par IP et par minute */
  perMinute: number;
};

export const DEMO_APIS: Record<string, DemoApi> = {
  "credit-scoring": { urlEnv: "DEMO_CREDIT_API_URL", maxBytes: 4_000, perMinute: 20 },
};
