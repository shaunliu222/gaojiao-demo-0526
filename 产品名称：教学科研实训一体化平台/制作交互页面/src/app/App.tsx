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
  defaultLearningClassIdForTeacher,
  examById,
  homeworkById,
  planById,
  resourceById,
  studentById,
  trainingById,
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
import { TrainingList, TrainingDetail } from "./components/TrainingLibrary";
import { GraphBrowse, ResourceDetail } from "./components/Graph";
import {
  MyPlansList,
  MyPlanDetail,
  type StudentLearnNavigateInput,
} from "./components/student/MyPlans";
import { LearnCenter } from "./components/student/LearnCenter";
import { ClassStudy } from "./components/student/ClassStudy";
import { HomeworkWorkbench } from "./components/student/HomeworkWorkbench";
import { TrainingWorkbench } from "./components/student/TrainingWorkbench";
import {
  findPlanSection,
  findSectionIdByKnowledgeNode,
  getStudentPlans,
  normalizeStudentChapterPointIdsToGraphNodes,
} from "./data/learnCenterSession";
import { TrainingLab } from "./components/student/TrainingLab";
import { MyProfile } from "./components/student/MyProfile";
import { findResumeSectionId, personalPlanById } from "./data/studentMock";
import {
  DEMO_DESIGN_PLAN_ID,
  DEMO_DESIGN_SECTION_ID,
  PLAN_WANG_HAIFENG_MOCK_ID,
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
      /** 从学情分析进入：返回时恢复班级 tab */
      fromLearningAnalytics?: boolean;
      returnClassId?: string;
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
  | { k: "training-list" }
  | { k: "training-detail"; id: string };

type StudentView =
  | { k: "my-plans-list" }
  | { k: "my-plan-detail"; id: string; kind: "course" | "personal" }
  | { k: "learn-center" }
  | {
      k: "class-study";
      planId: string;
      sectionId: string;
      focus: "课堂" | "讲义";
      goalNodeIds?: string[];
    }
  | { k: "homework-workbench"; homeworkId: string }
  | { k: "training-workbench"; assignmentId: string }
  | { k: "training-lab" }
  | { k: "training-detail-student"; id: string }
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

function titleForView(view: View): string {
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
      return resourceById(view.id)?.title ?? "资源详情";
    case "training-list":
      return "实训项目库";
    case "training-detail":
      return trainingById(view.id)?.name ?? "实训项目详情";
    // ---- 学生端 ----
    case "my-plans-list":
      return "学习计划";
    case "my-plan-detail": {
      if (view.kind === "course") {
        return planById(view.id)?.title ?? "学习计划详情";
      }
      return personalPlanById(view.id)?.title ?? "个人学习计划";
    }
    case "learn-center":
      return "学习中心";
    case "class-study":
      return "课堂学习";
    case "homework-workbench":
      return "作业工作台";
    case "training-workbench":
      return "实训工作台";
    case "training-lab":
      return "实训中心";
    case "training-detail-student":
      return trainingById(view.id)?.name ?? "实训详情";
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

  const pageTitle = useMemo(() => titleForView(view), [view]);

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
      case "trainings":
        setView({ k: "training-list" });
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
      case "training-lab":
        setView({ k: "training-lab" });
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

  /** 学科知识引擎内：同时切换模块、侧栏高亮与页面，避免仅 setView 导致侧栏停留在图谱等项 */
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
            onJumpToTeachingDesign={(payload) => {
              setNav("designs");
              setView({
                k: "design",
                planId: payload.planId,
                sectionId: payload.sectionId,
                fromLearningAnalytics: true,
                returnClassId: view.classId,
                progressSectionId: payload.progressSectionId,
                reviewSectionIds: payload.reviewSectionIds,
              });
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
            onGoToGraph={() => {
              goEnginePage("graph", { k: "graph" });
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
          if (view.fromLearningAnalytics && view.returnClassId) {
            setNav("class-learning");
            setView({
              k: "learning-analytics",
              classId: view.returnClassId,
            });
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

        if (
          view.fromLearningAnalytics &&
          view.returnClassId &&
          view.progressSectionId
        ) {
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
            onOpenTraining={(id) =>
              goEnginePage("trainings", { k: "training-detail", id })
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
            onOpenTraining={(id) =>
              goEnginePage("trainings", { k: "training-detail", id })
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
            onOpen={(id) =>
              goEnginePage("resources", { k: "resource-detail", id, from: "library" })
            }
          />
        );
      case "resource-detail":
        return (
          <ResourceDetail
            id={view.id}
            currentTeacherId={teacherId}
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
      case "training-list":
        return (
          <TrainingList
            currentTeacherId={teacherId}
            onOpen={(id) => goEnginePage("trainings", { k: "training-detail", id })}
          />
        );
      case "training-detail":
        return (
          <TrainingDetail
            id={view.id}
            currentTeacherId={teacherId}
            onBack={() => {
              setNav("trainings");
              setView({ k: "training-list" });
            }}
            onOpenCourse={(id) => goEnginePage("courses", { k: "course-detail", id })}
            onOpenKnowledgeInGraph={(nodeId) =>
              goEnginePage("graph", { k: "graph", focusNodeId: nodeId })
            }
          />
        );
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
            onOpen={(id, kind) =>
              setView({ k: "my-plan-detail", id, kind })
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
            kind={view.kind}
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
            onGoTraining={(assignmentId: string) => {
              setNav("learn-center");
              setView({ k: "training-workbench", assignmentId });
            }}
          />
        );
      case "learn-center":
        return (
          <LearnCenter
            studentId={studentId}
            onEnterClassStudy={({ planId, sectionId, focus, goalNodeIds }) =>
              setView({ k: "class-study", planId, sectionId, focus, goalNodeIds })
            }
            onEnterHomeworkWorkbench={(homeworkId) =>
              setView({ k: "homework-workbench", homeworkId })
            }
            onOpenStudentLearningPlans={() => {
              setNav("my-plans");
              setView({ k: "my-plans-list" });
            }}
            onContinuePersonalLearn={(opts: StudentLearnNavigateInput) => {
              const entry = resolveClassStudyEntry(studentId, opts);
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
      case "training-workbench":
        return (
          <TrainingWorkbench
            studentId={studentId}
            assignmentId={view.assignmentId}
            onBack={() => setView({ k: "learn-center" })}
          />
        );
      case "training-lab":
        return (
          <TrainingLab
            studentId={studentId}
            onOpenTraining={(id) =>
              setView({ k: "training-detail-student", id })
            }
            onGoLearn={() => {
              setNav("learn-center");
              setView({ k: "learn-center" });
            }}
          />
        );
      case "training-detail-student":
        return (
          <TrainingDetail
            id={view.id}
            onBack={() => setView({ k: "training-lab" })}
            onOpenCourse={() => setView({ k: "training-lab" })}
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
            onGoPlans={() => {
              setNav("my-plans");
              setView({ k: "my-plans-list" });
            }}
            onGoLab={() => {
              setNav("training-lab");
              setView({ k: "training-lab" });
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
