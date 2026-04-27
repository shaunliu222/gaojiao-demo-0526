import { graphEdges, nodeById } from "./knowledgeGraph";
import type { PlanKnowledgePathGraph } from "./types";

function padKn(n: number): string {
  return `kn-mech-${String(n).padStart(3, "0")}`;
}

/**
 * 主线《机械制图与CAD》计划：全学期知识点 kn-mech-001～060 + 工程素养锚点。
 * 知识路径图中的节点 ID 与 `knowledgeGraph` 完全一致；边为全库边在该集合上的诱导子图。
 */
export const PLAN_MAIN_NODE_IDS: readonly string[] = [
  ...Array.from({ length: 60 }, (_, i) => padKn(i + 1)),
  "core-mech-001",
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
