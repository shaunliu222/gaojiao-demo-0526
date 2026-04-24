import { useMemo, type ReactNode } from "react";
import type { GraphEdge, GraphNode } from "@mock";
import {
  computeGraphLayout,
  type LayoutOptions,
  type NodeXY,
} from "../../data/graphLayout";
import { edgeStrokeByRelation, NEUTRAL_EDGE, type EdgeStroke } from "./edgeStyles";

type LayoutOverrides = Partial<
  Pick<
    LayoutOptions,
    | "macroRadius"
    | "macroRadiusX"
    | "macroRadiusY"
    | "microRadius"
    | "microRadiusGrow"
    | "nodeMinCenterDistance"
    | "layoutEdgePadding"
    | "layoutCollisionIterations"
  >
>;

export type KnowledgeGraphCanvasProps = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  width: number;
  height: number;
  /** 覆盖默认的簇分布半径/簇内小圆等（width/height 已固定为 props 上下传） */
  layoutOverrides?: LayoutOverrides;
  /**
   * 无 renderEdge 时：neutral = 全库页浅灰线；byRelation = 按边类型线型与颜色
   * 有 renderEdge 时：本项被忽略
   */
  edgeStrokeMode?: "neutral" | "byRelation";
  /** 若提供，每条边由调用方完全自定义（如向导按「两端是否同被引用」上色） */
  renderEdge?: (
    e: GraphEdge,
    from: NodeXY,
    to: NodeXY,
  ) => ReactNode;
  /** 为节点包一层可点击域（如全库浏览/计划路径选节点）；不上则只展示 */
  onNodeClick?: (node: GraphNode) => void;
  renderNode: (args: { node: GraphNode; x: number; y: number }) => ReactNode;
  className?: string;
  style?: React.CSSProperties;
  svgClassName?: string;
};

function defaultEdgeElement(
  e: GraphEdge,
  from: NodeXY,
  to: NodeXY,
  mode: "neutral" | "byRelation",
): ReactNode {
  const st: EdgeStroke =
    mode === "byRelation" ? edgeStrokeByRelation(e) : NEUTRAL_EDGE;
  return (
    <line
      key={e.id}
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke={st.stroke}
      strokeWidth={st.strokeWidth}
      strokeLinecap="round"
      strokeDasharray={st.strokeDasharray}
      opacity={st.opacity ?? 1}
    />
  );
}

/**
 * 统一封装：布局（computeGraphLayout）+ SVG 边/节点槽位。节点外观由 renderNode 决定。
 */
export function KnowledgeGraphCanvas({
  nodes,
  edges,
  width,
  height,
  layoutOverrides,
  edgeStrokeMode = "neutral",
  renderEdge,
  onNodeClick,
  renderNode,
  className,
  style,
  svgClassName,
}: KnowledgeGraphCanvasProps) {
  const coords = useMemo(
    () =>
      computeGraphLayout(nodes, edges, {
        width,
        height,
        ...layoutOverrides,
      }),
    [nodes, edges, width, height, layoutOverrides],
  );

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={svgClassName ?? "w-full h-full block"}
      style={style}
    >
      <g className={className}>
        {edges.map((e) => {
          const a = coords.get(e.from);
          const b = coords.get(e.to);
          if (!a || !b) return null;
          if (renderEdge) return <g key={e.id}>{renderEdge(e, a, b)}</g>;
          return (
            <g key={e.id}>
              {defaultEdgeElement(e, a, b, edgeStrokeMode)}
            </g>
          );
        })}
        {nodes.map((n) => {
          const xy = coords.get(n.id);
          if (!xy) return null;
          return (
            <g
              key={n.id}
              onClick={onNodeClick ? () => onNodeClick(n) : undefined}
              style={{ cursor: onNodeClick ? "pointer" : undefined }}
            >
              {renderNode({ node: n, x: xy.x, y: xy.y })}
            </g>
          );
        })}
      </g>
    </svg>
  );
}
