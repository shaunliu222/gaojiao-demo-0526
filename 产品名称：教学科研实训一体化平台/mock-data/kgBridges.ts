import type { L1ToL2Bridge, L2ToL3Bridge } from "./types";

/**
 * 层间桥（集合包裹关系）
 *
 * L1ToL2Bridge  7 条：L1 的能力/课程标准 ⊃ 一组 L2 标准课程计划
 * L2ToL3Bridge 28 条：
 *   焦点小节（l2sec-draw-3-2 等 7 个小节）按 section 粒度
 *   其余课程计划按 plan 粒度
 */

const PROF = "prof-mech";

// ============================================================
// L1 → L2 桥（能力/课程标准 包含 一组标准课程计划）
// ============================================================
export const l1ToL2Bridges: L1ToL2Bridge[] = [
  {
    id: "l1l2b-001",
    professionId: PROF,
    l1NodeId: "l1-ab-001",
    l2PlanIds: ["l2-plan-mech-draw", "l2-plan-mech-design"],
    note: "工程图样表达能力主要由制图与CAD、机械设计基础两门课承载",
  },
  {
    id: "l1l2b-002",
    professionId: PROF,
    l1NodeId: "l1-ab-002",
    l2PlanIds: ["l2-plan-mech-draw"],
    note: "三维建模与数字化出图能力由制图与CAD课第7章 SolidWorks 单元承载",
  },
  {
    id: "l1l2b-003",
    professionId: PROF,
    l1NodeId: "l1-ab-003",
    l2PlanIds: ["l2-plan-mech-tolerance", "l2-plan-mech-practice"],
    note: "质量检测与工艺认知能力由互换性与技术测量、金工实习共同承载",
  },
  {
    id: "l1l2b-004",
    professionId: PROF,
    l1NodeId: "l1-std-001",
    l2PlanIds: ["l2-plan-mech-draw"],
    note: "工程图样表达课程标准直接映射到制图与CAD标准课程计划",
  },
  {
    id: "l1l2b-005",
    professionId: PROF,
    l1NodeId: "l1-std-002",
    l2PlanIds: ["l2-plan-mech-draw"],
    note: "数字化建模课程标准通过制图与CAD中的 SolidWorks 单元落地",
  },
  {
    id: "l1l2b-006",
    professionId: PROF,
    l1NodeId: "l1-std-003",
    l2PlanIds: ["l2-plan-mech-practice", "l2-plan-mech-tolerance"],
    note: "实训综合能力课程标准由金工实习与互换性测量两门实践课承载",
  },
  {
    id: "l1l2b-007",
    professionId: PROF,
    l1NodeId: "l1-jc-002",
    l2PlanIds: ["l2-plan-mech-robotics"],
    note: "CAD/CAM 数字化工具应用岗位能力通过工业机器人技术基础课拓展",
  },
];

// ============================================================
// L2 → L3 桥（课程计划 / 小节 包含 一组 L3 节点）
// ============================================================
export const l2ToL3Bridges: L2ToL3Bridge[] = [
  // -------- 焦点小节（section 粒度，优先覆盖主线演示节点） --------
  {
    id: "l2l3b-s-3-1",
    professionId: PROF,
    container: { kind: "section", l2PlanId: "l2-plan-mech-draw", sectionId: "l2sec-draw-3-1" },
    l3NodeIds: ["l3-kn-004", "l3-kn-005"],
    note: "3.1 立体与回转体投影覆盖线面投影与组合体分析两个知识点",
  },
  {
    id: "l2l3b-s-3-2",
    professionId: PROF,
    container: { kind: "section", l2PlanId: "l2-plan-mech-draw", sectionId: "l2sec-draw-3-2" },
    l3NodeIds: ["l3-kn-005", "l3-sk-001"],
    note: "3.2 组合体三视图绘制（焦点小节）：知识点 + 技能点",
  },
  {
    id: "l2l3b-s-3-4",
    professionId: PROF,
    container: { kind: "section", l2PlanId: "l2-plan-mech-draw", sectionId: "l2sec-draw-3-4" },
    l3NodeIds: ["l3-kn-006"],
    note: "3.4 截交线与相贯线专题对应集中难点知识点",
  },
  {
    id: "l2l3b-s-6-1",
    professionId: PROF,
    container: { kind: "section", l2PlanId: "l2-plan-mech-draw", sectionId: "l2sec-draw-6-1" },
    l3NodeIds: ["l3-kn-009", "l3-kn-008", "l3-lit-001"],
    note: "6.1 零件图综合：技术要求知识 + 规范意识素养",
  },
  {
    id: "l2l3b-s-6-2",
    professionId: PROF,
    container: { kind: "section", l2PlanId: "l2-plan-mech-draw", sectionId: "l2sec-draw-6-2" },
    l3NodeIds: ["l3-kn-010"],
    note: "6.2 装配图识读与绘制",
  },
  {
    id: "l2l3b-s-7-1",
    professionId: PROF,
    container: { kind: "section", l2PlanId: "l2-plan-mech-draw", sectionId: "l2sec-draw-7-1" },
    l3NodeIds: ["l3-kn-011", "l3-sk-002"],
    note: "7.1 AutoCAD 综合应用：知识点 + 技能点",
  },
  {
    id: "l2l3b-s-7-2",
    professionId: PROF,
    container: { kind: "section", l2PlanId: "l2-plan-mech-draw", sectionId: "l2sec-draw-7-2" },
    l3NodeIds: ["l3-kn-012", "l3-sk-003"],
    note: "7.2 SolidWorks 建模：知识点 + 技能点",
  },

  // -------- 制图与CAD 按 plan 粒度的整体桥 --------
  {
    id: "l2l3b-p-draw-ch1",
    professionId: PROF,
    container: { kind: "plan", l2PlanId: "l2-plan-mech-draw" },
    l3NodeIds: [
      "l3-kn-001", "l3-kn-002", "l3-kn-003", "l3-kn-004", "l3-kn-005",
      "l3-kn-006", "l3-kn-007", "l3-kn-008", "l3-kn-009", "l3-kn-010",
      "l3-kn-011", "l3-kn-012", "l3-kn-017", "l3-kn-018",
      "l3-sk-001", "l3-sk-002", "l3-sk-003", "l3-lit-001",
    ],
    note: "制图与CAD标准课程计划整体覆盖的 L3 节点全集",
  },

  // -------- 第1章各小节 section 粒度 --------
  {
    id: "l2l3b-s-1-1",
    professionId: PROF,
    container: { kind: "section", l2PlanId: "l2-plan-mech-draw", sectionId: "l2sec-draw-1-1" },
    l3NodeIds: ["l3-kn-001"],
  },
  {
    id: "l2l3b-s-1-2",
    professionId: PROF,
    container: { kind: "section", l2PlanId: "l2-plan-mech-draw", sectionId: "l2sec-draw-1-2" },
    l3NodeIds: ["l3-kn-001"],
  },

  // -------- 第2章各小节 section 粒度 --------
  {
    id: "l2l3b-s-2-1",
    professionId: PROF,
    container: { kind: "section", l2PlanId: "l2-plan-mech-draw", sectionId: "l2sec-draw-2-1" },
    l3NodeIds: ["l3-kn-002"],
  },
  {
    id: "l2l3b-s-2-2",
    professionId: PROF,
    container: { kind: "section", l2PlanId: "l2-plan-mech-draw", sectionId: "l2sec-draw-2-2" },
    l3NodeIds: ["l3-kn-003"],
  },
  {
    id: "l2l3b-s-2-3",
    professionId: PROF,
    container: { kind: "section", l2PlanId: "l2-plan-mech-draw", sectionId: "l2sec-draw-2-3" },
    l3NodeIds: ["l3-kn-004"],
  },
  {
    id: "l2l3b-s-2-4",
    professionId: PROF,
    container: { kind: "section", l2PlanId: "l2-plan-mech-draw", sectionId: "l2sec-draw-2-4" },
    l3NodeIds: ["l3-kn-004"],
  },

  // -------- 第4章各小节 --------
  {
    id: "l2l3b-s-4-1",
    professionId: PROF,
    container: { kind: "section", l2PlanId: "l2-plan-mech-draw", sectionId: "l2sec-draw-4-1" },
    l3NodeIds: ["l3-kn-007"],
  },
  {
    id: "l2l3b-s-4-3",
    professionId: PROF,
    container: { kind: "section", l2PlanId: "l2-plan-mech-draw", sectionId: "l2sec-draw-4-3" },
    l3NodeIds: ["l3-kn-007"],
  },

  // -------- 第5章各小节 --------
  {
    id: "l2l3b-s-5-1",
    professionId: PROF,
    container: { kind: "section", l2PlanId: "l2-plan-mech-draw", sectionId: "l2sec-draw-5-1" },
    l3NodeIds: ["l3-kn-008"],
  },
  {
    id: "l2l3b-s-5-3",
    professionId: PROF,
    container: { kind: "section", l2PlanId: "l2-plan-mech-draw", sectionId: "l2sec-draw-5-3" },
    l3NodeIds: ["l3-kn-008"],
  },

  // -------- 机械设计基础 整体 plan 粒度 --------
  {
    id: "l2l3b-p-design",
    professionId: PROF,
    container: { kind: "plan", l2PlanId: "l2-plan-mech-design" },
    l3NodeIds: ["l3-kn-007", "l3-kn-008", "l3-kn-009", "l3-kn-010"],
    note: "机械设计基础覆盖机件表达、标准件、技术要求与装配图相关知识点",
  },

  // -------- 金工实习 整体 plan 粒度 + 焦点小节 --------
  {
    id: "l2l3b-p-practice",
    professionId: PROF,
    container: { kind: "plan", l2PlanId: "l2-plan-mech-practice" },
    l3NodeIds: ["l3-kn-009", "l3-kn-013", "l3-sk-004", "l3-lit-001"],
    note: "金工实习覆盖零件图技术要求、车铣工艺、量具技能与规范意识",
  },
  {
    id: "l2l3b-s-prac-1-2",
    professionId: PROF,
    container: { kind: "section", l2PlanId: "l2-plan-mech-practice", sectionId: "l2sec-practice-1-2" },
    l3NodeIds: ["l3-kn-009", "l3-sk-004"],
    note: "游标卡尺与图纸尺寸对读：需要公差知识 + 量具操作技能",
  },

  // -------- 互换性与技术测量 整体 plan 粒度 --------
  {
    id: "l2l3b-p-tolerance",
    professionId: PROF,
    container: { kind: "plan", l2PlanId: "l2-plan-mech-tolerance" },
    l3NodeIds: ["l3-kn-009", "l3-sk-004"],
    note: "互换性与技术测量核心覆盖公差配合知识与量具技能",
  },

  // -------- 工业机器人 整体 plan 粒度 --------
  {
    id: "l2l3b-p-robotics",
    professionId: PROF,
    container: { kind: "plan", l2PlanId: "l2-plan-mech-robotics" },
    l3NodeIds: ["l3-kn-014", "l3-kn-015", "l3-kn-016", "l3-lit-002"],
    note: "工业机器人技术基础覆盖机器人知识、液压气动、孪生可视化与持续学习素养",
  },
];

// ---- 预建索引：根据 l2PlanId 查桥 ----
export const l2ToL3BridgesByPlan: Record<string, L2ToL3Bridge[]> = {};
for (const b of l2ToL3Bridges) {
  const planId = b.container.l2PlanId;
  if (!l2ToL3BridgesByPlan[planId]) l2ToL3BridgesByPlan[planId] = [];
  l2ToL3BridgesByPlan[planId]!.push(b);
}

// ---- 预建索引：根据 sectionId 快速查桥 ----
export const l2ToL3BridgesBySection: Record<string, L2ToL3Bridge> = {};
for (const b of l2ToL3Bridges) {
  if (b.container.kind === "section") {
    l2ToL3BridgesBySection[b.container.sectionId] = b;
  }
}
