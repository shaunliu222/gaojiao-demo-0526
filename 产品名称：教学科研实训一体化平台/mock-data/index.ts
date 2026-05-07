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
export {
  knowledgeGraphTrainingPlanDocuments,
  knowledgeGraphTrainingPlanDocumentById,
} from "./knowledgeGraphTrainingPlanDocs";
export { courses } from "./courses";
export { resources } from "./resources";
export { moocPlatforms, moocExternalCourses } from "./moocExternalCourses";
export type { MoocPlatform, MoocExternalCourseItem } from "./moocExternalCourses";
export { planSectionResourcesSeed } from "./planSectionResources";
export { trainingProjects } from "./trainings";

// 教学闭环
export { personas, skillAndMcpItems } from "./personas";
export { teachingStrategies } from "./strategies";
export { teachingPlans, PLAN_WANG_HAIFENG_MOCK_ID } from "./teachingPlans";
export {
  planKnowledgePathGraphs,
  getPlanKnowledgePathGraph,
} from "./planKnowledgePathGraphs";
export { PLAN_MAIN_NODE_IDS, buildPlanKnowledgePathGraph } from "./planPathFromMaster";
export {
  teachingDesigns,
  designsBySection,
  DEMO_DESIGN_PLAN_ID,
  DEMO_DESIGN_SECTION_ID,
} from "./teachingDesigns";
export {
  teachingDesignsLearningAdjust,
  designsBySectionLearningAdjust,
} from "./teachingDesignsLearningAdjust";
export { homeworkEvaluations } from "./homeworks";
export { examEvaluations } from "./exams";

// ---- 三层知识图谱模型（L1 / L2 / L3） ----
export { l1Schemas, l1SchemaMech } from "./kgL1Schema";
export {
  l1Nodes,
  l1Edges,
  l1NodesByProfession,
  l1EdgesByProfession,
  l1NodeById,
} from "./kgL1";
export {
  legacyCoursePlanMetas,
  legacyCoursePlanMetaById,
} from "./kgLegacyCoursePlans";
export {
  l2StandardCoursePlans,
  l2PlanById,
} from "./kgL2";
export {
  l3Nodes,
  l3Edges,
  l3NodeById,
} from "./kgL3";
export {
  l1ToL2Bridges,
  l2ToL3Bridges,
  l2ToL3BridgesByPlan,
  l2ToL3BridgesBySection,
} from "./kgBridges";
export {
  kgSourceMaterials,
  kgSourceMaterialById,
} from "./kgMaterials";
export {
  L1_SCHEMA_NODE_TYPE_CHAIN_DESC,
  L1_WIZARD_STREAM_STAGES,
  L1_WIZARD_STREAM_FIXED_LOGS,
} from "./kgL1WizardDemo";
export {
  schoolCases,
  industryProjectAssets,
  schoolCaseById,
  industryProjectAssetById,
} from "./kgCases";
export {
  jobToPlanBlueprints,
  jobBlueprintById,
} from "./kgJobBlueprints";
