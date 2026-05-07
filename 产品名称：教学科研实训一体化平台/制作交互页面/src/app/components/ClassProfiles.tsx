import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ClipboardX,
  Download,
  FileCheck,
  Search,
  Star,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { classProfiles, classes, students } from "@mock";
import type { ClassProfile, ExamEvalSummary } from "@mock";
import {
  teacherById,
  classById,
  courseById,
  professionById,
  studentProfileByStudentId,
  homeworksByClass,
  examsByClass,
} from "../data/lookups";
import { PageHeader, AiBadge } from "./Layout";
import { StudentDetail } from "./StudentProfiles";
import { SCORE_BIN_BAR_COLORS } from "./scoreDistributionChartStyles";

/** 学情分析中枢默认选中的班级（与 classProfiles 首项一致） */
export const DEFAULT_LEARNING_CLASS_ID = classProfiles[0]!.classId;

/** 班级画像若 stdDev 超过 14，就视作"两极分化"预警 */
function isRisk(p: ClassProfile) {
  return p.scoreDistribution.stdDev >= 14;
}

function recentProfileAvg(
  p: ReturnType<typeof studentProfileByStudentId>,
): number | undefined {
  if (!p || p.recentScores.length === 0) return undefined;
  return Math.round(
    p.recentScores.reduce((a, b) => a + b.score, 0) / p.recentScores.length,
  );
}

/** 与班级「成绩分布」四段一致，用学生近期均分划档 */
export type ScoreBinKey = "<60" | "60-69" | "70-84" | "≥85";

export function scoreAvgToScoreBin(avg: number | undefined | null): ScoreBinKey | null {
  if (avg == null) return null;
  if (avg < 60) return "<60";
  if (avg < 70) return "60-69";
  if (avg < 85) return "70-84";
  return "≥85";
}

function sortRosterByFocus<T extends { teacherFocus?: boolean; studentNo: string }>(list: T[]) {
  return [...list].sort((a, b) => {
    const fa = a.teacherFocus ? 1 : 0;
    const fb = b.teacherFocus ? 1 : 0;
    if (fa !== fb) return fb - fa;
    return a.studentNo.localeCompare(b.studentNo, "zh-CN", { numeric: true });
  });
}

function LearningStudentRoster({
  classId,
  selectedStudentId,
  onSelect,
  scoreBinFilter,
}: {
  classId: string;
  selectedStudentId?: string;
  onSelect: (id: string) => void;
  scoreBinFilter: ScoreBinKey | null;
}) {
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    return sortRosterByFocus(
      students
        .filter((s) => s.classId === classId)
        .filter((s) => {
          if (!q.trim()) return true;
          const k = q.trim().toLowerCase();
          return (
            s.name.toLowerCase().includes(k) || s.studentNo.toLowerCase().includes(k)
          );
        })
        .filter((s) => {
          if (!scoreBinFilter) return true;
          const p = studentProfileByStudentId(s.id);
          const avg = recentProfileAvg(p);
          if (avg == null) return false;
          return scoreAvgToScoreBin(avg) === scoreBinFilter;
        }),
    );
  }, [classId, q, scoreBinFilter]);

  return (
    <aside
      className="w-80 max-lg:max-h-[min(50vh,22rem)] shrink-0 border-l border-slate-200 bg-slate-50/70 flex flex-col min-h-0 lg:h-full lg:max-h-none"
      aria-label="本班学生列表"
    >
      <div className="p-3 border-b border-slate-200/90 bg-white shrink-0">
        <div className="text-xs text-slate-500 mb-2">本班学生</div>
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md px-2 py-1.5 w-full">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索姓名/学号"
            className="w-full min-w-0 text-sm outline-none"
          />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 space-y-1">
        {list.map((s) => {
          const p = studentProfileByStudentId(s.id);
          const avg = recentProfileAvg(p);
          const active = selectedStudentId === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              className={`w-full text-left rounded-lg border px-2.5 py-2 text-sm transition ${
                active
                  ? "border-indigo-300 bg-indigo-50/90 shadow-sm"
                  : "border-slate-200/90 bg-white hover:border-indigo-200 hover:bg-indigo-50/40"
              }`}
            >
              <div className="flex items-start gap-2">
                <div
                  className={`size-8 rounded-full flex items-center justify-center text-white text-xs shrink-0 ${
                    s.gender === "男"
                      ? "bg-gradient-to-br from-blue-400 to-indigo-500"
                      : "bg-gradient-to-br from-pink-400 to-rose-500"
                  }`}
                >
                  {s.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 flex items-center gap-1">
                    {s.teacherFocus && (
                      <Star size={10} className="text-amber-500 shrink-0" fill="currentColor" />
                    )}
                    {s.name}
                  </div>
                  <div className="text-slate-500 text-xs font-mono tabular-nums mt-0.5 truncate">
                    {s.studentNo}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                    {avg != null && (
                      <span
                        className={`px-1.5 py-0.5 rounded ${
                          avg >= 85
                            ? "bg-emerald-50 text-emerald-700"
                            : avg >= 70
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        均 {avg}
                      </span>
                    )}
                    {p && (
                      <>
                        <span className="text-slate-500 truncate max-w-[5.5rem]">
                          {p.learningStyle}
                        </span>
                        <span
                          className={
                            p.activity === "高"
                              ? "text-emerald-600"
                              : p.activity === "中"
                              ? "text-amber-600"
                              : "text-rose-600"
                          }
                        >
                          活跃 {p.activity}
                        </span>
                      </>
                    )}
                    {!p && <span className="text-slate-400">暂无画像</span>}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
        {list.length === 0 && (
          <div className="p-6 text-center text-slate-400 text-sm">
            {scoreBinFilter && !q.trim() ? "该分段下暂无有均分档案的学生" : "无匹配学生"}
          </div>
        )}
      </div>
    </aside>
  );
}

export function LearningAnalyticsHub({
  classId,
  allowedClassIds,
  selectedStudentId,
  onClassIdChange,
  onSelectStudent,
  onClearStudent,
  onOpenHomeworkEval,
  onOpenExamEval,
}: {
  classId: string;
  /** null = 不限制（主任等）；否则仅展示这些班级的画像 tab */
  allowedClassIds: string[] | null;
  selectedStudentId?: string;
  onClassIdChange: (id: string) => void;
  onSelectStudent: (id: string) => void;
  onClearStudent: () => void;
  onOpenHomeworkEval: (homeworkEvalId: string) => void;
  onOpenExamEval: (examEvalId: string) => void;
}) {
  const [scoreBinFilter, setScoreBinFilter] = useState<ScoreBinKey | null>(null);
  const profileTabs = useMemo(() => {
    if (!allowedClassIds) return classProfiles;
    const set = new Set(allowedClassIds);
    return classProfiles.filter((p) => set.has(p.classId));
  }, [allowedClassIds]);

  // 占满主内容区一屏高（与 Layout 顶栏 h-14 对应），主区/右栏分栏内滚动，避免整页被名单撑高
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] max-h-full min-h-0 w-full max-w-full flex-col overflow-hidden">
      <div className="shrink-0">
        <PageHeader title={<span>学情分析</span>} />
        <div className="px-6 pt-1 pb-3 border-b border-slate-200 bg-white">
          <div
            className="flex flex-wrap items-center gap-2"
            role="tablist"
            aria-label="班级"
          >
            {profileTabs.map((p) => {
              const cls = classById(p.classId);
              const name = cls?.name ?? p.classId;
              const active = classId === p.classId;
              return (
                <button
                  key={p.classId}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    onClassIdChange(p.classId);
                    setScoreBinFilter(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm transition ${
                    active
                      ? "bg-indigo-50 text-indigo-700 font-medium"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
          {profileTabs.length === 0 && (
            <p className="px-6 pb-2 text-sm text-slate-500">
              当前账号下暂无关联班级画像，请联系教研室或教务授权。
            </p>
          )}
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain max-lg:min-h-0">
          {profileTabs.length === 0 ? (
            <div className="p-12 text-center text-slate-400">暂无可查看的班级学情</div>
          ) : selectedStudentId ? (
            <StudentDetail
              id={selectedStudentId}
              variant="hub"
              onBack={onClearStudent}
            />
          ) : (
            <ClassProfileDetail
              id={classId}
              variant="hub"
              scoreBinFilter={scoreBinFilter}
              onScoreBinFilterChange={(bin) =>
                setScoreBinFilter((cur) => (cur === bin ? null : bin))
              }
              onOpenHomeworkEval={onOpenHomeworkEval}
              onOpenExamEval={onOpenExamEval}
            />
          )}
        </div>
        {profileTabs.length > 0 && (
          <LearningStudentRoster
            classId={classId}
            selectedStudentId={selectedStudentId}
            onSelect={onSelectStudent}
            scoreBinFilter={scoreBinFilter}
          />
        )}
      </div>
    </div>
  );
}

function fmtShortDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${m}月${d}日`;
}

function examAvgForClass(exam: ExamEvalSummary, classId: string): number {
  const row = exam.classComparison.find((c) => c.classId === classId);
  return row?.avgScore ?? exam.averageScore;
}

export function ClassProfileDetail({
  id,
  variant = "default",
  onBack,
  scoreBinFilter = null,
  onScoreBinFilterChange,
  onOpenHomeworkEval,
  onOpenExamEval,
}: {
  id: string;
  variant?: "default" | "hub";
  onBack?: () => void;
  /** 学情分析 hub：与右侧名单联动的当前分段；再点同柱在父级取消 */
  scoreBinFilter?: ScoreBinKey | null;
  onScoreBinFilterChange?: (bin: ScoreBinKey) => void;
  /** 跳转到作业评价详情 */
  onOpenHomeworkEval?: (homeworkEvalId: string) => void;
  /** 跳转到考试评价详情 */
  onOpenExamEval?: (examEvalId: string) => void;
}) {
  const recentHomework = useMemo(
    () =>
      homeworksByClass(id)
        .slice()
        .sort((a, b) => b.assignedAt.localeCompare(a.assignedAt))
        .slice(0, 4),
    [id],
  );
  const recentExams = useMemo(
    () =>
      examsByClass(id)
        .slice()
        .sort((a, b) => b.examAt.localeCompare(a.examAt))
        .slice(0, 4),
    [id],
  );

  const profile = classProfiles.find((x) => x.classId === id);
  const cls = classes.find((c) => c.id === id);
  if (!profile || !cls) {
    return (
      <div>
        <PageHeader
          back={variant === "hub" ? undefined : onBack}
          title="班级档案"
        />
        <div className="p-16 text-center text-slate-500">未找到 id 为 {id} 的班级画像。</div>
      </div>
    );
  }
  const teacher = teacherById(cls.headTeacherId);
  const profession = professionById(cls.professionId);
  const risk = isRisk(profile);
  const sd = profile.scoreDistribution;

  const dist = [
    { bin: "<60" as const, count: sd.poor },
    { bin: "60-69" as const, count: sd.medium },
    { bin: "70-84" as const, count: sd.good },
    { bin: "≥85" as const, count: sd.excellent },
  ];
  const hubBarInteractive = variant === "hub" && onScoreBinFilterChange;

  return (
    <div>
      <PageHeader
        back={variant === "hub" ? undefined : onBack}
        title={
          <span>
            {cls.name} · {cls.studentCount} 人 · 班主任 {teacher?.name ?? "—"}
          </span>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50"
            >
              <Download size={14} /> 下载 PDF
            </button>
          </div>
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
          {hubBarInteractive && (
            <p className="text-xs text-slate-400 mb-2">点击柱形快速筛选，再次点击同一分段可取消</p>
          )}
          <div className="h-48">
            <ResponsiveContainer>
              <BarChart data={dist}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="bin" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip />
                {hubBarInteractive ? (
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {dist.map((entry) => {
                      const bin = entry.bin;
                      const isSel = scoreBinFilter === bin;
                      return (
                        <Cell
                          key={bin}
                          fill={SCORE_BIN_BAR_COLORS[bin]}
                          fillOpacity={scoreBinFilter && !isSel ? 0.4 : 1}
                          stroke={isSel ? "#4f46e5" : undefined}
                          strokeWidth={isSel ? 2 : 0}
                          style={{ cursor: "pointer" }}
                          onClick={() => onScoreBinFilterChange?.(bin)}
                        />
                      );
                    })}
                  </Bar>
                ) : (
                  <Bar
                    dataKey="count"
                    fill={risk ? "#f43f5e" : "#6366f1"}
                    radius={[6, 6, 0, 0]}
                  />
                )}
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
        <div className="col-span-12 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col min-h-[10.5rem]">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <div className="text-slate-500 mb-0.5">近期作业</div>
                <p className="text-xs text-slate-400">协同评价 · 最近布置的批次，点击查看详情</p>
              </div>
              <FileCheck size={20} className="text-indigo-500 shrink-0" aria-hidden />
            </div>
            <ul className="space-y-2 min-h-0">
              {recentHomework.length === 0 ? (
                <li className="text-sm text-slate-400 py-4 text-center">暂无作业评价记录</li>
              ) : (
                recentHomework.map((h) => {
                  const course = courseById(h.courseId);
                  const canNav = Boolean(onOpenHomeworkEval);
                  return (
                    <li key={h.id}>
                      {canNav ? (
                        <button
                          type="button"
                          onClick={() => onOpenHomeworkEval?.(h.id)}
                          className="w-full text-left rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5 transition hover:border-indigo-200 hover:bg-indigo-50/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400"
                        >
                          <div className="text-sm font-medium text-slate-900 line-clamp-2">
                            {h.homeworkTitle}
                          </div>
                          <div className="text-xs text-slate-500 mt-1.5">
                            布置 {fmtShortDate(h.assignedAt)} · 均分 {h.averageScore}
                            {course ? ` · ${course.name}` : ""}
                          </div>
                        </button>
                      ) : (
                        <div className="rounded-lg border border-slate-100 bg-slate-50/30 px-3 py-2.5">
                          <div className="text-sm font-medium text-slate-900 line-clamp-2">
                            {h.homeworkTitle}
                          </div>
                          <div className="text-xs text-slate-500 mt-1.5">
                            布置 {fmtShortDate(h.assignedAt)} · 均分 {h.averageScore}
                            {course ? ` · ${course.name}` : ""}
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })
              )}
            </ul>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col min-h-[10.5rem]">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <div className="text-slate-500 mb-0.5">近期考试</div>
                <p className="text-xs text-slate-400">协同评价 · 最近考试场次，点击查看详情</p>
              </div>
              <ClipboardX size={20} className="text-violet-500 shrink-0" aria-hidden />
            </div>
            <ul className="space-y-2 min-h-0">
              {recentExams.length === 0 ? (
                <li className="text-sm text-slate-400 py-4 text-center">暂无考试评价记录</li>
              ) : (
                recentExams.map((e) => {
                  const course = courseById(e.courseId);
                  const canNav = Boolean(onOpenExamEval);
                  const classAvg = examAvgForClass(e, id);
                  return (
                    <li key={e.id}>
                      {canNav ? (
                        <button
                          type="button"
                          onClick={() => onOpenExamEval?.(e.id)}
                          className="w-full text-left rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5 transition hover:border-violet-200 hover:bg-violet-50/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400"
                        >
                          <div className="text-sm font-medium text-slate-900 line-clamp-2">
                            {e.examTitle}
                          </div>
                          <div className="text-xs text-slate-500 mt-1.5">
                            {fmtShortDate(e.examAt)} · 本班均分 {classAvg.toFixed(1)} · 参考{" "}
                            {e.submittedCount}/{e.totalStudents}
                            {course ? ` · ${course.name}` : ""}
                          </div>
                        </button>
                      ) : (
                        <div className="rounded-lg border border-slate-100 bg-slate-50/30 px-3 py-2.5">
                          <div className="text-sm font-medium text-slate-900 line-clamp-2">
                            {e.examTitle}
                          </div>
                          <div className="text-xs text-slate-500 mt-1.5">
                            {fmtShortDate(e.examAt)} · 本班均分 {classAvg.toFixed(1)} · 参考{" "}
                            {e.submittedCount}/{e.totalStudents}
                            {course ? ` · ${course.name}` : ""}
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })
              )}
            </ul>
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
      </div>
    </div>
  );
}
