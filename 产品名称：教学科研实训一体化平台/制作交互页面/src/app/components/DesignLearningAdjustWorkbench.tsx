import { useMemo } from "react";
import { teachingPlans } from "@mock";
import {
  flattenPlanSections,
  nextSectionId,
} from "../data/lookups";
import { DesignWorkbench } from "./DesignWorkbench";

/**
 * 仅从「协同评价 · 作业/考试评价详情 → 根据评价调整教学设计」进入：顶部评价语境说明 + 评价驱动专用设计假数据工作台。
 * 常规「教学设计」菜单/计划详情入口请使用 {@link DesignWorkbench}（learningAdjust=false）。
 */
export function DesignLearningAdjustWorkbench({
  planId,
  sectionId,
  onBack,
  onOpenDemoSection,
  progressSectionId,
  reviewSectionIds,
}: {
  planId: string;
  sectionId: string;
  onBack: () => void;
  onOpenDemoSection?: () => void;
  progressSectionId: string;
  reviewSectionIds?: string[];
}) {
  const plan = teachingPlans.find((p) => p.id === planId);
  const section = useMemo(() => {
    if (!plan) return undefined;
    for (const ch of plan.chapters) {
      for (const s of ch.sections) {
        if (s.id === sectionId) return s;
      }
    }
    return undefined;
  }, [plan, sectionId]);

  const flatSections = useMemo(
    () => (plan ? flattenPlanSections(plan) : []),
    [plan],
  );

  const learningBanner = useMemo(() => {
    if (!plan || !progressSectionId) return null;
    const ids = new Set(flatSections.map((s) => s.sectionId));
    if (!ids.has(progressSectionId)) return null;
    const progTitle =
      flatSections.find((s) => s.sectionId === progressSectionId)?.title ?? progressSectionId;
    const reviewTitles = (reviewSectionIds ?? [])
      .filter((id) => ids.has(id))
      .map((id) => flatSections.find((s) => s.sectionId === id)?.title ?? id);
    const currentTitle = section?.title;
    const hasNext = Boolean(nextSectionId(plan, progressSectionId));
    return { progTitle, reviewTitles, currentTitle, hasNext };
  }, [plan, progressSectionId, reviewSectionIds, flatSections, section?.title]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {learningBanner && (
        <div className="shrink-0 mx-4 mt-2 mb-1 px-3 py-2 rounded-lg border border-violet-200 bg-violet-50/80 text-violet-900 text-[12px] leading-relaxed">
          <span className="font-medium text-violet-800">评价提示：</span>
          班级当前进度：<strong>{learningBanner.progTitle}</strong>
          {learningBanner.currentTitle && (
            <>
              。请优先完善本节教学设计：<strong>{learningBanner.currentTitle}</strong>
            </>
          )}
          {learningBanner.reviewTitles.length > 0 && (
            <>
              ；建议在内容中穿插巩固{" "}
              <strong>{learningBanner.reviewTitles.join("、")}</strong>。
            </>
          )}
          {!learningBanner.hasNext && (
            <span className="text-violet-700/90">（进度已至本计划最后一节）</span>
          )}
        </div>
      )}
      <div className="min-h-0 flex-1 flex flex-col overflow-hidden">
        <DesignWorkbench
          planId={planId}
          sectionId={sectionId}
          onBack={onBack}
          onOpenDemoSection={onOpenDemoSection}
          learningAdjust
        />
      </div>
    </div>
  );
}
