import type { Teacher } from "./types";

/**
 * 教师数据（6 位，均在机械工程学院，覆盖制图/设计制造/机电与质检等方向）
 *
 * 主角：李建国（制图教研室主任，主故事线）
 */
export const teachers: Teacher[] = [
  {
    id: "t-li",
    name: "李建国",
    gender: "男",
    title: "副教授 · 制图教研室主任",
    college: "机械工程学院",
    department: "制图教研室",
    subjectIds: ["subj-mech-drawing", "subj-mech-cad", "subj-mech-ai"],
    isDepartmentLead: true,
    avatar: "/avatars/teacher-li.png",
    email: "lijianguo@univ.edu.cn",
  },
  {
    id: "t-wang",
    name: "王海峰",
    gender: "男",
    title: "讲师",
    college: "机械工程学院",
    department: "制图教研室",
    subjectIds: ["subj-mech-drawing"],
    avatar: "/avatars/teacher-wang.png",
    email: "wanghaifeng@univ.edu.cn",
  },
  {
    id: "t-chen",
    name: "陈美玲",
    gender: "女",
    title: "副教授",
    college: "机械工程学院",
    department: "机械设计教研室",
    subjectIds: ["subj-mech-design", "subj-mech-manu"],
    avatar: "/avatars/teacher-chen.png",
    email: "chenmeiling@univ.edu.cn",
  },
  {
    id: "t-zhao",
    name: "赵文静",
    gender: "女",
    title: "副教授",
    college: "机械工程学院",
    department: "机电测控教研室",
    subjectIds: ["subj-mech-hydraulic", "subj-mech-robot"],
    avatar: "/avatars/teacher-zhao.png",
    email: "zhaowenjing@univ.edu.cn",
  },
  {
    id: "t-wanglh",
    name: "王丽华",
    gender: "女",
    title: "副教授 · 机械制造方向",
    college: "机械工程学院",
    department: "机械制造教研室",
    subjectIds: ["subj-mech-tolerance", "subj-mech-process"],
    avatar: "/avatars/teacher-wanglh.png",
    email: "wanglihua@univ.edu.cn",
  },
  {
    id: "t-sun",
    name: "孙小艳",
    gender: "女",
    title: "讲师",
    college: "机械工程学院",
    department: "机电测控教研室",
    subjectIds: ["subj-mech-intro", "subj-mech-cad", "subj-mech-ai"],
    avatar: "/avatars/teacher-sun.png",
    email: "sunxiaoyan@univ.edu.cn",
  },
];
