import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";

const WRITEUPS_DIR = path.join(process.cwd(), "content", "writeups");

export type WriteupMeta = {
  slug: string;
  title: string;
  summary: string;
  date: string;
  /** e.g. "TryHackMe", "HackTheBox", "Notes" */
  platform?: string;
  difficulty?: "easy" | "medium" | "hard" | "insane";
  tags: string[];
  readingTime: string;
  draft: boolean;
};

export type Writeup = WriteupMeta & { content: string };

function readDir(): string[] {
  if (!fs.existsSync(WRITEUPS_DIR)) return [];
  return fs
    .readdirSync(WRITEUPS_DIR)
    .filter((f) => f.endsWith(".mdx") && !f.startsWith("_"));
}

function parse(file: string): Writeup {
  const raw = fs.readFileSync(path.join(WRITEUPS_DIR, file), "utf8");
  const { data, content } = matter(raw);

  return {
    slug: file.replace(/\.mdx$/, ""),
    title: String(data.title ?? "Untitled"),
    summary: String(data.summary ?? ""),
    date: String(data.date ?? ""),
    platform: data.platform ? String(data.platform) : undefined,
    difficulty: data.difficulty as WriteupMeta["difficulty"],
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    readingTime: readingTime(content).text,
    draft: Boolean(data.draft),
    content,
  };
}

/** Published writeups, newest first. Drafts are excluded in production. */
export function getWriteups(): Writeup[] {
  const isDev = process.env.NODE_ENV === "development";
  return readDir()
    .map(parse)
    .filter((w) => isDev || !w.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getWriteup(slug: string): Writeup | undefined {
  return getWriteups().find((w) => w.slug === slug);
}

export function getAllTags(): string[] {
  return [...new Set(getWriteups().flatMap((w) => w.tags))].sort();
}
