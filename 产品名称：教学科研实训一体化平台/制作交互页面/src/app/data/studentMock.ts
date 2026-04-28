/**
 * 学生端补充数据
 *
 * 不修改官方 mock-data/，这里仅作为学生端界面展示层的数据源。
 * 所有数据围绕主线：李建国 · 《机械制图与CAD》 · 机制 2301/2302/2303；金工并行为王海峰；2303 另修赵文静机器人课
 * 包含：
 *   - sectionProgressByStudent：学生在主线教学计划里每个小节的学习进度
 *   - personalPlans：学生自建的精简学习计划（"2 小时快速上手 xxx"这类场景）
 *   - hardwareDevices：实训中心的硬件接入数据（6 台）
 *   - deviceUsageByStudent：每个学生在硬件上的最近使用记录
 *   - learnScenarios：学习中心的历史学习场景
 *   - aiPushesByStudent：学生端 AI 推送建议
 *
 * 学习中心业务轴（假数据需能区分）：
 *   - teacher_class_follow：预习/课堂——跟随教师在本小节发布的「课堂」「讲义」设计与资料互动；
 *   - adaptive_remediation：复习/作业/考试/自建——依错题、已有讲义与题库重新编排，或按个人计划挂载对应讲义、题目、实训练。
 */

import { students, teachingPlans } from "@mock";
import type { TeachingPlan } from "@mock";

// ============ 类型 ============

/** 学习中心两条数据轴：课堂跟教师设计 vs 错题/计划驱动的个性练与素材重排 */
export type LearnCenterStudyAxis =
  | "teacher_class_follow"
  | "adaptive_remediation";

export type SectionProgressStatus =
  | "mastered" // 已掌握
  | "in_progress" // 进行中
  | "pending" // 未开始
  | "weak"; // 薄弱（AI 警示）

export interface SectionProgress {
  sectionId: string;
  status: SectionProgressStatus;
  masteryScore: number; // 0-100 自评估
  lastStudiedAt?: string; // ISO 日期
  note?: string; // 学生/AI 给的一句话
}

/** 个人计划里「讲义 / 题 / 练」的挂载说明（展示用） */
export interface PersonalPlanMaterialMix {
  /** 引用的教师讲义切片、微课页码等 */
  handoutLabels: string[];
  /** 题库、作业变式、客观题组卷 */
  questionPracticeLabel: string;
  /** 手绘/CAD/实训等动手练 */
  drillLabel: string;
  /** 是否包含 AI 依据错题再生成的变式题 */
  hasAiRemix: boolean;
}

export interface PersonalPlan {
  id: string;
  title: string;
  goal: string;
  durationLabel: string;
  difficulty: "入门" | "进阶" | "综合";
  createdAt: string;
  knowledgeNodeIds: string[];
  sourceTags: string[]; // 展示用
  /** 个性轴下均为 adaptive_remediation（与「跟堂」区分） */
  studyAxis: "adaptive_remediation";
  /** 由错题驱动编排 vs 学生自定目标 */
  origin: "ai_from_errors" | "student_custom";
  /** 作为编排种子的错题本 id（可与 mock 错题本互查） */
  seedWrongQuestionIds?: string[];
  /** 挂靠的教师计划小节，便于拉取原课讲义与课堂资料 */
  relatedSectionIds?: string[];
  materialMix: PersonalPlanMaterialMix;
  /** 一句话交代：从错题/考情还是自选目标来，会用什么资料 */
  remediationSummary: string;
  steps: Array<{
    id: string;
    title: string;
    minutes: number;
    knowledgeNodeIds: string[];
    done: boolean;
  }>;
  progress: number; // 0-1
  ownerStudentId: string;
  aiRationale: string; // AI 为什么这么编排
}

export type DeviceStatus = "online_idle" | "in_use" | "maintenance" | "offline";

export interface HardwareDevice {
  id: string;
  name: string;
  category: string; // 设备类别
  location: string;
  status: DeviceStatus;
  currentUser?: string; // 正在使用的学生姓名
  bookableAt?: string; // 下一个可预约时段
  description: string;
  skills: string[]; // 支持的技能标签
}

export interface DeviceUsageRecord {
  deviceId: string;
  studentId: string;
  startedAt: string;
  durationMinutes: number;
  task: string;
  score?: number; // AI 评估
}

export interface LearnScenario {
  id: string;
  studentId: string;
  /** 历史场景同样区分：跟堂讲义互动 vs 错题/考后重练 */
  studyAxis: LearnCenterStudyAxis;
  /** 跟堂轴：对应教师计划中的小节与讲义/课堂 Tab */
  teacherSync?: { planId: string; sectionId: string; designTab: "课堂" | "讲义" };
  /** 个性轴：素材从哪类学习任务延伸 */
  remediationSource?: "wrong_book" | "exam" | "homework";
  axisNote?: string;
  title: string;
  goal: string;
  durationLabel: string;
  startedAt: string;
  completed: boolean;
  personaId: string;
  knowledgeNodeIds: string[];
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  outputs: Array<{
    type: "笔记" | "小测" | "视频" | "思维导图" | "练习题" | "速查卡";
    title: string;
    detail: string;
  }>;
  masteryCheck: Array<{ name: string; ok: boolean }>;
}

export interface AiPush {
  id: string;
  studentId: string;
  title: string;
  summary: string;
  actionLabel: string;
  actionHint: string;
  tone: "cheer" | "warn" | "info";
  reason: string;
  /** 指定时仅在对应教学计划的学习中心页签下展示；不指定则各页签均展示 */
  planId?: string;
}

/** 教师向班级派发的实训任务实例（学生端） */
export type TrainingAssignmentStatus = "not_started" | "in_progress" | "submitted";

export interface TrainingAssignment {
  id: string;
  trainingProjectId: string;
  classId: string;
  planId?: string;
  sectionId?: string;
  assignedAt: string;
  dueAt?: string;
  status: TrainingAssignmentStatus;
  instruction: string;
  /** 实训步骤标题（勾选进度由页面本地状态 + 派发 status 驱动 Demo） */
  stepTitles: string[];
}

/** 总览「本周上课」展示用（与教学计划小节对齐） */
export interface ClassSessionHighlight {
  id: string;
  planId: string;
  sectionId: string;
  weekLabel: string;
  label: string;
  designFocusTab: "课堂" | "讲义";
  studyAxis: "teacher_class_follow";
  /** 本节课堂：学生跟教师已配好的讲义/H5/板演互动 */
  teacherHandoutInteract: string;
}

// ============ 工具 ============

/** 按 masteryLevel 推导小节状态 */
function pickStatus(mastery: number, tone: "smart" | "weak"): SectionProgressStatus {
  if (mastery >= 85) return "mastered";
  if (mastery >= 70) return "in_progress";
  if (mastery >= 50) return "pending";
  return tone === "weak" ? "weak" : "pending";
}

// ============ 数据：小节进度 ============

/**
 * 张伟（s-mech2301-01）· 尖子生：与班级「3.2 组合体周」对齐——此前小节已掌握，
 *   sec-3-2 为课前预习 / 课前资料进行中；尚未进入 3.3 尺寸标注与 3.4 截交相贯专题。
 */
const zhangweiPlanMainProgress: SectionProgress[] = [
  { sectionId: "sec-1-1", status: "mastered", masteryScore: 95, lastStudiedAt: "2026-02-23" },
  { sectionId: "sec-1-2", status: "mastered", masteryScore: 92, lastStudiedAt: "2026-02-25" },
  { sectionId: "sec-2-1", status: "mastered", masteryScore: 90, lastStudiedAt: "2026-03-02" },
  { sectionId: "sec-2-2", status: "mastered", masteryScore: 92, lastStudiedAt: "2026-03-04" },
  { sectionId: "sec-2-3", status: "mastered", masteryScore: 88, lastStudiedAt: "2026-03-09" },
  { sectionId: "sec-2-4", status: "mastered", masteryScore: 86, lastStudiedAt: "2026-03-11" },
  { sectionId: "sec-3-1", status: "mastered", masteryScore: 88, lastStudiedAt: "2026-03-16" },
  {
    sectionId: "sec-3-2",
    status: "in_progress",
    masteryScore: 90,
    lastStudiedAt: "2026-03-17",
    note: "明日课堂主攻组合体三视图：已完成微课预习与讲义导读，课堂实训跟进中。",
  },
  { sectionId: "sec-3-3", status: "pending", masteryScore: 0 },
  { sectionId: "sec-3-4", status: "pending", masteryScore: 0 },
  { sectionId: "sec-4-1", status: "pending", masteryScore: 0 },
  { sectionId: "sec-4-2", status: "pending", masteryScore: 0 },
  { sectionId: "sec-4-3", status: "pending", masteryScore: 0 },
  { sectionId: "sec-4-4", status: "pending", masteryScore: 0 },
  { sectionId: "sec-5-1", status: "pending", masteryScore: 0 },
  { sectionId: "sec-5-2", status: "pending", masteryScore: 0 },
  { sectionId: "sec-5-3", status: "pending", masteryScore: 0 },
  { sectionId: "sec-6-1", status: "pending", masteryScore: 0 },
  { sectionId: "sec-6-2", status: "pending", masteryScore: 0 },
  { sectionId: "sec-7-1", status: "pending", masteryScore: 0 },
  { sectionId: "sec-7-2", status: "pending", masteryScore: 0 },
];

/**
 * 陈浩宇（s-mech2302-01）· 薄弱生：投影阶段 weak（sec-2-3/2-4），sec-3-1 仍薄弱；
 *   班级预习指向 sec-3-2（明日新课），个人续学会优先拉回更早薄弱小节。
 */
const chenhaoyuPlanMainProgress: SectionProgress[] = [
  { sectionId: "sec-1-1", status: "mastered", masteryScore: 85, lastStudiedAt: "2026-02-23" },
  { sectionId: "sec-1-2", status: "in_progress", masteryScore: 70, lastStudiedAt: "2026-02-25" },
  { sectionId: "sec-2-1", status: "in_progress", masteryScore: 68, lastStudiedAt: "2026-03-02" },
  {
    sectionId: "sec-2-2",
    status: "weak",
    masteryScore: 48,
    lastStudiedAt: "2026-03-04",
    note: "AI 诊断：长对正 / 高平齐 / 宽相等口诀没吃透，强烈建议重学。",
  },
  { sectionId: "sec-2-3", status: "weak", masteryScore: 45, lastStudiedAt: "2026-03-09" },
  { sectionId: "sec-2-4", status: "weak", masteryScore: 40, lastStudiedAt: "2026-03-11" },
  {
    sectionId: "sec-3-1",
    status: "weak",
    masteryScore: 42,
    lastStudiedAt: "2026-03-16",
  },
  {
    sectionId: "sec-3-2",
    status: "pending",
    masteryScore: 0,
    note: "明日新课：组合体三视图；建议先完成 AI 推送的投影口诀微课再进课堂。",
  },
  { sectionId: "sec-3-3", status: "pending", masteryScore: 0 },
  { sectionId: "sec-3-4", status: "pending", masteryScore: 0 },
  { sectionId: "sec-4-1", status: "pending", masteryScore: 0 },
  { sectionId: "sec-4-2", status: "pending", masteryScore: 0 },
  { sectionId: "sec-4-3", status: "pending", masteryScore: 0 },
  { sectionId: "sec-4-4", status: "pending", masteryScore: 0 },
  { sectionId: "sec-5-1", status: "pending", masteryScore: 0 },
  { sectionId: "sec-5-2", status: "pending", masteryScore: 0 },
  { sectionId: "sec-5-3", status: "pending", masteryScore: 0 },
  { sectionId: "sec-6-1", status: "pending", masteryScore: 0 },
  { sectionId: "sec-6-2", status: "pending", masteryScore: 0 },
  { sectionId: "sec-7-1", status: "pending", masteryScore: 0 },
  { sectionId: "sec-7-2", status: "pending", masteryScore: 0 },
];

void pickStatus; // 保留工具函数供后续扩展

/** 金工实习 · 张伟（跟上队伍） */
const zhangweiWangMetalworkProgress: SectionProgress[] = [
  { sectionId: "sec-wgw-1-1", status: "mastered", masteryScore: 92, lastStudiedAt: "2026-03-04" },
  {
    sectionId: "sec-wgw-1-2",
    status: "in_progress",
    masteryScore: 85,
    lastStudiedAt: "2026-03-18",
    note: "游标卡尺对表现场与车间师傅演示一致，下周进入车削日前再练一轮。",
  },
  { sectionId: "sec-wgw-2-1", status: "pending", masteryScore: 0 },
  { sectionId: "sec-wgw-2-2", status: "pending", masteryScore: 0 },
];

/** 金工实习 · 陈浩宇（读图慢，车间跟得吃力） */
const chenhaoyuWangMetalworkProgress: SectionProgress[] = [
  {
    sectionId: "sec-wgw-1-1",
    status: "in_progress",
    masteryScore: 58,
    lastStudiedAt: "2026-03-17",
    note: "安全规程已过关，劳保穿戴无误；量具部分需要对着图纸多练几次。",
  },
  {
    sectionId: "sec-wgw-1-2",
    status: "pending",
    masteryScore: 0,
    note: "建议先完成李老师制图课上的尺寸识读小测，再进车间对表。",
  },
  { sectionId: "sec-wgw-2-1", status: "pending", masteryScore: 0 },
  { sectionId: "sec-wgw-2-2", status: "pending", masteryScore: 0 },
];

/** 工业机器人 · 宋佳雯（机制2303） */
const songjiawenRoboticsProgress: SectionProgress[] = [
  { sectionId: "sec-rob-1-1", status: "mastered", masteryScore: 90, lastStudiedAt: "2026-03-08" },
  {
    sectionId: "sec-rob-1-2",
    status: "in_progress",
    masteryScore: 74,
    lastStudiedAt: "2026-03-16",
    note: "示教三点搬运轨迹：离线仿真已通过，等待实机席位复练。",
  },
];

export const sectionProgressByStudent: Record<
  string,
  Record<string, SectionProgress[]>
> = {
  "s-mech2301-01": {
    "plan-main": zhangweiPlanMainProgress,
    "plan-wang-metalwork": zhangweiWangMetalworkProgress,
  },
  "s-mech2302-01": {
    "plan-main": chenhaoyuPlanMainProgress,
    "plan-wang-metalwork": chenhaoyuWangMetalworkProgress,
  },
  "s-mech2303-01": {
    /** 与 2301 同修制图主线，复用同进度骨架便于演示多课表 */
    "plan-main": zhangweiPlanMainProgress,
    "plan-mech-robotics": songjiawenRoboticsProgress,
  },
};

export function getSectionProgress(
  studentId: string,
  planId: string,
  sectionId: string,
): SectionProgress | undefined {
  const byPlan = sectionProgressByStudent[studentId];
  if (!byPlan) return undefined;
  const list = byPlan[planId];
  if (!list) return undefined;
  return list.find((p) => p.sectionId === sectionId);
}

export function getPlanProgressSummary(
  studentId: string,
  planId: string,
): { total: number; mastered: number; inProgress: number; weak: number; pending: number } {
  const list = sectionProgressByStudent[studentId]?.[planId] ?? [];
  const summary = { total: list.length, mastered: 0, inProgress: 0, weak: 0, pending: 0 };
  for (const p of list) {
    if (p.status === "mastered") summary.mastered += 1;
    else if (p.status === "in_progress") summary.inProgress += 1;
    else if (p.status === "weak") summary.weak += 1;
    else summary.pending += 1;
  }
  return summary;
}

/**
 * 按教学计划章节顺序，选择建议续学的小节：
 * 薄弱 → 进行中 → 未开始（含无画像记录的小节）→ 计划第一节
 */
export function findResumeSectionId(studentId: string, plan: TeachingPlan): string | undefined {
  const ordered = plan.chapters.flatMap((ch) => ch.sections.map((s) => s.id));
  if (ordered.length === 0) return undefined;

  const progressList = sectionProgressByStudent[studentId]?.[plan.id] ?? [];
  const byId = new Map(progressList.map((p) => [p.sectionId, p]));

  const pickFirstStatus = (status: SectionProgressStatus) => {
    for (const sid of ordered) {
      if (byId.get(sid)?.status === status) return sid;
    }
    return undefined;
  };

  const pickPendingOrUnknown = () => {
    for (const sid of ordered) {
      const p = byId.get(sid);
      if (!p || p.status === "pending") return sid;
    }
    return undefined;
  };

  return (
    pickFirstStatus("weak") ??
    pickFirstStatus("in_progress") ??
    pickPendingOrUnknown() ??
    ordered[0]
  );
}

// ============ 数据：上课周次提示 / 实训派发 ============

export const classSessionHighlights: ClassSessionHighlight[] = [
  {
    id: "csh-main-3-2",
    planId: "plan-main",
    sectionId: "sec-3-2",
    weekLabel: "第 6 周",
    label: "组合体三视图绘制 · 课堂",
    designFocusTab: "课堂",
    studyAxis: "teacher_class_follow",
    teacherHandoutInteract:
      "学生跟李建国老师发布的课堂 PPT、随堂找茬 H5 与板演步骤互动；讲义与课堂活动一一对应，不另起炉灶。",
  },
];

/** 主线：组合体三视图实训与 3.2 小节绑定，双班各一条派发 */
export const trainingAssignments: TrainingAssignment[] = [
  {
    id: "ta-m-003-2301",
    trainingProjectId: "train-m-003",
    classId: "cls-mech-2301",
    planId: "plan-main",
    sectionId: "sec-3-2",
    assignedAt: "2026-03-18",
    dueAt: "2026-03-25",
    status: "in_progress",
    instruction:
      "李建国：本节课配套实训，完成轴承座 / 支架 / 连接座三件套课堂绘制，并按小组提交草稿照片。",
    stepTitles: [
      "安全须知与图板布置",
      "轴承座形体分析",
      "支架三视图草图",
      "连接座尺寸标注",
      "自查线型后提交草稿",
    ],
  },
  {
    id: "ta-m-003-2302",
    trainingProjectId: "train-m-003",
    classId: "cls-mech-2302",
    planId: "plan-main",
    sectionId: "sec-3-2",
    assignedAt: "2026-03-18",
    dueAt: "2026-03-25",
    status: "in_progress",
    instruction:
      "李建国：2302 班同步实训；基础薄弱同学可先完成轴承座单项，再在 AI 教练辅助下补做另外两件。",
    stepTitles: [
      "安全须知与图板布置",
      "轴承座形体分析",
      "支架三视图草图",
      "连接座尺寸标注",
      "自查线型后提交草稿",
    ],
  },
];

export function trainingAssignmentsForStudent(studentId: string): TrainingAssignment[] {
  const cls = students.find((s) => s.id === studentId)?.classId;
  if (!cls) return [];
  return trainingAssignments.filter((t) => t.classId === cls);
}

export function trainingAssignmentById(id: string): TrainingAssignment | undefined {
  return trainingAssignments.find((t) => t.id === id);
}

/** 某学生在本班是否对指定计划小节有实训派发 */
export function trainingAssignmentForPlanSection(
  studentId: string,
  planId: string,
  sectionId: string,
): TrainingAssignment | undefined {
  return trainingAssignmentsForStudent(studentId).find(
    (t) => t.planId === planId && t.sectionId === sectionId,
  );
}

/** 学习中心各页签：区分「跟教师课堂/讲义」与「错题/计划驱动的个性素材」 */
export type LearnCenterHubSectionKey =
  | "prep"
  | "homework"
  | "review"
  | "personal"
  | "exam";

export const learnCenterHubNarratives: Record<
  LearnCenterHubSectionKey,
  { studyAxis: LearnCenterStudyAxis; headline: string }
> = {
  prep: {
    studyAxis: "teacher_class_follow",
    headline:
      "预习与课堂：跟随教师在本小节配置的「课堂」「讲义」与互动资源，与班级授课进度一致。",
  },
  homework: {
    studyAxis: "adaptive_remediation",
    headline:
      "作业：在教师布置与评分点之上，按你的错题本与薄弱知识点分步辅导；可挂原节讲义切片、变式题与自查表。",
  },
  review: {
    studyAxis: "adaptive_remediation",
    headline:
      "复习：对已学小节重做教师讲义与课堂活动；若有相关错题，并入「个性重排」提示与加练。",
  },
  personal: {
    studyAxis: "adaptive_remediation",
    headline:
      "自建计划：自选目标或由 AI 从错题生成路线，系统自动挂载对应讲义、题库与实训资料。",
  },
  exam: {
    studyAxis: "adaptive_remediation",
    headline:
      "考试：考后薄弱点续学依托卷面与错题，材料来自本节知识链上的讲义、真题范型与再组卷练习。",
  },
};

// ============ 数据：个人学习计划 ============

export const personalPlans: PersonalPlan[] = [
  {
    id: "ppl-zw-sw",
    ownerStudentId: "s-mech2301-01",
    title: "2 小时快速上手 SolidWorks 参数化建模",
    goal: "周末前先过一遍草图+拉伸/旋转/扫描/放样四大特征，周一实训课能独立做出减速器端盖模型。",
    durationLabel: "2 小时",
    difficulty: "进阶",
    createdAt: "2026-04-14T20:20:00+08:00",
    knowledgeNodeIds: ["kn-mech-011", "kn-mech-012", "sk-mech-003"],
    sourceTags: ["SolidWorks 官方教程", "教研室视频库", "AI 合成练习集"],
    studyAxis: "adaptive_remediation",
    origin: "student_custom",
    relatedSectionIds: ["sec-6-1"],
    materialMix: {
      handoutLabels: ["教研室 · SW 草图与特征速查（节选）", "本课工程图输出规范一页纸"],
      questionPracticeLabel: "AI 合成：草图约束辨识 5 题 + 特征参数表填空 3 题",
      drillLabel: "减速器端盖分步建模 + 装配体轻量载入（与实训工单对齐）",
      hasAiRemix: true,
    },
    remediationSummary:
      "自选目标路径：从你的三维兴趣课目标出发挂载官方教程节选与教研室讲义，练习题为 AI 按需组卷（非本节跟堂）。",
    steps: [
      { id: "ppl-zw-sw-s1", title: "草图入门：约束与尺寸驱动（示范 + 5 题）", minutes: 25, knowledgeNodeIds: ["kn-mech-011"], done: true },
      { id: "ppl-zw-sw-s2", title: "拉伸 / 旋转：从轴类入门", minutes: 30, knowledgeNodeIds: ["kn-mech-012"], done: true },
      { id: "ppl-zw-sw-s3", title: "扫描 / 放样：从复杂件过渡", minutes: 35, knowledgeNodeIds: ["kn-mech-012"], done: false },
      { id: "ppl-zw-sw-s4", title: "工程图：从 3D 模型输出三视图", minutes: 30, knowledgeNodeIds: ["kn-mech-012", "sk-mech-003"], done: false },
    ],
    progress: 0.5,
    aiRationale:
      "结合你画像中「三维建模 90 分」的基础和最近参加 3D 打印兴趣小组的目标，AI 推荐先直接从四大特征入手，跳过「界面基础」环节。",
  },
  {
    id: "ppl-zw-exam",
    ownerStudentId: "s-mech2301-01",
    title: "期中考前冲刺 · 截交相贯专题",
    goal: "针对期中常见的截交线 / 相贯线特殊情况，30 分钟补齐短板，冲击班级前 3。",
    durationLabel: "30 分钟",
    difficulty: "综合",
    createdAt: "2026-04-12T21:10:00+08:00",
    knowledgeNodeIds: ["kn-mech-006"],
    sourceTags: ["教师上传微课", "AI 错题本（个人）"],
    studyAxis: "adaptive_remediation",
    origin: "ai_from_errors",
    seedWrongQuestionIds: ["wq-zw-1", "wq-zw-2"],
    relatedSectionIds: ["sec-3-2", "sec-3-4"],
    materialMix: {
      handoutLabels: ["第3章 · 相贯线归纳页（教师微课配套）", "期中典型卷面截图（脱敏）"],
      questionPracticeLabel: "由错题 wq-zw-1/2 变形的 8 道题组 + AI 口述步骤卡",
      drillLabel: "板演纸面 3 小题 + CAD 任选 1 题描线校核",
      hasAiRemix: true,
    },
    remediationSummary:
      "错题驱动：从个人错题本的相贯题出发，截取原课讲义与高失分题库，重做变式并保持与讲台例题同源。",
    steps: [
      { id: "ppl-zw-exam-s1", title: "回顾：6 类截交线形态（3 min）", minutes: 3, knowledgeNodeIds: ["kn-mech-006"], done: true },
      { id: "ppl-zw-exam-s2", title: "特殊相贯情况：轴线相交且直径相近", minutes: 10, knowledgeNodeIds: ["kn-mech-006"], done: false },
      { id: "ppl-zw-exam-s3", title: "真题闯关 · 5 题（含解析）", minutes: 12, knowledgeNodeIds: ["kn-mech-006"], done: false },
      { id: "ppl-zw-exam-s4", title: "AI 出卷 · 自测小测 3 题", minutes: 5, knowledgeNodeIds: ["kn-mech-006"], done: false },
    ],
    progress: 0.15,
    aiRationale:
      "AI 发现你最近 3 次作业里相贯线相关题目得分稳定在 72-76 之间，距离满分只差一次专项训练。",
  },
  {
    id: "ppl-ch-rescue",
    ownerStudentId: "s-mech2302-01",
    title: "投影基础 30 分钟补救路径",
    goal: "先把「长对正 / 高平齐 / 宽相等」三条铁律彻底吃透，为后续组合体作业打好基础。",
    durationLabel: "30 分钟",
    difficulty: "入门",
    createdAt: "2026-04-10T19:30:00+08:00",
    knowledgeNodeIds: ["kn-mech-003", "kn-mech-004"],
    sourceTags: ["李老师 · 补救视频", "AI 逐步讲解", "模型柜手搓"],
    studyAxis: "adaptive_remediation",
    origin: "ai_from_errors",
    seedWrongQuestionIds: ["wq-ch-1", "wq-ch-2", "wq-ch-3"],
    relatedSectionIds: ["sec-2-2", "sec-2-3"],
    materialMix: {
      handoutLabels: ["第2章补救版讲义（低密度）", "三投影面展开示意（单页）"],
      questionPracticeLabel: "错因题库：三面体系 + 宽相等 + 俯视补线各一题进阶变式",
      drillLabel: "模型柜三件实物 ↔ 平面图对照训练",
      hasAiRemix: true,
    },
    remediationSummary:
      "作业批改根因回溯：将你多次出错的投影题抽成微路径，讲义与练习均短于课堂版，侧重复现与矫正。",
    steps: [
      { id: "ppl-ch-rescue-s1", title: "换一种讲法：故事化解释三投影面体系", minutes: 6, knowledgeNodeIds: ["kn-mech-003"], done: true },
      { id: "ppl-ch-rescue-s2", title: "亲手握一下：模型柜 3 个实体配合看图", minutes: 8, knowledgeNodeIds: ["kn-mech-003"], done: false },
      { id: "ppl-ch-rescue-s3", title: "AI 带你做：5 个最基础的三视图图片（逐步解析）", minutes: 10, knowledgeNodeIds: ["kn-mech-004"], done: false },
      { id: "ppl-ch-rescue-s4", title: "自测：3 题（允许看口诀，不计分）", minutes: 6, knowledgeNodeIds: ["kn-mech-004"], done: false },
    ],
    progress: 0.2,
    aiRationale:
      "根据你最近 3 次不及格作业里的错题分布，根源问题都在投影基础。此路径已跳过高难度，完全从零讲起。",
  },
  {
    id: "ppl-ch-peer",
    ownerStudentId: "s-mech2302-01",
    title: "朋辈辅导 · 组合体三视图一对一",
    goal: "和 2302 班林诗涵（学长朋辈）约 2 次，一起搞定第 3.2 节组合体三视图。",
    durationLabel: "2 × 45 分钟",
    difficulty: "进阶",
    createdAt: "2026-04-08T18:00:00+08:00",
    knowledgeNodeIds: ["kn-mech-005"],
    sourceTags: ["朋辈辅导 · 林诗涵", "教师上传讲义"],
    studyAxis: "adaptive_remediation",
    origin: "student_custom",
    relatedSectionIds: ["sec-3-2"],
    materialMix: {
      handoutLabels: ["李建国 · 3.2 节正式讲义（与班级同步）", "朋辈补充白板照片"],
      questionPracticeLabel: "教师题库选 4 题 + 朋辈口述改编 2 题",
      drillLabel: "课堂同款轴承座 / 支架草图二选一加练",
      hasAiRemix: false,
    },
    remediationSummary:
      "自选节奏 + 朋辈：沿用教师已发布的 3.2 讲义与题库，由同学带着走一遍；非直播课但材料与课堂同源。",
    steps: [
      { id: "ppl-ch-peer-s1", title: "Day1：形体分析法讲解 + 1 题实操", minutes: 45, knowledgeNodeIds: ["kn-mech-005"], done: false },
      { id: "ppl-ch-peer-s2", title: "Day2：作业讲评 + 3 题独立练习", minutes: 45, knowledgeNodeIds: ["kn-mech-005"], done: false },
    ],
    progress: 0,
    aiRationale:
      "AI 匹配到 2302 班内成绩最高的林诗涵作为你的朋辈辅导对象，两人作息时间也高度重合。",
  },
];

export function personalPlansByStudent(studentId: string): PersonalPlan[] {
  return personalPlans.filter((p) => p.ownerStudentId === studentId);
}

export function personalPlanById(id: string): PersonalPlan | undefined {
  return personalPlans.find((p) => p.id === id);
}

// ============ 数据：实训中心 · 硬件设备 ============

export const hardwareDevices: HardwareDevice[] = [
  {
    id: "hw-sw-01",
    name: "SolidWorks 实训工位 #3",
    category: "三维建模工位",
    location: "工程实训楼 A-305",
    status: "online_idle",
    bookableAt: "今天 16:00",
    description:
      "配置 SolidWorks 2024 + 4K 屏 + 数位板，可通过平台一键载入课程模型。",
    skills: ["三维建模", "装配设计", "工程图输出"],
  },
  {
    id: "hw-ac-01",
    name: "AutoCAD 机房 · 工位 #12",
    category: "二维制图工位",
    location: "工程实训楼 A-207",
    status: "in_use",
    currentUser: "赵思齐",
    bookableAt: "今天 20:30",
    description:
      "配置 AutoCAD 2024 + A3 绘图仪，支持按学号自动载入作业底图。",
    skills: ["二维绘图", "图层管理", "出图打印"],
  },
  {
    id: "hw-3d-01",
    name: "桌面级 3D 打印机 Bambu X1",
    category: "增材制造",
    location: "创客空间 B-102",
    status: "online_idle",
    bookableAt: "今天 18:00",
    description:
      "支持 PLA / PETG 材料，平台可直接提交 STL。上次有人打了一个减速器壳体。",
    skills: ["3D 打印", "成品校验"],
  },
  {
    id: "hw-vr-01",
    name: "VR 装配工位",
    category: "虚拟实训",
    location: "创客空间 B-201",
    status: "maintenance",
    description:
      "华为 Pico 4E + 自研机械装配 VR 课件，当前在升级 v2.1 内容库。",
    skills: ["装配仿真", "故障排查"],
  },
  {
    id: "hw-laser-01",
    name: "激光雕刻机 Atomstack S20",
    category: "减材加工",
    location: "创客空间 B-105",
    status: "online_idle",
    bookableAt: "明天 09:00",
    description: "用于组合体纸板拼装和个性化铭牌雕刻，入门友好。",
    skills: ["矢量切割", "纸模打样"],
  },
  {
    id: "hw-model-01",
    name: "组合体实体模型柜",
    category: "实体教具",
    location: "工程实训楼 A-101（常开）",
    status: "online_idle",
    description:
      "45 组经典组合体实体模型，配合平台扫码可看对应三视图讲解视频。",
    skills: ["空间想象训练", "基础补救"],
  },
];

export const deviceUsageByStudent: Record<string, DeviceUsageRecord[]> = {
  "s-mech2301-01": [
    {
      deviceId: "hw-sw-01",
      studentId: "s-mech2301-01",
      startedAt: "2026-04-12T14:00:00+08:00",
      durationMinutes: 90,
      task: "齿轮轴 3D 建模（第三次尝试）",
      score: 94,
    },
    {
      deviceId: "hw-3d-01",
      studentId: "s-mech2301-01",
      startedAt: "2026-04-08T20:30:00+08:00",
      durationMinutes: 45,
      task: "减速器端盖 PLA 打印",
      score: 92,
    },
    {
      deviceId: "hw-ac-01",
      studentId: "s-mech2301-01",
      startedAt: "2026-04-02T15:30:00+08:00",
      durationMinutes: 120,
      task: "组合体三视图 CAD 清稿",
      score: 88,
    },
  ],
  "s-mech2302-01": [
    {
      deviceId: "hw-model-01",
      studentId: "s-mech2302-01",
      startedAt: "2026-04-15T16:00:00+08:00",
      durationMinutes: 30,
      task: "基础补救 · 模型柜 3 件配对",
    },
    {
      deviceId: "hw-ac-01",
      studentId: "s-mech2302-01",
      startedAt: "2026-04-06T19:00:00+08:00",
      durationMinutes: 40,
      task: "第3章作业补交（需要朋辈协助）",
      score: 58,
    },
  ],
};

// ============ 数据：学习中心 · 学习场景 ============

export const learnScenarios: LearnScenario[] = [
  {
    id: "ls-zw-001",
    studentId: "s-mech2301-01",
    studyAxis: "adaptive_remediation",
    axisNote:
      "个性练：与个人计划「SW 两小时」对齐，用的是教研室整理的教程节选与 AI 组题，不与某一节线下课堂一对一绑定。",
    title: "2 小时快速上手 SolidWorks 草图",
    goal: "在周末快速摸透 SolidWorks 草图约束和尺寸驱动",
    durationLabel: "1 小时 48 分",
    startedAt: "2026-04-14T20:20:00+08:00",
    completed: true,
    personaId: "persona-preset-lecturer",
    knowledgeNodeIds: ["kn-mech-011", "kn-mech-012"],
    messages: [
      { role: "user", content: "我已经会 AutoCAD，直接给我 SolidWorks 草图和常用约束的重点就行。" },
      {
        role: "assistant",
        content:
          "好，给你一条高带宽的讲法：\n1) SolidWorks 草图 = 「2D 受约束几何」；\n2) 必学 5 种几何约束（重合 / 水平 / 竖直 / 平行 / 垂直）+ 2 种尺寸约束（长度 / 角度）；\n3) 练习：从轴承座底座开始，我陪你走一题。",
      },
      { role: "user", content: "来一题。" },
      {
        role: "assistant",
        content:
          "【情境】底座为 80×50 矩形，正中开 ϕ20 孔。\n【草图流程】先画矩形 → 加「对称」约束 → 加「原点在矩形中心」约束 → 画圆并标 ϕ20 → 用「同心+原点」锁定。\n【检查】任意拖动边，圆心始终在原点说明约束完整。",
      },
    ],
    outputs: [
      {
        type: "笔记",
        title: "SolidWorks 草图·5+2 约束要点",
        detail: "自动归档到你的「知识笔记 · 三维建模」文件夹。",
      },
      {
        type: "小测",
        title: "3 题自测（约束识别）",
        detail: "全对 3/3，AI 评价：「约束系统化思维已建立」。",
      },
      {
        type: "练习题",
        title: "轴承座底座草图完整步骤",
        detail: "含录屏回放 + 常见错误标注。",
      },
    ],
    masteryCheck: [
      { name: "5 种几何约束", ok: true },
      { name: "尺寸驱动思想", ok: true },
      { name: "完全约束判断", ok: true },
    ],
  },
  {
    id: "ls-zw-002",
    studentId: "s-mech2301-01",
    studyAxis: "adaptive_remediation",
    remediationSource: "wrong_book",
    axisNote:
      "错题再练：根据作业错题与卷面归因，截取第3章相贯相关讲义段落 + 题库变式（非重播全班直播）。",
    title: "相贯线特殊情况 30 分钟专题",
    goal: "攻克轴线相交且直径相近时的相贯线",
    durationLabel: "28 分",
    startedAt: "2026-04-11T20:10:00+08:00",
    completed: true,
    personaId: "persona-li-custom-1",
    knowledgeNodeIds: ["kn-mech-006"],
    messages: [
      {
        role: "user",
        content: "三视图作业里老遇到两圆柱相交直径差不多的情况，我判断不出相贯线形状。",
      },
      {
        role: "assistant",
        content:
          "关键口诀：直径差大 → 「月牙形」；直径相近 → 「两条相交椭圆弧」；等径 → 「两条相交直线」。给你一个真实零件来体会——交通信号杆的接头。",
      },
    ],
    outputs: [
      { type: "思维导图", title: "相贯线四种形态分类", detail: "主干 + 识别条件树状图" },
      { type: "速查卡", title: "特殊相贯判据速查", detail: "一页 A5 卡片可打印放草稿夹里" },
    ],
    masteryCheck: [
      { name: "等径相贯识别", ok: true },
      { name: "近径相贯画法", ok: true },
    ],
  },
  {
    id: "ls-ch-001",
    studentId: "s-mech2302-01",
    studyAxis: "adaptive_remediation",
    remediationSource: "wrong_book",
    axisNote:
      "补救路径：错题根因回溯到三面体系；材料为教师补救视频 + 低密度讲义副本，再配合模型柜触感练。",
    title: "三投影面体系 · 故事化重学",
    goal: "用最直白的方式把三视图基础打牢",
    durationLabel: "42 分",
    startedAt: "2026-04-10T19:45:00+08:00",
    completed: true,
    personaId: "persona-li-custom-2",
    knowledgeNodeIds: ["kn-mech-003", "kn-mech-004"],
    messages: [
      { role: "user", content: "老师课上讲的「V/H/W 面」我一直没搞懂是啥关系。" },
      {
        role: "assistant",
        content:
          "别慌，换个说法：你站在屋子里看墙 → V 面；你低头看地 → H 面；你侧头看侧墙 → W 面。三面两两垂直就构成「三投影面体系」。我们接下来一步一步走：\n①先搭屋子；②再把一个物体放进屋子；③从三个方向投影……到这里能跟上吗？",
      },
      { role: "user", content: "可以可以，继续。" },
    ],
    outputs: [
      { type: "视频", title: "屋子故事解释三面体系（2 分钟）", detail: "AI 合成的手绘风动画" },
      { type: "小测", title: "3 题基础识别（允许看口诀）", detail: "2/3 正确，尚需 1 次巩固" },
    ],
    masteryCheck: [
      { name: "三投影面体系", ok: true },
      { name: "长对正/高平齐/宽相等", ok: false },
    ],
  },
];

export function learnScenariosByStudent(studentId: string): LearnScenario[] {
  return learnScenarios.filter((s) => s.studentId === studentId);
}

// ============ 数据：AI 推送 ============

export const aiPushesByStudent: Record<string, AiPush[]> = {
  "s-mech2301-01": [
    {
      id: "push-zw-1",
      studentId: "s-mech2301-01",
      planId: "plan-main",
      title: "把你上周建的齿轮轴打出来吧",
      summary:
        "你在 SolidWorks 工位做的齿轮轴模型精度 94 分，非常适合用 3D 打印机实物化，用于下周机械设计小组展示。",
      actionLabel: "预约 Bambu X1 打印机",
      actionHint: "今天 18:00 有档期",
      tone: "cheer",
      reason: "来自实训数据 · 最近 3 次 SolidWorks 作业全部在 90 分以上",
    },
    {
      id: "push-zw-2",
      studentId: "s-mech2301-01",
      planId: "plan-main",
      title: "相贯线专题 · 还剩 3 道题",
      summary:
        "你的个人学习计划「期中冲刺-截交相贯」已经完成 15%，再投入 12 分钟就能达到「已掌握」。",
      actionLabel: "继续学习",
      actionHint: "进入学习中心",
      tone: "info",
      reason: "个人学习计划 · ppl-zw-exam 进度 15%",
    },
    {
      id: "push-zw-3",
      studentId: "s-mech2301-01",
      title: "学院 3D 打印兴趣小组招募",
      summary:
        "以你的三维建模画像（90 分）+ 班级 TOP3 的成绩，AI 已自动投递你的简介给兴趣小组负责人。",
      actionLabel: "查看邀请",
      actionHint: "报名截止 4/30",
      tone: "cheer",
      reason: "来自学生画像 · 兴趣【3D 打印】+ 擅长【三维建模】",
    },
  ],
  "s-mech2302-01": [
    {
      id: "push-ch-1",
      studentId: "s-mech2302-01",
      planId: "plan-main",
      title: "先别做组合体 · 请回到投影基础",
      summary:
        "AI 诊断显示你过去 3 次作业的错误根源都在 sec-2-2 投影基础。越往后做越累，不如先补好基础。",
      actionLabel: "打开补救路径",
      actionHint: "仅需 30 分钟",
      tone: "warn",
      reason: "来自作业评价 · 错题根因分析",
    },
    {
      id: "push-ch-2",
      studentId: "s-mech2302-01",
      planId: "plan-main",
      title: "去模型柜摸实物 · 比画图更有效",
      summary:
        "对动觉型学习者（也就是你），先摸到真实物体再看三视图，比直接看图快 3 倍建立空间感。",
      actionLabel: "查看模型柜可用实物",
      actionHint: "A-101 · 常开",
      tone: "info",
      reason: "来自学生画像 · 学习风格【动觉型】",
    },
    {
      id: "push-ch-3",
      studentId: "s-mech2302-01",
      planId: "plan-main",
      title: "已为你匹配朋辈辅导：林诗涵",
      summary:
        "AI 从 2302 班里挑了成绩最高的林诗涵（组合体 95 分）作为你的朋辈辅导伙伴，你们作息时间高度重合。",
      actionLabel: "发送邀请",
      actionHint: "默认周三/周五 18:30-19:15",
      tone: "cheer",
      reason: "来自班级画像 · 两极分化场景匹配",
    },
  ],
};

// ============ 数据：错题本 ============

export type WrongQuestionStatus = "unreviewed" | "reviewing" | "mastered";
export type WrongQuestionType = "选择题" | "判断题" | "填空题" | "作图题" | "简答题";

export interface WrongQuestion {
  id: string;
  studentId: string;
  questionNo: string;
  questionType: WrongQuestionType;
  questionContent: string;
  wrongAnswer: string;
  correctAnswer: string;
  explanation: string;
  knowledgePointId: string;
  knowledgePointName: string;
  source: string; // 来源（作业/考试名称）
  occurredAt: string; // 第一次做错日期
  wrongCount: number; // 累计做错次数
  status: WrongQuestionStatus;
  aiDiagnosis: string; // AI 诊断原因
}

const wrongQuestionsData: WrongQuestion[] = [
  // ===== 张伟（s-mech2301-01）· 尖子生：少量错题，主要集中在相贯线 =====
  {
    id: "wq-zw-1",
    studentId: "s-mech2301-01",
    questionNo: "第3章-作业2-第5题",
    questionType: "作图题",
    questionContent: "两圆柱正交时，试求其相贯线的正面投影（大圆柱直径 40mm，小圆柱直径 20mm）。",
    wrongAnswer: "画成了两段直线（未考虑曲率变化）",
    correctAnswer: "两段弧形曲线，最高点与最低点连接形成对称图形",
    explanation: "两等直径圆柱相贯时相贯线为两条椭圆弧；不等直径时小圆柱正面投影内画对称弯曲曲线，需用辅助平面法求 3~5 个特殊点后光滑连接。",
    knowledgePointId: "n-intersect-curve",
    knowledgePointName: "相贯线",
    source: "第3章综合作业",
    occurredAt: "2026-03-24",
    wrongCount: 2,
    status: "reviewing",
    aiDiagnosis: "对辅助平面法的应用不够熟练，找点时只找极限点而漏掉了中间过渡点，导致连线失真。",
  },
  {
    id: "wq-zw-2",
    studentId: "s-mech2301-01",
    questionNo: "第3章-作业2-第7题",
    questionType: "选择题",
    questionContent: "当两个等直径圆柱轴线相交垂直时，相贯线的正面投影形状是（   ）。",
    wrongAnswer: "B. 两段椭圆弧",
    correctAnswer: "C. 两段直线（交叉成 ×）",
    explanation: "等直径正交圆柱的相贯线是两条空间椭圆，但其正面投影退化为两段相交直线（互相垂直的对角线），这是该特殊情况的简化结果。",
    knowledgePointId: "n-intersect-curve",
    knowledgePointName: "相贯线",
    source: "第3章综合作业",
    occurredAt: "2026-03-24",
    wrongCount: 1,
    status: "unreviewed",
    aiDiagnosis: "混淆了等径相交与不等径相交两种情形的投影特征，建议重点记忆「等径正面投影退化为直线」这一特例。",
  },
  {
    id: "wq-zw-3",
    studentId: "s-mech2301-01",
    questionNo: "期中考试-第12题",
    questionType: "填空题",
    questionContent: "俯视图反映物体的______和______方向尺寸，不反映______方向尺寸。",
    wrongAnswer: "长、宽；高",
    correctAnswer: "长（左右）、宽（前后）；高（上下）",
    explanation: "俯视图即从上方投影到水平面（H 面），可见物体的左右（长）和前后（宽）方向，不反映高度（上下）。注意和正视图（长、高）、侧视图（宽、高）区分。",
    knowledgePointId: "n-three-views",
    knowledgePointName: "三视图",
    source: "期中考试",
    occurredAt: "2026-04-01",
    wrongCount: 1,
    status: "mastered",
    aiDiagnosis: "已通过学习中心专项练习巩固，连续 2 次答对，已标记为掌握。",
  },

  // ===== 陈浩宇（s-mech2302-01）· 薄弱生：错题多，投影和组合体两块 =====
  {
    id: "wq-ch-1",
    studentId: "s-mech2302-01",
    questionNo: "第2章-作业1-第3题",
    questionType: "判断题",
    questionContent: "正立投影面（V 面）与水平投影面（H 面）展开后，H 面绕 OX 轴向下翻转 90°。",
    wrongAnswer: "×（错误）",
    correctAnswer: "√（正确）",
    explanation: "V 面和 H 面展开时，H 面绕 OX 轴向下翻转 90°，这样才能保证「长对正、宽相等」的三视图对应关系正确建立。",
    knowledgePointId: "n-projection-system",
    knowledgePointName: "投影面体系",
    source: "第2章投影基础作业",
    occurredAt: "2026-03-04",
    wrongCount: 3,
    status: "unreviewed",
    aiDiagnosis: "多次做错同一题，根源是对「三面展开方式」的空间想象能力不足，建议配合实物模型辅助理解。",
  },
  {
    id: "wq-ch-2",
    studentId: "s-mech2302-01",
    questionNo: "第2章-作业1-第6题",
    questionType: "作图题",
    questionContent: "已知主视图和俯视图，补画左视图。",
    wrongAnswer: "左视图宽度与俯视图不相等，虚线位置错误",
    correctAnswer: "左视图宽度 = 俯视图宽度（宽相等原则），虚线对应内部不可见轮廓",
    explanation: "「宽相等」指俯视图的前后宽度与左视图的前后宽度相等，可以通过 45° 斜线辅助转移。虚线代表被遮挡的轮廓，需根据正面形状判断位置。",
    knowledgePointId: "n-three-views",
    knowledgePointName: "三视图",
    source: "第2章投影基础作业",
    occurredAt: "2026-03-04",
    wrongCount: 4,
    status: "reviewing",
    aiDiagnosis: "「宽相等」原则理解不到位，同时不会用 45° 辅助线转移宽度，导致左视图宽度反复出错。",
  },
  {
    id: "wq-ch-3",
    studentId: "s-mech2302-01",
    questionNo: "第2章-作业2-第4题",
    questionType: "选择题",
    questionContent: "下列关于三视图投影规律的描述，正确的是（   ）。",
    wrongAnswer: "A. 主视图与左视图等高，主视图与俯视图等宽",
    correctAnswer: "B. 主视图与左视图等高，主视图与俯视图等长",
    explanation: "三视图规律：主视图（V）和俯视图（H）共享「长」（左右方向）；主视图和左视图（W）共享「高」（上下方向）；俯视图和左视图共享「宽」（前后方向）。即「长对正、高平齐、宽相等」。",
    knowledgePointId: "n-three-views",
    knowledgePointName: "三视图",
    source: "第2章综合作业",
    occurredAt: "2026-03-08",
    wrongCount: 2,
    status: "unreviewed",
    aiDiagnosis: "把「等宽」和「等长」的对应视图关系搞混，建议用顺口溜「主俯长对正，主左高平齐，俯左宽相等」反复记忆。",
  },
  {
    id: "wq-ch-4",
    studentId: "s-mech2302-01",
    questionNo: "第3章-作业1-第2题",
    questionType: "作图题",
    questionContent: "画出下面组合体（底板 + 圆柱体）的三视图，标出可见与不可见轮廓。",
    wrongAnswer: "俯视图中圆柱投影圆心偏移，虚线漏画",
    correctAnswer: "圆柱俯视为整圆且圆心与底板中心对齐，主视图上沿与底板上表面平齐用粗实线，底板被挡部分用虚线",
    explanation: "组合体叠加时，上方圆柱的中心线要对齐底板的几何中心。可见轮廓用粗实线，不可见轮廓用虚线，中心线用点划线。",
    knowledgePointId: "n-combination-solid",
    knowledgePointName: "组合体",
    source: "第3章组合体作业",
    occurredAt: "2026-03-20",
    wrongCount: 2,
    status: "reviewing",
    aiDiagnosis: "对组合体位置关系的空间想象能力薄弱，建议先在实训中心找实物模型对照再画图。",
  },
  {
    id: "wq-ch-5",
    studentId: "s-mech2302-01",
    questionNo: "第2章-作业3-第1题",
    questionType: "填空题",
    questionContent: "在三投影面体系中，正面投影面用字母______表示，水平投影面用______表示，侧面投影面用______表示。",
    wrongAnswer: "H、V、W",
    correctAnswer: "V、H、W",
    explanation: "标准命名：V 面（正面/主视面）、H 面（水平面/俯视面）、W 面（侧面/左视面）。记忆方法：V-Vertical（垂直），H-Horizontal（水平），W-Width（宽度方向）。",
    knowledgePointId: "n-projection-system",
    knowledgePointName: "投影面体系",
    source: "第2章投影基础作业",
    occurredAt: "2026-03-06",
    wrongCount: 2,
    status: "mastered",
    aiDiagnosis: "经过 2 次专项练习后已完全掌握，连续 3 次答对，自动标记为已掌握。",
  },
];

export function wrongQuestionsByStudent(studentId: string): WrongQuestion[] {
  return wrongQuestionsData.filter((q) => q.studentId === studentId);
}

// ============ 数据：知识掌握程度（按章节维度） ============

export type KnowledgeDomain = "掌握" | "基本掌握" | "待加强" | "薄弱" | "未学习";

export interface ChapterKnowledgeMastery {
  chapterId: string;
  chapterName: string;
  overallMastery: number; // 0-100
  domain: KnowledgeDomain;
  points: Array<{
    id: string;
    name: string;
    mastery: number;
    domain: KnowledgeDomain;
    practiceCount: number; // 练习次数
    wrongCount: number; // 错题数
    lastPracticedAt?: string;
  }>;
}

function domainOf(mastery: number): KnowledgeDomain {
  if (mastery === 0) return "未学习";
  if (mastery >= 88) return "掌握";
  if (mastery >= 72) return "基本掌握";
  if (mastery >= 55) return "待加强";
  return "薄弱";
}

const chapterKnowledgeMasteryData: Record<string, ChapterKnowledgeMastery[]> = {
  "s-mech2301-01": [
    {
      chapterId: "ch-1",
      chapterName: "第1章 制图基本规范",
      overallMastery: 93,
      domain: "掌握",
      points: [
        { id: "n-standard-line", name: "图线种类与用途", mastery: 95, domain: "掌握", practiceCount: 12, wrongCount: 0, lastPracticedAt: "2026-02-25" },
        { id: "n-standard-scale", name: "比例与标注规则", mastery: 92, domain: "掌握", practiceCount: 10, wrongCount: 1, lastPracticedAt: "2026-02-25" },
        { id: "n-standard-font", name: "字体与图框格式", mastery: 91, domain: "掌握", practiceCount: 8, wrongCount: 0, lastPracticedAt: "2026-02-23" },
      ],
    },
    {
      chapterId: "ch-2",
      chapterName: "第2章 正投影与三视图",
      overallMastery: 90,
      domain: "掌握",
      points: [
        { id: "n-projection-system", name: "投影面体系", mastery: 92, domain: "掌握", practiceCount: 15, wrongCount: 0, lastPracticedAt: "2026-03-04" },
        { id: "n-three-views", name: "三视图规律", mastery: 94, domain: "掌握", practiceCount: 20, wrongCount: 1, lastPracticedAt: "2026-03-11" },
        { id: "n-visible-line", name: "可见/不可见轮廓线", mastery: 88, domain: "掌握", practiceCount: 14, wrongCount: 1, lastPracticedAt: "2026-03-11" },
        { id: "n-auxiliary-view", name: "辅助视图", mastery: 85, domain: "掌握", practiceCount: 10, wrongCount: 2, lastPracticedAt: "2026-03-11" },
      ],
    },
    {
      chapterId: "ch-3",
      chapterName: "第3章 正投影法与三视图",
      overallMastery: 83,
      domain: "基本掌握",
      points: [
        { id: "n-cross-section", name: "平面立体投影特征", mastery: 86, domain: "掌握", practiceCount: 11, wrongCount: 1, lastPracticedAt: "2026-03-16" },
        { id: "n-cross-section-curve", name: "回转体投影轮廓", mastery: 84, domain: "基本掌握", practiceCount: 9, wrongCount: 1, lastPracticedAt: "2026-03-16" },
        { id: "n-combination-solid", name: "组合体形体分析", mastery: 78, domain: "基本掌握", practiceCount: 6, wrongCount: 1, lastPracticedAt: "2026-03-17" },
      ],
    },
    {
      chapterId: "ch-4",
      chapterName: "第4章 轴测图",
      overallMastery: 0,
      domain: "未学习",
      points: [
        { id: "n-isometric", name: "正等测画法", mastery: 0, domain: "未学习", practiceCount: 0, wrongCount: 0 },
        { id: "n-oblique-axon", name: "斜二测画法", mastery: 0, domain: "未学习", practiceCount: 0, wrongCount: 0 },
      ],
    },
    {
      chapterId: "ch-5",
      chapterName: "第5章 机件表达方法",
      overallMastery: 0,
      domain: "未学习",
      points: [
        { id: "n-section-view", name: "剖视图", mastery: 0, domain: "未学习", practiceCount: 0, wrongCount: 0 },
        { id: "n-detail-view", name: "局部视图与斜视图", mastery: 0, domain: "未学习", practiceCount: 0, wrongCount: 0 },
      ],
    },
  ],
  "s-mech2302-01": [
    {
      chapterId: "ch-1",
      chapterName: "第1章 制图基本规范",
      overallMastery: 80,
      domain: "基本掌握",
      points: [
        { id: "n-standard-line", name: "图线种类与用途", mastery: 82, domain: "基本掌握", practiceCount: 8, wrongCount: 2, lastPracticedAt: "2026-02-25" },
        { id: "n-standard-scale", name: "比例与标注规则", mastery: 78, domain: "基本掌握", practiceCount: 6, wrongCount: 3, lastPracticedAt: "2026-02-25" },
        { id: "n-standard-font", name: "字体与图框格式", mastery: 85, domain: "掌握", practiceCount: 6, wrongCount: 1, lastPracticedAt: "2026-02-23" },
      ],
    },
    {
      chapterId: "ch-2",
      chapterName: "第2章 正投影与三视图",
      overallMastery: 52,
      domain: "待加强",
      points: [
        { id: "n-projection-system", name: "投影面体系", mastery: 50, domain: "待加强", practiceCount: 10, wrongCount: 5, lastPracticedAt: "2026-03-06" },
        { id: "n-three-views", name: "三视图规律", mastery: 45, domain: "薄弱", practiceCount: 14, wrongCount: 6, lastPracticedAt: "2026-03-08" },
        { id: "n-visible-line", name: "可见/不可见轮廓线", mastery: 60, domain: "待加强", practiceCount: 8, wrongCount: 3, lastPracticedAt: "2026-03-04" },
        { id: "n-auxiliary-view", name: "辅助视图", mastery: 52, domain: "待加强", practiceCount: 5, wrongCount: 3, lastPracticedAt: "2026-03-11" },
      ],
    },
    {
      chapterId: "ch-3",
      chapterName: "第3章 正投影法与三视图",
      overallMastery: 48,
      domain: "待加强",
      points: [
        { id: "n-cross-section", name: "平面立体投影特征", mastery: 52, domain: "待加强", practiceCount: 5, wrongCount: 4, lastPracticedAt: "2026-03-16" },
        { id: "n-combination-solid", name: "组合体形体分析（尚未开课）", mastery: 44, domain: "薄弱", practiceCount: 3, wrongCount: 4, lastPracticedAt: "2026-03-16" },
      ],
    },
    {
      chapterId: "ch-4",
      chapterName: "第4章 轴测图",
      overallMastery: 0,
      domain: "未学习",
      points: [
        { id: "n-isometric", name: "正等测画法", mastery: 0, domain: "未学习", practiceCount: 0, wrongCount: 0 },
        { id: "n-oblique-axon", name: "斜二测画法", mastery: 0, domain: "未学习", practiceCount: 0, wrongCount: 0 },
      ],
    },
  ],
};

export function chapterMasteryByStudent(studentId: string): ChapterKnowledgeMastery[] {
  return chapterKnowledgeMasteryData[studentId] ?? [];
}

// ============ 数据：当前班级计划 ============

/**
 * 一个学生默认的"主课程学习计划"——用学生所在班级反查 teachingPlans。
 * 若学生班级没有任何计划，则返回 undefined。
 */
export function primaryPlanForStudent(classId: string): TeachingPlan | undefined {
  return teachingPlans.find(
    (p) => p.classIds.includes(classId) && p.status === "in_progress",
  );
}
