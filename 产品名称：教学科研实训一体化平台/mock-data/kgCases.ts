import type { SchoolCase, IndustryProjectAsset } from "./types";

/**
 * 产业侧案例池（数据结构沿用 SchoolCase，便于兼容现有导出）
 *
 * IndustryProjectAsset：由案例池转化、可挂回 L2/L3 的产业课题资产
 */

const PROF = "prof-mech";

export const schoolCases: SchoolCase[] = [
  {
    id: "case-mech-001",
    professionId: PROF,
    title: "重型机床主轴箱装配图现场变更与尺寸链处置",
    description:
      "整机厂装配停线复盘：装配图版本与现场垫片规格冲突，通过 PLM 签审追溯与装配关键尺寸链封闭环复核恢复节拍。积累「版本—现场—ECN」闭环文字纪实与尺寸链核算要点。",
    origin: "某重工集团 · 装配工艺部（校企脱敏）",
    rawTags: ["装配", "尺寸链", "工程图版本", "ECN", "产线节拍"],
    importedAt: "2026-01-15T10:00:00+08:00",
  },
  {
    id: "case-mech-002",
    professionId: PROF,
    title: "商用车桥壳产线首件检验与量具一致性争议",
    description:
      "桥壳成品首件三坐标与产线通止规判定结论不一致，排查发现量具检定周期与温度补偿未对齐，以及检验作业指导书未覆盖热态工况。形成企业侧 8D 节选与检验路线修订说明。",
    origin: "某商用车部件厂 · 质保部",
    rawTags: ["首件检验", "三坐标", "量具", "质量控制", "产线"],
    importedAt: "2026-01-15T10:05:00+08:00",
  },
  {
    id: "case-mech-003",
    professionId: PROF,
    title: "新能源电驱壳体压铸缺陷与模具浇口返工",
    description:
      "一体化压铸壳体气孔与冷隔缺陷批量抬头；企业侧组织压射曲线、模温场与浇注系统仿真复核，产出参数窗口调整与排气维护 SOP。适合作为工艺与数字化协同的综合产业情境。",
    origin: "某新能源汽车压铸车间",
    rawTags: ["压铸", "模具", "工艺参数", "缺陷分析", "智能制造"],
    importedAt: "2026-01-15T10:10:00+08:00",
  },
  {
    id: "case-mech-004",
    professionId: PROF,
    title: "航空紧固件配套公差争议与测量仲裁",
    description:
      "主机厂与供应商对过渡配合判定存在分歧，涉及螺纹副与精密孔系位置度链；最终依据测量室恒温条件、探针校准记录与 ASME/国标选用规则完成仲裁说明。强调公差思维与测量溯源。",
    origin: "某航空零部件供应链 · 计量中心纪要",
    rawTags: ["公差", "精密测量", "供应链", "争议仲裁", "航空"],
    importedAt: "2026-01-15T10:15:00+08:00",
  },
];

export const industryProjectAssets: IndustryProjectAsset[] = [
  {
    id: "indproj-mech-001",
    professionId: PROF,
    title: "产线图纸规范化与首件量具一致性实训课题（产业案例转化）",
    fromCaseIds: ["case-mech-001", "case-mech-002"],
    industryContext:
      "装配与质检岗位常见痛点：图样版本与现场物料脱节、首件检验方法不统一导致误判。需同时训练国标图样表达与测量溯源意识。",
    problemStatement:
      "给定一批含典型标注与版本风险的装配/零件图摘录，以及一份存在「通止规 vs 三坐标」结论冲突的检验记录，学员需指出可能根因、给出可操作的现场排查顺序，并起草一页 ECN/检验指导修订要点。",
    deliverables: [
      "图纸与 PLM 版本核对表（条目级）",
      "关键尺寸链或测量路线说明（二选一深度稿）",
      "首件检验争议的根因假设与验证步骤清单",
    ],
    linkedNodes: [
      { nodeId: "l3-kn-001", layer: "L3", reason: "图线与国标规范" },
      { nodeId: "l3-kn-009", layer: "L3", reason: "零件图技术要求" },
      { nodeId: "l3-sk-002", layer: "L3", reason: "AutoCAD 出图技能" },
      { nodeId: "l3-lit-001", layer: "L3", reason: "工程规范意识素养" },
      { nodeId: "l2-plan-mech-draw", layer: "L2", reason: "制图与 CAD 标准课程计划" },
    ],
    status: "released",
  },
  {
    id: "indproj-mech-002",
    professionId: PROF,
    title: "公差链与精密测量验证课题（产业案例转化）",
    fromCaseIds: ["case-mech-004"],
    industryContext:
      "高端装备制造中，公差标注、测量条件与供应链责任边界紧密耦合；质检工程师需能读懂争议焦点并组织可复核的测量方案。",
    problemStatement:
      "给定孔轴配合与位置度链的图纸摘录及两份实验室原始记录，学员需复算封闭环、说明测量不确定度来源，并给出是否接收的判定逻辑（可附假设条件表）。",
    deliverables: [
      "尺寸链/公差链推算过程",
      "测量条件与仪器校准对结果影响的简要分析",
      "接收/拒收的判定说明（含留痕要求）",
    ],
    linkedNodes: [
      { nodeId: "l3-kn-009", layer: "L3", reason: "零件图技术要求（公差）" },
      { nodeId: "l3-sk-004", layer: "L3", reason: "量具使用技能" },
      { nodeId: "l2-plan-mech-tolerance", layer: "L2", reason: "互换性与测量标准课程计划" },
    ],
    status: "review",
  },
];

export const schoolCaseById: Record<string, SchoolCase> = Object.fromEntries(
  schoolCases.map((c) => [c.id, c]),
);

export const industryProjectAssetById: Record<string, IndustryProjectAsset> =
  Object.fromEntries(industryProjectAssets.map((p) => [p.id, p]));
