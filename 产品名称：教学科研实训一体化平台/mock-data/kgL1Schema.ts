import type { L1Schema } from "./types";

/**
 * L1 Schema：机械工程专业产业培养图谱模板
 *
 * 教师/学院管理在开始建设 L1 图谱之前，先确认或微调此 Schema，
 * 再上传材料触发 AI 提炼，最后人工确认节点。
 */
export const l1SchemaMech: L1Schema = {
  id: "l1schema-mech-2026",
  professionId: "prof-mech",
  name: "机械工程专业·产业培养图谱 Schema（2026版）",
  source: "platform_template",
  status: "published",
  updatedAt: "2026-01-15T09:00:00+08:00",

  nodeTypes: [
    {
      code: "industry_demand",
      label: "产业需求",
      color: "#6366f1",
      canBeOnSpine: true,
    },
    {
      code: "job_competency",
      label: "岗位能力",
      color: "#8b5cf6",
      canBeOnSpine: true,
    },
    {
      code: "core_literacy",
      label: "核心素养",
      color: "#ec4899",
      canBeOnSpine: true,
    },
    {
      code: "ability",
      label: "能力",
      color: "#3b82f6",
      canBeOnSpine: true,
    },
    {
      code: "training_goal",
      label: "培养目标",
      color: "#10b981",
      canBeOnSpine: true,
    },
    {
      code: "course_standard",
      label: "课程标准",
      color: "#f59e0b",
      canBeOnSpine: true,
    },
  ],

  edgeTypes: [
    {
      code: "demand_drives_competency",
      label: "驱动",
      fromTypes: ["industry_demand"],
      toTypes: ["job_competency"],
      isSpineCandidate: true,
    },
    {
      code: "competency_requires_ability",
      label: "要求",
      fromTypes: ["job_competency"],
      toTypes: ["ability"],
      isSpineCandidate: true,
    },
    {
      code: "literacy_supports_ability",
      label: "支撑",
      fromTypes: ["core_literacy"],
      toTypes: ["ability"],
      isSpineCandidate: false,
    },
    {
      code: "goal_specifies_standard",
      label: "规定",
      fromTypes: ["training_goal"],
      toTypes: ["course_standard"],
      isSpineCandidate: true,
    },
    {
      code: "ability_achieves_goal",
      label: "达成",
      fromTypes: ["ability"],
      toTypes: ["training_goal"],
      isSpineCandidate: true,
    },
    {
      code: "standard_guides_ability",
      label: "引导",
      fromTypes: ["course_standard"],
      toTypes: ["ability"],
      isSpineCandidate: false,
    },
    {
      code: "demand_influences_literacy",
      label: "影响",
      fromTypes: ["industry_demand"],
      toTypes: ["core_literacy"],
      isSpineCandidate: false,
    },
    {
      code: "competency_influences_standard",
      label: "影响",
      fromTypes: ["job_competency"],
      toTypes: ["course_standard"],
      isSpineCandidate: false,
    },
  ],

  /** 演示阶段：图谱构建优先依据「产业案例」；培养方案/JD 等材料仍保留在数据中供节点溯源 */
  inputMaterialKinds: ["industry_case"],
};

export const l1Schemas: L1Schema[] = [l1SchemaMech];
