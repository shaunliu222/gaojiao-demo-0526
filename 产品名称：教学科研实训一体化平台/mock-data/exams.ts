import type { ExamEvalInput, ExamEvalSummary } from "./types";
import { withExamStudentResults } from "./evalResultBuilders";

/**
 * 考试评价汇总
 *
 * - 主线期中 1 次（2301 + 2302 双班对照）
 * - 主线期末 1 次（目标期末，展示"未到考试日期"的预告态）
 * - 互换性与技术测量期中 1 次（2101）
 * - 工业机器人期中 1 次（2303）
 */
const examEvaluationsRaw: ExamEvalInput[] = [
  // ====================================================================
  // 1. 主线期中考试（2301 + 2302 联考，真实数据）
  // ====================================================================
  {
    id: "exam-m-midterm",
    examTitle: "《机械制图与CAD》2026 春 · 期中考试",
    courseId: "course-mech-draw",
    classIds: ["cls-mech-2301", "cls-mech-2302"],
    teacherId: "t-li",
    examAt: "2026-04-17",
    totalStudents: 53,
    submittedCount: 52,
    averageScore: 74.2,
    maxScore: 98,
    minScore: 42,
    passRate: 0.87,
    scoreBuckets: [
      { range: "90-100", count: 7 },
      { range: "80-89", count: 18 },
      { range: "70-79", count: 16 },
      { range: "60-69", count: 6 },
      { range: "<60", count: 5 },
    ],
    hotWrongPoints: [
      { name: "组合体综合题（读图+画图）", knowledgeNodeId: "kn-mech-005", wrongRate: 0.42, aiCause: "综合题仍是最难的一类，主要扣分点在尺寸重复或遗漏。" },
      { name: "截交线相贯线", knowledgeNodeId: "kn-mech-006", wrongRate: 0.48, aiCause: "专题训练过但仍有半数学生未能在考场短时间完成。" },
      { name: "剖视图选型错误", knowledgeNodeId: "kn-mech-007", wrongRate: 0.31, aiCause: "学生对「对称件优先用半剖」理解浅。" },
    ],
    keyStudents: [
      { studentId: "s-mech2301-01", studentName: "张伟", reason: "全校第一（98 分）", score: 98 },
      { studentId: "s-mech2302-02", studentName: "林诗涵", reason: "2302 班第一（94 分）", score: 94 },
      { studentId: "s-mech2302-01", studentName: "陈浩宇", reason: "最低分 42 · 重点帮扶对象", score: 42 },
      { studentId: "s-mech2301-06", studentName: "周子航", reason: "低于年级平均 10+ 分", score: 63 },
    ],
    aiInsights: [
      {
        id: "ai-exam-m-1",
        title: "2301 班符合预期，2302 班仍偏离目标",
        summary:
          "2301 班平均 79.8 接近计划目标（80），2302 班平均 68.3 低于目标（75），主要差距集中在综合题与截交/相贯。",
        actionSuggestion:
          "下半学期建议：\n1. 2302 班保留每周一次答疑补课；\n2. 期末前安排 3 次综合题专项训练；\n3. 对陈浩宇等 5 名不及格学生启动「一对一」辅导。",
      },
      {
        id: "ai-exam-m-2",
        title: "截交/相贯线难点仍未完全攻克",
        summary: "整体错误率 48%，与第3.4节作业（52%）相比进步有限。",
        actionSuggestion: "建议在第6章零件图环节，选择含截交相贯特征的零件作为教学案例。",
      },
      {
        id: "ai-exam-m-3",
        title: "整体通过率 87% 略高于上届 85%",
        summary: "本届难度系数 0.74，比上届 0.71 略易，但绝对通过率仍有提升。",
        actionSuggestion: "期末保持当前难度区间。",
      },
    ],
    classComparison: [
      { classId: "cls-mech-2301", avgScore: 79.8, passRate: 0.96 },
      { classId: "cls-mech-2302", avgScore: 68.3, passRate: 0.76 },
    ],
    questionAccuracy: [
      { questionNo: 1, title: "投影与三视图基础", knowledgeNodeId: "kn-mech-004", accuracy: 0.88 },
      { questionNo: 2, title: "点线面综合", knowledgeNodeId: "kn-mech-004", accuracy: 0.75 },
      { questionNo: 3, title: "组合体读图与补线", knowledgeNodeId: "kn-mech-005", accuracy: 0.58 },
      { questionNo: 4, title: "截交线与相贯线", knowledgeNodeId: "kn-mech-006", accuracy: 0.52 },
      { questionNo: 5, title: "剖视图与机件表达", knowledgeNodeId: "kn-mech-007", accuracy: 0.69 },
    ],
  },

  // ====================================================================
  // 2. 主线期末考试（尚未开始，展示预告态）
  // ====================================================================
  {
    id: "exam-m-final",
    examTitle: "《机械制图与CAD》2026 春 · 期末考试（待开考）",
    courseId: "course-mech-draw",
    classIds: ["cls-mech-2301", "cls-mech-2302"],
    teacherId: "t-li",
    examAt: "2026-06-19",
    totalStudents: 53,
    submittedCount: 0,
    averageScore: 0,
    maxScore: 0,
    minScore: 0,
    passRate: 0,
    scoreBuckets: [],
    hotWrongPoints: [],
    keyStudents: [],
    aiInsights: [
      {
        id: "ai-exam-m-final-1",
        title: "AI 根据期中数据给出期末备考建议",
        summary:
          "建议期末卷覆盖：组合体（20%）+ 截交/相贯（15%）+ 机件表达（20%）+ 零件图装配图（25%）+ CAD 综合（20%）。",
        actionSuggestion: "期末前 2 周在协同评价页面可下发模考卷。",
      },
    ],
    classComparison: [],
  },

  // ====================================================================
  // 3. 互换性与技术测量 · 期中
  // ====================================================================
  {
    id: "exam-tol-midterm",
    examTitle: "《互换性与技术测量》2026 春 · 期中考试",
    courseId: "course-mech-tolerance",
    classIds: ["cls-mech-2101"],
    teacherId: "t-wanglh",
    examAt: "2026-04-18",
    totalStudents: 30,
    submittedCount: 30,
    averageScore: 79.8,
    maxScore: 96,
    minScore: 58,
    passRate: 0.97,
    scoreBuckets: [
      { range: "90-100", count: 5 },
      { range: "80-89", count: 12 },
      { range: "70-79", count: 9 },
      { range: "60-69", count: 3 },
      { range: "<60", count: 1 },
    ],
    hotWrongPoints: [
      { name: "形位公差基准体系", knowledgeNodeId: "kn-mech-009", wrongRate: 0.35, aiCause: "多基准组合时遗漏最大实体要求。" },
      { name: "配合代号与工艺可行性", knowledgeNodeId: "kn-mech-009", wrongRate: 0.28, aiCause: "选用过紧公差未对照典型加工方法。" },
      { name: "粗糙度与功能表面", knowledgeNodeId: "kn-mech-009", wrongRate: 0.20, aiCause: "密封面与非功能面 Ra 取值依据表述不清。" },
    ],
    keyStudents: [
      { studentId: "s-mech2101-01", studentName: "白若雪", reason: "第一名 96 分", score: 96 },
    ],
    aiInsights: [
      {
        id: "ai-exam-tol-1",
        title: "与毕业设计衔接：检测方案仍偏薄",
        summary: "检测题块平均分低于公差选用块，说明「会标不会验」仍存在。",
        actionSuggestion: "期中后每次实验课强制提交 1 页检测记录照片。",
      },
    ],
    classComparison: [{ classId: "cls-mech-2101", avgScore: 79.8, passRate: 0.97 }],
    questionAccuracy: [
      { questionNo: 1, title: "极限与配合概念", knowledgeNodeId: "kn-mech-009", accuracy: 0.90 },
      { questionNo: 2, title: "形位公差标注", knowledgeNodeId: "kn-mech-009", accuracy: 0.68 },
      { questionNo: 3, title: "粗糙度选用", knowledgeNodeId: "kn-mech-009", accuracy: 0.78 },
      { questionNo: 4, title: "简易检测方案", knowledgeNodeId: "kn-mech-009", accuracy: 0.72 },
    ],
  },

  // ====================================================================
  // 4. 工业机器人 · 期中
  // ====================================================================
  {
    id: "exam-rob-midterm",
    examTitle: "《工业机器人技术应用基础》2026 春 · 期中考试",
    courseId: "course-mech-robotics",
    classIds: ["cls-mech-2303"],
    teacherId: "t-zhao",
    examAt: "2026-04-20",
    totalStudents: 26,
    submittedCount: 26,
    averageScore: 83.1,
    maxScore: 99,
    minScore: 64,
    passRate: 1.0,
    scoreBuckets: [
      { range: "90-100", count: 7 },
      { range: "80-89", count: 12 },
      { range: "70-79", count: 5 },
      { range: "60-69", count: 2 },
      { range: "<60", count: 0 },
    ],
    hotWrongPoints: [
      { name: "工作站 I/O 互锁逻辑", knowledgeNodeId: "kn-mech-010", wrongRate: 0.26, aiCause: "仿真能通过但逻辑图表达不完整。" },
      { name: "工具坐标与工件坐标混用", knowledgeNodeId: "kn-mech-012", wrongRate: 0.21, aiCause: "程序注释缺失导致复查困难。" },
    ],
    keyStudents: [{ studentId: "s-mech2303-01", studentName: "宋佳雯", reason: "第一名 99 分", score: 99 }],
    aiInsights: [
      {
        id: "ai-exam-rob-1",
        title: "仿真强、文档弱",
        summary: "班级仿真题正确率显著高于「互锁说明」开放题。",
        actionSuggestion: "期末前增加 1 次「程序+安全说明」双页模板训练。",
      },
    ],
    classComparison: [{ classId: "cls-mech-2303", avgScore: 83.1, passRate: 1.0 }],
    questionAccuracy: [
      { questionNo: 1, title: "坐标系与示教基础", knowledgeNodeId: "kn-mech-012", accuracy: 0.91 },
      { questionNo: 2, title: "轨迹与节拍", knowledgeNodeId: "kn-mech-012", accuracy: 0.84 },
      { questionNo: 3, title: "互锁与安全", knowledgeNodeId: "kn-mech-010", accuracy: 0.74 },
      { questionNo: 4, title: "与装配图衔接", knowledgeNodeId: "kn-mech-010", accuracy: 0.80 },
    ],
  },
];

export const examEvaluations: ExamEvalSummary[] =
  examEvaluationsRaw.map((e) => withExamStudentResults(e));
