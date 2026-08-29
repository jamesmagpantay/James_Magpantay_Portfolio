import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, Download, MapPin } from "lucide-react";

import { Panel, Pill, Stat } from "@/components/ui/Panel";
import { SectionGrid } from "@/components/topology/SectionGrid";
import { LogFeed } from "@/components/topology/LogFeed";
import {
  profile,
  projects,
  roles,
  events,
  certStats,
  eventStats,
  skills,
} from "@/lib/content";

/** React Flow is browser-only and heavy — keep it out of the server bundle. */
const Topology = dynamic(
  () => import("@/components/topology/Topology").then((m) => m.Topology),
  {
    loading: () => (
      <div className="grid h-[460px] w-full place-items-center sm:h-[520px]">
        <p className="font-mono text-[0.66rem] tracking-[0.14em] text-dim uppercase">
          discovering topology<span className="animate-blink">_</span>
        </p>
      </div>
    ),
  }
);

export default function HomePage() {
  const featured = projects.filter((p) => p.category === "security").slice(0, 2);
  const latestRole = roles[0];

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-10">
      {/* ── hero ─────────────────────────────────────────────── */}
      <section className="grid gap-8 border-b border-line py-12 sm:py-16 lg:grid-cols-[1fr_auto] lg:items-start lg:gap-12">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone="ok">{profile.availability}</Pill>
            <span className="inline-flex items-center gap-1 font-mono text-[0.6rem] tracking-[0.12em] text-dim uppercase">
              <MapPin size={11} />
              {profile.location}
            </span>
          </div>

          <h1 className="mt-5 font-cond text-[2.6rem] leading-[1.02] font-bold tracking-[-0.02em] text-balance sm:text-6xl">
            {profile.name}
          </h1>

          <p className="mt-3 font-mono text-[0.78rem] tracking-[0.14em] text-accent uppercase">
            {profile.title}
          </p>

          <p className="mt-6 max-w-[62ch] text-[1.02rem] leading-relaxed text-muted">
            {profile.intro}
          </p>

          <div className="mt-8 flex flex-wrap gap-2.5">
            <Link
              href="/projects"
              className="group inline-flex items-center gap-2 rounded-[3px] border border-accent bg-accent/10 px-4 py-2.5 font-mono text-[0.7rem] tracking-[0.12em] text-accent uppercase transition-colors hover:bg-accent/18"
            >
              View projects
              <ArrowRight
                size={13}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <a
              href={profile.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-[3px] border border-line bg-panel px-4 py-2.5 font-mono text-[0.7rem] tracking-[0.12em] text-muted uppercase transition-colors hover:border-accent-deep hover:text-text"
            >
              <Download size={13} />
              Curriculum vitae
            </a>
          </div>
        </div>

        <div className="relative order-first h-56 w-full overflow-hidden rounded-panel border border-line lg:order-none lg:h-64 lg:w-56">
          <Image
            src={profile.photo}
            alt={`Portrait of ${profile.name}`}
            fill
            sizes="(max-width: 1024px) 100vw, 224px"
            className="object-cover object-top"
            priority
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/75 via-transparent to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-1.5 px-3 py-2 font-mono text-[0.55rem] tracking-[0.12em] text-accent uppercase">
            <span className="size-1 rounded-full bg-ok" />
            host-personal
          </div>
        </div>
      </section>

      {/* ── stat strip ───────────────────────────────────────── */}
      <section className="grid grid-cols-2 gap-px border-b border-line bg-line sm:grid-cols-4">
        {[
          { value: String(projects.length), label: "Projects shipped" },
          { value: String(certStats.total), label: "Certifications" },
          { value: String(eventStats.total), label: "Events & hackathons" },
          { value: "200+", label: "Cadets supported" },
        ].map((s) => (
          <div key={s.label} className="bg-bg px-4 py-5">
            <Stat value={s.value} label={s.label} />
          </div>
        ))}
      </section>

      {/* ── topology ─────────────────────────────────────────── */}
      <section className="py-12 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[0.68rem] tracking-[0.18em] text-accent uppercase">
              Network map
            </p>
            <h2 className="mt-3 font-cond text-3xl leading-tight font-bold tracking-[-0.015em] sm:text-4xl">
              Navigate the topology
            </h2>
            <p className="mt-3 max-w-[58ch] text-muted">
              Every section of this portfolio is a device on the map. Click a
              node to open it — or use the rail on the left if you would rather
              go straight there.
            </p>
          </div>
          <Pill tone="accent">8 nodes online</Pill>
        </div>

        {/* interactive map — larger screens */}
        <div className="mt-7 hidden overflow-hidden rounded-panel border border-line bg-panel-2 md:block">
          <Topology />
        </div>

        {/* always-available grid — the fast path, and the mobile fallback */}
        <div className="mt-7 md:hidden">
          <SectionGrid />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_340px]">
          <div className="hidden md:block">
            <SectionGrid />
          </div>
          <LogFeed />
        </div>
      </section>

      {/* ── featured work ────────────────────────────────────── */}
      <section className="border-t border-line py-12 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[0.68rem] tracking-[0.18em] text-accent uppercase">
              Selected work
            </p>
            <h2 className="mt-3 font-cond text-3xl leading-tight font-bold tracking-[-0.015em] sm:text-4xl">
              Security engineering
            </h2>
          </div>
          <Link
            href="/projects"
            className="group inline-flex items-center gap-1.5 font-mono text-[0.68rem] tracking-[0.12em] text-accent uppercase"
          >
            All projects
            <ArrowRight
              size={12}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {featured.map((p) => (
            <Panel key={p.slug} accent="accent" className="flex flex-col">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-cond text-xl leading-tight font-semibold text-balance">
                    {p.name}
                  </h3>
                  <p className="mt-1 font-mono text-[0.6rem] tracking-[0.1em] text-dim uppercase">
                    {p.role} &middot; {p.date}
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

              <p className="mt-4 text-[0.92rem] leading-relaxed text-muted">
                {p.summary}
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.stack.slice(0, 4).map((t) => (
                  <Pill key={t}>{t}</Pill>
                ))}
              </div>
            </Panel>
          ))}
        </div>
      </section>

      {/* ── current + skills ─────────────────────────────────── */}
      <section className="grid gap-4 border-t border-line py-12 lg:grid-cols-2 sm:py-16">
        <Panel title="Most recent role" accent="ok">
          <h3 className="font-cond text-xl leading-tight font-semibold">
            {latestRole.title}
          </h3>
          <p className="mt-1 font-mono text-[0.62rem] tracking-[0.1em] text-accent uppercase">
            {latestRole.org}
          </p>
          <p className="mt-0.5 font-mono text-[0.6rem] tracking-[0.1em] text-dim uppercase">
            {latestRole.start} — {latestRole.end}
          </p>
          <ul className="mt-4 space-y-2">
            {latestRole.highlights.map((h) => (
              <li
                key={h}
                className="flex gap-2.5 text-[0.9rem] leading-relaxed text-muted"
              >
                <span className="mt-2 size-1 shrink-0 rounded-full bg-accent-deep" />
                {h}
              </li>
            ))}
          </ul>
          <Link
            href="/experience"
            className="group mt-5 inline-flex items-center gap-1.5 font-mono text-[0.66rem] tracking-[0.12em] text-accent uppercase"
          >
            Full timeline
            <ArrowRight
              size={12}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </Panel>

        <Panel title="Capability matrix">
          <dl className="space-y-4">
            {skills.slice(0, 4).map((g) => (
              <div key={g.group}>
                <dt className="font-mono text-[0.6rem] tracking-[0.12em] text-dim uppercase">
                  {g.group}
                </dt>
                <dd className="mt-2 flex flex-wrap gap-1.5">
                  {g.items.slice(0, 6).map((i) => (
                    <Pill key={i}>{i}</Pill>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
          <Link
            href="/about"
            className="group mt-5 inline-flex items-center gap-1.5 font-mono text-[0.66rem] tracking-[0.12em] text-accent uppercase"
          >
            Full profile
            <ArrowRight
              size={12}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </Panel>
      </section>

      {/* ── latest event ─────────────────────────────────────── */}
      <section className="border-t border-line py-12 sm:py-16">
        <p className="font-mono text-[0.68rem] tracking-[0.18em] text-accent uppercase">
          Most recent
        </p>
        <h2 className="mt-3 font-cond text-3xl leading-tight font-bold tracking-[-0.015em] sm:text-4xl">
          {events[0].name}
        </h2>
        <p className="mt-4 max-w-[62ch] leading-relaxed text-muted">
          {events[0].takeaway}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Pill tone="accent">{events[0].role}</Pill>
          <Pill>{events[0].date}</Pill>
          {events[0].result && <Pill tone="ok">{events[0].result}</Pill>}
        </div>
        <Link
          href="/events"
          className="group mt-6 inline-flex items-center gap-1.5 font-mono text-[0.68rem] tracking-[0.12em] text-accent uppercase"
        >
          All events
          <ArrowRight
            size={12}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </section>
    </div>
  );
}
