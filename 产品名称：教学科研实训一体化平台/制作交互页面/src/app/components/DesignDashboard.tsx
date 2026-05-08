import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookMarked,
  Clock,
  Flag,
  Layers,
  PenTool,
  Sparkles,
} from "lucide-react";
import { teachingPlans, designsBySection } from "@mock";
import type { TeachingDesign, TeachingPlan } from "@mock";
import { classById, courseById } from "../data/lookups";
import { PageHeader } from "./Layout";

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
  const all = useMemo(() => {
    const rows = collectAllSections();
    /** 教学设计仅展示本人创建的教学计划，与教研室主任「全站浏览」权限区分 */
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
        {courseIdsOrdered.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl py-14 text-center text-slate-500 text-sm">
            当前账号下暂无可见的教学计划小节。
          </div>
        ) : (
          <>
            <CourseTabBar
              courseIds={courseIdsOrdered}
              activeId={activeCourseId}
              onSelect={(id) => setSelectedCourseId(id)}
            />

            <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 grid grid-cols-4 gap-4">
              <Metric
                icon={<Layers size={16} />}
                label="总小节"
                value={metricsNow.totalSections}
                tone="slate"
              />
              <Metric
                icon={<Sparkles size={16} />}
                label="已完成设计"
                value={metricsNow.designedCount}
                tone="emerald"
                suffix={`/ ${metricsNow.totalSections}`}
              />
              <Metric
                icon={<Flag size={16} />}
                label="优先备课"
                value={metricsNow.focusCount}
                tone="indigo"
              />
              <Metric
                icon={<Clock size={16} />}
                label="近 7 日更新"
                value={metricsNow.recentCount}
                tone="violet"
              />
            </div>

            <div className="space-y-8">
              {chapterBlocks.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl py-10 text-center text-slate-500 text-sm">
                  该课程下暂无小节。
                </div>
              ) : (
                chapterBlocks.map((block) => (
                  <div key={block.chapterTitle}>
                    <div className="flex items-center gap-2 mb-3">
                      <BookMarked size={15} className="text-indigo-500 shrink-0" />
                      <span className="text-slate-900 font-medium">{block.chapterTitle}</span>
                      <span className="text-slate-400 text-[0.6875rem]">
                        {block.sections.length} 节
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {block.sections.map((c) => (
                        <SectionCard
                          key={`${c.planId}::${c.sectionId}`}
                          data={c}
                          cta="进入本节"
                          onOpen={onOpenSection}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
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
