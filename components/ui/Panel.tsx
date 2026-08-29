import { cn } from "@/lib/utils";

/** A console panel: bordered surface with an optional mono header strip. */
export function Panel({
  title,
  meta,
  accent,
  className,
  bodyClassName,
  children,
}: {
  title?: string;
  meta?: React.ReactNode;
  /** left border accent color token */
  accent?: "accent" | "ok" | "warn" | "crit" | "none";
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  const accentClass = {
    accent: "border-l-2 border-l-accent-deep",
    ok: "border-l-2 border-l-ok",
    warn: "border-l-2 border-l-warn",
    crit: "border-l-2 border-l-crit",
    none: "",
  }[accent ?? "none"];

  return (
    <section
      className={cn(
        "overflow-hidden rounded-panel border border-line bg-panel",
        accentClass,
        className
      )}
    >
      {title && (
        <header className="flex items-center gap-3 border-b border-line bg-panel-2 px-4 py-2.5">
          <h2 className="font-mono text-[0.63rem] tracking-[0.14em] text-dim uppercase">
            {title}
          </h2>
          {meta && <div className="ml-auto">{meta}</div>}
        </header>
      )}
      <div className={cn("p-4 sm:p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

/** Page-level heading block used at the top of every section page. */
export function PageHeader({
  eyebrow,
  title,
  lede,
  meta,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  meta?: React.ReactNode;
}) {
  return (
    <header className="border-b border-line pb-8">
      <p className="font-mono text-[0.68rem] tracking-[0.18em] text-accent uppercase">
        {eyebrow}
      </p>
      <h1 className="mt-4 font-cond text-4xl leading-[1.03] font-bold tracking-[-0.018em] text-balance sm:text-5xl">
        {title}
      </h1>
      {lede && (
        <p className="mt-4 max-w-[62ch] text-[1.02rem] leading-relaxed text-muted">
          {lede}
        </p>
      )}
      {meta && <div className="mt-6">{meta}</div>}
    </header>
  );
}

/** Small uppercase status chip. */
export function Pill({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "accent" | "ok" | "warn" | "crit";
  children: React.ReactNode;
}) {
  const tones = {
    neutral: "text-dim border-line bg-panel-2",
    accent: "text-accent border-accent/35 bg-accent/8",
    ok: "text-ok border-ok/35 bg-ok/8",
    warn: "text-warn border-warn/35 bg-warn/8",
    crit: "text-crit border-crit/35 bg-crit/8",
  }[tone];

  return (
    <span
      className={cn(
        "inline-block rounded-[3px] border px-1.5 py-0.5 font-mono text-[0.6rem] tracking-[0.1em] whitespace-nowrap uppercase",
        tones
      )}
    >
      {children}
    </span>
  );
}

/** A labelled metric readout. */
export function Stat({
  value,
  label,
  tone = "accent",
}: {
  value: string;
  label: string;
  tone?: "accent" | "ok" | "text";
}) {
  const toneClass = {
    accent: "text-accent",
    ok: "text-ok",
    text: "text-text",
  }[tone];

  return (
    <div>
      <div
        className={cn(
          "font-cond text-2xl leading-none font-bold tabular-nums",
          toneClass
        )}
      >
        {value}
      </div>
      <div className="mt-1.5 font-mono text-[0.6rem] tracking-[0.12em] text-dim uppercase">
        {label}
      </div>
    </div>
  );
}
