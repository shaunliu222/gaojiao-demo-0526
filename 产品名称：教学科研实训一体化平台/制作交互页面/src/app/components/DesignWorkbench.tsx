import { useMemo, useState } from "react";
import {
  FileText,
  Brain,
  Film,
  Plus,
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
}: {
  planId: string;
  sectionId: string;
  onBack: () => void;
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
    <div className="flex flex-col h-full">
      <PageHeader
        back={onBack}
        title={
          <div className="flex items-center gap-4">
            <span>{headerTitle}</span>
            <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
              {TABS.map(({ key, label }) => {
                const exists = designs.some((d) => d.tab === key);
                return (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`px-4 py-1 rounded-md flex items-center gap-1 ${
                      tab === key
                        ? "bg-white text-indigo-700 shadow"
                        : "text-slate-600 hover:text-slate-800"
                    }`}
                  >
                    {label}
                    {!exists && <span className="text-slate-300 text-[11px]">·空</span>}
                  </button>
                );
              })}
            </div>
          </div>
        }
      />

      {!currentDesign ? (
        <EmptyDesignState tabName={tab} sectionTitle={section?.title} />
      ) : (
        <DesignBody
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
  design,
  extra,
  input,
  onChange,
  onSend,
}: {
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

  return (
    <div className="flex-1 grid grid-cols-12 min-h-0">
      <aside className="col-span-2 border-r border-slate-200 bg-white overflow-auto p-4 space-y-5">
        <Section icon={User} title="人设">
          <div className="px-2 py-2 rounded-md bg-indigo-50 text-indigo-800">
            {persona?.name ?? "—"} ✓
          </div>
          {persona?.description && (
            <div className="text-slate-500 mt-1 line-clamp-3">{persona.description}</div>
          )}
          <button className="text-indigo-600 mt-1">切换 →</button>
        </Section>
        <Section icon={Folder} title={`知识文件（${design.knowledgeFiles.length}）`}>
          {design.knowledgeFiles.map((f) => (
            <FileRow key={f.refId} name={f.name} sourceLabel={fileSourceLabel(f.source)} />
          ))}
          {design.knowledgeFiles.length === 0 && (
            <div className="text-slate-400">未添加</div>
          )}
        </Section>
        <Section icon={Wrench} title={`技能（${skills.length}）`}>
          {skills.map((s) => (
            <Chip key={s!.id} text={s!.name} />
          ))}
          {skills.length === 0 && <div className="text-slate-400">未选择</div>}
        </Section>
        <Section icon={Plug} title={`MCP（${mcps.length}）`}>
          {mcps.map((s) => (
            <Chip key={s!.id} text={s!.name} />
          ))}
          {mcps.length === 0 && <div className="text-slate-400">未连接</div>}
        </Section>
      </aside>

      <div className="col-span-7 flex flex-col bg-slate-50 min-h-0">
        <div className="flex-1 overflow-auto p-6 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[72%] px-4 py-3 rounded-2xl ${
                  m.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-white border border-slate-200 rounded-bl-sm text-slate-800"
                }`}
              >
                {m.role === "assistant" && (
                  <div className="mb-1.5">
                    <AiBadge>AI 助手</AiBadge>
                  </div>
                )}
                <p className="leading-relaxed whitespace-pre-line">{m.content}</p>
              </div>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="text-center text-slate-400 py-12">
              暂无对话记录，可在下方输入需求让 AI 生成初稿。
            </div>
          )}
        </div>
        <div className="border-t border-slate-200 bg-white p-4">
          <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2">
            <button className="text-slate-500 hover:text-slate-800 p-2">
              <Paperclip size={16} />
            </button>
            <textarea
              value={input}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSend();
              }}
              placeholder="描述你想生成的内容，Cmd+Enter 发送..."
              className="flex-1 bg-transparent outline-none resize-none py-2 min-h-[40px] max-h-32"
            />
            <button
              onClick={onSend}
              className="flex items-center gap-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              <Send size={14} /> 发送
            </button>
          </div>
        </div>
      </div>

      <aside className="col-span-3 border-l border-slate-200 bg-white overflow-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-slate-500">右栏 · 生成产物</div>
          <button className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-700">
            <Plus size={14} /> 新建
          </button>
        </div>
        <div className="space-y-2.5">
          {design.outputs.map((o) => {
            const Icon = iconForOutput(o.type);
            return (
              <div
                key={o.id}
                className="border border-slate-200 rounded-lg p-3 hover:border-indigo-300 transition"
              >
                <div className="flex items-center gap-2">
                  <div className="size-9 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-slate-900">{o.title}</span>
                      <AiBadge>AI</AiBadge>
                    </div>
                    <div className="text-slate-500">
                      {[o.type, o.sizeLabel, o.durationLabel].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                </div>
                <div className="text-slate-500 mt-1.5 line-clamp-2">{o.summary}</div>
                <div className="flex gap-1 mt-2">
                  <button className="flex-1 py-1 rounded-md border border-slate-200 hover:bg-slate-50">
                    预览
                  </button>
                  <button className="flex-1 py-1 rounded-md border border-slate-200 hover:bg-slate-50">
                    下载
                  </button>
                </div>
              </div>
            );
          })}
          {design.outputs.length === 0 && (
            <div className="text-slate-400 text-center py-6">
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
}: {
  tabName: TabKey;
  sectionTitle?: string;
}) {
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
          <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 inline-flex items-center gap-1">
            <Sparkles size={14} /> AI 生成初稿
          </button>
          <button className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1">
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
      <div className="flex items-center gap-1.5 text-slate-500 mb-2">
        <Icon size={14} /> <span>{title}</span>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function FileRow({ name, sourceLabel }: { name: string; sourceLabel?: string }) {
  return (
    <div className="px-2 py-1 rounded hover:bg-slate-50 text-slate-700 flex items-center gap-1">
      <span className="truncate flex-1">📁 {name}</span>
      {sourceLabel && <span className="text-slate-400 text-[11px]">{sourceLabel}</span>}
    </div>
  );
}

function Chip({ text }: { text: string }) {
  return (
    <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 mr-1 mb-1">
      {text}
    </span>
  );
}
