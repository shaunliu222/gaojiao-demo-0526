import type { GraphEdge, GraphEdgeRelation } from "@mock";

export type EdgeStroke = {
  stroke: string;
  strokeWidth: number;
  strokeDasharray?: string;
  opacity?: number;
};

const RELATION: Record<GraphEdgeRelation, EdgeStroke> = {
  contain: { stroke: "#64748b", strokeWidth: 1.3, strokeDasharray: "4 3", opacity: 0.82 },
  guide: { stroke: "#818cf8", strokeWidth: 1.35, opacity: 0.78 },
  Influence: { stroke: "#f59e0b", strokeWidth: 1.15, strokeDasharray: "6 4", opacity: 0.74 },
  Cultivate: { stroke: "#22c55e", strokeWidth: 1.25, opacity: 0.72 },
  Support: { stroke: "#34d399", strokeWidth: 1.2, strokeDasharray: "2 4", opacity: 0.72 },
  "Map to": { stroke: "#38bdf8", strokeWidth: 1.2, opacity: 0.76 },
  Depend: { stroke: "#a5b4fc", strokeWidth: 1.25, opacity: 0.68 },
  Decide: { stroke: "#ef4444", strokeWidth: 1.25, strokeDasharray: "3 3", opacity: 0.7 },
  "Belong to": { stroke: "#94a3b8", strokeWidth: 1.1, strokeDasharray: "4 3", opacity: 0.7 },
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
