import type { Student } from "./types";

/**
 * 学生数据
 *
 * - 机制 2301：全员 28 人（主班，完整命名）
 * - 机制 2302：抽样 8 人（含主角陈浩宇-薄弱生）
 * - 机制 2201：抽样 6 人
 * - 法学 2301：抽样 8 人
 * - 护理 2301：抽样 10 人
 * - 学前 2301：抽样 6 人
 *
 * 合计 ~76 人。后续学生档案画像会覆盖其中一部分。
 */
export const students: Student[] = [
  // ==== 机制 2301（主班 28 人全员）====
  { id: "s-mech2301-01", name: "张伟", gender: "男", classId: "cls-mech-2301", studentNo: "2023010101", enrollYear: 2023 },
  { id: "s-mech2301-02", name: "刘静雯", gender: "女", classId: "cls-mech-2301", studentNo: "2023010102", enrollYear: 2023 },
  { id: "s-mech2301-03", name: "王一鸣", gender: "男", classId: "cls-mech-2301", studentNo: "2023010103", enrollYear: 2023 },
  { id: "s-mech2301-04", name: "赵思齐", gender: "男", classId: "cls-mech-2301", studentNo: "2023010104", enrollYear: 2023 },
  { id: "s-mech2301-05", name: "孙雨欣", gender: "女", classId: "cls-mech-2301", studentNo: "2023010105", enrollYear: 2023 },
  {
    id: "s-mech2301-06",
    name: "周子航",
    gender: "男",
    classId: "cls-mech-2301",
    studentNo: "2023010106",
    enrollYear: 2023,
    teacherFocus: true,
  },
  { id: "s-mech2301-07", name: "吴佳怡", gender: "女", classId: "cls-mech-2301", studentNo: "2023010107", enrollYear: 2023 },
  { id: "s-mech2301-08", name: "郑浩然", gender: "男", classId: "cls-mech-2301", studentNo: "2023010108", enrollYear: 2023 },
  { id: "s-mech2301-09", name: "冯昊轩", gender: "男", classId: "cls-mech-2301", studentNo: "2023010109", enrollYear: 2023 },
  { id: "s-mech2301-10", name: "陈思远", gender: "男", classId: "cls-mech-2301", studentNo: "2023010110", enrollYear: 2023 },
  { id: "s-mech2301-11", name: "褚艺涵", gender: "女", classId: "cls-mech-2301", studentNo: "2023010111", enrollYear: 2023 },
  { id: "s-mech2301-12", name: "卫子琪", gender: "女", classId: "cls-mech-2301", studentNo: "2023010112", enrollYear: 2023 },
  { id: "s-mech2301-13", name: "蒋博文", gender: "男", classId: "cls-mech-2301", studentNo: "2023010113", enrollYear: 2023 },
  { id: "s-mech2301-14", name: "沈逸飞", gender: "男", classId: "cls-mech-2301", studentNo: "2023010114", enrollYear: 2023 },
  { id: "s-mech2301-15", name: "韩雨桐", gender: "女", classId: "cls-mech-2301", studentNo: "2023010115", enrollYear: 2023 },
  { id: "s-mech2301-16", name: "杨晓东", gender: "男", classId: "cls-mech-2301", studentNo: "2023010116", enrollYear: 2023 },
  { id: "s-mech2301-17", name: "朱雅琴", gender: "女", classId: "cls-mech-2301", studentNo: "2023010117", enrollYear: 2023 },
  { id: "s-mech2301-18", name: "秦子墨", gender: "男", classId: "cls-mech-2301", studentNo: "2023010118", enrollYear: 2023 },
  { id: "s-mech2301-19", name: "尤嘉豪", gender: "男", classId: "cls-mech-2301", studentNo: "2023010119", enrollYear: 2023 },
  { id: "s-mech2301-20", name: "许可", gender: "女", classId: "cls-mech-2301", studentNo: "2023010120", enrollYear: 2023 },
  { id: "s-mech2301-21", name: "何宇航", gender: "男", classId: "cls-mech-2301", studentNo: "2023010121", enrollYear: 2023 },
  { id: "s-mech2301-22", name: "吕婉婷", gender: "女", classId: "cls-mech-2301", studentNo: "2023010122", enrollYear: 2023 },
  { id: "s-mech2301-23", name: "施振宇", gender: "男", classId: "cls-mech-2301", studentNo: "2023010123", enrollYear: 2023 },
  { id: "s-mech2301-24", name: "张梓豪", gender: "男", classId: "cls-mech-2301", studentNo: "2023010124", enrollYear: 2023 },
  { id: "s-mech2301-25", name: "孔维依", gender: "女", classId: "cls-mech-2301", studentNo: "2023010125", enrollYear: 2023 },
  { id: "s-mech2301-26", name: "曹明远", gender: "男", classId: "cls-mech-2301", studentNo: "2023010126", enrollYear: 2023 },
  { id: "s-mech2301-27", name: "严若彤", gender: "女", classId: "cls-mech-2301", studentNo: "2023010127", enrollYear: 2023 },
  { id: "s-mech2301-28", name: "华子豪", gender: "男", classId: "cls-mech-2301", studentNo: "2023010128", enrollYear: 2023 },

  // ==== 机制 2302（抽样 8 人，含薄弱生陈浩宇）====
  {
    id: "s-mech2302-01",
    name: "陈浩宇",
    gender: "男",
    classId: "cls-mech-2302",
    studentNo: "2023010201",
    enrollYear: 2023,
    teacherFocus: true,
  },
  { id: "s-mech2302-02", name: "林诗涵", gender: "女", classId: "cls-mech-2302", studentNo: "2023010202", enrollYear: 2023 },
  { id: "s-mech2302-03", name: "马俊豪", gender: "男", classId: "cls-mech-2302", studentNo: "2023010203", enrollYear: 2023 },
  { id: "s-mech2302-04", name: "徐子涵", gender: "男", classId: "cls-mech-2302", studentNo: "2023010204", enrollYear: 2023 },
  { id: "s-mech2302-05", name: "胡梦瑶", gender: "女", classId: "cls-mech-2302", studentNo: "2023010205", enrollYear: 2023 },
  { id: "s-mech2302-06", name: "田泽楷", gender: "男", classId: "cls-mech-2302", studentNo: "2023010206", enrollYear: 2023 },
  { id: "s-mech2302-07", name: "黄雅楠", gender: "女", classId: "cls-mech-2302", studentNo: "2023010207", enrollYear: 2023 },
  { id: "s-mech2302-08", name: "江博涛", gender: "男", classId: "cls-mech-2302", studentNo: "2023010208", enrollYear: 2023 },

  // ==== 机制 2201（抽样 6 人）====
  { id: "s-mech2201-01", name: "邓伟豪", gender: "男", classId: "cls-mech-2201", studentNo: "2022010101", enrollYear: 2022 },
  { id: "s-mech2201-02", name: "曾子琳", gender: "女", classId: "cls-mech-2201", studentNo: "2022010102", enrollYear: 2022 },
  { id: "s-mech2201-03", name: "薛浩然", gender: "男", classId: "cls-mech-2201", studentNo: "2022010103", enrollYear: 2022 },
  { id: "s-mech2201-04", name: "谢雨桐", gender: "女", classId: "cls-mech-2201", studentNo: "2022010104", enrollYear: 2022 },
  { id: "s-mech2201-05", name: "彭嘉俊", gender: "男", classId: "cls-mech-2201", studentNo: "2022010105", enrollYear: 2022 },
  { id: "s-mech2201-06", name: "何晓彤", gender: "女", classId: "cls-mech-2201", studentNo: "2022010106", enrollYear: 2022 },

  // ==== 法学 2301（抽样 8 人）====
  { id: "s-law2301-01", name: "宋佳雯", gender: "女", classId: "cls-law-2301", studentNo: "2023030101", enrollYear: 2023 },
  { id: "s-law2301-02", name: "范博文", gender: "男", classId: "cls-law-2301", studentNo: "2023030102", enrollYear: 2023 },
  { id: "s-law2301-03", name: "苏婉清", gender: "女", classId: "cls-law-2301", studentNo: "2023030103", enrollYear: 2023 },
  { id: "s-law2301-04", name: "潘思源", gender: "男", classId: "cls-law-2301", studentNo: "2023030104", enrollYear: 2023 },
  { id: "s-law2301-05", name: "尹雨萱", gender: "女", classId: "cls-law-2301", studentNo: "2023030105", enrollYear: 2023 },
  { id: "s-law2301-06", name: "顾一鸣", gender: "男", classId: "cls-law-2301", studentNo: "2023030106", enrollYear: 2023 },
  { id: "s-law2301-07", name: "唐诗涵", gender: "女", classId: "cls-law-2301", studentNo: "2023030107", enrollYear: 2023 },
  { id: "s-law2301-08", name: "任安然", gender: "女", classId: "cls-law-2301", studentNo: "2023030108", enrollYear: 2023 },

  // ==== 护理 2301（抽样 10 人）====
  { id: "s-nurse2301-01", name: "白若雪", gender: "女", classId: "cls-nurse-2301", studentNo: "2023100101", enrollYear: 2023 },
  { id: "s-nurse2301-02", name: "谢心怡", gender: "女", classId: "cls-nurse-2301", studentNo: "2023100102", enrollYear: 2023 },
  { id: "s-nurse2301-03", name: "崔婉婷", gender: "女", classId: "cls-nurse-2301", studentNo: "2023100103", enrollYear: 2023 },
  { id: "s-nurse2301-04", name: "夏清欢", gender: "女", classId: "cls-nurse-2301", studentNo: "2023100104", enrollYear: 2023 },
  { id: "s-nurse2301-05", name: "乔志成", gender: "男", classId: "cls-nurse-2301", studentNo: "2023100105", enrollYear: 2023 },
  { id: "s-nurse2301-06", name: "康悦萌", gender: "女", classId: "cls-nurse-2301", studentNo: "2023100106", enrollYear: 2023 },
  { id: "s-nurse2301-07", name: "贺星月", gender: "女", classId: "cls-nurse-2301", studentNo: "2023100107", enrollYear: 2023 },
  { id: "s-nurse2301-08", name: "钟雅琪", gender: "女", classId: "cls-nurse-2301", studentNo: "2023100108", enrollYear: 2023 },
  { id: "s-nurse2301-09", name: "齐明辉", gender: "男", classId: "cls-nurse-2301", studentNo: "2023100109", enrollYear: 2023 },
  { id: "s-nurse2301-10", name: "安娜", gender: "女", classId: "cls-nurse-2301", studentNo: "2023100110", enrollYear: 2023 },

  // ==== 学前 2301（抽样 6 人）====
  { id: "s-edu2301-01", name: "伊可欣", gender: "女", classId: "cls-edu-2301", studentNo: "2023040101", enrollYear: 2023 },
  { id: "s-edu2301-02", name: "毛宛蓉", gender: "女", classId: "cls-edu-2301", studentNo: "2023040102", enrollYear: 2023 },
  { id: "s-edu2301-03", name: "史佳乐", gender: "女", classId: "cls-edu-2301", studentNo: "2023040103", enrollYear: 2023 },
  { id: "s-edu2301-04", name: "罗静怡", gender: "女", classId: "cls-edu-2301", studentNo: "2023040104", enrollYear: 2023 },
  { id: "s-edu2301-05", name: "于萌萌", gender: "女", classId: "cls-edu-2301", studentNo: "2023040105", enrollYear: 2023 },
  { id: "s-edu2301-06", name: "乐语桐", gender: "女", classId: "cls-edu-2301", studentNo: "2023040106", enrollYear: 2023 },
];
