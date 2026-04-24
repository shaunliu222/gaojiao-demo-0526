import { useMemo, useState } from "react";
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
  Image as ImageIcon,
  ListChecks,
  PenSquare,
  Presentation,
  Activity,
  Timer,
  Code2,
  Headphones,
} from "lucide-react";
import { designsBySection, teachingPlans } from "@mock";
import type {
  ChatMessage,
  DesignOutput,
  DesignTab,
  TeachingDesign,
} from "@mock";
import { personaById, skillOrMcpById, classById } from "../data/lookups";
import { PageHeader, AiBadge } from "./Layout";

type TabKey = DesignTab;

const TABS: { key: TabKey; label: string }[] = [
  { key: "讲义", label: "讲义" },
  { key: "课堂", label: "课堂" },
  { key: "作业", label: "作业" },
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
    default:
      return FileText;
  }
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
}

export function DesignWorkbench({
  planId,
  sectionId,
  onBack,
  onOpenDemoSection,
}: {
  planId: string;
  sectionId: string;
  onBack: () => void;
  /** 假跳转：进入带完整假数据的焦点小节教学设计 */
  onOpenDemoSection?: () => void;
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

  const key = `${planId}::${sectionId}`;
  const designs: TeachingDesign[] = designsBySection[key] ?? [];

  const [tab, setTab] = useState<TabKey>("讲义");
  const [extraMsgs, setExtraMsgs] = useState<Record<string, LocalMessage[]>>({});
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
          tab={tab}
          design={currentDesign}
          extra={extraMsgs[currentDesign.id] ?? []}
          input={input}
          onChange={setInput}
          onSend={send}
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
}: {
  tab: TabKey;
  design: TeachingDesign;
  extra: LocalMessage[];
  input: string;
  onChange: (v: string) => void;
  onSend: () => void;
}) {
  const persona = personaById(design.personaId);
  const skills = design.skillIds.map(skillOrMcpById).filter(Boolean);
  const mcps = design.mcpIds.map(skillOrMcpById).filter(Boolean);
  const messages: LocalMessage[] = [...design.chatHistory, ...extra];
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
          {messages.map((m) => (
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
          ))}
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
          <div className="text-slate-500 mb-2 text-[11px]">从模板创建 · {tab}</div>
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
          {design.outputs.map((o) => {
            const Icon = iconForOutput(o.type);
            return (
              <div
                key={o.id}
                className="border border-slate-200 rounded-lg p-2.5 hover:border-indigo-300 transition"
              >
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-slate-900 text-[12.5px]">{o.title}</div>
                    <div className="text-slate-500 text-[11px]">
                      {[o.type, o.sizeLabel, o.durationLabel].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                </div>
                <div className="text-slate-500 mt-1 line-clamp-2 text-[11.5px]">{o.summary}</div>
                <div className="flex gap-1 mt-1.5">
                  <button
                    type="button"
                    className="flex-1 min-w-0 py-0.5 rounded-md border border-slate-200 hover:bg-slate-50 text-[11.5px]"
                  >
                    预览
                  </button>
                  <button
                    type="button"
                    className="flex-1 min-w-0 py-0.5 rounded-md border border-slate-200 hover:bg-slate-50 text-[11.5px]"
                  >
                    下载
                  </button>
                  <button
                    type="button"
                    className="flex-1 min-w-0 py-0.5 rounded-md border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-[11.5px]"
                  >
                    发布
                  </button>
                </div>
              </div>
            );
          })}
          {design.outputs.length === 0 && (
            <div className="text-slate-400 text-center py-5 text-[11.5px]">
              暂无产物，发送指令让 AI 生成
            </div>
          )}
        </div>
      </aside>
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
        <div className="mt-5 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={goDemo}
            disabled={!onOpenDemo}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 inline-flex items-center gap-1 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Sparkles size={14} /> AI 生成初稿
          </button>
          <button
            type="button"
            onClick={goDemo}
            disabled={!onOpenDemo}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1 disabled:opacity-50 disabled:pointer-events-none"
          >
            <ImageIcon size={14} /> 从模板开始
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
