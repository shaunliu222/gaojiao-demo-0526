import type { ID } from "./types";

/** 可对接的慕课平台（演示数据） */
export interface MoocPlatform {
  id: ID;
  name: string;
}

/** 各平台上的公开课程条目（演示：供教师搜索/选择后创建本地「线上课程」资源） */
export interface MoocExternalCourseItem {
  id: ID;
  platformId: ID;
  title: string;
  provider: string;
  courseUrl: string;
  summary: string;
}

export const moocPlatforms: MoocPlatform[] = [
  { id: "plt-xuetangx", name: "学堂在线" },
  { id: "plt-icourse163", name: "中国大学 MOOC（爱课程）" },
  { id: "plt-ouchn", name: "国家职业教育智慧教育平台" },
  { id: "plt-coursera", name: "Coursera" },
];

export const moocExternalCourses: MoocExternalCourseItem[] = [
  {
    id: "mooc-xt-draw",
    platformId: "plt-xuetangx",
    title: "机械制图基础（国家精品在线开放课程）",
    provider: "西安交通大学",
    courseUrl: "https://www.xuetangx.com/course/example-mechanical-drawing",
    summary: "投影基础、组合体与剖视表达，适合与本校制图课衔接预习。",
  },
  {
    id: "mooc-xt-cad2d",
    platformId: "plt-xuetangx",
    title: "二维 CAD 工程图进阶",
    provider: "华中科技大学",
    courseUrl: "https://www.xuetangx.com/course/example-cad2d",
    summary: "从样板到装配图出图流程，配合校内 CAD 上机周使用。",
  },
  {
    id: "mooc-163-draw",
    platformId: "plt-icourse163",
    title: "机械制图（西安交通大学）",
    provider: "西安交通大学",
    courseUrl: "https://www.icourse163.org/course/XJTU-1206116804",
    summary: "与爱课程平台同源公开课，可安排为先修或补学资源。",
  },
  {
    id: "mooc-163-design",
    platformId: "plt-icourse163",
    title: "机械设计基础（多校共建）",
    provider: "高等教育出版社",
    courseUrl: "https://www.icourse163.org/course/example-design-basic",
    summary: "机构与传动章节与校内「机械设计基础」章节可对齐引用。",
  },
  {
    id: "mooc-ouchn-maint",
    platformId: "plt-ouchn",
    title: "机电设备装调与维护（双高专业）",
    provider: "×× 职业技术学院",
    courseUrl: "https://www.smartedu.cn/course/example-me-maintenance",
    summary: "面向高职的装调实训录像与工单式任务，可用于实训周拓展。",
  },
  {
    id: "mooc-coursera-cad",
    platformId: "plt-coursera",
    title: "Introduction to Engineering Graphics",
    provider: "University · Coursera",
    courseUrl: "https://www.coursera.org/learn/example-eng-graphics",
    summary: "英文学术向图学入门，适合国际化专班或双语班补充材料。",
  },
];
