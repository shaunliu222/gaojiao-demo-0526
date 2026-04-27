import { Construction } from "lucide-react";
import { PageHeader } from "./Layout";

export function Placeholder({ title, desc }: { title: string; desc?: string }) {
  return (
    <div>
      <PageHeader title={title} />
      <div className="p-16 flex flex-col items-center justify-center text-center">
        <div className="size-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-4">
          <Construction size={28} />
        </div>
        <div className="text-slate-900 mb-1">该页面建设中</div>
        <p className="text-slate-500 max-w-md">
          {desc ?? "按主故事线仅实现关键页面：班级档案 · 教学计划 · 教学设计 · 作业评价 · 知识图谱。"}
        </p>
      </div>
    </div>
  );
}
