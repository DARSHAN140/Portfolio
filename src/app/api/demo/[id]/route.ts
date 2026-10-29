import { DEMO_APIS } from "@/config/demo-apis";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp, isSameOrigin, json, readJson } from "@/lib/http";
import { serverEnv } from "@/lib/env";

export const maxDuration = 10;

/**
 * Proxy sécurisé vers une API de modèle externe (voir src/config/demo-apis.ts).
 * POST /api/demo/<id>  → transmet le JSON à l'URL définie dans la variable d'environnement.
 */
export async function POST(req: Request, ctx: RouteContext<"/api/demo/[id]">) {
  const { id } = await ctx.params;

  // Liste blanche : seuls les ids déclarés existent
  const api = Object.hasOwn(DEMO_APIS, id) ? DEMO_APIS[id] : undefined;
  if (!api) return json({ error: "Démo inconnue." }, 404);

  if (!isSameOrigin(req)) return json({ error: "Origine non autorisée." }, 403);

  const limit = await rateLimit(getClientIp(req), {
    prefix: `demo:${id}`,
    limit: api.perMinute,
    windowSeconds: 60,
  });
  if (limit.unavailable) return json({ error: "Service momentanément indisponible." }, 503);
  if (!limit.ok) return json({ error: "Trop de requêtes, patientez une minute." }, 429);

  const body = await readJson(req, api.maxBytes);
  if (!body.ok) return body.res;
  if (typeof body.data !== "object" || body.data === null || Array.isArray(body.data)) {
    return json({ error: "Objet JSON attendu." }, 400);
  }

  const target = process.env[api.urlEnv];
  if (!target || !target.startsWith("https://")) {
    return json({ error: "Cette démo n'est pas encore connectée à son API." }, 503);
  }

  try {
    const upstream = await fetch(target, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Jeton partagé : ton API peut refuser tout appel qui ne vient pas du portfolio
        ...(serverEnv().DEMO_API_TOKEN ? { "X-Demo-Token": serverEnv().DEMO_API_TOKEN as string } : {}),
      },
      body: JSON.stringify(body.data),
      cache: "no-store",
      redirect: "error", // pas de redirection vers un autre hôte
      signal: AbortSignal.timeout(8000),
    });
    const text = await upstream.text();
    if (text.length > 50_000) return json({ error: "Réponse trop volumineuse." }, 502);
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      return json({ error: "Réponse invalide du modèle." }, 502);
    }
    // On ne relaie jamais les détails d'erreur internes de l'API
    if (!upstream.ok) return json({ error: "Le modèle a renvoyé une erreur." }, 502);
    return json(data);
  } catch {
    return json({ error: "Le modèle ne répond pas (il se réveille peut-être, réessayez)." }, 504);
  }
}

export function GET() {
  return json({ error: "Méthode non autorisée." }, 405);
}
