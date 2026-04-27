import { useEffect, useMemo, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import {
  BookOpen,
  BookmarkCheck,
  Brain,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  Film,
  Folder,
  Globe,
  GraduationCap,
  History,
  Library,
  ListChecks,
  Network,
  NotebookPen,
  Paperclip,
  PlayCircle,
  Headset,
  Presentation,
  Send,
  Settings2,
  Sparkles,
  Target,
  Users,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { personas } from "@mock";
import type { Persona } from "@mock";
import { PageHeader, AiBadge } from "../Layout";
import {
  graphNodeById,
  personaById,
  studentById,
  studentProfileByStudentId,
} from "../../data/lookups";
import {
  learnScenariosByStudent,
  LearnScenario,
} from "../../data/studentMock";
import {
  buildResourceExplanation,
  buildTeacherResourceItems,
  resourceContentOutlineItems,
  courseNameForPlan,
  findHandoutDesign,
  findPlanSection,
  getGoalNodeIdsForSession,
  getStudentHomeworks,
  getStudentPlans,
  handoutOptionsForPlans,
  homeworkById as findHomeworkById,
  mockResourceReply,
  resourcesForGoalNodes,
  type ChatRole,
  type LearnCenterAgentMessage,
  type LearnCenterMode,
  type LearnCenterResourceItem,
  type LearnCenterSessionContext,
  type ResourceContentKind,
  type ResourceContentPage,
} from "../../data/learnCenterSession";

const KNOWLEDGE_SOURCES = [
  { id: "src-resource", name: "教学资源库", icon: BookOpen },
  { id: "src-graph", name: "知识图谱", icon: Network },
  { id: "src-internet", name: "联网检索", icon: Globe },
  { id: "src-notes", name: "我的笔记", icon: Folder },
] as const;

type SourceId = (typeof KNOWLEDGE_SOURCES)[number]["id"];
type Tab = "live" | "history";

const STYLE_SUGGESTIONS: Record<string, string> = {
  视觉型: "多用图示 / 动画 / 颜色编码，少用大段文字",
  动觉型: "先摸实物 / 做实操，再回到抽象概念",
  读写型: "用清晰的条目列表和完整句子讲解",
  听觉型: "口语化 + 可朗读段落",
  混合型: "结合多种方式，随机切换",
};

export function LearnCenter({
  studentId,
  presetSectionId,
  presetGoalNodeIds,
  sessionPreset,
}: {
  studentId: string;
  presetSectionId?: string;
  presetGoalNodeIds?: string[];
  sessionPreset?: LearnCenterSessionContext;
}) {
  const student = studentById(studentId);
  const profile = studentProfileByStudentId(studentId);
  const [tab, setTab] = useState<Tab>("live");
  const [quickStartOpen, setQuickStartOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [chatRole, setChatRole] = useState<ChatRole>("teacher");
  const [chatByResource, setChatByResource] = useState<
    Record<string, LearnCenterAgentMessage[]>
  >({});
  /** 对话触发后，在「关联知识点」中高亮的节点（首版取当前资料的首个关联节点） */
  const [focusHighlightId, setFocusHighlightId] = useState<string | null>(null);
  /** 资料正文当前页（0-based） */
  const [resourcePageIndex, setResourcePageIndex] = useState(0);
  /** 右侧：全部资料列表 | 当前资料大纲 */
  const [asideMode, setAsideMode] = useState<"list" | "outline">("list");
  const [input, setInput] = useState("");
  const [sources, setSources] = useState<Set<SourceId>>(
    new Set(["src-resource", "src-graph"]),
  );
  const [style, setStyle] = useState<string>(profile?.learningStyle ?? "视觉型");
  const studentPersonas = useMemo(() => pickStudentPersonas(), []);
  const [personaId, setPersonaId] = useState<string>(studentPersonas[0].id);
  const [sessionContext, setSessionContext] = useState<LearnCenterSessionContext>(() =>
    makeInitialSession(studentId, presetSectionId, presetGoalNodeIds, sessionPreset),
  );
  const fallbackGoalNodeIds = useMemo(
    () => presetGoalNodeIds ?? pickDefaultGoalNodeIds(studentId),
    [studentId, presetGoalNodeIds],
  );
  const goalNodeIds = useMemo(
    () => getGoalNodeIdsForSession(sessionContext, fallbackGoalNodeIds),
    [fallbackGoalNodeIds, sessionContext],
  );
  const goalNodes = goalNodeIds
    .map(graphNodeById)
    .filter(
      (node): node is NonNullable<ReturnType<typeof graphNodeById>> =>
        Boolean(node),
    );
  const recommendedResources = useMemo(
    () => resourcesForGoalNodes(goalNodeIds),
    [goalNodeIds],
  );
  const teacherResourceItems = useMemo(
    () => buildTeacherResourceItems(sessionContext, goalNodeIds),
    [sessionContext, goalNodeIds],
  );
  const selectedResource = useMemo(() => {
    if (teacherResourceItems.length === 0) return undefined;
    return (
      teacherResourceItems.find((item) => item.id === selectedResourceId) ??
      teacherResourceItems[0]
    );
  }, [teacherResourceItems, selectedResourceId]);
  const resourceExplanation = useMemo(
    () => (selectedResource ? buildResourceExplanation(selectedResource, sessionContext) : null),
    [selectedResource, sessionContext],
  );
  const resourceOutlineItems = useMemo(
    () =>
      resourceExplanation
        ? resourceContentOutlineItems(resourceExplanation.contentPages)
        : [],
    [resourceExplanation],
  );
  const peerName = useMemo(
    () => studentPersonas.find((p) => p.id === "persona-peer-mentor")?.name ?? "同学",
    [studentPersonas],
  );
  const currentChat = selectedResource
    ? chatByResource[selectedResource.id] ?? []
    : [];
  const hasResourceChat = currentChat.length > 0;
  const [mastered, setMastered] = useState<boolean[]>(
    Array(Math.max(goalNodeIds.length, 3)).fill(false),
  );
  const history = learnScenariosByStudent(studentId);

  useEffect(() => {
    setSessionContext(
      makeInitialSession(studentId, presetSectionId, presetGoalNodeIds, sessionPreset),
    );
  }, [studentId, presetSectionId, presetGoalNodeIds, sessionPreset]);

  useEffect(() => {
    setChatByResource({});
  }, [sessionContext]);

  useEffect(() => {
    setFocusHighlightId(null);
  }, [selectedResourceId]);

  useEffect(() => {
    setResourcePageIndex(0);
  }, [selectedResourceId]);

  useEffect(() => {
    if (teacherResourceItems.length === 0) {
      setSelectedResourceId(null);
      return;
    }
    if (
      !selectedResourceId ||
      !teacherResourceItems.some((item) => item.id === selectedResourceId)
    ) {
      setSelectedResourceId(teacherResourceItems[0].id);
    }
  }, [teacherResourceItems, selectedResourceId]);

  useEffect(() => {
    setMastered(Array(Math.max(goalNodeIds.length, 3)).fill(false));
  }, [goalNodeIds]);

  const send = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || !selectedResource) return;
    const baseId = Date.now();
    const rid = selectedResource.id;
    const studentMsg: LearnCenterAgentMessage = {
      id: `student-${baseId}`,
      speaker: "student",
      name: student?.name ?? "我",
      content,
    };
    const teacherLabel = personaById(personaId)?.name ?? "智能教师";
    const replyContent = mockResourceReply(content, chatRole, selectedResource, {
      style,
      teacherName: teacherLabel,
      peerName,
    });
    const replySpeaker: ChatRole = chatRole;
    const replyName =
      chatRole === "teacher"
        ? teacherLabel
        : chatRole === "assistant"
          ? "助教"
          : peerName;
    setChatByResource((prev) => ({
      ...prev,
      [rid]: [
        ...(prev[rid] ?? []),
        studentMsg,
        {
          id: `reply-${baseId + 1}`,
          speaker: replySpeaker,
          name: replyName,
          content: replyContent,
        },
      ],
    }));
    setFocusHighlightId(selectedResource.knowledgeNodeIds[0] ?? null);
    setInput("");
  };

  const applySession = (next: LearnCenterSessionContext) => {
    setSessionContext(next);
    setQuickStartOpen(false);
    setTab("live");
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
    <div className="flex flex-col h-full bg-slate-50">
      <PageHeader
        title={
          <div className="flex items-center gap-4">
            <span>学习中心</span>
            <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
              <TabButton
                active={tab === "live"}
                onClick={() => setTab("live")}
                label="本次学习"
                icon={<Presentation size={14} />}
              />
              <TabButton
                active={tab === "history"}
                onClick={() => setTab("history")}
                label={`历史记录（${history.length}）`}
                icon={<History size={14} />}
              />
            </div>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuickStartOpen(true)}
              className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700"
            >
              <Zap size={14} /> 快速开始
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="inline-flex items-center gap-1.5 border border-slate-200 bg-white text-slate-600 px-3 py-1.5 rounded-md hover:bg-slate-50"
            >
              <Settings2 size={14} /> 学习设置
            </button>
          </div>
        }
      />

      {tab === "live" ? (
        <div className="flex-1 min-h-0 p-4">
          <div className="h-full grid grid-cols-12 gap-4">
            <main className="col-span-8 min-h-0 flex flex-col gap-4 min-h-0">
              <div className="flex-1 min-h-0 flex flex-col gap-4">
                {selectedResource && resourceExplanation ? (
                  <div className="flex-1 min-h-0 flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden">
                    <div
                      className={
                        hasResourceChat
                          ? "shrink-0 min-h-0 max-h-[min(36vh,300px)] overflow-y-auto px-5 py-4 border-b border-slate-100"
                          : "flex-1 min-h-0 overflow-y-auto px-5 py-4 border-b border-slate-100"
                      }
                    >
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-slate-900 text-base font-medium">
                            {resourceExplanation.headline}
                          </h3>
                          {selectedResource.metaLabel && (
                            <div className="text-slate-400 text-[0.75rem] mt-1.5">
                              {selectedResource.metaLabel}
                            </div>
                          )}
                          {resourceExplanation.focusNodeIds.length > 0 && (
                            <div className="mt-3">
                              <div className="text-slate-500 text-[0.75rem] mb-1.5">关联知识点</div>
                              <div className="flex flex-wrap gap-2">
                                {resourceExplanation.focusNodeIds.map((nodeId) => {
                                  const n = graphNodeById(nodeId);
                                  if (!n) return null;
                                  const hot = focusHighlightId === nodeId;
                                  return (
                                    <span
                                      key={nodeId}
                                      className={`px-2 py-0.5 rounded-md text-[0.75rem] transition ${
                                        hot
                                          ? "bg-amber-100 text-amber-900 ring-2 ring-amber-300"
                                          : "bg-indigo-50 text-indigo-700"
                                      }`}
                                    >
                                      {n.name}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                        {resourceExplanation.contentPages.length > 0 && (() => {
                          const n = resourceExplanation.contentPages.length;
                          const safeIdx = Math.max(0, Math.min(resourcePageIndex, n - 1));
                          const page = resourceExplanation.contentPages[safeIdx]!;
                          return (
                            <div>
                              <div className="text-slate-500 text-[0.75rem] mb-2">资料内容</div>
                              <ResourceContentView
                                kind={resourceExplanation.contentKind}
                                page={page}
                                pageIndex={safeIdx}
                                pageTotal={n}
                                onPrev={() => setResourcePageIndex((i) => Math.max(0, i - 1))}
                                onNext={() => setResourcePageIndex((i) => Math.min(n - 1, i + 1))}
                              />
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    <div
                      className={
                        hasResourceChat
                          ? "flex-1 min-h-0 flex flex-col bg-slate-50"
                          : "shrink-0 flex flex-col bg-slate-50"
                      }
                    >
                      {hasResourceChat && (
                        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2.5 space-y-3">
                          {currentChat.map((m) => {
                            const isStudent = m.speaker === "student";
                            return (
                              <div
                                key={m.id}
                                className={`flex ${isStudent ? "justify-end" : "justify-start"}`}
                              >
                                <div
                                  className={`max-w-[min(85%,24rem)] px-3.5 py-2.5 rounded-2xl text-[0.8125rem] ${
                                    isStudent
                                      ? "bg-indigo-600 text-white rounded-br-sm"
                                      : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm"
                                  }`}
                                >
                                  {!isStudent && (
                                    <div className="text-slate-500 text-[0.6875rem] mb-1">{m.name}</div>
                                  )}
                                  <p className="leading-relaxed whitespace-pre-line">{m.content}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <div className="shrink-0 flex items-center gap-1.5 border-t border-slate-200/60 bg-slate-50 px-2.5 py-0.5">
                        <div className="flex-1 min-w-0 h-9 flex items-stretch gap-1 rounded-md border border-slate-200/90 bg-white px-1.5">
                          <button
                            type="button"
                            className="shrink-0 self-center p-0.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                            aria-label="添加附件"
                          >
                            <Paperclip size={16} />
                          </button>
                          <textarea
                            value={input}
                            rows={1}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
                            }}
                            placeholder={
                              chatRole === "teacher"
                                ? "提问… Cmd+Enter"
                                : chatRole === "assistant"
                                  ? "提问… Cmd+Enter"
                                  : "讨论… Cmd+Enter"
                            }
                            className="min-h-0 min-w-0 flex-1 self-stretch max-h-9 bg-transparent outline-none border-0 resize-none py-1.5 text-[0.75rem] leading-5 focus:ring-0 placeholder:text-slate-400"
                          />
                        </div>
                        <div
                          className="flex shrink-0 items-center gap-0.5 h-9"
                          role="group"
                          aria-label="选择对话身份"
                        >
                          {(
                            [
                              {
                                id: "teacher" as const,
                                label: "智能教师",
                                icon: Presentation,
                              },
                              { id: "assistant" as const, label: "助教", icon: Headset },
                              { id: "peer" as const, label: "同学", icon: Users },
                            ] as const
                          ).map((r) => {
                            const Icon = r.icon;
                            const on = chatRole === r.id;
                            return (
                              <button
                                key={r.id}
                                type="button"
                                title={r.label}
                                aria-label={r.label}
                                onClick={() => setChatRole(r.id)}
                                className={`flex h-9 w-9 items-center justify-center rounded-md border transition ${
                                  on
                                    ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                                    : "border-slate-200/90 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
                                }`}
                              >
                                <Icon
                                  size={18}
                                  strokeWidth={1.75}
                                  className="shrink-0 pointer-events-none"
                                  aria-hidden
                                />
                              </button>
                            );
                          })}
                        </div>
                        <button
                          type="button"
                          onClick={() => send()}
                          className="shrink-0 flex h-9 items-center justify-center gap-0.5 rounded-md bg-indigo-600 px-2.5 text-white hover:bg-indigo-700 text-[0.75rem] leading-none"
                        >
                          <Send size={14} className="shrink-0" /> 发送
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 rounded-2xl border border-dashed border-slate-200 bg-white flex items-center justify-center text-slate-400 text-sm p-8">
                    暂无可用的教师资料。请通过「快速开始」选择课程小节，或检查本节是否已关联教学设计。
                  </div>
                )}
              </div>
            </main>

            <aside className="col-span-4 min-h-0 overflow-auto space-y-4">
              {asideMode === "list" ? (
                <TeacherResourceList
                  items={teacherResourceItems}
                  selectedId={selectedResource?.id}
                  onSelect={(id) => {
                    setSelectedResourceId(id);
                    setResourcePageIndex(0);
                    setAsideMode("outline");
                  }}
                />
              ) : (
                <ResourceOutlineAside
                  fileTitle={selectedResource?.title ?? "—"}
                  outline={resourceOutlineItems}
                  activePageIndex={
                    resourceExplanation && resourceExplanation.contentPages.length > 0
                      ? Math.max(0, Math.min(resourcePageIndex, resourceExplanation.contentPages.length - 1))
                      : 0
                  }
                  onPickPage={(idx) => setResourcePageIndex(idx)}
                  onBackToList={() => setAsideMode("list")}
                />
              )}
              <MasteryPanel
                goalNodes={goalNodes}
                mastered={mastered}
                onToggle={(idx) =>
                  setMastered((prev) => {
                    const next = [...prev];
                    next[idx] = !next[idx];
                    return next;
                  })
                }
              />
            </aside>
          </div>
        </div>
      ) : (
        <HistoryPanel history={history} />
      )}

      {quickStartOpen && (
        <QuickStartModal
          studentId={studentId}
          current={sessionContext}
          onClose={() => setQuickStartOpen(false)}
          onConfirm={applySession}
        />
      )}

      {settingsOpen && (
        <SettingsDrawer
          studentId={studentId}
          goalNodes={goalNodes}
          goalNodeIds={goalNodeIds}
          onClose={() => setSettingsOpen(false)}
          onAddGoal={(nodeId) =>
            setSessionContext((prev) => ({
              ...prev,
              goalNodeIds: prev.goalNodeIds?.includes(nodeId)
                ? prev.goalNodeIds
                : [...(prev.goalNodeIds ?? goalNodeIds), nodeId],
            }))
          }
          onRemoveGoal={(nodeId) =>
            setSessionContext((prev) => ({
              ...prev,
              goalNodeIds: (prev.goalNodeIds ?? goalNodeIds).filter(
                (id) => id !== nodeId,
              ),
            }))
          }
          sources={sources}
          onToggleSource={toggleSource}
          style={style}
          onStyleChange={setStyle}
          studentPersonas={studentPersonas}
          personaId={personaId}
          onPersonaChange={setPersonaId}
          resources={recommendedResources}
        />
      )}
    </div>
  );
}

function ResourceContentView({
  kind,
  page,
  pageIndex,
  pageTotal,
  onPrev,
  onNext,
}: {
  kind: ResourceContentKind;
  page: ResourceContentPage;
  pageIndex: number;
  pageTotal: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const atFirst = pageIndex <= 0;
  const atLast = pageIndex >= pageTotal - 1;
  const nav = (
    <div className="flex items-center justify-center gap-2 mt-3">
      <button
        type="button"
        onClick={onPrev}
        disabled={atFirst}
        className="inline-flex items-center gap-0.5 rounded-md border border-slate-200 bg-white px-2 py-1 text-[0.75rem] text-slate-600 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-50"
      >
        <ChevronLeft size={14} /> 上一页
      </button>
      <span className="text-slate-500 text-[0.75rem]">
        第 {pageIndex + 1} / {pageTotal} 页
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={atLast}
        className="inline-flex items-center gap-0.5 rounded-md border border-slate-200 bg-white px-2 py-1 text-[0.75rem] text-slate-600 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-50"
      >
        下一页 <ChevronRight size={14} />
      </button>
    </div>
  );

  if (kind === "ppt") {
    return (
      <div>
        <div className="w-full max-w-2xl mx-auto aspect-[16/10] rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-sm flex flex-col p-4">
          <div className="text-[0.65rem] text-slate-400 mb-1">幻灯 {page.pageNo}</div>
          <div className="text-slate-900 font-medium text-[0.875rem] leading-snug line-clamp-2">
            {page.title.replace(/^第 \d+ 页 · /, "")}
          </div>
          <div className="mt-2 flex-1 min-h-0 overflow-y-auto text-slate-600 text-[0.75rem] leading-relaxed whitespace-pre-line">
            {page.body}
          </div>
        </div>
        {pageTotal > 1 ? nav : null}
      </div>
    );
  }

  if (kind === "document") {
    return (
      <div>
        <div className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm min-h-[12rem]">
          <div className="flex items-baseline justify-between gap-2 border-b border-slate-100 pb-2 mb-3">
            <span className="text-slate-900 font-medium text-[0.9rem]">{page.title}</span>
            <span className="text-slate-400 text-[0.65rem] shrink-0">第 {page.pageNo} 页</span>
          </div>
          <div className="text-slate-700 text-[0.8125rem] leading-relaxed whitespace-pre-line">
            {page.body}
          </div>
        </div>
        {pageTotal > 1 ? nav : null}
      </div>
    );
  }

  if (kind === "video") {
    return (
      <div>
        <div className="rounded-xl border border-slate-200 bg-slate-900/5 p-4">
          <div className="text-slate-600 text-[0.75rem] font-medium mb-2">{page.title}</div>
          <pre className="text-slate-700 text-[0.75rem] leading-relaxed whitespace-pre-wrap font-sans">
            {page.body}
          </pre>
        </div>
        {pageTotal > 1 ? nav : null}
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 text-slate-800 min-h-[8rem]">
        <div className="text-[0.65rem] text-indigo-600/80 mb-1">屏 {page.pageNo}</div>
        <div className="font-medium text-[0.875rem] mb-2">{page.title}</div>
        <div className="text-[0.8125rem] leading-relaxed whitespace-pre-line text-slate-700">
          {page.body}
        </div>
      </div>
      {pageTotal > 1 ? nav : null}
    </div>
  );
}

function ResourceOutlineAside({
  fileTitle,
  outline,
  activePageIndex,
  onPickPage,
  onBackToList,
}: {
  fileTitle: string;
  outline: ReturnType<typeof resourceContentOutlineItems>;
  activePageIndex: number;
  onPickPage: (index: number) => void;
  onBackToList: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <button
        type="button"
        onClick={onBackToList}
        className="w-full flex items-center gap-1.5 text-[0.8125rem] text-indigo-600 hover:text-indigo-800 mb-2"
      >
        <ArrowLeft size={14} className="shrink-0" /> 学习资料
      </button>
      <div className="text-slate-500 text-[0.65rem] mb-0.5">当前文件</div>
      <div className="text-slate-900 text-[0.8125rem] font-medium line-clamp-2 mb-3" title={fileTitle}>
        {fileTitle}
      </div>
      <div className="text-slate-500 text-[0.75rem] mb-2 flex items-center gap-1.5">
        <ListChecks size={12} className="text-indigo-500 shrink-0" /> 大纲
      </div>
      {outline.length === 0 ? (
        <div className="text-slate-400 text-[0.75rem] py-2">暂无页结构</div>
      ) : (
        <ol className="space-y-1 max-h-[min(50vh,22rem)] overflow-y-auto pr-0.5">
          {outline.map((item) => {
            const active = item.pageIndex === activePageIndex;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onPickPage(item.pageIndex)}
                  className={`w-full text-left rounded-lg px-2 py-1.5 text-[0.75rem] leading-snug border transition ${
                    active
                      ? "border-indigo-300 bg-indigo-50 text-indigo-900"
                      : "border-transparent text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-slate-400 mr-1">{item.pageIndex + 1}.</span>
                  {item.label}
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function TeacherResourceList({
  items,
  selectedId,
  onSelect,
}: {
  items: LearnCenterResourceItem[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="text-slate-900 flex items-center gap-2 mb-3">
        <Library size={14} className="text-indigo-500" /> 学习资料
      </div>
      {items.length === 0 ? (
        <div className="text-slate-400 text-sm py-6 text-center">暂无资料</div>
      ) : (
        <div className="space-y-2 max-h-[min(60vh,28rem)] overflow-auto pr-0.5">
          {items.map((item) => {
            const active = item.id === selectedId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className={`w-full text-left rounded-xl border p-3 transition ${
                  active
                    ? "border-indigo-300 bg-indigo-50/70"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="text-slate-500 text-[0.6875rem]">
                  {item.type}
                  {item.tabLabel ? ` · ${item.tabLabel}` : ""}
                </div>
                <div className="text-slate-900 text-[0.875rem] line-clamp-2 mt-0.5">
                  {item.title}
                </div>
                <p className="text-slate-500 text-[0.75rem] line-clamp-2 mt-1 leading-relaxed">
                  {item.summary}
                </p>
                {item.metaLabel && (
                  <div className="text-slate-400 text-[0.625rem] mt-1">{item.metaLabel}</div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MasteryPanel({
  goalNodes,
  mastered,
  onToggle,
}: {
  goalNodes: Array<NonNullable<ReturnType<typeof graphNodeById>>>;
  mastered: boolean[];
  onToggle: (idx: number) => void;
}) {
  const rows =
    goalNodes.length > 0
      ? goalNodes
      : [
          { id: "x-1", name: "核心概念" },
          { id: "x-2", name: "典型例题" },
          { id: "x-3", name: "常见误区" },
        ];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-slate-500 mb-2 flex items-center gap-1.5">
        <BookmarkCheck size={14} className="text-indigo-500" />
        已掌握检查
      </div>
      <div className="text-slate-900 mb-2">
        {mastered.filter(Boolean).length}/{mastered.length} 目标
      </div>
      <div className="space-y-1.5">
        {rows.map((node, idx) => {
          const ok = !!mastered[idx];
          return (
            <button
              key={node.id}
              onClick={() => onToggle(idx)}
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
              <span>{node.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function QuickStartModal({
  studentId,
  current,
  onClose,
  onConfirm,
}: {
  studentId: string;
  current: LearnCenterSessionContext;
  onClose: () => void;
  onConfirm: (ctx: LearnCenterSessionContext) => void;
}) {
  const plans = useMemo(() => getStudentPlans(studentId), [studentId]);
  const homeworks = useMemo(() => getStudentHomeworks(studentId), [studentId]);
  const handouts = useMemo(() => handoutOptionsForPlans(plans), [plans]);
  const [mode, setMode] = useState<Exclude<LearnCenterMode, "free">>(
    current.mode === "free" ? "plan" : current.mode,
  );
  const [planId, setPlanId] = useState(
    current.planId ?? plans[0]?.id ?? handouts[0]?.planId ?? "",
  );
  const selectedPlan = plans.find((plan) => plan.id === planId) ?? plans[0];
  const sectionOptions = useMemo(
    () =>
      selectedPlan?.chapters.flatMap((chapter) =>
        chapter.sections.map((section) => ({
          id: section.id,
          title: `${chapter.title} · ${section.title}`,
        })),
      ) ?? [],
    [selectedPlan],
  );
  const [sectionId, setSectionId] = useState(
    current.sectionId ?? sectionOptions[0]?.id ?? "",
  );
  const matchingHandout =
    handouts.find((design) => design.planId === planId && design.sectionId === sectionId) ??
    handouts[0];
  const [designId, setDesignId] = useState(current.designId ?? matchingHandout?.id ?? "");
  const [homeworkId, setHomeworkId] = useState(
    current.homeworkId ?? homeworks[0]?.id ?? "",
  );

  useEffect(() => {
    if (selectedPlan && !selectedPlan.chapters.some((chapter) => chapter.sections.some((section) => section.id === sectionId))) {
      setSectionId(sectionOptions[0]?.id ?? "");
    }
  }, [sectionId, sectionOptions, selectedPlan]);

  useEffect(() => {
    const handout = handouts.find(
      (design) => design.planId === planId && design.sectionId === sectionId,
    );
    if (handout) setDesignId(handout.id);
  }, [handouts, planId, sectionId]);

  const confirm = () => {
    if (mode === "homework") {
      const homework = homeworks.find((item) => item.id === homeworkId);
      const goalNodeIds = homework?.questionAccuracy
        .map((q) => q.knowledgeNodeId)
        .filter((id): id is string => Boolean(id));
      onConfirm({
        mode,
        homeworkId,
        planId: homework?.planId,
        sectionId: homework?.sectionId,
        goalNodeIds: goalNodeIds?.length ? Array.from(new Set(goalNodeIds)).slice(0, 3) : undefined,
      });
      return;
    }
    if (mode === "handout") {
      const design = findHandoutDesign(planId, sectionId, designId);
      const section = findPlanSection(design?.planId ?? planId, design?.sectionId ?? sectionId).section;
      onConfirm({
        mode,
        planId: design?.planId ?? planId,
        sectionId: design?.sectionId ?? sectionId,
        designId: design?.id ?? designId,
        goalNodeIds: section?.knowledgeNodeIds,
      });
      return;
    }
    const section = findPlanSection(planId, sectionId).section;
    onConfirm({
      mode,
      planId,
      sectionId,
      goalNodeIds: section?.knowledgeNodeIds,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-slate-900 flex items-center gap-2">
              <Zap size={16} className="text-indigo-500" /> 快速开始
            </div>
            <div className="text-slate-500 text-[0.75rem] mt-0.5">
              先选一种学习方式，再选对应的课程计划、讲义或作业。
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-lg hover:bg-slate-100 text-slate-500 inline-flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-12 min-h-[420px]">
          <div className="col-span-4 border-r border-slate-100 p-4 space-y-2 bg-slate-50">
            <ModeOption
              active={mode === "plan"}
              icon={<GraduationCap size={16} />}
              title="跟计划学"
              desc="选择定制好的学习路线与课程小节"
              onClick={() => setMode("plan")}
            />
            <ModeOption
              active={mode === "handout"}
              icon={<BookOpen size={16} />}
              title="老师讲义"
              desc="从老师准备好的讲义和微课开始"
              onClick={() => setMode("handout")}
            />
            <ModeOption
              active={mode === "homework"}
              icon={<ClipboardList size={16} />}
              title="完成作业"
              desc="按作业题目进入分步辅导"
              onClick={() => setMode("homework")}
            />
          </div>

          <div className="col-span-8 p-5 space-y-4">
            {mode !== "homework" ? (
              <>
                <Field label="选择课程计划">
                  <select
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-indigo-300"
                  >
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {courseNameForPlan(plan)} · {plan.title}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="选择学习小节">
                  <select
                    value={sectionId}
                    onChange={(e) => setSectionId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-indigo-300"
                  >
                    {(sectionOptions ?? []).map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.title}
                      </option>
                    ))}
                  </select>
                </Field>
                {mode === "handout" && (
                  <Field label="选择老师讲义">
                    <select
                      value={designId}
                      onChange={(e) => setDesignId(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-indigo-300"
                    >
                      {handouts.length === 0 ? (
                        <option value="">暂无可用讲义</option>
                      ) : (
                        handouts.map((design) => (
                          <option key={design.id} value={design.id}>
                            {findPlanSection(design.planId, design.sectionId).section?.title ?? design.sectionId} · {design.outputs[0]?.title ?? "讲义"}
                          </option>
                        ))
                      )}
                    </select>
                  </Field>
                )}
              </>
            ) : (
              <Field label="选择本班作业">
                <select
                  value={homeworkId}
                  onChange={(e) => setHomeworkId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-indigo-300"
                >
                  {homeworks.map((homework) => (
                    <option key={homework.id} value={homework.id}>
                      {homework.homeworkTitle} · 截止 {homework.dueAt}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            <QuickStartPreview
              mode={mode}
              planId={planId}
              sectionId={sectionId}
              homeworkId={homeworkId}
              designId={designId}
            />
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            取消
          </button>
          <button
            onClick={confirm}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            开始
          </button>
        </div>
      </div>
    </div>
  );
}

function QuickStartPreview({
  mode,
  planId,
  sectionId,
  homeworkId,
  designId,
}: {
  mode: Exclude<LearnCenterMode, "free">;
  planId: string;
  sectionId: string;
  homeworkId: string;
  designId: string;
}) {
  const section = findPlanSection(planId, sectionId).section;
  const design = findHandoutDesign(planId, sectionId, designId);
  const homework = findHomeworkById(homeworkId);
  const title =
    mode === "homework"
      ? homework?.homeworkTitle ?? "作业辅导"
      : mode === "handout"
      ? design?.outputs[0]?.title ?? section?.title ?? "老师讲义"
      : section?.title ?? "学习路线";
  const desc =
    mode === "homework"
      ? "读题拆解、分步完成、提交前自查。"
      : mode === "handout"
      ? "讲义导读、重点笔记与随堂自测。"
      : "按小节推进讲解，并配合掌握情况检查。";

  return (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
      <div className="text-indigo-700 text-[0.75rem]">本节概要</div>
      <div className="text-slate-900 mt-1">{title}</div>
      <p className="text-slate-600 text-[0.8125rem] mt-1 leading-relaxed">{desc}</p>
      <div className="grid grid-cols-3 gap-2 mt-4">
        {["教师讲解", "同学互动", "课中笔记"].map((label) => (
          <div key={label} className="rounded-lg bg-white border border-indigo-100 p-3 text-center text-slate-600">
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

function ModeOption({
  active,
  icon,
  title,
  desc,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border p-4 transition ${
        active
          ? "border-indigo-300 bg-white text-indigo-700 shadow-sm"
          : "border-slate-200 bg-white/70 text-slate-600 hover:bg-white"
      }`}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span>{title}</span>
      </div>
      <div className="text-slate-500 text-[0.75rem] mt-1 leading-relaxed">{desc}</div>
    </button>
  );
}

function SettingsDrawer({
  studentId,
  goalNodes,
  goalNodeIds,
  onClose,
  onAddGoal,
  onRemoveGoal,
  sources,
  onToggleSource,
  style,
  onStyleChange,
  studentPersonas,
  personaId,
  onPersonaChange,
  resources,
}: {
  studentId: string;
  goalNodes: Array<NonNullable<ReturnType<typeof graphNodeById>>>;
  goalNodeIds: string[];
  onClose: () => void;
  onAddGoal: (nodeId: string) => void;
  onRemoveGoal: (nodeId: string) => void;
  sources: Set<SourceId>;
  onToggleSource: (id: SourceId) => void;
  style: string;
  onStyleChange: (value: string) => void;
  studentPersonas: Persona[];
  personaId: string;
  onPersonaChange: (id: string) => void;
  resources: ReturnType<typeof resourcesForGoalNodes>;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 flex justify-end">
      <div className="w-[380px] bg-white h-full shadow-2xl border-l border-slate-200 overflow-auto">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="text-slate-900 flex items-center gap-2">
            <Settings2 size={16} className="text-indigo-500" /> 学习设置
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-lg hover:bg-slate-100 text-slate-500 inline-flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-4 space-y-5">
          <ConfigSection icon={Target} title="学习目标">
            <div className="flex flex-wrap gap-1 mb-2">
              {goalNodes.map((node) => (
                <span
                  key={node.id}
                  className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 inline-flex items-center gap-1"
                >
                  {node.name}
                  <button
                    onClick={() => onRemoveGoal(node.id)}
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
              onAdd={onAddGoal}
            />
            <div className="mt-3 text-slate-500 text-[0.75rem]">我的学习风格</div>
            <StyleSelect value={style} onChange={onStyleChange} />
            <div className="text-slate-400 text-[0.6875rem] mt-1">
              {STYLE_SUGGESTIONS[style] ?? "将按你的偏好组织内容"}
            </div>
          </ConfigSection>

          <ConfigSection icon={Folder} title="知识来源">
            <div className="space-y-1">
              {KNOWLEDGE_SOURCES.map((source) => {
                const Icon = source.icon;
                const active = sources.has(source.id);
                return (
                  <button
                    key={source.id}
                    onClick={() => onToggleSource(source.id)}
                    className={`w-full px-2.5 py-1.5 rounded-lg border text-left flex items-center gap-2 ${
                      active
                        ? "border-indigo-300 bg-indigo-50/70 text-indigo-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon size={14} />
                    <span className="flex-1">{source.name}</span>
                    {active && <Check size={14} className="text-indigo-500" />}
                  </button>
                );
              })}
            </div>
          </ConfigSection>

          <ConfigSection icon={Sparkles} title="讲解风格">
            <div className="space-y-1">
              {studentPersonas.map((persona) => (
                <PersonaOption
                  key={persona.id}
                  persona={persona}
                  active={personaId === persona.id}
                  onPick={() => onPersonaChange(persona.id)}
                />
              ))}
            </div>
          </ConfigSection>

          <ConfigSection icon={BookOpen} title="推荐资源">
            {resources.length === 0 ? (
              <div className="text-slate-400 text-[0.75rem]">
                选择目标知识点后会出现推荐
              </div>
            ) : (
              <div className="space-y-1">
                {resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="px-2 py-1.5 rounded-md bg-slate-50 text-slate-700 text-[0.75rem] flex items-center gap-2"
                  >
                    <span className="size-5 rounded bg-white flex items-center justify-center text-slate-500">
                      {iconForResType(resource.type)}
                    </span>
                    <span className="truncate flex-1">{resource.title}</span>
                  </div>
                ))}
              </div>
            )}
          </ConfigSection>
        </div>
      </div>
    </div>
  );
}

function HistoryPanel({ history }: { history: LearnScenario[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const current = history.find((s) => s.id === openId);

  return (
    <div className="flex-1 grid grid-cols-12 min-h-0">
      <div className="col-span-4 border-r border-slate-200 bg-white overflow-auto p-4 space-y-2">
        {history.length === 0 && (
          <div className="p-8 text-center text-slate-400">暂无历史记录</div>
        )}
        {history.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => setOpenId(scenario.id)}
            className={`w-full text-left p-3 rounded-xl border transition ${
              openId === scenario.id
                ? "border-indigo-300 bg-indigo-50/70"
                : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[0.6875rem]">
                历史学习
              </span>
              <span className="text-slate-500 text-[0.6875rem]">
                {scenario.startedAt.slice(0, 10)} · {scenario.durationLabel}
              </span>
            </div>
            <div className="text-slate-900">{scenario.title}</div>
            <div className="text-slate-500 text-[0.75rem] mt-1 line-clamp-2">
              {scenario.goal}
            </div>
          </button>
        ))}
      </div>
      <div className="col-span-8 bg-slate-50 overflow-auto p-6">
        {!current ? (
          <div className="h-full flex items-center justify-center text-slate-400">
            请从左侧选择一条记录查看详情
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 flex-wrap">
                <AiBadge>{personaById(current.personaId)?.name ?? "教师"}</AiBadge>
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                  学习摘要
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  {current.durationLabel}
                </span>
                <span className="text-slate-400 text-[0.75rem]">
                  开始于 {current.startedAt.slice(0, 16).replace("T", " ")}
                </span>
              </div>
              <div className="text-slate-900 mt-2 text-[0.9375rem]">
                {current.title}
              </div>
              <p className="text-slate-600 mt-1 leading-relaxed">{current.goal}</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="text-slate-500 mb-3">对话回放</div>
              <div className="space-y-3">
                {current.messages.map((message, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2.5 rounded-2xl leading-relaxed whitespace-pre-line ${
                        message.role === "user"
                          ? "bg-indigo-600 text-white rounded-br-sm"
                          : "bg-slate-100 text-slate-800 rounded-bl-sm"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="text-slate-500 mb-3 flex items-center gap-2">
                  <Wrench size={14} /> 相关资料
                </div>
                <ul className="space-y-2">
                  {current.outputs.map((output, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-700">
                      <span className="size-5 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                        {iconForOutputType(output.type)}
                      </span>
                      <div>
                        <div>{output.title}</div>
                        <div className="text-slate-500 text-[0.75rem]">
                          {output.detail}
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
                  {current.masteryCheck.map((check, idx) => (
                    <li
                      key={idx}
                      className={`flex items-center gap-2 ${
                        check.ok ? "text-emerald-700" : "text-slate-500"
                      }`}
                    >
                      {check.ok ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <span className="size-3.5 rounded-full border-2 border-slate-300" />
                      )}
                      <span>{check.name}</span>
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

function ConfigSection({
  icon: Icon,
  title,
  children,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  children: ReactNode;
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
  icon: ReactNode;
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

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <div className="text-slate-500 text-[0.75rem] mb-1.5">{label}</div>
      {children}
    </label>
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
          {all.map((key) => (
            <button
              key={key}
              onClick={() => {
                onChange(key);
                setOpen(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-md ${
                value === key
                  ? "bg-indigo-50 text-indigo-700"
                  : "hover:bg-slate-50 text-slate-700"
              }`}
            >
              {key}
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
  const options = (profile?.masteryHeatmap ?? [])
    .filter((point) => !existing.includes(point.knowledgePointId))
    .slice(0, 4);
  if (options.length === 0) return null;
  return (
    <div>
      <div className="text-slate-400 text-[0.6875rem] mb-1">薄弱点推荐</div>
      <div className="flex flex-wrap gap-1">
        {options.map((option) => (
          <button
            key={option.knowledgePointId}
            onClick={() => onAdd(option.knowledgePointId)}
            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 inline-flex items-center gap-1"
          >
            + {option.knowledgePointName}
            <span
              className={`text-[0.625rem] ${
                option.masteryLevel < 60
                  ? "text-rose-500"
                  : option.masteryLevel < 80
                  ? "text-amber-500"
                  : "text-emerald-500"
              }`}
            >
              {option.masteryLevel}
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
          <div className={`truncate ${active ? "text-indigo-700" : "text-slate-800"}`}>
            {persona.name}
          </div>
          {persona.description && (
            <div className="text-slate-400 text-[0.6875rem] line-clamp-1">
              {persona.description}
            </div>
          )}
        </div>
        {active && <Check size={14} className="text-indigo-500" />}
      </div>
    </button>
  );
}

function makeInitialSession(
  studentId: string,
  presetSectionId?: string,
  presetGoalNodeIds?: string[],
  sessionPreset?: LearnCenterSessionContext,
): LearnCenterSessionContext {
  if (sessionPreset) return sessionPreset;
  const plan = getStudentPlans(studentId)[0];
  const sectionId = presetSectionId ?? plan?.chapters[0]?.sections[0]?.id;
  return {
    mode: presetSectionId ? "plan" : "free",
    planId: plan?.id,
    sectionId,
    goalNodeIds: presetGoalNodeIds,
  };
}

function pickDefaultGoalNodeIds(studentId: string): string[] {
  const profile = studentProfileByStudentId(studentId);
  if (!profile) return [];
  const sorted = [...profile.masteryHeatmap].sort(
    (a, b) => a.masteryLevel - b.masteryLevel,
  );
  return sorted.slice(0, 2).map((point) => point.knowledgePointId);
}

function pickStudentPersonas(): Persona[] {
  const mentor = personas.find((p) => p.id === "persona-preset-lecturer") ?? personas[0];
  const rigor = personas.find((p) => p.id === "persona-li-custom-1") ?? personas[0];
  const gentle = personas.find((p) => p.id === "persona-li-custom-2") ?? personas[0];
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
    case "讲义":
    case "讲义pdf":
      return <NotebookPen size={12} />;
    case "小测":
    case "练习题":
    case "客观题组卷":
      return <ListChecks size={12} />;
    case "视频":
    case "微课视频":
    case "推荐视频":
      return <Film size={12} />;
    case "思维导图":
    case "导图":
      return <Brain size={12} />;
    case "速查卡":
    case "错因卡":
      return <BookmarkCheck size={12} />;
    default:
      return <FileText size={12} />;
  }
}
