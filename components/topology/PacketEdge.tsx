"use client";

import {
  BaseEdge,
  getStraightPath,
  type EdgeProps,
  type Edge,
} from "@xyflow/react";

export type PacketEdgeType = Edge<{ delay?: number; duration?: number }>;

/**
 * A link with a packet travelling along it.
 *
 * The dot is positioned with `offset-path`, which follows the exact SVG
 * path the edge already draws — so the packet stays on the wire at any
 * zoom level without recomputing coordinates.
 */
export function PacketEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
  data,
}: EdgeProps<PacketEdgeType>) {
  const [path] = getStraightPath({ sourceX, sourceY, targetX, targetY });

  const duration = data?.duration ?? 3.6;
  const delay = data?.delay ?? 0;

  return (
    <>
      <BaseEdge id={id} path={path} style={style} />
      <circle
        r="2.6"
        className="fill-accent motion-reduce:hidden"
        style={{
          offsetPath: `path('${path}')`,
          offsetRotate: "0deg",
          animation: `packet ${duration}s linear ${delay}s infinite`,
        }}
      />
    </>
  );
}

export const edgeTypes = { packet: PacketEdge };
