/**
 * 薄的 join / lookup 层。
 *
 * 官方 mock-data 只有实体数组；UI 大量需要：
 *   - 按 id 取单个实体
 *   - 按外键（classId, courseId, nodeId...）筛一批
 *
 * 把查询逻辑集中到这里，避免每个组件都重新写 find()。
 * 这里不包含任何业务数据，只是对 @mock 的派生字典。
 */

import {
  classes,
  teachers,
  students,
  courses,
  personas,
  skillAndMcpItems,
  resources,
  professions,
  subjects,
  trainingProjects,
  teachingStrategies,
  teachingPlans,
  designsBySection,
  designsBySectionLearningAdjust,
  classProfiles,
  studentProfiles,
  homeworkEvaluations,
  examEvaluations,
  nodeById,
  graphNodes,
} from "@mock";
import type {
  Class,
  Teacher,
  Student,
  Course,
  Persona,
  SkillOrMcpItem,
  Resource,
  Profession,
  Subject,
  TrainingProject,
  TeachingStrategy,
  TeachingPlan,
  TeachingDesign,
  ClassProfile,
  StudentProfile,
  HomeworkEvalSummary,
  ExamEvalSummary,
  GraphNode,
} from "@mock";

// ==========================================================================
// 单记录字典（id -> 实体）
// ==========================================================================

function indexBy<T extends { id: string }>(arr: readonly T[]): Record<string, T> {
  const out: Record<string, T> = {};
  for (const item of arr) out[item.id] = item;
  return out;
}

const classById_ = indexBy(classes);
const teacherById_ = indexBy(teachers);
const studentById_ = indexBy(students);
const courseById_ = indexBy(courses);
const personaById_ = indexBy(personas);
const skillOrMcpById_ = indexBy(skillAndMcpItems);
const resourceById_ = indexBy(resources);
const professionById_ = indexBy(professions);
const subjectById_ = indexBy(subjects);
const trainingById_ = indexBy(trainingProjects);
const strategyById_ = indexBy(teachingStrategies);
const planById_ = indexBy(teachingPlans);
const examById_ = indexBy(examEvaluations);
const homeworkById_ = indexBy(homeworkEvaluations);

export const classById = (id: string): Class | undefined => classById_[id];
export const teacherById = (id: string): Teacher | undefined => teacherById_[id];
export const studentById = (id: string): Student | undefined => studentById_[id];
export const courseById = (id: string): Course | undefined => courseById_[id];
export const personaById = (id: string): Persona | undefined => personaById_[id];
export const skillOrMcpById = (id: string): SkillOrMcpItem | undefined => skillOrMcpById_[id];
export const resourceById = (id: string): Resource | undefined => resourceById_[id];
export const professionById = (id: string): Profession | undefined => professionById_[id];
export const subjectById = (id: string): Subject | undefined => subjectById_[id];
export const trainingById = (id: string): TrainingProject | undefined => trainingById_[id];
export const strategyById = (id: string): TeachingStrategy | undefined => strategyById_[id];
export const planById = (id: string): TeachingPlan | undefined => planById_[id];
export const examById = (id: string): ExamEvalSummary | undefined => examById_[id];
export const homeworkById = (id: string): HomeworkEvalSummary | undefined => homeworkById_[id];

// classProfile 的主键是 classId 不是 id
const classProfileByClassId_: Record<string, ClassProfile> = {};
for (const p of classProfiles) classProfileByClassId_[p.classId] = p;
export const classProfileByClassId = (classId: string): ClassProfile | undefined =>
  classProfileByClassId_[classId];

// studentProfile 主键是 studentId
const studentProfileByStudentId_: Record<string, StudentProfile> = {};
for (const p of studentProfiles) studentProfileByStudentId_[p.studentId] = p;
export const studentProfileByStudentId = (studentId: string): StudentProfile | undefined =>
  studentProfileByStudentId_[studentId];

// ==========================================================================
// 多对多 / 反查工具
// ==========================================================================

/** 某知识节点挂载的课程 */
export const coursesByNode = (nodeId: string): Course[] =>
  courses.filter((c) => c.knowledgeNodeIds.includes(nodeId));

/** 某知识节点挂载的资源 */
export const resourcesByNode = (nodeId: string): Resource[] =>
  resources.filter((r) => r.knowledgeNodeIds.includes(nodeId));

/** 某知识节点挂载的实训项目 */
export const trainingsByNode = (nodeId: string): TrainingProject[] =>
  trainingProjects.filter((t) => t.knowledgeNodeIds.includes(nodeId));

/** 某课程下的全部资源 */
export const resourcesByCourse = (courseId: string): Resource[] =>
  resources.filter((r) => r.courseIds.includes(courseId));

/** 某课程下的全部实训项目 */
export const trainingsByCourse = (courseId: string): TrainingProject[] =>
  trainingProjects.filter((t) => t.courseIds.includes(courseId));

/** 某班级的全部作业评价 */
export const homeworksByClass = (classId: string): HomeworkEvalSummary[] =>
  homeworkEvaluations.filter((h) => h.classId === classId);

/** 某班级的全部考试评价 */
export const examsByClass = (classId: string): ExamEvalSummary[] =>
  examEvaluations.filter((e) => e.classIds.includes(classId));

/** 某班级当前正在进行或已完成的教学计划（不含草稿和已完成，用于"本班当前计划"跳转） */
export const currentPlanForClass = (classId: string): TeachingPlan | undefined => {
  const plans = teachingPlans.filter((p) => p.classIds.includes(classId));
  return (
    plans.find((p) => p.status === "in_progress") ??
    plans.find((p) => p.status === "completed") ??
    plans[0]
  );
};

export interface FlatPlanSectionRef {
  sectionId: string;
  title: string;
  chapterTitle: string;
}

/** 按章节顺序扁平化教学计划中的全部小节 */
export function flattenPlanSections(plan: TeachingPlan): FlatPlanSectionRef[] {
  const out: FlatPlanSectionRef[] = [];
  for (const ch of plan.chapters) {
    for (const sec of ch.sections) {
      out.push({
        sectionId: sec.id,
        title: sec.title,
        chapterTitle: ch.title,
      });
    }
  }
  return out;
}

/** 返回某小节在计划中的下一小节 id；已是最后一节则 undefined */
export function nextSectionId(plan: TeachingPlan, sectionId: string): string | undefined {
  const flat = flattenPlanSections(plan);
  const i = flat.findIndex((s) => s.sectionId === sectionId);
  if (i < 0 || i >= flat.length - 1) return undefined;
  return flat[i + 1]!.sectionId;
}

/**
 * 学情 → 教学设计跳转：默认打开「进度小节的下一节」工作台；巩固小节 id 来自画像。
 * 进度 id 不在当前班级计划内时返回 null。
 */
/** 教学设计工作台数据源：常规入口用 designsBySection；学情入口优先用学情专用假数据 */
export function designsForWorkbenchSection(
  planId: string,
  sectionId: string,
  learningAdjust: boolean,
): TeachingDesign[] {
  const key = `${planId}::${sectionId}`;
  if (learningAdjust) {
    const adj = designsBySectionLearningAdjust[key];
    if (adj?.length) return adj;
  }
  return designsBySection[key] ?? [];
}

export function resolveTeachingDesignJumpFromClass(classId: string): {
  planId: string;
  sectionId: string;
  progressSectionId: string;
  reviewSectionIds: string[];
} | null {
  const plan = currentPlanForClass(classId);
  const profile = classProfileByClassId(classId);
  if (!plan || !profile?.progressSectionId) return null;
  const flat = flattenPlanSections(plan);
  const flatIds = new Set(flat.map((s) => s.sectionId));
  if (!flatIds.has(profile.progressSectionId)) return null;
  const targetSectionId =
    nextSectionId(plan, profile.progressSectionId) ?? profile.progressSectionId;
  const reviewSectionIds = (profile.designReviewSectionIds ?? []).filter((id) =>
    flatIds.has(id),
  );
  return {
    planId: plan.id,
    sectionId: targetSectionId,
    progressSectionId: profile.progressSectionId,
    reviewSectionIds,
  };
}

/**
 * 协同评价「调整课程」导航目标：始终跳到班级画像对应的「下一堂课」小节，
 * 与作业/洞察里挂载的章节 id 无关（主线叙事对齐）。
 */
export function resolveNextLessonSectionForPlan(
  planId: string | undefined,
  classId?: string,
): { planId: string; sectionId: string } | null {
  let resolvedPlanId = planId;
  if (!resolvedPlanId && classId) {
    const p = currentPlanForClass(classId);
    resolvedPlanId = p?.id;
  }
  if (!resolvedPlanId) return null;

  const plan = planById(resolvedPlanId);
  if (!plan) return null;
  const flat = flattenPlanSections(plan);
  const flatIds = new Set(flat.map((s) => s.sectionId));

  const profile = classId ? classProfileByClassId(classId) : undefined;
  const progress = profile?.progressSectionId;
  if (progress && flatIds.has(progress)) {
    const next = nextSectionId(plan, progress);
    if (next) return { planId: resolvedPlanId, sectionId: next };
    return { planId: resolvedPlanId, sectionId: progress };
  }

  if (resolvedPlanId === "plan-main" && flatIds.has("sec-3-2")) {
    return { planId: resolvedPlanId, sectionId: "sec-3-2" };
  }

  const first = flat[0];
  return first ? { planId: resolvedPlanId, sectionId: first.sectionId } : null;
}

/** 考试等多班场景：按课程 + 班级列表解析所属计划后的下一堂课 */
export function resolveNextLessonSectionForCourseClasses(
  courseId: string,
  classIds: string[],
): { planId: string; sectionId: string } | null {
  const plan = teachingPlans.find(
    (p) =>
      p.courseId === courseId &&
      classIds.some((cid) => p.classIds.includes(cid)),
  );
  if (!plan) return null;
  const classId = classIds.find((cid) => plan.classIds.includes(cid));
  return resolveNextLessonSectionForPlan(plan.id, classId);
}

/** 某班级的学生名单 */
export const studentsByClass = (classId: string) =>
  students.filter((s) => s.classId === classId);

/** 某专业下的班级 */
export const classesByProfession = (professionId: string): Class[] =>
  classes.filter((c) => c.professionId === professionId);

/** 节点 safe fallback：nodeById 没覆盖到的按原 graphNodes 遍历 */
export const graphNodeById = (id: string): GraphNode | undefined =>
  nodeById[id] ?? graphNodes.find((n) => n.id === id);

// ==========================================================================
// 教师数据范围（主任全量 / 普通教师仅本人相关）
// ==========================================================================

/** 教研室主任等：可查看本专业全部课程、资源、实训等 */
export function teacherSeesAllScopedContent(teacherId: string): boolean {
  return teacherById(teacherId)?.isDepartmentLead === true;
}

/**
 * 普通教师可见的班级（班主任 + 其创建的教学计划覆盖的班级）。
 * 返回 null 表示不限制（主任视角）。
 */
export function classIdsVisibleToTeacher(teacherId: string): string[] | null {
  if (teacherSeesAllScopedContent(teacherId)) return null;
  const ids = new Set<string>();
  for (const p of teachingPlans) {
    if (p.creatorTeacherId === teacherId) {
      for (const cid of p.classIds) ids.add(cid);
    }
  }
  for (const c of classes) {
    if (c.headTeacherId === teacherId) ids.add(c.id);
  }
  return Array.from(ids);
}

/** 学情分析页默认选中的班级 tab */
export function defaultLearningClassIdForTeacher(teacherId: string): string {
  const unrestricted = classIdsVisibleToTeacher(teacherId);
  if (unrestricted === null) return classProfiles[0]!.classId;
  const visible = new Set(unrestricted);
  for (const p of classProfiles) {
    if (visible.has(p.classId)) return p.classId;
  }
  if (unrestricted.length > 0) return unrestricted[0]!;
  return classProfiles[0]!.classId;
}
