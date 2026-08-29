import type { Metadata } from "next";
import Image from "next/image";
import { GraduationCap, Award as AwardIcon } from "lucide-react";
import { PageHeader, Panel, Pill } from "@/components/ui/Panel";
import { profile, objective, education, skills, awards } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description:
    "James Randall A. Magpantay — IT student at the Polytechnic University of the Philippines focused on network security, secure development, and AI red teaming.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 pb-24 sm:px-6 lg:px-10">
      <PageHeader
        eyebrow="srv-about — gi0/1"
        title="Who I am and how I got here"
        lede={profile.tagline}
      />

      {/* intro + portrait */}
      <section className="grid gap-8 py-12 lg:grid-cols-[1fr_240px] lg:items-start">
        <div className="space-y-5">
          <p className="text-[1.05rem] leading-relaxed text-text">
            {profile.intro}
          </p>
          <p className="leading-relaxed text-muted">{objective}</p>
          <p className="leading-relaxed text-muted">
            Most of what I know came from doing rather than reading about it —
            configuring VLANs and ACLs until segmentation stopped being an
            abstraction, auditing an authentication service until I found the
            flaw that let forged tokens through, and sitting in CTFs long enough
            to learn that a safety filter fails in the same place input
            validation always has.
          </p>
        </div>

        <div className="relative aspect-4/5 w-full overflow-hidden rounded-panel border border-line lg:sticky lg:top-16">
          <Image
            src={profile.photo}
            alt={`Portrait of ${profile.name}`}
            fill
            sizes="(max-width: 1024px) 100vw, 240px"
            className="object-cover object-top"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/70 to-transparent" />
        </div>
      </section>

      {/* education */}
      <section className="border-t border-line py-12">
        <h2 className="flex items-center gap-2.5 font-cond text-2xl font-bold tracking-[-0.012em]">
          <GraduationCap size={19} className="text-accent-deep" />
          Education
        </h2>

        <div className="mt-7 space-y-4">
          {education.map((e) => (
            <Panel
              key={e.school}
              accent={e.status === "current" ? "accent" : "none"}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-cond text-xl leading-tight font-semibold text-balance">
                    {e.school}
                  </h3>
                  <p className="mt-1 text-[0.95rem] text-accent-soft">
                    {e.credential}
                  </p>
                  <p className="mt-1 font-mono text-[0.6rem] tracking-[0.1em] text-dim uppercase">
                    {e.location}
                  </p>
                </div>
                <Pill tone={e.status === "current" ? "accent" : "neutral"}>
                  {e.period}
                </Pill>
              </div>

              <ul className="mt-4 space-y-2">
                {e.notes.map((n) => (
                  <li
                    key={n}
                    className="flex gap-2.5 text-[0.92rem] leading-relaxed text-muted"
                  >
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-accent-deep" />
                    {n}
                  </li>
                ))}
              </ul>
            </Panel>
          ))}
        </div>
      </section>

      {/* skills */}
      <section className="border-t border-line py-12">
        <h2 className="font-cond text-2xl font-bold tracking-[-0.012em]">
          Capability matrix
        </h2>
        <p className="mt-2 max-w-[60ch] text-muted">
          Grouped the way I actually use them, not the way they look on a
          keyword scan.
        </p>

        <dl className="mt-7 grid gap-px overflow-hidden rounded-panel border border-line bg-line sm:grid-cols-2">
          {skills.map((g) => (
            <div key={g.group} className="bg-panel p-4">
              <dt className="font-mono text-[0.6rem] tracking-[0.13em] text-dim uppercase">
                {g.group}
              </dt>
              <dd className="mt-2.5 flex flex-wrap gap-1.5">
                {g.items.map((i) => (
                  <Pill key={i}>{i}</Pill>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* awards */}
      <section className="border-t border-line py-12">
        <h2 className="flex items-center gap-2.5 font-cond text-2xl font-bold tracking-[-0.012em]">
          <AwardIcon size={19} className="text-accent-deep" />
          Honors & awards
        </h2>

        <ul className="mt-7 grid gap-px overflow-hidden rounded-panel border border-line bg-line sm:grid-cols-2">
          {awards.map((a) => (
            <li key={a.name} className="flex gap-3 bg-panel p-4">
              <span className="mt-1 font-mono text-[0.62rem] text-accent-deep tabular-nums">
                {a.year}
              </span>
              <span className="min-w-0">
                <span className="block font-cond text-[1.02rem] leading-tight font-semibold">
                  {a.name}
                </span>
                {a.detail && (
                  <span className="mt-0.5 block text-[0.85rem] text-muted">
                    {a.detail}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
