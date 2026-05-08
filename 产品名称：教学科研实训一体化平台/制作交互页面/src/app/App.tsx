import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Layout,
  NavKey,
  ModuleKey,
  Role,
  TeacherNavKey,
  StudentNavKey,
} from "./components/Layout";
import {
  courseById,
  classIdsVisibleToTeacher,
  classProfileByClassId,
  defaultLearningClassIdForTeacher,
  examById,
  flattenPlanSections,
  homeworkById,
  nextSectionId,
  planById,
  resourceById,
  studentById,
} from "./data/lookups";
import { LearningAnalyticsHub } from "./components/ClassProfiles";
import { PlansList, PlanDetail } from "./components/Plans";
import { PlanWizard } from "./components/PlanWizard";
import { DesignWorkbench } from "./components/DesignWorkbench";
import { DesignLearningAdjustWorkbench } from "./components/DesignLearningAdjustWorkbench";
import { DesignDashboard } from "./components/DesignDashboard";
import { PlanSectionResourcesPage } from "./components/PlanSectionResourcesPage";
import { HwOverview, HwDetail } from "./components/HomeworkEval";
import { ExamOverview, ExamDetail } from "./components/ExamEval";
import { CourseList, CourseDetail } from "./components/Courses";
import { ResourceLibrary } from "./components/ResourceLibrary";
import { GraphBrowse, ResourceDetail } from "./components/Graph";
import { PersonnelManagement } from "./components/PersonnelManagement";
import {
  MyPlansList,
  MyPlanDetail,
  type StudentLearnNavigateInput,
} from "./components/student/MyPlans";
import { LearnCenter, type LearnCenterHubSectionId } from "./components/student/LearnCenter";
import { ClassStudy } from "./components/student/ClassStudy";
import { HomeworkWorkbench } from "./components/student/HomeworkWorkbench";
import {
  findPlanSection,
  findSectionIdByKnowledgeNode,
  getStudentPlans,
  normalizeStudentChapterPointIdsToGraphNodes,
} from "./data/learnCenterSession";
import { MyProfile } from "./components/student/MyProfile";
import { findResumeSectionId } from "./data/studentMock";
import {
  DEMO_DESIGN_PLAN_ID,
  DEMO_DESIGN_SECTION_ID,
  PLAN_WANG_HAIFENG_MOCK_ID,
  type Resource,
} from "@mock";

type TeacherView =
  | { k: "learning-analytics"; classId: string; selectedStudentId?: string }
  | { k: "plans-list" }
  | { k: "plan-wizard" }
  | { k: "plan-detail"; id: string; focusSectionId?: string }
  | {
      k: "section-resources";
      planId: string;
      sectionId: string;
      /** 从教学计划详情返回计划 id */
      fromPlanId?: string;
      /** 从教学设计看板进入 */
      fromDashboard?: boolean;
    }
  | { k: "design-dashboard" }
  | {
      k: "design";
      planId: string;
      sectionId: string;
      fromPlanId?: string;
      fromDashboard?: boolean;
      /** 从「本节资源」页进入教学设计，返回时回到该页 */
      fromSectionResources?: boolean;
      /** 从协同评价作业/考试详情进入「教学设计调整」工作台时的返回目标 */
      evalAdjustReturn?: { source: "hw" | "exam"; detailId: string };
      progressSectionId?: string;
      reviewSectionIds?: string[];
    }
  | { k: "hw-overview" }
  | { k: "hw-detail"; id: string }
  | { k: "exam-overview" }
  | { k: "exam-detail"; id: string }
  | { k: "graph"; focusNodeId?: string }
  | { k: "course-list" }
  | { k: "course-detail"; id: string }
  | { k: "resource-list" }
  | { k: "resource-detail"; id: string; from?: "graph" | "library" | "course" }
  | { k: "personnel-mgmt" };

type StudentView =
  | { k: "my-plans-list" }
  | { k: "my-plan-detail"; id: string }
  | {
      k: "learn-center";
      initialPlanId?: string;
      hubSection?: LearnCenterHubSectionId;
    }
  | {
      k: "class-study";
      planId: string;
      sectionId: string;
      focus: "课堂" | "讲义";
      goalNodeIds?: string[];
    }
  | { k: "homework-workbench"; homeworkId: string }
  | { k: "my-profile" };

type View = TeacherView | StudentView;

const PLATFORM_TITLE = "教学科研实训一体化平台";

/** 从学习计划等入口解析「课堂壳」路由；仅有 goalNodeIds 时挂靠学生首个班级计划 */
function resolveClassStudyEntry(
  studentId: string,
  opts?: StudentLearnNavigateInput,
): { planId: string; sectionId: string; goalNodeIds?: string[] } | null {
  const normalizedGoals = opts?.goalNodeIds?.length
    ? normalizeStudentChapterPointIdsToGraphNodes(opts.goalNodeIds)
    : undefined;

  if (opts?.planId && opts?.sectionId) {
    return {
      planId: opts.planId,
      sectionId: opts.sectionId,
      goalNodeIds: normalizedGoals ?? opts.goalNodeIds,
    };
  }
  if (opts?.planId) {
    const plan = getStudentPlans(studentId).find((p) => p.id === opts.planId);
    if (!plan) return null;
    const nodeId = normalizedGoals?.[0];
    const sectionId =
      findSectionIdByKnowledgeNode(plan, nodeId) ?? findResumeSectionId(studentId, plan);
    if (!sectionId) return null;
    const section = findPlanSection(plan.id, sectionId).section;
    return {
      planId: plan.id,
      sectionId,
      goalNodeIds: normalizedGoals?.length ? normalizedGoals : section?.knowledgeNodeIds,
    };
  }
  const plans = getStudentPlans(studentId);
  const plan = plans[0];
  if (!plan) return null;
  const nodeId = normalizedGoals?.[0];
  const sectionId =
    findSectionIdByKnowledgeNode(plan, nodeId) ?? findResumeSectionId(studentId, plan);
  if (!sectionId) return null;
  const section = findPlanSection(plan.id, sectionId).section;
  return {
    planId: plan.id,
    sectionId,
    goalNodeIds: normalizedGoals?.length ? normalizedGoals : section?.knowledgeNodeIds,
  };
}

function titleForView(view: View, resourceSessionOverlay: Resource[]): string {
  switch (view.k) {
    case "learning-analytics":
      if (view.selectedStudentId) {
        return studentById(view.selectedStudentId)?.name ?? "学情分析";
      }
      return "学情分析";
    case "plans-list":
      return "教学计划";
    case "plan-wizard":
      return "新建教学计划";
    case "plan-detail":
      return planById(view.id)?.title ?? "教学计划详情";
    case "section-resources": {
      const plan = planById(view.planId);
      if (plan) {
        for (const ch of plan.chapters) {
          const sec = ch.sections.find((s: { id: string }) => s.id === view.sectionId);
          if (sec?.title) return `${sec.title} · 本节资源`;
        }
      }
      return "本节课程资源";
    }
    case "design-dashboard":
      return "教学设计";
    case "design": {
      const plan = planById(view.planId);
      if (plan) {
        for (const ch of plan.chapters) {
          const sec = ch.sections.find((s: { id: string }) => s.id === view.sectionId);
          if (sec?.title) return sec.title;
        }
      }
      return plan?.title ?? "教学设计";
    }
    case "hw-overview":
      return "作业评价";
    case "hw-detail":
      return homeworkById(view.id)?.homeworkTitle ?? "作业详情";
    case "exam-overview":
      return "考试评价";
    case "exam-detail":
      return examById(view.id)?.examTitle ?? "考试详情";
    case "graph":
      return "知识图谱";
    case "course-list":
      return "课程中心";
    case "course-detail":
      return courseById(view.id)?.name ?? "课程详情";
    case "resource-list":
      return "教学资源库";
    case "resource-detail":
      return (
        resourceSessionOverlay.find((r) => r.id === view.id)?.title ??
        resourceById(view.id)?.title ??
        "资源详情"
      );
    case "personnel-mgmt":
      return "人员管理";
    // ---- 学生端 ----
    case "my-plans-list":
      return "学习计划";
    case "my-plan-detail":
      return planById(view.id)?.title ?? "学习计划详情";
    case "learn-center":
      return "学习中心";
    case "class-study":
      return "课堂学习";
    case "homework-workbench":
      return "作业工作台";
    case "my-profile":
      return "学情分析";
  }
}

export default function App() {
  const [role, setRoleState] = useState<Role>("teacher");
  const [teacherId, setTeacherId] = useState<string>("t-li");
  const [studentId, setStudentId] = useState<string>("s-mech2301-01");
  const [module, setModule] = useState<ModuleKey>("teach");
  const [nav, setNav] = useState<NavKey>("plans");
  const [view, setView] = useState<View>({ k: "plans-list" });
  /** 交互页内会话态：从资源库「新增」创建的条目（含线上课程），合并展示并与详情页贯通 */
  const [resourceSessionOverlay, setResourceSessionOverlay] = useState<Resource[]>([]);

  const pageTitle = useMemo(
    () => titleForView(view, resourceSessionOverlay),
    [view, resourceSessionOverlay],
  );

  useEffect(() => {
    document.title = `${pageTitle} · ${PLATFORM_TITLE}`;
  }, [pageTitle]);

  useEffect(() => {
    if (role !== "teacher") return;
    setView((v) => {
      if (v.k !== "learning-analytics") return v;
      const allowed = classIdsVisibleToTeacher(teacherId);
      if (allowed === null) return v;
      if (allowed.includes(v.classId)) return v;
      return {
        ...v,
        classId: defaultLearningClassIdForTeacher(teacherId),
      };
    });
  }, [teacherId, role]);

  const goTeacherNav = (n: TeacherNavKey) => {
    setNav(n);
    switch (n) {
      case "class-learning":
        setView({
          k: "learning-analytics",
          classId: defaultLearningClassIdForTeacher(teacherId),
        });
        break;
      case "plans":
        setView({ k: "plans-list" });
        break;
      case "designs":
        setView({ k: "design-dashboard" });
        break;
      case "hw-eval":
        setView({ k: "hw-overview" });
        break;
      case "exam-eval":
        setView({ k: "exam-overview" });
        break;
      case "graph":
        setView({ k: "graph" });
        break;
      case "courses":
        setView({ k: "course-list" });
        break;
      case "resources":
        setView({ k: "resource-list" });
        break;
      case "personnel":
        setView({ k: "personnel-mgmt" });
        break;
    }
  };

  const goStudentNav = (n: StudentNavKey) => {
    setNav(n);
    switch (n) {
      case "my-plans":
        setView({ k: "my-plans-list" });
        break;
      case "learn-center":
        setView({ k: "learn-center" });
        break;
      case "my-profile":
        setView({ k: "my-profile" });
        break;
    }
  };

  const goNav = (n: NavKey) => {
    if (role === "student") {
      goStudentNav(n as StudentNavKey);
    } else {
      goTeacherNav(n as TeacherNavKey);
    }
  };

  /** 顶栏/菜单：先切模块再进对应侧栏项，不经过「模块默认页」 */
  const goTeacherModuleNav = (m: ModuleKey, n: TeacherNavKey) => {
    setModule(m);
    goTeacherNav(n);
  };

  const goModule = (m: ModuleKey) => {
    setModule(m);
    if (m === "teach") {
      setNav("plans");
      setView({ k: "plans-list" });
    } else {
      setNav("graph");
      setView({ k: "graph" });
    }
  };

  const goRole = (r: Role, sid?: string) => {
    setRoleState(r);
    if (r === "student") {
      if (sid) setStudentId(sid);
      // 学生端默认进入「学习计划」
      setNav("my-plans");
      setView({ k: "my-plans-list" });
    } else if (r === "college_admin") {
      setModule("engine");
      setNav("graph");
      setView({ k: "graph" });
    } else {
      setModule("teach");
      setNav("plans");
      setView({ k: "plans-list" });
    }
  };

  /** 专业知识引擎内：同时切换模块、侧栏高亮与页面，避免仅 setView 导致侧栏停留在图谱等项 */
  const goEnginePage = useCallback((n: TeacherNavKey, v: View) => {
    setModule("engine");
    setNav(n);
    setView(v);
  }, []);

  const teacherContent = () => {
    switch (view.k) {
      case "learning-analytics":
        return (
          <LearningAnalyticsHub
            classId={view.classId}
            allowedClassIds={classIdsVisibleToTeacher(teacherId)}
            selectedStudentId={view.selectedStudentId}
            onClassIdChange={(id) => setView({ k: "learning-analytics", classId: id })}
            onSelectStudent={(id) =>
              setView({ k: "learning-analytics", classId: view.classId, selectedStudentId: id })
            }
            onClearStudent={() => setView({ k: "learning-analytics", classId: view.classId })}
            onOpenHomeworkEval={(id) => {
              setNav("hw-eval");
              setView({ k: "hw-detail", id });
            }}
            onOpenExamEval={(id) => {
              setNav("exam-eval");
              setView({ k: "exam-detail", id });
            }}
          />
        );
      case "plans-list":
        return (
          <PlansList
            currentTeacherId={teacherId}
            onOpen={(id) => {
              setNav("plans");
              setView({ k: "plan-detail", id });
            }}
            onCreate={() => {
              setNav("plans");
              setView({ k: "plan-wizard" });
            }}
            onGoToGraph={(nodeId) =>
              goEnginePage("graph", { k: "graph", focusNodeId: nodeId })
            }
          />
        );
      case "plan-wizard":
        return (
          <PlanWizard
            onCancel={() => {
              setNav("plans");
              setView({ k: "plans-list" });
            }}
            onSubmit={() => {
              setNav("plans");
              const planId =
                teacherId === "t-wang" ? PLAN_WANG_HAIFENG_MOCK_ID : "plan-main";
              setView({ k: "plan-detail", id: planId });
            }}
          />
        );
      case "plan-detail":
        return (
          <PlanDetail
            id={view.id}
            currentTeacherId={teacherId}
            focusSectionId={view.focusSectionId}
            onBack={() => {
              setNav("plans");
              setView({ k: "plans-list" });
            }}
            onOpenSection={(planId, sectionId) => {
              setNav("plans");
              setView({ k: "section-resources", planId, sectionId, fromPlanId: planId });
            }}
          />
        );
      case "section-resources":
        return (
          <PlanSectionResourcesPage
            key={`${view.planId}-${view.sectionId}`}
            planId={view.planId}
            sectionId={view.sectionId}
            currentTeacherId={teacherId}
            onBack={() => {
              if (view.fromDashboard) {
                setNav("designs");
                setView({ k: "design-dashboard" });
              } else {
                setNav("plans");
                setView({ k: "plan-detail", id: view.fromPlanId ?? view.planId });
              }
            }}
            onOpenTeachingDesign={() => {
              setNav("designs");
              setView({
                k: "design",
                planId: view.planId,
                sectionId: view.sectionId,
                fromPlanId: view.fromPlanId ?? view.planId,
                fromDashboard: view.fromDashboard,
                fromSectionResources: true,
              });
            }}
            onOpenResourceLibrary={(rid) =>
              goEnginePage("resources", { k: "resource-detail", id: rid, from: "library" })
            }
            onOpenLearningAnalytics={(classId) => {
              setNav("learning");
              setView({ k: "learning-analytics", classId });
            }}
            onOpenTeachingDesignForClass={(classId) => {
              const profile = classProfileByClassId(classId);
              const progressRaw = profile?.progressSectionId;
              const review = profile?.designReviewSectionIds ?? [];
              const p = planById(view.planId);
              let targetSectionId = view.sectionId;
              if (p && progressRaw) {
                const flatIds = new Set(flattenPlanSections(p).map((s) => s.sectionId));
                if (flatIds.has(progressRaw)) {
                  const next = nextSectionId(p, progressRaw);
                  targetSectionId = next ?? view.sectionId;
                }
              }
              setNav("designs");
              setView({
                k: "design",
                planId: view.planId,
                sectionId: targetSectionId,
                fromPlanId: view.fromPlanId ?? view.planId,
                fromDashboard: view.fromDashboard,
                fromSectionResources: true,
                progressSectionId: progressRaw ?? view.sectionId,
                reviewSectionIds: review,
              });
            }}
          />
        );
      case "design-dashboard":
        return (
          <DesignDashboard
            currentTeacherId={teacherId}
            onOpenSection={(planId, sectionId) => {
              setNav("designs");
              setView({
                k: "section-resources",
                planId,
                sectionId,
                fromPlanId: planId,
                fromDashboard: true,
              });
            }}
          />
        );
      case "design": {
        const designBack = () => {
          if (view.evalAdjustReturn) {
            const { source, detailId } = view.evalAdjustReturn;
            if (source === "hw") {
              setNav("hw-eval");
              setView({ k: "hw-detail", id: detailId });
            } else {
              setNav("exam-eval");
              setView({ k: "exam-detail", id: detailId });
            }
            return;
          }
          if (view.fromSectionResources) {
            setNav(view.fromDashboard ? "designs" : "plans");
            setView({
              k: "section-resources",
              planId: view.planId,
              sectionId: view.sectionId,
              fromPlanId: view.fromPlanId ?? view.planId,
              fromDashboard: view.fromDashboard,
            });
            return;
          }
          if (view.fromDashboard) {
            setNav("designs");
            setView({ k: "design-dashboard" });
          } else {
            setNav("plans");
            setView({
              k: "plan-detail",
              id: view.fromPlanId ?? view.planId,
            });
          }
        };
        const openDesignDemo = () => {
          setNav("designs");
          setView({
            k: "design",
            planId: DEMO_DESIGN_PLAN_ID,
            sectionId: DEMO_DESIGN_SECTION_ID,
            fromPlanId: view.fromPlanId ?? view.planId,
            fromDashboard: view.fromDashboard,
            fromSectionResources: view.fromSectionResources,
          });
        };

        if (view.progressSectionId) {
          return (
            <DesignLearningAdjustWorkbench
              planId={view.planId}
              sectionId={view.sectionId}
              progressSectionId={view.progressSectionId}
              reviewSectionIds={view.reviewSectionIds}
              onBack={designBack}
              onOpenDemoSection={openDesignDemo}
            />
          );
        }
        return (
          <DesignWorkbench
            planId={view.planId}
            sectionId={view.sectionId}
            onBack={designBack}
            onOpenDemoSection={openDesignDemo}
          />
        );
      }
      case "hw-overview":
        return (
          <HwOverview
            currentTeacherId={teacherId}
            onOpen={(id) => setView({ k: "hw-detail", id })}
          />
        );
      case "hw-detail":
        return (
          <HwDetail
            id={view.id}
            currentTeacherId={teacherId}
            onBack={() => setView({ k: "hw-overview" })}
            onAdjustCourse={(planId, sectionId) => {
              setNav("plans");
              setView({ k: "plan-detail", id: planId, focusSectionId: sectionId });
            }}
          />
        );
      case "exam-overview":
        return (
          <ExamOverview
            currentTeacherId={teacherId}
            onOpen={(id) => setView({ k: "exam-detail", id })}
          />
        );
      case "exam-detail":
        return (
          <ExamDetail
            id={view.id}
            currentTeacherId={teacherId}
            onBack={() => setView({ k: "exam-overview" })}
            onAdjustCourse={(planId, sectionId) => {
              setNav("plans");
              setView({ k: "plan-detail", id: planId, focusSectionId: sectionId });
            }}
          />
        );
      case "graph":
        return (
          <GraphBrowse
            role={role}
            currentTeacherId={teacherId}
            focusNodeId={view.focusNodeId}
            onOpenResource={(id) =>
              goEnginePage("resources", { k: "resource-detail", id, from: "graph" })
            }
            onOpenCourse={(id) =>
              goEnginePage("courses", { k: "course-detail", id })
            }
          />
        );
      case "course-list":
        return (
          <CourseList
            currentTeacherId={teacherId}
            onOpen={(id) => goEnginePage("courses", { k: "course-detail", id })}
          />
        );
      case "course-detail":
        return (
          <CourseDetail
            id={view.id}
            currentTeacherId={teacherId}
            onBack={() => {
              setNav("courses");
              setView({ k: "course-list" });
            }}
            onOpenResource={(id) =>
              goEnginePage("resources", { k: "resource-detail", id, from: "course" })
            }
            onOpenKnowledgeInGraph={(nodeId) =>
              goEnginePage("graph", { k: "graph", focusNodeId: nodeId })
            }
          />
        );
      case "resource-list":
        return (
          <ResourceLibrary
            currentTeacherId={teacherId}
            sessionResources={resourceSessionOverlay}
            onAddSessionResource={(r) =>
              setResourceSessionOverlay((prev) => [r, ...prev.filter((x) => x.id !== r.id)])
            }
            onUpsertSessionResource={(r) =>
              setResourceSessionOverlay((prev) => [r, ...prev.filter((x) => x.id !== r.id)])
            }
            onOpen={(id) =>
              goEnginePage("resources", { k: "resource-detail", id, from: "library" })
            }
          />
        );
      case "resource-detail":
        return (
          <ResourceDetail
            id={view.id}
            sessionResources={resourceSessionOverlay}
            currentTeacherId={teacherId}
            onUpsertSessionResource={(r) =>
              setResourceSessionOverlay((prev) => [r, ...prev.filter((x) => x.id !== r.id)])
            }
            onBack={() => {
              if (view.from === "library") {
                setNav("resources");
                setView({ k: "resource-list" });
              } else if (view.from === "course") {
                setNav("courses");
                setView({ k: "course-list" });
              } else {
                setNav("graph");
                setView({ k: "graph" });
              }
            }}
            onOpenKnowledgeInGraph={(nodeId) =>
              goEnginePage("graph", { k: "graph", focusNodeId: nodeId })
            }
          />
        );
      case "personnel-mgmt":
        if (role !== "college_admin") {
          return (
            <div className="p-8 text-slate-500 text-sm">
              人员管理仅「学院管理」身份可用，请从顶栏切换身份。
            </div>
          );
        }
        return <PersonnelManagement />;
      default:
        return null;
    }
  };

  const studentContent = () => {
    switch (view.k) {
      case "my-plans-list":
        return (
          <MyPlansList
            studentId={studentId}
            onOpen={(id) =>
              setView({ k: "my-plan-detail", id })
            }
            onGoLearn={(opts: StudentLearnNavigateInput | undefined) => {
              setNav("learn-center");
              if (
                !opts ||
                (!opts.planId && !opts.sectionId && !(opts.goalNodeIds && opts.goalNodeIds.length))
              ) {
                setView({ k: "learn-center" });
                return;
              }
              const entry = resolveClassStudyEntry(studentId, opts);
              if (entry) {
                setView({
                  k: "class-study",
                  planId: entry.planId,
                  sectionId: entry.sectionId,
                  focus: "课堂",
                  goalNodeIds: entry.goalNodeIds,
                });
              } else {
                setView({ k: "learn-center" });
              }
            }}
          />
        );
      case "my-plan-detail":
        return (
          <MyPlanDetail
            studentId={studentId}
            id={view.id}
            onBack={() => setView({ k: "my-plans-list" })}
            onGoLearn={(opts: StudentLearnNavigateInput | undefined) => {
              setNav("learn-center");
              if (
                !opts ||
                (!opts.planId && !opts.sectionId && !(opts.goalNodeIds && opts.goalNodeIds.length))
              ) {
                setView({ k: "learn-center" });
                return;
              }
              const entry = resolveClassStudyEntry(studentId, opts);
              if (entry) {
                setView({
                  k: "class-study",
                  planId: entry.planId,
                  sectionId: entry.sectionId,
                  focus: "课堂",
                  goalNodeIds: entry.goalNodeIds,
                });
              } else {
                setView({ k: "learn-center" });
              }
            }}
          />
        );
      case "learn-center":
        return (
          <LearnCenter
            key={
              view.hubSection ?? view.initialPlanId
                ? `${view.initialPlanId ?? ""}::${view.hubSection ?? ""}`
                : "learn-center"
            }
            studentId={studentId}
            initialPlanId={view.initialPlanId}
            initialHubSection={view.hubSection}
            onEnterClassStudy={({ planId, sectionId, focus, goalNodeIds }) =>
              setView({ k: "class-study", planId, sectionId, focus, goalNodeIds })
            }
            onEnterHomeworkWorkbench={(homeworkId) =>
              setView({ k: "homework-workbench", homeworkId })
            }
            onPracticeKnowledge={(planId, goalNodeIds) => {
              const entry = resolveClassStudyEntry(studentId, { planId, goalNodeIds });
              if (!entry) return;
              setView({
                k: "class-study",
                planId: entry.planId,
                sectionId: entry.sectionId,
                focus: "课堂",
                goalNodeIds: entry.goalNodeIds,
              });
            }}
          />
        );
      case "class-study":
        return (
          <ClassStudy
            studentId={studentId}
            planId={view.planId}
            sectionId={view.sectionId}
            focus={view.focus}
            goalNodeIds={view.goalNodeIds}
            onBack={() => setView({ k: "learn-center" })}
          />
        );
      case "homework-workbench":
        return (
          <HomeworkWorkbench
            studentId={studentId}
            homeworkId={view.homeworkId}
            onBack={() => setView({ k: "learn-center" })}
          />
        );
      case "my-profile":
        return (
          <MyProfile
            studentId={studentId}
            onGoLearn={(presetGoalNodeIds) => {
              setNav("learn-center");
              const entry = resolveClassStudyEntry(studentId, {
                goalNodeIds: presetGoalNodeIds,
              });
              if (entry) {
                setView({
                  k: "class-study",
                  planId: entry.planId,
                  sectionId: entry.sectionId,
                  focus: "课堂",
                  goalNodeIds: entry.goalNodeIds,
                });
              } else {
                setView({ k: "learn-center" });
              }
            }}
            onGoLearnCenterWrongBook={(planId) => {
              setNav("learn-center");
              setView({
                k: "learn-center",
                initialPlanId: planId,
                hubSection: "wrongbook",
              });
            }}
            onGoPlans={() => {
              setNav("my-plans");
              setView({ k: "my-plans-list" });
            }}
          />
        );
      default:
        return null;
    }
  };

  const content = () =>
    role === "student" ? studentContent() : teacherContent();

  return (
    <Layout
      pageTitle={pageTitle}
      module={module}
      setModule={goModule}
      onTeacherModuleNav={goTeacherModuleNav}
      nav={nav}
      setNav={goNav}
      role={role}
      setRole={goRole}
      teacherId={teacherId}
      setTeacherId={setTeacherId}
      studentId={studentId}
      setStudentId={setStudentId}
    >
      {content()}
    </Layout>
  );
}
