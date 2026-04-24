import type { HomeworkEvalSummary } from "./types";

/**
 * 作业评价汇总（AI 批阅后的总览数据，用于协同评价页面）
 *
 * 主线《机械制图与CAD》6 次（其中 hw-m-003"组合体三视图"数据最详细，是主故事线的关键评价节点）
 * 法学 2 次
 * 护理 2 次
 * 合计 10 次
 */
export const homeworkEvaluations: HomeworkEvalSummary[] = [
  // ====================================================================
  // 1. 主线 · 第2章投影基础小测（进行中班前期）
  // ====================================================================
  {
    id: "hw-m-001",
    homeworkTitle: "第2章 · 点线面投影小测",
    courseId: "course-mech-draw",
    planId: "plan-main",
    sectionId: "sec-2-3",
    classId: "cls-mech-2301",
    teacherId: "t-li",
    assignedAt: "2026-03-11",
    dueAt: "2026-03-14",
    submissionCount: 28,
    totalStudents: 28,
    averageScore: 82.1,
    maxScore: 98,
    minScore: 62,
    scoreBuckets: [
      { range: "90-100", count: 6 },
      { range: "80-89", count: 14 },
      { range: "70-79", count: 6 },
      { range: "60-69", count: 2 },
      { range: "<60", count: 0 },
    ],
    aiRatings: { excellent: 6, good: 14, pass: 8, fail: 0 },
    hotWrongPoints: [
      { name: "重影点判别", knowledgeNodeId: "kn-mech-018", wrongRate: 0.32, aiCause: "学生容易混淆「可见点」与「被遮挡点」判别依据。" },
      { name: "铅垂面三投影", knowledgeNodeId: "kn-mech-021", wrongRate: 0.25, aiCause: "三投影面特征识记不牢，部分学生把类似面错判成积聚面。" },
    ],
    keyStudents: [
      { studentId: "s-mech2301-06", studentName: "周子航", reason: "连续 2 次低分", score: 62, changeTrend: "下降" },
      { studentId: "s-mech2301-01", studentName: "张伟", reason: "满分突出", score: 98, changeTrend: "稳定" },
    ],
    aiInsights: [
      { id: "ai-m-001", title: "重影点识别是本次薄弱点", summary: "32% 学生在重影点题失分，需补充可见性规则讲解。", actionSuggestion: "第2章结束前增加 10 分钟可见性专题。" },
    ],
    questionAccuracy: [
      { questionNo: 1, title: "点的三面投影", knowledgeNodeId: "kn-mech-017", accuracy: 0.96 },
      { questionNo: 2, title: "两点相对位置", knowledgeNodeId: "kn-mech-018", accuracy: 0.68 },
      { questionNo: 3, title: "直线投影分类", knowledgeNodeId: "kn-mech-019", accuracy: 0.88 },
      { questionNo: 4, title: "平面投影分类", knowledgeNodeId: "kn-mech-021", accuracy: 0.75 },
      { questionNo: 5, title: "直线与平面相对位置", knowledgeNodeId: "kn-mech-022", accuracy: 0.79 },
    ],
  },

  // ====================================================================
  // 2. 主线 · 第3章组合体作业【核心数据】
  // ====================================================================
  {
    id: "hw-m-003",
    homeworkTitle: "第3.2节 · 组合体三视图作业（轴承座+支架+连接座）",
    courseId: "course-mech-draw",
    planId: "plan-main",
    sectionId: "sec-3-2",
    classId: "cls-mech-2301",
    teacherId: "t-li",
    assignedAt: "2026-03-18",
    dueAt: "2026-03-23",
    submissionCount: 28,
    totalStudents: 28,
    averageScore: 79.3,
    maxScore: 95,
    minScore: 54,
    scoreBuckets: [
      { range: "90-100", count: 4 },
      { range: "80-89", count: 12 },
      { range: "70-79", count: 8 },
      { range: "60-69", count: 3 },
      { range: "<60", count: 1 },
    ],
    aiRatings: { excellent: 4, good: 12, pass: 11, fail: 1 },
    hotWrongPoints: [
      { name: "截交线绘制遗漏", knowledgeNodeId: "kn-mech-028", wrongRate: 0.43, sampleWrongAnswer: "轴承座圆柱被斜切后截交线未画，俯视图为封闭椭圆。", aiCause: "学生对截交线出现的触发条件认识模糊——平面切割回转体必产生截交线，且需投影到所有视图。" },
      { name: "相贯线判别错误", knowledgeNodeId: "kn-mech-029", wrongRate: 0.39, sampleWrongAnswer: "两圆柱垂直相贯线画成圆弧而非非圆曲线。", aiCause: "学生尚未掌握两回转体轴线正交情况下相贯线的走向规律。" },
      { name: "过渡线处理错误", knowledgeNodeId: "kn-mech-031", wrongRate: 0.29, sampleWrongAnswer: "底板和立柱过渡处把圆角误画成直角。", aiCause: "学生习惯机械化按轮廓画线，忽略铸造圆角的工艺合理性。" },
      { name: "组合体尺寸重复标注", knowledgeNodeId: "kn-mech-032", wrongRate: 0.25, aiCause: "学生对定形/定位/总体尺寸的层次理解不清。" },
    ],
    keyStudents: [
      { studentId: "s-mech2301-01", studentName: "张伟", reason: "综合题满分 · 空间想象力突出", score: 95, changeTrend: "稳定" },
      { studentId: "s-mech2301-06", studentName: "周子航", reason: "低于及格线 · 连续 3 次下滑", score: 54, changeTrend: "下降" },
      { studentId: "s-mech2301-03", studentName: "王一鸣", reason: "手工绘图明显差于 CAD · 软件依赖倾向", score: 72, changeTrend: "稳定" },
      { studentId: "s-mech2301-24", studentName: "张梓豪", reason: "从 78 升到 88 · 进步显著", score: 88, changeTrend: "上升" },
    ],
    aiInsights: [
      {
        id: "ai-m-003-1",
        title: "截交线/相贯线是 43% 学生的丢分主因",
        summary:
          "截交线遗漏率 43%、相贯线判别错误 39%，两个专题在下一小节（3.4）需要重点拆解。结合 2301 班空间想象力（76 分）中等，建议补充 3D 演示与手工剪切模型。",
        actionSuggestion:
          "行动建议：\n① 把 3.4 节原定的 2 课时扩展为 3 课时；\n② 课前 24 小时让学生观看《截交线 · 相贯线典型例题集》视频；\n③ 课堂引入 SolidWorks 三维切割演示。",
      },
      {
        id: "ai-m-003-2",
        title: "王一鸣的「软件依赖倾向」值得关注",
        summary: "王一鸣 CAD 题 95 分 vs 手绘题 48 分，差距显著。建议安排 2 次徒手绘图专项练习。",
        actionSuggestion: "安排朋辈辅导（张伟为例），在下次小组作业中鼓励他先手绘后 CAD。",
      },
      {
        id: "ai-m-003-3",
        title: "对照班 2302 同步显现更严重分化",
        summary:
          "2302 班同作业平均分 68.5 vs 2301 班 79.3，差距 10 分以上。建议 2302 班单独加一次答疑。",
        actionSuggestion: "打开协同评价进入 cls-mech-2302 详情查看并下发「基础补救作业包」。",
      },
    ],
    questionAccuracy: [
      { questionNo: 1, title: "组合体构成方式识别", knowledgeNodeId: "kn-mech-030", accuracy: 0.89 },
      { questionNo: 2, title: "形体分析法应用", knowledgeNodeId: "kn-mech-034", accuracy: 0.82 },
      { questionNo: 3, title: "轴承座三视图绘制", knowledgeNodeId: "kn-mech-031", accuracy: 0.71 },
      { questionNo: 4, title: "支架三视图 + 尺寸标注", knowledgeNodeId: "kn-mech-031", accuracy: 0.68 },
      { questionNo: 5, title: "连接座综合绘制", knowledgeNodeId: "kn-mech-031", accuracy: 0.62 },
      { questionNo: 6, title: "读组合体视图", knowledgeNodeId: "kn-mech-033", accuracy: 0.75 },
      { questionNo: 7, title: "截交线综合", knowledgeNodeId: "kn-mech-028", accuracy: 0.57 },
      { questionNo: 8, title: "相贯线综合", knowledgeNodeId: "kn-mech-029", accuracy: 0.61 },
    ],
  },

  // ====================================================================
  // 3. 主线 · 2302 班同作业（用于班级对照）
  // ====================================================================
  {
    id: "hw-m-003-2302",
    homeworkTitle: "第3.2节 · 组合体三视图作业（2302 班）",
    courseId: "course-mech-draw",
    planId: "plan-main",
    sectionId: "sec-3-2",
    classId: "cls-mech-2302",
    teacherId: "t-wang",
    assignedAt: "2026-03-18",
    dueAt: "2026-03-23",
    submissionCount: 23,
    totalStudents: 25,
    averageScore: 68.5,
    maxScore: 96,
    minScore: 38,
    scoreBuckets: [
      { range: "90-100", count: 3 },
      { range: "80-89", count: 3 },
      { range: "70-79", count: 6 },
      { range: "60-69", count: 5 },
      { range: "<60", count: 6 },
    ],
    aiRatings: { excellent: 3, good: 3, pass: 11, fail: 6 },
    hotWrongPoints: [
      { name: "三视图对应规律违反", knowledgeNodeId: "kn-mech-015", wrongRate: 0.52, aiCause: "后 1/4 学生基础长对正-高平齐-宽相等都没掌握。" },
      { name: "截交线绘制遗漏", knowledgeNodeId: "kn-mech-028", wrongRate: 0.57, aiCause: "与 2301 班相同但错误率更高。" },
      { name: "相贯线判别错误", knowledgeNodeId: "kn-mech-029", wrongRate: 0.52, aiCause: "基础空间想象力不足。" },
    ],
    keyStudents: [
      { studentId: "s-mech2302-01", studentName: "陈浩宇", reason: "严重不及格 · 缺交 2 次", score: 38, changeTrend: "下降" },
      { studentId: "s-mech2302-02", studentName: "林诗涵", reason: "全班最高分", score: 96, changeTrend: "稳定" },
    ],
    aiInsights: [
      {
        id: "ai-m-003-2302-1",
        title: "2302 班基础投影未掌握，后续学习风险极高",
        summary:
          "52% 学生在最基础的「三视图对应规律」上出错，这属于 2.2 节的内容。当前继续向前推进风险高，建议安排一次「投影基础回顾测验」。",
        actionSuggestion: "紧急：本周内安排 2 课时基础回顾 + 一对一答疑。陈浩宇等学生进入「基础补救小组」。",
      },
    ],
    questionAccuracy: [
      { questionNo: 1, title: "组合体构成方式识别", knowledgeNodeId: "kn-mech-030", accuracy: 0.74 },
      { questionNo: 2, title: "形体分析法应用", knowledgeNodeId: "kn-mech-034", accuracy: 0.68 },
      { questionNo: 3, title: "轴承座三视图绘制", knowledgeNodeId: "kn-mech-031", accuracy: 0.55 },
      { questionNo: 7, title: "截交线综合", knowledgeNodeId: "kn-mech-028", accuracy: 0.43 },
      { questionNo: 8, title: "相贯线综合", knowledgeNodeId: "kn-mech-029", accuracy: 0.48 },
    ],
  },

  // ====================================================================
  // 4. 主线 · 剖视图作业
  // ====================================================================
  {
    id: "hw-m-004",
    homeworkTitle: "第4.3节 · 剖视图作业",
    courseId: "course-mech-draw",
    planId: "plan-main",
    sectionId: "sec-4-3",
    classId: "cls-mech-2301",
    teacherId: "t-li",
    assignedAt: "2026-04-06",
    dueAt: "2026-04-11",
    submissionCount: 27,
    totalStudents: 28,
    averageScore: 81.5,
    maxScore: 96,
    minScore: 64,
    scoreBuckets: [
      { range: "90-100", count: 5 },
      { range: "80-89", count: 13 },
      { range: "70-79", count: 7 },
      { range: "60-69", count: 2 },
      { range: "<60", count: 0 },
    ],
    aiRatings: { excellent: 5, good: 13, pass: 9, fail: 0 },
    hotWrongPoints: [
      { name: "剖切面位置标注", knowledgeNodeId: "kn-mech-039", wrongRate: 0.27, aiCause: "剖切符号 A-A 标注遗漏或方向反。" },
      { name: "半剖与全剖选择", knowledgeNodeId: "kn-mech-039", wrongRate: 0.22, aiCause: "学生在对称件上纠结使用半剖还是全剖。" },
    ],
    keyStudents: [{ studentId: "s-mech2301-06", studentName: "周子航", reason: "刚及格边缘 · 已连续 4 次", score: 64, changeTrend: "稳定" }],
    aiInsights: [
      { id: "ai-m-004-1", title: "剖视图类整体掌握较好", summary: "平均分较上次作业提升 2.2 分，此前的 3D 演示起到明显效果。", actionSuggestion: "继续沿用 3D 演示策略，准备 5.1 节同样配备模型。" },
    ],
    questionAccuracy: [
      { questionNo: 1, title: "全剖视图绘制", accuracy: 0.88 },
      { questionNo: 2, title: "半剖视图绘制", accuracy: 0.78 },
      { questionNo: 3, title: "局部剖视图", accuracy: 0.83 },
      { questionNo: 4, title: "剖切符号标注", accuracy: 0.73 },
    ],
  },

  // ====================================================================
  // 5. 主线 · 零件图综合作业
  // ====================================================================
  {
    id: "hw-m-005",
    homeworkTitle: "第6.1节 · 齿轮轴零件图综合作业",
    courseId: "course-mech-draw",
    planId: "plan-main",
    sectionId: "sec-6-1",
    classId: "cls-mech-2301",
    teacherId: "t-li",
    assignedAt: "2026-04-22",
    dueAt: "2026-04-29",
    submissionCount: 25,
    totalStudents: 28,
    averageScore: 83.2,
    maxScore: 97,
    minScore: 66,
    scoreBuckets: [
      { range: "90-100", count: 7 },
      { range: "80-89", count: 12 },
      { range: "70-79", count: 5 },
      { range: "60-69", count: 1 },
      { range: "<60", count: 0 },
    ],
    aiRatings: { excellent: 7, good: 12, pass: 6, fail: 0 },
    hotWrongPoints: [
      { name: "形位公差符号选用", knowledgeNodeId: "kn-mech-051", wrongRate: 0.28, aiCause: "学生对「同轴度」和「圆度」的适用场景仍混淆。" },
    ],
    keyStudents: [{ studentId: "s-mech2301-04", studentName: "赵思齐", reason: "CAD 完整度与规范性双满分", score: 97 }],
    aiInsights: [
      { id: "ai-m-005-1", title: "整体已进入优良区间", summary: "75% 以上学生已能按国标完成零件图。", actionSuggestion: "鼓励尖子生参加学院 CAD 比赛。" },
    ],
    questionAccuracy: [
      { questionNo: 1, title: "零件图视图选择", knowledgeNodeId: "kn-mech-048", accuracy: 0.89 },
      { questionNo: 2, title: "公差配合标注", knowledgeNodeId: "kn-mech-050", accuracy: 0.84 },
      { questionNo: 3, title: "形位公差", knowledgeNodeId: "kn-mech-051", accuracy: 0.72 },
    ],
  },

  // ====================================================================
  // 6. 主线 · CAD 实训作业
  // ====================================================================
  {
    id: "hw-m-006",
    homeworkTitle: "第7.1节 · AutoCAD 零件图实训",
    courseId: "course-mech-draw",
    planId: "plan-main",
    sectionId: "sec-7-1",
    classId: "cls-mech-2301",
    teacherId: "t-li",
    assignedAt: "2026-04-29",
    dueAt: "2026-05-06",
    submissionCount: 24,
    totalStudents: 28,
    averageScore: 85.7,
    maxScore: 100,
    minScore: 70,
    scoreBuckets: [
      { range: "90-100", count: 9 },
      { range: "80-89", count: 10 },
      { range: "70-79", count: 5 },
      { range: "60-69", count: 0 },
      { range: "<60", count: 0 },
    ],
    aiRatings: { excellent: 9, good: 10, pass: 5, fail: 0 },
    hotWrongPoints: [
      { name: "图层规划不合理", knowledgeNodeId: "kn-mech-055", wrongRate: 0.21, aiCause: "学生习惯于直接绘制，忽视图层前置规划。" },
    ],
    keyStudents: [{ studentId: "s-mech2301-04", studentName: "赵思齐", reason: "满分作业 · CAD 全面优秀", score: 100 }],
    aiInsights: [
      { id: "ai-m-006-1", title: "CAD 实训整体突出", summary: "优良率 79.2%，学生对软件操作适应良好。", actionSuggestion: "可适当加入协同绘图实训。" },
    ],
    questionAccuracy: [
      { questionNo: 1, title: "图层管理规范", knowledgeNodeId: "kn-mech-055", accuracy: 0.79 },
      { questionNo: 2, title: "CAD 标注", knowledgeNodeId: "kn-mech-054", accuracy: 0.88 },
      { questionNo: 3, title: "出图打印设置", knowledgeNodeId: "kn-mech-057", accuracy: 0.84 },
    ],
  },

  // ====================================================================
  // 7-8. 法学 2 次
  // ====================================================================
  {
    id: "hw-l-001",
    homeworkTitle: "第3章 · 案例分析作业（表见代理）",
    courseId: "course-law-civil",
    planId: "plan-law",
    sectionId: "sec-law-3-3",
    classId: "cls-law-2301",
    teacherId: "t-zhao",
    assignedAt: "2026-03-24",
    dueAt: "2026-03-28",
    submissionCount: 26,
    totalStudents: 26,
    averageScore: 80.1,
    maxScore: 94,
    minScore: 62,
    scoreBuckets: [
      { range: "90-100", count: 5 },
      { range: "80-89", count: 12 },
      { range: "70-79", count: 7 },
      { range: "60-69", count: 2 },
      { range: "<60", count: 0 },
    ],
    aiRatings: { excellent: 5, good: 12, pass: 9, fail: 0 },
    hotWrongPoints: [
      { name: "表见代理构成要件识别不全", knowledgeNodeId: "kn-law-015", wrongRate: 0.34, aiCause: "学生对「相对人善意且无过失」这一要件容易忽略。" },
      { name: "法律文书格式错误", wrongRate: 0.45, aiCause: "起诉状 6 大要素有遗漏，尤其是「诉讼请求」表述模糊。" },
    ],
    keyStudents: [
      { studentId: "s-law2301-01", studentName: "宋佳雯", reason: "案例分析满分 94", score: 94 },
      { studentId: "s-law2301-05", studentName: "尹雨萱", reason: "法律文书格式多次错误", score: 64 },
    ],
    aiInsights: [
      { id: "ai-l-001-1", title: "法律文书格式是本次集中问题", summary: "45% 学生出现格式错误。", actionSuggestion: "4 月 10 日安排 1 次法律文书写作专项实训。" },
    ],
    questionAccuracy: [
      { questionNo: 1, title: "代理类型识别", knowledgeNodeId: "kn-law-015", accuracy: 0.88 },
      { questionNo: 2, title: "表见代理构成分析", knowledgeNodeId: "kn-law-015", accuracy: 0.66 },
      { questionNo: 3, title: "起诉状撰写", accuracy: 0.55 },
    ],
  },
  {
    id: "hw-l-002",
    homeworkTitle: "诉讼时效辨析题库（20 题）",
    courseId: "course-law-civil",
    planId: "plan-law",
    classId: "cls-law-2301",
    teacherId: "t-zhao",
    assignedAt: "2026-04-07",
    dueAt: "2026-04-10",
    submissionCount: 26,
    totalStudents: 26,
    averageScore: 76.4,
    maxScore: 96,
    minScore: 58,
    scoreBuckets: [
      { range: "90-100", count: 3 },
      { range: "80-89", count: 10 },
      { range: "70-79", count: 8 },
      { range: "60-69", count: 4 },
      { range: "<60", count: 1 },
    ],
    aiRatings: { excellent: 3, good: 10, pass: 12, fail: 1 },
    hotWrongPoints: [
      { name: "时效中止与中断混淆", knowledgeNodeId: "kn-law-021", wrongRate: 0.48, aiCause: "概念交叉，学生仅靠记忆容易混淆。" },
    ],
    keyStudents: [],
    aiInsights: [
      { id: "ai-l-002-1", title: "诉讼时效仍是班级最大难点", summary: "与班级画像分析一致，建议再做 1 次辨析训练。", actionSuggestion: "下周安排 30 分钟课堂对比讲解。" },
    ],
    questionAccuracy: [
      { questionNo: 1, title: "普通诉讼时效", knowledgeNodeId: "kn-law-021", accuracy: 0.86 },
      { questionNo: 2, title: "时效中止", knowledgeNodeId: "kn-law-021", accuracy: 0.62 },
      { questionNo: 3, title: "时效中断", knowledgeNodeId: "kn-law-021", accuracy: 0.58 },
    ],
  },

  // ====================================================================
  // 9-10. 护理 2 次
  // ====================================================================
  {
    id: "hw-n-001",
    homeworkTitle: "无菌操作流程默写作业",
    courseId: "course-nurse-basic",
    planId: "plan-nurse",
    classId: "cls-nurse-2301",
    teacherId: "t-wanglh",
    assignedAt: "2026-03-20",
    dueAt: "2026-03-22",
    submissionCount: 30,
    totalStudents: 30,
    averageScore: 88.6,
    maxScore: 100,
    minScore: 72,
    scoreBuckets: [
      { range: "90-100", count: 14 },
      { range: "80-89", count: 12 },
      { range: "70-79", count: 4 },
      { range: "60-69", count: 0 },
      { range: "<60", count: 0 },
    ],
    aiRatings: { excellent: 14, good: 12, pass: 4, fail: 0 },
    hotWrongPoints: [
      { name: "戴无菌手套顺序", knowledgeNodeId: "kn-nur-009", wrongRate: 0.17, aiCause: "个别学生先戴主手错误，应后戴主手。" },
    ],
    keyStudents: [{ studentId: "s-nurse2301-01", studentName: "白若雪", reason: "满分且步骤详尽", score: 100 }],
    aiInsights: [
      { id: "ai-n-001-1", title: "理论基础扎实", summary: "90% 学生掌握无菌操作步骤。", actionSuggestion: "推进到技能实训环节。" },
    ],
    questionAccuracy: [
      { questionNo: 1, title: "无菌原则", knowledgeNodeId: "kn-nur-009", accuracy: 0.96 },
      { questionNo: 2, title: "无菌手套穿戴", knowledgeNodeId: "kn-nur-009", accuracy: 0.83 },
    ],
  },
  {
    id: "hw-n-002",
    homeworkTitle: "生命体征测量案例分析",
    courseId: "course-nurse-basic",
    planId: "plan-nurse",
    classId: "cls-nurse-2301",
    teacherId: "t-wanglh",
    assignedAt: "2026-04-03",
    dueAt: "2026-04-05",
    submissionCount: 30,
    totalStudents: 30,
    averageScore: 84.9,
    maxScore: 98,
    minScore: 68,
    scoreBuckets: [
      { range: "90-100", count: 10 },
      { range: "80-89", count: 14 },
      { range: "70-79", count: 5 },
      { range: "60-69", count: 1 },
      { range: "<60", count: 0 },
    ],
    aiRatings: { excellent: 10, good: 14, pass: 6, fail: 0 },
    hotWrongPoints: [
      { name: "血压异常值判断", knowledgeNodeId: "kn-nur-013", wrongRate: 0.20, aiCause: "学生对「高血压 1 级/2 级/3 级」分级界限不熟悉。" },
    ],
    keyStudents: [],
    aiInsights: [
      { id: "ai-n-002-1", title: "临床思维需加强", summary: "案例动态判断题正确率偏低，与画像一致。", actionSuggestion: "下周开展 1 次情景模拟实训。" },
    ],
    questionAccuracy: [
      { questionNo: 1, title: "体温异常识别", knowledgeNodeId: "kn-nur-011", accuracy: 0.93 },
      { questionNo: 2, title: "脉搏呼吸监测", knowledgeNodeId: "kn-nur-012", accuracy: 0.89 },
      { questionNo: 3, title: "血压异常值判断", knowledgeNodeId: "kn-nur-013", accuracy: 0.80 },
    ],
  },
];
