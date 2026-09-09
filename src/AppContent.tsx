import { useState } from "react";
import { useApp } from "./context/AppDataContext";
import { RoleSelector } from "./components/RoleSelector";
import { TeacherDashboard } from "./views/TeacherDashboard";
import { StudentDashboard } from "./views/StudentDashboard";
import { StudentWorkspace } from "./views/StudentWorkspace";
import { StudentQuizWorkspace } from "./views/StudentQuizWorkspace";
import { TeacherGrading } from "./views/TeacherGrading";
import { AdminDashboard } from "./views/AdminDashboard";
import { GoogleSignInModal } from "./components/GoogleSignInModal";
import { AiTutorDrawer } from "./components/AiTutorDrawer";

export function AppContent() {
  const { role, envelope } = useApp();
  
  // Simple view routing state
  // views: "dashboard", "workspace" (for student), "grading" (for teacher)
  const [currentView, setCurrentView] = useState<"dashboard" | "workspace" | "grading">("dashboard");
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);

  const navigateToWorkspace = (missionId: string) => {
    setSelectedMissionId(missionId);
    setCurrentView("workspace");
  };

  const navigateToGrading = (missionId: string) => {
    setSelectedMissionId(missionId);
    setCurrentView("grading");
  };

  const navigateToDashboard = () => {
    setSelectedMissionId(null);
    setCurrentView("dashboard");
  };

  const activeMission = envelope.missions.find(m => m.id === selectedMissionId);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <RoleSelector />
      <GoogleSignInModal />
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {role.type === "admin" && (
          <AdminDashboard />
        )}

        {role.type === "teacher" && currentView === "dashboard" && (
          <TeacherDashboard onOpenGrading={navigateToGrading} />
        )}
        
        {role.type === "teacher" && currentView === "grading" && selectedMissionId && (
          <TeacherGrading missionId={selectedMissionId} onBack={navigateToDashboard} />
        )}
        
        {role.type === "student" && currentView === "dashboard" && (
          <StudentDashboard onOpenMission={navigateToWorkspace} />
        )}

        {role.type === "student" && currentView === "workspace" && selectedMissionId && (
          activeMission?.type === "quiz" ? (
            <StudentQuizWorkspace missionId={selectedMissionId} onBack={navigateToDashboard} />
          ) : (
            <StudentWorkspace missionId={selectedMissionId} onBack={navigateToDashboard} />
          )
        )}
      </main>
      <AiTutorDrawer activeMissionId={selectedMissionId || undefined} />
    </div>
  );
}
