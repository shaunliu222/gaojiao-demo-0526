import type { Subject } from "./types";

/**
 * 学科/科目数据（挂在专业下）
 *
 * - 机械工程：4 个（工程图学 / 机械设计基础 / 机械制造基础 / 机械 CAD）
 * - 法学：3 个（民法学 / 刑法学 / 法理学）
 * - 护理学：3 个（基础护理学 / 内科护理学 / 急救护理学）
 * - 学前教育：2 个（学前教育学 / 幼儿园教育活动设计）
 */
export const subjects: Subject[] = [
  // ==== 机械工程 ====
  {
    id: "subj-mech-drawing",
    professionId: "prof-mech",
    name: "工程图学",
    description: "机械工程类专业的核心技术基础课，涵盖制图国标、投影原理、机件表达与 CAD 表达。",
  },
  {
    id: "subj-mech-design",
    professionId: "prof-mech",
    name: "机械设计基础",
    description: "研究常用机构和通用机械零件的工作原理、结构特点与设计方法。",
  },
  {
    id: "subj-mech-manu",
    professionId: "prof-mech",
    name: "机械制造基础",
    description: "涵盖机械加工工艺、金属切削原理、机械制造过程及质量控制基础。",
  },
  {
    id: "subj-mech-cad",
    professionId: "prof-mech",
    name: "机械 CAD",
    description: "学习 AutoCAD 二维绘图、SolidWorks 三维建模与工程图输出。",
  },

  // ==== 法学 ====
  {
    id: "subj-law-civil",
    professionId: "prof-law",
    name: "民法学",
    description: "研究平等主体之间财产关系与人身关系的法律规范，是法学基础核心学科。",
  },
  {
    id: "subj-law-criminal",
    professionId: "prof-law",
    name: "刑法学",
    description: "研究犯罪、刑事责任与刑罚的部门法学科。",
  },
  {
    id: "subj-law-theory",
    professionId: "prof-law",
    name: "法理学",
    description: "研究法的基本概念、原理、价值与方法论，是法学专业的入门与理论深化课程。",
  },

  // ==== 护理学 ====
  {
    id: "subj-nurse-basic",
    professionId: "prof-nurse",
    name: "基础护理学",
    description: "护理专业核心课程，研究病人入出院、生活与治疗护理的基本理论与操作技术。",
  },
  {
    id: "subj-nurse-internal",
    professionId: "prof-nurse",
    name: "内科护理学",
    description: "研究内科常见疾病的临床护理评估、计划、实施与评价。",
  },
  {
    id: "subj-nurse-emergency",
    professionId: "prof-nurse",
    name: "急救护理学",
    description: "研究急危重症病人的救护理论与操作技术。",
  },

  // ==== 学前教育 ====
  {
    id: "subj-edu-theory",
    professionId: "prof-edu",
    name: "学前教育学",
    description: "研究 0-6 岁儿童教育活动的一般规律及幼儿园教育工作的基本理论。",
  },
  {
    id: "subj-edu-activity",
    professionId: "prof-edu",
    name: "幼儿园教育活动设计",
    description: "聚焦五大领域教育活动的设计与组织实施。",
  },
];
