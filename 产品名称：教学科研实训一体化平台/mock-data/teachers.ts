import type { Teacher } from "./types";

/**
 * 教师数据（共 6 位，覆盖 4 个专业）
 *
 * 主角：李建国（机械工程，制图教研室主任，整个主故事线由他串起）
 */
export const teachers: Teacher[] = [
  {
    id: "t-li",
    name: "李建国",
    gender: "男",
    title: "副教授 · 制图教研室主任",
    college: "机械工程学院",
    department: "制图教研室",
    subjectIds: ["subj-mech-drawing", "subj-mech-cad"],
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
    college: "法学院",
    department: "民商法教研室",
    subjectIds: ["subj-law-civil", "subj-law-theory"],
    avatar: "/avatars/teacher-zhao.png",
    email: "zhaowenjing@univ.edu.cn",
  },
  {
    id: "t-wanglh",
    name: "王丽华",
    gender: "女",
    title: "副教授 · 护理学硕士",
    college: "护理学院",
    department: "基础护理教研室",
    subjectIds: ["subj-nurse-basic", "subj-nurse-internal"],
    avatar: "/avatars/teacher-wanglh.png",
    email: "wanglihua@univ.edu.cn",
  },
  {
    id: "t-sun",
    name: "孙小艳",
    gender: "女",
    title: "讲师",
    college: "教育学院",
    department: "学前教育教研室",
    subjectIds: ["subj-edu-activity", "subj-edu-theory"],
    avatar: "/avatars/teacher-sun.png",
    email: "sunxiaoyan@univ.edu.cn",
  },
];
