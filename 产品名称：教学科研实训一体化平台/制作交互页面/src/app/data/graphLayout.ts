/**
 * 图谱布局 & 颜色 辅助数据（纯 UI 辅助，不写回 @mock）。
 *
 * mock-data 的 GraphNode 没有 x / y，这里按「簇 → 环形」算出每个节点的画布坐标。
 * 若图中含「核心素养」节点：素养簇固定在画布中心小环，其余簇在外层椭圆上环绕；
 * 否则仍按原逻辑各簇均分在外椭圆上。
 * 同时把所有簇名映射到一份协调的颜色盘。
 */

import type { GraphNode, GraphEdge, TeachingPlan } from "@mock";

// ==========================================================================
// 1. 簇 → 颜色（机械工程 10 簇 + 技能 / 核心素养；另保留旧簇名映射以免历史数据报错）
// ==========================================================================

export const clusterColor: Record<string, string> = {
  // ---- 机械工程 11 簇 ----
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
  制造工艺: "#059669",
  工业机器人: "#0891b2",
  工程智能与AI: "#7c3aed",
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
// 2. 坐标布局：核心素养居中 + 外围簇大椭圆；或无素养时全簇大椭圆
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

const typeOrderCluster: Record<string, number> = {
  知识点: 0,
  技能点: 1,
  核心素养: 2,
};

function microRingRadiusForGroup(
  groupLength: number,
  microRadius: number,
  microRadiusGrow: number,
  minChord: number,
): number {
  if (groupLength <= 1) return 0;
  const chordMinR =
    groupLength >= 2
      ? (minChord / 2) / Math.sin(Math.PI / groupLength)
      : 0;
  let r = microRadius + Math.max(0, groupLength - 4) * microRadiusGrow;
  return Math.max(r, chordMinR);
}

/** 簇内小环排布，写入 result */
function placeGroupOnMicroRing(
  group: GraphNode[],
  clusterCx: number,
  clusterCy: number,
  result: Map<string, NodeXY>,
  microRadius: number,
  microRadiusGrow: number,
  minChord: number,
): void {
  const sorted = [...group].sort(
    (a, b) =>
      (typeOrderCluster[a.nodeType] ?? 9) -
      (typeOrderCluster[b.nodeType] ?? 9),
  );
  if (sorted.length === 1) {
    result.set(sorted[0]!.id, { x: clusterCx, y: clusterCy });
    return;
  }
  const r = microRingRadiusForGroup(
    sorted.length,
    microRadius,
    microRadiusGrow,
    minChord,
  );
  sorted.forEach((n, i) => {
    const a = (2 * Math.PI * i) / sorted.length - Math.PI / 2;
    result.set(n.id, {
      x: clusterCx + r * Math.cos(a),
      y: clusterCy + r * Math.sin(a),
    });
  });
}

function computeClusterEllipse(
  width: number,
  height: number,
  opts: LayoutOptions,
): {
  cx: number;
  cy: number;
  macroRadiusX: number;
  macroRadiusY: number;
  maxRx: number;
  maxRy: number;
} {
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
  return { cx, cy, macroRadiusX, macroRadiusY, maxRx, maxRy };
}

function placeAllClustersOnEllipse(
  nodes: GraphNode[],
  result: Map<string, NodeXY>,
  cx: number,
  cy: number,
  macroRadiusX: number,
  macroRadiusY: number,
  microRadius: number,
  microRadiusGrow: number,
  minChord: number,
): void {
  const clusters = new Map<string, GraphNode[]>();
  for (const n of nodes) {
    if (!clusters.has(n.cluster)) clusters.set(n.cluster, []);
    clusters.get(n.cluster)!.push(n);
  }
  const clusterNames = Array.from(clusters.keys());
  const clusterCount = clusterNames.length;

  clusterNames.forEach((clusterName, ci) => {
    const group = clusters.get(clusterName)!;
    const phase =
      clusterCount === 1 ? 0 : (2 * Math.PI * ci) / clusterCount - Math.PI / 2;
    const clusterCx = cx + macroRadiusX * Math.cos(phase);
    const clusterCy = cy + macroRadiusY * Math.sin(phase);
    placeGroupOnMicroRing(
      group,
      clusterCx,
      clusterCy,
      result,
      microRadius,
      microRadiusGrow,
      minChord,
    );
  });
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

  const { cx, cy, macroRadiusX: baseRx, macroRadiusY: baseRy, maxRx, maxRy } =
    computeClusterEllipse(width, height, opts);

  const coreNodes = nodes.filter((n) => n.nodeType === "核心素养");
  const peripheralNodes = nodes.filter((n) => n.nodeType !== "核心素养");

  if (coreNodes.length === 0) {
    placeAllClustersOnEllipse(
      nodes,
      result,
      cx,
      cy,
      baseRx,
      baseRy,
      microRadius,
      microRadiusGrow,
      minChord,
    );
  } else {
    placeGroupOnMicroRing(
      coreNodes,
      cx,
      cy,
      result,
      microRadius,
      microRadiusGrow,
      minChord,
    );

    const rHubRing = microRingRadiusForGroup(
      coreNodes.length,
      microRadius,
      microRadiusGrow,
      minChord,
    );
    const rHubExtent =
      coreNodes.length <= 1
        ? minChord * 0.38
        : rHubRing + minChord * 0.22;

    if (peripheralNodes.length > 0) {
      const pClusters = new Map<string, GraphNode[]>();
      for (const n of peripheralNodes) {
        if (!pClusters.has(n.cluster)) pClusters.set(n.cluster, []);
        pClusters.get(n.cluster)!.push(n);
      }
      let maxPeripheralRingR = 0;
      for (const g of pClusters.values()) {
        maxPeripheralRingR = Math.max(
          maxPeripheralRingR,
          microRingRadiusForGroup(
            g.length,
            microRadius,
            microRadiusGrow,
            minChord,
          ),
        );
      }

      const hubGap = Math.max(28, 0.06 * wmin);
      const floorMin = rHubExtent + hubGap + maxPeripheralRingR;

      let macroRadiusX = baseRx;
      let macroRadiusY = baseRy;
      const m0 = Math.min(macroRadiusX, macroRadiusY);
      if (m0 < floorMin) {
        const scale = floorMin / m0;
        macroRadiusX = Math.min(macroRadiusX * scale, maxRx * 0.992);
        macroRadiusY = Math.min(macroRadiusY * scale, maxRy * 0.992);
      }

      placeAllClustersOnEllipse(
        peripheralNodes,
        result,
        cx,
        cy,
        macroRadiusX,
        macroRadiusY,
        microRadius,
        microRadiusGrow,
        minChord,
      );
    }
  }

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
