import type { Metadata } from "next";
import { ExternalLink, ShieldCheck, Cpu, Boxes } from "lucide-react";
import { GithubIcon } from "@/components/ui/BrandIcons";
import { PageHeader, Panel, Pill } from "@/components/ui/Panel";
import { projects, type Project } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Security engineering, systems, and AI projects — a custom SIEM with tamper-evident logging, a two-phase network vulnerability scanner, and hackathon builds.",
};

const GROUPS: {
  key: Project["category"];
  title: string;
  blurb: string;
  icon: React.ElementType;
}[] = [
  {
    key: "security",
    title: "Security engineering",
    blurb:
      "Built to detect, resist, or measure something. These are the ones I would want to be asked about.",
    icon: ShieldCheck,
  },
  {
    key: "systems",
    title: "Systems & platform",
    blurb: "Software where the security work happened at the design stage.",
    icon: Boxes,
  },
  {
    key: "ai",
    title: "AI & applied ML",
    blurb:
      "Hackathon and workshop builds — mostly under time pressure, mostly with a security angle attached.",
    icon: Cpu,
  },
];

function ProjectCard({ p }: { p: Project }) {
  return (
    <Panel accent={p.category === "security" ? "accent" : "none"}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-cond text-xl leading-tight font-semibold text-balance">
            {p.name}
          </h3>
          <p className="mt-1.5 font-mono text-[0.6rem] tracking-[0.1em] text-dim uppercase">
            {p.role}
            {p.org && <> &middot; {p.org}</>} &middot; {p.date}
          </p>
        </div>

        {p.metric && (
          <div className="shrink-0 text-right">
            <div className="font-cond text-2xl leading-none font-bold text-accent tabular-nums">
              {p.metric.value}
            </div>
            <div className="mt-1 font-mono text-[0.53rem] tracking-[0.08em] text-dim uppercase">
              {p.metric.label}
            </div>
          </div>
        )}
      </div>

      <p className="mt-4 leading-relaxed text-text">{p.summary}</p>

      <div className="mt-4 border-l-2 border-line pl-3.5">
        <p className="font-mono text-[0.58rem] tracking-[0.13em] text-dim uppercase">
          The problem
        </p>
        <p className="mt-1.5 text-[0.9rem] leading-relaxed text-muted">
          {p.problem}
        </p>
      </div>

      <ul className="mt-4 space-y-2">
        {p.highlights.map((h) => (
          <li
            key={h}
            className="flex gap-2.5 text-[0.9rem] leading-relaxed text-muted"
          >
            <span className="mt-2 size-1 shrink-0 rounded-full bg-accent-deep" />
            {h}
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-wrap items-center gap-1.5">
        {p.stack.map((t) => (
          <Pill key={t}>{t}</Pill>
        ))}
      </div>

      {(p.repo || p.demo) && (
        <div className="mt-5 flex flex-wrap gap-2 border-t border-line-soft pt-4">
          {p.repo && (
            <a
              href={p.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-[0.66rem] tracking-[0.1em] text-accent uppercase hover:underline"
            >
              <GithubIcon size={12} /> Source
            </a>
          )}
          {p.demo && (
            <a
              href={p.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-[0.66rem] tracking-[0.1em] text-accent uppercase hover:underline"
            >
              <ExternalLink size={12} /> Demo
            </a>
          )}
        </div>
      )}
    </Panel>
  );
}

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 pb-24 sm:px-6 lg:px-10">
      <PageHeader
        eyebrow="srv-projects — gi0/2"
        title="Things I built, and what they defend against"
        lede="Grouped by what the work actually was. The security projects come first because they are the ones that represent where I am heading."
        meta={
          <div className="flex flex-wrap gap-1.5">
            <Pill tone="accent">{projects.length} projects</Pill>
            <Pill>
              {projects.filter((p) => p.category === "security").length} security
            </Pill>
          </div>
        }
      />

      {GROUPS.map((g) => {
        const items = projects.filter((p) => p.category === g.key);
        if (items.length === 0) return null;
        const Icon = g.icon;

        return (
          <section key={g.key} className="border-b border-line py-12 last:border-b-0">
            <h2 className="flex items-center gap-2.5 font-cond text-2xl font-bold tracking-[-0.012em]">
              <Icon size={19} className="text-accent-deep" />
              {g.title}
            </h2>
            <p className="mt-2 max-w-[60ch] text-muted">{g.blurb}</p>

            <div className="mt-7 space-y-4">
              {items.map((p) => (
                <ProjectCard key={p.slug} p={p} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
