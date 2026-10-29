#!/usr/bin/env node
/**
 * Crée un nouvel article de blog.
 * Usage : npm run new:post -- mon-article
 */
import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2];
if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error("Usage : npm run new:post -- mon-article   (minuscules, chiffres, tirets)");
  process.exit(1);
}
const target = path.join(process.cwd(), "src", "content", "blog", `${slug}.mdx`);
if (fs.existsSync(target)) {
  console.error(`L'article existe déjà : ${target}`);
  process.exit(1);
}
const today = new Date().toISOString().slice(0, 10);
const content = `export const meta = {
  title: "Titre de l'article",
  date: "${today}",
  summary: "Une ou deux phrases qui donnent envie de lire.",
  tags: ["Data"],
  draft: true, // passe à false pour publier
}

Introduction : le problème, et pourquoi il compte.

## Première partie

Ton texte en **Markdown**. Tu peux ajouter du code :

\`\`\`python
import pandas as pd
df = pd.read_csv("data.csv")
\`\`\`

## Ce que j'en retiens

La conclusion, en deux ou trois phrases.
`;
fs.writeFileSync(target, content, { flag: "wx" });
console.log(`✅ Article créé : src/content/blog/${slug}.mdx`);
console.log("   Écris-le, puis passe draft: false pour le publier.");
