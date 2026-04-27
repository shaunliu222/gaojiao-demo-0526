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
    progressSectionId: "sec-2-3",
    designReviewSectionIds: ["sec-2-1"],
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
    progressSectionId: "sec-2-3",
    designReviewSectionIds: ["sec-2-1"],
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
      "机制 2201 班已完成基础制图阶段，目前处于大三专业设计深化期。整体水平在机械学院同届名列前茅，特别是装配图识读与零件图标注成绩优异。本届班级在主动创新方面仍有提升空间，建议在后续课程中增加开放式设计实训。",
    generatedAt: "2026-03-10T09:20:00+08:00",
    generatedBy: "ai",
  },
  {
    classId: "cls-mech-2303",
    scoreDistribution: {
      excellent: 6,
      good: 11,
      medium: 6,
      poor: 3,
      averageScore: 76.8,
      stdDev: 10.1,
    },
    radar: [
      { name: "制图基础", score: 78 },
      { name: "三维建模", score: 82 },
      { name: "仿真与示教", score: 74 },
      { name: "规范意识", score: 76 },
      { name: "团队协作", score: 80 },
      { name: "安全与互锁", score: 72 },
    ],
    strengths: ["对机器人与仿真兴趣高", "软件上手快"],
    weaknesses: ["部分同学手工制图规范仍弱于 2301", "安全规程记忆不牢"],
    styleTag: "理工动手型",
    aiSummary:
      "机制 2303 班与 2301/2302 同修《机械制图与CAD》，同时选修工业机器人课程。班级整体更偏「数字化表达」，SolidWorks 与离线仿真表现突出，但国标线型与手工作图一致性略弱。建议与制图课联动：每周 1 次「手绘 + 数模」对照训练，并在机器人单元强化安全互锁与急停演练。",
    generatedAt: "2026-03-10T09:30:00+08:00",
    generatedBy: "ai",
  },
  {
    classId: "cls-mech-2101",
    scoreDistribution: {
      excellent: 9,
      good: 14,
      medium: 5,
      poor: 2,
      averageScore: 80.6,
      stdDev: 8.2,
    },
    radar: [
      { name: "公差与检测", score: 82 },
      { name: "工艺规程", score: 78 },
      { name: "质量意识", score: 85 },
      { name: "成本与节拍", score: 72 },
      { name: "图纸判读", score: 88 },
      { name: "综合项目", score: 76 },
    ],
    strengths: ["零件图装配图读图能力强", "检测与公差标注较扎实"],
    weaknesses: ["工艺经济性分析偏弱", "产线节拍估算经验不足"],
    styleTag: "毕业设计冲刺型",
    aiSummary:
      "机制 2101 班处于大四下学期，核心矛盾从「会不会画」转向「能不能造、好不好测」。《互换性与技术测量》《机械制造工艺学》联动度高，学生普遍能完成中等复杂零件的公差链分析；薄弱环节在工艺方案经济性比较与产线节拍粗算。建议毕业设计阶段引入企业真实工单做 1 次成本—质量权衡答辩。",
    generatedAt: "2026-03-10T09:40:00+08:00",
    generatedBy: "ai",
  },
  {
    classId: "cls-mech-2401",
    scoreDistribution: {
      excellent: 1,
      good: 3,
      medium: 2,
      poor: 0,
      averageScore: 81.2,
      stdDev: 6.1,
    },
    radar: [
      { name: "专业认知", score: 78 },
      { name: "工程表达入门", score: 74 },
      { name: "学习投入", score: 86 },
      { name: "规范意识", score: 70 },
      { name: "团队协作", score: 82 },
      { name: "探究兴趣", score: 88 },
    ],
    strengths: ["学习热情高", "对智能制造话题兴趣浓"],
    weaknesses: ["工程制图规范尚未系统训练", "尺寸与比例概念需巩固"],
    styleTag: "好奇进取型",
    aiSummary:
      "机制 2401 为大一新生班（当前为抽样画像）。学生整体投入度高，对机器人、新能源装备等产业话题好奇。《机械工程专业导论》与后续工程图学衔接关键在「把兴趣落到图纸与量具」。建议保持每周一次车间/实验室认知参观，并提前渗透国标图线与尺寸标注习惯。",
    generatedAt: "2026-03-10T09:50:00+08:00",
    generatedBy: "ai",
  },
];
