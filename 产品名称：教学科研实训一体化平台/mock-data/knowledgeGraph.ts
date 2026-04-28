import type {
  GraphEdge,
  GraphEdgeRelation,
  GraphNode,
  GraphNodeKind,
  GraphNodeLayer,
  GraphNodeSource,
  GraphNodeStatus,
  GraphNodeType,
} from "./types";

/**
 * 机械工程知识图谱主图
 *
 * 叙事：**核心素养（中央）→ 能力（围层）→ 知识点（挂靠能力外向发散）→ 课程/实训（最外圈可读）**
 * 知识点已合并为大颗粒（18 条），避免「知识点极多、落地课程看起来很少」的假数据观感。
 */

const PROF = "prof-mech";

function source(fileName: string, locator: string, excerpt: string): GraphNodeSource {
  return { fileName, locator, excerpt };
}

const sourceByLayer: Record<GraphNodeLayer, GraphNodeSource> = {
  core: source("机械工程专业人才培养方案（2026版）", "毕业要求 1-5", "围绕工程表达、结构分析、制造实践、数字化协同与职业规范形成核心素养。"),
  ability: source("机械工程岗位JD样本集", "能力要求归并", "岗位要求可拆解为制图读图、数字化建模、检测质量与智能工具等多组能力簇。"),
  knowledge: source("《机械制图与CAD》等课程大纲合集", "能力→知识点挂载", "每个知识点挂载在少量能力点上，再由课程与实训映射落地。"),
  courseOrTraining: source("机械工程课程体系与实训项目清单", "课程-实训矩阵", "课程与实训作为知识点载体，每条课程/实训与若干合并后的知识点相关联。"),
};

const statusCycle: GraphNodeStatus[] = [
  "confirmed",
  "confirmed",
  "confirmed",
  "confirmed",
  "edited",
  "ai_draft",
];

function statusFor(index: number, forced?: GraphNodeStatus): GraphNodeStatus {
  return forced ?? statusCycle[index % statusCycle.length]!;
}

function lockedFor(status: GraphNodeStatus): boolean {
  return status !== "ai_draft";
}

function node(args: {
  id: string;
  name: string;
  nodeType: GraphNodeType;
  layer: GraphNodeLayer;
  cluster: string;
  description: string;
  index: number;
  kind?: GraphNodeKind;
  refCourseId?: string;
  refTrainingId?: string;
  status?: GraphNodeStatus;
  sources?: GraphNodeSource[];
}): GraphNode {
  const status = statusFor(args.index, args.status);
  return {
    id: args.id,
    professionId: PROF,
    name: args.name,
    nodeType: args.nodeType,
    layer: args.layer,
    kind: args.kind,
    refCourseId: args.refCourseId,
    refTrainingId: args.refTrainingId,
    cluster: args.cluster,
    description: args.description,
    status,
    locked: lockedFor(status),
    sources: args.sources ?? [sourceByLayer[args.layer]],
  };
}

const coreSpecs = [
  ["core-mech-001", "工程系统素养", "能从产业链与工程约束出发理解机械制造任务。"],
  ["core-mech-002", "机械结构素养", "能在图样—结构—拆装之间快速建立一致性理解。"],
  ["core-mech-003", "工程规范素养", "能按国标、公差与安全要求完成可追溯表达。"],
  ["core-mech-004", "数字化协同素养", "能用 CAD/CAM、仿真与离线工具串联方案与图纸。"],
  ["core-mech-005", "协同实践素养", "能在测绘、加工、装配实训中闭环交付图纸与实物。"],
] as const;

const abilitySpecs = [
  ["sk-mech-001", "徒手与国标制图表达能力", "能徒手草图与国标注解完成制图类基础任务。", "工程表达能力"],
  ["sk-mech-002", "AutoCAD 二维制图与出图能力", "能以图层、块属性与版面完成规范二维工程图。", "数字化表达能力"],
  ["sk-mech-003", "三维建模与装配出图能力", "能建模—装配约束—工程图的一体化产出。", "数字化表达能力"],
  ["sk-mech-004", "零件测绘与图样转化能力", "能测绘实物并转成可加工视图样稿。", "实践测绘能力"],
  ["sk-mech-005", "工程读图与拆图表达能力", "能读零件/装配图并还原结构与装配序列。", "工程表达能力"],
  ["sk-mech-006", "互换性与质量控制能力", "能选用公差配合、粗糙度并落实检测思路。", "质量检测能力"],
  ["sk-mech-007", "工艺规范与安全意识能力", "能把图纸要求转成工序与安全注意事项。", "质量检测能力"],
  ["sk-mech-008", "生成式 AI 辅助工程能力", "能在教师约束下用 AI 整料、校对与自检。", "智能工具能力"],
  ["sk-mech-009", "形体组成与制图推理能力", "能把组合体拆分/重组并说明投影推理路径。", "结构分析能力"],
  ["sk-mech-010", "投影线与空间推理能力", "能用点—线—面—体完成投影推演。", "结构分析能力"],
  ["sk-mech-011", "制造工艺入门能力", "能对应车铣等基础加工与质量控制点。", "制造实践能力"],
  ["sk-mech-012", "工业机器人与回路认知能力", "能在工作站、示教、液压与安全互锁间建立链路。", "智能制造能力"],
] as const;

/** 合并后 18 条知识点：粒度与一门课内「章」对齐，挂靠能力再通过 contain 分发 */
const knowledgeSpecs = [
  ["kn-mech-001", "制图与国标注解基础（幅面—图线—尺寸）", "制图标准框架与基础规定；作为多数制图课的共同起点。", "制图基础"],
  ["kn-mech-002", "几何作图与生活测绘入门", "基本几何构造、草图与现实物体测绘的一体化。", "几何作图"],
  ["kn-mech-003", "投影原理与三视图体系", "正投影特性与三视图关系；承上启下的枢纽知识点。", "投影基础"],
  ["kn-mech-004", "线面分析与立体回转体投影", "点线—面体的投影推演与曲面体画法。", "点线面投影"],
  ["kn-mech-005", "组合体分析与视图表征", "叠加/切割、形体分析与视图选择。", "组合体"],
  ["kn-mech-006", "截交线与相贯线要点", "交线求解思路与常见问题归纳。", "立体投影"],
  ["kn-mech-007", "机件表达策略（视图/剖切/断面）", "视图、剖视图、断面与简便表达的综合决策。", "机件表达"],
  ["kn-mech-008", "螺纹紧固与键销齿轮的表达", "标准件族：螺纹紧固件及键·销·齿轮常见表达。", "标准件"],
  ["kn-mech-009", "零件图技术要求（公差—粗糙—形位）", "一页纸讲清楚零件技术要求的主干。", "零件图装配图"],
  ["kn-mech-010", "装配图拆装与 BOM 语义", "装配关系、拆装顺序与技术要求的一体化。", "零件图装配图"],
  ["kn-mech-011", "AutoCAD 图层与版面出图", "二维制图软件的工作流收尾：图层、版面与批量出图。", "CAD建模"],
  ["kn-mech-012", "三维特征—装配—工程图", "建模特征、装配约束与导出工程图的闭环。", "CAD建模"],
  ["kn-mech-013", "车铣制造工艺入门", "与典型加工方式、装夹与测量的对应关系。", "制造工艺"],
  ["kn-mech-014", "工业机器人工作站与安全示教", "坐标系—示教—节拍与安全。", "工业机器人"],
  ["kn-mech-015", "液压气动典型回路与互锁认知", "压力/节流/气动与互锁在设备中的位置。", "工程智能与AI"],
  ["kn-mech-016", "智能制造与孪生可视化入门", "将装配/工艺信息映射到孪生场景的入门叙事。", "工程智能与AI"],
  ["kn-mech-017", "学科内生成式 AI 使用规范", "事实核验、引用与学术诚实的技术边界。", "工程智能与AI"],
  ["kn-mech-018", "专业图谱与路径意识（先导）", "理解课程链条与图谱节点在个人成长中的锚点。", "核心素养"],
] as const;

const courseSpecs = [
  ["course-mech-draw", "机械制图与CAD", "从投影到机件表达与数字化出图的一体化主干课。"],
  ["course-mech-design", "机械设计基础", "螺纹、齿轮传动与简易机械的设计表达。"],
  ["course-mech-practice", "金工实习", "图纸落到车铣实践的入门闭环。"],
  ["course-mech-intro", "机械工程专业导论", "建立专业能力地图与学习任务认知。"],
  ["course-mech-tolerance", "互换性与技术测量", "公差、粗糙度与测量的工程语言。"],
  ["course-mech-robotics", "工业机器人技术应用基础", "工作站、示教、仿真与安全。"],
  ["course-mech-hydraulic", "液压与气压传动", "典型回路与元件在设备中的角色。"],
  ["course-mech-process", "机械制造工艺学", "规程、定位与质量控制。"],
  ["course-mech-ai-lab", "学科内 AI 实训与应用", "用生成式 AI 完成作业与小型工程文档的合规方法。"],
] as const;

const trainingSpecs = [
  ["train-m-001", "徒手草图与测绘工作坊", "从身边零件进入工程表达的短训。"],
  ["train-m-002", "组合体视图专项实训", "强化形体分析与制图推理。"],
  ["train-m-003", "AutoCAD 齿轮轴实训", "二维出图与工作流收口。"],
  ["train-m-004", "SolidWorks 轴承座建模实训", "特征—装配—工程图链路。"],
  ["train-m-005", "装配图识读与拆装实训", "从装配图拆解结构关系。"],
  ["train-m-006", "三坐标测量与公差复检", "把图纸要求转成可测量的证据链。"],
  ["train-m-007", "工业机器人搬运节拍实训", "示教与节拍对齐。"],
  ["train-m-008", "金工切削与图纸一致性验证", "车铣件与视图对照。"],
  ["train-m-009", "液压回路装调与压力辨识", "把回路知识与装调体感对齐。"],
  ["train-m-010", "AI 文档辅写与核验工作坊", "在教师约束下的引用与自检。"],
  ["train-m-011", "孪生可视化装配巡检", "在孪生场景中完成简单巡检清单。"],
] as const;

const coreAbilityMap: Record<string, string[]> = {
  "core-mech-001": ["sk-mech-009", "sk-mech-010"],
  "core-mech-002": ["sk-mech-001", "sk-mech-004", "sk-mech-005", "sk-mech-009"],
  "core-mech-003": ["sk-mech-006", "sk-mech-007"],
  "core-mech-004": ["sk-mech-002", "sk-mech-003", "sk-mech-008", "sk-mech-016"],
  "core-mech-005": ["sk-mech-004", "sk-mech-011", "sk-mech-012", "sk-mech-014"],
};

const abilityKnowledgeMap: Record<string, string[]> = {
  /** 先导「专业图谱与路径」挂在制图表达入口能力上，形成 contain→Support 链路 */
  "sk-mech-001": ["kn-mech-001", "kn-mech-002", "kn-mech-018"],
  "sk-mech-002": ["kn-mech-009", "kn-mech-010", "kn-mech-011"],
  "sk-mech-003": ["kn-mech-005", "kn-mech-006", "kn-mech-012"],
  "sk-mech-004": ["kn-mech-002", "kn-mech-009"],
  "sk-mech-005": ["kn-mech-004", "kn-mech-005", "kn-mech-007", "kn-mech-010"],
  "sk-mech-006": ["kn-mech-008", "kn-mech-009"],
  "sk-mech-007": ["kn-mech-007", "kn-mech-013"],
  "sk-mech-008": ["kn-mech-017", "kn-mech-009"],
  "sk-mech-009": ["kn-mech-004", "kn-mech-005", "kn-mech-006", "kn-mech-008"],
  "sk-mech-010": ["kn-mech-003", "kn-mech-004"],
  "sk-mech-011": ["kn-mech-013", "kn-mech-015"],
  "sk-mech-012": ["kn-mech-014", "kn-mech-015", "kn-mech-016"],
};

const courseCoverage: Record<string, string[]> = {
  "course-mech-draw": [
    "kn-mech-001",
    "kn-mech-002",
    "kn-mech-003",
    "kn-mech-004",
    "kn-mech-005",
    "kn-mech-006",
    "kn-mech-007",
    "kn-mech-010",
    "kn-mech-011",
    "kn-mech-018",
  ],
  "course-mech-design": ["kn-mech-007", "kn-mech-008", "kn-mech-009", "kn-mech-010"],
  "course-mech-practice": ["kn-mech-013", "kn-mech-009"],
  "course-mech-intro": ["kn-mech-001", "kn-mech-003", "kn-mech-018"],
  "course-mech-tolerance": ["kn-mech-008", "kn-mech-009"],
  "course-mech-robotics": ["kn-mech-012", "kn-mech-014", "kn-mech-016"],
  "course-mech-hydraulic": ["kn-mech-015", "kn-mech-010"],
  "course-mech-process": ["kn-mech-009", "kn-mech-013", "kn-mech-010"],
  "course-mech-ai-lab": ["kn-mech-017", "kn-mech-016", "kn-mech-011", "kn-mech-012"],
};

const trainingCoverage: Record<string, string[]> = {
  "train-m-001": ["kn-mech-001", "kn-mech-002"],
  "train-m-002": ["kn-mech-005", "kn-mech-006"],
  "train-m-003": ["kn-mech-009", "kn-mech-011"],
  "train-m-004": ["kn-mech-012"],
  "train-m-005": ["kn-mech-010"],
  "train-m-006": ["kn-mech-009", "kn-mech-010"],
  "train-m-007": ["kn-mech-014"],
  "train-m-008": ["kn-mech-013", "kn-mech-009"],
  "train-m-009": ["kn-mech-015"],
  "train-m-010": ["kn-mech-017"],
  "train-m-011": ["kn-mech-016"],
};

const abilityTargetMap: Record<string, string[]> = {
  "sk-mech-001": ["course-mech-draw", "train-m-001"],
  "sk-mech-002": ["course-mech-draw", "train-m-003"],
  "sk-mech-003": ["course-mech-draw", "course-mech-design", "train-m-004"],
  "sk-mech-004": ["course-mech-draw", "train-m-001"],
  "sk-mech-005": ["course-mech-draw", "course-mech-design", "train-m-005"],
  "sk-mech-006": ["course-mech-tolerance", "course-mech-draw", "train-m-006"],
  "sk-mech-007": ["course-mech-process", "course-mech-practice", "train-m-008", "train-m-009"],
  "sk-mech-008": ["course-mech-ai-lab", "train-m-010"],
  "sk-mech-009": ["course-mech-draw", "course-mech-design", "train-m-002"],
  "sk-mech-010": ["course-mech-draw", "train-m-002"],
  "sk-mech-011": ["course-mech-process", "train-m-008"],
  "sk-mech-012": ["course-mech-robotics", "course-mech-hydraulic", "train-m-007", "train-m-011"],
};

const knowledgeDepends = [
  ["kn-mech-001", "kn-mech-003"],
  ["kn-mech-003", "kn-mech-004"],
  ["kn-mech-004", "kn-mech-005"],
  ["kn-mech-005", "kn-mech-007"],
  ["kn-mech-007", "kn-mech-009"],
  ["kn-mech-011", "kn-mech-012"],
  ["kn-mech-013", "kn-mech-009"],
  ["kn-mech-014", "kn-mech-016"],
  ["kn-mech-017", "kn-mech-009"],
] as const;

const courseDepends = [
  ["course-mech-intro", "course-mech-draw"],
  ["course-mech-draw", "course-mech-design"],
  ["course-mech-draw", "course-mech-tolerance"],
  ["course-mech-draw", "course-mech-practice"],
  ["course-mech-design", "course-mech-process"],
  ["course-mech-draw", "train-m-003"],
  ["course-mech-draw", "train-m-004"],
  ["course-mech-design", "train-m-005"],
  ["course-mech-practice", "train-m-008"],
  ["course-mech-tolerance", "train-m-006"],
  ["course-mech-robotics", "train-m-007"],
] as const;

const mechNodes: GraphNode[] = [
  ...coreSpecs.map(([id, name, description], index) =>
    node({
      id,
      name,
      description,
      nodeType: "核心素养",
      layer: "core",
      cluster: "核心素养",
      index,
    }),
  ),
  ...abilitySpecs.map(([id, name, description, cluster], index) =>
    node({
      id,
      name,
      description,
      nodeType: "能力",
      layer: "ability",
      cluster,
      index: index + 5,
    }),
  ),
  ...knowledgeSpecs.map(([id, name, description, cluster], index) =>
    node({
      id,
      name,
      description,
      nodeType: "知识点",
      layer: "knowledge",
      cluster,
      index: index + 17,
    }),
  ),
  ...courseSpecs.map(([id, name, description], index) =>
    node({
      id,
      name,
      description,
      nodeType: "课程",
      layer: "courseOrTraining",
      kind: "course",
      refCourseId: id,
      cluster: "课程",
      index: index + 36,
    }),
  ),
  ...trainingSpecs.map(([id, name, description], index) =>
    node({
      id,
      name,
      description,
      nodeType: "实训",
      layer: "courseOrTraining",
      kind: "training",
      refTrainingId: id,
      cluster: "实训",
      index: index + 45,
    }),
  ),
];

const mechEdges: GraphEdge[] = [];
const edgeKeys = new Set<string>();

function edge(from: string, to: string, relation: GraphEdgeRelation): void {
  const key = `${from}\0${to}\0${relation}`;
  if (edgeKeys.has(key)) return;
  edgeKeys.add(key);
  mechEdges.push({
    id: `e-m-${String(mechEdges.length + 1).padStart(3, "0")}`,
    professionId: PROF,
    from,
    to,
    relation,
  });
}

for (const [coreId, abilityIds] of Object.entries(coreAbilityMap)) {
  for (const abilityId of abilityIds) edge(coreId, abilityId, "contain");
}

for (const [abilityId, knowledgeIds] of Object.entries(abilityKnowledgeMap)) {
  for (const knowledgeId of knowledgeIds) {
    edge(abilityId, knowledgeId, "contain");
    edge(knowledgeId, abilityId, "Support");
  }
}

for (const [abilityId, targetIds] of Object.entries(abilityTargetMap)) {
  for (const targetId of targetIds) {
    edge(abilityId, targetId, "guide");
    edge(targetId, abilityId, "Cultivate");
  }
}

for (const [targetId, knowledgeIds] of Object.entries({
  ...courseCoverage,
  ...trainingCoverage,
})) {
  for (const knowledgeId of knowledgeIds) edge(targetId, knowledgeId, "Map to");
}

for (const [from, to] of knowledgeDepends) edge(from, to, "Depend");
for (const [from, to] of courseDepends) edge(from, to, "Depend");

edge("sk-mech-009", "sk-mech-010", "Influence");
edge("sk-mech-002", "sk-mech-003", "Influence");
edge("sk-mech-006", "sk-mech-007", "Influence");
edge("sk-mech-008", "sk-mech-003", "Influence");
edge("core-mech-003", "core-mech-005", "Influence");
edge("core-mech-004", "core-mech-001", "Influence");

export const graphNodes: GraphNode[] = [...mechNodes];
export const graphEdges: GraphEdge[] = [...mechEdges];

export const nodesByProfession: Record<string, GraphNode[]> = {
  "prof-mech": mechNodes,
};

export const edgesByProfession: Record<string, GraphEdge[]> = {
  "prof-mech": mechEdges,
};

export const nodeById: Record<string, GraphNode> = graphNodes.reduce(
  (acc, n) => ({ ...acc, [n.id]: n }),
  {} as Record<string, GraphNode>,
);
