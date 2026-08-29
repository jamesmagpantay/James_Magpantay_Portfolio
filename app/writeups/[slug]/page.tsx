import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import { ArrowLeft, Clock } from "lucide-react";
import { Pill } from "@/components/ui/Panel";
import { getWriteup, getWriteups } from "@/lib/writeups";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getWriteups().map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const w = getWriteup(slug);
  if (!w) return { title: "Writeup not found" };
  return {
    title: w.title,
    description: w.summary,
    openGraph: { title: w.title, description: w.summary, type: "article" },
  };
}

const DIFFICULTY_TONE = {
  easy: "ok",
  medium: "warn",
  hard: "crit",
  insane: "crit",
} as const;

export default async function WriteupPage({ params }: Params) {
  const { slug } = await params;
  const writeup = getWriteup(slug);
  if (!writeup) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 pt-10 pb-24 sm:px-6 lg:px-10">
      <Link
        href="/writeups"
        className="group inline-flex items-center gap-1.5 font-mono text-[0.66rem] tracking-[0.12em] text-dim uppercase transition-colors hover:text-accent"
      >
        <ArrowLeft
          size={12}
          className="transition-transform group-hover:-translate-x-0.5"
        />
        All writeups
      </Link>

      <header className="mt-6 border-b border-line pb-8">
        <div className="flex flex-wrap items-center gap-2">
          {writeup.platform && <Pill tone="accent">{writeup.platform}</Pill>}
          {writeup.difficulty && (
            <Pill tone={DIFFICULTY_TONE[writeup.difficulty]}>
              {writeup.difficulty}
            </Pill>
          )}
          {writeup.draft && <Pill tone="warn">Draft</Pill>}
          <span className="font-mono text-[0.62rem] tracking-[0.1em] text-dim uppercase">
            {writeup.date}
          </span>
          <span className="inline-flex items-center gap-1 font-mono text-[0.62rem] tracking-[0.1em] text-dim uppercase">
            <Clock size={10} />
            {writeup.readingTime}
          </span>
        </div>

        <h1 className="mt-5 font-cond text-4xl leading-[1.05] font-bold tracking-[-0.018em] text-balance sm:text-5xl">
          {writeup.title}
        </h1>

        {writeup.summary && (
          <p className="mt-4 max-w-[62ch] text-[1.02rem] leading-relaxed text-muted">
            {writeup.summary}
          </p>
        )}

        {writeup.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {writeup.tags.map((t) => (
              <Pill key={t}>{t}</Pill>
            ))}
          </div>
        )}
      </header>

      <div className="prose-console mt-10">
        <MDXRemote
          source={writeup.content}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [
                [
                  rehypePrettyCode,
                  {
                    theme: "github-dark-default",
                    keepBackground: false,
                  },
                ],
              ],
            },
          }}
        />
      </div>
    </article>
  );
}
