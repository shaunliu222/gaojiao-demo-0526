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

/** 某班级的学生名单 */
export const studentsByClass = (classId: string) =>
  students.filter((s) => s.classId === classId);

/** 某专业下的班级 */
export const classesByProfession = (professionId: string): Class[] =>
  classes.filter((c) => c.professionId === professionId);

/** 节点 safe fallback：nodeById 没覆盖到的按原 graphNodes 遍历 */
export const graphNodeById = (id: string): GraphNode | undefined =>
  nodeById[id] ?? graphNodes.find((n) => n.id === id);
