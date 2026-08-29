"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Mail, FileText, Network } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";
import { profile, sections } from "@/lib/content";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onNavigate: () => void;
};

export function NavRail({ open, onNavigate }: Props) {
  const pathname = usePathname();

  return (
    <>
      {/* scrim — mobile only */}
      <div
        onClick={onNavigate}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 top-11 z-30 bg-bg/70 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <nav
        id="nav-rail"
        aria-label="Main"
        className={cn(
          "fixed top-11 bottom-0 left-0 z-40 flex w-60 flex-col border-r border-line bg-panel-2 transition-transform duration-200 ease-out",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* identity block */}
        <Link
          href="/"
          onClick={onNavigate}
          className="group flex items-center gap-3 border-b border-line px-4 py-4 transition-colors hover:bg-panel"
        >
          <span className="relative size-10 shrink-0 overflow-hidden rounded border border-line">
            <Image
              src={profile.photo}
              alt=""
              fill
              sizes="40px"
              className="object-cover object-top grayscale transition-all duration-300 group-hover:grayscale-0"
              priority
            />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-cond text-[0.95rem] leading-tight font-semibold text-text">
              {profile.shortName}
            </span>
            <span className="mt-0.5 block truncate font-mono text-[0.6rem] tracking-[0.1em] text-dim uppercase">
              {profile.title}
            </span>
          </span>
        </Link>

        {/* topology link */}
        <Link
          href="/"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-2.5 border-b border-line px-4 py-2.5 font-mono text-[0.68rem] tracking-[0.12em] uppercase transition-colors",
            pathname === "/"
              ? "bg-panel text-accent"
              : "text-dim hover:bg-panel hover:text-muted"
          )}
        >
          <Network size={13} />
          core-sw-01
          <span className="ml-auto text-[0.58rem] text-dim">map</span>
        </Link>

        {/* sections */}
        <ul className="flex-1 overflow-y-auto py-2">
          {sections.map((s) => {
            const active =
              pathname === s.href || pathname.startsWith(s.href + "/");
            return (
              <li key={s.href}>
                <Link
                  href={s.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex flex-col gap-0.5 px-4 py-2.5 transition-colors",
                    active ? "bg-panel" : "hover:bg-panel/60"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0 bottom-0 left-0 w-0.5 transition-colors",
                      active ? "bg-accent" : "bg-transparent"
                    )}
                  />
                  <span
                    className={cn(
                      "font-cond text-[0.95rem] leading-tight font-semibold transition-colors",
                      active
                        ? "text-text"
                        : "text-muted group-hover:text-text"
                    )}
                  >
                    {s.label}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-[0.6rem] tracking-[0.08em] transition-colors",
                      active ? "text-accent" : "text-dim"
                    )}
                  >
                    {s.hostname}
                    <span className="ml-1.5 text-dim/70">{s.port}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* footer */}
        <div className="border-t border-line px-4 py-3">
          <div className="flex items-center gap-1">
            <RailIcon
              href={profile.socials.github}
              label="GitHub"
              external
            >
              <GithubIcon size={14} />
            </RailIcon>
            <RailIcon
              href={profile.socials.linkedin}
              label="LinkedIn"
              external
            >
              <LinkedinIcon size={14} />
            </RailIcon>
            <RailIcon href={`mailto:${profile.email}`} label="Email">
              <Mail size={14} />
            </RailIcon>
            <RailIcon href={profile.resume} label="Download CV" external>
              <FileText size={14} />
            </RailIcon>
          </div>
        </div>
      </nav>
    </>
  );
}

function RailIcon({
  href,
  label,
  external,
  children,
}: {
  href: string;
  label: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      className="grid size-8 place-items-center rounded text-dim transition-colors hover:bg-panel hover:text-accent"
    >
      {children}
    </a>
  );
}
