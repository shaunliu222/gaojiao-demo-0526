import type { LegacyCoursePlanMeta } from "./types";

/**
 * 教务系统导入的旧课程基础元信息（不含章节，仅元数据）
 * 用于 L2 标准课程计划的"导入"来源，同时展示在 2.2.3 旧课程计划元信息导入页。
 */
export const legacyCoursePlanMetas: LegacyCoursePlanMeta[] = [
  {
    id: "legacy-mech-draw-2025",
    professionId: "prof-mech",
    courseName: "机械制图与CAD",
    courseCode: "ME1001",
    totalHours: 64,
    credit: 4,
    textbooks: [
      { title: "机械制图（第八版）", author: "钱可强 等", isbn: "978-7-04-054200-5" },
      { title: "AutoCAD 2022 实用教程", author: "廖希亮", isbn: "978-7-302-56883-1" },
    ],
    language: "中文",
    semester: "2026春季",
    source: "academic_system",
    importedAt: "2026-01-10T08:00:00+08:00",
  },
  {
    id: "legacy-mech-design-2025",
    professionId: "prof-mech",
    courseName: "机械设计基础",
    courseCode: "ME2001",
    totalHours: 64,
    credit: 4,
    textbooks: [
      { title: "机械设计（第十版）", author: "濮良贵 等", isbn: "978-7-04-050802-5" },
    ],
    language: "中文",
    semester: "2026秋季",
    source: "academic_system",
    importedAt: "2026-01-10T08:05:00+08:00",
  },
  {
    id: "legacy-mech-practice-2025",
    professionId: "prof-mech",
    courseName: "金工实习",
    courseCode: "ME1003",
    totalHours: 40,
    credit: 2,
    textbooks: [
      { title: "金工实习指导书（第三版）", author: "徐建明", isbn: "978-7-111-53801-4" },
    ],
    language: "中文",
    semester: "2026春季",
    source: "academic_system",
    importedAt: "2026-01-10T08:10:00+08:00",
  },
  {
    id: "legacy-mech-tolerance-2025",
    professionId: "prof-mech",
    courseName: "互换性与技术测量",
    courseCode: "ME3001",
    totalHours: 48,
    credit: 3,
    textbooks: [
      { title: "互换性与技术测量基础（第七版）", author: "廖念钊 等", isbn: "978-7-04-049606-2" },
    ],
    language: "中文",
    semester: "2026秋季",
    source: "academic_system",
    importedAt: "2026-01-10T08:15:00+08:00",
  },
  {
    id: "legacy-mech-robotics-2025",
    professionId: "prof-mech",
    courseName: "工业机器人技术应用基础",
    courseCode: "ME4002",
    totalHours: 48,
    credit: 3,
    textbooks: [
      { title: "工业机器人技术基础", author: "蔡自兴", isbn: "978-7-302-42500-4" },
    ],
    language: "中文",
    semester: "2026秋季",
    source: "academic_system",
    importedAt: "2026-01-10T08:20:00+08:00",
  },
];

export const legacyCoursePlanMetaById: Record<string, LegacyCoursePlanMeta> =
  Object.fromEntries(legacyCoursePlanMetas.map((m) => [m.id, m]));
