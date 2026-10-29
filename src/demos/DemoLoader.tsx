"use client";

/** Charge le code d'une démo uniquement sur la page qui l'affiche (code splitting) */
import { lazy, Suspense } from "react";
import type { BuiltinDemoId } from "./registry";

const DEMOS: Record<BuiltinDemoId, React.LazyExoticComponent<React.ComponentType>> = {
  "credit-scoring": lazy(() => import("./CreditScoring")),
  "fraud-threshold": lazy(() => import("./FraudThreshold")),
  "sales-dashboard": lazy(() => import("./SalesDashboard")),
};

export default function DemoLoader({ id }: { id: BuiltinDemoId }) {
  const Demo = DEMOS[id];
  return (
    <div data-demo={id}>
      <Suspense
        fallback={
          <div className="h-80 animate-pulse rounded-2xl border border-border bg-surface" aria-label="Chargement de la démo" />
        }
      >
        <Demo />
      </Suspense>
    </div>
  );
}
