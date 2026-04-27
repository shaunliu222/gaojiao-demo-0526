import { useMemo, type ReactNode } from "react";
import type { GraphEdge, GraphNode } from "@mock";
import {
  computeGraphLayout,
  type LayoutOptions,
  type NodeXY,
} from "../../data/graphLayout";
import { edgeStrokeByRelation, NEUTRAL_EDGE, type EdgeStroke } from "./edgeStyles";

/** 选中节点及其无向 1 跳邻居（含自身） */
export function neighborIdsForFocus(
  focusId: string | null | undefined,
  edges: GraphEdge[],
): Set<string> | null {
  if (!focusId) return null;
  const s = new Set<string>([focusId]);
  for (const e of edges) {
    if (e.from === focusId) s.add(e.to);
    if (e.to === focusId) s.add(e.from);
  }
  return s;
}

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
  /**
   * 选中节点 id：对该节点及其直接相连的边做视图放大，其余边与节点淡化。
   * 传 null/undefined 时不做聚焦。
   */
  focusNodeId?: string | null;
  className?: string;
  style?: React.CSSProperties;
  svgClassName?: string;
};

function defaultEdgeElement(
  e: GraphEdge,
  from: NodeXY,
  to: NodeXY,
  mode: "neutral" | "byRelation",
  opacityMul = 1,
): ReactNode {
  const st: EdgeStroke =
    mode === "byRelation" ? edgeStrokeByRelation(e) : NEUTRAL_EDGE;
  const baseOp = st.opacity ?? 1;
  return (
    <line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke={st.stroke}
      strokeWidth={st.strokeWidth}
      strokeLinecap="round"
      strokeDasharray={st.strokeDasharray}
      opacity={baseOp * opacityMul}
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
  focusNodeId = null,
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

  const neighborSet = useMemo(
    () => neighborIdsForFocus(focusNodeId, edges),
    [focusNodeId, edges],
  );

  const focusTransform = useMemo(() => {
    if (!neighborSet || neighborSet.size === 0 || !focusNodeId) return null;
    const pts: NodeXY[] = [];
    for (const n of nodes) {
      if (!neighborSet.has(n.id)) continue;
      const p = coords.get(n.id);
      if (p) pts.push(p);
    }
    if (pts.length === 0) return null;
    let minX = pts[0]!.x;
    let maxX = pts[0]!.x;
    let minY = pts[0]!.y;
    let maxY = pts[0]!.y;
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i]!;
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    }
    const bw = Math.max(maxX - minX, 120);
    const bh = Math.max(maxY - minY, 120);
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;
    const pad = Math.max(56, 0.14 * (bw + bh));
    const fit = Math.min(width / (bw + 2 * pad), height / (bh + 2 * pad));
    const scale = Math.min(Math.max(fit, 1), 2.75);
    return { midX, midY, scale };
  }, [neighborSet, focusNodeId, nodes, coords, width, height]);

  const gTransform =
    focusTransform != null
      ? `translate(${width / 2} ${height / 2}) scale(${focusTransform.scale}) translate(${-focusTransform.midX} ${-focusTransform.midY})`
      : undefined;

  const edgeDim = 0.12;
  const nodeDim = 0.24;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={svgClassName ?? "w-full h-full block"}
      style={style}
    >
      <g className={className} transform={gTransform}>
        {edges.map((e) => {
          const a = coords.get(e.from);
          const b = coords.get(e.to);
          if (!a || !b) return null;
          const inFocus =
            !neighborSet ||
            (neighborSet.has(e.from) && neighborSet.has(e.to));
          const eOp = inFocus ? 1 : edgeDim;
          if (renderEdge) {
            return (
              <g key={e.id} opacity={eOp}>
                {renderEdge(e, a, b)}
              </g>
            );
          }
          return (
            <g key={e.id}>
              {defaultEdgeElement(e, a, b, edgeStrokeMode, eOp)}
            </g>
          );
        })}
        {nodes.map((n) => {
          const xy = coords.get(n.id);
          if (!xy) return null;
          const inFocus = !neighborSet || neighborSet.has(n.id);
          const nOp = inFocus ? 1 : nodeDim;
          return (
            <g
              key={n.id}
              opacity={nOp}
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
