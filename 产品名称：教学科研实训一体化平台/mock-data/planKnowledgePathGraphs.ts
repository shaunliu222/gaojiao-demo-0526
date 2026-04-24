import type { PlanKnowledgePathGraph } from "./types";

/**
 * 教学计划「专属」知识路径虚拟数据
 *
 * 与 `knowledgeGraph` 中专业全库节点 ID 无对应关系，仅表达本计划内模块、先后与当学期侧重的摘要网络。
 * 供教师/学生在「进入某一教学计划/学习计划」详情页中展示；边类型含 先修 / 包含 / 相关 / 支撑。
 */
export const planKnowledgePathGraphs: PlanKnowledgePathGraph[] = [
  // ========================================================================
  // plan-main：主线（节点多、环与交叉多，体现复杂路径网）
  // ========================================================================
  {
    planId: "plan-main",
    caption:
      "主线计划按「标准 → 基础几何 → 投影与线面体 → 组合体与表达 → 标件/工程图 → 数字化出图」展开；紫色粗线为学期主轴，橙虚线为回指与迁移，绿点线表示素养/规范对多处的支撑。第3章「组合体三视图」为全学期能力峰值节点。",
    nodes: [
      { id: "pkg-m-01", name: "国标与图幅", nodeType: "知识点", cluster: "制图基础", description: "1.1 建立规范意识" },
      { id: "pkg-m-02", name: "线型/字体/图线", nodeType: "知识点", cluster: "制图基础", description: "1.2 线型与字体制图" },
      { id: "pkg-m-03", name: "尺寸标注三要素", nodeType: "知识点", cluster: "制图基础", description: "1.2~尺寸基础" },
      { id: "pkg-m-04", name: "几何作图与连接", nodeType: "知识点", cluster: "几何作图", description: "2.1 六类连接" },
      { id: "pkg-m-05", name: "平面图形与线段分析", nodeType: "技能点", cluster: "几何作图", description: "2.1 综合小练" },
      { id: "pkg-m-06", name: "正投影与三性", nodeType: "知识点", cluster: "投影基础", description: "2.2 投影法入门" },
      { id: "pkg-m-07", name: "三视图与方位", nodeType: "知识点", cluster: "投影基础", description: "2.2 对位与展开" },
      { id: "pkg-m-08", name: "点投影与可见性", nodeType: "知识点", cluster: "投影基础", description: "2.3 点" },
      { id: "pkg-m-09", name: "线之投影分类", nodeType: "知识点", cluster: "点线面投影", description: "2.3~2.4 线" },
      { id: "pkg-m-10", name: "面与线面关系", nodeType: "知识点", cluster: "点线面投影", description: "2.4 面" },
      { id: "pkg-m-11", name: "棱柱/棱锥投影", nodeType: "知识点", cluster: "立体投影", description: "3.1 平面体" },
      { id: "pkg-m-12", name: "回转体/轮廓线", nodeType: "知识点", cluster: "立体投影", description: "3.1 曲面体" },
      { id: "pkg-m-13", name: "截交线初识", nodeType: "知识点", cluster: "立体投影", description: "衔接 3.4 专项" },
      { id: "pkg-m-14", name: "形体分析法", nodeType: "技能点", cluster: "组合体", description: "3.2 作图主方法" },
      { id: "pkg-m-15", name: "线面分析补充", nodeType: "技能点", cluster: "组合体", description: "与形法互证" },
      { id: "pkg-m-16", name: "组合体三视图", nodeType: "技能点", cluster: "组合体", description: "3.2 本计划焦点", focus: true },
      { id: "pkg-m-17", name: "读图与完整尺寸", nodeType: "知识点", cluster: "组合体", description: "3.3" },
      { id: "pkg-m-18", name: "截交与相贯综合", nodeType: "技能点", cluster: "组合体", description: "3.4 专题日" },
      { id: "pkg-m-19", name: "全剖/半剖/局剖", nodeType: "知识点", cluster: "机件表达", description: "4.3 体系" },
      { id: "pkg-m-20", name: "断面/局放/辅助视图", nodeType: "知识点", cluster: "机件表达", description: "4.2~4.4" },
      { id: "pkg-m-21", name: "螺纹/紧固件", nodeType: "知识点", cluster: "标准件", description: "5.1~5.2" },
      { id: "pkg-m-22", name: "键销/齿轮", nodeType: "知识点", cluster: "标准件", description: "5.3" },
      { id: "pkg-m-23", name: "零件图/公差粗糙度", nodeType: "技能点", cluster: "零件图装配图", description: "6.1" },
      { id: "pkg-m-24", name: "装配/明细/序号", nodeType: "技能点", cluster: "零件图装配图", description: "6.2" },
      { id: "pkg-m-25", name: "AutoCAD 出图", nodeType: "技能点", cluster: "CAD建模", description: "7.1" },
      { id: "pkg-m-26", name: "SolidWorks 与工程图", nodeType: "技能点", cluster: "CAD建模", description: "7.2" },
      { id: "pkg-m-27", name: "工程沟通与图审", nodeType: "核心素养", cluster: "核心素养", description: "横切各章的规范与沟通" },
    ],
    edges: [
      { id: "e-m-01", from: "pkg-m-01", to: "pkg-m-02", relation: "先修" },
      { id: "e-m-02", from: "pkg-m-02", to: "pkg-m-03", relation: "先修" },
      { id: "e-m-03", from: "pkg-m-03", to: "pkg-m-04", relation: "先修" },
      { id: "e-m-04", from: "pkg-m-04", to: "pkg-m-05", relation: "先修" },
      { id: "e-m-05", from: "pkg-m-05", to: "pkg-m-06", relation: "先修" },
      { id: "e-m-06", from: "pkg-m-06", to: "pkg-m-07", relation: "先修" },
      { id: "e-m-07", from: "pkg-m-07", to: "pkg-m-08", relation: "先修" },
      { id: "e-m-08", from: "pkg-m-08", to: "pkg-m-09", relation: "先修" },
      { id: "e-m-09", from: "pkg-m-09", to: "pkg-m-10", relation: "先修" },
      { id: "e-m-10", from: "pkg-m-10", to: "pkg-m-11", relation: "先修" },
      { id: "e-m-11", from: "pkg-m-11", to: "pkg-m-12", relation: "先修" },
      { id: "e-m-12", from: "pkg-m-12", to: "pkg-m-13", relation: "先修" },
      { id: "e-m-13", from: "pkg-m-12", to: "pkg-m-14", relation: "相关" },
      { id: "e-m-14", from: "pkg-m-11", to: "pkg-m-14", relation: "相关" },
      { id: "e-m-15", from: "pkg-m-14", to: "pkg-m-15", relation: "先修" },
      { id: "e-m-16", from: "pkg-m-15", to: "pkg-m-16", relation: "先修" },
      { id: "e-m-17", from: "pkg-m-16", to: "pkg-m-17", relation: "先修" },
      { id: "e-m-18", from: "pkg-m-17", to: "pkg-m-18", relation: "先修" },
      { id: "e-m-19", from: "pkg-m-13", to: "pkg-m-18", relation: "相关" },
      { id: "e-m-20", from: "pkg-m-16", to: "pkg-m-19", relation: "先修" },
      { id: "e-m-21", from: "pkg-m-10", to: "pkg-m-16", relation: "相关" },
      { id: "e-m-22", from: "pkg-m-16", to: "pkg-m-18", relation: "相关" },
      { id: "e-m-23", from: "pkg-m-19", to: "pkg-m-20", relation: "先修" },
      { id: "e-m-24", from: "pkg-m-20", to: "pkg-m-21", relation: "先修" },
      { id: "e-m-25", from: "pkg-m-21", to: "pkg-m-22", relation: "先修" },
      { id: "e-m-26", from: "pkg-m-22", to: "pkg-m-23", relation: "先修" },
      { id: "e-m-27", from: "pkg-m-23", to: "pkg-m-24", relation: "先修" },
      { id: "e-m-28", from: "pkg-m-19", to: "pkg-m-23", relation: "相关" },
      { id: "e-m-29", from: "pkg-m-24", to: "pkg-m-25", relation: "先修" },
      { id: "e-m-30", from: "pkg-m-25", to: "pkg-m-26", relation: "先修" },
      { id: "e-m-31", from: "pkg-m-07", to: "pkg-m-14", relation: "相关" },
      { id: "e-m-32", from: "pkg-m-05", to: "pkg-m-10", relation: "相关" },
      { id: "e-m-33", from: "pkg-m-01", to: "pkg-m-27", relation: "支撑" },
      { id: "e-m-34", from: "pkg-m-06", to: "pkg-m-27", relation: "支撑" },
      { id: "e-m-35", from: "pkg-m-16", to: "pkg-m-27", relation: "支撑" },
      { id: "e-m-36", from: "pkg-m-19", to: "pkg-m-27", relation: "支撑" },
      { id: "e-m-37", from: "pkg-m-25", to: "pkg-m-27", relation: "支撑" },
      { id: "e-m-38", from: "pkg-m-03", to: "pkg-m-17", relation: "相关" },
      { id: "e-m-39", from: "pkg-m-20", to: "pkg-m-25", relation: "相关" },
      { id: "e-m-40", from: "pkg-m-16", to: "pkg-m-24", relation: "包含" },
    ],
  },

  // plan-history
  {
    planId: "plan-history",
    caption:
      "上届节奏略快：在组合体上增加「大作业周」、将装配与 CAD 前移到第6周之前；保留若干 相关 回边用于复盘易错点。",
    nodes: [
      { id: "pkg-h-01", name: "规范与线型", nodeType: "知识点", cluster: "制图基础", description: "第1章" },
      { id: "pkg-h-02", name: "几何/平面分析", nodeType: "技能点", cluster: "几何作图", description: "小测" },
      { id: "pkg-h-03", name: "投影/三视快速过", nodeType: "知识点", cluster: "投影基础", description: "压缩 2.2" },
      { id: "pkg-h-04", name: "组合体大作业", nodeType: "技能点", cluster: "组合体", description: "加权测评", focus: true },
      { id: "pkg-h-05", name: "剖视/断面综合", nodeType: "知识点", cluster: "机件表达", description: "4 章" },
      { id: "pkg-h-06", name: "件图/装配/出图", nodeType: "技能点", cluster: "零件图装配图", description: "6~7 章" },
      { id: "pkg-h-07", name: "复盘：易错点", nodeType: "核心素养", cluster: "核心素养", description: "第12周" },
    ],
    edges: [
      { id: "e-h-1", from: "pkg-h-01", to: "pkg-h-02", relation: "先修" },
      { id: "e-h-2", from: "pkg-h-02", to: "pkg-h-03", relation: "先修" },
      { id: "e-h-3", from: "pkg-h-03", to: "pkg-h-04", relation: "先修" },
      { id: "e-h-4", from: "pkg-h-04", to: "pkg-h-05", relation: "先修" },
      { id: "e-h-5", from: "pkg-h-05", to: "pkg-h-06", relation: "先修" },
      { id: "e-h-6", from: "pkg-h-03", to: "pkg-h-04", relation: "相关" },
      { id: "e-h-7", from: "pkg-h-05", to: "pkg-h-07", relation: "支撑" },
      { id: "e-h-8", from: "pkg-h-04", to: "pkg-h-07", relation: "相关" },
    ],
  },

  // plan-law
  {
    planId: "plan-law",
    caption:
      "民法总则编：在「关系—主体—行为—权义」主线外，为班级讨论型学情增设法条竞合、表见/无权等多条 相关 与案例支撑。",
    nodes: [
      { id: "pkg-l-01", name: "调整对象/渊源", nodeType: "知识点", cluster: "民法基础", description: "1.1" },
      { id: "pkg-l-02", name: "基本原则体系", nodeType: "知识点", cluster: "民法基础", description: "1.2" },
      { id: "pkg-l-03", name: "法律关系/事实", nodeType: "知识点", cluster: "民法基础", description: "1.3" },
      { id: "pkg-l-04", name: "权利能力与行为", nodeType: "知识点", cluster: "民事主体", description: "2.1" },
      { id: "pkg-l-05", name: "监护/宣告", nodeType: "知识点", cluster: "民事主体", description: "2.1~2.2" },
      { id: "pkg-l-06", name: "法人/非法人组织", nodeType: "知识点", cluster: "民事主体", description: "2.3" },
      { id: "pkg-l-07", name: "法律行为/意思表示", nodeType: "技能点", cluster: "法律行为", description: "3.1" },
      { id: "pkg-l-08", name: "效力四态/撤销", nodeType: "技能点", cluster: "法律行为", description: "3.2" },
      { id: "pkg-l-09", name: "代理/表见/无权", nodeType: "技能点", cluster: "法律行为", description: "3.3" },
      { id: "pkg-l-10", name: "案例研讨主线", nodeType: "核心素养", cluster: "核心素养", description: "贯穿案例课" },
      { id: "pkg-l-11", name: "权利救济与时效", nodeType: "知识点", cluster: "责任时效", description: "衔接选读" },
    ],
    edges: [
      { id: "e-l-1", from: "pkg-l-01", to: "pkg-l-02", relation: "先修" },
      { id: "e-l-2", from: "pkg-l-02", to: "pkg-l-03", relation: "先修" },
      { id: "e-l-3", from: "pkg-l-03", to: "pkg-l-04", relation: "先修" },
      { id: "e-l-4", from: "pkg-l-04", to: "pkg-l-05", relation: "先修" },
      { id: "e-l-5", from: "pkg-l-05", to: "pkg-l-06", relation: "先修" },
      { id: "e-l-6", from: "pkg-l-06", to: "pkg-l-07", relation: "先修" },
      { id: "e-l-7", from: "pkg-l-07", to: "pkg-l-08", relation: "先修" },
      { id: "e-l-8", from: "pkg-l-08", to: "pkg-l-09", relation: "先修" },
      { id: "e-l-9", from: "pkg-l-04", to: "pkg-l-08", relation: "相关" },
      { id: "e-l-10", from: "pkg-l-07", to: "pkg-l-10", relation: "支撑" },
      { id: "e-l-11", from: "pkg-l-02", to: "pkg-l-10", relation: "支撑" },
      { id: "e-l-12", from: "pkg-l-08", to: "pkg-l-11", relation: "相关" },
      { id: "e-l-13", from: "pkg-l-01", to: "pkg-l-03", relation: "包含" },
    ],
  },

  // plan-nurse
  {
    planId: "plan-nurse",
    caption:
      "草稿网：在护理程序与感控为底线的前提下，为「体征—给药—沟通」加横向 相关 与「模拟实训」的 支撑 边；定稿后会拆到周次。",
    nodes: [
      { id: "pkg-n-01", name: "护理程序/护理诊断", nodeType: "知识点", cluster: "基础理论", description: "1.1" },
      { id: "pkg-n-02", name: "护士角色/沟通伦理", nodeType: "知识点", cluster: "基础理论", description: "1.1~1.2" },
      { id: "pkg-n-03", name: "手卫生/隔离/防护", nodeType: "技能点", cluster: "感染控制", description: "横切" },
      { id: "pkg-n-04", name: "铺床/体位/安全", nodeType: "技能点", cluster: "生活护理", description: "基础操作" },
      { id: "pkg-n-05", name: "生命体征与观察", nodeType: "技能点", cluster: "生命体征", description: "测录判读" },
      { id: "pkg-n-06", name: "给药/注射/查对", nodeType: "技能点", cluster: "给药注射", description: "五对一注意" },
      { id: "pkg-n-07", name: "情景/夜班模拟", nodeType: "核心素养", cluster: "核心素养", description: "草稿中待排期" },
      { id: "pkg-n-08", name: "文书/交班/记录", nodeType: "技能点", cluster: "基础理论", description: "横切" },
    ],
    edges: [
      { id: "e-n-1", from: "pkg-n-01", to: "pkg-n-02", relation: "先修" },
      { id: "e-n-2", from: "pkg-n-02", to: "pkg-n-03", relation: "先修" },
      { id: "e-n-3", from: "pkg-n-03", to: "pkg-n-04", relation: "先修" },
      { id: "e-n-4", from: "pkg-n-04", to: "pkg-n-05", relation: "先修" },
      { id: "e-n-5", from: "pkg-n-05", to: "pkg-n-06", relation: "先修" },
      { id: "e-n-6", from: "pkg-n-03", to: "pkg-n-06", relation: "相关" },
      { id: "e-n-7", from: "pkg-n-05", to: "pkg-n-08", relation: "相关" },
      { id: "e-n-8", from: "pkg-n-03", to: "pkg-n-07", relation: "支撑" },
      { id: "e-n-9", from: "pkg-n-01", to: "pkg-n-08", relation: "包含" },
    ],
  },
];

export function getPlanKnowledgePathGraph(
  planId: string,
): PlanKnowledgePathGraph | undefined {
  return planKnowledgePathGraphs.find((g) => g.planId === planId);
}
