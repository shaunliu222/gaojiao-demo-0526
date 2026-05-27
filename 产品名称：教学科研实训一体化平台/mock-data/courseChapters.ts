import type {
  CourseChapter,
  CoursewareItem,
  ExerciseItem,
  ReferenceItem,
  PublishStatus,
} from "./types";

/**
 * 课程章节目录 mock 数据
 *
 * 为 4 门核心课程提供完整章节树（最多3层嵌套）。
 * 叶子节点关联：课件（引用 resources.ts）、技能点/知识点（引用 kgL3.ts）、练习题、参考资料。
 *
 * 数据闭环：
 * - knowledgePointIds 引用 kgL3.ts 中的 l3-kn-001 ~ l3-kn-018
 * - skillPointIds 引用 kgL3.ts 中的 l3-sk-001 ~ l3-sk-003
 * - coursewares/references 中的 resourceId 引用 resources.ts 中的 res-m-*
 * - 章节结构对应 teachingPlans.ts 中 plan-main 的课时编排
 */

// ---- helper ----

function ch(args: {
  id: string;
  title: string;
  nodeType: CourseChapter["nodeType"];
  publishStatus?: PublishStatus;
  sortOrder: number;
  children?: CourseChapter[];
  coursewares?: CoursewareItem[];
  exercises?: ExerciseItem[];
  skillPointIds?: string[];
  knowledgePointIds?: string[];
  references?: ReferenceItem[];
}): CourseChapter {
  return {
    publishStatus: "published",
    children: [],
    coursewares: [],
    exercises: [],
    skillPointIds: [],
    knowledgePointIds: [],
    references: [],
    ...args,
  };
}

// ============================================================================
// 1. 机械制图与CAD (course-mech-draw) — 对应 plan-main 的课时编排
// ============================================================================

const drawChapters: CourseChapter[] = [
  ch({
    id: "cc-draw-ch1",
    title: "第1章 制图基础与国家标准",
    nodeType: "chapter",
    sortOrder: 1,
    children: [
      ch({
        id: "cc-draw-ch1-s1",
        title: "1.1 国家标准与图纸幅面",
        nodeType: "section",
        sortOrder: 1,
        knowledgePointIds: ["l3-kn-001", "l3-kn-018"],
        coursewares: [
          {
            id: "cw-draw-1-1-1",
            title: "制图基础概述 · 第一讲课件",
            source: "resource_library",
            resourceId: "res-m-002",
            fileName: "制图基础概述_第一讲.pptx",
            fileType: "ppt",
            sizeMb: 8.6,
            uploadedAt: "2026-02-20T09:00:00+08:00",
          },
        ],
        exercises: [
          {
            id: "ex-draw-1-1-1",
            type: "single_choice",
            difficulty: "easy",
            question: "A0 图纸的幅面尺寸（mm）是？",
            options: ["841 × 1189", "594 × 841", "420 × 594", "297 × 420"],
            answer: "841 × 1189",
            analysis: "GB/T 14689 规定 A0 幅面为 841×1189mm。",
            knowledgePointIds: ["l3-kn-001"],
          },
          {
            id: "ex-draw-1-1-2",
            type: "single_choice",
            difficulty: "easy",
            question: "图框线应使用哪种线型？",
            options: ["粗实线", "细实线", "虚线", "点画线"],
            answer: "粗实线",
            knowledgePointIds: ["l3-kn-001"],
          },
        ],
        references: [
          {
            id: "ref-draw-1-1-1",
            title: "GB/T 14689-2008 技术制图 图纸幅面和格式",
            source: "resource_library",
            resourceId: "res-m-001",
            fileName: "GB_T_14689-2008.pdf",
            fileType: "doc",
            sizeMb: 1.4,
            uploadedAt: "2026-02-20T09:00:00+08:00",
          },
        ],
      }),
      ch({
        id: "cc-draw-ch1-s2",
        title: "1.2 字体、图线与尺寸标注",
        nodeType: "section",
        sortOrder: 2,
        knowledgePointIds: ["l3-kn-001", "l3-kn-009"],
        coursewares: [
          {
            id: "cw-draw-1-2-1",
            title: "工程字长仿宋体书写示范",
            source: "resource_library",
            resourceId: "res-m-003",
            fileName: "长仿宋体书写示范.mp4",
            fileType: "video",
            sizeMb: 55,
            uploadedAt: "2026-02-22T10:00:00+08:00",
          },
          {
            id: "cw-draw-1-2-2",
            title: "九种基本图线速查图",
            source: "resource_library",
            resourceId: "res-m-004",
            fileName: "基本图线速查图.png",
            fileType: "image",
            sizeMb: 0.8,
            uploadedAt: "2026-02-22T10:00:00+08:00",
          },
        ],
        exercises: [
          {
            id: "ex-draw-1-2-1",
            type: "fill_blank",
            difficulty: "medium",
            question: "尺寸标注的四要素是_____、_____、_____和_____。",
            answer: "尺寸界线、尺寸线、箭头、尺寸数字",
            analysis: "完整的尺寸标注由尺寸界线、尺寸线、箭头（或斜线）和尺寸数字四部分组成。",
            knowledgePointIds: ["l3-kn-001"],
          },
        ],
        references: [],
      }),
      ch({
        id: "cc-draw-ch1-s3",
        title: "1.3 几何作图",
        nodeType: "section",
        sortOrder: 3,
        knowledgePointIds: ["l3-kn-002"],
        coursewares: [],
        exercises: [
          {
            id: "ex-draw-1-3-1",
            type: "true_false",
            difficulty: "easy",
            question: "等分圆周只能使用量角器，不能用尺规作图完成。",
            answer: "错误",
            analysis: "常用正六边形等分可通过圆规直接完成，无需量角器。",
            knowledgePointIds: ["l3-kn-002"],
          },
        ],
        references: [],
      }),
    ],
  }),
  ch({
    id: "cc-draw-ch2",
    title: "第2章 投影基础",
    nodeType: "chapter",
    sortOrder: 2,
    children: [
      ch({
        id: "cc-draw-ch2-s1",
        title: "2.1 投影法与三视图形成",
        nodeType: "section",
        sortOrder: 1,
        knowledgePointIds: ["l3-kn-003", "l3-kn-004"],
        skillPointIds: ["l3-sk-001"],
        coursewares: [
          {
            id: "cw-draw-2-1-1",
            title: "三视图形成动态演示",
            source: "resource_library",
            resourceId: "res-m-020",
            fileName: "三视图形成动态演示.mp4",
            fileType: "video",
            sizeMb: 42,
            uploadedAt: "2026-03-01T09:00:00+08:00",
          },
        ],
        exercises: [
          {
            id: "ex-draw-2-1-1",
            type: "single_choice",
            difficulty: "medium",
            question: "三视图中，俯视图反映物体的哪个方向尺寸？",
            options: ["长和高", "长和宽", "宽和高", "只有长"],
            answer: "长和宽",
            analysis: "俯视图（H面投影）反映物体的长度和宽度。",
            knowledgePointIds: ["l3-kn-003"],
          },
        ],
        references: [],
      }),
      ch({
        id: "cc-draw-ch2-s2",
        title: "2.2 点线面的投影分析",
        nodeType: "section",
        sortOrder: 2,
        knowledgePointIds: ["l3-kn-004"],
        coursewares: [],
        exercises: [
          {
            id: "ex-draw-2-2-1",
            type: "single_choice",
            difficulty: "medium",
            question: "正垂面在三视图中的投影特征是？",
            options: [
              "V面投影积聚为直线，其余两面为类似形",
              "H面投影积聚为直线",
              "W面投影积聚为直线",
              "三面投影均为类似形",
            ],
            answer: "V面投影积聚为直线，其余两面为类似形",
            knowledgePointIds: ["l3-kn-004"],
          },
        ],
        references: [],
      }),
      ch({
        id: "cc-draw-ch2-s3",
        title: "2.3 立体与回转体投影",
        nodeType: "section",
        sortOrder: 3,
        knowledgePointIds: ["l3-kn-004", "l3-kn-005"],
        skillPointIds: ["l3-sk-001"],
        coursewares: [],
        exercises: [],
        references: [],
      }),
    ],
  }),
  ch({
    id: "cc-draw-ch3",
    title: "第3章 组合体与交线",
    nodeType: "chapter",
    sortOrder: 3,
    children: [
      ch({
        id: "cc-draw-ch3-s1",
        title: "3.1 组合体分析与视图绘制",
        nodeType: "section",
        sortOrder: 1,
        knowledgePointIds: ["l3-kn-005"],
        skillPointIds: ["l3-sk-001"],
        coursewares: [
          {
            id: "cw-draw-3-1-1",
            title: "组合体三视图绘制示范 · 轴承座",
            source: "resource_library",
            resourceId: "res-m-041",
            fileName: "组合体三视图_轴承座示范.mp4",
            fileType: "video",
            sizeMb: 68,
            uploadedAt: "2026-03-15T09:00:00+08:00",
          },
        ],
        exercises: [
          {
            id: "ex-draw-3-1-1",
            type: "multi_choice",
            difficulty: "medium",
            question: "组合体的构成方式包括以下哪些？",
            options: ["叠加", "切割", "相交", "综合"],
            answer: "叠加、切割、综合",
            analysis: "组合体有叠加、切割和综合三种基本构成方式。相交属于切割的一种特例。",
            knowledgePointIds: ["l3-kn-005"],
          },
        ],
        references: [],
      }),
      ch({
        id: "cc-draw-ch3-s2",
        title: "3.2 截交线与相贯线",
        nodeType: "section",
        sortOrder: 2,
        knowledgePointIds: ["l3-kn-006"],
        skillPointIds: ["l3-sk-001"],
        coursewares: [],
        exercises: [
          {
            id: "ex-draw-3-2-1",
            type: "short_answer",
            difficulty: "hard",
            question: "简述用辅助平面法求相贯线的基本步骤。",
            answer: "1) 选取适当的辅助平面；2) 求辅助平面与两立体表面的截交线；3) 截交线的交点即为相贯线上的点；4) 光滑连接各点。",
            analysis: "辅助平面法是求相贯线最常用的方法，关键在于选择合适的辅助平面使截交线为简单图形（圆或直线）。",
            knowledgePointIds: ["l3-kn-006"],
          },
        ],
        references: [],
      }),
    ],
  }),
  ch({
    id: "cc-draw-ch4",
    title: "第4章 机件表达方法",
    nodeType: "chapter",
    sortOrder: 4,
    children: [
      ch({
        id: "cc-draw-ch4-s1",
        title: "4.1 视图与剖视图",
        nodeType: "section",
        sortOrder: 1,
        knowledgePointIds: ["l3-kn-007"],
        coursewares: [],
        exercises: [],
        references: [],
      }),
      ch({
        id: "cc-draw-ch4-s2",
        title: "4.2 标准件与常用件表达",
        nodeType: "section",
        sortOrder: 2,
        knowledgePointIds: ["l3-kn-008"],
        coursewares: [],
        exercises: [],
        references: [],
      }),
    ],
  }),
  ch({
    id: "cc-draw-ch5",
    title: "第5章 零件图与装配图",
    nodeType: "chapter",
    sortOrder: 5,
    children: [
      ch({
        id: "cc-draw-ch5-s1",
        title: "5.1 零件图技术要求",
        nodeType: "section",
        sortOrder: 1,
        knowledgePointIds: ["l3-kn-009"],
        coursewares: [],
        exercises: [],
        references: [],
      }),
      ch({
        id: "cc-draw-ch5-s2",
        title: "5.2 装配图与BOM",
        nodeType: "section",
        sortOrder: 2,
        knowledgePointIds: ["l3-kn-010"],
        coursewares: [],
        exercises: [],
        references: [],
      }),
    ],
  }),
  ch({
    id: "cc-draw-ch6",
    title: "第6章 CAD制图",
    nodeType: "chapter",
    sortOrder: 6,
    children: [
      ch({
        id: "cc-draw-ch6-s1",
        title: "6.1 AutoCAD图层与出图",
        nodeType: "section",
        sortOrder: 1,
        knowledgePointIds: ["l3-kn-011"],
        skillPointIds: ["l3-sk-002"],
        coursewares: [],
        exercises: [],
        references: [],
      }),
      ch({
        id: "cc-draw-ch6-s2",
        title: "6.2 三维建模与工程图",
        nodeType: "section",
        sortOrder: 2,
        knowledgePointIds: ["l3-kn-012"],
        skillPointIds: ["l3-sk-003"],
        coursewares: [],
        exercises: [],
        references: [],
      }),
    ],
  }),
];

// ============================================================================
// 2. 机械设计基础 (course-mech-design)
// ============================================================================

const designChapters: CourseChapter[] = [
  ch({
    id: "cc-design-ch1",
    title: "第1章 机械设计概述",
    nodeType: "chapter",
    sortOrder: 1,
    children: [
      ch({
        id: "cc-design-ch1-s1",
        title: "1.1 机械设计基本要求与程序",
        nodeType: "section",
        sortOrder: 1,
        knowledgePointIds: ["l3-kn-007", "l3-kn-010"],
        coursewares: [],
        exercises: [],
        references: [],
      }),
    ],
  }),
  ch({
    id: "cc-design-ch2",
    title: "第2章 连接件设计",
    nodeType: "chapter",
    sortOrder: 2,
    children: [
      ch({
        id: "cc-design-ch2-s1",
        title: "2.1 螺纹连接",
        nodeType: "section",
        sortOrder: 1,
        knowledgePointIds: ["l3-kn-008"],
        coursewares: [],
        exercises: [
          {
            id: "ex-design-2-1-1",
            type: "single_choice",
            difficulty: "medium",
            question: "普通螺纹的牙型角是多少度？",
            options: ["30°", "45°", "60°", "90°"],
            answer: "60°",
            knowledgePointIds: ["l3-kn-008"],
          },
        ],
        references: [],
      }),
      ch({
        id: "cc-design-ch2-s2",
        title: "2.2 键连接与销连接",
        nodeType: "section",
        sortOrder: 2,
        knowledgePointIds: ["l3-kn-008"],
        coursewares: [],
        exercises: [],
        references: [],
      }),
    ],
  }),
  ch({
    id: "cc-design-ch3",
    title: "第3章 传动件设计",
    nodeType: "chapter",
    sortOrder: 3,
    children: [
      ch({
        id: "cc-design-ch3-s1",
        title: "3.1 齿轮传动",
        nodeType: "section",
        sortOrder: 1,
        knowledgePointIds: ["l3-kn-008", "l3-kn-009"],
        coursewares: [],
        exercises: [],
        references: [],
      }),
      ch({
        id: "cc-design-ch3-s2",
        title: "3.2 带传动与链传动",
        nodeType: "section",
        sortOrder: 2,
        knowledgePointIds: ["l3-kn-007"],
        coursewares: [],
        exercises: [],
        references: [],
      }),
    ],
  }),
  ch({
    id: "cc-design-ch4",
    title: "第4章 轴系零部件",
    nodeType: "chapter",
    sortOrder: 4,
    children: [
      ch({
        id: "cc-design-ch4-s1",
        title: "4.1 轴的设计",
        nodeType: "section",
        sortOrder: 1,
        knowledgePointIds: ["l3-kn-009", "l3-kn-010"],
        coursewares: [],
        exercises: [],
        references: [],
      }),
      ch({
        id: "cc-design-ch4-s2",
        title: "4.2 轴承选择与寿命计算",
        nodeType: "section",
        sortOrder: 2,
        knowledgePointIds: ["l3-kn-009"],
        coursewares: [],
        exercises: [],
        references: [],
      }),
    ],
  }),
];

// ============================================================================
// 3. 金工实习 (course-mech-practice)
// ============================================================================

const practiceChapters: CourseChapter[] = [
  ch({
    id: "cc-prac-ch1",
    title: "第1章 铸造",
    nodeType: "chapter",
    sortOrder: 1,
    children: [
      ch({
        id: "cc-prac-ch1-s1",
        title: "1.1 砂型铸造基础",
        nodeType: "section",
        sortOrder: 1,
        knowledgePointIds: ["l3-kn-013"],
        coursewares: [],
        exercises: [],
        references: [],
      }),
    ],
  }),
  ch({
    id: "cc-prac-ch2",
    title: "第2章 车削加工",
    nodeType: "chapter",
    sortOrder: 2,
    children: [
      ch({
        id: "cc-prac-ch2-s1",
        title: "2.1 车床结构与操作基础",
        nodeType: "section",
        sortOrder: 1,
        knowledgePointIds: ["l3-kn-013"],
        coursewares: [],
        exercises: [
          {
            id: "ex-prac-2-1-1",
            type: "single_choice",
            difficulty: "easy",
            question: "车削加工中，工件的主运动是？",
            options: ["刀具的直线运动", "工件的旋转运动", "刀具的旋转运动", "工件的直线运动"],
            answer: "工件的旋转运动",
            knowledgePointIds: ["l3-kn-013"],
          },
        ],
        references: [],
      }),
      ch({
        id: "cc-prac-ch2-s2",
        title: "2.2 外圆车削与端面车削",
        nodeType: "section",
        sortOrder: 2,
        knowledgePointIds: ["l3-kn-013", "l3-kn-009"],
        skillPointIds: [],
        coursewares: [],
        exercises: [],
        references: [],
      }),
      ch({
        id: "cc-prac-ch2-s3",
        title: "2.3 螺纹车削",
        nodeType: "section",
        sortOrder: 3,
        knowledgePointIds: ["l3-kn-013", "l3-kn-008"],
        coursewares: [],
        exercises: [],
        references: [],
      }),
    ],
  }),
  ch({
    id: "cc-prac-ch3",
    title: "第3章 铣削与钳工",
    nodeType: "chapter",
    sortOrder: 3,
    children: [
      ch({
        id: "cc-prac-ch3-s1",
        title: "3.1 铣削加工基础",
        nodeType: "section",
        sortOrder: 1,
        knowledgePointIds: ["l3-kn-013"],
        coursewares: [],
        exercises: [],
        references: [],
      }),
      ch({
        id: "cc-prac-ch3-s2",
        title: "3.2 钳工操作",
        nodeType: "section",
        sortOrder: 2,
        knowledgePointIds: ["l3-kn-013"],
        coursewares: [],
        exercises: [],
        references: [],
      }),
    ],
  }),
];

// ============================================================================
// 4. 互换性与技术测量 (course-mech-tolerance)
// ============================================================================

const toleranceChapters: CourseChapter[] = [
  ch({
    id: "cc-tol-ch1",
    title: "第1章 互换性基本概念",
    nodeType: "chapter",
    sortOrder: 1,
    children: [
      ch({
        id: "cc-tol-ch1-s1",
        title: "1.1 互换性与标准化",
        nodeType: "section",
        sortOrder: 1,
        knowledgePointIds: ["l3-kn-009"],
        coursewares: [],
        exercises: [
          {
            id: "ex-tol-1-1-1",
            type: "single_choice",
            difficulty: "easy",
            question: "互换性按程度可分为哪两种？",
            options: [
              "完全互换和不完全互换",
              "内部互换和外部互换",
              "尺寸互换和功能互换",
              "装配互换和维修互换",
            ],
            answer: "完全互换和不完全互换",
            knowledgePointIds: ["l3-kn-009"],
          },
        ],
        references: [],
      }),
    ],
  }),
  ch({
    id: "cc-tol-ch2",
    title: "第2章 尺寸公差与配合",
    nodeType: "chapter",
    sortOrder: 2,
    children: [
      ch({
        id: "cc-tol-ch2-s1",
        title: "2.1 公差与配合的基本术语",
        nodeType: "section",
        sortOrder: 1,
        knowledgePointIds: ["l3-kn-009"],
        coursewares: [],
        exercises: [],
        references: [],
      }),
      ch({
        id: "cc-tol-ch2-s2",
        title: "2.2 公差与配合的选用",
        nodeType: "section",
        sortOrder: 2,
        knowledgePointIds: ["l3-kn-009"],
        coursewares: [],
        exercises: [
          {
            id: "ex-tol-2-2-1",
            type: "fill_blank",
            difficulty: "medium",
            question: "基孔制的基准孔代号为_____，其基本偏差为_____。",
            answer: "H、EI=0",
            analysis: "基孔制是以孔为基准件，基准孔的基本偏差代号为H，下偏差EI=0。",
            knowledgePointIds: ["l3-kn-009"],
          },
        ],
        references: [],
      }),
    ],
  }),
  ch({
    id: "cc-tol-ch3",
    title: "第3章 形位公差与表面粗糙度",
    nodeType: "chapter",
    sortOrder: 3,
    children: [
      ch({
        id: "cc-tol-ch3-s1",
        title: "3.1 形位公差的项目与标注",
        nodeType: "section",
        sortOrder: 1,
        knowledgePointIds: ["l3-kn-009"],
        coursewares: [],
        exercises: [],
        references: [],
      }),
      ch({
        id: "cc-tol-ch3-s2",
        title: "3.2 表面粗糙度评定与标注",
        nodeType: "section",
        sortOrder: 2,
        knowledgePointIds: ["l3-kn-009"],
        coursewares: [],
        exercises: [],
        references: [],
      }),
    ],
  }),
  ch({
    id: "cc-tol-ch4",
    title: "第4章 测量技术基础",
    nodeType: "chapter",
    sortOrder: 4,
    children: [
      ch({
        id: "cc-tol-ch4-s1",
        title: "4.1 测量方法与量具",
        nodeType: "section",
        sortOrder: 1,
        knowledgePointIds: ["l3-kn-009"],
        coursewares: [],
        exercises: [],
        references: [],
      }),
    ],
  }),
];

// ============================================================================
// 5. 其他课程 — 简化章节
// ============================================================================

const introChapters: CourseChapter[] = [
  ch({
    id: "cc-intro-ch1",
    title: "第1章 专业认知与产业概览",
    nodeType: "chapter",
    sortOrder: 1,
    children: [
      ch({
        id: "cc-intro-ch1-s1",
        title: "1.1 机械工程专业培养方案解读",
        nodeType: "section",
        sortOrder: 1,
        knowledgePointIds: ["l3-kn-018"],
        coursewares: [],
        exercises: [],
        references: [],
      }),
      ch({
        id: "cc-intro-ch1-s2",
        title: "1.2 制图与智能制造入门",
        nodeType: "section",
        sortOrder: 2,
        knowledgePointIds: ["l3-kn-003", "l3-kn-016"],
        coursewares: [],
        exercises: [],
        references: [],
      }),
    ],
  }),
  ch({
    id: "cc-intro-ch2",
    title: "第2章 AI工具与学术规范",
    nodeType: "chapter",
    sortOrder: 2,
    children: [
      ch({
        id: "cc-intro-ch2-s1",
        title: "2.1 生成式AI使用规范",
        nodeType: "section",
        sortOrder: 1,
        knowledgePointIds: ["l3-kn-017"],
        coursewares: [],
        exercises: [],
        references: [],
      }),
    ],
  }),
];

const roboticsChapters: CourseChapter[] = [
  ch({
    id: "cc-robot-ch1",
    title: "第1章 工业机器人基础",
    nodeType: "chapter",
    sortOrder: 1,
    children: [
      ch({
        id: "cc-robot-ch1-s1",
        title: "1.1 坐标系与运动学基础",
        nodeType: "section",
        sortOrder: 1,
        knowledgePointIds: ["l3-kn-014"],
        coursewares: [],
        exercises: [],
        references: [],
      }),
      ch({
        id: "cc-robot-ch1-s2",
        title: "1.2 示教编程与安全操作",
        nodeType: "section",
        sortOrder: 2,
        knowledgePointIds: ["l3-kn-014"],
        coursewares: [],
        exercises: [],
        references: [],
      }),
    ],
  }),
  ch({
    id: "cc-robot-ch2",
    title: "第2章 工作站应用",
    nodeType: "chapter",
    sortOrder: 2,
    children: [
      ch({
        id: "cc-robot-ch2-s1",
        title: "2.1 搬运与码垛工作站",
        nodeType: "section",
        sortOrder: 1,
        knowledgePointIds: ["l3-kn-014", "l3-kn-016"],
        coursewares: [],
        exercises: [],
        references: [],
      }),
    ],
  }),
];

const hydraulicChapters: CourseChapter[] = [
  ch({
    id: "cc-hyd-ch1",
    title: "第1章 液压传动基础",
    nodeType: "chapter",
    sortOrder: 1,
    children: [
      ch({
        id: "cc-hyd-ch1-s1",
        title: "1.1 液压传动原理与组成",
        nodeType: "section",
        sortOrder: 1,
        knowledgePointIds: ["l3-kn-015"],
        coursewares: [],
        exercises: [],
        references: [],
      }),
    ],
  }),
  ch({
    id: "cc-hyd-ch2",
    title: "第2章 典型回路",
    nodeType: "chapter",
    sortOrder: 2,
    children: [
      ch({
        id: "cc-hyd-ch2-s1",
        title: "2.1 压力控制回路",
        nodeType: "section",
        sortOrder: 1,
        knowledgePointIds: ["l3-kn-015"],
        coursewares: [],
        exercises: [],
        references: [],
      }),
      ch({
        id: "cc-hyd-ch2-s2",
        title: "2.2 气动回路与互锁",
        nodeType: "section",
        sortOrder: 2,
        knowledgePointIds: ["l3-kn-015"],
        coursewares: [],
        exercises: [],
        references: [],
      }),
    ],
  }),
];

const processChapters: CourseChapter[] = [
  ch({
    id: "cc-proc-ch1",
    title: "第1章 工艺规程",
    nodeType: "chapter",
    sortOrder: 1,
    children: [
      ch({
        id: "cc-proc-ch1-s1",
        title: "1.1 工艺规程制定方法",
        nodeType: "section",
        sortOrder: 1,
        knowledgePointIds: ["l3-kn-013", "l3-kn-009"],
        coursewares: [],
        exercises: [],
        references: [],
      }),
    ],
  }),
  ch({
    id: "cc-proc-ch2",
    title: "第2章 加工质量与装配",
    nodeType: "chapter",
    sortOrder: 2,
    children: [
      ch({
        id: "cc-proc-ch2-s1",
        title: "2.1 加工误差分析",
        nodeType: "section",
        sortOrder: 1,
        knowledgePointIds: ["l3-kn-009"],
        coursewares: [],
        exercises: [],
        references: [],
      }),
      ch({
        id: "cc-proc-ch2-s2",
        title: "2.2 装配工艺",
        nodeType: "section",
        sortOrder: 2,
        knowledgePointIds: ["l3-kn-010"],
        coursewares: [],
        exercises: [],
        references: [],
      }),
    ],
  }),
];

const aiLabChapters: CourseChapter[] = [
  ch({
    id: "cc-ai-ch1",
    title: "第1章 AI工具基础",
    nodeType: "chapter",
    sortOrder: 1,
    children: [
      ch({
        id: "cc-ai-ch1-s1",
        title: "1.1 生成式AI使用规范与学术诚实",
        nodeType: "section",
        sortOrder: 1,
        knowledgePointIds: ["l3-kn-017", "l3-kn-016"],
        coursewares: [],
        exercises: [],
        references: [],
      }),
    ],
  }),
  ch({
    id: "cc-ai-ch2",
    title: "第2章 AI实训项目",
    nodeType: "chapter",
    sortOrder: 2,
    children: [
      ch({
        id: "cc-ai-ch2-s1",
        title: "2.1 AI辅助制图实训",
        nodeType: "section",
        sortOrder: 1,
        knowledgePointIds: ["l3-kn-011", "l3-kn-012"],
        skillPointIds: ["l3-sk-002", "l3-sk-003"],
        coursewares: [],
        exercises: [],
        references: [],
      }),
      ch({
        id: "cc-ai-ch2-s2",
        title: "2.2 AI辅助工艺分析",
        nodeType: "section",
        sortOrder: 2,
        knowledgePointIds: ["l3-kn-009", "l3-kn-015"],
        coursewares: [],
        exercises: [],
        references: [],
      }),
    ],
  }),
];

// ============================================================================
// 导出映射表
// ============================================================================

export const courseChapterMap: Record<string, CourseChapter[]> = {
  "course-mech-draw": drawChapters,
  "course-mech-design": designChapters,
  "course-mech-practice": practiceChapters,
  "course-mech-intro": introChapters,
  "course-mech-tolerance": toleranceChapters,
  "course-mech-robotics": roboticsChapters,
  "course-mech-hydraulic": hydraulicChapters,
  "course-mech-process": processChapters,
  "course-mech-ai-lab": aiLabChapters,
};

export function chaptersByCourse(courseId: string): CourseChapter[] {
  return courseChapterMap[courseId] ?? [];
}
