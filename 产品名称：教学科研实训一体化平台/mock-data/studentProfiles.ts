import type { StudentProfile } from "./types";

/**
 * 学生画像（挑选覆盖主故事线的典型学生）
 *
 * - 张伟（2301，空间想象力强，主线尖子生）
 * - 刘静雯（2301，细腻严谨，女生标杆）
 * - 王一鸣（2301，中等水平，典型普通学生）
 * - 孙雨欣（2301，文静偏科但擅长绘图）
 * - 赵思齐（2301，CAD 奇才）
 * - 周子航（2301，中等偏下，需关注）
 * - 陈浩宇（2302，薄弱生，低活跃度）
 * - 林诗涵（2302，尖子生）
 * - 宋佳雯（机制2303，机器人与建模突出）
 * - 白若雪（机制2101，公差与检测扎实）
 */
export const studentProfiles: StudentProfile[] = [
  // ==== 机制 2301 ====
  {
    studentId: "s-mech2301-01",
    interests: ["机械设计", "3D 打印", "航模"],
    goodAt: ["空间想象", "三视图绘制", "SolidWorks 建模"],
    learningStyle: "视觉型",
    activity: "高",
    masteryHeatmap: [
      { knowledgePointId: "kn-mech-015", knowledgePointName: "三视图对应规律", masteryLevel: 92 },
      { knowledgePointId: "kn-mech-005", knowledgePointName: "组合体三视图绘制", masteryLevel: 88 },
      { knowledgePointId: "kn-mech-006", knowledgePointName: "截交线", masteryLevel: 85 },
      { knowledgePointId: "kn-mech-006", knowledgePointName: "相贯线", masteryLevel: 72 },
      { knowledgePointId: "kn-mech-009", knowledgePointName: "零件图内容", masteryLevel: 80 },
      { knowledgePointId: "kn-mech-012", knowledgePointName: "三维实体建模", masteryLevel: 90 },
    ],
    recentScores: [
      { taskName: "第3章 · 三视图作业", score: 92, date: "2026-03-18" },
      { taskName: "第4章 · 点线面小测", score: 88, date: "2026-03-25" },
      { taskName: "第5章 · 组合体作业", score: 95, date: "2026-04-08" },
    ],
    aiSummary:
      "张伟空间想象能力突出，三维建模天赋显著，是班内 SolidWorks 实训领先选手。相对薄弱的是相贯线中特殊情况的处理（两回转体轴线交叉且直径相近时）。建议引导他参与学院 3D 打印兴趣小组，提升广度。",
    generatedAt: "2026-04-15T10:00:00+08:00",
  },
  {
    studentId: "s-mech2301-02",
    interests: ["精密仪器", "机械绘图", "阅读"],
    goodAt: ["绘图规范", "尺寸标注", "字体书写"],
    learningStyle: "读写型",
    activity: "中",
    masteryHeatmap: [
      { knowledgePointId: "kn-mech-003", knowledgePointName: "字体规范", masteryLevel: 98 },
      { knowledgePointId: "kn-mech-005", knowledgePointName: "尺寸标注基础", masteryLevel: 95 },
      { knowledgePointId: "kn-mech-009", knowledgePointName: "组合体尺寸标注", masteryLevel: 90 },
      { knowledgePointId: "kn-mech-005", knowledgePointName: "组合体三视图绘制", masteryLevel: 78 },
      { knowledgePointId: "kn-mech-009", knowledgePointName: "表面粗糙度", masteryLevel: 82 },
      { knowledgePointId: "kn-mech-009", knowledgePointName: "尺寸公差与配合", masteryLevel: 70 },
    ],
    recentScores: [
      { taskName: "第3章 · 三视图作业", score: 86, date: "2026-03-18" },
      { taskName: "第4章 · 点线面小测", score: 82, date: "2026-03-25" },
      { taskName: "第5章 · 组合体作业", score: 88, date: "2026-04-08" },
    ],
    aiSummary:
      "刘静雯作业工整、标注规范是班级典范，同学经常借她的作业参考。短板是综合应用题（看组合体视图），建议通过多做看图题训练空间还原思维。",
    generatedAt: "2026-04-15T10:02:00+08:00",
  },
  {
    studentId: "s-mech2301-03",
    interests: ["电脑游戏", "篮球"],
    goodAt: ["AutoCAD 二维绘图"],
    learningStyle: "混合型",
    activity: "中",
    masteryHeatmap: [
      { knowledgePointId: "kn-mech-005", knowledgePointName: "组合体三视图绘制", masteryLevel: 72 },
      { knowledgePointId: "kn-mech-006", knowledgePointName: "相贯线", masteryLevel: 55 },
      { knowledgePointId: "kn-mech-011", knowledgePointName: "AutoCAD 界面与命令", masteryLevel: 85 },
    ],
    recentScores: [
      { taskName: "第3章 · 三视图作业", score: 78, date: "2026-03-18" },
      { taskName: "第5章 · 组合体作业", score: 75, date: "2026-04-08" },
    ],
    aiSummary:
      "王一鸣是班级典型中等生，CAD 操作熟练但手工绘图相贯线部分常出错，属「软件依赖倾向」。建议布置 2 次手工专项训练恢复基础。",
    generatedAt: "2026-04-15T10:05:00+08:00",
  },
  {
    studentId: "s-mech2301-04",
    interests: ["CAD", "汽车"],
    goodAt: ["AutoCAD", "图层管理", "出图打印"],
    learningStyle: "动觉型",
    activity: "高",
    masteryHeatmap: [
      { knowledgePointId: "kn-mech-011", knowledgePointName: "AutoCAD 界面与命令", masteryLevel: 96 },
      { knowledgePointId: "kn-mech-011", knowledgePointName: "图层管理", masteryLevel: 94 },
      { knowledgePointId: "kn-mech-011", knowledgePointName: "图纸空间与打印", masteryLevel: 92 },
      { knowledgePointId: "kn-mech-005", knowledgePointName: "组合体三视图绘制", masteryLevel: 82 },
    ],
    recentScores: [
      { taskName: "CAD 实训 1", score: 98, date: "2026-03-12" },
      { taskName: "第3章 · 三视图作业", score: 84, date: "2026-03-18" },
    ],
    aiSummary:
      "赵思齐是班级 CAD 奇才，图层、出图规范优秀，适合担任 CAD 实训小组长。建议为他增加 SolidWorks 参数化建模挑战任务。",
    generatedAt: "2026-04-15T10:08:00+08:00",
  },
  {
    studentId: "s-mech2301-05",
    interests: ["绘画", "建筑"],
    goodAt: ["手绘图", "图纸美观度"],
    learningStyle: "视觉型",
    activity: "中",
    masteryHeatmap: [
      { knowledgePointId: "kn-mech-008", knowledgePointName: "圆弧连接", masteryLevel: 95 },
      { knowledgePointId: "kn-mech-011", knowledgePointName: "徒手绘制草图", masteryLevel: 92 },
      { knowledgePointId: "kn-mech-009", knowledgePointName: "尺寸公差与配合", masteryLevel: 60 },
    ],
    recentScores: [
      { taskName: "第2章 · 几何作图", score: 96, date: "2026-03-08" },
      { taskName: "第3章 · 三视图作业", score: 80, date: "2026-03-18" },
    ],
    aiSummary:
      "孙雨欣手绘功底优异但对公差、机械规范类偏理论知识兴趣一般。建议用工程案例激发她的工程应用兴趣，将美学和规范结合。",
    generatedAt: "2026-04-15T10:10:00+08:00",
  },
  {
    studentId: "s-mech2301-06",
    interests: ["游戏", "电竞"],
    goodAt: ["观察能力"],
    learningStyle: "视觉型",
    activity: "低",
    masteryHeatmap: [
      { knowledgePointId: "kn-mech-015", knowledgePointName: "三视图对应规律", masteryLevel: 62 },
      { knowledgePointId: "kn-mech-006", knowledgePointName: "截交线", masteryLevel: 48 },
      { knowledgePointId: "kn-mech-005", knowledgePointName: "组合体三视图绘制", masteryLevel: 55 },
    ],
    recentScores: [
      { taskName: "第3章 · 三视图作业", score: 62, date: "2026-03-18" },
      { taskName: "第4章 · 点线面小测", score: 58, date: "2026-03-25" },
    ],
    aiSummary:
      "周子航课堂活跃度较低，近 3 次作业均在合格线附近。截交线 / 组合体问题尤其突出，建议一对一答疑并与家长/辅导员同步沟通。",
    generatedAt: "2026-04-15T10:13:00+08:00",
  },
  // ==== 机制 2302（薄弱生） ====
  {
    studentId: "s-mech2302-01",
    interests: ["户外运动"],
    goodAt: [],
    learningStyle: "动觉型",
    activity: "低",
    masteryHeatmap: [
      { knowledgePointId: "kn-mech-015", knowledgePointName: "三视图对应规律", masteryLevel: 48 },
      { knowledgePointId: "kn-mech-006", knowledgePointName: "截交线", masteryLevel: 32 },
      { knowledgePointId: "kn-mech-005", knowledgePointName: "组合体三视图绘制", masteryLevel: 40 },
      { knowledgePointId: "kn-mech-011", knowledgePointName: "AutoCAD 界面与命令", masteryLevel: 55 },
    ],
    recentScores: [
      { taskName: "第3章 · 三视图作业", score: 54, date: "2026-03-18" },
      { taskName: "第5章 · 组合体作业", score: 48, date: "2026-04-08" },
      { taskName: "第4章 · 点线面小测", score: 52, date: "2026-03-25" },
    ],
    aiSummary:
      "陈浩宇是 2302 班学习最薄弱的学生，3 次作业均不及格。问题根源在投影基础阶段就未掌握，导致后续累积性困难。强烈建议进入「基础补救小组」，从「长对正高平齐宽相等」口诀重新开始，并搭配徒手草图实训恢复信心。",
    generatedAt: "2026-04-15T10:15:00+08:00",
  },
  {
    studentId: "s-mech2302-02",
    interests: ["机械设计", "机器人"],
    goodAt: ["综合应用", "创新设计"],
    learningStyle: "视觉型",
    activity: "高",
    masteryHeatmap: [
      { knowledgePointId: "kn-mech-005", knowledgePointName: "组合体三视图绘制", masteryLevel: 95 },
      { knowledgePointId: "kn-mech-010", knowledgePointName: "装配图表达方法", masteryLevel: 88 },
      { knowledgePointId: "kn-mech-012", knowledgePointName: "SolidWorks 草图", masteryLevel: 92 },
    ],
    recentScores: [
      { taskName: "第3章 · 三视图作业", score: 96, date: "2026-03-18" },
      { taskName: "第5章 · 组合体作业", score: 95, date: "2026-04-08" },
    ],
    aiSummary:
      "林诗涵是 2302 班成绩最高者，建议邀请她参与学院机器人竞赛队和本课程「学长朋辈答疑」志愿岗位。",
    generatedAt: "2026-04-15T10:18:00+08:00",
  },
  // ==== 机制 2303 ====
  {
    studentId: "s-mech2303-01",
    interests: ["工业机器人", "智能制造", "辩论赛"],
    goodAt: ["SolidWorks 建模", "示教编程", "口头表达"],
    learningStyle: "视觉型",
    activity: "高",
    masteryHeatmap: [
      { knowledgePointId: "kn-mech-012", knowledgePointName: "SolidWorks 草图", masteryLevel: 92 },
      { knowledgePointId: "kn-mech-012", knowledgePointName: "三维实体建模", masteryLevel: 90 },
      { knowledgePointId: "kn-mech-012", knowledgePointName: "三维装配与工程图输出", masteryLevel: 86 },
      { knowledgePointId: "kn-mech-005", knowledgePointName: "组合体三视图绘制", masteryLevel: 78 },
    ],
    recentScores: [
      { taskName: "机器人示教编程作业 1", score: 94, date: "2026-03-20" },
      { taskName: "离线仿真单元测验", score: 92, date: "2026-03-28" },
    ],
    aiSummary:
      "宋佳雯在 2303 班是典型的「数模优先型」学生：三维建模与工作站仿真表现突出，口头报告条理清晰。相对短板是组合体手绘的线型规范，建议每周保留 1 次 A3 手绘限时训练与数模互证。",
    generatedAt: "2026-04-15T10:25:00+08:00",
  },
  // ==== 机制 2101 ====
  {
    studentId: "s-mech2101-01",
    interests: ["精密测量", "咖啡", "阅读制造类科普"],
    goodAt: ["公差标注", "三坐标检测思路", "工艺卡填写"],
    learningStyle: "读写型",
    activity: "高",
    masteryHeatmap: [
      { knowledgePointId: "kn-mech-009", knowledgePointName: "表面粗糙度", masteryLevel: 94 },
      { knowledgePointId: "kn-mech-009", knowledgePointName: "尺寸公差与配合", masteryLevel: 92 },
      { knowledgePointId: "kn-mech-009", knowledgePointName: "形位公差", masteryLevel: 90 },
      { knowledgePointId: "kn-mech-010", knowledgePointName: "装配图尺寸与技术要求", masteryLevel: 88 },
    ],
    recentScores: [
      { taskName: "互换性 · 公差链分析作业", score: 96, date: "2026-03-22" },
      { taskName: "工艺规程编制小测", score: 92, date: "2026-04-05" },
    ],
    aiSummary:
      "白若雪在公差与检测维度表现突出，能独立完成中等难度公差链推算，工艺卡填写规范。建议在毕业设计中刻意增加「成本—精度」权衡章节，补齐经济性分析短板。",
    generatedAt: "2026-04-15T10:30:00+08:00",
  },
];
