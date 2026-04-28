import type { HomeworkEvalInput, HomeworkEvalSummary } from "./types";
import { withHomeworkStudentResults } from "./evalResultBuilders";

/**
 * 作业评价汇总（AI 批阅后的总览数据，用于协同评价页面）
 *
 * 主线《机械制图与CAD》6 次（其中 hw-m-003「组合体三视图」数据最详细）
 * 金工实习 · 2301/2302 各 1 次（与 plan-wang-metalwork 小节绑定；学习中心按进度切片展示）
 * 辅线 · 互换性与技术测量 2 次（大四 2101）
 * 辅线 · 工业机器人 2 次（大二 2303）
 * 另补 4 次「学习中心演示」用归档/课前测（ch2 班别练、金工 1.1 线上确认）
 * 合计 17 次
 */
const homeworkEvaluationsRaw: HomeworkEvalInput[] = [
  // ====================================================================
  // 1. 主线 · 第2章投影基础小测【历史归档：早于当前「3.2 组合体周」】
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
      { name: "重影点判别", knowledgeNodeId: "kn-mech-004", wrongRate: 0.32, aiCause: "学生容易混淆「可见点」与「被遮挡点」判别依据。" },
      { name: "铅垂面三投影", knowledgeNodeId: "kn-mech-004", wrongRate: 0.25, aiCause: "三投影面特征识记不牢，部分学生把类似面错判成积聚面。" },
    ],
    keyStudents: [
      { studentId: "s-mech2301-06", studentName: "周子航", reason: "连续 2 次低分", score: 62, changeTrend: "下降" },
      { studentId: "s-mech2301-01", studentName: "张伟", reason: "满分突出", score: 98, changeTrend: "稳定" },
    ],
    aiInsights: [
      {
        id: "ai-m-001",
        title: "重影点识别是本次薄弱点",
        summary: "32% 学生在重影点题失分，需补充可见性规则讲解。",
        actionSuggestion: "第2章结束前增加 10 分钟可见性专题。",
        adjustCourse: {
          planId: "plan-main",
          sectionId: "sec-2-3",
          label: "2.3 点、线的投影",
        },
      },
    ],
    questionAccuracy: [
      { questionNo: 1, title: "点的三面投影", knowledgeNodeId: "kn-mech-017", accuracy: 0.96 },
      { questionNo: 2, title: "两点相对位置", knowledgeNodeId: "kn-mech-004", accuracy: 0.68 },
      { questionNo: 3, title: "直线投影分类", knowledgeNodeId: "kn-mech-004", accuracy: 0.88 },
      { questionNo: 4, title: "平面投影分类", knowledgeNodeId: "kn-mech-004", accuracy: 0.75 },
      { questionNo: 5, title: "直线与平面相对位置", knowledgeNodeId: "kn-mech-004", accuracy: 0.79 },
    ],
  },

  {
    id: "hw-m-ch2-2302",
    homeworkTitle: "第2章 · 投影基础阶段练（2302 班）",
    courseId: "course-mech-draw",
    planId: "plan-main",
    sectionId: "sec-2-4",
    classId: "cls-mech-2302",
    teacherId: "t-wang",
    assignedAt: "2026-03-12",
    dueAt: "2026-03-15",
    submissionCount: 22,
    totalStudents: 25,
    averageScore: 70.2,
    maxScore: 92,
    minScore: 48,
    scoreBuckets: [
      { range: "90-100", count: 2 },
      { range: "80-89", count: 4 },
      { range: "70-79", count: 8 },
      { range: "60-69", count: 7 },
      { range: "<60", count: 4 },
    ],
    aiRatings: { excellent: 2, good: 4, pass: 15, fail: 4 },
    hotWrongPoints: [
      {
        name: "三视图对应规律",
        knowledgeNodeId: "kn-mech-015",
        wrongRate: 0.48,
        aiCause: "与 2302 班投影基础画像一致，需与 3.2 课堂补救衔接。",
      },
    ],
    keyStudents: [],
    aiInsights: [],
    questionAccuracy: [
      { questionNo: 1, title: "点的投影", knowledgeNodeId: "kn-mech-017", accuracy: 0.78 },
      { questionNo: 2, title: "线面相对位置", knowledgeNodeId: "kn-mech-004", accuracy: 0.62 },
    ],
  },
  {
    id: "hw-m-ch2-2303",
    homeworkTitle: "第2章 · 投影基础阶段练（2303 班）",
    courseId: "course-mech-draw",
    planId: "plan-main",
    sectionId: "sec-2-4",
    classId: "cls-mech-2303",
    teacherId: "t-li",
    assignedAt: "2026-03-12",
    dueAt: "2026-03-15",
    submissionCount: 24,
    totalStudents: 26,
    averageScore: 76.5,
    maxScore: 95,
    minScore: 58,
    scoreBuckets: [
      { range: "90-100", count: 3 },
      { range: "80-89", count: 9 },
      { range: "70-79", count: 10 },
      { range: "60-69", count: 3 },
      { range: "<60", count: 1 },
    ],
    aiRatings: { excellent: 3, good: 9, pass: 12, fail: 2 },
    hotWrongPoints: [
      {
        name: "线型层次与可见性",
        knowledgeNodeId: "kn-mech-016",
        wrongRate: 0.22,
        aiCause: "数模表达强，对手绘迁移仍需对照训练。",
      },
    ],
    keyStudents: [],
    aiInsights: [],
    questionAccuracy: [
      { questionNo: 1, title: "点的投影", knowledgeNodeId: "kn-mech-017", accuracy: 0.85 },
      { questionNo: 2, title: "直线投影分类", knowledgeNodeId: "kn-mech-004", accuracy: 0.8 },
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
      { name: "截交线绘制遗漏", knowledgeNodeId: "kn-mech-006", wrongRate: 0.43, sampleWrongAnswer: "轴承座圆柱被斜切后截交线未画，俯视图为封闭椭圆。", aiCause: "学生对截交线出现的触发条件认识模糊——平面切割回转体必产生截交线，且需投影到所有视图。" },
      { name: "相贯线判别错误", knowledgeNodeId: "kn-mech-006", wrongRate: 0.39, sampleWrongAnswer: "两圆柱垂直相贯线画成圆弧而非非圆曲线。", aiCause: "学生尚未掌握两回转体轴线正交情况下相贯线的走向规律。" },
      { name: "过渡线处理错误", knowledgeNodeId: "kn-mech-005", wrongRate: 0.29, sampleWrongAnswer: "底板和立柱过渡处把圆角误画成直角。", aiCause: "学生习惯机械化按轮廓画线，忽略铸造圆角的工艺合理性。" },
      { name: "组合体尺寸重复标注", knowledgeNodeId: "kn-mech-009", wrongRate: 0.25, aiCause: "学生对定形/定位/总体尺寸的层次理解不清。" },
    ],
    keyStudents: [
      { studentId: "s-mech2301-02", studentName: "刘静雯", reason: "综合题优秀 · 作图规范好", score: 93, changeTrend: "稳定" },
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
        adjustCourse: {
          planId: "plan-main",
          sectionId: "sec-3-4",
          label: "3.4 截交线与相贯线专题",
        },
      },
      {
        id: "ai-m-003-2",
        title: "王一鸣的「软件依赖倾向」值得关注",
        summary: "王一鸣 CAD 题 95 分 vs 手绘题 48 分，差距显著。建议安排 2 次徒手绘图专项练习。",
        actionSuggestion: "安排朋辈辅导（刘静雯为例），在下次小组作业中鼓励他先手绘后 CAD。",
        adjustCourse: {
          planId: "plan-main",
          sectionId: "sec-3-2",
          label: "3.2 组合体三视图绘制",
        },
      },
      {
        id: "ai-m-003-3",
        title: "对照班 2302 同步显现更严重分化",
        summary:
          "2302 班同作业平均分 68.5 vs 2301 班 79.3，差距 10 分以上。建议 2302 班单独加一次答疑。",
        actionSuggestion: "打开协同评价进入 cls-mech-2302 详情查看并下发「基础补救作业包」。",
        adjustCourse: { planId: "plan-main", sectionId: "sec-3-2", label: "3.2 组合体三视图（班级对照基准小节）" },
      },
    ],
    questionAccuracy: [
      { questionNo: 1, title: "组合体构成方式识别", knowledgeNodeId: "kn-mech-005", accuracy: 0.89 },
      { questionNo: 2, title: "形体分析法应用", knowledgeNodeId: "kn-mech-005", accuracy: 0.82 },
      { questionNo: 3, title: "轴承座三视图绘制", knowledgeNodeId: "kn-mech-005", accuracy: 0.71 },
      { questionNo: 4, title: "支架三视图 + 尺寸标注", knowledgeNodeId: "kn-mech-005", accuracy: 0.68 },
      { questionNo: 5, title: "连接座综合绘制", knowledgeNodeId: "kn-mech-005", accuracy: 0.62 },
      { questionNo: 6, title: "读组合体视图", knowledgeNodeId: "kn-mech-005", accuracy: 0.75 },
      { questionNo: 7, title: "截交线综合", knowledgeNodeId: "kn-mech-006", accuracy: 0.57 },
      { questionNo: 8, title: "相贯线综合", knowledgeNodeId: "kn-mech-006", accuracy: 0.61 },
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
      { name: "截交线绘制遗漏", knowledgeNodeId: "kn-mech-006", wrongRate: 0.57, aiCause: "与 2301 班相同但错误率更高。" },
      { name: "相贯线判别错误", knowledgeNodeId: "kn-mech-006", wrongRate: 0.52, aiCause: "基础空间想象力不足。" },
    ],
    keyStudents: [
      { studentId: "s-mech2302-03", studentName: "马俊豪", reason: "进度落后 · 订正未完成", score: 41, changeTrend: "下降" },
      { studentId: "s-mech2302-02", studentName: "林诗涵", reason: "全班最高分", score: 96, changeTrend: "稳定" },
    ],
    aiInsights: [
      {
        id: "ai-m-003-2302-1",
        title: "2302 班基础投影未掌握，需在 3.2 课堂内嵌补救",
        summary:
          "52% 学生在「三视图对应规律」上出错，根源可追溯至 2.2；班级进度已到组合体单元，不宜单独拆一节退回 2.2，应在次日 **3.2 轴承座课堂**开场嵌入约 10 分钟口诀回放与两道举牌快答，再继续形体分析法主干。",
        actionSuggestion:
          "紧急：在 3.2 教学设计勾选「分层补救脚本」；课后保留一对一答疑名单（含陈浩宇）；可选追加投影基础微课打卡但不替代课堂主线。",
        adjustCourse: {
          planId: "plan-main",
          sectionId: "sec-3-2",
          label: "3.2 组合体三视图绘制（嵌入投影口诀回放）",
        },
      },
    ],
    questionAccuracy: [
      { questionNo: 1, title: "组合体构成方式识别", knowledgeNodeId: "kn-mech-005", accuracy: 0.74 },
      { questionNo: 2, title: "形体分析法应用", knowledgeNodeId: "kn-mech-005", accuracy: 0.68 },
      { questionNo: 3, title: "轴承座三视图绘制", knowledgeNodeId: "kn-mech-005", accuracy: 0.55 },
      { questionNo: 7, title: "截交线综合", knowledgeNodeId: "kn-mech-006", accuracy: 0.43 },
      { questionNo: 8, title: "相贯线综合", knowledgeNodeId: "kn-mech-006", accuracy: 0.48 },
    ],
  },

  // ====================================================================
  // 3c. 主线 · 2303 班组合体作业（与 2301/2302 同修制图）
  // ====================================================================
  {
    id: "hw-m-003-2303",
    homeworkTitle: "第3.2节 · 组合体三视图作业（2303 班）",
    courseId: "course-mech-draw",
    planId: "plan-main",
    sectionId: "sec-3-2",
    classId: "cls-mech-2303",
    teacherId: "t-li",
    assignedAt: "2026-03-18",
    dueAt: "2026-03-23",
    submissionCount: 24,
    totalStudents: 26,
    averageScore: 76.4,
    maxScore: 94,
    minScore: 52,
    scoreBuckets: [
      { range: "90-100", count: 3 },
      { range: "80-89", count: 9 },
      { range: "70-79", count: 8 },
      { range: "60-69", count: 4 },
      { range: "<60", count: 2 },
    ],
    aiRatings: { excellent: 3, good: 9, pass: 12, fail: 2 },
    hotWrongPoints: [
      {
        name: "国标线型与手工作图一致性",
        knowledgeNodeId: "kn-mech-004",
        wrongRate: 0.28,
        aiCause: "数模表达强但手绘迁移弱，虚线/中心线层次易混。",
      },
    ],
    keyStudents: [
      { studentId: "s-mech2303-02", studentName: "范博文", reason: "手绘线型进步快", score: 91, changeTrend: "上升" },
    ],
    aiInsights: [
      {
        id: "ai-m-003-2303",
        title: "手绘规范仍弱于数模表现",
        summary: "建议保留每周一次「手绘+数模」对照作业，与机器人课仿真安全模块错峰布置。",
        actionSuggestion: "与赵老师协调实训周次，避免同一周末双重长作业；关注尚未提交学生的补交窗口。",
        adjustCourse: { planId: "plan-main", sectionId: "sec-3-2", label: "3.2 组合体三视图绘制" },
      },
    ],
    questionAccuracy: [
      { questionNo: 1, title: "形体分析法应用", knowledgeNodeId: "kn-mech-005", accuracy: 0.8 },
      { questionNo: 2, title: "三视图手绘清稿", knowledgeNodeId: "kn-mech-005", accuracy: 0.72 },
    ],
  },

  // ====================================================================
  // 3a. 金工实习 · 1.1 课前线上（演示「已提交」列）
  // ====================================================================
  {
    id: "hw-wgw-prep-2301",
    homeworkTitle: "金工实习 · 1.1 安全与车间纪律确认（课前线上）",
    courseId: "course-mech-practice",
    planId: "plan-wang-metalwork",
    sectionId: "sec-wgw-1-1",
    classId: "cls-mech-2301",
    teacherId: "t-wang",
    assignedAt: "2026-03-10",
    dueAt: "2026-03-11",
    submissionCount: 27,
    totalStudents: 28,
    averageScore: 93.6,
    maxScore: 100,
    minScore: 72,
    scoreBuckets: [
      { range: "90-100", count: 20 },
      { range: "80-89", count: 6 },
      { range: "70-79", count: 2 },
      { range: "60-69", count: 0 },
      { range: "<60", count: 0 },
    ],
    aiRatings: { excellent: 20, good: 6, pass: 2, fail: 0 },
    hotWrongPoints: [
      {
        name: "急停与防护栏条目漏勾",
        knowledgeNodeId: "kn-mech-009",
        wrongRate: 0.08,
        aiCause: "多选题未完整阅读题干，建议车间首日再口头复核。",
      },
    ],
    keyStudents: [],
    aiInsights: [],
    questionAccuracy: [
      { questionNo: 1, title: "车间安全红线", knowledgeNodeId: "kn-mech-009", accuracy: 0.94 },
      { questionNo: 2, title: "量具领用与归还", knowledgeNodeId: "kn-mech-009", accuracy: 0.91 },
    ],
  },
  {
    id: "hw-wgw-prep-2302",
    homeworkTitle: "金工实习 · 1.1 安全与车间纪律确认（课前线上 · 2302）",
    courseId: "course-mech-practice",
    planId: "plan-wang-metalwork",
    sectionId: "sec-wgw-1-1",
    classId: "cls-mech-2302",
    teacherId: "t-wang",
    assignedAt: "2026-03-10",
    dueAt: "2026-03-11",
    submissionCount: 22,
    totalStudents: 25,
    averageScore: 86.2,
    maxScore: 100,
    minScore: 62,
    scoreBuckets: [
      { range: "90-100", count: 10 },
      { range: "80-89", count: 7 },
      { range: "70-79", count: 5 },
      { range: "60-69", count: 3 },
      { range: "<60", count: 0 },
    ],
    aiRatings: { excellent: 10, good: 7, pass: 7, fail: 1 },
    hotWrongPoints: [
      {
        name: "防护装备穿戴要点",
        knowledgeNodeId: "kn-mech-009",
        wrongRate: 0.18,
        aiCause: "与读图类错题同源——审题不细，需现场带教再强调。",
      },
    ],
    keyStudents: [],
    aiInsights: [],
    questionAccuracy: [
      { questionNo: 1, title: "车间安全红线", knowledgeNodeId: "kn-mech-009", accuracy: 0.84 },
      { questionNo: 2, title: "量具领用与归还", knowledgeNodeId: "kn-mech-009", accuracy: 0.8 },
    ],
  },

  // ====================================================================
  // 3b. 金工实习 · 与 1.2 小节同步（双班）
  // ====================================================================
  {
    id: "hw-wgw-001",
    homeworkTitle: "金工实习 · 1.2 游标卡尺与图纸尺寸对读（现场过关）",
    courseId: "course-mech-practice",
    planId: "plan-wang-metalwork",
    sectionId: "sec-wgw-1-2",
    classId: "cls-mech-2301",
    teacherId: "t-wang",
    assignedAt: "2026-03-17",
    dueAt: "2026-03-21",
    submissionCount: 26,
    totalStudents: 28,
    averageScore: 84.2,
    maxScore: 100,
    minScore: 62,
    scoreBuckets: [
      { range: "90-100", count: 8 },
      { range: "80-89", count: 12 },
      { range: "70-79", count: 6 },
      { range: "60-69", count: 2 },
      { range: "<60", count: 0 },
    ],
    aiRatings: { excellent: 8, good: 12, pass: 6, fail: 2 },
    hotWrongPoints: [
      {
        name: "俯视读数与主视标注错位",
        knowledgeNodeId: "kn-mech-009",
        wrongRate: 0.18,
        aiCause: "对照图纸时未先锁定基准要素，导致量测点与标注线不对应。",
      },
    ],
    keyStudents: [
      { studentId: "s-mech2301-02", studentName: "刘静雯", reason: "量测与记录一致 · 可作为示教", score: 96, changeTrend: "稳定" },
    ],
    aiInsights: [
      {
        id: "ai-wgw-2301",
        title: "图纸—实物—量具三联对齐良好",
        summary: "2301 班与制图课 3.2 周并行，能较快把尺寸标注习惯迁移到车间对表。",
        actionSuggestion: "车削日前再安排 1 次「关键尺寸复核」微测即可。",
        adjustCourse: {
          planId: "plan-wang-metalwork",
          sectionId: "sec-wgw-2-1",
          label: "2.1 普通车床基本操作",
        },
      },
    ],
    questionAccuracy: [
      { questionNo: 1, title: "五处关键尺寸量测与记录", knowledgeNodeId: "kn-mech-009", accuracy: 0.86 },
      { questionNo: 2, title: "图纸线型与量具接触点自检", knowledgeNodeId: "kn-mech-009", accuracy: 0.82 },
    ],
  },
  {
    id: "hw-wgw-002",
    homeworkTitle: "金工实习 · 1.2 游标卡尺与图纸对读（2302 班）",
    courseId: "course-mech-practice",
    planId: "plan-wang-metalwork",
    sectionId: "sec-wgw-1-2",
    classId: "cls-mech-2302",
    teacherId: "t-wang",
    assignedAt: "2026-03-17",
    dueAt: "2026-03-21",
    submissionCount: 19,
    totalStudents: 25,
    averageScore: 71.8,
    maxScore: 96,
    minScore: 48,
    scoreBuckets: [
      { range: "90-100", count: 2 },
      { range: "80-89", count: 5 },
      { range: "70-79", count: 8 },
      { range: "60-69", count: 6 },
      { range: "<60", count: 4 },
    ],
    aiRatings: { excellent: 2, good: 5, pass: 12, fail: 4 },
    hotWrongPoints: [
      {
        name: "长宽方向读反",
        knowledgeNodeId: "kn-mech-009",
        wrongRate: 0.34,
        aiCause: "与制图课「宽相等」痛点同源，需在车间白板再画一次 45° 辅助对照。",
      },
    ],
    keyStudents: [
      { studentId: "s-mech2302-01", studentName: "陈浩宇", reason: "对表偏慢 · 需单独辅导", score: 52, changeTrend: "下降" },
    ],
    aiInsights: [
      {
        id: "ai-wgw-2302",
        title: "读图仍是金工前置瓶颈",
        summary: "约 1/3 学生在找「量哪里」上耗时超过 10 分钟，与 2302 班投影基础画像一致。",
        actionSuggestion: "与李老师协调：车间讲解前播 3 分钟「尺寸箭头—量具触点」对照短片。",
        adjustCourse: {
          planId: "plan-wang-metalwork",
          sectionId: "sec-wgw-1-2",
          label: "1.2 游标卡尺与图纸尺寸对读",
        },
      },
    ],
    questionAccuracy: [
      { questionNo: 1, title: "五处关键尺寸量测与记录", knowledgeNodeId: "kn-mech-009", accuracy: 0.66 },
      { questionNo: 2, title: "现场安全与读数复诵", knowledgeNodeId: "kn-mech-009", accuracy: 0.74 },
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
      { name: "剖切面位置标注", knowledgeNodeId: "kn-mech-007", wrongRate: 0.27, aiCause: "剖切符号 A-A 标注遗漏或方向反。" },
      { name: "半剖与全剖选择", knowledgeNodeId: "kn-mech-007", wrongRate: 0.22, aiCause: "学生在对称件上纠结使用半剖还是全剖。" },
    ],
    keyStudents: [{ studentId: "s-mech2301-06", studentName: "周子航", reason: "刚及格边缘 · 已连续 4 次", score: 64, changeTrend: "稳定" }],
    aiInsights: [
      {
        id: "ai-m-004-1",
        title: "剖视图类整体掌握较好",
        summary: "平均分较上次作业提升 2.2 分，此前的 3D 演示起到明显效果。",
        actionSuggestion: "继续沿用 3D 演示策略，准备 5.1 节同样配备模型。",
        adjustCourse: { planId: "plan-main", sectionId: "sec-5-1", label: "5.1 螺纹基础与画法" },
      },
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
      { name: "形位公差符号选用", knowledgeNodeId: "kn-mech-009", wrongRate: 0.28, aiCause: "学生对「同轴度」和「圆度」的适用场景仍混淆。" },
    ],
    keyStudents: [{ studentId: "s-mech2301-04", studentName: "赵思齐", reason: "CAD 完整度与规范性双满分", score: 97 }],
    aiInsights: [
      { id: "ai-m-005-1", title: "整体已进入优良区间", summary: "75% 以上学生已能按国标完成零件图。", actionSuggestion: "鼓励尖子生参加学院 CAD 比赛。" },
    ],
    questionAccuracy: [
      { questionNo: 1, title: "零件图视图选择", knowledgeNodeId: "kn-mech-009", accuracy: 0.89 },
      { questionNo: 2, title: "公差配合标注", knowledgeNodeId: "kn-mech-009", accuracy: 0.84 },
      { questionNo: 3, title: "形位公差", knowledgeNodeId: "kn-mech-009", accuracy: 0.72 },
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
      { name: "图层规划不合理", knowledgeNodeId: "kn-mech-011", wrongRate: 0.21, aiCause: "学生习惯于直接绘制，忽视图层前置规划。" },
    ],
    keyStudents: [{ studentId: "s-mech2301-04", studentName: "赵思齐", reason: "满分作业 · CAD 全面优秀", score: 100 }],
    aiInsights: [
      { id: "ai-m-006-1", title: "CAD 实训整体突出", summary: "优良率 79.2%，学生对软件操作适应良好。", actionSuggestion: "可适当加入协同绘图实训。" },
    ],
    questionAccuracy: [
      { questionNo: 1, title: "图层管理规范", knowledgeNodeId: "kn-mech-011", accuracy: 0.79 },
      { questionNo: 2, title: "CAD 标注", knowledgeNodeId: "kn-mech-011", accuracy: 0.88 },
      { questionNo: 3, title: "出图打印设置", knowledgeNodeId: "kn-mech-011", accuracy: 0.84 },
    ],
  },

  // ====================================================================
  // 6b. 主线 · 7.1 拓展（收集中，用于学生端「未提交」演示）
  // ====================================================================
  {
    id: "hw-m-007",
    homeworkTitle: "第7.1节 · AutoCAD 综合应用（拓展练习 · 收集中）",
    courseId: "course-mech-draw",
    planId: "plan-main",
    sectionId: "sec-7-1",
    classId: "cls-mech-2301",
    teacherId: "t-li",
    assignedAt: "2026-05-02",
    dueAt: "2026-05-12",
    submissionCount: 9,
    totalStudents: 28,
    averageScore: 81.4,
    maxScore: 100,
    minScore: 64,
    scoreBuckets: [
      { range: "90-100", count: 2 },
      { range: "80-89", count: 4 },
      { range: "70-79", count: 2 },
      { range: "60-69", count: 1 },
      { range: "<60", count: 0 },
    ],
    aiRatings: { excellent: 2, good: 4, pass: 3, fail: 0 },
    hotWrongPoints: [],
    keyStudents: [],
    aiInsights: [
      {
        id: "ai-m-007-1",
        title: "本作业仍在提交窗口内",
        summary: "教师端暂不生成班级热点错因；待截止后统一批阅与讲评。",
        actionSuggestion: "提醒学生检查草图约束与图层模板后再提交附件。",
      },
    ],
    questionAccuracy: [
      {
        questionNo: 1,
        title: "草图基准与全约束：按附图完成支架草图（含对称与重合约束）",
        knowledgeNodeId: "kn-mech-011",
        accuracy: 0.82,
      },
      {
        questionNo: 2,
        title: "拉伸与切除：板厚 10mm，两侧 R6 圆角，中间腰形孔贯通",
        knowledgeNodeId: "kn-mech-011",
        accuracy: 0.76,
      },
      {
        questionNo: 3,
        title: "图层与线型：轮廓/中心线/虚线分层，线宽随层",
        knowledgeNodeId: "kn-mech-011",
        accuracy: 0.79,
      },
      {
        questionNo: 4,
        title: "交付物：导出 DWG + PDF，文件命名 学号-姓名-7.1拓展",
        knowledgeNodeId: "kn-mech-011",
        accuracy: 0.71,
      },
    ],
  },

  // ====================================================================
  // 7-8. 互换性与技术测量 · 2101 班 2 次
  // ====================================================================
  {
    id: "hw-tol-001",
    homeworkTitle: "公差带与配合选用作业（减速器输出轴）",
    courseId: "course-mech-tolerance",
    planId: "plan-mech-tolerance",
    sectionId: "sec-tol-1-2",
    classId: "cls-mech-2101",
    teacherId: "t-wanglh",
    assignedAt: "2026-03-24",
    dueAt: "2026-03-28",
    submissionCount: 30,
    totalStudents: 30,
    averageScore: 82.4,
    maxScore: 96,
    minScore: 64,
    scoreBuckets: [
      { range: "90-100", count: 6 },
      { range: "80-89", count: 14 },
      { range: "70-79", count: 8 },
      { range: "60-69", count: 2 },
      { range: "<60", count: 0 },
    ],
    aiRatings: { excellent: 6, good: 14, pass: 10, fail: 0 },
    hotWrongPoints: [
      { name: "基孔制/基轴制选用混淆", knowledgeNodeId: "kn-mech-009", wrongRate: 0.31, aiCause: "未先判断「工艺习惯」与「标准件外购件」约束。" },
      { name: "公差等级过紧导致成本惩罚", knowledgeNodeId: "kn-mech-009", wrongRate: 0.22, aiCause: "忽略 IT 等级与加工方法的对应关系。" },
    ],
    keyStudents: [
      { studentId: "s-mech2101-01", studentName: "白若雪", reason: "公差链分析满分档", score: 96 },
      { studentId: "s-mech2101-08", studentName: "钟雅琪", reason: "配合代号多次涂改", score: 66 },
    ],
    aiInsights: [
      { id: "ai-tol-001-1", title: "配合制度选用是集中失分点", summary: "约 1/3 学生在基孔/基轴判断上犹豫过久。", actionSuggestion: "课堂增加 2 个「外购轴承 + 光轴」对照案例。" },
    ],
    questionAccuracy: [
      { questionNo: 1, title: "极限偏差查表", knowledgeNodeId: "kn-mech-009", accuracy: 0.87 },
      { questionNo: 2, title: "配合性质判断", knowledgeNodeId: "kn-mech-009", accuracy: 0.69 },
      { questionNo: 3, title: "公差链推算", knowledgeNodeId: "kn-mech-009", accuracy: 0.72 },
    ],
  },
  {
    id: "hw-tol-002",
    homeworkTitle: "形位公差标注纠错（支架类零件）",
    courseId: "course-mech-tolerance",
    planId: "plan-mech-tolerance",
    classId: "cls-mech-2101",
    teacherId: "t-wanglh",
    assignedAt: "2026-04-07",
    dueAt: "2026-04-10",
    submissionCount: 30,
    totalStudents: 30,
    averageScore: 78.9,
    maxScore: 94,
    minScore: 58,
    scoreBuckets: [
      { range: "90-100", count: 4 },
      { range: "80-89", count: 11 },
      { range: "70-79", count: 10 },
      { range: "60-69", count: 4 },
      { range: "<60", count: 1 },
    ],
    aiRatings: { excellent: 4, good: 11, pass: 14, fail: 1 },
    hotWrongPoints: [
      { name: "基准要素选择不当", knowledgeNodeId: "kn-mech-009", wrongRate: 0.36, aiCause: "未优先选装配定位面作第一基准。" },
    ],
    keyStudents: [],
    aiInsights: [
      { id: "ai-tol-002-1", title: "基准体系仍薄弱", summary: "与装配图课程衔接不足，建议用同一零件跨课复盘。", actionSuggestion: "下一讲用齿轮泵支架做课堂同题再练。" },
    ],
    questionAccuracy: [
      { questionNo: 1, title: "形位公差符号识别", knowledgeNodeId: "kn-mech-009", accuracy: 0.88 },
      { questionNo: 2, title: "基准标注", knowledgeNodeId: "kn-mech-009", accuracy: 0.64 },
      { questionNo: 3, title: "与尺寸公差关系", knowledgeNodeId: "kn-mech-009", accuracy: 0.71 },
    ],
  },

  // ====================================================================
  // 9-10. 工业机器人 · 2303 班 2 次
  // ====================================================================
  {
    id: "hw-rob-001",
    homeworkTitle: "示教编程 · 三点搬运轨迹",
    courseId: "course-mech-robotics",
    planId: "plan-mech-robotics",
    sectionId: "sec-rob-1-2",
    classId: "cls-mech-2303",
    teacherId: "t-zhao",
    assignedAt: "2026-03-20",
    dueAt: "2026-03-22",
    submissionCount: 26,
    totalStudents: 26,
    averageScore: 86.2,
    maxScore: 100,
    minScore: 70,
    scoreBuckets: [
      { range: "90-100", count: 9 },
      { range: "80-89", count: 11 },
      { range: "70-79", count: 6 },
      { range: "60-69", count: 0 },
      { range: "<60", count: 0 },
    ],
    aiRatings: { excellent: 9, good: 11, pass: 6, fail: 0 },
    hotWrongPoints: [
      { name: "工具坐标系未标定", knowledgeNodeId: "kn-mech-012", wrongRate: 0.19, aiCause: "直接沿用默认 TCP，导致落点偏移。" },
    ],
    keyStudents: [{ studentId: "s-mech2303-01", studentName: "宋佳雯", reason: "轨迹平滑、节拍最优", score: 100 }],
    aiInsights: [
      { id: "ai-rob-001-1", title: "数模优势转化为节拍优势", summary: "前 1/3 学生已能兼顾避障与安全裕度。", actionSuggestion: "开放 1 次班内「节拍挑战赛」。" },
    ],
    questionAccuracy: [
      { questionNo: 1, title: "坐标系与点位", knowledgeNodeId: "kn-mech-012", accuracy: 0.91 },
      { questionNo: 2, title: "示教路径规划", knowledgeNodeId: "kn-mech-012", accuracy: 0.84 },
    ],
  },
  {
    id: "hw-rob-002",
    homeworkTitle: "离线仿真 · 简易码垛节拍估算",
    courseId: "course-mech-robotics",
    planId: "plan-mech-robotics",
    sectionId: "sec-rob-1-2",
    classId: "cls-mech-2303",
    teacherId: "t-zhao",
    assignedAt: "2026-04-03",
    dueAt: "2026-04-05",
    submissionCount: 26,
    totalStudents: 26,
    averageScore: 81.5,
    maxScore: 98,
    minScore: 62,
    scoreBuckets: [
      { range: "90-100", count: 7 },
      { range: "80-89", count: 10 },
      { range: "70-79", count: 7 },
      { range: "60-69", count: 2 },
      { range: "<60", count: 0 },
    ],
    aiRatings: { excellent: 7, good: 10, pass: 9, fail: 0 },
    hotWrongPoints: [
      { name: "安全围栏干涉未检出", knowledgeNodeId: "kn-mech-010", wrongRate: 0.24, aiCause: "仿真模型简化过度，未导入完整工装。" },
    ],
    keyStudents: [],
    aiInsights: [
      { id: "ai-rob-002-1", title: "仿真—现场一致性提醒", summary: "约 1/4 学生报告节拍与现场试跑差异>15%。", actionSuggestion: "增加「仿真标定检查表」必交项。" },
    ],
    questionAccuracy: [
      { questionNo: 1, title: "仿真建模完整性", knowledgeNodeId: "kn-mech-012", accuracy: 0.86 },
      { questionNo: 2, title: "节拍与产能换算", knowledgeNodeId: "kn-mech-010", accuracy: 0.76 },
      { questionNo: 3, title: "互锁逻辑描述", knowledgeNodeId: "core-mech-003", accuracy: 0.79 },
    ],
  },
];

/** 学习中心「未完成」演示：对上述作业强制指定学生为未提交（与「已提交」演示条目分列，见 learnCenterSession 中 DEMO_SUBMITTED） */
const HOMEWORK_LEARN_CENTER_PENDING_STUDENTS: Record<string, string[]> = {
  "hw-m-003": ["s-mech2301-01"],
  "hw-wgw-001": ["s-mech2301-01"],
  "hw-m-003-2302": ["s-mech2302-01"],
  "hw-wgw-002": ["s-mech2302-01"],
  "hw-m-003-2303": ["s-mech2303-01"],
  "hw-rob-002": ["s-mech2303-01"],
  "hw-m-007": ["s-mech2301-01"],
};

function patchHomeworkEvaluations(list: HomeworkEvalSummary[]): HomeworkEvalSummary[] {
  return list.map((h) => {
    const pendingIds = HOMEWORK_LEARN_CENTER_PENDING_STUDENTS[h.id];
    if (!pendingIds?.length) return h;
    const set = new Set(pendingIds);
    return {
      ...h,
      studentResults: h.studentResults.map((r) =>
        set.has(r.studentId) ? { studentId: r.studentId, submitted: false } : r,
      ),
    };
  });
}

export const homeworkEvaluations: HomeworkEvalSummary[] = patchHomeworkEvaluations(
  homeworkEvaluationsRaw.map((h) => withHomeworkStudentResults(h)),
);
