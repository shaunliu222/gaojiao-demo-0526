import {
  courses,
  designsBySection,
  examEvaluations,
  homeworkEvaluations,
  nodeById,
  resources,
  students,
  teachingPlans,
} from "@mock";
import type {
  DesignOutput,
  ExamEvalSummary,
  HomeworkEvalSummary,
  PlanSection,
  TeachingDesign,
  TeachingPlan,
} from "@mock";

export type LearnCenterMode = "free" | "plan" | "handout" | "homework";

export type LearnCenterSessionContext = {
  mode: LearnCenterMode;
  planId?: string;
  sectionId?: string;
  homeworkId?: string;
  designId?: string;
  goalNodeIds?: string[];
};

export type LearnCenterStageBlock = {
  label: string;
  title: string;
  detail: string;
};

export type LearnCenterAgentMessage = {
  id: string;
  speaker: "teacher" | "assistant" | "peer" | "student";
  name: string;
  content: string;
};

export type LearnCenterArtifact = {
  type: string;
  title: string;
  detail: string;
};

export type LearnCenterScene = {
  id: string;
  title: string;
  eyebrow: string;
  summary: string;
  stageBlocks: LearnCenterStageBlock[];
  teacherMessages: LearnCenterAgentMessage[];
  discussionMessages: LearnCenterAgentMessage[];
  artifacts: LearnCenterArtifact[];
};

export function getStudentPlans(studentId: string): TeachingPlan[] {
  const student = students.find((s) => s.id === studentId);
  if (!student) return [];
  return teachingPlans.filter(
    (plan) =>
      plan.classIds.includes(student.classId) &&
      (plan.status === "in_progress" || plan.status === "draft"),
  );
}

export function homeworksForClass(classId?: string): HomeworkEvalSummary[] {
  if (!classId) return [];
  return homeworkEvaluations
    .filter((homework) => homework.classId === classId)
    .sort((a, b) => b.assignedAt.localeCompare(a.assignedAt));
}

export function getStudentHomeworks(studentId: string): HomeworkEvalSummary[] {
  const student = students.find((s) => s.id === studentId);
  return homeworksForClass(student?.classId);
}

/** 当前学生在某次作业上的提交与得分（用于学习中心总览） */
export function getHomeworkStudentSummary(
  studentId: string,
  hw: HomeworkEvalSummary,
): { submitted: boolean; totalScore?: number } {
  const row = hw.studentResults.find((r) => r.studentId === studentId);
  if (!row) return { submitted: false };
  return {
    submitted: row.submitted,
    totalScore: row.totalScore,
  };
}

/** 班级参与的考试列表（按考试日升序） */
export function getStudentExams(studentId: string): ExamEvalSummary[] {
  const student = students.find((s) => s.id === studentId);
  if (!student) return [];
  return examEvaluations
    .filter((exam) => exam.classIds.includes(student.classId))
    .sort((a, b) => a.examAt.localeCompare(b.examAt));
}

export function getExamStudentSummary(
  studentId: string,
  exam: ExamEvalSummary,
): { submitted: boolean; totalScore?: number } {
  const row = exam.studentResults.find((r) => r.studentId === studentId);
  if (!row) return { submitted: false };
  return {
    submitted: row.submitted,
    totalScore: row.totalScore,
  };
}

/**
 * 学情档案/章节树里的展示用 id（n-*）→ 知识图谱节点 id（kn-mech-*）。
 * 与教学计划小节的 `knowledgeNodeIds`、资源库挂载一致，避免「点薄弱点进课堂」无法匹配小节或空白内容。
 */
export const studentChapterPointIdToGraphNodeId: Record<string, string> = {
  "n-standard-line": "kn-mech-004",
  "n-standard-scale": "kn-mech-002",
  "n-standard-font": "kn-mech-003",
  "n-projection-system": "kn-mech-014",
  "n-three-views": "kn-mech-015",
  "n-visible-line": "kn-mech-016",
  "n-auxiliary-view": "kn-mech-037",
  "n-cross-section": "kn-mech-028",
  "n-cross-section-curve": "kn-mech-028",
  "n-combination-solid": "kn-mech-031",
  "n-intersect-curve": "kn-mech-029",
  /** 轴测未单独建图谱节点时挂到组合体读图，保证能进计划内小节并有资料 */
  "n-isometric": "kn-mech-033",
  "n-oblique-axon": "kn-mech-033",
  "n-section-view": "kn-mech-039",
  "n-detail-view": "kn-mech-037",
};

export function normalizeStudentChapterPointIdsToGraphNodes(nodeIds: string[]): string[] {
  return nodeIds.map((id) => studentChapterPointIdToGraphNodeId[id] ?? id);
}

/** 在教学计划中定位挂载了某知识点的小节（用于考试薄弱点一键续学） */
export function findSectionIdByKnowledgeNode(
  plan: TeachingPlan,
  nodeId?: string,
): string | undefined {
  if (!nodeId) return undefined;
  const resolved = studentChapterPointIdToGraphNodeId[nodeId] ?? nodeId;
  for (const ch of plan.chapters) {
    for (const sec of ch.sections) {
      if (sec.knowledgeNodeIds.includes(resolved)) return sec.id;
    }
  }
  return undefined;
}

export function findPlanSection(
  planId?: string,
  sectionId?: string,
): { plan?: TeachingPlan; section?: PlanSection; chapterTitle?: string } {
  const plan = teachingPlans.find((item) => item.id === planId);
  if (!plan || !sectionId) return { plan };
  for (const chapter of plan.chapters) {
    const section = chapter.sections.find((item) => item.id === sectionId);
    if (section) return { plan, section, chapterTitle: chapter.title };
  }
  return { plan };
}

export function findHandoutDesign(
  planId?: string,
  sectionId?: string,
  designId?: string,
): TeachingDesign | undefined {
  if (designId) {
    return Object.values(designsBySection)
      .flat()
      .find((design) => design.id === designId);
  }
  if (!planId || !sectionId) return undefined;
  return designsBySection[`${planId}::${sectionId}`]?.find(
    (design) => design.tab === "讲义",
  );
}

export function handoutOptionsForPlans(plans: TeachingPlan[]): TeachingDesign[] {
  const planIds = new Set(plans.map((plan) => plan.id));
  return Object.values(designsBySection)
    .flat()
    .filter((design) => planIds.has(design.planId) && design.tab === "讲义");
}

export function homeworkById(homeworkId?: string): HomeworkEvalSummary | undefined {
  if (!homeworkId) return undefined;
  return homeworkEvaluations.find((homework) => homework.id === homeworkId);
}

export function getGoalNodeIdsForSession(
  ctx: LearnCenterSessionContext,
  fallbackGoalNodeIds: string[],
): string[] {
  if (ctx.goalNodeIds?.length) return ctx.goalNodeIds;
  if (ctx.mode === "homework") {
    const homework = homeworkById(ctx.homeworkId);
    const fromQuestions = homework?.questionAccuracy
      .map((q) => q.knowledgeNodeId)
      .filter((id): id is string => Boolean(id));
    if (fromQuestions?.length) return Array.from(new Set(fromQuestions)).slice(0, 3);
    const wrongNodes = homework?.hotWrongPoints
      .map((point) => point.knowledgeNodeId)
      .filter((id): id is string => Boolean(id));
    if (wrongNodes?.length) return Array.from(new Set(wrongNodes)).slice(0, 3);
  }
  const { section } = findPlanSection(ctx.planId, ctx.sectionId);
  if (section?.knowledgeNodeIds.length) return section.knowledgeNodeIds.slice(0, 3);
  return fallbackGoalNodeIds;
}

export function buildMockScenes(
  ctx: LearnCenterSessionContext,
  fallbackGoalName: string,
): LearnCenterScene[] {
  if (ctx.mode === "homework") {
    const homework = homeworkById(ctx.homeworkId);
    const wrongPoint = homework?.hotWrongPoints[0];
    const sectionTitle = findPlanSection(homework?.planId, homework?.sectionId).section
      ?.title;
    return [
      {
        id: "hw-understand",
        title: "读题与定位",
        eyebrow: "作业辅导 · 第 1 步",
        summary: `先把「${homework?.homeworkTitle ?? fallbackGoalName}」拆成知识点、题型和易错点。`,
        stageBlocks: [
          {
            label: "任务",
            title: homework?.homeworkTitle ?? "当前作业",
            detail: `关联小节：${sectionTitle ?? homework?.sectionId ?? "待定位"}；截止：${homework?.dueAt ?? "按老师要求"}。`,
          },
          {
            label: "易错提醒",
            title: wrongPoint?.name ?? "先找题干中的关键条件",
            detail:
              wrongPoint?.aiCause ??
              "AI 会先帮你标出已知条件、隐含条件和容易漏画/漏答的位置。",
          },
        ],
        teacherMessages: [
          agent("teacher", "AI 教师", "先别急着写答案，我会把题目拆成「已知条件、作图步骤、检查清单」三层。"),
        ],
        discussionMessages: [
          agent("peer", "同学 A", "我之前这类题最容易漏掉不可见线，可以重点提醒一下吗？"),
          agent("assistant", "作业助教", "可以，每一步后都会给你一个自查项。"),
        ],
        artifacts: [
          artifact("作业清单", "分步完成清单", "读题、定位知识点、完成草图、按评分点自查。"),
          artifact("错因卡", wrongPoint?.name ?? "常见失分点", wrongPoint?.aiCause ?? "完成后对照检查。"),
        ],
      },
      {
        id: "hw-solve",
        title: "分步完成",
        eyebrow: "作业辅导 · 第 2 步",
        summary: "按评分点逐步推进，学生先尝试，AI 只给必要提示。",
        stageBlocks: [
          {
            label: "步骤 1",
            title: "先画结构骨架",
            detail: "把主要形体、基准面和尺寸关系先标出来，暂不处理细节线型。",
          },
          {
            label: "步骤 2",
            title: "补关键细节",
            detail: "根据题型补截交、相贯、尺寸或说明，最后进入检查。",
          },
        ],
        teacherMessages: [
          agent("teacher", "AI 教师", "你先完成第一步，我只在你卡住时给提示，不直接替你写完整答案。"),
        ],
        discussionMessages: [
          agent("assistant", "作业助教", "会同步生成提交前检查表，按表逐项核对即可。"),
        ],
        artifacts: [
          artifact("检查表", "提交前 5 项检查", "线型、尺寸、投影对应、题干要求、易错点。"),
          artifact("解析", "作业讲评摘要", "完成后生成一份可回看的解析。"),
        ],
      },
    ];
  }

  if (ctx.mode === "handout") {
    const design = findHandoutDesign(ctx.planId, ctx.sectionId, ctx.designId);
    const { section } = findPlanSection(design?.planId ?? ctx.planId, design?.sectionId ?? ctx.sectionId);
    const firstOutput = design?.outputs[0];
    return [
      {
        id: "handout-preview",
        title: "讲义导读",
        eyebrow: "老师讲义 · 预习",
        summary: `围绕「${section?.title ?? fallbackGoalName}」快速读懂老师准备的讲义。`,
        stageBlocks: [
          {
            label: "讲义",
            title: firstOutput?.title ?? `${section?.title ?? fallbackGoalName} · 老师讲义`,
            detail: firstOutput?.summary ?? "先梳理讲义结构、标出重点页，再带着问题读关键概念。",
          },
          {
            label: "学习目标",
            title: section?.objectives[0] ?? "先建立整体框架",
            detail: section?.objectives.slice(1).join("；") || "把本节内容拆成概念、例题和自查三个层次。",
          },
        ],
        teacherMessages: [
          agent("teacher", "AI 教师", "我会按老师讲义顺序带你浏览，遇到关键页会停下来提问。"),
        ],
        discussionMessages: [
          agent("peer", "同学 A", "我更想知道考试会怎么考，能边看边标重点吗？"),
          agent("assistant", "讲义助教", "可以，边读边标重点，同时整理笔记和自测题。"),
        ],
        artifacts: outputsToArtifacts(design?.outputs).slice(0, 3),
      },
      {
        id: "handout-check",
        title: "讲义自测",
        eyebrow: "老师讲义 · 检查",
        summary: "把讲义内容转成小测和错题提醒，确认是否真的看懂。",
        stageBlocks: [
          {
            label: "自测",
            title: "3 题快速检查",
            detail: "从讲义中抽取核心概念，组合成选择、判断与简答。",
          },
          {
            label: "复盘",
            title: "生成学习笔记",
            detail: "把你答错或犹豫的知识点写入本次学习笔记。",
          },
        ],
        teacherMessages: [
          agent("teacher", "AI 教师", "现在进入检查环节，先做 3 题，答错我会回到讲义对应位置解释。"),
        ],
        discussionMessages: [
          agent("assistant", "讲义助教", "小测结果会同步到本课的掌握情况里。"),
        ],
        artifacts: [
          artifact("小测", "讲义理解 3 题", "题目跟随讲义重点生成。"),
          artifact("笔记", "讲义重点摘录", "保留老师讲义里的高频考点与图示说明。"),
        ],
      },
    ];
  }

  const { plan, section, chapterTitle } = findPlanSection(ctx.planId, ctx.sectionId);
  const baseTitle = section?.title ?? fallbackGoalName;
  const modeLabel = ctx.mode === "plan" ? "定制路线" : "自由学习";
  return [
    {
      id: "route-map",
      title: "建立路线",
      eyebrow: `${modeLabel} · 第 1 场景`,
      summary: `先把「${baseTitle}」放回学习路径中，知道为什么现在学它。`,
      stageBlocks: [
        {
          label: "当前节点",
          title: baseTitle,
          detail: chapterTitle
            ? `${chapterTitle} · ${plan?.title ?? "课程学习计划"}`
            : "根据你的薄弱点和学习画像自动挑选。",
        },
        {
          label: "目标",
          title: section?.objectives[0] ?? "掌握核心概念",
          detail: section?.objectives.slice(1).join("；") || "先讲清概念，再进入例题和自测。",
        },
      ],
      teacherMessages: [
        agent("teacher", "AI 教师", `今天我们先定位「${baseTitle}」在整条学习路线里的位置。`),
      ],
      discussionMessages: [
        agent("peer", "同学 A", "能不能先用一个真实零件或生活例子解释？"),
        agent("assistant", "路径助教", "可以，我会把讲解拆成路线、例题、检查三步。"),
      ],
      artifacts: [
        artifact("路线", `${baseTitle} · 学习路径`, "串联前置知识、当前任务与下一步建议。"),
        artifact("笔记", "本节要点卡", "整理关键词与典型例题，便于复习。"),
      ],
    },
    {
      id: "interactive-guided",
      title: "互动讲解",
      eyebrow: `${modeLabel} · 第 2 场景`,
      summary: "用分步示例、同学追问和助学提示，把抽象知识拆成可执行步骤。",
      stageBlocks: [
        {
          label: "分步",
          title: "从直观例子开始",
          detail: "分步展示结构分解、关键步骤与易错提示。",
        },
        {
          label: "互动",
          title: "随时提问或听同学追问",
          detail: "汇总常见疑问，先讲清易混点再往下走。",
        },
      ],
      teacherMessages: [
        agent("teacher", "AI 教师", "这一环先讲一步，再请你判断下一步该怎么做。"),
      ],
      discussionMessages: [
        agent("peer", "同学 B", "我看懂概念了，但不知道做题时怎么判断从哪里开始。"),
        agent("assistant", "路径助教", "下一张卡会给出「先找基准，再分形体」的操作口诀。"),
      ],
      artifacts: [
        artifact("小测", "随堂 3 题检查", "每讲完一段就生成一道题。"),
        artifact("导图", `${baseTitle} · 知识结构`, "把前置知识、例题和误区整理成树状结构。"),
      ],
    },
    {
      id: "mastery-check",
      title: "掌握检查",
      eyebrow: `${modeLabel} · 第 3 场景`,
      summary: "用小测和自查清单确认是否真正掌握，并给出下一步行动。",
      stageBlocks: [
        {
          label: "检查",
          title: "做一组短测",
          detail: "题目优先覆盖薄弱点，答错会回到对应要点再讲一遍。",
        },
        {
          label: "下一步",
          title: "生成后续安排",
          detail: "可继续学下一小节、打开老师讲义，或进入相关作业辅导。",
        },
      ],
      teacherMessages: [
        agent("teacher", "AI 教师", "最后用 3 个问题确认掌握情况，答完我再给你安排下一步。"),
      ],
      discussionMessages: [
          agent("assistant", "路径助教", "完成后记得在掌握情况里勾一下已过关的目标。"),
      ],
      artifacts: [
        artifact("掌握度", "本次学习掌握检查", "记录哪些目标已掌握、哪些需要回看。"),
        artifact("行动建议", "下一步学习建议", "根据答题结果推荐讲义、作业或实训。"),
      ],
    },
  ];
}

function agent(
  speaker: LearnCenterAgentMessage["speaker"],
  name: string,
  content: string,
): LearnCenterAgentMessage {
  return {
    id: `${speaker}-${Math.random().toString(36).slice(2, 8)}`,
    speaker,
    name,
    content,
  };
}

function artifact(type: string, title: string, detail: string): LearnCenterArtifact {
  return { type, title, detail };
}

function outputsToArtifacts(outputs?: DesignOutput[]): LearnCenterArtifact[] {
  if (!outputs?.length) {
    return [
      artifact("讲义", "老师讲义摘要", "提取结构、重点页和课前预习问题。"),
      artifact("导图", "讲义知识结构", "将讲义内容整理成一张学习地图。"),
    ];
  }
  return outputs.map((output) => artifact(output.type, output.title, output.summary));
}

export function sessionTitle(ctx: LearnCenterSessionContext): string {
  if (ctx.mode === "homework") return homeworkById(ctx.homeworkId)?.homeworkTitle ?? "作业辅导";
  if (ctx.mode === "handout") {
    const design = findHandoutDesign(ctx.planId, ctx.sectionId, ctx.designId);
    return design?.outputs[0]?.title ?? findPlanSection(ctx.planId, ctx.sectionId).section?.title ?? "老师讲义";
  }
  return findPlanSection(ctx.planId, ctx.sectionId).section?.title ?? "自由学习";
}

export function courseNameForPlan(plan?: TeachingPlan): string {
  if (!plan) return "课程";
  return courses.find((course) => course.id === plan.courseId)?.name ?? plan.courseId;
}

export function resourcesForGoalNodes(goalNodeIds: string[]) {
  const hits = new Map<string, (typeof resources)[number]>();
  for (const nodeId of goalNodeIds) {
    for (const resource of resources.filter((item) => item.knowledgeNodeIds.includes(nodeId))) {
      hits.set(resource.id, resource);
    }
  }
  return Array.from(hits.values()).slice(0, 4);
}

// ——— 学生端：教师资料列表 + 中央讲解（资源驱动）———

export type LearnCenterResourceSource = "design-output" | "knowledge-file" | "library-resource";

export type LearnCenterResourceItem = {
  id: string;
  source: LearnCenterResourceSource;
  type: string;
  title: string;
  summary: string;
  metaLabel?: string;
  tags?: string[];
  knowledgeNodeIds: string[];
  designId?: string;
  outputId?: string;
  fileRefId?: string;
  previewUrl?: string;
  tabLabel?: string;
};

export type ResourceContentKind = "ppt" | "document" | "video" | "other";

export type ResourceContentPage = {
  pageNo: number;
  kind: "slide" | "a4" | "segment" | "card";
  title: string;
  /** 多行文本，\n 分段；PPT/文档为正文，视频为时间段说明 */
  body: string;
};

export type ResourceExplanation = {
  headline: string;
  /** 资料预览下可选短句；可空 */
  paragraphs: string[];
  focusNodeIds: string[];
  contentKind: ResourceContentKind;
  contentPages: ResourceContentPage[];
  /** 如「7」「42」等从摘要中解析出的总页/屏数，仅作标注 */
  totalPagesHint: number | null;
};

export function resourceContentOutlineItems(
  pages: ResourceContentPage[],
): { id: string; pageIndex: number; pageNo: number; label: string }[] {
  return pages.map((p, i) => ({
    id: `p-${p.pageNo}-${i}`,
    pageIndex: i,
    pageNo: p.pageNo,
    label: p.title.replace(/^第 \d+ 页 [·\s]*/, "").replace(/（节选）$/, "").replace(/^第 \d+ 屏 [·\s]*/, "") || p.title,
  }));
}

function parsePageCountHint(summary: string): number | null {
  const m = summary.match(/(\d+)\s*页/);
  if (m) {
    const n = parseInt(m[1]!, 10);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function inferContentKindForItem(
  typeStr: string,
  titleStr: string,
): ResourceContentKind {
  const t = typeStr;
  if (t === "PPT" || t.includes("PPT")) return "ppt";
  if (t.includes("视频") || t.includes("微课")) return "video";
  if (t === "思维导图" || t.includes("导图") || t.includes("H5") || t === "课堂活动")
    return "other";
  if (titleStr.match(/\.(mp4|mov|m4v)$/i)) return "video";
  return "document";
}

function isHomeworkLike(item: LearnCenterResourceItem): boolean {
  const t = item.type;
  return (
    t.includes("作业") ||
    t === "客观题组卷" ||
    t === "主观题" ||
    t.includes("题组") ||
    t.includes("随堂") ||
    t.includes("实训")
  );
}

/**
 * 按资料类型生成分页/分屏正文（可浏览的“页”）。
 */
function buildMockResourceContent(item: LearnCenterResourceItem): {
  kind: ResourceContentKind;
  pages: ResourceContentPage[];
  totalPagesHint: number | null;
} {
  const totalPagesHint = parsePageCountHint(item.summary);
  const kind = inferContentKindForItem(item.type, item.title);
  const baseTopic = item.title.replace(/\.(pptx?|docx?|pdf|xlsx?|dwg|mp4|png|jpg)$/i, "").trim();
  const shortTopic = baseTopic.length > 18 ? `${baseTopic.slice(0, 16)}…` : baseTopic;

  const line = (a: string, b: string, c: string) => `• ${a}\n• ${b}\n• ${c}`;

  // 作业类：单页即可（题目+要求+交卷说明）
  if (isHomeworkLike(item)) {
    return {
      kind: "document",
      pages: [
        {
          pageNo: 1,
          kind: "a4",
          title: "课后作业（学生版）",
          body:
            "【一、作业说明】\n" +
            "课程：" +
            baseTopic +
            "。\n" +
            "总用时、题型与计分以教师平台发布为准；下题为示意排版。\n\n" +
            "【二、题目（示意）】\n" +
            "1.（基础，10 分）补全所给主、俯两视图所缺的可见轮廓线，并注明线型类别。\n" +
            "2.（应用，15 分）已知轴承座主、左视图，补画俯视图，标出相贯与过渡线。\n" +
            "3.（综合，15 分）在指定图线上找出并改正三处线型/漏线错误，附简短理由。\n\n" +
            "【三、提交要求】\n" +
            "按截止时间与命名规范上传；教师批阅时对照本题号与题图页。",
        },
      ],
      totalPagesHint: 1,
    };
  }

  if (kind === "ppt") {
    const all = totalPagesHint ?? 6;
    const show = Math.min(Math.max(4, Math.min(all, 8)), 12);
    const templates = [
      {
        title: "课程导入与目标",
        body: line("明确本节在组合体三视图中的位置", "回顾投影与形体分析已学内容", "公布课堂节奏与互动安排"),
      },
      {
        title: "知识要点与术语",
        body: line("形体分析法：分块—找特征—对投影", "主视图、俯左视图间「长对正、高平齐、宽相等」", "过渡线与交线的判别要点"),
      },
      {
        title: "方法示例（轴承座）",
        body: line("将轴承座拆为底板、支承、圆筒、肋板", "先画主视图外轮廓，再补孔与相贯线", "标出起模方向与易混虚线"),
      },
      {
        title: "典型例题分步",
        body: line("题意：补全所缺视图线框", "步骤一：对投影找对应表面", "步骤二：用虚线/粗实线区分离可见性"),
      },
      {
        title: "易错点与找茬",
        body: line("漏画交线/过渡线", "多线：误把相贯线当轮廓线", "现场互动：5 处错误限时找齐"),
      },
      {
        title: "课堂练习与板演",
        body: line("给模型编号，两两互评草图", "教师巡视记录高频错误", "布置板演题并当场讲评"),
      },
      {
        title: "课堂小结与作业",
        body: line("用三句话总结形体分析步骤", "作业：见平台同步文档", "下节：支架组合体三视图实战"),
      },
      {
        title: "附录：拓展阅读",
        body: line("与装配图衔接说明", "三维模型在课堂中的使用说明", "扫码查看拓展动画链接（示意）"),
      },
    ];
    const pages: ResourceContentPage[] = [];
    for (let i = 0; i < show; i++) {
      const tpl = templates[i % templates.length]!;
      pages.push({
        pageNo: i + 1,
        kind: "slide",
        title: all > show && i === 0 ? `第 ${i + 1} 页 · ${tpl.title}（节选）` : `第 ${i + 1} 页 · ${tpl.title}`,
        body: `${tpl.body}\n\n（示意：与「${shortTopic}」内容对应）`,
      });
    }
    return { kind: "ppt", pages, totalPagesHint: totalPagesHint ?? all };
  }

  if (kind === "video") {
    const segs: ResourceContentPage[] = [
      {
        pageNo: 1,
        kind: "segment",
        title: "片段时间轴（示意）",
        body:
          "00:00—00:45  片头与学习目标\n" +
          "00:45—01:20  轴承座模型旋转展示\n" +
          "01:20—02:10  形体分解：圆柱与底板、肋板的关系\n" +
          "02:10—02:50  主视图到俯视图的逐线对投影\n" +
          (totalPagesHint
            ? `\n总时长与摘要中标注一致，可直接拖拽进度条复习难点。`
            : "\n可拖拽进度条反复观看关键段。"),
      },
    ];
    return { kind: "video", pages: segs, totalPagesHint };
  }

  if (kind === "other") {
    const isH5 = item.type.includes("H5") || item.type.includes("活动");
    return {
      kind: "other",
      pages: isH5
        ? [
            {
              pageNo: 1,
              kind: "card",
              title: "第 1 屏 · 活动说明",
              body: `【${baseTopic}】\n题目区：\n  · 在给出的三视图中点选你认为错误的线（示意）\n  · 限时与得分规则见活动页内说明\n计分区：\n  · 每找对一处 +20 分，点错不扣分但占用一次机会`,
            },
            {
              pageNo: 2,
              kind: "card",
              title: "第 2 屏 · 界面示意",
              body:
                "┌ 题干区：展示主 / 俯 / 左视图及错误高亮位 ┐\n" +
                "│  操作区：点选、标记、提交               │\n" +
                "└  结果区：公布标准答案与易错点讲解       ┘\n" +
                "本页为互动页布局假数据，与真实 H5 类似。",
            },
          ]
        : [
            {
              pageNo: 1,
              kind: "card",
              title: "内容结构总览",
              body:
                `【${baseTopic}】\n` +
                "                    ┌─ 投影基础\n" +
                "        核心主题 —─┼─ 组合体构形\n" +
                "                    └─ 三视图与尺寸\n" +
                "以上为中心放射结构示意，真实文件为可缩放导图。",
            },
            {
              pageNo: 2,
              kind: "card",
              title: "第 2 屏 · 展开说明",
              body: "导图类：点击节点可展开子项；可缩放、拖拽画布。本页为结构示意。",
            },
          ],
      totalPagesHint: null,
    };
  }

  // document: 讲义、Word、PDF 等 —— A4 多页正文（作业已在上面单独处理）
  const nFromHint = totalPagesHint;
  const pageCount = nFromHint
    ? Math.min(Math.max(2, nFromHint), 8)
    : 4;
  const bodies: { title: string; body: string }[] = [
    {
      title: "一、学习目的与要求",
      body:
        "1. 能运用形体分析方法，将组合体正确分解为基本几何体并建立投影关系分析思路。\n" +
        "2. 能识读与绘制轴承类零件在三个投影面上的轮廓线、交线及过渡线。\n" +
        "3. 能在规定时间内完成与「" +
        shortTopic +
        "」相配套的课堂/课后练习。",
    },
    {
      title: "二、主要概念与公式要点",
      body:
        "组合体可看作若干柱、锥、台、球及简单体经叠加或切割而成。读图时先抓特征视图，再按“长对正、高平齐、宽相等”在三个视图间对投影。注意孔、槽的贯穿与相贯处线型区分：可见轮廓用粗实线，不可见用虚线。",
    },
    {
      title: "三、读图/作图步骤（可对照正文插图）",
      body:
        "（1）划分线框、命名各子形体；\n" +
        "（2）在特征明显的视图上对投影、找表面关系；\n" +
        "（3）先补大轮廓，再修孔与局部结构；\n" +
        "（4）自检：漏线、多线、线型、封闭性。",
    },
    {
      title: "四、课堂示例与演算要点",
      body:
        "以轴承座为例：将整体视为底板+支承+圆筒+加强肋的叠加，注意圆筒与支承的相贯线。板上演练时先画轴线与对称中心线，再分层完成主、俯、左视图。与「" +
        shortTopic +
        "」同系列的配图在正式文件中按页对位。",
    },
    {
      title: "五、练习与自测",
      body:
        "1）补线题：在已知两视图下补全第三视图指定线；\n" +
        "2）改错题：在给出的三视图中标出并改正错误线型；\n" +
        "3）问答题：用一段话说明主视图选定的理由。",
    },
    {
      title: "六、作业与讲评方式",
      body:
        "按教师发布的截止时间与提交格式交图；教师讲评时会对照本资料页次与题号。评分关注步骤完整性、投影正确性与线型表达。",
    },
    {
      title: "七、附：名词与图线约定（节选）",
      body: "图线分粗实线、细实线、细点画线、虚线、波浪线等；尺寸数字字头方向与读图方向一致。具体线宽比与标注样式以本课统一模板为准。",
    },
  ];

  const pages: ResourceContentPage[] = [];
  const take = Math.min(pageCount, bodies.length);
  for (let i = 0; i < take; i++) {
    const b = bodies[i]!;
    pages.push({
      pageNo: i + 1,
      kind: "a4",
      title: b.title,
      body: b.body,
    });
  }
  if (nFromHint && nFromHint > take) {
    const last = pages[pages.length - 1]!;
    last.body += `\n\n—— 下文省略：全稿共约 ${nFromHint} 页，此处为连续 ${take} 页正文节选。——`;
  }
  return { kind: "document", pages, totalPagesHint: nFromHint };
}

const TITLE_BY_FILE_SOURCE: Record<
  TeachingDesign["knowledgeFiles"][number]["source"],
  string
> = {
  resource_library: "资源库资料",
  knowledge_base: "知识库",
  local: "本地资料",
  internet: "网络参考",
};

function resourceInLibraryById(refId: string) {
  return resources.find((r) => r.id === refId);
}

export function buildTeacherResourceItems(
  ctx: LearnCenterSessionContext,
  goalNodeIds: string[],
): LearnCenterResourceItem[] {
  const { section } = findPlanSection(ctx.planId, ctx.sectionId);
  const kps = section?.knowledgeNodeIds?.length
    ? section.knowledgeNodeIds
    : goalNodeIds;
  const sectionKp = kps.length ? kps : goalNodeIds;

  const key =
    ctx.planId && ctx.sectionId ? (`${ctx.planId}::${ctx.sectionId}` as const) : "";
  const designList: TeachingDesign[] =
    key && designsBySection[key] ? designsBySection[key] : [];

  const items: LearnCenterResourceItem[] = [];

  for (const design of designList) {
    for (const output of design.outputs) {
      const meta = [output.sizeLabel, output.durationLabel].filter(Boolean).join(" · ");
      items.push({
        id: `do-${design.id}::${output.id}`,
        source: "design-output",
        type: output.type,
        title: output.title,
        summary: output.summary,
        metaLabel: meta || undefined,
        tags: output.tags,
        knowledgeNodeIds: [...sectionKp],
        designId: design.id,
        outputId: output.id,
        previewUrl: output.previewUrl,
        tabLabel: design.tab,
      });
    }
    for (const file of design.knowledgeFiles) {
      const fromLib = file.source === "resource_library" ? resourceInLibraryById(file.refId) : undefined;
      items.push({
        id: `kf-${design.id}::${file.refId}`,
        source: "knowledge-file",
        type: TITLE_BY_FILE_SOURCE[file.source] ?? "参考资料",
        title: fromLib?.title ?? file.name,
        summary: fromLib?.description ?? `教师在本课${design.tab}设计中引用的资料。`,
        knowledgeNodeIds: [...sectionKp],
        designId: design.id,
        fileRefId: file.refId,
        tabLabel: design.tab,
      });
    }
  }

  if (items.length > 0) return items;

  for (const r of resourcesForGoalNodes(goalNodeIds)) {
    items.push({
      id: `lib-${r.id}`,
      source: "library-resource",
      type: r.type,
      title: r.title,
      summary: r.description,
      metaLabel: r.durationLabel,
      knowledgeNodeIds: r.knowledgeNodeIds,
    });
  }
  return items;
}

/** 上课场景：优先展示某教学设计 Tab（课堂 / 讲义），其余资料排在后面 */
export function buildClassStudyResourceItems(
  planId: string | undefined,
  sectionId: string | undefined,
  goalNodeIds: string[],
  focus: "课堂" | "讲义",
): LearnCenterResourceItem[] {
  const ctx: LearnCenterSessionContext = {
    mode: "plan",
    planId,
    sectionId,
    goalNodeIds: goalNodeIds.length ? goalNodeIds : undefined,
  };
  const fallback =
    goalNodeIds.length > 0 ? goalNodeIds : ["kn-mech-031"];
  const all = buildTeacherResourceItems(ctx, fallback);
  const primary = all.filter((i) => i.tabLabel === focus);
  const secondary = all.filter((i) => i.tabLabel !== focus);
  if (primary.length > 0) return [...primary, ...secondary];
  return all;
}

/** 学生端作业工作台只读视图（由 HomeworkEvalSummary 派生） */
export type StudentHomeworkTask = {
  homeworkId: string;
  planId?: string;
  sectionId?: string;
  title: string;
  dueAt: string;
  assignedAt: string;
  classId: string;
  submitted: boolean;
  score?: number;
  maxScore: number;
  questionCount: number;
  rubricSummary: string;
};

export function buildStudentHomeworkTask(
  studentId: string,
  homeworkId: string,
): StudentHomeworkTask | null {
  const hw = homeworkEvaluations.find((h) => h.id === homeworkId);
  if (!hw) return null;
  const mine = getHomeworkStudentSummary(studentId, hw);
  const rubricSummary =
    hw.aiInsights[0]?.summary ??
    "评分关注：作图步骤完整性、投影对应关系、线型与尺寸标注规范；主观题需附简要理由。";
  return {
    homeworkId: hw.id,
    planId: hw.planId,
    sectionId: hw.sectionId,
    title: hw.homeworkTitle,
    dueAt: hw.dueAt,
    assignedAt: hw.assignedAt,
    classId: hw.classId,
    submitted: mine.submitted,
    score: mine.totalScore,
    maxScore: hw.maxScore || 100,
    questionCount: hw.questionAccuracy.length || 0,
    rubricSummary,
  };
}

export function buildStudentHomeworkTasks(studentId: string): StudentHomeworkTask[] {
  return getStudentHomeworks(studentId)
    .map((hw) => buildStudentHomeworkTask(studentId, hw.id))
    .filter((x): x is StudentHomeworkTask => x != null);
}

export function buildResourceExplanation(
  item: LearnCenterResourceItem,
  _ctx: LearnCenterSessionContext,
): ResourceExplanation {
  const focusNodeIds = item.knowledgeNodeIds.slice(0, 3);
  const { kind, pages, totalPagesHint } = buildMockResourceContent(item);

  return {
    headline: item.title,
    paragraphs: [] as string[],
    focusNodeIds,
    contentKind: kind,
    contentPages: pages,
    totalPagesHint,
  };
}

export type ChatRole = "teacher" | "assistant" | "peer";

export function mockResourceReply(
  userText: string,
  role: ChatRole,
  item: LearnCenterResourceItem,
  options: { style?: string; teacherName: string; peerName: string },
): string {
  const topic = item.title;
  const styleHint = options.style
    ? ({
        视觉型: "我会多用图示/结构分层来讲。",
        动觉型: "你尽量边想边在纸上划两步草图。",
        读写型: "我按小标题和条目来写清楚。",
        听觉型: "我用口语、短句，方便你边读边出声。",
        混合型: "我换几种讲法，直到你能复述。",
      }[options.style] ?? "")
    : "";

  if (role === "teacher") {
    return `【${options.teacherName}】就「${topic}」回答你的问题：\n1) 先抓概念：${userText.slice(0, 40)} 的核心是把它放回本节知识链条里看。\n2) 再对照资料：建议回到「${item.summary.slice(0, 32)}…」里对应段落做勾画。\n3) 最后给你一条自检：能不看资料用自己的话讲清定义与作用吗？\n${styleHint}`;
  }
  if (role === "assistant") {
    return `【助教】和「${topic}」相关，你可以先确认三件事：\n· 你卡住的步骤是读题、画图，还是校核？\n· 资料里你标了哪些关键词？\n· 你希望我帮你列「下一步最小动作」还是「易错点清单」？\n你刚才问的是：${userText.slice(0, 60)}。`;
  }
  return `【${options.peerName}】我也在学这份「${topic}」～ 我是这样理解你问的：${userText.slice(0, 40)}。我当时容易混的是形体贴合和线型，你要不要先从你最懵的那一条线开始聊？`;
}

/** 课堂场景：在通用回复上叠加「同步讲解」提示 */
export function mockClassStudyReply(
  userText: string,
  role: ChatRole,
  item: LearnCenterResourceItem,
  options: { style?: string; teacherName: string; peerName: string },
): string {
  const base = mockResourceReply(userText, role, item, options);
  if (role === "teacher") {
    return `【课堂同步】${base}\n\n（本节以教师课堂设计为主，AI 只做要点复述与追问。）`;
  }
  return base;
}

/** 作业教练：强调分步提示、不代做 */
export function mockHomeworkCoachReply(
  userText: string,
  role: ChatRole,
  options: { teacherName: string; peerName: string },
): string {
  const q = userText.slice(0, 80);
  if (role === "teacher") {
    return `【${options.teacherName}·作业教练】不直接给完整解答。请先说出你已尝试的步骤；针对「${q}」，建议：① 用一句话重述已知条件；② 选定特征视图；③ 只画下一步辅助线，再停下来自检。`;
  }
  if (role === "assistant") {
    return `【作业助教】你可以先标出题干里的**硬性约束**（可见性、线型、必须交的几张图）。关于「${q}」，需要我帮你拆成「最小下一步」还是「易错点清单」？`;
  }
  return `【${options.peerName}】我做这题时也卡过～ 关于「${q}」，你更愿意先对答案思路还是先对画图顺序？`;
}

/** 实训教练：操作向短回复 */
export function mockTrainingCoachReply(userText: string, options: { peerName: string }): string {
  return `【实训教练】收到：${userText.slice(0, 60)}。建议先确认：① 图板与图纸固定可靠；② 当前步骤是否满足安全要求；③ 交付物命名是否按小组规范。需要我按步骤 checklist 带你走一遍吗？\n（同伴参考：${options.peerName}）`;
}
