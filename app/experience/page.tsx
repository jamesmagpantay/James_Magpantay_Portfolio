import type { Metadata } from "next";
import { Briefcase, Users, BookOpen } from "lucide-react";
import { PageHeader, Pill } from "@/components/ui/Panel";
import { roles, type Role } from "@/lib/content";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Software developer intern at DOST, Vice CTO at Cisco NetConnect PUP, and Cybersecurity Compliance Analyst at Google Developer Groups PUP.",
};

const KIND_META: Record<
  Role["kind"],
  { label: string; icon: React.ElementType; tone: "accent" | "ok" | "neutral" }
> = {
  work: { label: "Professional", icon: Briefcase, tone: "ok" },
  org: { label: "Organization", icon: Users, tone: "accent" },
  program: { label: "Program", icon: BookOpen, tone: "neutral" },
};

export default function ExperiencePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-10 pb-24 sm:px-6 lg:px-10">
      <PageHeader
        eyebrow="ids-experience — gi0/5"
        title="Work, internships, and org positions"
        lede="One timeline, newest first. Paid roles, student organization positions, and programs are marked rather than separated — they informed each other."
      />

      <ol className="relative mt-12 space-y-8 border-l border-line pl-6 sm:pl-8">
        {roles.map((r) => {
          const meta = KIND_META[r.kind];
          const Icon = meta.icon;

          return (
            <li key={`${r.org}-${r.title}`} className="relative">
              {/* timeline marker */}
              <span className="absolute top-1.5 -left-[calc(1.5rem+1px)] grid size-[11px] place-items-center rounded-full border border-accent-deep bg-bg sm:-left-[calc(2rem+1px)]">
                <span className="size-[3px] rounded-full bg-accent" />
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <Pill tone={meta.tone}>
                  <span className="inline-flex items-center gap-1">
                    <Icon size={9} />
                    {meta.label}
                  </span>
                </Pill>
                <span className="font-mono text-[0.62rem] tracking-[0.1em] text-dim uppercase">
                  {r.start} — {r.end}
                </span>
              </div>

              <h2 className="mt-3 font-cond text-2xl leading-tight font-semibold text-balance">
                {r.title}
              </h2>
              <p className="mt-1 text-[1.02rem] text-accent-soft">{r.org}</p>
              <p className="mt-0.5 font-mono text-[0.6rem] tracking-[0.1em] text-dim uppercase">
                {r.location}
              </p>

              <ul className="mt-4 space-y-2.5">
                {r.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex gap-2.5 text-[0.94rem] leading-relaxed text-muted"
                  >
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-accent-deep" />
                    {h}
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {r.tags.map((t) => (
                  <Pill key={t}>{t}</Pill>
                ))}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
