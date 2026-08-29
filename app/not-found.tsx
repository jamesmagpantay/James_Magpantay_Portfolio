import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SectionGrid } from "@/components/topology/SectionGrid";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-20 pb-24 sm:px-6 lg:px-10">
      <p className="font-mono text-[0.68rem] tracking-[0.18em] text-crit uppercase">
        404 — destination host unreachable
      </p>

      <h1 className="mt-5 font-cond text-4xl leading-[1.05] font-bold tracking-[-0.018em] text-balance sm:text-5xl">
        No route to that node
      </h1>

      <p className="mt-4 max-w-[58ch] leading-relaxed text-muted">
        The address you asked for is not on this network. Every reachable node
        is listed below, or you can go back to the topology map.
      </p>

      <pre className="mt-8 overflow-x-auto rounded-panel border border-line bg-panel-2 p-4 font-mono text-[0.72rem] leading-relaxed text-dim">
{`$ traceroute requested-host
 1  core-sw-01        0.412 ms
 2  * * *
 3  * * *   destination unreachable`}
      </pre>

      <Link
        href="/"
        className="group mt-8 inline-flex items-center gap-2 rounded-[3px] border border-accent bg-accent/10 px-4 py-2.5 font-mono text-[0.7rem] tracking-[0.12em] text-accent uppercase transition-colors hover:bg-accent/18"
      >
        <ArrowLeft
          size={13}
          className="transition-transform group-hover:-translate-x-0.5"
        />
        Return to topology
      </Link>

      <div className="mt-12">
        <p className="mb-4 font-mono text-[0.6rem] tracking-[0.14em] text-dim uppercase">
          Reachable nodes
        </p>
        <SectionGrid />
      </div>
    </div>
  );
}
