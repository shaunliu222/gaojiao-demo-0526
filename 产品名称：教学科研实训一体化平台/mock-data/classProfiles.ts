import type { ClassProfile } from "./types";

/**
 * 班级画像（学情档案）
 *
 * 每个班级一份 AI 生成的画像，包含：
 * - scoreDistribution：成绩分布直方图 + 平均分 + 标准差
 * - radar：多维度雷达
 * - strengths / weaknesses：强弱项标签
 * - styleTag：班级风格标签
 * - aiSummary：一段 AI 生成的综合画像文字
 */
export const classProfiles: ClassProfile[] = [
  {
    classId: "cls-mech-2301",
    scoreDistribution: {
      excellent: 6,
      good: 14,
      medium: 7,
      poor: 1,
      averageScore: 78.5,
      stdDev: 8.6,
    },
    radar: [
      { name: "基础知识", score: 82 },
      { name: "空间想象", score: 76 },
      { name: "绘图规范", score: 80 },
      { name: "综合应用", score: 72 },
      { name: "主动探究", score: 70 },
      { name: "团队协作", score: 78 },
    ],
    strengths: ["制图基础扎实", "课堂投入度高", "作业按时提交率高"],
    weaknesses: ["截交线相贯线专题偏弱", "空间想象仍需强化"],
    styleTag: "踏实稳健型",
    aiSummary:
      "机制 2301 班整体学情中上，基础知识与绘图规范掌握较好，作业按时率达 96%。薄弱环节集中在立体投影（截交线、相贯线）和组合体综合题，空间想象能力需要通过 3D 模型观察和多案例练习加强。班级学风踏实、讨论氛围良好，建议沿用渐进式节奏，每章引入 1-2 个工程情境案例激发主动探究。",
    generatedAt: "2026-03-10T09:00:00+08:00",
    generatedBy: "ai",
  },
  {
    classId: "cls-mech-2302",
    scoreDistribution: {
      excellent: 5,
      good: 6,
      medium: 7,
      poor: 7,
      averageScore: 68.3,
      stdDev: 15.2,
    },
    radar: [
      { name: "基础知识", score: 68 },
      { name: "空间想象", score: 58 },
      { name: "绘图规范", score: 70 },
      { name: "综合应用", score: 55 },
      { name: "主动探究", score: 60 },
      { name: "团队协作", score: 65 },
    ],
    strengths: ["前 1/3 尖子生突出", "对 CAD 软件操作兴趣高"],
    weaknesses: ["成绩两极分化严重", "后 1/4 学生基础薄弱", "综合读图能力普遍偏弱"],
    styleTag: "两极分化型",
    aiSummary:
      "机制 2302 班呈明显两极分化，标准差 15.2（全校同类课程基线 9.5）。前 5 名学生已具备工程师思维，后 7 名学生在投影基础阶段就掉队，后续叠加了组合体、剖视图的学习障碍。建议采用分层教学策略：基础班额外开设 2 次答疑补课，主攻「三视图对应规律」和「截交线」；提高班增加开放型综合题与 SolidWorks 建模实训；所有学生共享同一教学计划但按层布置作业。",
    generatedAt: "2026-03-10T09:10:00+08:00",
    generatedBy: "ai",
  },
  {
    classId: "cls-mech-2201",
    scoreDistribution: {
      excellent: 8,
      good: 13,
      medium: 4,
      poor: 1,
      averageScore: 81.9,
      stdDev: 7.8,
    },
    radar: [
      { name: "基础知识", score: 86 },
      { name: "空间想象", score: 80 },
      { name: "绘图规范", score: 84 },
      { name: "综合应用", score: 78 },
      { name: "主动探究", score: 75 },
      { name: "团队协作", score: 82 },
    ],
    strengths: ["整体成绩优秀", "装配图识读能力强", "大二阶段进入专业设计顺利"],
    weaknesses: ["创新设计类题目分数略低"],
    styleTag: "稳健优秀型",
    aiSummary:
      "机制 2201 班已完成大一制图课程，目前进入大二专业设计。整体水平在机械学院同届名列前茅，特别是装配图识读与零件图标注成绩优异。本届班级在主动创新方面仍有提升空间，建议在后续课程中增加开放式设计实训。",
    generatedAt: "2026-03-10T09:20:00+08:00",
    generatedBy: "ai",
  },
  {
    classId: "cls-law-2301",
    scoreDistribution: {
      excellent: 7,
      good: 12,
      medium: 5,
      poor: 2,
      averageScore: 79.2,
      stdDev: 9.3,
    },
    radar: [
      { name: "法条识记", score: 84 },
      { name: "案例分析", score: 76 },
      { name: "逻辑论证", score: 74 },
      { name: "法律文书", score: 70 },
      { name: "课堂表达", score: 82 },
      { name: "协作讨论", score: 86 },
    ],
    strengths: ["课堂讨论活跃", "法条识记能力强"],
    weaknesses: ["法律文书规范性欠缺", "诉讼时效细节易混淆"],
    styleTag: "讨论活跃型",
    aiSummary:
      "法学 2301 班女生比例较高，课堂讨论氛围活跃，案例发言率达 85%。法条识记成绩优异，但在法律文书写作（起诉状、答辩状）规范性上仍有较多笔误，诉讼时效的中止/中断/延长知识点混淆率较高。建议本学期强化文书写作专项实训，并辅以 3 次诉讼时效对比辨析。",
    generatedAt: "2026-03-10T09:30:00+08:00",
    generatedBy: "ai",
  },
  {
    classId: "cls-nurse-2301",
    scoreDistribution: {
      excellent: 10,
      good: 15,
      medium: 4,
      poor: 1,
      averageScore: 82.4,
      stdDev: 6.9,
    },
    radar: [
      { name: "理论基础", score: 80 },
      { name: "操作规范", score: 88 },
      { name: "无菌意识", score: 90 },
      { name: "沟通共情", score: 82 },
      { name: "临床思维", score: 70 },
      { name: "团队协作", score: 85 },
    ],
    strengths: ["无菌操作规范", "动手能力强", "班风勤奋"],
    weaknesses: ["临床情景应变略显机械", "个别学生对解剖知识记忆薄弱"],
    styleTag: "勤奋动手型",
    aiSummary:
      "护理 2301 班实训操作普遍优秀，无菌意识强烈、动手能力出众。相对薄弱的是临床思维——即从情景出发评估 → 计划 → 实施 → 评价的动态转换。建议本学期增加 4 次情景化实训，并引入病例讨论强化动态决策能力。",
    generatedAt: "2026-03-10T09:40:00+08:00",
    generatedBy: "ai",
  },
  {
    classId: "cls-edu-2301",
    scoreDistribution: {
      excellent: 4,
      good: 11,
      medium: 7,
      poor: 2,
      averageScore: 75.1,
      stdDev: 8.4,
    },
    radar: [
      { name: "学前教育基础", score: 76 },
      { name: "活动设计", score: 72 },
      { name: "组织实施", score: 74 },
      { name: "儿童观察", score: 78 },
      { name: "艺术表达", score: 80 },
      { name: "沟通亲和力", score: 84 },
    ],
    strengths: ["艺术表达活泼", "亲和力强"],
    weaknesses: ["知识图谱暂未建设，画像颗粒度较粗", "活动设计结构化能力一般"],
    styleTag: "活泼亲和型",
    aiSummary:
      "学前 2301 班为教育学院首届学生，知识图谱尚未搭建，当前画像基于学期成绩与教师观察生成，颗粒度较粗。学生艺术表达与沟通亲和力是最大优势；相对薄弱的是活动设计的结构化能力（目标-内容-方法-评价链条）。建议尽快完成学前教育专业知识图谱建设，以提升画像精度。",
    generatedAt: "2026-03-10T09:50:00+08:00",
    generatedBy: "ai",
  },
];
