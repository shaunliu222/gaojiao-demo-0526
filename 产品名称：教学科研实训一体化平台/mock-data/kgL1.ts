import type { L1Node, L1Edge, GraphNodeStatus } from "./types";

/**
 * 机械工程专业 L1 产业培养图谱数据
 *
 * 节点共 14 个：
 *   产业需求  3 个（l1-demand-*）
 *   岗位能力  3 个（l1-jc-*）
 *   核心素养  3 个（l1-lit-*，复用现有 core-mech-* 语义）
 *   能力      3 个（l1-ab-*，复用现有 sk-mech-* 语义）
 *   培养目标  1 个（l1-goal-001）
 *   课程标准  3 个（l1-std-*）
 *
 * 边共 20 条，其中 8 条 isSpine: true 串成主线。
 */

const PROF = "prof-mech";

function confirmed(): GraphNodeStatus {
  return "confirmed";
}

function aiDraft(): GraphNodeStatus {
  return "ai_draft";
}

// ---- 节点 ----

export const l1Nodes: L1Node[] = [
  // 产业需求
  {
    id: "l1-demand-001",
    professionId: PROF,
    schemaTypeCode: "industry_demand",
    name: "智能制造升级需求",
    description:
      "装备制造业向数字化、智能化转型，要求毕业生具备数字化工具使用与协同能力。",
    status: confirmed(),
    locked: true,
    sourceMaterialIds: ["kgmat-industry-report-2025"],
    onSpine: true,
    cluster: "产业需求",
  },
  {
    id: "l1-demand-002",
    professionId: PROF,
    schemaTypeCode: "industry_demand",
    name: "工程图纸规范表达需求",
    description:
      "机械行业对工程图纸的国标规范性要求持续存在，是基础岗位硬性前提。",
    status: confirmed(),
    locked: true,
    sourceMaterialIds: ["kgmat-industry-report-2025", "kgmat-jd-mech-design"],
    onSpine: false,
    cluster: "产业需求",
  },
  {
    id: "l1-demand-003",
    professionId: PROF,
    schemaTypeCode: "industry_demand",
    name: "跨学科协作与工程素质需求",
    description:
      "工程项目要求毕业生具备团队协作、安全意识与持续学习能力。",
    status: aiDraft(),
    locked: false,
    sourceMaterialIds: ["kgmat-talent-scheme-2023"],
    onSpine: false,
    cluster: "产业需求",
  },

  // 岗位能力
  {
    id: "l1-jc-001",
    professionId: PROF,
    schemaTypeCode: "job_competency",
    name: "机械图纸绘制与识读",
    description:
      "能按国标完成零件图、装配图的绘制与识读，包括二维与三维数字化形式。",
    status: confirmed(),
    locked: true,
    sourceMaterialIds: ["kgmat-jd-mech-design", "kgmat-jd-process-engineer"],
    onSpine: true,
    cluster: "岗位能力",
  },
  {
    id: "l1-jc-002",
    professionId: PROF,
    schemaTypeCode: "job_competency",
    name: "CAD/CAM 数字化工具应用",
    description:
      "能使用 AutoCAD、SolidWorks 等工具完成二维出图与三维建模，具备基本仿真意识。",
    status: confirmed(),
    locked: true,
    sourceMaterialIds: ["kgmat-jd-mech-design"],
    onSpine: true,
    cluster: "岗位能力",
  },
  {
    id: "l1-jc-003",
    professionId: PROF,
    schemaTypeCode: "job_competency",
    name: "工艺规程与质量控制",
    description:
      "能编制基本工艺规程，掌握公差配合、粗糙度与测量的基本方法。",
    status: confirmed(),
    locked: true,
    sourceMaterialIds: ["kgmat-jd-process-engineer"],
    onSpine: false,
    cluster: "岗位能力",
  },

  // 核心素养（复用 core-mech-* 语义）
  {
    id: "l1-lit-001",
    professionId: PROF,
    schemaTypeCode: "core_literacy",
    name: "工程系统思维",
    description:
      "能从产业链与工程约束出发理解机械制造任务，建立系统性分析视角。",
    status: confirmed(),
    locked: true,
    sourceMaterialIds: ["kgmat-talent-scheme-2023"],
    onSpine: false,
    cluster: "核心素养",
  },
  {
    id: "l1-lit-002",
    professionId: PROF,
    schemaTypeCode: "core_literacy",
    name: "工程规范与职业素养",
    description:
      "能按国标、公差与安全要求完成可追溯的工程表达，具备职业规范意识。",
    status: confirmed(),
    locked: true,
    sourceMaterialIds: ["kgmat-talent-scheme-2023"],
    onSpine: false,
    cluster: "核心素养",
  },
  {
    id: "l1-lit-003",
    professionId: PROF,
    schemaTypeCode: "core_literacy",
    name: "数字化协同意识",
    description:
      "能用 CAD/CAM、仿真与离线工具串联方案与图纸，适应数字化工作流。",
    status: confirmed(),
    locked: true,
    sourceMaterialIds: ["kgmat-industry-report-2025"],
    onSpine: true,
    cluster: "核心素养",
  },

  // 能力（复用 sk-mech-* 语义精简）
  {
    id: "l1-ab-001",
    professionId: PROF,
    schemaTypeCode: "ability",
    name: "工程图样表达能力",
    description:
      "能徒手草图与国标注解完成基础制图任务，并转化为规范数字化工程图。",
    status: confirmed(),
    locked: true,
    sourceMaterialIds: ["kgmat-talent-scheme-2023", "kgmat-jd-mech-design"],
    onSpine: true,
    cluster: "能力",
  },
  {
    id: "l1-ab-002",
    professionId: PROF,
    schemaTypeCode: "ability",
    name: "三维建模与数字化出图能力",
    description:
      "能建模—装配约束—工程图的一体化产出，具备 CAD/CAM 基本工作流。",
    status: confirmed(),
    locked: true,
    sourceMaterialIds: ["kgmat-jd-mech-design"],
    onSpine: true,
    cluster: "能力",
  },
  {
    id: "l1-ab-003",
    professionId: PROF,
    schemaTypeCode: "ability",
    name: "质量检测与工艺认知能力",
    description:
      "能选用公差配合与粗糙度，了解基本加工工艺与质量控制思路。",
    status: aiDraft(),
    locked: false,
    sourceMaterialIds: ["kgmat-talent-scheme-2023"],
    onSpine: false,
    cluster: "能力",
  },

  // 培养目标
  {
    id: "l1-goal-001",
    professionId: PROF,
    schemaTypeCode: "training_goal",
    name: "具备工程图样表达与数字化协同能力的制造业应用型人才",
    description:
      "立足机械产品从方案论证到批量交付的全流程，培养能在结构设计、工艺与数控加工等环节承担任务的本科毕业生。",
    status: confirmed(),
    locked: true,
    sourceMaterialIds: ["kgmat-talent-scheme-2023"],
    onSpine: true,
    cluster: "培养目标",
  },

  // 课程标准
  {
    id: "l1-std-001",
    professionId: PROF,
    schemaTypeCode: "course_standard",
    name: "工程图样表达课程标准",
    description:
      "规定工程制图与 CAD 课程的能力目标：学生能完成国标零件图与装配图的绘制与识读。",
    status: confirmed(),
    locked: true,
    sourceMaterialIds: ["kgmat-talent-scheme-2023"],
    onSpine: true,
    cluster: "课程标准",
  },
  {
    id: "l1-std-002",
    professionId: PROF,
    schemaTypeCode: "course_standard",
    name: "数字化建模课程标准",
    description:
      "规定三维建模与数字化出图课程的能力目标：学生能完成 SolidWorks 建模与工程图出图。",
    status: confirmed(),
    locked: true,
    sourceMaterialIds: ["kgmat-talent-scheme-2023", "kgmat-jd-mech-design"],
    onSpine: false,
    cluster: "课程标准",
  },
  {
    id: "l1-std-003",
    professionId: PROF,
    schemaTypeCode: "course_standard",
    name: "实训综合能力课程标准",
    description:
      "规定金工实习与测量实训的能力目标：学生能在真实设备上完成零件加工与检测流程。",
    status: aiDraft(),
    locked: false,
    sourceMaterialIds: ["kgmat-talent-scheme-2023"],
    onSpine: false,
    cluster: "课程标准",
  },
];

// ---- 边 ----

export const l1Edges: L1Edge[] = [
  // 主线（isSpine: true）
  { id: "l1e-001", professionId: PROF, schemaEdgeCode: "demand_drives_competency", from: "l1-demand-001", to: "l1-jc-001", relation: "驱动", isSpine: true },
  { id: "l1e-002", professionId: PROF, schemaEdgeCode: "demand_drives_competency", from: "l1-demand-001", to: "l1-jc-002", relation: "驱动", isSpine: true },
  { id: "l1e-003", professionId: PROF, schemaEdgeCode: "competency_requires_ability", from: "l1-jc-001", to: "l1-ab-001", relation: "要求", isSpine: true },
  { id: "l1e-004", professionId: PROF, schemaEdgeCode: "competency_requires_ability", from: "l1-jc-002", to: "l1-ab-002", relation: "要求", isSpine: true },
  { id: "l1e-005", professionId: PROF, schemaEdgeCode: "ability_achieves_goal", from: "l1-ab-001", to: "l1-goal-001", relation: "达成", isSpine: true },
  { id: "l1e-006", professionId: PROF, schemaEdgeCode: "ability_achieves_goal", from: "l1-ab-002", to: "l1-goal-001", relation: "达成", isSpine: false },
  { id: "l1e-007", professionId: PROF, schemaEdgeCode: "goal_specifies_standard", from: "l1-goal-001", to: "l1-std-001", relation: "规定", isSpine: true },
  { id: "l1e-008", professionId: PROF, schemaEdgeCode: "goal_specifies_standard", from: "l1-goal-001", to: "l1-std-002", relation: "规定", isSpine: true },

  // 非主线
  { id: "l1e-009", professionId: PROF, schemaEdgeCode: "demand_drives_competency", from: "l1-demand-002", to: "l1-jc-001", relation: "驱动", isSpine: false },
  { id: "l1e-010", professionId: PROF, schemaEdgeCode: "demand_drives_competency", from: "l1-demand-003", to: "l1-jc-003", relation: "驱动", isSpine: false },
  { id: "l1e-011", professionId: PROF, schemaEdgeCode: "competency_requires_ability", from: "l1-jc-003", to: "l1-ab-003", relation: "要求", isSpine: false },
  { id: "l1e-012", professionId: PROF, schemaEdgeCode: "ability_achieves_goal", from: "l1-ab-003", to: "l1-goal-001", relation: "达成", isSpine: false },
  { id: "l1e-013", professionId: PROF, schemaEdgeCode: "goal_specifies_standard", from: "l1-goal-001", to: "l1-std-003", relation: "规定", isSpine: false },
  { id: "l1e-014", professionId: PROF, schemaEdgeCode: "literacy_supports_ability", from: "l1-lit-001", to: "l1-ab-001", relation: "支撑", isSpine: false },
  { id: "l1e-015", professionId: PROF, schemaEdgeCode: "literacy_supports_ability", from: "l1-lit-002", to: "l1-ab-001", relation: "支撑", isSpine: false },
  { id: "l1e-016", professionId: PROF, schemaEdgeCode: "literacy_supports_ability", from: "l1-lit-003", to: "l1-ab-002", relation: "支撑", isSpine: false },
  { id: "l1e-017", professionId: PROF, schemaEdgeCode: "demand_influences_literacy", from: "l1-demand-001", to: "l1-lit-003", relation: "影响", isSpine: false },
  { id: "l1e-018", professionId: PROF, schemaEdgeCode: "demand_influences_literacy", from: "l1-demand-003", to: "l1-lit-001", relation: "影响", isSpine: false },
  { id: "l1e-019", professionId: PROF, schemaEdgeCode: "competency_influences_standard", from: "l1-jc-001", to: "l1-std-001", relation: "影响", isSpine: false },
  { id: "l1e-020", professionId: PROF, schemaEdgeCode: "competency_influences_standard", from: "l1-jc-002", to: "l1-std-002", relation: "影响", isSpine: false },
];

export const l1NodesByProfession: Record<string, L1Node[]> = {
  "prof-mech": l1Nodes,
};

export const l1EdgesByProfession: Record<string, L1Edge[]> = {
  "prof-mech": l1Edges,
};

export const l1NodeById: Record<string, L1Node> = Object.fromEntries(
  l1Nodes.map((n) => [n.id, n]),
);
