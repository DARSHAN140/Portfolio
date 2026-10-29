/**
 * Variables d'environnement serveur, validées une seule fois.
 * Une valeur mal formée est signalée clairement dans les logs Vercel,
 * sans jamais afficher le secret lui-même.
 */
import { z } from "zod";

const optionalHttps = z
  .string()
  .trim()
  .refine((v) => v.startsWith("https://"), "doit commencer par https://")
  .optional();

const schema = z.object({
  RESEND_API_KEY: z.string().trim().startsWith("re_", "doit commencer par re_").optional(),
  CONTACT_TO_EMAIL: z.email().optional(),
  CONTACT_FROM_EMAIL: z.string().trim().min(3).optional(),
  UPSTASH_REDIS_REST_URL: optionalHttps,
  UPSTASH_REDIS_REST_TOKEN: z.string().trim().min(10).optional(),
  DEMO_API_TOKEN: z.string().trim().min(24, "24 caractères minimum").optional(),
  /** Comportement si Redis est en panne : "open" = disponibilité (AP), "closed" = cohérence (CP) */
  RATE_LIMIT_FAILURE_MODE: z.enum(["open", "closed"]).default("open"),
});

export type ServerEnv = z.infer<typeof schema>;

let cached: ServerEnv | undefined;

export function serverEnv(): ServerEnv {
  if (cached) return cached;
  const raw = Object.fromEntries(
    Object.keys(schema.shape).map((k) => [k, process.env[k] === "" ? undefined : process.env[k]]),
  );
  const res = schema.safeParse(raw);
  if (!res.success) {
    for (const issue of res.error.issues) {
      console.error(`[env] ${String(issue.path[0])} : ${issue.message}`);
    }
    // Les variables invalides sont ignorées : la fonctionnalité concernée se désactive proprement
    const valid: Record<string, unknown> = { ...raw };
    for (const issue of res.error.issues) delete valid[String(issue.path[0])];
    cached = schema.parse(valid);
  } else {
    cached = res.data;
  }
  return cached;
}
