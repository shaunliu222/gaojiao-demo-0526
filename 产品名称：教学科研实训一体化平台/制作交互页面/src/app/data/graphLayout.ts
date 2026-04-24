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
  /** 大圆半径（簇中心偏离画布中心的距离） */
  macroRadius?: number;
  /** 每个簇里节点的小圆基础半径 */
  microRadius?: number;
  /** 每多一个节点，簇的小圆半径的增长量 */
  microRadiusGrow?: number;
}

/**
 * 计算图谱节点坐标。
 *
 * 布局规则：
 * 1. 按 cluster 分组
 * 2. 簇中心均匀分布在画布大圆上
 * 3. 簇内节点按类型排序（知识点 → 技能点 → 核心素养）再均匀分布在簇小圆上
 * 4. 若只有 1 个节点，直接落在簇中心
 */
export function computeGraphLayout(
  nodes: GraphNode[],
  _edges: GraphEdge[],
  opts: LayoutOptions,
): Map<string, NodeXY> {
  const result = new Map<string, NodeXY>();
  if (nodes.length === 0) return result;

  const {
    width,
    height,
    macroRadius = Math.min(width, height) * 0.32,
    microRadius = 55,
    microRadiusGrow = 6,
  } = opts;

  const cx = width / 2;
  const cy = height / 2;

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
    const clusterCx = cx + macroRadius * Math.cos(phase);
    const clusterCy = cy + macroRadius * Math.sin(phase);

    if (group.length === 1) {
      result.set(group[0].id, { x: clusterCx, y: clusterCy });
      return;
    }

    const r = microRadius + Math.max(0, group.length - 4) * microRadiusGrow;
    group.forEach((n, i) => {
      const a = (2 * Math.PI * i) / group.length - Math.PI / 2;
      result.set(n.id, {
        x: clusterCx + r * Math.cos(a),
        y: clusterCy + r * Math.sin(a),
      });
    });
  });

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
