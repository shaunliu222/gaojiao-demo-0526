/**
 * 图谱布局 & 颜色 辅助数据（纯 UI 辅助，不写回 @mock）。
 *
 * mock-data 的 GraphNode 没有 x / y，这里按"簇 → 环形"算出每个节点的画布坐标。
 * 同时把所有簇名映射到一份协调的颜色盘。
 */

import type { GraphNode, GraphEdge, TeachingPlan } from "@mock";

// ==========================================================================
// 1. 簇 → 颜色（覆盖机械 10 簇 / 法学 5 簇 / 护理 5 簇 + 技能 / 核心素养 通用）
// ==========================================================================

export const clusterColor: Record<string, string> = {
  // ---- 机械工程 10 簇 ----
  制图基础: "#94a3b8",
  几何作图: "#38bdf8",
  投影基础: "#60a5fa",
  点线面投影: "#818cf8",
  立体投影: "#6366f1",
  组合体: "#8b5cf6",
  机件表达: "#a855f7",
  标准件: "#ec4899",
  零件图装配图: "#f97316",
  CAD建模: "#14b8a6",
  // ---- 法学 5 簇 ----
  民法基础: "#3b82f6",
  民事主体: "#22c55e",
  法律行为: "#f59e0b",
  民事权利: "#ef4444",
  责任时效: "#0ea5e9",
  // ---- 护理学 5 簇 ----
  基础理论: "#64748b",
  生活护理: "#84cc16",
  感染控制: "#10b981",
  生命体征: "#06b6d4",
  给药注射: "#d946ef",
  // ---- 通用：技能点 / 核心素养 ----
  技能: "#22c55e",
  核心素养: "#f59e0b",
};

/** 兜底色（簇名未命中时） */
const FALLBACK_COLOR = "#94a3b8";

export const colorOfCluster = (cluster: string): string =>
  clusterColor[cluster] ?? FALLBACK_COLOR;

// ==========================================================================
// 2. 坐标布局：按 cluster 分组 → 每个簇一个小圆环 → 簇之间再放在大圆环上
// ==========================================================================

export interface NodeXY {
  x: number;
  y: number;
}

export interface LayoutOptions {
  width: number;
  height: number;
  /**
   * 大环基准半径。未传 macroRadiusX/Y 时，会按此值为基准，再按画布宽高比拉伸成椭圆
   * （宽画布 x 向更疏、y 更密；高画布则相反），避免簇挤在短边方向。
   */
  macroRadius?: number;
  /** 直接指定簇心椭圆两轴，与 macroRadius 互斥时优先用二者 */
  macroRadiusX?: number;
  macroRadiusY?: number;
  /** 每个簇里节点的小圆基础半径 */
  microRadius?: number;
  /** 每多一个节点，簇的小圆半径的增长量 */
  microRadiusGrow?: number;
  /**
   * 节点「中心点」之间允许的最小距离（像素，与当前 viewBox 同坐标系），
   * 用于簇内/簇间防重叠的分离迭代。默认随画布短边略缩放。
   */
  nodeMinCenterDistance?: number;
  /** 节点距画布内缘的最小边距，避免与裁切/描边/标签打架 */
  layoutEdgePadding?: number;
  /** 分离叠放的迭代轮数，图越大可适当增大 */
  layoutCollisionIterations?: number;
}

function clampPoint(
  p: NodeXY,
  width: number,
  height: number,
  left: number,
  right: number,
  top: number,
  bottom: number,
): void {
  p.x = Math.min(Math.max(p.x, left), width - right);
  p.y = Math.min(Math.max(p.y, top), height - bottom);
}

/**
 * 在初始坐标上做「圆盘排斥」式分离，尽量消除两两中心距小于 minD 的叠放，
 * 每轮后把点夹紧在可绘制矩形内。不改变节点id与顺序，原地修改 result。
 */
function applyNodeSeparation(
  nodes: GraphNode[],
  result: Map<string, NodeXY>,
  width: number,
  height: number,
  minCenterDist: number,
  padL: number,
  padR: number,
  padT: number,
  padB: number,
  iterations: number,
): void {
  if (nodes.length === 0) return;
  if (nodes.length === 1) {
    const p = result.get(nodes[0]!.id);
    if (p) clampPoint(p, width, height, padL, padR, padT, padB);
    return;
  }
  const ids = nodes.map((n) => n.id);
  for (let it = 0; it < iterations; it++) {
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = result.get(ids[i]!);
        const b = result.get(ids[j]!);
        if (!a || !b) continue;
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        const d = Math.hypot(dx, dy);
        if (d < 1e-4) {
          const jitter = 0.6 + (it % 5) * 0.12;
          a.x -= jitter;
          b.x += jitter;
          continue;
        }
        if (d < minCenterDist) {
          const push = (minCenterDist - d) * 0.48;
          dx = (dx / d) * push;
          dy = (dy / d) * push;
          a.x -= dx;
          a.y -= dy;
          b.x += dx;
          b.y += dy;
        }
      }
    }
    for (const id of ids) {
      const p = result.get(id);
      if (p) clampPoint(p, width, height, padL, padR, padT, padB);
    }
  }
}

/**
 * 计算图谱节点坐标。
 *
 * 布局规则：
 * 1. 按 cluster 分组
 * 2. 簇中心均匀分布在以画布中心为中心的椭圆上（随宽高比 x/y 半轴不同，让簇沿长边方向排开）
 * 3. 簇内节点按类型排序（知识点 → 技能点 → 核心素养）再均匀分布在簇小圆上
 * 4. 若只有 1 个节点，直接落在簇中心
 */
function computeClusterEllipse(
  width: number,
  height: number,
  opts: LayoutOptions,
): { cx: number; cy: number; macroRadiusX: number; macroRadiusY: number } {
  const cx = width / 2;
  const cy = height / 2;
  const maxMargin = Math.min(width, height) * 0.035;
  const maxRx = Math.max(24, width / 2 - maxMargin);
  const maxRy = Math.max(24, height / 2 - maxMargin);
  const aspectK = Math.sqrt(Math.max(0.25, width / height));
  const base = opts.macroRadius ?? Math.min(width, height) * 0.4;

  let macroRadiusX: number;
  let macroRadiusY: number;
  if (opts.macroRadiusX != null && opts.macroRadiusY != null) {
    macroRadiusX = opts.macroRadiusX;
    macroRadiusY = opts.macroRadiusY;
  } else {
    macroRadiusX = base * aspectK;
    macroRadiusY = base / aspectK;
  }
  macroRadiusX = Math.min(macroRadiusX, maxRx * 0.992);
  macroRadiusY = Math.min(macroRadiusY, maxRy * 0.992);
  return { cx, cy, macroRadiusX, macroRadiusY };
}

export function computeGraphLayout(
  nodes: GraphNode[],
  _edges: GraphEdge[],
  opts: LayoutOptions,
): Map<string, NodeXY> {
  const result = new Map<string, NodeXY>();
  if (nodes.length === 0) return result;

  const { width, height, microRadiusGrow = 6 } = opts;
  const wmin = Math.min(width, height);
  const defaultMicro = 50 * (wmin / 480);
  const microRadius =
    opts.microRadius ?? Math.max(44, Math.min(72, defaultMicro));
  const minChord =
    opts.nodeMinCenterDistance ??
    Math.max(50, 0.072 * wmin) /* 形+下方文字的安全间距 */;
  const padUniform = opts.layoutEdgePadding ?? Math.max(22, 0.04 * wmin);
  const padB = Math.max(padUniform, 30 /* 为节点下文字多留一截 */);
  const padL = padUniform;
  const padR = padUniform;
  const padT = padUniform;
  const collisionIters = opts.layoutCollisionIterations ?? 160;

  const { cx, cy, macroRadiusX, macroRadiusY } = computeClusterEllipse(
    width,
    height,
    opts,
  );

  const clusters = new Map<string, GraphNode[]>();
  for (const n of nodes) {
    if (!clusters.has(n.cluster)) clusters.set(n.cluster, []);
    clusters.get(n.cluster)!.push(n);
  }

  const clusterNames = Array.from(clusters.keys());
  const clusterCount = clusterNames.length;

  const typeOrder: Record<string, number> = { 知识点: 0, 技能点: 1, 核心素养: 2 };

  clusterNames.forEach((clusterName, ci) => {
    const group = clusters.get(clusterName)!;
    group.sort((a, b) => (typeOrder[a.nodeType] ?? 9) - (typeOrder[b.nodeType] ?? 9));

    const phase = clusterCount === 1 ? 0 : (2 * Math.PI * ci) / clusterCount - Math.PI / 2;
    const clusterCx = cx + macroRadiusX * Math.cos(phase);
    const clusterCy = cy + macroRadiusY * Math.sin(phase);

    if (group.length === 1) {
      result.set(group[0].id, { x: clusterCx, y: clusterCy });
      return;
    }

    const nIn = group.length;
    const chordMinR =
      nIn >= 2 ? (minChord / 2) / Math.sin(Math.PI / nIn) : 0;
    let r = microRadius + Math.max(0, group.length - 4) * microRadiusGrow;
    r = Math.max(r, chordMinR);
    group.forEach((n, i) => {
      const a = (2 * Math.PI * i) / group.length - Math.PI / 2;
      result.set(n.id, {
        x: clusterCx + r * Math.cos(a),
        y: clusterCy + r * Math.sin(a),
      });
    });
  });

  applyNodeSeparation(
    nodes,
    result,
    width,
    height,
    minChord,
    padL,
    padR,
    padT,
    padB,
    collisionIters,
  );

  return result;
}

// ==========================================================================
// 3. 从教学计划的某小节推导 focus 集合
// ==========================================================================

export function computeFocusNodes(
  plan: TeachingPlan | undefined,
  sectionId?: string,
): Set<string> {
  const out = new Set<string>();
  if (!plan) return out;
  if (sectionId) {
    for (const ch of plan.chapters) {
      for (const sec of ch.sections) {
        if (sec.id === sectionId) {
          sec.knowledgeNodeIds.forEach((id) => out.add(id));
          return out;
        }
      }
    }
  }
  for (const ch of plan.chapters) {
    for (const sec of ch.sections) {
      if (sec.hasDesign) sec.knowledgeNodeIds.forEach((id) => out.add(id));
    }
  }
  return out;
}
