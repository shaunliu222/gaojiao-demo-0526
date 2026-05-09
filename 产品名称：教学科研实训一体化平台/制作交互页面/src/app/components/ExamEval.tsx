import { useEffect, useMemo, useState } from "react";
import { ChevronRight, AlertTriangle, Calendar, BookOpen } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  EvalCoopRoster,
  EvalStudentSheet,
  defaultTeacherEvalNarrative,
  type Focus,
} from "./EvalCoopCommon";
import { examEvaluations } from "@mock";
import type { ExamEvalSummary, StudentEvalNarrative } from "@mock";
import {
  classById,
  courseById,
  resolveNextLessonSectionForCourseClasses,
  teacherById,
  teacherSeesAllScopedContent,
} from "../data/lookups";
import { PageHeader, AiBadge } from "./Layout";
import {
  scoreBucketRangeFill,
  sortScoreBucketsForChart,
} from "./scoreDistributionChartStyles";

function classesLabel(ids: string[]): string {
  return ids.map((id) => classById(id)?.name ?? id).join(" + ");
}

export function ExamOverview({
  currentTeacherId,
  onOpen,
}: {
  currentTeacherId: string;
  onOpen: (id: string) => void;
}) {
  const scoped = useMemo(() => {
    if (teacherSeesAllScopedContent(currentTeacherId)) return examEvaluations;
    return examEvaluations.filter((e) => e.teacherId === currentTeacherId);
  }, [currentTeacherId]);

  return (
    <div>
      <PageHeader
        title="考试评价"
        actions={
          <div className="flex items-center gap-2 text-slate-500">
            <select className="bg-white border border-slate-200 rounded-md px-2 py-1">
              <option>全部学期</option>
            </select>
            <select className="bg-white border border-slate-200 rounded-md px-2 py-1">
              <option>全部课程</option>
            </select>
          </div>
        }
      />
      <div className="p-6 grid grid-cols-12 gap-4">
        <div className="col-span-12 bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-3 border-b border-slate-200 text-slate-900">考试列表</div>
          <div className="divide-y divide-slate-100">
            {scoped.map((e) => {
              const course = courseById(e.courseId);
              const teacher = teacherById(e.teacherId);
              const notStarted = e.submittedCount === 0 && e.averageScore === 0;
              return (
                <button
                  key={e.id}
                  onClick={() => onOpen(e.id)}
                  className="w-full text-left px-5 py-4 hover:bg-slate-50 flex items-center gap-4"
                >
                  <div className="flex-1">
                    <div className="text-slate-900">{e.examTitle}</div>
                    <div className="text-slate-500 mt-0.5">
                      {course?.name} · {classesLabel(e.classIds)} · 任课 {teacher?.name ?? "—"}
                    </div>
                    <div className="mt-1 text-slate-400 inline-flex items-center gap-1">
                      <Calendar size={12} /> {e.examAt}
                    </div>
                  </div>
                  <div className="text-right">
                    {notStarted ? (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700">
                        未开考
                      </span>
                    ) : (
                      <>
                        <div className="text-slate-900">均分 {e.averageScore.toFixed(1)}</div>
                        <div className="text-slate-500">
                          通过率 {Math.round(e.passRate * 100)}% · 提交{" "}
                          {e.submittedCount}/{e.totalStudents}
                        </div>
                      </>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>
              );
            })}
            {scoped.length === 0 && (
              <div className="px-5 py-12 text-center text-slate-400">暂无考试评价记录</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExamDetail({
  id,
  currentTeacherId,
  onBack,
  onAdjustCourse,
}: {
  id: string;
  currentTeacherId: string;
  onBack: () => void;
  /** 跳转到教学计划「课时进度」中的下一堂课（原小节 id） */
  onAdjustCourse?: (planId: string, sectionId: string) => void;
}) {
  const [rangeFilter, setRangeFilter] = useState<string | null>(null);
  const [questionFocus, setQuestionFocus] = useState<Focus>({ k: "none" });
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [teacherEvalOverrides, setTeacherEvalOverrides] = useState<
    Record<string, StudentEvalNarrative>
  >({});

  useEffect(() => {
    setRangeFilter(null);
    setQuestionFocus({ k: "none" });
    setSelectedStudentId(null);
    setTeacherEvalOverrides({});
  }, [id]);

  const e = examEvaluations.find((x) => x.id === id);
  if (!e) {
    return (
      <div>
        <PageHeader back={onBack} title="考试评价" />
        <div className="p-16 text-center text-slate-500">未找到考试 {id}</div>
      </div>
    );
  }

  if (
    !teacherSeesAllScopedContent(currentTeacherId) &&
    e.teacherId !== currentTeacherId
  ) {
    return (
      <div>
        <PageHeader back={onBack} title="考试评价" />
        <div className="p-16 text-center text-slate-500">
          当前账号仅可查看本人命题的考试评价。
        </div>
      </div>
    );
  }

  const course = courseById(e.courseId);
  const teacher = teacherById(e.teacherId);
  const examNextNav = resolveNextLessonSectionForCourseClasses(e.courseId, e.classIds);
  const notStarted = e.submittedCount === 0 && e.averageScore === 0;
  const distData = sortScoreBucketsForChart(e.scoreBuckets).map((b) => ({
    bin: b.range,
    count: b.count,
    range: b.range,
  }));
  const compareData = e.classComparison.map((c) => ({
    name: classById(c.classId)?.name ?? c.classId,
    avg: c.avgScore,
    pass: Math.round(c.passRate * 100),
  }));
  const qAcc = e.questionAccuracy ?? [];
  const rosterInteractive = !notStarted && qAcc.length > 0;

  const selectedRow = selectedStudentId
    ? e.studentResults.find((r) => r.studentId === selectedStudentId)
    : undefined;
  const teacherEvalForSheet: StudentEvalNarrative =
    selectedStudentId && teacherEvalOverrides[selectedStudentId] !== undefined
      ? teacherEvalOverrides[selectedStudentId]!
      : selectedRow?.teacherEval ?? defaultTeacherEvalNarrative();

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] max-h-full min-h-0 w-full max-w-full flex-col overflow-hidden">
      <div className="shrink-0">
        <PageHeader
          back={onBack}
          title={<span>{e.examTitle} · {classesLabel(e.classIds)}</span>}
        />
        {notStarted ? (
          <div className="mx-6 mt-4 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700">
            考试尚未进行（{e.examAt}），以下为 AI 根据前序评价给出的备考建议。
          </div>
        ) : (
          hasWarning(e) && (
            <div className="mx-6 mt-4 px-4 py-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertTriangle size={16} /> 班级差距较大，建议对照右栏与题目筛选关注薄弱面。
            </div>
          )
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain max-lg:min-h-0">
          {selectedStudentId ? (
            <EvalStudentSheet
              studentId={selectedStudentId}
              results={e.studentResults}
              questionAccuracy={qAcc}
              keyReasons={e.keyStudents.map((ks) => ({
                studentId: ks.studentId,
                reason: ks.reason,
              }))}
              title="本场考试"
              submittedAt={e.examAt}
              onBack={() => setSelectedStudentId(null)}
              teacherEvalValue={teacherEvalForSheet}
              onTeacherEvalChange={(next) => {
                if (!selectedStudentId) return;
                setTeacherEvalOverrides((prev) => ({
                  ...prev,
                  [selectedStudentId]: next,
                }));
              }}
            />
          ) : (
      <div className="grid grid-cols-12 gap-4 p-6">
        <div className="col-span-12 grid grid-cols-5 gap-3">
          <Metric label="提交" value={notStarted ? "—" : `${e.submittedCount}/${e.totalStudents}`} />
          <Metric label="均分" value={notStarted ? "—" : e.averageScore.toFixed(1)} />
          <Metric
            label="最高/最低"
            value={notStarted ? "—" : `${e.maxScore} / ${e.minScore}`}
          />
          <Metric
            label="通过率"
            value={notStarted ? "—" : `${Math.round(e.passRate * 100)}%`}
          />
          <Metric label="任课" value={teacher?.name ?? "—"} />
        </div>

        {!notStarted && (
          <>
            <div className="col-span-7 bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-slate-500 mb-2">成绩分布</div>
              <p className="text-xs text-slate-400 mb-2">
                点击柱形快速筛选，再次点击同一分段可取消
              </p>
              <div className="h-48">
                <ResponsiveContainer>
                  <BarChart data={distData}>
                    <CartesianGrid stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="bin" tick={{ fontSize: 12, fill: "#64748b" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {distData.map((entry, i) => {
                        const r = entry.range;
                        const isSel = rangeFilter === r;
                        return (
                          <Cell
                            key={r + i}
                            fill={scoreBucketRangeFill(r)}
                            fillOpacity={rangeFilter && !isSel ? 0.4 : 1}
                            stroke={isSel ? "#4f46e5" : undefined}
                            strokeWidth={isSel ? 2 : 0}
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              setRangeFilter((cur) => (cur === r ? null : r))
                            }
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="col-span-5 bg-white rounded-xl border border-slate-200 p-5">
              <div className="text-slate-900 mb-2">班级对比</div>
              {compareData.length > 0 ? (
                <div className="h-56">
                  <ResponsiveContainer>
                    <BarChart data={compareData} layout="vertical">
                      <CartesianGrid stroke="#f1f5f9" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 12, fill: "#64748b" }} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 12, fill: "#64748b" }}
                      />
                      <Tooltip />
                      <Bar dataKey="avg" fill="#6366f1" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-slate-400">单班考试 · 无对照</div>
              )}
            </div>

            {qAcc.length > 0 && (
            <div className="col-span-7 bg-white rounded-xl border border-slate-200 p-5">
              <div className="text-slate-900 mb-3">题目正确率</div>
              <p className="text-xs text-slate-400 mb-2 -mt-1">点击题目标题行筛出该题答错学生</p>
              <div className="space-y-2">
                {qAcc.map((q, qi) => {
                  const rate = Math.round(q.accuracy * 100);
                  const isSel =
                    questionFocus.k === "question" && questionFocus.qIndex === qi;
                  return (
                    <button
                      key={q.questionNo}
                      type="button"
                      onClick={() => {
                        setQuestionFocus((cur) =>
                          cur.k === "question" && cur.qIndex === qi
                            ? { k: "none" }
                            : {
                                k: "question",
                                questionNo: q.questionNo,
                                title: q.title,
                                qIndex: qi,
                              },
                        );
                        setRangeFilter(null);
                      }}
                      className={`w-full text-left flex items-center gap-3 rounded-lg px-1 py-0.5 -mx-1 transition ${
                        isSel
                          ? "ring-2 ring-indigo-400 ring-offset-0 bg-indigo-50/50"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <span className="w-8 text-slate-500">Q{q.questionNo}</span>
                      <span className="flex-1 text-slate-700 truncate">{q.title}</span>
                      <div className="w-48 h-4 bg-slate-100 rounded overflow-hidden">
                        <div
                          className={`h-full ${
                            rate < 65 ? "bg-rose-400" : rate < 80 ? "bg-amber-400" : "bg-emerald-400"
                          }`}
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-slate-700">{rate}%</span>
                    </button>
                  );
                })}
              </div>
            </div>
            )}
            <div
              className={
                qAcc.length > 0
                  ? "col-span-5 bg-white rounded-xl border border-slate-200 p-5"
                  : "col-span-12 bg-white rounded-xl border border-slate-200 p-5"
              }
            >
              <div className="text-slate-900 mb-3">集中错题</div>
              <div className="space-y-2">
                {e.hotWrongPoints.map((hs, i) => (
                  <div
                    key={hs.name}
                    className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-100"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-rose-800">
                        {i + 1}. {hs.name}
                      </span>
                      <span className="text-rose-700">
                        {Math.round(hs.wrongRate * 100)}%
                      </span>
                    </div>
                    <div className="text-rose-600/80 text-[0.75rem] mt-1">{hs.aiCause}</div>
                  </div>
                ))}
                {e.hotWrongPoints.length === 0 && (
                  <div className="text-slate-400">无集中错题</div>
                )}
              </div>
            </div>
          </>
        )}

        <div className="col-span-12 bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-slate-900 mb-3">
            AI 洞察 {course ? `· ${course.name}` : ""}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {e.aiInsights.map((a) => (
              <div key={a.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <AiBadge />
                </div>
                <div className="text-slate-900 mb-1">{a.title}</div>
                <p className="text-slate-600 whitespace-pre-line leading-relaxed">
                  {a.summary}
                </p>
                <div className="mt-2 px-3 py-2 rounded-md bg-indigo-50/60 border border-indigo-100 text-indigo-700 whitespace-pre-line">
                  {a.actionSuggestion}
                </div>
              </div>
            ))}
            {e.aiInsights.length === 0 && (
              <div className="col-span-3 text-slate-400">暂无洞察</div>
            )}
          </div>
          {onAdjustCourse && examNextNav && (
            <div className="flex justify-center mt-4 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() =>
                  onAdjustCourse(examNextNav.planId, examNextNav.sectionId)
                }
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-indigo-200 bg-white text-indigo-700 text-sm font-medium hover:bg-indigo-50"
              >
                <BookOpen size={14} className="shrink-0" />
                前往下一堂课调整教学计划
                <ChevronRight size={14} className="opacity-70" />
              </button>
            </div>
          )}
        </div>
      </div>
          )}
        </div>
        <EvalCoopRoster
          classIds={e.classIds}
          results={e.studentResults}
          questionAccuracy={qAcc}
          rangeFilter={rangeFilter}
          onRangeFilter={(r) => {
            setRangeFilter(r);
            if (r != null) setQuestionFocus({ k: "none" });
          }}
          questionFocus={questionFocus}
          onQuestionFocus={setQuestionFocus}
          selectedStudentId={selectedStudentId}
          onSelectStudent={setSelectedStudentId}
          disabled={!rosterInteractive}
          disabledMessage="考试未开考或无逐题数据时不可按分段/题目筛选；仍可搜索学生。"
        />
      </div>
    </div>
  );
}

function hasWarning(e: ExamEvalSummary): boolean {
  if (e.classComparison.length < 2) return false;
  const scores = e.classComparison.map((c) => c.avgScore);
  return Math.max(...scores) - Math.min(...scores) >= 8;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="text-slate-500">{label}</div>
      <div className="mt-1 text-slate-900 text-xl">{value}</div>
    </div>
  );
}
