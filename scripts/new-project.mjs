#!/usr/bin/env node
/**
 * Crée un nouveau projet à partir du modèle.
 * Usage : npm run new:project -- mon-super-projet
 */
import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2];
if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error("Usage : npm run new:project -- mon-projet   (minuscules, chiffres, tirets)");
  process.exit(1);
}
const dir = path.join(process.cwd(), "src", "content", "projects");
const target = path.join(dir, `${slug}.mdx`);
if (fs.existsSync(target)) {
  console.error(`Le projet existe déjà : ${target}`);
  process.exit(1);
}
const template = fs.readFileSync(path.join(dir, "_template.mdx"), "utf8").replace(/^\{\/\*[\s\S]*?\*\/\}\n\n/, "");
fs.writeFileSync(target, template, { flag: "wx" });
console.log(`✅ Projet créé : src/content/projects/${slug}.mdx`);
console.log("   Remplis le meta, écris le contenu, puis passe draft: false pour le publier.");
