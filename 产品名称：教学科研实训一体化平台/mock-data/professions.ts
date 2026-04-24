import type { Profession } from "./types";

/**
 * 专业数据：4 个跨学科专业
 *
 * - prof-mech  机械工程     主线：完整图谱 + 完整教学闭环
 * - prof-law   法学         非主线：简化图谱 + 1 个教学计划
 * - prof-nurse 护理学       非主线：简化图谱 + 丰富实训
 * - prof-edu   学前教育     非主线：未建图谱（空状态演示）
 */
export const professions: Profession[] = [
  {
    id: "prof-mech",
    name: "机械工程",
    code: "0802",
    college: "机械工程学院",
    description:
      "面向智能制造、装备制造行业培养具备机械设计、制造、控制能力的高级应用型人才。",
    hasKnowledgeGraph: true,
  },
  {
    id: "prof-law",
    name: "法学",
    code: "0301",
    college: "法学院",
    description:
      "系统培养掌握法学基础理论，具备法律实务、法律思维和社会治理能力的复合型法律人才。",
    hasKnowledgeGraph: true,
  },
  {
    id: "prof-nurse",
    name: "护理学",
    code: "1011",
    college: "护理学院",
    description:
      "培养具有现代护理理念与实务操作能力，适应医院、社区、康养机构等多场景的护理专业人才。",
    hasKnowledgeGraph: true,
  },
  {
    id: "prof-edu",
    name: "学前教育",
    code: "0401",
    college: "教育学院",
    description:
      "培养热爱学前教育事业、具备幼儿教育教学与管理能力的新型幼儿园教师（当前专业尚未建立知识图谱）。",
    hasKnowledgeGraph: false,
  },
];
