import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Favicon "DA" généré au build
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0c0a09", color: "#2dd4bf", fontSize: 30, fontWeight: 700, borderRadius: 14 }}>
        DA
      </div>
    ),
    size,
  );
}
