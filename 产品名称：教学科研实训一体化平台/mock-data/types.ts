/**
 * 教学科研实训一体化平台 · 假数据类型定义
 *
 * 本文件是所有 mock 数据的类型真源（single source of truth）。
 * 任何新增实体/字段务必在这里先定义类型，再去对应的数据文件里补数据。
 */

// ============ 0. 基础通用类型 ============

export type ID = string;

export type ISODate = string; // 形如 "2026-03-15"
export type ISODateTime = string; // 形如 "2026-03-15T10:30:00+08:00"

export type UserRole = "teacher" | "student";

// ============ 1. 组织 & 人员 ============

/** 专业 */
export interface Profession {
  id: ID;
  name: string;
  code?: string; // 教育部学科代码（选填）
  college: string; // 所属学院
  description: string;
  hasKnowledgeGraph: boolean; // 是否已经建立知识图谱
  /** 知识图谱页可点开查看的培养方案及相关附件 id 列表，见 knowledgeGraphTrainingPlanDocs */
  knowledgeGraphTrainingPlanDocumentIds?: ID[];
}

/** 知识图谱页附件文档的业务类别（用于列表标签展示） */
export type KnowledgeGraphTrainingPlanAttachmentKind =
  | "talent_scheme"
  | "job_analysis"
  | "introductory"
  | "industry_outlook";

/** 知识图谱配套：专业关联的培养方案及补充附件（假数据，供交互页弹层展示） */
export interface KnowledgeGraphTrainingPlanDocument {
  id: ID;
  professionId: ID;
  kind: KnowledgeGraphTrainingPlanAttachmentKind;
  /** 列表、下载区展示用文件名 */
  fileName: string;
  /** 弹层中展示的正文（拟真节选） */
  content: string;
}

/** 学科/科目（挂在专业下） */
export interface Subject {
  id: ID;
  professionId: ID;
  name: string;
  description: string;
}

/** 班级 */
export interface Class {
  id: ID;
  professionId: ID;
  name: string; // 例如 "机制2301"
  grade: number; // 入学年份，例如 2023
  studentCount: number;
  headTeacherId: ID; // 班主任
  status: "in_session" | "graduated"; // 在读/已结业
  description?: string;
}

/** 学生 */
export interface Student {
  id: ID;
  name: string;
  gender: "男" | "女";
  classId: ID;
  studentNo: string; // 学号
  enrollYear: number;
  avatar?: string;
  /** 教师标记为学情关注对象，班级学情列表优先展示 */
  teacherFocus?: boolean;
}

/** 教师 */
export interface Teacher {
  id: ID;
  name: string;
  gender: "男" | "女";
  title: string; // 职称，例如 "副教授"
  college: string;
  department: string; // 教研室
  subjectIds: ID[]; // 所教学科
  /** 教研室主任等：可查看本专业全部课程 / 资源 / 实训等教学数据 */
  isDepartmentLead?: boolean;
  avatar?: string;
  email?: string;
}

// ============ 2. 档案 / 画像 ============

/** 学情雷达维度（班级/学生通用） */
export interface RadarDimension {
  name: string; // 维度名：基础知识、空间想象、绘图规范、综合应用、主动探究...
  score: number; // 0-100
}

/** 班级画像（学情档案） */
export interface ClassProfile {
  classId: ID;
  scoreDistribution: {
    excellent: number; // 优秀人数 (>=85)
    good: number; // 良好 (70-84)
    medium: number; // 中等 (60-69)
    poor: number; // 不及格 (<60)
    averageScore: number; // 平均分
    stdDev: number; // 标准差
  };
  radar: RadarDimension[]; // 多维度雷达
  strengths: string[]; // 擅长方向（AI 生成标签）
  weaknesses: string[]; // 薄弱方向
  styleTag: string; // 班级风格标签：活跃型 / 沉稳型 / 两极分化...
  aiSummary: string; // AI 生成的班级画像文字总结
  generatedAt: ISODateTime; // 画像生成时间
  generatedBy: "ai" | "manual";
  /** 当前教/学到的小节 id（与 currentPlanForClass 对应计划内 section.id 一致） */
  progressSectionId?: ID;
  /** 学情建议在教学设计中穿插巩固的小节 id */
  designReviewSectionIds?: ID[];
}

/** 学生画像 */
export interface StudentProfile {
  studentId: ID;
  interests: string[]; // 兴趣爱好
  goodAt: string[]; // 擅长科目/方向
  learningStyle: "视觉型" | "听觉型" | "动觉型" | "读写型" | "混合型";
  activity: "高" | "中" | "低"; // 课堂活跃度
  masteryHeatmap: Array<{
    knowledgePointId: ID;
    knowledgePointName: string;
    masteryLevel: number; // 0-100
  }>;
  recentScores: Array<{
    taskName: string;
    score: number;
    date: ISODate;
  }>;
  aiSummary: string;
  generatedAt: ISODateTime;
}

// ============ 3. 知识图谱 ============

export type GraphNodeLayer =
  | "core"
  | "ability"
  | "knowledge"
  | "courseOrTraining";

export type GraphNodeKind = "course" | "training";

export type GraphNodeType = "核心素养" | "能力" | "知识点" | "课程" | "实训";

export type GraphNodeStatus = "ai_draft" | "edited" | "confirmed";

export interface GraphNodeSource {
  fileName: string;
  locator: string;
  excerpt: string;
}

/** 图谱节点 */
export interface GraphNode {
  id: ID;
  professionId: ID; // 所属专业图谱
  name: string;
  /** UI 中文标签，兼容旧组件；业务层级以 layer 为准 */
  nodeType: GraphNodeType;
  layer: GraphNodeLayer;
  /** 仅课程/实训节点使用 */
  kind?: GraphNodeKind;
  /** 引用内容库课程实体，避免复制课程详情 */
  refCourseId?: ID;
  /** 引用实训项目实体，避免复制实训详情 */
  refTrainingId?: ID;
  cluster: string; // 主题簇名（用于布局分组）
  description: string;
  /** AI 生成/人工编辑/确认状态，用于动态建图与重新生成 diff */
  status: GraphNodeStatus;
  /** 人工确认或编辑后锁定，重新生成时默认不覆盖 */
  locked: boolean;
  /** 来源片段；AI 草稿与确认节点必须可追溯 */
  sources: GraphNodeSource[];
  /** 辅助视觉：用于前端渲染时按簇着色（可选） */
  clusterColor?: string;
}

export type GraphEdgeRelation =
  | "contain"
  | "guide"
  | "Influence"
  | "Cultivate"
  | "Support"
  | "Map to"
  | "Depend"
  | "Decide"
  | "Belong to";

export const allowedGraphEdgeRelations: Record<
  GraphEdgeRelation,
  Array<{
    from: GraphNodeLayer | "source";
    to: GraphNodeLayer;
  }>
> = {
  contain: [
    { from: "core", to: "ability" },
    { from: "ability", to: "knowledge" },
  ],
  guide: [{ from: "ability", to: "courseOrTraining" }],
  Influence: [
    { from: "core", to: "core" },
    { from: "ability", to: "ability" },
  ],
  Cultivate: [{ from: "courseOrTraining", to: "ability" }],
  Support: [{ from: "knowledge", to: "ability" }],
  "Map to": [{ from: "courseOrTraining", to: "knowledge" }],
  Depend: [
    { from: "knowledge", to: "knowledge" },
    { from: "courseOrTraining", to: "courseOrTraining" },
  ],
  Decide: [{ from: "source", to: "core" }],
  "Belong to": [
    { from: "ability", to: "core" },
    { from: "knowledge", to: "ability" },
    { from: "courseOrTraining", to: "ability" },
  ],
};

/** 图谱边 */
export interface GraphEdge {
  id: ID;
  professionId: ID;
  from: ID; // 源节点
  to: ID; // 目标节点
  relation: GraphEdgeRelation;
}

// -------- 教学计划专属知识路径（节点 ID 必须与专业知识图谱 graphNodes 一致；边为全库边的子集） --------

export interface PlanKGraphNode {
  id: ID;
  name: string;
  nodeType: GraphNodeType;
  layer: GraphNodeLayer;
  kind?: GraphNodeKind;
  status?: GraphNodeStatus;
  /** 与 graphLayout 中 clusterColor 对齐的教学模块/阶段名，用于分簇与着色 */
  cluster: string;
  description: string;
  /** 本计划内是否标为重点（如当前学期焦点章节） */
  focus?: boolean;
}

export interface PlanKGraphEdge {
  id: ID;
  from: ID;
  to: ID;
  relation: GraphEdgeRelation;
}

/** 单份教学计划知识路径图（节点来自全库，边为诱导子图或已写入全库的补边） */
export interface PlanKnowledgePathGraph {
  planId: ID;
  /** 简短说明，展示在图上方 */
  caption: string;
  nodes: PlanKGraphNode[];
  edges: PlanKGraphEdge[];
}

// ============ 4. 内容库：课程 / 资源 / 实训 ============

/** 课程 */
export interface Course {
  id: ID;
  name: string;
  coverUrl?: string;
  professionId: ID;
  subjectId: ID;
  description: string;
  credit: number; // 学分
  totalHours: number; // 总学时
  semester: string; // 学期，例如 "2026春季"
  /** 挂载的图谱节点（多对多） */
  knowledgeNodeIds: ID[];
  ownerTeacherId: ID;
  tags: string[];
  /** 图谱差异分析后，AI 对该课程给出的优化建议（学院端课程中心展示） */
  aiSuggestion?: CourseAiSuggestion;
}

/**
 * AI 对已有课程的建议类型：补资料、调课时或两者。
 * 由图谱差异分析 mock 预置，非运行时计算。
 */
export type CourseAiSuggestionKind =
  | "add_resource"
  | "adjust_hours"
  | "add_resource_and_hours";

export interface CourseAiSuggestion {
  kind: CourseAiSuggestionKind;
  summary: string;
  reason: string;
  /** 当前图谱中尚未被本课有效覆盖的知识点 */
  uncoveredNodeIds: ID[];
  suggestedHoursDelta?: number;
  suggestedResourceTypes?: ResourceType[];
  generatedAt: ISODateTime;
}

/** 资源类型 */
export type ResourceType =
  | "doc" // 文档
  | "ppt"
  | "video"
  | "audio"
  | "image"
  | "code"
  | "dataset"
  | "quiz" // 题库
  | "online_course"; // 线上课程（关联外部慕课平台）

/**
 * AI 建议新增的虚拟课程（尚未写入 `courses` 列表，在课程中心以虚拟行展示）。
 */
export interface SuggestedNewCourse {
  id: ID;
  name: string;
  professionId: ID;
  subjectId?: ID;
  recommendedCredit: number;
  recommendedHours: number;
  semester: string;
  uncoveredNodeIds: ID[];
  reason: string;
  generatedAt: ISODateTime;
}

/**
 * 教学资源中引用的外部慕课课程（教师从其他平台目录中选择后挂载）。
 * 正文学习在源站完成，本平台仅存引用与导读元数据。
 */
export interface MoocCourseLink {
  platformId: ID;
  platformName: string;
  externalCourseId: ID;
  externalTitle: string;
  courseUrl: string;
}

/** 教学资源 */
export interface Resource {
  id: ID;
  title: string;
  type: ResourceType;
  professionId: ID; // 所属专业（主挂载）
  courseIds: ID[]; // 所属课程
  trainingIds?: ID[]; // 所属实训；资源作为课程/实训的资料内容，不再作为图谱节点
  description: string;
  duration?: string; // 视频/音频时长 "12:35"
  sizeMb?: number;
  uploaderTeacherId: ID;
  uploadedAt: ISODateTime;
  thumbnailUrl?: string;
  tags: string[];
  /** 是否由平台 AI 生成（教学设计产物回写的也在这里标） */
  isAiGenerated?: boolean;
  /** 当 type 为 online_course 时，关联的外部慕课 */
  moocLink?: MoocCourseLink;
  /**
   * 可见性：省略视为公共。公共：教师范围内共享；学生自动推荐仅收录公共。
   * 个人：仅上传者与教研室主任可见，由上传者切换为公共。
   */
  visibility?: "public" | "personal";
}

/**
 * 教学计划某小节已挂载的课程资源（本节资源清单）。
 * 可与资源库 {@link Resource} 关联，也可仅存本地上传附件元数据。
 */
export interface PlanSectionResourceItem {
  id: ID;
  planId: ID;
  sectionId: ID;
  /** 列表主标题（可与资源库标题不同） */
  title: string;
  /** 关联资源库 id；未填表示仅存于本节的附件占位 */
  resourceId?: ID;
  /** 文件名或附件展示名 */
  displayName: string;
  kind: ResourceType;
  status: "draft" | "published";
  uploaderTeacherId: ID;
  updatedAt: ISODateTime;
  sizeMb?: number;
}

/** 实训项目 */
export interface TrainingProject {
  id: ID;
  name: string;
  professionId: ID;
  knowledgeNodeIds: ID[];
  courseIds: ID[];
  description: string;
  difficulty: "入门" | "进阶" | "综合";
  estimatedHours: number; // 预估课时
  goals: string[]; // 实训目标
  deliverables: string[]; // 交付物
  environment?: string; // 执行环境占位描述（如"AutoCAD 2024 + 三维模型库"）
  coverUrl?: string;
  ownerTeacherId: ID;
  tags: string[];
}

// ============ 5. 教学闭环 ============

/** AI 人设 */
export interface Persona {
  id: ID;
  name: string;
  description: string;
  systemPrompt: string; // 系统指令示例
  memory?: string; // 长期记忆片段
  avatar?: string;
  isPreset: boolean; // true = 平台预置，false = 教师自定义
  ownerTeacherId?: ID; // 自定义人设归属教师
  scene: "讲义" | "课堂" | "作业" | "通用";
}

/** 教学策略模板 */
export interface TeachingStrategy {
  id: ID;
  name: string; // 例如 "循序渐进型"
  description: string;
  source: "platform" | "college" | "department" | "personal";
  ownerTeacherId?: ID;
  /** 模板内置的三个方向建议 */
  paceSuggestion: string; // 授课节奏
  difficultyCurve: string; // 难度曲线
  activitySuggestion: string; // 活动建议
  fitFor: string[]; // 适合的班级类型标签
}

/** 教学计划 · 小节 */
export interface PlanSection {
  id: ID;
  title: string;
  plannedDate: ISODate; // 计划授课日期（精确到天）
  knowledgeNodeIds: ID[]; // 引用的图谱节点，可跨能力/知识点/课程/实训层
  subgraphEdgeIds?: ID[]; // 本小节引用的图谱边，用于计划路径迷你图
  objectives: string[]; // 教学目标
  durationMinutes: number; // 课时（分钟）
  hasDesign: boolean; // 是否已经做了教学设计
}

/** 教学计划 · 章节 */
export interface PlanChapter {
  id: ID;
  title: string;
  summary?: string;
  sections: PlanSection[];
}

/** 教学计划 */
export interface TeachingPlan {
  id: ID;
  title: string;
  courseId: ID;
  professionId: ID;
  subjectId: ID;
  creatorTeacherId: ID;
  classIds: ID[]; // 一个计划可对应多个班级
  strategyId: ID;
  /** 教学策略被 AI 生成/教师编辑后的具体文案 */
  strategyBrief: string;
  semester: string;
  startDate: ISODate;
  endDate: ISODate;
  status: "draft" | "in_progress" | "completed";
  chapters: PlanChapter[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  /** 基于班级学情生成的 AI 建议（详细分析） */
  aiAdvice: string;
  /** 派生自哪份 L2 标准课程计划（三层图谱模型中的 L2 节点 ID） */
  derivedFromL2PlanId?: ID;
  /** 相对于标准课程计划的学情微调差异，仅记录被覆盖的字段 */
  overrides?: Array<{
    sectionId: ID;
    field: "plannedDate" | "durationMinutes" | "objectives" | "knowledgeNodeIds";
    value: unknown;
    reason?: string;
  }>;
}

// ============ 教学设计 ============

export type DesignTab = "讲义" | "课堂" | "作业" | "AI融合";

/** 对话消息 */
export interface ChatMessage {
  id: ID;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: ISODateTime;
}

/** 教学设计输出产物 */
export interface DesignOutput {
  id: ID;
  type:
    | "讲义pdf"
    | "思维导图"
    | "微课视频"
    | "互动H5"
    | "教案"
    | "PPT"
    | "课堂活动"
    | "计时表"
    | "客观题组卷"
    | "主观题"
    | "编程题"
    | "实训任务"
    | "AI融合建议包"
    | "AI实训练习";
  title: string;
  previewUrl?: string;
  sizeLabel?: string; // "3.2 MB"
  durationLabel?: string; // "8 分钟"
  createdAt: ISODateTime;
  summary: string; // 简介（显示在右侧卡片上）
  tags?: string[];
}

/** 教学设计（一个计划的一个小节 × 一个 Tab 对应一个设计会话） */
export interface TeachingDesign {
  id: ID;
  planId: ID;
  sectionId: ID;
  tab: DesignTab;
  personaId: ID;
  /** 知识文件引用 */
  knowledgeFiles: Array<{
    source: "local" | "knowledge_base" | "resource_library" | "internet";
    refId: ID;
    name: string;
  }>;
  chatHistory: ChatMessage[];
  outputs: DesignOutput[];
  /**
   * 学情首屏模拟：AI 首条回复「生成」前，右栏产物仅用本列表（可与 outputs 形成「草案→定稿」对比）。
   * 未设置时不影响现有页面。
   */
  outputsBeforeInitialAiReply?: DesignOutput[];
  updatedAt: ISODateTime;
}

// ============ v2.0 教学计划 & 教学设计类型 ============

/** v2.0 教学计划 · 课时（最小教学组织单元，替代 PlanSection） */
export interface PlanLesson {
  id: ID;
  planId: ID;
  lessonNo: number; // 课时序号（从 1 起连续编号）
  date: ISODate; // 计划授课日期
  durationMinutes: number; // 课时时长（分钟）
  /** 知识点 ID 列表 */
  knowledgePointIds: ID[];
  /** 知识点名称列表（冗余，方便列表直接展示） */
  knowledgePointNames: string[];
  /** 关联资源 ID */
  resourceIds: ID[];
  /** 资源类型标签 */
  resourceTypes: ResourceType[];
  /** AI 自动生成的课时备注/建议 */
  aiNote?: string;
  status: "planned" | "in_progress" | "completed" | "skipped";
  /** 是否已完成教学设计 */
  hasDesign: boolean;
  /** 教学目标 */
  objectives: string[];
}

/** v2.0 教学计划（去掉 classIds，lessons 平铺代替 chapters） */
export interface TeachingPlanV2 {
  id: ID;
  title: string;
  courseId: ID;
  professionId: ID;
  subjectId: ID;
  creatorTeacherId: ID;
  /** v2.0: 不再有 classIds — 一门课一份统一计划 */
  strategyTag: ID; // 选用的策略模板 id
  customStrategy?: string; // 教师自定义策略文本
  strategyBrief: string;
  semester: string;
  startDate: ISODate;
  endDate: ISODate;
  status: "draft" | "in_progress" | "completed";
  totalLessons: number;
  /** v2.0: 课时列表（平铺，不再嵌套 chapters） */
  lessons: PlanLesson[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  aiAdvice: string;
  derivedFromL2PlanId?: ID;
}

/** v2.0 教学设计输出类型枚举（7种产出物） */
export type DesignOutputTypeV2 =
  | "lecture_note" // 讲义
  | "audio" // 音频讲解
  | "ppt" // 课件PPT
  | "mindmap" // 思维导图
  | "micro_video" // 微课视频
  | "lesson_plan" // 教案
  | "homework"; // 作业题

/** v2.0 教学设计输出产物 */
export interface DesignOutputV2 {
  id: ID;
  type: DesignOutputTypeV2;
  title: string;
  previewUrl?: string;
  sizeLabel?: string; // "3.2 MB"
  durationLabel?: string; // "8 分钟"
  createdAt: ISODateTime;
  summary: string;
  tags?: string[];
}

/** v2.0 教学设计（一个课时对应一个统一的设计会话，不再按 Tab 拆分） */
export interface TeachingDesignV2 {
  id: ID;
  planId: ID;
  /** v2.0: lessonId 替代 sectionId */
  lessonId: ID;
  /** 班级 ID（多班批量编辑时每个班一份） */
  classId?: ID;
  /** AI化开关 */
  aiFlag: boolean;
  /** 思政化开关 */
  politicsFlag: boolean;
  /** 知识文件引用 */
  knowledgeFiles: Array<{
    source: "local" | "knowledge_base" | "resource_library" | "internet";
    refId: ID;
    name: string;
  }>;
  chatHistory: ChatMessage[];
  /** v2.0: 统一输出面板，7 种类型 */
  outputs: DesignOutputV2[];
  /**
   * 学情首屏模拟：AI 首条回复「生成」前，右栏产物仅用本列表
   */
  outputsBeforeInitialAiReply?: DesignOutputV2[];
  updatedAt: ISODateTime;
}

/** v2.0 课时详情中的班级作业评价行 */
export interface LessonClassHomeworkEval {
  classId: ID;
  className: string;
  homeworkContent: string;
  submissionRate: number; // 0-1
  averageScore: number;
  weakKnowledgePoints: string[];
  evalStatus: "evaluated" | "pending" | "not_assigned";
}

// ============ 协同评价：作业 & 考试 ============

/** 集中错题（知识点或题目聚合） */
export interface HotWrongPoint {
  name: string;
  knowledgeNodeId?: ID;
  wrongRate: number; // 0-1
  sampleWrongAnswer?: string;
  aiCause: string; // AI 分析的错因
}

/** 重点关注学生 */
export interface KeyStudent {
  studentId: ID;
  studentName: string;
  reason: string; // 入选原因标签
  score?: number;
  changeTrend?: "上升" | "下降" | "稳定";
}

/** AI 总洞察卡 */
export interface AiInsight {
  id: ID;
  title: string;
  summary: string;
  actionSuggestion: string; // 给老师的行动建议
  /**
   * 若填写，则展示「调整课程」入口：跳转教学计划详情 → 教学路径，并定位到该小节
   *（用于根据答题结果建议增删调课时/更换进度节点）
   */
  adjustCourse?: {
    planId: ID;
    sectionId: ID;
    /** 副标题/按钮说明，如「3.4 截交线与相贯线专题」 */
    label?: string;
  };
}

/**
 * 单次作业/考试中一名学生的批阅结果（与 questionAccuracy 题目顺序一一对应；未提交无逐题数据）
 * 由 evalResultBuilders 生成，与汇总字段在 Demo 级大致一致，非严格联立方程解。
 */
export interface QuestionAttempt {
  questionNo: number;
  score: number;
  maxScore: number;
  studentAnswer: string;
  correctAnswer: string;
  aiComment: string;
  knowledgeNodeId?: ID;
}

/** 与汇总 aiRatings 四档一致：优秀 / 良好 / 及格 / 待帮扶 */
export type EvalTierTag = "excellent" | "good" | "pass" | "fail";

/** 总评：标准等级标签（单选）+ 评语 */
export interface StudentEvalNarrative {
  tier: EvalTierTag;
  comment: string;
}

export interface StudentEvalResult {
  studentId: ID;
  submitted: boolean;
  totalScore?: number;
  questionCorrect?: boolean[];
  questionAttempts?: QuestionAttempt[];
  /** AI 总评（优先生成/展示） */
  aiEval?: StudentEvalNarrative;
  /** 教师总评（可由会话内编辑覆盖展示） */
  teacherEval?: StudentEvalNarrative;
}

/** 作业评价汇总（每次作业一条） */
export interface HomeworkEvalSummary {
  id: ID;
  homeworkTitle: string;
  courseId: ID;
  planId?: ID;
  sectionId?: ID;
  classId: ID;
  teacherId: ID;
  assignedAt: ISODate;
  dueAt: ISODate;
  submissionCount: number;
  totalStudents: number;
  averageScore: number;
  maxScore: number;
  minScore: number;
  scoreBuckets: Array<{ range: string; count: number }>; // 分数段
  aiRatings: {
    excellent: number;
    good: number;
    pass: number;
    fail: number;
  };
  hotWrongPoints: HotWrongPoint[];
  keyStudents: KeyStudent[];
  aiInsights: AiInsight[];
  /** 每道题/每个知识点的正确率 */
  questionAccuracy: Array<{
    questionNo: number;
    title: string;
    knowledgeNodeId?: ID;
    accuracy: number;
  }>;
  /** 本班已提交/未交学生的逐题批阅（用于协同评价详情名单联动） */
  studentResults: StudentEvalResult[];
}

/** 写入 studentResults 前 homework 行数据的形状 */
export type HomeworkEvalInput = Omit<HomeworkEvalSummary, "studentResults">;

/** 考试评价汇总 */
export interface ExamEvalSummary {
  id: ID;
  examTitle: string;
  courseId: ID;
  classIds: ID[]; // 考试可能跨多个班级
  teacherId: ID;
  examAt: ISODate;
  totalStudents: number;
  submittedCount: number;
  averageScore: number;
  maxScore: number;
  minScore: number;
  passRate: number; // 0-1
  scoreBuckets: Array<{ range: string; count: number }>;
  hotWrongPoints: HotWrongPoint[];
  keyStudents: KeyStudent[];
  aiInsights: AiInsight[];
  classComparison: Array<{
    classId: ID;
    avgScore: number;
    passRate: number;
  }>;
  /**
   * 大题/知识点正确率（与作业评价「题目正确率」同构；未开考的考试可省略）
   */
  questionAccuracy?: Array<{
    questionNo: number;
    title: string;
    knowledgeNodeId?: ID;
    accuracy: number;
  }>;
  /** 参考班级内已交卷/缺考学生的逐题批阅 */
  studentResults: StudentEvalResult[];
}

/** 写入 studentResults 前考试行数据（无 questionAccuracy 时由生成器跳过逐题列） */
export type ExamEvalInput = Omit<ExamEvalSummary, "studentResults">;

// ============ 三层知识图谱模型（L1 / L2 / L3） ============
// L1 产业培养图谱：唯一走 Schema→AI→人工 严格流程
// L2 标准课程计划集合：直接编辑或导入合成，不走 Schema
// L3 教学单元图谱：直接编辑，不走 Schema
// 层间桥均为集合包裹（父节点 ⊃ 子节点 IDs）

export type KGLayer = "L1" | "L2" | "L3";

// -------- 输入材料 --------

export type KGMaterialKind =
  | "industry_demand"       // 产业需求报告
  | "talent_scheme"         // 专业人才培养方案（与旧 talent_scheme 对齐）
  | "core_material"         // 专业核心材料（导引 / 能力指标等）
  | "job_jd"                // 岗位 JD
  | "lab_ue_coop_project"   // 实验室校企合作项目（任务书/课题清单等）
  | "textbook"              // 教材
  | "case_archive"          // 学校积累案例文档
  | "industry_case"         // 产业案例（企业现场/产线真实情境）
  | "industry_outlook"      // 行业形势简报（与旧 industry_outlook 对齐）
  | "legacy_course_plan_meta"; // 教务系统导出的旧课程计划元信息

/** 统一图谱依据材料（与旧 KnowledgeGraphTrainingPlanDocument 共存，旧类型不删） */
export interface KGSourceMaterial {
  id: ID;
  professionId: ID;
  kind: KGMaterialKind;
  /** 主要供哪一层（L1）的 AI 提炼使用；L3 的教材单独列 textbookAnchors */
  primaryLayer: KGLayer;
  fileName: string;
  /** 弹层展示的正文节选 */
  content: string;
  uploadedAt: ISODateTime;
  uploaderId: ID;
}

// -------- 前端视图状态 --------

export interface KGNodeViewState {
  nodeId: ID;
  layer: KGLayer;
  expanded: boolean;
  expansionLevel?: "summary" | "full";
}

export interface KGPageViewState {
  professionId: ID;
  layerVisible: Record<KGLayer, boolean>;
  expandAllLayer?: KGLayer;
  /** 主线视图：只显示 isSpine/onSpine 的节点和桥 */
  spineOnly: boolean;
  focusSubjectId?: ID;
  nodeStates: KGNodeViewState[];
}

// -------- L1 产业培养图谱 --------

export type L1NodeTypeCode =
  | "industry_demand"
  | "job_competency"
  | "core_literacy"
  | "ability"
  | "training_goal"
  | "course_standard";

export interface L1SchemaNodeTypeDef {
  code: L1NodeTypeCode;
  label: string;
  color?: string;
  /** 该类型节点是否可以出现在主线上 */
  canBeOnSpine?: boolean;
}

export interface L1SchemaEdgeTypeDef {
  code: string;
  label: string;
  fromTypes: L1NodeTypeCode[];
  toTypes: L1NodeTypeCode[];
  isSpineCandidate?: boolean;
}

/** L1 Schema：教师编写节点类型与边类型，是 L1 建图的前提 */
export interface L1Schema {
  id: ID;
  professionId: ID;
  name: string;
  nodeTypes: L1SchemaNodeTypeDef[];
  edgeTypes: L1SchemaEdgeTypeDef[];
  /** 推荐上传哪些类型的输入材料 */
  inputMaterialKinds: KGMaterialKind[];
  source: "platform_template" | "college" | "department" | "personal";
  ownerTeacherId?: ID;
  status: "draft" | "published";
  updatedAt: ISODateTime;
}

/** L1 节点 */
export interface L1Node {
  id: ID;
  professionId: ID;
  schemaTypeCode: L1NodeTypeCode;
  name: string;
  description: string;
  /** 严格三态 */
  status: GraphNodeStatus; // 复用旧 "ai_draft" | "edited" | "confirmed"
  locked: boolean;
  /** 必须可追溯：指向提炼来源材料 */
  sourceMaterialIds: ID[];
  /** 学科侧重 */
  subjectFocus?: Array<{ subjectId: ID; emphasis: "主修" | "辅修" | "拓展" }>;
  onSpine?: boolean;
  cluster?: string;
}

/** L1 边 */
export interface L1Edge {
  id: ID;
  professionId: ID;
  schemaEdgeCode: string;
  from: ID;
  to: ID;
  relation: string;
  isSpine?: boolean;
}

// -------- L2 标准课程计划集合 --------

/** 教务系统导入的课程基础元信息（仅元数据，不含 chapters） */
export interface LegacyCoursePlanMeta {
  id: ID;
  professionId: ID;
  courseName: string;
  courseCode?: string;
  totalHours: number;
  credit: number;
  textbooks: Array<{ title: string; author?: string; isbn?: string }>;
  language: "中文" | "英文" | "双语";
  semester: string;
  source: "academic_system" | "manual_upload";
  importedAt: ISODateTime;
}

/** L2 标准课程计划（专业级、不绑班级）——每个节点即为一份此结构 */
export interface L2StandardCoursePlan {
  id: ID;
  professionId: ID;
  courseId: ID;
  subjectId: ID;
  title: string;
  /** 教务基础元信息来源 */
  importedFromLegacyMetaId?: ID;
  /** 关联 L1 的上游节点（能力 / 课程标准） */
  derivedFromL1NodeIds: ID[];
  /** 专业级培养目标（对接 L1 课程标准描述） */
  competencyTargets: string[];
  /** 章节-小节结构，与 TeachingPlan.chapters 同构 */
  chapters: PlanChapter[];
  totalHours: number;
  status: "draft" | "released";
  generatedBy: "import" | "ai_synthesis" | "manual";
  /** AI 合成日志（仅 ai_synthesis 时有） */
  generationTrace?: {
    legacyMetaSnapshot: string;
    appliedL1NodeIds: ID[];
    diffSummary: string;
    generatedAt: ISODateTime;
  };
  updatedAt: ISODateTime;
}

// -------- L3 教学单元图谱 --------

export type TeachingActivityMode =
  | "讲授"
  | "讨论"
  | "案例分析"
  | "项目式"
  | "翻转课堂"
  | "情景模拟"
  | "实训操作"
  | "AI 协作探究";

export interface TeachingActivity {
  mode: TeachingActivityMode;
  description: string;
  estimatedMinutes?: number;
  /** 推荐配套的资源 ID（可为空） */
  sampleResourceIds?: ID[];
}

export interface TextbookAnchor {
  textbookId: ID;   // 对应 LegacyCoursePlanMeta.textbooks 的 isbn 或自定义 ID
  textbookTitle: string;
  chapter: string;
  section?: string;
  pageRange?: string;
}

export type L3NodeKind = "knowledge_point" | "skill_point" | "literacy_point";

/** L3 节点 */
export interface L3Node {
  id: ID;
  professionId: ID;
  kind: L3NodeKind;
  name: string;
  description: string;
  /** 每个知识/技能/素养点适合的讲解模式（必填至少 1 条） */
  teachingActivities: TeachingActivity[];
  /** 教材锚点（仅 L3，必须与教材关联） */
  textbookAnchors: TextbookAnchor[];
  /** 学科内的侧重方向 */
  subjectFocus?: Array<{ subjectId: ID; emphasis: "主修" | "辅修" | "拓展"; note?: string }>;
  status: GraphNodeStatus; // 复用旧三态；L3 不强制走严格流程但保留审阅状态
  cluster?: string;
}

export type L3EdgeRelation = "先修" | "关联" | "同质" | "支撑";

/** L3 边 */
export interface L3Edge {
  id: ID;
  professionId: ID;
  from: ID;
  to: ID;
  relation: L3EdgeRelation;
}

// -------- 层间桥（集合包裹） --------

/** L1 → L2：某个 L1 节点（能力/课程标准）包含一组 L2 标准课程计划 */
export interface L1ToL2Bridge {
  id: ID;
  professionId: ID;
  l1NodeId: ID;
  l2PlanIds: ID[];
  note?: string;
}

/** L2 → L3：某份 L2 计划（或其某个小节）包含一组 L3 节点 */
export interface L2ToL3Bridge {
  id: ID;
  professionId: ID;
  container:
    | { kind: "plan"; l2PlanId: ID }
    | { kind: "section"; l2PlanId: ID; sectionId: ID };
  l3NodeIds: ID[];
  note?: string;
}

// -------- 案例 → 产业课题 --------

/** 学校积累的原始案例 */
export interface SchoolCase {
  id: ID;
  professionId: ID;
  title: string;
  description: string;
  /** 来源（教师姓名 / 项目 / 竞赛等） */
  origin: string;
  rawTags: string[];
  importedAt: ISODateTime;
}

/** 由校内案例转化而来的产业课题资产（可挂回 L2 某个计划的案例素材库） */
export interface IndustryProjectAsset {
  id: ID;
  professionId: ID;
  title: string;
  fromCaseIds: ID[];
  industryContext: string;
  problemStatement: string;
  deliverables: string[];
  /** 关联的图谱节点（可跨三层） */
  linkedNodes: Array<{ nodeId: ID; layer: KGLayer; reason: string }>;
  status: "draft" | "review" | "released";
}

// -------- 岗位驱动的教学计划生成 --------

/** 岗位 JD → 三层路径 → 教学计划骨架 */
export interface JobToPlanBlueprint {
  id: ID;
  professionId: ID;
  jobTitle: string;
  jobJDMaterialId: ID;
  pathway: {
    L1NodeIds: ID[];
    L2PlanIds: ID[];
    L3NodeIds: ID[];
  };
  /** AI 推荐的教学计划章节骨架（供 1.2 向导第 4 步预填） */
  recommendedChapters: Array<{
    title: string;
    sectionTitles: string[];
    coveredL3NodeIds: ID[];
  }>;
  generatedAt: ISODateTime;
}
