import type { ExamEvalSummary } from "./types";

/**
 * 考试评价汇总
 *
 * - 主线期中 1 次（2301 + 2302 双班对照）
 * - 主线期末 1 次（目标期末，展示"未到考试日期"的预告态）
 * - 法学期中 1 次
 * - 护理期中 1 次
 */
export const examEvaluations: ExamEvalSummary[] = [
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
      { name: "组合体综合题（读图+画图）", knowledgeNodeId: "kn-mech-031", wrongRate: 0.42, aiCause: "综合题仍是最难的一类，主要扣分点在尺寸重复或遗漏。" },
      { name: "截交线相贯线", knowledgeNodeId: "kn-mech-029", wrongRate: 0.48, aiCause: "专题训练过但仍有半数学生未能在考场短时间完成。" },
      { name: "剖视图选型错误", knowledgeNodeId: "kn-mech-039", wrongRate: 0.31, aiCause: "学生对「对称件优先用半剖」理解浅。" },
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
  // 3. 法学期中考试
  // ====================================================================
  {
    id: "exam-l-midterm",
    examTitle: "《民法典总则编》2026 春 · 期中考试",
    courseId: "course-law-civil",
    classIds: ["cls-law-2301"],
    teacherId: "t-zhao",
    examAt: "2026-04-18",
    totalStudents: 26,
    submittedCount: 26,
    averageScore: 78.4,
    maxScore: 96,
    minScore: 58,
    passRate: 0.96,
    scoreBuckets: [
      { range: "90-100", count: 4 },
      { range: "80-89", count: 10 },
      { range: "70-79", count: 8 },
      { range: "60-69", count: 3 },
      { range: "<60", count: 1 },
    ],
    hotWrongPoints: [
      { name: "表见代理构成要件", knowledgeNodeId: "kn-law-015", wrongRate: 0.38, aiCause: "与作业数据一致，要件识别仍不全。" },
      { name: "诉讼时效中止中断", knowledgeNodeId: "kn-law-021", wrongRate: 0.42, aiCause: "概念混淆。" },
      { name: "法律行为效力认定", knowledgeNodeId: "kn-law-014", wrongRate: 0.22, aiCause: "可撤销与效力待定边界模糊。" },
    ],
    keyStudents: [
      { studentId: "s-law2301-01", studentName: "宋佳雯", reason: "第一名 96 分", score: 96 },
    ],
    aiInsights: [
      {
        id: "ai-exam-l-1",
        title: "与班级画像吻合：法律文书是最大弱项",
        summary: "案例论证部分平均分 21/30，文书格式部分 11/20。建议下半学期启动 2 轮文书写作训练。",
        actionSuggestion: "按计划，在 4 月 25 日安排法律文书专项实训。",
      },
    ],
    classComparison: [{ classId: "cls-law-2301", avgScore: 78.4, passRate: 0.96 }],
  },

  // ====================================================================
  // 4. 护理期中考试
  // ====================================================================
  {
    id: "exam-n-midterm",
    examTitle: "《基础护理学》2026 春 · 期中考试",
    courseId: "course-nurse-basic",
    classIds: ["cls-nurse-2301"],
    teacherId: "t-wanglh",
    examAt: "2026-04-20",
    totalStudents: 30,
    submittedCount: 30,
    averageScore: 82.7,
    maxScore: 99,
    minScore: 64,
    passRate: 1.0,
    scoreBuckets: [
      { range: "90-100", count: 8 },
      { range: "80-89", count: 15 },
      { range: "70-79", count: 5 },
      { range: "60-69", count: 2 },
      { range: "<60", count: 0 },
    ],
    hotWrongPoints: [
      { name: "情景判断题", knowledgeNodeId: "kn-nur-002", wrongRate: 0.27, aiCause: "临床思维薄弱的画像再次验证。" },
      { name: "药物剂量换算", knowledgeNodeId: "kn-nur-014", wrongRate: 0.19, aiCause: "学生计算细节易马虎。" },
    ],
    keyStudents: [{ studentId: "s-nurse2301-01", studentName: "白若雪", reason: "第一名 99 分", score: 99 }],
    aiInsights: [
      {
        id: "ai-exam-n-1",
        title: "全班通过率 100%",
        summary: "理论+操作均无不及格，班级整体稳定。",
        actionSuggestion: "期末前再设计 2 次情景模拟以巩固临床思维。",
      },
    ],
    classComparison: [{ classId: "cls-nurse-2301", avgScore: 82.7, passRate: 1.0 }],
  },
];
