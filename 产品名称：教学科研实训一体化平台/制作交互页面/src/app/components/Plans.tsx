import { Plus, Search, Users, Link2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  teachingPlans,
  teachingPlansV2,
  teachingStrategies,
  classes,
  PLAN_WANG_HAIFENG_MOCK_ID,
  l2PlanById,
} from "@mock";
import type { TeachingPlan, TeachingPlanV2 } from "@mock";
import {
  classById,
  teacherById,
  courseById,
  teacherSeesAllScopedContent,
  flattenPlanLessons,
  graphNodeById,
  strategyById,
  computePlanProgressV2,
  plansV2VisibleToTeacher,
  resourcesByCourse,
} from "../data/lookups";
import { PageHeader, StatusTag, AiBadge } from "./Layout";

/** 把 mock 的英文 status 映射到 UI 中文标签（复用 Layout 的 StatusTag） */
const statusLabel: Record<TeachingPlan["status"], "待上架" | "进行中" | "已完成"> = {
  draft: "待上架",
  in_progress: "进行中",
  completed: "已完成",
};

/** 进度 = 已做设计的课时数 / 总课时数（× 100） */
function computeProgress(p: TeachingPlan): number {
  let done = 0;
  let total = 0;
  for (const ch of p.chapters) {
    for (const sec of ch.sections) {
      total += 1;
      if (sec.hasDesign) done += 1;
    }
  }
  if (total === 0) return 0;
  return Math.round((done / total) * 100);
}

function planClassNames(p: TeachingPlan): string[] {
  return p.classIds.map((cid) => classById(cid)?.name ?? cid);
}

function planTotalHours(p: TeachingPlan): number {
  let min = 0;
  for (const ch of p.chapters) for (const sec of ch.sections) min += sec.durationMinutes;
  return Math.round(min / 45); // 按 1 学时 = 45 分钟换算
}

export function PlansList({
  currentTeacherId,
  onOpen,
  onCreate,
  onGoToGraph,
  sessionPlans = [],
}: {
  currentTeacherId: string;
  onOpen: (id: string) => void;
  onCreate: () => void;
  /** 可选：跳转到图谱并定位节点（用于派生角标点击） */
  onGoToGraph?: (nodeId: string) => void;
  /** 会话态新增计划（向导创建后展示到列表） */
  sessionPlans?: TeachingPlanV2[];
}) {
  const [searchQ, setSearchQ] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [filterStatus, setFilterStatus] = useState<"" | TeachingPlanV2["status"]>("");
  const [filterClassId, setFilterClassId] = useState("");
  const [filterCourseId, setFilterCourseId] = useState("");

  const allPlans = useMemo(
    () => [...sessionPlans, ...teachingPlansV2],
    [sessionPlans],
  );

  const semesterOptions = useMemo(() => {
    const s = new Set(allPlans.map((p) => p.semester));
    return Array.from(s).sort();
  }, [allPlans]);

  const classOptions = useMemo(() => [
    { id: "cls-mech-2301", name: "机制2301" },
    { id: "cls-mech-2302", name: "机制2302" },
    { id: "cls-mech-2303", name: "机制2303" },
  ], []);

  const courseOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const p of allPlans) {
      const c = courseById(p.courseId);
      if (c && !seen.has(c.id)) seen.set(c.id, c.name);
    }
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }, [allPlans]);

  const filteredPlans = useMemo(() => {
    const q = searchQ.trim().toLowerCase();
    const seesAll = teacherSeesAllScopedContent(currentTeacherId);
    return allPlans.filter((p) => {
      if (!seesAll && p.creatorTeacherId !== currentTeacherId) return false;
      if (filterSemester && p.semester !== filterSemester) return false;
      if (filterStatus && p.status !== filterStatus) return false;
      if (filterCourseId && p.courseId !== filterCourseId) return false;
      if (q) {
        const course = courseById(p.courseId);
        const hitCourse =
          (course?.name ?? "").toLowerCase().includes(q) ||
          p.courseId.toLowerCase().includes(q);
        const hitTitle = p.title.toLowerCase().includes(q);
        if (!hitCourse && !hitTitle) return false;
      }
      return true;
    });
  }, [searchQ, filterSemester, filterStatus, filterCourseId, currentTeacherId]);

  return (
    <div>
      <PageHeader
        title="教学计划"
        actions={
          <button
            onClick={onCreate}
            className="inline-flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700"
          >
            <Plus size={14} /> 新建教学计划
          </button>
        }
      />
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md px-2 py-1 flex-1 min-w-[12.5rem] max-w-xs">
            <Search size={14} className="text-slate-400 shrink-0" />
            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="搜索课程"
              className="w-full outline-none"
            />
          </div>
          <select
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value)}
            className="bg-white border border-slate-200 rounded-md px-2 py-1.5"
          >
            <option value="">全部学期</option>
            {semesterOptions.map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus((e.target.value || "") as "" | TeachingPlanV2["status"])
            }
            className="bg-white border border-slate-200 rounded-md px-2 py-1.5"
          >
            <option value="">全部状态</option>
            <option value="draft">待上架</option>
            <option value="in_progress">进行中</option>
            <option value="completed">已完成</option>
          </select>
          <select
            value={filterClassId}
            onChange={(e) => setFilterClassId(e.target.value)}
            className="bg-white border border-slate-200 rounded-md px-2 py-1.5"
          >
            <option value="">全部班级</option>
            {classOptions.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={filterCourseId}
            onChange={(e) => setFilterCourseId(e.target.value)}
            className="bg-white border border-slate-200 rounded-md px-2 py-1.5"
          >
            <option value="">全部课程</option>
            {courseOptions.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        {filteredPlans.length === 0 ? (
          <div className="text-center text-slate-500 py-16 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            没有符合当前筛选条件的教学计划，请调整条件后重试。
          </div>
        ) : (
        <div className="grid grid-cols-2 gap-4">
          {filteredPlans.map((p) => {
            const course = courseById(p.courseId);
            const teacher = teacherById(p.creatorTeacherId);
            const progress = computePlanProgressV2(p);
            const status = statusLabel[p.status];
            const strategyName = strategyById(p.strategyTag)?.name ?? p.strategyTag;
            const isFocus =
              p.id === "plan-main" ||
              (currentTeacherId === "t-wang" && p.id === PLAN_WANG_HAIFENG_MOCK_ID);
            return (
              <button
                key={p.id}
                onClick={() => onOpen(p.id)}
                className={`text-left bg-white rounded-xl border p-5 hover:shadow-md hover:border-indigo-300 transition ${
                  isFocus ? "border-indigo-300 ring-1 ring-indigo-100" : "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-slate-900">《{course?.name ?? p.courseId}》</div>
                    <div className="text-slate-500 mt-0.5 text-sm">{p.semester}</div>
                  </div>
                  <StatusTag status={status} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs">
                    {strategyName}
                  </span>
                  <span className="text-xs text-slate-500">{p.totalLessons} 课时</span>
                  <span className="text-xs text-slate-400">|</span>
                  <span className="text-xs text-slate-500">机制2301/2302/2303</span>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-2 text-[0.6875rem] text-slate-500">
                  <span>学分：{course?.credit ?? "—"}</span>
                  <span>知识点：{course?.knowledgeNodeIds.length ?? 0} 个</span>
                  <span>资源：{resourcesByCourse(p.courseId).length} 个</span>
                </div>
                {p.customStrategy && (
                  <div className="mt-1.5 text-[0.6875rem] text-slate-400 line-clamp-1">
                    {p.customStrategy.slice(0, 80)}{p.customStrategy.length > 80 ? "..." : ""}
                  </div>
                )}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span>进度</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        status === "已完成"
                          ? "bg-emerald-500"
                          : status === "待上架"
                          ? "bg-slate-300"
                          : "bg-indigo-500"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 text-slate-500">
                  {isFocus && (
                    <span className="text-indigo-600">
                      {p.id === "plan-main" ? "主线" : "本账号"}
                    </span>
                  )}
                </div>
                {p.derivedFromL2PlanId && (() => {
                  const l2Plan = l2PlanById[p.derivedFromL2PlanId];
                  return (
                    <div
                      className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center gap-1.5"
                      onClick={(e) => {
                        if (onGoToGraph) {
                          e.stopPropagation();
                          onGoToGraph(p.derivedFromL2PlanId!);
                        }
                      }}
                    >
                      <Link2 size={11} className="text-slate-400 shrink-0" />
                      <span className="text-[0.6875rem] text-slate-400 truncate">
                        派生自 {l2Plan?.title ?? p.derivedFromL2PlanId}
                      </span>
                      {onGoToGraph && (
                        <span className="shrink-0 text-[0.6rem] text-indigo-500 hover:text-indigo-700 underline cursor-pointer">
                          查看图谱
                        </span>
                      )}
                    </div>
                  );
                })()}
              </button>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}

export function PlanDetail({
  id,
  currentTeacherId,
  focusSectionId,
  focusLessonId,
  onBack,
  onOpenSection,
}: {
  id: string;
  currentTeacherId: string;
  focusSectionId?: string;
  /** v2.0: 从其他入口进入时滚动到该课时 */
  focusLessonId?: string;
  onBack: () => void;
  onOpenSection: (planId: string, sectionId: string) => void;
}) {
  // v2.0: 优先使用 V2 计划
  const pV2 = teachingPlansV2.find((x) => x.id === id);
  const pV1 = teachingPlans.find((x) => x.id === id);
  const [tab, setTab] = useState<"path" | "info">("path");
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

  const scrollTarget = focusLessonId ?? focusSectionId;

  useEffect(() => {
    if (scrollTarget) setTab("path");
  }, [scrollTarget]);

  useEffect(() => {
    if (!scrollTarget || tab !== "path") return;
    const t = window.setTimeout(() => {
      document
        .getElementById(`plan-lesson-${scrollTarget}`)
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 120);
    return () => clearTimeout(t);
  }, [scrollTarget, tab]);

  if (!pV2 && !pV1) {
    return (
      <div>
        <PageHeader back={onBack} title="教学计划" />
        <div className="p-16 text-center text-slate-500">未找到教学计划 {id}</div>
      </div>
    );
  }

  // V2 计划渲染
  if (pV2) {
    if (
      !teacherSeesAllScopedContent(currentTeacherId) &&
      pV2.creatorTeacherId !== currentTeacherId
    ) {
      return (
        <div>
          <PageHeader back={onBack} title="教学计划" />
          <div className="p-16 text-center text-slate-500">
            当前账号仅可查看本人创建的教学计划。
          </div>
        </div>
      );
    }

    const course = courseById(pV2.courseId);
    const teacher = teacherById(pV2.creatorTeacherId);
    const progress = computePlanProgressV2(pV2);
    const status = statusLabel[pV2.status];
    const strategy = strategyById(pV2.strategyTag);

    return (
      <div>
        <PageHeader
          back={onBack}
          title={
            <span>
              《{course?.name ?? pV2.courseId}》· {pV2.semester}
            </span>
          }
          actions={
            <>
              <button className="px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50">
                导出 PDF
              </button>
              <button className="px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
                编辑
              </button>
            </>
          }
        />
        <div className="px-6 pt-4">
          <div className="flex gap-1 border-b border-slate-200">
            {(
              [
                ["info", "基础信息"],
                ["path", "课时进度"],
              ] as const
            ).map(([k, l]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`px-4 py-2 -mb-px border-b-2 ${
                  tab === k
                    ? "border-indigo-600 text-indigo-700"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        <div className="p-6">
          {tab === "info" && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-slate-50 px-4 py-3">
                  <div className="text-slate-400 text-[0.6875rem]">课程</div>
                  <div className="text-slate-800">《{course?.name}》</div>
                </div>
                <div className="rounded-lg bg-slate-50 px-4 py-3">
                  <div className="text-slate-400 text-[0.6875rem]">学期</div>
                  <div className="text-slate-800">{pV2.semester}</div>
                </div>
                <div className="rounded-lg bg-slate-50 px-4 py-3">
                  <div className="text-slate-400 text-[0.6875rem]">状态</div>
                  <div><StatusTag status={status} /></div>
                </div>
                <div className="rounded-lg bg-slate-50 px-4 py-3">
                  <div className="text-slate-400 text-[0.6875rem]">课时总数</div>
                  <div className="text-slate-800">{pV2.totalLessons} 课时</div>
                </div>
                <div className="rounded-lg bg-slate-50 px-4 py-3">
                  <div className="text-slate-400 text-[0.6875rem]">日期范围</div>
                  <div className="text-slate-800">{pV2.startDate} ~ {pV2.endDate}</div>
                </div>
                <div className="rounded-lg bg-slate-50 px-4 py-3">
                  <div className="text-slate-400 text-[0.6875rem]">创建教师</div>
                  <div className="text-slate-800">{teacher?.name ?? "—"}</div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-slate-900">教学策略</div>
                </div>
                <div className="text-indigo-700 font-medium mb-1">{strategy?.name ?? pV2.strategyTag}</div>
                <div className="text-slate-600 leading-relaxed text-[0.8125rem] whitespace-pre-line">
                  {pV2.strategyBrief}
                </div>
                {pV2.customStrategy && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="text-[0.6875rem] text-slate-400 mb-1">个性化需求</div>
                    <div className="text-slate-600 text-[0.8125rem]">{pV2.customStrategy}</div>
                  </div>
                )}
              </div>
            </div>
          )}
          {tab === "path" && (
            <div className="space-y-2">
              {pV2.lessons.map((lesson) => {
                const isExpanded = expandedLesson === lesson.id;
                const lessonStatusMap: Record<string, "草稿" | "进行中" | "已完成"> = {
                  planned: "草稿",
                  in_progress: "进行中",
                  completed: "已完成",
                  skipped: "草稿",
                };
                return (
                  <div
                    key={lesson.id}
                    id={`plan-lesson-${lesson.id}`}
                    className="bg-white rounded-xl border border-slate-200 hover:border-indigo-200 transition"
                  >
                    <button
                      onClick={() => setExpandedLesson(isExpanded ? null : lesson.id)}
                      className="w-full text-left p-4 flex items-center gap-4"
                    >
                      <span className="text-[0.6875rem] font-semibold text-indigo-600 whitespace-nowrap w-16">
                        第 {lesson.lessonNo} 课时
                      </span>
                      <span className="text-slate-500 text-sm w-24">{lesson.date}</span>
                      <div className="flex-1 flex flex-wrap gap-1">
                        {lesson.knowledgePointNames.slice(0, 3).map((name) => (
                          <span key={name} className="px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-600 text-[0.6875rem]">
                            {name}
                          </span>
                        ))}
                        {lesson.knowledgePointNames.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-400 text-[0.6875rem]">
                            +{lesson.knowledgePointNames.length - 3}
                          </span>
                        )}
                      </div>
                      <StatusTag status={lessonStatusMap[lesson.status] ?? "草稿"} />
                      <span className="text-indigo-600 text-[0.6875rem] hover:text-indigo-800">
                        {isExpanded ? "收起" : "展开"}
                      </span>
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 border-t border-slate-100 mt-0">
                        <div className="pt-3 space-y-2">
                          {lesson.objectives.length > 0 && (
                            <div>
                              <div className="text-[0.6875rem] text-slate-500 mb-1">教学目标</div>
                              <ul className="list-disc list-inside text-slate-700 text-[0.8125rem] space-y-0.5">
                                {lesson.objectives.map((obj, i) => (
                                  <li key={i}>{obj}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <div>
                            <div className="text-[0.6875rem] text-slate-500 mb-1">知识点</div>
                            <div className="flex flex-wrap gap-1">
                              {lesson.knowledgePointNames.map((name) => (
                                <span key={name} className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[0.6875rem]">
                                  {name}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="text-[0.6875rem] text-slate-500 mb-1">挂载资源</div>
                            <div className="space-y-1">
                              {lesson.resourceIds.length > 0 ? [
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
                              )) : (
                                <span className="text-slate-400 text-[0.8125rem]">暂无</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // V1 fallback
  const p = pV1;
  if (
    !teacherSeesAllScopedContent(currentTeacherId) &&
    p.creatorTeacherId !== currentTeacherId
  ) {
    return (
      <div>
        <PageHeader back={onBack} title="教学计划" />
        <div className="p-16 text-center text-slate-500">
          当前账号仅可查看本人创建的教学计划。
        </div>
      </div>
    );
  }

  const course = courseById(p.courseId);
  const teacher = teacherById(p.creatorTeacherId);
  const progress = computeProgress(p);
  const status = statusLabel[p.status];
  const strategy = teachingStrategies.find((s) => s.id === p.strategyId);

  return (
    <div>
      <PageHeader
        back={onBack}
        title={
          <span>
            《{course?.name ?? p.courseId}》· {p.semester} · {classesStr}
          </span>
        }
        actions={
          <>
            <button className="px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50">
              导出 PDF
            </button>
            <button className="px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
              编辑
            </button>
          </>
        }
      />
      <div className="px-6 pt-4">
        <div className="flex gap-1 border-b border-slate-200">
          {(
            [
              ["info", "基础信息"],
              ["path", "课时进度"],
            ] as const
          ).map(([k, l]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`px-4 py-2 -mb-px border-b-2 ${
                tab === k
                  ? "border-indigo-600 text-indigo-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        {tab === "info" && (
          <div className="space-y-8">
            <div className="grid grid-cols-3 gap-4">
              <Info k="日期区间" v={`${p.startDate} → ${p.endDate}`} />
              <Info k="学时" v={`${planTotalHours(p)} 学时`} />
              <Info k="状态" v={`${status} · ${progress}%`} />
              <Info k="覆盖班级" v={planClassNames(p).join("、")} />
              <Info k="主讲教师" v={teacher?.name ?? "—"} />
              <Info k="教学策略" v={strategy?.name ?? "—"} />
            </div>
            <div>
              <div className="text-slate-900 font-medium mb-3">策略详情</div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-slate-900">{strategy?.name ?? "教学策略"}</span>
                    <AiBadge>当前应用</AiBadge>
                  </div>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">{p.strategyBrief}</p>
                  {strategy && (
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <Info k="节奏建议" v={strategy.paceSuggestion} />
                      <Info k="难度曲线" v={strategy.difficultyCurve} />
                      <Info k="活动建议" v={strategy.activitySuggestion} />
                    </div>
                  )}
                </div>
                <div className="col-span-1 bg-white rounded-xl border border-slate-200 p-4 space-y-2 max-h-[560px] overflow-auto">
                  <div className="text-slate-500 mb-1">可选策略模板</div>
                  {teachingStrategies.map((s) => (
                    <div
                      key={s.id}
                      className={`px-3 py-2 rounded-lg border ${
                        s.id === p.strategyId
                          ? "border-indigo-300 bg-indigo-50/60"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-slate-900">{s.name}</span>
                        <span className="text-slate-400 text-[0.6875rem]">{sourceLabel(s.source)}</span>
                      </div>
                      <div className="text-slate-500 line-clamp-2 mt-0.5">{s.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className="text-slate-900 font-medium mb-3">AI 建议</div>
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <AiBadge>AI 整体建议</AiBadge>
                </div>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">{p.aiAdvice}</p>
              </div>
            </div>
          </div>
        )}
        {tab === "path" && (
          <div className="space-y-4">
            <div className="text-slate-500">
              按计划内授课顺序分课时展示；每课时列出已挂载的图谱知识点/课程实训节点。点击进入「本节课程资源」，再可选择进入教学设计工作台。
            </div>
            <div className="space-y-3">
              {flattenPlanLessons(p).map(({ lessonIndex, section: s }) => {
                const isFocus = s.id === "sec-3-2"; // 主线示例课时（样式强调）
                const hasOverride = !!(p.overrides ?? []).some((o) => o.sectionId === s.id);
                const themeTitle = s.title.replace(/^\s*第\s*\d+\s*课时\s*[·\-：:]\s*/u, "").trim() || s.title;
                return (
                  <div
                    key={s.id}
                    id={`plan-section-${s.id}`}
                    className={`bg-white rounded-xl border p-4 transition ${
                      focusSectionId === s.id
                        ? "border-amber-400 ring-2 ring-amber-200"
                        : isFocus
                          ? "border-indigo-300 ring-2 ring-indigo-100"
                          : "border-slate-200 hover:border-indigo-200"
                    }`}
                  >
                    <div className="flex flex-wrap items-start gap-3 justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[0.6875rem] font-semibold uppercase tracking-wide text-indigo-600 shrink-0">
                            第 {lessonIndex} 课时
                          </span>
                          {hasOverride && (
                            <span className="text-[0.625rem] px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800">
                              相对标准计划有调整
                            </span>
                          )}
                          <span className="text-[0.6875rem] text-slate-400">
                            {s.plannedDate} · {s.durationMinutes} min
                          </span>
                          {s.hasDesign && (
                            <span className="text-[0.625rem] px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700">
                              教学设计已完成
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-slate-900">{themeTitle}</div>
                        <div className="mt-2">
                          <div className="text-[0.6875rem] text-slate-500 mb-1">图谱挂载</div>
                          {s.knowledgeNodeIds?.length ? (
                            <div className="flex flex-wrap gap-1.5">
                              {s.knowledgeNodeIds.map((nid) => {
                                const gn = graphNodeById(nid);
                                const layerTone =
                                  gn?.layer === "knowledge"
                                    ? "border-sky-200 bg-sky-50 text-sky-800"
                                    : gn?.layer === "courseOrTraining"
                                      ? "border-violet-200 bg-violet-50 text-violet-800"
                                      : gn?.layer === "ability"
                                        ? "border-indigo-200 bg-indigo-50 text-indigo-800"
                                        : "border-slate-200 bg-slate-50 text-slate-700";
                                return (
                                  <span
                                    key={`${s.id}-${nid}`}
                                    title={nid}
                                    className={`text-[0.6875rem] px-2 py-0.5 rounded-md border max-w-[16rem] truncate ${layerTone}`}
                                  >
                                    {gn?.name ?? nid}
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-[0.8125rem] text-slate-400">本课时暂未挂载图谱节点</div>
                          )}
                        </div>
                        {(s.objectives?.length ?? 0) > 0 && (
                          <ul className="mt-2 text-[0.8125rem] text-slate-600 list-disc list-inside space-y-0.5">
                            {s.objectives.slice(0, 5).map((obj, i) => (
                              <li key={i}>{obj}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => onOpenSection(p.id, s.id)}
                        className={`shrink-0 px-4 py-2 rounded-lg border text-[0.8125rem] ${
                          s.hasDesign
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                            : "border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100"
                        }`}
                      >
                        本节资源与设计
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function sourceLabel(s: "platform" | "college" | "department" | "personal"): string {
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

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="text-slate-500 mb-1">{k}</div>
      <div className="text-slate-900 whitespace-pre-line">{v}</div>
    </div>
  );
}
