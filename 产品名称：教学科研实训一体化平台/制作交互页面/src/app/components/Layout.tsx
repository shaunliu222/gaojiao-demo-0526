import { ReactNode } from "react";
import { BookOpen, ClipboardList, PenTool, BarChart3, Users, Network, Library, FlaskConical, ChevronDown, Bell } from "lucide-react";
import { teacherById } from "../data/lookups";

// 当前登录教师（主线：李建国）
const CURRENT_TEACHER_ID = "t-li";

export type NavKey =
  | "plans"
  | "designs"
  | "hw-eval"
  | "exam-eval"
  | "class-profiles"
  | "student-profiles"
  | "graph"
  | "courses"
  | "resources"
  | "trainings";

export type ModuleKey = "teach" | "engine";

const teachMenu: { key: NavKey; label: string; icon: any }[] = [
  { key: "plans", label: "教学计划", icon: ClipboardList },
  { key: "designs", label: "教学设计", icon: PenTool },
  { key: "hw-eval", label: "作业评价", icon: BarChart3 },
  { key: "exam-eval", label: "考试评价", icon: BarChart3 },
  { key: "class-profiles", label: "班级档案", icon: Users },
  { key: "student-profiles", label: "学生档案", icon: Users },
];

const engineMenu: { key: NavKey; label: string; icon: any }[] = [
  { key: "graph", label: "知识图谱", icon: Network },
  { key: "courses", label: "课程中心", icon: BookOpen },
  { key: "resources", label: "教学资源库", icon: Library },
  { key: "trainings", label: "实训项目库", icon: FlaskConical },
];

export function Layout({
  module,
  setModule,
  nav,
  setNav,
  children,
}: {
  module: ModuleKey;
  setModule: (m: ModuleKey) => void;
  nav: NavKey;
  setNav: (n: NavKey) => void;
  children: ReactNode;
}) {
  const menu = module === "teach" ? teachMenu : engineMenu;
  const currentTeacher = teacherById(CURRENT_TEACHER_ID);
  const displayName = currentTeacher?.name ?? "—";
  const initial = displayName.charAt(0);
  return (
    <div className="flex flex-col h-full w-full bg-slate-50 text-slate-800">
      <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6 gap-6 shrink-0">
        <div className="flex items-center shrink-0">
          <img
            src="/logo-platform.svg"
            alt="教学科研实训一体化平台"
            className="h-9 w-auto max-w-[min(280px,42vw)] object-contain object-left"
          />
        </div>
        <nav className="flex items-center gap-1 ml-4">
          <button
            onClick={() => {
              setModule("teach");
              setNav("class-profiles");
            }}
            className={`px-4 py-1.5 rounded-full transition ${
              module === "teach" ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            智慧教学
          </button>
          <button
            onClick={() => {
              setModule("engine");
              setNav("graph");
            }}
            className={`px-4 py-1.5 rounded-full transition ${
              module === "engine" ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            学科知识引擎
          </button>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <button className="text-slate-500 hover:text-slate-800 relative">
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 size-2 rounded-full bg-rose-500" />
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-100">
            <span className="text-slate-500">教师端</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center">
              {initial}
            </div>
            <div className="flex flex-col leading-tight">
              <span>{displayName}</span>
              {currentTeacher?.title && (
                <span className="text-slate-400 text-[11px] truncate max-w-[180px]">
                  {currentTeacher.title}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>
      <div className="flex flex-1 min-h-0">
        <aside className="w-56 bg-white border-r border-slate-200 p-3 shrink-0">
          <div className="text-slate-400 px-3 py-2 uppercase tracking-wider text-[11px]">
            {module === "teach" ? "智慧教学" : "学科知识引擎"}
          </div>
          <ul className="space-y-1">
            {menu.map(({ key, label, icon: Icon }) => (
              <li key={key}>
                <button
                  onClick={() => setNav(key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition text-left ${
                    nav === key
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ title, actions, back }: { title: ReactNode; actions?: ReactNode; back?: () => void }) {
  return (
    <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 bg-white">
      {back && (
        <button onClick={back} className="text-slate-500 hover:text-slate-800 px-2 py-1 rounded-md hover:bg-slate-100">
          ← 返回
        </button>
      )}
      <div className="flex-1 text-slate-900">{title}</div>
      <div className="flex items-center gap-2">{actions}</div>
    </div>
  );
}

export function AiBadge({ children = "AI 生成" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-[11px]">
      ✦ {children}
    </span>
  );
}

export function StatusTag({ status }: { status: "草稿" | "进行中" | "已完成" | "异常" }) {
  const map: Record<string, string> = {
    草稿: "bg-slate-100 text-slate-600",
    进行中: "bg-blue-50 text-blue-700",
    已完成: "bg-emerald-50 text-emerald-700",
    异常: "bg-orange-50 text-orange-700",
  };
  return <span className={`px-2 py-0.5 rounded-md ${map[status]}`}>{status}</span>;
}
