import { contactSchema } from "@/lib/contact-schema";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp, isSameOrigin, json, readJson } from "@/lib/http";
import { serverEnv } from "@/lib/env";

export const maxDuration = 10;

const MIN_FILL_MS = 3_000; // un humain met plus de 3 s à remplir le formulaire

export async function POST(req: Request) {
  // 1. Même origine obligatoire
  if (!isSameOrigin(req)) return json({ error: "Origine non autorisée." }, 403);

  // 2. Limitation de débit : 3 messages / 10 min / IP
  const limit = await rateLimit(getClientIp(req), { prefix: "contact", limit: 3, windowSeconds: 600 });
  if (limit.unavailable) return json({ error: "Service momentanément indisponible, réessayez dans un instant." }, 503);
  if (!limit.ok) return json({ error: "Trop de messages envoyés. Réessayez dans quelques minutes." }, 429);

  // 3. Type et taille du corps
  const body = await readJson(req, 10_000);
  if (!body.ok) return body.res;

  // 4. Validation stricte
  const parsed = contactSchema.safeParse(body.data);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "form");
      fieldErrors[field] ??= issue.message;
    }
    // Pot de miel rempli : on répond "succès" pour ne pas renseigner le robot
    if (fieldErrors.website) return json({ ok: true });
    return json({ error: "Certains champs sont invalides.", fieldErrors }, 400);
  }

  const { name, email, company, message, startedAt } = parsed.data;
  if (Date.now() - startedAt < MIN_FILL_MS) return json({ ok: true }); // robot probable : ignoré

  // 5. Envoi via Resend (clé uniquement côté serveur)
  const env = serverEnv();
  const apiKey = env.RESEND_API_KEY;
  const to = env.CONTACT_TO_EMAIL;
  const from = env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>";
  if (!apiKey || !to) {
    console.error("[contact] RESEND_API_KEY ou CONTACT_TO_EMAIL manquant");
    return json({ error: "Le formulaire est temporairement indisponible." }, 503);
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `Portfolio – message de ${name}${company ? ` (${company})` : ""}`,
        // Texte brut uniquement : aucun HTML fourni par l'utilisateur n'est interprété
        text: `Nom : ${name}\nE-mail : ${email}\nEntreprise : ${company || "-"}\n\n${message}`,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error(JSON.stringify({ evt: "contact.send_failed", status: res.status, id: req.headers.get("x-vercel-id") }));
      return json({ error: "L'envoi a échoué. Réessayez plus tard." }, 502);
    }
  } catch {
    return json({ error: "L'envoi a échoué. Réessayez plus tard." }, 502);
  }

  console.info(JSON.stringify({ evt: "contact.sent", id: req.headers.get("x-vercel-id") }));
  return json({ ok: true });
}

export function GET() {
  return json({ error: "Méthode non autorisée." }, 405);
}
