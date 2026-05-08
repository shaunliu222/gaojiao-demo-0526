import { useMemo, useState } from "react";
import {
  TrendingUp,
  GraduationCap,
  Target,
  Sparkles,
  Heart,
  Trophy,
  AlertTriangle,
  Flame,
  BookOpen,
  Cpu,
  CheckCircle2,
  Clock,
  ChevronRight,
  Route,
  Star,
  FileX2,
  BarChart3,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { nodeById } from "@mock";
import { PageHeader, AiBadge } from "../Layout";
import {
  studentById,
  studentProfileByStudentId,
  classById,
} from "../../data/lookups";
import { colorOfCluster } from "../../data/graphLayout";
import {
  sectionProgressByStudent,
  deviceUsageByStudent,
  learnScenariosByStudent,
  getPlanProgressSummary,
  wrongQuestionsByStudent,
  chapterMasteryByStudent,
  type WrongQuestion,
  type WrongQuestionStatus,
  type ChapterKnowledgeMastery,
  type KnowledgeDomain,
} from "../../data/studentMock";
import { resolveStudentPlanIdForKnowledgeNode } from "../../data/learnCenterSession";

// ======== 三档分类 ========

type Tier = "excellent" | "mid" | "watch";

function tierOfStudent(studentId: string): Tier {
  const p = studentProfileByStudentId(studentId);
  if (!p || p.recentScores.length === 0) return "mid";
  const avg =
    p.recentScores.reduce((s, r) => s + r.score, 0) / p.recentScores.length;
  if (avg >= 85) return "excellent";
  if (avg >= 70) return "mid";
  return "watch";
}

const tierBadge: Record<
  Tier,
  { label: string; bg: string; text: string; icon: React.ElementType }
> = {
  excellent: {
    label: "尖子生",
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-700",
    icon: Trophy,
  },
  mid: {
    label: "中等发展",
    bg: "bg-indigo-50 border-indigo-200",
    text: "text-indigo-700",
    icon: Star,
  },
  watch: {
    label: "需要关注",
    bg: "bg-rose-50 border-rose-200",
    text: "text-rose-700",
    icon: AlertTriangle,
  },
};

function masteryBar(level: number): string {
  if (level >= 85) return "linear-gradient(90deg,#10b981,#34d399)";
  if (level >= 70) return "linear-gradient(90deg,#6366f1,#818cf8)";
  if (level >= 50) return "linear-gradient(90deg,#f59e0b,#fbbf24)";
  return "linear-gradient(90deg,#ef4444,#f87171)";
}

// ======== 主组件 ========

export function MyProfile({
  studentId,
  onGoLearn,
  onGoLearnCenterWrongBook,
  onGoPlans,
}: {
  studentId: string;
  onGoLearn: (presetGoalNodeIds?: string[]) => void;
  onGoLearnCenterWrongBook: (planId: string) => void;
  onGoPlans: () => void;
}) {
  const s = studentById(studentId);
  const p = studentProfileByStudentId(studentId);
  const cls = s ? classById(s.classId) : undefined;
  const tier = tierOfStudent(studentId);
  const TierIcon = tierBadge[tier].icon;

  const trend = useMemo(
    () =>
      (p?.recentScores ?? [])
        .slice()
        .sort((a, b) => a.date.localeCompare(b.date)),
    [p],
  );

  const progressSummary = useMemo(
    () => getPlanProgressSummary(studentId, "plan-main"),
    [studentId],
  );

  const deviceUsage = deviceUsageByStudent[studentId] ?? [];
  const scenarios = learnScenariosByStudent(studentId);
  const wrongQuestions = wrongQuestionsByStudent(studentId);
  const chapterMastery = chapterMasteryByStudent(studentId);

  const weakPoints = useMemo(
    () =>
      (p?.masteryHeatmap ?? [])
        .filter((m) => m.masteryLevel < 70)
        .sort((a, b) => a.masteryLevel - b.masteryLevel),
    [p],
  );
  const strongPoints = useMemo(
    () =>
      (p?.masteryHeatmap ?? [])
        .filter((m) => m.masteryLevel >= 85)
        .sort((a, b) => b.masteryLevel - a.masteryLevel),
    [p],
  );

  // 学习时间线数据
  const timeline = useMemo(
    () => buildTimeline(studentId, scenarios, deviceUsage),
    [studentId, scenarios, deviceUsage],
  );

  const [timelineExpanded, setTimelineExpanded] = useState(false);

  if (!s || !p) {
    return (
      <div>
        <PageHeader title="学情分析" />
        <div className="p-16 text-center text-slate-500">
          暂时还没有生成你的学习画像。完成几次作业后，AI 就会自动生成。
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="学情分析" />

      {/* 顶部横幅 */}
      <div className="px-6 pt-6">
        <div className="rounded-2xl bg-gradient-to-r from-indigo-50 via-violet-50 to-white border border-indigo-100 p-6 flex items-center gap-5">
          <div
            className={`size-16 rounded-2xl flex items-center justify-center text-white text-[1.5rem] ${
              s.gender === "男"
                ? "bg-gradient-to-br from-blue-400 to-indigo-500"
                : "bg-gradient-to-br from-pink-400 to-rose-500"
            }`}
          >
            {s.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-900 text-[1.125rem]">{s.name}</span>
              <span className="text-slate-500">
                {cls?.name} · {s.studentNo}
              </span>
              <span
                className={`px-2 py-0.5 rounded-md border inline-flex items-center gap-1 ${
                  tierBadge[tier].bg
                } ${tierBadge[tier].text}`}
              >
                <TierIcon size={12} /> {tierBadge[tier].label}
              </span>
              <AiBadge>AI 画像 已更新</AiBadge>
            </div>
            <div className="mt-1.5 text-slate-500 text-[0.8125rem] flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1">
                <Flame size={12} /> 学习风格 {p.learningStyle}
              </span>
              <span className="inline-flex items-center gap-1">
                <Heart size={12} /> 课堂活跃度 {p.activity}
              </span>
              <span className="inline-flex items-center gap-1">
                <GraduationCap size={12} /> {s.enrollYear} 级入学
              </span>
              <span className="inline-flex items-center gap-1">
                <TrendingUp size={12} /> 近期均分{" "}
                {trend.length > 0
                  ? Math.round(
                      trend.reduce((a, b) => a + b.score, 0) / trend.length,
                    )
                  : "—"}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={onGoPlans}
              className="px-3 py-2 rounded-lg border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50 inline-flex items-center gap-1.5"
            >
              <BookOpen size={14} /> 我的学习计划
            </button>
          </div>
        </div>
      </div>

      {/* 关键指标 */}
      <div className="px-6 pt-4 grid grid-cols-4 gap-3">
        <KPI
          icon={<CheckCircle2 className="text-emerald-500" size={16} />}
          label="已掌握小节"
          value={`${progressSummary.mastered}/${progressSummary.total}`}
          tone="emerald"
        />
        <KPI
          icon={<Route className="text-indigo-500" size={16} />}
          label="进行中 / 薄弱"
          value={`${progressSummary.inProgress} / ${progressSummary.weak}`}
          tone="indigo"
        />
        <KPI
          icon={<Sparkles className="text-violet-500" size={16} />}
          label="学习场景"
          value={`${scenarios.length} 次 · ${scenarios.reduce(
            (s, v) => s + durationMinutes(v.durationLabel),
            0,
          )} 分钟`}
          tone="violet"
        />
        <KPI
          icon={<Cpu className="text-amber-500" size={16} />}
          label="硬件使用"
          value={`${deviceUsage.length} 台次 · ${deviceUsage.reduce(
            (s, d) => s + d.durationMinutes,
            0,
          )} 分钟`}
          tone="amber"
        />
      </div>

      <div className="p-6 grid grid-cols-12 gap-4">
        {/* 知识掌握程度 */}
        <div className="col-span-12">
          <KnowledgeMasteryPanel chapters={chapterMastery} onGoLearn={onGoLearn} />
        </div>

        {/* 错题本 */}
        <div className="col-span-12">
          <WrongQuestionBook
            studentId={studentId}
            questions={wrongQuestions}
            onGoLearnCenterWrongBook={onGoLearnCenterWrongBook}
          />
        </div>

        {/* 学习历程（默认折叠） */}
        <div className="col-span-12">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <button
              type="button"
              aria-expanded={timelineExpanded}
              onClick={() => setTimelineExpanded((v) => !v)}
              className="flex items-center justify-between gap-2 w-full text-left rounded-lg -m-1 p-1 hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-1.5 text-slate-900 min-w-0">
                <span className="text-indigo-500 inline-flex shrink-0">
                  <Clock size={14} />
                </span>
                <span>学习历程</span>
                {timeline.length > 0 && (
                  <span className="text-slate-400 text-[0.75rem] font-normal truncate">
                    {timeline.length} 条记录
                  </span>
                )}
              </div>
              {timelineExpanded ? (
                <ChevronUp size={16} className="text-slate-400 shrink-0" />
              ) : (
                <ChevronDown size={16} className="text-slate-400 shrink-0" />
              )}
            </button>
            {timelineExpanded && (
              <div className="mt-3">
                {timeline.length === 0 ? (
                  <div className="text-slate-400 text-[0.8125rem] text-center py-6">
                    暂无学习历程记录
                  </div>
                ) : (
                  <ol className="relative border-l-2 border-slate-100 ml-3">
                    {timeline.map((e, idx) => (
                      <li key={idx} className="pl-5 pb-4 relative last:pb-0">
                        <span
                          className={`absolute -left-[9px] top-0 size-4 rounded-full flex items-center justify-center ${e.dotBg} ${e.dotText}`}
                        >
                          <e.icon size={10} />
                        </span>
                        <div className="text-slate-500 text-[0.6875rem]">
                          {e.date}
                        </div>
                        <div className="text-slate-900">{e.title}</div>
                        <div className="text-slate-500 text-[0.75rem] mt-0.5">
                          {e.detail}
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 学情画像与趋势（靠后展示） */}
        <div className="col-span-4 space-y-4">
          <Card title="AI 学情画像" icon={<Sparkles size={14} />}>
            <p className="text-slate-700 leading-relaxed">
              {p.aiSummary}
            </p>
            <div className="text-slate-400 text-[0.6875rem] mt-2">
              生成于 {p.generatedAt.slice(0, 10)} · 基于最近 3 次作业 +
              学习中心对话流
            </div>
          </Card>

          {p.goodAt.length > 0 && (
            <Card title="我擅长" icon={<Trophy size={14} />}>
              <div className="flex flex-wrap gap-1.5">
                {p.goodAt.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
              {strongPoints.length > 0 && (
                <>
                  <div className="text-slate-500 mt-3 mb-1.5 text-[0.75rem]">
                    优势知识点
                  </div>
                  <ul className="space-y-1">
                    {strongPoints.slice(0, 3).map((m) => (
                      <li
                        key={m.knowledgePointId}
                        className="text-slate-700 flex items-center justify-between"
                      >
                        <span>{m.knowledgePointName}</span>
                        <span className="text-emerald-600">
                          {m.masteryLevel}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Card>
          )}

          {p.interests.length > 0 && (
            <Card title="我感兴趣" icon={<Heart size={14} />}>
              <div className="flex flex-wrap gap-1.5">
                {p.interests.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="col-span-8 space-y-4">
          <Card
            title="近期分数趋势"
            icon={<TrendingUp size={14} />}
            extra={`${trend.length} 次`}
          >
            <div className="h-48">
              <ResponsiveContainer>
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                  />
                  <YAxis
                    domain={[40, 100]}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                  />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fill="url(#scoreGradient)"
                    dot={{ r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {trend.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2 text-[0.75rem]">
                {trend.map((t) => (
                  <div
                    key={t.date}
                    className="p-2 rounded-lg bg-slate-50 border border-slate-100"
                  >
                    <div className="text-slate-500 truncate">{t.taskName}</div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-slate-400 text-[0.6875rem]">
                        {t.date.slice(5)}
                      </span>
                      <span
                        className={
                          t.score >= 85
                            ? "text-emerald-700"
                            : t.score >= 70
                            ? "text-indigo-700"
                            : t.score >= 60
                            ? "text-amber-700"
                            : "text-rose-700"
                        }
                      >
                        {t.score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="知识点掌握热力图" icon={<Target size={14} />}>
            <div className="grid grid-cols-2 gap-2">
              {p.masteryHeatmap.map((m) => {
                const node = nodeById[m.knowledgePointId];
                const color = node ? colorOfCluster(node.cluster) : "#94a3b8";
                return (
                  <button
                    key={m.knowledgePointId}
                    onClick={() => onGoLearn([m.knowledgePointId])}
                    className="text-left flex items-center gap-3 p-2 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50/40 transition"
                  >
                    <span
                      className="size-2.5 rounded-full shrink-0"
                      style={{ background: color }}
                    />
                    <span className="flex-1 text-slate-800 truncate">
                      {m.knowledgePointName}
                      {node && (
                        <span className="text-slate-400 ml-1 text-[0.6875rem]">
                          · {node.cluster}
                        </span>
                      )}
                    </span>
                    <div className="w-28 h-3.5 bg-slate-100 rounded overflow-hidden">
                      <div
                        className="h-full"
                        style={{
                          width: `${m.masteryLevel}%`,
                          background: masteryBar(m.masteryLevel),
                        }}
                      />
                    </div>
                    <span
                      className={`w-8 text-right ${
                        m.masteryLevel >= 85
                          ? "text-emerald-700"
                          : m.masteryLevel >= 70
                          ? "text-indigo-700"
                          : m.masteryLevel >= 50
                          ? "text-amber-700"
                          : "text-rose-700"
                      }`}
                    >
                      {m.masteryLevel}
                    </span>
                  </button>
                );
              })}
            </div>
            {weakPoints.length > 0 && (
              <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 flex gap-2 text-[0.8125rem]">
                <AlertTriangle size={14} className="text-rose-500 mt-0.5 shrink-0" />
                <div className="flex-1 text-rose-800">
                  AI 诊断：你还有{" "}
                  <b>
                    {weakPoints.length} 个薄弱知识点
                  </b>{" "}
                  需要加强。点击任意知识点即可跳到学习中心继续学。
                </div>
                <button
                  onClick={() =>
                    onGoLearn(
                      weakPoints.slice(0, 2).map((w) => w.knowledgePointId),
                    )
                  }
                  className="shrink-0 px-2 py-1 rounded-md bg-rose-600 text-white hover:bg-rose-700 text-[0.75rem] inline-flex items-center gap-1"
                >
                  立即补学 <ChevronRight size={12} />
                </button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ======== 子组件 ========

function KPI({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "emerald" | "indigo" | "violet" | "amber";
}) {
  const bg = {
    emerald: "bg-emerald-50 border-emerald-100",
    indigo: "bg-indigo-50 border-indigo-100",
    violet: "bg-violet-50 border-violet-100",
    amber: "bg-amber-50 border-amber-100",
  }[tone];
  return (
    <div className={`rounded-xl border p-4 flex items-center gap-3 ${bg}`}>
      <div className="size-10 rounded-lg bg-white flex items-center justify-center">
        {icon}
      </div>
      <div>
        <div className="text-slate-500 text-[0.75rem]">{label}</div>
        <div className="text-slate-900">{value}</div>
      </div>
    </div>
  );
}

function Card({
  title,
  icon,
  extra,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-slate-900">
          {icon && (
            <span className="text-indigo-500 inline-flex">{icon}</span>
          )}
          <span>{title}</span>
        </div>
        {extra && (
          <span className="text-slate-500 text-[0.75rem]">{extra}</span>
        )}
      </div>
      {children}
    </div>
  );
}

// ======== 时间线构建 ========

type TimelineEntry = {
  date: string;
  title: string;
  detail: string;
  icon: React.ElementType;
  dotBg: string;
  dotText: string;
};

function buildTimeline(
  studentId: string,
  scenarios: ReturnType<typeof learnScenariosByStudent>,
  deviceUsage: ReturnType<(typeof deviceUsageByStudent)["s-mech2301-01"]>,
): TimelineEntry[] {
  const entries: TimelineEntry[] = [];

  // 近期学习场景
  scenarios.slice(0, 5).forEach((s) => {
    const axis =
      s.studyAxis === "teacher_class_follow"
        ? "跟堂讲义"
        : s.remediationSource === "wrong_book"
          ? "错题重练"
          : s.remediationSource === "exam"
            ? "考后巩固"
            : s.remediationSource === "homework"
              ? "作业延伸"
              : "个性重排";
    entries.push({
      date: s.startedAt.slice(0, 10),
      title: `${axis} · ${s.title}`,
      detail: `${s.durationLabel}${s.axisNote ? ` · ${s.axisNote}` : ""} · 产物 ${s.outputs.length} 个 · 掌握检查 ${s.masteryCheck.filter((c) => c.ok).length}/${s.masteryCheck.length}`,
      icon: Sparkles,
      dotBg: "bg-indigo-500",
      dotText: "text-white",
    });
  });

  // 硬件使用
  deviceUsage.slice(0, 5).forEach((u) => {
    entries.push({
      date: u.startedAt.slice(0, 10),
      title: `使用设备 · ${u.task}`,
      detail: `${u.durationMinutes} 分钟${u.score !== undefined ? ` · AI 评分 ${u.score}` : ""}`,
      icon: Cpu,
      dotBg: "bg-amber-500",
      dotText: "text-white",
    });
  });

  // 小节进度里的高光（已掌握 / 薄弱）
  const sectionList = sectionProgressByStudent[studentId]?.["plan-main"] ?? [];
  const notable = sectionList.filter((s) => !!s.note).slice(0, 3);
  notable.forEach((s) => {
    entries.push({
      date: s.lastStudiedAt ?? "2026-01-01",
      title: `AI 提醒 · ${s.sectionId}`,
      detail: s.note ?? "",
      icon: s.status === "weak" ? AlertTriangle : Star,
      dotBg: s.status === "weak" ? "bg-rose-500" : "bg-emerald-500",
      dotText: "text-white",
    });
  });

  entries.sort((a, b) => b.date.localeCompare(a.date));
  return entries.slice(0, 8);
}

// ======== 知识掌握程度面板 ========

const domainConfig: Record<KnowledgeDomain, { label: string; bar: string; text: string; badge: string }> = {
  掌握: { label: "掌握", bar: "linear-gradient(90deg,#10b981,#34d399)", text: "text-emerald-700", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  基本掌握: { label: "基本掌握", bar: "linear-gradient(90deg,#6366f1,#818cf8)", text: "text-indigo-700", badge: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  待加强: { label: "待加强", bar: "linear-gradient(90deg,#f59e0b,#fbbf24)", text: "text-amber-700", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  薄弱: { label: "薄弱", bar: "linear-gradient(90deg,#ef4444,#f87171)", text: "text-rose-700", badge: "bg-rose-50 text-rose-700 border-rose-200" },
  未学习: { label: "未学习", bar: "#e2e8f0", text: "text-slate-400", badge: "bg-slate-50 text-slate-400 border-slate-200" },
};

function KnowledgeMasteryPanel({
  chapters,
  onGoLearn,
}: {
  chapters: ChapterKnowledgeMastery[];
  onGoLearn: (nodeIds?: string[]) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const studied = chapters.filter((c) => c.domain !== "未学习");
  const avgMastery = studied.length
    ? Math.round(studied.reduce((s, c) => s + c.overallMastery, 0) / studied.length)
    : 0;

  const weakestPoints = chapters
    .flatMap((c) => c.points)
    .filter((p) => p.mastery > 0 && p.mastery < 72)
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, 3);

  return (
    <Card title="知识掌握程度" icon={<BarChart3 size={14} />}
      extra={
        <span className="text-slate-500 text-[0.75rem]">
          已学 {studied.length}/{chapters.length} 章 · 综合掌握 {avgMastery}%
        </span>
      }
    >
      {/* 总览雷达条 */}
      <div className="space-y-2 mb-4">
        {chapters.map((ch) => {
          const cfg = domainConfig[ch.domain];
          const expanded = expandedId === ch.chapterId;
          return (
            <div key={ch.chapterId} className="rounded-xl border border-slate-100 overflow-hidden">
              <button
                onClick={() => setExpandedId(expanded ? null : ch.chapterId)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition"
              >
                <span className="w-44 text-left text-slate-800 truncate text-[0.8125rem]">
                  {ch.chapterName}
                </span>
                <span className={`px-1.5 py-0.5 rounded border text-[0.6875rem] shrink-0 ${cfg.badge}`}>
                  {cfg.label}
                </span>
                <div className="flex-1 h-3 bg-slate-100 rounded overflow-hidden">
                  <div
                    className="h-full rounded transition-all"
                    style={{
                      width: `${ch.overallMastery}%`,
                      background: cfg.bar,
                    }}
                  />
                </div>
                <span className={`w-10 text-right text-[0.8125rem] shrink-0 ${cfg.text}`}>
                  {ch.overallMastery > 0 ? `${ch.overallMastery}%` : "—"}
                </span>
                {expanded ? (
                  <ChevronUp size={14} className="text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown size={14} className="text-slate-400 shrink-0" />
                )}
              </button>
              {expanded && (
                <div className="px-4 pb-3 pt-1 bg-slate-50/60 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {ch.points.map((pt) => {
                      const pcfg = domainConfig[pt.domain];
                      return (
                        <button
                          key={pt.id}
                          onClick={() => onGoLearn([pt.id])}
                          className="text-left flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 transition"
                        >
                          <span className="flex-1 text-slate-700 text-[0.8125rem] truncate">{pt.name}</span>
                          <span className={`text-[0.6875rem] px-1.5 py-0.5 rounded border shrink-0 ${pcfg.badge}`}>
                            {pcfg.label}
                          </span>
                          <div className="w-20 h-2.5 bg-slate-100 rounded overflow-hidden shrink-0">
                            <div
                              className="h-full rounded"
                              style={{ width: `${pt.mastery}%`, background: pcfg.bar }}
                            />
                          </div>
                          <span className={`w-8 text-right text-[0.75rem] shrink-0 ${pcfg.text}`}>
                            {pt.mastery > 0 ? `${pt.mastery}` : "—"}
                          </span>
                          {pt.wrongCount > 0 && (
                            <span className="px-1 py-0.5 rounded bg-rose-50 text-rose-600 text-[0.625rem] border border-rose-100 shrink-0">
                              错 {pt.wrongCount}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* AI 推荐 */}
      {weakestPoints.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex gap-2 text-[0.8125rem]">
          <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
          <div className="flex-1 text-amber-800">
            AI 建议优先攻克：
            {weakestPoints.map((p, i) => (
              <span key={p.id}>
                {i > 0 && "、"}
                <button
                  onClick={() => onGoLearn([p.id])}
                  className="underline underline-offset-2 hover:text-amber-900"
                >
                  {p.name}（{p.mastery}%）
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

// ======== 错题本 ========

const wqStatusConfig: Record<WrongQuestionStatus, { label: string; badge: string }> = {
  unreviewed: { label: "未复习", badge: "bg-rose-50 text-rose-700 border-rose-200" },
  reviewing: { label: "复习中", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  mastered: { label: "已掌握", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

const wqTypeColor: Record<string, string> = {
  选择题: "bg-indigo-50 text-indigo-600 border-indigo-100",
  判断题: "bg-violet-50 text-violet-600 border-violet-100",
  填空题: "bg-sky-50 text-sky-600 border-sky-100",
  作图题: "bg-orange-50 text-orange-600 border-orange-100",
  简答题: "bg-teal-50 text-teal-600 border-teal-100",
};

function WrongQuestionBook({
  studentId,
  questions,
  onGoLearnCenterWrongBook,
}: {
  studentId: string;
  questions: WrongQuestion[];
  onGoLearnCenterWrongBook: (planId: string) => void;
}) {
  const [activeStatus, setActiveStatus] = useState<WrongQuestionStatus | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = activeStatus === "all" ? questions : questions.filter((q) => q.status === activeStatus);
  const counts = {
    all: questions.length,
    unreviewed: questions.filter((q) => q.status === "unreviewed").length,
    reviewing: questions.filter((q) => q.status === "reviewing").length,
    mastered: questions.filter((q) => q.status === "mastered").length,
  };

  const tabs: Array<{ key: WrongQuestionStatus | "all"; label: string }> = [
    { key: "all", label: "全部" },
    { key: "unreviewed", label: "未复习" },
    { key: "reviewing", label: "复习中" },
    { key: "mastered", label: "已掌握" },
  ];

  return (
    <Card
      title="错题本"
      icon={<FileX2 size={14} />}
      extra={
        <span className="text-slate-500 text-[0.75rem]">
          共 {counts.all} 题 · 未复习 {counts.unreviewed} 题
        </span>
      }
    >
      {questions.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-[0.8125rem]">
          暂无错题记录，继续加油！
        </div>
      ) : (
        <>
          {/* 分类 Tab */}
          <div className="flex gap-2 mb-4">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveStatus(t.key)}
                className={`px-3 py-1 rounded-lg border text-[0.8125rem] transition ${
                  activeStatus === t.key
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50"
                }`}
              >
                {t.label}
                <span
                  className={`ml-1.5 px-1.5 py-0.5 rounded text-[0.625rem] ${
                    activeStatus === t.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {counts[t.key]}
                </span>
              </button>
            ))}
          </div>

          {/* 错题列表 */}
          <div className="space-y-2">
            {filtered.map((q) => {
              const scfg = wqStatusConfig[q.status];
              const tcfg = wqTypeColor[q.questionType] ?? "bg-slate-50 text-slate-500 border-slate-100";
              const expanded = expandedId === q.id;
              return (
                <div key={q.id} className={`rounded-xl border transition ${
                  q.status === "unreviewed" ? "border-rose-100 bg-rose-50/30" :
                  q.status === "reviewing" ? "border-amber-100 bg-amber-50/30" :
                  "border-emerald-100 bg-emerald-50/10"
                }`}>
                  <button
                    onClick={() => setExpandedId(expanded ? null : q.id)}
                    className="w-full flex items-start gap-3 px-4 py-3 text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`px-1.5 py-0.5 rounded border text-[0.6875rem] shrink-0 ${tcfg}`}>
                          {q.questionType}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded border text-[0.6875rem] shrink-0 ${scfg.badge}`}>
                          {scfg.label}
                        </span>
                        <span className="text-slate-400 text-[0.6875rem] shrink-0">
                          {q.source} · {q.occurredAt.slice(5)}
                        </span>
                        {q.wrongCount > 1 && (
                          <span className="text-rose-500 text-[0.6875rem] shrink-0">
                            已错 {q.wrongCount} 次
                          </span>
                        )}
                      </div>
                      <div className="text-slate-800 text-[0.8125rem] line-clamp-2 leading-relaxed">
                        {q.questionContent}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                      <span className="text-slate-400 text-[0.6875rem] px-1.5 py-0.5 rounded bg-white border border-slate-100">
                        {q.knowledgePointName}
                      </span>
                      {expanded ? (
                        <ChevronUp size={14} className="text-slate-400" />
                      ) : (
                        <ChevronDown size={14} className="text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* 展开：错误答案 → 正确答案 → 解析 → AI 诊断 */}
                  {expanded && (
                    <div className="px-4 pb-4 space-y-3 border-t border-slate-100/80 pt-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-rose-50 border border-rose-100 p-3">
                          <div className="text-rose-500 text-[0.6875rem] mb-1">我的错误答案</div>
                          <div className="text-rose-800 text-[0.8125rem] leading-relaxed">{q.wrongAnswer}</div>
                        </div>
                        <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3">
                          <div className="text-emerald-600 text-[0.6875rem] mb-1">正确答案</div>
                          <div className="text-emerald-800 text-[0.8125rem] leading-relaxed">{q.correctAnswer}</div>
                        </div>
                      </div>
                      <div className="rounded-lg bg-indigo-50/60 border border-indigo-100 p-3">
                        <div className="text-indigo-500 text-[0.6875rem] mb-1">解析</div>
                        <div className="text-slate-700 text-[0.8125rem] leading-relaxed">{q.explanation}</div>
                      </div>
                      <div className="rounded-lg bg-violet-50/60 border border-violet-100 p-3 flex gap-2">
                        <Sparkles size={13} className="text-violet-500 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-violet-600 text-[0.6875rem] mb-0.5">AI 错因诊断</div>
                          <div className="text-slate-700 text-[0.8125rem] leading-relaxed">{q.aiDiagnosis}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const planId = resolveStudentPlanIdForKnowledgeNode(
                              studentId,
                              q.knowledgePointId,
                            );
                            if (planId) onGoLearnCenterWrongBook(planId);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[0.75rem] inline-flex items-center gap-1 hover:bg-indigo-700"
                        >
                          <BookOpen size={12} /> 在学中心打开本题库错题本
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </Card>
  );
}

// 把 "28 分" / "1 小时 48 分" / "45 分钟" 等标签粗略换成分钟
function durationMinutes(label: string): number {
  const hMatch = label.match(/(\d+)\s*小时/);
  const mMatch = label.match(/(\d+)\s*分/);
  const h = hMatch ? parseInt(hMatch[1]!, 10) : 0;
  const m = mMatch ? parseInt(mMatch[1]!, 10) : 0;
  return h * 60 + m;
}
