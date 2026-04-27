import type { Subject } from "./types";

/**
 * 学科数据（均挂在机械工程下，覆盖不同年级与课程类型）
 */
export const subjects: Subject[] = [
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
  {
    id: "subj-mech-intro",
    professionId: "prof-mech",
    name: "机械工程专业导论",
    description: "面向大一新生的专业认知课程，建立工程思维与后续课程地图。",
  },
  {
    id: "subj-mech-tolerance",
    professionId: "prof-mech",
    name: "互换性与技术测量",
    description: "尺寸公差、形位公差、表面粗糙度与几何量检测的综合课程。",
  },
  {
    id: "subj-mech-robot",
    professionId: "prof-mech",
    name: "工业机器人技术",
    description: "机器人坐标系、示教编程、工作站集成与安全规范入门。",
  },
  {
    id: "subj-mech-hydraulic",
    professionId: "prof-mech",
    name: "液压与气压传动",
    description: "流体传动基础、典型回路分析与元件选型。",
  },
  {
    id: "subj-mech-process",
    professionId: "prof-mech",
    name: "机械制造工艺学",
    description: "工艺规程、定位夹紧、加工质量与装配工艺组织。",
  },
  {
    id: "subj-mech-ai",
    professionId: "prof-mech",
    name: "工程智能与AI工具应用",
    description: "面向机械类专业的生成式 AI 通识与实训：提示工程、技术文档辅助、概念草图与学术诚信规范。",
  },
];
