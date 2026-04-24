import type { GraphEdge, GraphEdgeRelation } from "@mock";

export type EdgeStroke = {
  stroke: string;
  strokeWidth: number;
  strokeDasharray?: string;
  opacity?: number;
};

const RELATION: Record<GraphEdgeRelation, EdgeStroke> = {
  先修: { stroke: "#a5b4fc", strokeWidth: 1.6, opacity: 0.92 },
  包含: { stroke: "#94a3b8", strokeWidth: 1.2, strokeDasharray: "4 3", opacity: 0.92 },
  支撑: { stroke: "#34d399", strokeWidth: 1.4, strokeDasharray: "2 4", opacity: 0.92 },
  相关: { stroke: "#fbbf24", strokeWidth: 1.2, strokeDasharray: "6 4", opacity: 0.92 },
};

export function edgeStrokeByRelation(
  e: GraphEdge,
): EdgeStroke {
  return RELATION[e.relation] ?? {
    stroke: "#cbd5e1",
    strokeWidth: 1.2,
    opacity: 0.9,
  };
}

/** 全库浏览页等：单色浅灰 */
export const NEUTRAL_EDGE: EdgeStroke = {
  stroke: "#cbd5e1",
  strokeWidth: 1,
  opacity: 1,
};
