import type { PlanKnowledgePathGraph } from "./types";
import {
  buildPlanKnowledgePathGraph,
  PLAN_MAIN_NODE_IDS,
} from "./planPathFromMaster";

/**
 * 各教学计划「知识路径」：节点 ID 均来自 `knowledgeGraph`（专业全库唯一真源），
 * 边为全库边在计划节点集合上的诱导子图（必要时已在全库中补边以保证叙事连通）。
 */
export const planKnowledgePathGraphs: PlanKnowledgePathGraph[] = [
  buildPlanKnowledgePathGraph(
    "plan-main",
    "主线计划覆盖 kn-mech-001～060 全序列，与学科知识引擎中机械工程图谱一致；本视图展示本学期涉及节点及其在全库中的先修/包含/相关/支撑关系。第3章组合体三视图（kn-mech-031）为本计划能力峰值节点。",
    PLAN_MAIN_NODE_IDS,
    "kn-mech-031",
  ),

  buildPlanKnowledgePathGraph(
    "plan-history",
    "上届制图班复盘路径：从规范与投影快速过渡到组合体大作业（kn-mech-031），再经机件表达到零件图、装配与数字化出图；节点与边均取自全库子图。",
    [
      "kn-mech-001",
      "kn-mech-004",
      "kn-mech-007",
      "kn-mech-010",
      "kn-mech-012",
      "kn-mech-014",
      "kn-mech-031",
      "kn-mech-039",
      "kn-mech-048",
      "kn-mech-052",
      "kn-mech-054",
      "core-mech-002",
      "core-mech-003",
    ],
    "kn-mech-031",
  ),

  buildPlanKnowledgePathGraph(
    "plan-mech-intro",
    "大一导论：工程素养进入制图与投影基础（至三视图对应规律），与全库节点一致；后续与 kn-mech-016 及组合体章节在学期上衔接。",
    [
      "core-mech-001",
      "kn-mech-001",
      "kn-mech-007",
      "kn-mech-012",
      "kn-mech-013",
      "kn-mech-014",
      "kn-mech-015",
      "core-mech-003",
    ],
    "kn-mech-012",
  ),

  buildPlanKnowledgePathGraph(
    "plan-mech-tolerance",
    "互换性与检测：零件图内容（kn-mech-048）下的公差、粗糙度与形位公差，贯通装配图与公差标注技能（sk-mech-006），与全库一致。",
    [
      "kn-mech-048",
      "kn-mech-049",
      "kn-mech-050",
      "kn-mech-051",
      "kn-mech-052",
      "kn-mech-053",
      "sk-mech-006",
      "core-mech-001",
    ],
    "kn-mech-050",
  ),

  buildPlanKnowledgePathGraph(
    "plan-mech-robotics",
    "工业机器人：工作站与安全（kn-mech-063）、示教与搬运入门（kn-mech-064），与 SolidWorks 建模、装配图表达及创新素养在全库中的边关系一致。",
    [
      "kn-mech-063",
      "kn-mech-064",
      "kn-mech-058",
      "kn-mech-059",
      "kn-mech-060",
      "kn-mech-052",
      "core-mech-003",
      "core-mech-004",
    ],
    "kn-mech-064",
  ),

  buildPlanKnowledgePathGraph(
    "plan-wang-metalwork",
    "金工实习：规范意识（core-mech-003）— 零件图读图与公差粗糙度（kn-mech-048～050）— 读图技能与检测技能 — 车削/铣削（kn-mech-061/062）；与《机械制造基础》及全库制造工艺簇一致。",
    [
      "core-mech-003",
      "kn-mech-048",
      "kn-mech-049",
      "kn-mech-050",
      "sk-mech-005",
      "sk-mech-006",
      "kn-mech-061",
      "kn-mech-062",
    ],
    "kn-mech-049",
  ),
];

export function getPlanKnowledgePathGraph(
  planId: string,
): PlanKnowledgePathGraph | undefined {
  return planKnowledgePathGraphs.find((g) => g.planId === planId);
}
