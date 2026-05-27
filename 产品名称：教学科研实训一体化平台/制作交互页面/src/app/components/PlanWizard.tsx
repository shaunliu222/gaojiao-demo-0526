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
  classes,
  courses,
  professions,
  subjects,
  teachingPlans,
  teachingPlansV2,
  teachingStrategies,
} from "@mock";
import type {
  Course,
  TeachingPlan,
  TeachingStrategy,
  TeachingPlanV2,
} from "@mock";
import {
  classById,
  classProfileByClassId,
  graphNodeById,
  professionById,
  resourcesByCourse,
  strategyById,
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

export interface WizardPlanSummary {
  courseId: string;
  professionId: string;
  subjectId: string;
  classIds: string[];
  totalLessons: number;
  credit: number;
  strategyId: string;
  customStrategy: string;
}

export function PlanWizard({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void;
  onSubmit: (status: "draft" | "in_progress", data: WizardPlanSummary) => void;
}) {
  // ==================== 基础选择（Step1） ====================
  const [professionId, setProfessionId] = useState<string>("prof-mech");
  const [subjectId, setSubjectId] = useState<string>("subj-mech-drawing");
  const [courseId, setCourseId] = useState<string>("course-mech-draw");
  const [classIds, setClassIds] = useState<string[]>([]);
  const [totalLessons, setTotalLessons] = useState<number>(0);
  const [credit, setCredit] = useState<number>(0);

  // Update credit default when course changes
  useEffect(() => {
    const c = courses.find((co) => co.id === courseId);
    if (c) setCredit(c.credit);
  }, [courseId]);

  // ==================== 策略（Step3） ====================
  const [strategyId, setStrategyId] = useState<string>("strat-li-personal");
  const [strategyOverride, setStrategyOverride] = useState<StrategyOverride | null>(
    null,
  );

  // ==================== 骨架（按课时平铺，Step2 预览可编辑）====================
  const [draftLessons, setDraftLessons] = useState<DraftSection[] | null>(null);

  // ==================== 步骤切换（1 选择课程 · 2 教学策略 · 3 预览并生成）====================
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // ==================== 上架确认弹窗 ====================
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);

  // ==================== 个性化教学需求（v2.0 新增） ====================
  const [customStrategy, setCustomStrategy] = useState<string>("");

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
      return !!course;
    }
    if (step === 2) {
      return !!strategyId;
    }
    return true;
  };

  const goNext = () => {
    if (step === 1) {
      setStep(2);
      return;
    }
    if (step === 2) {
      ensureDraftBuilt();
      runGenerateAnimation();
      return;
    }
  };
  const goPrev = () => {
    if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3);
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
      setStep(3);
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
              <div className="text-slate-900 font-medium">选择课程</div>
              <Step1Scope
                professionId={professionId}
                subjectId={subjectId}
                courseId={courseId}
                classIds={classIds}
                totalLessons={totalLessons}
                credit={credit}
                onChangeProfession={(id) => {
                  setProfessionId(id);
                  const firstSubj = subjects.find((s) => s.professionId === id);
                  setSubjectId(firstSubj?.id ?? "");
                  const firstCourse = courses.find(
                    (c) => c.professionId === id && c.subjectId === firstSubj?.id,
                  );
                  setCourseId(firstCourse?.id ?? "");
                  setClassIds([]);
                }}
                onChangeSubject={(id) => {
                  setSubjectId(id);
                  const firstCourse = courses.find(
                    (c) => c.subjectId === id && c.professionId === professionId,
                  );
                  setCourseId(firstCourse?.id ?? "");
                }}
                onChangeCourse={(id) => setCourseId(id)}
                onChangeClassIds={setClassIds}
                onChangeTotalLessons={setTotalLessons}
                onChangeCredit={setCredit}
              />
            </section>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-10">
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
            <section className="space-y-3">
              <div className="text-slate-900 font-medium">个性化教学需求</div>
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <textarea
                  value={customStrategy}
                  onChange={(e) => setCustomStrategy(e.target.value)}
                  placeholder="例如：本班基础较弱，前5课时放慢节奏，多安排基础练习..."
                  className="w-full min-h-[100px] border border-slate-200 rounded-md p-3 leading-relaxed text-slate-700"
                />
              </div>
            </section>
          </div>
        )}
        {step === 3 && (
          <Step5
            draftLessons={draftLessons ?? []}
            setDraftLessons={setDraftLessons}
            course={course}
            classNames={classIds.map((cid) => classById(cid)?.name ?? cid).join("、")}
            totalLessons={totalLessons}
            credit={credit}
          />
        )}
      </div>
      <WizardFooter
        step={step}
        canNext={canNext() && !generating}
        onPrev={goPrev}
        onNext={goNext}
        onSaveDraft={() =>
          onSubmit("draft", {
            courseId,
            professionId,
            subjectId,
            classIds,
            totalLessons,
            credit,
            strategyId,
            customStrategy,
          })
        }
        onPublish={() => setShowPublishConfirm(true)}
      />
      {generating && (
        <GenerationOverlay
          progress={genProgress}
          taskIdx={genTaskIdx}
          course={course}
          draftLessonCount={(draftLessons ?? []).length}
        />
      )}
      {showPublishConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-[min(30rem,92vw)] bg-white rounded-2xl shadow-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={18} className="text-indigo-600" />
              <span className="text-slate-900 font-medium">上架确认</span>
            </div>
            <p className="text-slate-600 text-[0.8125rem] leading-relaxed mb-3">
              上架后，教学计划将推送给所选班级的学生。资源推送规则如下：
            </p>
            <div className="space-y-2 mb-4">
              <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-100">
                <Check size={14} className="text-indigo-600 mt-0.5 shrink-0" />
                <div className="text-[0.75rem] text-slate-700">
                  <span className="font-medium text-indigo-700">课堂内容、课堂作业</span> — 推送给学生的教学计划资源列表，学生可直接查看和下载
                </div>
              </div>
              <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
                <Clock size={14} className="text-slate-400 mt-0.5 shrink-0" />
                <div className="text-[0.75rem] text-slate-500">
                  <span className="font-medium text-slate-600">教学设计参考资料、其它</span> — 仅教师在教学设计工作台中查看，不推送给学生
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setShowPublishConfirm(false)} className="px-4 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-600 text-[0.8125rem]">
                取消
              </button>
              <button
                onClick={() => {
                  setShowPublishConfirm(false);
                  const data: WizardPlanSummary = {
                    courseId,
                    professionId,
                    subjectId,
                    classIds,
                    totalLessons,
                    credit,
                    strategyId,
                    customStrategy,
                  };
                  runGenerateAnimation();
                  onSubmit("in_progress", data);
                }}
                className="px-4 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1 text-[0.8125rem]"
              >
                <Sparkles size={14} /> 确认上架
              </button>
            </div>
          </div>
        </div>
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
  step: 1 | 2 | 3;
  onJump: (s: 1 | 2 | 3) => void;
}) {
  const items: Array<{ k: 1 | 2 | 3; label: string }> = [
    { k: 1, label: "选择课程" },
    { k: 2, label: "教学策略" },
    { k: 3, label: "预览并生成" },
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
  onSaveDraft,
  onPublish,
}: {
  step: 1 | 2 | 3;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
}) {
  return (
    <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between">
      <div className="text-slate-400">Step {step} / 3</div>
      <div className="flex items-center gap-2">
        {step > 1 && (
          <button
            onClick={onPrev}
            className="px-4 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-600"
          >
            上一步
          </button>
        )}
        {step < 3 ? (
          <button
            disabled={!canNext}
            onClick={onNext}
            className={`px-4 py-1.5 rounded-md flex items-center gap-1 ${
              canNext
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            下一步
          </button>
        ) : (
          <>
            <button
              onClick={onSaveDraft}
              className="px-4 py-1.5 rounded-md border border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              保存为草稿
            </button>
            <button
              onClick={onPublish}
              className="px-4 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1"
            >
              <Sparkles size={14} /> 立即上架
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
  classIds,
  totalLessons,
  credit,
  onChangeProfession,
  onChangeSubject,
  onChangeCourse,
  onChangeClassIds,
  onChangeTotalLessons,
  onChangeCredit,
}: {
  professionId: string;
  subjectId: string;
  courseId: string;
  classIds: string[];
  totalLessons: number;
  credit: number;
  onChangeProfession: (id: string) => void;
  onChangeSubject: (id: string) => void;
  onChangeCourse: (id: string) => void;
  onChangeClassIds: (ids: string[]) => void;
  onChangeTotalLessons: (n: number) => void;
  onChangeCredit: (n: number) => void;
}) {
  const profession = professionById(professionId);
  const course = courses.find((c) => c.id === courseId);

  const relatedSubjects = subjects.filter((s) => s.professionId === professionId);
  const relatedCourses = courses.filter(
    (c) => c.professionId === professionId && c.subjectId === subjectId,
  );
  const relatedClasses = useMemo(
    () => classes.filter((c) => c.professionId === professionId && c.status === "in_session"),
    [professionId],
  );

  const toggleClass = (id: string) => {
    onChangeClassIds(
      classIds.includes(id) ? classIds.filter((c) => c !== id) : [...classIds, id],
    );
  };
  const toggleAll = () => {
    if (classIds.length === relatedClasses.length) {
      onChangeClassIds([]);
    } else {
      onChangeClassIds(relatedClasses.map((c) => c.id));
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="text-slate-400 text-[0.6875rem] mb-4">
          学科 → 专业 → 课程
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-slate-500 mb-2">学科</div>
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
            <div className="text-slate-500 mb-2">专业</div>
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
              <InfoCell k="知识点" v={`${course.knowledgeNodeIds.length} 个`} />
              <InfoCell k="挂载资源" v={`${resourcesByCourse(course.id).length} 个`} />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                <div className="text-amber-600 text-[0.6875rem] font-medium">课时数（必填）</div>
                <input
                  type="number"
                  min={0}
                  value={totalLessons}
                  onChange={(e) => onChangeTotalLessons(Number(e.target.value) || 0)}
                  className="text-amber-800 outline-none bg-transparent w-16 font-semibold"
                />
              </div>
              <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                <div className="text-amber-600 text-[0.6875rem] font-medium">学分（必填）</div>
                <input
                  type="number"
                  min={0}
                  value={credit}
                  onChange={(e) => onChangeCredit(Number(e.target.value) || 0)}
                  className="text-amber-800 outline-none bg-transparent w-16 font-semibold"
                />
              </div>
            </div>
            {course.knowledgeNodeIds.length > 0 && (
              <div className="pt-2">
                <div className="text-[0.6875rem] text-slate-500 mb-1.5">关联知识点</div>
                <div className="flex flex-wrap gap-1.5">
                  {course.knowledgeNodeIds.map((nid) => {
                    const gn = graphNodeById(nid);
                    return gn ? (
                      <span key={nid} className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[0.6875rem]">
                        {gn.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {course.tags.map((t) => (
                <span key={t} className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[0.6875rem]">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* 授课班级多选 */}
          {relatedClasses.length > 0 && (
            <div className="border-t border-slate-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-slate-500 text-[0.6875rem]">授课班级</div>
                <button
                  type="button"
                  onClick={toggleAll}
                  className="text-indigo-600 text-[0.6875rem] hover:underline"
                >
                  {classIds.length === relatedClasses.length ? "取消全选" : "全选"}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {relatedClasses.map((cls) => {
                  const checked = classIds.includes(cls.id);
                  return (
                    <label
                      key={cls.id}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer transition text-[0.8125rem] ${
                        checked
                          ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleClass(cls.id)}
                        className="accent-indigo-600"
                      />
                      {cls.name}
                      <span className="text-slate-400 text-[0.6875rem]">{cls.studentCount}人</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 flex items-center justify-center text-slate-400 text-sm">
          请选择学科、专业与课程
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
}: {
  strategyId: string;
  onSelectStrategy: (id: string) => void;
  effective: StrategyOverride;
  onEdit: (patch: Partial<StrategyOverride>) => void;
}) {
  const matches = useMemo(() => {
    return teachingStrategies;
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <div className="text-slate-900 mb-3">标准教学策略</div>
        <div className="grid grid-cols-3 gap-3">
          {matches.map((strategy) => {
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
                <div className="mb-1">
                  <span className="text-slate-900">{strategy.name}</span>
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

/** 单个资源文件行 */
function ResourceRow({ r }: { r: { id: string; name: string; format: string; source: string; size: string } }) {
  return (
    <div className="flex items-center gap-2 text-[0.6875rem] px-2 py-1 rounded-md bg-emerald-50/60">
      <span className="text-slate-700 truncate flex-1">{r.name}</span>
      <span className="px-1 py-px rounded bg-blue-50 text-blue-600 text-[9px] border border-blue-100">{r.format}</span>
      <span className="text-slate-400 text-[10px]">{r.size}</span>
      <span className={`px-1 py-px rounded text-[9px] border ${
        r.source === "资源库"
          ? "bg-violet-50 text-violet-600 border-violet-100"
          : "bg-emerald-50 text-emerald-600 border-emerald-100"
      }`}>{r.source}</span>
    </div>
  );
}

// ==========================================================================
// Step 5 · 按课时预览骨架（可编辑）
// ==========================================================================

function Step5({
  draftLessons,
  setDraftLessons,
  course,
  classNames,
  totalLessons,
  credit,
}: {
  draftLessons: DraftSection[];
  setDraftLessons: React.Dispatch<React.SetStateAction<DraftSection[] | null>>;
  course: Course | undefined;
  classNames: string;
  totalLessons: number;
  credit: number;
}) {
  const allKnowledgeNodeIds = useMemo(() => {
    const ids = new Set<string>();
    draftLessons.forEach((l) => l.knowledgeNodeIds.forEach((id) => ids.add(id)));
    return ids.size;
  }, [draftLessons]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Categorized mock resources for each lesson
  const categorizedResources = useMemo(() => ({
    classroomContent: [
      { id: "rc-1", name: "组合体三视图讲义", format: "PDF", source: "资源库" as const, size: "6.2 MB" },
      { id: "rc-2", name: "形体分析法课件", format: "PPTX", source: "资源库" as const, size: "18.4 MB" },
      { id: "rc-3", name: "三视图绘制微课", format: "MP4", source: "资源库" as const, size: "22 MB" },
    ],
    homework: [
      { id: "rh-1", name: "课后作业模板", format: "PDF", source: "资源库" as const, size: "280 KB" },
      { id: "rh-2", name: "组合体练习题集", format: "DOCX", source: "资源库" as const, size: "1.1 MB" },
    ],
    reference: [
      { id: "rr-1", name: "思维导图-组合体", format: "PNG", source: "资源库" as const, size: "1.3 MB" },
      { id: "rr-2", name: "教学设计参考-三视图", format: "PDF", source: "个人上传" as const, size: "3.5 MB" },
    ],
    other: [
      { id: "ro-1", name: "课程思政素材包", format: "ZIP", source: "个人上传" as const, size: "8.7 MB" },
    ],
  }), []);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

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

  const mergeSelected = () => {
    const selectedLessons = draftLessons.filter((l) => selectedIds.has(l.id));
    if (selectedLessons.length < 2) return;
    const mergedNodes = [...new Set(selectedLessons.flatMap((l) => l.knowledgeNodeIds))];
    const firstIdx = draftLessons.findIndex((l) => l.id === selectedLessons[0].id);
    const merged: DraftSection = {
      id: `merged-${Date.now()}`,
      title: selectedLessons.map((l) => l.title.replace(/第\s*\d+\s*课时\s*·\s*/u, "")).join(" + "),
      plannedDate: selectedLessons[0].plannedDate,
      durationMinutes: selectedLessons.reduce((s, l) => s + l.durationMinutes, 0),
      knowledgeNodeIds: mergedNodes,
    };
    setDraftLessons((prev) => {
      if (!prev) return prev;
      const filtered = prev.filter((l) => !selectedIds.has(l.id));
      filtered.splice(firstIdx, 0, merged);
      return filtered;
    });
    setSelectedIds(new Set());
  };

  const splitSelected = () => {
    const toSplit = draftLessons.find((l) => selectedIds.has(l.id));
    if (!toSplit || toSplit.knowledgeNodeIds.length < 2) return;
    const idx = draftLessons.findIndex((l) => l.id === toSplit.id);
    const mid = Math.ceil(toSplit.knowledgeNodeIds.length / 2);
    const partA: DraftSection = {
      ...toSplit,
      id: `split-a-${Date.now()}`,
      knowledgeNodeIds: toSplit.knowledgeNodeIds.slice(0, mid),
    };
    const partB: DraftSection = {
      ...toSplit,
      id: `split-b-${Date.now()}`,
      title: `课时 · ${toSplit.knowledgeNodeIds.slice(mid).map((n) => graphNodeById(n)?.name ?? n).join("/")}`,
      knowledgeNodeIds: toSplit.knowledgeNodeIds.slice(mid),
    };
    setDraftLessons((prev) => {
      if (!prev) return prev;
      const arr = [...prev];
      arr.splice(idx, 1, partA, partB);
      return arr;
    });
    setSelectedIds(new Set());
  };

  const resourceCount = course ? resourcesByCourse(course.id).length : 0;

  return (
    <div className="space-y-3">
      {/* 总览栏 */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="text-slate-900 font-medium mb-3">教学计划总览</div>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <div className="text-slate-400 text-[0.6875rem]">课程</div>
            <div className="text-slate-800">{course ? `《${course.name}》` : "—"}</div>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <div className="text-slate-400 text-[0.6875rem]">授课班级</div>
            <div className="text-slate-800">{classNames || "未选择"}</div>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <div className="text-slate-400 text-[0.6875rem]">课时数</div>
            <div className="text-slate-800">{totalLessons || draftLessons.length}</div>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <div className="text-slate-400 text-[0.6875rem]">学分</div>
            <div className="text-slate-800">{credit}</div>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <div className="text-slate-400 text-[0.6875rem]">知识点数量</div>
            <div className="text-slate-800">{course?.knowledgeNodeIds.length ?? 0} 个</div>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <div className="text-slate-400 text-[0.6875rem]">挂载资源数量</div>
            <div className="text-slate-800">{resourceCount} 个</div>
          </div>
        </div>
      </div>

      {/* 合并/拆分操作栏 */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-100">
          <span className="text-indigo-700 text-[0.8125rem]">已选择 {selectedIds.size} 个课时</span>
          {selectedIds.size >= 2 && (
            <button
              type="button"
              onClick={mergeSelected}
              className="px-3 py-1 rounded-md bg-indigo-600 text-white text-[0.8125rem] hover:bg-indigo-700"
            >
              合并为一个课时
            </button>
          )}
          {selectedIds.size === 1 && (
            <button
              type="button"
              onClick={splitSelected}
              className="px-3 py-1 rounded-md bg-indigo-600 text-white text-[0.8125rem] hover:bg-indigo-700"
            >
              拆分
            </button>
          )}
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            className="px-3 py-1 rounded-md border border-slate-200 text-slate-600 text-[0.8125rem] hover:bg-slate-50"
          >
            取消选择
          </button>
        </div>
      )}

      <div className="space-y-2">
        {draftLessons.map((sec, idx) => {
          const isSelected = selectedIds.has(sec.id);
          return (
            <div
              key={sec.id}
              className={`bg-white rounded-xl border p-4 hover:border-indigo-200 transition ${
                isSelected ? "border-indigo-400 ring-1 ring-indigo-100" : "border-slate-200"
              }`}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(sec.id)}
                  className="accent-indigo-600"
                />
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

              {/* 知识点 */}
              <div className="mt-3">
                <div className="text-[0.6875rem] text-slate-500 mb-1">关联知识点</div>
                {sec.knowledgeNodeIds.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {sec.knowledgeNodeIds.map((nid) => {
                      const gn = graphNodeById(nid);
                      return (
                        <span
                          key={`${sec.id}-${nid}`}
                          className="group relative text-[0.6875rem] px-2 py-0.5 rounded-md border border-slate-200 bg-slate-50 text-slate-700 max-w-[14rem] truncate flex items-center gap-1"
                        >
                          {gn?.name ?? nid}
                          <button
                            type="button"
                            onClick={() => {
                              updateLesson(idx, {
                                knowledgeNodeIds: sec.knowledgeNodeIds.filter((id) => id !== nid),
                              });
                            }}
                            className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 text-[0.625rem]"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-[0.8125rem] text-slate-400">暂未关联知识点</div>
                )}
              </div>

              {/* 挂载资源（分类展示） */}
              <div className="mt-2">
                <div className="text-[0.6875rem] text-slate-500 mb-1">挂载资源</div>
                {/* 课堂内容 */}
                <div className="mb-1.5">
                  <div className="text-[0.625rem] font-medium text-indigo-600 mb-0.5 px-1">课堂内容</div>
                  {categorizedResources.classroomContent.map((r) => (
                    <ResourceRow key={r.id} r={r} />
                  ))}
                </div>
                {/* 课堂作业 */}
                <div className="mb-1.5">
                  <div className="text-[0.625rem] font-medium text-amber-600 mb-0.5 px-1">课堂作业</div>
                  {categorizedResources.homework.map((r) => (
                    <ResourceRow key={r.id} r={r} />
                  ))}
                </div>
                {/* 教学设计参考资料 */}
                <div className="mb-1.5">
                  <div className="text-[0.625rem] font-medium text-emerald-600 mb-0.5 px-1">教学设计参考资料</div>
                  {categorizedResources.reference.map((r) => (
                    <ResourceRow key={r.id} r={r} />
                  ))}
                </div>
                {/* 其它 */}
                <div className="mb-1.5">
                  <div className="text-[0.625rem] font-medium text-slate-500 mb-0.5 px-1">其它</div>
                  {categorizedResources.other.map((r) => (
                    <ResourceRow key={r.id} r={r} />
                  ))}
                </div>
              </div>

              {sec.aiAdjustment && (
                <div className="mt-2 flex items-start gap-2">
                  <AiBadge>AI 调整</AiBadge>
                  <span className="text-slate-600 leading-relaxed">{sec.aiAdjustment}</span>
                </div>
              )}
            </div>
          );
        })}
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
