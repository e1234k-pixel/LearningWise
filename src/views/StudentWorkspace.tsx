import { useState, useEffect } from "react";
import { useApp } from "../context/AppDataContext";
import { 
  ArrowLeft, 
  Save, 
  Send, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  ListChecks, 
  History, 
  MessageSquare, 
  Sparkles,
  ChevronRight,
  PenLine,
  MessageSquareText,
  RefreshCw,
  Trophy,
  Check,
  Bot
} from "lucide-react";
import { BeforeAfterModal } from "../components/BeforeAfterModal";

export const StudentWorkspace = ({ missionId, onBack }: { missionId: string, onBack: () => void }) => {
  const { role, envelope, saveDraft, submitAttempt, getWorkStatus, recordPulseRating, openAiDrawer } = useApp();
  const [content, setContent] = useState("");
  const [revisionNote, setRevisionNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showRubric, setShowRubric] = useState(false);
  const [isBeforeAfterOpen, setIsBeforeAfterOpen] = useState(false);

  const studentId = role.type === "student" ? role.id : "";
  const mission = envelope.missions.find(m => m.id === missionId);
  const currentStudent = envelope.students.find(s => s.id === studentId);
  const status = studentId ? getWorkStatus(studentId, missionId) : "not-started";
  const draft = envelope.drafts.find(d => d.studentId === studentId && d.missionId === missionId);
  const attempts = envelope.attempts.filter(a => a.studentId === studentId && a.missionId === missionId);
  const latestAttempt = attempts[attempts.length - 1];

  const handleSaveDraft = (isAuto = false) => {
    if (!content.trim() || !studentId) return;
    if (!isAuto) setIsSaving(true);
    saveDraft({
      studentId,
      missionId,
      basedOnAttemptId: latestAttempt ? latestAttempt.id : null,
      content,
      language: null,
      revisionNote,
      updatedAt: new Date().toISOString()
    });
    if (!isAuto) {
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  useEffect(() => {
    if (status === "not-started" || status === "started") {
      if (draft?.content) {
        setContent(draft.content);
      } else if (mission?.type === "coding" && mission.config.starterCode) {
        setContent(mission.config.starterCode);
      } else {
        setContent("");
      }
      setRevisionNote(draft?.revisionNote || "");
    } else if (status === "changes-requested") {
      setContent(draft?.content ?? latestAttempt?.content ?? "");
      setRevisionNote(draft?.revisionNote || "");
    }
  }, [missionId, studentId, status]);

  // Auto-save
  useEffect(() => {
    if (status === "submitted" || status === "reviewed") return;
    if (!content.trim()) return;
    
    const timer = setTimeout(() => {
      handleSaveDraft(true);
    }, 800);
    return () => clearTimeout(timer);
  }, [content, revisionNote]);

  if (role.type !== "student") return null;

  const handleSubmit = () => {
    if (!content.trim()) {
       alert("กรุณากรอกคำตอบก่อนส่ง");
       return;
    }
    if (mission?.config.minLength && content.trim().length < mission.config.minLength) {
       alert(`คำตอบต้องมีความยาวอย่างน้อย ${mission.config.minLength} ตัวอักษร`);
       return;
    }

    if (window.confirm("ยืนยันที่จะส่งคำตอบรอบนี้ใช่หรือไม่?")) {
      submitAttempt({
        studentId: role.id,
        missionId,
        basedOnAttemptId: latestAttempt ? latestAttempt.id : null,
        content,
        language: null,
        revisionNote,
        updatedAt: new Date().toISOString()
      });
    }
  };

  if (!mission) return <div className="p-8 text-center text-slate-500">ไม่พบภารกิจนี้</div>;

  const isReadOnly = status === "submitted" || status === "reviewed";

  // Calculate Success Ladder Steps (บันไดความสำเร็จ 4 ก้าว)
  const isStep1Done = attempts.length >= 1;
  const isStep1Active = status === "not-started" || status === "started";

  const hasAnyReview = envelope.reviews.some(r => attempts.some(a => a.id === r.attemptId && r.publicationStatus === "published"));
  const isStep2Waiting = status === "submitted" && attempts.length === 1;
  const isStep2Done = hasAnyReview || status === "changes-requested" || status === "reviewed" || attempts.length > 1;

  const isStep3Active = status === "changes-requested";
  const isStep3Waiting = status === "submitted" && attempts.length > 1;
  const isStep3Done = (attempts.length >= 2 && !isStep3Active) || status === "reviewed";

  const isStep4Done = status === "reviewed";

  // Overall Percentage
  let progressPercent = 15;
  if (isStep1Done) progressPercent = 35;
  if (isStep2Done) progressPercent = 60;
  if (attempts.length >= 2) progressPercent = 85;
  if (isStep4Done) progressPercent = 100;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Breadcrumb & Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button 
          onClick={onBack} 
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white/90 hover:bg-white px-3.5 py-2 rounded-2xl border border-purple-100/70 hover:-translate-y-0.5 active:scale-95 transition-all shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none"
        >
          <ArrowLeft size={14} />
          <span>กลับแดชบอร์ด</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>แดชบอร์ด</span>
          <ChevronRight size={12} />
          <span className="font-semibold text-slate-900 truncate max-w-xs">{mission.title}</span>
        </div>
      </div>

      {/* Mission Title Header Card */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-purple-100/70 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200/70">
              {mission.type === "short-answer" ? "คำตอบสั้น" : mission.type}
            </span>
            <span className="text-xs font-medium text-slate-500">• {mission.topic}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => openAiDrawer("ช่วยอธิบายโจทย์และแนวทางการคิดแบบฝึกหัดนี้แบบ Socratic ให้หน่อยครับ")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50/90 hover:bg-purple-100/90 px-3 py-1.5 rounded-xl border border-purple-200/80 hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer shadow-xs"
              title="เปิดผู้ช่วย AI Tutor ประจำวิชา"
            >
              <Bot size={14} className="text-purple-600 animate-pulse" />
              <span>💡 ขอคำปรึกษา AI Tutor</span>
            </button>

            <button
              onClick={() => setShowRubric(!showRubric)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50/80 hover:bg-indigo-100/90 px-3 py-1.5 rounded-xl border border-indigo-200/60 hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none"
            >
              <ListChecks size={14} />
              <span>{showRubric ? "ซ่อนเกณฑ์ประเมิน (Rubric)" : "ดูเกณฑ์ประเมิน (Rubric)"}</span>
            </button>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {mission.title}
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          {mission.description}
        </p>

        {/* Rubric Accordion */}
        {showRubric && mission.config.rubric && (
          <div className="mt-5 p-5 bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-slate-50/60 border border-purple-100 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-indigo-950 font-bold text-sm">
              <ListChecks size={16} className="text-indigo-600" />
              <span>เกณฑ์การประเมิน (Rubric รวม 6 คะแนน • ผ่านเมื่อได้ 5/6 และเกณฑ์ A ได้เต็ม 2/2)</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {mission.config.rubric.criteria.map((c) => (
                <div key={c.id} className="bg-white/95 p-3.5 rounded-2xl border border-purple-100/70 text-xs shadow-2xs space-y-2">
                  <div className="font-bold text-slate-800 flex justify-between items-center">
                    <span>{c.label}</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">เต็ม {c.maxPoints} คะแนน</span>
                  </div>
                  <div className="space-y-1.5 text-slate-600">
                    <div><b className="text-slate-800">2 คะแนน:</b> {c.levels["2"]}</div>
                    <div><b className="text-slate-800">1 คะแนน:</b> {c.levels["1"]}</div>
                    <div><b className="text-slate-800">0 คะแนน:</b> {c.levels["0"]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 🚀 บันไดความสำเร็จ (Success Ladder Timeline) */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-purple-100/70 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-50 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
              <Trophy size={18} />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span>บันไดความสำเร็จ: วงจรการเรียนรู้สู่ความเข้าใจจริง</span>
                <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200/80">
                  Step {isStep4Done ? "4/4" : isStep3Active || isStep3Waiting ? "3/4" : isStep2Waiting ? "2/4" : "1/4"}
                </span>
              </h2>
              <p className="text-[11px] text-slate-500">
                เส้นทางส่งงานและปรับปรุงตาม Feedback จนบรรลุเกณฑ์ประเมิน
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs font-medium text-slate-500">ความก้าวหน้า:</span>
            <span className="text-xs font-bold text-purple-900 bg-purple-50/80 border border-purple-100 px-2.5 py-0.5 rounded-full">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Global Progress Bar Line */}
        <div className="w-full bg-purple-50 h-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 transition-all duration-700 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        {/* 4 Interactive Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Step 1: ร่าง & ส่งรอบแรก */}
          <div className={`p-4 rounded-2xl border transition-all duration-200 relative ${
            isStep1Done
              ? "bg-emerald-50/70 border-emerald-200/80 text-emerald-950"
              : isStep1Active
              ? "bg-indigo-50/80 border-indigo-200 ring-2 ring-indigo-400/20 shadow-xs text-indigo-950"
              : "bg-slate-50/70 border-slate-200/70 text-slate-600"
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                isStep1Done ? "bg-emerald-500 text-white" : isStep1Active ? "bg-indigo-500 text-white animate-pulse" : "bg-slate-200 text-slate-600"
              }`}>
                {isStep1Done ? <Check size={14} /> : <PenLine size={14} />}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isStep1Done ? "bg-emerald-100 text-emerald-800" : "bg-indigo-100 text-indigo-800"
              }`}>
                {isStep1Done ? "ส่งรอบแรกแล้ว" : "ขั้นตอนปัจจุบัน"}
              </span>
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-900">1. ร่าง & ส่งรอบแรก</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              อ่านโจทย์ วิเคราะห์ลูป และส่งคำตอบชุดแรกเพื่อประเมินความเข้าใจ
            </p>
          </div>

          {/* Step 2: คำแนะนำจากครู */}
          <div className={`p-4 rounded-2xl border transition-all duration-200 relative ${
            isStep2Done
              ? "bg-emerald-50/70 border-emerald-200/80 text-emerald-950"
              : isStep2Waiting
              ? "bg-amber-50/80 border-amber-200 ring-2 ring-amber-400/20 shadow-xs text-amber-950"
              : "bg-slate-50/70 border-slate-200/70 text-slate-500 opacity-80"
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                isStep2Done ? "bg-emerald-500 text-white" : isStep2Waiting ? "bg-amber-500 text-white animate-spin-slow" : "bg-slate-200 text-slate-600"
              }`}>
                {isStep2Done ? <Check size={14} /> : <MessageSquareText size={14} />}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isStep2Done 
                  ? "bg-emerald-100 text-emerald-800" 
                  : isStep2Waiting 
                  ? "bg-amber-100 text-amber-800 animate-pulse" 
                  : "bg-slate-200 text-slate-600"
              }`}>
                {isStep2Done ? "ได้รับ Feedback" : isStep2Waiting ? "รอครูตรวจ" : "รอขั้นตอนก่อน"}
              </span>
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-900">2. คำแนะนำจากครู</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              ครูตรวจคำตอบและส่งคำแนะนำเจาะจงจุดที่ยังคลาดเคลื่อน
            </p>
          </div>

          {/* Step 3: ปรับปรุงคำตอบ */}
          <div className={`p-4 rounded-2xl border transition-all duration-200 relative ${
            isStep3Done
              ? "bg-emerald-50/70 border-emerald-200/80 text-emerald-950"
              : isStep3Active
              ? "bg-rose-50/80 border-rose-200 ring-2 ring-rose-400/20 shadow-xs text-rose-950 animate-bounce-short"
              : isStep3Waiting
              ? "bg-amber-50/80 border-amber-200 text-amber-950"
              : "bg-slate-50/70 border-slate-200/70 text-slate-500 opacity-80"
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                isStep3Done 
                  ? "bg-emerald-500 text-white" 
                  : isStep3Active 
                  ? "bg-rose-500 text-white animate-pulse" 
                  : isStep3Waiting
                  ? "bg-amber-500 text-white"
                  : "bg-slate-200 text-slate-600"
              }`}>
                {isStep3Done ? <Check size={14} /> : <RefreshCw size={14} />}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isStep3Done 
                  ? "bg-emerald-100 text-emerald-800" 
                  : isStep3Active 
                  ? "bg-rose-100 text-rose-800 font-black" 
                  : isStep3Waiting 
                  ? "bg-amber-100 text-amber-800" 
                  : "bg-slate-200 text-slate-600"
              }`}>
                {isStep3Done ? "ส่งฉบับแก้ไขแล้ว" : isStep3Active ? "ต้องปรับปรุงงาน!" : isStep3Waiting ? "รอตรวจรอบ 2" : "รอขั้นตอนก่อน"}
              </span>
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-900">3. ปรับปรุงรอบใหม่</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              นำ Feedback มาปรับคำตอบพร้อมกรอก "ครั้งนี้ปรับอะไร"
            </p>
          </div>

          {/* Step 4: ผ่านเกณฑ์เข้าใจจริง */}
          <div className={`p-4 rounded-2xl border transition-all duration-200 relative ${
            isStep4Done
              ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 ring-2 ring-emerald-400/30 text-emerald-950 shadow-xs"
              : "bg-slate-50/70 border-slate-200/70 text-slate-500 opacity-80"
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                isStep4Done ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20 animate-bounce-short" : "bg-slate-200 text-slate-600"
              }`}>
                <Trophy size={14} />
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isStep4Done ? "bg-emerald-100 text-emerald-800 font-black" : "bg-slate-200 text-slate-600"
              }`}>
                {isStep4Done ? "ผ่านเกณฑ์ 6/6 🎉" : "เป้าหมาย"}
              </span>
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-900">4. ผ่านเกณฑ์เข้าใจจริง</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              ครูปิดการตรวจ บันทึกคะแนน และแสดงหลักฐานก่อน-หลัง
            </p>
          </div>
        </div>

        {/* Celebration Banner when finalized */}
        {isStep4Done && (
          <div className="bg-gradient-to-r from-emerald-50/80 via-teal-50/60 to-purple-50/60 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 animate-fadeIn">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20 text-lg">
              🏆
            </div>
            <div>
              <div className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                <Sparkles size={14} className="text-emerald-600" />
                <span>สำเร็จวงจรการเรียนรู้แล้ว!</span>
              </div>
              <p className="text-xs text-emerald-800 mt-0.5">
                คุณได้ส่งงาน ได้รับ Feedback และแก้ไขจนเข้าใจความหมายของ range ครบถ้วน สามารถดูประวัติการเปรียบเทียบคำตอบได้ด้านล่าง
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions Card */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-purple-100/70 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <BookOpen size={16} className="text-indigo-600" />
            <span>โจทย์และคำชี้แจง</span>
          </div>
          {mission.type === "coding" && (
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80">
              ครูตรวจด้วยตนเอง • ระบบไม่รันโค้ด
            </span>
          )}
        </div>
        <div className="bg-slate-900/95 text-indigo-50 p-4 sm:p-5 rounded-2xl text-xs sm:text-sm font-mono leading-relaxed whitespace-pre-wrap shadow-inner border border-slate-800/80">
          {mission.instructions}
        </div>

        {/* Input Constraints & Test Case Examples for Coding */}
        {mission.type === "coding" && mission.config.examples && (
          <div className="pt-2 space-y-2">
            <div className="font-bold text-xs text-slate-700">ตัวอย่างการทำงาน (Examples) และเงื่อนไข:</div>
            {mission.config.inputConstraints && (
              <p className="text-xs text-slate-500 italic">เงื่อนไข: {mission.config.inputConstraints}</p>
            )}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">คำสั่งเรียกใช้</th>
                    <th className="p-2.5">ผลลัพธ์ที่ถูกต้อง</th>
                    <th className="p-2.5">คำอธิบาย</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {mission.config.examples.map((ex, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="p-2.5 text-blue-700 font-bold">{ex.input}</td>
                      <td className="p-2.5 text-emerald-700 font-bold">{ex.output}</td>
                      <td className="p-2.5 text-slate-500 font-sans">{ex.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* History of Previous Attempts */}
      {attempts.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <History size={16} className="text-indigo-600" />
              <span>ประวัติคำตอบและ Feedback ที่ผ่านมา ({attempts.length} รอบ)</span>
            </div>

            {attempts.length > 1 && (
              <button
                type="button"
                onClick={() => setIsBeforeAfterOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-2xl text-xs font-bold shadow-xs hover:shadow transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-400"
              >
                <Sparkles size={14} />
                <span>เปรียบเทียบก่อน–หลัง (Before & After)</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            {attempts.map((attempt) => {
              const attemptReviews = envelope.reviews.filter(r => r.attemptId === attempt.id && r.publicationStatus === "published");
              const rev = attemptReviews[attemptReviews.length - 1];

              return (
                <div key={attempt.id} className="bg-white/90 backdrop-blur-md rounded-3xl border border-purple-100/70 overflow-hidden shadow-xs">
                  {/* Round Header */}
                  <div className="bg-purple-50/40 px-5 py-3 border-b border-purple-100/60 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-800">รอบการส่งที่ {attempt.attemptNo}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500">{new Date(attempt.submittedAt).toLocaleString('th-TH')}</span>
                    </div>

                    {rev && (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        rev.decision === "finalize"
                          ? rev.outcome === "meets-criteria" 
                            ? "bg-emerald-100 text-emerald-800" 
                            : "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}>
                        {rev.decision === "finalize" ? "ตรวจจบแล้ว" : "ส่งกลับให้แก้ไข"}
                      </span>
                    )}
                  </div>

                  <div className="p-5 space-y-4">
                    <div>
                      <div className="text-xs font-semibold text-slate-500 mb-1">คำตอบที่คุณส่ง:</div>
                      <div className="p-4 bg-slate-50/80 rounded-2xl text-slate-800 text-sm whitespace-pre-wrap border border-slate-200/60 font-sans">
                        {attempt.content}
                      </div>
                    </div>

                    {attempt.revisionNote && (
                      <div className="p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-100/80 text-xs text-slate-700">
                        <span className="font-bold text-indigo-900 block mb-1">💡 บันทึกสิ่งที่ปรับแก้:</span>
                        {attempt.revisionNote}
                      </div>
                    )}

                    {rev && (
                      <div className={`p-4 rounded-2xl border ${
                        rev.decision === "finalize"
                          ? "bg-emerald-50/70 border-emerald-200/80" 
                          : "bg-amber-50/70 border-amber-200/80"
                      }`}>
                        <div className="flex items-center gap-2 font-bold text-xs mb-2">
                          <MessageSquare size={14} className={rev.decision === "finalize" ? "text-emerald-700" : "text-amber-700"} />
                          <span className={rev.decision === "finalize" ? "text-emerald-900" : "text-amber-900"}>
                            Feedback จากครูเมย์:
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                          {rev.feedback}
                        </p>

                        {rev.decision === "finalize" && rev.percentScore !== null && (
                          <div className="mt-3 pt-3 border-t border-emerald-200/60 flex items-center justify-between text-xs font-bold">
                            <span className="text-emerald-800">
                              คะแนนทางการ: {rev.rawScore}/{rev.maxRawScore} ({rev.percentScore}%)
                            </span>
                            <span className={`px-2.5 py-1 rounded-full ${
                              rev.outcome === "meets-criteria" ? "bg-emerald-200 text-emerald-900" : "bg-amber-200 text-amber-900"
                            }`}>
                              {rev.outcome === "meets-criteria" ? "ผ่านเกณฑ์งานนี้" : "ควรทบทวน"}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Mission Pulse Interactive Rating */}
                    <div className="pt-3 border-t border-purple-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span>💖</span>
                        <span className="font-semibold text-slate-700">สะท้อนความรู้สึกต่องานนี้ (Mission Pulse):</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        {[
                          { label: "⚡ สนุกและถนัดมาก (My Favorite)", short: "⚡ สนุกและถนัด" },
                          { label: "💡 ท้าทายกำลังดี (Good Challenge)", short: "💡 ท้าทายกำลังดี" },
                          { label: "🧩 อยากได้คำใบ้เพิ่ม (Need More Guidance)", short: "🧩 อยากได้คำใบ้" },
                          { label: "🔄 อยากลองแบบอื่น (Prefer Other Types)", short: "🔄 อยากลองแบบอื่น" },
                        ].map(pulse => (
                          <button
                            key={pulse.label}
                            type="button"
                            onClick={() => recordPulseRating("attempt", attempt.id, pulse.label)}
                            className={`px-3 py-1.5 rounded-xl font-medium transition-all text-[11px] cursor-pointer ${
                              attempt.pulseRating === pulse.label
                                ? "bg-rose-500 text-white font-bold shadow-xs scale-105"
                                : "bg-purple-50/80 hover:bg-purple-100/80 text-slate-700 border border-purple-100"
                            }`}
                          >
                            {pulse.short}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Editor Area */}
      {!isReadOnly ? (
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-purple-100/70 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${mission.type === "coding" ? "bg-purple-500" : "bg-indigo-500"}`}></span>
              <h3 className="font-bold text-base text-slate-900">
                {status === "changes-requested" 
                  ? `แก้ไข${mission.type === "coding" ? "โค้ด" : "คำตอบ"}รอบที่ ${attempts.length + 1}` 
                  : mission.type === "coding" ? "เขียนโค้ดและคอมเมนต์ของคุณ" : "กรอกคำตอบของคุณ"}
              </h3>
            </div>

            <div className="text-xs font-medium text-slate-500">
              {content.length} {mission.config.maxLength ? `/ ${mission.config.maxLength}` : ""} ตัวอักษร
            </div>
          </div>

          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={mission.type === "coding" ? 14 : 8}
              spellCheck={false}
              className={`w-full p-4 text-xs sm:text-sm border rounded-2xl focus:outline-none transition-all duration-200 leading-relaxed shadow-2xs ${
                mission.type === "coding"
                  ? "bg-slate-950 text-emerald-300 font-mono border-slate-800 focus:ring-4 focus:ring-purple-400/20 focus:border-purple-400"
                  : "bg-slate-50/70 text-slate-800 font-sans border-purple-100/90 focus:bg-white focus:ring-4 focus:ring-purple-400/20 focus:border-purple-400 placeholder:text-slate-400"
              }`}
              placeholder={mission.type === "coding" ? "พิมพ์โค้ด Python และเขียนคอมเมนต์ไล่ค่าที่นี่..." : "พิมพ์คำตอบของคุณ โดยตอบให้ครบทั้ง 3 ข้อตามโจทย์..."}
            />
          </div>

          {status === "changes-requested" && (
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span>ครั้งนี้ปรับอะไร? (Reflection Note ไม่บังคับและไม่คิดคะแนน)</span>
              </label>
              <textarea
                value={revisionNote}
                onChange={(e) => setRevisionNote(e.target.value)}
                rows={2}
                className="w-full p-3 text-xs sm:text-sm bg-slate-50/70 border border-purple-100/90 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-400/20 focus:border-purple-400 transition-all duration-200 placeholder:text-slate-400"
                placeholder="อธิบายสั้นๆ ว่าในรอบนี้คุณปรับความเข้าใจหรือคำตอบตรงจุดไหน..."
              />
            </div>
          )}

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-purple-50">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {isSaving ? (
                <span className="flex items-center gap-1.5 text-amber-600 font-medium">
                  <Clock size={13} className="animate-spin" />
                  กำลังบันทึกร่าง...
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                  <CheckCircle2 size={13} />
                  บันทึกร่างอัตโนมัติแล้ว
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button 
                type="button"
                onClick={() => openAiDrawer(
                  mission.type === "coding"
                    ? "ช่วยดูโค้ด Python ที่ฉันเขียนตอนนี้ให้หน่อยครับ มีจุดไหนที่ยังไม่ตรงตามโจทย์หรือเงื่อนไข ช่วยให้คำใบ้ทีละระดับครับ"
                    : "ช่วยตรวจทานแนวคิดคำตอบของฉันตามเกณฑ์ Rubric 6 มิติ ให้หน่อยครับ มีส่วนไหนที่ควรปรับปรุงบ้างครับ"
                )}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-semibold text-purple-700 bg-purple-50/90 hover:bg-purple-100 border border-purple-200/80 hover:-translate-y-0.5 active:scale-95 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none transition-all duration-150 cursor-pointer shadow-xs"
                title="ขอคำแนะนำและตรวจทานร่างกับ AI Tutor"
              >
                <Bot size={15} className="text-purple-600" />
                <span>ปรึกษา AI Tutor</span>
              </button>

              <button 
                onClick={() => handleSaveDraft(false)}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-700 bg-slate-100/90 hover:bg-slate-200/90 hover:-translate-y-0.5 active:scale-95 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none transition-all duration-150 cursor-pointer shadow-xs border border-slate-200/70"
              >
                <Save size={14} />
                <span>บันทึกร่าง</span>
              </button>

              <button 
                onClick={handleSubmit}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/20 active:scale-95 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none transition-all duration-150 cursor-pointer shadow-xs"
              >
                <Send size={14} />
                <span>ส่งคำตอบ</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-md border border-purple-100/70 rounded-3xl p-6 text-center space-y-2 shadow-xs">
          <CheckCircle2 size={28} className="text-emerald-500 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">
            {status === "submitted" ? "คุณส่งคำตอบรอบนี้เรียบร้อยแล้ว" : "งานนี้ได้รับการตรวจปิดเรียบร้อยแล้ว"}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {status === "submitted" 
              ? "คำตอบอยู่ในคิวตรวจของครูเมย์ คุณสามารถเปิดอ่านคำตอบที่ส่งไปได้ และจะสามารถแก้ไขได้เมื่อครูส่งกลับมาให้แก้ไข"
              : "ครูได้ยืนยันคะแนนและผลการประเมินแล้ว สามารถดูคำตอบและคะแนนได้ในประวัติด้านบน"}
          </p>
        </div>
      )}

      {attempts.length > 1 && (
        <BeforeAfterModal
          isOpen={isBeforeAfterOpen}
          onClose={() => setIsBeforeAfterOpen(false)}
          mission={mission}
          studentName={currentStudent?.name || "นักเรียน"}
          attempt1={attempts[0]}
          attempt2={attempts[attempts.length - 1]}
          review1={envelope.reviews.find(r => r.attemptId === attempts[0].id && r.publicationStatus === "published")}
          review2={envelope.reviews.find(r => r.attemptId === attempts[attempts.length - 1].id && r.publicationStatus === "published")}
        />
      )}
    </div>
  );
};
