import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  FileText,
  Brain,
  Film,
  Send,
  Paperclip,
  Folder,
  User,
  Wrench,
  Sparkles,
  ListChecks,
  PenSquare,
  Presentation,
  Activity,
  Timer,
  Code2,
  Headphones,
  Bot,
  Landmark,
} from "lucide-react";
import { teachingPlans } from "@mock";
import type {
  ChatMessage,
  DesignOutput,
  DesignOutputV2,
  DesignTab,
  TeachingDesign,
  TeachingDesignV2,
  TeachingPlanV2,
  PlanLesson,
} from "@mock";
import {
  classById,
  designsForWorkbenchSection,
  designsForLessonV2,
  planV2ById,
  lessonV2ById,
} from "../data/lookups";
import { PageHeader, AiBadge } from "./Layout";

/** V2 output type quick-create config */
const OUTPUT_TYPES_V2 = [
  { type: "lecture_note", label: "讲义", icon: <FileText size={14} /> },
  { type: "audio", label: "音频讲解", icon: <Headphones size={14} /> },
  { type: "ppt", label: "课件PPT", icon: <Presentation size={14} /> },
  { type: "mindmap", label: "思维导图", icon: <Brain size={14} /> },
  { type: "micro_video", label: "微课视频", icon: <Film size={14} /> },
  { type: "lesson_plan", label: "教案", icon: <ListChecks size={14} /> },
  { type: "homework", label: "作业题", icon: <PenSquare size={14} /> },
] as const;

type TabKey = DesignTab;
type BusinessTabKey = Exclude<TabKey, "AI融合">;

/** 对话与 AI 融合开关仅绑定「讲义」教学设计会话 */
const CHAT_CONTEXT_TAB: BusinessTabKey = "讲义";

const DESIGN_MERGE_ORDER: DesignTab[] = ["讲义", "课堂", "作业", "AI融合"];

type DesignOutputType = DesignOutput["type"];

const WORKBENCH_TEMPLATE_TYPES = new Set<DesignOutputType>([
  "讲义pdf",
  "PPT",
  "微课视频",
  "音频",
  "思维导图",
  "教案",
  "客观题组卷",
]);

type FusionConfig = {
  intro: string;
  generatedContent: string;
  enhancedOutputIds: string[];
};

const AI_FUSION_BY_TAB: Record<BusinessTabKey, FusionConfig> = {
  讲义: {
    intro:
      "已根据当前课程「机械制图」与本节「组合体三视图绘制」生成一段可直接写入讲义的内容。重点不是介绍通用 AI，而是让学生知道在三视图学习中如何合理使用 AI、如何核验 AI 输出。",
    generatedContent:
      "拟新增章节：学科AI融合：AI辅助三视图学习的使用边界\n\n1. AI在本节中的合理用途\nAI 可以作为「候选方案生成器」和「错误提示工具」使用。例如，在分析轴承座这类组合体时，学生可以先独立完成形体分解，再用 AI 辅助生成可能的组成体列表，如底板、圆柱凸台、肋板、孔槽等，用来对照自己的分析是否遗漏关键结构。\n\n2. 必须由学生人工核验的内容\nAI 给出的解释不能直接作为答案。学生需要逐项核验：主视图、俯视图、左视图之间的长对正、高平齐、宽相等是否成立；圆孔、槽口、肋板等结构在三个视图中的投影关系是否一致；可见线、不可见线和中心线是否符合机械制图规范。\n\n3. 推荐使用流程\n先观察实物或三维模型，独立完成形体分解；再绘制三视图草图；随后让 AI 对草图或文字描述提出可能错误；最后由学生依据投影规律和制图标准判断 AI 建议是否成立，并记录采纳或不采纳的理由。\n\n4. 学术诚信要求\n允许使用 AI 进行思路启发和错误检查，但不得直接提交 AI 生成的图纸或解释。提交作品时需注明 AI 使用环节，并保留人工修正说明。",
    enhancedOutputIds: ["out-h-001"],
  },
  课堂: {
    intro:
      "已根据 135 分钟课堂设计生成一个可嵌入课堂文件的 AI 融合活动段。它服务于组合体三视图训练，不是让 AI 代做，而是让学生把 AI 输出当作可质疑、可诊断的对象。",
    generatedContent:
      "拟新增活动：学科AI融合活动：人机协同找错（12分钟）\n\n活动目标：训练学生用投影规律核验 AI 输出，强化组合体三视图之间的对应关系。\n\n活动材料：轴承座三维模型截图、1 组三视图草图、AI 生成的形体分析说明或错误诊断说明。\n\n活动流程：\n1. 学生独立判断（3分钟）：学生先不看 AI 说明，独立标出三视图中可能存在的问题，例如孔位对应不一致、肋板投影遗漏、宽度方向关系错误、中心线缺失等。\n2. 对比 AI 输出（3分钟）：教师展示 AI 对同一图纸的分析结果，学生圈出 AI 说得对的地方和存疑的地方。\n3. 小组核验（4分钟）：小组依据「长对正、高平齐、宽相等」和可见性规则，判断 AI 建议是否成立，并写出一条不采纳 AI 建议的理由。\n4. 教师归纳（2分钟）：教师强调 AI 可以帮助发现线索，但最终判断必须回到投影规律、形体结构和制图规范。\n\n课堂评价点：学生是否能说明错误依据，而不是只说“AI 认为错”；是否能把 AI 输出转化为可验证的制图检查项。",
    enhancedOutputIds: ["out-c-003", "out-c-001"],
  },
  作业: {
    intro:
      "已根据课后作业的 4+3+1 题结构生成一个可追加到作业文件中的 AI 融合任务。它要求学生留下 AI 使用证据和人工核验过程，避免把 AI 当作答案来源。",
    generatedContent:
      "拟新增任务：学科AI融合任务：AI辅助识图纠错记录\n\n任务要求：在完成组合体三视图作业后，选择其中 1 道应用题或综合题，使用 AI 辅助检查自己的形体分析与三视图草图，并提交以下材料：\n1. 原始草图或解题步骤截图；\n2. 向 AI 提问的提示词，需包含具体对象，例如“轴承座组合体”“主视图、俯视图、左视图对应关系”“孔槽和肋板投影”；\n3. AI 输出截图或文字记录；\n4. 人工修正说明：列出至少 2 条 AI 建议，并说明采纳或不采纳的理由；\n5. 100 字反思：说明 AI 对自己理解形体分析法的帮助，以及 AI 输出中可能存在的问题。\n\n评分建议（10分）：提示词是否具体 2 分；AI 输出记录是否完整 2 分；人工核验理由是否符合投影规律 4 分；反思是否说明 AI 使用边界 2 分。\n\n注意：AI 输出不能直接作为最终答案，最终图纸以学生人工核验后的版本为准。",
    enhancedOutputIds: ["out-w-001", "out-w-002"],
  },
};

/** 课程思政融合建议（与 AI 融合并列；enhancedOutputIds 置空以免与「含AI融合」徽标混用） */
const IDEOLOGY_FUSION_BY_TAB: Record<BusinessTabKey, FusionConfig> = {
  讲义: {
    intro:
      "已在本节「组合体三视图绘制」语境下，梳理可自然融入的思政元素：专业认同、工程伦理与大国工匠精神，而非生硬说教。",
    generatedContent:
      "拟新增段落：课程思政 · 严谨制图与工程师责任（约 1 页）\n\n1. 价值引领\n以国家重大装备与先进制造对「图样是唯一工程语言」的要求为切入点，强调每一条线、每一个尺寸背后都是对安全、质量与契约的承诺。\n\n2. 专业伦理\n结合轴承座等典型零件说明：图面表达不清或随意『凑活』可能导致装配失效与安全隐患，呼应实事求是、守信尽责的职业操守。\n\n3. 学习态度\n引导学生把三视图训练视为「毫米级」严谨习惯的养成，体会精益求精与持之以恒与日常学风、团队协作的关系。\n\n4. 教学提醒\n融入应服务于知识目标，采用案例讨论、随堂提问等轻量方式即可，避免占用过多学时；教师可根据班级特点删减示例。",
    enhancedOutputIds: [],
  },
  课堂: {
    intro:
      "已在「135 分钟课堂」活动结构中，给出一段可与本节训练目标对齐的思政切入点，便于在示范与互动中择机展开。",
    generatedContent:
      "拟新增课堂环节导语（约 3 分钟，可插在形体分析示范前）\n\n▶ 导语要点\n「我们画的不只是线条，而是在用规范语言对工程事实负责。」请学生思考：若图纸表达含糊，可能对质检、装配与终端用户造成哪些连锁影响？\n\n▶ 互动提示（二选一即可）\n- 小组列举「因图面表达不规范可能带来的风险」2 条，并与中华优秀传统文化中「慎独」「守信」作简要关联。\n- 指定 1 名学生结合生活中的「标准化」案例（交通标志、药品说明书等）类比工程图样的公共性。\n\n▶ 收束\n回到本节知识与技能目标，强调严谨既是能力也是态度，体现当代工程师的社会责任感。",
    enhancedOutputIds: [],
  },
  作业: {
    intro:
      "已在课后「4+3+1」作业结构中，拟增补一条与诚信、原创与过程留痕相关的轻量思政要求，便于评价时观察学生的科学态度。",
    generatedContent:
      "拟新增作业说明条目：课程思政与学术诚信（置于总说明末尾）\n\n1. 学生在作图与订正过程中应独立完成形体分析与主要作图步骤；可参考教材与课堂笔记，但须在提交中简要说明参考来源与独立思考部分。\n\n2. 鼓励如实记录「卡壳点」与自我纠错过程（两三句话即可），将作为学习态度与过程性评价参考，不计入知识点对错惩罚。\n\n3. 强调工程图样与文档的真实性：不得伪造数据、不得冒用他人图纸；与今后职业中质量记录、签字负责的习惯相联系。\n\n教师可根据评价权重决定是否计入总分（建议≤5% 或仅作评语参考）。",
    enhancedOutputIds: [],
  },
};

const DEFAULT_REPLY_BY_TAB: Record<BusinessTabKey, string> = {
  讲义:
    "已根据你的要求调整当前讲义：补充了轴承座形体分解示意步骤，将原先偏概念化的形体分析法改成「观察实物/模型 → 拆分基本体 → 判断叠加与切割关系 → 对应三视图」的流程说明。\n\n右栏讲义 PDF 将更新为新版，配套思维导图同步增加「组合体拆分步骤」分支。",
  课堂:
    "已根据你的要求调整当前课堂设计：把原有互动环节改成更明确的课堂任务，增加 1 个轴承座三视图纠错活动，并在课堂计时表中补充教师提示语和小组讨论时间。\n\n右栏课堂教案、课堂 PPT 和活动卡会同步更新。",
  作业:
    "已根据你的要求调整当前作业：在原有 4 道基础题、3 道应用题、1 道综合题基础上，新增 1 道轴承座三视图综合纠错题；同时把教师答案中的评分 rubric 拆成「形体分析 30%」「投影对应 35%」「线型与规范 20%」「过程说明 15%」。\n\n右栏学生版作业和教师答案与评分 rubric 将同步更新。",
};

/** 工作台「新建」快捷入口（仅保留指定类型；客观题组卷在 UI 上称为「作业」） */
type TemplateItem = {
  key: string;
  label: string;
  icon: any;
  accent: string;
};

const WORKBENCH_CREATE_TEMPLATES: TemplateItem[] = [
  { key: "讲义pdf", label: "讲义", icon: FileText, accent: "text-rose-600 bg-rose-50" },
  { key: "PPT", label: "课件 PPT", icon: Presentation, accent: "text-orange-600 bg-orange-50" },
  { key: "微课视频", label: "微课视频", icon: Film, accent: "text-fuchsia-600 bg-fuchsia-50" },
  { key: "音频", label: "音频讲解", icon: Headphones, accent: "text-cyan-600 bg-cyan-50" },
  { key: "思维导图", label: "思维导图", icon: Brain, accent: "text-emerald-600 bg-emerald-50" },
  { key: "教案", label: "教案", icon: PenSquare, accent: "text-indigo-600 bg-indigo-50" },
  { key: "客观题组卷", label: "作业", icon: ListChecks, accent: "text-emerald-600 bg-emerald-50" },
];

function outputTypeDisplayLabel(type: DesignOutputType): string {
  if (type === "客观题组卷") return "作业";
  return type;
}

/** 右侧产物：按序合并各 Tab 下允许展示的类型 + AI 融合产物 */
function collectWorkbenchOutputs(
  designs: TeachingDesign[],
  handoutSubstituteOutputs: DesignOutput[] | null,
): DesignOutput[] {
  const out: DesignOutput[] = [];
  for (const tab of DESIGN_MERGE_ORDER) {
    const d = designs.find((x) => x.tab === tab);
    if (!d) continue;
    const list =
      tab === "讲义" && handoutSubstituteOutputs != null ? handoutSubstituteOutputs : d.outputs;
    for (const o of list) {
        if (tab === "AI融合") {
        if (o.type === "AI融合建议包") out.push(o);
      } else if (WORKBENCH_TEMPLATE_TYPES.has(o.type)) {
        out.push(o);
      }
    }
  }
  return out;
}

function fullMergedWorkbenchOutputs(designs: TeachingDesign[]): DesignOutput[] {
  return collectWorkbenchOutputs(designs, null);
}

function iconForOutput(type: DesignOutput["type"]) {
  switch (type) {
    case "讲义pdf":
      return FileText;
    case "思维导图":
      return Brain;
    case "微课视频":
      return Film;
    case "互动H5":
    case "课堂活动":
      return Activity;
    case "教案":
      return PenSquare;
    case "PPT":
      return Presentation;
    case "计时表":
      return Timer;
    case "客观题组卷":
    case "主观题":
      return ListChecks;
    case "编程题":
      return FileText;
    case "实训任务":
      return Wrench;
    case "AI融合建议包":
      return Sparkles;
    case "AI实训练习":
      return Bot;
    default:
      return FileText;
  }
}

function outputActionLabels(output: DesignOutput): string[] {
  if (output.type === "AI融合建议包") {
    return ["预览", "采纳到讲义", "采纳到课堂"];
  }
  if (output.type === "AI实训练习") {
    return ["预览", "采纳到作业", "发布设置"];
  }
  return ["预览", "下载", "发布"];
}

function fusionEnhancedForOutput(
  fusionConfirmed: boolean,
  outputId: string,
): boolean {
  if (!fusionConfirmed) return false;
  return (["讲义", "课堂", "作业"] as const).some((t) =>
    AI_FUSION_BY_TAB[t].enhancedOutputIds.includes(outputId),
  );
}

function acceptTargetFromLabel(label: string): Exclude<TabKey, "AI融合"> | undefined {
  if (label === "采纳到讲义") return "讲义";
  if (label === "采纳到课堂") return "课堂";
  if (label === "采纳到作业") return "作业";
  return undefined;
}

/** AI 融合采纳后，气泡指向的主产物（名称不因采纳而改变） */
function fusionAnchorOutputId(
  design: TeachingDesign | undefined,
  target: Exclude<TabKey, "AI融合">,
): string | undefined {
  const list = design?.outputs ?? [];
  if (!list.length) return undefined;
  if (target === "讲义") {
    return list.find((o) => o.type === "讲义pdf")?.id ?? list[0]?.id;
  }
  if (target === "课堂") {
    return (
      list.find((o) => o.type === "PPT")?.id ??
      list.find((o) => o.type === "教案")?.id ??
      list[0]?.id
    );
  }
  return (
    list.find((o) => o.type === "客观题组卷")?.id ??
    list.find((o) => o.type === "主观题")?.id ??
    list[0]?.id
  );
}

function acceptedNoticeForTarget(target: Exclude<TabKey, "AI融合">, source: DesignOutput) {
  if (target === "讲义") {
    return {
      id: `accepted-${target}-${source.id}-${Date.now()}`,
      content:
        "已在当前讲义中增加 1 页「AI 融合教学内容」：包含 AI 辅助识图的适用边界、人工核验步骤和学术诚信提醒。讲义标题保持不变，你可以继续对这页内容做微调。",
    };
  }
  if (target === "课堂") {
    return {
      id: `accepted-${target}-${source.id}-${Date.now()}`,
      content:
        "已在当前课堂设计中加入 12 分钟「人机协同找错」活动：学生先独立判断，再对比 AI 解释并标注不符合投影规律的部分。课堂产物名称保持不变。",
    };
  }
  return {
    id: `accepted-${target}-${source.id}-${Date.now()}`,
    content:
      "已在当前作业中补充 AI 实训练习要求：学生需提交提示词、AI 输出截图、人工修正说明与 100 字反思；评价重点是核验过程，不是直接答案。",
  };
}

function fileSourceLabel(s: "local" | "knowledge_base" | "resource_library" | "internet"): string {
  switch (s) {
    case "local":
      return "本地";
    case "knowledge_base":
      return "知识库";
    case "resource_library":
      return "资源库";
    case "internet":
      return "网络";
  }
}

/** 本地临时消息（发送后 append，不写回 mock） */
type PendingFusion = { id: string; kind: "ai" | "ideology" };

interface LocalMessage extends ChatMessage {
  pending?: boolean;
  /** 学情模式：占位一条，用于展示 AI 生成中的 loading */
  loadingPlaceholder?: boolean;
  fusionConfirmTab?: BusinessTabKey;
  fusionConfirmId?: string;
  fusionConfirmKind?: "ai" | "ideology";
}

export function DesignWorkbench({
  planId,
  sectionId,
  lessonId,
  onBack,
  onOpenDemoSection,
  /** true 时使用学情专用假数据（仅部分小节有独立剧本） */
  learningAdjust = false,
}: {
  planId: string;
  sectionId: string;
  /** v2.0: 课时 ID */
  lessonId?: string;
  onBack: () => void;
  /** 假跳转：进入带完整假数据的焦点小节教学设计 */
  onOpenDemoSection?: () => void;
  learningAdjust?: boolean;
}) {
  // --- V2 data path ---
  const planV2 = planV2ById(planId);
  const lessonV2 = lessonId ? lessonV2ById(planId, lessonId) : undefined;
  const designV2: TeachingDesignV2 | undefined = useMemo(
    () => (lessonId ? designsForLessonV2(planId, lessonId, undefined, learningAdjust) : undefined),
    [planId, lessonId, learningAdjust],
  );
  const isV2 = Boolean(lessonId && planV2 && lessonV2);

  // V2 state: AI化 / 思政化 toggle + class switching
  const [aiFlag, setAiFlag] = useState(designV2?.aiFlag ?? true);
  const [politicsFlag, setPoliticsFlag] = useState(designV2?.politicsFlag ?? false);
  const [activeClassId, setActiveClassId] = useState<string>(designV2?.classId ?? "");

  // --- V1 data path (fallback) ---
  const plan = teachingPlans.find((p) => p.id === planId);
  const section = useMemo(() => {
    if (!plan) return undefined;
    for (const ch of plan.chapters) {
      for (const s of ch.sections) {
        if (s.id === sectionId) return s;
      }
    }
    return undefined;
  }, [plan, sectionId]);

  const designs: TeachingDesign[] = useMemo(
    () => designsForWorkbenchSection(planId, sectionId, learningAdjust),
    [planId, sectionId, learningAdjust],
  );

  const currentDesign = designs.find((d) => d.tab === CHAT_CONTEXT_TAB);
  const [extraMsgs, setExtraMsgs] = useState<Record<string, LocalMessage[]>>({});
  const [fusionEnabled, setFusionEnabled] = useState(false);
  const [ideologyFusionEnabled, setIdeologyFusionEnabled] = useState(false);
  const [fusionConfirmed, setFusionConfirmed] = useState(false);
  const [pendingFusion, setPendingFusion] = useState<PendingFusion | undefined>();
  const [chatClearedByDesign, setChatClearedByDesign] = useState<Record<string, boolean>>({});
  const [acceptanceNotices, setAcceptanceNotices] = useState<
    Partial<
      Record<
        Exclude<TabKey, "AI融合">,
        { id: string; content: string; anchorOutputId?: string }
      >
    >
  >({});
  const [input, setInput] = useState("");

  // V2 header title uses lesson context
  const v2HeaderTitle = useMemo(() => {
    if (!planV2 || !lessonV2) return "教学设计工作台";
    const kn = lessonV2.knowledgePointNames[0] ?? "...";
    return `第${lessonV2.lessonNo}课时 · ${kn}`;
  }, [planV2, lessonV2]);

  const classNames = plan?.classIds.map((cid) => classById(cid)?.name ?? cid).join("+") ?? "";
  const headerTitle = isV2 ? v2HeaderTitle : (section ? `${classNames} · ${section.title}` : "教学设计工作台");

  const send = () => {
    if (!input.trim() || !currentDesign) return;
    const now = new Date().toISOString();
    const fusionConfig = AI_FUSION_BY_TAB[CHAT_CONTEXT_TAB];
    const ideologyConfig = IDEOLOGY_FUSION_BY_TAB[CHAT_CONTEXT_TAB];
    const fusionConfirmId = `fusion-confirm-${Date.now()}`;
    const shouldAutoEnableFusion = !fusionEnabled && /AI|人工智能/i.test(input);
    const useFusionFlow = fusionEnabled || shouldAutoEnableFusion;
    const useIdeologyFlow = !useFusionFlow && ideologyFusionEnabled;
    const userMsg: LocalMessage = {
      id: `local-${Date.now()}`,
      role: "user",
      content: input,
      createdAt: now,
    };
    const aiMsg: LocalMessage = {
      id: `local-${Date.now() + 1}`,
      role: "assistant",
      content: useFusionFlow
        ? [
            `你输入的内容：${input.trim()}`,
            fusionConfig.intro,
            "下面是将写入当前文件的完整新增内容：",
            fusionConfig.generatedContent,
            "确认后，我会把以上内容作为「学科AI融合」章节写入当前文件。",
          ].join("\n\n")
        : useIdeologyFlow
          ? [
              `你输入的内容：${input.trim()}`,
              ideologyConfig.intro,
              "下面是将写入当前文件的思政融合建议稿：",
              ideologyConfig.generatedContent,
              "确认后，我会把以上内容作为「课程思政融合」段落写入当前文件。",
            ].join("\n\n")
          : [`你输入的内容：${input.trim()}`, DEFAULT_REPLY_BY_TAB[CHAT_CONTEXT_TAB]].join("\n\n"),
      createdAt: now,
      pending: true,
      fusionConfirmTab: useFusionFlow || useIdeologyFlow ? CHAT_CONTEXT_TAB : undefined,
      fusionConfirmId: useFusionFlow || useIdeologyFlow ? fusionConfirmId : undefined,
      fusionConfirmKind: useFusionFlow ? "ai" : useIdeologyFlow ? "ideology" : undefined,
    };
    if (shouldAutoEnableFusion) {
      setFusionEnabled(true);
    }
    if (useFusionFlow) {
      setPendingFusion({ id: fusionConfirmId, kind: "ai" });
    } else if (useIdeologyFlow) {
      setPendingFusion({ id: fusionConfirmId, kind: "ideology" });
    }
    setExtraMsgs((prev) => {
      const curr = prev[currentDesign.id] ?? [];
      return { ...prev, [currentDesign.id]: [...curr, userMsg, aiMsg] };
    });
    setInput("");
  };

  const setFusionEnabledForWorkbench = (next: boolean) => {
    if (!currentDesign) return;
    if (next) setIdeologyFusionEnabled(false);
    setFusionEnabled(next);
    setExtraMsgs((prev) => ({ ...prev, [currentDesign.id]: [] }));
    setPendingFusion(undefined);
    setChatClearedByDesign((prev) => ({ ...prev, [currentDesign.id]: true }));
    setInput("");
  };

  const setIdeologyFusionEnabledForWorkbench = (next: boolean) => {
    if (!currentDesign) return;
    if (next) setFusionEnabled(false);
    setIdeologyFusionEnabled(next);
    setExtraMsgs((prev) => ({ ...prev, [currentDesign.id]: [] }));
    setPendingFusion(undefined);
    setChatClearedByDesign((prev) => ({ ...prev, [currentDesign.id]: true }));
    setInput("");
  };

  const confirmFusionForWorkbench = (confirmId: string) => {
    if (!currentDesign || pendingFusion?.id !== confirmId) return;
    const kind = pendingFusion.kind ?? "ai";
    const now = new Date().toISOString();
    if (kind === "ai") {
      setFusionConfirmed(true);
    }
    setPendingFusion(undefined);
    setExtraMsgs((prev) => {
      const curr = prev[currentDesign.id] ?? [];
      return {
        ...prev,
        [currentDesign.id]: [
          ...curr,
          {
            id: `fusion-confirmed-${Date.now()}`,
            role: "assistant",
            content:
              kind === "ideology"
                ? "已确认，已把上方展示的「课程思政融合」内容写入当前文件。"
                : "已确认，已把上方展示的「学科AI融合」内容写入当前文件。",
            createdAt: now,
          },
        ],
      };
    });
  };

  const acceptFusionOutput = (target: Exclude<TabKey, "AI融合">, source: DesignOutput) => {
    const targetDesign = designs.find((d) => d.tab === target);
    const anchorOutputId = fusionAnchorOutputId(targetDesign, target);
    setAcceptanceNotices((prev) => ({
      ...prev,
      [target]: { ...acceptedNoticeForTarget(target, source), anchorOutputId },
    }));
  };

  const dismissAcceptanceNotice = (target: Exclude<TabKey, "AI融合">) => {
    setAcceptanceNotices((prev) => {
      const next = { ...prev };
      delete next[target];
      return next;
    });
  };

  // Mock class tabs for V2
  const v2ClassTabs = useMemo(() => {
    if (!isV2) return [];
    return [
      { id: "cls-mech-2301", name: "机制2301" },
      { id: "cls-mech-2302", name: "机制2302" },
      { id: "cls-mech-2303", name: "机制2303" },
    ];
  }, [isV2]);

  return (
    <div className="flex flex-col h-full text-[13px]">
      <PageHeader
        back={onBack}
        title={<span className="text-[14px]">{headerTitle}</span>}
      />

      {/* V2 class switching tabs */}
      {isV2 && v2ClassTabs.length > 0 && (
        <div className="shrink-0 flex items-center gap-1 px-4 py-1.5 border-b border-slate-200 bg-white">
          {v2ClassTabs.map((cls) => (
            <button
              key={cls.id}
              type="button"
              onClick={() => setActiveClassId(cls.id)}
              className={`px-3 py-1 rounded-md text-[12px] font-medium transition ${
                activeClassId === cls.id
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cls.name}
            </button>
          ))}
        </div>
      )}

      {isV2 && designV2 ? (
        <DesignBodyV2
          key={`${planId}-${lessonId}-${activeClassId}`}
          designV2={designV2}
          planV2={planV2!}
          lessonV2={lessonV2!}
          aiFlag={aiFlag}
          politicsFlag={politicsFlag}
          onAiFlagChange={setAiFlag}
          onPoliticsFlagChange={setPoliticsFlag}
          activeClassId={activeClassId}
          onOpenDemoSection={onOpenDemoSection}
          input={input}
          onChange={setInput}
        />
      ) : (
        <DesignBody
          key={`${planId}-${sectionId}-${currentDesign?.id ?? "none"}`}
          designsInSection={designs}
          chatDesign={currentDesign}
          sectionTitle={section?.title}
          onOpenDemoSection={onOpenDemoSection}
          extra={currentDesign ? (extraMsgs[currentDesign.id] ?? []) : []}
          input={input}
          onChange={setInput}
          onSend={send}
          acceptanceNotices={acceptanceNotices}
          onDismissAcceptanceNotice={dismissAcceptanceNotice}
          onAcceptFusionOutput={acceptFusionOutput}
          learningAdjustSimulateInitialReply={learningAdjust}
          fusionEnabled={fusionEnabled}
          ideologyFusionEnabled={ideologyFusionEnabled}
          onFusionEnabledChange={setFusionEnabledForWorkbench}
          onIdeologyFusionEnabledChange={setIdeologyFusionEnabledForWorkbench}
          fusionConfirmed={fusionConfirmed}
          pendingFusionId={pendingFusion?.id}
          pendingFusionKind={pendingFusion?.kind}
          chatCleared={Boolean(currentDesign && chatClearedByDesign[currentDesign?.id ?? ""])}
          onConfirmFusion={confirmFusionForWorkbench}
        />
      )}
    </div>
  );
}

/** V2 workbench body: simplified Agent chat + AI化/思政化 switches in left panel + unified output panel */
function DesignBodyV2({
  designV2,
  planV2,
  lessonV2,
  aiFlag,
  politicsFlag,
  onAiFlagChange,
  onPoliticsFlagChange,
  activeClassId,
  onOpenDemoSection,
  input,
  onChange,
}: {
  designV2: TeachingDesignV2;
  planV2: TeachingPlanV2;
  lessonV2: PlanLesson;
  aiFlag: boolean;
  politicsFlag: boolean;
  onAiFlagChange: (v: boolean) => void;
  onPoliticsFlagChange: (v: boolean) => void;
  activeClassId: string;
  onOpenDemoSection?: () => void;
  input: string;
  onChange: (v: string) => void;
}) {
  const messages = designV2.chatHistory;
  const [localMsgs, setLocalMsgs] = useState<LocalMessage[]>([]);
  const allMessages = useMemo(() => [...messages, ...localMsgs], [messages, localMsgs]);

  // Uploaded mock files and selection state
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ id: string; name: string; format: string; source: string; size: string }>>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());

  const allFiles = useMemo(() => {
    const base = designV2.knowledgeFiles.map((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
      const typeLabel = ext === "pdf" ? "PDF" : ext === "docx" || ext === "doc" ? "Word" : ext === "xlsx" || ext === "xls" ? "Excel" : ext === "png" || ext === "jpg" ? "图片" : ext === "pptx" || ext === "ppt" ? "PPT" : ext === "mp4" ? "MP4" : "其他";
      const sourceTag = f.source === "knowledge_base" || f.source === "resource_library" ? "资源库" : "个人上传";
      return { id: f.refId, name: f.name, format: typeLabel, source: sourceTag, sourceRaw: f.source, size: "" };
    });
    return [...base, ...uploadedFiles];
  }, [designV2.knowledgeFiles, uploadedFiles]);

  const allFileIds = useMemo(() => allFiles.map((f) => f.id), [allFiles]);
  const isAllSelected = allFileIds.length > 0 && allFileIds.every((id) => selectedFileIds.has(id));

  const toggleFile = (id: string) => {
    setSelectedFileIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAllFiles = () => {
    if (isAllSelected) {
      setSelectedFileIds(new Set());
    } else {
      setSelectedFileIds(new Set(allFileIds));
    }
  };

  const addMockUpload = () => {
    const fakeFiles = [
      { name: "教学补充材料.pdf", format: "PDF", size: "1.5 MB" },
      { name: "练习题库.docx", format: "Word", size: "820 KB" },
      { name: "课堂笔记模板.xlsx", format: "Excel", size: "340 KB" },
      { name: "三维建模演示.mp4", format: "MP4", size: "15.6 MB" },
    ];
    const pick = fakeFiles[Math.floor(Math.random() * fakeFiles.length)];
    const newFile = { id: `upload-${Date.now()}`, name: pick.name, format: pick.format, source: "个人上传", size: pick.size };
    setUploadedFiles((prev) => [...prev, newFile]);
  };

  // Mock output generation
  const [generatedOutputs, setGeneratedOutputs] = useState<DesignOutputV2[]>([]);

  const generateFromSelected = (type: string) => {
    if (selectedFileIds.size === 0) return;
    const typeInfo = OUTPUT_TYPES_V2.find((t) => t.type === type);
    if (!typeInfo) return;
    const newOutput: DesignOutputV2 = {
      id: `gen-${Date.now()}`,
      type: type as any,
      title: `基于 ${selectedFileIds.size} 个资源生成的${typeInfo.label}`,
      sizeLabel: `${(Math.random() * 10 + 1).toFixed(1)} MB`,
      createdAt: new Date().toISOString(),
      summary: `已基于勾选的 ${selectedFileIds.size} 个资源文件自动生成${typeInfo.label}，包含完整的教学内容与结构。`,
    };
    setGeneratedOutputs((prev) => [newOutput, ...prev]);
  };

  const allOutputs = useMemo(() => [...generatedOutputs, ...designV2.outputs], [generatedOutputs, designV2.outputs]);

  const send = () => {
    if (!input.trim()) return;
    const now = new Date().toISOString();
    const userMsg: LocalMessage = {
      id: `local-${Date.now()}`,
      role: "user",
      content: input,
      createdAt: now,
    };
    const modeHint = aiFlag ? "（AI化模式）" : politicsFlag ? "（思政化模式）" : "";
    const aiMsg: LocalMessage = {
      id: `local-${Date.now() + 1}`,
      role: "assistant",
      content: `${modeHint}已根据你的要求「${input.trim()}」生成对应内容，右栏产出物将同步更新。`,
      createdAt: now,
      pending: true,
    };
    setLocalMsgs((prev) => [...prev, userMsg, aiMsg]);
    onChange("");
  };

  // Map V2 output type to icon
  const iconForV2Output = (type: string) => {
    const entry = OUTPUT_TYPES_V2.find((t) => t.type === type);
    return entry ? entry.icon : <FileText size={14} />;
  };

  return (
    <div className="flex-1 grid grid-cols-12 min-h-0 text-[12px]">
      {/* Left panel: knowledge files + AI化/思政化 switches */}
      <aside className="col-span-2 border-r border-slate-200 bg-white overflow-auto p-3 space-y-4">
        <Section icon={Folder} title={`本节资源（${allFiles.length}）`}>
          {allFiles.length > 0 && (
            <label className="flex items-center gap-1.5 px-1.5 py-0.5 text-[11px] text-indigo-600 cursor-pointer hover:underline select-none">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={toggleAllFiles}
                className="accent-indigo-600"
              />
              {isAllSelected ? "取消全选" : "全选"}
            </label>
          )}
          {allFiles.map((f) => {
            const checked = selectedFileIds.has(f.id);
            const mockSizes = ["6.2 MB", "18.4 MB", "22 MB", "1.3 MB", "280 KB"];
            const mockSize = f.size || mockSizes[allFiles.indexOf(f) % mockSizes.length];
            return (
              <div key={f.id} className={`px-1.5 py-1 rounded text-slate-700 ${checked ? "bg-indigo-50/60" : "hover:bg-slate-50"}`}>
                <div className="flex items-center gap-1.5 text-[11.5px]">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleFile(f.id)}
                    className="accent-indigo-600 shrink-0"
                  />
                  <span className="truncate flex-1">{f.name}</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5 ml-5">
                  <span className="px-1 py-px rounded bg-blue-50 text-blue-600 text-[9px] border border-blue-100">{f.format}</span>
                  <span className={`px-1 py-px rounded text-[9px] border ${
                    f.source === "资源库"
                      ? "bg-violet-50 text-violet-600 border-violet-100"
                      : "bg-emerald-50 text-emerald-600 border-emerald-100"
                  }`}>{f.source}</span>
                  <span className="text-slate-400 text-[9px]">{mockSize}</span>
                </div>
              </div>
            );
          })}
          {allFiles.length === 0 && (
            <div className="text-slate-400 text-[11px]">未添加</div>
          )}
          <button
            type="button"
            onClick={addMockUpload}
            className="w-full mt-1 px-2 py-1 rounded border border-dashed border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 text-[11px] flex items-center justify-center gap-1"
          >
            <Paperclip size={11} /> 上传文件
          </button>
        </Section>

        {/* AI化 toggle */}
        <div
          className={`rounded-xl border px-2.5 py-2 transition ${
            aiFlag ? "border-violet-200 bg-violet-50/70" : "border-slate-200 bg-slate-50/60"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-900">
                <Sparkles size={13} className={aiFlag ? "text-violet-600" : "text-slate-400"} />
                AI化
              </div>
            </div>
            <button
              type="button"
              aria-pressed={aiFlag}
              onClick={() => onAiFlagChange(!aiFlag)}
              className={`relative h-5 w-9 shrink-0 rounded-full transition ${
                aiFlag ? "bg-violet-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition ${
                  aiFlag ? "left-4" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        {/* 思政化 toggle */}
        <div
          className={`rounded-xl border px-2.5 py-2 transition ${
            politicsFlag ? "border-rose-200 bg-rose-50/70" : "border-slate-200 bg-slate-50/60"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-900">
                <Landmark size={13} className={politicsFlag ? "text-rose-600" : "text-slate-400"} />
                思政化
              </div>
            </div>
            <button
              type="button"
              aria-pressed={politicsFlag}
              onClick={() => onPoliticsFlagChange(!politicsFlag)}
              className={`relative h-5 w-9 shrink-0 rounded-full transition ${
                politicsFlag ? "bg-rose-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition ${
                  politicsFlag ? "left-4" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Lesson info */}
        <Section icon={Activity} title="课时信息">
          <div className="text-slate-600 text-[11px] space-y-0.5">
            <div>课时编号：第{lessonV2.lessonNo}课时</div>
            <div>时长：{lessonV2.durationMinutes}分钟</div>
          </div>
        </Section>

        {/* Teaching objectives */}
        <Section icon={ListChecks} title="本节课时教学目标">
          <ul className="list-disc list-inside text-slate-600 text-[11px] space-y-0.5">
            {lessonV2.objectives.length > 0 ? lessonV2.objectives.map((obj, i) => (
              <li key={i}>{obj}</li>
            )) : (
              <li className="text-slate-400">掌握本节核心知识点并能灵活应用</li>
            )}
          </ul>
        </Section>

        {/* Knowledge points to master */}
        <Section icon={Brain} title="需掌握知识点">
          <div className="flex flex-wrap gap-1">
            {lessonV2.knowledgePointNames.length > 0 ? lessonV2.knowledgePointNames.map((name) => (
              <span key={name} className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px]">{name}</span>
            )) : (
              <span className="text-slate-400 text-[11px]">暂无</span>
            )}
          </div>
        </Section>
      </aside>

      {/* Center panel: unified Agent chat */}
      <div className="col-span-7 flex flex-col bg-slate-50 min-h-0">
        <div className="flex-1 overflow-auto p-5 space-y-3">
          {allMessages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[72%] px-3.5 py-2.5 rounded-2xl text-[12.5px] ${
                  m.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-white border border-slate-200 rounded-bl-sm text-slate-800"
                }`}
              >
                {m.role === "assistant" && (
                  <div className="mb-1">
                    <AiBadge>AI 助手</AiBadge>
                    {aiFlag && (
                      <span className="ml-1.5 text-[0.625rem] px-1 py-px rounded bg-violet-100 text-violet-700 border border-violet-200">
                        AI化
                      </span>
                    )}
                    {politicsFlag && (
                      <span className="ml-1.5 text-[0.625rem] px-1 py-px rounded bg-rose-100 text-rose-700 border border-rose-200">
                        思政化
                      </span>
                    )}
                  </div>
                )}
                <p className="leading-relaxed whitespace-pre-line">{m.content}</p>
              </div>
            </div>
          ))}
          {allMessages.length === 0 && (
            <div className="text-center text-slate-400 py-10 text-[12px]">
              暂无对话记录，可在下方输入需求让 AI 生成初稿。
            </div>
          )}
        </div>
        <div className="border-t border-slate-200 bg-white p-3">
          <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5">
            <button className="text-slate-500 hover:text-slate-800 p-1.5">
              <Paperclip size={14} />
            </button>
            <textarea
              value={input}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
              }}
              placeholder="描述你想生成的内容，Cmd+Enter 发送…"
              className="flex-1 bg-transparent outline-none resize-none py-1.5 min-h-[36px] max-h-28 text-[12.5px]"
            />
            <button
              onClick={send}
              className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 text-[12.5px]"
            >
              <Send size={12} /> 发送
            </button>
          </div>
        </div>
      </div>

      {/* Right panel: unified outputs with 7 quick-create buttons */}
      <aside className="col-span-3 border-l border-slate-200 bg-white overflow-auto flex flex-col min-h-0 p-3">
        {selectedFileIds.size > 0 && (
          <div className="mb-2 px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-[11px] text-indigo-700">
            已选 {selectedFileIds.size} 个资源，点击下方按钮生成对应产出物
          </div>
        )}
        <div className="mb-2 text-[10.5px] font-medium text-slate-500 uppercase tracking-wide">
          快速创建产出物
        </div>
        <div className="grid grid-cols-3 gap-1.5 mb-2.5">
          {OUTPUT_TYPES_V2.map((t) => (
            <button
              key={t.type}
              type="button"
              onClick={() => generateFromSelected(t.type)}
              className={`flex flex-col items-center gap-1 px-1.5 py-2 rounded-lg border transition ${
                selectedFileIds.size > 0
                  ? "border-indigo-300 bg-indigo-50/40 hover:bg-indigo-100/50 cursor-pointer"
                  : "border-slate-200 hover:border-indigo-200"
              }`}
            >
              <span className="size-7 rounded-md flex items-center justify-center bg-indigo-50 text-indigo-600">
                {t.icon}
              </span>
              <span className="text-slate-700 text-[11px] leading-tight text-center">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="h-px bg-slate-100 my-2.5 shrink-0" />

        <div className="text-[10.5px] font-medium text-slate-500 uppercase tracking-wide mb-1.5">
          产出物（{allOutputs.length}）
        </div>
        <div className="space-y-2 min-h-0 flex-1 overflow-auto">
          {allOutputs.map((o) => (
            <div
              key={o.id}
              className="border border-slate-200 rounded-lg p-2.5 hover:border-indigo-300 transition"
            >
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  {iconForV2Output(o.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-slate-900 text-[12.5px]">{o.title}</div>
                  <div className="text-slate-500 text-[11px]">
                    {[OUTPUT_TYPES_V2.find((t) => t.type === o.type)?.label ?? o.type, o.sizeLabel, o.durationLabel].filter(Boolean).join(" · ")}
                  </div>
                </div>
              </div>
              <div className="text-slate-500 mt-1 line-clamp-2 text-[11.5px]">{o.summary}</div>
              <div className="flex gap-1 mt-1.5">
                <button className="flex-1 py-0.5 rounded-md border border-slate-200 text-[11.5px] hover:bg-slate-50">
                  预览
                </button>
                <button className="flex-1 py-0.5 rounded-md border border-indigo-200 bg-indigo-50 text-indigo-700 text-[11.5px] hover:bg-indigo-100">
                  下载
                </button>
                <button className="flex-1 py-0.5 rounded-md border border-indigo-200 bg-indigo-50 text-indigo-700 text-[11.5px] hover:bg-indigo-100">
                  发布
                </button>
              </div>
            </div>
          ))}
          {allOutputs.length === 0 && (
            <div className="text-slate-400 text-[11px] py-1 pl-0.5">暂无产出物</div>
          )}
        </div>
      </aside>
    </div>
  );
}

function DesignBody({
  designsInSection,
  chatDesign,
  sectionTitle,
  onOpenDemoSection,
  extra,
  input,
  onChange,
  onSend,
  acceptanceNotices,
  onDismissAcceptanceNotice,
  onAcceptFusionOutput,
  learningAdjustSimulateInitialReply = false,
  fusionEnabled,
  ideologyFusionEnabled,
  onFusionEnabledChange,
  onIdeologyFusionEnabledChange,
  fusionConfirmed,
  pendingFusionId,
  pendingFusionKind,
  chatCleared,
  onConfirmFusion,
}: {
  designsInSection: TeachingDesign[];
  /** 当前对话与左侧栏绑定的教学设计（固定为「讲义」会话） */
  chatDesign: TeachingDesign | undefined;
  sectionTitle?: string;
  onOpenDemoSection?: () => void;
  extra: LocalMessage[];
  input: string;
  onChange: (v: string) => void;
  onSend: () => void;
  acceptanceNotices: Partial<
    Record<Exclude<TabKey, "AI融合">, { id: string; content: string; anchorOutputId?: string }>
  >;
  onDismissAcceptanceNotice: (target: Exclude<TabKey, "AI融合">) => void;
  onAcceptFusionOutput: (target: Exclude<TabKey, "AI融合">, source: DesignOutput) => void;
  learningAdjustSimulateInitialReply?: boolean;
  fusionEnabled: boolean;
  ideologyFusionEnabled: boolean;
  onFusionEnabledChange: (next: boolean) => void;
  onIdeologyFusionEnabledChange: (next: boolean) => void;
  fusionConfirmed: boolean;
  pendingFusionId?: string;
  pendingFusionKind?: "ai" | "ideology";
  chatCleared: boolean;
  onConfirmFusion: (confirmId: string) => void;
}) {
  const design = chatDesign;
  const handoutDesign = useMemo(
    () => designsInSection.find((x) => x.tab === CHAT_CONTEXT_TAB),
    [designsInSection],
  );

  const activeAcceptance = useMemo(() => {
    for (const t of ["讲义", "课堂", "作业"] as const) {
      const n = acceptanceNotices[t];
      if (n) return { target: t, notice: n };
    }
    return undefined;
  }, [acceptanceNotices]);

  const firstUser = design?.chatHistory.find((m) => m.role === "user");
  const firstAssistant = design?.chatHistory.find((m) => m.role === "assistant");

  const [initialAssistantReady, setInitialAssistantReady] = useState(
    !learningAdjustSimulateInitialReply || !design,
  );
  const [initialLoading, setInitialLoading] = useState(
    learningAdjustSimulateInitialReply && Boolean(design),
  );

  useEffect(() => {
    if (!design) {
      setInitialAssistantReady(true);
      setInitialLoading(false);
      return;
    }
    if (!learningAdjustSimulateInitialReply) {
      setInitialAssistantReady(true);
      setInitialLoading(false);
      return;
    }
    setInitialAssistantReady(false);
    setInitialLoading(true);
    const t = window.setTimeout(() => {
      setInitialLoading(false);
      setInitialAssistantReady(true);
    }, 1000);
    return () => clearTimeout(t);
  }, [learningAdjustSimulateInitialReply, design?.id]);

  const messages: LocalMessage[] = useMemo(() => {
    if (!design) return [];
    if (chatCleared) return extra;
    if (learningAdjustSimulateInitialReply && firstUser) {
      const out: LocalMessage[] = [{ ...firstUser } as LocalMessage];
      if (initialLoading) {
        out.push({
          id: `__la-loading-${design.id}`,
          role: "assistant",
          content: "",
          createdAt: new Date().toISOString(),
          loadingPlaceholder: true,
        });
      } else if (initialAssistantReady && firstAssistant) {
        out.push({ ...firstAssistant } as LocalMessage);
      }
      out.push(...extra);
      return out;
    }
    return [...design.chatHistory, ...extra];
  }, [
    design,
    learningAdjustSimulateInitialReply,
    firstUser,
    firstAssistant,
    initialLoading,
    initialAssistantReady,
    design?.chatHistory,
    extra,
    chatCleared,
  ]);

  const handoutSubstitute =
    learningAdjustSimulateInitialReply &&
    initialLoading &&
    handoutDesign?.outputsBeforeInitialAiReply
      ? handoutDesign.outputsBeforeInitialAiReply
      : null;

  const visibleOutputs: DesignOutput[] = useMemo(
    () => collectWorkbenchOutputs(designsInSection, handoutSubstitute),
    [designsInSection, handoutSubstitute],
  );

  const showLearningOutputsPending =
    Boolean(design && handoutDesign && design.id === handoutDesign.id) &&
    learningAdjustSimulateInitialReply &&
    initialLoading &&
    !!handoutDesign.outputs.length &&
    visibleOutputs.length < fullMergedWorkbenchOutputs(designsInSection).length;

  const bubbleAnchorOutputId = useMemo(() => {
    const anchor = activeAcceptance?.notice.anchorOutputId;
    if (!anchor || !visibleOutputs.length) {
      return visibleOutputs[0]?.id;
    }
    const hits = visibleOutputs.some((o) => o.id === anchor);
    return hits ? anchor : visibleOutputs[0]?.id;
  }, [activeAcceptance?.notice.anchorOutputId, visibleOutputs]);

  const showAcceptanceBubble = Boolean(
    activeAcceptance && onDismissAcceptanceNotice && bubbleAnchorOutputId,
  );

  return (
    <div className="flex-1 grid grid-cols-12 min-h-0 text-[12px]">
      <aside className="col-span-2 border-r border-slate-200 bg-white overflow-auto p-3 space-y-4">
        {!design ? (
          <div className="text-slate-500 text-[11.5px] leading-relaxed">
            当前小节尚无可用的<strong className="text-slate-700">教学设计</strong>会话。
            <br />
            <span className="text-slate-400 mt-2 block">
              可点击下方「AI 生成初稿」使用演示数据，或由教师开启备课流程后进入。
            </span>
          </div>
        ) : (
          <>
            <Section icon={Folder} title={`本节资源（${design.knowledgeFiles.length}）`}>
              {design.knowledgeFiles.map((f, idx) => {
                const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
                const typeLabel = ext === "pdf" ? "PDF" : ext === "docx" || ext === "doc" ? "Word" : ext === "xlsx" || ext === "xls" ? "Excel" : ext === "png" || ext === "jpg" ? "图片" : ext === "pptx" || ext === "ppt" ? "PPT" : "其他";
                const sourceTag = f.source === "knowledge_base" || f.source === "resource_library" ? "资源库" : "个人上传";
                const mockSizes = ["6.2 MB", "18.4 MB", "22 MB", "1.3 MB"];
                const mockSize = mockSizes[idx % mockSizes.length];
                return (
                  <div key={f.refId} className="px-1.5 py-1 rounded hover:bg-slate-50 text-slate-700">
                    <div className="flex items-center gap-1 text-[11.5px]">
                      <span className="truncate flex-1">{f.name}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="px-1 py-px rounded bg-blue-50 text-blue-600 text-[9px] border border-blue-100">{typeLabel}</span>
                      <span className={`px-1 py-px rounded text-[9px] border ${
                        f.source === "knowledge_base"
                          ? "bg-violet-50 text-violet-600 border-violet-100"
                          : "bg-emerald-50 text-emerald-600 border-emerald-100"
                      }`}>{sourceTag}</span>
                      <span className="text-slate-400 text-[9px]">{mockSize}</span>
                    </div>
                  </div>
                );
              })}
              {design.knowledgeFiles.length === 0 && (
                <div className="text-slate-400 text-[11px]">未添加</div>
              )}
              <button className="w-full mt-1 px-2 py-1 rounded border border-dashed border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 text-[11px] flex items-center justify-center gap-1">
                <Paperclip size={11} /> 上传文件
              </button>
            </Section>
          </>
        )}
      </aside>

      <div className="col-span-7 flex flex-col bg-slate-50 min-h-0">
        {!design ? (
          <div className="flex-1 overflow-auto flex items-center justify-center p-6">
            <EmptyDesignState
              sectionTitle={sectionTitle}
              onOpenDemo={onOpenDemoSection}
              embedded
            />
          </div>
        ) : (
          <>
        <div className="flex-1 overflow-auto p-5 space-y-3">
          {messages.map((m) =>
            m.loadingPlaceholder ? (
              <div key={m.id} className="flex justify-start">
                <div className="max-w-[72%] px-3.5 py-2.5 rounded-2xl rounded-bl-sm border border-slate-200 bg-white text-[12.5px] text-slate-800">
                  <div className="mb-1">
                    <AiBadge>AI 助手</AiBadge>
                  </div>
                  <div className="flex items-center gap-2 py-1 text-slate-500">
                    <span className="inline-flex gap-1" aria-label="正在生成">
                      <span className="size-1.5 rounded-full bg-indigo-400 animate-pulse" />
                      <span
                        className="size-1.5 rounded-full bg-indigo-400 animate-pulse"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="size-1.5 rounded-full bg-indigo-400 animate-pulse"
                        style={{ animationDelay: "300ms" }}
                      />
                    </span>
                    <span className="text-[11px]">正在生成回复…</span>
                  </div>
                </div>
              </div>
            ) : (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[72%] px-3.5 py-2.5 rounded-2xl text-[12.5px] ${
                    m.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-sm"
                      : "bg-white border border-slate-200 rounded-bl-sm text-slate-800"
                  }`}
                >
                  {m.role === "assistant" && (
                    <div className="mb-1">
                      <AiBadge>AI 助手</AiBadge>
                    </div>
                  )}
                  <p className="leading-relaxed whitespace-pre-line">{m.content}</p>
                  {m.fusionConfirmTab === CHAT_CONTEXT_TAB &&
                    m.fusionConfirmId &&
                    pendingFusionId === m.fusionConfirmId &&
                    (m.fusionConfirmKind ?? "ai") === (pendingFusionKind ?? "ai") && (
                      <button
                        type="button"
                        onClick={() => onConfirmFusion(m.fusionConfirmId!)}
                        className={`mt-2 rounded-lg px-3 py-1.5 text-[11.5px] text-white transition ${
                          m.fusionConfirmKind === "ideology"
                            ? "bg-rose-600 hover:bg-rose-700"
                            : "bg-violet-600 hover:bg-violet-700"
                        }`}
                      >
                        确认写入以上内容
                      </button>
                    )}
                </div>
              </div>
            ),
          )}
          {messages.length === 0 && (
            <div className="text-center text-slate-400 py-10 text-[12px]">
              暂无对话记录，可在下方输入需求让 AI 生成初稿。
            </div>
          )}
        </div>
        <div className="border-t border-slate-200 bg-white p-3">
          <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5">
            <button className="text-slate-500 hover:text-slate-800 p-1.5">
              <Paperclip size={14} />
            </button>
            <textarea
              value={input}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSend();
              }}
              placeholder={
                fusionEnabled || ideologyFusionEnabled
                  ? "描述需求，AI 将结合当前语境生成并可写入融合内容，Cmd+Enter 发送…"
                  : "描述你想生成的内容，可与右侧「可生成的文件类型」对照；Cmd+Enter 发送…"
              }
              className="flex-1 bg-transparent outline-none resize-none py-1.5 min-h-[36px] max-h-28 text-[12.5px]"
            />
            <button
              onClick={onSend}
              disabled={!design}
              className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 text-[12.5px] disabled:opacity-50 disabled:pointer-events-none"
            >
              <Send size={12} /> 发送
            </button>
          </div>
        </div>
          </>
        )}
      </div>

      <aside className="col-span-3 border-l border-slate-200 bg-white overflow-auto flex flex-col min-h-0 p-3">
        <div
          className={`mb-2.5 rounded-xl border px-2.5 py-2 transition ${
            !design ? "opacity-50 pointer-events-none" : ""
          } ${
            fusionEnabled
              ? "border-violet-200 bg-violet-50/70"
              : "border-slate-200 bg-slate-50/60"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-900">
                <Sparkles size={13} className={fusionEnabled ? "text-violet-600" : "text-slate-400"} />
                AI融合建议
              </div>
              {!design && (
                <div className="text-[10px] text-slate-500 mt-0.5 truncate">请先加载本节教学设计会话</div>
              )}
            </div>
            <button
              type="button"
              aria-pressed={fusionEnabled}
              disabled={!design}
              onClick={() => design && onFusionEnabledChange(!fusionEnabled)}
              className={`relative h-5 w-9 shrink-0 rounded-full transition ${
                fusionEnabled ? "bg-violet-600" : "bg-slate-300"
              } disabled:opacity-40`}
            >
              <span
                className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition ${
                  fusionEnabled ? "left-4" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        <div
          className={`mb-2.5 rounded-xl border px-2.5 py-2 transition ${
            !design ? "opacity-50 pointer-events-none" : ""
          } ${
            ideologyFusionEnabled
              ? "border-rose-200 bg-rose-50/70"
              : "border-slate-200 bg-slate-50/60"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-900">
                <Landmark
                  size={13}
                  className={ideologyFusionEnabled ? "text-rose-600" : "text-slate-400"}
                />
                思政融合建议
              </div>
              {!design && (
                <div className="text-[10px] text-slate-500 mt-0.5 truncate">请先加载本节教学设计会话</div>
              )}
            </div>
            <button
              type="button"
              aria-pressed={ideologyFusionEnabled}
              disabled={!design}
              onClick={() => design && onIdeologyFusionEnabledChange(!ideologyFusionEnabled)}
              className={`relative h-5 w-9 shrink-0 rounded-full transition ${
                ideologyFusionEnabled ? "bg-rose-600" : "bg-slate-300"
              } disabled:opacity-40`}
            >
              <span
                className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition ${
                  ideologyFusionEnabled ? "left-4" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="mb-2 text-[10.5px] font-medium text-slate-500 uppercase tracking-wide">
          可生成的文件类型
        </div>
        <div className="grid grid-cols-3 gap-1.5 mb-2.5">
          {WORKBENCH_CREATE_TEMPLATES.map((templ) => {
            const Icon = templ.icon;
            return (
              <button
                key={templ.key}
                type="button"
                className="flex flex-col items-center gap-1 px-1.5 py-2 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition"
              >
                <span className={`size-7 rounded-md flex items-center justify-center ${templ.accent}`}>
                  <Icon size={14} />
                </span>
                <span className="text-slate-700 text-[11px] leading-tight text-center">{templ.label}</span>
              </button>
            );
          })}
        </div>

        <div className="h-px bg-slate-100 my-2.5 shrink-0" />

        <div className="text-[10.5px] font-medium text-slate-500 uppercase tracking-wide mb-1.5">
          产物
        </div>
        <div className="space-y-2 min-h-0">
          {visibleOutputs.map((o) => {
            const Icon = iconForOutput(o.type);
            const draftTone =
              learningAdjustSimulateInitialReply &&
              initialLoading &&
              handoutDesign?.outputsBeforeInitialAiReply?.some((d) => d.id === o.id);
            const fusionEnhanced = fusionEnhancedForOutput(fusionConfirmed, o.id);
            const isBubbleAnchor = showAcceptanceBubble && bubbleAnchorOutputId === o.id;
            return (
              <div key={o.id} className={`relative ${isBubbleAnchor ? "z-40" : "z-0"}`}>
                <div
                  className={`border rounded-lg p-2.5 transition ${
                    draftTone
                      ? "border-amber-200 bg-amber-50/40 hover:border-amber-300"
                      : fusionEnhanced
                        ? "border-violet-200 bg-violet-50/40 hover:border-violet-300"
                        : "border-slate-200 hover:border-indigo-300"
                  } ${isBubbleAnchor ? "ring-2 ring-indigo-500/70 ring-offset-2 ring-offset-white" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="truncate text-slate-900 text-[12.5px]">{o.title}</div>
                        {draftTone && (
                          <span className="shrink-0 text-[0.625rem] px-1 py-px rounded bg-amber-100 text-amber-800 border border-amber-200">
                            草案
                          </span>
                        )}
                        {fusionEnhanced && (
                          <span className="shrink-0 text-[0.625rem] px-1 py-px rounded bg-violet-100 text-violet-800 border border-violet-200">
                            含AI融合
                          </span>
                        )}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        {[outputTypeDisplayLabel(o.type), o.sizeLabel, o.durationLabel].filter(Boolean).join(" · ")}
                      </div>
                    </div>
                  </div>
                  <div className="text-slate-500 mt-1 line-clamp-2 text-[11.5px]">{o.summary}</div>
                  <div className="flex gap-1 mt-1.5">
                    {outputActionLabels(o).map((label, index) => {
                      const acceptTarget = acceptTargetFromLabel(label);
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => acceptTarget && onAcceptFusionOutput(acceptTarget, o)}
                          className={`flex-1 min-w-0 py-0.5 rounded-md border text-[11.5px] ${
                            index === 0
                              ? "border-slate-200 hover:bg-slate-50"
                              : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {isBubbleAnchor && activeAcceptance && onDismissAcceptanceNotice && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1.5 pointer-events-auto drop-shadow-md">
                    <ComicAcceptBubble
                      key={`bubble-${activeAcceptance.notice.id}`}
                      onDismiss={() => onDismissAcceptanceNotice(activeAcceptance.target)}
                    >
                      <div className="font-semibold mb-1 text-emerald-950">已调整当前产物</div>
                      <p className="leading-relaxed text-emerald-900/90">{activeAcceptance.notice.content}</p>
                    </ComicAcceptBubble>
                  </div>
                )}
              </div>
            );
          })}
          {showLearningOutputsPending && (
            <div className="border border-dashed border-indigo-200 rounded-lg px-3 py-3 bg-indigo-50/30 animate-pulse">
              <div className="text-[11px] text-indigo-800 font-medium mb-1">学情衔接产物生成中</div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                将按学情建议补充巩固与衔接类产物（如 2.1 相关条目等），与左侧 AI 回复同步完成…
              </p>
            </div>
          )}
          {visibleOutputs.length === 0 && !showLearningOutputsPending && (
            <div className="text-slate-400 text-[11px] py-1 pl-0.5">暂无产物</div>
          )}
        </div>
      </aside>
    </div>
  );
}

/** 漫画对白：三角指向上方产物卡片；覆盖在下层内容上，点击整块关闭 */
function ComicAcceptBubble({
  onDismiss,
  children,
}: {
  onDismiss: () => void;
  children: ReactNode;
}) {
  return (
    <div className="w-full">
      <div className="relative flex justify-center pointer-events-none" aria-hidden>
        <div className="relative h-3 w-5 -mb-[2px] z-10">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 size-0 border-x-[9px] border-x-transparent border-b-[11px] border-b-emerald-300" />
          <div className="absolute left-1/2 top-[2px] -translate-x-1/2 size-0 border-x-[8px] border-x-transparent border-b-[10px] border-b-emerald-50" />
        </div>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="relative z-0 w-full cursor-pointer rounded-2xl border border-emerald-200/90 bg-emerald-50/95 px-3.5 py-2.5 text-left shadow-lg shadow-slate-900/10 ring-1 ring-emerald-100 backdrop-blur-sm transition hover:bg-emerald-100/95 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
      >
        {children}
      </button>
    </div>
  );
}

function EmptyDesignState({
  sectionTitle,
  onOpenDemo,
  embedded = false,
}: {
  sectionTitle?: string;
  onOpenDemo?: () => void;
  /** 嵌入主栏时使用更紧凑留白 */
  embedded?: boolean;
}) {
  const goDemo = () => onOpenDemo?.();
  const wrapClass = embedded
    ? ""
    : "flex-1 flex items-center justify-center p-8 bg-slate-50";

  const innerClass = embedded
    ? "bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full mx-auto text-center"
    : "bg-white rounded-2xl border border-slate-200 p-10 max-w-xl text-center";

  const iconWrapClass = embedded ? "size-12 rounded-xl mb-3" : "size-16 rounded-2xl mb-4";
  const iconSize = embedded ? 22 : 28;

  return (
    <div className={wrapClass}>
      <div className={innerClass}>
        <div
          className={`mx-auto ${iconWrapClass} bg-indigo-50 text-indigo-500 flex items-center justify-center`}
        >
          <Sparkles size={iconSize} />
        </div>
        <div className="text-slate-900 mb-1">{sectionTitle ?? "该小节"} · 教学设计尚未生成</div>
        <p className="text-slate-500 leading-relaxed text-[12px]">
          该小节还未生成教学设计。你可以从本节资源入手，再让 AI 生成初稿。
        </p>
        <div className="mt-5 flex items-center justify-center">
          <button
            type="button"
            onClick={goDemo}
            disabled={!onOpenDemo}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 inline-flex items-center gap-1 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Sparkles size={14} /> AI 生成初稿
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-slate-500 mb-1.5 text-[11.5px]">
        <Icon size={12} /> <span>{title}</span>
      </div>
      <div className="space-y-1 text-[11.5px]">{children}</div>
    </div>
  );
}

function FileRow({ name, sourceLabel }: { name: string; sourceLabel?: string }) {
  return (
    <div className="px-1.5 py-0.5 rounded hover:bg-slate-50 text-slate-700 flex items-center gap-1 text-[11.5px]">
      <span className="truncate flex-1">📁 {name}</span>
      {sourceLabel && <span className="text-slate-400 text-[10px]">{sourceLabel}</span>}
    </div>
  );
}

