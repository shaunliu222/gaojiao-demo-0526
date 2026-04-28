import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "../Layout";
import { graphNodeById, personaById, planById, studentById } from "../../data/lookups";
import {
  buildClassStudyResourceItems,
  buildResourceExplanation,
  courseNameForPlan,
  findPlanSection,
  mockClassStudyReply,
  resourceContentOutlineItems,
  type ChatRole,
  type LearnCenterAgentMessage,
  type LearnCenterSessionContext,
} from "../../data/learnCenterSession";
import {
  ResourceContentView,
  ResourceOutlineAside,
  ShellChatPanel,
  ShellChatRoleButtons,
  TeacherResourceList,
} from "./learnSessionShared";

export function ClassStudy({
  studentId,
  planId,
  sectionId,
  focus,
  goalNodeIds: goalNodeIdsProp,
  onBack,
}: {
  studentId: string;
  planId: string;
  sectionId: string;
  focus: "课堂" | "讲义";
  goalNodeIds?: string[];
  onBack: () => void;
}) {
  const student = studentById(studentId);
  const plan = planById(planId);
  const { section, chapterTitle } = findPlanSection(planId, sectionId);
  const goalNodeIds = useMemo(
    () => goalNodeIdsProp?.length ? goalNodeIdsProp : (section?.knowledgeNodeIds ?? []).slice(0, 6),
    [goalNodeIdsProp, section?.knowledgeNodeIds],
  );
  const teacherResourceItems = useMemo(
    () => buildClassStudyResourceItems(planId, sectionId, goalNodeIds, focus),
    [planId, sectionId, goalNodeIds, focus],
  );
  const sessionCtx = useMemo<LearnCenterSessionContext>(
    () => ({ mode: "plan", planId, sectionId, goalNodeIds }),
    [planId, sectionId, goalNodeIds],
  );

  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [resourcePageIndex, setResourcePageIndex] = useState(0);
  const [asideMode, setAsideMode] = useState<"list" | "outline">("list");
  const [chatRole, setChatRole] = useState<ChatRole>("teacher");
  const [chatByResource, setChatByResource] = useState<Record<string, LearnCenterAgentMessage[]>>({});
  const [focusHighlightId, setFocusHighlightId] = useState<string | null>(null);
  const [input, setInput] = useState("");

  const selectedResource = useMemo(() => {
    if (teacherResourceItems.length === 0) return undefined;
    return (
      teacherResourceItems.find((item) => item.id === selectedResourceId) ??
      teacherResourceItems[0]
    );
  }, [teacherResourceItems, selectedResourceId]);

  const resourceExplanation = useMemo(
    () => (selectedResource ? buildResourceExplanation(selectedResource, sessionCtx) : null),
    [selectedResource, sessionCtx],
  );
  const resourceOutlineItems = useMemo(
    () =>
      resourceExplanation ? resourceContentOutlineItems(resourceExplanation.contentPages) : [],
    [resourceExplanation],
  );
  const currentChat = selectedResource ? chatByResource[selectedResource.id] ?? [] : [];

  useEffect(() => {
    setChatByResource({});
  }, [planId, sectionId, focus]);

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
      setSelectedResourceId(teacherResourceItems[0]!.id);
    }
  }, [teacherResourceItems, selectedResourceId]);

  const send = () => {
    const content = input.trim();
    if (!content || !selectedResource) return;
    const baseId = Date.now();
    const rid = selectedResource.id;
    const studentMsg: LearnCenterAgentMessage = {
      id: `student-${baseId}`,
      speaker: "student",
      name: student?.name ?? "我",
      content,
    };
    const teacherLabel = personaById("persona-preset-lecturer")?.name ?? "智能教师";
    const replyContent = mockClassStudyReply(content, chatRole, selectedResource, {
      teacherName: teacherLabel,
      peerName: "同学",
    });
    const replyName =
      chatRole === "teacher" ? teacherLabel : chatRole === "assistant" ? "助教" : "同学";
    setChatByResource((prev) => ({
      ...prev,
      [rid]: [
        ...(prev[rid] ?? []),
        studentMsg,
        {
          id: `reply-${baseId + 1}`,
          speaker: chatRole,
          name: replyName,
          content: replyContent,
        },
      ],
    }));
    setFocusHighlightId(goalNodeIds[0] ?? null);
    setInput("");
  };

  const courseLabel = plan ? courseNameForPlan(plan) : "课程";
  const headerTitle = (
    <div className="flex flex-col gap-0.5 min-w-0">
      <div className="flex items-center gap-2 flex-wrap text-[0.8125rem]">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 shrink-0"
        >
          <ArrowLeft size={14} /> 返回学习中心
        </button>
      </div>
      <div className="text-slate-800 text-[0.9375rem] font-medium truncate">
        {courseLabel} · {focus === "课堂" ? "课堂学习" : "讲义预习"} · {section?.title ?? sectionId}
      </div>
      {chapterTitle ? (
        <div className="text-slate-500 text-[0.75rem]">{chapterTitle}</div>
      ) : null}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <PageHeader title={headerTitle} />

      <div className="flex-1 min-h-0 p-4">
        <div className="h-full min-h-0 grid grid-cols-12 gap-4 items-stretch">
          <aside className="col-span-2 min-h-0 flex flex-col">
            {asideMode === "list" ? (
              <TeacherResourceList
                fillHeight
                items={teacherResourceItems}
                selectedId={selectedResource?.id}
                listTitle="本节资料"
                onSelect={(id) => {
                  setSelectedResourceId(id);
                  setResourcePageIndex(0);
                  setAsideMode("outline");
                }}
              />
            ) : (
              <ResourceOutlineAside
                fillHeight
                fileTitle={selectedResource?.title ?? "—"}
                outline={resourceOutlineItems}
                activePageIndex={
                  resourceExplanation && resourceExplanation.contentPages.length > 0
                    ? Math.max(
                        0,
                        Math.min(resourcePageIndex, resourceExplanation.contentPages.length - 1),
                      )
                    : 0
                }
                onPickPage={(idx) => setResourcePageIndex(idx)}
                onBackToList={() => setAsideMode("list")}
              />
            )}
          </aside>

          <main className="col-span-7 min-h-0 h-full flex flex-col min-w-0">
            {selectedResource && resourceExplanation ? (
              <div className="flex-1 min-h-0 flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 flex flex-col">
                  <div className="flex flex-col gap-4 flex-1 min-h-0 min-w-0">
                    <div className="shrink-0">
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
                    {resourceExplanation.contentPages.length > 0 ? (
                      <div className="flex-1 min-h-0 min-w-0 flex flex-col gap-2">
                        <div className="text-slate-500 text-[0.75rem] shrink-0">资料内容</div>
                        <div className="flex-1 min-h-0 min-w-0 flex flex-col">
                          {(() => {
                            const n = resourceExplanation.contentPages.length;
                            const safeIdx = Math.max(0, Math.min(resourcePageIndex, n - 1));
                            const page = resourceExplanation.contentPages[safeIdx]!;
                            return (
                              <ResourceContentView
                                kind={resourceExplanation.contentKind}
                                page={page}
                                pageIndex={safeIdx}
                                pageTotal={n}
                                onPrev={() => setResourcePageIndex((i) => Math.max(0, i - 1))}
                                onNext={() => setResourcePageIndex((i) => Math.min(n - 1, i + 1))}
                              />
                            );
                          })()}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 rounded-2xl border border-dashed border-slate-200 bg-white flex items-center justify-center text-slate-400 text-sm p-8 min-h-[12rem]">
                本节暂无「{focus}」教学设计资料，请联系教师或返回选课。
              </div>
            )}
          </main>

          <div className="col-span-3 min-h-0 h-full flex flex-col min-w-0">
            <ShellChatPanel
              stretch
              subtitle="课堂同步提问"
              showMessageList
              messages={currentChat}
              emptyHint={
                teacherResourceItems.length === 0
                  ? "暂无本节资料，请从学习中心选择其他小节。"
                  : undefined
              }
              inputValue={input}
              onInputChange={setInput}
              onSend={send}
              placeholder="课堂同步提问… Cmd+Enter"
              showPaperclip
              roleSlot={
                <ShellChatRoleButtons chatRole={chatRole} onRoleChange={setChatRole} />
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
