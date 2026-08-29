"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { StatusBar } from "./StatusBar";
import { NavRail } from "./NavRail";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  const pathname = usePathname();

  // close the drawer on route change
  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  // lock scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = navOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [navOpen]);

  // escape closes the drawer
  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navOpen]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-100 focus:rounded focus:border focus:border-accent focus:bg-panel focus:px-3 focus:py-2 focus:font-mono focus:text-xs focus:text-accent"
      >
        Skip to content
      </a>

      <StatusBar navOpen={navOpen} onToggleNav={() => setNavOpen((v) => !v)} />
      <NavRail open={navOpen} onNavigate={() => setNavOpen(false)} />

      <main id="main" className="lg:pl-60">
        {children}
      </main>
    </>
  );
}
