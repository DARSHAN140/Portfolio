/**
 * Démos interactives intégrées au portfolio (exécutées dans le navigateur, aucune donnée envoyée).
 * Pour ajouter une démo :
 *   1. crée le composant dans src/demos/<MaDemo>.tsx (export default)
 *   2. ajoute une entrée ci-dessous ET dans src/demos/DemoLoader.tsx
 *   3. référence-la dans un projet : demo: { type: "builtin", id: "<id>" }
 */
export const BUILTIN_DEMOS = {
  "credit-scoring": {
    title: "Simulateur de score crédit",
    description: "Modifie le profil d'un client et vois le risque et son explication évoluer en direct.",
  },
  "fraud-threshold": {
    title: "Seuil de détection de fraude",
    description: "Ajuste le seuil d'alerte et observe le compromis précision / rappel.",
  },
  "sales-dashboard": {
    title: "Dashboard des ventes",
    description: "Filtre par région et catégorie, comme dans Power BI.",
  },
} as const;

export type BuiltinDemoId = keyof typeof BUILTIN_DEMOS;
export const BUILTIN_DEMO_IDS = Object.keys(BUILTIN_DEMOS) as [BuiltinDemoId, ...BuiltinDemoId[]];
