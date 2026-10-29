/**
 * Limitation du nombre de requêtes par IP.
 *
 * - Si UPSTASH_REDIS_REST_URL et UPSTASH_REDIS_REST_TOKEN sont définis (offre gratuite Upstash,
 *   intégrable en 1 clic depuis le Marketplace Vercel), la limite est partagée entre toutes les
 *   instances serverless : c'est la configuration recommandée en production.
 * - Sinon, repli sur une limite en mémoire (par instance) : utile en local, plus faible en prod.
 */

import { serverEnv } from "@/lib/env";

type Options = { prefix: string; limit: number; windowSeconds: number };

const memory = new Map<string, { count: number; resetAt: number }>();

function memoryLimit(key: string, { limit, windowSeconds }: Options) {
  const now = Date.now();
  const entry = memory.get(key);
  if (!entry || entry.resetAt < now) {
    memory.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { ok: true };
  }
  entry.count += 1;
  if (memory.size > 5000) {
    for (const [k, v] of memory) if (v.resetAt < now) memory.delete(k);
  }
  return { ok: entry.count <= limit };
}

async function upstashLimit(key: string, opts: Options, url: string, token: string) {
  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, opts.windowSeconds, "NX"],
    ]),
    cache: "no-store",
    signal: AbortSignal.timeout(2000),
  });
  if (!res.ok) throw new Error("Upstash indisponible");
  const data = (await res.json()) as { result: number }[];
  return { ok: data[0].result <= opts.limit };
}

/**
 * Théorème CAP appliqué à l'anti-spam : quand Redis (l'état partagé) est injoignable,
 * on doit choisir entre DISPONIBILITÉ et COHÉRENCE.
 *  - "open"   (AP, par défaut) : on continue avec un compteur local par instance.
 *                                Le formulaire reste disponible, la limite devient approximative.
 *  - "closed" (CP)            : on refuse la requête (503). La limite reste exacte,
 *                                mais le formulaire est indisponible pendant la panne.
 * Réglable avec RATE_LIMIT_FAILURE_MODE.
 */
export type RateLimitResult = { ok: boolean; degraded?: boolean; unavailable?: boolean };

export async function rateLimit(identifier: string, opts: Options): Promise<RateLimitResult> {
  const key = `${opts.prefix}:${identifier}`;
  const env = serverEnv();
  const { UPSTASH_REDIS_REST_URL: url, UPSTASH_REDIS_REST_TOKEN: token } = env;
  if (url && token) {
    try {
      return await upstashLimit(key, opts, url, token);
    } catch {
      if (env.RATE_LIMIT_FAILURE_MODE === "closed") return { ok: false, unavailable: true };
      console.warn(JSON.stringify({ evt: "ratelimit.degraded", prefix: opts.prefix }));
      return { ...memoryLimit(key, opts), degraded: true };
    }
  }
  return memoryLimit(key, opts);
}

/** État de l'anti-spam pour la sonde de santé */
export function rateLimitBackend(): "distributed" | "local" {
  const { UPSTASH_REDIS_REST_URL: url, UPSTASH_REDIS_REST_TOKEN: token } = serverEnv();
  return url && token ? "distributed" : "local";
}
