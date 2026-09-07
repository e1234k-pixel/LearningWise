import { X, Sparkles, MessageSquare, CheckCircle2 } from "lucide-react";
import type { Mission, Attempt, Review } from "../types";

interface BeforeAfterModalProps {
  isOpen: boolean;
  onClose: () => void;
  mission: Mission;
  studentName: string;
  attempt1: Attempt;
  attempt2: Attempt;
  review1?: Review;
  review2?: Review;
}

export const BeforeAfterModal = ({
  isOpen,
  onClose,
  mission,
  studentName,
  attempt1,
  attempt2,
  review1,
  review2
}: BeforeAfterModalProps) => {
  if (!isOpen) return null;

  const isCoding = mission.type === "coding";

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200/80 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-xl shadow-inner">
              🔍
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-indigo-300">หลักฐานการเรียนรู้เชิงประจักษ์</span>
                <span className="text-xs text-slate-400">• นักเรียน: <b className="text-white">{studentName}</b></span>
              </div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight mt-0.5">
                เปรียบเทียบคำตอบก่อน–หลังแก้ไข (Before & After Comparison)
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50 text-xs sm:text-sm">
          {/* Mission Context Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs text-slate-500 font-medium">ภารกิจ:</span>
              <h3 className="font-bold text-slate-900 text-sm">{mission.title}</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                รอบที่ 1 ➔ รอบที่ 2
              </span>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                แก้ไขงานสำเร็จ
              </span>
            </div>
          </div>

          {/* Reflection Note Bridge (The transformation bridge) */}
          {attempt2.revisionNote && (
            <div className="relative rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border-2 border-indigo-200/80 p-5 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Sparkles size={16} />
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-xs uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                    <span>จุดเปลี่ยนทางความคิด (Reflection Note - สิ่งที่ผู้เรียนบันทึกว่าปรับแก้):</span>
                  </div>
                  <p className="text-slate-800 font-medium text-xs sm:text-sm leading-relaxed italic">
                    "{attempt2.revisionNote}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Side-by-Side Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
            {/* Left Column: Round 1 (Before) */}
            <div className="bg-white rounded-2xl border-2 border-rose-200/80 p-5 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-rose-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <h4 className="font-bold text-sm text-slate-900">
                      รอบที่ 1 (ก่อนแก้ไข - Before)
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(attempt1.submittedAt).toLocaleString('th-TH')}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-500">คำตอบเดิมที่ส่ง:</span>
                  <div className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    isCoding
                      ? "bg-slate-950 text-rose-300 font-mono border-slate-800"
                      : "bg-rose-50/40 text-slate-800 font-sans border-rose-200/60"
                  }`}>
                    {attempt1.content}
                  </div>
                </div>
              </div>

              {/* Feedback from Round 1 */}
              {review1 && (
                <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2 mt-4">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <MessageSquare size={14} className="text-amber-700" />
                    <span>คำแนะนำจากครูเมย์ (ส่งกลับให้แก้):</span>
                  </div>
                  <p className="text-xs text-amber-950 leading-relaxed font-sans pl-5">
                    {review1.feedback}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: Round 2 (After) */}
            <div className="bg-white rounded-2xl border-2 border-emerald-200/80 p-5 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <h4 className="font-bold text-sm text-slate-900">
                      รอบที่ 2 (หลังแก้ไข - After)
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(attempt2.submittedAt).toLocaleString('th-TH')}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-500">คำตอบฉบับปรับปรุงใหม่:</span>
                  <div className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    isCoding
                      ? "bg-slate-950 text-emerald-300 font-mono border-slate-800"
                      : "bg-emerald-50/40 text-slate-800 font-sans border-emerald-200/60"
                  }`}>
                    {attempt2.content}
                  </div>
                </div>
              </div>

              {/* Final Review from Round 2 */}
              {review2 ? (
                <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2.5 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                      <CheckCircle2 size={14} className="text-emerald-700" />
                      <span>ผลการตรวจและคำชมปิดงาน:</span>
                    </div>
                    {review2.rawScore !== null && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                        {review2.rawScore}/6 ({review2.percentScore}%)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-emerald-950 leading-relaxed font-sans pl-5">
                    {review2.feedback}
                  </p>
                </div>
              ) : (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-xs text-center mt-4">
                  รอบนี้ส่งแล้ว รอครูตรวจสอบและยืนยันคะแนน
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <CheckCircle2 size={15} className="text-emerald-600" />
            <span>หลักฐานยืนยัน: ผู้เรียนแก้ไขความเข้าใจเรื่อง stop ได้สำเร็จจากการได้รับคำแนะนำเฉพาะจุด</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
