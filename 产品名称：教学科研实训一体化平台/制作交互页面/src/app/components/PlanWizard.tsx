import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Clock,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  courses,
  professions,
  subjects,
  teachingPlans,
  teachingStrategies,
} from "@mock";
import type {
  Course,
  TeachingPlan,
  TeachingStrategy,
} from "@mock";
import {
  classById,
  classProfileByClassId,
  graphNodeById,
  professionById,
  teacherById,
} from "../data/lookups";
import { AiBadge, PageHeader } from "./Layout";

/** 向导状态中，策略被教师二次修改后的本地值 */
interface StrategyOverride {
  paceSuggestion: string;
  difficultyCurve: string;
  activitySuggestion: string;
  strategyBrief: string;
}

// 生成过程 · AI 假动画任务清单
// 5 步合计约 3s，每步约 0.5–0.65s，带轻微时长抖动。
const GENERATION_TASKS: Array<{
  title: string;
  detail: string;
  durationMs: number;
}> = [
  {
    title: "解析课程大纲与教学目标",
    detail: "对齐课程描述、学时安排与核心能力要求",
    durationMs: 600,
  },
  {
    title: "对齐教学目标与学时节奏",
    detail: "将学期总学时拆解为历次授课课时，并形成顺序骨架",
    durationMs: 580,
  },
  {
    title: "套用教学策略曲线",
    detail: "按难度曲线与授课节奏分配到各课时",
    durationMs: 600,
  },
  {
    title: "挂载知识点图谱",
    detail: "为每次课推断应覆盖的图谱节点（知识点/课程/实训等）与时序匹配",
    durationMs: 610,
  },
  {
    title: "推算授课日程",
    detail: "按学期日历与各课时时长自动铺排计划日期",
    durationMs: 610,
  },
];

/** 向导本地骨架（预览步可编辑） */
interface DraftSection {
  id: string;
  title: string;
  plannedDate: string;
  durationMinutes: number;
  /** 关联图谱节点 id（预览中展示挂载情况） */
  knowledgeNodeIds: string[];
  /** AI 基于学情对此小节的调整说明（用于展示紫色徽标），可为空 */
  aiAdjustment?: string;
}

export function PlanWizard({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void;
  onSubmit: () => void;
}) {
  // ==================== 基础选择（Step1） ====================
  const [professionId, setProfessionId] = useState<string>("prof-mech");
  const [subjectId, setSubjectId] = useState<string>("subj-mech-drawing");
  const [courseId, setCourseId] = useState<string>("course-mech-draw");

  // ==================== 策略（Step3） ====================
  const [strategyId, setStrategyId] = useState<string>("strat-li-personal");
  const [strategyOverride, setStrategyOverride] = useState<StrategyOverride | null>(
    null,
  );

  // ==================== 骨架（按课时平铺，Step2 预览可编辑）====================
  const [draftLessons, setDraftLessons] = useState<DraftSection[] | null>(null);

  // ==================== 步骤切换（1 计划设置 · 2 预览并生成）====================
  const [step, setStep] = useState<1 | 2>(1);

  // 进入预览步前的 AI 生成假动画
  const [generating, setGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0); // 0-100
  const [genTaskIdx, setGenTaskIdx] = useState(0);
  const genTimersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => {
    return () => {
      for (const t of genTimersRef.current) clearTimeout(t);
    };
  }, []);

  const course = useMemo(
    () => courses.find((c) => c.id === courseId),
    [courseId],
  );

  /** 选中策略的原始数据 */
  const baseStrategy = useMemo(
    () => teachingStrategies.find((s) => s.id === strategyId),
    [strategyId],
  );

  /** 当前生效的策略字段（覆盖优先） */
  const effectiveStrategy = useMemo<StrategyOverride>(() => {
    if (strategyOverride) return strategyOverride;
    const base = baseStrategy;
    return {
      paceSuggestion: base?.paceSuggestion ?? "",
      difficultyCurve: base?.difficultyCurve ?? "",
      activitySuggestion: base?.activitySuggestion ?? "",
      strategyBrief: synthStrategyBrief(strategyId, []),
    };
  }, [strategyOverride, baseStrategy, strategyId]);

  // 进入预览步时初始化骨架
  const ensureDraftBuilt = () => {
    if (draftLessons) return;
    const base = buildSkeletonFromCourse(courseId, []);
    setDraftLessons(base);
  };

  const canNext = (): boolean => {
    if (step === 1) {
      return !!course && !!strategyId;
    }
    return true;
  };

  const goNext = () => {
    if (step === 1) {
      ensureDraftBuilt();
      runGenerateAnimation();
      return;
    }
  };
  const goPrev = () => {
    if (step > 1) setStep((s) => (s - 1) as 1 | 2);
  };

  const runGenerateAnimation = () => {
    for (const t of genTimersRef.current) clearTimeout(t);
    genTimersRef.current = [];
    setGenerating(true);
    setGenProgress(0);
    setGenTaskIdx(0);

    const taskCount = GENERATION_TASKS.length;
    const totalMs = GENERATION_TASKS.reduce((sum, t) => sum + t.durationMs, 0);
    const tailMs = 0;

    // 使用累计偏移切换到下一个任务；同时用一个细粒度的 interval 平滑推进进度条
    let cumulative = 0;
    for (let i = 0; i < taskCount; i += 1) {
      cumulative += GENERATION_TASKS[i].durationMs;
      const offset = cumulative;
      const t = setTimeout(() => {
        setGenTaskIdx(i + 1);
        setGenProgress(Math.round((offset / (totalMs + tailMs)) * 100));
      }, offset);
      genTimersRef.current.push(t);
    }

    // 平滑推进整体进度条（每 120ms 抬一点，最高到 99%）
    const progressStart = Date.now();
    const ticker = setInterval(() => {
      const elapsed = Date.now() - progressStart;
      const ratio = Math.min(elapsed / (totalMs + tailMs), 0.99);
      setGenProgress((prev) => {
        const next = Math.round(ratio * 100);
        return next > prev ? next : prev;
      });
    }, 120);
    // 借用 timers ref 便于卸载时统一清理
    genTimersRef.current.push(ticker as unknown as ReturnType<typeof setTimeout>);

    const done = setTimeout(() => {
      clearInterval(ticker);
      setGenerating(false);
      setGenProgress(100);
      setGenTaskIdx(taskCount);
      setStep(2);
    }, totalMs + tailMs);
    genTimersRef.current.push(done);
  };

  return (
    <div>
      <PageHeader
        back={onCancel}
        title={<span>新建教学计划</span>}
        actions={
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-600"
          >
            取消
          </button>
        }
      />
      <Stepper step={step} onJump={(s) => setStep(s)} />
      <div className="p-6">
        {step === 1 && (
          <div className="space-y-10">
            <section className="space-y-3">
              <div className="text-slate-900 font-medium">基础信息</div>
              <Step1Scope
                professionId={professionId}
                subjectId={subjectId}
                courseId={courseId}
                onChangeProfession={(id) => {
                  setProfessionId(id);
                  const firstSubj = subjects.find((s) => s.professionId === id);
                  setSubjectId(firstSubj?.id ?? "");
                  const firstCourse = courses.find(
                    (c) => c.professionId === id && c.subjectId === firstSubj?.id,
                  );
                  setCourseId(firstCourse?.id ?? "");
                }}
                onChangeSubject={(id) => {
                  setSubjectId(id);
                  const firstCourse = courses.find(
                    (c) => c.subjectId === id && c.professionId === professionId,
                  );
                  setCourseId(firstCourse?.id ?? "");
                }}
                onChangeCourse={(id) => setCourseId(id)}
              />
            </section>
            <section className="space-y-3">
              <div className="text-slate-900 font-medium">教学策略</div>
              <Step3
                strategyId={strategyId}
                onSelectStrategy={(id) => {
                  setStrategyId(id);
                  setStrategyOverride(null);
                }}
                effective={effectiveStrategy}
                onEdit={(patch) =>
                  setStrategyOverride((prev) => ({
                    ...effectiveStrategy,
                    ...prev,
                    ...patch,
                  }))
                }
              />
            </section>
          </div>
        )}
        {step === 2 && (
          <Step5 draftLessons={draftLessons ?? []} setDraftLessons={setDraftLessons} />
        )}
      </div>
      <WizardFooter
        step={step}
        canNext={canNext() && !generating}
        onPrev={goPrev}
        onNext={goNext}
        onSubmit={onSubmit}
      />
      {generating && (
        <GenerationOverlay
          progress={genProgress}
          taskIdx={genTaskIdx}
          course={course}
          draftLessonCount={(draftLessons ?? []).length}
        />
      )}
    </div>
  );
}

// ==========================================================================
// Stepper
// ==========================================================================

function Stepper({
  step,
  onJump,
}: {
  step: 1 | 2;
  onJump: (s: 1 | 2) => void;
}) {
  const items: Array<{ k: 1 | 2; label: string }> = [
    { k: 1, label: "计划设置" },
    { k: 2, label: "预览并生成" },
  ];
  return (
    <div className="px-6 py-4 bg-white border-b border-slate-200">
      <div className="flex items-center gap-2">
        {items.map((it, idx) => {
          const active = it.k === step;
          const done = it.k < step;
          return (
            <div key={it.k} className="flex items-center gap-2 flex-1">
              <button
                onClick={() => it.k <= step && onJump(it.k)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition whitespace-nowrap ${
                  active
                    ? "bg-indigo-600 text-white"
                    : done
                    ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <span
                  className={`size-5 rounded-full flex items-center justify-center ${
                    active
                      ? "bg-white/20"
                      : done
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-slate-400"
                  }`}
                >
                  {done ? <Check size={12} /> : it.k}
                </span>
                <span>{it.label}</span>
              </button>
              {idx < items.length - 1 && (
                <div
                  className={`flex-1 h-px ${
                    done ? "bg-indigo-300" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================================================
// Footer
// ==========================================================================

function WizardFooter({
  step,
  canNext,
  onPrev,
  onNext,
  onSubmit,
}: {
  step: 1 | 2;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between">
      <div className="text-slate-400">Step {step} / 2</div>
      <div className="flex items-center gap-2">
        {step > 1 && (
          <button
            onClick={onPrev}
            className="px-4 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-600"
          >
            上一步
          </button>
        )}
        {step < 2 ? (
          <button
            disabled={!canNext}
            onClick={onNext}
            className={`px-4 py-1.5 rounded-md flex items-center gap-1 ${
              canNext
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            <Sparkles size={14} /> 生成教学计划
          </button>
        ) : (
          <>
            <button
              onClick={onSubmit}
              className="px-4 py-1.5 rounded-md border border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              保存为草稿
            </button>
            <button
              onClick={onSubmit}
              className="px-4 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1"
            >
              <Sparkles size={14} /> 立即开始
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ==========================================================================
// AI 生成骨架的假动画覆盖层
// ==========================================================================

function GenerationOverlay({
  progress,
  taskIdx,
  course,
  draftLessonCount,
}: {
  progress: number;
  taskIdx: number;
  course: Course | undefined;
  draftLessonCount: number;
}) {
  const sectionCount = draftLessonCount;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-[min(35rem,92vw)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* 顶部：AI 头像 + 主标题 */}
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-br from-indigo-50 via-violet-50 to-white">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="size-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg">
                <Sparkles size={20} />
              </div>
              <span className="absolute inset-0 rounded-2xl border-2 border-indigo-300 animate-ping opacity-60" />
            </div>
            <div>
              <div className="text-slate-900 text-[0.9375rem] flex items-center gap-1.5">
                AI 正在生成教学计划骨架
                <DotLoader />
              </div>
              <div className="text-slate-500 text-[0.6875rem] mt-0.5">
                依据《{course?.name ?? "课程"}》与所选策略生成教学骨架与日程安排
              </div>
            </div>
          </div>
          {/* 进度条 */}
          <div className="mt-4">
            <div className="h-1.5 rounded-full bg-slate-200/80 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-1 flex items-center justify-between text-[0.6875rem] text-slate-500">
              <span>AI 生成进度</span>
              <span>{progress}%</span>
            </div>
          </div>
        </div>

        {/* 任务清单 */}
        <div className="px-6 py-4 space-y-2.5">
          {GENERATION_TASKS.map((t, i) => {
            const done = i < taskIdx;
            const active = i === taskIdx;
            return (
              <div
                key={t.title}
                className={`flex items-start gap-3 px-3 py-2 rounded-lg transition ${
                  active
                    ? "bg-indigo-50/80"
                    : done
                    ? "bg-white"
                    : "bg-slate-50/60"
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {done ? (
                    <div className="size-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  ) : active ? (
                    <div className="size-5 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                      <Loader2 size={12} className="animate-spin" />
                    </div>
                  ) : (
                    <div className="size-5 rounded-full border-2 border-slate-200" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-[0.8125rem] leading-tight ${
                      done
                        ? "text-slate-500 line-through decoration-slate-300"
                        : active
                        ? "text-indigo-700"
                        : "text-slate-600"
                    }`}
                  >
                    {t.title}
                  </div>
                  <div
                    className={`text-[0.6875rem] mt-0.5 ${
                      active ? "text-slate-600" : "text-slate-400"
                    }`}
                  >
                    {t.detail}
                  </div>
                </div>
                {active && (
                  <span className="shrink-0 text-[0.625rem] text-indigo-600 px-1.5 py-0.5 rounded-md bg-white border border-indigo-200">
                    进行中
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* 底部 · 动态 hint */}
        <div className="px-6 pb-5 pt-1 flex items-center gap-2 text-[0.6875rem] text-slate-400">
          <Sparkles size={12} className="text-indigo-400" />
          <span>
            已编排 {sectionCount} 个课时与各课时的图谱挂载建议，稍后可在预览页继续微调
          </span>
        </div>
      </div>
    </div>
  );
}

function DotLoader() {
  return (
    <span className="inline-flex items-center gap-0.5 ml-0.5">
      <span className="size-1 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
      <span className="size-1 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
      <span className="size-1 rounded-full bg-indigo-500 animate-bounce" />
    </span>
  );
}

// ==========================================================================
// 计划设置 · 专业 / 学科 / 课程 + 课程预览
// ==========================================================================

function Step1Scope({
  professionId,
  subjectId,
  courseId,
  onChangeProfession,
  onChangeSubject,
  onChangeCourse,
}: {
  professionId: string;
  subjectId: string;
  courseId: string;
  onChangeProfession: (id: string) => void;
  onChangeSubject: (id: string) => void;
  onChangeCourse: (id: string) => void;
}) {
  const profession = professionById(professionId);
  const course = courses.find((c) => c.id === courseId);
  const teacher = course ? teacherById(course.ownerTeacherId) : undefined;
  const relatedSubjects = subjects.filter((s) => s.professionId === professionId);
  const relatedCourses = courses.filter(
    (c) => c.professionId === professionId && c.subjectId === subjectId,
  );

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="text-slate-400 text-[0.6875rem] mb-4">
          专业 · 学科 · 课程
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-slate-500 mb-2">专业</div>
            <select
              value={professionId}
              onChange={(e) => onChangeProfession(e.target.value)}
              className="w-full border border-slate-200 rounded-md px-3 py-2 bg-white"
            >
              {professions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.college} · {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="text-slate-500 mb-2">学科</div>
            <select
              value={subjectId}
              onChange={(e) => onChangeSubject(e.target.value)}
              className="w-full border border-slate-200 rounded-md px-3 py-2 bg-white"
            >
              {relatedSubjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="text-slate-500 mb-2">课程</div>
            <select
              value={courseId}
              onChange={(e) => onChangeCourse(e.target.value)}
              className="w-full border border-slate-200 rounded-md px-3 py-2 bg-white"
              disabled={relatedCourses.length === 0}
            >
              {relatedCourses.length === 0 && <option>该学科暂无课程</option>}
              {relatedCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  《{c.name}》 · {c.totalHours} 学时
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {course ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="h-24 bg-gradient-to-br from-indigo-500 via-indigo-400 to-violet-400 flex items-end p-4">
            <div className="text-white">
              <div className="opacity-80 text-[0.6875rem]">{profession?.college}</div>
              <div className="text-lg">《{course.name}》</div>
            </div>
          </div>
          <div className="p-4 space-y-2">
            <div className="text-slate-700 leading-relaxed text-[0.8125rem]">
              {course.description}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <InfoCell k="学时" v={`${course.totalHours} 学时`} />
              <InfoCell k="学分" v={`${course.credit} 学分`} />
              <InfoCell k="关联知识点" v={`${course.knowledgeNodeIds.length} 个`} />
              <InfoCell k="负责教师" v={teacher?.name ?? "—"} />
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {course.tags.map((t) => (
                <span key={t} className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[0.6875rem]">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 flex items-center justify-center text-slate-400 text-sm">
          请选择专业、学科与课程
        </div>
      )}
    </div>
  );
}

function InfoCell({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <div className="text-slate-400 text-[0.6875rem]">{k}</div>
      <div className="text-slate-800">{v}</div>
    </div>
  );
}

// ==========================================================================
// Step 3 · 教学策略（可编辑）
// ==========================================================================

function Step3({
  strategyId,
  onSelectStrategy,
  effective,
  onEdit,
}: {
  strategyId: string;
  onSelectStrategy: (id: string) => void;
  effective: StrategyOverride;
  onEdit: (patch: Partial<StrategyOverride>) => void;
}) {
  const matches = useMemo(() => {
    return teachingStrategies
      .map((s) => ({
        strategy: s,
        score: computeStrategyMatch(s, []),
      }))
      .sort((a, b) => b.score - a.score);
  }, []);

  const [notice, setNotice] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="text-slate-900">候选策略</div>
          <AiBadge>AI 匹配度基于课程适用性估算</AiBadge>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {matches.map(({ strategy, score }) => {
            const selected = strategy.id === strategyId;
            return (
              <button
                key={strategy.id}
                onClick={() => onSelectStrategy(strategy.id)}
                className={`text-left rounded-xl border p-4 transition relative group ${
                  selected
                    ? "border-indigo-400 bg-indigo-50/40 ring-1 ring-indigo-100"
                    : "border-slate-200 bg-white hover:border-indigo-300"
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="text-slate-900">{strategy.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-md ${
                      score >= 85
                        ? "bg-emerald-50 text-emerald-700"
                        : score >= 60
                        ? "bg-indigo-50 text-indigo-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    匹配 {score}%
                  </span>
                </div>
                <div className="text-slate-500 mb-2 text-[0.6875rem]">
                  {sourceLabel(strategy.source)}
                </div>
                <p className="text-slate-600 line-clamp-3 leading-relaxed">
                  {strategy.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {strategy.fitFor.slice(0, 3).map((f) => (
                    <span
                      key={f}
                      className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[0.6875rem]"
                    >
                      {f}
                    </span>
                  ))}
                </div>
                {selected && (
                  <div className="absolute top-2 right-2 size-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                    <Check size={12} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="text-slate-900">当前策略详情</div>
            <AiBadge>可编辑</AiBadge>
          </div>
          <button
            onClick={() => setNotice("已将当前调整保存为「李建国 · 个人模板草稿」")}
            className="px-3 py-1 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-600"
          >
            基于此策略新建个人模板
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <EditableBlock
            label="授课节奏"
            value={effective.paceSuggestion}
            onChange={(v) => onEdit({ paceSuggestion: v })}
          />
          <EditableBlock
            label="难度曲线"
            value={effective.difficultyCurve}
            onChange={(v) => onEdit({ difficultyCurve: v })}
          />
          <EditableBlock
            label="活动建议"
            value={effective.activitySuggestion}
            onChange={(v) => onEdit({ activitySuggestion: v })}
          />
        </div>
        <div className="mt-4">
          <div className="text-slate-500 mb-1.5 flex items-center gap-2">
            策略简述（会写入教学计划）
          </div>
          <textarea
            value={effective.strategyBrief}
            onChange={(e) => onEdit({ strategyBrief: e.target.value })}
            className="w-full min-h-[120px] border border-slate-200 rounded-md p-3 leading-relaxed text-slate-700"
          />
        </div>
        {notice && (
          <div className="mt-3 px-3 py-2 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-2">
            <Check size={14} /> {notice}
          </div>
        )}
      </div>
    </div>
  );
}

function EditableBlock({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="text-slate-500 mb-1.5">{label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-h-[80px] border border-slate-200 rounded-md p-2 leading-relaxed text-slate-700"
      />
    </div>
  );
}

// ==========================================================================
// Step 5 · 按课时预览骨架（可编辑）
// ==========================================================================

function Step5({
  draftLessons,
  setDraftLessons,
}: {
  draftLessons: DraftSection[];
  setDraftLessons: React.Dispatch<React.SetStateAction<DraftSection[] | null>>;
}) {
  const totalMinutes = draftLessons.reduce((sum, l) => sum + l.durationMinutes, 0);
  const totalHours = Math.round(totalMinutes / 45);

  const moveLesson = (idx: number, delta: -1 | 1) => {
    setDraftLessons((prev) => {
      if (!prev) return prev;
      const lessons = [...prev];
      const ni = idx + delta;
      if (ni < 0 || ni >= lessons.length) return prev;
      const [moved] = lessons.splice(idx, 1);
      lessons.splice(ni, 0, moved);
      return lessons;
    });
  };

  const deleteLesson = (idx: number) => {
    setDraftLessons((prev) => {
      if (!prev) return prev;
      const lessons = [...prev];
      lessons.splice(idx, 1);
      return lessons;
    });
  };

  const updateLesson = (idx: number, patch: Partial<DraftSection>) => {
    setDraftLessons((prev) => {
      if (!prev) return prev;
      const lessons = [...prev];
      lessons[idx] = { ...lessons[idx]!, ...patch };
      return lessons;
    });
  };

  const addLesson = () => {
    setDraftLessons((prev) => {
      const lessons = [...(prev ?? [])];
      const maxNum =
        lessons.length > 0
          ? Math.max(
              ...lessons.map((l) => {
                const m = l.title.match(/第\s*(\d+)\s*课时/u);
                return m?.[1] ? parseInt(m[1]!, 10) : 0;
              }),
            )
          : 0;
      const nextN = maxNum + 1;
      const newId = `draft-lesson-${Date.now()}`;
      lessons.push({
        id: newId,
        title: `第${nextN}课时 · 新授课主题`,
        plannedDate: "2026-02-23",
        durationMinutes: 90,
        knowledgeNodeIds: [],
      });
      return lessons;
    });
  };

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-6 flex-wrap">
        <Stat icon={<Clock size={14} />} label="课时数" value={`${draftLessons.length}`} />
        <Stat icon={<Clock size={14} />} label="学时(约)" value={`${totalHours}`} />
        <Stat
          icon={<Sparkles size={14} />}
          label="AI 调整说明"
          value={`${draftLessons.filter((s) => !!s.aiAdjustment).length}`}
        />
        <div className="flex-1" />
        <AiBadge>可按课时排序，检视图谱挂载</AiBadge>
      </div>

      <div className="space-y-2">
        {draftLessons.map((sec, idx) => (
          <div
            key={sec.id}
            className="bg-white rounded-xl border border-slate-200 p-4 hover:border-indigo-200 transition"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[0.6875rem] font-semibold text-indigo-600 whitespace-nowrap">
                第 {idx + 1} 课时
              </span>
              <input
                value={sec.title}
                onChange={(e) => updateLesson(idx, { title: e.target.value })}
                className="flex-1 min-w-[12rem] border border-transparent hover:border-slate-200 focus:border-indigo-300 rounded-md px-2 py-1 text-slate-900 outline-none"
              />
              <input
                type="date"
                value={sec.plannedDate}
                onChange={(e) => updateLesson(idx, { plannedDate: e.target.value })}
                className="border border-slate-200 rounded-md px-2 py-1 text-slate-700"
              />
              <div className="flex items-center gap-1 border border-slate-200 rounded-md px-2 py-1">
                <input
                  type="number"
                  value={sec.durationMinutes}
                  onChange={(e) =>
                    updateLesson(idx, { durationMinutes: Number(e.target.value) || 0 })
                  }
                  className="w-14 text-right outline-none text-slate-700"
                />
                <span className="text-slate-400">min</span>
              </div>
              <button
                type="button"
                onClick={() => moveLesson(idx, -1)}
                disabled={idx === 0}
                className="size-7 rounded-md hover:bg-slate-100 disabled:opacity-30 text-slate-500 flex items-center justify-center"
                title="上移"
              >
                <ArrowUp size={14} />
              </button>
              <button
                type="button"
                onClick={() => moveLesson(idx, 1)}
                disabled={idx === draftLessons.length - 1}
                className="size-7 rounded-md hover:bg-slate-100 disabled:opacity-30 text-slate-500 flex items-center justify-center"
                title="下移"
              >
                <ArrowDown size={14} />
              </button>
              <button
                type="button"
                onClick={() => deleteLesson(idx)}
                className="size-7 rounded-md hover:bg-rose-50 text-rose-500 flex items-center justify-center"
                title="删除本课时"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="mt-3">
              <div className="text-[0.6875rem] text-slate-500 mb-1">图谱挂载（本节关联节点）</div>
              {sec.knowledgeNodeIds.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {sec.knowledgeNodeIds.map((nid) => {
                    const gn = graphNodeById(nid);
                    return (
                      <span
                        key={`${sec.id}-${nid}`}
                        title={nid}
                        className="text-[0.6875rem] px-2 py-0.5 rounded-md border border-slate-200 bg-slate-50 text-slate-700 max-w-[14rem] truncate"
                      >
                        {gn?.name ?? nid}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <div className="text-[0.8125rem] text-slate-400">暂未挂载图谱节点</div>
              )}
            </div>

            {sec.aiAdjustment && (
              <div className="mt-2 flex items-start gap-2">
                <AiBadge>AI 调整</AiBadge>
                <span className="text-slate-600 leading-relaxed">{sec.aiAdjustment}</span>
              </div>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addLesson}
          className="w-full flex items-center justify-center gap-1 py-2 border border-dashed border-slate-300 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-300"
        >
          <Plus size={14} /> 添加课时
        </button>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="size-7 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
        {icon}
      </div>
      <div className="leading-tight">
        <div className="text-slate-400 text-[0.6875rem]">{label}</div>
        <div className="text-slate-800">{value}</div>
      </div>
    </div>
  );
}

// ==========================================================================
// 纯函数：匹配度 / AI 文案 / 骨架生成
// ==========================================================================

function sourceLabel(s: TeachingStrategy["source"]): string {
  switch (s) {
    case "platform":
      return "平台预置";
    case "college":
      return "学院共享";
    case "department":
      return "教研室共享";
    case "personal":
      return "个人模板";
  }
}

/** 基于班级画像 & 策略 fitFor 的简单匹配度（伪 AI） */
function computeStrategyMatch(
  strategy: TeachingStrategy,
  classIds: string[],
): number {
  if (classIds.length === 0) return 60;

  // 汇总班级的 styleTag + weaknesses，作为"特征集合"
  const features = new Set<string>();
  let anyRisk = false;
  let avgScore = 0;
  let count = 0;
  for (const cid of classIds) {
    const p = classProfileByClassId(cid);
    if (!p) continue;
    count += 1;
    avgScore += p.scoreDistribution.averageScore;
    if (p.scoreDistribution.stdDev >= 14) anyRisk = true;
    features.add(p.styleTag);
    for (const w of p.weaknesses) features.add(w);
    for (const s of p.strengths) features.add(s);
  }
  const meanScore = count > 0 ? avgScore / count : 70;

  // 命中策略 fitFor
  let hits = 0;
  for (const f of strategy.fitFor) {
    for (const feat of features) {
      if (feat.includes(f) || f.includes(feat)) {
        hits += 1;
        break;
      }
    }
  }
  const baseHitScore = Math.min(hits, 3) * 20; // 0/20/40/60

  // 专项加分
  let bonus = 0;
  if (anyRisk && strategy.id === "strat-preset-layered") bonus += 32;
  if (meanScore >= 80 && strategy.id === "strat-preset-intensive") bonus += 25;
  if (meanScore < 72 && strategy.id === "strat-preset-progressive") bonus += 22;
  if (strategy.id === "strat-preset-balanced") bonus += 15; // 默认安全牌
  if (strategy.source === "personal") bonus += 10;
  if (strategy.source === "department") bonus += 8;

  const score = Math.max(40, Math.min(98, 45 + baseHitScore + bonus - 10));
  // 再用 id 做 hash 扰动，避免数值过于整齐
  const jitter = (strategy.id.length % 5) - 2;
  return Math.max(40, Math.min(98, score + jitter));
}

/** 合成策略简述（策略区初值等） */
function synthStrategyBrief(strategyId: string, classIds: string[]): string {
  const strategy = teachingStrategies.find((s) => s.id === strategyId);

  if (classIds.length === 0) {
    if (!strategy) return "请选择教学策略后自动生成简述。";
    return (
      `采用「${strategy.name}」策略。\n` +
      `· 节奏：${strategy.paceSuggestion}\n` +
      `· 难度：${strategy.difficultyCurve}\n` +
      `· 活动：${strategy.activitySuggestion}\n`
    );
  }

  const names = classIds
    .map((id) => classById(id)?.name ?? id)
    .join("、");
  const tagSummary = classIds
    .map((id) => {
      const p = classProfileByClassId(id);
      const cls = classById(id);
      if (!p || !cls) return "";
      return `${cls.name}（${p.styleTag}）`;
    })
    .filter(Boolean)
    .join(" + ");

  if (!strategy) {
    return `面向班级：${names}。请选择教学策略后自动生成简述。`;
  }

  // 主线班级组合使用更生动的预置文案
  if (
    strategyId === "strat-li-personal" &&
    classIds.length === 2 &&
    classIds.includes("cls-mech-2301") &&
    classIds.includes("cls-mech-2302")
  ) {
    const main = teachingPlans.find((p) => p.id === "plan-main");
    if (main) return main.strategyBrief;
  }

  const hints: string[] = [];
  for (const cid of classIds) {
    const p = classProfileByClassId(cid);
    const cls = classById(cid);
    if (!p || !cls) continue;
    if (p.scoreDistribution.stdDev >= 14) {
      hints.push(`${cls.name} 两极分化严重，启用分层作业并增加 2 次课后答疑`);
    } else if (p.scoreDistribution.averageScore >= 80) {
      hints.push(`${cls.name} 整体学情优秀，可加入综合创新挑战`);
    } else if (p.scoreDistribution.averageScore < 72) {
      hints.push(`${cls.name} 基础偏弱，需放缓节奏并增加随堂测`);
    } else {
      hints.push(`${cls.name} 学情稳健，沿用标准节奏`);
    }
  }

  return (
    `采用「${strategy.name}」策略，覆盖 ${tagSummary || names}。\n` +
    `· 节奏：${strategy.paceSuggestion}\n` +
    `· 难度：${strategy.difficultyCurve}\n` +
    `· 活动：${strategy.activitySuggestion}\n` +
    (hints.length
      ? `\n学情针对性调整：\n${hints.map((h) => `- ${h}`).join("\n")}`
      : "")
  );
}

/** 基于课程和所选班级，生成按课时扁平化、带图谱挂载字段的草稿 */
function buildSkeletonFromCourse(
  courseId: string,
  classIds: string[],
): DraftSection[] {
  const hasRiskClass = classIds.some(
    (cid) => (classProfileByClassId(cid)?.scoreDistribution.stdDev ?? 0) >= 14,
  );
  const riskClassName = classIds
    .map((cid) => {
      const p = classProfileByClassId(cid);
      if (!p) return null;
      if (p.scoreDistribution.stdDev >= 14) return classById(cid)?.name ?? cid;
      return null;
    })
    .filter((x): x is string => !!x)[0];

  const basePlan = teachingPlans.find(
    (p) => p.courseId === courseId && p.status !== "completed",
  );
  if (basePlan) {
    return draftSectionsFromPlan(basePlan, hasRiskClass, riskClassName, courseId);
  }

  return fallbackSkeleton();
}

function draftSectionsFromPlan(
  basePlan: TeachingPlan,
  hasRiskClass: boolean,
  riskClassName: string | undefined,
  courseId: string,
): DraftSection[] {
  let n = 0;
  const out: DraftSection[] = [];
  for (const ch of basePlan.chapters) {
    for (const s of ch.sections) {
      n += 1;
      let title = s.title;
      const already = /^\s*第\s*\d+\s*课时\s*[·\-：:]/u.test(s.title);
      if (!already) {
        const stripped = s.title.replace(/^(\d+\.)+\s*\d+\s*/u, "").trim();
        title = `第${n}课时 · ${stripped || s.title}`;
      }
      const draft: DraftSection = {
        id: s.id,
        title,
        plannedDate: s.plannedDate,
        durationMinutes: s.durationMinutes,
        knowledgeNodeIds: [...s.knowledgeNodeIds],
      };
      const adj = pickAdjustment(s.id, courseId, hasRiskClass, riskClassName);
      if (adj) draft.aiAdjustment = adj;
      out.push(draft);
    }
  }
  return out;
}

function pickAdjustment(
  sectionId: string,
  courseId: string,
  hasRiskClass: boolean,
  riskClassName: string | undefined,
): string | undefined {
  // 机械制图主线焦点调整
  if (courseId === "course-mech-draw") {
    if (sectionId === "sec-3-2") {
      return hasRiskClass
        ? `${riskClassName} 两极分化 → 由 2 课时扩展到 3 课时，配 5 题渐进式练习`
        : "增加 1 个组合体工程情境案例，强化形体分析法";
    }
    if (sectionId === "sec-3-4") {
      return "单独成篇 135min，配 SolidWorks 三维切割示范";
    }
    if (sectionId === "sec-2-2" && hasRiskClass) {
      return `${riskClassName} 讲解前先做一次投影基础回顾小测`;
    }
    if (sectionId === "sec-4-3" && hasRiskClass) {
      return `${riskClassName} 剖视图前增加 1 次答疑课`;
    }
  }

  if (courseId === "course-mech-tolerance") {
    if (sectionId === "sec-tol-2-1") {
      return "增配同一零件的装配基准复盘，减少基准体系误判";
    }
    if (sectionId === "sec-tol-1-2") {
      return "增加外购轴承与光轴对照案例，巩固基孔/基轴选用";
    }
  }

  if (courseId === "course-mech-robotics") {
    if (sectionId === "sec-rob-1-2") {
      return "仿真—现场标定对照表纳入必交，缩小节拍偏差";
    }
  }
  return undefined;
}

function fallbackSkeleton(): DraftSection[] {
  return [
    {
      id: "draft-lesson-a",
      title: "第1课时 · 课程导学与国家制图标准认知",
      plannedDate: "2026-02-23",
      durationMinutes: 90,
      knowledgeNodeIds: ["kn-mech-001", "kn-mech-018"],
    },
    {
      id: "draft-lesson-b",
      title: "第2课时 · 图线、字体与尺寸标注规范",
      plannedDate: "2026-02-25",
      durationMinutes: 90,
      knowledgeNodeIds: ["kn-mech-001", "kn-mech-009"],
      aiAdjustment: "随堂加入板演纠错，对齐作业常见标注错误 TOP5",
    },
    {
      id: "draft-lesson-c",
      title: "第3课时 · 正投影原理与视图对应关系",
      plannedDate: "2026-03-02",
      durationMinutes: 90,
      knowledgeNodeIds: ["kn-mech-003", "kn-mech-004", "kn-mech-005"],
    },
    {
      id: "draft-lesson-d",
      title: "第4课时 · 回转体建模与制图表达",
      plannedDate: "2026-03-05",
      durationMinutes: 90,
      knowledgeNodeIds: ["kn-mech-004", "sk-mech-010", "course-mech-draw"],
    },
    {
      id: "draft-lesson-e",
      title: "第5课时 · 章节综合与讲评",
      plannedDate: "2026-03-09",
      durationMinutes: 135,
      knowledgeNodeIds: ["kn-mech-004", "train-m-002"],
    },
  ];
}
