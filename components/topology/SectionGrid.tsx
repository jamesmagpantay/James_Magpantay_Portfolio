import Link from "next/link";
import {
  Server,
  ShieldCheck,
  Radar,
  RadioTower,
  MonitorSmartphone,
  Mail,
  ArrowUpRight,
} from "lucide-react";
import { sections, type NodeKind } from "@/lib/content";

const ICONS: Partial<Record<NodeKind, React.ElementType>> = {
  server: Server,
  firewall: ShieldCheck,
  ids: Radar,
  ap: RadioTower,
  host: MonitorSmartphone,
  mail: Mail,
};

/**
 * The accessible, always-available route to every section.
 * On small screens this replaces the pan/zoom topology entirely.
 */
export function SectionGrid() {
  return (
    <ul className="grid gap-px overflow-hidden rounded-panel border border-line bg-line sm:grid-cols-2">
      {sections.map((s) => {
        const Icon = ICONS[s.kind] ?? Server;
        return (
          <li key={s.href}>
            <Link
              href={s.href}
              className="group flex h-full flex-col gap-1 bg-panel p-4 transition-colors hover:bg-panel-2"
            >
              <div className="flex items-center gap-2">
                <Icon size={13} className="shrink-0 text-accent-deep transition-colors group-hover:text-accent" />
                <span className="font-mono text-[0.62rem] tracking-[0.08em] text-accent">
                  {s.hostname}
                </span>
                <span className="font-mono text-[0.53rem] text-dim">
                  {s.port}
                </span>
                <ArrowUpRight
                  size={13}
                  className="ml-auto text-dim transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
                />
              </div>
              <div className="font-cond text-[1.05rem] leading-tight font-semibold">
                {s.label}
              </div>
              <div className="text-[0.8rem] leading-snug text-muted">
                {s.blurb}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
