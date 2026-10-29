# Faire évoluer le site sans rien casser

## Le cycle d'une amélioration (10 minutes)

```bash
git checkout -b amelioration/nom-court   # 1. une branche par amélioration
npm run dev                               # 2. modifie et vérifie sur http://localhost:3000
npm run check                             # 3. lint + types + build (comme la CI)
git add . && git commit -m "Ajoute ..."   # 4. commit
git push -u origin amelioration/nom-court # 5. pousse, puis ouvre une Pull Request sur GitHub
```

Vercel crée automatiquement une **URL d'aperçu** pour la PR, et la CI lance les tests. Si tout est vert, fusionne dans `main` : la mise en production est automatique. En cas de problème, Vercel → Deployments → « Promote » sur la version précédente annule en un clic (*instant rollback*).

## Où modifier quoi

| Amélioration | Fichier |
| --- | --- |
| Texte du profil, compétences, parcours | `src/content/site.ts` |
| Résumé recruteur et postes visés | `recruiter` dans `src/content/site.ts` |
| Nouveau projet | `npm run new:project -- nom` puis `src/content/projects/nom.mdx` |
| Nouvel article | `npm run new:post -- nom` puis `src/content/blog/nom.mdx` |
| Nouvelle démo interactive | `src/demos/` + `registry.ts` + `DemoLoader.tsx` |
| Intégrer une app Streamlit / Hugging Face / Power BI | `demo: { type: "embed", ... }` dans le projet |
| Autoriser un nouveau domaine d'iframe | `EMBED_HOSTS` dans `src/config/security.ts` |
| Étapes du hero | `STAGES` dans `src/app/page.tsx` |
| Couleurs | `src/app/globals.css` et `src/lib/accent.ts` |
| En-têtes de sécurité | `next.config.ts` |

## Règles d'or

1. **Jamais de secret dans le code** : clés et jetons uniquement dans Vercel → Settings → Environment Variables.
2. **Pas de chiffre inventé** : un recruteur peut poser la question en entretien.
3. **Rien de confidentiel** venant d'un employeur (données, captures, noms de clients).
4. **Une amélioration = une PR** : plus facile à relire, à tester et à annuler.
5. Après chaque mise en ligne, vérifie `https://ton-site/api/health` et [securityheaders.com](https://securityheaders.com).
