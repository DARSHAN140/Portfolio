import Island from "@/islands/Island";

/** En-tête commun des pages intérieures */
export default function PageHeader({
  kicker,
  title,
  accent,
  intro,
}: {
  kicker: string;
  title: string;
  accent?: string;
  intro?: React.ReactNode;
}) {
  return (
    <header className="mx-auto max-w-6xl px-5 pb-16 pt-36 sm:px-8 sm:pt-44">
      <p className="mb-8 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
        <span className="h-px w-10 bg-accent" />
        <Island name="Scramble" props={{ text: kicker }} />
      </p>
      <h1 className="text-[clamp(3rem,9vw,7.5rem)] font-medium leading-[0.88] tracking-[-0.05em]">
        {title}
        {accent && (
          <>
            {" "}
            <span className="font-serif font-normal italic text-accent">{accent}</span>
          </>
        )}
      </h1>
      {intro && <div className="mt-8 max-w-2xl text-lg text-muted">{intro}</div>}
    </header>
  );
}
