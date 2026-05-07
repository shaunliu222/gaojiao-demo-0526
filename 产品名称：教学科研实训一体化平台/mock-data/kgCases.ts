import type { SchoolCase, IndustryProjectAsset } from "./types";

/**
 * 校内案例 → 产业课题
 *
 * SchoolCase       4 条（原始校内案例）
 * IndustryProjectAsset  2 条（由案例转化的产业课题，可挂回 L2）
 */

const PROF = "prof-mech";

export const schoolCases: SchoolCase[] = [
  {
    id: "case-mech-001",
    professionId: PROF,
    title: "轴承座零件图测绘与制图专题训练（2023届）",
    description:
      "2023 届机制班在大二上学期开展轴承座实物测绘专项训练，从徒手草图到 AutoCAD 规范出图，历时两周，最终提交图纸集一份。该案例积累了丰富的学生常见错误类型（截面线密度、粗糙度遗漏等）。",
    origin: "李建国教研室 · 2023届",
    rawTags: ["测绘", "轴承座", "AutoCAD", "零件图", "典型错误"],
    importedAt: "2026-01-15T10:00:00+08:00",
  },
  {
    id: "case-mech-002",
    professionId: PROF,
    title: "金工实习图纸—实物对比挑战赛（2024届）",
    description:
      "2024 届在金工实习期间举行「图纸—实物—量具」三联对照大赛：学生拿到零件实物与图纸，用游标卡尺逐项核验并汇报不符合项。教师积累了一批典型误差案例与学生操作录像。",
    origin: "王海峰教研室 · 2024届",
    rawTags: ["金工实习", "量具", "图纸核验", "竞赛", "典型案例"],
    importedAt: "2026-01-15T10:05:00+08:00",
  },
  {
    id: "case-mech-003",
    professionId: PROF,
    title: "SolidWorks 齿轮泵建模大赛作品集（2023届）",
    description:
      "机械设计课程期末以齿轮泵为主题开展三维建模竞赛，收集了 26 份学生作品，涵盖从基础特征到完整装配图的全链路，记录了典型装配约束错误与出图问题。",
    origin: "陈美玲教研室 · 2023届",
    rawTags: ["SolidWorks", "齿轮泵", "三维建模", "装配约束", "竞赛"],
    importedAt: "2026-01-15T10:10:00+08:00",
  },
  {
    id: "case-mech-004",
    professionId: PROF,
    title: "公差配合选用综合实训案例（大四互换性课）",
    description:
      "互换性课程期末实训：每组学生选取一套传动轴系，完成公差链分析 + 粗糙度标注 + 三坐标测量验证的完整流程，共积累 18 份案例报告，覆盖间隙配合、过渡配合与过盈配合三类。",
    origin: "王丽华教研室 · 2025届",
    rawTags: ["互换性", "公差链", "三坐标", "测量", "综合实训"],
    importedAt: "2026-01-15T10:15:00+08:00",
  },
];

export const industryProjectAssets: IndustryProjectAsset[] = [
  {
    id: "indproj-mech-001",
    professionId: PROF,
    title: "机械零件图纸规范化改造课题",
    fromCaseIds: ["case-mech-001", "case-mech-002"],
    industryContext:
      "企业设计部门常见问题：新入职工程师提交的零件图存在国标规范性错误，导致加工车间返工。需要系统训练图纸规范性与量具核验能力。",
    problemStatement:
      "给定一批含有 10 类典型规范性错误的零件图（幅面、粗糙度、公差标注等），学生需识别错误、修改图纸，并用游标卡尺对照实物验证关键尺寸。",
    deliverables: [
      "一份标注了错误类型的原始图纸分析报告",
      "修改后的规范零件图（AutoCAD 格式）",
      "游标卡尺量测记录表（含关键尺寸核验数据）",
    ],
    linkedNodes: [
      { nodeId: "l3-kn-001", layer: "L3", reason: "图线与国标规范" },
      { nodeId: "l3-kn-009", layer: "L3", reason: "零件图技术要求" },
      { nodeId: "l3-sk-002", layer: "L3", reason: "AutoCAD 出图技能" },
      { nodeId: "l3-lit-001", layer: "L3", reason: "工程规范意识素养" },
      { nodeId: "l2-plan-mech-draw", layer: "L2", reason: "依托制图与CAD标准课程计划" },
    ],
    status: "released",
  },
  {
    id: "indproj-mech-002",
    professionId: PROF,
    title: "传动轴系公差链分析与测量验证课题",
    fromCaseIds: ["case-mech-004"],
    industryContext:
      "制造企业质检部门需要工程师能快速完成公差链核算并用三坐标验证设计意图。该能力对应互换性与技术测量课程的综合应用。",
    problemStatement:
      "给定一套减速器传动轴系图纸（已含典型公差标注），学生需完成封闭环尺寸链计算、粗糙度标注审查，最后使用三坐标仪验证关键配合尺寸，并撰写检测报告。",
    deliverables: [
      "尺寸链计算过程（含封闭环公差推导）",
      "粗糙度标注审查报告",
      "三坐标测量记录与合格判定说明",
    ],
    linkedNodes: [
      { nodeId: "l3-kn-009", layer: "L3", reason: "零件图技术要求（公差）" },
      { nodeId: "l3-sk-004", layer: "L3", reason: "量具使用技能" },
      { nodeId: "l2-plan-mech-tolerance", layer: "L2", reason: "依托互换性与技术测量标准课程计划" },
    ],
    status: "review",
  },
];

export const schoolCaseById: Record<string, SchoolCase> = Object.fromEntries(
  schoolCases.map((c) => [c.id, c]),
);

export const industryProjectAssetById: Record<string, IndustryProjectAsset> =
  Object.fromEntries(industryProjectAssets.map((p) => [p.id, p]));
