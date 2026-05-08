import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, ClipboardList, GraduationCap } from "lucide-react";
import type { TeachingPlan } from "@mock";
import { normalizeStudentChapterPointIdsToGraphNodes } from "../../data/learnCenterSession";
import type {
  WrongAnswerRecord,
  WrongAnswerRecordSourceKind,
} from "../../data/wrongAnswerRecordsMock";
import { wrongAnswerRecordsByStudentPlan } from "../../data/wrongAnswerRecordsMock";
import type { WrongQuestionType } from "../../data/studentMock";

const sourceKindLabel: Record<WrongAnswerRecordSourceKind, string> = {
  homework: "作业",
  exam: "考试",
  class_quiz: "随堂测验",
  practice: "自主练",
};

const recordStatusLabel: Record<WrongAnswerRecord["recordStatus"], string> = {
  pending_redo: "待订正",
  redo_submitted: "已重交",
  cleared: "已过关",
};

const recordStatusClass: Record<WrongAnswerRecord["recordStatus"], string> = {
  pending_redo: "bg-rose-50 text-rose-700 border-rose-100",
  redo_submitted: "bg-amber-50 text-amber-800 border-amber-100",
  cleared: "bg-emerald-50 text-emerald-800 border-emerald-100",
};

const questionTypeBadge: Record<WrongQuestionType, string> = {
  选择题: "bg-indigo-50 text-indigo-600 border-indigo-100",
  判断题: "bg-violet-50 text-violet-600 border-violet-100",
  填空题: "bg-sky-50 text-sky-600 border-sky-100",
  作图题: "bg-orange-50 text-orange-600 border-orange-100",
  简答题: "bg-teal-50 text-teal-600 border-teal-100",
};

function dateKey(occurredAt: string): string {
  return occurredAt.slice(0, 10);
}

function compareOccurredDesc(a: WrongAnswerRecord, b: WrongAnswerRecord): number {
  if (a.occurredAt < b.occurredAt) return 1;
  if (a.occurredAt > b.occurredAt) return -1;
  return 0;
}

export function LearnCenterWrongRecordsPanel({
  studentId,
  activePlanId,
  plans,
  onPracticeKnowledge,
  onEnterHomeworkWorkbench,
}: {
  studentId: string;
  activePlanId: string;
  plans: TeachingPlan[];
  onPracticeKnowledge: (planId: string, goalNodeIds: string[]) => void;
  onEnterHomeworkWorkbench: (homeworkId: string) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const planRows = useMemo(
    () => wrongAnswerRecordsByStudentPlan(studentId, activePlanId),
    [studentId, activePlanId],
  );

  const sortedRows = useMemo(() => {
    const base = [...planRows];
    base.sort(compareOccurredDesc);
    return base;
  }, [planRows]);

  const grouped = useMemo(() => {
    const map = new Map<string, WrongAnswerRecord[]>();
    for (const r of sortedRows) {
      const dk = dateKey(r.occurredAt);
      const bucket = map.get(dk);
      if (bucket) bucket.push(r);
      else map.set(dk, [r]);
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [sortedRows]);

  if (!activePlanId || plans.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
        请选择上方课程后查看本题库下的错题记录
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedRows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
          本题库暂无错题记录
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([day, rows]) => (
            <div key={day}>
              <div className="sticky top-0 z-[1] -mx-1 px-1 py-1 mb-2 bg-slate-50/95 border-b border-slate-100">
                <span className="text-slate-500 text-[0.6875rem] font-medium tracking-wide">{day}</span>
              </div>
              <div className="space-y-2">
                {rows.map((r) => {
                  const expanded = expandedId === r.id;
                  const qBadge =
                    questionTypeBadge[r.questionType] ??
                    "bg-slate-50 text-slate-500 border-slate-100";
                  const Icon = r.sourceKind === "exam" ? GraduationCap : ClipboardList;

                  const goalNormalized = normalizeStudentChapterPointIdsToGraphNodes(
                    r.knowledgePointIds,
                  );

                  return (
                    <div
                      key={r.id}
                      className={`rounded-xl border bg-white overflow-hidden transition ${
                        r.recordStatus === "pending_redo" ? "border-rose-100" : "border-slate-100"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedId(expanded ? null : r.id)}
                        className="w-full flex gap-3 px-3 py-2.5 text-left hover:bg-slate-50/80"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <Icon size={12} className="text-slate-400 shrink-0" aria-hidden />
                            <span className="text-slate-400 text-[0.65rem] tabular-nums shrink-0">
                              {r.occurredAt.slice(11)}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded border text-[0.65rem] ${qBadge}`}>
                              {r.questionType}
                            </span>
                            <span className="px-1.5 py-0.5 rounded border border-slate-100 bg-slate-50 text-slate-600 text-[0.65rem]">
                              {sourceKindLabel[r.sourceKind]}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded border text-[0.65rem] ${recordStatusClass[r.recordStatus]}`}
                            >
                              {recordStatusLabel[r.recordStatus]}
                            </span>
                            {r.scoreLost != null && r.scoreMax != null ? (
                              <span className="text-rose-600 text-[0.65rem] font-medium tabular-nums">
                                −{r.scoreLost}/{r.scoreMax}
                              </span>
                            ) : null}
                          </div>
                          <div className="text-slate-500 text-[0.65rem]">
                            {r.sourceTitle} · {r.itemLabel}
                          </div>
                          <p className="text-slate-800 text-[0.8125rem] mt-1.5 line-clamp-2 leading-snug">
                            {r.stemSummary}
                          </p>
                        </div>
                        <div className="shrink-0 pt-0.5 text-slate-400">
                          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </button>

                      {expanded ? (
                        <div className="px-3 pb-3 pt-0 space-y-3 border-t border-slate-50">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                            <div className="rounded-lg bg-rose-50/80 border border-rose-100 px-2.5 py-2">
                              <div className="text-rose-600 text-[0.65rem] mb-0.5">我的作答摘要</div>
                              <p className="text-slate-800 text-[0.75rem] leading-relaxed">
                                {r.myAnswerSummary}
                              </p>
                            </div>
                            <div className="rounded-lg bg-emerald-50/70 border border-emerald-100 px-2.5 py-2">
                              <div className="text-emerald-700 text-[0.65rem] mb-0.5">正确要点</div>
                              <p className="text-slate-800 text-[0.75rem] leading-relaxed">
                                {r.correctSummary}
                              </p>
                            </div>
                          </div>

                          {r.hintNote ? (
                            <p className="text-slate-500 text-[0.7rem] border-l border-slate-200 pl-2">
                              {r.hintNote}
                            </p>
                          ) : null}

                          <div className="flex flex-wrap gap-1.5">
                            {r.knowledgePointLabels.map((label, i) => (
                              <span
                                key={`${r.id}-${label}-${i}`}
                                className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-slate-600 text-[0.68rem]"
                              >
                                {label}
                              </span>
                            ))}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => onPracticeKnowledge(activePlanId, goalNormalized)}
                              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 text-white px-3 py-1.5 text-[0.8125rem] hover:bg-indigo-700"
                            >
                              针对性练习
                            </button>
                            {r.sourceKind === "homework" && r.homeworkId ? (
                              <button
                                type="button"
                                onClick={() => onEnterHomeworkWorkbench(r.homeworkId!)}
                                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 px-3 py-1.5 text-[0.8125rem] hover:bg-slate-50"
                              >
                                作业工作台
                              </button>
                            ) : null}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
