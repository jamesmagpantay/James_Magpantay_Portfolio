import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileCode2, Clock } from "lucide-react";
import { PageHeader, Pill } from "@/components/ui/Panel";
import { getWriteups } from "@/lib/writeups";

export const metadata: Metadata = {
  title: "Writeups",
  description:
    "CTF solutions, security notes, and walkthroughs by James Randall A. Magpantay.",
};

const DIFFICULTY_TONE = {
  easy: "ok",
  medium: "warn",
  hard: "crit",
  insane: "crit",
} as const;

export default function WriteupsPage() {
  const writeups = getWriteups();

  return (
    <div className="mx-auto max-w-4xl px-4 pt-10 pb-24 sm:px-6 lg:px-10">
      <PageHeader
        eyebrow="srv-writeups — gi0/3"
        title="CTF solutions and security notes"
        lede="Working notes from boxes, challenges, and things I broke on purpose. Written for the version of me who will need them again in six months."
        meta={
          writeups.length > 0 ? (
            <Pill tone="accent">{writeups.length} published</Pill>
          ) : undefined
        }
      />

      {writeups.length === 0 ? (
        <section className="mt-12">
          <div className="rounded-panel border border-line bg-panel px-6 py-14 text-center">
            <FileCode2 size={26} className="mx-auto text-accent-deep" />
            <h2 className="mt-5 font-cond text-2xl font-semibold">
              No writeups published yet
            </h2>
            <p className="mx-auto mt-3 max-w-[52ch] leading-relaxed text-muted">
              The pipeline is built and waiting. Publishing one is a single file
              and a push — no database, no admin panel.
            </p>

            <div className="mx-auto mt-8 max-w-md rounded-[3px] border border-line bg-panel-2 p-4 text-left">
              <p className="font-mono text-[0.58rem] tracking-[0.13em] text-dim uppercase">
                To publish
              </p>
              <ol className="mt-3 space-y-2 font-mono text-[0.72rem] leading-relaxed text-muted">
                <li>
                  <span className="text-accent-deep">1.</span> Copy{" "}
                  <span className="text-accent-soft">
                    content/writeups/_TEMPLATE.mdx.txt
                  </span>
                </li>
                <li>
                  <span className="text-accent-deep">2.</span> Rename it to{" "}
                  <span className="text-accent-soft">your-slug.mdx</span>
                </li>
                <li>
                  <span className="text-accent-deep">3.</span> Fill in the
                  frontmatter and write
                </li>
                <li>
                  <span className="text-accent-deep">4.</span> Commit and push —
                  it appears here
                </li>
              </ol>
            </div>
          </div>
        </section>
      ) : (
        <ul className="mt-10 grid gap-px overflow-hidden rounded-panel border border-line bg-line">
          {writeups.map((w) => (
            <li key={w.slug}>
              <Link
                href={`/writeups/${w.slug}`}
                className="group flex flex-col gap-2 bg-panel p-5 transition-colors hover:bg-panel-2"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {w.platform && <Pill tone="accent">{w.platform}</Pill>}
                  {w.difficulty && (
                    <Pill tone={DIFFICULTY_TONE[w.difficulty]}>
                      {w.difficulty}
                    </Pill>
                  )}
                  {w.draft && <Pill tone="warn">Draft</Pill>}
                  <span className="font-mono text-[0.6rem] tracking-[0.1em] text-dim uppercase">
                    {w.date}
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono text-[0.6rem] tracking-[0.1em] text-dim uppercase">
                    <Clock size={9} />
                    {w.readingTime}
                  </span>
                </div>

                <h2 className="font-cond text-xl leading-tight font-semibold text-balance transition-colors group-hover:text-accent">
                  {w.title}
                </h2>

                <p className="text-[0.92rem] leading-relaxed text-muted">
                  {w.summary}
                </p>

                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  {w.tags.map((t) => (
                    <Pill key={t}>{t}</Pill>
                  ))}
                  <ArrowRight
                    size={13}
                    className="ml-auto text-dim transition-all group-hover:translate-x-0.5 group-hover:text-accent"
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
