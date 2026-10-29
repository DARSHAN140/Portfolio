import { site } from "@/content/site";

/** RFC 9116 : indique aux chercheurs en sécurité comment signaler une faille */
export const dynamic = "force-static";

export function GET() {
  const base = site.url.replace(/\/$/, "");
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 300).toISOString();
  const body = [
    `Contact: ${base}/contact`,
    `Expires: ${expires}`,
    "Preferred-Languages: fr, en",
    `Canonical: ${base}/.well-known/security.txt`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
