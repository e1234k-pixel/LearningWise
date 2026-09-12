import { useState } from "react";
import { useApp } from "../context/AppDataContext";
import { 
  BookOpen, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  PlayCircle, 
  Compass, 
  ArrowRight,
  Sparkles,
  Calendar,
  Hourglass,
  GraduationCap,
  FileCheck,
  UserCheck,
  Check,
  Target,
  Zap
} from "lucide-react";
import type { WorkStatus, Mission } from "../types";
import { BeforeAfterModal } from "../components/BeforeAfterModal";
import { ParentReportModal } from "../components/ParentReportModal";
import { LamborghiniArcGauge, LamborghiniSegmentedBar } from "../components/cockpit/LamborghiniGauge";

export const StudentDashboard = ({ onOpenMission }: { onOpenMission: (id: string) => void }) => {
  const { role, envelope, getWorkStatus } = useApp();
  const [selectedComparisonMission, setSelectedComparisonMission] = useState<Mission | null>(null);
  const [isParentReportOpen, setIsParentReportOpen] = useState(false);
  
  if (role.type !== "student") return null;

  const currentStudent = envelope.students.find(s => s.id === role.id);
  const myMissions = envelope.missions.filter((m) => 
    !m.targetStudentIds || m.targetStudentIds.length === 0 || m.targetStudentIds.includes(role.id)
  );

  // Count stats
  let countSubmitted = 0;
  let countChanges = 0;
  let countReviewed = 0;

  myMissions.forEach(m => {
    const s = getWorkStatus(role.id, m.id);
    if (s === "submitted") countSubmitted++;
    if (s === "changes-requested") countChanges++;
    if (s === "reviewed") countReviewed++;
  });

  const quizMission = myMissions.find(m => m.type === "quiz");
  const saMission = myMissions.find(m => m.type === "short-answer");
  const codeMission = myMissions.find(m => m.type === "coding");

  const studentAttempts = envelope.attempts.filter(a => a.studentId === role.id);
  const studentQuizzes = envelope.quizHistory.filter(q => q.studentId === role.id);

  const hasQuizDone = studentQuizzes.length > 0;
  const hasSaDone = studentAttempts.some(a => a.type === "short-answer");
  const hasCodeDone = studentAttempts.some(a => a.type === "coding");

  let triangulationCount = 0;
  if (hasQuizDone) triangulationCount++;
  if (hasSaDone) triangulationCount++;
  if (hasCodeDone) triangulationCount++;
  const triangulationPct = Math.round((triangulationCount / 3) * 100);

  const StatusBadge = ({ status }: { status: WorkStatus }) => {
    switch (status) {
      case "not-started":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100/80 text-slate-600 border border-slate-200/70">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            ยังไม่เริ่ม
          </span>
        );
      case "started":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/80">
            <PlayCircle size={13} className="text-sky-500" />
            กำลังทำ
          </span>
        );
      case "submitted":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
            <Clock size={13} className="text-amber-500 animate-pulse" />
            รอครูตรวจ
          </span>
        );
      case "changes-requested":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 animate-bounce-short">
            <AlertCircle size={13} className="text-rose-500" />
            มี Feedback ให้แก้ไข
          </span>
        );
      case "reviewed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <CheckCircle2 size={13} className="text-emerald-500" />
            ตรวจจบแล้ว
          </span>
        );
      default:
        return null;
    }
  };

  const getInsight = () => {
    const needsChanges = myMissions.find(m => getWorkStatus(role.id, m.id) === "changes-requested");
    if (needsChanges) {
      return {
        type: "revision",
        title: "คำแนะนำ: ครูได้ส่ง Feedback กลับมาแล้ว",
        message: `ภารกิจ "${needsChanges.title}" ได้รับคำแนะนำเพิ่มเติมจากครูเมย์ แนะนำให้อ่านจุดที่ต้องแก้ไขและลองส่งฉบับปรับปรุงใหม่`,
        actionText: "เปิดอ่าน Feedback และแก้งาน",
        missionId: needsChanges.id
      };
    }

    const reviewed = myMissions.find(m => getWorkStatus(role.id, m.id) === "reviewed");
    if (reviewed) {
      return {
        type: "reviewed",
        title: "การตรวจเสร็จสิ้น: บรรลุผลตามเกณฑ์แล้ว",
        message: `ภารกิจ "${reviewed.title}" ครูตรวจและยืนยันคะแนนเรียบร้อยแล้ว คุณสามารถเปิดดูผลคะแนนและเปรียบเทียบคำตอบได้`,
        actionText: "ดูผลลัพธ์และคะแนน",
        missionId: reviewed.id
      };
    }

    const notStarted = myMissions.find(m => getWorkStatus(role.id, m.id) === "not-started");
    if (notStarted) {
      return {
        type: "start",
        title: "ภารกิจใหม่จากครูเมย์พร้อมให้เริ่มทำ",
        message: `มีภารกิจ "${notStarted.title}" มอบหมายโดยครูเมย์ ชลธิชา รอให้คุณเริ่มต้นทำและส่งตรวจได้ทันที`,
        actionText: "เริ่มทำภารกิจส่งครูเมย์",
        missionId: notStarted.id
      };
    }
    
    return null;
  };

  const insight = getInsight();

  // Find attempts for selected comparison mission
  const comparisonAttempts = selectedComparisonMission 
    ? envelope.attempts.filter(a => a.studentId === role.id && a.missionId === selectedComparisonMission.id).sort((a, b) => a.attemptNo - b.attemptNo)
    : [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Student Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-500/85 via-purple-500/80 to-pink-400/85 text-white p-6 sm:p-8 shadow-sm border border-purple-200/40">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-white/15 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-2xl shadow-inner">
              🎓
            </div>
            <div>
              <div className="flex items-center gap-2 text-purple-100 text-xs font-semibold uppercase tracking-wider">
                <GraduationCap size={14} />
                <span>มุมมองนักเรียน • สังกัดห้องเรียนครูเมย์ ชลธิชา</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-0.5">
                ยินดีต้อนรับ, {currentStudent?.name || "นักเรียน"}
              </h1>
              <p className="text-sm text-purple-100/90 mt-1">
                ห้องเรียนครูเมย์ (Python Loops) • ภารกิจพร้อมให้นักเรียนลงมือทำและส่งตรวจได้ทันที
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center justify-center">
            <LamborghiniArcGauge
              value={myMissions.length > 0 ? Math.round((countReviewed / myMissions.length) * 100) : 0}
              max={100}
              unit="%"
              label="ความเร็วจบงาน"
              gear={countReviewed === myMissions.length && myMissions.length > 0 ? "S" : countSubmitted > 0 ? "P" : countChanges > 0 ? "R" : "D"}
              color={countReviewed === myMissions.length && myMissions.length > 0 ? "verde" : "blu"}
              size="sm"
              subLabel="LEARNING VELOCITY"
            />
          </div>
        </div>

        {/* Quick Stats Grid inside Hero */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/20 text-xs">
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 shadow-2xs">
            <div className="text-purple-100 font-medium">งานทั้งหมด</div>
            <div className="text-xl font-bold mt-0.5">{myMissions.length} ชิ้น</div>
          </div>
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 shadow-2xs">
            <div className="text-amber-100 font-medium">รอครูตรวจ</div>
            <div className="text-xl font-bold mt-0.5 text-amber-200">{countSubmitted} ชิ้น</div>
          </div>
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 shadow-2xs">
            <div className="text-rose-100 font-medium">รอส่งรอบแก้ไข</div>
            <div className="text-xl font-bold mt-0.5 text-rose-200">{countChanges} ชิ้น</div>
          </div>
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 shadow-2xs">
            <div className="text-emerald-100 font-medium">ตรวจจบแล้ว</div>
            <div className="text-xl font-bold mt-0.5 text-emerald-200">{countReviewed} ชิ้น</div>
          </div>
        </div>
      </div>

      {/* 🌟 My Learning Superpower & Persona Card */}
      {currentStudent?.learnerProfile ? (
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white rounded-2xl p-5 sm:p-6 border border-indigo-500/30 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5">
                  <Sparkles size={13} className="text-purple-400" />
                  <span>My Learning Superpower • สไตล์การเรียนรู้เฉพาะบุคคล</span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                  วิเคราะห์จากร่องรอยการทำงานจริง
                </span>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-2xl shadow-inner shrink-0">
                  {currentStudent.learnerProfile.persona === "Hands-on Coder" ? "💻" :
                   currentStudent.learnerProfile.persona === "Conceptual Explainer" ? "✍️" :
                   currentStudent.learnerProfile.persona === "Fast Explorer" ? "🎯" :
                   currentStudent.learnerProfile.persona === "Resilient Improver" ? "🔄" : "⚖️"}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                    <span>{currentStudent.learnerProfile.persona}</span>
                    <span className="text-xs font-normal text-indigo-300">({currentStudent.learnerProfile.personaTitle})</span>
                  </h2>
                  <p className="text-xs text-indigo-200 mt-0.5">
                    {currentStudent.learnerProfile.tagline}
                  </p>
                </div>
              </div>
            </div>

            {/* 3 Supercar Cockpit Telemetry Sensors */}
            <div className="grid grid-cols-3 gap-2.5 text-center text-xs shrink-0 font-mono">
              <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-2.5 shadow-inner">
                <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">0-100 ACCEL</div>
                <div className="text-xs font-black text-amber-300 mt-1">{currentStudent.learnerProfile.telemetry.engagementSpeed}</div>
                <div className="text-[9px] text-slate-500 mt-0.5">ความเร็วเริ่มงาน</div>
              </div>
              <div className="bg-slate-950/80 border border-emerald-500/30 rounded-xl p-2.5 shadow-inner">
                <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">BOOST PRESSURE</div>
                <div className="text-xs font-black text-emerald-300 mt-1">{currentStudent.learnerProfile.telemetry.resilienceIndex}</div>
                <div className="text-[9px] text-slate-500 mt-0.5">ดัชนีความมุ่งมั่น</div>
              </div>
              <div className="bg-slate-950/80 border border-cyan-500/30 rounded-xl p-2.5 shadow-inner">
                <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">DRIVE MODALITY</div>
                <div className="text-xs font-black text-cyan-300 mt-1">{currentStudent.learnerProfile.telemetry.preferredModality}</div>
                <div className="text-[9px] text-slate-500 mt-0.5">รูปแบบที่โปรดปราน</div>
              </div>
            </div>
          </div>

          {/* Modality Affinity Slanted Chevron Bars & Level-Up Tip */}
          <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 border-b border-white/10 pb-1.5">
                <span className="font-bold text-amber-400 uppercase tracking-wider">★ MODALITY AFFINITY GAUGES ★</span>
                <span className="text-purple-300 font-black">100% CALIBRATED</span>
              </div>
              <div className="space-y-2.5 pt-0.5">
                <LamborghiniSegmentedBar
                  label="สายเขียนโค้ด (Coding Challenge)"
                  value={currentStudent.learnerProfile.affinityScores.coding}
                  color="blu"
                  icon="💻"
                  segmentsCount={12}
                />
                <LamborghiniSegmentedBar
                  label="สายคิดวิเคราะห์มโนทัศน์ (Concept)"
                  value={currentStudent.learnerProfile.affinityScores.conceptual}
                  color="viola"
                  icon="✍️"
                  segmentsCount={12}
                />
                <LamborghiniSegmentedBar
                  label="สายทดสอบตรรกะไว (Quiz Mastery)"
                  value={currentStudent.learnerProfile.affinityScores.quiz}
                  color="verde"
                  icon="🎯"
                  segmentsCount={12}
                />
              </div>
            </div>

            <div className="bg-slate-950/60 border border-amber-500/30 rounded-2xl p-4 space-y-2 flex flex-col justify-center shadow-inner">
              <div className="flex items-center gap-1.5 text-amber-300 font-mono font-bold text-xs uppercase tracking-wider">
                <span>⚡ LEVEL-UP CORSA TIP (กลยุทธ์อัปสปีด):</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed font-normal">
                {currentStudent.learnerProfile.teacherRecommendation}
              </p>
            </div>
          </div>

          {/* Action to open Parent Report */}
          <div className="mt-4 pt-3.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-indigo-200 text-[11px]">
              เอกสารวิเคราะห์จุดแข็งและพัฒนาการเฉพาะบุคคล สำหรับนำกลับไปรายงานผู้ปกครอง
            </span>
            <button
              type="button"
              onClick={() => setIsParentReportOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs bg-white text-indigo-950 hover:bg-indigo-50 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            >
              <UserCheck size={14} className="text-indigo-600" />
              <span>พิมพ์ใบรายงานผู้ปกครอง (Parent Report)</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm relative overflow-hidden space-y-6">
          {/* Top Header & Triangulation Meter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-50 to-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
                ⏳
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5">
                    <Sparkles size={13} className="text-indigo-600" />
                    <span>My Learning Superpower • สไตล์การเรียนรู้เฉพาะบุคคล</span>
                  </span>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    รอร่องรอยชิ้นงานจริง ({triangulationCount}/3 เส้าหลักฐาน)
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 pt-0.5">
                  กลไกการค้นพบศักยภาพด้วยการสอบทาน 3 เส้า (Triangulation of Evidence)
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                  ระบบ LearnWise จะไม่สร้างข้อมูลจำลองขึ้นมาเอง แต่จะ Calibrate พฤติกรรมจริงจาก 3 ภารกิจแรกของภาคเรียน 
                  เพื่อให้ได้หลักฐานสามเส้าที่สมบูรณ์ สะท้อนจุดแข็งและความถนัดเฉพาะตัวของคุณอย่างแม่นยำและยุติธรรม
                </p>
              </div>
            </div>

            {/* Triangulation Confidence Meter */}
            <div className="shrink-0 bg-slate-50 rounded-2xl p-3 border border-slate-200 text-center min-w-[150px]">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">TRIANGULATION CALIBRATION</div>
              <div className="text-xl font-black text-indigo-700 mt-0.5">{triangulationPct}%</div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-medium">สำเร็จ {triangulationCount} ใน 3 เส้า</div>
            </div>
          </div>

          {/* 3 Pillars Grid */}
          <div>
            <div className="text-xs font-bold text-slate-700 mb-3 flex flex-wrap items-center justify-between gap-2">
              <span>3 เส้าของหลักฐานที่ใช้ในการ Calibrate สไตล์การเรียนรู้:</span>
              <span className="text-[11px] text-slate-400 font-normal">เลือกเริ่มทำภารกิจใดก่อนก็ได้ตามความถนัด (UDL Principle)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Pillar 1: Quiz */}
              <div className={`p-4 rounded-2xl border transition-all ${
                hasQuizDone 
                  ? "bg-emerald-50/50 border-emerald-200 shadow-2xs" 
                  : "bg-gradient-to-br from-slate-50 to-purple-50/30 border-purple-200/70 hover:border-purple-300"
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-base font-bold shrink-0">
                    🎯
                  </div>
                  {hasQuizDone ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                      <Check size={12} /> ส่งแล้ว
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-full border border-purple-200">
                      เส้าที่ 1 (Quiz)
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-xs text-slate-900 mt-2.5">
                  1. แบบทดสอบตรรกะไว (Quiz 10 ข้อ)
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  แบบทดสอบตรรกะและการวนลูป Python 10 ข้อ วัดความเร็วการตอบสนอง (Fast Explorer) และการจำแนกคำตอบ
                </p>
                {quizMission && (
                  <button
                    type="button"
                    onClick={() => onOpenMission(quizMission.id)}
                    className="mt-3 w-full py-1.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>{hasQuizDone ? "ดูผล / ทำซ้ำ" : "เริ่มทำแบบทดสอบ (10 ข้อ)"}</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>

              {/* Pillar 2: Short Answer */}
              <div className={`p-4 rounded-2xl border transition-all ${
                hasSaDone 
                  ? "bg-emerald-50/50 border-emerald-200 shadow-2xs" 
                  : "bg-gradient-to-br from-slate-50 to-blue-50/30 border-blue-200/70 hover:border-blue-300"
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-base font-bold shrink-0">
                    ✍️
                  </div>
                  {hasSaDone ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                      <Check size={12} /> ส่งแล้ว
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full border border-blue-200">
                      เส้าที่ 2 (Concept)
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-xs text-slate-900 mt-2.5">
                  2. อธิบายมโนทัศน์ (Short-Answer)
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  วิเคราะห์ขอบเขต range() และแจกแจงผลลัพธ์ 3 ประเด็น วัดความเข้าใจเชิงลึก (Conceptual Explainer)
                </p>
                {saMission && (
                  <button
                    type="button"
                    onClick={() => onOpenMission(saMission.id)}
                    className="mt-3 w-full py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>{hasSaDone ? "ดูชิ้นงานที่ส่ง" : "เริ่มเขียนอธิบาย"}</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>

              {/* Pillar 3: Coding */}
              <div className={`p-4 rounded-2xl border transition-all ${
                hasCodeDone 
                  ? "bg-emerald-50/50 border-emerald-200 shadow-2xs" 
                  : "bg-gradient-to-br from-slate-50 to-indigo-50/30 border-indigo-200/70 hover:border-indigo-300"
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-base font-bold shrink-0">
                    💻
                  </div>
                  {hasCodeDone ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                      <Check size={12} /> ส่งแล้ว
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full border border-indigo-200">
                      เส้าที่ 3 (Coding)
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-xs text-slate-900 mt-2.5">
                  3. เขียนโค้ดปฏิบัติจริง (Coding)
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  เขียนฟังก์ชัน sum_to_n(n) และรันชุดทดสอบ 4 กรณี วัดทักษะปฏิบัติจริง (Hands-on Coder)
                </p>
                {codeMission && (
                  <button
                    type="button"
                    onClick={() => onOpenMission(codeMission.id)}
                    className="mt-3 w-full py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>{hasCodeDone ? "ดูชิ้นงานที่ส่ง" : "เริ่มเขียนโค้ด"}</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Guide on How AI Calibrates */}
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <Sparkles size={14} className="text-amber-500" />
              <span>เคล็ดลับสำหรับนักเรียนใหม่: AI สังเกตพฤติกรรมอะไรบ้างเพื่อค้นหา Superpower?</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-slate-600 text-[11px]">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800">1. ความเร็วและสไตล์ที่เริ่มก่อน</span>
                <p>AI ดูว่าคุณเลือกเริ่มทำภารกิจแบบไหนก่อน และตอบสนองต่อคำถามได้รวดเร็วเพียงใด</p>
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800">2. การกด Pulse สะท้อนความรู้สึก</span>
                <p>หลังส่งงาน กด 1 คลิกบอกความรู้สึก (เช่น "สนุกและถนัดมาก") เพื่อเพิ่มน้ำหนักให้รูปแบบนั้น</p>
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800">3. ความมุ่งมั่นพัฒนา (Grit)</span>
                <p>หากครูส่งคำแนะนำกลับมา ให้ลองปรับแก้งานรอบ 2 AI จะปลดล็อกดัชนี High Grit ทันที</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Learning Compass - Simulated Rules Insight Banner */}
      {insight && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-50/90 via-pink-50/70 to-indigo-50/80 border border-purple-200/70 p-5 sm:p-6 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-purple-200">
              <Compass size={22} className="animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-purple-700 bg-purple-100/80 px-2.5 py-0.5 rounded-full border border-purple-200">
                  Learning Compass
                </span>
                <span className="text-xs text-slate-500">คำแนะนำจากระบบ</span>
              </div>
              <h3 className="font-bold text-slate-850 text-base mt-2">
                {insight.title}
              </h3>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                {insight.message}
              </p>
              <div className="mt-4">
                <button 
                  onClick={() => onOpenMission(insight.missionId)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-xs hover:shadow-md cursor-pointer"
                >
                  <span>{insight.actionText}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Missions Section */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-purple-600" />
            <h2 className="text-lg font-bold text-slate-850">ภารกิจที่ได้รับมอบหมายจากครูเมย์</h2>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            👩‍🏫 ครูผู้สอน: ครูเมย์ ชลธิชา (พร้อมทำส่งตรวจได้ทันที)
          </span>
        </div>

        <div className="grid gap-4">
          {myMissions.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-12 text-center border border-purple-100 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-400 mx-auto flex items-center justify-center mb-3">
                <BookOpen size={24} />
              </div>
              <p className="text-slate-600 font-medium">ไม่มีภารกิจที่ได้รับมอบหมายในขณะนี้</p>
            </div>
          ) : (
            myMissions.map((mission) => {
              const status = getWorkStatus(role.id, mission.id);
              const attempts = envelope.attempts.filter(a => a.studentId === role.id && a.missionId === mission.id);

              return (
                <div 
                  key={mission.id} 
                  className="bg-white/90 backdrop-blur-md rounded-3xl border border-purple-100/70 hover:border-purple-300 p-5 sm:p-6 transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 group flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                        mission.type === "short-answer" 
                          ? "bg-pink-50 text-pink-700 border-pink-200/80" 
                          : mission.type === "coding"
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200/80"
                          : "bg-purple-50 text-purple-700 border-purple-200/80"
                      }`}>
                        {mission.type === "short-answer" ? "คำตอบสั้น (Short Answer)" : mission.type === "coding" ? "เขียนโค้ด (Coding)" : "แบบทดสอบ (Quiz)"}
                      </span>
                      <span className="text-xs font-medium text-slate-500">• {mission.topic}</span>
                      <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                        👩‍🏫 ครูเมย์
                      </span>
                      {attempts.length > 0 && (
                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          ส่งไปแล้ว {attempts.length} รอบ
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                      {mission.title}
                    </h3>
                    
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {mission.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Calendar size={13} className="text-slate-400" />
                        <span>กำหนดส่ง: {mission.dueDate}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600">
                        <Hourglass size={13} className="text-slate-400" />
                        <span>เวลาโดยประมาณ: {mission.estimatedMinutes} นาที</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-row md:flex-col items-stretch sm:items-center md:items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <StatusBadge status={status} />

                    <div className="flex items-center gap-2">
                      {attempts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setSelectedComparisonMission(mission)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all cursor-pointer"
                          title="เปรียบเทียบคำตอบรอบแรกกับรอบสอง"
                        >
                          <Sparkles size={13} />
                          <span>Before/After</span>
                        </button>
                      )}

                      <button 
                        onClick={() => onOpenMission(mission.id)}
                        className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer w-full md:w-auto focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95 ${
                          status === "changes-requested"
                            ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20 focus-visible:ring-rose-500"
                            : status === "not-started"
                            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 focus-visible:ring-blue-500"
                            : "bg-slate-900 hover:bg-slate-800 text-white focus-visible:ring-slate-700"
                        }`}
                      >
                        <span>
                          {status === "not-started" ? "เริ่มทำส่งครูเมย์" : status === "changes-requested" ? "ดู Feedback & แก้งาน" : "เปิดดูรายละเอียด"}
                        </span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 🌟 แฟ้มสะสมหลักฐานการเรียนรู้ของฉัน (My Evidence & Learning Journey Summary) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileCheck size={18} className="text-indigo-600" />
            <h3 className="font-bold text-base text-slate-900">สรุปบันทึกการเรียนรู้ของฉัน (My Learning Records)</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">บันทึกพัฒนาการรอบต่อรอบ</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">ภารกิจ</th>
                <th className="p-3">ประเภท</th>
                <th className="p-3 text-center">จำนวนรอบส่ง</th>
                <th className="p-3 text-center">สถานะ</th>
                <th className="p-3 text-center">การรับรองมาตรฐานตัวชี้วัด</th>
                <th className="p-3 text-right">หลักฐานพัฒนาการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myMissions.map(m => {
                const st = getWorkStatus(role.id, m.id);
                const atts = envelope.attempts.filter(a => a.studentId === role.id && a.missionId === m.id);
                const quiz = envelope.quizHistory.find(q => q.studentId === role.id && q.missionId === m.id);
                const isMastered = st === "reviewed" || (m.type === "quiz" && Boolean(quiz?.passed));

                return (
                  <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3 font-semibold text-slate-900">{m.title}</td>
                    <td className="p-3 text-slate-500">
                      {m.type === "short-answer" ? "คำตอบสั้น" : m.type === "coding" ? "เขียนโค้ด" : "แบบทดสอบ"}
                    </td>
                    <td className="p-3 text-center">
                      <span className="font-bold text-slate-700">{atts.length > 0 ? `${atts.length} รอบ` : m.type === "quiz" && quiz ? "1 ครั้ง" : "—"}</span>
                    </td>
                    <td className="p-3 text-center">
                      <StatusBadge status={st} />
                    </td>
                    <td className="p-3 text-center">
                      {isMastered ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                          <CheckCircle2 size={12} className="text-emerald-600" />
                          <span>ผ่านตัวชี้วัด ว 4.2</span>
                        </span>
                      ) : st === "changes-requested" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                          <AlertCircle size={12} className="text-rose-600" />
                          <span>ปรับปรุงตาม ว 4.2</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          <Clock size={12} className="text-slate-500" />
                          <span>สะสมหลักฐาน ว 4.2</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {atts.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => setSelectedComparisonMission(m)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
                        >
                          <Sparkles size={12} />
                          <span>ดูพัฒนาการก่อน-หลัง</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">
                          {st === "reviewed" ? "ผ่านเกณฑ์แล้ว" : "ยังไม่มีการส่งรอบแก้"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Before & After Modal */}
      {selectedComparisonMission && comparisonAttempts.length > 1 && (
        <BeforeAfterModal
          isOpen={true}
          onClose={() => setSelectedComparisonMission(null)}
          studentName={currentStudent?.name || "นักเรียน"}
          mission={selectedComparisonMission}
          attempt1={comparisonAttempts[0]}
          attempt2={comparisonAttempts[comparisonAttempts.length - 1]}
          review1={envelope.reviews.find(
            r => r.attemptId === comparisonAttempts[0].id && r.publicationStatus === "published"
          )}
          review2={envelope.reviews.find(
            r => r.attemptId === comparisonAttempts[comparisonAttempts.length - 1].id && r.publicationStatus === "published"
          )}
        />
      )}

      {/* Parent One-Page Growth Report Modal */}
      {isParentReportOpen && currentStudent && (
        <ParentReportModal
          isOpen={true}
          onClose={() => setIsParentReportOpen(false)}
          student={currentStudent}
        />
      )}
    </div>
  );
};
