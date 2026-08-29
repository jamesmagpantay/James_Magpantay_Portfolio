"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { profile } from "@/lib/content";

function useUtcClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toISOString().slice(11, 19) // HH:MM:SS
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return time;
}

type Props = {
  navOpen: boolean;
  onToggleNav: () => void;
};

export function StatusBar({ navOpen, onToggleNav }: Props) {
  const time = useUtcClock();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/92 backdrop-blur-md">
      <div className="flex h-11 items-center gap-3 px-3 sm:px-5">
        {/* mobile nav toggle */}
        <button
          type="button"
          onClick={onToggleNav}
          aria-expanded={navOpen}
          aria-controls="nav-rail"
          aria-label={navOpen ? "Close navigation" : "Open navigation"}
          className="-ml-1 grid size-8 place-items-center rounded text-muted transition-colors hover:bg-panel hover:text-accent lg:hidden"
        >
          {navOpen ? <X size={16} /> : <Menu size={16} />}
        </button>

        <div className="flex items-center gap-2 font-mono text-[0.63rem] tracking-[0.14em] text-dim uppercase">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-ok opacity-60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-ok" />
          </span>
          <span className="text-muted">Online</span>
        </div>

        <span className="hidden h-3 w-px bg-line sm:block" />

        <div className="hidden font-mono text-[0.63rem] tracking-[0.14em] text-dim uppercase sm:block">
          <span className="text-muted">Focus</span>{" "}
          <span className="text-accent-soft">{profile.currentFocus}</span>
        </div>

        <div className="flex-1" />

        <div className="hidden font-mono text-[0.63rem] tracking-[0.14em] text-dim uppercase md:block">
          {profile.location}
        </div>

        <span className="hidden h-3 w-px bg-line md:block" />

        <div
          className="font-mono text-[0.63rem] tracking-[0.14em] tabular-nums text-muted uppercase"
          suppressHydrationWarning
        >
          {time ?? "--:--:--"}
          <span className="ml-1 text-dim">UTC</span>
        </div>
      </div>
    </header>
  );
}
