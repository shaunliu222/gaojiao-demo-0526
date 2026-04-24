import type { Course } from "./types";

/**
 * 课程数据（6 门）
 *
 * - 机械工程 3 门（主线《机械制图与CAD》+ 《机械设计基础》+ 《金工实习》）
 * - 法学 1 门
 * - 护理学 1 门
 * - 学前教育 1 门（挂在未建图谱专业下，knowledgeNodeIds 为空）
 */
export const courses: Course[] = [
  // ========== 机械工程主线课 ==========
  {
    id: "course-mech-draw",
    name: "机械制图与CAD",
    coverUrl: "/covers/course-mech-draw.jpg",
    professionId: "prof-mech",
    subjectId: "subj-mech-drawing",
    description:
      "以国家最新制图标准为纲，系统讲授投影原理、机件表达、零件图装配图与 CAD 工程制图，是机械类专业的核心技术基础课。",
    credit: 4,
    totalHours: 64,
    semester: "2026春季",
    knowledgeNodeIds: [
      // 制图基础全部
      "kn-mech-001", "kn-mech-002", "kn-mech-003", "kn-mech-004", "kn-mech-005", "kn-mech-006",
      // 几何作图
      "kn-mech-007", "kn-mech-008", "kn-mech-009", "kn-mech-010", "kn-mech-011",
      // 投影基础
      "kn-mech-012", "kn-mech-013", "kn-mech-014", "kn-mech-015", "kn-mech-016",
      // 点线面
      "kn-mech-017", "kn-mech-018", "kn-mech-019", "kn-mech-020", "kn-mech-021", "kn-mech-022", "kn-mech-023",
      // 立体投影
      "kn-mech-024", "kn-mech-025", "kn-mech-026", "kn-mech-027", "kn-mech-028", "kn-mech-029",
      // 组合体
      "kn-mech-030", "kn-mech-031", "kn-mech-032", "kn-mech-033", "kn-mech-034",
      // 机件表达
      "kn-mech-035", "kn-mech-036", "kn-mech-037", "kn-mech-038", "kn-mech-039", "kn-mech-040", "kn-mech-041",
      // 标准件
      "kn-mech-042", "kn-mech-043", "kn-mech-044", "kn-mech-045", "kn-mech-046", "kn-mech-047",
      // 零件图装配图
      "kn-mech-048", "kn-mech-049", "kn-mech-050", "kn-mech-051", "kn-mech-052", "kn-mech-053",
      // CAD
      "kn-mech-054", "kn-mech-055", "kn-mech-056", "kn-mech-057", "kn-mech-058", "kn-mech-059", "kn-mech-060",
    ],
    ownerTeacherId: "t-li",
    tags: ["核心课", "制图", "CAD", "工科基础"],
  },
  {
    id: "course-mech-design",
    name: "机械设计基础",
    coverUrl: "/covers/course-mech-design.jpg",
    professionId: "prof-mech",
    subjectId: "subj-mech-design",
    description:
      "研究通用机械零件与常用机构的工作原理和设计方法，为后续专业课程奠定机械设计能力基础。",
    credit: 4,
    totalHours: 64,
    semester: "2026春季",
    knowledgeNodeIds: [
      "kn-mech-042", "kn-mech-043", "kn-mech-044", "kn-mech-045", "kn-mech-046", "kn-mech-047",
      "kn-mech-048", "kn-mech-049", "kn-mech-050", "kn-mech-051",
    ],
    ownerTeacherId: "t-chen",
    tags: ["核心课", "机械设计"],
  },
  {
    id: "course-mech-practice",
    name: "金工实习",
    coverUrl: "/covers/course-mech-practice.jpg",
    professionId: "prof-mech",
    subjectId: "subj-mech-manu",
    description:
      "走入车间，体验车、铣、钳、焊、铸的全流程金属加工实践，重在动手与工程规范养成。",
    credit: 2,
    totalHours: 40,
    semester: "2026春季",
    knowledgeNodeIds: [
      "kn-mech-048", "kn-mech-049", "kn-mech-050", "kn-mech-052",
    ],
    ownerTeacherId: "t-chen",
    tags: ["实训", "工程规范"],
  },

  // ========== 法学 ==========
  {
    id: "course-law-civil",
    name: "民法典总则编",
    coverUrl: "/covers/course-law-civil.jpg",
    professionId: "prof-law",
    subjectId: "subj-law-civil",
    description:
      "围绕《中华人民共和国民法典》总则编，系统讲授民事主体、民事法律行为、代理、民事权利与诉讼时效等民法基础制度。",
    credit: 3,
    totalHours: 48,
    semester: "2026春季",
    knowledgeNodeIds: [
      "kn-law-001", "kn-law-002", "kn-law-003", "kn-law-004", "kn-law-005", "kn-law-006",
      "kn-law-007", "kn-law-008", "kn-law-009", "kn-law-010", "kn-law-011",
      "kn-law-012", "kn-law-013", "kn-law-014", "kn-law-015",
      "kn-law-016", "kn-law-017", "kn-law-018", "kn-law-019", "kn-law-023",
      "kn-law-020", "kn-law-021", "kn-law-022",
    ],
    ownerTeacherId: "t-zhao",
    tags: ["核心课", "民法", "案例教学"],
  },

  // ========== 护理学 ==========
  {
    id: "course-nurse-basic",
    name: "基础护理学",
    coverUrl: "/covers/course-nurse-basic.jpg",
    professionId: "prof-nurse",
    subjectId: "subj-nurse-basic",
    description:
      "护理专业核心课程，系统讲授环境与安全、无菌技术、生命体征采集、给药与注射、静脉输液等基础护理理论与操作技术。",
    credit: 5,
    totalHours: 80,
    semester: "2026春季",
    knowledgeNodeIds: [
      "kn-nur-001", "kn-nur-002", "kn-nur-003", "kn-nur-004",
      "kn-nur-005", "kn-nur-006", "kn-nur-007",
      "kn-nur-008", "kn-nur-009", "kn-nur-010",
      "kn-nur-011", "kn-nur-012", "kn-nur-013",
      "kn-nur-014", "kn-nur-015", "kn-nur-016", "kn-nur-017",
    ],
    ownerTeacherId: "t-wanglh",
    tags: ["核心课", "护理", "实训导向"],
  },

  // ========== 学前教育（未建图谱，保留课程空壳演示） ==========
  {
    id: "course-edu-activity",
    name: "幼儿园教育活动设计",
    coverUrl: "/covers/course-edu-activity.jpg",
    professionId: "prof-edu",
    subjectId: "subj-edu-activity",
    description:
      "聚焦幼儿园健康、语言、社会、科学、艺术五大领域教育活动的设计与组织。该课程所属专业尚未建立知识图谱，节点关联为空。",
    credit: 3,
    totalHours: 48,
    semester: "2026春季",
    knowledgeNodeIds: [],
    ownerTeacherId: "t-sun",
    tags: ["核心课", "学前"],
  },
];
