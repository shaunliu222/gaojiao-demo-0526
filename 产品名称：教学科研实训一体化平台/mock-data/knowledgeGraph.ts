import type { GraphNode, GraphEdge } from "./types";

/**
 * 知识图谱数据
 *
 * - 机械工程：80 个节点（67 知识点 + 8 技能点 + 5 核心素养），边含制造工艺/金工与工业机器人扩展，11+2 个主题簇
 *
 * 节点 ID 命名：
 *   kn-mech-NNN   知识点
 *   sk-mech-NNN   技能点
 *   core-mech-NNN 核心素养
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
  { id: "kn-mech-031", professionId: "prof-mech", name: "组合体三视图绘制", nodeType: "知识点", cluster: "组合体", description: "分解形体、逐部分绘制三视图、检查线型与过渡线。" },
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

  // ============ 簇 11：制造工艺 / 金工实习（2）============
  { id: "kn-mech-061", professionId: "prof-mech", name: "普通车削加工基础", nodeType: "知识点", cluster: "制造工艺", description: "车床基本操作、外圆与端面试切，与零件图尺寸、工艺意识衔接。" },
  { id: "kn-mech-062", professionId: "prof-mech", name: "铣削加工入门", nodeType: "知识点", cluster: "制造工艺", description: "铣床工作台、对刀与平面铣削入门，建立加工基准概念。" },

  // ============ 簇 12：工业机器人（2）============
  { id: "kn-mech-063", professionId: "prof-mech", name: "工业机器人工作站与安全", nodeType: "知识点", cluster: "工业机器人", description: "工作站组成、安全互锁、急停与防护围栏等入门要求。" },
  { id: "kn-mech-064", professionId: "prof-mech", name: "示教编程与搬运应用入门", nodeType: "知识点", cluster: "工业机器人", description: "坐标系与点位、示教轨迹与典型搬运节拍入门。" },

  // ============ 簇 13：工程智能与 AI（3）============
  { id: "kn-mech-065", professionId: "prof-mech", name: "生成式AI与机械学科应用边界", nodeType: "知识点", cluster: "工程智能与AI", description: "大语言模型、文生图等工具在制图、设计、工艺文档中的适用场景、局限与学术诚信要求。" },
  { id: "kn-mech-066", professionId: "prof-mech", name: "AI辅助技术文档与课程报告", nodeType: "知识点", cluster: "工程智能与AI", description: "用对话式AI整理读图笔记、实验步骤、术语校对及引用标注，输出符合课程模板的书面材料。" },
  { id: "kn-mech-067", professionId: "prof-mech", name: "AI概念草图与方案发散", nodeType: "知识点", cluster: "工程智能与AI", description: "结合文生图或草图辅助工具进行方案发散，并与 CAD 线框或徒手草图对照迭代。" },

  // ============ 技能点（8）============
  { id: "sk-mech-001", professionId: "prof-mech", name: "手工绘图技能", nodeType: "技能点", cluster: "技能", description: "使用绘图工具或徒手绘制机械图的操作技能。" },
  { id: "sk-mech-002", professionId: "prof-mech", name: "AutoCAD 二维绘图技能", nodeType: "技能点", cluster: "技能", description: "熟练使用 AutoCAD 绘制二维机械工程图。" },
  { id: "sk-mech-003", professionId: "prof-mech", name: "SolidWorks 三维建模技能", nodeType: "技能点", cluster: "技能", description: "使用 SolidWorks 完成零件、装配体建模和工程图输出。" },
  { id: "sk-mech-004", professionId: "prof-mech", name: "零件测绘技能", nodeType: "技能点", cluster: "技能", description: "对实物零件进行测绘并绘制草图和零件图的综合能力。" },
  { id: "sk-mech-005", professionId: "prof-mech", name: "工程图阅读技能", nodeType: "技能点", cluster: "技能", description: "正确识读零件图和装配图的能力。" },
  { id: "sk-mech-006", professionId: "prof-mech", name: "公差标注与选用技能", nodeType: "技能点", cluster: "技能", description: "根据使用要求合理选择并标注尺寸公差、形位公差与表面粗糙度。" },
  { id: "sk-mech-007", professionId: "prof-mech", name: "机械工程规范检查技能", nodeType: "技能点", cluster: "技能", description: "对照国家标准检查图纸合规性的能力。" },
  { id: "sk-mech-008", professionId: "prof-mech", name: "生成式AI辅助学习任务技能", nodeType: "技能点", cluster: "技能", description: "在教师要求下选用合适 AI 工具、撰写提示词、核验工程事实并完成课程作业交付的能力。" },

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

  // ---- 制造工艺 / 金工：与读图、测绘、规范衔接 ----
  { id: "e-m-150", professionId: "prof-mech", from: "kn-mech-048", to: "kn-mech-061", relation: "相关" },
  { id: "e-m-151", professionId: "prof-mech", from: "sk-mech-004", to: "kn-mech-061", relation: "支撑" },
  { id: "e-m-152", professionId: "prof-mech", from: "sk-mech-005", to: "kn-mech-061", relation: "支撑" },
  { id: "e-m-153", professionId: "prof-mech", from: "core-mech-003", to: "kn-mech-061", relation: "支撑" },
  { id: "e-m-154", professionId: "prof-mech", from: "kn-mech-061", to: "kn-mech-062", relation: "先修" },
  { id: "e-m-155", professionId: "prof-mech", from: "kn-mech-050", to: "kn-mech-062", relation: "相关" },
  { id: "e-m-156", professionId: "prof-mech", from: "sk-mech-006", to: "kn-mech-062", relation: "支撑" },

  // ---- 工业机器人：与三维建模、装配图、规范意识衔接 ----
  { id: "e-m-160", professionId: "prof-mech", from: "kn-mech-058", to: "kn-mech-063", relation: "先修" },
  { id: "e-m-161", professionId: "prof-mech", from: "kn-mech-052", to: "kn-mech-063", relation: "相关" },
  { id: "e-m-162", professionId: "prof-mech", from: "core-mech-003", to: "kn-mech-063", relation: "支撑" },
  { id: "e-m-163", professionId: "prof-mech", from: "kn-mech-063", to: "kn-mech-064", relation: "先修" },
  { id: "e-m-164", professionId: "prof-mech", from: "kn-mech-059", to: "kn-mech-064", relation: "支撑" },
  { id: "e-m-165", professionId: "prof-mech", from: "kn-mech-060", to: "kn-mech-064", relation: "相关" },
  { id: "e-m-166", professionId: "prof-mech", from: "core-mech-004", to: "kn-mech-064", relation: "支撑" },

  // ---- 工程智能与 AI：与 CAD、读图、创新素养衔接 ----
  { id: "e-m-180", professionId: "prof-mech", from: "kn-mech-048", to: "kn-mech-065", relation: "相关" },
  { id: "e-m-181", professionId: "prof-mech", from: "kn-mech-058", to: "kn-mech-065", relation: "相关" },
  { id: "e-m-182", professionId: "prof-mech", from: "kn-mech-065", to: "kn-mech-066", relation: "先修" },
  { id: "e-m-183", professionId: "prof-mech", from: "kn-mech-065", to: "kn-mech-067", relation: "先修" },
  { id: "e-m-184", professionId: "prof-mech", from: "kn-mech-066", to: "kn-mech-067", relation: "相关" },
  { id: "e-m-185", professionId: "prof-mech", from: "kn-mech-054", to: "kn-mech-067", relation: "相关" },
  { id: "e-m-186", professionId: "prof-mech", from: "sk-mech-008", to: "kn-mech-065", relation: "支撑" },
  { id: "e-m-187", professionId: "prof-mech", from: "sk-mech-008", to: "kn-mech-066", relation: "支撑" },
  { id: "e-m-188", professionId: "prof-mech", from: "sk-mech-008", to: "kn-mech-067", relation: "支撑" },
  { id: "e-m-189", professionId: "prof-mech", from: "core-mech-004", to: "kn-mech-065", relation: "支撑" },
  { id: "e-m-190", professionId: "prof-mech", from: "core-mech-003", to: "kn-mech-066", relation: "支撑" },
  { id: "e-m-191", professionId: "prof-mech", from: "core-mech-005", to: "kn-mech-067", relation: "支撑" },

  // ---- 导论叙事：工程素养 → 制图入口（供教学计划路径子图连通） ----
  { id: "e-m-170", professionId: "prof-mech", from: "core-mech-001", to: "kn-mech-001", relation: "支撑" },
  { id: "e-m-171", professionId: "prof-mech", from: "core-mech-001", to: "kn-mech-012", relation: "相关" },
  { id: "e-m-172", professionId: "prof-mech", from: "core-mech-003", to: "kn-mech-015", relation: "支撑" },
];

// ========================================================================
// 汇总导出
// ========================================================================
export const graphNodes: GraphNode[] = [...mechNodes];
export const graphEdges: GraphEdge[] = [...mechEdges];

/** 按专业分组，方便前端直接拿 */
export const nodesByProfession: Record<string, GraphNode[]> = {
  "prof-mech": mechNodes,
};

export const edgesByProfession: Record<string, GraphEdge[]> = {
  "prof-mech": mechEdges,
};

/** 按 ID 查节点 */
export const nodeById: Record<string, GraphNode> = graphNodes.reduce(
  (acc, n) => ({ ...acc, [n.id]: n }),
  {} as Record<string, GraphNode>
);
