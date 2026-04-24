import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
  ChevronRight,
  Clock,
  Layers,
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
  professions,
  subjects,
  teachingPlans,
  teachingStrategies,
} from "@mock";
import type {
  ClassProfile,
  Course,
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
import { AiBadge, PageHeader } from "./Layout";

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

/** 向导本地骨架（Step4 可编辑） */
interface DraftSection {
  id: string;
  title: string;
  plannedDate: string;
  durationMinutes: number;
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
    if (step === 3) ensureDraftBuilt();
    if (step < 4) setStep((s) => (s + 1) as 1 | 2 | 3 | 4);
  };
  const goPrev = () => {
    if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3 | 4);
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
          <Step1
            professionId={professionId}
            subjectId={subjectId}
            courseId={courseId}
            onChangeProfession={(id) => {
              setProfessionId(id);
              // 自动切到该专业下的第一个学科/课程
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
              setStrategyOverride(null); // 切策略时清掉本地覆盖
            }}
            selectedClassIds={selectedClassIds}
            effective={effectiveStrategy}
            onEdit={(patch) =>
              setStrategyOverride((prev) => ({ ...effectiveStrategy, ...prev, ...patch }))
            }
          />
        )}
        {step === 4 && (
          <Step4
            course={course}
            draftChapters={draftChapters ?? []}
            setDraftChapters={setDraftChapters}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            selectedClassIds={selectedClassIds}
            strategyBrief={effectiveStrategy.strategyBrief}
          />
        )}
      </div>
      <WizardFooter
        step={step}
        canNext={canNext()}
        onPrev={goPrev}
        onNext={goNext}
        onSubmit={onSubmit}
      />
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
    { k: 1, label: "选择学科 · 专业 · 课程" },
    { k: 2, label: "班级 · 学情预览" },
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
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition ${
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
            下一步 <ChevronRight size={14} />
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
// Step 1 · 专业 / 学科 / 课程
// ==========================================================================

function Step1({
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
  const relatedSubjects = subjects.filter((s) => s.professionId === professionId);
  const relatedCourses = courses.filter(
    (c) => c.professionId === professionId && c.subjectId === subjectId,
  );
  const course = courses.find((c) => c.id === courseId);
  const teacher = course ? teacherById(course.ownerTeacherId) : undefined;
  const hasGraph = profession?.hasKnowledgeGraph ?? false;

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-7 bg-white rounded-xl border border-slate-200 p-5 space-y-5">
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
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
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
        {!hasGraph && (
          <div className="mt-2 px-4 py-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
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
        )}
      </div>
      <div className="col-span-5">
        {course && hasGraph ? (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="h-32 bg-gradient-to-br from-indigo-500 via-indigo-400 to-violet-400 flex items-end p-4">
              <div className="text-white">
                <div className="opacity-80 text-[11px]">{profession?.college}</div>
                <div className="text-lg">《{course.name}》</div>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <div className="text-slate-700 leading-relaxed">
                {course.description}
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <InfoCell k="学时" v={`${course.totalHours} 学时`} />
                <InfoCell k="学分" v={`${course.credit} 学分`} />
                <InfoCell
                  k="挂载知识节点"
                  v={`${course.knowledgeNodeIds.length} 个`}
                />
                <InfoCell k="负责教师" v={teacher?.name ?? "—"} />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {course.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl h-48 flex items-center justify-center text-slate-400">
            请先选择有效的专业 / 学科 / 课程
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCell({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <div className="text-slate-400 text-[11px]">{k}</div>
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
          <span className="text-slate-400 text-[11px]">
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
                        <span className="text-slate-400 text-[11px]">
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
                <div className="text-slate-500 mb-2 text-[11px]">
                  {sourceLabel(strategy.source)}
                </div>
                <p className="text-slate-600 line-clamp-3 leading-relaxed">
                  {strategy.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {strategy.fitFor.slice(0, 3).map((f) => (
                    <span
                      key={f}
                      className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[11px]"
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
// Step 4 · 骨架预览（可编辑）
// ==========================================================================

function Step4({
  course,
  draftChapters,
  setDraftChapters,
  collapsed,
  setCollapsed,
  selectedClassIds,
  strategyBrief,
}: {
  course: Course | undefined;
  draftChapters: DraftChapter[];
  setDraftChapters: React.Dispatch<React.SetStateAction<DraftChapter[] | null>>;
  collapsed: Record<string, boolean>;
  setCollapsed: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  selectedClassIds: string[];
  strategyBrief: string;
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
      });
      return chapters;
    });
  };

  const aiAdvice = useMemo(
    () => synthAiAdvice(course?.id, selectedClassIds),
    [course?.id, selectedClassIds],
  );

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-8 space-y-3">
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
      <div className="col-span-4 space-y-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AiBadge>AI 整体建议</AiBadge>
          </div>
          <p className="text-slate-700 leading-relaxed whitespace-pre-line">
            {aiAdvice}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-slate-500 mb-1.5">策略简述（将写入计划）</div>
          <p className="text-slate-700 leading-relaxed whitespace-pre-line">
            {strategyBrief}
          </p>
        </div>
        <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 text-slate-700 leading-relaxed">
          点击下方「立即开始」或「保存为草稿」即可创建。Demo 演示场景下，保存后将跳转至教学计划详情页。
        </div>
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
        <div className="text-slate-400 text-[11px]">{label}</div>
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

/** 合成整体 AI 建议（Step4 右侧） */
function synthAiAdvice(
  courseId: string | undefined,
  classIds: string[],
): string {
  // 主线组合直接用 plan-main.aiAdvice
  if (
    courseId === "course-mech-draw" &&
    classIds.includes("cls-mech-2301") &&
    classIds.includes("cls-mech-2302")
  ) {
    const main = teachingPlans.find((p) => p.id === "plan-main");
    if (main) return main.aiAdvice;
  }

  const lines: string[] = [];
  for (const cid of classIds) {
    const p = classProfileByClassId(cid);
    const cls = classById(cid);
    if (!p || !cls) continue;
    if (p.scoreDistribution.stdDev >= 14) {
      lines.push(
        `${cls.name}：两极分化明显，建议核心章节增加 1 次分层答疑课，并启用 A/B 双层作业`,
      );
    } else if (p.scoreDistribution.averageScore >= 80) {
      lines.push(
        `${cls.name}：学情优秀，建议在综合单元插入开放课题或学科竞赛准备`,
      );
    } else if (p.scoreDistribution.averageScore < 72) {
      lines.push(
        `${cls.name}：基础阶段放缓 1 周，每章配 1 次随堂测 + 小组互讲`,
      );
    } else {
      lines.push(`${cls.name}：维持标准节奏，按章结束安排阶段复盘`);
    }
  }
  if (lines.length === 0) {
    return "请先选择班级，系统将基于班级画像生成具体建议。";
  }
  return `基于所选班级学情，AI 整体建议如下：\n${lines
    .map((l, i) => `${i + 1}. ${l}`)
    .join("\n")}`;
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
      return "单独成篇 135min，配 SolidWorks 三维切割演示";
    }
    if (sectionId === "sec-2-2" && hasRiskClass) {
      return `${riskClassName} 讲解前先做一次投影基础回顾小测`;
    }
    if (sectionId === "sec-4-3" && hasRiskClass) {
      return `${riskClassName} 剖视图前增加 1 次答疑课`;
    }
  }

  if (courseId === "course-law-civil") {
    if (sectionId === "sec-law-3-2") {
      return "四态辨析增设案例对比，配 3 次辨析训练";
    }
    if (sectionId === "sec-law-1-3") {
      return "增加 1 次案例研讨（法律事实判断）";
    }
  }

  if (courseId === "course-nurse-basic") {
    if (sectionId === "sec-nur-1-1") {
      return "临床思维模块增加 4 次情景化实训";
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
        },
        {
          id: "draft-sec-1-2",
          title: "1.2 学习方法与评价体系",
          plannedDate: "2026-02-25",
          durationMinutes: 90,
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
        },
        {
          id: "draft-sec-2-2",
          title: "2.2 主题二",
          plannedDate: "2026-03-04",
          durationMinutes: 90,
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
        },
      ],
    },
  ];
}
