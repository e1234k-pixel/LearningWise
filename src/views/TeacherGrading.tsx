import { useState } from "react";
import { useApp } from "../context/AppDataContext";
import { 
  ArrowLeft, 
  CheckCircle2, 
  RefreshCw, 
  Clock, 
  AlertCircle, 
  User, 
  History, 
  ListChecks, 
  MessageSquare, 
  Sparkles, 
  Check,
  ListFilter,
  X
} from "lucide-react";
import { mockQuizQuestions } from "../data/mock";
import { BeforeAfterModal } from "../components/BeforeAfterModal";

export const TeacherGrading = ({ missionId, onBack }: { missionId: string, onBack: () => void }) => {
  const { role, envelope, requestChanges, finalizeReview, getWorkStatus } = useApp();
  
  const mission = envelope.missions.find(m => m.id === missionId);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [isBeforeAfterOpen, setIsBeforeAfterOpen] = useState(false);
  
  // Mobile tab state: 'queue' or 'grading'
  const [mobileTab, setMobileTab] = useState<"queue" | "grading">("grading");

  if (role.type !== "teacher" || !mission) return null;

  const isQuiz = mission.type === "quiz";
  const quizQuestions = mission.config.questions || mockQuizQuestions;

  // Queue: submitted students first, then others
  const pendingStudents = mission.targetStudentIds.filter(id => getWorkStatus(id, missionId) === "submitted");
  const reviewedStudents = mission.targetStudentIds.filter(id => {
    const s = getWorkStatus(id, missionId);
    return s === "reviewed" || s === "changes-requested";
  });
  const notSubmittedStudents = mission.targetStudentIds.filter(id => {
    const s = getWorkStatus(id, missionId);
    return s === "not-started" || s === "started";
  });

  const activeStudentId = selectedStudentId || (
    pendingStudents.length > 0 
      ? pendingStudents[0] 
      : reviewedStudents.length > 0 
      ? reviewedStudents[0] 
      : notSubmittedStudents.length > 0 
      ? notSubmittedStudents[0] 
      : null
  );
  const activeStudent = envelope.students.find(s => s.id === activeStudentId);
  
  const studentAttempts = envelope.attempts.filter(a => a.studentId === activeStudentId && a.missionId === missionId);
  const latestAttempt = studentAttempts[studentAttempts.length - 1];

  const studentQuizHistory = isQuiz && activeStudentId 
    ? envelope.quizHistory.filter(h => h.studentId === activeStudentId && h.missionId === missionId)
    : [];
  const latestQuiz = studentQuizHistory[studentQuizHistory.length - 1];
  
  const currentWorkStatus = activeStudentId ? getWorkStatus(activeStudentId, missionId) : "not-started";

  const handleScoreChange = (criterionId: string, value: number) => {
    setScores(prev => ({ ...prev, [criterionId]: value }));
  };

  const handleRequestChanges = () => {
    if (!latestAttempt) return;
    if (!feedback.trim()) {
      alert("กรุณากรอก Feedback แนะนำจุดที่ต้องปรับปรุงก่อนกดส่งกลับให้นักเรียน");
      return;
    }
    requestChanges(latestAttempt.id, feedback);
    setFeedback("");
    setScores({});
    setSelectedStudentId(null);
  };

  const handleFinalize = () => {
    if (!latestAttempt) return;
    if (!feedback.trim()) {
      alert("กรุณากรอก Feedback ปิดท้ายก่อนปิดการตรวจ");
      return;
    }
    const allScored = mission.config.rubric ? mission.config.rubric.criteria.every(c => scores[c.id] !== undefined) : true;
    if (!allScored) {
      alert("กรุณาให้คะแนนครบทั้ง 3 เกณฑ์ของ Rubric เพื่อปิดการตรวจอย่างเป็นทางการ");
      return;
    }
    finalizeReview(latestAttempt.id, feedback, scores);
    setFeedback("");
    setScores({});
    setSelectedStudentId(null);
  };

  // Calculate live score preview
  const rubric = mission.config.rubric;
  const currentTotalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const allCriteriaAnswered = rubric ? rubric.criteria.every(c => scores[c.id] !== undefined) : false;
  const criterionAPassed = scores["c1"] === 2;
  const meetsPassCriteria = rubric ? (currentTotalScore >= rubric.passRawPoints && criterionAPassed) : false;

  // Feedback helper templates from Demo guidelines
  const fillTemplateFeedback = (type: "round1" | "round2") => {
    if (mission.type === "coding") {
      if (type === "round1") {
        setFeedback("โครงสร้างการบวกสะสมของคุณถูกแล้ว แต่ลูปยังไม่บวกค่าตัวสุดท้าย ลองดู n = 3: range(1, 3) ให้ค่า 1, 2 ผลรวมได้ 3 ซึ่งยังไม่ถึง 6 ค่า stop ควรเป็นเท่าไรเพื่อรวม n ด้วย? แก้ขอบเขตให้ถูกต้องและปรับคอมเมนต์ไล่ค่าให้ตรงกัน");
      } else {
        setFeedback("คุณแก้ขอบเขตเป็น n + 1 เพื่อรวม n ได้ถูกต้องแล้ว และคอมเมนต์ไล่ค่าชัดเจนทั้งสองกรณี ใช้หลักคิดนี้กับการเขียนลูปสะสมค่าอื่นๆ ได้เลย");
        setScores({ c1: 2, c2: 2, c3: 2 });
      }
    } else {
      if (type === "round1") {
        setFeedback("คุณอ่านจุดเริ่มและการเพิ่มทีละ 1 ได้ถูกแล้ว จุดที่ต้องแก้คือ range ไม่รวมเลขที่อยู่ในตำแหน่ง stop ลองเขียนลำดับของ range(1, 5) ใหม่โดยหยุดก่อน 5 แล้วนับจำนวนสมาชิก หากอยากให้ 5 อยู่ในลำดับ ค่า stop ควรเป็นเท่าไร? แก้คำตอบทั้งสามส่วน พร้อมแสดงลำดับหลังแก้เพื่อให้ตรวจสอบได้");
      } else {
        setFeedback("คุณแก้ความเข้าใจเรื่อง stop ได้ถูกต้องแล้ว และใช้ลำดับตัวเลขตรวจจำนวนรอบได้ ต่อไปลองใช้หลักเดียวกันกับลูปที่ต้องบวกเลข 1 ถึงค่าที่กำหนด");
        setScores({ c1: 2, c2: 2, c3: 2 });
      }
    }
  };

  // AI Learning Copilot: Next-Step Adaptive Recommendation
  const getAiRecommendation = () => {
    const persona = activeStudent?.learnerProfile?.persona;
    
    if (persona === "Hands-on Coder") {
      return {
        tag: "💡 ต่อยอดสู่ความท้าทายขั้นสูง (Mastery Extension)",
        message: `${activeStudent?.name} มีความถนัดสูงในการลงมือเขียนโค้ดและทดลองโปรแกรมจริง (สาย Hands-on Coder)`,
        nextMissionAdvice: "ภารกิจถัดไปที่แนะนำ: 'Nested Loops ในตารางตัวเลข 2 มิติ' หรือมอบหมายบทบาท Peer Tutor ให้น้องช่วยแนะนำเพื่อนสาย Explorer เพื่อฝึกทักษะการสื่อสาร",
        suggestedFeedbackSnippet: "ยอดเยี่ยมมากในการเขียนโค้ด Loop! ก้าวถัดไปลองท้าทายด้วยการคิดลดจำนวนบรรทัด หรือลองอธิบายการทำงานให้เพื่อนฟังดูนะ"
      };
    } else if (persona === "Conceptual Explainer") {
      return {
        tag: "💡 เชื่อมโยงมโนทัศน์สู่การปฏิบัติ (Bridging to Code)",
        message: `${activeStudent?.name} มีทักษะการคิดวิเคราะห์และอธิบายลำดับ Before & After ได้ลึกซึ้ง (สาย Conceptual Explainer)`,
        nextMissionAdvice: "ภารกิจถัดไปที่แนะนำ: เริ่มจาก 'โจทย์เติมโค้ดบางส่วน (Fill-in-the-Blank Loop)' เพื่อลดความกังวลด้าน Syntax และเชื่อมตรรกะที่คิดไว้สู่โค้ดจริง",
        suggestedFeedbackSnippet: "คำอธิบายตรรกะ Before & After ชัดเจนมาก! ลองนำลำดับที่เขียนไว้นี้ไปพิมพ์ลงใน Python Editor ดูนะ ผลลัพธ์จะออกมาตามที่คิดไว้แน่นอน"
      };
    } else if (persona === "Fast Explorer") {
      return {
        tag: "💡 เสริมความรอบคอบและสังเกตผล (Grit & Deep Reflection)",
        message: `${activeStudent?.name} ทำงานรวดเร็ว ชอบทดลองแบบทดสอบไว (สาย Fast Explorer)`,
        nextMissionAdvice: "ภารกิจถัดไปที่แนะนำ: 'โจทย์หักมุม (Edge Case Challenge)' เช่น การตรวจจับ Infinite Loop เพื่อฝึกการคิดรอบคอบก่อนรัน",
        suggestedFeedbackSnippet: "ทำได้รวดเร็วมาก! ลองสังเกตกรณีพิเศษ เช่น เมื่อตัวเลขเป็น 0 หรือค่าลบ ดูสิว่าผลลัพธ์จะเป็นอย่างไร"
      };
    } else if (persona === "Resilient Improver") {
      return {
        tag: "💡 เสริมสร้าง Growth Mindset (Empower Resilience)",
        message: `${activeStudent?.name} มีความมุ่งมั่นสูงมากในการปรับแก้งานจากคำแนะนำ (สาย Resilient Improver)`,
        nextMissionAdvice: "ภารกิจถัดไปที่แนะนำ: ชื่นชมความก้าวหน้า Before & After อย่างเปิดเผย และมอบหมายโจทย์ที่มีตัวช่วยแบบ Scaffolding",
        suggestedFeedbackSnippet: "ครูประทับใจมากที่เห็นความตั้งใจในการแก้งานรอบนี้! การพัฒนาจากรอบแรกเห็นได้ชัดเจนมาก จงรักษาความพยายามนี้ไว้ต่อไปนะ"
      };
    } else {
      return {
        tag: "💡 พัฒนาสมรรถนะองค์รวม (Holistic Progression)",
        message: `${activeStudent?.name} มีสมดุลที่ดีระหว่างการคิดและการลงมือทำ`,
        nextMissionAdvice: "ภารกิจถัดไปที่แนะนำ: สามารถเลือกเส้นทางได้ตามความสนใจทั้งแบบ Coding หรือแบบทดสอบ",
        suggestedFeedbackSnippet: "ทำได้ดีมากในภารกิจนี้ ทั้งผลลัพธ์และตรรกะถูกต้องตามเกณฑ์มาตรฐานตัวชี้วัด ว 4.2"
      };
    }
  };

  const aiRec = getAiRecommendation();

  const selectStudentAndSwitchTab = (id: string) => {
    setSelectedStudentId(id);
    setMobileTab("grading");
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/90 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-purple-100/70 shadow-xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack} 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-purple-50/50 hover:-translate-y-0.5 active:scale-95 px-3.5 py-2 rounded-2xl border border-purple-100/70 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft size={14} />
            <span>กลับแดชบอร์ด</span>
          </button>
          <div className="h-5 w-px bg-purple-100 hidden sm:block"></div>
          <div>
            <h1 className="font-bold text-base text-slate-900 leading-tight">
              {isQuiz ? "รายงานผลแบบทดสอบ: " : "คิวตรวจงาน: "} {mission.title}
            </h1>
            <span className="text-xs text-slate-500">
              {isQuiz 
                ? `ทำแบบทดสอบแล้ว ${reviewedStudents.length} คน • ยังไม่ได้ทำ ${notSubmittedStudents.length} คน`
                : `รอตรวจ ${pendingStudents.length} คน • ตรวจจบแล้ว ${reviewedStudents.filter(id => getWorkStatus(id, missionId) === "reviewed").length} คน`
              }
            </span>
          </div>
        </div>

        {/* Demo Helper Pill / Auto-Graded Pill */}
        {isQuiz ? (
          <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-purple-50">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/80 flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-purple-600" />
              <span>ระบบตรวจอัตโนมัติ 100% (Auto-Graded)</span>
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-purple-50">
            <span className="text-xs text-slate-500 hidden md:inline">ข้อความตัวอย่างสำหรับ Demo:</span>
            <button
              onClick={() => fillTemplateFeedback("round1")}
              className="text-[11px] font-semibold text-amber-800 bg-amber-50/90 hover:bg-amber-100 hover:-translate-y-0.5 active:scale-95 border border-amber-200/80 px-3 py-1.5 rounded-xl transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
              title="ใส่ Feedback รอบที่ 1 ตามเอกสาร Demo"
            >
              ข้อความส่งกลับแก้ (รอบ 1)
            </button>
            <button
              onClick={() => fillTemplateFeedback("round2")}
              className="text-[11px] font-semibold text-emerald-800 bg-emerald-50/90 hover:bg-emerald-100 hover:-translate-y-0.5 active:scale-95 border border-emerald-200/80 px-3 py-1.5 rounded-xl transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
              title="ใส่ Feedback ปิดงานและคะแนน 6/6 ตามเอกสาร Demo"
            >
              ข้อความตรวจผ่าน (รอบ 2)
            </button>
          </div>
        )}
      </div>

      {/* Mobile / Tablet Tab Switcher (Visible on < lg) */}
      <div className="lg:hidden flex rounded-2xl bg-purple-50/70 border border-purple-100/60 p-1 text-xs font-semibold">
        <button
          onClick={() => setMobileTab("queue")}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer ${
            mobileTab === "queue" ? "bg-white text-purple-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <ListFilter size={14} />
          <span>เลือกนักเรียน ({envelope.students.length})</span>
          {pendingStudents.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          )}
        </button>
        <button
          onClick={() => setMobileTab("grading")}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer ${
            mobileTab === "grading" ? "bg-white text-purple-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <User size={14} />
          <span className="truncate max-w-[150px]">{activeStudent ? activeStudent.name : "หน้าตรวจงาน"}</span>
        </button>
      </div>

      {/* Main Grid: Queue on Left, Work on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Queue Panel (4 cols) - Mobile hidden if on grading tab */}
        <div className={`lg:col-span-4 bg-white/90 backdrop-blur-md rounded-3xl border border-purple-100/70 shadow-xs overflow-hidden ${
          mobileTab === "queue" ? "block" : "hidden lg:block"
        }`}>
          <div className="p-4 border-b border-purple-50 bg-purple-50/40 flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-wider text-purple-900">รายชื่อนักเรียนในห้อง</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100/80 text-purple-800">
              {envelope.students.length} คน
            </span>
          </div>

          <div className="divide-y divide-purple-50/60 max-h-[650px] overflow-y-auto">
            {/* 1. Pending Queue */}
            {pendingStudents.length > 0 && (
              <div className="p-2 bg-amber-50/40">
                <div className="text-[11px] font-bold text-amber-800 px-3 py-1 flex items-center gap-1.5">
                  <Clock size={12} className="animate-spin-slow text-amber-600" />
                  <span>รอตรวจ ({pendingStudents.length})</span>
                </div>
                {pendingStudents.map(id => {
                  const s = envelope.students.find(x => x.id === id);
                  const isSelected = activeStudentId === id;
                  const atts = envelope.attempts.filter(a => a.studentId === id && a.missionId === missionId);
                  return (
                    <button
                      key={id}
                      onClick={() => selectStudentAndSwitchTab(id)}
                      className={`w-full text-left p-3 rounded-2xl my-1 flex items-center justify-between transition-all duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                        isSelected 
                          ? "bg-amber-500 text-white shadow-sm font-semibold scale-[1.01]" 
                          : "hover:bg-amber-100/60 hover:-translate-y-0.5 text-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                          isSelected ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800"
                        }`}>
                          {s?.name.slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-xs font-bold">{s?.name}</div>
                          <div className={`text-[10px] ${isSelected ? "text-amber-100" : "text-slate-500"}`}>
                            ส่งรอบที่ {atts.length}
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isSelected ? "bg-white/20 text-white" : "bg-amber-200/80 text-amber-900"
                      }`}>
                        รอตรวจ
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 2. Reviewed or Changes Requested / Quiz Completed */}
            {reviewedStudents.length > 0 && (
              <div className="p-2">
                <div className="text-[11px] font-bold text-slate-500 px-3 py-1">
                  {isQuiz ? `ทำแบบทดสอบแล้ว (${reviewedStudents.length})` : `ส่งผลแล้ว / อยู่ระหว่างแก้ไข (${reviewedStudents.length})`}
                </div>
                {reviewedStudents.map(id => {
                  const s = envelope.students.find(x => x.id === id);
                  const st = getWorkStatus(id, missionId);
                  const isSelected = activeStudentId === id;
                  const qHistory = isQuiz ? envelope.quizHistory.filter(h => h.studentId === id && h.missionId === missionId) : [];
                  const lastQ = qHistory[qHistory.length - 1];

                  return (
                    <button
                      key={id}
                      onClick={() => selectStudentAndSwitchTab(id)}
                      className={`w-full text-left p-3 rounded-2xl my-1 flex items-center justify-between transition-all duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none ${
                        isSelected 
                          ? isQuiz ? "bg-purple-600 text-white shadow-sm font-semibold scale-[1.01]" : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm font-semibold scale-[1.01]" 
                          : "hover:bg-purple-50/50 hover:-translate-y-0.5 text-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                          isSelected ? "bg-white/20 text-white" : isQuiz ? "bg-purple-100 text-purple-800" : "bg-indigo-50 text-indigo-700"
                        }`}>
                          {s?.name.slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-xs font-bold">{s?.name}</div>
                          <div className={`text-[10px] ${isSelected ? "text-purple-100" : "text-slate-400"}`}>
                            {isQuiz ? (lastQ ? `${lastQ.score}/${lastQ.maxScore} (${lastQ.percentScore}%)` : "ส่งแล้ว") : (st === "reviewed" ? "ตรวจจบแล้ว" : "ส่งกลับให้แก้")}
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${
                        isSelected 
                          ? "bg-white/20 text-white" 
                          : isQuiz 
                          ? (lastQ?.passed ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200")
                          : st === "reviewed" 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}>
                        {isQuiz ? (lastQ?.passed ? "ผ่าน" : "ควรทบทวน") : (st === "reviewed" ? "ตรวจจบ" : "ให้แก้ไข")}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 3. Not Submitted Yet */}
            {notSubmittedStudents.length > 0 && (
              <div className="p-2 opacity-60">
                <div className="text-[11px] font-bold text-slate-400 px-3 py-1">
                  {isQuiz ? `ยังไม่ได้ทำ (${notSubmittedStudents.length})` : `ยังไม่ได้ส่ง (${notSubmittedStudents.length})`}
                </div>
                {notSubmittedStudents.map(id => {
                  const s = envelope.students.find(x => x.id === id);
                  const isSelected = activeStudentId === id;
                  return (
                    <button
                      key={id}
                      onClick={() => selectStudentAndSwitchTab(id)}
                      className={`w-full text-left p-2.5 rounded-2xl my-0.5 flex items-center justify-between transition-all duration-150 cursor-pointer ${
                        isSelected ? "bg-slate-800 text-white" : "hover:bg-slate-100 text-slate-600"
                      }`}
                    >
                      <div className="text-xs font-medium">{s?.name}</div>
                      <span className="text-[10px] text-slate-400">{isQuiz ? "ยังไม่เริ่ม" : "ยังไม่ส่ง"}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Work and Review Area (8 cols) - Mobile hidden if on queue tab */}
        <div className={`lg:col-span-8 space-y-5 ${
          mobileTab === "grading" ? "block" : "hidden lg:block"
        }`}>
          {!activeStudentId ? (
            <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-purple-100/70 p-12 text-center text-slate-400 shadow-xs">
              <User size={32} className="mx-auto mb-2 opacity-40" />
              <p>กรุณาเลือกนักเรียนจากคิวตรวจด้านซ้าย</p>
            </div>
          ) : isQuiz ? (
            <div className="space-y-5">
              {/* Student Header Card for Quiz */}
              <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-purple-100/70 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100/80 text-purple-800 flex items-center justify-center font-bold text-base shadow-xs">
                    {activeStudent?.name.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900">{activeStudent?.name}</h2>
                      <span className="text-xs text-slate-500 font-mono">({activeStudent?.id})</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {latestQuiz ? (
                        <>
                          ประวัติการส่ง: <b className="text-slate-800">{studentQuizHistory.length} ครั้ง</b> • ล่าสุดเมื่อ {new Date(latestQuiz.submittedAt).toLocaleString('th-TH')}
                        </>
                      ) : (
                        "ยังไม่ได้เริ่มทำแบบทดสอบ"
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  {latestQuiz ? (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                      latestQuiz.passed ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}>
                      <CheckCircle2 size={13} className={latestQuiz.passed ? "text-emerald-600" : "text-amber-600"} />
                      <span>{latestQuiz.passed ? "ผ่านเกณฑ์ 80%" : "ยังไม่ผ่านเกณฑ์ 80%"}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      ยังไม่ได้ทำ
                    </span>
                  )}
                </div>
              </div>

              {latestQuiz ? (
                <>
                  {/* Score Card */}
                  <div className={`p-5 rounded-3xl border flex flex-wrap items-center justify-between gap-4 shadow-xs ${
                    latestQuiz.passed 
                      ? "bg-gradient-to-r from-emerald-50/90 to-teal-50/60 border-emerald-200 text-emerald-950" 
                      : "bg-gradient-to-r from-amber-50/90 to-orange-50/60 border-amber-200 text-amber-950"
                  }`}>
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-xs">
                        {latestQuiz.passed ? "🏆" : "📖"}
                      </div>
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wider opacity-80">
                          ผลการตรวจอัตโนมัติ (Auto-Graded)
                        </div>
                        <div className="text-xl font-black">
                          {latestQuiz.score} / {latestQuiz.maxScore} ข้อ ({latestQuiz.percentScore}%)
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/90 border border-slate-200/80 text-slate-700">
                      เกณฑ์ผ่าน: {mission.config.passPercent || 80}% (ต้องได้ 3/3 ข้อ)
                    </span>
                  </div>

                  {/* Question by question answers */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                      <ListChecks size={16} className="text-purple-600" />
                      <span>คำตอบของนักเรียนและเฉลยรายข้อ</span>
                    </h3>

                    {quizQuestions.map((q, idx) => {
                      const studentAnswerId = latestQuiz.answers[q.id];
                      const isCorrect = studentAnswerId === q.correctOptionId;

                      return (
                        <div key={q.id} className="bg-white/90 backdrop-blur-md rounded-3xl border border-purple-100/70 p-5 shadow-xs space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <span className={`w-7 h-7 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                                isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                              }`}>
                                {idx + 1}
                              </span>
                              <div className="font-bold text-sm text-slate-900 whitespace-pre-wrap leading-relaxed">
                                {q.prompt}
                              </div>
                            </div>

                            <span className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 flex items-center gap-1 ${
                              isCorrect ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"
                            }`}>
                              {isCorrect ? <Check size={13} /> : <X size={13} />}
                              <span>{isCorrect ? "ถูกต้อง (+1)" : "ยังไม่ถูก (0)"}</span>
                            </span>
                          </div>

                          {/* Options */}
                          <div className="grid gap-2 pl-0 sm:pl-10 text-xs">
                            {q.options.map((opt) => {
                              const isChosen = studentAnswerId === opt.id;
                              const isTheCorrectOption = q.correctOptionId === opt.id;

                              let rowClass = "bg-slate-50/50 border-slate-200/70 text-slate-600 opacity-60";
                              if (isTheCorrectOption) {
                                rowClass = "bg-emerald-50/90 border-emerald-300 text-emerald-950 font-semibold ring-1 ring-emerald-500/20";
                              } else if (isChosen && !isTheCorrectOption) {
                                rowClass = "bg-rose-50/90 border-rose-300 text-rose-950 font-medium line-through";
                              }

                              return (
                                <div key={opt.id} className={`p-3 rounded-2xl border flex items-center justify-between ${rowClass}`}>
                                  <div className="flex items-center gap-2.5">
                                    <span className="font-bold">{opt.label}.</span>
                                    <span>{opt.text}</span>
                                  </div>

                                  <div className="flex items-center gap-1 text-[11px] font-bold">
                                    {isTheCorrectOption && <span className="text-emerald-700">คำตอบที่ถูกต้อง ✓</span>}
                                    {isChosen && !isTheCorrectOption && <span className="text-rose-700">คำตอบของนักเรียน ✗</span>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Explanation */}
                          <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-2xl text-xs space-y-1 ml-0 sm:pl-4">
                            <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                              <Sparkles size={13} className="text-indigo-600" />
                              <span>คำอธิบายเฉลย:</span>
                            </span>
                            <p className="text-slate-700 leading-relaxed pl-5">
                              {q.explanation}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Previous attempts if retaken */}
                  {studentQuizHistory.length > 1 && (
                    <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-purple-100/70 p-5 shadow-xs space-y-3">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-600">
                        ประวัติการทำแบบทดสอบ ({studentQuizHistory.length} ครั้ง)
                      </h4>
                      <div className="divide-y divide-purple-50 text-xs">
                        {studentQuizHistory.map((h) => (
                          <div key={h.id} className="py-2.5 flex items-center justify-between">
                            <div>
                              <span className="font-bold text-slate-800">ครั้งที่ {h.attemptNo}</span>
                              <span className="text-slate-400 ml-2">{new Date(h.submittedAt).toLocaleString('th-TH')}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold">{h.score}/{h.maxScore} ({h.percentScore}%)</span>
                              <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                                h.passed ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                              }`}>
                                {h.passed ? "ผ่าน" : "ควรทบทวน"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-purple-100/70 p-12 text-center text-slate-400 shadow-xs">
                  <Clock size={32} className="mx-auto mb-2 opacity-40 text-slate-400" />
                  <p className="font-medium text-slate-600">นักเรียนคนนี้ยังไม่ได้เริ่มทำแบบทดสอบนี้</p>
                  <p className="text-xs text-slate-400 mt-1">เมื่อนักเรียนทำและส่งแบบทดสอบ ระบบจะตรวจและแสดงผลลัพธ์ที่นี่โดยอัตโนมัติ</p>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Student Header Card */}
              <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-purple-100/70 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100/80 text-indigo-800 flex items-center justify-center font-bold text-base shadow-xs">
                    {activeStudent?.name.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900">{activeStudent?.name}</h2>
                      <span className="text-xs text-slate-500 font-mono">({activeStudent?.id})</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      รอบการส่งปัจจุบัน: <b className="text-slate-800">รอบที่ {latestAttempt?.attemptNo || 0}</b>
                      {latestAttempt && ` • ส่งเมื่อ ${new Date(latestAttempt.submittedAt).toLocaleString('th-TH')}`}
                    </div>
                  </div>
                </div>

                <div>
                  {currentWorkStatus === "submitted" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      <Clock size={13} className="text-amber-600 animate-pulse" />
                      <span>สถานะ: รอครูตรวจ</span>
                    </span>
                  )}
                  {currentWorkStatus === "reviewed" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      <span>สถานะ: ตรวจจบแล้ว</span>
                    </span>
                  )}
                  {currentWorkStatus === "changes-requested" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
                      <AlertCircle size={13} className="text-rose-600" />
                      <span>สถานะ: ส่งกลับให้แก้ไข</span>
                    </span>
                  )}
                  {(currentWorkStatus === "not-started" || currentWorkStatus === "started") && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      <span>ยังไม่มีคำตอบที่ส่ง</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Previous Rounds Accordion / Comparison */}
              {studentAttempts.length > 1 && (
                <div className="bg-purple-50/40 border border-purple-100/80 rounded-3xl p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 font-bold text-xs text-slate-700 border-b border-purple-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <History size={15} className="text-indigo-600" />
                      <span>หลักฐานเปรียบเทียบคำตอบรอบก่อนหน้า (รอบที่ 1 ถึง {studentAttempts.length - 1})</span>
                    </div>
                    <button
                      onClick={() => setIsBeforeAfterOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs shadow-xs cursor-pointer hover:-translate-y-0.5 transition-all active:scale-95"
                    >
                      <Sparkles size={13} />
                      <span>🔍 เปรียบเทียบก่อน–หลัง (Before & After)</span>
                    </button>
                  </div>

                  <div className="grid gap-3">
                    {studentAttempts.slice(0, -1).map(att => {
                      const prevReview = envelope.reviews.find(r => r.attemptId === att.id);
                      return (
                        <div key={att.id} className="bg-white p-4 rounded-xl border border-slate-200/80 text-xs space-y-2 shadow-2xs">
                          <div className="flex items-center justify-between font-bold text-slate-700">
                            <span>คำตอบรอบที่ {att.attemptNo}</span>
                            <span className="text-[10px] text-slate-400">{new Date(att.submittedAt).toLocaleTimeString('th-TH')}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-lg text-slate-700 whitespace-pre-wrap font-sans">
                            {att.content}
                          </div>
                          {prevReview && (
                            <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg text-amber-900">
                              <span className="font-bold">Feedback ที่ส่งกลับไป:</span> {prevReview.feedback}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Latest Answer Card */}
              <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-purple-100/70 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-purple-50 pb-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                    <span>คำตอบรอบล่าสุด (รอบที่ {latestAttempt?.attemptNo || 1})</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {latestAttempt ? `${latestAttempt.content.length} ตัวอักษร` : "ยังไม่ส่ง"}
                  </span>
                </div>

                <div className={`p-4 sm:p-5 rounded-2xl border text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  mission.type === "coding"
                    ? "bg-slate-950 text-emerald-300 font-mono border-slate-800 shadow-inner"
                    : "bg-purple-50/30 text-slate-800 font-sans border-purple-100"
                }`}>
                  {latestAttempt ? latestAttempt.content : <span className="text-slate-400 italic font-sans">นักเรียนคนนี้ยังไม่ได้ส่งคำตอบ</span>}
                </div>

                {latestAttempt?.revisionNote && (
                  <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs space-y-1">
                    <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-indigo-600" />
                      <span>สิ่งที่นักเรียนระบุว่าปรับแก้ในรอบนี้ (Reflection Note):</span>
                    </span>
                    <p className="text-indigo-950 font-medium leading-relaxed pl-5">
                      "{latestAttempt.revisionNote}"
                    </p>
                  </div>
                )}
              </div>

              {/* Grading and Review Controls (Only shown if submitted and not finalized) */}
              {latestAttempt && currentWorkStatus === "submitted" && (
                <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-purple-100/70 p-5 sm:p-6 shadow-xs space-y-6">
                  {/* Rubric Criteria Selection */}
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-50 pb-3">
                      <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                        <ListChecks size={16} className="text-purple-600" />
                        <span>เกณฑ์การให้คะแนน Rubric (รวม 6 คะแนน)</span>
                      </div>
                      <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200/80">
                        คะแนนรวมขณะนี้: {currentTotalScore} / 6
                      </span>
                    </div>

                    <div className="space-y-4">
                      {mission.config.rubric?.criteria.map((crit) => {
                        const currentScore = scores[crit.id];
                        const isRequiredFull = mission.config.rubric?.requiredFullScoreCriterionIds.includes(crit.id);

                        return (
                          <div key={crit.id} className="p-4 rounded-2xl border border-purple-100/80 bg-white/70 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-bold text-xs sm:text-sm text-slate-800">
                                {crit.label}
                                {isRequiredFull && (
                                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full ml-2">
                                    *ต้องได้เต็ม 2/2 เพื่อผ่าน
                                  </span>
                                )}
                              </span>
                              <span className="text-xs font-semibold text-slate-500">
                                คะแนนที่เลือก: <b className="text-purple-600">{currentScore !== undefined ? `${currentScore} คะแนน` : "ยังไม่เลือก"}</b>
                              </span>
                            </div>

                            {/* 0, 1, 2 points choice buttons */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              {["0", "1", "2"].map((ptsStr) => {
                                const pts = parseInt(ptsStr);
                                const isSelected = currentScore === pts;
                                return (
                                  <button
                                    key={ptsStr}
                                    onClick={() => handleScoreChange(crit.id, pts)}
                                    className={`p-3.5 rounded-2xl text-left border transition-all duration-150 cursor-pointer flex flex-col justify-between gap-2 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none ${
                                      isSelected 
                                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-purple-600 shadow-sm scale-[1.01]" 
                                        : "bg-white text-slate-700 border-purple-100/90 hover:bg-purple-50/50 hover:border-purple-200 hover:-translate-y-0.5 active:scale-95"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between w-full">
                                      <span className={`text-xs font-black ${isSelected ? "text-white" : "text-slate-900"}`}>
                                        {pts} คะแนน
                                      </span>
                                      {isSelected && <Check size={14} className="text-white" />}
                                    </div>
                                    <p className={`text-[11px] line-clamp-3 leading-relaxed ${isSelected ? "text-purple-100" : "text-slate-500"}`}>
                                      {crit.levels[ptsStr]}
                                    </p>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Result Preview Callout */}
                    {allCriteriaAnswered && (
                      <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-2 text-xs font-bold ${
                        meetsPassCriteria 
                          ? "bg-emerald-50 text-emerald-900 border-emerald-200" 
                          : "bg-amber-50 text-amber-900 border-amber-200"
                      }`}>
                        <span>
                          ผลประเมินเมื่อปิดการตรวจ: {currentTotalScore}/6 ({((currentTotalScore / 6) * 100).toFixed(1)}%)
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-xs ${
                          meetsPassCriteria ? "bg-emerald-200 text-emerald-900" : "bg-amber-200 text-amber-900"
                        }`}>
                          {meetsPassCriteria ? "ผ่านเกณฑ์ของงานนี้ 🎉" : "ควรทบทวน (คะแนนหรือเกณฑ์ A ยังไม่ถึง)"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* AI Adaptive Copilot Recommendation Card */}
                    {activeStudent && (
                      <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white border border-purple-500/30 shadow-md space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-xl bg-purple-500/30 border border-purple-400/40 flex items-center justify-center text-xs">
                              🤖
                            </div>
                            <span className="font-black text-xs text-white">
                              LearnWise AI Copilot • คำแนะนำการปรับภารกิจเฉพาะบุคคล
                            </span>
                          </div>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {aiRec.tag}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {aiRec.message}
                        </p>

                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-1">
                          <div className="text-[11px] font-bold text-amber-300">
                            📌 ก้าวถัดไปที่แนะนำสำหรับผู้เรียนคนนี้:
                          </div>
                          <div className="text-[11px] text-slate-200 leading-relaxed">
                            {aiRec.nextMissionAdvice}
                          </div>
                        </div>

                        <div className="flex items-center justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => setFeedback(prev => prev ? `${prev}\n\n${aiRec.suggestedFeedbackSnippet}` : aiRec.suggestedFeedbackSnippet)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-xs hover:shadow transition-all cursor-pointer active:scale-95"
                          >
                            <Sparkles size={13} />
                            <span>คัดลอกคำแนะนำใส่ใน Feedback</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Feedback Textarea */}
                    <div className="space-y-2">
                      <label className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
                        <MessageSquare size={15} className="text-purple-600" />
                        <span>คำแนะนำ (Feedback สำหรับนักเรียน)</span>
                      </label>
                      <p className="text-xs text-slate-500">
                        แนะนำให้ระบุ 3 ส่วน: สิ่งที่ทำได้ดีแล้ว / จุดที่ควรปรับ / สิ่งที่ให้ลองทำต่อ (ตาม PRD)
                      </p>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={5}
                      className="w-full p-4 text-xs sm:text-sm text-slate-800 bg-slate-50/70 border border-purple-100/90 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-400/20 focus:border-purple-400 transition-all duration-200 leading-relaxed placeholder:text-slate-400"
                      placeholder="พิมพ์คำแนะนำเพื่อช่วยให้นักเรียนเข้าใจและปรับปรุงได้ตรงจุด..."
                    />
                  </div>

                  {/* Decision Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-purple-50">
                    <button
                      onClick={handleRequestChanges}
                      className="w-full sm:w-1/2 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm text-amber-900 bg-amber-100/80 hover:bg-amber-100 hover:-translate-y-0.5 active:scale-95 border border-amber-300/80 transition-all duration-150 shadow-xs flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
                    >
                      <RefreshCw size={15} />
                      <span>ส่งกลับให้แก้ไข (ยังไม่คิดคะแนน)</span>
                    </button>

                    <button
                      onClick={handleFinalize}
                      className="w-full sm:w-1/2 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/20 active:scale-95 transition-all duration-150 shadow-xs flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none"
                    >
                      <CheckCircle2 size={16} />
                      <span>ปิดการตรวจและยืนยันคะแนน</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {studentAttempts.length > 1 && (
        <BeforeAfterModal
          isOpen={isBeforeAfterOpen}
          onClose={() => setIsBeforeAfterOpen(false)}
          mission={mission}
          studentName={activeStudent?.name || "นักเรียน"}
          attempt1={studentAttempts[0]}
          attempt2={studentAttempts[studentAttempts.length - 1]}
          review1={envelope.reviews.find(r => r.attemptId === studentAttempts[0].id)}
          review2={envelope.reviews.find(r => r.attemptId === studentAttempts[studentAttempts.length - 1].id)}
        />
      )}
    </div>
  );
};
