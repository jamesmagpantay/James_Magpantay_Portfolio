"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { sections } from "@/lib/content";
import { nodeTypes, type DeviceData } from "./nodes";
import { edgeTypes } from "./PacketEdge";

/** Fixed layout — four nodes above the core, four below. */
const POSITIONS = [
  { x: 0, y: 0 },
  { x: 215, y: 0 },
  { x: 505, y: 0 },
  { x: 720, y: 0 },
  { x: 0, y: 330 },
  { x: 215, y: 330 },
  { x: 505, y: 330 },
  { x: 720, y: 330 },
];

const CORE_POSITION = { x: 366, y: 160 };

export function Topology() {
  const router = useRouter();

  const nodes = useMemo<Node[]>(() => {
    const deviceNodes: Node[] = sections.map((s, i) => ({
      id: s.hostname,
      type: "device",
      position: POSITIONS[i] ?? { x: 0, y: 0 },
      data: {
        hostname: s.hostname,
        label: s.label,
        kind: s.kind,
        port: s.port,
        blurb: s.blurb,
        href: s.href,
      } satisfies DeviceData,
      draggable: false,
      connectable: false,
    }));

    return [
      {
        id: "core-sw-01",
        type: "core",
        position: CORE_POSITION,
        data: { hostname: "core-sw-01", uptime: "100%" },
        draggable: false,
        connectable: false,
        selectable: false,
      },
      ...deviceNodes,
    ];
  }, []);

  const edges = useMemo<Edge[]>(
    () =>
      sections.map((s, i) => ({
        id: `core-${s.hostname}`,
        source: "core-sw-01",
        target: s.hostname,
        type: "packet",
        style: { stroke: "#1E2B44", strokeWidth: 1.25 },
        data: { delay: i * 0.45, duration: 3.6 },
      })),
    []
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const href = (node.data as Partial<DeviceData>)?.href;
      if (href) router.push(href);
    },
    [router]
  );

  return (
    <div className="h-[460px] w-full sm:h-[520px]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.14 }}
        minZoom={0.3}
        maxZoom={1.6}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        /* never hijack the page scroll */
        zoomOnScroll={false}
        panOnScroll={false}
        preventScrolling={false}
        zoomOnDoubleClick={false}
        proOptions={{ hideAttribution: true }}
        aria-label="Interactive network topology of portfolio sections"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={26}
          size={1}
          color="#1E2B44"
        />
        <Controls
          showInteractive={false}
          className="!border !border-line !bg-panel !shadow-none"
        />
      </ReactFlow>
    </div>
  );
}
