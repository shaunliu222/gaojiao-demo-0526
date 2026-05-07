import type { L3Node, L3Edge, L3NodeKind, GraphNodeStatus } from "./types";

/**
 * 机械工程专业 L3 教学单元图谱数据
 *
 * 节点 22 个：
 *   知识点  18 个（l3-kn-001 ~ l3-kn-018，沿用现有 kn-mech-* 语义，补 teachingActivities + textbookAnchors）
 *   技能点   2 个（l3-sk-001 ~ l3-sk-003，含教学活动）
 *   素养点   2 个（l3-lit-001 ~ l3-lit-002）
 *
 * 边 12 条（先修/关联/同质/支撑）
 */

const PROF = "prof-mech";
const TEXTBOOK_DRAW = "legacy-mech-draw-2025";      // 机械制图与CAD 教材
const TEXTBOOK_DESIGN = "legacy-mech-design-2025";  // 机械设计基础 教材
const TEXTBOOK_TOL = "legacy-mech-tolerance-2025";  // 互换性与技术测量 教材

function kn(
  id: string,
  name: string,
  description: string,
  cluster: string,
  status: GraphNodeStatus = "confirmed",
): Pick<L3Node, "id" | "professionId" | "kind" | "name" | "description" | "cluster" | "status"> {
  return { id, professionId: PROF, kind: "knowledge_point" as L3NodeKind, name, description, cluster, status };
}

export const l3Nodes: L3Node[] = [
  // ---- 知识点 ----
  {
    ...kn("l3-kn-001", "制图与国标注解基础（幅面—图线—尺寸）", "制图标准框架与基础规定；多数制图课的共同起点。", "制图基础"),
    teachingActivities: [
      { mode: "讲授", description: "讲解幅面、图线、尺寸三大国标体系", estimatedMinutes: 30 },
      { mode: "案例分析", description: "对照标准图纸分析违规案例，找出不符合国标的标注", estimatedMinutes: 20 },
    ],
    textbookAnchors: [
      { textbookId: TEXTBOOK_DRAW, textbookTitle: "机械制图（第八版）", chapter: "第1章", section: "1.1-1.4", pageRange: "1-28" },
    ],
  },
  {
    ...kn("l3-kn-002", "几何作图与生活测绘入门", "基本几何构造、草图与现实物体测绘的一体化。", "几何作图"),
    teachingActivities: [
      { mode: "讲授", description: "讲解等分圆周、斜度锥度等作图方法", estimatedMinutes: 20 },
      { mode: "实训操作", description: "现场测绘身边零件并完成徒手草图", estimatedMinutes: 40 },
    ],
    textbookAnchors: [
      { textbookId: TEXTBOOK_DRAW, textbookTitle: "机械制图（第八版）", chapter: "第1章", section: "1.5-1.6", pageRange: "29-42" },
    ],
  },
  {
    ...kn("l3-kn-003", "投影原理与三视图体系", "正投影特性与三视图关系；承上启下的枢纽知识点。", "投影基础"),
    teachingActivities: [
      { mode: "讲授", description: "讲解正投影三视图形成原理", estimatedMinutes: 25 },
      { mode: "翻转课堂", description: "学生提前观看三视图动画，课堂重点讨论常见误区", estimatedMinutes: 30 },
      { mode: "案例分析", description: "用 3D 模型辅助推导三视图位置关系", estimatedMinutes: 20 },
    ],
    textbookAnchors: [
      { textbookId: TEXTBOOK_DRAW, textbookTitle: "机械制图（第八版）", chapter: "第2章", section: "2.1-2.3", pageRange: "43-68" },
    ],
  },
  {
    ...kn("l3-kn-004", "线面分析与立体回转体投影", "点线—面体的投影推演与曲面体画法。", "点线面投影"),
    teachingActivities: [
      { mode: "讲授", description: "讲解各类位置直线与平面的投影特性", estimatedMinutes: 30 },
      { mode: "讨论", description: "小组讨论复杂回转体投影推演步骤", estimatedMinutes: 20 },
    ],
    textbookAnchors: [
      { textbookId: TEXTBOOK_DRAW, textbookTitle: "机械制图（第八版）", chapter: "第2章", section: "2.4-2.6", pageRange: "69-98" },
    ],
  },
  {
    ...kn("l3-kn-005", "组合体分析与视图表征", "叠加/切割、形体分析与视图选择。", "组合体"),
    teachingActivities: [
      { mode: "讲授", description: "系统讲解叠加、切割与综合组合体的分析策略", estimatedMinutes: 30 },
      { mode: "项目式", description: "分组完成中等难度组合体三视图绘制任务", estimatedMinutes: 60 },
      { mode: "案例分析", description: "从真实机械零件反推组合体类型", estimatedMinutes: 15 },
    ],
    textbookAnchors: [
      { textbookId: TEXTBOOK_DRAW, textbookTitle: "机械制图（第八版）", chapter: "第3章", section: "3.1-3.4", pageRange: "99-132" },
    ],
  },
  {
    ...kn("l3-kn-006", "截交线与相贯线要点", "交线求解思路与常见问题归纳。", "立体投影"),
    teachingActivities: [
      { mode: "讲授", description: "讲解截交线辅助平面法与相贯线积聚性法", estimatedMinutes: 30 },
      { mode: "案例分析", description: "用工业零件（通孔/凸台/轴）分析典型截相贯线", estimatedMinutes: 25 },
      { mode: "AI 协作探究", description: "学生用 SolidWorks 验证手工作图结果，与 AI 对比误差", estimatedMinutes: 30, sampleResourceIds: ["res-m-028"] },
    ],
    textbookAnchors: [
      { textbookId: TEXTBOOK_DRAW, textbookTitle: "机械制图（第八版）", chapter: "第3章", section: "3.5-3.7", pageRange: "133-160" },
    ],
  },
  {
    ...kn("l3-kn-007", "机件表达策略（视图/剖切/断面）", "视图、剖视图、断面与简便表达的综合决策。", "机件表达"),
    teachingActivities: [
      { mode: "讲授", description: "讲解视图选型决策树：何时用剖视图、断面图", estimatedMinutes: 25 },
      { mode: "案例分析", description: "对照典型零件图分析表达策略选择", estimatedMinutes: 20 },
    ],
    textbookAnchors: [
      { textbookId: TEXTBOOK_DRAW, textbookTitle: "机械制图（第八版）", chapter: "第4章", section: "4.1-4.5", pageRange: "161-210" },
    ],
  },
  {
    ...kn("l3-kn-008", "螺纹紧固与键销齿轮的表达", "标准件族：螺纹紧固件及键·销·齿轮常见表达。", "标准件"),
    teachingActivities: [
      { mode: "讲授", description: "讲解螺纹规定画法与紧固件图例", estimatedMinutes: 25 },
      { mode: "实训操作", description: "对照实物标准件完成制图练习", estimatedMinutes: 35 },
    ],
    textbookAnchors: [
      { textbookId: TEXTBOOK_DRAW, textbookTitle: "机械制图（第八版）", chapter: "第5章", section: "5.1-5.4", pageRange: "211-250" },
    ],
  },
  {
    ...kn("l3-kn-009", "零件图技术要求（公差—粗糙—形位）", "一页纸讲清楚零件技术要求的主干。", "零件图装配图"),
    teachingActivities: [
      { mode: "讲授", description: "系统讲解公差、粗糙度与形位公差的标注语法", estimatedMinutes: 35 },
      { mode: "案例分析", description: "从轴承座零件图逐项解读技术要求含义", estimatedMinutes: 25 },
    ],
    textbookAnchors: [
      { textbookId: TEXTBOOK_DRAW, textbookTitle: "机械制图（第八版）", chapter: "第6章", section: "6.1-6.3", pageRange: "251-288" },
      { textbookId: TEXTBOOK_TOL, textbookTitle: "互换性与技术测量基础（第七版）", chapter: "第1章", section: "1.1-1.3", pageRange: "1-40" },
    ],
  },
  {
    ...kn("l3-kn-010", "装配图拆装与 BOM 语义", "装配关系、拆装顺序与技术要求的一体化。", "零件图装配图"),
    teachingActivities: [
      { mode: "讲授", description: "讲解装配图的表达方法与拆画零件图步骤", estimatedMinutes: 30 },
      { mode: "项目式", description: "分组完成齿轮泵装配图识读与拆图任务", estimatedMinutes: 60 },
    ],
    textbookAnchors: [
      { textbookId: TEXTBOOK_DRAW, textbookTitle: "机械制图（第八版）", chapter: "第7章", section: "7.1-7.4", pageRange: "289-340" },
    ],
  },
  {
    ...kn("l3-kn-011", "AutoCAD 图层与版面出图", "二维制图软件工作流收尾：图层、版面与批量出图。", "CAD建模"),
    teachingActivities: [
      { mode: "讲授", description: "讲解 AutoCAD 图层管理、版面配置与 PDF 批量输出", estimatedMinutes: 20 },
      { mode: "实训操作", description: "完成一幅 A3 图纸的全流程出图", estimatedMinutes: 60 },
    ],
    textbookAnchors: [
      { textbookId: TEXTBOOK_DRAW, textbookTitle: "AutoCAD 2022 实用教程", chapter: "第4章", section: "4.3-4.5", pageRange: "120-155" },
    ],
  },
  {
    ...kn("l3-kn-012", "三维特征—装配—工程图", "建模特征、装配约束与导出工程图的闭环。", "CAD建模"),
    teachingActivities: [
      { mode: "讲授", description: "讲解 SolidWorks 特征建模与装配约束类型", estimatedMinutes: 25 },
      { mode: "实训操作", description: "完成轴承座建模—装配—工程图出图链路", estimatedMinutes: 75 },
      { mode: "AI 协作探究", description: "探索 AI 辅助 CAD 脚本生成（批量打孔等）", estimatedMinutes: 20 },
    ],
    textbookAnchors: [
      { textbookId: TEXTBOOK_DRAW, textbookTitle: "AutoCAD 2022 实用教程", chapter: "第6章", section: "6.1-6.3", pageRange: "200-240" },
    ],
  },
  {
    ...kn("l3-kn-013", "车铣制造工艺入门", "与典型加工方式、装夹与测量的对应关系。", "制造工艺"),
    teachingActivities: [
      { mode: "讲授", description: "讲解车削、铣削基本加工原理与机床结构", estimatedMinutes: 25 },
      { mode: "情景模拟", description: "模拟工厂现场：按工艺卡完成单一工序操作", estimatedMinutes: 60 },
    ],
    textbookAnchors: [
      { textbookId: "legacy-mech-practice-2025", textbookTitle: "金工实习指导书（第三版）", chapter: "第2章", section: "2.1-2.4", pageRange: "30-70" },
    ],
  },
  {
    ...kn("l3-kn-014", "工业机器人工作站与安全示教", "坐标系—示教—节拍与安全。", "工业机器人", "ai_draft"),
    teachingActivities: [
      { mode: "讲授", description: "讲解机器人坐标系与安全操作规程", estimatedMinutes: 20 },
      { mode: "实训操作", description: "完成示教盒基本操作：点位录制与顺序控制", estimatedMinutes: 60 },
    ],
    textbookAnchors: [
      { textbookId: "legacy-mech-robotics-2025", textbookTitle: "工业机器人技术基础", chapter: "第3章", section: "3.1-3.3", pageRange: "60-95" },
    ],
  },
  {
    ...kn("l3-kn-015", "液压气动典型回路与互锁认知", "压力/节流/气动与互锁在设备中的位置。", "工程智能与AI"),
    teachingActivities: [
      { mode: "讲授", description: "讲解液压与气动基本回路元件与符号", estimatedMinutes: 30 },
      { mode: "案例分析", description: "分析液压夹紧回路的互锁安全逻辑", estimatedMinutes: 20 },
    ],
    textbookAnchors: [
      { textbookId: "legacy-mech-robotics-2025", textbookTitle: "工业机器人技术基础", chapter: "第5章", section: "5.1-5.2", pageRange: "130-155" },
    ],
  },
  {
    ...kn("l3-kn-016", "智能制造与孪生可视化入门", "将装配/工艺信息映射到孪生场景的入门叙事。", "工程智能与AI"),
    teachingActivities: [
      { mode: "讲授", description: "讲解数字孪生概念与工厂可视化典型应用", estimatedMinutes: 20 },
      { mode: "AI 协作探究", description: "借助 AI 工具探索将零件模型上传到孪生场景的基本流程", estimatedMinutes: 30 },
    ],
    textbookAnchors: [
      { textbookId: "legacy-mech-robotics-2025", textbookTitle: "工业机器人技术基础", chapter: "第7章", section: "7.1", pageRange: "180-195" },
    ],
  },
  {
    ...kn("l3-kn-017", "学科内生成式 AI 使用规范", "事实核验、引用与学术诚实的技术边界。", "工程智能与AI"),
    teachingActivities: [
      { mode: "讲授", description: "讲解 AI 生成内容的核验流程与学术诚实边界", estimatedMinutes: 20 },
      { mode: "讨论", description: "讨论：制图作业中 AI 参与的边界在哪里？", estimatedMinutes: 20 },
      { mode: "AI 协作探究", description: "使用 AI 辅助完成文档初稿，然后逐条核验准确性", estimatedMinutes: 30 },
    ],
    textbookAnchors: [
      { textbookId: TEXTBOOK_DRAW, textbookTitle: "机械制图（第八版）", chapter: "附录", section: "A", pageRange: "350-360" },
    ],
  },
  {
    ...kn("l3-kn-018", "专业图谱与路径意识（先导）", "理解课程链条与图谱节点在个人成长中的锚点。", "核心素养"),
    teachingActivities: [
      { mode: "讲授", description: "带领学生浏览专业知识图谱，理解课程间先修关系", estimatedMinutes: 20 },
      { mode: "讨论", description: "讨论：我为什么要学这门课？它在专业体系中的位置", estimatedMinutes: 15 },
    ],
    textbookAnchors: [
      { textbookId: TEXTBOOK_DRAW, textbookTitle: "机械制图（第八版）", chapter: "绪论", section: "", pageRange: "1-5" },
    ],
  },

  // ---- 技能点 ----
  {
    id: "l3-sk-001",
    professionId: PROF,
    kind: "skill_point",
    name: "形体分析与制图推理能力",
    description: "能把组合体拆分/重组并说明投影推理路径，结合实物演练提高空间想象力。",
    teachingActivities: [
      { mode: "项目式", description: "以真实零件为对象完成形体拆分分析报告", estimatedMinutes: 45 },
      { mode: "实训操作", description: "结合三坐标测量实训验证空间推理结果", estimatedMinutes: 30 },
    ],
    textbookAnchors: [
      { textbookId: TEXTBOOK_DRAW, textbookTitle: "机械制图（第八版）", chapter: "第3章", section: "3.1", pageRange: "99-112" },
    ],
    status: "confirmed",
    cluster: "组合体",
  },
  {
    id: "l3-sk-002",
    professionId: PROF,
    kind: "skill_point",
    name: "AutoCAD 二维制图与出图能力",
    description: "能以图层、块属性与版面完成规范二维工程图的全流程出图。",
    teachingActivities: [
      { mode: "实训操作", description: "完成轴类零件图的二维全流程出图练习", estimatedMinutes: 90 },
      { mode: "AI 协作探究", description: "探索 AI 辅助图层配置与批量出图脚本", estimatedMinutes: 20 },
    ],
    textbookAnchors: [
      { textbookId: TEXTBOOK_DRAW, textbookTitle: "AutoCAD 2022 实用教程", chapter: "第4章", section: "4.1-4.5", pageRange: "100-155" },
    ],
    status: "confirmed",
    cluster: "CAD建模",
  },
  {
    id: "l3-sk-003",
    professionId: PROF,
    kind: "skill_point",
    name: "三维建模与装配出图能力",
    description: "能建模—装配约束—工程图的一体化产出，具备 SolidWorks 基本工作流。",
    teachingActivities: [
      { mode: "实训操作", description: "完成轴承座的特征建模、装配约束与工程图出图", estimatedMinutes: 120 },
    ],
    textbookAnchors: [],
    status: "confirmed",
    cluster: "CAD建模",
  },

  // ---- 素养点 ----
  {
    id: "l3-lit-001",
    professionId: PROF,
    kind: "literacy_point",
    name: "工程规范意识",
    description: "能自觉按国标、公差与安全要求完成工程表达，具备可追溯性意识。",
    teachingActivities: [
      { mode: "讨论", description: "案例：不规范图纸导致加工错误的工厂案例讨论", estimatedMinutes: 20 },
      { mode: "情景模拟", description: "模拟图纸评审流程：挑出违规标注并记录", estimatedMinutes: 25 },
    ],
    textbookAnchors: [],
    status: "confirmed",
    cluster: "核心素养",
  },
  {
    id: "l3-lit-002",
    professionId: PROF,
    kind: "literacy_point",
    name: "持续学习与数字化适应能力",
    description: "能在工具快速迭代的环境中主动探索新工具，保持学习习惯。",
    teachingActivities: [
      { mode: "AI 协作探究", description: "自主探索一款新 CAD/AI 工具并完成简短演示汇报", estimatedMinutes: 30 },
    ],
    textbookAnchors: [],
    status: "ai_draft",
    cluster: "核心素养",
  },
];

// ---- 边 ----
export const l3Edges: L3Edge[] = [
  { id: "l3e-001", professionId: PROF, from: "l3-kn-001", to: "l3-kn-003", relation: "先修" },
  { id: "l3e-002", professionId: PROF, from: "l3-kn-002", to: "l3-kn-003", relation: "先修" },
  { id: "l3e-003", professionId: PROF, from: "l3-kn-003", to: "l3-kn-004", relation: "先修" },
  { id: "l3e-004", professionId: PROF, from: "l3-kn-004", to: "l3-kn-005", relation: "先修" },
  { id: "l3e-005", professionId: PROF, from: "l3-kn-005", to: "l3-kn-006", relation: "关联" },
  { id: "l3e-006", professionId: PROF, from: "l3-kn-005", to: "l3-kn-007", relation: "先修" },
  { id: "l3e-007", professionId: PROF, from: "l3-kn-007", to: "l3-kn-009", relation: "先修" },
  { id: "l3e-008", professionId: PROF, from: "l3-kn-008", to: "l3-kn-009", relation: "关联" },
  { id: "l3e-009", professionId: PROF, from: "l3-kn-009", to: "l3-kn-010", relation: "先修" },
  { id: "l3e-010", professionId: PROF, from: "l3-kn-011", to: "l3-kn-012", relation: "先修" },
  { id: "l3e-011", professionId: PROF, from: "l3-kn-014", to: "l3-kn-016", relation: "关联" },
  { id: "l3e-012", professionId: PROF, from: "l3-sk-001", to: "l3-kn-005", relation: "支撑" },
];

export const l3NodeById: Record<string, L3Node> = Object.fromEntries(
  l3Nodes.map((n) => [n.id, n]),
);
