import { useEffect, useMemo, useState } from "react";
import {
  BookMarked,
  ChevronRight,
  Clock,
  Sparkles,
} from "lucide-react";
import type { ExamEvalSummary, HomeworkEvalSummary, TeachingPlan } from "@mock";
import { AiBadge, PageHeader } from "../Layout";
import { classById } from "../../data/lookups";
import type { PersonalPlan } from "../../data/studentMock";
import {
  aiPushesByStudent,
  findResumeSectionId,
  getPlanProgressSummary,
  getSectionProgress,
  personalPlansByStudent,
} from "../../data/studentMock";
import {
  courseNameForPlan,
  findPlanSection,
  findSectionIdByKnowledgeNode,
  getExamStudentSummary,
  getHomeworkStudentSummary,
  getLearnCenterHomeworkBucketsForPlan,
  getLearnCenterPrepAndReview,
  getStudentExams,
  getStudentPlans,
  type LearnCenterReviewRow,
} from "../../data/learnCenterSession";
import type { StudentLearnNavigateInput } from "./MyPlans";
import { LearnCenterWrongRecordsPanel } from "./LearnCenterWrongRecordsPanel";

type ReviewChapterGroup = {
  key: string;
  planId: string;
  courseLabel: string;
  chapterTitle: string;
  rows: LearnCenterReviewRow[];
};

function groupReviewRowsByChapter(rows: LearnCenterReviewRow[]): ReviewChapterGroup[] {
  const groups: ReviewChapterGroup[] = [];
  const keyToIndex = new Map<string, number>();
  for (const row of rows) {
    const key = `${row.planId}\x1f${row.chapterTitle}`;
    let i = keyToIndex.get(key);
    if (i === undefined) {
      i = groups.length;
      keyToIndex.set(key, i);
      groups.push({
        key,
        planId: row.planId,
        courseLabel: row.courseLabel,
        chapterTitle: row.chapterTitle,
        rows: [],
      });
    }
    groups[i]!.rows.push(row);
  }
  return groups;
}

function ReviewRowCard({
  row,
  onEnterClassStudy,
}: {
  row: LearnCenterReviewRow;
  onEnterClassStudy: (args: {
    planId: string;
    sectionId: string;
    focus: "课堂" | "讲义";
    goalNodeIds?: string[];
  }) => void;
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2.5 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-start">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-900 text-[0.875rem] font-medium">{row.sectionTitle}</span>
          {row.suggestedConsolidation ? (
            <span className="px-2 py-0.5 rounded-md bg-violet-50 text-violet-800 text-[0.65rem]">
              建议巩固
            </span>
          ) : null}
        </div>
        <div className="text-slate-500 text-[0.72rem] mt-1">
          {row.courseLabel} · {row.chapterTitle}
        </div>
        {row.progressHint ? (
          <div className="text-slate-600 text-[0.72rem] mt-1 line-clamp-2">{row.progressHint}</div>
        ) : null}
        {row.adaptiveRemediationHint ? (
          <div className="text-violet-900/90 text-[0.68rem] mt-1.5 leading-snug line-clamp-3 border-l border-violet-200 pl-2">
            {row.adaptiveRemediationHint}
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2 shrink-0">
        <button
          type="button"
          onClick={() => {
            const section = findPlanSection(row.planId, row.sectionId).section;
            onEnterClassStudy({
              planId: row.planId,
              sectionId: row.sectionId,
              focus: "课堂",
              goalNodeIds: section?.knowledgeNodeIds,
            });
          }}
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 text-white px-3 py-1.5 text-[0.8125rem] hover:bg-indigo-700"
        >
          进入课堂
        </button>
      </div>
    </div>
  );
}

function HomeworkRowCard({
  hw,
  studentId,
  plans,
  onEnterHomeworkWorkbench,
}: {
  hw: HomeworkEvalSummary;
  studentId: string;
  plans: TeachingPlan[];
  onEnterHomeworkWorkbench: (homeworkId: string) => void;
}) {
  const mine = getHomeworkStudentSummary(studentId, hw);
  const cls = classById(hw.classId);
  const hwPlan = plans.find((p) => p.id === hw.planId);
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2.5 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
      <div className="min-w-0 flex-1">
        {hwPlan ? (
          <div className="text-indigo-600 text-[0.6875rem] font-medium">
            《{courseNameForPlan(hwPlan)}》
          </div>
        ) : null}
        <div className="text-slate-900 text-[0.875rem] font-medium">{hw.homeworkTitle}</div>
        <div className="text-slate-500 text-[0.75rem] mt-1">
          {cls?.name ?? hw.classId} · 布置 {hw.assignedAt} · 截止 {hw.dueAt}
        </div>
        <div className="text-slate-600 text-[0.75rem] mt-1">
          {mine.submitted
            ? `已提交${mine.totalScore != null ? ` · 得分 ${mine.totalScore}/${hw.maxScore || 100}` : ""}`
            : "未提交"}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onEnterHomeworkWorkbench(hw.id)}
        className="shrink-0 inline-flex items-center justify-center rounded-lg bg-indigo-600 text-white px-3 py-1.5 text-[0.8125rem] hover:bg-indigo-700"
      >
        作业工作台
      </button>
    </div>
  );
}

function learnHubToneClass(tone: "cheer" | "warn" | "info") {
  if (tone === "warn") return "border-amber-200 bg-amber-50/80 text-amber-900";
  if (tone === "cheer") return "border-emerald-200 bg-emerald-50/80 text-emerald-900";
  return "border-slate-200 bg-white text-slate-800";
}

function personalDifficultyClass(d: PersonalPlan["difficulty"]) {
  if (d === "入门") return "bg-emerald-50 text-emerald-700";
  if (d === "进阶") return "bg-amber-50 text-amber-700";
  return "bg-rose-50 text-rose-700";
}

export type LearnCenterHubSectionId =
  | "course"
  | "homework"
  | "exam"
  | "personal"
  | "wrongbook";

function LearnCenterHub({
  studentId,
  plans,
  activePlanId,
  initialHubSection,
  onEnterClassStudy,
  onEnterHomeworkWorkbench,
  onEnterExamWeak,
  onOpenStudentLearningPlans,
  onContinuePersonalLearn,
  onPracticeKnowledge,
}: {
  studentId: string;
  plans: TeachingPlan[];
  activePlanId: string;
  /** 自其它页深链进入时切换到指定页签（如学情分析 → 本题库错题本） */
  initialHubSection?: LearnCenterHubSectionId;
  onEnterClassStudy: (args: {
    planId: string;
    sectionId: string;
    focus: "课堂" | "讲义";
    goalNodeIds?: string[];
  }) => void;
  onEnterHomeworkWorkbench: (homeworkId: string) => void;
  onEnterExamWeak: (exam: ExamEvalSummary) => void;
  /** 侧栏「学习计划」列表页（含创建个人计划） */
  onOpenStudentLearningPlans: () => void;
  /** 个人计划直接进入课堂壳（可按知识点挂靠） */
  onContinuePersonalLearn: (opts: StudentLearnNavigateInput) => void;
  /** 错题记录「针对性练习」：`planId` 与页眉当前教学计划对齐 */
  onPracticeKnowledge: (planId: string, goalNodeIds: string[]) => void;
}) {
  const activePlan = useMemo(
    () => plans.find((p) => p.id === activePlanId),
    [plans, activePlanId],
  );

  const pushes = useMemo(() => {
    const raw = aiPushesByStudent[studentId] ?? [];
    if (!activePlanId) return [];
    return raw.filter((p) => !p.planId || p.planId === activePlanId).slice(0, 2);
  }, [studentId, activePlanId]);

  const exams = useMemo(() => getStudentExams(studentId), [studentId]);

  const scopedExams = useMemo(() => {
    if (!activePlan?.courseId) return [];
    return exams.filter((e) => e.courseId === activePlan.courseId);
  }, [exams, activePlan?.courseId]);

  const prepReview = useMemo(() => getLearnCenterPrepAndReview(studentId), [studentId]);

  const prepCard = useMemo(() => {
    if (!activePlanId) return null;
    return prepReview.prepCards.find((c) => c.planId === activePlanId) ?? null;
  }, [prepReview.prepCards, activePlanId]);

  const homeworkSplit = useMemo(() => {
    if (!activePlanId) return { pending: [], submitted: [] };
    return getLearnCenterHomeworkBucketsForPlan(studentId, activePlanId);
  }, [studentId, activePlanId]);

  const scopedReviewRows = useMemo(() => {
    if (!activePlanId) return [];
    return prepReview.reviewRows.filter((r) => r.planId === activePlanId);
  }, [prepReview.reviewRows, activePlanId]);

  const reviewSplit = useMemo(() => {
    const mastered: LearnCenterReviewRow[] = [];
    const focus: LearnCenterReviewRow[] = [];
    for (const row of scopedReviewRows) {
      const prog = getSectionProgress(studentId, row.planId, row.sectionId);
      const status = prog?.status ?? "pending";
      const goFocus = row.suggestedConsolidation || status !== "mastered";
      (goFocus ? focus : mastered).push(row);
    }
    return {
      masteredGroups: groupReviewRowsByChapter(mastered),
      focusGroups: groupReviewRowsByChapter(focus),
    };
  }, [scopedReviewRows, studentId]);

  const personalPlans = useMemo(() => personalPlansByStudent(studentId), [studentId]);

  const [hubSection, setHubSection] = useState<LearnCenterHubSectionId>(
    initialHubSection ?? "course",
  );

  const [openReviewChapters, setOpenReviewChapters] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOpenReviewChapters({});
  }, [activePlanId]);

  const toggleReviewChapter = (side: "m" | "f", key: string) => {
    const id = `${side}:${key}`;
    setOpenReviewChapters((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="flex-1 min-h-0 overflow-auto bg-slate-50">
        <div className="max-w-5xl mx-auto w-full px-4 pb-8 pt-2 space-y-3">
        <div
          className="sticky top-0 z-10 -mx-4 px-4 py-2 flex flex-wrap gap-0.5 border-b border-slate-200/80 bg-slate-50/95"
          role="tablist"
          aria-label="学习内容"
        >
            {(
              [
                ["course", "课程"],
                ["homework", "作业"],
                ["exam", "考试"],
                ["personal", "自建计划"],
                ["wrongbook", "错题本"],
              ] as const
            ).map(([id, label]) => {
              const active = hubSection === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setHubSection(id)}
                  className={`rounded-lg px-3 py-1.5 text-[0.8125rem] transition-colors ${
                    active
                      ? "bg-white text-indigo-800 font-medium shadow-sm ring-1 ring-slate-200/80"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

        {hubSection === "course" && pushes.length > 0 && (
          <div className="rounded-xl border border-slate-200/80 bg-white px-3 py-2">
            <div className="text-slate-500 text-[0.6875rem] mb-1.5 flex items-center gap-1 font-medium">
              <Sparkles size={12} className="text-indigo-500 shrink-0" /> AI 提示
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {pushes.map((p) => (
                <div
                  key={p.id}
                  className={`rounded-lg border px-3 py-2 ${learnHubToneClass(p.tone)}`}
                >
                  <div className="font-medium text-[0.8125rem] leading-snug">{p.title}</div>
                  <p className="text-[0.75rem] mt-1 opacity-90 leading-relaxed line-clamp-3">{p.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-3 min-h-[min(22rem,52vh)]">
            {hubSection === "course" && (
              <>
          {!activePlanId || plans.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
              {plans.length === 0
                ? "暂无进行中的班级课程计划"
                : "请选择上方课程"}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
              <div className="flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden min-h-0 max-h-[min(28rem,56vh)] lg:max-h-[min(32rem,70vh)]">
                <div className="shrink-0 px-4 py-2.5 border-b border-slate-100 bg-sky-50/60">
                  <span className="text-slate-900 font-medium text-[0.875rem]">即将开始</span>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto p-3">
                  {!prepCard ? (
                    <p className="text-slate-400 text-sm text-center py-8">暂无即将开始的预习章节</p>
                  ) : (
                    (() => {
                      const prep = prepCard;
                      const summary = getPlanProgressSummary(studentId, prep.planId);
                      const denom = Math.max(summary.total, 1);
                      return (
                        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 space-y-3">
                          <div>
                            <div className="text-indigo-600 text-[0.6875rem] font-medium">
                              {prep.courseLabel}
                            </div>
                            <div className="text-slate-900 font-medium mt-0.5">{prep.planTitle}</div>
                            <div className="text-slate-600 text-[0.75rem] mt-2 leading-relaxed">
                              {prep.chapterTitle && (
                                <span className="text-slate-500">{prep.chapterTitle} · </span>
                              )}
                              <span>{prep.sectionTitle}</span>
                            </div>
                            {prep.fallbackNote && (
                              <p className="text-amber-800/90 text-[0.75rem] mt-2 leading-relaxed">
                                {prep.fallbackNote}
                              </p>
                            )}
                            {prep.noNextLesson && (
                              <p className="text-slate-600 text-[0.75rem] mt-2">
                                本学期该课计划内的新课小节已全部排定，请以复习与查漏补缺为主。
                              </p>
                            )}
                            {prep.personalResumeSectionId &&
                              prep.personalResumeSectionId !== prep.sectionId && (
                              <div className="text-slate-500 text-[0.75rem] mt-2">
                                个人续学：
                                {prep.personalResumeTitle ?? prep.personalResumeSectionId}
                              </div>
                            )}
                          </div>
                          <div className="space-y-1.5 border-t border-slate-100 pt-3">
                            <div className="flex items-center justify-between text-[0.6875rem] text-slate-500">
                              <span>掌握概览 · 《{prep.courseLabel}》</span>
                            </div>
                            <div className="flex h-2 rounded-full overflow-hidden bg-slate-100">
                              <div
                                className="bg-emerald-500 h-full transition-all"
                                style={{ width: `${(summary.mastered / denom) * 100}%` }}
                              />
                              <div
                                className="bg-indigo-400 h-full transition-all"
                                style={{ width: `${(summary.inProgress / denom) * 100}%` }}
                              />
                              <div
                                className="bg-rose-400 h-full transition-all"
                                style={{ width: `${(summary.weak / denom) * 100}%` }}
                              />
                              <div
                                className="bg-slate-200 h-full transition-all"
                                style={{ width: `${(summary.pending / denom) * 100}%` }}
                              />
                            </div>
                            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[0.6875rem] text-slate-500">
                              <span>已掌握 {summary.mastered}</span>
                              <span>进行中 {summary.inProgress}</span>
                              <span>薄弱 {summary.weak}</span>
                              <span>未开始 {summary.pending}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                const section = findPlanSection(prep.planId, prep.sectionId).section;
                                onEnterClassStudy({
                                  planId: prep.planId,
                                  sectionId: prep.sectionId,
                                  focus: "课堂",
                                  goalNodeIds: section?.knowledgeNodeIds,
                                });
                              }}
                              className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 text-white px-3 py-1.5 text-[0.8125rem] hover:bg-indigo-700"
                            >
                              进入课堂
                            </button>
                          </div>
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>

              <div className="flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden min-h-0 max-h-[min(28rem,56vh)] lg:max-h-[min(32rem,70vh)]">
                <div className="shrink-0 px-4 py-2.5 border-b border-slate-100 bg-emerald-50/50">
                  <span className="text-slate-900 font-medium text-[0.875rem]">已掌握</span>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-1">
                  {scopedReviewRows.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-8">暂无已掌握小节</p>
                  ) : reviewSplit.masteredGroups.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-8">暂无已掌握小节</p>
                  ) : (
                    reviewSplit.masteredGroups.map((g) => {
                      const sid = `m:${g.key}`;
                      const open = openReviewChapters[sid] ?? false;
                      return (
                        <div
                          key={g.key}
                          className="border border-slate-100 rounded-lg overflow-hidden bg-white"
                        >
                          <button
                            type="button"
                            onClick={() => toggleReviewChapter("m", g.key)}
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-slate-50"
                          >
                            <ChevronRight
                              size={16}
                              className={`shrink-0 text-slate-500 transition-transform ${open ? "rotate-90" : ""}`}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-slate-800 text-[0.8125rem] truncate">
                                {g.chapterTitle}
                              </div>
                              <div className="text-slate-400 text-[0.65rem] truncate">{g.courseLabel}</div>
                            </div>
                            <span className="text-slate-400 text-[0.7rem] shrink-0 tabular-nums">
                              {g.rows.length} 小节
                            </span>
                          </button>
                          {open ? (
                            <div className="px-2 pb-3 pt-1 space-y-2 border-t border-slate-50 bg-slate-50/40">
                              {g.rows.map((row) => (
                                <ReviewRowCard
                                  key={`${row.planId}:${row.sectionId}`}
                                  row={row}
                                  onEnterClassStudy={onEnterClassStudy}
                                />
                              ))}
                            </div>
                          ) : null}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden min-h-0 max-h-[min(28rem,56vh)] lg:max-h-[min(32rem,70vh)]">
                <div className="shrink-0 px-4 py-2.5 border-b border-slate-100 bg-violet-50/50">
                  <span className="text-slate-900 font-medium text-[0.875rem]">
                    建议巩固 · 待复习
                  </span>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-1">
                  {scopedReviewRows.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-8">暂无待巩固小节</p>
                  ) : reviewSplit.focusGroups.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-8">暂无待巩固小节</p>
                  ) : (
                    reviewSplit.focusGroups.map((g) => {
                      const sid = `f:${g.key}`;
                      const open = openReviewChapters[sid] ?? false;
                      return (
                        <div
                          key={g.key}
                          className="border border-slate-100 rounded-lg overflow-hidden bg-white"
                        >
                          <button
                            type="button"
                            onClick={() => toggleReviewChapter("f", g.key)}
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-slate-50"
                          >
                            <ChevronRight
                              size={16}
                              className={`shrink-0 text-slate-500 transition-transform ${open ? "rotate-90" : ""}`}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-slate-800 text-[0.8125rem] truncate">
                                {g.chapterTitle}
                              </div>
                              <div className="text-slate-400 text-[0.65rem] truncate">{g.courseLabel}</div>
                            </div>
                            <span className="text-slate-400 text-[0.7rem] shrink-0 tabular-nums">
                              {g.rows.length} 小节
                            </span>
                          </button>
                          {open ? (
                            <div className="px-2 pb-3 pt-1 space-y-2 border-t border-slate-50 bg-slate-50/40">
                              {g.rows.map((row) => (
                                <ReviewRowCard
                                  key={`${row.planId}:${row.sectionId}`}
                                  row={row}
                                  onEnterClassStudy={onEnterClassStudy}
                                />
                              ))}
                            </div>
                          ) : null}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
              </>
            )}

            {hubSection === "homework" && (
              <>
          {plans.length === 0 || !activePlanId ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
              本班暂无作业记录
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
              <div className="flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden min-h-0 max-h-[min(28rem,56vh)]">
                <div className="shrink-0 px-4 py-2.5 border-b border-slate-100 bg-amber-50/60">
                  <span className="text-slate-900 font-medium text-[0.875rem]">未完成</span>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
                  {homeworkSplit.pending.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-8">暂无未完成项</p>
                  ) : (
                    homeworkSplit.pending.map((hw) => (
                      <HomeworkRowCard
                        key={hw.id}
                        hw={hw}
                        studentId={studentId}
                        plans={plans}
                        onEnterHomeworkWorkbench={onEnterHomeworkWorkbench}
                      />
                    ))
                  )}
                </div>
              </div>
              <div className="flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden min-h-0 max-h-[min(28rem,56vh)]">
                <div className="shrink-0 px-4 py-2.5 border-b border-slate-100 bg-slate-100/70">
                  <span className="text-slate-900 font-medium text-[0.875rem]">已提交</span>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
                  {homeworkSplit.submitted.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-8">暂无已提交记录</p>
                  ) : (
                    homeworkSplit.submitted.map((hw) => (
                      <HomeworkRowCard
                        key={hw.id}
                        hw={hw}
                        studentId={studentId}
                        plans={plans}
                        onEnterHomeworkWorkbench={onEnterHomeworkWorkbench}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
              </>
            )}

            {hubSection === "personal" && (
              <>
                <div className="rounded-xl border border-violet-100 bg-gradient-to-r from-violet-50/90 to-white px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                  <div className="min-w-0 flex items-start gap-3">
                    <div className="size-10 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                      <BookMarked size={20} />
                    </div>
                    <div>
                      <div className="text-slate-900 font-medium text-[0.875rem]">
                        与侧栏「学习计划」中的个人计划同步
                      </div>
                      <p className="text-slate-500 text-[0.75rem] mt-0.5 leading-relaxed">
                        新建或调整自建计划，请在学习计划页操作；此处可快速继续学习。
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenStudentLearningPlans}
                    className="shrink-0 inline-flex items-center justify-center rounded-lg border border-violet-200 bg-white text-violet-800 px-3 py-1.5 text-[0.8125rem] hover:bg-violet-50"
                  >
                    打开学习计划
                  </button>
                </div>

                {personalPlans.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center space-y-3">
                    <p className="text-slate-400 text-sm">暂无自建学习计划</p>
                    <button
                      type="button"
                      onClick={onOpenStudentLearningPlans}
                      className="inline-flex items-center justify-center rounded-lg bg-indigo-600 text-white px-3 py-1.5 text-[0.8125rem] hover:bg-indigo-700"
                    >
                      去学习计划创建
                    </button>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
                    {personalPlans.map((plan) => {
                      const pct = Math.round(plan.progress * 100);
                      return (
                        <div
                          key={plan.id}
                          className="px-4 py-3 flex flex-col lg:flex-row lg:items-center gap-3 lg:justify-between"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <AiBadge>自建</AiBadge>
                              <span
                                className={`px-2 py-0.5 rounded-md text-[0.65rem] ${personalDifficultyClass(plan.difficulty)}`}
                              >
                                {plan.difficulty}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 inline-flex items-center gap-1 text-[0.65rem]">
                                <Clock size={11} /> {plan.durationLabel}
                              </span>
                            </div>
                            <div className="text-slate-900 text-[0.875rem] font-medium mt-2">
                              {plan.title}
                            </div>
                            <p className="text-slate-600 text-[0.75rem] mt-1 line-clamp-2">{plan.goal}</p>
                            <p className="text-slate-500 text-[0.7rem] mt-1 line-clamp-2 border-l border-violet-100 pl-2">
                              {plan.remediationSummary}
                            </p>
                            <div className="mt-3 max-w-md">
                              <div className="flex items-center justify-between text-slate-500 mb-1 text-[0.6875rem]">
                                <span>进度</span>
                                <span>{pct}%</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                onContinuePersonalLearn({ goalNodeIds: plan.knowledgeNodeIds })
                              }
                              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 text-white px-3 py-1.5 text-[0.8125rem] hover:bg-indigo-700"
                            >
                              进入课堂
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {hubSection === "exam" && (
              <>
          {scopedExams.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
              {!activePlanId
                ? "请选择上方课程"
                : "该课程下暂无考试安排"}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
              {scopedExams.map((exam) => {
                const mine = getExamStudentSummary(studentId, exam);
                const tookPlace = exam.submittedCount > 0 && exam.averageScore > 0;
                const canWeak =
                  tookPlace &&
                  mine.submitted &&
                  Boolean(exam.hotWrongPoints[0]);
                return (
                  <div
                    key={exam.id}
                    className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-slate-900 text-[0.875rem] font-medium">{exam.examTitle}</div>
                      <div className="text-slate-500 text-[0.75rem] mt-1">考试日 {exam.examAt}</div>
                      <div className="text-slate-600 text-[0.75rem] mt-1">
                        {!tookPlace
                          ? "尚未开考或成绩未出"
                          : mine.submitted
                            ? `已参考${mine.totalScore != null ? ` · 得分 ${mine.totalScore}` : ""}`
                            : "缺考或未录入"}
                      </div>
                    </div>
                    {canWeak ? (
                      <button
                        type="button"
                        onClick={() => onEnterExamWeak(exam)}
                        className="shrink-0 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-800 px-3 py-1.5 text-[0.8125rem] hover:bg-slate-50"
                      >
                        薄弱点续学
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
              </>
            )}

            {hubSection === "wrongbook" && (
              <LearnCenterWrongRecordsPanel
                studentId={studentId}
                activePlanId={activePlanId}
                plans={plans}
                onPracticeKnowledge={onPracticeKnowledge}
                onEnterHomeworkWorkbench={onEnterHomeworkWorkbench}
              />
            )}
        </div>
        </div>
      </div>
    </div>
  );
}

function LearnCenterPlanTabs({
  plans,
  activePlanId,
  onActivePlanChange,
}: {
  plans: TeachingPlan[];
  activePlanId: string;
  onActivePlanChange: (id: string) => void;
}) {
  if (plans.length === 0) {
    return (
      <span className="text-slate-400 text-[0.8125rem] font-normal">暂无进行中的课程计划</span>
    );
  }
  return (
    <div
      className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100/95 p-0.5 max-w-full"
      role="tablist"
      aria-label="切换课程"
    >
      {plans.map((p) => {
        const active = p.id === activePlanId;
        return (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onActivePlanChange(p.id)}
            className={`rounded-md px-2.5 py-1 text-[0.8125rem] transition-colors max-w-[12rem] truncate ${
              active
                ? "bg-white text-indigo-800 shadow-sm font-medium ring-1 ring-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
            title={courseNameForPlan(p)}
          >
            {courseNameForPlan(p)}
          </button>
        );
      })}
    </div>
  );
}

export function LearnCenter({
  studentId,
  initialPlanId,
  initialHubSection,
  onEnterClassStudy,
  onEnterHomeworkWorkbench,
  onOpenStudentLearningPlans,
  onContinuePersonalLearn,
  onPracticeKnowledge,
}: {
  studentId: string;
  /** 深链进入时选中对应授课计划（如本题库错题本） */
  initialPlanId?: string;
  initialHubSection?: LearnCenterHubSectionId;
  onEnterClassStudy: (args: {
    planId: string;
    sectionId: string;
    focus: "课堂" | "讲义";
    goalNodeIds?: string[];
  }) => void;
  onEnterHomeworkWorkbench: (homeworkId: string) => void;
  onOpenStudentLearningPlans: () => void;
  onContinuePersonalLearn: (opts: StudentLearnNavigateInput) => void;
  onPracticeKnowledge: (planId: string, goalNodeIds: string[]) => void;
}) {
  const plans = useMemo(() => getStudentPlans(studentId), [studentId]);
  const [activePlanId, setActivePlanId] = useState<string>("");

  useEffect(() => {
    setActivePlanId((prev) => {
      if (plans.some((p) => p.id === prev)) return prev;
      return plans[0]?.id ?? "";
    });
  }, [plans]);

  useEffect(() => {
    if (initialPlanId && plans.some((p) => p.id === initialPlanId)) {
      setActivePlanId(initialPlanId);
    }
  }, [initialPlanId, plans]);

  const enterExamWeakFromHub = (exam: ExamEvalSummary) => {
    const plan = plans.find((p) => p.courseId === exam.courseId);
    if (!plan) return;
    const nodeId = exam.hotWrongPoints[0]?.knowledgeNodeId;
    const sectionId =
      findSectionIdByKnowledgeNode(plan, nodeId) ?? findResumeSectionId(studentId, plan);
    if (!sectionId) return;
    const section = findPlanSection(plan.id, sectionId).section;
    onEnterClassStudy({
      planId: plan.id,
      sectionId,
      focus: "课堂",
      goalNodeIds: section?.knowledgeNodeIds,
    });
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-slate-50">
      <PageHeader
        title={
          <div className="flex flex-col gap-2.5 min-w-0 sm:flex-row sm:items-center sm:gap-4">
            <span className="shrink-0 font-semibold tracking-tight">学习中心</span>
            <LearnCenterPlanTabs
              plans={plans}
              activePlanId={activePlanId}
              onActivePlanChange={setActivePlanId}
            />
          </div>
        }
      />
      <LearnCenterHub
        studentId={studentId}
        plans={plans}
        activePlanId={activePlanId}
        initialHubSection={initialHubSection}
        onEnterClassStudy={onEnterClassStudy}
        onEnterHomeworkWorkbench={onEnterHomeworkWorkbench}
        onEnterExamWeak={enterExamWeakFromHub}
        onOpenStudentLearningPlans={onOpenStudentLearningPlans}
        onContinuePersonalLearn={onContinuePersonalLearn}
        onPracticeKnowledge={onPracticeKnowledge}
      />
    </div>
  );
}
