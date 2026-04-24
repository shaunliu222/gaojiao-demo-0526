import { useMemo, useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Target,
  Send,
  Paperclip,
  Folder,
  Globe,
  Network,
  BookOpen,
  CheckCircle2,
  Film,
  Brain,
  FileText,
  NotebookPen,
  ListChecks,
  Lightbulb,
  Wrench,
  BookmarkCheck,
  Clock,
  MessageSquareMore,
  History,
  PlayCircle,
  Check,
  ChevronDown,
} from "lucide-react";
import { resources, personas } from "@mock";
import type { Persona } from "@mock";
import { PageHeader, AiBadge } from "../Layout";
import {
  studentById,
  graphNodeById,
  studentProfileByStudentId,
  resourcesByNode,
  personaById,
} from "../../data/lookups";
import {
  learnScenariosByStudent,
  LearnScenario,
} from "../../data/studentMock";

// 可选知识源
const KNOWLEDGE_SOURCES = [
  { id: "src-resource", name: "教学资源库", icon: BookOpen },
  { id: "src-graph", name: "知识图谱", icon: Network },
  { id: "src-internet", name: "联网检索", icon: Globe },
  { id: "src-notes", name: "我的笔记", icon: Folder },
] as const;

type SourceId = (typeof KNOWLEDGE_SOURCES)[number]["id"];

// 学习风格选项（来自 studentProfile 的 learningStyle）
const STYLE_SUGGESTIONS: Record<string, string> = {
  视觉型: "多用图示 / 动画 / 颜色编码，少用大段文字",
  动觉型: "先摸实物 / 做实操，再回到抽象概念",
  读写型: "用清晰的条目列表和完整句子讲解",
  听觉型: "口语化 + 可朗读段落",
  混合型: "结合多种方式，随机切换",
};

// Prompt 建议（空态用）
const PROMPT_SUGGESTIONS = [
  {
    title: "教我看懂组合体三视图",
    hint: "从形体分析法入手，给我 5 个例子逐级加难度",
    icon: BookOpen,
  },
  {
    title: "把截交线讲得像故事一样",
    hint: "我喜欢先听一个情境再懂公式",
    icon: Lightbulb,
  },
  {
    title: "考前半小时我该做什么",
    hint: "以我现在的画像，帮我拆出最短路径",
    icon: Clock,
  },
];

type Msg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
};

type Tab = "live" | "history";

export function LearnCenter({
  studentId,
  presetSectionId,
  presetGoalNodeIds,
}: {
  studentId: string;
  presetSectionId?: string;
  presetGoalNodeIds?: string[];
}) {
  const student = studentById(studentId);
  const profile = studentProfileByStudentId(studentId);

  // 目标知识点：优先用路由预填
  const initialGoalNodeIds = presetGoalNodeIds ?? pickDefaultGoalNodeIds(studentId);
  const [goalNodeIds, setGoalNodeIds] = useState<string[]>(initialGoalNodeIds);

  // 同步 URL 预填（切换身份或路由时）
  useEffect(() => {
    setGoalNodeIds(presetGoalNodeIds ?? pickDefaultGoalNodeIds(studentId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, presetGoalNodeIds?.join("|"), presetSectionId]);

  const [sources, setSources] = useState<Set<SourceId>>(
    new Set(["src-resource", "src-graph"]),
  );

  // 人设：给学生端独立挑选 3 个情境
  const studentPersonas = useMemo(() => pickStudentPersonas(), []);
  const [personaId, setPersonaId] = useState<string>(studentPersonas[0].id);

  // 学习风格
  const [style, setStyle] = useState<string>(profile?.learningStyle ?? "视觉型");

  // Tab 切换
  const [tab, setTab] = useState<Tab>("live");

  // 对话流
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
  }, [messages.length]);

  // 产物
  const [mastered, setMastered] = useState<boolean[]>(
    Array(Math.max(goalNodeIds.length, 3)).fill(false),
  );
  useEffect(() => {
    setMastered(Array(Math.max(goalNodeIds.length, 3)).fill(false));
  }, [goalNodeIds.join("|")]);

  const goalNodes = goalNodeIds.map(graphNodeById).filter((n) => !!n);
  const firstGoal = goalNodes[0]?.name ?? "学习目标";

  // 按目标知识点自动带出推荐的平台资源
  const recommendedResources = useMemo(() => {
    const hits = new Map<string, (typeof resources)[number]>();
    for (const nid of goalNodeIds) {
      for (const r of resourcesByNode(nid)) {
        hits.set(r.id, r);
      }
    }
    return Array.from(hits.values()).slice(0, 4);
  }, [goalNodeIds]);

  const history = learnScenariosByStudent(studentId);

  const send = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;
    const baseId = Date.now();
    const userMsg: Msg = {
      id: `u-${baseId}`,
      role: "user",
      content,
    };
    const reply = mockReplyFor(content, {
      style,
      persona: personaById(personaId),
      goal: firstGoal,
    });
    const aiMsg: Msg = {
      id: `a-${baseId + 1}`,
      role: "assistant",
      content: reply,
      pending: true,
    };
    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput("");
  };

  const toggleSource = (id: SourceId) => {
    setSources((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={
          <div className="flex items-center gap-4">
            <span>学习中心</span>
            <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
              <TabButton
                active={tab === "live"}
                onClick={() => setTab("live")}
                label="本次学习"
                icon={<MessageSquareMore size={14} />}
              />
              <TabButton
                active={tab === "history"}
                onClick={() => setTab("history")}
                label={`历史场景（${history.length}）`}
                icon={<History size={14} />}
              />
            </div>
          </div>
        }
        actions={
          <span className="text-slate-500">
            学习者：{student?.name ?? "—"}
          </span>
        }
      />

      {tab === "live" ? (
        <div className="flex-1 grid grid-cols-12 min-h-0">
          {/* 左：学习场景配置 */}
          <aside className="col-span-3 border-r border-slate-200 bg-white overflow-auto p-4 space-y-5">
            <ConfigSection icon={Target} title="学习目标">
              <div className="text-slate-500 text-[12px] mb-1.5">
                本次想掌握的知识点
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {goalNodes.length === 0 && (
                  <span className="text-slate-400 text-[12px]">
                    尚未选择知识点，可从推荐里添加
                  </span>
                )}
                {goalNodes.map((n) => (
                  <span
                    key={n!.id}
                    className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 inline-flex items-center gap-1"
                  >
                    {n!.name}
                    <button
                      onClick={() =>
                        setGoalNodeIds((prev) =>
                          prev.filter((x) => x !== n!.id),
                        )
                      }
                      className="text-indigo-400 hover:text-indigo-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <GoalPicker
                studentId={studentId}
                existing={goalNodeIds}
                onAdd={(nid) =>
                  setGoalNodeIds((prev) =>
                    prev.includes(nid) ? prev : [...prev, nid],
                  )
                }
              />
              <div className="mt-3 text-slate-500 text-[12px]">
                我的学习风格
              </div>
              <StyleSelect value={style} onChange={setStyle} />
              <div className="text-slate-400 text-[11px] mt-1">
                {STYLE_SUGGESTIONS[style] ??
                  "AI 会按你的偏好组织内容"}
              </div>
            </ConfigSection>

            <ConfigSection icon={Folder} title="知识来源">
              <div className="space-y-1">
                {KNOWLEDGE_SOURCES.map((s) => {
                  const Icon = s.icon;
                  const active = sources.has(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleSource(s.id)}
                      className={`w-full px-2.5 py-1.5 rounded-lg border text-left flex items-center gap-2 ${
                        active
                          ? "border-indigo-300 bg-indigo-50/70 text-indigo-700"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Icon size={14} />
                      <span className="flex-1">{s.name}</span>
                      {active && <Check size={14} className="text-indigo-500" />}
                    </button>
                  );
                })}
              </div>
            </ConfigSection>

            <ConfigSection icon={Sparkles} title="AI 人设">
              <div className="space-y-1">
                {studentPersonas.map((p) => (
                  <PersonaOption
                    key={p.id}
                    persona={p}
                    active={personaId === p.id}
                    onPick={() => setPersonaId(p.id)}
                  />
                ))}
              </div>
            </ConfigSection>

            <ConfigSection icon={BookOpen} title="推荐资源">
              {recommendedResources.length === 0 ? (
                <div className="text-slate-400 text-[12px]">
                  选择目标知识点后会出现推荐
                </div>
              ) : (
                <div className="space-y-1">
                  {recommendedResources.map((r) => (
                    <div
                      key={r.id}
                      className="px-2 py-1.5 rounded-md bg-slate-50 text-slate-700 text-[12px] flex items-center gap-2"
                    >
                      <span className="size-5 rounded bg-white flex items-center justify-center text-slate-500">
                        {iconForResType(r.type)}
                      </span>
                      <span className="truncate flex-1">{r.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </ConfigSection>
          </aside>

          {/* 中：对话流 */}
          <div className="col-span-6 flex flex-col bg-slate-50 min-h-0">
            {messages.length === 0 ? (
              <EmptyDialog
                studentName={student?.name ?? "同学"}
                goal={firstGoal}
                onPick={(p) => send(p)}
              />
            ) : (
              <div
                ref={scrollRef}
                className="flex-1 overflow-auto p-6 space-y-4"
              >
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${
                      m.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[72%] px-4 py-3 rounded-2xl ${
                        m.role === "user"
                          ? "bg-indigo-600 text-white rounded-br-sm"
                          : "bg-white border border-slate-200 rounded-bl-sm text-slate-800"
                      }`}
                    >
                      {m.role === "assistant" && (
                        <div className="mb-1.5 flex items-center gap-1">
                          <AiBadge>
                            {personaById(personaId)?.name ?? "AI"}
                          </AiBadge>
                          {m.pending && (
                            <span className="text-slate-400 text-[11px]">
                              · 正在为你生成学习产物…
                            </span>
                          )}
                        </div>
                      )}
                      <p className="leading-relaxed whitespace-pre-line">
                        {m.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t border-slate-200 bg-white p-4">
              <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2">
                <button className="text-slate-500 hover:text-slate-800 p-2">
                  <Paperclip size={16} />
                </button>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
                  }}
                  placeholder="问任何问题，Cmd+Enter 发送..."
                  className="flex-1 bg-transparent outline-none resize-none py-2 min-h-[40px] max-h-32"
                />
                <button
                  onClick={() => send()}
                  className="flex items-center gap-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  <Send size={14} /> 发送
                </button>
              </div>
            </div>
          </div>

          {/* 右：学习场景产物 */}
          <aside className="col-span-3 border-l border-slate-200 bg-white overflow-auto p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-slate-500">本次学习场景 · 产物</div>
              <span className="text-slate-400 text-[11px]">
                {messages.length === 0 ? "待开始" : "实时生成"}
              </span>
            </div>

            {messages.length === 0 ? (
              <div className="text-slate-400 text-[13px] bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4 leading-relaxed">
                开始对话后，AI 会在这里同步生成：
                <br />· 学习要点笔记 · 互动小测 · 推荐视频 · 思维导图
              </div>
            ) : (
              <>
                <OutputCard
                  icon={<NotebookPen size={14} />}
                  type="学习笔记"
                  title={`${firstGoal} · 要点整理`}
                  detail="AI 已为你归纳 3 条核心要点，一键加入知识笔记。"
                />
                <OutputCard
                  icon={<ListChecks size={14} />}
                  type="互动小测"
                  title="3 题随堂小测"
                  detail="刚才提到的概念转成 3 道选择题，完成后自动评分。"
                  actionLabel="去作答"
                />
                {recommendedResources.slice(0, 2).map((r) => (
                  <OutputCard
                    key={r.id}
                    icon={<Film size={14} />}
                    type={r.type === "video" ? "推荐视频" : "推荐资源"}
                    title={r.title}
                    detail={r.description}
                    actionLabel="打开"
                  />
                ))}
                <OutputCard
                  icon={<Brain size={14} />}
                  type="思维导图"
                  title={`${firstGoal} · 知识结构`}
                  detail="围绕今天的目标生成 1 张树状图。"
                  actionLabel="预览"
                />
              </>
            )}

            {/* 已掌握检查 */}
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="text-slate-500 mb-2 flex items-center gap-1.5">
                <BookmarkCheck size={14} className="text-indigo-500" />
                已掌握检查
              </div>
              <div className="text-slate-900 mb-2">
                {mastered.filter(Boolean).length}/{mastered.length} 目标
              </div>
              <div className="space-y-1.5">
                {(goalNodes.length > 0
                  ? goalNodes
                  : [
                      { id: "x-1", name: "核心概念" },
                      { id: "x-2", name: "典型例题" },
                      { id: "x-3", name: "常见误区" },
                    ]
                ).map((n, idx) => {
                  const ok = !!mastered[idx];
                  return (
                    <button
                      key={n!.id}
                      onClick={() =>
                        setMastered((prev) => {
                          const next = [...prev];
                          next[idx] = !next[idx];
                          return next;
                        })
                      }
                      className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md ${
                        ok
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {ok ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <span className="size-3.5 rounded-full border-2 border-slate-300" />
                      )}
                      <span>{n!.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      ) : (
        <HistoryPanel history={history} />
      )}
    </div>
  );
}

// ============ 组件：配置区小节 ============

function ConfigSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-slate-500 mb-2">
        <Icon size={14} />
        <span>{title}</span>
      </div>
      {children}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-md flex items-center gap-1 ${
        active
          ? "bg-white text-indigo-700 shadow"
          : "text-slate-600 hover:text-slate-800"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function StyleSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const all = Object.keys(STYLE_SUGGESTIONS);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-left flex items-center justify-between"
      >
        <span>{value}</span>
        <ChevronDown size={14} className="text-slate-400" />
      </button>
      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] w-full bg-white border border-slate-200 rounded-lg shadow-lg z-10 p-1">
          {all.map((k) => (
            <button
              key={k}
              onClick={() => {
                onChange(k);
                setOpen(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-md ${
                value === k
                  ? "bg-indigo-50 text-indigo-700"
                  : "hover:bg-slate-50 text-slate-700"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function GoalPicker({
  studentId,
  existing,
  onAdd,
}: {
  studentId: string;
  existing: string[];
  onAdd: (nodeId: string) => void;
}) {
  const profile = studentProfileByStudentId(studentId);
  // 候选 = 画像热图里的、且不在 existing 里的
  const options = (profile?.masteryHeatmap ?? [])
    .filter((p) => !existing.includes(p.knowledgePointId))
    .slice(0, 4);
  if (options.length === 0) return null;
  return (
    <div>
      <div className="text-slate-400 text-[11px] mb-1">AI 推荐</div>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => (
          <button
            key={o.knowledgePointId}
            onClick={() => onAdd(o.knowledgePointId)}
            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 inline-flex items-center gap-1"
          >
            + {o.knowledgePointName}
            <span
              className={`text-[10px] ${
                o.masteryLevel < 60
                  ? "text-rose-500"
                  : o.masteryLevel < 80
                  ? "text-amber-500"
                  : "text-emerald-500"
              }`}
            >
              {o.masteryLevel}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function PersonaOption({
  persona,
  active,
  onPick,
}: {
  persona: Persona;
  active: boolean;
  onPick: () => void;
}) {
  return (
    <button
      onClick={onPick}
      className={`w-full px-2.5 py-2 rounded-lg border text-left ${
        active
          ? "border-indigo-300 bg-indigo-50/70"
          : "border-slate-200 hover:bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`size-7 rounded-lg flex items-center justify-center ${
            active
              ? "bg-gradient-to-br from-violet-500 to-indigo-500 text-white"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          <Sparkles size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <div
            className={`truncate ${active ? "text-indigo-700" : "text-slate-800"}`}
          >
            {persona.name}
          </div>
          {persona.description && (
            <div className="text-slate-400 text-[11px] line-clamp-1">
              {persona.description}
            </div>
          )}
        </div>
        {active && <Check size={14} className="text-indigo-500" />}
      </div>
    </button>
  );
}

function OutputCard({
  icon,
  type,
  title,
  detail,
  actionLabel,
}: {
  icon: React.ReactNode;
  type: string;
  title: string;
  detail: string;
  actionLabel?: string;
}) {
  return (
    <div className="border border-slate-200 rounded-lg p-3 hover:border-indigo-300 transition">
      <div className="flex items-center gap-2 mb-1">
        <div className="size-7 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
          {icon}
        </div>
        <span className="text-slate-500 text-[12px]">{type}</span>
        <AiBadge>AI 生成</AiBadge>
      </div>
      <div className="text-slate-900 line-clamp-1">{title}</div>
      <p className="text-slate-500 text-[12px] line-clamp-2 mt-0.5 leading-relaxed">
        {detail}
      </p>
      <button className="mt-2 w-full py-1 rounded-md border border-slate-200 hover:bg-slate-50 text-[12px]">
        {actionLabel ?? "打开"}
      </button>
    </div>
  );
}

// ============ 空对话态 ============

function EmptyDialog({
  studentName,
  goal,
  onPick,
}: {
  studentName: string;
  goal: string;
  onPick: (text: string) => void;
}) {
  return (
    <div className="flex-1 overflow-auto flex items-center justify-center p-8">
      <div className="max-w-xl w-full">
        <div className="text-center mb-6">
          <div className="mx-auto size-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white flex items-center justify-center mb-3 shadow-md">
            <Sparkles size={24} />
          </div>
          <div className="text-slate-900">
            嗨 {studentName}，今天想围绕 <b>{goal}</b> 学点什么？
          </div>
          <div className="text-slate-500 text-[13px] mt-1">
            左边已经读取了你的画像和目标，直接提问或从下面挑一个开始。
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {PROMPT_SUGGESTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.title}
                onClick={() => onPick(s.title)}
                className="text-left bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition"
              >
                <div className="size-7 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                  <Icon size={14} />
                </div>
                <div className="text-slate-900">{s.title}</div>
                <div className="text-slate-500 text-[12px] mt-1 leading-relaxed">
                  {s.hint}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============ 历史场景 ============

function HistoryPanel({ history }: { history: LearnScenario[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const current = history.find((s) => s.id === openId);

  return (
    <div className="flex-1 grid grid-cols-12 min-h-0">
      <div className="col-span-4 border-r border-slate-200 bg-white overflow-auto p-4 space-y-2">
        {history.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            暂无历史学习场景
          </div>
        )}
        {history.map((s) => (
          <button
            key={s.id}
            onClick={() => setOpenId(s.id)}
            className={`w-full text-left p-3 rounded-xl border transition ${
              openId === s.id
                ? "border-indigo-300 bg-indigo-50/70"
                : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              {s.completed ? (
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px]">
                  已完成
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px]">
                  未完成
                </span>
              )}
              <span className="text-slate-500 text-[11px]">
                {s.startedAt.slice(0, 10)} · {s.durationLabel}
              </span>
            </div>
            <div className="text-slate-900">{s.title}</div>
            <div className="text-slate-500 text-[12px] mt-1 line-clamp-2">
              {s.goal}
            </div>
          </button>
        ))}
      </div>
      <div className="col-span-8 bg-slate-50 overflow-auto p-6">
        {!current ? (
          <div className="h-full flex items-center justify-center text-slate-400">
            从左侧选择一个学习场景查看详情
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 flex-wrap">
                <AiBadge>
                  {personaById(current.personaId)?.name ?? "AI"}
                </AiBadge>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  {current.durationLabel}
                </span>
                <span className="text-slate-400 text-[12px]">
                  开始于 {current.startedAt.slice(0, 16).replace("T", " ")}
                </span>
              </div>
              <div className="text-slate-900 mt-2 text-[15px]">
                {current.title}
              </div>
              <p className="text-slate-600 mt-1 leading-relaxed">
                {current.goal}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="text-slate-500 mb-3">对话回放</div>
              <div className="space-y-3">
                {current.messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      m.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2.5 rounded-2xl leading-relaxed whitespace-pre-line ${
                        m.role === "user"
                          ? "bg-indigo-600 text-white rounded-br-sm"
                          : "bg-slate-100 text-slate-800 rounded-bl-sm"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="text-slate-500 mb-3 flex items-center gap-2">
                  <Wrench size={14} /> 学习产物
                </div>
                <ul className="space-y-2">
                  {current.outputs.map((o, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-slate-700"
                    >
                      <span className="size-5 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                        {iconForOutputType(o.type)}
                      </span>
                      <div>
                        <div>{o.title}</div>
                        <div className="text-slate-500 text-[12px]">
                          {o.detail}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="text-slate-500 mb-3 flex items-center gap-2">
                  <BookmarkCheck size={14} /> 已掌握检查
                </div>
                <ul className="space-y-2">
                  {current.masteryCheck.map((c, idx) => (
                    <li
                      key={idx}
                      className={`flex items-center gap-2 ${
                        c.ok ? "text-emerald-700" : "text-slate-500"
                      }`}
                    >
                      {c.ok ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <span className="size-3.5 rounded-full border-2 border-slate-300" />
                      )}
                      <span>{c.name}</span>
                    </li>
                  ))}
                </ul>
                <button className="mt-3 w-full py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 inline-flex items-center justify-center gap-1">
                  <PlayCircle size={14} /> 重新开启此场景
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ 辅助：默认目标知识点 ============

function pickDefaultGoalNodeIds(studentId: string): string[] {
  const profile = studentProfileByStudentId(studentId);
  if (!profile) return [];
  // 取掌握度最低的两条作为默认目标，引导学生补短板
  const sorted = [...profile.masteryHeatmap].sort(
    (a, b) => a.masteryLevel - b.masteryLevel,
  );
  return sorted.slice(0, 2).map((p) => p.knowledgePointId);
}

// ============ 辅助：学生端人设选择 ============

function pickStudentPersonas(): Persona[] {
  // 从 mock personas 里挑三个情境再加一个"学长朋辈"式人设（临时构造）
  const mentor: Persona =
    personas.find((p) => p.id === "persona-preset-lecturer") ?? personas[0];
  const rigor: Persona =
    personas.find((p) => p.id === "persona-li-custom-1") ?? personas[0];
  const gentle: Persona =
    personas.find((p) => p.id === "persona-li-custom-2") ?? personas[0];
  // 构造一个"启发式学长"（不写入官方 mock，只本地虚拟）
  const peer: Persona = {
    id: "persona-peer-mentor",
    name: "学长朋辈 · 启发型",
    description:
      "用同龄人口吻对话，先反问「你觉得哪里卡住？」再讲思路，鼓励你先尝试。",
    systemPrompt: "",
    isPreset: true,
    scene: "通用",
  };
  return [mentor, rigor, gentle, peer];
}

// ============ 辅助：icon / mock 回复 ============

function iconForResType(type: string) {
  switch (type) {
    case "video":
      return <Film size={11} />;
    case "ppt":
      return <FileText size={11} />;
    case "image":
      return <Brain size={11} />;
    default:
      return <FileText size={11} />;
  }
}

function iconForOutputType(type: string) {
  switch (type) {
    case "笔记":
      return <NotebookPen size={12} />;
    case "小测":
    case "练习题":
      return <ListChecks size={12} />;
    case "视频":
      return <Film size={12} />;
    case "思维导图":
      return <Brain size={12} />;
    case "速查卡":
      return <BookmarkCheck size={12} />;
    default:
      return <FileText size={12} />;
  }
}

function mockReplyFor(
  userText: string,
  ctx: { style: string; persona?: Persona; goal: string },
): string {
  const personaLine = ctx.persona?.name
    ? `【${ctx.persona.name}】\n`
    : "";
  const styleLine =
    STYLE_SUGGESTIONS[ctx.style] &&
    `（已按「${ctx.style}」风格组织：${STYLE_SUGGESTIONS[ctx.style]}）\n\n`;
  return (
    personaLine +
    (styleLine || "") +
    `好，围绕「${ctx.goal}」来回答你的问题：\n` +
    `① 先给个直观理解：${userText.slice(0, 18)}…其实就是「形 → 投 → 识」三步。\n` +
    `② 再配 1 个工程情境：\n    轴承座俯视图为什么多了一条虚线？因为 φ20 通孔被前面主视遮住。\n` +
    `③ 下一步：我给你出 3 道小测检查一下，完成后会同步刷新右栏「已掌握检查」。`
  );
}
