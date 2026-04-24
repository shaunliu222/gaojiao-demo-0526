import { useMemo } from "react";
import {
  ArrowRight,
  Clock,
  Flag,
  Layers,
  PenTool,
  Sparkles,
  Target,
} from "lucide-react";
import { teachingPlans, designsBySection } from "@mock";
import type { TeachingDesign, TeachingPlan } from "@mock";
import { classById, courseById } from "../data/lookups";
import { AiBadge, PageHeader } from "./Layout";

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
      const isFocusChapter = ch.title.includes("焦点");
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
            isFocusChapter ||
            sec.id === "sec-3-2" || // 主线焦点小节
            sec.title.includes("焦点"),
          latestUpdatedAt: latest,
        });
      }
    }
  }
  return out;
}

export function DesignDashboard({
  onOpenSection,
}: {
  onOpenSection: (planId: string, sectionId: string) => void;
}) {
  const all = useMemo(collectAllSections, []);

  const totalSections = all.length;
  const designedCount = all.filter((s) => s.hasDesign).length;
  const focusCount = all.filter((s) => s.isFocus).length;
  const recentCount = all.filter((s) => {
    if (!s.latestUpdatedAt) return false;
    const t = new Date(s.latestUpdatedAt).getTime();
    const now = new Date("2026-04-16T00:00:00+08:00").getTime();
    return now - t < 7 * 24 * 3600 * 1000;
  }).length;

  // Group A · 最近编辑：有真实教学设计记录的按 updatedAt 倒序
  const recentlyEdited = useMemo(() => {
    // 先用真实 designsBySection 里有记录的小节
    const withDesigns = all.filter((s) => s.designs.length > 0);
    withDesigns.sort((a, b) =>
      (b.latestUpdatedAt ?? "").localeCompare(a.latestUpdatedAt ?? ""),
    );
    // 补齐：hasDesign=true 但暂无完整产物的小节（按日期倒序）
    const fillers = all
      .filter((s) => s.hasDesign && s.designs.length === 0)
      .sort((a, b) => b.plannedDate.localeCompare(a.plannedDate));
    return [...withDesigns, ...fillers].slice(0, 6);
  }, [all]);

  // Group B · 焦点小节：焦点章节 + 主线焦点小节
  const focusSections = useMemo(() => {
    return all
      .filter((s) => s.isFocus)
      .sort((a, b) => a.plannedDate.localeCompare(b.plannedDate))
      .slice(0, 6);
  }, [all]);

  // Group C · 待设计：hasDesign=false 的小节，按日期正序
  const pendingSections = useMemo(() => {
    return all
      .filter((s) => !s.hasDesign)
      .sort((a, b) => a.plannedDate.localeCompare(b.plannedDate))
      .slice(0, 9);
  }, [all]);

  return (
    <div>
      <PageHeader
        title={
          <div className="flex items-center gap-2">
            <PenTool size={16} className="text-indigo-600" />
            <span>教学设计</span>
            <AiBadge>一跳直达工作台</AiBadge>
          </div>
        }
        actions={
          <button className="px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-600">
            按计划浏览
          </button>
        }
      />
      <div className="p-6 space-y-5">
        {/* 顶部指标条 */}
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 grid grid-cols-4 gap-4">
          <Metric
            icon={<Layers size={16} />}
            label="总小节"
            value={totalSections}
            tone="slate"
          />
          <Metric
            icon={<Sparkles size={16} />}
            label="已完成设计"
            value={designedCount}
            tone="emerald"
            suffix={`/ ${totalSections}`}
          />
          <Metric
            icon={<Flag size={16} />}
            label="焦点小节"
            value={focusCount}
            tone="indigo"
          />
          <Metric
            icon={<Clock size={16} />}
            label="近 7 日更新"
            value={recentCount}
            tone="violet"
          />
        </div>

        {/* Group A · 最近编辑 */}
        <DashboardGroup
          title="最近编辑"
          hint="按更新时间倒序，点击卡片继续之前的设计"
          accent="indigo"
          cards={recentlyEdited}
          emptyHint="暂无最近编辑的教学设计"
          cta="继续设计"
          onOpen={onOpenSection}
        />

        {/* Group B · 焦点小节 */}
        <DashboardGroup
          title="焦点小节"
          hint="课程主线/重点章节，优先投入设计精力"
          accent="violet"
          cards={focusSections}
          emptyHint="暂无焦点小节"
          cta="进入工作台"
          onOpen={onOpenSection}
        />

        {/* Group C · 待设计 */}
        <DashboardGroup
          title="待设计"
          hint="尚未生成教学设计的小节，AI 可以一键生成初稿"
          accent="amber"
          cards={pendingSections}
          emptyHint="所有小节都已完成设计"
          cta="AI 生成初稿"
          onOpen={onOpenSection}
        />
      </div>
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
        <div className="text-slate-400 text-[11px]">{label}</div>
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

function DashboardGroup({
  title,
  hint,
  accent,
  cards,
  emptyHint,
  cta,
  onOpen,
}: {
  title: string;
  hint: string;
  accent: "indigo" | "violet" | "amber";
  cards: SectionRef[];
  emptyHint: string;
  cta: string;
  onOpen: (planId: string, sectionId: string) => void;
}) {
  const accentDot: Record<string, string> = {
    indigo: "bg-indigo-500",
    violet: "bg-violet-500",
    amber: "bg-amber-500",
  };
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className={`size-2.5 rounded-full ${accentDot[accent]}`} />
        <div className="text-slate-900">{title}</div>
        <span className="text-slate-400 text-[12px]">· {hint}</span>
        <div className="flex-1" />
        <span className="text-slate-400 text-[11px]">{cards.length}</span>
      </div>
      {cards.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl h-28 flex items-center justify-center text-slate-400">
          {emptyHint}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {cards.map((c) => (
            <SectionCard key={`${c.planId}::${c.sectionId}`} data={c} cta={cta} onOpen={onOpen} />
          ))}
        </div>
      )}
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
      {data.isFocus && (
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-indigo-600 text-[11px]">
          <Target size={11} />
          焦点
        </span>
      )}
      <div className="text-slate-500 text-[11px] truncate">
        《{course?.name ?? data.plan.courseId}》 · {data.chapterTitle}
      </div>
      <div className="text-slate-900 mt-0.5 line-clamp-1">
        {data.sectionTitle}
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-slate-500 text-[11px]">
        <Clock size={11} />
        <span>{data.plannedDate}</span>
        <span className="text-slate-300">·</span>
        <span className="truncate max-w-[140px]">{classNames.join("+")}</span>
      </div>

      <div className="mt-3 flex items-center gap-1">
        <TabChip label="讲义" done={handoutDone} />
        <TabChip label="课堂" done={classDone} />
        <TabChip label="作业" done={homeworkDone} />
      </div>

      <div className="mt-3 flex items-center justify-between">
        {data.latestUpdatedAt ? (
          <span className="text-slate-400 text-[11px]">
            更新 {data.latestUpdatedAt.slice(5, 10)}
          </span>
        ) : data.hasDesign ? (
          <span className="text-emerald-600 text-[11px]">已生成设计</span>
        ) : (
          <span className="inline-flex items-center gap-1 text-amber-600 text-[11px]">
            <Sparkles size={11} /> AI 可生成初稿
          </span>
        )}
        <span className="inline-flex items-center gap-0.5 text-indigo-600 text-[12px]">
          {cta} <ArrowRight size={12} />
        </span>
      </div>
    </button>
  );
}

function TabChip({ label, done }: { label: string; done: boolean }) {
  return (
    <span
      className={`px-1.5 py-0.5 rounded-md text-[11px] ${
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

