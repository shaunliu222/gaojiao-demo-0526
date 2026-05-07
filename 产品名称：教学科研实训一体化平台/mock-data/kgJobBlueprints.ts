import type { JobToPlanBlueprint } from "./types";

/**
 * 岗位驱动的教学计划生成蓝图
 *
 * 1 条：装配工艺工程师 → 三层路径 → 推荐章节骨架
 */
export const jobToPlanBlueprints: JobToPlanBlueprint[] = [
  {
    id: "jbp-mech-process-eng-001",
    professionId: "prof-mech",
    jobTitle: "装配工艺工程师（初级）",
    jobJDMaterialId: "kgmat-jd-process-engineer",
    pathway: {
      L1NodeIds: [
        "l1-demand-002",      // 工程图纸规范表达需求
        "l1-jc-003",          // 工艺规程与质量控制
        "l1-ab-001",          // 工程图样表达能力
        "l1-ab-003",          // 质量检测与工艺认知能力
        "l1-std-001",         // 工程图样表达课程标准
        "l1-std-003",         // 实训综合能力课程标准
      ],
      L2PlanIds: [
        "l2-plan-mech-draw",       // 机械制图与CAD（图纸表达基础）
        "l2-plan-mech-practice",   // 金工实习（切削加工与量具）
        "l2-plan-mech-tolerance",  // 互换性与技术测量（公差与配合）
      ],
      L3NodeIds: [
        "l3-kn-001",   // 制图与国标注解基础
        "l3-kn-007",   // 机件表达策略
        "l3-kn-008",   // 螺纹紧固与键销齿轮表达
        "l3-kn-009",   // 零件图技术要求
        "l3-kn-010",   // 装配图拆装与BOM语义
        "l3-kn-013",   // 车铣制造工艺入门
        "l3-sk-001",   // 形体分析与制图推理能力
        "l3-sk-004",   // （量具使用，在 kgL3 中未单独列出，由 l3-kn-009 承载）
        "l3-lit-001",  // 工程规范意识
      ],
    },
    recommendedChapters: [
      {
        title: "模块一：工程图样规范表达",
        sectionTitles: [
          "1.1 国家标准与图纸幅面",
          "1.2 字体、图线与尺寸标注基础",
          "1.3 机件表达策略与视图选型",
          "1.4 螺纹紧固件、键销与齿轮的规定表达",
        ],
        coveredL3NodeIds: ["l3-kn-001", "l3-kn-007", "l3-kn-008"],
      },
      {
        title: "模块二：零件图与装配图全流程",
        sectionTitles: [
          "2.1 零件图技术要求（公差—粗糙—形位综合）",
          "2.2 装配图识读与拆图演练",
          "2.3 基于真实零件的 BOM 对照练习",
        ],
        coveredL3NodeIds: ["l3-kn-009", "l3-kn-010", "l3-sk-001"],
      },
      {
        title: "模块三：制造工艺与测量对照",
        sectionTitles: [
          "3.1 车铣基本工序与工艺卡编制",
          "3.2 游标卡尺与图纸尺寸对读实训",
          "3.3 公差链计算与三坐标测量初步",
        ],
        coveredL3NodeIds: ["l3-kn-013", "l3-kn-009"],
      },
      {
        title: "模块四：工程规范意识与职业素养",
        sectionTitles: [
          "4.1 图纸规范核验流程（典型错误分析）",
          "4.2 工程文件追溯与 ECN 变更场景模拟",
        ],
        coveredL3NodeIds: ["l3-lit-001"],
      },
    ],
    generatedAt: "2026-01-22T14:00:00+08:00",
  },
];

export const jobBlueprintById: Record<string, JobToPlanBlueprint> = Object.fromEntries(
  jobToPlanBlueprints.map((b) => [b.id, b]),
);
