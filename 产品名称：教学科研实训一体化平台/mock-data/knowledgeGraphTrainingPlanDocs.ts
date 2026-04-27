import type { KnowledgeGraphTrainingPlanDocument } from "./types";

/**
 * 知识图谱页：与专业绑定的「人才培养方案」假文档
 * 用于点击文件名后在页面内展示正文（模拟已上传/已解析的 PDF/Word 内容）
 */
export const knowledgeGraphTrainingPlanDocuments: KnowledgeGraphTrainingPlanDocument[] =
  [
    {
      id: "kg-tpdoc-mech-2023",
      professionId: "prof-mech",
      fileName: "机械工程专业本科人才培养方案（2023版）.pdf",
      content: `机械工程专业本科人才培养方案（2023 版）· 文档摘录

文号：教字〔2023〕17 号 修订日期：2023 年 6 月

一、专业名称、代码与学制
专业名称：机械工程
专业代码：080201
基本学制：四年
授予学位：工学学士

二、培养目标
立足装备制造与智能生产一线，培养德智体美劳全面发展，具有扎实自然科学基础、工程实践能力和创新意识，能在机械产品设计与制造、生产系统运行与维护、技术管理与服务等岗位胜任工作的应用型工程技术人才。

三、毕业要求（工程教育认证框架节选）
1. 工程知识：掌握数学、自然科学、工程基础和专业知识，能用于复杂机械工程问题的恰当表述与建模。
2. 问题分析：能应用科学原理，结合文献研究，对机电产品设计、制造与运行中的复杂工程问题进行分析，并获得有效结论。
3. 设计/开发解决方案：能针对需求提出机械结构、工艺或系统方案，在设计中体现创新并考虑社会、健康、安全、文化及环境制约因素。

四、主干学科与核心课程
主干学科：机械工程、力学
核心课程：工程制图、理论力学、材料力学、机械原理、机械设计、机械制造基础、数控技术、机械工程控制基础等（具体开课学期见教学执行计划）。

五、实践教学
金工实习、生产实习、课程设计、毕业设计（论文）等实践环节累计不少于 40 周；鼓励学生参加学科竞赛与大学生创新创业训练计划。

六、说明
本方案由学院教学指导委员会审议，经学校教务处核准后执行；课程学分与教学进程以当年教务系统发布版本为准。`,
    },
  ];

const byId: Record<string, KnowledgeGraphTrainingPlanDocument> = Object.fromEntries(
  knowledgeGraphTrainingPlanDocuments.map((d) => [d.id, d]),
);

export function knowledgeGraphTrainingPlanDocumentById(
  id: string,
): KnowledgeGraphTrainingPlanDocument | undefined {
  return byId[id];
}
