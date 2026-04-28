import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Layers,
  Loader2,
  Network,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import {
  classes,
  classProfiles,
  courses,
  edgesByProfession,
  nodesByProfession,
  professions,
  subjects,
  teachingPlans,
  teachingStrategies,
} from "@mock";
import type {
  ClassProfile,
  Course,
  GraphNode,
  PlanChapter,
  TeachingStrategy,
} from "@mock";
import {
  classById,
  classProfileByClassId,
  professionById,
  subjectById,
  teacherById,
} from "../data/lookups";
import {
  clusterColor,
  colorOfCluster,
  colorOfGraphNodeLayer,
} from "../data/graphLayout";
import { AiBadge, PageHeader } from "./Layout";
import {
  GraphNodeShapeWizard,
  KnowledgeGraphCanvas,
  truncateGraphLabel,
} from "./knowledgeGraph";

/** 向导状态中，单个班级画像的本地编辑副本（若未编辑则为 undefined） */
interface ClassProfileOverride {
  strengths: string[];
  weaknesses: string[];
  aiSummary: string;
}

/** 向导状态中，策略被教师二次修改后的本地值 */
interface StrategyOverride {
  paceSuggestion: string;
  difficultyCurve: string;
  activitySuggestion: string;
  strategyBrief: string;
}

// Step4 → Step5 过渡动画的任务清单（纯展示）
// 5 步合计约 3s，每步约 0.5–0.65s，带轻微时长抖动。
const GENERATION_TASKS: Array<{
  title: string;
  detail: string;
  durationMs: number;
}> = [
  {
    title: "解析知识图谱引用节点",
    detail: "匹配主图中的能力 / 知识点 / 课程与实训节点",
    durationMs: 600,
  },
  {
    title: "融合班级学情向量",
    detail: "结合所选班级的薄弱维度调整节奏",
    durationMs: 580,
  },
  {
    title: "套用教学策略曲线",
    detail: "按难度曲线与授课节奏划分单元",
    durationMs: 600,
  },
  {
    title: "生成章节与小节骨架",
    detail: "产出章节、小节和每节图谱路径初稿",
    durationMs: 610,
  },
  {
    title: "估算课时与授课日程",
    detail: "按学期日历自动铺排授课时间",
    durationMs: 610,
  },
];

/** 向导本地骨架（Step5 可编辑） */
interface DraftSection {
  id: string;
  title: string;
  plannedDate: string;
  durationMinutes: number;
  /** 本小节引用的图谱节点 id（用于 Step4 图谱溯源高亮） */
  knowledgeNodeIds: string[];
  /** AI 基于学情对此小节的调整说明（用于展示紫色徽标），可为空 */
  aiAdjustment?: string;
}

interface DraftChapter {
  id: string;
  title: string;
  summary?: string;
  sections: DraftSection[];
}

export function PlanWizard({
  onCancel,
  onSubmit,
  onGoToGraph,
}: {
  onCancel: () => void;
  onSubmit: () => void;
  onGoToGraph: () => void;
}) {
  // ==================== 基础选择（Step1） ====================
  const [professionId, setProfessionId] = useState<string>("prof-mech");
  const [subjectId, setSubjectId] = useState<string>("subj-mech-drawing");
  const [courseId, setCourseId] = useState<string>("course-mech-draw");

  // ==================== 班级 + 学情（Step2） ====================
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([
    "cls-mech-2301",
    "cls-mech-2302",
  ]);
  /** 本地编辑覆盖，key 是 classId */
  const [profileOverrides, setProfileOverrides] = useState<
    Record<string, ClassProfileOverride>
  >({});
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);

  // ==================== 策略（Step3） ====================
  const [strategyId, setStrategyId] = useState<string>("strat-li-personal");
  const [strategyOverride, setStrategyOverride] = useState<StrategyOverride | null>(
    null,
  );

  // ==================== 骨架（Step4） ====================
  const [draftChapters, setDraftChapters] = useState<DraftChapter[] | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // ==================== 步骤切换 ====================
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step4 → Step5 的 AI 生成假动画
  const [generating, setGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0); // 0-100
  const [genTaskIdx, setGenTaskIdx] = useState(0);
  const genTimersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => {
    return () => {
      for (const t of genTimersRef.current) clearTimeout(t);
    };
  }, []);

  const profession = useMemo(() => professionById(professionId), [professionId]);
  const subject = useMemo(() => subjectById(subjectId), [subjectId]);
  const course = useMemo(
    () => courses.find((c) => c.id === courseId),
    [courseId],
  );

  const selectedProfiles = useMemo(
    () =>
      selectedClassIds
        .map((id) => classProfileByClassId(id))
        .filter((x): x is ClassProfile => !!x),
    [selectedClassIds],
  );

  /** 取画像（考虑本地编辑覆盖） */
  const getEffectiveProfile = (classId: string): ClassProfile | undefined => {
    const base = classProfileByClassId(classId);
    if (!base) return undefined;
    const override = profileOverrides[classId];
    if (!override) return base;
    return {
      ...base,
      strengths: override.strengths,
      weaknesses: override.weaknesses,
      aiSummary: override.aiSummary,
    };
  };

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
      strategyBrief: synthStrategyBrief(strategyId, selectedClassIds),
    };
  }, [strategyOverride, baseStrategy, strategyId, selectedClassIds]);

  // 进入 Step4 时初始化骨架
  const ensureDraftBuilt = () => {
    if (draftChapters) return;
    const base = buildSkeletonFromCourse(courseId, selectedClassIds);
    setDraftChapters(base);
  };

  const canNext = (): boolean => {
    if (step === 1) {
      return !!course && !!profession?.hasKnowledgeGraph;
    }
    if (step === 2) return selectedClassIds.length > 0;
    if (step === 3) return !!strategyId;
    return true;
  };

  const goNext = () => {
    if (step === 3) {
      // 教学策略 → 预览并生成：先构造骨架，再走 AI 生成假动画
      ensureDraftBuilt();
      runGenerateAnimation();
      return;
    }
    if (step < 4) setStep((s) => (s + 1) as 1 | 2 | 3 | 4);
  };
  const goPrev = () => {
    if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3 | 4);
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
      setStep(4);
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
              setSelectedClassIds([]);
            }}
            onChangeSubject={(id) => {
              setSubjectId(id);
              const firstCourse = courses.find(
                (c) => c.subjectId === id && c.professionId === professionId,
              );
              setCourseId(firstCourse?.id ?? "");
            }}
            onChangeCourse={(id) => setCourseId(id)}
            onGoToGraph={onGoToGraph}
          />
        )}
        {step === 2 && (
          <Step2
            professionId={professionId}
            selectedClassIds={selectedClassIds}
            onToggleClass={(id) =>
              setSelectedClassIds((prev) =>
                prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
              )
            }
            profileOverrides={profileOverrides}
            setProfileOverrides={setProfileOverrides}
            editingProfileId={editingProfileId}
            setEditingProfileId={setEditingProfileId}
            getEffectiveProfile={getEffectiveProfile}
          />
        )}
        {step === 3 && (
          <Step3
            strategyId={strategyId}
            onSelectStrategy={(id) => {
              setStrategyId(id);
              setStrategyOverride(null);
            }}
            selectedClassIds={selectedClassIds}
            effective={effectiveStrategy}
            onEdit={(patch) =>
              setStrategyOverride((prev) => ({ ...effectiveStrategy, ...prev, ...patch }))
            }
          />
        )}
        {step === 4 && (
          <Step5
            draftChapters={draftChapters ?? []}
            setDraftChapters={setDraftChapters}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            course={course}
            professionId={professionId}
            selectedClassIds={selectedClassIds}
          />
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
          draftChapters={draftChapters ?? []}
          selectedClassIds={selectedClassIds}
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
  step: 1 | 2 | 3 | 4;
  onJump: (s: 1 | 2 | 3 | 4) => void;
}) {
  const items: Array<{ k: 1 | 2 | 3 | 4; label: string }> = [
    { k: 1, label: "选择教学范围" },
    { k: 2, label: "班级 · 学情" },
    { k: 3, label: "教学策略" },
    { k: 4, label: "预览并生成" },
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
  step: 1 | 2 | 3 | 4;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between">
      <div className="text-slate-400">Step {step} / 4</div>
      <div className="flex items-center gap-2">
        {step > 1 && (
          <button
            onClick={onPrev}
            className="px-4 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-600"
          >
            上一步
          </button>
        )}
        {step < 4 ? (
          <button
            disabled={!canNext}
            onClick={onNext}
            className={`px-4 py-1.5 rounded-md flex items-center gap-1 ${
              canNext
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            {step === 3 ? (
              <>
                <Sparkles size={14} /> 生成教学计划
              </>
            ) : (
              <>
                下一步 <ChevronRight size={14} />
              </>
            )}
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
// Step4 → Step5 · AI 生成骨架的假动画覆盖层
// ==========================================================================

function GenerationOverlay({
  progress,
  taskIdx,
  course,
  draftChapters,
  selectedClassIds,
}: {
  progress: number;
  taskIdx: number;
  course: Course | undefined;
  draftChapters: DraftChapter[];
  selectedClassIds: string[];
}) {
  const referencedNodeCount = useMemo(() => {
    const set = new Set<string>();
    for (const ch of draftChapters) {
      for (const sec of ch.sections) {
        for (const id of sec.knowledgeNodeIds) set.add(id);
      }
    }
    return set.size;
  }, [draftChapters]);

  const sectionCount = useMemo(
    () => draftChapters.reduce((acc, ch) => acc + ch.sections.length, 0),
    [draftChapters],
  );

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
                依据《{course?.name ?? "课程"}》· 引用{" "}
                <span className="text-indigo-600">{referencedNodeCount}</span>{" "}
                个图谱节点 · 结合{" "}
                <span className="text-indigo-600">{selectedClassIds.length}</span>{" "}
                个班级学情
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
            已建议 {draftChapters.length} 个章节 · {sectionCount} 个小节，稍后可在预览页继续调整
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
// Step 1 · 选择教学范围（知识图谱 + 专业 / 学科 / 课程）
// ==========================================================================

const SCOPE_GRAPH_H = 360;

function Step1Scope({
  professionId,
  subjectId,
  courseId,
  onChangeProfession,
  onChangeSubject,
  onChangeCourse,
  onGoToGraph,
}: {
  professionId: string;
  subjectId: string;
  courseId: string;
  onChangeProfession: (id: string) => void;
  onChangeSubject: (id: string) => void;
  onChangeCourse: (id: string) => void;
  onGoToGraph: () => void;
}) {
  const profession = professionById(professionId);
  const hasGraph = profession?.hasKnowledgeGraph ?? false;
  const course = courses.find((c) => c.id === courseId);
  const teacher = course ? teacherById(course.ownerTeacherId) : undefined;
  const relatedSubjects = subjects.filter((s) => s.professionId === professionId);
  const relatedCourses = courses.filter(
    (c) => c.professionId === professionId && c.subjectId === subjectId,
  );

  const nodes = nodesByProfession[professionId] ?? [];
  const edges = edgesByProfession[professionId] ?? [];
  const courseNodeSet = useMemo(
    () => new Set(course ? [course.id, ...course.knowledgeNodeIds] : []),
    [course],
  );

  const [hiddenClusters, setHiddenClusters] = useState<Set<string>>(
    () => new Set(),
  );
  const graphRef = useRef<HTMLDivElement>(null);
  const [graphViewport, setGraphViewport] = useState({ w: 600, h: SCOPE_GRAPH_H });

  useEffect(() => {
    setHiddenClusters(new Set());
  }, [professionId]);

  useEffect(() => {
    const el = graphRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        if (e.contentRect.width > 2 && e.contentRect.height > 2) {
          setGraphViewport({
            w: Math.round(e.contentRect.width),
            h: Math.round(e.contentRect.height),
          });
        }
      }
    });
    ro.observe(el);
    setGraphViewport({
      w: Math.round(el.clientWidth || 600),
      h: Math.round(el.clientHeight || SCOPE_GRAPH_H),
    });
    return () => ro.disconnect();
  }, [professionId, nodes.length]);

  const visibleNodes = useMemo(
    () => nodes.filter((n) => !hiddenClusters.has(n.cluster)),
    [nodes, hiddenClusters],
  );
  const visibleNodeIds = useMemo(
    () => new Set(visibleNodes.map((n) => n.id)),
    [visibleNodes],
  );
  const visibleEdges = useMemo(
    () => edges.filter((e) => visibleNodeIds.has(e.from) && visibleNodeIds.has(e.to)),
    [edges, visibleNodeIds],
  );

  const clustersInGraph = useMemo(() => {
    const s = new Set<string>();
    for (const n of nodes) s.add(n.cluster);
    return Array.from(s);
  }, [nodes]);

  const toggleCluster = useCallback((name: string) => {
    setHiddenClusters((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const showAllClusters = useCallback(() => setHiddenClusters(new Set()), []);

  // 节点分类统计（课程挂载）
  const mountedTypeStats = useMemo(() => {
    let knowledge = 0;
    let ability = 0;
    let activity = 0;
    for (const n of nodes) {
      if (courseNodeSet.has(n.id)) {
        if (n.layer === "knowledge") knowledge += 1;
        else if (n.layer === "ability") ability += 1;
        else if (n.layer === "courseOrTraining") activity += 1;
      }
    }
    return { knowledge, ability, activity };
  }, [nodes, courseNodeSet]);

  return (
    <div className="space-y-4">
      {/* ── 上部：知识图谱 ── */}
      <div className="grid grid-cols-12 gap-4">
        {/* 图谱画布区 */}
        <div
          className="col-span-8 flex flex-col overflow-hidden bg-white rounded-xl border border-slate-200"
          style={{ height: SCOPE_GRAPH_H + 96 }}
        >
          <div className="shrink-0 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <div className="size-8 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Network size={16} />
            </div>
            <div className="leading-tight flex-1">
              <div className="text-slate-900">知识图谱 · AI 规划教学路径</div>
              <div className="text-slate-500 text-[0.6875rem]">
                高亮节点 = 课程推荐路径 · 灰色 = 暂不纳入本课程范围
              </div>
            </div>
            {hasGraph && course && (
              <AiBadge>
                推荐路径 {courseNodeSet.size} / {nodes.length} 节点
              </AiBadge>
            )}
          </div>

          {/* 簇图例 */}
          {nodes.length > 0 && (
            <div className="shrink-0 border-b border-slate-100 px-3 py-2">
              <div className="text-[0.625rem] text-slate-400 mb-1">
                点击图例可显示 / 隐藏该知识簇
              </div>
              <div className="flex flex-wrap items-center gap-1.5 max-h-16 overflow-y-auto pr-0.5">
                {hiddenClusters.size > 0 && (
                  <button
                    type="button"
                    onClick={showAllClusters}
                    className="shrink-0 text-[0.6875rem] text-indigo-600 hover:text-indigo-800"
                  >
                    全部显示
                  </button>
                )}
                {clustersInGraph.map((k) => {
                  const off = hiddenClusters.has(k);
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => toggleCluster(k)}
                      title={off ? "点击在图中显示" : "点击在图中隐藏"}
                      className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.6875rem] transition ${
                        off
                          ? "border-slate-200 bg-slate-50/90 line-through opacity-50"
                          : "border-slate-200 bg-slate-50/90 hover:border-indigo-300"
                      }`}
                    >
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{
                          background: clusterColor[k] ?? colorOfCluster(k),
                          opacity: off ? 0.4 : 1,
                        }}
                      />
                      <span className="text-slate-600">{k}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 图谱主体 */}
          <div ref={graphRef} className="relative min-h-0 flex-1 w-full">
            {!hasGraph ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-400">
                <Network size={32} className="opacity-30" />
                <span>该专业尚未建设知识图谱</span>
              </div>
            ) : nodes.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                暂无图谱数据
              </div>
            ) : visibleNodes.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                当前已隐藏全部分簇，请点图例或「全部显示」
              </div>
            ) : (
              <KnowledgeGraphCanvas
                nodes={visibleNodes}
                edges={visibleEdges}
                width={graphViewport.w}
                height={graphViewport.h}
                renderEdge={(e, a, b) => {
                  const bothMounted =
                    courseNodeSet.has(e.from) && courseNodeSet.has(e.to);
                  return (
                    <line
                      x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                      stroke={bothMounted ? "#c7d2fe" : "#e2e8f0"}
                      strokeWidth={bothMounted ? 1.25 : 0.8}
                    />
                  );
                }}
                renderNode={({ node, x, y }) => {
                  const mounted = courseNodeSet.has(node.id);
                  const color = colorOfGraphNodeLayer(node);
                  return (
                    <g style={{ pointerEvents: "none" }}>
                      <GraphNodeShapeWizard
                        type={node.nodeType}
                        x={x} y={y}
                        color={mounted ? color : "#e2e8f0"}
                        muted={!mounted}
                      />
                      {mounted && (
                        <text
                          x={x} y={y + 22}
                          textAnchor="middle" fontSize={10} fill="#334155"
                        >
                          {truncateGraphLabel(node.name, 6)}
                        </text>
                      )}
                    </g>
                  );
                }}
              />
            )}
          </div>
        </div>

        {/* 右侧：图谱摘要 + 课程信息 */}
        <div className="col-span-4 flex flex-col gap-3">
          {/* 挂载节点类型统计 */}
          {hasGraph && course && courseNodeSet.size > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AiBadge>AI 路径摘要</AiBadge>
              </div>
              <p className="text-slate-700 leading-relaxed">
                已从《{course.name}》的{" "}
                <span className="text-indigo-700">{courseNodeSet.size}</span>{" "}
                个挂载节点中识别教学路径，AI 将据此生成章节骨架。
              </p>
              <div className="mt-3 flex items-center gap-3 text-[0.6875rem] text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <span className="size-2.5 rounded-full bg-indigo-500" />
                  知识点 {mountedTypeStats.knowledge}
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="size-2.5 rounded-full bg-emerald-500" />
                  能力 {mountedTypeStats.ability}
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="size-2.5 rounded-full bg-amber-500" />
                  课程/实训 {mountedTypeStats.activity}
                </span>
              </div>
            </div>
          )}

          {/* 课程信息卡片 */}
          {course && hasGraph ? (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex-1">
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
                  <InfoCell k="推荐图谱节点" v={`${course.knowledgeNodeIds.length} 个`} />
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
          ) : !hasGraph ? (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={16} /> 该专业尚未建设知识图谱
              </div>
              <p className="text-amber-700 leading-relaxed">
                建立教学计划需要对应专业的知识图谱作为基础。请先去图谱页建设或导入
                {profession?.name ?? ""}专业的知识图谱。
              </p>
              <button
                onClick={onGoToGraph}
                className="mt-3 px-3 py-1.5 rounded-md bg-amber-600 text-white hover:bg-amber-700"
              >
                立即建设图谱
              </button>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl flex-1 flex items-center justify-center text-slate-400">
              请先选择有效的专业 / 学科 / 课程
            </div>
          )}
        </div>
      </div>

      {/* ── 下部：基础信息（专业 · 学科 · 课程） ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-slate-700 font-medium">基础信息</span>
          <span className="text-slate-400 text-[0.6875rem] px-2 py-0.5 rounded-md bg-slate-100">
            专业 · 学科 · 课程
          </span>
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
                  {!p.hasKnowledgeGraph ? "（未建图谱）" : ""}
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
// Step 2 · 班级 + 学情（可编辑）
// ==========================================================================

function Step2({
  professionId,
  selectedClassIds,
  onToggleClass,
  profileOverrides,
  setProfileOverrides,
  editingProfileId,
  setEditingProfileId,
  getEffectiveProfile,
}: {
  professionId: string;
  selectedClassIds: string[];
  onToggleClass: (id: string) => void;
  profileOverrides: Record<string, ClassProfileOverride>;
  setProfileOverrides: React.Dispatch<
    React.SetStateAction<Record<string, ClassProfileOverride>>
  >;
  editingProfileId: string | null;
  setEditingProfileId: (id: string | null) => void;
  getEffectiveProfile: (id: string) => ClassProfile | undefined;
}) {
  const related = classes.filter((c) => c.professionId === professionId);

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-4 bg-white rounded-xl border border-slate-200 p-4">
        <div className="text-slate-500 mb-2 flex items-center justify-between">
          <span>选择班级（可多选）</span>
          <span className="text-slate-400 text-[0.6875rem]">
            已选 {selectedClassIds.length}
          </span>
        </div>
        <ul className="space-y-2">
          {related.map((c) => {
            const profile = classProfileByClassId(c.id);
            const checked = selectedClassIds.includes(c.id);
            const risk = profile ? profile.scoreDistribution.stdDev >= 14 : false;
            return (
              <li key={c.id}>
                <label
                  className={`flex items-start gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition ${
                    checked
                      ? "border-indigo-300 bg-indigo-50/50"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleClass(c.id)}
                    className="mt-0.5 accent-indigo-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-900">{c.name}</span>
                      {risk && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-600">
                          <AlertTriangle size={10} /> 两极分化
                        </span>
                      )}
                    </div>
                    <div className="text-slate-500 mt-0.5">
                      {c.studentCount} 人 ·{" "}
                      {profile?.styleTag ?? "画像待生成"}
                      {profile && (
                        <>
                          {" · 均分 "}
                          {profile.scoreDistribution.averageScore}
                        </>
                      )}
                    </div>
                  </div>
                </label>
              </li>
            );
          })}
          {related.length === 0 && (
            <li className="text-slate-400 text-center py-8">该专业暂无班级</li>
          )}
        </ul>
      </div>
      <div className="col-span-8 space-y-3">
        {selectedClassIds.length === 0 && (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl h-48 flex items-center justify-center text-slate-400">
            请从左侧选择至少一个班级，系统会自动加载学情预览
          </div>
        )}
        {selectedClassIds.map((cid) => {
          const cls = classById(cid);
          const profile = getEffectiveProfile(cid);
          if (!cls || !profile) return null;
          const risk = profile.scoreDistribution.stdDev >= 14;
          const editing = editingProfileId === cid;
          return (
            <div
              key={cid}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden"
            >
              {risk && (
                <div className="px-4 py-2 bg-rose-50 border-b border-rose-100 text-rose-700 flex items-center gap-2">
                  <AlertTriangle size={14} />
                  {cls.name} 呈明显两极分化（σ=
                  {profile.scoreDistribution.stdDev}），建议在策略中启用「分层教学」
                </div>
              )}
              <div className="p-4 grid grid-cols-12 gap-4">
                <div className="col-span-4">
                  <div className="text-slate-500 mb-1">六维雷达</div>
                  <div className="h-40">
                    <ResponsiveContainer>
                      <RadarChart data={profile.radar} outerRadius={60}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis
                          dataKey="name"
                          tick={{ fontSize: 10, fill: "#64748b" }}
                        />
                        <Radar
                          dataKey="score"
                          stroke={risk ? "#f43f5e" : "#6366f1"}
                          fill={risk ? "#f43f5e" : "#6366f1"}
                          fillOpacity={0.3}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="col-span-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-slate-900">{cls.name}</span>
                      <span className="ml-2 text-slate-500">
                        {cls.studentCount} 人 · 均分{" "}
                        {profile.scoreDistribution.averageScore} · σ{" "}
                        {profile.scoreDistribution.stdDev}
                      </span>
                      <span
                        className={`ml-2 px-2 py-0.5 rounded-md ${
                          risk
                            ? "bg-rose-50 text-rose-700"
                            : "bg-indigo-50 text-indigo-700"
                        }`}
                      >
                        {profile.styleTag}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        setEditingProfileId(editing ? null : cid)
                      }
                      className="text-indigo-600 hover:underline"
                    >
                      {editing ? "完成编辑" : "编辑画像"}
                    </button>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <AiBadge>AI 画像摘要</AiBadge>
                      {editing && (
                        <span className="text-slate-400 text-[0.6875rem]">
                          可修改下方摘要与强弱项标签
                        </span>
                      )}
                    </div>
                    {editing ? (
                      <textarea
                        value={profile.aiSummary}
                        onChange={(e) =>
                          setProfileOverrides((prev) => ({
                            ...prev,
                            [cid]: {
                              ...ensureOverride(prev[cid], profile),
                              aiSummary: e.target.value,
                            },
                          }))
                        }
                        className="w-full text-slate-700 border border-slate-200 rounded-md p-2 min-h-[80px] leading-relaxed"
                      />
                    ) : (
                      <p className="text-slate-700 leading-relaxed">
                        {profile.aiSummary}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <TagEditor
                      label="强项"
                      color="emerald"
                      editing={editing}
                      items={profile.strengths}
                      onChange={(items) =>
                        setProfileOverrides((prev) => ({
                          ...prev,
                          [cid]: {
                            ...ensureOverride(prev[cid], profile),
                            strengths: items,
                          },
                        }))
                      }
                    />
                    <TagEditor
                      label="弱项"
                      color="rose"
                      editing={editing}
                      items={profile.weaknesses}
                      onChange={(items) =>
                        setProfileOverrides((prev) => ({
                          ...prev,
                          [cid]: {
                            ...ensureOverride(prev[cid], profile),
                            weaknesses: items,
                          },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ensureOverride(
  current: ClassProfileOverride | undefined,
  base: ClassProfile,
): ClassProfileOverride {
  if (current) return current;
  return {
    strengths: [...base.strengths],
    weaknesses: [...base.weaknesses],
    aiSummary: base.aiSummary,
  };
}

function TagEditor({
  label,
  color,
  items,
  editing,
  onChange,
}: {
  label: string;
  color: "emerald" | "rose";
  items: string[];
  editing: boolean;
  onChange: (items: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const chipCls =
    color === "emerald"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-rose-50 text-rose-700";
  return (
    <div>
      <div className="text-slate-500 mb-1.5">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {items.length === 0 && <span className="text-slate-400">—</span>}
        {items.map((s) => (
          <span
            key={s}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${chipCls}`}
          >
            {s}
            {editing && (
              <button
                onClick={() => onChange(items.filter((x) => x !== s))}
                className="hover:text-slate-800"
                aria-label="删除"
              >
                <X size={12} />
              </button>
            )}
          </span>
        ))}
        {editing && (
          <span className="inline-flex items-center gap-1">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && draft.trim()) {
                  onChange([...items, draft.trim()]);
                  setDraft("");
                }
              }}
              placeholder="输入后回车"
              className="border border-slate-200 rounded-md px-2 py-0.5 w-28"
            />
          </span>
        )}
      </div>
    </div>
  );
}

// ==========================================================================
// Step 3 · 教学策略（可编辑）
// ==========================================================================

function Step3({
  strategyId,
  onSelectStrategy,
  selectedClassIds,
  effective,
  onEdit,
}: {
  strategyId: string;
  onSelectStrategy: (id: string) => void;
  selectedClassIds: string[];
  effective: StrategyOverride;
  onEdit: (patch: Partial<StrategyOverride>) => void;
}) {
  const matches = useMemo(() => {
    return teachingStrategies
      .map((s) => ({
        strategy: s,
        score: computeStrategyMatch(s, selectedClassIds),
      }))
      .sort((a, b) => b.score - a.score);
  }, [selectedClassIds]);

  const [notice, setNotice] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="text-slate-900">候选策略</div>
          <AiBadge>AI 匹配度基于所选班级学情计算</AiBadge>
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
// Step 4 · 图谱溯源（展示 AI 从知识图谱抽取的教学路径）
// ==========================================================================

const WIZARD_GRAPH_W = 760;
const WIZARD_GRAPH_H = 460;

function Step4Graph({
  course,
  professionId,
  draftChapters,
  setDraftChapters,
  selectedClassIds,
}: {
  course: Course | undefined;
  professionId: string;
  draftChapters: DraftChapter[];
  setDraftChapters: React.Dispatch<React.SetStateAction<DraftChapter[] | null>>;
  selectedClassIds: string[];
}) {
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(
    draftChapters[0]?.id ?? null,
  );
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hiddenClusters, setHiddenClusters] = useState<Set<string>>(
    () => new Set(),
  );

  const nodes = nodesByProfession[professionId] ?? [];
  const edges = edgesByProfession[professionId] ?? [];

  useEffect(() => {
    setHiddenClusters(new Set());
  }, [professionId]);

  const visibleNodes = useMemo(
    () => nodes.filter((n) => !hiddenClusters.has(n.cluster)),
    [nodes, hiddenClusters],
  );
  const visibleNodeIds = useMemo(
    () => new Set(visibleNodes.map((n) => n.id)),
    [visibleNodes],
  );
  const visibleEdges = useMemo(
    () =>
      edges.filter(
        (e) => visibleNodeIds.has(e.from) && visibleNodeIds.has(e.to),
      ),
    [edges, visibleNodeIds],
  );

  const toggleCluster = useCallback((name: string) => {
    setHiddenClusters((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const showAllClusters = useCallback(() => {
    setHiddenClusters(new Set());
  }, []);

  const wizardGraphRef = useRef<HTMLDivElement>(null);
  const [graphViewport, setGraphViewport] = useState({
    w: WIZARD_GRAPH_W,
    h: 400,
  });

  useEffect(() => {
    const el = wizardGraphRef.current;
    if (!el) return;
    const apply = (w: number, h: number) => {
      if (w < 2 || h < 2) return;
      setGraphViewport({ w: Math.round(w), h: Math.round(h) });
    };
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) apply(e.contentRect.width, e.contentRect.height);
    });
    ro.observe(el);
    apply(el.clientWidth, el.clientHeight);
    return () => ro.disconnect();
  }, [professionId, nodes.length]);

  // 本计划引用的全部节点
  const referencedIds = useMemo(() => {
    const set = new Set<string>();
    for (const ch of draftChapters) {
      for (const sec of ch.sections) {
        for (const id of sec.knowledgeNodeIds) set.add(id);
      }
    }
    return set;
  }, [draftChapters]);

  // 当前选中章节焦点节点
  const focusIds = useMemo(() => {
    const set = new Set<string>();
    if (!selectedChapterId) return set;
    const ch = draftChapters.find((x) => x.id === selectedChapterId);
    if (!ch) return set;
    for (const sec of ch.sections) {
      for (const id of sec.knowledgeNodeIds) set.add(id);
    }
    return set;
  }, [selectedChapterId, draftChapters]);

  const courseNodeSet = useMemo(() => {
    if (!course) return new Set<string>();
    return new Set([course.id, ...course.knowledgeNodeIds]);
  }, [course]);

  // 簇覆盖度
  const clusterStats = useMemo(() => {
    const all = new Map<string, number>();
    const cited = new Map<string, number>();
    for (const n of nodes) {
      all.set(n.cluster, (all.get(n.cluster) ?? 0) + 1);
      if (referencedIds.has(n.id)) {
        cited.set(n.cluster, (cited.get(n.cluster) ?? 0) + 1);
      }
    }
    const rows: Array<{ cluster: string; cited: number; total: number }> = [];
    for (const [c, total] of all.entries()) {
      rows.push({ cluster: c, cited: cited.get(c) ?? 0, total });
    }
    rows.sort((a, b) => b.cited - a.cited);
    return rows;
  }, [nodes, referencedIds]);

  // 节点分类统计
  const typeStats = useMemo(() => {
    let ability = 0;
    let knowledge = 0;
    let activity = 0;
    for (const n of nodes) {
      if (referencedIds.has(n.id)) {
        if (n.layer === "knowledge") knowledge += 1;
        else if (n.layer === "ability") ability += 1;
        else if (n.layer === "courseOrTraining") activity += 1;
      }
    }
    return { ability, knowledge, activity };
  }, [nodes, referencedIds]);

  // 高亮 chip 时联动
  const onHoverChip = (id: string | null) => setHoveredNodeId(id);

  const toggleNodeInSelectedChapter = useCallback(
    (node: GraphNode) => {
      if (!selectedChapterId) return;
      setDraftChapters((prev) => {
        if (!prev) return prev;
        return prev.map((ch) => {
          if (ch.id !== selectedChapterId) return ch;
          const exists = ch.sections.some((sec) =>
            sec.knowledgeNodeIds.includes(node.id),
          );
          const sections = ch.sections.map((sec, idx) => {
            if (exists) {
              return {
                ...sec,
                knowledgeNodeIds: sec.knowledgeNodeIds.filter((id) => id !== node.id),
              };
            }
            if (idx === 0) {
              return {
                ...sec,
                knowledgeNodeIds: [...sec.knowledgeNodeIds, node.id],
              };
            }
            return sec;
          });
          return { ...ch, sections };
        });
      });
    },
    [selectedChapterId, setDraftChapters],
  );

  const clustersInGraph = useMemo(() => {
    const set = new Set<string>();
    for (const n of nodes) set.add(n.cluster);
    return Array.from(set);
  }, [nodes]);

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* 左侧图谱 */}
      <div
        className="col-span-8 flex flex-col overflow-hidden bg-white rounded-xl border border-slate-200"
        style={{ height: WIZARD_GRAPH_H + 72 }}
      >
        <div className="shrink-0 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
          <div className="size-8 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Network size={16} />
          </div>
          <div className="leading-tight flex-1">
            <div className="text-slate-900">AI 正从知识图谱抽取教学路径</div>
            <div className="text-slate-500 text-[0.6875rem]">
              高亮实色节点 = 本计划引用 · 虚线外圈 = 当前选中章节 · 点击节点可加入/移出当前章节
            </div>
          </div>
          <AiBadge>引用 {referencedIds.size} / {nodes.length} 节点</AiBadge>
        </div>
        {nodes.length > 0 && (
          <div className="shrink-0 border-b border-slate-100 px-3 py-2">
            <div className="text-[0.625rem] text-slate-400 mb-1">
              点击图例可显示/隐藏该知识簇
            </div>
            <div className="flex max-h-20 flex-wrap items-center gap-1.5 overflow-y-auto pr-0.5">
              {hiddenClusters.size > 0 && (
                <button
                  type="button"
                  onClick={showAllClusters}
                  className="shrink-0 text-[0.6875rem] text-indigo-600 hover:text-indigo-800"
                >
                  全部显示
                </button>
              )}
              {clustersInGraph.map((k) => {
                const off = hiddenClusters.has(k);
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => toggleCluster(k)}
                    title={off ? "点击在图中显示" : "点击在图中隐藏"}
                    className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-left text-[0.6875rem] transition
                      ${
                        off
                          ? "border-slate-200 bg-slate-50/90 line-through opacity-50"
                          : "border-slate-200 bg-slate-50/90 hover:border-indigo-300"
                      }`}
                  >
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{
                        background: clusterColor[k] ?? colorOfCluster(k),
                        opacity: off ? 0.4 : 1,
                      }}
                    />
                    <span className="text-slate-600">{k}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <div
          ref={wizardGraphRef}
          className="relative min-h-0 flex-1 w-full"
        >
          {nodes.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
              该专业尚未建设知识图谱
            </div>
          ) : visibleNodes.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
              当前已隐藏全部分簇，请点图例或「全部显示」
            </div>
          ) : (
            <KnowledgeGraphCanvas
                nodes={visibleNodes}
                edges={visibleEdges}
                width={graphViewport.w}
                height={graphViewport.h}
                focusNodeId={hoveredNodeId}
                onNodeClick={toggleNodeInSelectedChapter}
                renderEdge={(e, a, b) => {
                  const bothCited =
                    referencedIds.has(e.from) && referencedIds.has(e.to);
                  return (
                    <line
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      stroke={bothCited ? "#c7d2fe" : "#e2e8f0"}
                      strokeWidth={bothCited ? 1.25 : 0.8}
                    />
                  );
                }}
                renderNode={({ node, x, y }) => {
                  const cited = referencedIds.has(node.id);
                  const isFocus = focusIds.has(node.id);
                  const isHovered = hoveredNodeId === node.id;
                  const isCourseMounted = courseNodeSet.has(node.id);
                  const color = colorOfGraphNodeLayer(node);
                  return (
                    <g>
                      {isFocus && (
                        <circle
                          cx={x}
                          cy={y}
                          r={20}
                          fill="none"
                          stroke="#6366f1"
                          strokeDasharray="3 3"
                        />
                      )}
                      {isHovered && (
                        <circle
                          cx={x}
                          cy={y}
                          r={24}
                          fill="none"
                          stroke="#1e293b"
                          strokeWidth={1.2}
                        />
                      )}
                      <GraphNodeShapeWizard
                        type={node.nodeType}
                        x={x}
                        y={y}
                        color={cited ? color : "#e2e8f0"}
                        muted={!cited && !isCourseMounted}
                      />
                      {(cited || isHovered) && (
                        <text
                          x={x}
                          y={y + 22}
                          textAnchor="middle"
                          fontSize={10}
                          fill={cited ? "#334155" : "#94a3b8"}
                        >
                          {truncateGraphLabel(node.name, 6)}
                        </text>
                      )}
                    </g>
                  );
                }}
              />
          )}
        </div>
      </div>

      {/* 右侧溯源面板 */}
      <div className="col-span-4 space-y-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AiBadge>AI 溯源摘要</AiBadge>
          </div>
          <p className="text-slate-700 leading-relaxed">
            AI 从《{course?.name ?? "课程"}》挂载的{" "}
            <span className="text-indigo-700">{courseNodeSet.size}</span>{" "}
            个图谱节点中，结合{" "}
            <span className="text-indigo-700">{selectedClassIds.length}</span>{" "}
            个选定班级的学情，抽取出{" "}
            <span className="text-indigo-700">{referencedIds.size}</span>{" "}
            个核心节点、构建出{" "}
            <span className="text-indigo-700">{draftChapters.length}</span>{" "}
            个章节的教学路径。
          </p>
          <div className="mt-3 flex items-center gap-3 text-[0.6875rem] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <span className="size-2.5 rounded-full bg-indigo-500" />
              知识点 {typeStats.knowledge}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="size-2.5 rounded-full bg-emerald-500" />
              能力 {typeStats.ability}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="size-2.5 rounded-full bg-amber-500" />
              课程/实训 {typeStats.activity}
            </span>
          </div>
        </div>

        {/* 章节 ↔ 节点映射 */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-100 text-slate-500 text-[0.75rem]">
            章节 ↔ 节点映射（点击查看节点）
          </div>
          <div className="max-h-[260px] overflow-auto divide-y divide-slate-100">
            {draftChapters.map((ch) => {
              const chNodeIds = new Set<string>();
              for (const sec of ch.sections) {
                for (const id of sec.knowledgeNodeIds) chNodeIds.add(id);
              }
              const expanded = selectedChapterId === ch.id;
              return (
                <div key={ch.id}>
                  <button
                    onClick={() =>
                      setSelectedChapterId(expanded ? null : ch.id)
                    }
                    className={`w-full px-4 py-2.5 flex items-center gap-2 text-left transition ${
                      expanded ? "bg-indigo-50/60" : "hover:bg-slate-50"
                    }`}
                  >
                    {expanded ? (
                      <ChevronDown size={14} className="text-slate-400" />
                    ) : (
                      <ChevronRight size={14} className="text-slate-400" />
                    )}
                    <span className="flex-1 text-slate-800 truncate">
                      {ch.title}
                    </span>
                    <span className="text-slate-500 text-[0.6875rem]">
                      {chNodeIds.size} 节点 / {ch.sections.length} 小节
                    </span>
                  </button>
                  {expanded && (
                    <div className="px-4 pb-3 space-y-2">
                      {ch.sections.map((sec) => (
                        <div
                          key={sec.id}
                          className="rounded-lg border border-slate-100 p-2"
                        >
                          <div className="text-slate-800 text-[0.75rem] mb-1 truncate">
                            {sec.title}
                          </div>
                          {sec.knowledgeNodeIds.length === 0 ? (
                            <span className="text-slate-400 text-[0.6875rem]">
                              暂未挂载节点
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {sec.knowledgeNodeIds.map((nid) => {
                                const n = nodes.find((x) => x.id === nid);
                                if (!n) return null;
                                return (
                                  <button
                                    key={nid}
                                    onMouseEnter={() => onHoverChip(nid)}
                                    onMouseLeave={() => onHoverChip(null)}
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-[0.6875rem] text-slate-700 max-w-full"
                                  >
                                    <span
                                      className="size-1.5 rounded-full shrink-0"
                                      style={{
                                        background: colorOfCluster(n.cluster),
                                      }}
                                    />
                                    <span className="truncate">{n.name}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {draftChapters.length === 0 && (
              <div className="px-4 py-6 text-slate-400 text-center">
                暂无章节
              </div>
            )}
          </div>
        </div>

        {/* 簇覆盖度 */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-100 text-slate-500 text-[0.75rem]">
            簇覆盖度（本计划引用 / 簇总节点）
          </div>
          <div className="max-h-[220px] overflow-auto px-4 py-2 space-y-2">
            {clusterStats.length === 0 && (
              <div className="text-slate-400 text-center py-4">暂无数据</div>
            )}
            {clusterStats.map((row) => {
              const pct = row.total === 0 ? 0 : (row.cited / row.total) * 100;
              return (
                <div key={row.cluster} className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full shrink-0"
                    style={{ background: colorOfCluster(row.cluster) }}
                  />
                  <span className="text-slate-700 text-[0.75rem] truncate w-20">
                    {row.cluster}
                  </span>
                  <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: colorOfCluster(row.cluster),
                      }}
                    />
                  </div>
                  <span className="text-slate-500 text-[0.6875rem] w-10 text-right">
                    {row.cited}/{row.total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// Step 5 · 骨架预览（可编辑）
// ==========================================================================

function Step5({
  draftChapters,
  setDraftChapters,
  collapsed,
  setCollapsed,
  course,
  professionId,
  selectedClassIds,
}: {
  draftChapters: DraftChapter[];
  setDraftChapters: React.Dispatch<React.SetStateAction<DraftChapter[] | null>>;
  collapsed: Record<string, boolean>;
  setCollapsed: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  course: Course | undefined;
  professionId: string;
  selectedClassIds: string[];
}) {
  const totalMinutes = draftChapters.reduce(
    (sum, ch) => sum + ch.sections.reduce((s, sec) => s + sec.durationMinutes, 0),
    0,
  );
  const totalSections = draftChapters.reduce(
    (sum, ch) => sum + ch.sections.length,
    0,
  );
  const totalHours = Math.round(totalMinutes / 45);

  const moveSection = (chIdx: number, secIdx: number, delta: -1 | 1) => {
    setDraftChapters((prev) => {
      if (!prev) return prev;
      const chapters = prev.map((c) => ({ ...c, sections: [...c.sections] }));
      const target = chapters[chIdx];
      const ni = secIdx + delta;
      if (ni < 0 || ni >= target.sections.length) return prev;
      const [moved] = target.sections.splice(secIdx, 1);
      target.sections.splice(ni, 0, moved);
      return chapters;
    });
  };

  const deleteSection = (chIdx: number, secIdx: number) => {
    setDraftChapters((prev) => {
      if (!prev) return prev;
      const chapters = prev.map((c) => ({ ...c, sections: [...c.sections] }));
      chapters[chIdx].sections.splice(secIdx, 1);
      return chapters;
    });
  };

  const updateSection = (
    chIdx: number,
    secIdx: number,
    patch: Partial<DraftSection>,
  ) => {
    setDraftChapters((prev) => {
      if (!prev) return prev;
      const chapters = prev.map((c) => ({ ...c, sections: [...c.sections] }));
      chapters[chIdx].sections[secIdx] = {
        ...chapters[chIdx].sections[secIdx],
        ...patch,
      };
      return chapters;
    });
  };

  const addSection = (chIdx: number) => {
    setDraftChapters((prev) => {
      if (!prev) return prev;
      const chapters = prev.map((c) => ({ ...c, sections: [...c.sections] }));
      const newId = `draft-${Date.now()}`;
      chapters[chIdx].sections.push({
        id: newId,
        title: "新小节",
        plannedDate: "2026-01-01",
        durationMinutes: 90,
        knowledgeNodeIds: [],
      });
      return chapters;
    });
  };

  return (
    <div className="space-y-3">
        <Step4Graph
          course={course}
          professionId={professionId}
          draftChapters={draftChapters}
          setDraftChapters={setDraftChapters}
          selectedClassIds={selectedClassIds}
        />
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-6">
          <Stat icon={<Layers size={14} />} label="章节" value={`${draftChapters.length}`} />
          <Stat icon={<Layers size={14} />} label="小节" value={`${totalSections}`} />
          <Stat icon={<Clock size={14} />} label="学时" value={`${totalHours}`} />
          <Stat
            icon={<Sparkles size={14} />}
            label="AI 调整"
            value={`${draftChapters
              .flatMap((c) => c.sections)
              .filter((s) => !!s.aiAdjustment).length}`}
          />
          <div className="flex-1" />
          <AiBadge>已根据所选班级学情自动调整</AiBadge>
        </div>
        {draftChapters.map((ch, chIdx) => {
          const isCollapsed = collapsed[ch.id];
          return (
            <div
              key={ch.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden"
            >
              <div className="flex items-center px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                <button
                  onClick={() =>
                    setCollapsed((prev) => ({ ...prev, [ch.id]: !prev[ch.id] }))
                  }
                  className="text-slate-900 flex items-center gap-2"
                >
                  <span className="size-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    {isCollapsed ? "+" : "−"}
                  </span>
                  {ch.title}
                </button>
                {ch.summary && (
                  <span className="ml-3 text-slate-500">· {ch.summary}</span>
                )}
                <div className="flex-1" />
                <span className="text-slate-400">
                  {ch.sections.length} 小节
                </span>
              </div>
              {!isCollapsed && (
                <div className="p-3 space-y-2">
                  {ch.sections.map((sec, secIdx) => (
                    <div
                      key={sec.id}
                      className="border border-slate-200 rounded-lg p-3 hover:border-indigo-200 transition"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          value={sec.title}
                          onChange={(e) =>
                            updateSection(chIdx, secIdx, {
                              title: e.target.value,
                            })
                          }
                          className="flex-1 border border-transparent hover:border-slate-200 focus:border-indigo-300 rounded-md px-2 py-1 text-slate-900 outline-none"
                        />
                        <input
                          type="date"
                          value={sec.plannedDate}
                          onChange={(e) =>
                            updateSection(chIdx, secIdx, {
                              plannedDate: e.target.value,
                            })
                          }
                          className="border border-slate-200 rounded-md px-2 py-1 text-slate-700"
                        />
                        <div className="flex items-center gap-1 border border-slate-200 rounded-md px-2 py-1">
                          <input
                            type="number"
                            value={sec.durationMinutes}
                            onChange={(e) =>
                              updateSection(chIdx, secIdx, {
                                durationMinutes:
                                  Number(e.target.value) || 0,
                              })
                            }
                            className="w-14 text-right outline-none text-slate-700"
                          />
                          <span className="text-slate-400">min</span>
                        </div>
                        <button
                          onClick={() => moveSection(chIdx, secIdx, -1)}
                          disabled={secIdx === 0}
                          className="size-7 rounded-md hover:bg-slate-100 disabled:opacity-30 text-slate-500 flex items-center justify-center"
                          title="上移"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          onClick={() => moveSection(chIdx, secIdx, 1)}
                          disabled={secIdx === ch.sections.length - 1}
                          className="size-7 rounded-md hover:bg-slate-100 disabled:opacity-30 text-slate-500 flex items-center justify-center"
                          title="下移"
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          onClick={() => deleteSection(chIdx, secIdx)}
                          className="size-7 rounded-md hover:bg-rose-50 text-rose-500 flex items-center justify-center"
                          title="删除"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      {sec.aiAdjustment && (
                        <div className="mt-2 flex items-start gap-2">
                          <AiBadge>AI 调整</AiBadge>
                          <span className="text-slate-600 leading-relaxed">
                            {sec.aiAdjustment}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addSection(chIdx)}
                    className="w-full flex items-center justify-center gap-1 py-2 border border-dashed border-slate-300 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-300"
                  >
                    <Plus size={14} /> 添加小节
                  </button>
                </div>
              )}
            </div>
          );
        })}
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

/** 合成策略简述（Step3 初值、Step4 右侧展示） */
function synthStrategyBrief(strategyId: string, classIds: string[]): string {
  const strategy = teachingStrategies.find((s) => s.id === strategyId);
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

/** 基于课程和所选班级，生成带 AI 调整标注的骨架 */
function buildSkeletonFromCourse(
  courseId: string,
  classIds: string[],
): DraftChapter[] {
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

  // 优先复用已有 plan 的 chapters
  const basePlan = teachingPlans.find(
    (p) => p.courseId === courseId && p.status !== "completed",
  );
  if (basePlan) {
    return basePlan.chapters.map((ch) =>
      cloneChapter(ch, hasRiskClass, riskClassName, courseId),
    );
  }

  // 兜底：通用 3 章骨架
  return fallbackSkeleton();
}

function cloneChapter(
  ch: PlanChapter,
  hasRiskClass: boolean,
  riskClassName: string | undefined,
  courseId: string,
): DraftChapter {
  return {
    id: ch.id,
    title: ch.title,
    summary: ch.summary,
    sections: ch.sections.map((s) => {
      const draft: DraftSection = {
        id: s.id,
        title: s.title,
        plannedDate: s.plannedDate,
        durationMinutes: s.durationMinutes,
        knowledgeNodeIds: [...s.knowledgeNodeIds],
      };
      const adj = pickAdjustment(s.id, courseId, hasRiskClass, riskClassName);
      if (adj) draft.aiAdjustment = adj;
      return draft;
    }),
  };
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

function fallbackSkeleton(): DraftChapter[] {
  return [
    {
      id: "draft-ch-1",
      title: "第1章 课程引入",
      summary: "建立课程目标与基础概念",
      sections: [
        {
          id: "draft-sec-1-1",
          title: "1.1 课程概述",
          plannedDate: "2026-02-23",
          durationMinutes: 90,
          knowledgeNodeIds: [],
        },
        {
          id: "draft-sec-1-2",
          title: "1.2 学习方法与评价体系",
          plannedDate: "2026-02-25",
          durationMinutes: 90,
          knowledgeNodeIds: [],
        },
      ],
    },
    {
      id: "draft-ch-2",
      title: "第2章 核心专题",
      sections: [
        {
          id: "draft-sec-2-1",
          title: "2.1 主题一",
          plannedDate: "2026-03-02",
          durationMinutes: 90,
          knowledgeNodeIds: [],
        },
        {
          id: "draft-sec-2-2",
          title: "2.2 主题二",
          plannedDate: "2026-03-04",
          durationMinutes: 90,
          knowledgeNodeIds: [],
        },
      ],
    },
    {
      id: "draft-ch-3",
      title: "第3章 综合应用",
      sections: [
        {
          id: "draft-sec-3-1",
          title: "3.1 综合实训",
          plannedDate: "2026-03-11",
          durationMinutes: 135,
          knowledgeNodeIds: [],
        },
      ],
    },
  ];
}
