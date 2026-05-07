import type { TeachingPlan } from "./types";

/**
 * 教学计划数据（6 个）
 *
 * - plan-main          李建国 · 《机械制图与CAD》机制2301+2302（主故事线）
 * - plan-history       李建国 · 上届制图 · 机制2201
 * - plan-mech-intro    孙小艳 · 《机械工程专业导论》机制2401
 * - plan-mech-tolerance 王丽华 · 《互换性与技术测量》机制2101
 * - plan-mech-robotics  赵文静 · 《工业机器人技术应用基础》机制2303
 * - plan-wang-metalwork 王海峰 · 《金工实习》机制2301+2302（与制图课并行）
 */
/** 王海峰账号演示用教学计划（新建向导提交后跳转目标） */
export const PLAN_WANG_HAIFENG_MOCK_ID = "plan-wang-metalwork";

export const teachingPlans: TeachingPlan[] = [
  // ========================================================================
  // 1. 主线教学计划
  // ========================================================================
  {
    id: "plan-main",
    title: "《机械制图与CAD》· 2026春 · 机制2301/2302/2303",
    courseId: "course-mech-draw",
    professionId: "prof-mech",
    subjectId: "subj-mech-drawing",
    creatorTeacherId: "t-li",
    classIds: ["cls-mech-2301", "cls-mech-2302", "cls-mech-2303"],
    strategyId: "strat-li-personal",
    /** 派生自 L2 标准课程计划 */
    derivedFromL2PlanId: "l2-plan-mech-draw",
    /**
     * 相对于标准计划的学情微调：
     * 3.2 节延长为 135→180 分钟，原因：2302 班空间想象薄弱，增加朋辈互讲环节
     * 7.2 节目标新增 AI 协作探究，原因：2303 班与机器人课联动，拓展 AI 工具意识
     */
    overrides: [
      {
        sectionId: "sec-3-2",
        field: "durationMinutes",
        value: 180,
        reason: "2302 班空间想象弱，增加组合体朋辈互讲环节，需额外 45 分钟",
      },
      {
        sectionId: "sec-7-2",
        field: "objectives",
        value: [
          "完成特征—装配—工程图链路",
          "探索 AI 辅助 CAD 脚本生成（2303 班联动拓展）",
        ],
        reason: "2303 班与工业机器人课程联动，补充 AI 协作探究目标",
      },
    ],
    strategyBrief:
      "结合 2301（踏实稳健）+ 2302（两极分化）+ 2303（理工动手、与机器人课联动）三班学情，前期夯实投影基础；当前重心已进入第 3 章组合体单元（下一堂主攻 3.2）。投影基础阶段曾放缓约 1 周并保留每周「3 分钟空间想象挑战」；2302 班额外安排课后答疑与分层补救，2303 班每周嵌入手绘与数模对照。预计平行班期末优良率 75%+，薄弱生不及格率控制在 8% 以内。",
    semester: "2026春季",
    startDate: "2026-02-23",
    endDate: "2026-06-19",
    status: "in_progress",
    createdAt: "2026-02-15T10:00:00+08:00",
    updatedAt: "2026-04-16T16:30:00+08:00",
    aiAdvice:
      "基于 2301 班「空间想象 76 / 综合应用 72」和 2302 班「空间想象 58 / 综合应用 55」双班画像，AI 建议：\n1. 当前周聚焦 **3.2 组合体三视图**：可从 2 课时扩展到 3 课时，每课时配 5 题渐进式练习；2302 班在开场嵌入短时投影口诀回放。\n2. 截交线相贯线内容建议单独设立专题课（2026-03-25），配 30 分钟 SolidWorks 三维切割演示；\n3. 2302 班在第4章剖视图讲解前，先做一次投影基础的小型回顾测验；\n4. 主线班级共同作业保留为书面+CAD 双形式，2302 班额外设「朋辈互讲」环节。",
    chapters: [
      {
        id: "ch-1",
        title: "第1章 制图基础",
        summary: "建立国家标准意识，打下规范绘图基础。",
        sections: [
          { id: "sec-1-1", title: "1.1 国家标准与图纸幅面", plannedDate: "2026-02-23", knowledgeNodeIds: ["kn-mech-001"], objectives: ["能说出 GB/T 14689 幅面规格", "完成 A3 图框绘制"], durationMinutes: 90, hasDesign: false },
          { id: "sec-1-2", title: "1.2 字体、图线与尺寸标注基础", plannedDate: "2026-02-25", knowledgeNodeIds: ["kn-mech-001"], objectives: ["能规范书写长仿宋体", "会用九种基本图线", "掌握尺寸标注四要素"], durationMinutes: 90, hasDesign: false },
        ],
      },
      {
        id: "ch-2",
        title: "第2章 几何作图与投影基础",
        summary: "几何作图→投影法→点线面投影，建立空间感。",
        sections: [
          { id: "sec-2-1", title: "2.1 几何作图", plannedDate: "2026-03-02", knowledgeNodeIds: ["kn-mech-002"], objectives: ["掌握基本几何构图与徒手比例"], durationMinutes: 90, hasDesign: false },
          { id: "sec-2-2", title: "2.2 投影法与三视图形成", plannedDate: "2026-03-04", knowledgeNodeIds: ["kn-mech-003"], objectives: ["掌握正投影要点", "理解三视图对应规律"], durationMinutes: 90, hasDesign: false },
          { id: "sec-2-3", title: "2.3 线面分析与空间连线", plannedDate: "2026-03-09", knowledgeNodeIds: ["kn-mech-004"], objectives: ["能在简单模型上推演线面约束"], durationMinutes: 90, hasDesign: false },
          { id: "sec-2-4", title: "2.4 面及相对位置", plannedDate: "2026-03-11", knowledgeNodeIds: ["kn-mech-004"], objectives: ["能判断线与面、平面的投影关系类别"], durationMinutes: 90, hasDesign: false },
        ],
      },
      {
        id: "ch-3",
        title: "第3章 正投影法与三视图",
        summary: "立体投影 → 组合体 → 截交相贯，是本课最重要章节。",
        sections: [
          { id: "sec-3-1", title: "3.1 立体与回转体投影", plannedDate: "2026-03-16", knowledgeNodeIds: ["kn-mech-004", "kn-mech-005"], objectives: ["能完成常见回转体三视图草稿"], durationMinutes: 90, hasDesign: false },
          { id: "sec-3-2", title: "3.2 组合体三视图绘制", plannedDate: "2026-03-18", knowledgeNodeIds: ["core-mech-002", "sk-mech-009", "sk-mech-010", "kn-mech-005", "course-mech-draw", "train-m-002"], subgraphEdgeIds: [], objectives: ["掌握形体分析法", "完整绘制中等难度组合体三视图", "养成检查意识"], durationMinutes: 135, hasDesign: true },
          { id: "sec-3-3", title: "3.3 尺寸标注与读图", plannedDate: "2026-03-23", knowledgeNodeIds: ["kn-mech-005", "kn-mech-009"], objectives: ["能完成定形定位总体尺寸策略", "能从三视图回到形体语义"], durationMinutes: 90, hasDesign: false },
          { id: "sec-3-4", title: "3.4 截交线与相贯线专题", plannedDate: "2026-03-25", knowledgeNodeIds: ["kn-mech-006"], objectives: ["能识别常见工况并作出草图推演"], durationMinutes: 135, hasDesign: false },
        ],
      },
      {
        id: "ch-4",
        title: "第4章 机件表达方法",
        summary: "基本视图、向视图、局部视图、斜视图、剖视图、断面图。",
        sections: [
          { id: "sec-4-1", title: "4.1 机件表达的视图选型", plannedDate: "2026-03-30", knowledgeNodeIds: ["kn-mech-007"], objectives: ["能对常用表达策略做选型说明"], durationMinutes: 90, hasDesign: false },
          { id: "sec-4-2", title: "4.2 局部与倾斜表达要点", plannedDate: "2026-04-01", knowledgeNodeIds: ["kn-mech-007"], objectives: ["能判断何时用局部视图、斜视图"], durationMinutes: 90, hasDesign: false },
          { id: "sec-4-3", title: "4.3 剖切与断面", plannedDate: "2026-04-06", knowledgeNodeIds: ["kn-mech-007"], objectives: ["掌握典型剖切面选择思路"], durationMinutes: 135, hasDesign: false },
          { id: "sec-4-4", title: "4.4 局部放大与其它表达要点", plannedDate: "2026-04-08", knowledgeNodeIds: ["kn-mech-007"], objectives: ["能组合多种表达降低成本"], durationMinutes: 90, hasDesign: false },
        ],
      },
      {
        id: "ch-5",
        title: "第5章 标准件与常用件",
        summary: "螺纹、紧固件、键、销、齿轮的规定画法。",
        sections: [
          { id: "sec-5-1", title: "5.1 螺纹紧固件综述", plannedDate: "2026-04-13", knowledgeNodeIds: ["kn-mech-008"], objectives: ["能说明螺纹紧固件选型思路"], durationMinutes: 90, hasDesign: false },
          { id: "sec-5-2", title: "5.2 连接件表达实操", plannedDate: "2026-04-15", knowledgeNodeIds: ["kn-mech-008"], objectives: ["能完成典型螺纹连接制图"], durationMinutes: 90, hasDesign: false },
          { id: "sec-5-3", title: "5.3 键销与齿轮简述", plannedDate: "2026-04-20", knowledgeNodeIds: ["kn-mech-008"], objectives: ["能完成齿轮与传动件占位表达"], durationMinutes: 90, hasDesign: false },
        ],
      },
      {
        id: "ch-6",
        title: "第6章 零件图与装配图",
        summary: "工程图全流程训练。",
        sections: [
          { id: "sec-6-1", title: "6.1 零件图综合", plannedDate: "2026-04-22", knowledgeNodeIds: ["kn-mech-009", "kn-mech-008"], objectives: ["能整合尺寸公差与表面质量条目"], durationMinutes: 135, hasDesign: false },
          { id: "sec-6-2", title: "6.2 装配图识读与绘制", plannedDate: "2026-04-27", knowledgeNodeIds: ["kn-mech-010"], objectives: ["能拆图并解释装配语义"], durationMinutes: 135, hasDesign: false },
        ],
      },
      {
        id: "ch-7",
        title: "第7章 AutoCAD 与三维建模",
        summary: "从手工图到数字化制图的跨越。",
        sections: [
          { id: "sec-7-1", title: "7.1 AutoCAD 综合应用", plannedDate: "2026-04-29", knowledgeNodeIds: ["sk-mech-002", "kn-mech-011", "course-mech-draw", "train-m-003"], objectives: ["完成二维全流程出图"], durationMinutes: 135, hasDesign: false },
          { id: "sec-7-2", title: "7.2 SolidWorks 三维建模入门", plannedDate: "2026-05-04", knowledgeNodeIds: ["sk-mech-003", "kn-mech-012", "course-mech-draw", "train-m-004"], objectives: ["完成特征—装配—工程图链路"], durationMinutes: 135, hasDesign: false },
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
          { id: "sec-h-1-1", title: "1.1 国家标准与图纸幅面", plannedDate: "2025-02-24", knowledgeNodeIds: ["kn-mech-001"], objectives: [], durationMinutes: 90, hasDesign: false },
        ],
      },
      {
        id: "ch-h-3",
        title: "第3章 正投影法与三视图",
        sections: [
          { id: "sec-h-3-2", title: "3.2 组合体三视图绘制", plannedDate: "2025-03-19", knowledgeNodeIds: ["kn-mech-005"], objectives: [], durationMinutes: 135, hasDesign: false },
        ],
      },
      // 历史计划不完整罗列，仅保留几个节点用于列表/详情页演示
    ],
  },

  // ========================================================================
  // 3. 大一 · 专业导论（进行中）
  // ========================================================================
  {
    id: "plan-mech-intro",
    title: "《机械工程专业导论》· 2026春 · 机制2401",
    courseId: "course-mech-intro",
    professionId: "prof-mech",
    subjectId: "subj-mech-intro",
    creatorTeacherId: "t-sun",
    classIds: ["cls-mech-2401"],
    strategyId: "strat-preset-balanced",
    strategyBrief:
      "以「产业地图 + 能力树」双主线组织：先建立机械工程在产业链中的位置，再映射到制图、设计、制造、测控等后续课程。",
    semester: "2026春季",
    startDate: "2026-02-24",
    endDate: "2026-06-12",
    status: "in_progress",
    createdAt: "2026-02-14T14:00:00+08:00",
    updatedAt: "2026-04-14T16:00:00+08:00",
    aiAdvice:
      "2401 班探究兴趣维度得分高，建议在导论课每次结尾布置 5 分钟「车间观察笔记」打卡，与暑期工程图学预习衔接。",
    chapters: [
      {
        id: "ch-intro-1",
        title: "第1章 专业与产业链认知",
        sections: [
          { id: "sec-intro-1-1", title: "1.1 机械工程在制造强国中的角色", plannedDate: "2026-02-24", knowledgeNodeIds: ["core-mech-001"], objectives: ["能描述本专业典型就业面向"], durationMinutes: 90, hasDesign: false },
          { id: "sec-intro-1-2", title: "1.2 培养方案与课程地图", plannedDate: "2026-02-26", knowledgeNodeIds: ["kn-mech-018", "kn-mech-003"], objectives: ["理解先修关系与能力递进"], durationMinutes: 90, hasDesign: false },
        ],
      },
      {
        id: "ch-intro-2",
        title: "第2章 工程表达入门",
        sections: [
          { id: "sec-intro-2-1", title: "2.1 图纸如何描述真实零件", plannedDate: "2026-03-03", knowledgeNodeIds: ["kn-mech-002", "kn-mech-003", "kn-mech-004"], objectives: ["认识图线、字体与比例"], durationMinutes: 90, hasDesign: false },
        ],
      },
    ],
  },

  // ========================================================================
  // 4. 大四 · 互换性与技术测量（进行中）
  // ========================================================================
  {
    id: "plan-mech-tolerance",
    title: "《互换性与技术测量》· 2026春 · 机制2101",
    courseId: "course-mech-tolerance",
    professionId: "prof-mech",
    subjectId: "subj-mech-tolerance",
    creatorTeacherId: "t-wanglh",
    classIds: ["cls-mech-2101"],
    strategyId: "strat-preset-balanced",
    derivedFromL2PlanId: "l2-plan-mech-tolerance",
    strategyBrief:
      "对接毕业设计：以「零件图 → 公差链 → 检测方案 → 工艺反馈」闭环组织教学，每周 1 次测量实验课。",
    semester: "2026春季",
    startDate: "2026-02-24",
    endDate: "2026-06-16",
    status: "in_progress",
    createdAt: "2026-02-14T14:00:00+08:00",
    updatedAt: "2026-04-14T16:00:00+08:00",
    aiAdvice:
      "2101 班图纸判读强、工艺经济性弱，建议增加 2 次企业工艺工程师线上访谈，强化节拍与成本意识。",
    chapters: [
      {
        id: "ch-tol-1",
        title: "第1章 极限与配合基础",
        sections: [
          { id: "sec-tol-1-1", title: "1.1 互换性概念与标准体系", plannedDate: "2026-02-24", knowledgeNodeIds: ["kn-mech-009", "kn-mech-015"], objectives: ["理解互换性与标准化的关系"], durationMinutes: 90, hasDesign: false },
          { id: "sec-tol-1-2", title: "1.2 尺寸公差与配合选用", plannedDate: "2026-02-26", knowledgeNodeIds: ["kn-mech-009", "sk-mech-006"], objectives: ["能按工况选用配合代号"], durationMinutes: 90, hasDesign: false },
        ],
      },
      {
        id: "ch-tol-2",
        title: "第2章 形位公差与检测",
        sections: [
          { id: "sec-tol-2-1", title: "2.1 形位公差标注", plannedDate: "2026-03-10", knowledgeNodeIds: ["kn-mech-009"], objectives: ["正确标注基准体系"], durationMinutes: 90, hasDesign: false },
          { id: "sec-tol-2-2", title: "2.2 粗糙度与检测方案", plannedDate: "2026-03-12", knowledgeNodeIds: ["kn-mech-009", "kn-mech-015"], objectives: ["编制简易检测路线"], durationMinutes: 90, hasDesign: false },
        ],
      },
    ],
  },

  // ========================================================================
  // 5. 大二 · 金工实习（王海峰 · 机制2302）
  // ========================================================================
  {
    id: "plan-wang-metalwork",
    title: "《金工实习》· 2026春 · 机制2301/2302",
    courseId: "course-mech-practice",
    professionId: "prof-mech",
    subjectId: "subj-mech-manu",
    creatorTeacherId: "t-wang",
    classIds: ["cls-mech-2301", "cls-mech-2302"],
    strategyId: "strat-preset-balanced",
    derivedFromL2PlanId: "l2-plan-mech-practice",
    overrides: [
      {
        sectionId: "sec-wgw-1-2",
        field: "durationMinutes",
        value: 120,
        reason: "2302 班空间想象弱，游标卡尺图纸对读环节延长 30 分钟，加强图纸—实物—量具三联对照",
      },
    ],
    strategyBrief:
      "以「安全入厂 → 量具识读与图纸对表 → 车铣钳基础操作 → 工艺卡与实习报告」串线；2301/2302 平行排课，量具与读图环节放慢半周；兼顾 2302 两极分化，现场演示与设计课引用的图纸对表加倍演练。",
    semester: "2026春季",
    startDate: "2026-03-02",
    endDate: "2026-06-10",
    status: "in_progress",
    createdAt: "2026-02-18T10:30:00+08:00",
    updatedAt: "2026-04-12T11:00:00+08:00",
    aiAdvice:
      "2302 班空间想象弱于 2301，但动手意愿强。建议金工阶段多安排「图纸—实物—量具」三联对照；对后 1/4 学生单独发放带标注的简化工艺卡，并在车削日前增加一次游标卡尺过关小测。",
    chapters: [
      {
        id: "ch-wgw-1",
        title: "第1章 入厂安全与量具识读",
        sections: [
          {
            id: "sec-wgw-1-1",
            title: "1.1 车间安全规程与劳保穿戴",
            plannedDate: "2026-03-03",
            knowledgeNodeIds: ["kn-mech-009"],
            objectives: ["口述四类主要安全风险与应急处置", "正确穿戴劳保用品"],
            durationMinutes: 60,
            hasDesign: false,
          },
          {
            id: "sec-wgw-1-2",
            title: "1.2 游标卡尺与图纸尺寸对读",
            plannedDate: "2026-03-05",
            knowledgeNodeIds: ["kn-mech-009", "kn-mech-015"],
            objectives: ["独立完成 5 处关键尺寸量测并与图纸标注核对", "记录测量不确定度意识（粗估）"],
            durationMinutes: 90,
            hasDesign: true,
          },
        ],
      },
      {
        id: "ch-wgw-2",
        title: "第2章 车削与铣削基础",
        sections: [
          {
            id: "sec-wgw-2-1",
            title: "2.1 普通车床基本操作（外圆与端面）",
            plannedDate: "2026-03-12",
            knowledgeNodeIds: ["kn-mech-009", "kn-mech-010"],
            objectives: ["完成简易轴类件试切", "填写工序记录"],
            durationMinutes: 120,
            hasDesign: false,
          },
          {
            id: "sec-wgw-2-2",
            title: "2.2 铣床工作台与对刀入门",
            plannedDate: "2026-03-14",
            knowledgeNodeIds: ["kn-mech-010"],
            objectives: ["理解对刀基准与加工坐标", "完成平面铣削练习件"],
            durationMinutes: 120,
            hasDesign: false,
          },
        ],
      },
    ],
  },

  // ========================================================================
  // 6. 大二 · 工业机器人（机制2303 · 进行中）
  // ========================================================================
  {
    id: "plan-mech-robotics",
    title: "《工业机器人技术应用基础》· 2026春 · 机制2303",
    courseId: "course-mech-robotics",
    professionId: "prof-mech",
    subjectId: "subj-mech-robot",
    creatorTeacherId: "t-zhao",
    classIds: ["cls-mech-2303"],
    strategyId: "strat-preset-balanced",
    strategyBrief:
      "示教 + 离线仿真双线并进，与李老师《机械制图与CAD》中 SolidWorks 模块周次对齐；每两周一次手绘—数模对照必交。",
    semester: "2026春季",
    startDate: "2026-03-02",
    endDate: "2026-06-19",
    status: "in_progress",
    createdAt: "2026-02-18T11:00:00+08:00",
    updatedAt: "2026-02-20T10:00:00+08:00",
    aiAdvice:
      "2303 班仿真维度好、手绘规范弱，务必落实「每两周 1 次手绘—数模对照」与李老师制图课进度联动。",
    chapters: [
      {
        id: "ch-rob-1",
        title: "第1章 机器人与坐标系",
        sections: [
          { id: "sec-rob-1-1", title: "1.1 工作站组成与安全互锁", plannedDate: "2026-03-02", knowledgeNodeIds: ["kn-mech-014", "kn-mech-010", "core-mech-003"], objectives: ["能口述安全互锁逻辑"], durationMinutes: 90, hasDesign: false },
          { id: "sec-rob-1-2", title: "1.2 示教编程入门", plannedDate: "2026-03-05", knowledgeNodeIds: ["kn-mech-014", "kn-mech-012", "kn-mech-016"], objectives: ["完成三点搬运轨迹"], durationMinutes: 90, hasDesign: false },
        ],
      },
    ],
  },
];
