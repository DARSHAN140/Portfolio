import { z } from "zod";

// Supprime les caractères de contrôle (dont \r \n) : empêche l'injection d'en-têtes e-mail
const singleLine = (max: number) =>
  z
    .string({ error: "Champ requis" })
    .trim()
    .max(max, `${max} caractères maximum`)
    .transform((s) => s.replace(/[\u0000-\u001F\u007F]/g, " "));

export const contactSchema = z.object({
  name: singleLine(100).pipe(z.string().min(2, "Indiquez votre nom")),
  email: z.string({ error: "Champ requis" }).trim().toLowerCase().pipe(z.email("Adresse e-mail invalide").max(200)),
  company: singleLine(120).optional().default(""),
  message: z
    .string({ error: "Champ requis" })
    .trim()
    .min(20, "Message trop court (20 caractères minimum)")
    .max(5000, "Message trop long (5000 caractères maximum)"),
  // Pot de miel : champ invisible pour un humain, rempli par les robots
  website: z.string().max(0).optional().default(""),
  // Horodatage d'affichage du formulaire (anti-robot : envoi trop rapide = suspect)
  startedAt: z.number({ error: "Requête invalide" }).int().positive(),
});

export type ContactInput = z.input<typeof contactSchema>;
