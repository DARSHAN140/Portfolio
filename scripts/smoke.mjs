#!/usr/bin/env node
/**
 * Tests de fumée : vérifient le site construit (npm run build && npm start).
 * Usage : BASE_URL=http://localhost:3000 node scripts/smoke.mjs
 */
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
let failed = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) failed++;
};
const get = (path, init) => fetch(BASE + path, { redirect: "manual", ...init });

// Pages
for (const path of ["/", "/projets", "/demos", "/blog", "/contact", "/stack", "/sitemap.xml", "/robots.txt", "/.well-known/security.txt", "/api/health"]) {
  const r = await get(path);
  ok(r.status === 200, `${path} → 200 (${r.status})`);
}
ok((await get("/cette-page-nexiste-pas")).status === 404, "page inconnue → 404");
ok((await get("/projets/..%2F..%2Fetc%2Fpasswd")).status === 404, "traversée de chemin → 404");

// En-têtes de sécurité
const h = (await get("/")).headers;
for (const name of [
  "content-security-policy",
  "strict-transport-security",
  "x-frame-options",
  "x-content-type-options",
  "referrer-policy",
  "permissions-policy",
  "cross-origin-resource-policy",
]) ok(h.has(name), `en-tête ${name}`);
ok(!h.has("x-powered-by"), "pas d'en-tête x-powered-by");
ok(/frame-ancestors 'none'/.test(h.get("content-security-policy") ?? ""), "CSP : frame-ancestors 'none'");
ok(/noimageindex/.test((await get("/images/portrait-cutout.webp")).headers.get("x-robots-tag") ?? ""), "photo non indexable");

// API
const post = (path, body, headers = {}) =>
  get(path, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body) });
ok((await post("/api/contact", {}, { Origin: "https://evil.example" })).status === 403, "contact : autre origine → 403");
ok((await post("/api/contact", { name: "a" }, { Origin: BASE })).status === 400, "contact : champs invalides → 400");
ok((await get("/api/contact")).status === 405, "contact : GET → 405");
ok((await post("/api/demo/__proto__", {}, { Origin: BASE })).status === 404, "proxy : id inconnu → 404");
ok((await post("/api/demo/credit-scoring", [1], { Origin: BASE })).status === 400, "proxy : tableau refusé → 400");

// Robots
const robots = await (await get("/robots.txt")).text();
ok(robots.includes("GPTBot") && robots.includes("Googlebot-Image"), "robots.txt : IA d'entraînement et Google Images bloqués");

console.log(failed ? `\n${failed} test(s) en échec` : "\nTous les tests passent");
process.exit(failed ? 1 : 0);
