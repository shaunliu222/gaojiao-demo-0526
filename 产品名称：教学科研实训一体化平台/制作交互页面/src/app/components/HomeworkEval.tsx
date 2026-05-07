import { useEffect, useMemo, useState } from "react";
import {
  EvalCoopRoster,
  EvalStudentSheet,
  defaultTeacherEvalNarrative,
  type Focus,
} from "./EvalCoopCommon";
import type { StudentEvalNarrative } from "@mock";
import { TrendingUp, AlertTriangle, ChevronRight, BookOpen, PenTool } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { homeworkEvaluations, classes } from "@mock";
import type { HomeworkEvalSummary } from "@mock";
import {
  classById,
  courseById,
  resolveNextLessonSectionForPlan,
  teacherById,
  teacherSeesAllScopedContent,
} from "../data/lookups";
import { PageHeader, AiBadge } from "./Layout";
import {
  scoreBucketRangeFill,
  sortScoreBucketsForChart,
} from "./scoreDistributionChartStyles";

function passRate(h: HomeworkEvalSummary): number {
  const total = h.submissionCount || 1;
  const pass = (h.aiRatings.excellent + h.aiRatings.good + h.aiRatings.pass) * 100;
  return Math.round(pass / total);
}

/** 近似一个"标准差"用于预警（基于 aiRatings 的不及格比） */
function failCount(h: HomeworkEvalSummary): number {
  return h.aiRatings.fail;
}

export function HwOverview({
  currentTeacherId,
  onOpen,
}: {
  currentTeacherId: string;
  onOpen: (id: string) => void;
}) {
  const scopedHw = useMemo(() => {
    if (teacherSeesAllScopedContent(currentTeacherId)) return homeworkEvaluations;
    return homeworkEvaluations.filter((h) => h.teacherId === currentTeacherId);
  }, [currentTeacherId]);

  // 所有出现过作业的班级作为筛选项
  const classIds = useMemo(() => {
    const set = new Set<string>();
    for (const h of scopedHw) set.add(h.classId);
    return Array.from(set);
  }, [scopedHw]);

  const [clsFilter, setClsFilter] = useState<string>(
    classIds.includes("cls-mech-2301") ? "cls-mech-2301" : classIds[0] ?? "",
  );

  useEffect(() => {
    if (classIds.length === 0) return;
    if (!classIds.includes(clsFilter)) {
      setClsFilter(classIds[0]!);
    }
  }, [classIds, clsFilter]);

  const filtered = scopedHw
    .filter((h) => h.classId === clsFilter)
    .slice()
    .sort((a, b) => a.assignedAt.localeCompare(b.assignedAt));

  const trendData = filtered.map((h) => ({
    name: h.homeworkTitle.slice(0, 8),
    avg: h.averageScore,
    date: h.assignedAt,
  }));

  const latest = filtered[filtered.length - 1];
  const curClass = classes.find((c) => c.id === clsFilter);

  return (
    <div>
      <PageHeader
        title="作业评价"
        actions={
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
            {classIds.map((cid) => {
              const c = classById(cid);
              return (
                <button
                  key={cid}
                  onClick={() => setClsFilter(cid)}
                  className={`px-3 py-1 rounded-md ${
                    clsFilter === cid ? "bg-white text-indigo-700 shadow" : "text-slate-600"
                  }`}
                >
                  {c?.name ?? cid}
                </button>
              );
            })}
          </div>
        }
      />
      <div className="p-6 grid grid-cols-12 gap-4">
        <div className="col-span-8 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-slate-900">
              {curClass?.name ?? clsFilter} · 作业均分趋势
            </div>
            <span className="text-slate-500 inline-flex items-center gap-1">
              <TrendingUp size={14} /> 共 {filtered.length} 次
            </span>
          </div>
          <div className="h-56">
            <ResponsiveContainer>
              <LineChart data={trendData}>
                <CartesianGrid stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="avg"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {filtered.length < 3 && (
            <div className="mt-2 text-amber-600 text-xs">
              · 该班级作业记录较少（{filtered.length} 条），趋势图仅作参考
            </div>
          )}
        </div>
        <div className="col-span-4 space-y-3">
          {latest && latest.aiInsights.length > 0 ? (
            latest.aiInsights.slice(0, 3).map((ai, i) => (
              <div key={ai.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <AiBadge /> <span className="text-slate-500">洞察 {i + 1}</span>
                </div>
                <div className="text-slate-900 mb-1">{ai.title}</div>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">{ai.summary}</p>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-slate-500">
              暂无 AI 洞察
            </div>
          )}
        </div>
        <div className="col-span-12 bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-3 border-b border-slate-200 text-slate-900">作业列表</div>
          <div className="divide-y divide-slate-100">
            {filtered.map((h) => {
              const cls = classById(h.classId);
              const pr = passRate(h);
              return (
                <button
                  key={h.id}
                  onClick={() => onOpen(h.id)}
                  className="w-full text-left px-5 py-4 hover:bg-slate-50 flex flex-col gap-3 md:flex-row md:items-stretch"
                >
                  {/* 左半：作业元信息与易错点（与右半对半分中间区域） */}
                  <div className="min-w-0 flex-1 md:pr-4 md:border-r md:border-slate-100">
                    <div className="text-slate-900 font-medium">{h.homeworkTitle}</div>
                    <div className="text-slate-500 mt-0.5 text-sm">
                      {h.assignedAt} 发布 · {h.submissionCount}/{h.totalStudents} 提交 · {cls?.name}
                    </div>
                    {h.hotWrongPoints.length > 0 && (
                      <div className="mt-1.5 flex gap-1.5 flex-wrap">
                        {h.hotWrongPoints.slice(0, 2).map((hs) => (
                          <span
                            key={hs.name}
                            className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-xs"
                          >
                            {hs.name} {Math.round(hs.wrongRate * 100)}%
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* 右半：AI 评价 */}
                  <div className="min-w-0 flex-1 md:pl-4 md:pr-2">
                    {h.aiInsights.length > 0 ? (
                      <div className="h-full rounded-lg border border-indigo-100 bg-indigo-50/50 px-3 py-2.5 flex flex-col">
                        <div className="flex items-start gap-2 min-w-0">
                          <span className="shrink-0">
                            <AiBadge />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-slate-900 leading-snug">
                              {h.aiInsights[0].title}
                            </div>
                            <p className="text-xs text-slate-600 mt-1 line-clamp-3 leading-relaxed">
                              {h.aiInsights[0].summary}
                            </p>
                            {h.aiInsights.length > 1 && (
                              <div className="text-[0.6875rem] text-indigo-600 mt-1.5">
                                共 {h.aiInsights.length} 条，详情页查看全部
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full min-h-[3.5rem] rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-3 py-2 flex items-center text-xs text-slate-400">
                        暂无 AI 评价摘要
                      </div>
                    )}
                  </div>
                  {/* 最右：成绩指标 + 进入 */}
                  <div className="flex shrink-0 items-center gap-3 md:pl-3 md:ml-1 md:border-l md:border-slate-100 self-stretch">
                    <div className="text-right min-w-[7rem]">
                      <div className="text-slate-900 font-medium">
                        均分 {h.averageScore.toFixed(1)}
                      </div>
                      <div className="text-slate-500 text-sm mt-0.5">
                        优良 {h.aiRatings.excellent + h.aiRatings.good} · 不及格 {failCount(h)} · 通过{" "}
                        {pr}%
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 shrink-0" />
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="px-5 py-8 text-center text-slate-400">该班级暂无作业</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HwDetail({
  id,
  currentTeacherId,
  onBack,
  onAdjustCourse,
  onOpenTeachingDesignAdjust,
}: {
  id: string;
  currentTeacherId: string;
  onBack: () => void;
  /** 跳转教学计划详情「教学路径」，定位到对应小节以便增删调课时 */
  onAdjustCourse?: (planId: string, sectionId: string) => void;
  /** 打开「评价驱动的教学设计调整」工作台（班级画像需有可解析的教学进度） */
  onOpenTeachingDesignAdjust?: () => void;
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

  const h = homeworkEvaluations.find((x) => x.id === id);

  if (!h) {
    return (
      <div>
        <PageHeader back={onBack} title="作业评价" />
        <div className="p-16 text-center text-slate-500">未找到作业 {id}</div>
      </div>
    );
  }

  if (
    !teacherSeesAllScopedContent(currentTeacherId) &&
    h.teacherId !== currentTeacherId
  ) {
    return (
      <div>
        <PageHeader back={onBack} title="作业评价" />
        <div className="p-16 text-center text-slate-500">
          当前账号仅可查看本人布置的作业评价。
        </div>
      </div>
    );
  }

  const cls = classById(h.classId);
  const course = courseById(h.courseId);
  const teacher = teacherById(h.teacherId);
  const nextLessonNav = resolveNextLessonSectionForPlan(h.planId, h.classId);

  const pie = [
    { n: "优", v: h.aiRatings.excellent, c: "#10b981" },
    { n: "良", v: h.aiRatings.good, c: "#6366f1" },
    { n: "及格", v: h.aiRatings.pass, c: "#f59e0b" },
    { n: "不及格", v: h.aiRatings.fail, c: "#f43f5e" },
  ].filter((d) => d.v > 0);

  const distData = sortScoreBucketsForChart(h.scoreBuckets).map((b) => ({
    bin: b.range,
    count: b.count,
    range: b.range,
  }));
  const cntLt60 = h.scoreBuckets.find((x) => x.range === "<60")?.count ?? 0;
  const cnt90 = h.scoreBuckets.find((x) => x.range === "90-100")?.count ?? 0;
  const warning =
    h.aiRatings.fail >= 3 ||
    (h.maxScore - h.minScore >= 40 && cntLt60 >= 3 && cnt90 >= 3);
  const pr = passRate(h);

  const selectedRow = selectedStudentId
    ? h.studentResults.find((r) => r.studentId === selectedStudentId)
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
          title={
            <span>
              {h.homeworkTitle} · {cls?.name ?? h.classId} · {h.assignedAt} → {h.dueAt}
            </span>
          }
          actions={
            onOpenTeachingDesignAdjust ? (
              <button
                type="button"
                onClick={onOpenTeachingDesignAdjust}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700 shrink-0"
              >
                <PenTool size={14} /> 根据评价调整教学设计
              </button>
            ) : null
          }
        />
        {warning && (
          <div className="mx-6 mt-4 px-4 py-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
            <AlertTriangle size={16} /> 预警：不及格 {h.aiRatings.fail} 人，分数跨度{" "}
            {h.maxScore - h.minScore} 分，建议启动分层辅导。
          </div>
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain max-lg:min-h-0">
          {selectedStudentId ? (
            <EvalStudentSheet
              studentId={selectedStudentId}
              results={h.studentResults}
              questionAccuracy={h.questionAccuracy}
              keyReasons={h.keyStudents.map((ks) => ({
                studentId: ks.studentId,
                reason: ks.reason,
              }))}
              title="本次作业"
              submittedAt={h.dueAt}
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
          <Metric label="提交" value={`${h.submissionCount}/${h.totalStudents}`} />
          <Metric label="均分" value={h.averageScore.toFixed(1)} />
          <Metric label="最高/最低" value={`${h.maxScore} / ${h.minScore}`} />
          <Metric label="通过率" value={`${pr}%`} />
          <Metric label="任课教师" value={teacher?.name ?? "—"} />
        </div>
        <div className="col-span-7 bg-white rounded-xl border border-slate-200 p-4">
          <div className="mb-2">
            <div className="text-slate-500">成绩分布</div>
            {course && (
              <div className="text-xs text-slate-400 mt-0.5">{course.name}</div>
            )}
          </div>
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
          <div className="text-slate-900 mb-2">AI 评级分布</div>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pie} dataKey="v" nameKey="n" innerRadius={50} outerRadius={80} label>
                  {pie.map((d) => (
                    <Cell key={d.n} fill={d.c} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="col-span-7 bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-slate-900 mb-3">题目正确率</div>
          <p className="text-xs text-slate-400 mb-2 -mt-1">点击题目标题行筛出该题答错学生</p>
          <div className="space-y-2">
            {h.questionAccuracy.map((q, qi) => {
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
        <div className="col-span-5 bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-slate-900 mb-3">集中错题</div>
          <div className="space-y-2">
            {h.hotWrongPoints.map((hs, i) => (
              <div
                key={hs.name}
                className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-100"
              >
                <div className="flex items-center justify-between">
                  <span className="text-rose-800">
                    {i + 1}. {hs.name}
                  </span>
                  <span className="text-rose-700">{Math.round(hs.wrongRate * 100)}%</span>
                </div>
                <div className="text-rose-600/80 text-[0.75rem] mt-1">{hs.aiCause}</div>
              </div>
            ))}
            {h.hotWrongPoints.length === 0 && (
              <div className="text-slate-400">本次作业无集中错题</div>
            )}
          </div>
        </div>
        <div className="col-span-12 bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-slate-900 mb-3">AI 洞察与行动建议</div>
          <div className="grid grid-cols-3 gap-3">
            {h.aiInsights.map((a) => (
              <div key={a.id} className="border border-slate-200 rounded-lg p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-1.5">
                  <AiBadge />
                </div>
                <div className="text-slate-900 mb-1">{a.title}</div>
                <p className="text-slate-600 whitespace-pre-line leading-relaxed">{a.summary}</p>
                <div className="mt-2 px-3 py-2 rounded-md bg-indigo-50/60 border border-indigo-100 text-indigo-700 whitespace-pre-line">
                  {a.actionSuggestion}
                </div>
                {a.adjustCourse && onAdjustCourse && nextLessonNav && (
                  <button
                    type="button"
                    onClick={() =>
                      onAdjustCourse(nextLessonNav.planId, nextLessonNav.sectionId)
                    }
                    className="mt-3 self-start inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-indigo-200 bg-white text-indigo-700 text-sm font-medium hover:bg-indigo-50"
                  >
                    <BookOpen size={14} className="shrink-0" />
                    调整课程（跳转下一堂课）
                    {a.adjustCourse.label && (
                      <span className="text-indigo-500 font-normal">· {a.adjustCourse.label}</span>
                    )}
                    <ChevronRight size={14} className="opacity-70" />
                  </button>
                )}
              </div>
            ))}
            {h.aiInsights.length === 0 && (
              <div className="col-span-3 text-slate-400">暂无洞察</div>
            )}
          </div>
        </div>
      </div>
          )}
        </div>
        <EvalCoopRoster
          classIds={h.classId}
          results={h.studentResults}
          questionAccuracy={h.questionAccuracy}
          rangeFilter={rangeFilter}
          onRangeFilter={(r) => {
            setRangeFilter(r);
            if (r != null) setQuestionFocus({ k: "none" });
          }}
          questionFocus={questionFocus}
          onQuestionFocus={setQuestionFocus}
          selectedStudentId={selectedStudentId}
          onSelectStudent={setSelectedStudentId}
        />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="text-slate-500">{label}</div>
      <div className="mt-1 text-slate-900 text-xl">{value}</div>
    </div>
  );
}
