import { useEffect, useMemo, useState } from "react";
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
  examById,
  homeworkById,
  planById,
  resourceById,
  studentById,
  trainingById,
} from "./data/lookups";
import {
  DEFAULT_LEARNING_CLASS_ID,
  LearningAnalyticsHub,
} from "./components/ClassProfiles";
import { PlansList, PlanDetail } from "./components/Plans";
import { PlanWizard } from "./components/PlanWizard";
import { DesignWorkbench } from "./components/DesignWorkbench";
import { DesignDashboard } from "./components/DesignDashboard";
import { HwOverview, HwDetail } from "./components/HomeworkEval";
import { ExamOverview, ExamDetail } from "./components/ExamEval";
import { CourseList, CourseDetail } from "./components/Courses";
import { ResourceLibrary } from "./components/ResourceLibrary";
import { TrainingList, TrainingDetail } from "./components/TrainingLibrary";
import { GraphBrowse, ResourceDetail } from "./components/Graph";
import { MyPlansList, MyPlanDetail } from "./components/student/MyPlans";
import { LearnCenter } from "./components/student/LearnCenter";
import { TrainingLab } from "./components/student/TrainingLab";
import { MyProfile } from "./components/student/MyProfile";
import { personalPlanById } from "./data/studentMock";
import { DEMO_DESIGN_PLAN_ID, DEMO_DESIGN_SECTION_ID } from "@mock";

type TeacherView =
  | { k: "learning-analytics"; classId: string; selectedStudentId?: string }
  | { k: "plans-list" }
  | { k: "plan-wizard" }
  | { k: "plan-detail"; id: string; focusSectionId?: string }
  | { k: "design-dashboard" }
  | {
      k: "design";
      planId: string;
      sectionId: string;
      fromPlanId?: string;
      fromDashboard?: boolean;
    }
  | { k: "hw-overview" }
  | { k: "hw-detail"; id: string }
  | { k: "exam-overview" }
  | { k: "exam-detail"; id: string }
  | { k: "graph" }
  | { k: "course-list" }
  | { k: "course-detail"; id: string }
  | { k: "resource-list" }
  | { k: "resource-detail"; id: string; from?: "graph" | "library" | "course" }
  | { k: "training-list" }
  | { k: "training-detail"; id: string };

type StudentView =
  | { k: "my-plans-list" }
  | { k: "my-plan-detail"; id: string; kind: "course" | "personal" }
  | { k: "learn-center"; presetSectionId?: string; presetGoalNodeIds?: string[] }
  | { k: "training-lab" }
  | { k: "training-detail-student"; id: string }
  | { k: "my-profile" };

type View = TeacherView | StudentView;

const PLATFORM_TITLE = "教学科研实训一体化平台";

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
    case "design-dashboard":
      return "教学设计";
    case "design": {
      const plan = planById(view.planId);
      if (plan) {
        for (const ch of plan.chapters) {
          const sec = ch.sections.find((s) => s.id === view.sectionId);
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
  const [studentId, setStudentId] = useState<string>("s-mech2301-01");
  const [module, setModule] = useState<ModuleKey>("teach");
  const [nav, setNav] = useState<NavKey>("plans");
  const [view, setView] = useState<View>({ k: "plans-list" });

  const pageTitle = useMemo(() => titleForView(view), [view]);

  useEffect(() => {
    document.title = `${pageTitle} · ${PLATFORM_TITLE}`;
  }, [pageTitle]);

  const goTeacherNav = (n: TeacherNavKey) => {
    setNav(n);
    switch (n) {
      case "class-learning":
        setView({
          k: "learning-analytics",
          classId: DEFAULT_LEARNING_CLASS_ID,
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
      // 学生端默认进入"学习中心"（主线感最强）
      setNav("learn-center");
      setView({ k: "learn-center" });
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

  const teacherContent = () => {
    switch (view.k) {
      case "learning-analytics":
        return (
          <LearningAnalyticsHub
            classId={view.classId}
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
              setView({ k: "plan-detail", id: "plan-main" });
            }}
            onGoToGraph={() => {
              setModule("engine");
              setNav("graph");
              setView({ k: "graph" });
            }}
          />
        );
      case "plan-detail":
        return (
          <PlanDetail
            id={view.id}
            focusSectionId={view.focusSectionId}
            onBack={() => {
              setNav("plans");
              setView({ k: "plans-list" });
            }}
            onOpenSection={(planId, sectionId) => {
              setNav("designs");
              setView({ k: "design", planId, sectionId, fromPlanId: planId });
            }}
          />
        );
      case "design-dashboard":
        return (
          <DesignDashboard
            onOpenSection={(planId, sectionId) => {
              setNav("designs");
              setView({
                k: "design",
                planId,
                sectionId,
                fromDashboard: true,
              });
            }}
          />
        );
      case "design":
        return (
          <DesignWorkbench
            planId={view.planId}
            sectionId={view.sectionId}
            onBack={() => {
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
            }}
            onOpenDemoSection={() => {
              setNav("designs");
              setView({
                k: "design",
                planId: DEMO_DESIGN_PLAN_ID,
                sectionId: DEMO_DESIGN_SECTION_ID,
                fromPlanId: view.fromPlanId ?? view.planId,
                fromDashboard: view.fromDashboard,
              });
            }}
          />
        );
      case "hw-overview":
        return <HwOverview onOpen={(id) => setView({ k: "hw-detail", id })} />;
      case "hw-detail":
        return (
          <HwDetail
            id={view.id}
            onBack={() => setView({ k: "hw-overview" })}
            onAdjustCourse={(planId, sectionId) => {
              setNav("plans");
              setView({ k: "plan-detail", id: planId, focusSectionId: sectionId });
            }}
          />
        );
      case "exam-overview":
        return <ExamOverview onOpen={(id) => setView({ k: "exam-detail", id })} />;
      case "exam-detail":
        return <ExamDetail id={view.id} onBack={() => setView({ k: "exam-overview" })} />;
      case "graph":
        return (
          <GraphBrowse
            role={role}
            onOpenResource={(id) =>
              setView({ k: "resource-detail", id, from: "graph" })
            }
          />
        );
      case "course-list":
        return <CourseList onOpen={(id) => setView({ k: "course-detail", id })} />;
      case "course-detail":
        return (
          <CourseDetail
            id={view.id}
            onBack={() => setView({ k: "course-list" })}
            onOpenResource={(id) =>
              setView({ k: "resource-detail", id, from: "course" })
            }
            onOpenTraining={(id) => setView({ k: "training-detail", id })}
          />
        );
      case "resource-list":
        return (
          <ResourceLibrary
            onOpen={(id) =>
              setView({ k: "resource-detail", id, from: "library" })
            }
          />
        );
      case "resource-detail":
        return (
          <ResourceDetail
            id={view.id}
            onBack={() => {
              if (view.from === "library") setView({ k: "resource-list" });
              else if (view.from === "course")
                setView({ k: "course-list" });
              else setView({ k: "graph" });
            }}
          />
        );
      case "training-list":
        return <TrainingList onOpen={(id) => setView({ k: "training-detail", id })} />;
      case "training-detail":
        return (
          <TrainingDetail
            id={view.id}
            onBack={() => setView({ k: "training-list" })}
            onOpenCourse={(id) => setView({ k: "course-detail", id })}
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
            onGoLearn={(presetSectionId, presetGoalNodeIds) => {
              setNav("learn-center");
              setView({
                k: "learn-center",
                presetSectionId,
                presetGoalNodeIds,
              });
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
            onGoLearn={(presetSectionId, presetGoalNodeIds) => {
              setNav("learn-center");
              setView({
                k: "learn-center",
                presetSectionId,
                presetGoalNodeIds,
              });
            }}
          />
        );
      case "learn-center":
        return (
          <LearnCenter
            studentId={studentId}
            presetSectionId={view.presetSectionId}
            presetGoalNodeIds={view.presetGoalNodeIds}
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
              setView({
                k: "learn-center",
                presetGoalNodeIds,
              });
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
      studentId={studentId}
      setStudentId={setStudentId}
    >
      {content()}
    </Layout>
  );
}
