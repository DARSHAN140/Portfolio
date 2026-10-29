/**
 * "Îlots" interactifs : composants client montés dans des pages statiques.
 * Le même registre sert à l'aperçu autonome (scripts/preview) — rien à faire pour toi.
 */
import ParticleHero from "./ParticleHero";
import Effects from "./Effects";
import CommandPalette from "./CommandPalette";
import Scramble from "./Scramble";
import Manifesto from "./Manifesto";
import LocalTime from "./LocalTime";
import ProjectIndex from "./ProjectIndex";
import RecruiterView from "./RecruiterView";
import ContactForm from "@/components/ContactForm";
import DemoLoader from "@/demos/DemoLoader";
import EmbedDemo from "@/demos/EmbedDemo";

export const ISLANDS = {
  ParticleHero,
  Effects,
  CommandPalette,
  Scramble,
  Manifesto,
  LocalTime,
  ProjectIndex,
  RecruiterView,
  ContactForm,
  DemoLoader,
  EmbedDemo,
};

export type IslandName = keyof typeof ISLANDS;
