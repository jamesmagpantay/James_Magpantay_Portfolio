"use client";

import { useEffect, useRef, useState } from "react";
import { sections } from "@/lib/content";

type Line = {
  id: number;
  time: string;
  proto: string;
  src: string;
  dst: string;
  state: string;
  tone: "ok" | "info" | "warn" | "dim";
};

const PROTOS = ["TCP", "TCP", "TCP", "UDP", "ICMP", "TLS"];
const STATES: { text: string; tone: Line["tone"] }[] = [
  { text: "ESTABLISHED", tone: "ok" },
  { text: "ESTABLISHED", tone: "ok" },
  { text: "SYN_SENT", tone: "info" },
  { text: "ACK", tone: "dim" },
  { text: "HANDSHAKE_OK", tone: "ok" },
  { text: "ECHO_REPLY", tone: "dim" },
  { text: "RATE_LIMITED", tone: "warn" },
];

const TONE_CLASS: Record<Line["tone"], string> = {
  ok: "text-ok",
  info: "text-info",
  warn: "text-warn",
  dim: "text-dim",
};

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeLine(id: number): Line {
  const target = pick(sections);
  const state = pick(STATES);
  return {
    id,
    time: new Date().toISOString().slice(11, 19),
    proto: pick(PROTOS),
    src: `10.0.0.${1 + Math.floor(Math.random() * 24)}:${
      40000 + Math.floor(Math.random() * 20000)
    }`,
    dst: target.hostname,
    state: state.text,
    tone: state.tone,
  };
}

const MAX_LINES = 7;

export function LogFeed() {
  const [lines, setLines] = useState<Line[]>([]);
  const counter = useRef(0);

  useEffect(() => {
    // seed after mount so server and client markup match
    const seed = Array.from({ length: MAX_LINES }, () =>
      makeLine(counter.current++)
    );
    setLines(seed);

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) return;

    const id = setInterval(() => {
      setLines((prev) =>
        [...prev.slice(-(MAX_LINES - 1)), makeLine(counter.current++)]
      );
    }, 2200);

    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="overflow-hidden rounded-panel border border-line bg-panel-2"
      aria-hidden="true"
    >
      <div className="flex items-center gap-2 border-b border-line bg-panel px-3 py-2">
        <span className="size-1.5 rounded-full bg-ok" />
        <span className="font-mono text-[0.6rem] tracking-[0.14em] text-dim uppercase">
          Flow log — core-sw-01
        </span>
        <span className="ml-auto font-mono text-[0.55rem] tracking-[0.1em] text-dim uppercase">
          live
        </span>
      </div>

      <div className="min-h-[168px] px-3 py-2.5">
        {lines.length === 0 ? (
          <p className="font-mono text-[0.66rem] text-dim">
            initialising capture<span className="animate-blink">_</span>
          </p>
        ) : (
          <ul className="space-y-[3px] font-mono text-[0.66rem] leading-relaxed">
            {lines.map((l, i) => (
              <li
                key={l.id}
                className="flex gap-2 whitespace-nowrap transition-opacity"
                style={{ opacity: 0.4 + (i / (lines.length - 1 || 1)) * 0.6 }}
              >
                <span className="text-dim tabular-nums">[{l.time}]</span>
                <span className="text-muted">{l.proto}</span>
                <span className="hidden text-dim tabular-nums sm:inline">
                  {l.src}
                </span>
                <span className="text-dim">&rarr;</span>
                <span className="text-accent-soft">{l.dst}</span>
                <span className={`ml-auto ${TONE_CLASS[l.tone]}`}>
                  {l.state}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
