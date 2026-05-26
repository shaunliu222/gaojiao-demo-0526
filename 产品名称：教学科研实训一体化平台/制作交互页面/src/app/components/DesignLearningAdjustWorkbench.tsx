import { useMemo } from "react";
import { teachingPlans, teachingPlansV2 } from "@mock";
import {
  flattenPlanSections,
  nextSectionId,
  planV2ById,
  lessonV2ById,
  nextLessonIdV2,
} from "../data/lookups";
import { DesignWorkbench } from "./DesignWorkbench";

/**
 * 提供「学情调整」专用工作台：顶部语境条 + 评价/学情驱动的假数据（learningAdjust）。
 * 常规入口请使用 {@link DesignWorkbench}（learningAdjust=false）。
 */
export function DesignLearningAdjustWorkbench({
  planId,
  sectionId,
  lessonId,
  onBack,
  onOpenDemoSection,
  progressSectionId,
  reviewSectionIds,
}: {
  planId: string;
  sectionId: string;
  /** v2.0: 课时 ID */
  lessonId?: string;
  onBack: () => void;
  onOpenDemoSection?: () => void;
  progressSectionId: string;
  reviewSectionIds?: string[];
}) {
  // v2.0: 优先使用 V2 计划数据
  const planV2 = planV2ById(planId);
  const lessonV2 = lessonId ? lessonV2ById(planId, lessonId) : undefined;

  // v1 fallback
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
    // v2.0 path
    if (planV2 && lessonV2) {
      const progressLesson = progressSectionId
        ? planV2.lessons.find((l) => l.id === progressSectionId)
        : undefined;
      const progTitle = progressLesson
        ? `第${progressLesson.lessonNo}课时 · ${progressLesson.knowledgePointNames[0] ?? "..."}`
        : progressSectionId;
      const reviewTitles = (reviewSectionIds ?? [])
        .filter((id) => planV2.lessons.some((l) => l.id === id))
        .map((id) => {
          const l = planV2.lessons.find((ls) => ls.id === id);
          return l ? `第${l.lessonNo}课时` : id;
        });
      const currentTitle = `第${lessonV2.lessonNo}课时 · ${lessonV2.knowledgePointNames[0] ?? "..."}`;
      const hasNext = progressSectionId
        ? Boolean(nextLessonIdV2(planV2, progressSectionId))
        : false;
      return { progTitle, reviewTitles, currentTitle, hasNext };
    }

    // v1 fallback
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
  }, [planV2, lessonV2, plan, progressSectionId, reviewSectionIds, flatSections, section?.title]);

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
          lessonId={lessonId}
          onBack={onBack}
          onOpenDemoSection={onOpenDemoSection}
          learningAdjust
        />
      </div>
    </div>
  );
}
