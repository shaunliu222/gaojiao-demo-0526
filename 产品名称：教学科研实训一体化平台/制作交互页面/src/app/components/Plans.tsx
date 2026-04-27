import { Plus, Search, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { teachingPlans, teachingStrategies, classes } from "@mock";
import type { TeachingPlan } from "@mock";
import { classById, teacherById, courseById } from "../data/lookups";
import { PageHeader, StatusTag, AiBadge } from "./Layout";
import { PlanKnowledgePathPreview } from "./PlanKnowledgePathPreview";

/** 把 mock 的英文 status 映射到 UI 中文标签（复用 Layout 的 StatusTag） */
const statusLabel: Record<TeachingPlan["status"], "草稿" | "进行中" | "已完成"> = {
  draft: "草稿",
  in_progress: "进行中",
  completed: "已完成",
};

/** 进度 = 已做设计的小节数 / 总小节数（× 100） */
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
  onOpen,
  onCreate,
}: {
  onOpen: (id: string) => void;
  onCreate: () => void;
}) {
  const [searchQ, setSearchQ] = useState("");
  const [filterClassId, setFilterClassId] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [filterStatus, setFilterStatus] = useState<"" | TeachingPlan["status"]>("");

  const semesterOptions = useMemo(() => {
    const s = new Set(teachingPlans.map((p) => p.semester));
    return Array.from(s).sort();
  }, []);

  const filteredPlans = useMemo(() => {
    const q = searchQ.trim().toLowerCase();
    return teachingPlans.filter((p) => {
      if (filterClassId && !p.classIds.includes(filterClassId)) return false;
      if (filterSemester && p.semester !== filterSemester) return false;
      if (filterStatus && p.status !== filterStatus) return false;
      if (q) {
        const course = courseById(p.courseId);
        const names = planClassNames(p);
        const hitCourse =
          (course?.name ?? "").toLowerCase().includes(q) ||
          p.courseId.toLowerCase().includes(q);
        const hitClass = names.some((n) => n.toLowerCase().includes(q));
        const hitTitle = p.title.toLowerCase().includes(q);
        if (!hitCourse && !hitClass && !hitTitle) return false;
      }
      return true;
    });
  }, [searchQ, filterClassId, filterSemester, filterStatus]);

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
              placeholder="搜索课程或班级"
              className="w-full outline-none"
            />
          </div>
          <select
            value={filterClassId}
            onChange={(e) => setFilterClassId(e.target.value)}
            className="bg-white border border-slate-200 rounded-md px-2 py-1.5 min-w-[8.75rem]"
            aria-label="按班级筛选"
          >
            <option value="">全部班级</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
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
              setFilterStatus((e.target.value || "") as "" | TeachingPlan["status"])
            }
            className="bg-white border border-slate-200 rounded-md px-2 py-1.5"
          >
            <option value="">全部状态</option>
            <option value="draft">草稿</option>
            <option value="in_progress">进行中</option>
            <option value="completed">已完成</option>
          </select>
        </div>
        {filteredPlans.length === 0 ? (
          <div className="text-center text-slate-500 py-16 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            没有符合当前筛选条件的教学计划，请调整条件后重试。
          </div>
        ) : (
        <div className="grid grid-cols-2 gap-4">
          {filteredPlans.map((p) => {
            const classNames = planClassNames(p);
            const course = courseById(p.courseId);
            const teacher = teacherById(p.creatorTeacherId);
            const progress = computeProgress(p);
            const status = statusLabel[p.status];
            const isFocus = p.id === "plan-main";
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
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-0.5 text-slate-400 text-xs shrink-0">
                        <Users size={12} aria-hidden />
                        班级
                      </span>
                      {classNames.map((name) => (
                        <span
                          key={name}
                          className="text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200/80 rounded-md px-2 py-0.5"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <StatusTag status={status} />
                </div>
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
                          : status === "草稿"
                          ? "bg-slate-300"
                          : "bg-indigo-500"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 text-slate-500">
                  <span>
                    {teacher?.name ?? "—"} · {planTotalHours(p)} 学时
                  </span>
                  {isFocus && <span className="text-indigo-600">主线 ★</span>}
                </div>
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
  focusSectionId,
  onBack,
  onOpenSection,
}: {
  id: string;
  /** 从作业评价等入口进入时，自动切到「教学路径」并滚动高亮该小节 */
  focusSectionId?: string;
  onBack: () => void;
  onOpenSection: (planId: string, sectionId: string) => void;
}) {
  const p = teachingPlans.find((x) => x.id === id);
  const [tab, setTab] = useState<"path" | "info" | "strategy" | "ai">("path");

  useEffect(() => {
    if (focusSectionId) setTab("path");
  }, [focusSectionId]);

  useEffect(() => {
    if (!focusSectionId || tab !== "path" || !p) return;
    const t = window.setTimeout(() => {
      document
        .getElementById(`plan-section-${focusSectionId}`)
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 120);
    return () => clearTimeout(t);
  }, [focusSectionId, tab, p]);

  if (!p) {
    return (
      <div>
        <PageHeader back={onBack} title="教学计划" />
        <div className="p-16 text-center text-slate-500">未找到教学计划 {id}</div>
      </div>
    );
  }

  const course = courseById(p.courseId);
  const teacher = teacherById(p.creatorTeacherId);
  const classesStr = planClassNames(p).join(" + ");
  const progress = computeProgress(p);
  const status = statusLabel[p.status];
  const strategy = teachingStrategies.find((s) => s.id === p.strategyId);
  const graphPlanIds = useMemo(() => [p.id], [p.id]);

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
      <div className="px-6 pt-2">
        <PlanKnowledgePathPreview
          planIds={graphPlanIds}
          variant="teacher"
          layout="detail"
        />
      </div>
      <div className="px-6 pt-4">
        <div className="flex gap-1 border-b border-slate-200">
          {(
            [
              ["info", "基础信息"],
              ["path", "教学路径"],
              ["strategy", "策略详情"],
              ["ai", "AI 建议"],
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
          <div className="grid grid-cols-3 gap-4">
            <Info k="日期区间" v={`${p.startDate} → ${p.endDate}`} />
            <Info k="学时" v={`${planTotalHours(p)} 学时`} />
            <Info k="状态" v={`${status} · ${progress}%`} />
            <Info k="覆盖班级" v={planClassNames(p).join("、")} />
            <Info k="主讲教师" v={teacher?.name ?? "—"} />
            <Info k="教学策略" v={strategy?.name ?? "—"} />
          </div>
        )}
        {tab === "path" && (
          <div className="space-y-4">
            <div className="text-slate-500">点击已完成（深蓝）或已做设计的小节 → 跳转到教学设计工作台</div>
            {p.chapters.map((c) => (
              <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="text-slate-900 mb-3 flex items-center gap-2">
                  {c.title}
                  {c.title.includes("焦点") && <span className="text-indigo-600">【焦点】★</span>}
                </div>
                {c.summary && <div className="text-slate-500 mb-2">{c.summary}</div>}
                <div className="flex items-center gap-2 flex-wrap">
                  {c.sections.map((s, i) => {
                    const isFocus = s.id === "sec-3-2"; // 主线焦点小节
                    return (
                      <div key={s.id} className="flex items-center">
                        <button
                          type="button"
                          id={`plan-section-${s.id}`}
                          onClick={() => onOpenSection(p.id, s.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                            focusSectionId === s.id
                              ? "border-amber-400 bg-amber-50 text-amber-900 ring-2 ring-amber-200"
                              : isFocus
                              ? "border-indigo-400 bg-indigo-50 text-indigo-800 ring-2 ring-indigo-100"
                              : s.hasDesign
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-50 text-slate-600"
                          }`}
                        >
                          <span
                            className={`size-2 rounded-full ${
                              isFocus ? "bg-indigo-500" : s.hasDesign ? "bg-emerald-500" : "bg-slate-300"
                            }`}
                          />
                          <span>{s.title}</span>
                          <span className="text-slate-400">{s.plannedDate}</span>
                        </button>
                        {i < c.sections.length - 1 && <span className="text-slate-300 mx-1">—</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === "strategy" && (
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
        )}
        {tab === "ai" && (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-2">
                <AiBadge>AI 整体建议</AiBadge>
              </div>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">{p.aiAdvice}</p>
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
