import type { GraphNode, GraphEdge } from "./types";

/**
 * 知识图谱数据
 *
 * - 机械工程（主线）：72 个节点（60 知识点 + 7 技能点 + 5 核心素养），~120 条边，10 个主题簇
 * - 法学：25 个节点（22 知识点 + 2 技能点 + 1 核心素养），~30 条边
 * - 护理学：22 个节点（17 知识点 + 3 技能点 + 2 核心素养），~25 条边
 * - 学前教育：0 节点（演示"未建图谱"空状态）
 *
 * 节点 ID 命名：
 *   kn-<prof>-NNN   知识点
 *   sk-<prof>-NNN   技能点
 *   core-<prof>-NNN 核心素养
 */

// ========================================================================
// 机械工程图谱节点（主线）
// ========================================================================
const mechNodes: GraphNode[] = [
  // ============ 簇 1：制图基础（6）============
  { id: "kn-mech-001", professionId: "prof-mech", name: "国家标准与图纸幅面", nodeType: "知识点", cluster: "制图基础", description: "GB/T 14689 机械制图图纸幅面及格式的国家标准规定。" },
  { id: "kn-mech-002", professionId: "prof-mech", name: "比例", nodeType: "知识点", cluster: "制图基础", description: "绘图比例的概念、常用比例系列及标注方法。" },
  { id: "kn-mech-003", professionId: "prof-mech", name: "字体规范", nodeType: "知识点", cluster: "制图基础", description: "工程字体的规范书写：长仿宋体、数字、字母和汉字的规定。" },
  { id: "kn-mech-004", professionId: "prof-mech", name: "图线", nodeType: "知识点", cluster: "制图基础", description: "九种基本图线（粗实线、细实线、虚线、点画线等）的用途与画法。" },
  { id: "kn-mech-005", professionId: "prof-mech", name: "尺寸标注基础", nodeType: "知识点", cluster: "制图基础", description: "尺寸线、尺寸界线、尺寸数字与尺寸箭头的基本规则。" },
  { id: "kn-mech-006", professionId: "prof-mech", name: "图框与标题栏", nodeType: "知识点", cluster: "制图基础", description: "图纸图框绘制规则及标题栏内容组成。" },

  // ============ 簇 2：几何作图（5）============
  { id: "kn-mech-007", professionId: "prof-mech", name: "基本几何作图", nodeType: "知识点", cluster: "几何作图", description: "等分线段、作平行线、作垂线等基本几何作图方法。" },
  { id: "kn-mech-008", professionId: "prof-mech", name: "圆弧连接", nodeType: "知识点", cluster: "几何作图", description: "用圆弧连接两条已知直线/两已知圆弧/直线与圆弧的作图方法。" },
  { id: "kn-mech-009", professionId: "prof-mech", name: "椭圆画法", nodeType: "知识点", cluster: "几何作图", description: "同心圆法与四心圆弧法绘制椭圆。" },
  { id: "kn-mech-010", professionId: "prof-mech", name: "平面图形分析", nodeType: "知识点", cluster: "几何作图", description: "平面图形的尺寸分析与线段分析。" },
  { id: "kn-mech-011", professionId: "prof-mech", name: "徒手绘制草图", nodeType: "知识点", cluster: "几何作图", description: "徒手线条、圆弧和比例估算的技能。" },

  // ============ 簇 3：投影基础（5）============
  { id: "kn-mech-012", professionId: "prof-mech", name: "投影法概述", nodeType: "知识点", cluster: "投影基础", description: "中心投影法、平行投影法和正投影法的定义与分类。" },
  { id: "kn-mech-013", professionId: "prof-mech", name: "正投影基本性质", nodeType: "知识点", cluster: "投影基础", description: "正投影的显实性、积聚性、类似性三大基本性质。" },
  { id: "kn-mech-014", professionId: "prof-mech", name: "三视图形成原理", nodeType: "知识点", cluster: "投影基础", description: "由三投影面体系形成三视图的过程。" },
  { id: "kn-mech-015", professionId: "prof-mech", name: "三视图对应规律", nodeType: "知识点", cluster: "投影基础", description: "长对正、高平齐、宽相等的三等规律。" },
  { id: "kn-mech-016", professionId: "prof-mech", name: "视图的可见性", nodeType: "知识点", cluster: "投影基础", description: "可见轮廓线用粗实线、不可见用虚线的规定。" },

  // ============ 簇 4：点线面投影（7）============
  { id: "kn-mech-017", professionId: "prof-mech", name: "点的投影", nodeType: "知识点", cluster: "点线面投影", description: "空间点在三投影面上的投影规律与坐标关系。" },
  { id: "kn-mech-018", professionId: "prof-mech", name: "两点相对位置", nodeType: "知识点", cluster: "点线面投影", description: "根据三投影判断两点上下、前后、左右关系，以及重影点的判别。" },
  { id: "kn-mech-019", professionId: "prof-mech", name: "直线的投影", nodeType: "知识点", cluster: "点线面投影", description: "一般位置直线、投影面平行线、投影面垂直线三类直线的投影特点。" },
  { id: "kn-mech-020", professionId: "prof-mech", name: "直线上的点", nodeType: "知识点", cluster: "点线面投影", description: "直线上点的从属性、定比性。" },
  { id: "kn-mech-021", professionId: "prof-mech", name: "平面的投影", nodeType: "知识点", cluster: "点线面投影", description: "一般位置平面、投影面平行面、投影面垂直面的投影特点。" },
  { id: "kn-mech-022", professionId: "prof-mech", name: "直线与平面相对位置", nodeType: "知识点", cluster: "点线面投影", description: "直线与平面的平行、相交、垂直关系判别。" },
  { id: "kn-mech-023", professionId: "prof-mech", name: "两平面相对位置", nodeType: "知识点", cluster: "点线面投影", description: "两平面平行、相交、垂直关系的判断。" },

  // ============ 簇 5：立体投影（6）============
  { id: "kn-mech-024", professionId: "prof-mech", name: "平面立体投影", nodeType: "知识点", cluster: "立体投影", description: "棱柱、棱锥等平面立体的三视图画法及表面取点。" },
  { id: "kn-mech-025", professionId: "prof-mech", name: "回转体投影", nodeType: "知识点", cluster: "立体投影", description: "圆柱、圆锥、圆球、圆环等回转体的投影规律。" },
  { id: "kn-mech-026", professionId: "prof-mech", name: "圆柱投影特征", nodeType: "知识点", cluster: "立体投影", description: "圆柱面的积聚性投影与素线画法。" },
  { id: "kn-mech-027", professionId: "prof-mech", name: "圆锥投影特征", nodeType: "知识点", cluster: "立体投影", description: "圆锥面的类似性投影与素线定位。" },
  { id: "kn-mech-028", professionId: "prof-mech", name: "截交线", nodeType: "知识点", cluster: "立体投影", description: "平面与立体相交产生的截交线求法（素线法、辅助平面法）。" },
  { id: "kn-mech-029", professionId: "prof-mech", name: "相贯线", nodeType: "知识点", cluster: "立体投影", description: "两回转体相交产生的相贯线求法及特殊情况。" },

  // ============ 簇 6：组合体（5）============
  { id: "kn-mech-030", professionId: "prof-mech", name: "组合体构成方式", nodeType: "知识点", cluster: "组合体", description: "叠加式、切割式和综合式三种组合体构成方式。" },
  { id: "kn-mech-031", professionId: "prof-mech", name: "组合体三视图绘制", nodeType: "知识点", cluster: "组合体", description: "分解形体、逐部分绘制三视图、检查线型与过渡线。【主故事线焦点小节】" },
  { id: "kn-mech-032", professionId: "prof-mech", name: "组合体尺寸标注", nodeType: "知识点", cluster: "组合体", description: "定形尺寸、定位尺寸和总体尺寸三类尺寸的完整标注方法。" },
  { id: "kn-mech-033", professionId: "prof-mech", name: "看组合体视图", nodeType: "知识点", cluster: "组合体", description: "从三视图还原空间形体的读图方法。" },
  { id: "kn-mech-034", professionId: "prof-mech", name: "组合体形体分析法", nodeType: "知识点", cluster: "组合体", description: "把组合体分解为基本体并分析相互位置关系的分析方法。" },

  // ============ 簇 7：机件表达方法（7）============
  { id: "kn-mech-035", professionId: "prof-mech", name: "基本视图", nodeType: "知识点", cluster: "机件表达", description: "前后左右上下六个基本视图的定义与画法。" },
  { id: "kn-mech-036", professionId: "prof-mech", name: "向视图", nodeType: "知识点", cluster: "机件表达", description: "自由配置的视图与标注方法。" },
  { id: "kn-mech-037", professionId: "prof-mech", name: "局部视图", nodeType: "知识点", cluster: "机件表达", description: "只表达机件某一部分的视图。" },
  { id: "kn-mech-038", professionId: "prof-mech", name: "斜视图", nodeType: "知识点", cluster: "机件表达", description: "表达机件倾斜部分真实形状的视图。" },
  { id: "kn-mech-039", professionId: "prof-mech", name: "剖视图", nodeType: "知识点", cluster: "机件表达", description: "全剖、半剖、局部剖视图的画法与剖切面选择。" },
  { id: "kn-mech-040", professionId: "prof-mech", name: "断面图", nodeType: "知识点", cluster: "机件表达", description: "移出断面与重合断面的画法。" },
  { id: "kn-mech-041", professionId: "prof-mech", name: "局部放大图", nodeType: "知识点", cluster: "机件表达", description: "用放大比例将机件局部放大的画法。" },

  // ============ 簇 8：标准件与常用件（6）============
  { id: "kn-mech-042", professionId: "prof-mech", name: "螺纹基础", nodeType: "知识点", cluster: "标准件", description: "螺纹的形成、要素（牙型、直径、螺距、旋向）和种类。" },
  { id: "kn-mech-043", professionId: "prof-mech", name: "螺纹画法", nodeType: "知识点", cluster: "标准件", description: "外螺纹、内螺纹及其连接的规定画法。" },
  { id: "kn-mech-044", professionId: "prof-mech", name: "螺纹紧固件", nodeType: "知识点", cluster: "标准件", description: "螺栓、螺柱、螺钉及其垫圈与螺母的连接画法。" },
  { id: "kn-mech-045", professionId: "prof-mech", name: "键连接", nodeType: "知识点", cluster: "标准件", description: "普通平键、半圆键连接的表达方法。" },
  { id: "kn-mech-046", professionId: "prof-mech", name: "销连接", nodeType: "知识点", cluster: "标准件", description: "圆柱销、圆锥销的标记与画法。" },
  { id: "kn-mech-047", professionId: "prof-mech", name: "齿轮表达", nodeType: "知识点", cluster: "标准件", description: "圆柱齿轮单个齿轮与啮合的规定画法。" },

  // ============ 簇 9：零件图与装配图（6）============
  { id: "kn-mech-048", professionId: "prof-mech", name: "零件图内容", nodeType: "知识点", cluster: "零件图装配图", description: "零件图四项内容：图形、尺寸、技术要求、标题栏。" },
  { id: "kn-mech-049", professionId: "prof-mech", name: "表面粗糙度", nodeType: "知识点", cluster: "零件图装配图", description: "表面粗糙度参数 Ra 的含义、标注符号和在零件图上的标注方法。" },
  { id: "kn-mech-050", professionId: "prof-mech", name: "尺寸公差与配合", nodeType: "知识点", cluster: "零件图装配图", description: "基本尺寸、极限偏差、配合制度及在图纸上的标注。" },
  { id: "kn-mech-051", professionId: "prof-mech", name: "形位公差", nodeType: "知识点", cluster: "零件图装配图", description: "形状和位置公差的符号体系与标注方法。" },
  { id: "kn-mech-052", professionId: "prof-mech", name: "装配图表达方法", nodeType: "知识点", cluster: "零件图装配图", description: "装配图上的规定画法、特殊表达方法和零件序号编排。" },
  { id: "kn-mech-053", professionId: "prof-mech", name: "装配图尺寸与技术要求", nodeType: "知识点", cluster: "零件图装配图", description: "装配图应标注的五类尺寸及明细表、技术要求的编写。" },

  // ============ 簇 10：CAD 与三维建模（7）============
  { id: "kn-mech-054", professionId: "prof-mech", name: "AutoCAD 界面与命令", nodeType: "知识点", cluster: "CAD建模", description: "AutoCAD 工作界面、命令输入方式、绘图与编辑常用命令。" },
  { id: "kn-mech-055", professionId: "prof-mech", name: "图层管理", nodeType: "知识点", cluster: "CAD建模", description: "图层的建立、图层特性（颜色/线型/线宽）和图层过滤器。" },
  { id: "kn-mech-056", professionId: "prof-mech", name: "块与属性", nodeType: "知识点", cluster: "CAD建模", description: "块定义、块插入、属性定义与动态块。" },
  { id: "kn-mech-057", professionId: "prof-mech", name: "图纸空间与打印", nodeType: "知识点", cluster: "CAD建模", description: "模型空间与图纸空间切换、视口配置、打印样式表与出图。" },
  { id: "kn-mech-058", professionId: "prof-mech", name: "SolidWorks 草图", nodeType: "知识点", cluster: "CAD建模", description: "SolidWorks 草图绘制、几何约束和尺寸约束。" },
  { id: "kn-mech-059", professionId: "prof-mech", name: "三维实体建模", nodeType: "知识点", cluster: "CAD建模", description: "拉伸、旋转、扫描、放样等三维特征命令。" },
  { id: "kn-mech-060", professionId: "prof-mech", name: "三维装配与工程图输出", nodeType: "知识点", cluster: "CAD建模", description: "装配体配合约束与由三维模型自动生成二维工程图。" },

  // ============ 技能点（7）============
  { id: "sk-mech-001", professionId: "prof-mech", name: "手工绘图技能", nodeType: "技能点", cluster: "技能", description: "使用绘图工具或徒手绘制机械图的操作技能。" },
  { id: "sk-mech-002", professionId: "prof-mech", name: "AutoCAD 二维绘图技能", nodeType: "技能点", cluster: "技能", description: "熟练使用 AutoCAD 绘制二维机械工程图。" },
  { id: "sk-mech-003", professionId: "prof-mech", name: "SolidWorks 三维建模技能", nodeType: "技能点", cluster: "技能", description: "使用 SolidWorks 完成零件、装配体建模和工程图输出。" },
  { id: "sk-mech-004", professionId: "prof-mech", name: "零件测绘技能", nodeType: "技能点", cluster: "技能", description: "对实物零件进行测绘并绘制草图和零件图的综合能力。" },
  { id: "sk-mech-005", professionId: "prof-mech", name: "工程图阅读技能", nodeType: "技能点", cluster: "技能", description: "正确识读零件图和装配图的能力。" },
  { id: "sk-mech-006", professionId: "prof-mech", name: "公差标注与选用技能", nodeType: "技能点", cluster: "技能", description: "根据使用要求合理选择并标注尺寸公差、形位公差与表面粗糙度。" },
  { id: "sk-mech-007", professionId: "prof-mech", name: "机械工程规范检查技能", nodeType: "技能点", cluster: "技能", description: "对照国家标准检查图纸合规性的能力。" },

  // ============ 核心素养（5）============
  { id: "core-mech-001", professionId: "prof-mech", name: "工程素养", nodeType: "核心素养", cluster: "核心素养", description: "以工程师思维看待问题、遵循工程逻辑解决实际问题的综合素养。" },
  { id: "core-mech-002", professionId: "prof-mech", name: "空间想象能力", nodeType: "核心素养", cluster: "核心素养", description: "在二维图纸和三维空间之间自由转换的思维能力。" },
  { id: "core-mech-003", professionId: "prof-mech", name: "规范与严谨意识", nodeType: "核心素养", cluster: "核心素养", description: "遵守国家标准、注重细节、一丝不苟的职业意识。" },
  { id: "core-mech-004", professionId: "prof-mech", name: "创新意识", nodeType: "核心素养", cluster: "核心素养", description: "突破常规、优化设计的探索精神。" },
  { id: "core-mech-005", professionId: "prof-mech", name: "团队协作能力", nodeType: "核心素养", cluster: "核心素养", description: "在工程项目中与多学科团队协同工作的能力。" },
];

// ========================================================================
// 机械工程图谱边
// ========================================================================
const mechEdges: GraphEdge[] = [
  // ---- 制图基础 → 后续所有绘图 ----
  { id: "e-m-001", professionId: "prof-mech", from: "kn-mech-001", to: "kn-mech-006", relation: "先修" },
  { id: "e-m-002", professionId: "prof-mech", from: "kn-mech-001", to: "kn-mech-007", relation: "先修" },
  { id: "e-m-003", professionId: "prof-mech", from: "kn-mech-004", to: "kn-mech-013", relation: "先修" },
  { id: "e-m-004", professionId: "prof-mech", from: "kn-mech-005", to: "kn-mech-032", relation: "先修" },
  { id: "e-m-005", professionId: "prof-mech", from: "kn-mech-002", to: "kn-mech-006", relation: "相关" },
  { id: "e-m-006", professionId: "prof-mech", from: "kn-mech-003", to: "kn-mech-006", relation: "相关" },

  // ---- 几何作图内部 ----
  { id: "e-m-010", professionId: "prof-mech", from: "kn-mech-007", to: "kn-mech-008", relation: "先修" },
  { id: "e-m-011", professionId: "prof-mech", from: "kn-mech-007", to: "kn-mech-009", relation: "先修" },
  { id: "e-m-012", professionId: "prof-mech", from: "kn-mech-008", to: "kn-mech-010", relation: "先修" },
  { id: "e-m-013", professionId: "prof-mech", from: "kn-mech-010", to: "kn-mech-011", relation: "相关" },
  { id: "e-m-014", professionId: "prof-mech", from: "kn-mech-007", to: "kn-mech-012", relation: "先修" },

  // ---- 投影基础内部 ----
  { id: "e-m-020", professionId: "prof-mech", from: "kn-mech-012", to: "kn-mech-013", relation: "先修" },
  { id: "e-m-021", professionId: "prof-mech", from: "kn-mech-013", to: "kn-mech-014", relation: "先修" },
  { id: "e-m-022", professionId: "prof-mech", from: "kn-mech-014", to: "kn-mech-015", relation: "先修" },
  { id: "e-m-023", professionId: "prof-mech", from: "kn-mech-014", to: "kn-mech-016", relation: "包含" },
  { id: "e-m-024", professionId: "prof-mech", from: "kn-mech-015", to: "kn-mech-017", relation: "先修" },

  // ---- 点线面投影内部 ----
  { id: "e-m-030", professionId: "prof-mech", from: "kn-mech-017", to: "kn-mech-018", relation: "先修" },
  { id: "e-m-031", professionId: "prof-mech", from: "kn-mech-017", to: "kn-mech-019", relation: "先修" },
  { id: "e-m-032", professionId: "prof-mech", from: "kn-mech-019", to: "kn-mech-020", relation: "包含" },
  { id: "e-m-033", professionId: "prof-mech", from: "kn-mech-019", to: "kn-mech-021", relation: "先修" },
  { id: "e-m-034", professionId: "prof-mech", from: "kn-mech-021", to: "kn-mech-022", relation: "先修" },
  { id: "e-m-035", professionId: "prof-mech", from: "kn-mech-021", to: "kn-mech-023", relation: "先修" },
  { id: "e-m-036", professionId: "prof-mech", from: "kn-mech-022", to: "kn-mech-023", relation: "相关" },

  // ---- 立体投影内部 ----
  { id: "e-m-040", professionId: "prof-mech", from: "kn-mech-017", to: "kn-mech-024", relation: "先修" },
  { id: "e-m-041", professionId: "prof-mech", from: "kn-mech-019", to: "kn-mech-024", relation: "先修" },
  { id: "e-m-042", professionId: "prof-mech", from: "kn-mech-021", to: "kn-mech-024", relation: "先修" },
  { id: "e-m-043", professionId: "prof-mech", from: "kn-mech-024", to: "kn-mech-025", relation: "先修" },
  { id: "e-m-044", professionId: "prof-mech", from: "kn-mech-025", to: "kn-mech-026", relation: "包含" },
  { id: "e-m-045", professionId: "prof-mech", from: "kn-mech-025", to: "kn-mech-027", relation: "包含" },
  { id: "e-m-046", professionId: "prof-mech", from: "kn-mech-024", to: "kn-mech-028", relation: "先修" },
  { id: "e-m-047", professionId: "prof-mech", from: "kn-mech-025", to: "kn-mech-028", relation: "先修" },
  { id: "e-m-048", professionId: "prof-mech", from: "kn-mech-028", to: "kn-mech-029", relation: "先修" },

  // ---- 立体 → 组合体 ----
  { id: "e-m-050", professionId: "prof-mech", from: "kn-mech-024", to: "kn-mech-030", relation: "先修" },
  { id: "e-m-051", professionId: "prof-mech", from: "kn-mech-025", to: "kn-mech-030", relation: "先修" },
  { id: "e-m-052", professionId: "prof-mech", from: "kn-mech-028", to: "kn-mech-031", relation: "先修" },
  { id: "e-m-053", professionId: "prof-mech", from: "kn-mech-029", to: "kn-mech-031", relation: "先修" },
  { id: "e-m-054", professionId: "prof-mech", from: "kn-mech-030", to: "kn-mech-031", relation: "先修" },
  { id: "e-m-055", professionId: "prof-mech", from: "kn-mech-034", to: "kn-mech-031", relation: "支撑" },
  { id: "e-m-056", professionId: "prof-mech", from: "kn-mech-031", to: "kn-mech-032", relation: "先修" },
  { id: "e-m-057", professionId: "prof-mech", from: "kn-mech-031", to: "kn-mech-033", relation: "相关" },
  { id: "e-m-058", professionId: "prof-mech", from: "kn-mech-034", to: "kn-mech-033", relation: "支撑" },

  // ---- 组合体 → 机件表达 ----
  { id: "e-m-060", professionId: "prof-mech", from: "kn-mech-031", to: "kn-mech-035", relation: "先修" },
  { id: "e-m-061", professionId: "prof-mech", from: "kn-mech-035", to: "kn-mech-036", relation: "先修" },
  { id: "e-m-062", professionId: "prof-mech", from: "kn-mech-035", to: "kn-mech-037", relation: "先修" },
  { id: "e-m-063", professionId: "prof-mech", from: "kn-mech-035", to: "kn-mech-038", relation: "先修" },
  { id: "e-m-064", professionId: "prof-mech", from: "kn-mech-035", to: "kn-mech-039", relation: "先修" },
  { id: "e-m-065", professionId: "prof-mech", from: "kn-mech-039", to: "kn-mech-040", relation: "先修" },
  { id: "e-m-066", professionId: "prof-mech", from: "kn-mech-039", to: "kn-mech-041", relation: "相关" },
  { id: "e-m-067", professionId: "prof-mech", from: "kn-mech-028", to: "kn-mech-039", relation: "相关" },

  // ---- 标准件内部与扩展 ----
  { id: "e-m-070", professionId: "prof-mech", from: "kn-mech-042", to: "kn-mech-043", relation: "先修" },
  { id: "e-m-071", professionId: "prof-mech", from: "kn-mech-043", to: "kn-mech-044", relation: "先修" },
  { id: "e-m-072", professionId: "prof-mech", from: "kn-mech-035", to: "kn-mech-047", relation: "相关" },

  // ---- 机件表达/标准件 → 零件图装配图 ----
  { id: "e-m-080", professionId: "prof-mech", from: "kn-mech-035", to: "kn-mech-048", relation: "先修" },
  { id: "e-m-081", professionId: "prof-mech", from: "kn-mech-039", to: "kn-mech-048", relation: "先修" },
  { id: "e-m-082", professionId: "prof-mech", from: "kn-mech-048", to: "kn-mech-049", relation: "包含" },
  { id: "e-m-083", professionId: "prof-mech", from: "kn-mech-048", to: "kn-mech-050", relation: "包含" },
  { id: "e-m-084", professionId: "prof-mech", from: "kn-mech-050", to: "kn-mech-051", relation: "相关" },
  { id: "e-m-085", professionId: "prof-mech", from: "kn-mech-048", to: "kn-mech-051", relation: "包含" },
  { id: "e-m-086", professionId: "prof-mech", from: "kn-mech-048", to: "kn-mech-052", relation: "先修" },
  { id: "e-m-087", professionId: "prof-mech", from: "kn-mech-044", to: "kn-mech-052", relation: "相关" },
  { id: "e-m-088", professionId: "prof-mech", from: "kn-mech-045", to: "kn-mech-052", relation: "相关" },
  { id: "e-m-089", professionId: "prof-mech", from: "kn-mech-046", to: "kn-mech-052", relation: "相关" },
  { id: "e-m-090", professionId: "prof-mech", from: "kn-mech-047", to: "kn-mech-052", relation: "相关" },
  { id: "e-m-091", professionId: "prof-mech", from: "kn-mech-052", to: "kn-mech-053", relation: "先修" },

  // ---- CAD 内部与扩展 ----
  { id: "e-m-100", professionId: "prof-mech", from: "kn-mech-054", to: "kn-mech-055", relation: "先修" },
  { id: "e-m-101", professionId: "prof-mech", from: "kn-mech-055", to: "kn-mech-056", relation: "先修" },
  { id: "e-m-102", professionId: "prof-mech", from: "kn-mech-054", to: "kn-mech-057", relation: "先修" },
  { id: "e-m-103", professionId: "prof-mech", from: "kn-mech-054", to: "kn-mech-048", relation: "相关" },
  { id: "e-m-104", professionId: "prof-mech", from: "kn-mech-058", to: "kn-mech-059", relation: "先修" },
  { id: "e-m-105", professionId: "prof-mech", from: "kn-mech-059", to: "kn-mech-060", relation: "先修" },
  { id: "e-m-106", professionId: "prof-mech", from: "kn-mech-060", to: "kn-mech-052", relation: "相关" },

  // ---- 技能点支撑关系 ----
  { id: "e-m-110", professionId: "prof-mech", from: "sk-mech-001", to: "kn-mech-008", relation: "支撑" },
  { id: "e-m-111", professionId: "prof-mech", from: "sk-mech-001", to: "kn-mech-011", relation: "支撑" },
  { id: "e-m-112", professionId: "prof-mech", from: "sk-mech-001", to: "kn-mech-031", relation: "支撑" },
  { id: "e-m-113", professionId: "prof-mech", from: "sk-mech-002", to: "kn-mech-054", relation: "支撑" },
  { id: "e-m-114", professionId: "prof-mech", from: "sk-mech-002", to: "kn-mech-055", relation: "支撑" },
  { id: "e-m-115", professionId: "prof-mech", from: "sk-mech-002", to: "kn-mech-048", relation: "支撑" },
  { id: "e-m-116", professionId: "prof-mech", from: "sk-mech-003", to: "kn-mech-058", relation: "支撑" },
  { id: "e-m-117", professionId: "prof-mech", from: "sk-mech-003", to: "kn-mech-059", relation: "支撑" },
  { id: "e-m-118", professionId: "prof-mech", from: "sk-mech-003", to: "kn-mech-060", relation: "支撑" },
  { id: "e-m-119", professionId: "prof-mech", from: "sk-mech-004", to: "kn-mech-033", relation: "支撑" },
  { id: "e-m-120", professionId: "prof-mech", from: "sk-mech-004", to: "kn-mech-048", relation: "支撑" },
  { id: "e-m-121", professionId: "prof-mech", from: "sk-mech-005", to: "kn-mech-033", relation: "支撑" },
  { id: "e-m-122", professionId: "prof-mech", from: "sk-mech-005", to: "kn-mech-053", relation: "支撑" },
  { id: "e-m-123", professionId: "prof-mech", from: "sk-mech-006", to: "kn-mech-050", relation: "支撑" },
  { id: "e-m-124", professionId: "prof-mech", from: "sk-mech-006", to: "kn-mech-051", relation: "支撑" },
  { id: "e-m-125", professionId: "prof-mech", from: "sk-mech-007", to: "kn-mech-001", relation: "支撑" },
  { id: "e-m-126", professionId: "prof-mech", from: "sk-mech-007", to: "kn-mech-005", relation: "支撑" },

  // ---- 核心素养支撑关系 ----
  { id: "e-m-130", professionId: "prof-mech", from: "core-mech-001", to: "sk-mech-005", relation: "支撑" },
  { id: "e-m-131", professionId: "prof-mech", from: "core-mech-001", to: "sk-mech-006", relation: "支撑" },
  { id: "e-m-132", professionId: "prof-mech", from: "core-mech-002", to: "kn-mech-015", relation: "支撑" },
  { id: "e-m-133", professionId: "prof-mech", from: "core-mech-002", to: "kn-mech-024", relation: "支撑" },
  { id: "e-m-134", professionId: "prof-mech", from: "core-mech-002", to: "kn-mech-031", relation: "支撑" },
  { id: "e-m-135", professionId: "prof-mech", from: "core-mech-002", to: "sk-mech-003", relation: "支撑" },
  { id: "e-m-136", professionId: "prof-mech", from: "core-mech-003", to: "sk-mech-007", relation: "支撑" },
  { id: "e-m-137", professionId: "prof-mech", from: "core-mech-003", to: "kn-mech-048", relation: "支撑" },
  { id: "e-m-138", professionId: "prof-mech", from: "core-mech-004", to: "sk-mech-003", relation: "支撑" },
  { id: "e-m-139", professionId: "prof-mech", from: "core-mech-004", to: "kn-mech-058", relation: "支撑" },
  { id: "e-m-140", professionId: "prof-mech", from: "core-mech-005", to: "sk-mech-004", relation: "支撑" },
  { id: "e-m-141", professionId: "prof-mech", from: "core-mech-005", to: "sk-mech-005", relation: "支撑" },
];

// ========================================================================
// 法学图谱（25 节点）
// ========================================================================
const lawNodes: GraphNode[] = [
  // 簇 1 民法基础
  { id: "kn-law-001", professionId: "prof-law", name: "民法的概念与调整对象", nodeType: "知识点", cluster: "民法基础", description: "民法调整平等主体之间的财产关系和人身关系。" },
  { id: "kn-law-002", professionId: "prof-law", name: "民法基本原则", nodeType: "知识点", cluster: "民法基础", description: "平等、自愿、公平、诚实信用、守法与公序良俗、绿色原则。" },
  { id: "kn-law-003", professionId: "prof-law", name: "民事法律关系", nodeType: "知识点", cluster: "民法基础", description: "主体、客体、内容三要素及其变动。" },
  { id: "kn-law-004", professionId: "prof-law", name: "民事法律事实", nodeType: "知识点", cluster: "民法基础", description: "行为事实与事件事实的分类。" },
  { id: "kn-law-005", professionId: "prof-law", name: "民法典体系", nodeType: "知识点", cluster: "民法基础", description: "民法典总则、物权、合同、人格权、婚姻家庭、继承、侵权责任七编概览。" },
  { id: "kn-law-006", professionId: "prof-law", name: "民事权利基本分类", nodeType: "知识点", cluster: "民法基础", description: "支配权、请求权、形成权、抗辩权等分类。" },

  // 簇 2 民事主体
  { id: "kn-law-007", professionId: "prof-law", name: "自然人民事主体", nodeType: "知识点", cluster: "民事主体", description: "自然人作为民事主体的基本规定。" },
  { id: "kn-law-008", professionId: "prof-law", name: "民事权利能力", nodeType: "知识点", cluster: "民事主体", description: "自然人民事权利能力的起止。" },
  { id: "kn-law-009", professionId: "prof-law", name: "民事行为能力", nodeType: "知识点", cluster: "民事主体", description: "完全、限制、无民事行为能力人的划分。" },
  { id: "kn-law-010", professionId: "prof-law", name: "法人与非法人组织", nodeType: "知识点", cluster: "民事主体", description: "营利/非营利/特别法人和合伙企业等非法人组织。" },
  { id: "kn-law-011", professionId: "prof-law", name: "监护制度", nodeType: "知识点", cluster: "民事主体", description: "未成年人与成年人监护的设立与撤销。" },

  // 簇 3 法律行为与代理
  { id: "kn-law-012", professionId: "prof-law", name: "民事法律行为", nodeType: "知识点", cluster: "法律行为", description: "以意思表示为要素、旨在设立变更终止法律关系的合法行为。" },
  { id: "kn-law-013", professionId: "prof-law", name: "意思表示", nodeType: "知识点", cluster: "法律行为", description: "意思表示的构成与瑕疵类型。" },
  { id: "kn-law-014", professionId: "prof-law", name: "法律行为的效力", nodeType: "知识点", cluster: "法律行为", description: "有效、无效、可撤销、效力待定四种效力状态。" },
  { id: "kn-law-015", professionId: "prof-law", name: "代理制度", nodeType: "知识点", cluster: "法律行为", description: "委托代理、法定代理、无权代理与表见代理。" },

  // 簇 4 民事权利（实体权）
  { id: "kn-law-016", professionId: "prof-law", name: "人身权", nodeType: "知识点", cluster: "民事权利", description: "生命权、健康权、姓名权、肖像权、隐私权等人身权。" },
  { id: "kn-law-017", professionId: "prof-law", name: "物权", nodeType: "知识点", cluster: "民事权利", description: "所有权、用益物权、担保物权的基本框架。" },
  { id: "kn-law-018", professionId: "prof-law", name: "债权", nodeType: "知识点", cluster: "民事权利", description: "合同之债、无因管理、不当得利、侵权之债。" },
  { id: "kn-law-019", professionId: "prof-law", name: "知识产权", nodeType: "知识点", cluster: "民事权利", description: "著作权、专利权、商标权的基本属性。" },
  { id: "kn-law-023", professionId: "prof-law", name: "公序良俗原则", nodeType: "知识点", cluster: "民事权利", description: "公序良俗作为民法基本原则在民事活动中的具体适用。" },

  // 簇 5 民事责任与时效
  { id: "kn-law-020", professionId: "prof-law", name: "民事责任", nodeType: "知识点", cluster: "责任时效", description: "过错责任原则与无过错责任原则。" },
  { id: "kn-law-021", professionId: "prof-law", name: "诉讼时效", nodeType: "知识点", cluster: "责任时效", description: "普通、特别诉讼时效与时效中止、中断、延长。" },
  { id: "kn-law-022", professionId: "prof-law", name: "期间与期日", nodeType: "知识点", cluster: "责任时效", description: "期间的计算、期日与期间的关系。" },

  // 技能点
  { id: "sk-law-001", professionId: "prof-law", name: "法律条文检索与适用", nodeType: "技能点", cluster: "技能", description: "利用各类法律数据库精准检索法条并适用到案件中。" },
  { id: "sk-law-002", professionId: "prof-law", name: "案例分析技能", nodeType: "技能点", cluster: "技能", description: "IRAC 方法分析真实案例的能力。" },
  { id: "sk-law-003", professionId: "prof-law", name: "法律文书写作", nodeType: "技能点", cluster: "技能", description: "撰写起诉状、答辩状、合同等法律文书的能力。" },

  // 核心素养
  { id: "core-law-001", professionId: "prof-law", name: "法治思维", nodeType: "核心素养", cluster: "核心素养", description: "在法治框架下思考、分析和解决问题的核心能力。" },
];

const lawEdges: GraphEdge[] = [
  { id: "e-l-001", professionId: "prof-law", from: "kn-law-001", to: "kn-law-002", relation: "先修" },
  { id: "e-l-002", professionId: "prof-law", from: "kn-law-001", to: "kn-law-003", relation: "先修" },
  { id: "e-l-003", professionId: "prof-law", from: "kn-law-003", to: "kn-law-004", relation: "包含" },
  { id: "e-l-004", professionId: "prof-law", from: "kn-law-003", to: "kn-law-006", relation: "包含" },
  { id: "e-l-005", professionId: "prof-law", from: "kn-law-001", to: "kn-law-005", relation: "相关" },
  { id: "e-l-006", professionId: "prof-law", from: "kn-law-002", to: "kn-law-023", relation: "包含" },
  { id: "e-l-007", professionId: "prof-law", from: "kn-law-003", to: "kn-law-007", relation: "先修" },
  { id: "e-l-008", professionId: "prof-law", from: "kn-law-007", to: "kn-law-008", relation: "包含" },
  { id: "e-l-009", professionId: "prof-law", from: "kn-law-007", to: "kn-law-009", relation: "包含" },
  { id: "e-l-010", professionId: "prof-law", from: "kn-law-009", to: "kn-law-011", relation: "相关" },
  { id: "e-l-011", professionId: "prof-law", from: "kn-law-003", to: "kn-law-010", relation: "先修" },
  { id: "e-l-012", professionId: "prof-law", from: "kn-law-004", to: "kn-law-012", relation: "先修" },
  { id: "e-l-013", professionId: "prof-law", from: "kn-law-012", to: "kn-law-013", relation: "包含" },
  { id: "e-l-014", professionId: "prof-law", from: "kn-law-012", to: "kn-law-014", relation: "包含" },
  { id: "e-l-015", professionId: "prof-law", from: "kn-law-012", to: "kn-law-015", relation: "先修" },
  { id: "e-l-016", professionId: "prof-law", from: "kn-law-006", to: "kn-law-016", relation: "先修" },
  { id: "e-l-017", professionId: "prof-law", from: "kn-law-006", to: "kn-law-017", relation: "先修" },
  { id: "e-l-018", professionId: "prof-law", from: "kn-law-006", to: "kn-law-018", relation: "先修" },
  { id: "e-l-019", professionId: "prof-law", from: "kn-law-006", to: "kn-law-019", relation: "先修" },
  { id: "e-l-020", professionId: "prof-law", from: "kn-law-003", to: "kn-law-020", relation: "相关" },
  { id: "e-l-021", professionId: "prof-law", from: "kn-law-020", to: "kn-law-021", relation: "相关" },
  { id: "e-l-022", professionId: "prof-law", from: "kn-law-021", to: "kn-law-022", relation: "包含" },
  { id: "e-l-023", professionId: "prof-law", from: "sk-law-001", to: "kn-law-005", relation: "支撑" },
  { id: "e-l-024", professionId: "prof-law", from: "sk-law-002", to: "kn-law-012", relation: "支撑" },
  { id: "e-l-025", professionId: "prof-law", from: "sk-law-002", to: "kn-law-014", relation: "支撑" },
  { id: "e-l-026", professionId: "prof-law", from: "sk-law-002", to: "kn-law-018", relation: "支撑" },
  { id: "e-l-027", professionId: "prof-law", from: "sk-law-003", to: "kn-law-015", relation: "支撑" },
  { id: "e-l-028", professionId: "prof-law", from: "core-law-001", to: "kn-law-002", relation: "支撑" },
  { id: "e-l-029", professionId: "prof-law", from: "core-law-001", to: "sk-law-001", relation: "支撑" },
  { id: "e-l-030", professionId: "prof-law", from: "core-law-001", to: "sk-law-002", relation: "支撑" },
];

// ========================================================================
// 护理学图谱（22 节点）
// ========================================================================
const nurseNodes: GraphNode[] = [
  // 簇 1 护理基础理论
  { id: "kn-nur-001", professionId: "prof-nurse", name: "护理学发展史", nodeType: "知识点", cluster: "基础理论", description: "现代护理学的发展阶段及代表人物。" },
  { id: "kn-nur-002", professionId: "prof-nurse", name: "护理程序", nodeType: "知识点", cluster: "基础理论", description: "评估、诊断、计划、实施、评价五步骤。" },
  { id: "kn-nur-003", professionId: "prof-nurse", name: "护患沟通", nodeType: "知识点", cluster: "基础理论", description: "治疗性沟通的基本技巧。" },
  { id: "kn-nur-004", professionId: "prof-nurse", name: "护理记录规范", nodeType: "知识点", cluster: "基础理论", description: "各类护理记录单的规范书写要求。" },

  // 簇 2 生活与环境
  { id: "kn-nur-005", professionId: "prof-nurse", name: "医院环境管理", nodeType: "知识点", cluster: "生活护理", description: "病区环境的温度、湿度、光线、安全。" },
  { id: "kn-nur-006", professionId: "prof-nurse", name: "卧位与体位转换", nodeType: "知识点", cluster: "生活护理", description: "常见卧位类型及更换技术。" },
  { id: "kn-nur-007", professionId: "prof-nurse", name: "病人生活护理", nodeType: "知识点", cluster: "生活护理", description: "口腔护理、压疮预防、皮肤护理等。" },

  // 簇 3 感染控制
  { id: "kn-nur-008", professionId: "prof-nurse", name: "医院感染与预防", nodeType: "知识点", cluster: "感染控制", description: "医院感染的分类、传播途径和预防策略。" },
  { id: "kn-nur-009", professionId: "prof-nurse", name: "无菌技术基础", nodeType: "知识点", cluster: "感染控制", description: "无菌概念、无菌操作原则与常用技术。" },
  { id: "kn-nur-010", professionId: "prof-nurse", name: "消毒与隔离", nodeType: "知识点", cluster: "感染控制", description: "常用消毒方法及隔离种类。" },

  // 簇 4 生命体征
  { id: "kn-nur-011", professionId: "prof-nurse", name: "体温测量", nodeType: "知识点", cluster: "生命体征", description: "口腔、腋下、直肠体温测量的操作方法。" },
  { id: "kn-nur-012", professionId: "prof-nurse", name: "脉搏与呼吸监测", nodeType: "知识点", cluster: "生命体征", description: "脉搏与呼吸的正常值与异常识别。" },
  { id: "kn-nur-013", professionId: "prof-nurse", name: "血压测量", nodeType: "知识点", cluster: "生命体征", description: "上臂式血压计测量方法与注意事项。" },

  // 簇 5 给药与注射
  { id: "kn-nur-014", professionId: "prof-nurse", name: "药物基础知识", nodeType: "知识点", cluster: "给药注射", description: "药物的分类、储存与「三查八对」。" },
  { id: "kn-nur-015", professionId: "prof-nurse", name: "口服给药", nodeType: "知识点", cluster: "给药注射", description: "口服给药的流程和注意事项。" },
  { id: "kn-nur-016", professionId: "prof-nurse", name: "注射法", nodeType: "知识点", cluster: "给药注射", description: "皮内、皮下、肌内注射的解剖定位与操作。" },
  { id: "kn-nur-017", professionId: "prof-nurse", name: "静脉输液", nodeType: "知识点", cluster: "给药注射", description: "静脉输液的目的、方法、常见故障处理。" },

  // 技能点
  { id: "sk-nur-001", professionId: "prof-nurse", name: "无菌操作技能", nodeType: "技能点", cluster: "技能", description: "熟练执行各类无菌技术操作。" },
  { id: "sk-nur-002", professionId: "prof-nurse", name: "生命体征采集技能", nodeType: "技能点", cluster: "技能", description: "准确采集和记录病人生命体征。" },
  { id: "sk-nur-003", professionId: "prof-nurse", name: "静脉穿刺技能", nodeType: "技能点", cluster: "技能", description: "熟练进行静脉穿刺与输液管理。" },

  // 核心素养
  { id: "core-nur-001", professionId: "prof-nurse", name: "人文关怀意识", nodeType: "核心素养", cluster: "核心素养", description: "以病人为中心的关爱意识和沟通能力。" },
  { id: "core-nur-002", professionId: "prof-nurse", name: "严谨安全意识", nodeType: "核心素养", cluster: "核心素养", description: "严格执行操作规程、确保护理安全的职业素养。" },
];

const nurseEdges: GraphEdge[] = [
  { id: "e-n-001", professionId: "prof-nurse", from: "kn-nur-001", to: "kn-nur-002", relation: "先修" },
  { id: "e-n-002", professionId: "prof-nurse", from: "kn-nur-002", to: "kn-nur-004", relation: "相关" },
  { id: "e-n-003", professionId: "prof-nurse", from: "kn-nur-002", to: "kn-nur-003", relation: "相关" },
  { id: "e-n-004", professionId: "prof-nurse", from: "kn-nur-005", to: "kn-nur-006", relation: "先修" },
  { id: "e-n-005", professionId: "prof-nurse", from: "kn-nur-006", to: "kn-nur-007", relation: "相关" },
  { id: "e-n-006", professionId: "prof-nurse", from: "kn-nur-008", to: "kn-nur-009", relation: "先修" },
  { id: "e-n-007", professionId: "prof-nurse", from: "kn-nur-009", to: "kn-nur-010", relation: "相关" },
  { id: "e-n-008", professionId: "prof-nurse", from: "kn-nur-009", to: "kn-nur-016", relation: "先修" },
  { id: "e-n-009", professionId: "prof-nurse", from: "kn-nur-009", to: "kn-nur-017", relation: "先修" },
  { id: "e-n-010", professionId: "prof-nurse", from: "kn-nur-011", to: "kn-nur-012", relation: "相关" },
  { id: "e-n-011", professionId: "prof-nurse", from: "kn-nur-012", to: "kn-nur-013", relation: "相关" },
  { id: "e-n-012", professionId: "prof-nurse", from: "kn-nur-014", to: "kn-nur-015", relation: "先修" },
  { id: "e-n-013", professionId: "prof-nurse", from: "kn-nur-014", to: "kn-nur-016", relation: "先修" },
  { id: "e-n-014", professionId: "prof-nurse", from: "kn-nur-014", to: "kn-nur-017", relation: "先修" },
  { id: "e-n-015", professionId: "prof-nurse", from: "kn-nur-016", to: "kn-nur-017", relation: "相关" },
  { id: "e-n-016", professionId: "prof-nurse", from: "sk-nur-001", to: "kn-nur-009", relation: "支撑" },
  { id: "e-n-017", professionId: "prof-nurse", from: "sk-nur-001", to: "kn-nur-016", relation: "支撑" },
  { id: "e-n-018", professionId: "prof-nurse", from: "sk-nur-001", to: "kn-nur-017", relation: "支撑" },
  { id: "e-n-019", professionId: "prof-nurse", from: "sk-nur-002", to: "kn-nur-011", relation: "支撑" },
  { id: "e-n-020", professionId: "prof-nurse", from: "sk-nur-002", to: "kn-nur-012", relation: "支撑" },
  { id: "e-n-021", professionId: "prof-nurse", from: "sk-nur-002", to: "kn-nur-013", relation: "支撑" },
  { id: "e-n-022", professionId: "prof-nurse", from: "sk-nur-003", to: "kn-nur-017", relation: "支撑" },
  { id: "e-n-023", professionId: "prof-nurse", from: "core-nur-001", to: "kn-nur-003", relation: "支撑" },
  { id: "e-n-024", professionId: "prof-nurse", from: "core-nur-002", to: "sk-nur-001", relation: "支撑" },
  { id: "e-n-025", professionId: "prof-nurse", from: "core-nur-002", to: "sk-nur-003", relation: "支撑" },
];

// ========================================================================
// 汇总导出
// ========================================================================
export const graphNodes: GraphNode[] = [...mechNodes, ...lawNodes, ...nurseNodes];
export const graphEdges: GraphEdge[] = [...mechEdges, ...lawEdges, ...nurseEdges];

/** 按专业分组，方便前端直接拿 */
export const nodesByProfession: Record<string, GraphNode[]> = {
  "prof-mech": mechNodes,
  "prof-law": lawNodes,
  "prof-nurse": nurseNodes,
  "prof-edu": [], // 未建图谱
};

export const edgesByProfession: Record<string, GraphEdge[]> = {
  "prof-mech": mechEdges,
  "prof-law": lawEdges,
  "prof-nurse": nurseEdges,
  "prof-edu": [],
};

/** 按 ID 查节点 */
export const nodeById: Record<string, GraphNode> = graphNodes.reduce(
  (acc, n) => ({ ...acc, [n.id]: n }),
  {} as Record<string, GraphNode>
);
