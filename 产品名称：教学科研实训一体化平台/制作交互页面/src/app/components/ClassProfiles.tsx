import { useMemo } from "react";
import { AlertTriangle, Download, FileText, ChevronRight, Star } from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { classProfiles, classes } from "@mock";
import type { ClassProfile, Student, StudentProfile } from "@mock";
import {
  teacherById,
  classById,
  currentPlanForClass,
  professionById,
  studentsByClass,
  studentProfileByStudentId,
} from "../data/lookups";
import { PageHeader, AiBadge } from "./Layout";

/** 班级画像若 stdDev 超过 14，就视作"两极分化"预警 */
function isRisk(p: ClassProfile) {
  return p.scoreDistribution.stdDev >= 14;
}

/** 班级画像 + join 出来的静态显示字段 */
interface ClassCard {
  profile: ClassProfile;
  className: string;
  teacherName: string;
  studentCount: number;
  risk: boolean;
  collegeName: string;
  grade: number;
  hasGraph: boolean;
}

function recentProfileAvg(p: StudentProfile | undefined): number | undefined {
  if (!p || p.recentScores.length === 0) return undefined;
  return Math.round(
    p.recentScores.reduce((a, b) => a + b.score, 0) / p.recentScores.length,
  );
}

/** 重点关注优先，其次按学号 */
function sortClassStudentsForArchive(list: readonly Student[]) {
  return [...list].sort((a, b) => {
    const fa = a.teacherFocus ? 1 : 0;
    const fb = b.teacherFocus ? 1 : 0;
    if (fa !== fb) return fb - fa;
    return a.studentNo.localeCompare(b.studentNo, "zh-CN", { numeric: true });
  });
}

function buildCard(p: ClassProfile): ClassCard {
  const cls = classById(p.classId);
  const teacher = cls ? teacherById(cls.headTeacherId) : undefined;
  const profession = cls ? professionById(cls.professionId) : undefined;
  return {
    profile: p,
    className: cls?.name ?? p.classId,
    teacherName: teacher?.name ?? "—",
    studentCount: cls?.studentCount ?? 0,
    risk: isRisk(p),
    collegeName: profession?.college ?? "—",
    grade: cls?.grade ?? 0,
    hasGraph: profession?.hasKnowledgeGraph ?? true,
  };
}

export function ClassProfileList({ onOpen }: { onOpen: (id: string) => void }) {
  const cards = classProfiles.map(buildCard);
  return (
    <div>
      <PageHeader
        title={<span>班级档案</span>}
        actions={
          <div className="flex items-center gap-2 text-slate-500">
            <select className="bg-white border border-slate-200 rounded-md px-2 py-1">
              <option>全部学院</option>
            </select>
            <select className="bg-white border border-slate-200 rounded-md px-2 py-1">
              <option>全部年级</option>
            </select>
            <input placeholder="搜索班级" className="border border-slate-200 rounded-md px-2 py-1" />
          </div>
        }
      />
      <div className="p-6 grid grid-cols-3 gap-4">
        {cards.map((card) => {
          const { profile: p, className, risk, hasGraph, studentCount } = card;
          return (
            <button
              key={p.classId}
              onClick={() => onOpen(p.classId)}
              className="text-left bg-white rounded-xl border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-md transition relative"
            >
              {risk && (
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-600">
                  <AlertTriangle size={12} /> 预警
                </span>
              )}
              <div className="flex items-center justify-between">
                <div className="text-slate-900">{className}</div>
                <span
                  className={`px-2 py-0.5 rounded-md ${
                    risk ? "bg-rose-50 text-rose-600" : "bg-indigo-50 text-indigo-700"
                  }`}
                >
                  {p.styleTag}
                </span>
              </div>
              <div className="mt-1 text-slate-500">
                {studentCount} 人 · 均分 {p.scoreDistribution.averageScore}
              </div>
              <div className="h-32 -mx-2 my-2">
                <ResponsiveContainer>
                  <RadarChart data={p.radar} outerRadius={50}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} />
                    <Radar
                      dataKey="score"
                      stroke={risk ? "#f43f5e" : "#6366f1"}
                      fill={risk ? "#f43f5e" : "#6366f1"}
                      fillOpacity={0.25}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-slate-600">
                强：{p.strengths[0] ?? "—"}
                <br />
                弱：{p.weaknesses[0] ?? "—"}
              </div>
              {!hasGraph && (
                <div className="mt-2 text-amber-600">⚠ 图谱未建·画像较粗</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ClassProfileDetail({
  id,
  onBack,
  onGoPlans,
  onOpenPlan,
  onOpenStudent,
}: {
  id: string;
  onBack: () => void;
  onGoPlans: () => void;
  onOpenPlan?: (planId: string) => void;
  onOpenStudent?: (studentId: string) => void;
}) {
  const profile = classProfiles.find((x) => x.classId === id);
  const cls = classes.find((c) => c.id === id);
  if (!profile || !cls) {
    return (
      <div>
        <PageHeader back={onBack} title="班级档案" />
        <div className="p-16 text-center text-slate-500">未找到 id 为 {id} 的班级画像。</div>
      </div>
    );
  }
  const teacher = teacherById(cls.headTeacherId);
  const profession = professionById(cls.professionId);
  const risk = isRisk(profile);
  const sd = profile.scoreDistribution;

  const dist = [
    { bin: "<60", count: sd.poor },
    { bin: "60-69", count: sd.medium },
    { bin: "70-84", count: sd.good },
    { bin: "≥85", count: sd.excellent },
  ];

  const plan = currentPlanForClass(id);

  const classStudents = useMemo(
    () => sortClassStudentsForArchive(studentsByClass(id)),
    [id],
  );

  return (
    <div>
      <PageHeader
        back={onBack}
        title={
          <span>
            {cls.name} · {cls.studentCount} 人 · 班主任 {teacher?.name ?? "—"}
          </span>
        }
        actions={
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50">
            <Download size={14} /> 下载 PDF
          </button>
        }
      />
      {risk && (
        <div className="mx-6 mt-4 px-4 py-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
          <AlertTriangle size={16} />
          此班级呈明显两极分化（σ={sd.stdDev}），建议启用分层教学策略，并对薄弱群体安排朋辈辅导。
        </div>
      )}
      {profession && !profession.hasKnowledgeGraph && (
        <div className="mx-6 mt-4 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-between">
          <span>当前画像基于学期成绩，颗粒度较粗</span>
          <button className="px-3 py-1 rounded-md bg-amber-600 text-white">立即建设图谱</button>
        </div>
      )}
      <div className="p-6 grid grid-cols-12 gap-4">
        <div className="col-span-3 bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-slate-500 mb-2">基础信息</div>
          <ul className="space-y-1.5 text-slate-700">
            <li>年级 {cls.grade}</li>
            <li>学院 {profession?.college ?? "—"}</li>
            <li>人数 {cls.studentCount}</li>
            <li>班主任 {teacher?.name ?? "—"}</li>
            <li>风格 {profile.styleTag}</li>
            <li>均分 {sd.averageScore} · σ {sd.stdDev}</li>
          </ul>
        </div>
        <div className="col-span-5 bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-slate-500 mb-2">成绩分布</div>
          <div className="h-48">
            <ResponsiveContainer>
              <BarChart data={dist}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="bin" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip />
                <Bar dataKey="count" fill={risk ? "#f43f5e" : "#6366f1"} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="col-span-4 bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-slate-500 mb-2">六维雷达</div>
          <div className="h-48">
            <ResponsiveContainer>
              <RadarChart data={profile.radar}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                <PolarRadiusAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="col-span-12 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <AiBadge>AI 画像总结</AiBadge>
          </div>
          <p className="text-slate-700 leading-relaxed whitespace-pre-line">{profile.aiSummary}</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <div className="text-slate-500 mb-1.5">强项</div>
              <div className="flex flex-wrap gap-1.5">
                {profile.strengths.map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-slate-500 mb-1.5">弱项</div>
              <div className="flex flex-wrap gap-1.5">
                {profile.weaknesses.length === 0 ? (
                  <span className="text-slate-400">—</span>
                ) : (
                  profile.weaknesses.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700">
                      {s}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-12 bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-slate-500 mb-3">快速入口</div>
          <div className="flex gap-2 flex-wrap">
            <Quick label={`查看 ${cls.studentCount} 人学情分析`} />
            <Quick label="最近作业" />
            {plan ? (
              <Quick
                label={`本班当前计划《${plan.title}》`}
                onClick={() => (onOpenPlan ? onOpenPlan(plan.id) : onGoPlans())}
              />
            ) : (
              <Quick label="本班对应的教学计划" onClick={onGoPlans} />
            )}
          </div>
        </div>
        <div className="col-span-12 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
            <div>
              <div className="text-slate-900 font-medium">全班学情档案</div>
              <div className="text-slate-500 text-sm mt-0.5">
                共 {classStudents.length} 人 · 已生成画像 {classStudents.filter((s) => studentProfileByStudentId(s.id)).length}{" "}
                人 · 重点关注排前
              </div>
            </div>
          </div>
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-2.5 pr-3 font-medium w-10">#</th>
                  <th className="py-2.5 pr-3 font-medium">姓名</th>
                  <th className="py-2.5 pr-3 font-medium">学号</th>
                  <th className="py-2.5 pr-3 font-medium">关注</th>
                  <th className="py-2.5 pr-3 font-medium">近期均分</th>
                  <th className="py-2.5 pr-3 font-medium">学习风格</th>
                  <th className="py-2.5 pr-3 font-medium">课堂活跃</th>
                  <th className="py-2.5 pr-2 font-medium">学情摘要</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((s, index) => {
                  const p = studentProfileByStudentId(s.id);
                  const avg = recentProfileAvg(p);
                  return (
                    <tr
                      key={s.id}
                      onClick={() => onOpenStudent?.(s.id)}
                      className={`border-b border-slate-100 last:border-0 ${
                        onOpenStudent ? "cursor-pointer hover:bg-slate-50/80" : ""
                      }`}
                    >
                      <td className="py-2.5 pr-3 text-slate-400 tabular-nums">{index + 1}</td>
                      <td className="py-2.5 pr-3 text-slate-900 whitespace-nowrap">
                        {s.teacherFocus && (
                          <Star
                            className="inline-block mr-1.5 -mt-0.5 text-amber-500"
                            size={14}
                            fill="currentColor"
                          />
                        )}
                        {s.name}
                      </td>
                      <td className="py-2.5 pr-3 text-slate-600 font-mono text-xs whitespace-nowrap">
                        {s.studentNo}
                      </td>
                      <td className="py-2.5 pr-3 whitespace-nowrap">
                        {s.teacherFocus ? (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-xs">
                            重点关注
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-3">
                        {avg != null ? (
                          <span
                            className={`px-2 py-0.5 rounded-md ${
                              avg >= 85
                                ? "bg-emerald-50 text-emerald-700"
                                : avg >= 70
                                ? "bg-amber-50 text-amber-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {avg}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-3 text-slate-700">
                        {p ? p.learningStyle : "—"}
                      </td>
                      <td className="py-2.5 pr-3">
                        {p ? (
                          <span
                            className={`px-2 py-0.5 rounded-md ${
                              p.activity === "高"
                                ? "bg-emerald-50 text-emerald-700"
                                : p.activity === "中"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {p.activity}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-2 text-slate-600 max-w-md">
                        {p ? (
                          <span className="line-clamp-2" title={p.aiSummary}>
                            {p.aiSummary}
                          </span>
                        ) : (
                          <span className="text-slate-400">暂无学情档案</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Quick({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-slate-700"
    >
      <FileText size={14} /> {label} <ChevronRight size={14} className="text-slate-400" />
    </button>
  );
}
