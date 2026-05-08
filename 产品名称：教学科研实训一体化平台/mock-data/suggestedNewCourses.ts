import type { SuggestedNewCourse } from "./types";

/**
 * AI 图谱差异分析后建议新增、但尚未入库的虚拟课程（课程中心虚拟行）。
 */
export const suggestedNewCourses: SuggestedNewCourse[] = [
  {
    id: "suggest-course-digital-twin",
    name: "数字孪生与虚实联调",
    professionId: "prof-mech",
    subjectId: "subj-mech-process",
    recommendedCredit: 2,
    recommendedHours: 32,
    semester: "2026秋季（拟）",
    uncoveredNodeIds: ["kn-mech-016", "kn-mech-012", "kn-mech-010"],
    reason:
      "最新 L1 能力谱系在「智能制造与孪生可视化」与「三维特征—装配—工程图」之间增加了虚实联调叙事：现有工艺、机器人、制图链条课程未能单独覆盖「产线状态同步—仿真验证—回写工艺」闭环。建议学院端立项 2 学分选修/微专业模块，承接图谱缺口并与工艺学、工业机器人课衔接。",
    generatedAt: "2026-03-28T10:05:00+08:00",
  },
  {
    id: "suggest-course-explainable-fault",
    name: "智能装备故障诊断与可解释 AI",
    professionId: "prof-mech",
    subjectId: "subj-mech-robot",
    recommendedCredit: 2,
    recommendedHours: 28,
    semester: "2026秋季（拟）",
    uncoveredNodeIds: ["kn-mech-014", "kn-mech-015", "kn-mech-017"],
    reason:
      "图谱在机电液与工业机器人节点之上，新增对「可解释诊断与安全互锁」的跨域要求：液压气动典型回路与示教节拍知识已存在，但缺少将异常序列、传感器证据与模型输出对齐的教学载体。建议新增课程集中演练故障树 + 可解释输出边界，与学科内 AI 规范课形成递进。",
    generatedAt: "2026-03-28T10:05:00+08:00",
  },
];
