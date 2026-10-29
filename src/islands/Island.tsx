/**
 * Monte un composant interactif et note son nom + ses props dans le HTML.
 * En production, React l'hydrate normalement ; l'attribut sert à l'aperçu autonome.
 * `display: contents` : le conteneur n'a aucun effet sur la mise en page.
 */
import { ISLANDS, type IslandName } from "./registry";

// Îlots utilisés dans du texte (<p>, <a>…) : conteneur <span> pour un HTML valide
const INLINE = new Set<IslandName>(["Scramble", "LocalTime"]);

type PropsOf<N extends IslandName> = React.ComponentProps<(typeof ISLANDS)[N]>;

export default function Island<N extends IslandName>({ name, props }: { name: N; props: PropsOf<N> }) {
  // Le typage générique garantit les bonnes props à l'appel ; ici on rend simplement le composant
  const Component = ISLANDS[name] as unknown as React.ComponentType<Record<string, unknown>>;
  const Tag = INLINE.has(name) ? "span" : "div";
  return (
    <Tag data-island={name} data-props={JSON.stringify(props)} style={{ display: "contents" }}>
      <Component {...(props as Record<string, unknown>)} />
    </Tag>
  );
}
