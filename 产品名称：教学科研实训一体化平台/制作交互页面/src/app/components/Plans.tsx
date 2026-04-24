import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { teachingPlans, teachingStrategies } from "@mock";
import type { TeachingPlan } from "@mock";
import { classById, teacherById, courseById } from "../data/lookups";
import { PageHeader, StatusTag, AiBadge } from "./Layout";

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

export function PlansList({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <div>
      <PageHeader
        title="教学计划"
        actions={
          <button className="inline-flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700">
            <Plus size={14} /> 新建教学计划
          </button>
        }
      />
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md px-2 py-1 flex-1 max-w-xs">
            <Search size={14} className="text-slate-400" />
            <input placeholder="搜索课程或班级" className="w-full outline-none" />
          </div>
          <select className="bg-white border border-slate-200 rounded-md px-2 py-1">
            <option>全部学期</option>
          </select>
          <select className="bg-white border border-slate-200 rounded-md px-2 py-1">
            <option>全部状态</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {teachingPlans.map((p) => {
            const cls = planClassNames(p).join(" / ");
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
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-slate-900">《{course?.name ?? p.courseId}》</div>
                    <div className="text-slate-500 mt-0.5">
                      {p.semester} · {cls}
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
      </div>
    </div>
  );
}

export function PlanDetail({
  id,
  onBack,
  onOpenSection,
}: {
  id: string;
  onBack: () => void;
  onOpenSection: (planId: string, sectionId: string) => void;
}) {
  const p = teachingPlans.find((x) => x.id === id);
  const [tab, setTab] = useState<"path" | "info" | "strategy" | "ai">("path");
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
                          onClick={() => onOpenSection(p.id, s.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                            isFocus
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
                    <span className="text-slate-400 text-[11px]">{sourceLabel(s.source)}</span>
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
