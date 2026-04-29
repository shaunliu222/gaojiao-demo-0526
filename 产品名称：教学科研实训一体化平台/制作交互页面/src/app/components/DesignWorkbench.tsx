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

const TABS: { key: TabKey; label: string }[] = [
  { key: "讲义", label: "讲义" },
  { key: "课堂", label: "课堂" },
  { key: "作业", label: "作业" },
  { key: "AI融合", label: "AI融合" },
];

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

  const [tab, setTab] = useState<TabKey>("讲义");
  const [extraMsgs, setExtraMsgs] = useState<Record<string, LocalMessage[]>>({});
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

  const classNames = plan?.classIds.map((cid) => classById(cid)?.name ?? cid).join("+") ?? "";
  const headerTitle = section ? `${classNames} · ${section.title}` : "教学设计工作台";

  const send = () => {
    if (!input.trim() || !currentDesign) return;
    const now = new Date().toISOString();
    const userMsg: LocalMessage = {
      id: `local-${Date.now()}`,
      role: "user",
      content: input,
      createdAt: now,
    };
    const aiMsg: LocalMessage = {
      id: `local-${Date.now() + 1}`,
      role: "assistant",
      content: "已根据你的要求进行调整，右栏产物将在稍后更新。",
      createdAt: now,
      pending: true,
    };
    setExtraMsgs((prev) => {
      const curr = prev[currentDesign.id] ?? [];
      return { ...prev, [currentDesign.id]: [...curr, userMsg, aiMsg] };
    });
    setInput("");
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
          acceptanceNotice={
            tab === "AI融合" ? undefined : acceptanceNotices[tab as Exclude<TabKey, "AI融合">]
          }
          onDismissAcceptanceNotice={
            tab === "AI融合"
              ? undefined
              : () => dismissAcceptanceNotice(tab as Exclude<TabKey, "AI融合">)
          }
          onAcceptFusionOutput={acceptFusionOutput}
          learningAdjustSimulateInitialReply={learningAdjust}
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
}: {
  tab: TabKey;
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
  ]);

  const visibleOutputs: DesignOutput[] = useMemo(() => {
    if (!learningAdjustSimulateInitialReply) return design.outputs;
    if (initialLoading) return design.outputsBeforeInitialAiReply ?? [];
    return design.outputs;
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
              placeholder="描述你想生成的内容，Cmd+Enter 发送..."
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
