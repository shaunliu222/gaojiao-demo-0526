/**
 * mock-data 统一入口
 *
 * 外部只需要：
 *   import { courses, teachingPlans, graphNodes, ... } from './mock-data';
 *
 * 类型统一从 './mock-data/types' 导出。
 */

// 类型
export * from "./types";

// 组织 & 基础档案
export { professions } from "./professions";
export { subjects } from "./subjects";
export { classes } from "./classes";
export { students } from "./students";
export { teachers } from "./teachers";

// 档案 / 画像
export { classProfiles } from "./classProfiles";
export { studentProfiles } from "./studentProfiles";

// 知识引擎
export {
  graphNodes,
  graphEdges,
  nodesByProfession,
  edgesByProfession,
  nodeById,
} from "./knowledgeGraph";
export { courses } from "./courses";
export { resources } from "./resources";
export { trainingProjects } from "./trainings";

// 教学闭环
export { personas, skillAndMcpItems } from "./personas";
export { teachingStrategies } from "./strategies";
export { teachingPlans } from "./teachingPlans";
export {
  planKnowledgePathGraphs,
  getPlanKnowledgePathGraph,
} from "./planKnowledgePathGraphs";
export {
  teachingDesigns,
  designsBySection,
  DEMO_DESIGN_PLAN_ID,
  DEMO_DESIGN_SECTION_ID,
} from "./teachingDesigns";
export { homeworkEvaluations } from "./homeworks";
export { examEvaluations } from "./exams";
