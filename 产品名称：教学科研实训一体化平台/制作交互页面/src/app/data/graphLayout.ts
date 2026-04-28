/**
 * 图谱布局 & 颜色 辅助数据（纯 UI 辅助，不写回 @mock）。
 *
 * mock-data 的 GraphNode 没有 x / y，这里按「簇 → 环形」算出每个节点的画布坐标。
 * 若图中含「核心素养」节点：素养簇固定在画布中心小环，其余簇在外层椭圆上环绕；
 * 否则仍按原逻辑各簇均分在外椭圆上。
 * 有 layer 且存在 `contain` 边：按「核心素养居中 → 能力 → 知识点 → 课程/实训」四层同心椭圆，
 *   通过「子孙权重扇区」自顶向下继承角度，保证后代与其祖先角度方向一致；
 * 否则且含 layer 时用同心环；无 layer 时仍按簇椭圆（或旧「核心素养居中 + 外围簇」）。
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
  工程表达能力: "#2563eb",
  结构分析能力: "#7c3aed",
  数字化表达能力: "#0f766e",
  实践测绘能力: "#16a34a",
  质量检测能力: "#ea580c",
  制造实践能力: "#059669",
  智能工具能力: "#9333ea",
  智能制造能力: "#0284c7",
  课程: "#475569",
  实训: "#10b981",
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

export type GraphVisualLayer = "core" | "ability" | "knowledge" | "course" | "training";

export const graphVisualLayerOrder: GraphVisualLayer[] = [
  "core",
  "ability",
  "knowledge",
  "course",
  "training",
];

export const graphVisualLayerLabel: Record<GraphVisualLayer, string> = {
  core: "素养",
  ability: "能力",
  knowledge: "知识点",
  course: "课程",
  training: "实训",
};

export const graphVisualLayerColor: Record<GraphVisualLayer, string> = {
  core: "#f59e0b",
  ability: "#6366f1",
  knowledge: "#0ea5e9",
  course: "#475569",
  training: "#10b981",
};

export function visualLayerOfNode(node: GraphNode): GraphVisualLayer {
  if (node.layer === "courseOrTraining") {
    return node.kind === "training" || node.nodeType === "实训" ? "training" : "course";
  }
  return node.layer;
}

export function colorOfGraphNodeLayer(node: GraphNode): string {
  return graphVisualLayerColor[visualLayerOfNode(node)];
}

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

function clampAllPoints(
  nodes: GraphNode[],
  result: Map<string, NodeXY>,
  width: number,
  height: number,
  padL: number,
  padR: number,
  padT: number,
  padB: number,
): void {
  for (const n of nodes) {
    const p = result.get(n.id);
    if (p) clampPoint(p, width, height, padL, padR, padT, padB);
  }
}

const typeOrderCluster: Record<string, number> = {
  核心素养: 0,
  能力: 1,
  知识点: 2,
  课程: 3,
  实训: 4,
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

/**
 * 带 layer 且含 `contain` 边时：按 4 层同心椭圆布局
 *   - 中心：核心素养 core（单个放正中心；多个放中央小环）
 *   - 第 1 圈：能力 ability
 *   - 第 2 圈：知识点 knowledge
 *   - 第 3 圈（最外）：课程/实训 course / training
 *
 * 角度继承（子孙权重扇区）：每个父节点先得到自己的 arc（扇区），再把自己的 arc
 * 按「子孙节点总数」加权切分给子节点。这保证：
 *   - 同一核心素养旗下的全部后代都集中在同一扇形方向
 *   - 子节点严格挂在父节点角度附近，互相不跨越
 *
 * 半径自适应：计算每层相邻节点的最小角度间距，选取可容纳 minChord 弦距的半径；
 * 若总半径超过画布椭圆，按比例压缩所有层。
 *
 * 不满足前提（无核心素养或无 contain 边）时返回 false，调用方退回 `placeLayerModelRadial`。
 */
function placeLayerHierarchicalRings(
  nodes: GraphNode[],
  edges: GraphEdge[],
  result: Map<string, NodeXY>,
  cx: number,
  cy: number,
  maxRx: number,
  maxRy: number,
  minChord: number,
): boolean {
  const idSet = new Set(nodes.map((n) => n.id));
  const byId = new Map(nodes.map((n) => [n.id, n] as const));
  const layerOf = (id: string) => visualLayerOfNode(byId.get(id)!);

  // ---------- 1. 父子关系构建 ----------
  // contain: core→ability, ability→knowledge（child=e.to, parent=e.from）
  // Map to:  courseOrTraining→knowledge（ct=e.from, kn=e.to）
  // guide:   ability→courseOrTraining（ct=e.to, ability=e.from），作为无 Map to 时的回退
  const containParents = new Map<string, string[]>();
  const mapToTargets = new Map<string, string[]>();
  const guideParents = new Map<string, string[]>();
  for (const e of edges) {
    if (!idSet.has(e.from) || !idSet.has(e.to)) continue;
    if (e.relation === "contain") {
      if (!containParents.has(e.to)) containParents.set(e.to, []);
      containParents.get(e.to)!.push(e.from);
    } else if (e.relation === "Map to") {
      if (!mapToTargets.has(e.from)) mapToTargets.set(e.from, []);
      mapToTargets.get(e.from)!.push(e.to);
    } else if (e.relation === "guide") {
      if (!guideParents.has(e.to)) guideParents.set(e.to, []);
      guideParents.get(e.to)!.push(e.from);
    }
  }

  const coreNodes = nodes
    .filter((n) => visualLayerOfNode(n) === "core")
    .sort((a, b) => a.id.localeCompare(b.id));
  const abilityNodes = nodes
    .filter((n) => visualLayerOfNode(n) === "ability")
    .sort((a, b) => a.id.localeCompare(b.id));
  const knowledgeNodes = nodes
    .filter((n) => visualLayerOfNode(n) === "knowledge")
    .sort((a, b) => a.id.localeCompare(b.id));
  const ctNodes = nodes
    .filter((n) => {
      const v = visualLayerOfNode(n);
      return v === "course" || v === "training";
    })
    .sort((a, b) => a.id.localeCompare(b.id));

  if (coreNodes.length === 0) return false;
  const hasContain = edges.some(
    (e) => e.relation === "contain" && idSet.has(e.from) && idSet.has(e.to),
  );
  if (!hasContain) return false;

  // ---------- 2. 为每个节点选一个「主父」（对多父节点做稳定归并） ----------
  const pickMainParent = (
    candidates: string[] | undefined,
    parentLayer: GraphVisualLayer,
  ): string | null => {
    if (!candidates || candidates.length === 0) return null;
    const filtered = candidates.filter((p) => layerOf(p) === parentLayer);
    if (filtered.length === 0) return null;
    return [...filtered].sort()[0]!;
  };

  const abilityToCore = new Map<string, string>();
  for (const a of abilityNodes) {
    const p = pickMainParent(containParents.get(a.id), "core");
    if (p) abilityToCore.set(a.id, p);
  }

  const knowledgeToAbility = new Map<string, string>();
  for (const k of knowledgeNodes) {
    const p = pickMainParent(containParents.get(k.id), "ability");
    if (p) knowledgeToAbility.set(k.id, p);
  }

  const ctToKnowledge = new Map<string, string>();
  const ctToAbilityDirect = new Map<string, string>();
  for (const c of ctNodes) {
    const kn = pickMainParent(mapToTargets.get(c.id), "knowledge");
    if (kn) {
      ctToKnowledge.set(c.id, kn);
      continue;
    }
    const ab = pickMainParent(guideParents.get(c.id), "ability");
    if (ab) ctToAbilityDirect.set(c.id, ab);
  }

  // ---------- 3. 反向：父 → 子列表 ----------
  const abilitiesByCore = new Map<string, string[]>();
  for (const [child, parent] of abilityToCore) {
    if (!abilitiesByCore.has(parent)) abilitiesByCore.set(parent, []);
    abilitiesByCore.get(parent)!.push(child);
  }
  const knowledgeByAbility = new Map<string, string[]>();
  for (const [child, parent] of knowledgeToAbility) {
    if (!knowledgeByAbility.has(parent)) knowledgeByAbility.set(parent, []);
    knowledgeByAbility.get(parent)!.push(child);
  }
  const ctsByKnowledge = new Map<string, string[]>();
  for (const [child, parent] of ctToKnowledge) {
    if (!ctsByKnowledge.has(parent)) ctsByKnowledge.set(parent, []);
    ctsByKnowledge.get(parent)!.push(child);
  }
  const directCtsByAbility = new Map<string, string[]>();
  for (const [child, parent] of ctToAbilityDirect) {
    if (!directCtsByAbility.has(parent)) directCtsByAbility.set(parent, []);
    directCtsByAbility.get(parent)!.push(child);
  }

  // ---------- 4. 自下而上计算「子孙权重」（叶子=1） ----------
  const weight = new Map<string, number>();
  for (const c of ctNodes) weight.set(c.id, 1);
  for (const k of knowledgeNodes) {
    const kids = ctsByKnowledge.get(k.id) ?? [];
    const w = kids.reduce((s, id) => s + (weight.get(id) ?? 1), 0);
    weight.set(k.id, Math.max(1, w));
  }
  for (const a of abilityNodes) {
    const kn = knowledgeByAbility.get(a.id) ?? [];
    const dct = directCtsByAbility.get(a.id) ?? [];
    const w = [...kn, ...dct].reduce((s, id) => s + (weight.get(id) ?? 1), 0);
    weight.set(a.id, Math.max(1, w));
  }
  for (const c of coreNodes) {
    const kids = abilitiesByCore.get(c.id) ?? [];
    const w = kids.reduce((s, id) => s + (weight.get(id) ?? 1), 0);
    weight.set(c.id, Math.max(1, w));
  }

  // ---------- 5. 自顶向下分配扇区（arc：{center, width}） ----------
  interface Arc {
    center: number;
    width: number;
  }
  const arcs = new Map<string, Arc>();

  const splitArc = (parentArc: Arc, children: string[]): void => {
    if (children.length === 0) return;
    const sorted = [...children].sort((a, b) => a.localeCompare(b));
    const total = Math.max(
      1,
      sorted.reduce((s, id) => s + (weight.get(id) ?? 1), 0),
    );
    let cumul = 0;
    const start = parentArc.center - parentArc.width / 2;
    for (const id of sorted) {
      const w = weight.get(id) ?? 1;
      const width = (parentArc.width * w) / total;
      arcs.set(id, { center: start + cumul + width / 2, width });
      cumul += width;
    }
  };

  // core：整圈 2π，起点顶部 -π/2
  {
    const totalW = Math.max(
      1,
      coreNodes.reduce((s, c) => s + (weight.get(c.id) ?? 1), 0),
    );
    let cumul = 0;
    const start = -Math.PI / 2;
    for (const c of coreNodes) {
      const w = weight.get(c.id) ?? 1;
      const width = (2 * Math.PI * w) / totalW;
      arcs.set(c.id, { center: start + cumul + width / 2, width });
      cumul += width;
    }
  }

  for (const c of coreNodes) {
    const pArc = arcs.get(c.id);
    if (!pArc) continue;
    splitArc(pArc, abilitiesByCore.get(c.id) ?? []);
  }

  // 能力扇区同时分给它名下的知识点 和 直接挂靠的课程/实训（无 Map to 到 knowledge 的 ct）
  for (const a of abilityNodes) {
    const pArc = arcs.get(a.id);
    if (!pArc) continue;
    const kids = [
      ...(knowledgeByAbility.get(a.id) ?? []),
      ...(directCtsByAbility.get(a.id) ?? []),
    ];
    splitArc(pArc, kids);
  }

  for (const k of knowledgeNodes) {
    const pArc = arcs.get(k.id);
    if (!pArc) continue;
    splitArc(pArc, ctsByKnowledge.get(k.id) ?? []);
  }

  // ---------- 6. 计算每层半径 ----------
  const minArcGap = (ids: string[]): number => {
    const centers: number[] = [];
    for (const id of ids) {
      const a = arcs.get(id);
      if (a) centers.push(a.center);
    }
    if (centers.length <= 1) return Math.PI * 2;
    const sorted = [...centers].sort((a, b) => a - b);
    let g = Math.PI * 2;
    for (let i = 0; i < sorted.length; i++) {
      const c1 = sorted[i]!;
      const c2 =
        i < sorted.length - 1 ? sorted[i + 1]! : sorted[0]! + 2 * Math.PI;
      g = Math.min(g, c2 - c1);
    }
    return g;
  };

  // 等效圆半径（按椭圆几何均值作近似）：保证相邻角度 gap 下弦距 ≥ minChord
  const radiusForGap = (gap: number): number => {
    if (gap < 1e-6 || gap >= 2 * Math.PI) return 0;
    return minChord / 2 / Math.sin(gap / 2);
  };

  const ids = (ns: GraphNode[]) => ns.map((n) => n.id);
  const rEqCore = coreNodes.length <= 1
    ? 0
    : Math.max(radiusForGap(minArcGap(ids(coreNodes))), minChord * 0.45);
  const rEq1 = radiusForGap(minArcGap(ids(abilityNodes)));
  const rEq2 = radiusForGap(minArcGap(ids(knowledgeNodes)));
  const rEq3 = radiusForGap(minArcGap(ids(ctNodes)));

  const ringGap = minChord * 1.05;

  let r1 = Math.max(rEq1, rEqCore + ringGap);
  let r2 = Math.max(rEq2, r1 + ringGap);
  let r3 = Math.max(rEq3, r2 + ringGap);

  // 画布椭圆的等效半径（几何均值）
  const eqScale = Math.sqrt(Math.max(1, maxRx) * Math.max(1, maxRy));

  // 实际最外层：若只显示部分层，忽略空层用于缩放判定
  const effectiveOuter =
    ctNodes.length > 0
      ? r3
      : knowledgeNodes.length > 0
        ? r2
        : abilityNodes.length > 0
          ? r1
          : rEqCore;

  let rCore = rEqCore;
  if (effectiveOuter > eqScale) {
    const scale = eqScale / effectiveOuter;
    r1 *= scale;
    r2 *= scale;
    r3 *= scale;
    rCore *= scale;
  } else if (effectiveOuter > 0 && effectiveOuter < eqScale * 0.95) {
    // 太靠内则按比例拉伸到最外层贴近画布
    const scale = (eqScale * 0.98) / effectiveOuter;
    r1 *= scale;
    r2 *= scale;
    r3 *= scale;
    rCore *= scale;
    if (r1 - rCore < ringGap) r1 = rCore + ringGap;
    if (r2 - r1 < ringGap) r2 = r1 + ringGap;
    if (r3 - r2 < ringGap) r3 = r2 + ringGap;
  }

  // 椭圆系数：每层半径按 (rx = maxRx * t, ry = maxRy * t)，其中 t = r_eq / eqScale
  const tCore = eqScale > 0 ? rCore / eqScale : 0;
  const t1 = eqScale > 0 ? Math.min(1, r1 / eqScale) : 0.33;
  const t2 = eqScale > 0 ? Math.min(1, r2 / eqScale) : 0.66;
  const t3 = eqScale > 0 ? Math.min(1, r3 / eqScale) : 1;

  // ---------- 7. 放置节点 ----------
  const placeAt = (id: string, t: number): boolean => {
    const a = arcs.get(id);
    if (!a) return false;
    if (t <= 1e-6) {
      result.set(id, { x: cx, y: cy });
      return true;
    }
    result.set(id, {
      x: cx + maxRx * t * Math.cos(a.center),
      y: cy + maxRy * t * Math.sin(a.center),
    });
    return true;
  };

  if (coreNodes.length === 1) {
    result.set(coreNodes[0]!.id, { x: cx, y: cy });
  } else {
    for (const c of coreNodes) placeAt(c.id, tCore);
  }
  for (const a of abilityNodes) placeAt(a.id, t1);
  for (const k of knowledgeNodes) placeAt(k.id, t2);
  for (const c of ctNodes) placeAt(c.id, t3);

  // ---------- 8. 孤儿节点（无主父）按层环均分 ----------
  const placeOrphansOnRing = (layerNodes: GraphNode[], t: number): void => {
    const orphans = layerNodes.filter((n) => !result.has(n.id));
    if (orphans.length === 0) return;
    orphans.sort((a, b) => a.id.localeCompare(b.id));
    orphans.forEach((n, idx) => {
      const th = -Math.PI / 2 + (2 * Math.PI * idx) / orphans.length;
      result.set(n.id, {
        x: cx + maxRx * t * Math.cos(th),
        y: cy + maxRy * t * Math.sin(th),
      });
    });
  };
  placeOrphansOnRing(abilityNodes, t1);
  placeOrphansOnRing(knowledgeNodes, t2);
  placeOrphansOnRing(ctNodes, t3);
  for (const c of coreNodes) {
    if (!result.has(c.id)) result.set(c.id, { x: cx, y: cy });
  }

  return true;
}

/** 带 layer 的图谱：同心环自中心向外为 素养→能力→知识点→课程→实训（无 contain 结构时的回退） */
function placeLayerModelRadial(
  nodes: GraphNode[],
  result: Map<string, NodeXY>,
  cx: number,
  cy: number,
  maxR: number,
): void {
  graphVisualLayerOrder.forEach((layerKey, layerIndex) => {
    const layerNodes = nodes
      .filter((n) => visualLayerOfNode(n) === layerKey)
      .sort(
        (a, b) =>
          a.cluster.localeCompare(b.cluster, "zh-Hans-CN") ||
          a.name.localeCompare(b.name, "zh-Hans-CN"),
      );
    if (layerNodes.length === 0) return;

    const t = layerIndex / Math.max(1, graphVisualLayerOrder.length - 1);
    const ringR = Math.max(12, maxR * (0.08 + t * 0.84));

    if (layerKey === "core" && layerNodes.length === 1) {
      result.set(layerNodes[0]!.id, { x: cx, y: cy });
      return;
    }

    const nNodes = layerNodes.length;
    layerNodes.forEach((node, idx) => {
      const theta =
        nNodes === 1 ? -Math.PI / 2 : (2 * Math.PI * idx) / nNodes - Math.PI / 2;
      result.set(node.id, {
        x: cx + ringR * Math.cos(theta),
        y: cy + ringR * Math.sin(theta),
      });
    });
  });
}

export function computeGraphLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
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

  const hasLayerModel = nodes.some((n) => n.layer != null);
  if (hasLayerModel) {
    const cx = width / 2;
    const cy = height / 2;
    // 为下方标签预留 20px，避免最外环节点的标签被画布裁切
    const maxRy = Math.max(56, cy - Math.max(padT, padB) - 20);
    const maxRx = Math.max(56, cx - Math.max(padL, padR));

    const usedRings = placeLayerHierarchicalRings(
      nodes,
      edges,
      result,
      cx,
      cy,
      maxRx,
      maxRy,
      minChord,
    );
    if (!usedRings) {
      placeLayerModelRadial(nodes, result, cx, cy, Math.min(maxRx, maxRy));
    }

    // layer 图谱必须优先保持「素养 → 能力 → 知识点」父子扇区关系；
    // 全局排斥会把已经排好的分层推散，只做边界夹紧。
    clampAllPoints(
      nodes,
      result,
      width,
      height,
      padL,
      padR,
      padT,
      padB,
    );
    return result;
  }

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
