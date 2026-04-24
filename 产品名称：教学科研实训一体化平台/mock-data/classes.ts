import type { Class } from "./types";

/**
 * 班级数据（共 6 个班，~160 人）
 *
 * - 机制 2301 主班 28 人（主故事线）
 * - 机制 2302 对照班 25 人（两极分化，演示异常洞察）
 * - 机制 2201 上届班 26 人（已结业，历史数据）
 * - 法学 2301 26 人
 * - 护理 2301 30 人
 * - 学前 2301 24 人
 */
export const classes: Class[] = [
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
    id: "cls-mech-2201",
    professionId: "prof-mech",
    name: "机制 2201",
    grade: 2022,
    studentCount: 26,
    headTeacherId: "t-li",
    status: "in_session",
    description: "李建国上届带班，大二课程已完成，用于历史数据对照。",
  },
  {
    id: "cls-law-2301",
    professionId: "prof-law",
    name: "法学 2301",
    grade: 2023,
    studentCount: 26,
    headTeacherId: "t-zhao",
    status: "in_session",
    description: "赵文静带班，女生比例较高，课堂讨论活跃。",
  },
  {
    id: "cls-nurse-2301",
    professionId: "prof-nurse",
    name: "护理 2301",
    grade: 2023,
    studentCount: 30,
    headTeacherId: "t-wanglh",
    status: "in_session",
    description: "王丽华带班，班风勤奋，护理操作动手能力普遍较强。",
  },
  {
    id: "cls-edu-2301",
    professionId: "prof-edu",
    name: "学前 2301",
    grade: 2023,
    studentCount: 24,
    headTeacherId: "t-sun",
    status: "in_session",
    description: "孙小艳带班，学前专业首届学生，学院正推进知识图谱建设。",
  },
];
