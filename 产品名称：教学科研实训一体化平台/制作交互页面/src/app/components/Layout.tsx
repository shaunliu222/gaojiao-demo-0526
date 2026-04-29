import { ReactNode, useEffect, useRef, useState } from "react";
import {
  BookOpen,
  ClipboardList,
  ClipboardCheck,
  PenTool,
  ClipboardX,
  FileCheck,
  Users,
  Network,
  Library,
  FlaskConical,
  ChevronDown,
  ChevronRight,
  BookMarked,
  GraduationCap,
  Sparkles,
  Cpu,
  Check,
  AlertTriangle,
} from "lucide-react";
import { studentById, teacherById, classById } from "../data/lookups";

/** 教师端可切换账号（主任全量数据 / 普通教师仅本人数据） */
export const TEACHER_LOGIN_ACCOUNTS: Array<{ id: string; subtitle: string }> = [
  { id: "t-li", subtitle: "教研室主任 · 查看全部课程与资源" },
  { id: "t-wang", subtitle: "任课教师 · 仅查看本人相关数据" },
];

export type Role = "teacher" | "student" | "college_admin";

export type TeacherNavKey =
  | "plans"
  | "designs"
  | "hw-eval"
  | "exam-eval"
  | "class-learning"
  | "graph"
  | "courses"
  | "resources"
  | "trainings";

export type StudentNavKey =
  | "my-plans"
  | "learn-center"
  | "training-lab"
  | "my-profile";

export type NavKey = TeacherNavKey | StudentNavKey;

export type ModuleKey = "teach" | "engine";

type IconType = typeof ClipboardList;

interface MenuLeaf {
  kind: "item";
  key: NavKey;
  label: string;
  icon: IconType;
}

interface MenuGroup {
  kind: "group";
  key: string;
  label: string;
  icon: IconType;
  children: { key: NavKey; label: string; icon: IconType }[];
}

type MenuNode = MenuLeaf | MenuGroup;

const teachMenu: MenuNode[] = [
  { kind: "item", key: "plans", label: "教学计划", icon: ClipboardList },
  { kind: "item", key: "designs", label: "教学设计", icon: PenTool },
  {
    kind: "group",
    key: "collab-eval",
    label: "协同评价",
    icon: ClipboardCheck,
    children: [
      { key: "hw-eval", label: "作业评价", icon: FileCheck },
      { key: "exam-eval", label: "考试评价", icon: ClipboardX },
    ],
  },
  {
    kind: "item",
    key: "class-learning",
    label: "学情分析",
    icon: Users,
  },
];

const engineMenu: MenuNode[] = [
  { kind: "item", key: "graph", label: "知识图谱", icon: Network },
  { kind: "item", key: "courses", label: "课程中心", icon: BookOpen },
  { kind: "item", key: "resources", label: "教学资源库", icon: Library },
  { kind: "item", key: "trainings", label: "实训项目库", icon: FlaskConical },
];

const studentMenu: MenuNode[] = [
  { kind: "item", key: "my-plans", label: "学习计划", icon: BookMarked },
  { kind: "item", key: "learn-center", label: "学习中心", icon: Sparkles },
  { kind: "item", key: "training-lab", label: "实训中心", icon: Cpu },
  { kind: "item", key: "my-profile", label: "学情分析", icon: GraduationCap },
];

/** 可选学生身份（对照视角） */
const STUDENT_OPTIONS: Array<{ id: string; label: string }> = [
  { id: "s-mech2301-01", label: "张伟（机制 2301）" },
  { id: "s-mech2302-01", label: "陈浩宇（机制 2302）" },
];

function SidebarMenuList({
  nodes,
  nav,
  onPick,
  collapsedGroups,
  onToggleGroup,
}: {
  nodes: MenuNode[];
  nav: NavKey;
  onPick: (key: NavKey) => void;
  collapsedGroups: Record<string, boolean>;
  onToggleGroup: (key: string) => void;
}) {
  return (
    <ul className="space-y-1">
      {nodes.map((node) => {
        if (node.kind === "item") {
          const Icon = node.icon;
          const active = nav === node.key;
          return (
            <li key={node.key}>
              <button
                type="button"
                onClick={() => onPick(node.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition text-left ${
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon size={16} />
                <span>{node.label}</span>
              </button>
            </li>
          );
        }
        const GroupIcon = node.icon;
        const collapsed = !!collapsedGroups[node.key];
        const hasActiveChild = node.children.some((c) => c.key === nav);
        return (
          <li key={node.key}>
            <button
              type="button"
              onClick={() => onToggleGroup(node.key)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition text-left ${
                hasActiveChild
                  ? "bg-indigo-50/60 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <GroupIcon size={16} />
              <span className="flex-1">{node.label}</span>
              {collapsed ? (
                <ChevronRight
                  size={14}
                  className={hasActiveChild ? "text-indigo-400" : "text-slate-400"}
                />
              ) : (
                <ChevronDown
                  size={14}
                  className={hasActiveChild ? "text-indigo-400" : "text-slate-400"}
                />
              )}
            </button>
            {!collapsed && (
              <ul
                className={`mt-1 ml-3 pl-3 border-l space-y-0.5 ${
                  hasActiveChild ? "border-indigo-200" : "border-slate-200"
                }`}
              >
                {node.children.map((child) => {
                  const ChildIcon = child.icon;
                  const childActive = nav === child.key;
                  return (
                    <li key={child.key}>
                      <button
                        type="button"
                        onClick={() => onPick(child.key)}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md transition text-left ${
                          childActive
                            ? "bg-indigo-50 text-indigo-700"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <ChildIcon size={14} />
                        <span>{child.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function NavSection({
  title,
  icon: TitleIcon,
  iconClassName,
  children,
}: {
  title: string;
  icon: IconType;
  iconClassName: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-2.5">
      <div className="flex items-center gap-2.5 px-1.5 pt-0.5 pb-2.5">
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
        >
          <TitleIcon size={18} />
        </span>
        <span className="text-[0.9375rem] font-semibold text-slate-800 leading-snug">
          {title}
        </span>
      </div>
      {children}
    </section>
  );
}

export function Layout({
  pageTitle,
  module: _module,
  setModule: _setModule,
  onTeacherModuleNav,
  nav,
  setNav,
  role,
  setRole,
  teacherId,
  setTeacherId,
  studentId,
  setStudentId,
  children,
}: {
  pageTitle: string;
  module: ModuleKey;
  setModule: (m: ModuleKey) => void;
  onTeacherModuleNav: (m: ModuleKey, n: TeacherNavKey) => void;
  nav: NavKey;
  setNav: (n: NavKey) => void;
  role: Role;
  setRole: (r: Role, studentId?: string) => void;
  teacherId: string;
  setTeacherId: (id: string) => void;
  studentId: string;
  setStudentId: (id: string) => void;
  children: ReactNode;
}) {
  const currentTeacher = teacherById(teacherId);
  const currentStudent = studentById(studentId);
  const currentStudentClass = currentStudent
    ? classById(currentStudent.classId)
    : undefined;

  const displayName =
    role === "college_admin"
      ? "周敏"
      : role === "teacher"
      ? currentTeacher?.name ?? "—"
      : currentStudent?.name ?? "—";
  const initial = displayName.charAt(0);
  const subText =
    role === "college_admin"
      ? "学院办公室 · 教学秘书"
      : role === "teacher"
      ? currentTeacher?.title ?? ""
      : currentStudentClass
      ? `${currentStudentClass.name} · ${currentStudent?.studentNo ?? ""}`
      : "";

  // 分组折叠态（按 group key 索引）。默认全部展开。
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(
    {},
  );
  const toggleGroup = (key: string) =>
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  // 身份切换下拉
  const [identityOpen, setIdentityOpen] = useState(false);
  const identityRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!identityOpen) return;
    const handler = (e: MouseEvent) => {
      if (!identityRef.current) return;
      if (!identityRef.current.contains(e.target as Node)) {
        setIdentityOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [identityOpen]);

  const identitySummary =
    role === "college_admin"
      ? "学院管理"
      : role === "teacher"
      ? `教师端 · ${currentTeacher?.name ?? "—"}`
      : `学生端 · ${currentStudent?.name ?? "—"}`;

  const isStudent = role === "student";

  const avatarCls =
    role === "college_admin"
      ? "bg-gradient-to-br from-slate-600 to-slate-800"
      : isStudent
      ? currentStudent?.gender === "女"
        ? "bg-gradient-to-br from-pink-400 to-rose-500"
        : "bg-gradient-to-br from-blue-400 to-indigo-500"
      : "bg-gradient-to-br from-amber-400 to-orange-500";

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 text-slate-800">
      <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 md:px-6 gap-4 md:gap-6 shrink-0">
        <div className="flex items-center shrink-0">
          <img
            src={`${import.meta.env.BASE_URL}logo-platform.svg`}
            alt="教学科研实训一体化平台"
            className="w-auto object-contain object-left h-[1.125rem] max-w-[min(8.75rem,21vw)]"
          />
        </div>
        <div
          className="min-w-0 shrink max-w-[min(22.5rem,38vw)] pl-1 border-l border-slate-200 ml-1"
          title={pageTitle}
        >
          <span className="block truncate text-[0.9375rem] font-semibold text-slate-800 leading-tight">
            {pageTitle}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          {/* 身份切换下拉 */}
          <div ref={identityRef} className="relative">
            <button
              onClick={() => setIdentityOpen((v) => !v)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition ${
                identityOpen
                  ? "bg-indigo-50 text-indigo-700"
                  : "hover:bg-slate-100 text-slate-600"
              }`}
            >
              <span>{identitySummary}</span>
              <ChevronDown
                size={14}
                className={`transition ${
                  identityOpen ? "rotate-180 text-indigo-500" : "text-slate-400"
                }`}
              />
            </button>
            {identityOpen && (
              <div className="absolute right-0 top-[calc(100%+6px)] w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-20">
                <div className="px-3 py-1.5 text-slate-400 text-[0.6875rem] uppercase tracking-wider">
                  切换身份
                </div>
                <IdentityOption
                  active={role === "college_admin"}
                  icon={<Network size={14} />}
                  title="学院管理 · 周敏"
                  subtitle="可创建 / 编辑知识图谱"
                  onClick={() => {
                    setRole("college_admin");
                    setIdentityOpen(false);
                  }}
                />
                <div className="my-1 border-t border-slate-100" />
                <div className="px-3 py-1 text-slate-400 text-[0.6875rem] uppercase tracking-wider">
                  教师端
                </div>
                {TEACHER_LOGIN_ACCOUNTS.map((acc) => {
                  const t = teacherById(acc.id);
                  return (
                    <IdentityOption
                      key={acc.id}
                      active={role === "teacher" && teacherId === acc.id}
                      icon={<PenTool size={14} />}
                      title={t ? `${t.name} · ${t.title}` : acc.id}
                      subtitle={acc.subtitle}
                      onClick={() => {
                        setTeacherId(acc.id);
                        setRole("teacher");
                        setIdentityOpen(false);
                      }}
                    />
                  );
                })}
                <div className="my-1 border-t border-slate-100" />
                {STUDENT_OPTIONS.map((opt) => (
                  <IdentityOption
                    key={opt.id}
                    active={role === "student" && studentId === opt.id}
                    icon={<GraduationCap size={14} />}
                    title={opt.label}
                    onClick={() => {
                      setRole("student", opt.id);
                      setIdentityOpen(false);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`size-8 rounded-full text-white flex items-center justify-center ${avatarCls}`}
            >
              {initial}
            </div>
            <div className="hidden md:flex flex-col leading-tight">
              <span>{displayName}</span>
              {subText && (
                <span className="text-slate-400 text-[0.6875rem] truncate max-w-[11.25rem]">
                  {subText}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>
      <div className="flex flex-1 min-h-0">
        <aside className="w-52 xl:w-60 bg-white border-r border-slate-200 p-3 shrink-0 overflow-y-auto flex flex-col gap-3">
          {role === "teacher" && (
            <div className="flex flex-col gap-4">
              <NavSection
                title="智慧教学"
                icon={PenTool}
                iconClassName="bg-amber-100 text-amber-800"
              >
                <SidebarMenuList
                  nodes={teachMenu}
                  nav={nav}
                  onPick={(k) => onTeacherModuleNav("teach", k as TeacherNavKey)}
                  collapsedGroups={collapsedGroups}
                  onToggleGroup={toggleGroup}
                />
              </NavSection>
              <NavSection
                title="专业知识引擎"
                icon={Network}
                iconClassName="bg-indigo-100 text-indigo-700"
              >
                <SidebarMenuList
                  nodes={engineMenu}
                  nav={nav}
                  onPick={(k) => onTeacherModuleNav("engine", k as TeacherNavKey)}
                  collapsedGroups={collapsedGroups}
                  onToggleGroup={toggleGroup}
                />
              </NavSection>
            </div>
          )}

          {role === "college_admin" && (
            <NavSection
              title="专业知识引擎"
              icon={Network}
              iconClassName="bg-indigo-100 text-indigo-700"
            >
              <SidebarMenuList
                nodes={engineMenu}
                nav={nav}
                onPick={setNav}
                collapsedGroups={collapsedGroups}
                onToggleGroup={toggleGroup}
              />
            </NavSection>
          )}

          {role === "student" && (
            <NavSection
              title="学生端"
              icon={GraduationCap}
              iconClassName="bg-violet-100 text-violet-800"
            >
              <SidebarMenuList
                nodes={studentMenu}
                nav={nav}
                onPick={setNav}
                collapsedGroups={collapsedGroups}
                onToggleGroup={toggleGroup}
              />
            </NavSection>
          )}

          {/* 学生端 · 陈浩宇视角：学情补救提示 */}
          {role === "student" && studentId === "s-mech2302-01" && (
            <div className="mt-4 mx-1 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex gap-2">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <div className="leading-snug">
                AI 已根据你的学情，为你定制了补救路径。
              </div>
            </div>
          )}
        </aside>
        <main className="flex-1 min-h-0 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

function IdentityOption({
  active,
  icon,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  title: string;
  subtitle?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left ${
        active
          ? "bg-indigo-50 text-indigo-700"
          : "text-slate-700 hover:bg-slate-50"
      }`}
    >
      <span
        className={`size-6 rounded-md flex items-center justify-center ${
          active ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500"
        }`}
      >
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="truncate">{title}</span>
        </div>
        {subtitle && (
          <div className="text-slate-400 text-[0.6875rem] truncate">{subtitle}</div>
        )}
      </div>
      {active && <Check size={14} className="text-indigo-500 shrink-0" />}
    </button>
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
      <div className="flex-1 min-w-0 text-slate-900">{title}</div>
      <div className="flex items-center gap-2">{actions}</div>
    </div>
  );
}

export function AiBadge({ children = "AI 生成" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-[0.6875rem]">
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
