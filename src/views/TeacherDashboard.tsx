import { useState } from "react";
import { useApp } from "../context/AppDataContext";
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Layers, 
  ArrowRight, 
  GraduationCap, 
  Sparkles,
  School,
  Plus,
  Eye,
  Compass,
  Search,
  FileText,
  UserCheck,
  TrendingUp,
  Award,
  Printer,
  ShieldCheck,
  CheckCheck,
  FileSpreadsheet,
  BarChart3,
  Download
} from "lucide-react";
import { AssignmentCreatorModal } from "./AssignmentCreatorModal";
import { StudentDossierModal } from "../components/StudentDossierModal";
import { OfficialTranscriptModal } from "../components/OfficialTranscriptModal";
import { ParentReportModal } from "../components/ParentReportModal";
import { LamborghiniCockpitCluster, LamborghiniArcGauge } from "../components/cockpit/LamborghiniGauge";
import { Student } from "../types";
import { getCleanStudentId, isGoogleAccount, findMatchingUser } from "../utils/userUtils";

export const TeacherDashboard = ({ onOpenGrading }: { onOpenGrading: (id: string) => void }) => {
  const { role, envelope, getWorkStatus, users } = useApp();
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"missions" | "roster" | "gradebook">("missions");
  const [cockpitMode, setCockpitMode] = useState<"strada" | "corsa">("corsa");
  const [selectedStudentForDossier, setSelectedStudentForDossier] = useState<Student | null>(null);
  const [selectedStudentForParentReport, setSelectedStudentForParentReport] = useState<Student | null>(null);
  const [rosterSearch, setRosterSearch] = useState("");
  const [rosterFilter, setRosterFilter] = useState<"all" | "pending" | "changes" | "done" | "coder" | "explainer" | "explorer">("all");
  const [gradebookSearch, setGradebookSearch] = useState("");
  const [gradebookFilter, setGradebookFilter] = useState<"all" | "g4" | "g35" | "pending" | "coder" | "explainer" | "explorer">("all");
  const [showExportToast, setShowExportToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("เตรียมรายงานแบบ ปพ.5 พร้อมพิมพ์เรียบร้อยแล้ว");
  const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(false);

  if (role.type !== "teacher") return null;

  // Calculate overall totals across all missions
  let totalSubmitted = 0;
  let totalChanges = 0;
  let totalReviewed = 0;
  let totalAssigned = 0;

  envelope.missions.forEach(m => {
    m.targetStudentIds.forEach(studentId => {
      totalAssigned++;
      const s = getWorkStatus(studentId, m.id);
      if (s === "submitted") totalSubmitted++;
      if (s === "changes-requested") totalChanges++;
      if (s === "reviewed") totalReviewed++;
    });
  });

  // Actionable Insights for Teacher Learning Compass
  const pendingReviewsList: { student: Student; missionTitle: string; missionId: string }[] = [];
  const changesRequestedList: { student: Student; missionTitle: string; missionId: string }[] = [];
  const needsQuizPracticeList: { student: Student; score: number; maxScore: number; missionId: string }[] = [];
  const masteryCelebrations: { student: Student; note: string }[] = [];

  envelope.missions.forEach(m => {
    envelope.students.forEach(s => {
      const st = getWorkStatus(s.id, m.id);
      if (st === "submitted") {
        pendingReviewsList.push({ student: s, missionTitle: m.title, missionId: m.id });
      } else if (st === "changes-requested") {
        changesRequestedList.push({ student: s, missionTitle: m.title, missionId: m.id });
      }
    });
  });

  envelope.quizHistory.forEach(q => {
    if (!q.passed) {
      const st = envelope.students.find(s => s.id === q.studentId);
      if (st && !needsQuizPracticeList.some(item => item.student.id === st.id)) {
        needsQuizPracticeList.push({ student: st, score: q.score, maxScore: q.maxScore, missionId: q.missionId });
      }
    }
  });

  envelope.students.forEach(s => {
    const isMaster = envelope.reviews.some(r => {
      const att = envelope.attempts.find(a => a.id === r.attemptId && a.studentId === s.id);
      return att && r.outcome === "meets-criteria" && (r.percentScore ?? 0) >= 90;
    });
    if (isMaster) {
      masteryCelebrations.push({ student: s, note: "ผ่านเกณฑ์ 100% พร้อมหลักฐานพัฒนาการก้าวกระโดด" });
    }
  });

  // Filter roster students
  const filteredStudents = envelope.students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(rosterSearch.toLowerCase()) ||
                          s.id.toLowerCase().includes(rosterSearch.toLowerCase());
    if (!matchesSearch) return false;

    if (rosterFilter === "all") return true;
    if (rosterFilter === "coder") return s.learnerProfile?.persona === "Hands-on Coder";
    if (rosterFilter === "explainer") return s.learnerProfile?.persona === "Conceptual Explainer";
    if (rosterFilter === "explorer") return s.learnerProfile?.persona === "Fast Explorer";

    const statuses = envelope.missions.map(m => getWorkStatus(s.id, m.id));
    if (rosterFilter === "pending") return statuses.includes("submitted");
    if (rosterFilter === "changes") return statuses.includes("changes-requested");
    if (rosterFilter === "done") return statuses.every(st => st === "reviewed");

    return true;
  });

  // Helper to compute standard grade & evidence for each student
  const getStudentGradeSummary = (student: Student) => {
    const studentAttempts = envelope.attempts.filter(a => a.studentId === student.id);
    const studentReviews = envelope.reviews.filter(r => 
      studentAttempts.some(a => a.id === r.attemptId) && r.publicationStatus === "published"
    );
    const studentQuizzes = envelope.quizHistory.filter(q => q.studentId === student.id);

    let highestPercent = 0;
    let rawScore = 0;
    let pathway = "แบบผสมผสาน (Multi-Modal)";

    if (student.learnerProfile?.persona === "Hands-on Coder") {
      pathway = "💻 Coding Challenge: โครงสร้างวนซ้ำ While Loop";
    } else if (student.learnerProfile?.persona === "Conceptual Explainer") {
      pathway = "✍️ Conceptual: อธิบายตรรกะ Before & After";
    } else if (student.learnerProfile?.persona === "Fast Explorer") {
      pathway = "🎯 Guided Quiz: แบบทดสอบเชิงตรรกะลูป 5 ระดับ";
    } else if (student.learnerProfile?.persona === "Resilient Improver") {
      pathway = "🔄 Iterative Revision: ปรับปรุงคำตอบรอบที่ 2";
    } else {
      pathway = "⚖️ Multi-Modal: แสดงสมรรถนะครบวงจร";
    }

    studentReviews.forEach(r => {
      const pct = r.percentScore ?? 0;
      if (pct > highestPercent) {
        highestPercent = pct;
        rawScore = r.rawScore ?? (pct / 100 * 6);
      }
    });

    studentQuizzes.forEach(q => {
      const pct = q.percentScore ?? ((q.score / q.maxScore) * 100);
      if (pct > highestPercent) {
        highestPercent = pct;
        rawScore = (pct / 100) * 6;
      }
    });

    const hasAttemptEvidence = studentAttempts.length > 0;
    const hasQuizEvidence = studentQuizzes.length > 0;
    const hasAnyEvidence = hasAttemptEvidence || hasQuizEvidence;
    const hasReviewedEvidence = studentReviews.length > 0 || hasQuizEvidence;

    // Check if student is a mock student (student-001 to student-008) to preserve demo classroom
    const isMock = student.id.startsWith("student-00") && parseInt(student.id.replace("student-", "")) <= 8;

    if (highestPercent === 0 && isMock) {
      if (student.id === "student-001") { highestPercent = 100; rawScore = 6.0; }
      else if (student.id === "student-002") { highestPercent = 92; rawScore = 5.5; }
      else if (student.id === "student-003") { highestPercent = 100; rawScore = 6.0; }
      else if (student.id === "student-004") { highestPercent = 100; rawScore = 6.0; }
      else if (student.id === "student-005") { highestPercent = 100; rawScore = 6.0; }
      else if (student.id === "student-006") { highestPercent = 84; rawScore = 5.0; }
      else if (student.id === "student-007") { highestPercent = 92; rawScore = 5.5; }
      else if (student.id === "student-008") { highestPercent = 80; rawScore = 4.8; }
    }

    // กรณีผู้เรียนใหม่หรือผู้เรียนที่ยังไม่เคยส่งงานจริง: ได้เกรด "ร" (รอส่งงาน) ไม่ให้เกรด 4 ปลอม
    if (!isMock && !hasAnyEvidence) {
      return {
        rawScore: 0,
        maxScore: 6.0,
        percentScore: 0,
        letterGrade: "ร",
        gradeLevel: "รอส่งชิ้นงาน (Pending)",
        gradeBadgeColor: "bg-rose-50 text-rose-700 border-rose-200",
        pathway: "⏳ รอส่งชิ้นงานเพื่อประเมินสมรรถนะ",
        standardCode: "ว 4.2 ม.4/1",
        isMastered: false,
        evidenceCount: 0,
        hasEvidence: false
      };
    }

    // กรณีส่งงานแล้ว แต่อยู่ระหว่างรอคุณครูตรวจประเมิน
    if (!isMock && hasAttemptEvidence && !hasReviewedEvidence) {
      return {
        rawScore: 0,
        maxScore: 6.0,
        percentScore: 0,
        letterGrade: "รอตรวจ",
        gradeLevel: "รอคุณครูตรวจประเมิน",
        gradeBadgeColor: "bg-amber-50 text-amber-800 border-amber-300",
        pathway: "📥 ส่งงานแล้ว อยู่ระหว่างรอตรวจ",
        standardCode: "ว 4.2 ม.4/1",
        isMastered: false,
        evidenceCount: studentAttempts.length,
        hasEvidence: true
      };
    }

    let letterGrade = "4.0";
    let gradeLevel = "ดีเยี่ยม (Excellent)";
    let gradeBadgeColor = "bg-emerald-50 text-emerald-800 border-emerald-300";

    if (highestPercent >= 80) {
      letterGrade = "4.0";
      gradeLevel = "ดีเยี่ยม (Excellent)";
      gradeBadgeColor = "bg-emerald-50 text-emerald-800 border-emerald-300";
    } else if (highestPercent >= 75) {
      letterGrade = "3.5";
      gradeLevel = "ดีมาก (Very Good)";
      gradeBadgeColor = "bg-blue-50 text-blue-800 border-blue-300";
    } else if (highestPercent >= 70) {
      letterGrade = "3.0";
      gradeLevel = "ดี (Good)";
      gradeBadgeColor = "bg-indigo-50 text-indigo-800 border-indigo-300";
    } else if (highestPercent >= 65) {
      letterGrade = "2.5";
      gradeLevel = "ค่อนข้างดี (Fair)";
      gradeBadgeColor = "bg-amber-50 text-amber-800 border-amber-300";
    } else {
      letterGrade = "2.0";
      gradeLevel = "ผ่านเกณฑ์ (Pass)";
      gradeBadgeColor = "bg-slate-50 text-slate-800 border-slate-300";
    }

    const totalEvidence = studentAttempts.length + studentQuizzes.length;

    return {
      rawScore: Number(rawScore.toFixed(1)),
      maxScore: 6.0,
      percentScore: Math.round(highestPercent),
      letterGrade,
      gradeLevel,
      gradeBadgeColor,
      pathway,
      standardCode: "ว 4.2 ม.4/1",
      isMastered: highestPercent >= 70,
      evidenceCount: isMock ? 3 : totalEvidence,
      hasEvidence: true
    };
  };

  const gradeSummaries = envelope.students.map(s => ({
    student: s,
    ...getStudentGradeSummary(s)
  }));

  const totalStudentsCount = gradeSummaries.length;
  const evaluatedSummaries = gradeSummaries.filter(g => g.letterGrade !== "ร" && g.letterGrade !== "รอตรวจ");
  const totalEvaluatedCount = evaluatedSummaries.length;
  const masteredStudentsCount = evaluatedSummaries.filter(g => g.isMastered).length;
  const masteryRatePct = totalEvaluatedCount > 0 ? Math.round((masteredStudentsCount / totalEvaluatedCount) * 100) : 100;
  const classAvgScore = totalEvaluatedCount > 0 
    ? (evaluatedSummaries.reduce((sum, g) => sum + g.rawScore, 0) / totalEvaluatedCount).toFixed(1)
    : "5.6";
  const classAvgPct = totalEvaluatedCount > 0
    ? Math.round(evaluatedSummaries.reduce((sum, g) => sum + g.percentScore, 0) / totalEvaluatedCount)
    : 93;
  const grade4Count = gradeSummaries.filter(g => g.letterGrade === "4.0").length;
  const grade35Count = gradeSummaries.filter(g => g.letterGrade === "3.5").length;
  const pendingGradeCount = gradeSummaries.filter(g => g.letterGrade === "ร" || g.letterGrade === "รอตรวจ").length;

  // Filter gradebook students
  const filteredGradeSummaries = gradeSummaries.filter(g => {
    const matchesSearch = g.student.name.toLowerCase().includes(gradebookSearch.toLowerCase()) ||
                          g.student.id.toLowerCase().includes(gradebookSearch.toLowerCase());
    if (!matchesSearch) return false;

    if (gradebookFilter === "all") return true;
    if (gradebookFilter === "g4") return g.letterGrade === "4.0";
    if (gradebookFilter === "g35") return g.letterGrade === "3.5";
    if (gradebookFilter === "pending") return g.letterGrade === "ร" || g.letterGrade === "รอตรวจ";
    if (gradebookFilter === "coder") return g.student.learnerProfile?.persona === "Hands-on Coder";
    if (gradebookFilter === "explainer") return g.student.learnerProfile?.persona === "Conceptual Explainer";
    if (gradebookFilter === "explorer") return g.student.learnerProfile?.persona === "Fast Explorer";

    return true;
  });

  const handlePrintGradebook = () => {
    setIsTranscriptModalOpen(true);
    setToastMessage("เตรียมรายงานแบบ ปพ.5 พร้อมพิมพ์เรียบร้อยแล้ว");
    setShowExportToast(true);
    setTimeout(() => setShowExportToast(false), 4000);
  };

  const handleExportCSV = () => {
    // Generate CSV data for SGS format
    const headers = [
      "ลำดับ",
      "เลขประจำตัว",
      "ชื่อ-นามสกุล",
      "สไตล์การเรียนรู้ (Persona)",
      "เส้นทางการประเมิน (Evidence Pathway)",
      "รหัสตัวชี้วัด",
      "คำอธิบายตัวชี้วัด",
      "คะแนนเต็ม",
      "คะแนนที่ได้",
      "ร้อยละ",
      "ระดับเกรด",
      "ระดับคุณภาพ",
      "ความเชื่อมั่น Triangulation",
      "สถานะการประเมิน"
    ];

    const rows = gradeSummaries.map((g, idx) => [
      idx + 1,
      `"${g.student.id}"`,
      `"${g.student.name}"`,
      `"${g.student.learnerProfile?.persona || 'รอวิเคราะห์ (ไม่มีร่องรอย)'}"`,
      `"${g.pathway.replace(/"/g, '""')}"`,
      `"${g.standardCode}"`,
      `"การออกแบบและเขียนโปรแกรมควบคุมแบบวนซ้ำ (Loops)"`,
      g.maxScore.toFixed(1),
      g.letterGrade === "ร" || g.letterGrade === "รอตรวจ" ? '"-"' : g.rawScore.toFixed(1),
      g.letterGrade === "ร" || g.letterGrade === "รอตรวจ" ? '"-"' : `${g.percentScore}%`,
      g.letterGrade,
      `"${g.gradeLevel}"`,
      g.letterGrade === "ร" ? '"0% (0/3 งาน)"' : g.letterGrade === "รอตรวจ" ? `"${g.evidenceCount}/3 งาน"` : `"${Math.min(100, Math.round((g.evidenceCount / 3) * 100))}% (${g.evidenceCount}/3 งาน)"`,
      g.letterGrade === "ร" ? '"รอส่งชิ้นงาน"' : g.letterGrade === "รอตรวจ" ? '"รอคุณครูตรวจประเมิน"' : `"${g.isMastered ? 'ผ่านเกณฑ์มาตรฐาน' : 'กำลังพัฒนา'}"`
    ]);

    const csvContent = "\uFEFF" + [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `LearnWise_Gradebook_SGS_CS31101_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToastMessage("ส่งออกไฟล์ Excel/CSV (SGS Compatible) เรียบร้อยแล้ว (ดาวน์โหลดอัตโนมัติ)");
    setShowExportToast(true);
    setTimeout(() => setShowExportToast(false), 5000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Teacher Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-500/85 via-indigo-500/80 to-purple-500/85 text-white p-6 sm:p-8 shadow-sm border border-indigo-200/40">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-72 h-72 bg-white/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-2xl shadow-inner">
              👩‍🏫
            </div>
            <div>
              <div className="flex items-center gap-2 text-indigo-100 text-xs font-semibold uppercase tracking-wider">
                <School size={14} />
                <span>แดชบอร์ดครูผู้สอน • ห้องวิทยาการคำนวณ</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-0.5">
                ยินดีต้อนรับ, ครูเมย์
              </h1>
              <p className="text-sm text-indigo-100/90 mt-1">
                ติดตามการส่งงาน ตรวจให้คำแนะนำรายบุคคล และปิดการประเมิน
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center shadow-2xs">
              <span className="text-[11px] text-indigo-100 block">นักเรียนในห้อง</span>
              <span className="text-lg font-bold text-white">{envelope.students.length} คน</span>
            </div>
            <div className="bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center shadow-2xs">
              <span className="text-[11px] text-indigo-100 block">ภารกิจที่เปิดอยู่</span>
              <span className="text-lg font-bold text-white">{envelope.missions.length} งาน</span>
            </div>
          </div>
        </div>

        {/* Global Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/20 text-xs">
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 shadow-2xs">
            <div className="flex items-center gap-1.5 text-amber-100 font-semibold">
              <Clock size={14} />
              <span>รอตรวจในคิว</span>
            </div>
            <div className="text-2xl font-black mt-1 text-white">{totalSubmitted} <span className="text-xs font-normal text-amber-200">ชิ้น</span></div>
          </div>

          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 shadow-2xs">
            <div className="flex items-center gap-1.5 text-rose-100 font-semibold">
              <AlertCircle size={14} />
              <span>ส่งกลับให้แก้ไข</span>
            </div>
            <div className="text-2xl font-black mt-1 text-white">{totalChanges} <span className="text-xs font-normal text-rose-200">ชิ้น</span></div>
          </div>

          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 shadow-2xs">
            <div className="flex items-center gap-1.5 text-emerald-100 font-semibold">
              <CheckCircle2 size={14} />
              <span>ตรวจจบแล้ว</span>
            </div>
            <div className="text-2xl font-black mt-1 text-white">{totalReviewed} <span className="text-xs font-normal text-emerald-200">ชิ้น</span></div>
          </div>

          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 shadow-2xs">
            <div className="flex items-center gap-1.5 text-sky-100 font-semibold">
              <Layers size={14} />
              <span>อัตราตรวจจบ</span>
            </div>
            <div className="text-2xl font-black mt-1 text-white">
              {totalAssigned > 0 ? Math.round((totalReviewed / totalAssigned) * 100) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* 🏎️ LAMBORGHINI SUPERCAR DIGITAL COCKPIT INSTRUMENT CLUSTER */}
      <LamborghiniCockpitCluster
        masteryPct={masteryRatePct}
        pendingCount={totalSubmitted}
        changesCount={totalChanges}
        reviewedCount={totalReviewed}
        avgScore={Number(classAvgScore)}
        maxScore={6.0}
        totalMissions={envelope.missions.length}
        activeMode={cockpitMode}
        onToggleMode={() => setCockpitMode(prev => prev === "corsa" ? "strada" : "corsa")}
      />

      {/* 🧭 Teacher Learning Compass (ระบบวิเคราะห์เชิงรุกเพื่อการสอน) */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-purple-100/70 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50/80 via-pink-50/60 to-indigo-50/70 px-5 sm:px-6 py-4 border-b border-purple-100/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center shadow-xs">
              <Compass size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span>Teacher Learning Compass</span>
                <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">
                  ระบบแนะแนวการสอนเชิงรุก
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                ประมวลผลข้อมูลการเรียนรู้แบบเรียลไทม์เพื่อระบุจุดที่ครูควรเข้าไปช่วยเหลือทันที
              </p>
            </div>
          </div>

          <div className="text-xs text-purple-700 font-semibold flex items-center gap-1 self-end sm:self-auto">
            <TrendingUp size={14} />
            <span>พร้อมให้ข้อเสนอแนะ {pendingReviewsList.length + needsQuizPracticeList.length} รายการ</span>
          </div>
        </div>

        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Item 1: Pending Queue */}
          <div className="p-4 rounded-xl border border-amber-200/90 bg-gradient-to-b from-amber-50/50 to-white space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-900 flex items-center gap-1.5">
                <Clock size={15} className="text-amber-600" />
                <span>งานค้างตรวจ ({pendingReviewsList.length})</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">ควรทำก่อน</span>
            </div>
            {pendingReviewsList.length === 0 ? (
              <p className="text-slate-500 italic">ไม่มีงานรอตรวจในคิว</p>
            ) : (
              <div className="space-y-2">
                {pendingReviewsList.map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-white rounded-lg border border-amber-100 flex items-center justify-between gap-2 shadow-2xs">
                    <div>
                      <div className="font-bold text-slate-900">{item.student.name}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[130px]">{item.missionTitle}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenGrading(item.missionId)}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-[10px] transition-colors cursor-pointer"
                    >
                      ตรวจ
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Item 2: Needs Quiz Practice */}
          <div className="p-4 rounded-xl border border-rose-200/90 bg-gradient-to-b from-rose-50/50 to-white space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-900 flex items-center gap-1.5">
                <AlertCircle size={15} className="text-rose-600" />
                <span>จุดติดขัดใน Quiz ({needsQuizPracticeList.length})</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">&lt; 80%</span>
            </div>
            {needsQuizPracticeList.length === 0 ? (
              <p className="text-slate-500 italic">นักเรียนทุกคนผ่านเกณฑ์ Quiz แล้ว</p>
            ) : (
              <div className="space-y-2">
                {needsQuizPracticeList.map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-white rounded-lg border border-rose-100 flex items-center justify-between gap-2 shadow-2xs">
                    <div>
                      <div className="font-bold text-slate-900">{item.student.name}</div>
                      <div className="text-[11px] text-rose-600 font-semibold">ได้ {item.score}/{item.maxScore} ข้อ (ควรฝึกซ้ำ)</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedStudentForDossier(item.student)}
                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-[10px] border border-rose-200 transition-colors cursor-pointer"
                    >
                      ดูข้อผิด
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Item 3: Changes Requested */}
          <div className="p-4 rounded-xl border border-indigo-200/90 bg-gradient-to-b from-indigo-50/50 to-white space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                <Sparkles size={15} className="text-indigo-600" />
                <span>กำลังปรับแก้ ({changesRequestedList.length})</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">รอบที่ 2</span>
            </div>
            {changesRequestedList.length === 0 ? (
              <p className="text-slate-500 italic">ไม่มีนักเรียนที่ต้องส่งงานรอบแก้</p>
            ) : (
              <div className="space-y-2">
                {changesRequestedList.map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-white rounded-lg border border-indigo-100 flex items-center justify-between gap-2 shadow-2xs">
                    <div>
                      <div className="font-bold text-slate-900">{item.student.name}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[130px]">{item.missionTitle}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedStudentForDossier(item.student)}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-[10px] border border-indigo-200 transition-colors cursor-pointer"
                    >
                      ดูประวัติ
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Item 4: Mastery Celebrations */}
          <div className="p-4 rounded-xl border border-emerald-200/90 bg-gradient-to-b from-emerald-50/50 to-white space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <Award size={15} className="text-emerald-600" />
                <span>ต้นแบบความเข้าใจ ({masteryCelebrations.length})</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">100%</span>
            </div>
            {masteryCelebrations.length === 0 ? (
              <p className="text-slate-500 italic">ยังไม่มีนักเรียนตรวจปิดรอบสมบูรณ์</p>
            ) : (
              <div className="space-y-2">
                {masteryCelebrations.map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-white rounded-lg border border-emerald-100 flex items-center justify-between gap-2 shadow-2xs">
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1">
                        <span>{item.student.name}</span>
                        <span className="text-emerald-600">🏆</span>
                      </div>
                      <div className="text-[11px] text-emerald-700 font-medium">มี Before & After ชัดเจน</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedStudentForDossier(item.student)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] transition-colors cursor-pointer"
                    >
                      ดูพัฒนาการ
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Missions vs Roster vs Gradebook */}
      <div className="border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-2 sm:gap-6">
          <button
            type="button"
            onClick={() => setActiveTab("missions")}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "missions"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Layers size={17} />
            <span>ภาพรวมภารกิจ (Missions)</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
              {envelope.missions.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("roster")}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "roster"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users size={17} />
            <span>ความก้าวหน้านักเรียน (Roster)</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold">
              {envelope.students.length} คน
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("gradebook")}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "gradebook"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <GraduationCap size={17} className={activeTab === "gradebook" ? "text-emerald-600" : ""} />
            <span>สมุดตัดเกรดมาตรฐาน (Unified Gradebook)</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
              ว 4.2 ตัวชี้วัดแกนกลาง
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: Missions List */}
      {activeTab === "missions" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">ภารกิจทั้งหมดในห้องเรียน</h2>
            </div>
            <button
              onClick={() => setIsCreatorOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none self-start sm:self-auto"
            >
              <Plus size={15} />
              <span>+ สร้างงานใหม่</span>
            </button>
          </div>

          <div className="grid gap-5">
            {envelope.missions.map((mission) => {
              const targetCount = mission.targetStudentIds.length;
              
              let submitted = 0;
              let changesRequested = 0;
              let reviewed = 0;
              let notStarted = 0;
              let started = 0;
              
              mission.targetStudentIds.forEach(studentId => {
                const status = getWorkStatus(studentId, mission.id);
                if (status === "submitted") submitted++;
                else if (status === "changes-requested") changesRequested++;
                else if (status === "reviewed") reviewed++;
                else if (status === "started") started++;
                else notStarted++;
              });

              const completionRate = targetCount > 0 ? Math.round((reviewed / targetCount) * 100) : 0;

              return (
                <div 
                  key={mission.id} 
                  className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:shadow-lg hover:-translate-y-0.5 hover:border-indigo-300 transition-all duration-200 space-y-5"
                >
                  {/* Header of Mission Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${
                          mission.type === "short-answer" 
                            ? "bg-blue-50 text-blue-700 border-blue-200" 
                            : mission.type === "coding"
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                            : "bg-purple-50 text-purple-700 border-purple-200"
                        }`}>
                          {mission.type === "short-answer" ? "คำตอบสั้น (Short Answer)" : mission.type === "coding" ? "เขียนโค้ด (Coding)" : "แบบทดสอบ (Quiz)"}
                        </span>
                        <span className="text-xs font-medium text-slate-500">• {mission.topic}</span>
                        <span className="text-xs font-medium text-slate-400">• มอบหมาย {targetCount} คน</span>
                      </div>

                      <h3 className="font-bold text-lg text-slate-900">
                        {mission.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600">
                        {mission.description}
                      </p>
                    </div>

                    <div className="shrink-0 w-full sm:w-auto">
                      <button 
                        onClick={() => onOpenGrading(mission.id)}
                        className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 cursor-pointer w-full sm:w-auto focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
                          mission.type === "quiz"
                            ? "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20 focus-visible:ring-purple-500"
                            : submitted > 0
                            ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20 focus-visible:ring-amber-500"
                            : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 focus-visible:ring-blue-500"
                        }`}
                      >
                        {mission.type === "quiz" ? (
                          <>
                            <Eye size={14} />
                            <span>ดูผลการสอบ ({reviewed}/{targetCount} คน)</span>
                          </>
                        ) : (
                          <>
                            <span>เปิดคิวตรวจ ({submitted} รอตรวจ)</span>
                            <ArrowRight size={14} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-600 font-medium">
                      <span>ความก้าวหน้าทั้งชั้นเรียน</span>
                      <span className="font-bold text-slate-900">{completionRate}% ตรวจจบแล้ว</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                      <div style={{ width: `${(reviewed / targetCount) * 100}%` }} className="bg-emerald-500 transition-all duration-500" title={`ตรวจจบ: ${reviewed} คน`}></div>
                      <div style={{ width: `${(submitted / targetCount) * 100}%` }} className="bg-amber-500 transition-all duration-500" title={`รอตรวจ: ${submitted} คน`}></div>
                      <div style={{ width: `${(changesRequested / targetCount) * 100}%` }} className="bg-rose-400 transition-all duration-500" title={`ให้แก้ไข: ${changesRequested} คน`}></div>
                      <div style={{ width: `${(started / targetCount) * 100}%` }} className="bg-blue-400 transition-all duration-500" title={`กำลังทำ: ${started} คน`}></div>
                    </div>
                  </div>

                  {/* Status Counter Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                    <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 flex items-center justify-between hover:bg-amber-100/60 transition-colors">
                      <div className="flex items-center gap-2 text-amber-800">
                        <Clock size={15} className="text-amber-600" />
                        <span className="font-medium">รอตรวจ</span>
                      </div>
                      <span className="font-bold text-base text-amber-950">{submitted}</span>
                    </div>

                    <div className="bg-rose-50/80 border border-rose-200/80 rounded-xl p-3 flex items-center justify-between hover:bg-rose-100/60 transition-colors">
                      <div className="flex items-center gap-2 text-rose-800">
                        <AlertCircle size={15} className="text-rose-600" />
                        <span className="font-medium">ให้แก้ไข</span>
                      </div>
                      <span className="font-bold text-base text-rose-950">{changesRequested}</span>
                    </div>

                    <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3 flex items-center justify-between hover:bg-emerald-100/60 transition-colors">
                      <div className="flex items-center gap-2 text-emerald-800">
                        <CheckCircle2 size={15} className="text-emerald-600" />
                        <span className="font-medium">ตรวจจบ</span>
                      </div>
                      <span className="font-bold text-base text-emerald-950">{reviewed}</span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Users size={15} className="text-slate-500" />
                        <span className="font-medium">ยังไม่เริ่ม/ทำ</span>
                      </div>
                      <span className="font-bold text-base text-slate-900">{notStarted + started}</span>
                    </div>
                  </div>

                  {/* Students status chips preview */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">นักเรียน:</span>
                    {envelope.students.map((s) => {
                      const st = getWorkStatus(s.id, mission.id);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSelectedStudentForDossier(s)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg font-medium border flex items-center gap-1 transition-all hover:scale-105 cursor-pointer ${
                            st === "submitted" 
                              ? "bg-amber-50 text-amber-800 border-amber-200 font-bold shadow-2xs"
                              : st === "changes-requested"
                              ? "bg-rose-50 text-rose-800 border-rose-200"
                              : st === "reviewed"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-slate-50 text-slate-500 border-slate-200"
                          }`}
                          title={`คลิกเพื่อดูแฟ้มสะสมงานของ ${s.name}`}
                        >
                          <span>{s.name}</span>
                          {st === "submitted" && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Class Roster & Student Evidence Dossier View */}
      {activeTab === "roster" && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
            {/* Filter & Search Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อนักเรียนหรือรหัส..."
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Status Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setRosterFilter("all")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                    rosterFilter === "all"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  ทั้งหมด ({envelope.students.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRosterFilter("pending")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                    rosterFilter === "pending"
                      ? "bg-amber-500 text-white"
                      : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                  }`}
                >
                  มีงานรอตรวจ ({pendingReviewsList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRosterFilter("changes")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                    rosterFilter === "changes"
                      ? "bg-rose-600 text-white"
                      : "bg-rose-50 text-rose-800 hover:bg-rose-100"
                  }`}
                >
                  ต้องแก้ไข ({changesRequestedList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRosterFilter("done")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                    rosterFilter === "done"
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                  }`}
                >
                  ตรวจครบทุกภารกิจ
                </button>

                <div className="h-4 w-px bg-slate-300 mx-1 hidden sm:block"></div>

                <button
                  type="button"
                  onClick={() => setRosterFilter("coder")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                    rosterFilter === "coder"
                      ? "bg-indigo-700 text-white"
                      : "bg-indigo-50 text-indigo-800 hover:bg-indigo-100"
                  }`}
                >
                  💻 สาย Coder
                </button>

                <button
                  type="button"
                  onClick={() => setRosterFilter("explainer")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                    rosterFilter === "explainer"
                      ? "bg-blue-700 text-white"
                      : "bg-blue-50 text-blue-800 hover:bg-blue-100"
                  }`}
                >
                  ✍️ สาย Explainer
                </button>

                <button
                  type="button"
                  onClick={() => setRosterFilter("explorer")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                    rosterFilter === "explorer"
                      ? "bg-purple-700 text-white"
                      : "bg-purple-50 text-purple-800 hover:bg-purple-100"
                  }`}
                >
                  🎯 สาย Explorer
                </button>
              </div>
            </div>

            {/* Roster Table / Cards */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">นักเรียน</th>
                    <th className="p-3.5 text-center">สไตล์การเรียนรู้ (Persona)</th>
                    {envelope.missions.map(m => (
                      <th key={m.id} className="p-3.5 text-center">
                        <span className="block truncate max-w-[140px]" title={m.title}>
                          {m.type === "short-answer" ? "คำตอบสั้น" : m.type === "coding" ? "เขียนโค้ด" : "แบบทดสอบ"}
                        </span>
                      </th>
                    ))}
                    <th className="p-3.5 text-center">ความก้าวหน้า</th>
                    <th className="p-3.5 text-right">แฟ้มสะสมงาน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map(student => {
                    let completed = 0;
                    envelope.missions.forEach(m => {
                      if (getWorkStatus(student.id, m.id) === "reviewed") completed++;
                    });
                    const pct = Math.round((completed / envelope.missions.length) * 100);

                    const studentIndex = envelope.students.findIndex(s => s.id === student.id);
                    const matchingUser = findMatchingUser(student, users);
                    const cleanId = getCleanStudentId(student, studentIndex, matchingUser);
                    const isGoogle = isGoogleAccount(matchingUser, student.id);

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                              {student.name.slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{student.name}</div>
                              <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                                <span>{cleanId}</span>
                                {matchingUser?.schoolId && (
                                  <span className="text-[10px] text-slate-500 font-sans">({matchingUser.schoolId})</span>
                                )}
                                {isGoogle && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 font-sans font-semibold">
                                    Google
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Learning Persona Badge */}
                        <td className="p-3.5 text-center">
                          {student.learnerProfile ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-indigo-50/80 text-indigo-900 border border-indigo-200 shadow-2xs">
                              <span>
                                {student.learnerProfile.persona === "Hands-on Coder" ? "💻" :
                                 student.learnerProfile.persona === "Conceptual Explainer" ? "✍️" :
                                 student.learnerProfile.persona === "Fast Explorer" ? "🎯" :
                                 student.learnerProfile.persona === "Resilient Improver" ? "🔄" : "⚖️"}
                              </span>
                              <span>{student.learnerProfile.persona}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-medium text-slate-500 bg-slate-50 border border-slate-200" title="ยังไม่มีร่องรอยการส่งงานจริงในระบบ">
                              <span>⏳</span>
                              <span>รอร่องรอยชิ้นงาน (0 ชิ้น)</span>
                            </span>
                          )}
                        </td>

                        {/* Mission Status Badges for each mission */}
                        {envelope.missions.map(m => {
                          const st = getWorkStatus(student.id, m.id);
                          const atts = envelope.attempts.filter(a => a.studentId === student.id && a.missionId === m.id);
                          const quiz = envelope.quizHistory.find(q => q.studentId === student.id && q.missionId === m.id);

                          return (
                            <td key={m.id} className="p-3.5 text-center">
                              <span className={`inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                                st === "reviewed"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : st === "submitted"
                                  ? "bg-amber-50 text-amber-800 border-amber-200 font-black animate-pulse"
                                  : st === "changes-requested"
                                  ? "bg-rose-50 text-rose-800 border-rose-200"
                                  : st === "started"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-slate-100 text-slate-400 border-slate-200"
                              }`}>
                                {m.type === "quiz" && quiz ? (
                                  <span>{quiz.score}/{quiz.maxScore} ข้อ</span>
                                ) : (
                                  <span>
                                    {st === "reviewed" ? "ตรวจจบแล้ว" :
                                     st === "submitted" ? "รอตรวจ" :
                                     st === "changes-requested" ? "ให้แก้ไข" :
                                     st === "started" ? "เริ่มทำ" : "ยังไม่เริ่ม"}
                                  </span>
                                )}
                              </span>
                              {atts.length > 1 && (
                                <span className="block text-[10px] text-indigo-600 font-semibold mt-0.5">
                                  {atts.length} รอบส่ง
                                </span>
                              )}
                            </td>
                          );
                        })}

                        {/* Completion Rate */}
                        <td className="p-3.5 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="font-bold text-slate-700">{pct}%</span>
                          </div>
                        </td>

                        {/* Action: Open Dossier & Parent Report */}
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedStudentForParentReport(student)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold border border-blue-200/80 transition-all hover:-translate-y-0.5 cursor-pointer shadow-2xs text-xs"
                              title="เปิดใบรายงานการค้นพบศักยภาพและพัฒนาการสำหรับผู้ปกครอง"
                            >
                              <UserCheck size={13} />
                              <span>รายงานผู้ปกครอง</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedStudentForDossier(student)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200/80 transition-all hover:-translate-y-0.5 cursor-pointer shadow-2xs text-xs"
                            >
                              <FileText size={13} />
                              <span>ดูแฟ้มสะสมงาน</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Unified Standards Gradebook & Mastery Matrix */}
      {activeTab === "gradebook" && (
        <div className="space-y-6">
          {/* Header Card: Ministry Standard Alignment */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 border border-emerald-500/30 shadow-lg relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    <span>หลักสูตรแกนกลาง • สาระเทคโนโลยี ว 4.2</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold">
                    ตัวชี้วัด ม.4/1: การออกแบบและเขียนโปรแกรมควบคุมแบบวนซ้ำ (Loops)
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold">
                    เกณฑ์ประเมินกลาง 6 มิติ (Unified 6-Point Rubric)
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
                  <GraduationCap className="text-emerald-400" size={26} />
                  <span>สมุดตัดเกรดอิงมาตรฐานหลักสูตร (Unified Standards-Based Gradebook)</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                  เชื่อมโยงการประเมินจากทุกเส้นทางการเรียนรู้ (Coding / Conceptual / Quiz) สู่เกณฑ์สมรรถนะมาตรฐานเดียวกัน 
                  นักเรียนทุกคนจึงได้รับความยุติธรรม โปร่งใส พร้อมหลักฐานตรวจสอบย้อนกลับ (Audit Trail) ครบถ้วนตามระเบียบวัดผล ปพ.5
                </p>
              </div>

              <div className="flex flex-wrap lg:flex-col items-center lg:items-end gap-2.5 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-100 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer border border-slate-700"
                    title="ส่งออกไฟล์ข้อมูลคะแนนสำหรับนำเข้าโปรแกรม SGS ของ สพฐ."
                  >
                    <Download size={15} className="text-emerald-400" />
                    <span>ส่งออก Excel/CSV (SGS)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePrintGradebook}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer border border-emerald-400/30"
                  >
                    <Printer size={15} />
                    <span>พิมพ์ใบสรุปผลการเรียน (ปพ.5)</span>
                  </button>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  อัปเดตอัตโนมัติแบบ Real-time • รองรับ SGS
                </span>
              </div>
            </div>
          </div>

          {/* Export Toast Notification */}
          {showExportToast && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-4 flex items-center justify-between shadow-sm animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCheck size={18} />
                </div>
                <div>
                  <div className="font-bold text-xs">{toastMessage}</div>
                  <div className="text-[11px] text-emerald-700">
                    ข้อมูลผลการประเมินตามตัวชี้วัด ว 4.2 ม.4/1 ทั้งหมด 8 คน พร้อมจัดส่งฝ่ายวิชาการและผู้ปกครอง
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExportToast(false)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 px-2 py-1 cursor-pointer"
              >
                ปิด
              </button>
            </div>
          )}

          {/* 4 Summary Supercar KPI Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-2xl p-4 border-2 border-emerald-500/30 shadow-lg flex flex-col items-center justify-between">
              <div className="w-full flex items-center justify-between text-xs text-emerald-400 font-mono font-bold">
                <span>อัตราผ่านเกณฑ์มาตรฐาน</span>
                <ShieldCheck size={16} className="text-emerald-400" />
              </div>
              <LamborghiniArcGauge
                value={masteryRatePct}
                max={100}
                unit="%"
                label="ผ่านเกณฑ์เข้าใจจริง"
                gear="S"
                color="verde"
                size="sm"
                subLabel={`ผ่าน ${masteredStudentsCount}/${totalStudentsCount} คน`}
              />
            </div>

            <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-2xl p-4 border-2 border-cyan-500/30 shadow-lg flex flex-col items-center justify-between">
              <div className="w-full flex items-center justify-between text-xs text-cyan-400 font-mono font-bold">
                <span>คะแนนเฉลี่ยระดับห้อง</span>
                <Award size={16} className="text-cyan-400" />
              </div>
              <LamborghiniArcGauge
                value={Number(classAvgScore)}
                max={6.0}
                unit="/ 6.0"
                label="คะแนนเฉลี่ยห้อง"
                gear="D"
                color="blu"
                size="sm"
                subLabel={`คิดเป็น ${classAvgPct}% ของเกณฑ์`}
              />
            </div>

            <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-2xl p-4 border-2 border-amber-500/30 shadow-lg flex flex-col items-center justify-between">
              <div className="w-full flex items-center justify-between text-xs text-amber-400 font-mono font-bold">
                <span>การกระจายระดับเกรด 4</span>
                <BarChart3 size={16} className="text-amber-400" />
              </div>
              <LamborghiniArcGauge
                value={totalStudentsCount > 0 ? Math.round((grade4Count / totalStudentsCount) * 100) : 100}
                max={100}
                unit="%"
                label="อัตราได้เกรด 4.0"
                gear="S"
                color="giallo"
                size="sm"
                subLabel={`เกรด 4: ${grade4Count} • เกรด 3.5: ${grade35Count}`}
              />
            </div>

            <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-2xl p-4 border-2 border-purple-500/30 shadow-lg flex flex-col items-center justify-between">
              <div className="w-full flex items-center justify-between text-xs text-purple-400 font-mono font-bold">
                <span>ความหลากหลายของเส้นทาง</span>
                <Sparkles size={16} className="text-purple-400" />
              </div>
              <LamborghiniArcGauge
                value={100}
                max={100}
                unit="%"
                label="UDL DIVERSITY"
                gear="D"
                color="viola"
                size="sm"
                subLabel="โค้ด 4 • อธิบาย 2 • ควิซ 2"
              />
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={gradebookSearch}
                onChange={e => setGradebookSearch(e.target.value)}
                placeholder="ค้นหาชื่อ หรือรหัสนักเรียน..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-500 text-[11px] font-bold mr-1">ตัวกรองเกรด / เส้นทาง:</span>
              <button
                type="button"
                onClick={() => setGradebookFilter("all")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  gradebookFilter === "all"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                ทั้งหมด ({gradeSummaries.length})
              </button>
              <button
                type="button"
                onClick={() => setGradebookFilter("g4")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  gradebookFilter === "g4"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                }`}
              >
                🏆 เกรด 4.0 ({grade4Count})
              </button>
              <button
                type="button"
                onClick={() => setGradebookFilter("g35")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  gradebookFilter === "g35"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200"
                }`}
              >
                🥈 เกรด 3.5 ({grade35Count})
              </button>
              <button
                type="button"
                onClick={() => setGradebookFilter("coder")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  gradebookFilter === "coder"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200"
                }`}
              >
                💻 สาย Coder
              </button>
              <button
                type="button"
                onClick={() => setGradebookFilter("explainer")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  gradebookFilter === "explainer"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200"
                }`}
              >
                ✍️ สาย Explainer
              </button>
              <button
                type="button"
                onClick={() => setGradebookFilter("pending")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  gradebookFilter === "pending"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200"
                }`}
              >
                ⏳ รอส่ง/รอตรวจ ({pendingGradeCount})
              </button>
            </div>
          </div>

          {/* Unified Gradebook & Standards Matrix Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="p-4 sm:px-6 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  ตารางตัดเกรดมาตรฐานสมรรถนะรายบุคคล (Individual Standards Attainment Matrix)
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                แสดงผล {filteredGradeSummaries.length} จาก {envelope.students.length} คน
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5 text-center w-12">ลำดับ</th>
                    <th className="p-3.5">นักเรียน & Learning Persona</th>
                    <th className="p-3.5">เส้นทางการพิสูจน์สมรรถนะ (Evidence Pathway)</th>
                    <th className="p-3.5 text-center">ตัวชี้วัด ว 4.2 ม.4/1</th>
                    <th className="p-3.5 text-center">คะแนนมาตรฐาน (เต็ม 6.0)</th>
                    <th className="p-3.5 text-center">ระดับผลการเรียน</th>
                    <th className="p-3.5 text-center">ความมั่นใจ Profile</th>
                    <th className="p-3.5 text-right">หลักฐานตรวจสอบ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredGradeSummaries.map((item, idx) => {
                    return (
                      <tr key={item.student.id} className="hover:bg-emerald-50/30 transition-colors">
                        {/* Index */}
                        <td className="p-3.5 text-center font-bold text-slate-400">
                          {idx + 1}
                        </td>

                        {/* Student Name & Persona */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                              {item.student.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{item.student.name}</span>
                                <span className="text-[10px] font-normal text-slate-500">({item.student.id})</span>
                              </div>
                              {item.student.learnerProfile ? (
                                <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                                  <span>
                                    {item.student.learnerProfile.persona === "Hands-on Coder" ? "💻" :
                                     item.student.learnerProfile.persona === "Conceptual Explainer" ? "✍️" :
                                     item.student.learnerProfile.persona === "Fast Explorer" ? "🎯" :
                                     item.student.learnerProfile.persona === "Resilient Improver" ? "🔄" : "⚖️"}
                                  </span>
                                  <span>{item.student.learnerProfile.persona}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200" title="ยังไม่มีร่องรอยการส่งงานจริง">
                                  <span>⏳</span>
                                  <span>รอร่องรอยชิ้นงาน (0 ชิ้น)</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Evidence Pathway */}
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-800">
                            {item.pathway}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {item.letterGrade === "ร" ? "ยังไม่พบชิ้นงานส่งตรวจ (รอส่งภารกิจ)" : "ประเมินผ่านเกณฑ์ 6 มิติ (Syntax/Logic/State/Loop Control)"}
                          </div>
                        </td>

                        {/* Curriculum Standard */}
                        <td className="p-3.5 text-center">
                          {item.isMastered ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 size={12} className="text-emerald-600" />
                              <span>ผ่านเกณฑ์ ว 4.2</span>
                            </span>
                          ) : item.letterGrade === "รอตรวจ" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <Clock size={12} className="text-amber-600" />
                              <span>รอประเมิน ว 4.2</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <AlertCircle size={12} className="text-rose-500" />
                              <span>รอส่งชิ้นงาน</span>
                            </span>
                          )}
                        </td>

                        {/* Standard Score */}
                        <td className="p-3.5 text-center">
                          {item.letterGrade === "ร" || item.letterGrade === "รอตรวจ" ? (
                            <div className="inline-flex flex-col items-center gap-0.5">
                              <div className="font-bold text-sm text-slate-400">
                                - <span className="text-[11px] font-normal text-slate-400">/ 6.0</span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {item.letterGrade === "ร" ? "ยังไม่มีคะแนน" : "รอครูตรวจ"}
                              </span>
                            </div>
                          ) : (
                            <div className="inline-flex flex-col items-center gap-1">
                              <div className="font-black text-sm text-slate-900">
                                {item.rawScore.toFixed(1)} <span className="text-[11px] font-normal text-slate-500">/ 6.0</span>
                              </div>
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500" 
                                  style={{ width: `${item.percentScore}%` }} 
                                />
                              </div>
                              <span className="text-[10px] font-semibold text-emerald-700">{item.percentScore}%</span>
                            </div>
                          )}
                        </td>

                        {/* Letter Grade & Level */}
                        <td className="p-3.5 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black border ${item.gradeBadgeColor}`}>
                              เกรด {item.letterGrade}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium mt-0.5">
                              {item.gradeLevel}
                            </span>
                          </div>
                        </td>

                        {/* Triangulation Confidence */}
                        <td className="p-3.5 text-center">
                          <div className="inline-flex flex-col items-center">
                            {item.letterGrade === "ร" ? (
                              <>
                                <span className="text-[11px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                                  0% (0/3 งาน)
                                </span>
                                <span className="text-[10px] text-slate-400 mt-0.5">
                                  รอส่งชิ้นงาน
                                </span>
                              </>
                            ) : item.letterGrade === "รอตรวจ" ? (
                              <>
                                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                  {item.evidenceCount}/3 งาน
                                </span>
                                <span className="text-[10px] text-amber-600 mt-0.5">
                                  รอตรวจให้คะแนน
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  {Math.min(100, Math.round((item.evidenceCount / 3) * 100))}% ({item.evidenceCount}/3 งาน)
                                </span>
                                <span className="text-[10px] text-slate-400 mt-0.5">
                                  Triangulated
                                </span>
                              </>
                            )}
                          </div>
                        </td>

                        {/* Audit Action & Parent Report Buttons */}
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedStudentForParentReport(item.student)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] border border-blue-200/80 transition-all hover:-translate-y-0.5 cursor-pointer shadow-2xs"
                              title="เปิดใบรายงานการค้นพบศักยภาพและพัฒนาการสำหรับผู้ปกครอง"
                            >
                              <UserCheck size={12} />
                              <span>รายงานผู้ปกครอง</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedStudentForDossier(item.student)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition-all hover:-translate-y-0.5 cursor-pointer shadow-2xs"
                            >
                              <FileText size={12} />
                              <span>ตรวจหลักฐาน</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Committee Assurance Card (คำชี้แจงสำหรับตอบกรรมการ) */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 border border-indigo-400/30 shadow-md space-y-4">
            <div className="flex items-center gap-2.5 text-amber-300 font-bold text-sm">
              <ShieldCheck size={18} className="text-amber-400" />
              <span>หลักประกันความยุติธรรมตามมาตรฐานกระทรวงศึกษาธิการ (Pedagogical & Standards Assurance)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="font-bold text-indigo-200 flex items-center gap-1.5">
                  <span>1. ความเท่าเทียม (Standards Equivalence)</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  หลักสูตรแกนกลางกำหนด <strong>ตัวชี้วัด (Competency)</strong> ไม่ได้จำกัดเครื่องมือส่งงาน 
                  รูบริก 6 มิติชุดเดียวกันถูกใช้ตรวจทั้งโจทย์เขียนโค้ดและโจทย์อธิบายความเข้าใจเชิงตรรกะ 
                  ทุกคะแนนจึงมีค่าเท่ากันตามระเบียบวัดผล
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="font-bold text-emerald-200 flex items-center gap-1.5">
                  <span>2. การสอบทาน 3 ชิ้นงาน (Triangulation)</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  ก่อนที่ระบบจะเปิดให้ Auto-Assign ตาม Persona นักเรียนจะต้องผ่าน <strong>3 Baseline Tasks</strong> 
                  (Quiz + Short-Answer + Coding) ร่วมกับ Micro-Pulse Feedback 
                  เพื่อให้ความมั่นใจแตะ 100% จึงมั่นใจได้ว่างานที่มอบหมายตรงกับความถนัดจริง
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="font-bold text-purple-200 flex items-center gap-1.5">
                  <span>3. ตรวจสอบย้อนกลับได้ (Full Audit Trail)</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  ทุกเกรดที่ปรากฏในสมุดตัดเกรดนี้สามารถคลิก <strong>"ตรวจหลักฐาน"</strong> เพื่อเปิดแฟ้มสะสมงาน (Audit Dossier) 
                  ดู Before & After, รูบริกย่อย, และข้อคิดเห็นของครูรายรอบได้ทันที รองรับการประเมินจากฝ่ายวิชาการและสมศ. 100%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Evidence Dossier Modal */}
      {selectedStudentForDossier && (
        <StudentDossierModal
          isOpen={true}
          onClose={() => setSelectedStudentForDossier(null)}
          student={selectedStudentForDossier}
          missions={envelope.missions}
          attempts={envelope.attempts}
          reviews={envelope.reviews}
          quizHistory={envelope.quizHistory}
          getWorkStatus={getWorkStatus}
          onOpenGrading={(missionId) => {
            setSelectedStudentForDossier(null);
            onOpenGrading(missionId);
          }}
        />
      )}

      <AssignmentCreatorModal 
        isOpen={isCreatorOpen} 
        onClose={() => setIsCreatorOpen(false)} 
      />

      {/* Official Transcript & Evaluation Modal (แบบ ปพ.5 สมจริง) */}
      <OfficialTranscriptModal
        isOpen={isTranscriptModalOpen}
        onClose={() => setIsTranscriptModalOpen(false)}
        gradeSummaries={gradeSummaries}
        classAvgScore={classAvgScore}
        classAvgPct={classAvgPct}
        masteryRatePct={masteryRatePct}
      />

      {/* Parent One-Page Growth Report Modal */}
      {selectedStudentForParentReport && (
        <ParentReportModal
          isOpen={true}
          onClose={() => setSelectedStudentForParentReport(null)}
          student={selectedStudentForParentReport}
          gradeSummary={gradeSummaries.find(g => g.student.id === selectedStudentForParentReport.id)}
        />
      )}
    </div>
  );
};
