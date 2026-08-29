import type { Metadata } from "next";
import Image from "next/image";
import { Trophy, ImageOff, MapPin } from "lucide-react";
import { PageHeader, Panel, Pill, Stat } from "@/components/ui/Panel";
import { events, eventStats, type EventEntry } from "@/lib/content";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Hackathons, CTFs, and workshops — CODEKADA, IBM Bob Dev Day, AI Odyssey CTF on TryHackMe, Build With AI (2nd place), and AWS Cloud Club PUP.",
};

const KIND_LABEL: Record<EventEntry["kind"], string> = {
  hackathon: "Hackathon",
  ctf: "Capture the flag",
  workshop: "Workshop",
  conference: "Conference",
  program: "Program",
};

function PhotoStrip({ event }: { event: EventEntry }) {
  if (event.photos.length === 0) {
    return (
      <div className="flex aspect-16/9 flex-col items-center justify-center gap-2 rounded-[3px] border border-dashed border-line bg-panel-2">
        <ImageOff size={18} className="text-dim" />
        <p className="px-4 text-center font-mono text-[0.58rem] tracking-[0.1em] text-dim uppercase">
          Photos not added yet
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-1.5">
      {event.photos.map((src) => (
        <div
          key={src}
          className="relative aspect-4/3 overflow-hidden rounded-[3px] border border-line"
        >
          <Image
            src={src}
            alt={`${event.name} — photo`}
            fill
            sizes="(max-width: 768px) 50vw, 240px"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}

export default function EventsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 pb-24 sm:px-6 lg:px-10">
      <PageHeader
        eyebrow="ap-events — gi0/6"
        title="Hackathons, CTFs, and workshops"
        lede="What I showed up to, what I did there, and the one thing I took away from each. Showing up is where most of the learning happened."
      />

      <section className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-panel border border-line bg-line sm:grid-cols-4">
        <div className="bg-panel px-4 py-5">
          <Stat value={String(eventStats.total)} label="Events" tone="text" />
        </div>
        <div className="bg-panel px-4 py-5">
          <Stat value={String(eventStats.hackathons)} label="Hackathons" />
        </div>
        <div className="bg-panel px-4 py-5">
          <Stat value={String(eventStats.ctfs)} label="CTFs" />
        </div>
        <div className="bg-panel px-4 py-5">
          <Stat
            value={String(eventStats.placements)}
            label="Placements"
            tone="ok"
          />
        </div>
      </section>

      <div className="mt-6 space-y-4">
        {events.map((e) => (
          <Panel key={e.slug} accent={e.result ? "ok" : "none"}>
            <div className="grid gap-6 md:grid-cols-[1fr_240px]">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone="accent">{KIND_LABEL[e.kind]}</Pill>
                  {e.result && (
                    <Pill tone="ok">
                      <span className="inline-flex items-center gap-1">
                        <Trophy size={9} />
                        {e.result}
                      </span>
                    </Pill>
                  )}
                  <span className="font-mono text-[0.62rem] tracking-[0.1em] text-dim uppercase">
                    {e.date}
                  </span>
                </div>

                <h2 className="mt-3 font-cond text-2xl leading-tight font-semibold text-balance">
                  {e.name}
                </h2>

                <p className="mt-1.5 text-[0.98rem] text-accent-soft">
                  {e.role}
                  {e.project && (
                    <span className="text-muted"> &middot; {e.project}</span>
                  )}
                </p>

                <p className="mt-1 inline-flex items-center gap-1.5 font-mono text-[0.6rem] tracking-[0.1em] text-dim uppercase">
                  <MapPin size={10} />
                  {e.location}
                </p>

                <blockquote className="mt-4 border-l-2 border-warn bg-panel-2 px-4 py-3">
                  <p className="text-[0.93rem] leading-relaxed text-muted italic">
                    {e.takeaway}
                  </p>
                </blockquote>

                <ul className="mt-4 space-y-2">
                  {e.highlights.map((h) => (
                    <li
                      key={h}
                      className="flex gap-2.5 text-[0.9rem] leading-relaxed text-muted"
                    >
                      <span className="mt-2 size-1 shrink-0 rounded-full bg-accent-deep" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="md:pt-1">
                <PhotoStrip event={e} />
              </div>
            </div>
          </Panel>
        ))}
      </div>

      {events.some((e) => e.photos.length === 0) && (
      <p className="mt-8 rounded-panel border border-dashed border-line bg-panel-2 p-4 text-[0.85rem] leading-relaxed text-dim">
        <span className="font-mono text-[0.6rem] tracking-[0.12em] text-warn uppercase">
          Note for James —{" "}
        </span>
        drop event photos into{" "}
        <code className="rounded-[3px] border border-line bg-panel px-1 py-0.5 font-mono text-[0.8em] text-accent-soft">
          /public/events/
        </code>{" "}
        and list the filenames in the{" "}
        <code className="rounded-[3px] border border-line bg-panel px-1 py-0.5 font-mono text-[0.8em] text-accent-soft">
          photos
        </code>{" "}
        array in{" "}
        <code className="rounded-[3px] border border-line bg-panel px-1 py-0.5 font-mono text-[0.8em] text-accent-soft">
          lib/content/events.ts
        </code>
        . This note disappears once every event has photos.
      </p>
      )}
    </div>
  );
}
