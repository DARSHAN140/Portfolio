/** Outils partagés par les routes API */

export function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export function getClientIp(req: Request) {
  // Sur Vercel, x-forwarded-for est fixé par la plateforme (première valeur = IP du client)
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

/** Refuse les requêtes envoyées depuis un autre site (protection CSRF / abus) */
export function isSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Lit un corps JSON en imposant le Content-Type et une taille maximale */
export async function readJson(
  req: Request,
  maxBytes: number,
): Promise<{ ok: true; data: unknown } | { ok: false; res: Response }> {
  if (!req.headers.get("content-type")?.includes("application/json")) {
    return { ok: false, res: json({ error: "Format non supporté." }, 415) };
  }
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > maxBytes) return { ok: false, res: json({ error: "Requête trop volumineuse." }, 413) };
  const raw = await req.text();
  if (raw.length > maxBytes) return { ok: false, res: json({ error: "Requête trop volumineuse." }, 413) };
  try {
    return { ok: true, data: JSON.parse(raw) };
  } catch {
    return { ok: false, res: json({ error: "Requête invalide." }, 400) };
  }
}
