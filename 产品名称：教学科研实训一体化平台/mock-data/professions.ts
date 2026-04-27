import type { Profession } from "./types";

/**
 * 专业数据：机械工程单一专业（全量 Demo 数据均围绕本专业展开）
 */
export const professions: Profession[] = [
  {
    id: "prof-mech",
    name: "机械工程",
    code: "0802",
    college: "机械工程学院",
    description:
      "面向智能制造、装备制造行业培养具备机械设计、制造、控制能力的高级应用型人才。",
    hasKnowledgeGraph: true,
    knowledgeGraphTrainingPlanDocumentId: "kg-tpdoc-mech-2023",
  },
];
