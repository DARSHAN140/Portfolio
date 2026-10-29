# Mettre le portfolio en ligne depuis VS Code (Windows)

Compte environ 30 minutes la première fois. Toutes les commandes se tapent dans le **terminal de VS Code** (menu *Terminal → Nouveau terminal*, ou `Ctrl + ù` / ``Ctrl + ` ``).

---

## 0. Installer les outils (une seule fois)

1. **Node.js 22 LTS** : <https://nodejs.org> (bouton « LTS »), ou dans un terminal :
   ```powershell
   winget install OpenJS.NodeJS.LTS
   ```
2. **Git** : <https://git-scm.com/download/win>, ou :
   ```powershell
   winget install Git.Git
   ```
3. **Ferme puis rouvre VS Code**, puis vérifie :
   ```powershell
   node -v      # doit afficher v22.x
   npm -v
   git --version
   ```
4. Crée un compte **GitHub** (<https://github.com>) et un compte **Vercel** (<https://vercel.com>, « Continue with GitHub »). Active la double authentification sur les deux.

> ⚠️ Si `npm` affiche « l'exécution de scripts est désactivée sur ce système », tape une fois :
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
> ```

---

## 1. Ouvrir le projet

1. Dézippe `portfolio.zip` (clic droit → *Extraire tout*), par exemple dans `Documents\portfolio`.
2. VS Code → *Fichier → Ouvrir le dossier…* → choisis le dossier `portfolio`.
3. Accepte d'installer les extensions recommandées (ESLint, Tailwind, MDX).

## 2. Installer et tester en local

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Ouvre <http://localhost:3000>. Pour arrêter : `Ctrl + C` dans le terminal.

Avant chaque mise en ligne, vérifie que tout est bon (comme le fera GitHub) :

```powershell
npm run check
```

## 3. Personnaliser l'essentiel (5 minutes)

Dans `src/content/site.ts` :

- remplace `https://github.com/TODO` et `https://www.linkedin.com/in/TODO` par tes vrais liens ;
- relis la bio et le bloc `recruiter`.

Dans `src/content/projects/*.mdx` : ajoute tes vrais chiffres dans `metrics` (ou laisse vide).

Optionnel : remplace `public/cv/Darshan-Axel-CV.pdf` par une version sans numéro de téléphone.

## 4. Envoyer le code sur GitHub

1. Sur GitHub : **New repository** → nom `portfolio` → **Private** ou **Public** → *ne coche rien* (pas de README) → **Create repository**.
2. Dans le terminal VS Code (remplace `TON-PSEUDO`) :

```powershell
git config --global user.name "Darshan Axel"
git config --global user.email "ton-email@exemple.com"

git add .
git commit -m "Personnalisation avant mise en ligne"
git branch -M main
git remote add origin https://github.com/TON-PSEUDO/portfolio.git
git push -u origin main
```

Une fenêtre de connexion GitHub s'ouvre la première fois : valide-la.

> Le dossier contient déjà un historique Git. Si `git status` affiche « not a git repository », lance d'abord `git init`, puis reprends les commandes ci-dessus.

Sur GitHub, l'onglet **Actions** lance automatiquement la CI (lint, types, audit, build, tests de sécurité). Elle doit passer au vert ✅.

## 5. Déployer sur Vercel

### Méthode recommandée : depuis le site Vercel

1. <https://vercel.com/new> → **Import** du dépôt `portfolio`.
2. Framework : **Next.js** (détecté automatiquement). Ne change rien d'autre.
3. **Environment Variables** : ajoute au minimum (voir la section 6) :
   - `RESEND_API_KEY`
   - `CONTACT_TO_EMAIL`
4. **Deploy**. Après environ 1 minute, ton site est en ligne sur `https://portfolio-xxx.vercel.app`.

Désormais, **chaque `git push` sur `main` redéploie automatiquement**.

### Méthode alternative : en ligne de commande

```powershell
npm install -g vercel
vercel login
vercel link
vercel env add RESEND_API_KEY production
vercel env add CONTACT_TO_EMAIL production
vercel --prod
```

## 6. Variables d'environnement

Vercel → ton projet → **Settings → Environment Variables**.

| Variable | Obligatoire | Où la trouver |
| --- | --- | --- |
| `RESEND_API_KEY` | Oui (formulaire) | <https://resend.com> → API Keys → *Create* (permission « Sending access ») |
| `CONTACT_TO_EMAIL` | Oui (formulaire) | L'adresse qui reçoit les messages (la même que ton compte Resend tant que tu n'as pas de domaine) |
| `NEXT_PUBLIC_SITE_URL` | Recommandé | L'URL finale, par ex. `https://portfolio-xxx.vercel.app` (sans `/` final) |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Recommandé | Vercel → **Storage → Upstash Redis** → *Connect* (ajoutées automatiquement) |
| `RATE_LIMIT_FAILURE_MODE` | Non | `open` (défaut, AP) ou `closed` (CP) |

Après avoir ajouté ou modifié une variable : **Deployments → ⋯ → Redeploy**.

## 7. Vérifier que tout fonctionne

- `https://ton-site/api/health` → `"status": "ok"` une fois Resend et Upstash configurés (`"degraded"` sinon, le site fonctionne quand même).
- Envoie-toi un message via la page **Contact**.
- <https://securityheaders.com> → note **A**.
- Ouvre le site sur ton téléphone.
- Vercel → **Analytics** et **Speed Insights** → *Enable*.

Puis termine la checklist de la section 7 du README : limite de requêtes dans Vercel Firewall, surveillance, protections GitHub.

---

## Ensuite : améliorer le site au quotidien

```powershell
git checkout main
git pull
git checkout -b amelioration/nouveau-projet   # une branche par amélioration

npm run new:project -- mon-projet   # nouveau projet
npm run new:post -- mon-article     # nouvel article de blog
npm run dev                         # vérifier en local

npm run check
git add .
git commit -m "Ajoute le projet mon-projet"
git push -u origin amelioration/nouveau-projet
```

Sur GitHub, ouvre la **Pull Request** proposée : Vercel publie une **URL d'aperçu** et la CI teste tout. Si c'est bon, clique sur **Merge** : c'est en ligne. En cas de problème, Vercel → **Deployments** → version précédente → **Promote** (retour en arrière immédiat).

Le détail (où modifier quoi, règles d'or) est dans [`docs/EVOLUER.md`](EVOLUER.md).

## Dépannage

| Problème | Solution |
| --- | --- |
| `npm.ps1 cannot be loaded` | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| `Port 3000 is in use` | `npm run dev -- -p 3001` |
| La CI échoue sur GitHub | Lance `npm run check` en local : le message d'erreur est le même |
| Le formulaire répond « temporairement indisponible » | `RESEND_API_KEY` ou `CONTACT_TO_EMAIL` manquant dans Vercel, puis *Redeploy* |
| Le build Vercel échoue sur un projet | Le message indique le fichier `.mdx` et le champ `meta` invalide |
