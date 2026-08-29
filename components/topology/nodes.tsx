"use client";

import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import {
  Server,
  ShieldCheck,
  Radar,
  RadioTower,
  MonitorSmartphone,
  Mail,
  Network,
} from "lucide-react";
import type { NodeKind } from "@/lib/content";

const ICONS: Record<NodeKind, React.ElementType> = {
  core: Network,
  server: Server,
  firewall: ShieldCheck,
  ids: Radar,
  ap: RadioTower,
  host: MonitorSmartphone,
  mail: Mail,
};

export type DeviceData = {
  hostname: string;
  label: string;
  kind: NodeKind;
  port: string;
  blurb: string;
  href: string;
};

export type DeviceNodeType = Node<DeviceData, "device">;
export type CoreNodeType = Node<{ hostname: string; uptime: string }, "core">;

export function DeviceNode({ data, selected }: NodeProps<DeviceNodeType>) {
  const Icon = ICONS[data.kind] ?? Server;

  return (
    <div
      className={`group w-[168px] cursor-pointer rounded-[4px] border bg-panel transition-all duration-200 ${
        selected
          ? "border-accent shadow-[0_0_0_3px_rgba(34,211,238,0.12)]"
          : "border-line hover:border-accent-deep hover:bg-panel-2"
      }`}
      title={data.blurb}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      <div className="flex items-center gap-2 border-b border-line-soft px-2.5 py-1.5">
        <Icon
          size={13}
          className="shrink-0 text-accent-deep transition-colors group-hover:text-accent"
        />
        <span className="truncate font-mono text-[0.63rem] tracking-[0.08em] text-accent">
          {data.hostname}
        </span>
        <span className="ml-auto font-mono text-[0.53rem] text-dim">
          {data.port}
        </span>
      </div>

      <div className="px-2.5 py-2">
        <div className="font-cond text-[0.92rem] leading-tight font-semibold text-text">
          {data.label}
        </div>
        <div className="mt-0.5 line-clamp-2 text-[0.68rem] leading-snug text-dim">
          {data.blurb}
        </div>
      </div>
    </div>
  );
}

export function CoreNode({ data }: NodeProps<CoreNodeType>) {
  return (
    <div className="w-[196px] rounded-[4px] border border-accent bg-panel-2 shadow-[0_0_0_4px_rgba(34,211,238,0.07)]">
      <Handle type="source" position={Position.Top} />
      <Handle type="target" position={Position.Bottom} />

      <div className="flex items-center gap-2 border-b border-line px-3 py-1.5">
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-ok opacity-60" />
          <span className="relative inline-flex size-1.5 rounded-full bg-ok" />
        </span>
        <span className="font-mono text-[0.63rem] tracking-[0.1em] text-accent">
          {data.hostname}
        </span>
      </div>

      <div className="px-3 py-2.5">
        <div className="font-cond text-[1.05rem] leading-tight font-bold text-text">
          Core Switch
        </div>
        <div className="mt-1 flex items-center justify-between font-mono text-[0.58rem] tracking-[0.08em] text-dim uppercase">
          <span>8 ports active</span>
          <span className="text-ok">{data.uptime}</span>
        </div>
      </div>
    </div>
  );
}

export const nodeTypes = { device: DeviceNode, core: CoreNode };
