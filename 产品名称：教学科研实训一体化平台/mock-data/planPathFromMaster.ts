import { graphEdges, nodeById } from "./knowledgeGraph";
import type { PlanKnowledgePathGraph } from "./types";

function padKn(n: number): string {
  return `kn-mech-${String(n).padStart(3, "0")}`;
}

/**
 * 主线《机械制图与CAD》计划：素养 / 部分能力节点 / 制图核心课及实训 / 压缩后的全系知识点清单。
 */
export const PLAN_MAIN_NODE_IDS: readonly string[] = [
  "core-mech-001",
  "core-mech-002",
  "core-mech-003",
  "core-mech-004",
  "sk-mech-001",
  "sk-mech-002",
  "sk-mech-003",
  "sk-mech-005",
  "sk-mech-006",
  "sk-mech-009",
  "sk-mech-010",
  "course-mech-draw",
  "train-m-002",
  "train-m-003",
  "train-m-004",
  ...Array.from({ length: 18 }, (_, i) => padKn(i + 1)),
];

/**
 * 由全库节点 ID 列表构造教学计划「知识路径」：节点字段自 `nodeById` 拷贝，边为两端均在集合内的全库边。
 */
export function buildPlanKnowledgePathGraph(
  planId: string,
  caption: string,
  orderedNodeIds: readonly string[],
  focusNodeId?: string | null,
): PlanKnowledgePathGraph {
  const nodeSet = new Set(orderedNodeIds);
  const nodes = orderedNodeIds.map((id) => {
    const n = nodeById[id];
    if (!n) {
      throw new Error(
        `[planPathFromMaster] 计划 "${planId}" 引用了全库中不存在的节点 "${id}"`,
      );
    }
    return {
      id: n.id,
      name: n.name,
      nodeType: n.nodeType,
      layer: n.layer,
      kind: n.kind,
      status: n.status,
      cluster: n.cluster,
      description: n.description,
      focus: focusNodeId != null && focusNodeId === id,
    };
  });

  const edges: PlanKnowledgePathGraph["edges"] = [];
  const edgeKey = new Set<string>();
  for (const e of graphEdges) {
    if (!nodeSet.has(e.from) || !nodeSet.has(e.to)) continue;
    const k = `${e.from}\0${e.to}\0${e.relation}`;
    if (edgeKey.has(k)) continue;
    edgeKey.add(k);
    edges.push({
      id: e.id,
      from: e.from,
      to: e.to,
      relation: e.relation,
    });
  }

  return { planId, caption, nodes, edges };
}
