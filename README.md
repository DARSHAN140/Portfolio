# Portfolio – Darshan Axel Boutoukou Mouvoungou

Portfolio professionnel d'ingénieur data : Next.js 16 + TypeScript + Tailwind CSS 4 + Three.js, hébergé sur Vercel.

**Concept « Signal »** : un site noir, éditorial, dont la couleur d'accent évolue au fil du défilement (turquoise → bleu → violet).

- **Ta photo, vivante et en 3D** : la vraie photo (détourée) est plaquée sur un relief calculé par IA (carte de profondeur MiDaS). Elle respire, pivote vers la souris, un faisceau de « scan » la parcourt et des particules s'en échappent. Au défilement, elle se dissout en ~30 000 particules qui deviennent des clusters (*Explorer*), un réseau de neurones (*Modéliser*) puis des barres (*Décider*).
- **Vue recruteur (30 secondes)** : un panneau qui résume ton profil, adapté au poste (Data Scientist, Data Analyst · BI, Data Engineer), avec les projets à regarder, le CV, un lien à partager et une version imprimable. Ouverture depuis le hero, le bouton flottant, ⌘K ou le lien `/?recruteur` à mettre dans tes candidatures.
- **Page « Sous le capot »** (`/stack`) : schéma d'architecture et mesures de sécurité, pour les recruteurs techniques.
- **Index des projets** façon magazine, avec une vignette générative qui suit le curseur.
- **Démos live** : score crédit explicable, seuil de fraude, dashboard de ventes, plus l'intégration sécurisée d'apps Streamlit, Hugging Face ou Power BI.
- **Palette de commandes** (⌘K / Ctrl+K, ou « Menu » sur mobile) pour naviguer au clavier.
- **Détails** : curseur contextuel, boutons magnétiques, texte qui se « décode », manifeste qui s'allume au défilement, cartes à halo, grain argentique, heure locale de Fès.
- **Sécurité** : en-têtes HTTP stricts, photo protégée, formulaire et proxy d'API durcis, variables d'environnement validées, contenu validé au build, `security.txt`.
- **Infrastructure** : pages statiques sur le CDN Vercel, fonctions à Paris (`cdg1`, proche du Maroc), sonde `/api/health`, journaux structurés, Vercel Analytics et Speed Insights (sans cookie), CI GitHub (lint, types, audit, build, 28 tests de fumée), CodeQL, Dependabot.
- **Accessibilité et performance** : pages statiques, 3D chargée à la demande et mise en pause hors écran, respect de « réduire les animations », navigation clavier, contrastes vérifiés.

> 🚀 **Mise en ligne pas à pas depuis VS Code (Windows) : [docs/DEPLOIEMENT.md](docs/DEPLOIEMENT.md)**
> 📘 Faire évoluer le site : [docs/EVOLUER.md](docs/EVOLUER.md) · Architecture, scalabilité, CAP : [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

**Performance mobile** : sur téléphone, le hero utilise une version légère en CSS (pas de téléchargement de Three.js) ; la 3D complète ne se charge que sur ordinateur, après l'affichage de la page. Lighthouse : 99 en performance sur ordinateur ; sur mobile (4G lente simulée, CPU ×4) 86 à 91 en performance, 100 en accessibilité, bonnes pratiques et SEO.

---

## 1. Lancer le projet en local

Prérequis : [Node.js 22 LTS](https://nodejs.org) et Git.

```bash
npm install
cp .env.example .env.local   # puis remplis les valeurs
npm run dev                  # http://localhost:3000
```

Scripts utiles :

| Commande            | Rôle                                       |
| ------------------- | ------------------------------------------ |
| `npm run dev`       | Serveur de développement                   |
| `npm run build`     | Build de production (comme sur Vercel)     |
| `npm run lint`      | Vérifie la qualité du code                 |
| `npm run typecheck` | Vérifie les types TypeScript               |
| `npm run test:smoke` | Teste le site lancé (`npm start`) : pages, en-têtes, API |
| `npm run new:project -- nom` | Crée un nouveau projet                |
| `npm run new:post -- nom`    | Crée un nouvel article de blog         |
| `npm run check`     | Tout vérifier avant de pousser (lint, types, build) |

> 📘 Pour faire évoluer le site au fil du temps : **[docs/EVOLUER.md](docs/EVOLUER.md)**. Architecture, scalabilité et choix CAP : **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**.

---

## 2. Modifier le contenu

Cherche les `TODO` (`grep -rn TODO src/content`) pour voir ce qu'il reste à compléter. Ils sont en commentaires : ils n'apparaissent pas sur le site.

| Je veux…                         | Où                                                                 |
| -------------------------------- | ------------------------------------------------------------------ |
| Changer bio, liens, compétences, parcours | `src/content/site.ts`                                     |
| Ajouter un projet                | `npm run new:project -- mon-projet` puis édite `src/content/projects/mon-projet.mdx` |
| Ajouter un article de blog       | Crée `src/content/blog/mon-article.mdx` (copie l'article existant)  |
| Changer la photo                 | Remplace `public/images/portrait-cutout.webp` (photo **détourée**, fond transparent, cadrée buste) et `src/assets/portrait-og.jpg`. Pour détourer : remove.bg ou l'outil « Supprimer l'arrière-plan » de Windows/macOS |
| Changer les couleurs             | `src/lib/accent.ts` (plage de teintes) et `src/app/globals.css` (variables)  |
| Changer les étapes du hero       | `STAGES` dans `src/app/page.tsx`                                    |
| Remplacer le CV                  | Remplace `public/cv/Darshan-Axel-CV.pdf` (même nom)                |
| Ajouter des captures de projets  | Dépose les images dans `public/projets/` et utilise `![texte](/projets/image.png)` dans le MDX |

### Ajouter un projet (2 minutes)

```bash
npm run new:project -- prevision-ventes
```

Le fichier créé contient un bloc `meta` (titre, année, résumé, tags, chiffres clés, liens, démo) suivi du texte de la page, écrit en Markdown. Passe `draft: false` pour le publier. Il apparaît automatiquement dans la liste des projets, la page d'accueil (si `featured: true`), les démos et le sitemap.

**Le `meta` est validé au build** : une faute de frappe, une URL non HTTPS ou une démo sur un domaine non autorisé fait échouer le build avec un message clair, et rien de cassé n'est mis en ligne.

### Ajouter une démo à un projet

Trois types, au choix, dans le `meta` du projet :

```js
// 1. Démo codée dans le portfolio (tourne dans le navigateur)
demo: { type: "builtin", id: "credit-scoring" }

// 2. Application hébergée ailleurs, intégrée dans la page
demo: { type: "embed", url: "https://mon-app.streamlit.app/?embed=true", title: "Mon app" }

// 3. Simple bouton vers une démo externe
demo: { type: "link", url: "https://huggingface.co/spaces/moi/demo", label: "Tester sur Hugging Face" }
```

**Où héberger gratuitement tes applications Python :**

| Type d'app                  | Hébergement gratuit                                             | Type de démo        |
| --------------------------- | --------------------------------------------------------------- | ------------------- |
| Streamlit                   | [Streamlit Community Cloud](https://streamlit.io/cloud)         | `embed` (ajoute `?embed=true` à l'URL) |
| Gradio / Streamlit / Docker | [Hugging Face Spaces](https://huggingface.co/spaces)            | `embed` (URL `https://xxx.hf.space`) |
| Rapport Power BI            | « Publier sur le web » dans Power BI Service                    | `embed`             |
| API FastAPI                 | Render, Railway, Hugging Face Spaces (Docker)                   | proxy (voir ci-dessous) |

Les domaines autorisés en iframe sont listés dans `src/config/security.ts` (`EMBED_HOSTS`). Cette liste alimente **à la fois** la CSP et la validation. Les iframes ne se chargent qu'au clic du visiteur et sont isolées (`sandbox`).

**Créer une nouvelle démo intégrée** : crée `src/demos/MaDemo.tsx`, puis déclare-la dans `src/demos/registry.ts` et `src/demos/DemoLoader.tsx`. Les trois démos existantes servent d'exemples.

### Brancher ta vraie API de modèle (FastAPI)

Le navigateur n'appelle jamais ton API directement. Il passe par `/api/demo/<id>` sur le portfolio, qui vérifie l'origine, limite le débit, borne la taille, coupe au bout de 8 s et ajoute un jeton secret.

1. Déclare l'API dans `src/config/demo-apis.ts` (déjà fait pour `credit-scoring`).
2. Dans Vercel, ajoute `DEMO_CREDIT_API_URL=https://ton-api.onrender.com/predict` et `DEMO_API_TOKEN=<chaîne aléatoire longue>`.
3. Dans ton API FastAPI, refuse toute requête sans le bon jeton :

```python
import os, secrets
from fastapi import Header, HTTPException

def check_token(x_demo_token: str = Header(default="")):
    if not secrets.compare_digest(x_demo_token, os.environ["DEMO_API_TOKEN"]):
        raise HTTPException(status_code=401)
```

4. Côté démo, appelle `fetch("/api/demo/credit-scoring", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profil) })`.

> ⚠️ **Avant de publier**
> - Complète les liens GitHub et LinkedIn (`site.links`).
> - Remplace les « TODO » des projets par de vrais chiffres : un recruteur data regarde d'abord les **résultats mesurables**.
> - Le CV PDF public contient ton numéro de téléphone. Si tu préfères ne pas l'exposer, publie une version sans numéro.
> - Pour Bank of Africa : ne publie **aucune donnée ni capture confidentielle**. Décris la démarche, pas les données.

---

## 3. Mettre le code sur GitHub

```bash
git add .
git commit -m "Initial portfolio"
git branch -M main
git remote add origin https://github.com/<ton-pseudo>/portfolio.git
git push -u origin main
```

Sécurité du compte GitHub (5 minutes, fortement recommandé) :

1. Active la **double authentification (2FA)** : Settings → Password and authentication.
2. Dans le dépôt : Settings → Code security → active **Dependabot alerts**, **Secret scanning** et **Push protection**.
3. Settings → Branches → ajoute une règle sur `main` qui exige que la CI passe avant de fusionner.

`.env.local` est ignoré par Git : **ne commite jamais de clé API.** Si une clé fuite, révoque-la immédiatement chez le fournisseur.

---

## 4. Déployer sur Vercel

1. Crée un compte sur [vercel.com](https://vercel.com) avec ton compte GitHub, puis active la 2FA.
2. **Add New → Project**, importe le dépôt `portfolio`. Vercel détecte Next.js tout seul.
3. **Environment Variables** : ajoute les variables de la section 5.
4. Clique sur **Deploy**. Ton site est en ligne sur `https://<projet>.vercel.app`.

Ensuite, chaque `git push` sur `main` redéploie automatiquement. Chaque pull request obtient une URL de prévisualisation.

Réglages Vercel conseillés (Project → Settings) :

- **Deployment Protection** : garde « Vercel Authentication » sur les déploiements de **Preview** (seule la production est publique).
- **Security → Attack Challenge Mode** : à activer seulement si tu subis une attaque.

---

## 5. Variables d'environnement

| Variable                   | Obligatoire | Description                                                                 |
| -------------------------- | ----------- | --------------------------------------------------------------------------- |
| `RESEND_API_KEY`           | Oui         | Clé API [Resend](https://resend.com) (offre gratuite) pour envoyer les e-mails |
| `CONTACT_TO_EMAIL`         | Oui         | Adresse qui reçoit les messages (ex. ton Gmail)                              |
| `NEXT_PUBLIC_SITE_URL`     | Recommandé  | URL publique sans `/` final. Par défaut : l'URL de production Vercel         |
| `CONTACT_FROM_EMAIL`       | Non         | Expéditeur sur ton domaine vérifié dans Resend                               |
| `UPSTASH_REDIS_REST_URL`   | Recommandé  | Limitation de débit partagée (Vercel → Marketplace → Upstash Redis, gratuit) |
| `UPSTASH_REDIS_REST_TOKEN` | Recommandé  | Jeton associé                                                                |
| `DEMO_CREDIT_API_URL`      | Non         | URL https de ton API de scoring (proxy `/api/demo/credit-scoring`)           |
| `DEMO_API_TOKEN`           | Non         | Secret partagé envoyé à ton API (en-tête `X-Demo-Token`)                     |
| `RATE_LIMIT_FAILURE_MODE`  | Non         | `open` (défaut, AP) ou `closed` (CP) si Redis est injoignable — voir `docs/ARCHITECTURE.md` |

**Configurer Resend :**

1. Crée un compte, puis **API Keys → Create** avec la permission « Sending access » uniquement (principe du moindre privilège).
2. Sans domaine, l'expéditeur `onboarding@resend.dev` n'envoie **qu'à l'adresse de ton compte Resend**. Utilise donc la même adresse pour `CONTACT_TO_EMAIL`.
3. Avec un domaine : Resend → Domains → ajoute-le et crée les enregistrements DNS (SPF/DKIM). Mets ensuite `CONTACT_FROM_EMAIL="Portfolio <contact@ton-domaine.dev>"`.

---

## 6. Nom de domaine (optionnel, ~10 €/an)

Un domaine comme `darshan-axel.dev` fait plus professionnel sur un CV.

1. Achète-le (Vercel Domains, Cloudflare Registrar, Namecheap…).
2. Vercel → Project → Settings → **Domains** → ajoute-le et suis les instructions DNS.
3. Mets `NEXT_PUBLIC_SITE_URL=https://darshan-axel.dev` puis redéploie.
4. Le certificat HTTPS est automatique. Le TLD `.dev` impose HTTPS (HSTS preload) par défaut.

---

## 7. Après la mise en ligne

**Checklist infrastructure (15 minutes, une seule fois) :**

1. **Vercel → Analytics** et **Speed Insights** : clique sur « Enable ». Tu sauras combien de recruteurs visitent, depuis quel pays, et quelles pages ils lisent (sans cookie, conforme RGPD).
2. **Vercel → Storage / Marketplace → Upstash Redis** : connecte-le au projet. Les variables `UPSTASH_REDIS_REST_*` sont ajoutées automatiquement, et l'anti-spam devient global.
3. **Vercel → Firewall** : ajoute une règle « Rate limit » sur le chemin `/api/` (par exemple 30 requêtes par minute et par IP). C'est une seconde barrière avant même le code.
4. **Monitoring** : crée une sonde gratuite (UptimeRobot ou Better Stack) sur `https://ton-site/api/health`. Tu reçois un e-mail si le site tombe.
5. **GitHub → Settings → Code security** : active CodeQL (le workflow est déjà prêt), Secret scanning et Push protection.
6. **Candidatures** : mets le lien `https://ton-site/?recruteur` dans tes e-mails. Il ouvre directement le résumé en 30 secondes.

**Vérifications :**

- Vérifie la sécurité sur [securityheaders.com](https://securityheaders.com) (objectif : note **A**) et [observatory.mozilla.org](https://developer.mozilla.org/en-US/observatory).
- Vérifie le SEO et les performances avec Lighthouse (Chrome DevTools).
- Ajoute le site à [Google Search Console](https://search.google.com/search-console) et soumets `/sitemap.xml`.
- Teste l'aperçu LinkedIn avec le [Post Inspector](https://www.linkedin.com/post-inspector/).
- Mets l'URL du portfolio sur ton CV, ton profil LinkedIn et ton GitHub.

---

## 8. Ce qui protège le site

| Mesure                               | Contre quoi                                             | Où                               |
| ------------------------------------ | ------------------------------------------------------- | -------------------------------- |
| Content-Security-Policy              | Injection de scripts (XSS), chargements externes        | `next.config.ts`                 |
| HSTS                                 | Rétrogradation HTTP / interception                      | `next.config.ts`                 |
| X-Frame-Options + `frame-ancestors`  | Clickjacking (site intégré dans une iframe malveillante) | `next.config.ts`                 |
| X-Content-Type-Options, Referrer-Policy, Permissions-Policy | Détournement MIME, fuite d'URL, accès aux API sensibles | `next.config.ts` |
| En-tête `X-Powered-By` supprimé      | Empreinte technologique                                 | `next.config.ts`                 |
| Vérification de l'origine            | Envoi du formulaire depuis un autre site (CSRF)         | `src/app/api/contact/route.ts`   |
| Taille max + Content-Type obligatoire | Requêtes abusives ou malformées                        | `src/app/api/contact/route.ts`   |
| Validation Zod + suppression des caractères de contrôle | Données invalides, injection d'en-têtes e-mail | `src/lib/contact-schema.ts` |
| E-mail en texte brut                 | Injection HTML dans le message reçu                     | `src/app/api/contact/route.ts`   |
| Pot de miel + délai minimum          | Robots spammeurs                                        | `ContactForm.tsx`, API           |
| Limitation de débit (3 messages / 10 min / IP) | Spam et épuisement du quota Resend            | `src/lib/rate-limit.ts`          |
| Clés uniquement côté serveur          | Vol de clé API                                          | Variables Vercel                 |
| Routes dynamiques fermées (`dynamicParams = false`) | Accès à des fichiers arbitraires via l'URL | `[slug]/page.tsx`              |
| Liens externes `noopener noreferrer` | Tabnabbing                                              | Composants                       |
| Liste blanche des iframes (CSP `frame-src` + validation au build) | Intégration d'un site malveillant | `src/config/security.ts`      |
| Iframes `sandbox`, chargées au clic  | Scripts tiers non désirés, pistage                      | `src/demos/EmbedDemo.tsx`        |
| Proxy d'API : liste blanche, origine, débit, taille, timeout, pas de redirection, jeton secret | Abus de ton API de modèle, fuite de son URL | `src/app/api/demo/[id]/route.ts` |
| Validation zod du contenu au build   | Publication d'un projet mal formé                       | `src/lib/content.ts`             |
| Démos 100 % côté navigateur          | Aucune donnée visiteur collectée                        | `src/demos/`                     |
| Photo rendue en WebGL, clic droit et glisser désactivés | Téléchargement facile de la photo        | `src/islands/ParticleHero.tsx`   |
| `Cross-Origin-Resource-Policy: same-origin` | Intégration de ta photo ou de ton CV sur d'autres sites | `next.config.ts`           |
| `X-Robots-Tag: noimageindex, noai` + robots.txt | Photo dans Google Images, collecte pour entraîner des IA | `next.config.ts`, `src/app/robots.ts` |
| Variables d'environnement validées (zod) | Clé mal copiée qui casse le site en silence             | `src/lib/env.ts`                 |
| `security.txt` (RFC 9116)            | Faille découverte sans moyen de te prévenir             | `src/app/.well-known/security.txt` |
| Tests de fumée en CI                 | Régression de sécurité (en-tête supprimé, API ouverte…) | `scripts/smoke.mjs`              |

> **À savoir sur la photo** : rien de ce qui s'affiche à l'écran ne peut être protégé à 100 % (une capture d'écran reste possible). Ces mesures empêchent la récupération *facile* et *automatisée* de ta photo, ce qui couvre l'essentiel des abus.
| Polices auto-hébergées, aucun tracker | Fuite de données visiteurs, conformité RGPD            | `layout.tsx`                     |
| CI (lint, types, `npm audit`, build) + Dependabot | Régressions et dépendances vulnérables      | `.github/`                       |

> **Choix assumé** : la CSP utilise `'unsafe-inline'` pour les scripts. C'est l'approche recommandée par Next.js pour garder un site **statique** (rapide et gratuit). Comme le site n'affiche aucun contenu fourni par les visiteurs, le risque XSS est très faible. Pour aller plus loin, la doc Next.js décrit la CSP à nonce (`proxy.ts`), au prix d'un rendu dynamique.
