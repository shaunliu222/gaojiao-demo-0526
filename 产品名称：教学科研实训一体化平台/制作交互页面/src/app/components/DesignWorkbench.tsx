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
  Plug,
  Sparkles,
  ListChecks,
  PenSquare,
  Presentation,
  Activity,
  Timer,
  Code2,
  Headphones,
  Bot,
  CheckCircle2,
} from "lucide-react";
import { teachingPlans } from "@mock";
import type {
  ChatMessage,
  DesignOutput,
  DesignTab,
  TeachingDesign,
} from "@mock";
import {
  personaById,
  skillOrMcpById,
  classById,
  designsForWorkbenchSection,
} from "../data/lookups";
import { PageHeader, AiBadge } from "./Layout";

type TabKey = DesignTab;
type BusinessTabKey = Exclude<TabKey, "AI融合">;

const TABS: { key: BusinessTabKey; label: string }[] = [
  { key: "讲义", label: "讲义" },
  { key: "课堂", label: "课堂" },
  { key: "作业", label: "作业" },
];

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

const DEFAULT_REPLY_BY_TAB: Record<BusinessTabKey, string> = {
  讲义:
    "已根据你的要求调整当前讲义：补充了轴承座形体分解示意步骤，将原先偏概念化的形体分析法改成「观察实物/模型 → 拆分基本体 → 判断叠加与切割关系 → 对应三视图」的流程说明。\n\n右栏讲义 PDF 将更新为新版，配套思维导图同步增加「组合体拆分步骤」分支。",
  课堂:
    "已根据你的要求调整当前课堂设计：把原有互动环节改成更明确的课堂任务，增加 1 个轴承座三视图纠错活动，并在课堂计时表中补充教师提示语和小组讨论时间。\n\n右栏课堂教案、课堂 PPT 和活动卡会同步更新。",
  作业:
    "已根据你的要求调整当前作业：在原有 4 道基础题、3 道应用题、1 道综合题基础上，新增 1 道轴承座三视图综合纠错题；同时把教师答案中的评分 rubric 拆成「形体分析 30%」「投影对应 35%」「线型与规范 20%」「过程说明 15%」。\n\n右栏学生版作业和教师答案与评分 rubric 将同步更新。",
};

/** 按 Tab 划分的创建模板（类似 LLM notebook） */
type TemplateItem = {
  key: string;
  label: string;
  icon: any;
  accent: string;
};

const TEMPLATES_BY_TAB: Record<TabKey, TemplateItem[]> = {
  讲义: [
    { key: "讲义pdf", label: "讲义", icon: FileText, accent: "text-rose-600 bg-rose-50" },
    { key: "PPT", label: "课件 PPT", icon: Presentation, accent: "text-orange-600 bg-orange-50" },
    { key: "微课视频", label: "微课视频", icon: Film, accent: "text-fuchsia-600 bg-fuchsia-50" },
    { key: "音频", label: "音频讲解", icon: Headphones, accent: "text-cyan-600 bg-cyan-50" },
    { key: "思维导图", label: "思维导图", icon: Brain, accent: "text-emerald-600 bg-emerald-50" },
    { key: "教案", label: "教案", icon: PenSquare, accent: "text-indigo-600 bg-indigo-50" },
  ],
  课堂: [
    { key: "课堂活动", label: "课堂活动", icon: Activity, accent: "text-indigo-600 bg-indigo-50" },
    { key: "互动H5", label: "互动 H5", icon: Sparkles, accent: "text-violet-600 bg-violet-50" },
    { key: "PPT", label: "课堂 PPT", icon: Presentation, accent: "text-orange-600 bg-orange-50" },
    { key: "计时表", label: "课堂计时", icon: Timer, accent: "text-amber-600 bg-amber-50" },
    { key: "教案", label: "课堂教案", icon: PenSquare, accent: "text-sky-600 bg-sky-50" },
  ],
  作业: [
    { key: "客观题组卷", label: "客观题组卷", icon: ListChecks, accent: "text-emerald-600 bg-emerald-50" },
    { key: "主观题", label: "主观题", icon: PenSquare, accent: "text-indigo-600 bg-indigo-50" },
    { key: "编程题", label: "编程题", icon: Code2, accent: "text-slate-700 bg-slate-100" },
    { key: "实训任务", label: "实训任务", icon: Wrench, accent: "text-teal-600 bg-teal-50" },
  ],
  AI融合: [
    { key: "融入策略", label: "融入策略", icon: Sparkles, accent: "text-violet-600 bg-violet-50" },
    { key: "讲义建议", label: "讲义建议", icon: FileText, accent: "text-rose-600 bg-rose-50" },
    { key: "课堂建议", label: "课堂建议", icon: Activity, accent: "text-indigo-600 bg-indigo-50" },
    { key: "AI实训", label: "AI实训", icon: Bot, accent: "text-cyan-600 bg-cyan-50" },
    { key: "诚信边界", label: "诚信边界", icon: CheckCircle2, accent: "text-emerald-600 bg-emerald-50" },
  ],
};

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

function outputActionLabels(output: DesignOutput, tab: TabKey): string[] {
  if (tab === "AI融合" && output.type === "AI融合建议包") {
    return ["预览", "采纳到讲义", "采纳到课堂"];
  }
  if (tab === "AI融合" && output.type === "AI实训练习") {
    return ["预览", "采纳到作业", "发布设置"];
  }
  return ["预览", "下载", "发布"];
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
interface LocalMessage extends ChatMessage {
  pending?: boolean;
  /** 学情模式：占位一条，用于展示 AI 生成中的 loading */
  loadingPlaceholder?: boolean;
  fusionConfirmTab?: BusinessTabKey;
  fusionConfirmId?: string;
}

export function DesignWorkbench({
  planId,
  sectionId,
  onBack,
  onOpenDemoSection,
  /** true 时使用学情专用假数据（仅部分小节有独立剧本） */
  learningAdjust = false,
}: {
  planId: string;
  sectionId: string;
  onBack: () => void;
  /** 假跳转：进入带完整假数据的焦点小节教学设计 */
  onOpenDemoSection?: () => void;
  learningAdjust?: boolean;
}) {
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

  const [tab, setTab] = useState<BusinessTabKey>("讲义");
  const [extraMsgs, setExtraMsgs] = useState<Record<string, LocalMessage[]>>({});
  const [fusionEnabledByTab, setFusionEnabledByTab] = useState<Record<BusinessTabKey, boolean>>({
    讲义: false,
    课堂: false,
    作业: false,
  });
  const [fusionConfirmedByTab, setFusionConfirmedByTab] = useState<Record<BusinessTabKey, boolean>>({
    讲义: false,
    课堂: false,
    作业: false,
  });
  const [pendingFusionByTab, setPendingFusionByTab] = useState<
    Partial<Record<BusinessTabKey, { id: string }>>
  >({});
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

  const currentDesign = designs.find((d) => d.tab === tab);
  const fusionEnabled = fusionEnabledByTab[tab];

  const classNames = plan?.classIds.map((cid) => classById(cid)?.name ?? cid).join("+") ?? "";
  const headerTitle = section ? `${classNames} · ${section.title}` : "教学设计工作台";

  const send = () => {
    if (!input.trim() || !currentDesign) return;
    const now = new Date().toISOString();
    const fusionConfig = AI_FUSION_BY_TAB[tab];
    const fusionConfirmId = `fusion-confirm-${Date.now()}`;
    const shouldAutoEnableFusion = !fusionEnabled && /AI|人工智能/i.test(input);
    const useFusionFlow = fusionEnabled || shouldAutoEnableFusion;
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
        : [`你输入的内容：${input.trim()}`, DEFAULT_REPLY_BY_TAB[tab]].join("\n\n"),
      createdAt: now,
      pending: true,
      fusionConfirmTab: useFusionFlow ? tab : undefined,
      fusionConfirmId: useFusionFlow ? fusionConfirmId : undefined,
    };
    if (shouldAutoEnableFusion) {
      setFusionEnabledByTab((prev) => ({ ...prev, [tab]: true }));
    }
    if (useFusionFlow) {
      setPendingFusionByTab((prev) => ({
        ...prev,
        [tab]: { id: fusionConfirmId },
      }));
    }
    setExtraMsgs((prev) => {
      const curr = prev[currentDesign.id] ?? [];
      return { ...prev, [currentDesign.id]: [...curr, userMsg, aiMsg] };
    });
    setInput("");
  };

  const setFusionEnabledForCurrentTab = (next: boolean) => {
    if (!currentDesign) return;
    setFusionEnabledByTab((prev) => ({ ...prev, [tab]: next }));
    setExtraMsgs((prev) => ({ ...prev, [currentDesign.id]: [] }));
    setPendingFusionByTab((prev) => {
      const copy = { ...prev };
      delete copy[tab];
      return copy;
    });
    setChatClearedByDesign((prev) => ({ ...prev, [currentDesign.id]: true }));
    setInput("");
  };

  const confirmFusionForCurrentTab = (confirmId: string) => {
    if (!currentDesign || pendingFusionByTab[tab]?.id !== confirmId) return;
    const now = new Date().toISOString();
    setFusionConfirmedByTab((prev) => ({ ...prev, [tab]: true }));
    setPendingFusionByTab((prev) => {
      const copy = { ...prev };
      delete copy[tab];
      return copy;
    });
    setExtraMsgs((prev) => {
      const curr = prev[currentDesign.id] ?? [];
      return {
        ...prev,
        [currentDesign.id]: [
          ...curr,
          {
            id: `fusion-confirmed-${Date.now()}`,
            role: "assistant",
            content: "已确认，已把上方展示的「学科AI融合」内容写入当前文件。",
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
    setTab(target);
  };

  const dismissAcceptanceNotice = (target: Exclude<TabKey, "AI融合">) => {
    setAcceptanceNotices((prev) => {
      const next = { ...prev };
      delete next[target];
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full text-[13px]">
      <PageHeader
        back={onBack}
        title={
          <div className="flex items-center gap-4">
            <span className="text-[14px]">{headerTitle}</span>
            <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
              {TABS.map(({ key, label }) => {
                const exists = designs.some((d) => d.tab === key);
                return (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`px-3 py-0.5 rounded-md flex items-center gap-1 text-[13px] ${
                      tab === key
                        ? "bg-white text-indigo-700 shadow"
                        : "text-slate-600 hover:text-slate-800"
                    }`}
                  >
                    {label}
                    {!exists && <span className="text-slate-300 text-[0.625rem]">·空</span>}
                  </button>
                );
              })}
            </div>
          </div>
        }
      />

      {!currentDesign ? (
        <EmptyDesignState
          tabName={tab}
          sectionTitle={section?.title}
          onOpenDemo={onOpenDemoSection}
        />
      ) : (
        <DesignBody
          key={currentDesign.id}
          tab={tab}
          design={currentDesign}
          extra={extraMsgs[currentDesign.id] ?? []}
          input={input}
          onChange={setInput}
          onSend={send}
          acceptanceNotice={acceptanceNotices[tab]}
          onDismissAcceptanceNotice={() => dismissAcceptanceNotice(tab)}
          onAcceptFusionOutput={acceptFusionOutput}
          learningAdjustSimulateInitialReply={learningAdjust}
          fusionEnabled={fusionEnabled}
          onFusionEnabledChange={setFusionEnabledForCurrentTab}
          fusionConfirmed={fusionConfirmedByTab[tab]}
          pendingFusionId={pendingFusionByTab[tab]?.id}
          chatCleared={Boolean(currentDesign && chatClearedByDesign[currentDesign.id])}
          onConfirmFusion={confirmFusionForCurrentTab}
        />
      )}
    </div>
  );
}

function DesignBody({
  tab,
  design,
  extra,
  input,
  onChange,
  onSend,
  acceptanceNotice,
  onDismissAcceptanceNotice,
  onAcceptFusionOutput,
  learningAdjustSimulateInitialReply = false,
  fusionEnabled,
  onFusionEnabledChange,
  fusionConfirmed,
  pendingFusionId,
  chatCleared,
  onConfirmFusion,
}: {
  tab: BusinessTabKey;
  design: TeachingDesign;
  extra: LocalMessage[];
  input: string;
  onChange: (v: string) => void;
  onSend: () => void;
  acceptanceNotice?: { id: string; content: string; anchorOutputId?: string };
  onDismissAcceptanceNotice?: () => void;
  onAcceptFusionOutput: (target: Exclude<TabKey, "AI融合">, source: DesignOutput) => void;
  /** 学情入口：先展示首条用户消息，1s 后再展示首条 AI 回复 */
  learningAdjustSimulateInitialReply?: boolean;
  fusionEnabled: boolean;
  onFusionEnabledChange: (next: boolean) => void;
  fusionConfirmed: boolean;
  pendingFusionId?: string;
  chatCleared: boolean;
  onConfirmFusion: (confirmId: string) => void;
}) {
  const persona = personaById(design.personaId);
  const skills = design.skillIds.map(skillOrMcpById).filter(Boolean);
  const mcps = design.mcpIds.map(skillOrMcpById).filter(Boolean);

  const firstUser = design.chatHistory.find((m) => m.role === "user");
  const firstAssistant = design.chatHistory.find((m) => m.role === "assistant");

  const [initialAssistantReady, setInitialAssistantReady] = useState(
    !learningAdjustSimulateInitialReply,
  );
  const [initialLoading, setInitialLoading] = useState(learningAdjustSimulateInitialReply);

  useEffect(() => {
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
  }, [learningAdjustSimulateInitialReply, design.id]);

  const messages: LocalMessage[] = useMemo(() => {
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
    learningAdjustSimulateInitialReply,
    firstUser,
    firstAssistant,
    initialLoading,
    initialAssistantReady,
    design.chatHistory,
    design.id,
    extra,
    chatCleared,
  ]);

  const visibleOutputs: DesignOutput[] = useMemo(() => {
    return !learningAdjustSimulateInitialReply
      ? design.outputs
      : initialLoading
        ? design.outputsBeforeInitialAiReply ?? []
        : design.outputs;
  }, [
    learningAdjustSimulateInitialReply,
    initialLoading,
    design.outputs,
    design.outputsBeforeInitialAiReply,
  ]);

  const showLearningOutputsPending =
    learningAdjustSimulateInitialReply &&
    initialLoading &&
    design.outputs.length > visibleOutputs.length;

  const bubbleAnchorOutputId = useMemo(() => {
    if (!acceptanceNotice?.anchorOutputId || !visibleOutputs.length) {
      return visibleOutputs[0]?.id;
    }
    const hits = visibleOutputs.some((o) => o.id === acceptanceNotice.anchorOutputId);
    return hits ? acceptanceNotice.anchorOutputId : visibleOutputs[0]?.id;
  }, [acceptanceNotice?.anchorOutputId, visibleOutputs]);

  const showAcceptanceBubble = Boolean(acceptanceNotice && onDismissAcceptanceNotice && bubbleAnchorOutputId);

  const templates = TEMPLATES_BY_TAB[tab];
  const fusionConfig = AI_FUSION_BY_TAB[tab];

  return (
    <div className="flex-1 grid grid-cols-12 min-h-0 text-[12px]">
      <aside className="col-span-2 border-r border-slate-200 bg-white overflow-auto p-3 space-y-4">
        <Section icon={User} title="人设">
          <div className="px-2 py-1.5 rounded-md bg-indigo-50 text-indigo-800">
            {persona?.name ?? "—"} ✓
          </div>
          {persona?.description && (
            <div className="text-slate-500 mt-1 line-clamp-3 text-[11px]">{persona.description}</div>
          )}
          <button className="text-indigo-600 mt-1 text-[11px]">切换 →</button>
        </Section>
        <Section icon={Folder} title={`知识文件（${design.knowledgeFiles.length}）`}>
          {design.knowledgeFiles.map((f) => (
            <FileRow key={f.refId} name={f.name} sourceLabel={fileSourceLabel(f.source)} />
          ))}
          {design.knowledgeFiles.length === 0 && (
            <div className="text-slate-400 text-[11px]">未添加</div>
          )}
        </Section>
        <Section icon={Wrench} title={`技能（${skills.length}）`}>
          {skills.map((s) => (
            <Chip key={s!.id} text={s!.name} />
          ))}
          {skills.length === 0 && <div className="text-slate-400 text-[11px]">未选择</div>}
        </Section>
        <Section icon={Plug} title={`MCP（${mcps.length}）`}>
          {mcps.map((s) => (
            <Chip key={s!.id} text={s!.name} />
          ))}
          {mcps.length === 0 && <div className="text-slate-400 text-[11px]">未连接</div>}
        </Section>
      </aside>

      <div className="col-span-7 flex flex-col bg-slate-50 min-h-0">
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
                  {m.fusionConfirmTab === tab &&
                    m.fusionConfirmId &&
                    pendingFusionId === m.fusionConfirmId && (
                      <button
                        type="button"
                        onClick={() => onConfirmFusion(m.fusionConfirmId!)}
                        className="mt-2 rounded-lg bg-violet-600 px-3 py-1.5 text-[11.5px] text-white transition hover:bg-violet-700"
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
                fusionEnabled
                  ? "描述需求，AI 会融合右侧建议生成内容，Cmd+Enter 发送..."
                  : "描述你想生成的内容，Cmd+Enter 发送..."
              }
              className="flex-1 bg-transparent outline-none resize-none py-1.5 min-h-[36px] max-h-28 text-[12.5px]"
            />
            <button
              onClick={onSend}
              className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 text-[12.5px]"
            >
              <Send size={12} /> 发送
            </button>
          </div>
        </div>
      </div>

      <aside className="col-span-3 border-l border-slate-200 bg-white overflow-auto p-3">
        <div
          className={`mb-2.5 rounded-xl border px-2.5 py-2 transition ${
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
            </div>
            <button
              type="button"
              aria-pressed={fusionEnabled}
              onClick={() => onFusionEnabledChange(!fusionEnabled)}
              className={`relative h-5 w-9 shrink-0 rounded-full transition ${
                fusionEnabled ? "bg-violet-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition ${
                  fusionEnabled ? "left-4" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="mb-2.5">
          <div className="grid grid-cols-3 gap-1.5">
            {templates.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  type="button"
                  className="flex flex-col items-center gap-1 px-1.5 py-2 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition"
                >
                  <span className={`size-7 rounded-md flex items-center justify-center ${t.accent}`}>
                    <Icon size={14} />
                  </span>
                  <span className="text-slate-700 text-[11px] leading-tight text-center">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-px bg-slate-100 my-2.5" />

        <div className="space-y-2">
          {visibleOutputs.map((o) => {
            const Icon = iconForOutput(o.type);
            const draftTone =
              learningAdjustSimulateInitialReply &&
              initialLoading &&
              design.outputsBeforeInitialAiReply?.some((d) => d.id === o.id);
            const fusionEnhanced =
              fusionConfirmed && fusionConfig.enhancedOutputIds.includes(o.id);
            const isBubbleAnchor = showAcceptanceBubble && bubbleAnchorOutputId === o.id;
            return (
              <div
                key={o.id}
                className={`relative ${isBubbleAnchor ? "z-40" : "z-0"}`}
              >
                <div
                  className={`border rounded-lg p-2.5 transition ${
                    draftTone
                      ? "border-amber-200 bg-amber-50/40 hover:border-amber-300"
                      : fusionEnhanced
                        ? "border-violet-200 bg-violet-50/40 hover:border-violet-300"
                      : "border-slate-200 hover:border-indigo-300"
                  } ${
                    isBubbleAnchor ? "ring-2 ring-indigo-500/70 ring-offset-2 ring-offset-white" : ""
                  }`}
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
                        {[o.type, o.sizeLabel, o.durationLabel].filter(Boolean).join(" · ")}
                      </div>
                    </div>
                  </div>
                  <div className="text-slate-500 mt-1 line-clamp-2 text-[11.5px]">{o.summary}</div>
                  <div className="flex gap-1 mt-1.5">
                    {outputActionLabels(o, tab).map((label, index) => {
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
                {isBubbleAnchor && acceptanceNotice && onDismissAcceptanceNotice && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1.5 pointer-events-auto drop-shadow-md">
                    <ComicAcceptBubble
                      key={`bubble-${acceptanceNotice.id}`}
                      onDismiss={onDismissAcceptanceNotice}
                    >
                      <div className="font-semibold mb-1 text-emerald-950">已调整当前产物</div>
                      <p className="leading-relaxed text-emerald-900/90">{acceptanceNotice.content}</p>
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
            <div className="text-slate-400 text-center py-5 text-[11.5px]">
              暂无产物，发送指令让 AI 生成
            </div>
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
  tabName,
  sectionTitle,
  onOpenDemo,
}: {
  tabName: TabKey;
  sectionTitle?: string;
  onOpenDemo?: () => void;
}) {
  const goDemo = () => onOpenDemo?.();
  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
      <div className="bg-white rounded-2xl border border-slate-200 p-10 max-w-xl text-center">
        <div className="mx-auto size-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-4">
          <Sparkles size={28} />
        </div>
        <div className="text-slate-900 mb-1">{sectionTitle ?? "该小节"} · {tabName}设计尚未生成</div>
        <p className="text-slate-500 leading-relaxed">
          该小节还未生成教学设计。你可以从人设、知识文件、技能工具入手，再让 AI 生成{tabName}初稿。
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

function Chip({ text }: { text: string }) {
  return (
    <span className="inline-block px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 mr-1 mb-1 text-[11px]">
      {text}
    </span>
  );
}
