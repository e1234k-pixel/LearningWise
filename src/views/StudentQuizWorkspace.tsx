import { useState } from "react";
import { useApp } from "../context/AppDataContext";
import { 
  ArrowLeft, 
  RotateCcw, 
  Send, 
  ChevronRight, 
  HelpCircle, 
  Sparkles,
  Check,
  X,
  Bot
} from "lucide-react";
import { mockQuizQuestions } from "../data/mock";

export const StudentQuizWorkspace = ({ missionId, onBack }: { missionId: string; onBack: () => void }) => {
  const { role, envelope, submitQuiz, recordPulseRating, openAiDrawer } = useApp();
  
  // If retaking, isRetaking flag is true
  const [isRetaking, setIsRetaking] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  if (role.type !== "student") return null;

  const mission = envelope.missions.find(m => m.id === missionId);
  const questions = mission?.config.questions || mockQuizQuestions;

  // Find all quiz history entries for this student and mission
  const history = envelope.quizHistory.filter(h => h.missionId === missionId && h.studentId === role.id);
  const latestHistory = history[history.length - 1];

  if (!mission) return <div className="p-8 text-center text-slate-500">ไม่พบภารกิจนี้</div>;

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = () => {
    // Validate that all questions are answered
    const unanswered = questions.find(q => !answers[q.id]);
    if (unanswered) {
      alert("กรุณาตอบคำถามให้ครบทุกข้อก่อนส่งแบบทดสอบ");
      return;
    }

    if (window.confirm("ยืนยันที่จะส่งคำตอบแบบทดสอบใช่หรือไม่?")) {
      submitQuiz(missionId, role.id, answers);
      setIsRetaking(false);
    }
  };

  const handleStartRetake = () => {
    if (window.confirm("ต้องการเริ่มทำแบบทดสอบใหม่อีกครั้งเพื่อฝึกฝนใช่หรือไม่? (ประวัติการทำเดิมจะยังคงถูกบันทึกไว้)")) {
      setAnswers({});
      setIsRetaking(true);
    }
  };

  const showQuizForm = !latestHistory || isRetaking;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button 
          onClick={onBack} 
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 hover:-translate-y-0.5 active:scale-95 transition-all shadow-2xs cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
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

      {/* Mission Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
              แบบทดสอบ (Quiz)
            </span>
            <span className="text-xs font-medium text-slate-500">• {mission.topic}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => openAiDrawer("ช่วยอธิบายหลักการและแนวคิดสำคัญที่เกี่ยวข้องกับแบบทดสอบเรื่องนี้หน่อยครับ (ช่วยสรุปแนวคิดแบบไม่เฉลยคำตอบของแบบทดสอบ)")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100/80 px-3 py-1.5 rounded-lg border border-purple-200/80 hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer shadow-2xs"
              title="ทบทวนมโนทัศน์กับ AI Tutor"
            >
              <Bot size={14} className="text-purple-600 animate-pulse" />
              <span>💡 ปรึกษา AI Tutor ทบทวนมโนทัศน์</span>
            </button>

            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
              เกณฑ์ผ่าน: {mission.config.passPercent || 80}% (ต้องถูก 3/3 ข้อ)
            </span>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {mission.title}
        </h1>
        <p className="text-sm text-slate-600">
          {mission.description}
        </p>
      </div>

      {/* Quiz Form (When Taking / Retaking) */}
      {showQuizForm ? (
        <div className="space-y-5">
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-blue-900">
            <HelpCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">คำชี้แจงการทำแบบทดสอบ:</span>
              <span>เลือกคำตอบที่ถูกต้องที่สุดในแต่ละข้อ ระบบจะตรวจให้คะแนนอัตโนมัติทันทีหลังส่ง และแสดงเฉลยพร้อมคำอธิบาย</span>
            </div>
          </div>

          {questions.map((q, idx) => (
            <div key={q.id} className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="font-bold text-sm sm:text-base text-slate-900 whitespace-pre-wrap leading-relaxed">
                  {q.prompt}
                </div>
              </div>

              {/* Options */}
              <div className="grid gap-2.5 pl-0 sm:pl-10">
                {q.options.map((opt) => {
                  const isSelected = answers[q.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(q.id, opt.id)}
                      className={`p-3.5 sm:p-4 rounded-xl text-left border transition-all duration-150 cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected 
                          ? "bg-blue-50/90 border-blue-500 text-blue-950 font-semibold ring-2 ring-blue-500/20 shadow-xs" 
                          : "bg-slate-50/50 hover:bg-slate-100/80 border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isSelected ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                        }`}>
                          {opt.label}
                        </span>
                        <span className="text-xs sm:text-sm">{opt.text}</span>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white"
                      }`}>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Action Footer */}
          <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500">
              ตอบแล้ว {Object.keys(answers).length} จาก {questions.length} ข้อ
            </span>

            <div className="flex gap-3">
              {isRetaking && (
                <button
                  onClick={() => setIsRetaking(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                >
                  ยกเลิกทำซ้ำ
                </button>
              )}
              <button
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 transition-all cursor-pointer"
              >
                <Send size={14} />
                <span>ส่งแบบทดสอบ</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Quiz Result & Review View */
        <div className="space-y-6">
          {/* Score Summary Card */}
          <div className={`p-6 sm:p-8 rounded-2xl border shadow-sm text-center space-y-3 ${
            latestHistory.passed 
              ? "bg-gradient-to-b from-emerald-50/80 to-teal-50/50 border-emerald-300 text-emerald-950" 
              : "bg-gradient-to-b from-amber-50/80 to-orange-50/50 border-amber-300 text-amber-950"
          }`}>
            <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center text-2xl shadow-md shadow-emerald-500/10">
              {latestHistory.passed ? "🏆" : "📖"}
            </div>

            <h2 className="text-xl sm:text-2xl font-black">
              {latestHistory.passed ? "ยินดีด้วย! คุณผ่านเกณฑ์แบบทดสอบนี้" : "ควรทบทวนเนื้อหาเพิ่มเติม"}
            </h2>

            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl sm:text-4xl font-black">
                {latestHistory.score} / {latestHistory.maxScore}
              </span>
              <span className="text-base sm:text-lg font-bold">
                ({latestHistory.percentScore}%)
              </span>
            </div>

            <p className="text-xs sm:text-sm max-w-md mx-auto opacity-85 leading-relaxed">
              {latestHistory.passed 
                ? "คุณตอบคำถามถูกต้องครบถ้วนตามเกณฑ์ 80% มีความพร้อมในการเขียนโปรแกรมลูปแล้ว" 
                : "ยังไม่ถึงเกณฑ์ผ่าน 80% แนะนำให้อ่านเฉลยและคำอธิบายด้านล่าง แล้วลองทำใหม่อีกครั้งเพื่อความเข้าใจที่แม่นยำ"}
            </p>

            <div className="pt-2">
              <button
                onClick={handleStartRetake}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-white text-slate-800 hover:bg-slate-50 border border-slate-300 shadow-sm hover:shadow hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>ทำแบบทดสอบใหม่อีกครั้ง (Retake)</span>
              </button>
            </div>

            {/* Quiz Pulse Rating */}
            <div className="pt-4 border-t border-white/20 flex flex-col items-center gap-2 text-center">
              <span className="text-xs font-semibold opacity-95">
                💖 คุณชอบแบบทดสอบสไตล์นี้ไหม? (Quiz Pulse):
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                {[
                  { label: "⚡ สนุกและถนัดมาก (My Favorite)", short: "⚡ สนุกและถนัดมาก" },
                  { label: "💡 ท้าทายกำลังดี (Good Challenge)", short: "💡 ท้าทายกำลังดี" },
                  { label: "🧩 อยากได้คำใบ้เพิ่ม (Need More Guidance)", short: "🧩 อยากได้คำใบ้เพิ่ม" },
                  { label: "🔄 อยากลองแบบอื่น (Prefer Other Types)", short: "🔄 อยากลองแบบอื่น" },
                ].map(pulse => (
                  <button
                    key={pulse.label}
                    type="button"
                    onClick={() => recordPulseRating("quiz", latestHistory.id, pulse.label)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs cursor-pointer ${
                      latestHistory.pulseRating === pulse.label
                        ? "bg-white text-slate-900 shadow-md scale-105"
                        : "bg-white/20 hover:bg-white/30 text-white"
                    }`}
                  >
                    {pulse.short}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Question by Question Breakdown with Explanations */}
          <div className="space-y-4">
            <h3 className="font-bold text-base text-slate-900">เฉลยและคำอธิบายอย่างละเอียด</h3>

            {questions.map((q, idx) => {
              const studentAnswerId = latestHistory.answers[q.id];
              const isCorrect = studentAnswerId === q.correctOptionId;

              return (
                <div key={q.id} className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                        isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                      }`}>
                        {idx + 1}
                      </span>
                      <div className="font-bold text-sm sm:text-base text-slate-900 whitespace-pre-wrap leading-relaxed">
                        {q.prompt}
                      </div>
                    </div>

                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1 ${
                      isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}>
                      {isCorrect ? <Check size={13} /> : <X size={13} />}
                      <span>{isCorrect ? "ถูกต้อง (+1)" : "ยังไม่ถูกต้อง (0)"}</span>
                    </span>
                  </div>

                  {/* Options with Highlight */}
                  <div className="grid gap-2 pl-0 sm:pl-10">
                    {q.options.map((opt) => {
                      const isChosen = studentAnswerId === opt.id;
                      const isTheCorrectOption = q.correctOptionId === opt.id;

                      let rowClass = "bg-slate-50/50 border-slate-200 text-slate-700 opacity-60";
                      if (isTheCorrectOption) {
                        rowClass = "bg-emerald-50/90 border-emerald-300 text-emerald-950 font-semibold ring-1 ring-emerald-500/20";
                      } else if (isChosen && !isTheCorrectOption) {
                        rowClass = "bg-rose-50/90 border-rose-300 text-rose-950 font-medium line-through";
                      }

                      return (
                        <div key={opt.id} className={`p-3 sm:p-3.5 rounded-xl border flex items-center justify-between text-xs sm:text-sm ${rowClass}`}>
                          <div className="flex items-center gap-2.5">
                            <span className="font-bold">{opt.label}.</span>
                            <span>{opt.text}</span>
                          </div>

                          <div className="flex items-center gap-1 text-[11px] font-bold">
                            {isTheCorrectOption && <span className="text-emerald-700">คำตอบที่ถูกต้อง ✓</span>}
                            {isChosen && !isTheCorrectOption && <span className="text-rose-700">คำตอบที่คุณเลือก ✗</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Callout */}
                  <div className="p-3.5 sm:p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs sm:text-sm space-y-1 ml-0 sm:ml-10">
                    <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-indigo-600" />
                      <span>คำอธิบาย:</span>
                    </span>
                    <p className="text-slate-700 leading-relaxed pl-5">
                      {q.explanation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Previous Attempts History (if retaken multiple times) */}
          {history.length > 1 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h4 className="font-bold text-sm text-slate-800">ประวัติการทำแบบทดสอบทั้งหมด ({history.length} ครั้ง)</h4>
              <div className="divide-y divide-slate-100 text-xs">
                {history.map((h) => (
                  <div key={h.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">ครั้งที่ {h.attemptNo}</span>
                      <span className="text-slate-400 ml-2">{new Date(h.submittedAt).toLocaleString('th-TH')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{h.score}/{h.maxScore} ({h.percentScore}%)</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
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
        </div>
      )}
    </div>
  );
};
