import { useMemo, useState } from "react";
import { TrendingUp, AlertTriangle, ChevronRight } from "lucide-react";
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
import { classById, courseById, teacherById } from "../data/lookups";
import { PageHeader, AiBadge } from "./Layout";

function passRate(h: HomeworkEvalSummary): number {
  const total = h.submissionCount || 1;
  const pass = (h.aiRatings.excellent + h.aiRatings.good + h.aiRatings.pass) * 100;
  return Math.round(pass / total);
}

/** 近似一个"标准差"用于预警（基于 aiRatings 的不及格比） */
function failCount(h: HomeworkEvalSummary): number {
  return h.aiRatings.fail;
}

export function HwOverview({ onOpen }: { onOpen: (id: string) => void }) {
  // 所有出现过作业的班级作为筛选项
  const classIds = useMemo(() => {
    const set = new Set<string>();
    for (const h of homeworkEvaluations) set.add(h.classId);
    return Array.from(set);
  }, []);

  const [clsFilter, setClsFilter] = useState<string>(
    classIds.includes("cls-mech-2301") ? "cls-mech-2301" : classIds[0],
  );

  const filtered = homeworkEvaluations
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
                  className="w-full text-left px-5 py-4 hover:bg-slate-50 flex items-center gap-4"
                >
                  <div className="flex-1">
                    <div className="text-slate-900">{h.homeworkTitle}</div>
                    <div className="text-slate-500 mt-0.5">
                      {h.assignedAt} 发布 · {h.submissionCount}/{h.totalStudents} 提交 · {cls?.name}
                    </div>
                    {h.hotWrongPoints.length > 0 && (
                      <div className="mt-1.5 flex gap-1.5 flex-wrap">
                        {h.hotWrongPoints.slice(0, 2).map((hs) => (
                          <span
                            key={hs.name}
                            className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700"
                          >
                            {hs.name} {Math.round(hs.wrongRate * 100)}%
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-slate-900">均分 {h.averageScore.toFixed(1)}</div>
                    <div className="text-slate-500">
                      优良 {h.aiRatings.excellent + h.aiRatings.good} · 不及格 {failCount(h)} · 通过 {pr}%
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
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

export function HwDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const h = homeworkEvaluations.find((x) => x.id === id);
  if (!h) {
    return (
      <div>
        <PageHeader back={onBack} title="作业评价" />
        <div className="p-16 text-center text-slate-500">未找到作业 {id}</div>
      </div>
    );
  }
  const cls = classById(h.classId);
  const course = courseById(h.courseId);
  const teacher = teacherById(h.teacherId);

  const pie = [
    { n: "优", v: h.aiRatings.excellent, c: "#10b981" },
    { n: "良", v: h.aiRatings.good, c: "#6366f1" },
    { n: "及格", v: h.aiRatings.pass, c: "#f59e0b" },
    { n: "不及格", v: h.aiRatings.fail, c: "#f43f5e" },
  ].filter((d) => d.v > 0);

  const distData = h.scoreBuckets.map((b) => ({ bin: b.range, count: b.count }));
  const warning =
    h.aiRatings.fail >= 3 ||
    (h.maxScore - h.minScore >= 40 && h.scoreBuckets[0]?.count >= 3 && h.scoreBuckets[h.scoreBuckets.length - 1]?.count >= 3);
  const pr = passRate(h);

  return (
    <div>
      <PageHeader
        back={onBack}
        title={
          <span>
            {h.homeworkTitle} · {cls?.name ?? h.classId} · {h.assignedAt} → {h.dueAt}
          </span>
        }
      />
      {warning && (
        <div className="mx-6 mt-4 px-4 py-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
          <AlertTriangle size={16} /> 预警：不及格 {h.aiRatings.fail} 人，分数跨度 {h.maxScore - h.minScore} 分，建议启动分层辅导。
        </div>
      )}
      <div className="p-6 grid grid-cols-12 gap-4">
        <div className="col-span-12 grid grid-cols-5 gap-3">
          <Metric label="提交" value={`${h.submissionCount}/${h.totalStudents}`} />
          <Metric label="均分" value={h.averageScore.toFixed(1)} />
          <Metric label="最高/最低" value={`${h.maxScore} / ${h.minScore}`} />
          <Metric label="通过率" value={`${pr}%`} />
          <Metric label="任课教师" value={teacher?.name ?? "—"} />
        </div>
        <div className="col-span-7 bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-slate-900 mb-2">分数分布 {course ? `· ${course.name}` : ""}</div>
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
          <div className="space-y-2">
            {h.questionAccuracy.map((q) => {
              const rate = Math.round(q.accuracy * 100);
              return (
                <div key={q.questionNo} className="flex items-center gap-3">
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
                </div>
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
        {h.keyStudents.length > 0 && (
          <div className="col-span-12 bg-white rounded-xl border border-slate-200 p-5">
            <div className="text-slate-900 mb-3">重点关注学生</div>
            <div className="grid grid-cols-4 gap-3">
              {h.keyStudents.map((s) => (
                <div key={s.studentId} className="border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-900">{s.studentName}</span>
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
                  <div className="text-slate-500">{s.reason}</div>
                  {s.changeTrend && (
                    <div className="mt-1 text-slate-400">趋势 · {s.changeTrend}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="col-span-12 bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-slate-900 mb-3">AI 洞察与行动建议</div>
          <div className="grid grid-cols-3 gap-3">
            {h.aiInsights.map((a) => (
              <div key={a.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <AiBadge />
                </div>
                <div className="text-slate-900 mb-1">{a.title}</div>
                <p className="text-slate-600 whitespace-pre-line leading-relaxed">{a.summary}</p>
                <div className="mt-2 px-3 py-2 rounded-md bg-indigo-50/60 border border-indigo-100 text-indigo-700 whitespace-pre-line">
                  {a.actionSuggestion}
                </div>
              </div>
            ))}
            {h.aiInsights.length === 0 && (
              <div className="col-span-3 text-slate-400">暂无洞察</div>
            )}
          </div>
        </div>
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
