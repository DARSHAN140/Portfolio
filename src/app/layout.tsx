import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
// Polices auto-hébergées (aucune requête vers Google Fonts : vie privée + CSP stricte)
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { site, recruiter, education } from "@/content/site";
import { getProjects } from "@/lib/content";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Island from "@/islands/Island";
import { getPaletteItems } from "@/lib/palette";
// Mesure d'audience et de performance Vercel : sans cookie, servies depuis notre domaine
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const serif = localFont({
  src: [
    { path: "../../node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2", style: "normal" },
    { path: "../../node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2", style: "italic" },
  ],
  weight: "400",
  variable: "--font-serif",
  display: "swap",
  preload: false, // police d'accent : chargée sans bloquer l'affichage
});

// Police monospace (étiquettes) : non préchargée pour laisser la bande passante au texte principal
const mono = localFont({
  src: "../../node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2",
  weight: "100 900",
  variable: "--font-geist-mono",
  display: "swap",
  preload: false,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} – ${site.role}`,
    template: `%s · ${site.shortName}`,
  },
  description: `${site.role}. ${site.tagline} Python, SQL, Machine Learning, Power BI, FastAPI, Docker.`,
  authors: [{ name: site.name, url: site.url }],
  keywords: ["Data Scientist junior", "Data Analyst", "Big Data", "Machine Learning", "Power BI", "Python", "Maroc", site.name],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: site.url,
    siteName: site.name,
    title: `${site.name} – ${site.role}`,
    description: site.tagline,
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
};

// Données structurées : aident Google à comprendre qui tu es
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: site.role,
  url: site.url,
  address: { "@type": "PostalAddress", addressLocality: "Fès", addressCountry: "MA" },
  alumniOf: "Université Euro-Méditerranéenne de Fès",
  sameAs: [site.links.github, site.links.linkedin].filter((l) => !l.includes("TODO")),
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [paletteItems, projects] = await Promise.all([getPaletteItems(), getProjects()]);
  const titleOf = (slug: string) => projects.find((p) => p.slug === slug)?.title ?? slug;
  const recruiterProps = {
    name: site.name,
    role: site.role,
    location: site.location,
    availability: site.availability,
    pitch: recruiter.pitch,
    highlights: recruiter.highlights,
    roles: recruiter.roles.map((r) => ({
      ...r,
      projects: r.projects.filter((s) => projects.some((p) => p.slug === s)).map((slug) => ({ slug, title: titleOf(slug) })),
    })),
    languages: site.languages,
    education: `${education[0].degree.replace("Diplôme d'ingénieur en ", "Ingénieur ")} · ${education[0].period.split(/\s*–\s*/).pop()}`,
    cv: site.cv,
    ...(site.links.linkedin.includes("TODO") ? {} : { linkedin: site.links.linkedin }),
  };
  return (
    <html lang="fr" className={`${GeistSans.variable} ${mono.variable} ${serif.variable} antialiased`}>
      <body className="flex min-h-screen flex-col font-sans">
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded focus:bg-surface focus:px-3 focus:py-2"
        >
          Aller au contenu
        </a>
        <div className="columns" aria-hidden />
        <Header />
        <main id="contenu" className="relative z-10 flex-1">
          {children}
        </main>
        <Footer />
        <div className="grain" aria-hidden />
        <Island name="Effects" props={{}} />
        <Island name="CommandPalette" props={{ items: paletteItems }} />
        <Island name="RecruiterView" props={recruiterProps} />
        {/* Activés seulement sur Vercel (évite des erreurs 404 en local) */}
        {process.env.VERCEL === "1" && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
        <script
          type="application/ld+json"
          // JSON.stringify + échappement de "<" : empêche toute injection de balise </script>
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
