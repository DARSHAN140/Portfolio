/**
 * Sonde de disponibilité pour un service de monitoring (UptimeRobot, Better Stack…).
 * Indique aussi le mode de fonctionnement (sans aucun secret) :
 *  - status "ok"        : tout est nominal
 *  - status "degraded"  : le site fonctionne, mais un service optionnel n'est pas configuré
 */
import { serverEnv } from "@/lib/env";
import { rateLimitBackend } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 5;

export function GET() {
  const env = serverEnv();
  const checks = {
    pages: "static",
    contact: env.RESEND_API_KEY && env.CONTACT_TO_EMAIL ? "ready" : "not_configured",
    rateLimit: rateLimitBackend(),
    rateLimitOnFailure: env.RATE_LIMIT_FAILURE_MODE === "closed" ? "CP" : "AP",
  };
  const degraded = checks.contact !== "ready" || checks.rateLimit !== "distributed";
  return Response.json(
    {
      status: degraded ? "degraded" : "ok",
      checks,
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
      region: process.env.VERCEL_REGION ?? "local",
      time: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
