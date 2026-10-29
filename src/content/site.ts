/**
 * ============================================================
 *  INFOS GÉNÉRALES DU PORTFOLIO (profil, compétences, parcours).
 *  Modifie ce fichier pour mettre à jour le site.
 *  Les éléments marqués "TODO" sont à compléter.
 * ============================================================
 */

export const site = {
  // URL publique : NEXT_PUBLIC_SITE_URL si défini, sinon l'URL de production fournie par Vercel
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
  name: "Darshan Axel Boutoukou Mouvoungou",
  shortName: "Darshan Axel",
  role: "Ingénieur Data · Big Data Analytics",
  location: "Fès, Maroc",
  coords: "34.03° N · 5.00° O",
  availability: "Disponible : poste ou stage pré-embauche",
  tagline:
    "Ce qui me plaît dans la data, c'est le moment où un chiffre devient une décision.",
  bio: [
    "Ingénieur fraîchement diplômé en Big Data Analytics (Université Euro-Méditerranéenne de Fès), je couvre tout le parcours de la donnée : collecte et nettoyage avec Python et SQL, modèles de Machine Learning, puis mise à disposition via Power BI, Streamlit ou des API FastAPI déployées avec Docker.",
    "Je cherche un poste ou un stage pré-embauche où mon travail servira à quelque chose de concret, et où je pourrai apprendre aux côtés de personnes plus expérimentées que moi.",
  ],
  cv: "/cv/Darshan-Axel-CV.pdf",
  photo: "/images/portrait.webp",
  /** Photo détourée (fond transparent) : sert à générer le portrait en particules */
  cutout: "/images/portrait-cutout.webp",
  cutoutSmall: "/images/portrait-cutout-sm.webp",
  /** Carte de profondeur (générée par IA) : donne du relief 3D à la photo */
  depth: "/images/portrait-depth.webp",
  links: {
    // TODO : colle tes vraies URL
    github: "https://github.com/TODO",
    linkedin: "https://www.linkedin.com/in/TODO",
  },
  languages: [
    { name: "Français", level: "Natif" },
    { name: "Anglais", level: "A2 (en progression)" },
    { name: "Espagnol", level: "A2 (en progression)" },
  ],
  interests: [
    "Lecture d'articles scientifiques",
    "Jeux de stratégie",
    "Football et badminton (amateur)",
    "Bénévolat à l'ASEF",
  ],
};

export const skills: { category: string; blurb: string; items: string[] }[] = [
  {
    category: "Data Science & ML",
    blurb: "Modèles supervisés et non supervisés, optimisation, évaluation et suivi des expériences.",
    items: ["Python", "Pandas", "NumPy", "Scikit-learn", "XGBoost", "MLflow", "SHAP"],
  },
  {
    category: "Business Intelligence",
    blurb: "Du modèle de données au tableau de bord : ETL, entrepôt de données et mesures DAX.",
    items: ["SQL", "Power BI (DAX)", "ETL", "Data Warehouse", "Data Modeling", "Excel avancé"],
  },
  {
    category: "Big Data & Cloud",
    blurb: "Traitement distribué, flux temps réel et bases orientées graphe.",
    items: ["Spark", "Hadoop", "Kafka", "GCP", "Neo4j"],
  },
  {
    category: "Déploiement & API",
    blurb: "Mettre les modèles entre les mains des équipes : API, applications, conteneurs.",
    items: ["FastAPI", "Streamlit", "Docker", "REST API", "Git"],
  },
  {
    category: "Web & Logiciel",
    blurb: "Les bases du développement pour livrer des outils complets.",
    items: ["Java", "PHP", "JavaScript", "React", "HTML/CSS"],
  },
];

export type Experience = {
  title: string;
  company: string;
  period: string;
  points: string[];
};

export const experiences: Experience[] = [
  {
    title: "SEO Data Analyst / Data Scientist",
    company: "Blaize Co",
    period: "Juil. 2026 – Oct. 2026",
    points: [
      "Optimisation SEO de boutiques e-commerce et recherche de mots-clés.",
      "Automatisation de l'indexation et suivi des KPI (CTR, clics, impressions).",
      "Création de tableaux de bord et automatisation des pipelines de données.",
    ],
  },
  {
    title: "Data Scientist – Prédiction du risque de crédit",
    company: "Bank of Africa",
    period: "Févr. 2026 – Juin 2026",
    points: [
      "Préparation des données et feature engineering.",
      "Développement et optimisation de modèles ML (XGBoost, GridSearchCV).",
      "Création d'une API FastAPI et d'un dashboard Streamlit.",
      "Déploiement Docker et explicabilité avec SHAP.",
    ],
  },
  {
    title: "Développeur web",
    company: "ASEF",
    period: "Juil. 2022 – Août 2022",
    points: [
      "Conception et développement du site vitrine de l'association (structure, interface, navigation).",
    ],
  },
];

export const education = [
  {
    degree: "Diplôme d'ingénieur en Big Data Analytics",
    school: "Université Euro-Méditerranéenne de Fès",
    period: "2023 – 2026",
  },
  {
    degree: "Licence en informatique",
    school: "École Sup'Management",
    period: "2020 – 2023",
  },
  {
    degree: "Baccalauréat – Mathématiques, sciences humaines",
    school: "Lycée Montalier, Gabon",
    period: "2019 – 2020",
  },
];

export const certifications = [
  { name: "Learn Big Data", year: "2025" },
  { name: "Data Science – Graph Neo4j", year: "2025" },
  { name: "SQL", year: "2024" },
];

// Les projets sont dans src/content/projects/*.mdx et les articles dans src/content/blog/*.mdx

/**
 * VUE RECRUTEUR : le résumé "30 secondes" (bouton dans le hero et en bas à droite).
 * Tout est tiré du CV : garde-le factuel, sans chiffres inventés.
 */
export const recruiter = {
  pitch: "Ingénieur data junior capable de mener un projet de bout en bout : de la donnée brute au modèle, jusqu'à l'outil déployé.",
  highlights: [
    "Diplôme d'ingénieur en Big Data Analytics (UEMF Fès, 2026)",
    "Scoring du risque de crédit chez Bank of Africa : XGBoost, SHAP, API FastAPI, Streamlit, Docker",
    "Data / SEO chez Blaize Co : pipelines automatisés et suivi des KPI",
  ],
  roles: [
    {
      id: "ds",
      label: "Data Scientist",
      brings: [
        "Modèles supervisés et non supervisés, optimisation (GridSearchCV) et évaluation",
        "Explicabilité des prédictions avec SHAP, pour des décisions justifiables",
        "Mise à disposition des modèles : API FastAPI, Streamlit, Docker",
      ],
      tools: ["Python", "Scikit-learn", "XGBoost", "SHAP", "MLflow", "FastAPI"],
      projects: ["risque-credit-bank-of-africa", "detection-fraude-big-data"],
    },
    {
      id: "da",
      label: "Data Analyst · BI",
      brings: [
        "SQL, modélisation en étoile et entrepôt de données",
        "Tableaux de bord Power BI interactifs avec mesures DAX",
        "Suivi de KPI automatisé (CTR, clics, impressions)",
      ],
      tools: ["SQL", "Power BI", "DAX", "Excel avancé", "ETL", "Python"],
      projects: ["dashboard-ventes-power-bi", "seo-data-blaize-co"],
    },
    {
      id: "de",
      label: "Data Engineer junior",
      brings: [
        "Pipelines de données automatisés",
        "Traitement distribué et flux : Spark, Hadoop, Kafka",
        "Conteneurisation et API : Docker, REST, GCP",
      ],
      tools: ["Spark", "Kafka", "Hadoop", "GCP", "Docker", "SQL"],
      projects: ["seo-data-blaize-co", "detection-fraude-big-data"],
    },
  ],
};
