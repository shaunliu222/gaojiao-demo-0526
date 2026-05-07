import type { L2StandardCoursePlan, PlanChapter } from "./types";

/**
 * L2 标准课程计划集合（机械工程专业）
 *
 * 5 份计划：
 *   l2-plan-mech-draw         机械制图与CAD（主线焦点，AI 合成）
 *   l2-plan-mech-design       机械设计基础（人工导入）
 *   l2-plan-mech-practice     金工实习（人工导入）
 *   l2-plan-mech-tolerance    互换性与技术测量（人工导入）
 *   l2-plan-mech-robotics     工业机器人技术应用基础（人工导入）
 *
 * chapters 结构与 TeachingPlan.chapters 同构，但不绑班级，
 * plannedDate 填写标准参考日期（实际教学计划创建后可在 overrides 中调整）。
 */

const PROF = "prof-mech";

// ---- 制图与CAD 章节（复用 plan-main chapters 抽离） ----
const drawChapters: PlanChapter[] = [
  {
    id: "l2ch-draw-1",
    title: "第1章 制图基础",
    summary: "建立国家标准意识，打下规范绘图基础。",
    sections: [
      {
        id: "l2sec-draw-1-1",
        title: "1.1 国家标准与图纸幅面",
        plannedDate: "2026-02-23",
        knowledgeNodeIds: ["l3-kn-001"],
        objectives: ["能说出 GB/T 14689 幅面规格", "完成 A3 图框绘制"],
        durationMinutes: 90,
        hasDesign: false,
      },
      {
        id: "l2sec-draw-1-2",
        title: "1.2 字体、图线与尺寸标注基础",
        plannedDate: "2026-02-25",
        knowledgeNodeIds: ["l3-kn-001"],
        objectives: ["能规范书写长仿宋体", "会用九种基本图线", "掌握尺寸标注四要素"],
        durationMinutes: 90,
        hasDesign: false,
      },
    ],
  },
  {
    id: "l2ch-draw-2",
    title: "第2章 几何作图与投影基础",
    summary: "几何作图→投影法→点线面投影，建立空间感。",
    sections: [
      {
        id: "l2sec-draw-2-1",
        title: "2.1 几何作图",
        plannedDate: "2026-03-02",
        knowledgeNodeIds: ["l3-kn-002"],
        objectives: ["掌握基本几何构图与徒手比例"],
        durationMinutes: 90,
        hasDesign: false,
      },
      {
        id: "l2sec-draw-2-2",
        title: "2.2 投影法与三视图形成",
        plannedDate: "2026-03-04",
        knowledgeNodeIds: ["l3-kn-003"],
        objectives: ["掌握正投影要点", "理解三视图对应规律"],
        durationMinutes: 90,
        hasDesign: false,
      },
      {
        id: "l2sec-draw-2-3",
        title: "2.3 线面分析与空间连线",
        plannedDate: "2026-03-09",
        knowledgeNodeIds: ["l3-kn-004"],
        objectives: ["能在简单模型上推演线面约束"],
        durationMinutes: 90,
        hasDesign: false,
      },
      {
        id: "l2sec-draw-2-4",
        title: "2.4 面及相对位置",
        plannedDate: "2026-03-11",
        knowledgeNodeIds: ["l3-kn-004"],
        objectives: ["能判断线与面、平面的投影关系类别"],
        durationMinutes: 90,
        hasDesign: false,
      },
    ],
  },
  {
    id: "l2ch-draw-3",
    title: "第3章 正投影法与三视图",
    summary: "立体投影 → 组合体 → 截交相贯，是本课最重要章节。",
    sections: [
      {
        id: "l2sec-draw-3-1",
        title: "3.1 立体与回转体投影",
        plannedDate: "2026-03-16",
        knowledgeNodeIds: ["l3-kn-004", "l3-kn-005"],
        objectives: ["能完成常见回转体三视图草稿"],
        durationMinutes: 90,
        hasDesign: false,
      },
      {
        id: "l2sec-draw-3-2",
        title: "3.2 组合体三视图绘制",
        plannedDate: "2026-03-18",
        knowledgeNodeIds: ["l3-kn-005", "l3-sk-001"],
        objectives: ["掌握形体分析法", "完整绘制中等难度组合体三视图", "养成检查意识"],
        durationMinutes: 135,
        hasDesign: true,
      },
      {
        id: "l2sec-draw-3-3",
        title: "3.3 尺寸标注与读图",
        plannedDate: "2026-03-23",
        knowledgeNodeIds: ["l3-kn-005", "l3-kn-009"],
        objectives: ["能完成定形定位总体尺寸策略", "能从三视图回到形体语义"],
        durationMinutes: 90,
        hasDesign: false,
      },
      {
        id: "l2sec-draw-3-4",
        title: "3.4 截交线与相贯线专题",
        plannedDate: "2026-03-25",
        knowledgeNodeIds: ["l3-kn-006"],
        objectives: ["能识别常见工况并作出草图推演"],
        durationMinutes: 135,
        hasDesign: false,
      },
    ],
  },
  {
    id: "l2ch-draw-4",
    title: "第4章 机件表达方法",
    summary: "基本视图、向视图、局部视图、斜视图、剖视图、断面图。",
    sections: [
      {
        id: "l2sec-draw-4-1",
        title: "4.1 机件表达的视图选型",
        plannedDate: "2026-03-30",
        knowledgeNodeIds: ["l3-kn-007"],
        objectives: ["能对常用表达策略做选型说明"],
        durationMinutes: 90,
        hasDesign: false,
      },
      {
        id: "l2sec-draw-4-2",
        title: "4.2 局部与倾斜表达要点",
        plannedDate: "2026-04-01",
        knowledgeNodeIds: ["l3-kn-007"],
        objectives: ["能判断何时用局部视图、斜视图"],
        durationMinutes: 90,
        hasDesign: false,
      },
      {
        id: "l2sec-draw-4-3",
        title: "4.3 剖切与断面",
        plannedDate: "2026-04-06",
        knowledgeNodeIds: ["l3-kn-007"],
        objectives: ["掌握典型剖切面选择思路"],
        durationMinutes: 135,
        hasDesign: false,
      },
      {
        id: "l2sec-draw-4-4",
        title: "4.4 局部放大与其它表达要点",
        plannedDate: "2026-04-08",
        knowledgeNodeIds: ["l3-kn-007"],
        objectives: ["能组合多种表达降低成本"],
        durationMinutes: 90,
        hasDesign: false,
      },
    ],
  },
  {
    id: "l2ch-draw-5",
    title: "第5章 标准件与常用件",
    summary: "螺纹、紧固件、键、销、齿轮的规定画法。",
    sections: [
      {
        id: "l2sec-draw-5-1",
        title: "5.1 螺纹紧固件综述",
        plannedDate: "2026-04-13",
        knowledgeNodeIds: ["l3-kn-008"],
        objectives: ["能说明螺纹紧固件选型思路"],
        durationMinutes: 90,
        hasDesign: false,
      },
      {
        id: "l2sec-draw-5-2",
        title: "5.2 连接件表达实操",
        plannedDate: "2026-04-15",
        knowledgeNodeIds: ["l3-kn-008"],
        objectives: ["能完成典型螺纹连接制图"],
        durationMinutes: 90,
        hasDesign: false,
      },
      {
        id: "l2sec-draw-5-3",
        title: "5.3 键销与齿轮简述",
        plannedDate: "2026-04-20",
        knowledgeNodeIds: ["l3-kn-008"],
        objectives: ["能完成齿轮与传动件占位表达"],
        durationMinutes: 90,
        hasDesign: false,
      },
    ],
  },
  {
    id: "l2ch-draw-6",
    title: "第6章 零件图与装配图",
    summary: "工程图全流程训练。",
    sections: [
      {
        id: "l2sec-draw-6-1",
        title: "6.1 零件图综合",
        plannedDate: "2026-04-22",
        knowledgeNodeIds: ["l3-kn-009", "l3-kn-008"],
        objectives: ["能整合尺寸公差与表面质量条目"],
        durationMinutes: 135,
        hasDesign: false,
      },
      {
        id: "l2sec-draw-6-2",
        title: "6.2 装配图识读与绘制",
        plannedDate: "2026-04-27",
        knowledgeNodeIds: ["l3-kn-010"],
        objectives: ["能拆图并解释装配语义"],
        durationMinutes: 135,
        hasDesign: false,
      },
    ],
  },
  {
    id: "l2ch-draw-7",
    title: "第7章 AutoCAD 与三维建模",
    summary: "从手工图到数字化制图的跨越。",
    sections: [
      {
        id: "l2sec-draw-7-1",
        title: "7.1 AutoCAD 综合应用",
        plannedDate: "2026-04-29",
        knowledgeNodeIds: ["l3-kn-011", "l3-sk-002"],
        objectives: ["完成二维全流程出图"],
        durationMinutes: 135,
        hasDesign: false,
      },
      {
        id: "l2sec-draw-7-2",
        title: "7.2 SolidWorks 三维建模入门",
        plannedDate: "2026-05-04",
        knowledgeNodeIds: ["l3-kn-012", "l3-sk-003"],
        objectives: ["完成特征—装配—工程图链路"],
        durationMinutes: 135,
        hasDesign: false,
      },
    ],
  },
];

// ---- 机械设计基础 章节 ----
const designChapters: PlanChapter[] = [
  {
    id: "l2ch-design-1",
    title: "第1章 机械设计基础概述",
    summary: "机械设计的基本原则与设计流程。",
    sections: [
      {
        id: "l2sec-design-1-1",
        title: "1.1 机械设计原则与流程",
        plannedDate: "2026-09-01",
        knowledgeNodeIds: ["l3-kn-007", "l3-kn-008"],
        objectives: ["理解机械设计一般流程", "了解设计约束条件"],
        durationMinutes: 90,
        hasDesign: false,
      },
    ],
  },
  {
    id: "l2ch-design-2",
    title: "第2章 螺纹连接与传动",
    sections: [
      {
        id: "l2sec-design-2-1",
        title: "2.1 螺纹连接类型与标准件",
        plannedDate: "2026-09-08",
        knowledgeNodeIds: ["l3-kn-008"],
        objectives: ["能正确选用螺纹连接形式"],
        durationMinutes: 90,
        hasDesign: false,
      },
      {
        id: "l2sec-design-2-2",
        title: "2.2 螺纹连接强度计算",
        plannedDate: "2026-09-10",
        knowledgeNodeIds: ["l3-kn-008", "l3-kn-009"],
        objectives: ["能进行简单螺纹连接强度核算"],
        durationMinutes: 90,
        hasDesign: false,
      },
    ],
  },
  {
    id: "l2ch-design-3",
    title: "第3章 齿轮传动",
    sections: [
      {
        id: "l2sec-design-3-1",
        title: "3.1 齿轮传动基础",
        plannedDate: "2026-09-22",
        knowledgeNodeIds: ["l3-kn-008", "l3-kn-010"],
        objectives: ["掌握渐开线齿轮基本参数"],
        durationMinutes: 90,
        hasDesign: false,
      },
    ],
  },
  {
    id: "l2ch-design-4",
    title: "第4章 轴与轴承",
    sections: [
      {
        id: "l2sec-design-4-1",
        title: "4.1 轴的设计原则",
        plannedDate: "2026-10-13",
        knowledgeNodeIds: ["l3-kn-009", "l3-kn-010"],
        objectives: ["能完成阶梯轴基本结构设计"],
        durationMinutes: 90,
        hasDesign: false,
      },
    ],
  },
];

// ---- 金工实习 章节 ----
const practiceChapters: PlanChapter[] = [
  {
    id: "l2ch-practice-1",
    title: "第1章 入厂安全与量具识读",
    summary: "安全规程 + 游标卡尺图纸对读。",
    sections: [
      {
        id: "l2sec-practice-1-1",
        title: "1.1 车间安全规程与劳保穿戴",
        plannedDate: "2026-03-03",
        knowledgeNodeIds: ["l3-sk-004"],
        objectives: ["口述四类主要安全风险", "正确穿戴劳保用品"],
        durationMinutes: 60,
        hasDesign: false,
      },
      {
        id: "l2sec-practice-1-2",
        title: "1.2 游标卡尺与图纸尺寸对读",
        plannedDate: "2026-03-05",
        knowledgeNodeIds: ["l3-kn-009", "l3-sk-004"],
        objectives: ["独立完成 5 处关键尺寸量测", "记录测量不确定度意识"],
        durationMinutes: 90,
        hasDesign: true,
      },
    ],
  },
  {
    id: "l2ch-practice-2",
    title: "第2章 车削与铣削基础",
    sections: [
      {
        id: "l2sec-practice-2-1",
        title: "2.1 普通车床基本操作",
        plannedDate: "2026-03-12",
        knowledgeNodeIds: ["l3-kn-013"],
        objectives: ["完成简易轴类件试切", "填写工序记录"],
        durationMinutes: 120,
        hasDesign: false,
      },
      {
        id: "l2sec-practice-2-2",
        title: "2.2 铣床工作台与对刀入门",
        plannedDate: "2026-03-14",
        knowledgeNodeIds: ["l3-kn-013"],
        objectives: ["理解对刀基准与加工坐标"],
        durationMinutes: 120,
        hasDesign: false,
      },
    ],
  },
];

// ---- 互换性与技术测量 章节 ----
const toleranceChapters: PlanChapter[] = [
  {
    id: "l2ch-tol-1",
    title: "第1章 极限与配合基础",
    sections: [
      {
        id: "l2sec-tol-1-1",
        title: "1.1 互换性概念与标准体系",
        plannedDate: "2026-09-01",
        knowledgeNodeIds: ["l3-kn-009"],
        objectives: ["理解互换性与标准化的关系"],
        durationMinutes: 90,
        hasDesign: false,
      },
      {
        id: "l2sec-tol-1-2",
        title: "1.2 尺寸公差与配合选用",
        plannedDate: "2026-09-03",
        knowledgeNodeIds: ["l3-kn-009", "l3-sk-004"],
        objectives: ["能按工况选用配合代号"],
        durationMinutes: 90,
        hasDesign: false,
      },
    ],
  },
  {
    id: "l2ch-tol-2",
    title: "第2章 形位公差与检测",
    sections: [
      {
        id: "l2sec-tol-2-1",
        title: "2.1 形位公差标注",
        plannedDate: "2026-09-17",
        knowledgeNodeIds: ["l3-kn-009"],
        objectives: ["正确标注基准体系"],
        durationMinutes: 90,
        hasDesign: false,
      },
      {
        id: "l2sec-tol-2-2",
        title: "2.2 粗糙度与检测方案",
        plannedDate: "2026-09-19",
        knowledgeNodeIds: ["l3-kn-009", "l3-sk-004"],
        objectives: ["编制简易检测路线"],
        durationMinutes: 90,
        hasDesign: false,
      },
    ],
  },
];

// ---- 工业机器人 章节 ----
const roboticsChapters: PlanChapter[] = [
  {
    id: "l2ch-rob-1",
    title: "第1章 工业机器人认知与安全",
    sections: [
      {
        id: "l2sec-rob-1-1",
        title: "1.1 机器人组成与坐标系",
        plannedDate: "2026-09-08",
        knowledgeNodeIds: ["l3-kn-014"],
        objectives: ["能说明六轴机器人自由度与运动范围"],
        durationMinutes: 90,
        hasDesign: false,
      },
      {
        id: "l2sec-rob-1-2",
        title: "1.2 安全规程与示教前准备",
        plannedDate: "2026-09-10",
        knowledgeNodeIds: ["l3-kn-014"],
        objectives: ["掌握示教模式切换与急停操作"],
        durationMinutes: 90,
        hasDesign: false,
      },
    ],
  },
  {
    id: "l2ch-rob-2",
    title: "第2章 示教编程与节拍",
    sections: [
      {
        id: "l2sec-rob-2-1",
        title: "2.1 点位示教与轨迹录制",
        plannedDate: "2026-09-22",
        knowledgeNodeIds: ["l3-kn-014"],
        objectives: ["完成简单搬运示教任务"],
        durationMinutes: 120,
        hasDesign: false,
      },
      {
        id: "l2sec-rob-2-2",
        title: "2.2 节拍计算与路径优化入门",
        plannedDate: "2026-09-24",
        knowledgeNodeIds: ["l3-kn-014", "l3-kn-016"],
        objectives: ["理解节拍与路径的关系"],
        durationMinutes: 90,
        hasDesign: false,
      },
    ],
  },
];

// ---- 5 份 L2 标准课程计划 ----
export const l2StandardCoursePlans: L2StandardCoursePlan[] = [
  {
    id: "l2-plan-mech-draw",
    professionId: PROF,
    courseId: "course-mech-draw",
    subjectId: "subj-mech-drawing",
    title: "机械制图与CAD",
    importedFromLegacyMetaId: "legacy-mech-draw-2025",
    derivedFromL1NodeIds: ["l1-std-001", "l1-std-002", "l1-ab-001", "l1-ab-002"],
    competencyTargets: [
      "具备工程图样表达能力：能完成国标零件图与装配图的绘制与识读",
      "具备数字化出图能力：能用 AutoCAD 完成规范二维工程图，了解三维建模基本流程",
    ],
    chapters: drawChapters,
    totalHours: 64,
    status: "released",
    generatedBy: "ai_synthesis",
    generationTrace: {
      legacyMetaSnapshot:
        "课程名：机械制图与CAD；学时：64；学分：4；教材：机械制图第八版 + AutoCAD 2022 实用教程",
      appliedL1NodeIds: ["l1-std-001", "l1-std-002", "l1-ab-001", "l1-ab-002"],
      diffSummary:
        "基于旧教务元信息补充了截交线专题（3.4节）扩展为 135 分钟，并将 AutoCAD 与 SolidWorks 合并为第7章，增加三维建模目标；相比旧计划新增培养目标「数字化协同意识」，来自 L1 节点 l1-std-002。",
      generatedAt: "2026-01-20T10:00:00+08:00",
    },
    updatedAt: "2026-01-20T10:00:00+08:00",
  },
  {
    id: "l2-plan-mech-design",
    professionId: PROF,
    courseId: "course-mech-design",
    subjectId: "subj-mech-design",
    title: "机械设计基础",
    importedFromLegacyMetaId: "legacy-mech-design-2025",
    derivedFromL1NodeIds: ["l1-std-001", "l1-ab-001"],
    competencyTargets: [
      "具备机械零件基本设计能力：能完成螺纹连接与齿轮传动的基本设计计算",
      "具备工程表达能力：能将设计结果转化为规范零件图",
    ],
    chapters: designChapters,
    totalHours: 64,
    status: "released",
    generatedBy: "import",
    updatedAt: "2026-01-18T14:00:00+08:00",
  },
  {
    id: "l2-plan-mech-practice",
    professionId: PROF,
    courseId: "course-mech-practice",
    subjectId: "subj-mech-manu",
    title: "金工实习",
    importedFromLegacyMetaId: "legacy-mech-practice-2025",
    derivedFromL1NodeIds: ["l1-std-003", "l1-ab-003"],
    competencyTargets: [
      "具备基本切削加工与量具使用能力：能在真实设备上完成零件加工与尺寸核验",
      "具备工艺规程意识：能填写基本工序记录并识别安全风险",
    ],
    chapters: practiceChapters,
    totalHours: 40,
    status: "released",
    generatedBy: "import",
    updatedAt: "2026-01-18T15:00:00+08:00",
  },
  {
    id: "l2-plan-mech-tolerance",
    professionId: PROF,
    courseId: "course-mech-tolerance",
    subjectId: "subj-mech-tolerance",
    title: "互换性与技术测量",
    importedFromLegacyMetaId: "legacy-mech-tolerance-2025",
    derivedFromL1NodeIds: ["l1-jc-003", "l1-ab-003"],
    competencyTargets: [
      "具备尺寸公差配合选用能力：能根据工况正确选用配合代号并完成图纸标注",
      "具备基本质量检测能力：能制订简易检测路线并使用常见量具",
    ],
    chapters: toleranceChapters,
    totalHours: 48,
    status: "released",
    generatedBy: "manual",
    updatedAt: "2026-01-19T09:00:00+08:00",
  },
  {
    id: "l2-plan-mech-robotics",
    professionId: PROF,
    courseId: "course-mech-robotics",
    subjectId: "subj-mech-robot",
    title: "工业机器人技术应用基础",
    importedFromLegacyMetaId: "legacy-mech-robotics-2025",
    derivedFromL1NodeIds: ["l1-demand-001", "l1-jc-002"],
    competencyTargets: [
      "具备工业机器人基本操作能力：能完成安全规范的示教编程与简单搬运任务",
      "具备数字化协同意识：了解机器人与智能制造产线的关联",
    ],
    chapters: roboticsChapters,
    totalHours: 48,
    status: "released",
    generatedBy: "import",
    updatedAt: "2026-01-19T11:00:00+08:00",
  },
];

export const l2PlanById: Record<string, L2StandardCoursePlan> = Object.fromEntries(
  l2StandardCoursePlans.map((p) => [p.id, p]),
);
