"use client";

/** Heure locale de Fès, mise à jour chaque minute */
import { useSyncExternalStore } from "react";

const fmt = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Casablanca" });
const subscribe = (cb: () => void) => {
  const id = setInterval(cb, 15_000);
  return () => clearInterval(id);
};

export default function LocalTime({ prefix = "" }: { prefix?: string }) {
  const time = useSyncExternalStore(subscribe, () => fmt.format(new Date()), () => "--:--");
  return (
    <span suppressHydrationWarning>
      {prefix}
      {time}
    </span>
  );
}
