import type { ReactNode } from "react";
import {
  ArrowLeft,
  BookmarkCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Headset,
  Library,
  ListChecks,
  Paperclip,
  Send,
  User,
  Users,
} from "lucide-react";
import { graphNodeById } from "../../data/lookups";
import type {
  ChatRole,
  LearnCenterAgentMessage,
  LearnCenterResourceItem,
  ResourceContentKind,
  ResourceContentPage,
} from "../../data/learnCenterSession";
import {
  inferContentKindForItem,
  resourceContentOutlineItems,
} from "../../data/learnCenterSession";

/** 课堂 / 作业 / 实训共用的对话区样式（与 ClassStudy 对齐） */
export function ShellChatPanel({
  subtitle,
  messages,
  emptyHint,
  inputValue,
  onInputChange,
  onSend,
  placeholder,
  showPaperclip = false,
  roleSlot,
  belowInput,
  showMessageList = true,
  stretch = false,
  embedded = false,
}: {
  subtitle?: string;
  messages: LearnCenterAgentMessage[];
  emptyHint?: string;
  inputValue: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  placeholder: string;
  showPaperclip?: boolean;
  roleSlot: ReactNode;
  belowInput?: ReactNode;
  /** 为 false 且无消息时隐藏消息列表（课堂：尚未发起对话） */
  showMessageList?: boolean;
  /** 在外层 flex 列中占满剩余高度 */
  stretch?: boolean;
  /** 嵌在大卡片内：去掉外层描边与圆角，避免双层边框 */
  embedded?: boolean;
}) {
  const listVisible = showMessageList || messages.length > 0;
  const shell = embedded
    ? `flex flex-col overflow-hidden bg-slate-50/30 ${stretch ? "flex-1 min-h-0 min-w-0" : ""}`
    : `flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm ${
        stretch ? "flex-1 min-h-0" : ""
      }`;
  return (
    <div className={shell}>
      {subtitle ? (
        <div className="shrink-0 px-3 py-2 border-b border-slate-100 bg-slate-50/90">
          <span className="text-slate-600 text-[0.8125rem]">{subtitle}</span>
        </div>
      ) : null}
      {listVisible ? (
        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2.5 space-y-3 bg-slate-50/40">
          {messages.length > 0 ? (
            messages.map((m) => {
              const isStudent = m.speaker === "student";
              return (
                <div key={m.id} className={`flex ${isStudent ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[min(85%,24rem)] px-3.5 py-2.5 rounded-2xl text-[0.8125rem] ${
                      isStudent
                        ? "bg-indigo-600 text-white rounded-br-sm"
                        : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm"
                    }`}
                  >
                    {!isStudent && (
                      <div className="text-slate-500 text-[0.6875rem] mb-1">{m.name}</div>
                    )}
                    <p className="leading-relaxed whitespace-pre-line">{m.content}</p>
                  </div>
                </div>
              );
            })
          ) : emptyHint ? (
            <div className="text-slate-400 text-[0.8125rem] py-6 text-center leading-relaxed max-w-md mx-auto">
              {emptyHint}
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="shrink-0 flex flex-col gap-1.5 border-t border-slate-200/60 bg-slate-50 px-2.5 py-1.5">
        <div
          className="flex items-center justify-center gap-3 pt-0.5 pb-0.5"
          role="group"
          aria-label="对话身份"
        >
          {roleSlot}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1 min-w-0 h-9 flex items-stretch gap-1 rounded-md border border-slate-200/90 bg-white px-1.5">
            {showPaperclip ? (
              <button
                type="button"
                className="shrink-0 self-center p-0.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                aria-label="添加附件"
              >
                <Paperclip size={16} />
              </button>
            ) : null}
            <textarea
              value={inputValue}
              rows={1}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSend();
              }}
              placeholder={placeholder}
              className="min-h-0 min-w-0 flex-1 self-stretch max-h-9 bg-transparent outline-none border-0 resize-none py-1.5 text-[0.75rem] leading-5 focus:ring-0 placeholder:text-slate-400"
            />
          </div>
          <button
            type="button"
            onClick={onSend}
            className="shrink-0 flex h-9 items-center justify-center gap-0.5 rounded-md bg-indigo-600 px-2.5 text-white hover:bg-indigo-700 text-[0.75rem]"
          >
            <Send size={14} /> 发送
          </button>
        </div>
        {belowInput}
      </div>
    </div>
  );
}

export function ShellChatRoleButtons({
  chatRole,
  onRoleChange,
}: {
  chatRole: ChatRole;
  onRoleChange: (r: ChatRole) => void;
}) {
  const roles = [
    {
      id: "teacher" as const,
      label: "智能教师",
      shortLabel: "教师",
      icon: User,
      faceClass: "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm",
    },
    {
      id: "assistant" as const,
      label: "助教",
      shortLabel: "助教",
      icon: Headset,
      faceClass: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm",
    },
    {
      id: "peer" as const,
      label: "同学",
      shortLabel: "同学",
      icon: Users,
      faceClass: "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm",
    },
  ] as const;

  return (
    <>
      {roles.map((r) => {
        const Icon = r.icon;
        const on = chatRole === r.id;
        return (
          <button
            key={r.id}
            type="button"
            title={r.label}
            aria-label={r.label}
            aria-pressed={on}
            onClick={() => onRoleChange(r.id)}
            className={`flex flex-col items-center gap-0.5 min-w-[2.75rem] transition ${
              on ? "scale-[1.04]" : "opacity-90 hover:opacity-100"
            }`}
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-shadow ${
                on
                  ? `${r.faceClass} border-2 border-indigo-500/90 shadow-[0_6px_20px_-4px_rgba(79,70,229,0.45)]`
                  : `${r.faceClass} border-[0.1875rem] border-white shadow-md`
              }`}
            >
              <Icon size={18} strokeWidth={2} className="shrink-0 pointer-events-none drop-shadow-sm" aria-hidden />
            </span>
            <span
              className={`text-[0.625rem] leading-none ${
                on ? "text-indigo-700 font-medium" : "text-slate-500"
              }`}
            >
              {r.shortLabel}
            </span>
          </button>
        );
      })}
    </>
  );
}

export function ResourceContentView({
  kind,
  page,
  pageIndex,
  pageTotal,
  onPrev,
  onNext,
}: {
  kind: ResourceContentKind;
  page: ResourceContentPage;
  pageIndex: number;
  pageTotal: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const atFirst = pageIndex <= 0;
  const atLast = pageIndex >= pageTotal - 1;
  const paginationBar =
    pageTotal > 1 ? (
      <div className="shrink-0 border-t border-slate-100 bg-white/98 px-2 py-2.5">
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={onPrev}
            disabled={atFirst}
            className="inline-flex items-center gap-0.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[0.75rem] text-slate-600 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-50"
          >
            <ChevronLeft size={14} /> 上一页
          </button>
          <span className="text-slate-500 text-[0.75rem] tabular-nums">
            第 {pageIndex + 1} / {pageTotal} 页
          </span>
          <button
            type="button"
            onClick={onNext}
            disabled={atLast}
            className="inline-flex items-center gap-0.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[0.75rem] text-slate-600 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-50"
          >
            下一页 <ChevronRight size={14} />
          </button>
        </div>
      </div>
    ) : null;

  /** 外层占满中部区域，正文可滚动；翻页条固定在卡片底部（多页时出现） */
  const shellClass = "flex flex-col flex-1 min-h-0 w-full";

  if (kind === "ppt") {
    return (
      <div className={shellClass}>
        <div className="flex-1 min-h-0 flex flex-col min-w-0 overflow-hidden px-1">
          <div className="flex-1 min-h-0 rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-sm flex flex-col p-4 sm:p-6 overflow-hidden">
            <div className="text-[0.65rem] text-slate-400 mb-1 shrink-0">幻灯 {page.pageNo}</div>
            <div className="text-slate-900 font-semibold text-[clamp(0.875rem,1.6vw,1.05rem)] leading-snug line-clamp-2 shrink-0">
              {page.title.replace(/^第 \d+ 页 · /, "")}
            </div>
            <div className="mt-3 flex-1 min-h-0 overflow-y-auto text-slate-600 text-[0.8125rem] sm:text-[0.875rem] leading-relaxed whitespace-pre-line">
              {page.body}
            </div>
          </div>
        </div>
        {paginationBar}
      </div>
    );
  }

  if (kind === "document") {
    return (
      <div className={shellClass}>
        <div className="flex-1 min-h-0 overflow-y-auto min-w-0 px-1">
          <div className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-baseline justify-between gap-2 border-b border-slate-100 pb-2">
              <span className="text-slate-900 font-medium text-[0.9rem]">{page.title}</span>
              <span className="text-slate-400 text-[0.65rem] shrink-0">第 {page.pageNo} 页</span>
            </div>
            <div className="mt-3 text-slate-700 text-[0.8125rem] sm:text-[0.875rem] leading-relaxed whitespace-pre-line pb-2">
              {page.body}
            </div>
          </div>
        </div>
        {paginationBar}
      </div>
    );
  }

  if (kind === "video") {
    return (
      <div className={shellClass}>
        <div className="flex-1 min-h-0 overflow-y-auto min-w-0 px-1">
          <div className="rounded-xl border border-slate-200 bg-slate-900/5 p-4 min-h-[8rem]">
            <div className="text-slate-600 text-[0.75rem] font-medium mb-2">{page.title}</div>
            <pre className="text-slate-700 text-[0.75rem] leading-relaxed whitespace-pre-wrap font-sans">
              {page.body}
            </pre>
          </div>
        </div>
        {paginationBar}
      </div>
    );
  }

  return (
    <div className={shellClass}>
      <div className="flex-1 min-h-0 overflow-y-auto min-w-0 px-1">
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 text-slate-800 min-h-[8rem]">
          <div className="text-[0.65rem] text-indigo-600/80 mb-1">屏 {page.pageNo}</div>
          <div className="font-medium text-[0.875rem] mb-2">{page.title}</div>
          <div className="text-[0.8125rem] leading-relaxed whitespace-pre-line text-slate-700">
            {page.body}
          </div>
        </div>
      </div>
      {paginationBar}
    </div>
  );
}

export function ResourceOutlineAside({
  fileTitle,
  outline,
  activePageIndex,
  onPickPage,
  onBackToList,
  fillHeight = false,
}: {
  fileTitle: string;
  outline: ReturnType<typeof resourceContentOutlineItems>;
  activePageIndex: number;
  onPickPage: (index: number) => void;
  onBackToList: () => void;
  /** 与右侧主区同高，底部对齐 */
  fillHeight?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 p-4 ${
        fillHeight ? "h-full min-h-0 flex flex-col" : ""
      }`}
    >
      <button
        type="button"
        onClick={onBackToList}
        className="w-full flex items-center gap-1.5 text-[0.8125rem] text-indigo-600 hover:text-indigo-800 mb-2"
      >
        <ArrowLeft size={14} className="shrink-0" /> 学习资料
      </button>
      <div className="text-slate-500 text-[0.65rem] mb-0.5">当前文件</div>
      <div className="text-slate-900 text-[0.8125rem] font-medium line-clamp-2 mb-3" title={fileTitle}>
        {fileTitle}
      </div>
      <div className="text-slate-500 text-[0.75rem] mb-2 flex items-center gap-1.5 shrink-0">
        <ListChecks size={12} className="text-indigo-500 shrink-0" /> 大纲
      </div>
      {outline.length === 0 ? (
        <div className="text-slate-400 text-[0.75rem] py-2">暂无页结构</div>
      ) : (
        <ol
          className={`space-y-1 overflow-y-auto pr-0.5 ${
            fillHeight ? "flex-1 min-h-0" : "max-h-[min(50vh,22rem)]"
          }`}
        >
          {outline.map((item) => {
            const active = item.pageIndex === activePageIndex;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onPickPage(item.pageIndex)}
                  className={`w-full text-left rounded-lg px-2 py-1.5 text-[0.75rem] leading-snug border transition ${
                    active
                      ? "border-indigo-300 bg-indigo-50 text-indigo-900"
                      : "border-transparent text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-slate-400 mr-1">{item.pageIndex + 1}.</span>
                  {item.label}
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

export function TeacherResourceList({
  items,
  selectedId,
  onSelect,
  listTitle = "学习资料",
  fillHeight = false,
}: {
  items: LearnCenterResourceItem[];
  selectedId?: string;
  onSelect: (id: string) => void;
  listTitle?: string;
  /** 与右侧主区同高，底部对齐；列表区域在卡片内滚动 */
  fillHeight?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 p-4 ${
        fillHeight ? "h-full min-h-0 flex flex-col" : ""
      }`}
    >
      <div className="text-slate-900 flex items-center gap-2 mb-3 shrink-0">
        <Library size={14} className="text-indigo-500" /> {listTitle}
      </div>
      {items.length === 0 ? (
        <div className="text-slate-400 text-sm py-6 text-center">暂无资料</div>
      ) : (
        <div
          className={`space-y-2 overflow-y-auto pr-0.5 ${
            fillHeight ? "flex-1 min-h-0" : "max-h-[min(60vh,28rem)]"
          }`}
        >
          {items.map((item) => {
            const active = item.id === selectedId;
            const contentKind = inferContentKindForItem(item.type, item.title);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className={`w-full text-left rounded-xl border p-3 transition ${
                  active
                    ? "border-indigo-300 bg-indigo-50/70"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="text-slate-500 text-[0.6875rem]">
                  {item.type}
                  {item.tabLabel ? ` · ${item.tabLabel}` : ""}
                </div>
                <div className="text-slate-900 text-[0.875rem] line-clamp-2 mt-0.5">
                  {item.title}
                </div>
                {contentKind !== "document" ? (
                  <p className="text-slate-500 text-[0.75rem] line-clamp-2 mt-1 leading-relaxed">
                    {item.summary}
                  </p>
                ) : null}
                {item.metaLabel && (
                  <div className="text-slate-400 text-[0.625rem] mt-1">{item.metaLabel}</div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function MasteryPanel({
  goalNodes,
  mastered,
  onToggle,
}: {
  goalNodes: Array<NonNullable<ReturnType<typeof graphNodeById>>>;
  mastered: boolean[];
  onToggle: (idx: number) => void;
}) {
  const rows =
    goalNodes.length > 0
      ? goalNodes
      : [
          { id: "x-1", name: "核心概念" },
          { id: "x-2", name: "典型例题" },
          { id: "x-3", name: "常见误区" },
        ];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-slate-500 mb-2 flex items-center gap-1.5">
        <BookmarkCheck size={14} className="text-indigo-500" />
        已掌握检查
      </div>
      <div className="text-slate-900 mb-2">
        {mastered.filter(Boolean).length}/{mastered.length} 目标
      </div>
      <div className="space-y-1.5">
        {rows.map((node, idx) => {
          const ok = !!mastered[idx];
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => onToggle(idx)}
              className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md ${
                ok
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {ok ? (
                <CheckCircle2 size={14} />
              ) : (
                <span className="size-3.5 rounded-full border-2 border-slate-300" />
              )}
              <span>{node.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
