import type { TeachingDesign } from "./types";

/**
 * 教学设计数据
 *
 * 主故事线焦点小节：
 *   plan-main · sec-3-2 "组合体三视图绘制"
 *
 * 三个 Tab（讲义/课堂/作业）均有完整产物、对话历史、技能工具引用。
 * 其他小节不提供具体设计（hasDesign=false 即可）。
 */
export const teachingDesigns: TeachingDesign[] = [
  // ========================================================================
  // 焦点小节 · 讲义设计
  // ========================================================================
  {
    id: "design-sec-3-2-handout",
    planId: "plan-main",
    sectionId: "sec-3-2",
    tab: "讲义",
    personaId: "persona-li-custom-1",
    knowledgeFiles: [
      { source: "resource_library", refId: "res-m-041", name: "组合体三视图绘制示范 · 轴承座" },
      { source: "resource_library", refId: "res-m-020", name: "三视图形成动态演示" },
      { source: "knowledge_base", refId: "kb-engdrawing", name: "工程制图知识库（全文检索）" },
      { source: "local", refId: "local-001", name: "李老师手写讲义扫描件.pdf" },
      { source: "internet", refId: "web-001", name: "SAE International 参考规范网页" },
    ],
    skillIds: ["skill-gen-mindmap", "skill-gen-microvideo", "skill-voice-tts"],
    mcpIds: ["mcp-solidworks", "mcp-textbook"],
    chatHistory: [
      {
        id: "msg-h-001",
        role: "user",
        content:
          "帮我为「组合体三视图绘制」这节课生成一份讲义。重点要突出形体分析法，并结合轴承座这个实际案例。讲义长度控制在 6-8 页。",
        createdAt: "2026-03-16T10:05:00+08:00",
      },
      {
        id: "msg-h-002",
        role: "assistant",
        content:
          "已根据李老师的「工程情境型」人设，结合资源库里的示范视频和三视图动画，生成 7 页讲义。大纲如下：\n1. 工程情境引入（轴承座实物照片 + 功能说明）\n2. 组合体构成方式（叠加/切割/综合三种）\n3. 形体分析法流程图\n4. 轴承座形体分解演示\n5. 逐部分绘制三视图（含关键节点截图）\n6. 组合体过渡线、相贯线处理要点\n7. 自查清单 + 课后思考题\n\n是否按此大纲生成 PDF 讲义和配套思维导图？",
        createdAt: "2026-03-16T10:05:45+08:00",
      },
      {
        id: "msg-h-003",
        role: "user",
        content: "很好，但第 6 页过渡线和相贯线内容可以简略——这些会在下个小节再讲。",
        createdAt: "2026-03-16T10:07:10+08:00",
      },
      {
        id: "msg-h-004",
        role: "assistant",
        content:
          "收到，第 6 页改为「常见绘图错误自查 3 例」，把过渡线相贯线改为「下节预告」。另外我发现讲义里关于「形体分析法」的流程图可以做成思维导图——要一并生成吗？",
        createdAt: "2026-03-16T10:07:40+08:00",
      },
      {
        id: "msg-h-005",
        role: "user",
        content: "好，思维导图一并生成。另外再生成一段 3 分钟的微课视频，主要讲「轴承座的形体分解过程」。",
        createdAt: "2026-03-16T10:09:00+08:00",
      },
      {
        id: "msg-h-006",
        role: "assistant",
        content:
          "已完成：\n✓ 7 页讲义 PDF（含自查清单）\n✓ 思维导图（PNG，支持交互查看）\n✓ 3 分 12 秒微课视频（AI 配音 + 轴承座分解动画）\n\n全部产物已生成，可在右侧面板查看。建议将视频在课前 24 小时推给学生做预热。",
        createdAt: "2026-03-16T10:11:20+08:00",
      },
    ],
    outputs: [
      {
        id: "out-h-001",
        type: "讲义pdf",
        title: "组合体三视图 · 讲义 v3.pdf",
        previewUrl: "/previews/out-h-001.png",
        sizeLabel: "6.2 MB",
        createdAt: "2026-03-16T10:11:00+08:00",
        summary: "7 页精排讲义，覆盖形体分析、案例演示、自查清单。",
        tags: ["讲义", "焦点小节"],
      },
      {
        id: "out-h-002",
        type: "思维导图",
        title: "形体分析法 · 思维导图.png",
        previewUrl: "/previews/out-h-002.png",
        sizeLabel: "1.3 MB",
        createdAt: "2026-03-16T10:11:10+08:00",
        summary: "5 大分支 · 18 个节点，配色清晰。",
        tags: ["导图", "焦点小节"],
      },
      {
        id: "out-h-003",
        type: "微课视频",
        title: "轴承座形体分解 · 3 分钟微课.mp4",
        previewUrl: "/previews/out-h-003.png",
        sizeLabel: "22 MB",
        durationLabel: "03:12",
        createdAt: "2026-03-16T10:11:20+08:00",
        summary: "AI 配音+三维动画，适合课前预习。",
        tags: ["视频", "预习"],
      },
    ],
    updatedAt: "2026-03-16T10:11:20+08:00",
  },

  // ========================================================================
  // 焦点小节 · 课堂设计
  // ========================================================================
  {
    id: "design-sec-3-2-class",
    planId: "plan-main",
    sectionId: "sec-3-2",
    tab: "课堂",
    personaId: "persona-preset-facilitator",
    knowledgeFiles: [
      { source: "resource_library", refId: "res-m-041", name: "组合体三视图绘制示范 · 轴承座" },
      { source: "resource_library", refId: "res-m-044", name: "轴承座 STL 模型" },
      { source: "local", refId: "local-002", name: "课堂抽查名单.xlsx" },
    ],
    skillIds: ["skill-gen-quiz", "skill-gen-h5"],
    mcpIds: ["mcp-solidworks"],
    chatHistory: [
      {
        id: "msg-c-001",
        role: "user",
        content:
          "根据讲义设计一次 135 分钟的课堂。要求：前 15 分钟复习 + 预习检查；中间 90 分钟讲解+练习；后 30 分钟小组实战；最后 15 分钟总结。每 15 分钟来个互动。",
        createdAt: "2026-03-17T09:20:00+08:00",
      },
      {
        id: "msg-c-002",
        role: "assistant",
        content:
          "已按互动型引导师的风格设计课堂。核心节奏：\n0-15min  【互动】5 道预习小测 + 三维模型竞猜\n15-45min 【讲授】形体分析法 + 轴承座分解\n45-60min 【互动】小组「命名每个子形体」挑战\n60-90min 【讲授】逐部分三视图绘制、过渡线处理\n90-105min【互动】找茬：展示一张错误图纸，限时 3 分钟找出 5 处错误\n105-135min【实战】支架组合体三视图 30 分钟现场作业\n已同步生成 PPT、课堂活动脚本、5 题预习测验、找茬互动 H5。",
        createdAt: "2026-03-17T09:21:30+08:00",
      },
      {
        id: "msg-c-003",
        role: "user",
        content: "找茬 H5 很棒。能不能生成一份课堂计时表给我打印带到教室？",
        createdAt: "2026-03-17T09:23:00+08:00",
      },
      {
        id: "msg-c-004",
        role: "assistant",
        content: "已生成课堂计时表 PDF（A4 一页版），包含时刻表、关键句提示和互动环节 SOP。",
        createdAt: "2026-03-17T09:24:10+08:00",
      },
    ],
    outputs: [
      {
        id: "out-c-001",
        type: "教案",
        title: "组合体三视图 · 教案 v2.docx",
        previewUrl: "/previews/out-c-001.png",
        sizeLabel: "280 KB",
        createdAt: "2026-03-17T09:22:00+08:00",
        summary: "135 分钟完整节奏教案，含互动提示词。",
        tags: ["教案"],
      },
      {
        id: "out-c-002",
        type: "PPT",
        title: "组合体三视图 · 课堂 PPT.pptx",
        previewUrl: "/previews/out-c-002.png",
        sizeLabel: "18.4 MB",
        createdAt: "2026-03-17T09:22:10+08:00",
        summary: "42 页 PPT，含三维旋转插件与互动页。",
        tags: ["PPT", "核心"],
      },
      {
        id: "out-c-003",
        type: "课堂活动",
        title: "找茬 H5 互动：错误三视图 5 处纠错",
        previewUrl: "/previews/out-c-003.png",
        createdAt: "2026-03-17T09:22:40+08:00",
        summary: "学生扫码进入，限时 3 分钟找错题。",
        tags: ["H5", "互动"],
      },
      {
        id: "out-c-004",
        type: "计时表",
        title: "课堂计时表 v2.pdf",
        previewUrl: "/previews/out-c-004.png",
        sizeLabel: "120 KB",
        createdAt: "2026-03-17T09:24:10+08:00",
        summary: "A4 一页打印版，含关键句和 SOP。",
        tags: ["计时表"],
      },
    ],
    updatedAt: "2026-03-17T09:24:10+08:00",
  },

  // ========================================================================
  // 焦点小节 · 作业设计
  // ========================================================================
  {
    id: "design-sec-3-2-homework",
    planId: "plan-main",
    sectionId: "sec-3-2",
    tab: "作业",
    personaId: "persona-preset-examiner",
    knowledgeFiles: [
      { source: "resource_library", refId: "res-m-022", name: "投影基础练习题库（100 题）" },
      { source: "resource_library", refId: "res-m-090", name: "《机械制图与CAD》期中题库" },
    ],
    skillIds: ["skill-gen-quiz", "skill-assign-grader"],
    mcpIds: ["mcp-autocad"],
    chatHistory: [
      {
        id: "msg-w-001",
        role: "user",
        content:
          "生成一份课后作业，要求：\n- 4 道基础题（熟悉形体分析）\n- 3 道应用题（完整绘制三视图）\n- 1 道综合题（带读图环节）\n- 总用时 90 分钟\n- 明确考察哪些知识点",
        createdAt: "2026-03-17T14:10:00+08:00",
      },
      {
        id: "msg-w-002",
        role: "assistant",
        content:
          "作业已生成，总用时约 88 分钟。题型分布：\n① 基础题 4 道（20 分，每题 5 分，共 20 min）——考察 kn-mech-030 组合体构成方式\n② 应用题 3 道（45 分，每题 15 分，共 45 min）——考察 kn-mech-031 三视图绘制 + kn-mech-034 形体分析\n③ 综合题 1 道（35 分，共 25 min）——考察 kn-mech-031 + kn-mech-033 看图能力\n\n已同时生成：\n✓ 学生 PDF 版\n✓ 教师答案版（含逐题 AI 评分 rubric）\n✓ AutoCAD 模板答题卡（可直接数字化提交）",
        createdAt: "2026-03-17T14:11:20+08:00",
      },
    ],
    outputs: [
      {
        id: "out-w-001",
        type: "客观题组卷",
        title: "组合体三视图 · 课后作业（学生版）.pdf",
        previewUrl: "/previews/out-w-001.png",
        sizeLabel: "1.4 MB",
        createdAt: "2026-03-17T14:11:00+08:00",
        summary: "4+3+1 题，90 分钟完成。",
        tags: ["作业", "焦点小节"],
      },
      {
        id: "out-w-002",
        type: "主观题",
        title: "组合体三视图 · 教师答案与评分 rubric.pdf",
        previewUrl: "/previews/out-w-002.png",
        sizeLabel: "1.7 MB",
        createdAt: "2026-03-17T14:11:10+08:00",
        summary: "含每题评分标准与常见错例参考。",
        tags: ["答案", "rubric"],
      },
      {
        id: "out-w-003",
        type: "实训任务",
        title: "AutoCAD 答题卡模板.dwg",
        previewUrl: "/previews/out-w-003.png",
        sizeLabel: "42 KB",
        createdAt: "2026-03-17T14:11:20+08:00",
        summary: "图层已预设，学生直接绘图提交。",
        tags: ["实训", "CAD"],
      },
    ],
    updatedAt: "2026-03-17T14:11:20+08:00",
  },
];

/** 按 (planId, sectionId) 查索引 */
export const designsBySection: Record<string, TeachingDesign[]> = teachingDesigns.reduce(
  (acc, d) => {
    const key = `${d.planId}::${d.sectionId}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(d);
    return acc;
  },
  {} as Record<string, TeachingDesign[]>
);
