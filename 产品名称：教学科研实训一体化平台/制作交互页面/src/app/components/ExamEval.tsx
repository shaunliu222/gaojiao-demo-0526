import { ChevronRight, AlertTriangle, Calendar } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { examEvaluations } from "@mock";
import type { ExamEvalSummary } from "@mock";
import { classById, courseById, teacherById } from "../data/lookups";
import { PageHeader, AiBadge } from "./Layout";

function classesLabel(ids: string[]): string {
  return ids.map((id) => classById(id)?.name ?? id).join(" + ");
}

export function ExamOverview({ onOpen }: { onOpen: (id: string) => void }) {
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
            {examEvaluations.map((e) => {
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
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExamDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const e = examEvaluations.find((x) => x.id === id);
  if (!e) {
    return (
      <div>
        <PageHeader back={onBack} title="考试评价" />
        <div className="p-16 text-center text-slate-500">未找到考试 {id}</div>
      </div>
    );
  }
  const course = courseById(e.courseId);
  const teacher = teacherById(e.teacherId);
  const notStarted = e.submittedCount === 0 && e.averageScore === 0;
  const distData = e.scoreBuckets.map((b) => ({ bin: b.range, count: b.count }));
  const compareData = e.classComparison.map((c) => ({
    name: classById(c.classId)?.name ?? c.classId,
    avg: c.avgScore,
    pass: Math.round(c.passRate * 100),
  }));

  return (
    <div>
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
            <AlertTriangle size={16} /> 班级差距较大，建议查看 2302 等薄弱班级的重点学生列表。
          </div>
        )
      )}
      <div className="p-6 grid grid-cols-12 gap-4">
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
            <div className="col-span-7 bg-white rounded-xl border border-slate-200 p-5">
              <div className="text-slate-900 mb-2">分数分布</div>
              <div className="h-56">
                <ResponsiveContainer>
                  <BarChart data={distData}>
                    <CartesianGrid stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="bin" tick={{ fontSize: 12, fill: "#64748b" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
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

            <div className="col-span-7 bg-white rounded-xl border border-slate-200 p-5">
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
                    <div className="text-rose-600/80 text-[12px] mt-1">{hs.aiCause}</div>
                  </div>
                ))}
                {e.hotWrongPoints.length === 0 && (
                  <div className="text-slate-400">无集中错题</div>
                )}
              </div>
            </div>
            <div className="col-span-5 bg-white rounded-xl border border-slate-200 p-5">
              <div className="text-slate-900 mb-3">重点关注学生</div>
              <div className="space-y-2">
                {e.keyStudents.map((s) => (
                  <div
                    key={s.studentId}
                    className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200"
                  >
                    <div>
                      <div className="text-slate-900">{s.studentName}</div>
                      <div className="text-slate-500">{s.reason}</div>
                    </div>
                    {s.score != null && (
                      <span
                        className={`px-2 py-0.5 rounded-md ${
                          s.score >= 90
                            ? "bg-emerald-50 text-emerald-700"
                            : s.score >= 60
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {s.score}
                      </span>
                    )}
                  </div>
                ))}
                {e.keyStudents.length === 0 && (
                  <div className="text-slate-400">无重点学生</div>
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
        </div>
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
