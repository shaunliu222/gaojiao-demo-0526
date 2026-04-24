import type { TeachingStrategy } from "./types";

/**
 * 教学策略模板
 *
 * - 平台预置 4 个（覆盖典型班级画像）
 * - 机械学院制图教研室共享 1 个
 * - 李建国个人模板 1 个
 */
export const teachingStrategies: TeachingStrategy[] = [
  // ==== 平台预置 ====
  {
    id: "strat-preset-progressive",
    name: "循序渐进型",
    description: "适合基础参差、需要夯实基础的班级。节奏放缓，重要知识点反复练习。",
    source: "platform",
    paceSuggestion: "每周推进 1 个章节，关键小节讲 2 课时",
    difficultyCurve: "作业难度由易到难 4 档梯度，每档配 3-5 道基准题",
    activitySuggestion: "每章节配 1 次随堂测 + 1 次小组互讲",
    fitFor: ["基础薄弱", "两极分化", "新生衔接"],
  },
  {
    id: "strat-preset-balanced",
    name: "均衡推进型",
    description: "最常用的默认策略。节奏和难度保持标准值，适合大多数中上水平班级。",
    source: "platform",
    paceSuggestion: "标准节奏，每周 1 章，重点小节适度拉长",
    difficultyCurve: "基础-理解-应用-综合四段式，比例 3:3:2:2",
    activitySuggestion: "每 2 章一次阶段性复盘，每学期 2 次大作业",
    fitFor: ["踏实稳健", "中上水平"],
  },
  {
    id: "strat-preset-intensive",
    name: "高阶挑战型",
    description: "适合尖子班。节奏加快，增加开放性与创新性任务。",
    source: "platform",
    paceSuggestion: "1.5 倍速推进，核心章节讲完后立即进入综合项目",
    difficultyCurve: "基础-应用-综合-创新四段式，创新题占比 20%",
    activitySuggestion: "鼓励小组做开放课题，参加学科竞赛",
    fitFor: ["尖子班", "基础扎实", "主动学习型"],
  },
  {
    id: "strat-preset-layered",
    name: "分层教学型",
    description: "适合两极分化明显的班级。同一教学计划下分层布置作业、组织答疑。",
    source: "platform",
    paceSuggestion: "主线按标准节奏，基础生追加答疑补课，高阶生追加综合挑战",
    difficultyCurve: "作业分 A/B 卷，A 卷基础、B 卷进阶；选择题占比可自选",
    activitySuggestion: "每章末尾分层辅导，建立朋辈互助小组",
    fitFor: ["两极分化", "学情复杂"],
  },

  // ==== 院系/教研室共享 ====
  {
    id: "strat-mech-workshop",
    name: "机械学院制图教研室 · 工程情境型",
    description: "机械制图教研室共享的经典策略：每个核心知识点绑定一个真实工程情境。",
    source: "department",
    paceSuggestion: "每章提取 1 个工程案例作主线，知识点围绕案例展开",
    difficultyCurve: "案例由简单零件 → 组合体 → 部件装配渐进",
    activitySuggestion: "搭配实物模型和 SolidWorks 三维观察",
    fitFor: ["机械类", "工程素养导向"],
  },

  // ==== 教师个人 ====
  {
    id: "strat-li-personal",
    name: "李建国 · 2301 班定制",
    description:
      "针对机制 2301 班的特定策略。前期紧抓投影基础和空间想象力，重点突破截交线与相贯线难点。",
    source: "personal",
    ownerTeacherId: "t-li",
    paceSuggestion: "投影基础和组合体阶段放缓 1 周，后期机件表达恢复标准",
    difficultyCurve: "难点（截交/相贯）前置基础题+课后补充综合题",
    activitySuggestion: "每周一次「3 分钟视频空间想象小挑战」",
    fitFor: ["机制 2301", "踏实稳健"],
  },
];
