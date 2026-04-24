import { useEffect, useMemo, useState } from "react";
import { Layout, NavKey, ModuleKey } from "./components/Layout";
import {
  classById,
  courseById,
  examById,
  homeworkById,
  planById,
  resourceById,
  studentById,
  trainingById,
} from "./data/lookups";
import { ClassProfileList, ClassProfileDetail } from "./components/ClassProfiles";
import { PlansList, PlanDetail } from "./components/Plans";
import { DesignWorkbench } from "./components/DesignWorkbench";
import { HwOverview, HwDetail } from "./components/HomeworkEval";
import { ExamOverview, ExamDetail } from "./components/ExamEval";
import { StudentList, StudentDetail } from "./components/StudentProfiles";
import { CourseList, CourseDetail } from "./components/Courses";
import { ResourceLibrary } from "./components/ResourceLibrary";
import { TrainingList, TrainingDetail } from "./components/TrainingLibrary";
import { GraphBrowse, ResourceDetail } from "./components/Graph";

type View =
  | { k: "class-list" }
  | { k: "class-detail"; id: string }
  | { k: "plans-list" }
  | { k: "plan-detail"; id: string }
  | { k: "design"; planId: string; sectionId: string; fromPlanId?: string }
  | { k: "hw-overview" }
  | { k: "hw-detail"; id: string }
  | { k: "exam-overview" }
  | { k: "exam-detail"; id: string }
  | { k: "student-list" }
  | { k: "student-detail"; id: string }
  | { k: "graph" }
  | { k: "course-list" }
  | { k: "course-detail"; id: string }
  | { k: "resource-list" }
  | { k: "resource-detail"; id: string; from?: "graph" | "library" | "course" }
  | { k: "training-list" }
  | { k: "training-detail"; id: string };

const PLATFORM_TITLE = "教学科研实训一体化平台";

function titleForView(view: View): string {
  switch (view.k) {
    case "class-list":
      return "班级档案";
    case "class-detail":
      return classById(view.id)?.name ?? "班级详情";
    case "plans-list":
      return "教学计划";
    case "plan-detail":
      return planById(view.id)?.title ?? "教学计划详情";
    case "design": {
      const plan = planById(view.planId);
      const sec = plan?.sections.find((s) => s.id === view.sectionId);
      if (sec?.title) return sec.title;
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
    case "student-list":
      return "学生档案";
    case "student-detail":
      return studentById(view.id)?.name ?? "学生详情";
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
  }
}

export default function App() {
  const [module, setModule] = useState<ModuleKey>("teach");
  const [nav, setNav] = useState<NavKey>("class-profiles");
  const [view, setView] = useState<View>({ k: "class-list" });

  const pageTitle = useMemo(() => titleForView(view), [view]);

  useEffect(() => {
    document.title = `${pageTitle} · ${PLATFORM_TITLE}`;
  }, [pageTitle]);

  const goNav = (n: NavKey) => {
    setNav(n);
    switch (n) {
      case "class-profiles":
        setView({ k: "class-list" });
        break;
      case "plans":
        setView({ k: "plans-list" });
        break;
      case "designs":
        setView({ k: "plans-list" });
        break;
      case "hw-eval":
        setView({ k: "hw-overview" });
        break;
      case "exam-eval":
        setView({ k: "exam-overview" });
        break;
      case "student-profiles":
        setView({ k: "student-list" });
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

  const goModule = (m: ModuleKey) => {
    setModule(m);
    if (m === "teach") {
      setNav("class-profiles");
      setView({ k: "class-list" });
    } else {
      setNav("graph");
      setView({ k: "graph" });
    }
  };

  const content = () => {
    switch (view.k) {
      case "class-list":
        return <ClassProfileList onOpen={(id) => setView({ k: "class-detail", id })} />;
      case "class-detail":
        return (
          <ClassProfileDetail
            id={view.id}
            onBack={() => setView({ k: "class-list" })}
            onGoPlans={() => {
              setNav("plans");
              setView({ k: "plans-list" });
            }}
            onOpenPlan={(planId) => {
              setNav("plans");
              setView({ k: "plan-detail", id: planId });
            }}
          />
        );
      case "plans-list":
        return <PlansList onOpen={(id) => setView({ k: "plan-detail", id })} />;
      case "plan-detail":
        return (
          <PlanDetail
            id={view.id}
            onBack={() => setView({ k: "plans-list" })}
            onOpenSection={(planId, sectionId) =>
              setView({ k: "design", planId, sectionId, fromPlanId: planId })
            }
          />
        );
      case "design":
        return (
          <DesignWorkbench
            planId={view.planId}
            sectionId={view.sectionId}
            onBack={() =>
              setView({ k: "plan-detail", id: view.fromPlanId ?? view.planId })
            }
          />
        );
      case "hw-overview":
        return <HwOverview onOpen={(id) => setView({ k: "hw-detail", id })} />;
      case "hw-detail":
        return <HwDetail id={view.id} onBack={() => setView({ k: "hw-overview" })} />;
      case "exam-overview":
        return <ExamOverview onOpen={(id) => setView({ k: "exam-detail", id })} />;
      case "exam-detail":
        return <ExamDetail id={view.id} onBack={() => setView({ k: "exam-overview" })} />;
      case "student-list":
        return <StudentList onOpen={(id) => setView({ k: "student-detail", id })} />;
      case "student-detail":
        return <StudentDetail id={view.id} onBack={() => setView({ k: "student-list" })} />;
      case "graph":
        return (
          <GraphBrowse
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
    }
  };

  return (
    <Layout
      pageTitle={pageTitle}
      module={module}
      setModule={goModule}
      nav={nav}
      setNav={goNav}
    >
      {content()}
    </Layout>
  );
}
