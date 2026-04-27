import type { Class } from "./types";

/**
 * 班级数据（6 个班，覆盖大一～大四同专业不同年级段）
 *
 * - 机制 2401：大一新生（辅线：专业导论）
 * - 机制 2301 / 2302：大二（主故事线《机械制图与CAD》）
 * - 机制 2303：大二平行班（辅线：工业机器人）
 * - 机制 2201：大三上届班（历史制图计划）
 * - 机制 2101：大四（辅线：互换性与技术测量等）
 */
export const classes: Class[] = [
  {
    id: "cls-mech-2401",
    professionId: "prof-mech",
    name: "机制 2401",
    grade: 2024,
    studentCount: 6,
    headTeacherId: "t-sun",
    status: "in_session",
    description: "大一新生班，本学期以专业导论与工程认知为主，逐步衔接工程图学。",
  },
  {
    id: "cls-mech-2301",
    professionId: "prof-mech",
    name: "机制 2301",
    grade: 2023,
    studentCount: 28,
    headTeacherId: "t-li",
    status: "in_session",
    description: "李建国老师带班，学情中上水平，班风踏实。主故事线班级。",
  },
  {
    id: "cls-mech-2302",
    professionId: "prof-mech",
    name: "机制 2302",
    grade: 2023,
    studentCount: 25,
    headTeacherId: "t-wang",
    status: "in_session",
    description: "王海峰带班，学情两极分化明显，前 1/4 和后 1/4 差距较大。",
  },
  {
    id: "cls-mech-2303",
    professionId: "prof-mech",
    name: "机制 2303",
    grade: 2023,
    studentCount: 26,
    headTeacherId: "t-zhao",
    status: "in_session",
    description: "大二平行班，整体偏动手与仿真，与 2301/2302 同修制图课，辅修工业机器人技术。",
  },
  {
    id: "cls-mech-2201",
    professionId: "prof-mech",
    name: "机制 2201",
    grade: 2022,
    studentCount: 26,
    headTeacherId: "t-li",
    status: "in_session",
    description: "李建国上届带班，大三阶段，用于历史制图数据对照。",
  },
  {
    id: "cls-mech-2101",
    professionId: "prof-mech",
    name: "机制 2101",
    grade: 2021,
    studentCount: 30,
    headTeacherId: "t-wanglh",
    status: "in_session",
    description: "大四毕业班，重点修读互换性与技术测量、制造工艺等综合课程。",
  },
];
