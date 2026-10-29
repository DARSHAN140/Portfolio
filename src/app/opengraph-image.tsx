import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = `${site.name} – ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Image d'aperçu générée au build (partage LinkedIn, WhatsApp, Slack…)
export default function OpengraphImage() {
  const photo = fs.readFileSync(path.join(process.cwd(), "src/assets/portrait-og.jpg"));
  const src = `data:image/jpeg;base64,${photo.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "flex-end", background: "#050505", color: "#ededed", padding: "0 0 0 80px", gap: 40 }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, paddingBottom: 80 }}>
          <div style={{ fontSize: 22, color: "#2dd4bf", marginBottom: 24, letterSpacing: 6, textTransform: "uppercase" }}>{site.role}</div>
          <div style={{ fontSize: 96, fontWeight: 600, lineHeight: 0.9, letterSpacing: -4 }}>{site.shortName}</div>
          <div style={{ fontSize: 28, color: "#8a8a8a", marginTop: 32, maxWidth: 560 }}>{site.tagline}</div>
          <div style={{ fontSize: 22, color: "#2dd4bf", marginTop: 36 }}>Projets · Démos live · Blog</div>
        </div>
        <img src={src} width={466} height={560} alt="" style={{ objectFit: "cover" }} />
      </div>
    ),
    size,
  );
}
