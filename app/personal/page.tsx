import type { Metadata } from "next";
import * as Icons from "lucide-react";
import { PageHeader, Panel, Pill } from "@/components/ui/Panel";
import {
  hobbies,
  personalIntro,
  currently,
  personalIsReady,
  profile,
} from "@/lib/content";

export const metadata: Metadata = {
  title: "Personal",
  description: `Life outside the terminal — who ${profile.shortName} is when he is not working on security.`,
};

function HobbyIcon({ name }: { name: string }) {
  const Icon =
    (Icons as unknown as Record<string, React.ElementType>)[name] ??
    Icons.Circle;
  return <Icon size={17} className="text-accent-deep" />;
}

export default function PersonalPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-10 pb-24 sm:px-6 lg:px-10">
      <PageHeader
        eyebrow="host-personal — gi0/7"
        title="Life outside the terminal"
        lede="Everyone applying for the same roles has projects and certifications. This is the part that makes me a person rather than a keyword match."
      />

      {!personalIsReady && (
        <div className="mt-10 rounded-panel border border-warn/40 border-l-2 border-l-warn bg-warn/6 p-5">
          <p className="font-mono text-[0.62rem] tracking-[0.14em] text-warn uppercase">
            Section awaiting content
          </p>
          <h2 className="mt-3 font-cond text-xl font-semibold">
            This page is scaffolded, not written
          </h2>
          <p className="mt-2.5 max-w-[62ch] leading-relaxed text-muted">
            Nothing below is real — it is a structure waiting for James to fill
            in. Rather than inventing hobbies and presenting them as fact, the
            page shows its own unfinished state.
          </p>
          <p className="mt-3 max-w-[62ch] text-[0.9rem] leading-relaxed text-dim">
            To finish it: edit{" "}
            <code className="rounded-[3px] border border-line bg-panel px-1 py-0.5 font-mono text-[0.85em] text-accent-soft">
              lib/content/personal.ts
            </code>
            , replace the placeholder entries with real ones, and set{" "}
            <code className="rounded-[3px] border border-line bg-panel px-1 py-0.5 font-mono text-[0.85em] text-accent-soft">
              confirmed: true
            </code>
            . This banner disappears on its own.
          </p>
        </div>
      )}

      <section className="border-b border-line py-12">
        <p
          className={`max-w-[64ch] text-[1.05rem] leading-relaxed ${
            personalIntro.confirmed ? "text-text" : "text-dim italic"
          }`}
        >
          {personalIntro.text}
        </p>
      </section>

      <section className="border-b border-line py-12">
        <h2 className="font-cond text-2xl font-bold tracking-[-0.012em]">
          What I do with the rest of my time
        </h2>

        <ul className="mt-7 grid gap-px overflow-hidden rounded-panel border border-line bg-line sm:grid-cols-2">
          {hobbies.map((h) => (
            <li key={h.name} className="bg-panel p-5">
              <div className="flex items-center gap-2.5">
                <HobbyIcon name={h.icon} />
                <h3
                  className={`font-cond text-[1.12rem] leading-tight font-semibold ${
                    h.confirmed ? "text-text" : "text-dim"
                  }`}
                >
                  {h.name}
                </h3>
                {!h.confirmed && <Pill tone="warn">Placeholder</Pill>}
              </div>
              <p
                className={`mt-2.5 text-[0.92rem] leading-relaxed ${
                  h.confirmed ? "text-muted" : "text-dim italic"
                }`}
              >
                {h.detail}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="py-12">
        <h2 className="font-cond text-2xl font-bold tracking-[-0.012em]">
          Currently
        </h2>

        <Panel className="mt-7">
          <dl className="divide-y divide-line-soft">
            {currently.map((c) => (
              <div
                key={c.label}
                className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3 first:pt-0 last:pb-0"
              >
                <dt className="w-28 shrink-0 font-mono text-[0.6rem] tracking-[0.13em] text-dim uppercase">
                  {c.label}
                </dt>
                <dd
                  className={`flex-1 text-[0.95rem] ${
                    c.confirmed ? "text-text" : "text-dim italic"
                  }`}
                >
                  {c.value}
                  {!c.confirmed && (
                    <span className="ml-2">
                      <Pill tone="warn">Placeholder</Pill>
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </Panel>
      </section>
    </div>
  );
}
