import type { PlanSectionResourceItem } from "./types";

const key = (planId: string, sectionId: string) => `${planId}::${sectionId}`;

/**
 * 各计划小节预设的「本节已有资源」演示数据。
 * 运行时上传的附件仅存于前台 state，不写回本列表。
 */
const data: Record<string, PlanSectionResourceItem[]> = {
  [key("plan-main", "sec-3-2")]: [
    {
      id: "psr-m-sec32-1",
      planId: "plan-main",
      sectionId: "sec-3-2",
      title: "复习用·制图基础课件摘录",
      resourceId: "res-m-002",
      displayName: "制图基础概述 · 第一讲课件.pptx",
      kind: "ppt",
      status: "published",
      uploaderTeacherId: "t-li",
      updatedAt: "2026-03-17T09:00:00+08:00",
      sizeMb: 8.6,
    },
    {
      id: "psr-m-sec32-2",
      planId: "plan-main",
      sectionId: "sec-3-2",
      title: "形体分析练习题解",
      resourceId: "res-m-010",
      displayName: "圆弧连接 20 例精讲.pdf",
      kind: "doc",
      status: "published",
      uploaderTeacherId: "t-li",
      updatedAt: "2026-03-16T14:30:00+08:00",
      sizeMb: 4.2,
    },
    {
      id: "psr-m-sec32-3",
      planId: "plan-main",
      sectionId: "sec-3-2",
      title: "课堂板演·组合体白板草图草稿",
      displayName: "sec32-board-draft.png",
      kind: "image",
      status: "draft",
      uploaderTeacherId: "t-li",
      updatedAt: "2026-03-17T08:45:00+08:00",
      sizeMb: 0.4,
    },
  ],
  [key("plan-main", "sec-1-1")]: [
    {
      id: "psr-m-sec11-1",
      planId: "plan-main",
      sectionId: "sec-1-1",
      title: "强制性国标·幅面与格式全文",
      resourceId: "res-m-001",
      displayName: "GB/T 14689-2008 技术制图.pdf",
      kind: "doc",
      status: "published",
      uploaderTeacherId: "t-li",
      updatedAt: "2026-02-22T10:00:00+08:00",
      sizeMb: 1.4,
    },
  ],
  [key("plan-main", "sec-3-4")]: [
    {
      id: "psr-m-sec34-1",
      planId: "plan-main",
      sectionId: "sec-3-4",
      title: "截交相贯示意视频（预习）",
      resourceId: "res-m-011",
      displayName: "椭圆四心近似法动画演示.mp4",
      kind: "video",
      status: "published",
      uploaderTeacherId: "t-wang",
      updatedAt: "2026-03-23T09:30:00+08:00",
      sizeMb: 35,
    },
  ],
  [key("plan-wang-metalwork", "sec-wgw-1-2")]: [
    {
      id: "psr-wgw-12-1",
      planId: "plan-wang-metalwork",
      sectionId: "sec-wgw-1-2",
      title: "游标卡尺读数练习单（现场发）",
      displayName: "caliper-read-drill.pdf",
      kind: "doc",
      status: "published",
      uploaderTeacherId: "t-wang",
      updatedAt: "2026-03-04T16:00:00+08:00",
      sizeMb: 0.6,
    },
    {
      id: "psr-wgw-12-2",
      planId: "plan-wang-metalwork",
      sectionId: "sec-wgw-1-2",
      title: "车间量具与图纸对表示范照片",
      displayName: "shop-measure-demo.jpg",
      kind: "image",
      status: "draft",
      uploaderTeacherId: "t-wang",
      updatedAt: "2026-03-05T07:50:00+08:00",
      sizeMb: 1.2,
    },
  ],
};

export function planSectionResourcesSeed(
  planId: string,
  sectionId: string,
): PlanSectionResourceItem[] {
  return [...(data[key(planId, sectionId)] ?? [])];
}
