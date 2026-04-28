import { useMemo, useState } from "react";
import {
  Plus,
  BookMarked,
  Sparkles,
  Target,
  Clock,
  Flag,
  Wand2,
  CheckCircle2,
  Circle,
  AlertTriangle,
  ChevronRight,
  Route,
  X,
  Trophy,
  User,
} from "lucide-react";
import { teachingPlans } from "@mock";
import type { TeachingPlan } from "@mock";
import { PageHeader, AiBadge } from "../Layout";
import { PlanKnowledgePathPreview } from "../PlanKnowledgePathPreview";
import {
  classById,
  studentById,
  teacherById,
  courseById,
  graphNodeById,
  studentProfileByStudentId,
} from "../../data/lookups";
import {
  personalPlansByStudent,
  personalPlanById,
  getSectionProgress,
  getPlanProgressSummary,
  trainingAssignmentForPlanSection,
  SectionProgress,
  SectionProgressStatus,
} from "../../data/studentMock";

/** 学习计划「去学习」入口：课程小节带 planId+sectionId；个人计划可仅传 goalNodeIds */
export interface StudentLearnNavigateInput {
  planId?: string;
  sectionId?: string;
  goalNodeIds?: string[];
}

// ============ 颜色映射 ============

const statusPalette: Record<
  SectionProgressStatus,
  { bg: string; border: string; dot: string; text: string; label: string }
> = {
  mastered: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    label: "已掌握",
  },
  in_progress: {
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    dot: "bg-indigo-500",
    text: "text-indigo-700",
    label: "进行中",
  },
  pending: {
    bg: "bg-slate-50",
    border: "border-slate-200",
    dot: "bg-slate-300",
    text: "text-slate-600",
    label: "未开始",
  },
  weak: {
    bg: "bg-rose-50",
    border: "border-rose-200",
    dot: "bg-rose-500",
    text: "text-rose-700",
    label: "薄弱点",
  },
};

function difficultyTone(d: "入门" | "进阶" | "综合") {
  if (d === "入门") return "bg-emerald-50 text-emerald-700";
  if (d === "进阶") return "bg-amber-50 text-amber-700";
  return "bg-rose-50 text-rose-700";
}

// ============ 列表页 ============

export function MyPlansList({
  studentId,
  onOpen,
  onGoLearn,
}: {
  studentId: string;
  onOpen: (id: string, kind: "course" | "personal") => void;
  onGoLearn: (opts?: StudentLearnNavigateInput) => void;
}) {
  const student = studentById(studentId);
  const myClassId = student?.classId;
  const coursePlans: TeachingPlan[] = useMemo(
    () =>
      myClassId
        ? teachingPlans.filter(
            (p) =>
              p.classIds.includes(myClassId) &&
              (p.status === "in_progress" || p.status === "draft"),
          )
        : [],
    [myClassId],
  );
  const historyPlans: TeachingPlan[] = useMemo(
    () =>
      myClassId
        ? teachingPlans.filter(
            (p) =>
              p.classIds.includes(myClassId) && p.status === "completed",
          )
        : [],
    [myClassId],
  );
  const personalPlans = useMemo(
    () => personalPlansByStudent(studentId),
    [studentId],
  );

  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <div>
      <PageHeader
        title="学习计划"
        actions={
          <button
            onClick={() => setWizardOpen(true)}
            className="inline-flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700"
          >
            <Plus size={14} /> 创建个人学习计划
          </button>
        }
      />
      <div className="p-6 space-y-6">
        {/* 顶部概览 */}
        <div className="bg-gradient-to-r from-indigo-50 via-violet-50 to-white border border-indigo-100 rounded-2xl p-5 flex items-center gap-4">
          <div className="size-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <BookMarked size={22} />
          </div>
          <div className="flex-1">
            <div className="text-slate-900 flex items-center gap-2">
              <span>欢迎回来，{student?.name ?? "同学"}</span>
              <AiBadge>AI 为你组装课表</AiBadge>
            </div>
            <div className="text-slate-500 mt-0.5">
              共 {coursePlans.length} 门课程计划 · {personalPlans.length} 个自建学习计划
              {historyPlans.length > 0 && ` · ${historyPlans.length} 个历史计划`}
            </div>
          </div>
          <button
            onClick={() => onGoLearn()}
            className="px-3 py-2 rounded-lg border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50 inline-flex items-center gap-1.5"
          >
            <Sparkles size={14} /> 去学习中心
          </button>
        </div>

        {/* 课程学习计划 */}
        <Section
          title="课程学习计划"
          tip="由任课老师创建，你只能查看并按自己的进度学习"
        >
          {coursePlans.length === 0 ? (
            <EmptyHint>老师还没有为你所在班级发布课程计划。</EmptyHint>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {coursePlans.map((p) => (
                <CoursePlanCard
                  key={p.id}
                  plan={p}
                  studentId={studentId}
                  onOpen={() => onOpen(p.id, "course")}
                />
              ))}
            </div>
          )}
        </Section>

        {/* 个人学习计划 */}
        <Section
          title="个人学习计划"
          tip="你自己或 AI 为你生成的短线学习目标，可随时调整"
        >
          {personalPlans.length === 0 ? (
            <EmptyHint>
              还没有个人学习计划，点右上角「创建个人学习计划」让 AI 给你搭一个。
            </EmptyHint>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {personalPlans.map((p) => (
                <PersonalPlanCard
                  key={p.id}
                  plan={p}
                  onOpen={() => onOpen(p.id, "personal")}
                />
              ))}
            </div>
          )}
        </Section>

        {historyPlans.length > 0 && (
          <Section title="历史计划" tip="已结束的学期课程，仅供回顾">
            <div className="grid grid-cols-2 gap-4">
              {historyPlans.map((p) => (
                <CoursePlanCard
                  key={p.id}
                  plan={p}
                  studentId={studentId}
                  onOpen={() => onOpen(p.id, "course")}
                />
              ))}
            </div>
          </Section>
        )}
      </div>

      {wizardOpen && (
        <PlanWizardModal
          studentId={studentId}
          onClose={() => setWizardOpen(false)}
        />
      )}
    </div>
  );
}

function Section({
  title,
  tip,
  children,
}: {
  title: string;
  tip?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-end justify-between mb-3">
        <div>
          <h2 className="text-slate-900 text-[0.9375rem]">{title}</h2>
          {tip && <div className="text-slate-400 text-[0.75rem] mt-0.5">{tip}</div>}
        </div>
      </div>
      {children}
    </section>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400">
      {children}
    </div>
  );
}

function CoursePlanCard({
  plan,
  studentId,
  onOpen,
}: {
  plan: TeachingPlan;
  studentId: string;
  onOpen: () => void;
}) {
  const course = courseById(plan.courseId);
  const teacher = teacherById(plan.creatorTeacherId);
  const cls = plan.classIds.map((cid) => classById(cid)?.name ?? cid).join("、");
  const summary = getPlanProgressSummary(studentId, plan.id);
  const total = summary.total || 0;
  const masteredPct = total > 0 ? Math.round((summary.mastered / total) * 100) : 0;
  const inProgressPct =
    total > 0 ? Math.round((summary.inProgress / total) * 100) : 0;
  const weakPct = total > 0 ? Math.round((summary.weak / total) * 100) : 0;
  const pendingPct =
    100 - masteredPct - inProgressPct - weakPct;

  return (
    <button
      onClick={onOpen}
      className="text-left bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-indigo-300 transition"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-slate-900">
            《{course?.name ?? plan.courseId}》
          </div>
          <div className="text-slate-500 mt-0.5">
            {plan.semester} · {cls}
          </div>
        </div>
        {plan.status === "completed" ? (
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
            已结业
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
            进行中
          </span>
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span>我的进度</span>
          <span>
            已掌握 {summary.mastered}/{total}
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden bg-slate-100 flex">
          <div
            className="h-full bg-emerald-500"
            style={{ width: `${masteredPct}%` }}
          />
          <div
            className="h-full bg-indigo-500"
            style={{ width: `${inProgressPct}%` }}
          />
          <div
            className="h-full bg-rose-500"
            style={{ width: `${weakPct}%` }}
          />
          <div
            className="h-full bg-slate-200"
            style={{ width: `${pendingPct}%` }}
          />
        </div>
        <div className="flex items-center gap-3 text-slate-500 mt-1.5 text-[0.75rem]">
          <span className="inline-flex items-center gap-1">
            <Legend color="bg-emerald-500" /> 已掌握
          </span>
          <span className="inline-flex items-center gap-1">
            <Legend color="bg-indigo-500" /> 进行中
          </span>
          {summary.weak > 0 && (
            <span className="inline-flex items-center gap-1 text-rose-600">
              <Legend color="bg-rose-500" /> 薄弱 {summary.weak}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 text-slate-500">
        <span className="inline-flex items-center gap-1">
          <User size={12} /> {teacher?.name ?? "—"}
        </span>
        <span className="inline-flex items-center gap-1 text-indigo-700">
          查看我的学习路径 <ChevronRight size={14} />
        </span>
      </div>
    </button>
  );
}

function Legend({ color }: { color: string }) {
  return <span className={`size-2 rounded-full ${color}`} />;
}

function PersonalPlanCard({
  plan,
  onOpen,
}: {
  plan: ReturnType<typeof personalPlanById>;
  onOpen: () => void;
}) {
  if (!plan) return null;
  const pct = Math.round(plan.progress * 100);
  return (
    <button
      onClick={onOpen}
      className="text-left bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-indigo-300 transition flex flex-col"
    >
      <div className="flex items-center gap-2 flex-wrap">
        <AiBadge>AI 自建</AiBadge>
        <span
          className={`px-2 py-0.5 rounded-md ${difficultyTone(plan.difficulty)}`}
        >
          {plan.difficulty}
        </span>
        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 inline-flex items-center gap-1">
          <Clock size={12} /> {plan.durationLabel}
        </span>
      </div>
      <div className="text-slate-900 mt-3">{plan.title}</div>
      <p className="text-slate-500 line-clamp-2 mt-1 text-[0.8125rem] leading-relaxed">
        {plan.goal}
      </p>

      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between text-slate-500 mb-1">
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
    </button>
  );
}

// ============ 详情页 ============

export function MyPlanDetail({
  studentId,
  id,
  kind,
  onBack,
  onGoLearn,
  onGoTraining,
}: {
  studentId: string;
  id: string;
  kind: "course" | "personal";
  onBack: () => void;
  onGoLearn: (opts?: StudentLearnNavigateInput) => void;
  onGoTraining?: (assignmentId: string) => void;
}) {
  if (kind === "course") {
    return (
      <CoursePlanDetail
        studentId={studentId}
        planId={id}
        onBack={onBack}
        onGoLearn={onGoLearn}
        onGoTraining={onGoTraining}
      />
    );
  }
  return (
    <PersonalPlanDetail
      personalPlanId={id}
      onBack={onBack}
      onGoLearn={onGoLearn}
    />
  );
}

function CoursePlanDetail({
  studentId,
  planId,
  onBack,
  onGoLearn,
  onGoTraining,
}: {
  studentId: string;
  planId: string;
  onBack: () => void;
  onGoLearn: (opts?: StudentLearnNavigateInput) => void;
  onGoTraining?: (assignmentId: string) => void;
}) {
  const plan = teachingPlans.find((p) => p.id === planId);
  const [showAdjustTip, setShowAdjustTip] = useState(false);
  const graphPlanIds = useMemo(() => [planId], [planId]);

  if (!plan) {
    return (
      <div>
        <PageHeader back={onBack} title="课程计划" />
        <div className="p-16 text-center text-slate-500">未找到计划</div>
      </div>
    );
  }

  const course = courseById(plan.courseId);
  const teacher = teacherById(plan.creatorTeacherId);
  const summary = getPlanProgressSummary(studentId, planId);

  return (
    <div>
      <PageHeader
        back={onBack}
        title={
          <span>
            《{course?.name ?? plan.courseId}》· 我的学习路径
          </span>
        }
        actions={
          <button
            onClick={() => setShowAdjustTip(true)}
            className="px-3 py-1.5 rounded-md bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:opacity-90 inline-flex items-center gap-1"
          >
            <Wand2 size={14} /> 按我的节奏调整
          </button>
        }
      />

      {showAdjustTip && (
        <div className="mx-6 mt-4 bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex gap-3">
          <div className="size-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Sparkles size={16} />
          </div>
          <div className="flex-1">
            <div className="text-indigo-900">
              已为你生成个性化学习路径（AI 建议）
            </div>
            <div className="text-indigo-700 mt-1 text-[0.8125rem]">
              不改动老师的主计划，只在你的视图上调整节奏：把薄弱的投影阶段提前复盘，把已掌握的小节折叠。进入课堂学习后每个小节都可以继续微调。
            </div>
          </div>
          <button
            onClick={() => setShowAdjustTip(false)}
            className="text-indigo-400 hover:text-indigo-700 shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="px-6 pt-2">
        <PlanKnowledgePathPreview
          planIds={graphPlanIds}
          variant="student"
          layout="detail"
        />
      </div>

      <div className="px-6 pt-4">
        <div className="grid grid-cols-4 gap-3">
          <Metric
            icon={<Trophy className="text-emerald-500" size={16} />}
            label="已掌握"
            value={`${summary.mastered}/${summary.total}`}
            tone="emerald"
          />
          <Metric
            icon={<Route className="text-indigo-500" size={16} />}
            label="进行中"
            value={String(summary.inProgress)}
            tone="indigo"
          />
          <Metric
            icon={<AlertTriangle className="text-rose-500" size={16} />}
            label="薄弱"
            value={String(summary.weak)}
            tone="rose"
          />
          <Metric
            icon={<Circle className="text-slate-400" size={16} />}
            label="未开始"
            value={String(summary.pending)}
            tone="slate"
          />
        </div>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
          <div className="flex items-center gap-2 text-slate-900">
            <Flag size={16} className="text-indigo-500" />
            <span>主讲教师 · {teacher?.name ?? "—"}</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-500">{plan.semester}</span>
          </div>
          <p className="text-slate-700 leading-relaxed mt-2">
            {plan.strategyBrief}
          </p>
        </div>

        <div className="space-y-4">
          <div className="text-slate-500">
            点击任一小节 → 进入「课堂壳」围绕本节资源学习；若本节有派发实训，可点「本节实训」进入工作台。
          </div>
          {plan.chapters.map((ch) => (
            <div
              key={ch.id}
              className="bg-white rounded-xl border border-slate-200 p-4"
            >
              <div className="text-slate-900 mb-3 flex items-center gap-2">
                {ch.title}
              </div>
              {ch.summary && (
                <div className="text-slate-500 mb-3">{ch.summary}</div>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                {ch.sections.map((s, i) => {
                  const prog = getSectionProgress(studentId, planId, s.id);
                  const status: SectionProgressStatus = prog?.status ?? "pending";
                  const palette = statusPalette[status];
                  const isFocus = s.id === "sec-3-2";
                  const ta = trainingAssignmentForPlanSection(studentId, planId, s.id);
                  return (
                    <div key={s.id} className="flex items-center flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          onGoLearn({
                            planId,
                            sectionId: s.id,
                            goalNodeIds: s.knowledgeNodeIds,
                          })
                        }
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                          palette.border
                        } ${palette.bg} ${palette.text} ${
                          isFocus ? "ring-2 ring-indigo-100" : ""
                        } hover:shadow-sm`}
                      >
                        <span
                          className={`size-2 rounded-full ${palette.dot}`}
                        />
                        <span>{s.title}</span>
                        {prog?.masteryScore !== undefined &&
                          prog.masteryScore > 0 && (
                            <span className="text-[0.6875rem] opacity-80">
                              {prog.masteryScore}
                            </span>
                          )}
                      </button>
                      {ta && onGoTraining ? (
                        <button
                          type="button"
                          onClick={() => onGoTraining(ta.id)}
                          className="px-2 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-[0.75rem] hover:bg-emerald-100"
                        >
                          本节实训
                        </button>
                      ) : null}
                      {i < ch.sections.length - 1 && (
                        <span className="text-slate-300 mx-1">—</span>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* 章节内带有 note 的小节（AI 提醒） */}
              {ch.sections
                .map((s) => ({
                  s,
                  prog: getSectionProgress(studentId, planId, s.id),
                }))
                .filter((x) => !!x.prog?.note)
                .map(({ s, prog }) => (
                  <div
                    key={`${s.id}-note`}
                    className={`mt-3 rounded-lg px-3 py-2 flex gap-2 text-[0.8125rem] ${
                      prog!.status === "weak"
                        ? "bg-rose-50 border border-rose-200 text-rose-700"
                        : "bg-indigo-50 border border-indigo-200 text-indigo-700"
                    }`}
                  >
                    <Sparkles size={14} className="mt-0.5 shrink-0" />
                    <div>
                      <b className="mr-1">{s.title}：</b>
                      {prog!.note}
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "emerald" | "indigo" | "rose" | "slate";
}) {
  const bg = {
    emerald: "bg-emerald-50",
    indigo: "bg-indigo-50",
    rose: "bg-rose-50",
    slate: "bg-slate-50",
  }[tone];
  return (
    <div className={`rounded-xl ${bg} border border-white p-4 flex gap-3`}>
      <div className="size-10 rounded-lg bg-white flex items-center justify-center">
        {icon}
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-slate-500">{label}</span>
        <span className="text-slate-900">{value}</span>
      </div>
    </div>
  );
}

function PersonalPlanDetail({
  personalPlanId,
  onBack,
  onGoLearn,
}: {
  personalPlanId: string;
  onBack: () => void;
  onGoLearn: (opts?: StudentLearnNavigateInput) => void;
}) {
  const plan = personalPlanById(personalPlanId);
  if (!plan) {
    return (
      <div>
        <PageHeader back={onBack} title="个人学习计划" />
        <div className="p-16 text-center text-slate-500">未找到计划</div>
      </div>
    );
  }
  const pct = Math.round(plan.progress * 100);

  return (
    <div>
      <PageHeader
        back={onBack}
        title={plan.title}
        actions={
          <button
            onClick={() => onGoLearn({ goalNodeIds: plan.knowledgeNodeIds })}
            className="px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 inline-flex items-center gap-1"
          >
            <Sparkles size={14} /> 进入课堂学习
          </button>
        }
      />
      <div className="p-6 grid grid-cols-12 gap-4">
        {/* 左：基础信息 */}
        <div className="col-span-8 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 flex-wrap">
            <AiBadge>AI 自建</AiBadge>
            <span
              className={`px-2 py-0.5 rounded-md ${difficultyTone(plan.difficulty)}`}
            >
              {plan.difficulty}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 inline-flex items-center gap-1">
              <Clock size={12} /> {plan.durationLabel}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
              创建于 {plan.createdAt.slice(0, 10)}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-slate-500">
            <Target size={14} />
            <span>学习目标</span>
          </div>
          <p className="text-slate-800 leading-relaxed mt-1">{plan.goal}</p>

          <div className="mt-4 flex items-center gap-2 text-slate-500">
            <Sparkles size={14} />
            <span>AI 规划理由</span>
          </div>
          <p className="text-slate-700 leading-relaxed mt-1">
            {plan.aiRationale}
          </p>

          <div className="mt-5">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span>进度</span>
              <span>{pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        {/* 右：资源 & 知识点 */}
        <aside className="col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="text-slate-500 mb-2">知识来源</div>
            <div className="flex flex-wrap gap-1.5">
              {plan.sourceTags.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="text-slate-500 mb-2">关联知识点</div>
            <div className="flex flex-wrap gap-1.5">
              {plan.knowledgeNodeIds.map((nid) => {
                const n = graphNodeById(nid);
                return (
                  <span
                    key={nid}
                    className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                  >
                    {n?.name ?? nid}
                  </span>
                );
              })}
            </div>
          </div>
        </aside>

        {/* 下：步骤时间线 */}
        <div className="col-span-12 bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-slate-500 mb-3">学习步骤</div>
          <ol className="relative border-l-2 border-slate-100 ml-3 space-y-4">
            {plan.steps.map((s, idx) => (
              <li key={s.id} className="pl-5 relative">
                <span
                  className={`absolute -left-[11px] top-0.5 size-5 rounded-full flex items-center justify-center ${
                    s.done
                      ? "bg-emerald-500 text-white"
                      : "bg-white border-2 border-slate-200 text-slate-400"
                  }`}
                >
                  {s.done ? <CheckCircle2 size={14} /> : idx + 1}
                </span>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="text-slate-900">{s.title}</div>
                  <div className="flex items-center gap-2 text-slate-500 text-[0.75rem]">
                    <span className="inline-flex items-center gap-1">
                      <Clock size={12} /> {s.minutes} 分钟
                    </span>
                    {s.done ? (
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                        已完成
                      </span>
                    ) : (
                      <button
                        onClick={() => onGoLearn({ goalNodeIds: s.knowledgeNodeIds })}
                        className="px-2 py-0.5 rounded-md border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                      >
                        开始
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {s.knowledgeNodeIds.map((nid) => {
                    const n = graphNodeById(nid);
                    return (
                      <span
                        key={nid}
                        className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[0.6875rem]"
                      >
                        {n?.name ?? nid}
                      </span>
                    );
                  })}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

// ============ 创建个人学习计划向导 ============

function PlanWizardModal({
  studentId,
  onClose,
}: {
  studentId: string;
  onClose: () => void;
}) {
  const profile = studentProfileByStudentId(studentId);
  const [goal, setGoal] = useState(
    profile?.goodAt[0] === "空间想象"
      ? "2 小时搞定相贯线特殊情况"
      : profile
      ? "30 分钟补齐投影基础"
      : "",
  );
  const [duration, setDuration] = useState<"30m" | "1h" | "2h">("1h");
  const [difficulty, setDifficulty] = useState<"入门" | "进阶" | "综合">(
    (profile?.activity === "低" ? "入门" : "进阶") as "入门" | "进阶",
  );

  // 简单地从画像里捞几个知识点作为 AI 推荐
  const recommendedNodeIds = useMemo(() => {
    const pts = profile?.masteryHeatmap ?? [];
    const weak = [...pts].sort((a, b) => a.masteryLevel - b.masteryLevel).slice(0, 3);
    return weak.map((p) => p.knowledgePointId);
  }, [profile]);

  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-40 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-2">
          <div className="size-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <Wand2 size={16} />
          </div>
          <div className="flex-1">
            <div className="text-slate-900">创建个人学习计划</div>
            <div className="text-slate-500 text-[0.75rem]">
              描述你的目标，AI 会结合你的画像给出一条短线路径
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>

        {!submitted ? (
          <div className="p-6 space-y-5">
            <Field label="学习目标">
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 resize-none min-h-[72px]"
                placeholder="比如：周末 2 小时快速上手 SolidWorks 草图"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="时长偏好">
                <div className="flex gap-1.5">
                  {(
                    [
                      { k: "30m", label: "30 分钟" },
                      { k: "1h", label: "1 小时" },
                      { k: "2h", label: "2 小时" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.k}
                      onClick={() => setDuration(opt.k)}
                      className={`px-3 py-1.5 rounded-lg border ${
                        duration === opt.k
                          ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                          : "border-slate-200 text-slate-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="难度偏好">
                <div className="flex gap-1.5">
                  {(["入门", "进阶", "综合"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`px-3 py-1.5 rounded-lg border ${
                        difficulty === d
                          ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                          : "border-slate-200 text-slate-700"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            <Field label="AI 推荐知识点（可增删）">
              <div className="flex flex-wrap gap-1.5">
                {recommendedNodeIds.map((nid) => {
                  const n = graphNodeById(nid);
                  return (
                    <span
                      key={nid}
                      className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 inline-flex items-center gap-1"
                    >
                      <Sparkles size={10} /> {n?.name ?? nid}
                    </span>
                  );
                })}
                {recommendedNodeIds.length === 0 && (
                  <span className="text-slate-400">
                    暂无推荐，提交后 AI 会再次匹配。
                  </span>
                )}
              </div>
            </Field>

            <div className="flex items-center justify-end pt-2 border-t border-slate-100">
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-md border border-slate-200"
                >
                  取消
                </button>
                <button
                  onClick={() => setSubmitted(true)}
                  className="px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 inline-flex items-center gap-1"
                >
                  <Sparkles size={14} /> 让 AI 帮我排课
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 size={18} />
              <span>学习计划已生成预览</span>
            </div>
            <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-4">
              <div className="text-indigo-900 mb-2 flex items-center gap-2">
                <AiBadge>AI 排课</AiBadge>
                <span>{goal || "个人学习计划"}</span>
              </div>
              <ul className="space-y-1.5 text-slate-700">
                <li>① 学前诊断：1 道 2 分钟小测 · 确认真实起点</li>
                <li>
                  ② 主讲段：围绕 {recommendedNodeIds.length} 个目标知识点 · 约{" "}
                  {duration === "30m" ? "18" : duration === "1h" ? "40" : "85"} 分钟
                </li>
                <li>③ AI 互动练习：3 题（含错题反馈）</li>
                <li>④ 学习产物：1 张速查卡 · 1 份要点笔记</li>
              </ul>
              <div className="text-slate-500 mt-2 text-[0.75rem]">
                难度已按「{difficulty}」调整，保存后会出现在你的"个人学习计划"列表里。
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSubmitted(false)}
                className="px-3 py-1.5 rounded-md border border-slate-200"
              >
                再改一改
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
              >
                好的，保存
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-slate-700 mb-1.5">{label}</div>
      {children}
    </div>
  );
}
