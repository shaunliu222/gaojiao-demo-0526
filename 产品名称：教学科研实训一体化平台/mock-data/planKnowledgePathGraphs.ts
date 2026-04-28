import type { PlanKnowledgePathGraph } from "./types";
import {
  buildPlanKnowledgePathGraph,
  PLAN_MAIN_NODE_IDS,
} from "./planPathFromMaster";

/**
 * 各教学计划「知识路径」：节点 ID 均来自 `knowledgeGraph`（专业全库唯一真源），
 * 边为全库边在计划节点集合上的诱导子图。
 */
export const planKnowledgePathGraphs: PlanKnowledgePathGraph[] = [
  buildPlanKnowledgePathGraph(
    "plan-main",
    "主线计划：从五项核心素养引出能力，再回到《机械制图与CAD》与大颗粒知识点；拓扑与图谱主图的 contain/guide 对齐。",
    PLAN_MAIN_NODE_IDS,
    "kn-mech-005",
  ),

  buildPlanKnowledgePathGraph(
    "plan-history",
    "上届制图班复盘路径：制图规范—投影推理—组合体—数字化出图的压缩叙事。",
    [
      "core-mech-002",
      "sk-mech-001",
      "sk-mech-005",
      "sk-mech-009",
      "kn-mech-001",
      "kn-mech-003",
      "kn-mech-005",
      "kn-mech-007",
      "kn-mech-010",
      "kn-mech-011",
      "course-mech-draw",
    ],
    "kn-mech-005",
  ),

  buildPlanKnowledgePathGraph(
    "plan-mech-intro",
    "大一导论：工程专业地图与学习任务意识。",
    [
      "core-mech-001",
      "sk-mech-009",
      "course-mech-intro",
      "kn-mech-018",
      "kn-mech-003",
      "kn-mech-001",
      "kn-mech-016",
      "kn-mech-017",
    ],
    "kn-mech-018",
  ),

  buildPlanKnowledgePathGraph(
    "plan-mech-tolerance",
    "互换性与检测：公差能力与零件图技术要求知识点落地。",
    [
      "core-mech-003",
      "sk-mech-006",
      "course-mech-tolerance",
      "train-m-006",
      "kn-mech-009",
      "kn-mech-008",
      "kn-mech-010",
    ],
    "kn-mech-009",
  ),

  buildPlanKnowledgePathGraph(
    "plan-mech-robotics",
    "工业机器人：工作站与孪生相关知识点的路径。",
    [
      "core-mech-004",
      "sk-mech-003",
      "sk-mech-012",
      "course-mech-robotics",
      "train-m-007",
      "kn-mech-014",
      "kn-mech-016",
      "kn-mech-012",
      "kn-mech-010",
      "core-mech-003",
    ],
    "kn-mech-014",
  ),

  buildPlanKnowledgePathGraph(
    "plan-wang-metalwork",
    "金工实习：工艺能力与制造主线。",
    [
      "core-mech-005",
      "core-mech-003",
      "sk-mech-011",
      "course-mech-practice",
      "train-m-008",
      "kn-mech-013",
      "kn-mech-009",
      "kn-mech-010",
    ],
    "kn-mech-013",
  ),
];

export function getPlanKnowledgePathGraph(
  planId: string,
): PlanKnowledgePathGraph | undefined {
  return planKnowledgePathGraphs.find((g) => g.planId === planId);
}
