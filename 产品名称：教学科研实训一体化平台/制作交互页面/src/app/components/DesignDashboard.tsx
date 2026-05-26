import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookMarked,
  Clock,
  Flag,
  Layers,
  PenTool,
  Sparkles,
  ChevronLeft,
  FileText,
  Headphones,
  Presentation,
  BrainCircuit,
  Video,
  ClipboardList,
  PenLine,
} from "lucide-react";
import { teachingPlans, teachingPlansV2, designsBySection } from "@mock";
import type { TeachingDesign, TeachingPlan, PlanLesson, TeachingPlanV2 } from "@mock";
import {
  classById,
  courseById,
  graphNodeById,
  lessonClassHomeworkEvals,
  plansV2VisibleToTeacher,
} from "../data/lookups";
import { PageHeader, AiBadge } from "./Layout";

interface SectionRef {
  planId: string;
  sectionId: string;
  sectionTitle: string;
  chapterTitle: string;
  plannedDate: string;
  plan: TeachingPlan;
  hasDesign: boolean;
  designs: TeachingDesign[];
  isFocus: boolean;
  latestUpdatedAt?: string;
}

/** 所有小节（扁平化）+ 元信息 */
function collectAllSections(): SectionRef[] {
  const out: SectionRef[] = [];
  for (const plan of teachingPlans) {
    for (const ch of plan.chapters) {
      for (const sec of ch.sections) {
        const key = `${plan.id}::${sec.id}`;
        const designs = designsBySection[key] ?? [];
        const latest = designs
          .map((d) => d.updatedAt)
          .sort()
          .reverse()[0];
        out.push({
          planId: plan.id,
          sectionId: sec.id,
          sectionTitle: sec.title,
          chapterTitle: ch.title,
          plannedDate: sec.plannedDate,
          plan,
          hasDesign: sec.hasDesign,
          designs,
          isFocus:
            sec.id === "sec-3-2" ||
            sec.id === "sec-wgw-1-2",
          latestUpdatedAt: latest,
        });
      }
    }
  }
  return out;
}

/** 按教学计划章节顺序得到某课程下章标题的次序（仅统计指定教师创建的计划） */
function chapterOrderForCourse(courseId: string, creatorTeacherId: string): string[] {
  const order: string[] = [];
  for (const plan of teachingPlans) {
    if (plan.courseId !== courseId) continue;
    if (plan.creatorTeacherId !== creatorTeacherId) continue;
    for (const ch of plan.chapters) {
      if (!order.includes(ch.title)) order.push(ch.title);
    }
  }
  return order;
}

export function DesignDashboard({
  currentTeacherId,
  onOpenSection,
}: {
  currentTeacherId: string;
  onOpenSection: (planId: string, sectionId: string) => void;
}) {
  // V2 state
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // V2: collect all lessons from V2 plans
  const v2All = useMemo(() => {
    const visible = plansV2VisibleToTeacher(currentTeacherId);
    return visible.flatMap((plan) =>
      plan.lessons.map((lesson) => ({
        plan,
        lesson,
      })),
    );
  }, [currentTeacherId]);

  const v2CourseIds = useMemo(() => {
    const set = new Set(v2All.map((v) => v.plan.courseId));
    return Array.from(set).sort((a, b) => {
      const na = courseById(a)?.name ?? a;
      const nb = courseById(b)?.name ?? b;
      return na.localeCompare(nb, "zh-CN");
    });
  }, [v2All]);

  const v2DefaultCourseId = useMemo(() => {
    const focusCourse = v2All.find((v) => v.lesson.hasDesign)?.plan.courseId;
    if (focusCourse && v2CourseIds.includes(focusCourse)) return focusCourse;
    return v2CourseIds[0] ?? "";
  }, [v2All, v2CourseIds]);

  const [v2SelectedCourseId, setV2SelectedCourseId] = useState<string | undefined>(undefined);
  useEffect(() => { setV2SelectedCourseId(undefined); setSelectedLessonId(null); }, [currentTeacherId]);

  const v2ActiveCourseId = v2SelectedCourseId ?? v2DefaultCourseId;

  const v2Filtered = useMemo(
    () => v2All.filter((v) => v.plan.courseId === v2ActiveCourseId),
    [v2All, v2ActiveCourseId],
  );

  // V2: 3-zone classification
  const v2Zones = useMemo(() => {
    const recentEdited = [...v2Filtered]
      .filter((v) => v.lesson.hasDesign)
      .sort((a, b) => b.lesson.date.localeCompare(a.lesson.date))
      .slice(0, 5);
    const priority = v2Filtered.filter(
      (v) => !v.lesson.hasDesign && v.lesson.status === "in_progress",
    );
    const pending = v2Filtered.filter(
      (v) => !v.lesson.hasDesign && v.lesson.status !== "in_progress",
    );
    return { recentEdited, priority, pending };
  }, [v2Filtered]);

  const selectedLesson = useMemo(() => {
    if (!selectedLessonId || !selectedPlanId) return null;
    return v2All.find((v) => v.lesson.id === selectedLessonId && v.plan.id === selectedPlanId) ?? null;
  }, [selectedLessonId, selectedPlanId, v2All]);

  const homeworkEvals = useMemo(() => {
    if (!selectedLessonId || !selectedPlanId) return [];
    return lessonClassHomeworkEvals(selectedPlanId, selectedLessonId);
  }, [selectedLessonId, selectedPlanId]);

  // V2 metrics
  const v2Metrics = useMemo(() => {
    const totalLessons = v2Filtered.length;
    const designedCount = v2Filtered.filter((v) => v.lesson.hasDesign).length;
    const inProgress = v2Filtered.filter((v) => v.lesson.status === "in_progress").length;
    const pendingCount = v2Filtered.filter((v) => v.lesson.status === "planned").length;
    return { totalLessons, designedCount, inProgress, pendingCount };
  }, [v2Filtered]);

  // V1 fallback data
  const all = useMemo(() => {
    const rows = collectAllSections();
    return rows.filter((s) => s.plan.creatorTeacherId === currentTeacherId);
  }, [currentTeacherId]);

  const courseIdsOrdered = useMemo(() => {
    const set = new Set(all.map((s) => s.plan.courseId));
    return Array.from(set).sort((a, b) => {
      const na = courseById(a)?.name ?? a;
      const nb = courseById(b)?.name ?? b;
      return na.localeCompare(nb, "zh-CN");
    });
  }, [all]);

  const defaultCourseId = useMemo(() => {
    const focusCourse = all.find((s) => s.isFocus)?.plan.courseId;
    if (focusCourse && courseIdsOrdered.includes(focusCourse)) return focusCourse;
    return courseIdsOrdered[0] ?? "";
  }, [all, courseIdsOrdered]);

  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>(undefined);

  useEffect(() => {
    setSelectedCourseId(undefined);
  }, [currentTeacherId]);

  const activeCourseId = selectedCourseId ?? defaultCourseId;

  const filtered = useMemo(
    () => all.filter((s) => s.plan.courseId === activeCourseId),
    [all, activeCourseId],
  );

  const metricsNow = useMemo(() => {
    const totalSections = filtered.length;
    const designedCount = filtered.filter((s) => s.hasDesign).length;
    const focusCount = filtered.filter((s) => s.isFocus).length;
    const recentCount = filtered.filter((s) => {
      if (!s.latestUpdatedAt) return false;
      const t = new Date(s.latestUpdatedAt).getTime();
      const now = new Date("2026-04-16T00:00:00+08:00").getTime();
      return now - t < 7 * 24 * 3600 * 1000;
    }).length;
    return { totalSections, designedCount, focusCount, recentCount };
  }, [filtered]);

  const chapterBlocks = useMemo(() => {
    const m = new Map<string, SectionRef[]>();
    for (const s of filtered) {
      const key = s.chapterTitle;
      const arr = m.get(key) ?? [];
      arr.push(s);
      m.set(key, arr);
    }
    for (const arr of m.values()) {
      arr.sort(
        (a, b) =>
          a.plannedDate.localeCompare(b.plannedDate) || a.sectionId.localeCompare(b.sectionId),
      );
    }
    const preferred = chapterOrderForCourse(activeCourseId, currentTeacherId);
    const orphans = [...m.keys()].filter((k) => !preferred.includes(k));
    orphans.sort((a, b) => a.localeCompare(b, "zh-CN"));
    const orderedKeys = [...preferred.filter((k) => m.has(k)), ...orphans];
    return orderedKeys.map((chapterTitle) => ({
      chapterTitle,
      sections: m.get(chapterTitle)!,
    }));
  }, [filtered, activeCourseId, currentTeacherId]);

  // V2 rendering
  if (v2All.length > 0) {
    return (
      <div>
        <PageHeader
          title={
            <div className="flex items-center gap-2">
              <PenTool size={16} className="text-indigo-600" />
              <span>教学设计</span>
            </div>
          }
        />
        <div className="p-6 space-y-5">
          {selectedLesson ? (
            // Lesson detail sub-view
            <div className="space-y-4">
              <button
                onClick={() => setSelectedLessonId(null)}
                className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 text-sm"
              >
                <ChevronLeft size={14} /> 返回课时列表
              </button>
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="text-slate-900 font-medium text-lg mb-1">
                  第 {selectedLesson.lesson.lessonNo} 课时
                </div>
                <div className="flex items-center gap-3 text-slate-500 text-sm mb-3">
                  <span>{selectedLesson.lesson.date}</span>
                  <span>{selectedLesson.lesson.durationMinutes}min</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {selectedLesson.lesson.knowledgePointNames.map((name) => (
                    <span key={name} className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[0.6875rem]">
                      {name}
                    </span>
                  ))}
                </div>
                {selectedLesson.lesson.objectives.length > 0 && (
                  <div>
                    <div className="text-[0.6875rem] text-slate-500 mb-1">教学目标</div>
                    <ul className="list-disc list-inside text-slate-700 text-[0.8125rem] space-y-0.5">
                      {selectedLesson.lesson.objectives.map((obj, i) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Merged: Previous lesson + Homework evaluation */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                {(() => {
                  const lessons = selectedLesson.plan.lessons;
                  const idx = lessons.findIndex((l) => l.id === selectedLesson.lesson.id);
                  const prevLesson = idx > 0 ? lessons[idx - 1] : undefined;
                  return prevLesson ? (
                    <div className="mb-4 pb-4 border-b border-slate-100">
                      <div className="text-violet-900 font-medium mb-2">上一课教学内容总览</div>
                      <div className="text-violet-800 text-sm mb-1">
                        第 {prevLesson.lessonNo} 课时 · {prevLesson.knowledgePointNames[0] ?? "..."}
                      </div>
                      <div className="text-[0.6875rem] text-violet-700 mb-2">需掌握知识点：</div>
                      <div className="flex flex-wrap gap-1">
                        {prevLesson.knowledgePointNames.map((name) => (
                          <span key={name} className="px-1.5 py-0.5 rounded-md bg-violet-100 text-violet-700 text-[0.6875rem]">
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}
                <div className="text-slate-900 font-medium mb-3">班级作业评价</div>
                {homeworkEvals.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 text-[0.6875rem]">
                        <th className="text-left pb-2 font-medium">班级名称</th>
                        <th className="text-left pb-2 font-medium">作业内容</th>
                        <th className="text-left pb-2 font-medium">提交率</th>
                        <th className="text-left pb-2 font-medium">平均分</th>
                        <th className="text-left pb-2 font-medium">薄弱知识点</th>
                        <th className="text-left pb-2 font-medium">评价状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      {homeworkEvals.map((evalRow) => (
                        <tr key={evalRow.classId} className="border-b border-slate-100">
                          <td className="py-2.5 text-slate-700">{evalRow.className}</td>
                          <td className="py-2.5 text-slate-600">{evalRow.homeworkContent}</td>
                          <td className="py-2.5 text-slate-700">{Math.round(evalRow.submissionRate * 100)}%</td>
                          <td className="py-2.5 text-slate-700">{evalRow.averageScore}</td>
                          <td className="py-2.5">
                            <div className="flex flex-wrap gap-1">
                              {evalRow.weakKnowledgePoints.map((wp) => (
                                <span key={wp} className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[0.6875rem]">
                                  {wp}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded-md text-[0.6875rem] ${
                              evalRow.evalStatus === "evaluated"
                                ? "bg-emerald-50 text-emerald-700"
                                : evalRow.evalStatus === "pending"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-slate-100 text-slate-400"
                            }`}>
                              {evalRow.evalStatus === "evaluated" ? "已评价" : evalRow.evalStatus === "pending" ? "待评价" : "未布置"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-slate-400 text-center py-6">暂无评价数据</div>
                )}
              </div>

              {/* Current lesson resources with file details */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="text-slate-900 font-medium mb-3">本节资源</div>
                <div className="mb-3">
                  <div className="text-[0.6875rem] text-slate-500 mb-1">关联知识点</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLesson.lesson.knowledgePointNames.map((name) => (
                      <span key={name} className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[0.6875rem]">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[0.6875rem] text-slate-500 mb-1">挂载资源</div>
                  <div className="space-y-1">
                    {[
                      { id: "res-1", name: "组合体三视图讲义", format: "PDF", source: "资源库", size: "6.2 MB" },
                      { id: "res-2", name: "形体分析法课件", format: "PPTX", source: "资源库", size: "18.4 MB" },
                      { id: "res-3", name: "三视图绘制微课", format: "MP4", source: "个人上传", size: "22 MB" },
                    ].map((r) => (
                      <div key={r.id} className="flex items-center gap-2 text-[0.6875rem] px-2 py-1 rounded-md bg-emerald-50/60">
                        <span className="text-slate-700 truncate flex-1">{r.name}</span>
                        <span className="px-1 py-px rounded bg-blue-50 text-blue-600 text-[9px] border border-blue-100">{r.format}</span>
                        <span className="text-slate-400 text-[10px]">{r.size}</span>
                        <span className={`px-1 py-px rounded text-[9px] border ${
                          r.source === "资源库" ? "bg-violet-50 text-violet-600 border-violet-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                        }`}>{r.source}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onOpenSection(selectedLesson.plan.id, selectedLesson.lesson.id)}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1"
              >
                <Sparkles size={14} /> 进入教学设计工作台
              </button>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl border border-slate-200 px-4 py-2 flex items-center gap-3">
                <span className="text-slate-500 text-sm shrink-0">选择课程：</span>
                <select
                  value={v2ActiveCourseId}
                  onChange={(e) => setV2SelectedCourseId(e.target.value)}
                  className="flex-1 border border-slate-200 rounded-md px-3 py-1.5 bg-white text-sm"
                >
                  {v2CourseIds.map((id) => {
                    const p = teachingPlansV2.find((pl) => pl.courseId === id);
                    const c = courseById(id);
                    return (
                      <option key={id} value={id}>
                        {c ? `《${c.name}》` : id}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 grid grid-cols-3 gap-4">
                <Metric icon={<Layers size={16} />} label="课程名称" value={courseById(v2ActiveCourseId)?.name ?? "—"} tone="slate" />
                <Metric icon={<Layers size={16} />} label="关联班级" value="机制2301/2302/2303" tone="slate" />
                <Metric icon={<Layers size={16} />} label="总课时" value={v2Metrics.totalLessons} tone="slate" />
                <Metric icon={<Sparkles size={16} />} label="已完成设计" value={v2Metrics.designedCount} tone="emerald" suffix={`/ ${v2Metrics.totalLessons}`} />
                <Metric icon={<Flag size={16} />} label="进行中" value={v2Metrics.inProgress} tone="indigo" />
                <Metric icon={<PenTool size={16} />} label="待设计" value={v2Metrics.pendingCount} tone="slate" />
              </div>
              <div className="space-y-6">
                {v2Zones.recentEdited.length > 0 && (
                  <LessonZone
                    title="已完成"
                    lessons={v2Zones.recentEdited}
                    onSelect={(planId, lessonId) => {
                      setSelectedPlanId(planId);
                      setSelectedLessonId(lessonId);
                    }}
                  />
                )}
                {v2Zones.priority.length > 0 && (
                  <LessonZone
                    title="进行中"
                    lessons={v2Zones.priority}
                    onSelect={(planId, lessonId) => {
                      setSelectedPlanId(planId);
                      setSelectedLessonId(lessonId);
                    }}
                  />
                )}
                {v2Zones.pending.length > 0 && (
                  <LessonZone
                    title="待设计"
                    lessons={v2Zones.pending}
                    onSelect={(planId, lessonId) => {
                      setSelectedPlanId(planId);
                      setSelectedLessonId(lessonId);
                    }}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // V1 fallback
}

function CourseTabBar({
  courseIds,
  activeId,
  onSelect,
}: {
  courseIds: string[];
  activeId: string;
  onSelect: (courseId: string) => void;
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-3 border-b border-slate-200 -mx-1 px-1">
      {courseIds.map((id) => {
        const name = courseById(id)?.name ?? id;
        const active = id === activeId;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={`shrink-0 px-3 py-2 rounded-lg text-[13px] font-medium transition border ${
              active
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50"
            }`}
          >
            《{name}》
          </button>
        );
      })}
    </div>
  );
}

// ==========================================================================

function Metric({
  icon,
  label,
  value,
  suffix,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  tone: "slate" | "indigo" | "emerald" | "violet";
}) {
  const toneCls: Record<string, string> = {
    slate: "bg-slate-50 text-slate-600",
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    violet: "bg-violet-50 text-violet-600",
  };
  return (
    <div className="flex items-center gap-3">
      <div
        className={`size-10 rounded-xl flex items-center justify-center ${toneCls[tone]}`}
      >
        {icon}
      </div>
      <div className="leading-tight">
        <div className="text-slate-400 text-[0.6875rem]">{label}</div>
        <div className="text-slate-900 text-xl">
          {value}
          {suffix && (
            <span className="text-slate-400 text-sm ml-1">{suffix}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  data,
  cta,
  onOpen,
}: {
  data: SectionRef;
  cta: string;
  onOpen: (planId: string, sectionId: string) => void;
}) {
  const course = courseById(data.plan.courseId);
  const classNames = data.plan.classIds.map(
    (cid) => classById(cid)?.name ?? cid,
  );
  const handoutDone = data.designs.some((d) => d.tab === "讲义");
  const classDone = data.designs.some((d) => d.tab === "课堂");
  const homeworkDone = data.designs.some((d) => d.tab === "作业");

  return (
    <button
      onClick={() => onOpen(data.planId, data.sectionId)}
      className={`text-left bg-white rounded-xl border p-4 hover:shadow-md hover:border-indigo-300 transition relative ${
        data.isFocus ? "border-indigo-300 ring-1 ring-indigo-100" : "border-slate-200"
      }`}
    >
      <div className="text-slate-500 text-[0.6875rem] truncate">
        《{course?.name ?? data.plan.courseId}》 · {data.chapterTitle}
      </div>
      <div className="text-slate-900 mt-0.5 line-clamp-1">
        {data.sectionTitle}
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-slate-500 text-[0.6875rem]">
        <Clock size={11} />
        <span>{data.plannedDate}</span>
        <span className="text-slate-300">·</span>
        <span className="truncate max-w-[8.75rem]">{classNames.join("+")}</span>
      </div>

      <div className="mt-3 flex items-center gap-1">
        <TabChip label="讲义" done={handoutDone} />
        <TabChip label="课堂" done={classDone} />
        <TabChip label="作业" done={homeworkDone} />
      </div>

      <div className="mt-3 flex items-center justify-between">
        {data.latestUpdatedAt ? (
          <span className="text-slate-400 text-[0.6875rem]">
            更新 {data.latestUpdatedAt.slice(5, 10)}
          </span>
        ) : data.hasDesign ? (
          <span className="text-emerald-600 text-[0.6875rem]">已生成设计</span>
        ) : (
          <span className="inline-flex items-center gap-1 text-amber-600 text-[0.6875rem]">
            <Sparkles size={11} /> AI 可生成初稿
          </span>
        )}
        <span className="inline-flex items-center gap-0.5 text-indigo-600 text-[0.75rem]">
          {cta} <ArrowRight size={12} />
        </span>
      </div>
    </button>
  );
}

function TabChip({ label, done }: { label: string; done: boolean }) {
  return (
    <span
      className={`px-1.5 py-0.5 rounded-md text-[0.6875rem] ${
        done
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-400"
      }`}
    >
      {done ? "✓ " : ""}
      {label}
    </span>
  );
}

// ==========================================================================
// V2 课时卡片组件
// ==========================================================================

const OUTPUT_TYPE_ICONS: Array<{ type: string; label: string; icon: React.ReactNode }> = [
  { type: "lecture_note", label: "讲义", icon: <FileText size={10} /> },
  { type: "audio", label: "音频", icon: <Headphones size={10} /> },
  { type: "ppt", label: "PPT", icon: <Presentation size={10} /> },
  { type: "mindmap", label: "思维导图", icon: <BrainCircuit size={10} /> },
  { type: "micro_video", label: "微课", icon: <Video size={10} /> },
  { type: "lesson_plan", label: "教案", icon: <ClipboardList size={10} /> },
  { type: "homework", label: "作业", icon: <PenLine size={10} /> },
];

function LessonZone({
  title,
  lessons,
  onSelect,
}: {
  title: string;
  lessons: Array<{ plan: TeachingPlanV2; lesson: PlanLesson }>;
  onSelect: (planId: string, lessonId: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-1 h-5 rounded-full ${
          title === "已完成" ? "bg-emerald-500" :
          title === "进行中" ? "bg-indigo-500" : "bg-slate-400"
        }`} />
        <span className="text-slate-900 font-medium">{title}</span>
        <span className="text-slate-400 text-[0.6875rem]">{lessons.length} 课时</span>
      </div>
      <div className="flex flex-col gap-2">
        {lessons.map(({ plan, lesson }) => (
          <V2LessonCard
            key={lesson.id}
            plan={plan}
            lesson={lesson}
            onSelect={() => onSelect(plan.id, lesson.id)}
          />
        ))}
      </div>
    </div>
  );
}

function V2LessonCard({
  plan,
  lesson,
  onSelect,
}: {
  plan: TeachingPlanV2;
  lesson: PlanLesson;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`text-left bg-white rounded-xl border px-4 py-3 hover:shadow-md hover:border-indigo-300 transition flex items-center gap-4 ${
        lesson.status === "in_progress"
          ? "border-indigo-300 ring-1 ring-indigo-100"
          : "border-slate-200"
      }`}
    >
      <span className="text-[0.6875rem] font-semibold text-indigo-600 whitespace-nowrap w-20">
        第 {lesson.lessonNo} 课时
      </span>
      <span className="text-slate-500 text-[0.6875rem] w-24">{lesson.date}</span>
      <div className="flex-1 flex flex-wrap gap-1">
        {lesson.knowledgePointNames.slice(0, 3).map((name) => (
          <span key={name} className="px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-600 text-[0.6875rem] max-w-[10rem] truncate">
            {name}
          </span>
        ))}
        {lesson.knowledgePointNames.length > 3 && (
          <span className="px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-400 text-[0.6875rem]">
            +{lesson.knowledgePointNames.length - 3}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {OUTPUT_TYPE_ICONS.map(({ type, label, icon }) => (
          <span
            key={type}
            title={label}
            className="size-5 rounded flex items-center justify-center bg-slate-100 text-slate-400"
          >
            {icon}
          </span>
        ))}
      </div>
      <span className={`text-[0.6875rem] shrink-0 w-14 text-right ${
        lesson.hasDesign ? "text-emerald-600" : "text-amber-600"
      }`}>
        {lesson.hasDesign ? "已设计" : "待设计"}
      </span>
      <span className="inline-flex items-center gap-0.5 text-indigo-600 text-[0.75rem] shrink-0">
        查看 <ArrowRight size={12} />
      </span>
    </button>
  );
}
