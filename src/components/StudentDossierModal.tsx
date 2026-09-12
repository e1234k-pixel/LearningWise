import React, { useState } from "react";
import { 
  X, 
  User, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  ChevronDown,
  ChevronUp,
  Award
} from "lucide-react";
import { Student, Mission, Attempt, Review, QuizHistoryEntry, WorkStatus } from "../types";
import { BeforeAfterModal } from "./BeforeAfterModal";
import { useApp } from "../context/AppDataContext";
import { getCleanStudentId, isGoogleAccount, findMatchingUser } from "../utils/userUtils";

interface StudentDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  missions: Mission[];
  attempts: Attempt[];
  reviews: Review[];
  quizHistory: QuizHistoryEntry[];
  getWorkStatus: (studentId: string, missionId: string) => WorkStatus;
  onOpenGrading?: (missionId: string) => void;
}

export const StudentDossierModal: React.FC<StudentDossierModalProps> = ({
  isOpen,
  onClose,
  student,
  missions,
  attempts,
  reviews,
  quizHistory,
  getWorkStatus,
  onOpenGrading,
}) => {
  const [selectedMissionForComparison, setSelectedMissionForComparison] = useState<Mission | null>(null);
  const [expandedMissionId, setExpandedMissionId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate student summary metrics
  let completedCount = 0;
  let pendingCount = 0;
  let reviseCount = 0;

  missions.forEach(m => {
    const st = getWorkStatus(student.id, m.id);
    if (st === "reviewed") completedCount++;
    else if (st === "submitted") pendingCount++;
    else if (st === "changes-requested") reviseCount++;
  });

  const overallProgress = Math.round((completedCount / missions.length) * 100);

  // Student specific attempts and quiz entries
  const studentAttempts = attempts.filter(a => a.studentId === student.id);
  const studentQuizEntries = quizHistory.filter(q => q.studentId === student.id);

  const { users, envelope } = useApp();
  const studentIndex = envelope.students.findIndex(s => s.id === student.id);
  const matchingUser = findMatchingUser(student, users);
  const cleanId = getCleanStudentId(student, studentIndex >= 0 ? studentIndex : undefined, matchingUser);
  const isGoogle = isGoogleAccount(matchingUser, student.id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-5 sm:p-6 flex items-start justify-between relative shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-2xl font-bold shadow-inner text-amber-300">
              {student.name.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
                <User size={13} />
                <span>แฟ้มสะสมงานและเส้นทางการเรียนรู้ (Student Dossier)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mt-0.5 text-white">
                {student.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-300">
                <span className="font-mono">รหัส: {cleanId}</span>
                {matchingUser?.schoolId && (
                  <span className="text-slate-400">({matchingUser.schoolId})</span>
                )}
                {isGoogle && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-[10px] font-semibold">
                    Google Workspace
                  </span>
                )}
                <span>•</span>
                <span>สำเร็จ {completedCount}/{missions.length} ภารกิจ ({overallProgress}%)</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Progress Indicator Bar */}
        <div className="w-full bg-slate-100 h-1.5 shrink-0">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500" 
            style={{ width: `${overallProgress}%` }}
          />
        </div>

        {/* Modal Body: Scrollable Dossier Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Summary Badges Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-center">
              <span className="text-[11px] font-semibold text-emerald-700 block">ตรวจจบ / ผ่านเกณฑ์</span>
              <span className="text-xl font-black text-emerald-900">{completedCount}</span>
            </div>
            <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-center">
              <span className="text-[11px] font-semibold text-amber-700 block">รอตรวจในคิว</span>
              <span className="text-xl font-black text-amber-900">{pendingCount}</span>
            </div>
            <div className="p-3.5 bg-rose-50/80 border border-rose-200 rounded-xl text-center">
              <span className="text-[11px] font-semibold text-rose-700 block">ต้องแก้ไขงาน</span>
              <span className="text-xl font-black text-rose-900">{reviseCount}</span>
            </div>
          </div>

          {/* 🧠 ผลการวิเคราะห์สไตล์และความถนัดในการเรียนรู้ (Learner Persona & Behavioral Telemetry) */}
          {student.learnerProfile ? (
            <div className="rounded-2xl border border-indigo-200/90 bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-slate-50 p-5 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs text-xl">
                    {student.learnerProfile.persona === "Hands-on Coder" ? "💻" :
                     student.learnerProfile.persona === "Conceptual Explainer" ? "✍️" :
                     student.learnerProfile.persona === "Fast Explorer" ? "🎯" :
                     student.learnerProfile.persona === "Resilient Improver" ? "🔄" : "⚖️"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full border border-indigo-200">
                        Learner Affinity Profile
                      </span>
                      <span className="text-xs text-slate-500">• วินิจฉัยจากพฤติกรรมจริงในระบบ</span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 mt-0.5">
                      {student.learnerProfile.personaTitle}
                    </h3>
                  </div>
                </div>

                <div className="text-xs text-indigo-900 bg-white px-3 py-1.5 rounded-xl border border-indigo-200/70 font-semibold shadow-2xs self-start sm:self-auto">
                  สไตล์เด่น: <span className="text-indigo-600 font-black">{student.learnerProfile.persona}</span>
                </div>
              </div>

              {/* Tagline description */}
              <p className="text-xs text-slate-700 leading-relaxed">
                💡 <span className="font-bold text-slate-900">การวิเคราะห์พฤติกรรม:</span> {student.learnerProfile.tagline}
              </p>

              {/* Affinity Distribution Bars */}
              <div className="space-y-2.5 bg-white p-4 rounded-xl border border-indigo-100/90 shadow-2xs">
                <div className="text-xs font-bold text-slate-800 flex flex-wrap items-center justify-between gap-1">
                  <span>สัดส่วนความถนัดแยกตามประเภทงาน (Modality Affinity):</span>
                  <span className="text-[11px] text-slate-400 font-normal">ประมวลผลจากอัตราส่งงานและคุณภาพรอบส่ง</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                  {/* Coding */}
                  <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                    <div className="flex justify-between font-semibold">
                      <span className="text-indigo-800">💻 ลงมือโค้ด (Coding)</span>
                      <span className="font-black text-indigo-900">{student.learnerProfile.affinityScores.coding}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 rounded-full transition-all duration-700"
                        style={{ width: `${student.learnerProfile.affinityScores.coding}%` }}
                      />
                    </div>
                  </div>

                  {/* Conceptual / Short Answer */}
                  <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                    <div className="flex justify-between font-semibold">
                      <span className="text-blue-800">✍️ วิเคราะห์มโนทัศน์ (SA)</span>
                      <span className="font-black text-blue-900">{student.learnerProfile.affinityScores.conceptual}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-700"
                        style={{ width: `${student.learnerProfile.affinityScores.conceptual}%` }}
                      />
                    </div>
                  </div>

                  {/* Quiz */}
                  <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                    <div className="flex justify-between font-semibold">
                      <span className="text-purple-800">🎯 แบบทดสอบไว (Quiz)</span>
                      <span className="font-black text-purple-900">{student.learnerProfile.affinityScores.quiz}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-600 rounded-full transition-all duration-700"
                        style={{ width: `${student.learnerProfile.affinityScores.quiz}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 Behavioral Telemetry Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 bg-white rounded-xl border border-indigo-100 flex items-center justify-between shadow-2xs">
                  <div>
                    <div className="text-[11px] text-slate-400 font-medium">ความเร็วเริ่มงาน (Engagement)</div>
                    <div className="font-bold text-slate-900 mt-0.5">{student.learnerProfile.telemetry.engagementSpeed}</div>
                  </div>
                  <span className="text-base">⚡</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-indigo-100 flex items-center justify-between shadow-2xs">
                  <div>
                    <div className="text-[11px] text-slate-400 font-medium">ดัชนีความอึดแก้รอบ 2-3 (Grit)</div>
                    <div className="font-bold text-slate-900 mt-0.5">{student.learnerProfile.telemetry.resilienceIndex}</div>
                  </div>
                  <span className="text-base">🛡️</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-indigo-100 flex items-center justify-between shadow-2xs">
                  <div>
                    <div className="text-[11px] text-slate-400 font-medium">รูปแบบที่โปรดปรานที่สุด</div>
                    <div className="font-bold text-indigo-700 mt-0.5">{student.learnerProfile.telemetry.preferredModality}</div>
                  </div>
                  <span className="text-base">⭐</span>
                </div>
              </div>

              {/* Pedagogical Guidance for Teacher */}
              <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl text-xs space-y-1">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <span>👩‍🏫 คำแนะนำเชิงการสอนเฉพาะบุคคล (Teacher Guidance):</span>
                </div>
                <p className="text-amber-800 leading-relaxed font-medium">
                  {student.learnerProfile.teacherRecommendation}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-5 space-y-2 text-center">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xl mx-auto">
                ⏳
              </div>
              <h4 className="font-bold text-sm text-slate-800">
                ยังไม่มีข้อมูล Learner Profile (รอร่องรอยการส่งงานจริง)
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                ระบบ LearnWise ไม่สร้างข้อมูลสมมติ ระบบจะวิเคราะห์สไตล์การเรียนรู้ (Persona), Modality Affinity และ Telemetry ให้อัตโนมัติทันทีที่นักเรียนคนนี้ส่งงานชิ้นแรก
              </p>
            </div>
          )}

          {/* Missions Journey List */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <BookOpen size={16} className="text-indigo-600" />
              <span>ความก้าวหน้าและการมีส่วนร่วมแยกตามภารกิจ</span>
            </h3>

            <div className="space-y-4">
              {missions.map(mission => {
                const status = getWorkStatus(student.id, mission.id);
                const missionAttempts = studentAttempts
                  .filter(a => a.missionId === mission.id)
                  .sort((a, b) => a.attemptNo - b.attemptNo);

                const publishedReviews = reviews.filter(
                  r => missionAttempts.some(a => a.id === r.attemptId) && r.publicationStatus === "published"
                );

                const quizResult = studentQuizEntries.find(q => q.missionId === mission.id);
                const isExpanded = expandedMissionId === mission.id;

                return (
                  <div 
                    key={mission.id} 
                    className="border border-slate-200 rounded-2xl bg-white shadow-2xs hover:border-indigo-200 transition-all overflow-hidden"
                  >
                    {/* Mission Item Bar */}
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            mission.type === "short-answer" 
                              ? "bg-blue-50 text-blue-700 border-blue-200" 
                              : mission.type === "coding"
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                              : "bg-purple-50 text-purple-700 border-purple-200"
                          }`}>
                            {mission.type === "short-answer" ? "คำตอบสั้น" : mission.type === "coding" ? "เขียนโค้ด" : "แบบทดสอบ"}
                          </span>
                          <span className="text-xs font-semibold text-slate-700">{mission.topic}</span>
                        </div>
                        <h4 className="font-bold text-base text-slate-900">{mission.title}</h4>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {/* Status Chip */}
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                          status === "reviewed"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : status === "submitted"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : status === "changes-requested"
                            ? "bg-rose-50 text-rose-800 border-rose-200"
                            : status === "started"
                            ? "bg-blue-50 text-blue-800 border-blue-200"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}>
                          {status === "reviewed" && <CheckCircle2 size={13} className="text-emerald-600" />}
                          {status === "submitted" && <Clock size={13} className="text-amber-600" />}
                          {status === "changes-requested" && <AlertCircle size={13} className="text-rose-600" />}
                          <span>
                            {status === "reviewed" ? "ตรวจจบแล้ว" :
                             status === "submitted" ? "รอตรวจในคิว" :
                             status === "changes-requested" ? "ส่งกลับให้แก้" :
                             status === "started" ? "เริ่มร่างแล้ว" : "ยังไม่เริ่ม"}
                          </span>
                        </span>

                        {/* Quick Jump to Grading */}
                        {onOpenGrading && (status === "submitted" || status === "changes-requested" || status === "reviewed") && (
                          <button
                            type="button"
                            onClick={() => onOpenGrading(mission.id)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-slate-900 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <span>เปิดตรวจ</span>
                            <ArrowRight size={12} />
                          </button>
                        )}

                        {/* Accordion Toggle */}
                        <button
                          type="button"
                          onClick={() => setExpandedMissionId(isExpanded ? null : mission.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
                          title={isExpanded ? "ย่อ" : "ขยายดูรายละเอียด"}
                        >
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Details */}
                    {isExpanded && (
                      <div className="p-4 sm:p-5 border-t border-slate-100 space-y-4 bg-white">
                        {/* Quiz Specific Details */}
                        {mission.type === "quiz" && (
                          <div className="space-y-3">
                            {quizResult ? (
                              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                                  <div className="flex items-center gap-2">
                                    <Award size={16} className={quizResult.passed ? "text-emerald-600" : "text-amber-600"} />
                                    <span className="font-bold text-xs text-slate-800">
                                      คะแนนสอบ: {quizResult.score}/{quizResult.maxScore} ข้อ ({quizResult.percentScore}%)
                                    </span>
                                  </div>
                                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                                    quizResult.passed 
                                      ? "bg-emerald-100 text-emerald-800" 
                                      : "bg-amber-100 text-amber-800"
                                  }`}>
                                    {quizResult.passed ? "ผ่านเกณฑ์แล้ว (>=80%)" : "ต้องฝึกทบทวนเพิ่ม (<80%)"}
                                  </span>
                                </div>

                                {quizResult.pulseRating && (
                                  <div className="p-2.5 bg-rose-50/70 border border-rose-200/60 rounded-xl text-rose-900 text-xs flex items-center gap-2">
                                    <span className="font-bold">💖 ความรู้สึกหลังทำแบบทดสอบ (Quiz Pulse):</span>
                                    <span className="font-semibold">{quizResult.pulseRating}</span>
                                  </div>
                                )}

                                {/* Question breakdown */}
                                {mission.config.questions && (
                                  <div className="space-y-2 pt-1 text-xs">
                                    {mission.config.questions.map((q, idx) => {
                                      const chosenId = quizResult.answers[q.id];
                                      const isCorrect = chosenId === q.correctOptionId;
                                      const chosenOpt = q.options.find(o => o.id === chosenId);
                                      const correctOpt = q.options.find(o => o.id === q.correctOptionId);

                                      return (
                                        <div key={q.id} className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
                                          <div className="font-semibold text-slate-900 flex items-center justify-between">
                                            <span>ข้อ {idx + 1}: {q.prompt}</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                              isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                                            }`}>
                                              {isCorrect ? "ถูกต้อง" : "ผิด"}
                                            </span>
                                          </div>
                                          <div className="text-slate-600 space-y-0.5">
                                            <div>
                                              คำตอบที่เลือก: <span className={isCorrect ? "font-bold text-emerald-700" : "font-bold text-rose-700"}>
                                                {chosenOpt ? `${chosenOpt.label}. ${chosenOpt.text}` : "ไม่ได้ตอบ"}
                                              </span>
                                            </div>
                                            {!isCorrect && (
                                              <div>
                                                คำตอบที่ถูกต้อง: <span className="font-bold text-emerald-700">
                                                  {correctOpt ? `${correctOpt.label}. ${correctOpt.text}` : ""}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                          <div className="p-2 bg-slate-50 rounded text-slate-500 text-[11px] italic">
                                            💡 คำอธิบาย: {q.explanation}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl">
                                นักเรียนยังไม่ได้ส่งแบบทดสอบนี้
                              </p>
                            )}
                          </div>
                        )}

                        {/* Short Answer & Coding Attempts Breakdown */}
                        {mission.type !== "quiz" && (
                          <div className="space-y-4">
                            {missionAttempts.length === 0 ? (
                              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl">
                                ยังไม่มีประวัติการส่งคำตอบสำหรับภารกิจนี้
                              </p>
                            ) : (
                              <div className="space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <span className="text-xs font-bold text-slate-700">
                                    บันทึกการส่งงาน ({missionAttempts.length} รอบ):
                                  </span>

                                  {missionAttempts.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => setSelectedMissionForComparison(mission)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-xs font-bold hover:shadow transition-all cursor-pointer"
                                    >
                                      <Sparkles size={13} />
                                      <span>เปรียบเทียบก่อน–หลัง (Before & After)</span>
                                    </button>
                                  )}
                                </div>

                                {missionAttempts.map(att => {
                                  const attReview = publishedReviews.find(r => r.attemptId === att.id);

                                  return (
                                    <div key={att.id} className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 text-xs space-y-2.5">
                                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-slate-800">รอบที่ {att.attemptNo}</span>
                                          <span className="text-slate-400">•</span>
                                          <span className="text-slate-500">{new Date(att.submittedAt).toLocaleString('th-TH')}</span>
                                        </div>
                                        {attReview && (
                                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            attReview.decision === "finalize" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                                          }`}>
                                            {attReview.decision === "finalize" ? "ตรวจเสร็จสิ้น" : "ส่งกลับให้แก้ไข"}
                                          </span>
                                        )}
                                      </div>

                                      <div>
                                        <div className="text-slate-500 font-medium mb-1">คำตอบ / โค้ดที่ส่ง:</div>
                                        <pre className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-slate-800 whitespace-pre-wrap font-sans text-xs">
                                          {att.content}
                                        </pre>
                                      </div>

                                      {att.revisionNote && (
                                        <div className="p-2.5 bg-blue-50/60 border border-blue-100 rounded-lg text-blue-900">
                                          <span className="font-bold block mb-0.5">💡 สิ่งที่นักเรียนปรับแก้ในรอบนี้:</span>
                                          <span>{att.revisionNote}</span>
                                        </div>
                                      )}

                                      {att.pulseRating && (
                                        <div className="p-2.5 bg-rose-50/60 border border-rose-100 rounded-lg text-rose-900 text-xs flex items-center gap-2">
                                          <span className="font-bold">💖 ความรู้สึกต่องานนี้ (Mission Pulse):</span>
                                          <span className="font-semibold">{att.pulseRating}</span>
                                        </div>
                                      )}

                                      {attReview && (
                                        <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg text-indigo-950 space-y-1">
                                          <span className="font-bold block">💬 Feedback จากครู:</span>
                                          <p className="whitespace-pre-wrap">{attReview.feedback}</p>
                                          {attReview.rawScore !== null && (
                                            <div className="pt-1 text-[11px] font-bold text-indigo-800">
                                              คะแนนทางการ: {attReview.rawScore}/{attReview.maxRawScore} ({attReview.percentScore}%)
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 sm:p-5 border-t border-slate-200 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>

      {/* Before & After Modal if triggered */}
      {selectedMissionForComparison && (
        <BeforeAfterModal
          isOpen={true}
          onClose={() => setSelectedMissionForComparison(null)}
          studentName={student.name}
          mission={selectedMissionForComparison}
          attempt1={studentAttempts.filter(a => a.missionId === selectedMissionForComparison.id)[0]}
          attempt2={
            studentAttempts.filter(a => a.missionId === selectedMissionForComparison.id)[
              studentAttempts.filter(a => a.missionId === selectedMissionForComparison.id).length - 1
            ]
          }
          review1={reviews.find(
            r => r.attemptId === studentAttempts.filter(a => a.missionId === selectedMissionForComparison.id)[0]?.id && 
            r.publicationStatus === "published"
          )}
          review2={reviews.find(
            r => r.attemptId === studentAttempts.filter(a => a.missionId === selectedMissionForComparison.id)[
              studentAttempts.filter(a => a.missionId === selectedMissionForComparison.id).length - 1
            ]?.id && 
            r.publicationStatus === "published"
          )}
        />
      )}
    </div>
  );
};
