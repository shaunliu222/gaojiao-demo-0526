import type { TeachingPlan } from "./types";

/**
 * 教学计划数据（4 个）
 *
 * - plan-main    李建国 · 《机械制图与CAD》for 机制2301+2302（进行中，主故事线）
 * - plan-history 李建国 · 上届《机械制图与CAD》for 机制2201（已完成，用于历史对照）
 * - plan-law     赵文静 · 《民法典总则编》for 法学2301（进行中）
 * - plan-nurse   王丽华 · 《基础护理学》for 护理2301（草稿）
 */
export const teachingPlans: TeachingPlan[] = [
  // ========================================================================
  // 1. 主线教学计划
  // ========================================================================
  {
    id: "plan-main",
    title: "《机械制图与CAD》· 2026春 · 机制2301/2302",
    courseId: "course-mech-draw",
    professionId: "prof-mech",
    subjectId: "subj-mech-drawing",
    creatorTeacherId: "t-li",
    classIds: ["cls-mech-2301", "cls-mech-2302"],
    strategyId: "strat-li-personal",
    strategyBrief:
      "结合 2301（踏实稳健）+ 2302（两极分化）双班学情，前期夯实投影基础，第3章「正投影法与三视图」是本学期重中之重。投影基础阶段放缓 1 周，额外增加每周一次「3 分钟空间想象挑战」；2302 班额外安排 2 次课后答疑。预计全班期末优良率 75%+，薄弱生不及格率控制在 8% 以内。",
    semester: "2026春季",
    startDate: "2026-02-23",
    endDate: "2026-06-19",
    status: "in_progress",
    createdAt: "2026-02-15T10:00:00+08:00",
    updatedAt: "2026-04-16T16:30:00+08:00",
    aiAdvice:
      "基于 2301 班「空间想象 76 / 综合应用 72」和 2302 班「空间想象 58 / 综合应用 55」双班画像，AI 建议：\n1. 第3章「组合体三视图」建议从 2 课时扩展到 3 课时，每课时配 5 题渐进式练习；\n2. 截交线相贯线内容建议单独设立专题课（2026-03-25），配 30 分钟 SolidWorks 三维切割演示；\n3. 2302 班在第4章剖视图讲解前，先做一次投影基础的小型回顾测验；\n4. 主线班级共同作业保留为书面+CAD 双形式，2302 班额外设「朋辈互讲」环节。",
    chapters: [
      {
        id: "ch-1",
        title: "第1章 制图基础",
        summary: "建立国家标准意识，打下规范绘图基础。",
        sections: [
          { id: "sec-1-1", title: "1.1 国家标准与图纸幅面", plannedDate: "2026-02-23", knowledgeNodeIds: ["kn-mech-001", "kn-mech-002", "kn-mech-006"], objectives: ["能说出 GB/T 14689 幅面规格", "完成 A3 图框绘制"], durationMinutes: 90, hasDesign: false },
          { id: "sec-1-2", title: "1.2 字体、图线与尺寸标注基础", plannedDate: "2026-02-25", knowledgeNodeIds: ["kn-mech-003", "kn-mech-004", "kn-mech-005"], objectives: ["能规范书写长仿宋体", "会用九种基本图线", "掌握尺寸标注四要素"], durationMinutes: 90, hasDesign: false },
        ],
      },
      {
        id: "ch-2",
        title: "第2章 几何作图与投影基础",
        summary: "几何作图→投影法→点线面投影，建立空间感。",
        sections: [
          { id: "sec-2-1", title: "2.1 几何作图", plannedDate: "2026-03-02", knowledgeNodeIds: ["kn-mech-007", "kn-mech-008", "kn-mech-009", "kn-mech-010"], objectives: ["掌握六类圆弧连接", "理解平面图形的尺寸与线段分析"], durationMinutes: 90, hasDesign: false },
          { id: "sec-2-2", title: "2.2 投影法与三视图形成", plannedDate: "2026-03-04", knowledgeNodeIds: ["kn-mech-012", "kn-mech-013", "kn-mech-014", "kn-mech-015", "kn-mech-016"], objectives: ["掌握正投影三性质", "理解三视图对应规律"], durationMinutes: 90, hasDesign: false },
          { id: "sec-2-3", title: "2.3 点、线的投影", plannedDate: "2026-03-09", knowledgeNodeIds: ["kn-mech-017", "kn-mech-018", "kn-mech-019", "kn-mech-020"], objectives: ["会画点的三面投影", "能判断两点相对位置"], durationMinutes: 90, hasDesign: false },
          { id: "sec-2-4", title: "2.4 面及相对位置", plannedDate: "2026-03-11", knowledgeNodeIds: ["kn-mech-021", "kn-mech-022", "kn-mech-023"], objectives: ["掌握三类平面的投影特点", "判断直线/平面相对位置"], durationMinutes: 90, hasDesign: false },
        ],
      },
      {
        id: "ch-3",
        title: "第3章 正投影法与三视图【焦点章节】",
        summary: "立体投影 → 组合体 → 截交相贯，是本课最重要章节。",
        sections: [
          { id: "sec-3-1", title: "3.1 平面立体与回转体投影", plannedDate: "2026-03-16", knowledgeNodeIds: ["kn-mech-024", "kn-mech-025", "kn-mech-026", "kn-mech-027"], objectives: ["熟练绘制棱柱棱锥三视图", "掌握圆柱圆锥圆球的投影特征"], durationMinutes: 90, hasDesign: false },
          { id: "sec-3-2", title: "3.2 组合体三视图绘制", plannedDate: "2026-03-18", knowledgeNodeIds: ["kn-mech-030", "kn-mech-031", "kn-mech-034", "sk-mech-001", "core-mech-002"], objectives: ["掌握形体分析法", "完整绘制中等难度组合体三视图", "养成检查意识"], durationMinutes: 135, hasDesign: true },
          { id: "sec-3-3", title: "3.3 组合体尺寸标注与读图", plannedDate: "2026-03-23", knowledgeNodeIds: ["kn-mech-032", "kn-mech-033"], objectives: ["完整标注三类尺寸", "能从三视图还原形体"], durationMinutes: 90, hasDesign: false },
          { id: "sec-3-4", title: "3.4 截交线与相贯线专题", plannedDate: "2026-03-25", knowledgeNodeIds: ["kn-mech-028", "kn-mech-029"], objectives: ["掌握截交线求法", "识别相贯线特殊情况"], durationMinutes: 135, hasDesign: false },
        ],
      },
      {
        id: "ch-4",
        title: "第4章 机件表达方法",
        summary: "基本视图、向视图、局部视图、斜视图、剖视图、断面图。",
        sections: [
          { id: "sec-4-1", title: "4.1 基本视图与向视图", plannedDate: "2026-03-30", knowledgeNodeIds: ["kn-mech-035", "kn-mech-036"], objectives: ["掌握六个基本视图与向视图布置"], durationMinutes: 90, hasDesign: false },
          { id: "sec-4-2", title: "4.2 局部视图与斜视图", plannedDate: "2026-04-01", knowledgeNodeIds: ["kn-mech-037", "kn-mech-038"], objectives: ["正确使用局部视图表达局部结构"], durationMinutes: 90, hasDesign: false },
          { id: "sec-4-3", title: "4.3 剖视图", plannedDate: "2026-04-06", knowledgeNodeIds: ["kn-mech-039"], objectives: ["掌握全剖、半剖、局部剖画法", "规范使用剖切符号"], durationMinutes: 135, hasDesign: false },
          { id: "sec-4-4", title: "4.4 断面图与局部放大图", plannedDate: "2026-04-08", knowledgeNodeIds: ["kn-mech-040", "kn-mech-041"], objectives: ["能区分断面与剖视", "合理使用局部放大图"], durationMinutes: 90, hasDesign: false },
        ],
      },
      {
        id: "ch-5",
        title: "第5章 标准件与常用件",
        summary: "螺纹、紧固件、键、销、齿轮的规定画法。",
        sections: [
          { id: "sec-5-1", title: "5.1 螺纹基础与画法", plannedDate: "2026-04-13", knowledgeNodeIds: ["kn-mech-042", "kn-mech-043"], objectives: ["熟悉螺纹要素", "正确绘制内外螺纹连接"], durationMinutes: 90, hasDesign: false },
          { id: "sec-5-2", title: "5.2 螺纹紧固件表达", plannedDate: "2026-04-15", knowledgeNodeIds: ["kn-mech-044"], objectives: ["按规定画法绘制螺栓/螺柱/螺钉连接"], durationMinutes: 90, hasDesign: false },
          { id: "sec-5-3", title: "5.3 键、销、齿轮表达", plannedDate: "2026-04-20", knowledgeNodeIds: ["kn-mech-045", "kn-mech-046", "kn-mech-047"], objectives: ["掌握键销连接、单齿轮与啮合画法"], durationMinutes: 90, hasDesign: false },
        ],
      },
      {
        id: "ch-6",
        title: "第6章 零件图与装配图",
        summary: "工程图全流程训练。",
        sections: [
          { id: "sec-6-1", title: "6.1 零件图综合", plannedDate: "2026-04-22", knowledgeNodeIds: ["kn-mech-048", "kn-mech-049", "kn-mech-050", "kn-mech-051"], objectives: ["完整绘制中等难度零件图", "规范标注公差粗糙度"], durationMinutes: 135, hasDesign: false },
          { id: "sec-6-2", title: "6.2 装配图识读与绘制", plannedDate: "2026-04-27", knowledgeNodeIds: ["kn-mech-052", "kn-mech-053"], objectives: ["识读常见装配图", "绘制简单装配体装配图"], durationMinutes: 135, hasDesign: false },
        ],
      },
      {
        id: "ch-7",
        title: "第7章 AutoCAD 与三维建模",
        summary: "从手工图到数字化制图的跨越。",
        sections: [
          { id: "sec-7-1", title: "7.1 AutoCAD 综合应用", plannedDate: "2026-04-29", knowledgeNodeIds: ["kn-mech-054", "kn-mech-055", "kn-mech-056", "kn-mech-057"], objectives: ["按国标在 AutoCAD 中完成零件图"], durationMinutes: 135, hasDesign: false },
          { id: "sec-7-2", title: "7.2 SolidWorks 三维建模入门", plannedDate: "2026-05-04", knowledgeNodeIds: ["kn-mech-058", "kn-mech-059", "kn-mech-060"], objectives: ["掌握草图与基本建模特征", "输出二维工程图"], durationMinutes: 135, hasDesign: false },
        ],
      },
    ],
  },

  // ========================================================================
  // 2. 历史教学计划（2022 级上届班级，已完成）
  // ========================================================================
  {
    id: "plan-history",
    title: "《机械制图与CAD》· 2025春 · 机制2201",
    courseId: "course-mech-draw",
    professionId: "prof-mech",
    subjectId: "subj-mech-drawing",
    creatorTeacherId: "t-li",
    classIds: ["cls-mech-2201"],
    strategyId: "strat-preset-balanced",
    strategyBrief:
      "2201 班基础整体较好，使用均衡推进策略即可，重点放在零件图装配图综合阶段，课后增加 SolidWorks 建模拓展。",
    semester: "2025春季",
    startDate: "2025-02-24",
    endDate: "2025-06-20",
    status: "completed",
    createdAt: "2025-02-10T10:00:00+08:00",
    updatedAt: "2025-06-25T17:00:00+08:00",
    aiAdvice:
      "2201 班学情优秀，AI 建议沿用均衡策略。特别可在第7章 SolidWorks 中多加 2 课时创新设计挑战。",
    chapters: [
      {
        id: "ch-h-1",
        title: "第1章 制图基础",
        sections: [
          { id: "sec-h-1-1", title: "1.1 国家标准与图纸幅面", plannedDate: "2025-02-24", knowledgeNodeIds: ["kn-mech-001", "kn-mech-006"], objectives: [], durationMinutes: 90, hasDesign: false },
        ],
      },
      {
        id: "ch-h-3",
        title: "第3章 正投影法与三视图",
        sections: [
          { id: "sec-h-3-2", title: "3.2 组合体三视图绘制", plannedDate: "2025-03-19", knowledgeNodeIds: ["kn-mech-030", "kn-mech-031", "kn-mech-034"], objectives: [], durationMinutes: 135, hasDesign: false },
        ],
      },
      // 历史计划不完整罗列，仅保留几个节点用于列表/详情页演示
    ],
  },

  // ========================================================================
  // 3. 法学教学计划（进行中）
  // ========================================================================
  {
    id: "plan-law",
    title: "《民法典总则编》· 2026春 · 法学2301",
    courseId: "course-law-civil",
    professionId: "prof-law",
    subjectId: "subj-law-civil",
    creatorTeacherId: "t-zhao",
    classIds: ["cls-law-2301"],
    strategyId: "strat-preset-balanced",
    strategyBrief:
      "面向法学 2301（讨论活跃型），以案例教学为主线，每章配 1-2 个指导性案例，并穿插模拟法庭与法律文书写作实训。",
    semester: "2026春季",
    startDate: "2026-02-24",
    endDate: "2026-06-16",
    status: "in_progress",
    createdAt: "2026-02-14T14:00:00+08:00",
    updatedAt: "2026-04-14T16:00:00+08:00",
    aiAdvice:
      "法学 2301 班课堂表达 82 分，建议增加案例辩论环节；诉讼时效部分易混淆，单独设置 3 次辨析训练。",
    chapters: [
      {
        id: "ch-law-1",
        title: "第1章 民法基础",
        sections: [
          { id: "sec-law-1-1", title: "1.1 民法的概念与调整对象", plannedDate: "2026-02-24", knowledgeNodeIds: ["kn-law-001"], objectives: ["理解民法的调整对象与地位"], durationMinutes: 90, hasDesign: false },
          { id: "sec-law-1-2", title: "1.2 民法基本原则", plannedDate: "2026-02-26", knowledgeNodeIds: ["kn-law-002", "kn-law-023"], objectives: ["掌握七项基本原则及适用"], durationMinutes: 90, hasDesign: false },
          { id: "sec-law-1-3", title: "1.3 民事法律关系与事实", plannedDate: "2026-03-03", knowledgeNodeIds: ["kn-law-003", "kn-law-004"], objectives: ["识别民事法律关系三要素", "区分行为事实与事件事实"], durationMinutes: 90, hasDesign: false },
        ],
      },
      {
        id: "ch-law-2",
        title: "第2章 民事主体",
        sections: [
          { id: "sec-law-2-1", title: "2.1 自然人民事主体", plannedDate: "2026-03-10", knowledgeNodeIds: ["kn-law-007", "kn-law-008"], objectives: ["掌握权利能力起止"], durationMinutes: 90, hasDesign: false },
          { id: "sec-law-2-2", title: "2.2 民事行为能力与监护", plannedDate: "2026-03-12", knowledgeNodeIds: ["kn-law-009", "kn-law-011"], objectives: ["区分三类行为能力", "理解监护制度"], durationMinutes: 90, hasDesign: false },
        ],
      },
      {
        id: "ch-law-3",
        title: "第3章 法律行为与代理",
        sections: [
          { id: "sec-law-3-1", title: "3.1 民事法律行为与意思表示", plannedDate: "2026-03-17", knowledgeNodeIds: ["kn-law-012", "kn-law-013"], objectives: ["构成要件与效力认定"], durationMinutes: 90, hasDesign: false },
          { id: "sec-law-3-2", title: "3.2 法律行为效力四态", plannedDate: "2026-03-19", knowledgeNodeIds: ["kn-law-014"], objectives: ["区分有效/无效/可撤销/效力待定"], durationMinutes: 90, hasDesign: false },
          { id: "sec-law-3-3", title: "3.3 代理制度", plannedDate: "2026-03-24", knowledgeNodeIds: ["kn-law-015"], objectives: ["区分 4 类代理并配合案例分析"], durationMinutes: 90, hasDesign: false },
        ],
      },
    ],
  },

  // ========================================================================
  // 4. 护理教学计划（草稿）
  // ========================================================================
  {
    id: "plan-nurse",
    title: "《基础护理学》· 2026春 · 护理2301（草稿）",
    courseId: "course-nurse-basic",
    professionId: "prof-nurse",
    subjectId: "subj-nurse-basic",
    creatorTeacherId: "t-wanglh",
    classIds: ["cls-nurse-2301"],
    strategyId: "strat-preset-balanced",
    strategyBrief: "草稿版本。后续计划强化情景模拟实训并增加夜班值班场景。",
    semester: "2026春季",
    startDate: "2026-03-02",
    endDate: "2026-06-19",
    status: "draft",
    createdAt: "2026-02-18T11:00:00+08:00",
    updatedAt: "2026-02-20T10:00:00+08:00",
    aiAdvice:
      "护理 2301 班临床思维 70 分为全维度最低，建议在草稿完成前增加 4 次情景化实训、3 次病例讨论课。",
    chapters: [
      {
        id: "ch-nur-1",
        title: "第1章 护理基础理论",
        sections: [
          { id: "sec-nur-1-1", title: "1.1 护理学发展史与护理程序", plannedDate: "2026-03-02", knowledgeNodeIds: ["kn-nur-001", "kn-nur-002"], objectives: ["了解护理学发展", "理解护理程序五步骤"], durationMinutes: 90, hasDesign: false },
        ],
      },
    ],
  },
];
