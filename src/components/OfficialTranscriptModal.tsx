import React from "react";
import { 
  Printer, 
  Download, 
  X, 
  ShieldCheck, 
  Check
} from "lucide-react";
import { Student } from "../types";

interface GradeSummaryItem {
  student: Student;
  rawScore: number;
  maxScore: number;
  percentScore: number;
  letterGrade: string;
  gradeLevel: string;
  pathway: string;
  standardCode: string;
  isMastered: boolean;
}

interface OfficialTranscriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  gradeSummaries: GradeSummaryItem[];
  classAvgScore: string;
  classAvgPct: number;
  masteryRatePct: number;
}

export const OfficialTranscriptModal: React.FC<OfficialTranscriptModalProps> = ({
  isOpen,
  onClose,
  gradeSummaries,
  classAvgScore,
  classAvgPct,
  masteryRatePct
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex justify-center p-2 sm:p-6 animate-fadeIn print:p-0 print:bg-white">
      <div className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto print:border-none print:shadow-none print:rounded-none">
        
        {/* Modal Top Control Bar (Hidden when printing) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-sm">
              ปพ.๕
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black flex items-center gap-2">
                <span>พรีวิวเอกสารทางการ: แบบบันทึกผลการพัฒนาคุณภาพผู้เรียน (ปพ. 5)</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  มาตรฐาน ว 4.2
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                รองรับการพิมพ์และส่งออกฝ่ายวิชาการตามระเบียบวัดและประเมินผลการเรียนรู้
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <Printer size={14} />
              <span>พิมพ์เอกสาร (Print)</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
            >
              <Download size={14} />
              <span>บันทึก PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-10 space-y-6 text-slate-900 bg-white" id="printable-pp5">
          
          {/* Official Document Header */}
          <div className="text-center space-y-2 border-b-2 border-slate-900 pb-6">
            <div className="flex justify-center mb-2">
              <div className="w-16 h-16 rounded-full border-2 border-slate-900 flex items-center justify-center text-3xl font-black bg-amber-50">
                ⚜️
              </div>
            </div>
            <div className="text-xs font-semibold tracking-widest text-slate-600 uppercase">
              กระทรวงศึกษาธิการ • สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              แบบบันทึกผลการพัฒนาคุณภาพผู้เรียน (ปพ. ๕)
            </h1>
            <div className="text-xs sm:text-sm font-bold text-slate-700">
              กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี • รายวิชาวิทยาการคำนวณ (ว31101) ชั้นมัธยมศึกษาปีที่ 4
            </div>
            <div className="text-xs text-slate-600 flex flex-wrap items-center justify-center gap-4 pt-1">
              <span><b>โรงเรียน:</b> สาธิตนวัตกรรมการเรียนรู้ดิจิทัล</span>
              <span><b>ภาคเรียนที่:</b> ๑</span>
              <span><b>ปีการศึกษา:</b> ๒๕๖๙</span>
              <span><b>ครูผู้สอน:</b> ครูเมย์ นวัตกรรมครู</span>
            </div>
          </div>

          {/* Curriculum Standard & Competency Box */}
          <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-black text-slate-900">
              <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
              <span>มาตรฐานการเรียนรู้และตัวชี้วัดที่ประเมิน (Curriculum Standard):</span>
            </div>
            <p className="text-slate-700 leading-relaxed pl-6">
              <b>มาตรฐาน ว 4.2 ตัวชี้วัด ม.4/1:</b> ประยุกต์ใช้แนวคิดเชิงคำนวณ ออกแบบและเขียนโปรแกรมอย่างง่ายเพื่อแก้ปัญหาในชีวิตจริง 
              โดยใช้โครงสร้างควบคุมแบบวนซ้ำ (Iteration & Loop Control Structures)
            </p>
            <div className="text-[11px] text-slate-500 pl-6 italic">
              *หมายเหตุ: ผู้เรียนแสดงหลักฐานสมรรถนะผ่านเส้นทางการเรียนรู้ที่หลากหลาย (Multi-Modal Pathways: Coding, Conceptual Explanation, Logic Quiz) 
              ตามหลักการจัดการเรียนรู้เพื่อคนทั้งมวล (UDL) โดยเทียบเคียงเกณฑ์การประเมินกลาง 6 มิติ (Unified 6-Point Rubric) ชุดเดียวกัน
            </div>
          </div>

          {/* Official Evaluation Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-300 border-collapse">
              <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                <tr className="divide-x divide-slate-300 text-center">
                  <th className="p-2.5 w-10">ที่</th>
                  <th className="p-2.5 w-24">รหัสประจำตัว</th>
                  <th className="p-2.5 text-left">ชื่อ - สกุล ผู้เรียน</th>
                  <th className="p-2.5 text-left">สไตล์การเรียนรู้ (Persona)</th>
                  <th className="p-2.5 text-left">เส้นทางหลักฐานการเรียนรู้</th>
                  <th className="p-2.5 w-20">คะแนนรูบริก<br/>(เต็ม 6.0)</th>
                  <th className="p-2.5 w-16">ร้อยละ<br/>(%)</th>
                  <th className="p-2.5 w-20">ระดับผลการเรียน<br/>(เกรด)</th>
                  <th className="p-2.5 w-24">ผลการตัดสิน<br/>ตัวชี้วัด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {gradeSummaries.map((item, idx) => (
                  <tr key={item.student.id} className="divide-x divide-slate-300 hover:bg-slate-50">
                    <td className="p-2 text-center font-semibold text-slate-700">{idx + 1}</td>
                    <td className="p-2 text-center font-mono text-slate-600">{item.student.id}</td>
                    <td className="p-2 font-bold text-slate-900">{item.student.name}</td>
                    <td className="p-2">
                      <span className="font-semibold text-indigo-900">
                        {item.student.learnerProfile?.persona || "ผู้เรียนรู้ทั่วไป"}
                      </span>
                    </td>
                    <td className="p-2 text-slate-700">
                      {item.pathway}
                    </td>
                    <td className="p-2 text-center font-bold text-slate-900">
                      {item.rawScore.toFixed(1)}
                    </td>
                    <td className="p-2 text-center font-semibold text-slate-800">
                      {item.percentScore}%
                    </td>
                    <td className="p-2 text-center font-black">
                      <span className={item.letterGrade === "4.0" ? "text-emerald-700" : "text-blue-700"}>
                        {item.letterGrade}
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-800 text-[11px]">
                        <Check size={12} className="text-emerald-600 stroke-[3]" />
                        <span>ผ่านเกณฑ์</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary KPI Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-center text-xs">
            <div className="border border-slate-300 rounded-xl p-3 bg-slate-50">
              <div className="text-slate-500 text-[11px]">จำนวนนักเรียนทั้งหมด</div>
              <div className="text-lg font-black text-slate-900">{gradeSummaries.length} คน</div>
            </div>
            <div className="border border-slate-300 rounded-xl p-3 bg-slate-50">
              <div className="text-slate-500 text-[11px]">ผ่านการประเมินตัวชี้วัด</div>
              <div className="text-lg font-black text-emerald-700">{masteryRatePct}% (ครบทุกคน)</div>
            </div>
            <div className="border border-slate-300 rounded-xl p-3 bg-slate-50">
              <div className="text-slate-500 text-[11px]">คะแนนเฉลี่ยระดับห้อง</div>
              <div className="text-lg font-black text-slate-900">{classAvgScore} / 6.0 ({classAvgPct}%)</div>
            </div>
            <div className="border border-slate-300 rounded-xl p-3 bg-slate-50">
              <div className="text-slate-500 text-[11px]">ระดับผลสัมฤทธิ์รวม</div>
              <div className="text-lg font-black text-emerald-700">เกรดเฉลี่ย 3.94 (ดีเยี่ยม)</div>
            </div>
          </div>

          {/* Official Signatures Section */}
          <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs text-slate-800">
            <div className="space-y-8">
              <div>
                ลงชื่อ ...........................................................
                <div className="font-bold mt-1.5">(ครูเมย์ นวัตกรรมครู)</div>
                <div className="text-slate-500 text-[11px]">ครูผู้สอนประจำรายวิชา</div>
              </div>
              <div className="text-slate-500 text-[11px]">วันที่ ๗ กันยายน ๒๕๖๙</div>
            </div>

            <div className="space-y-8">
              <div>
                ลงชื่อ ...........................................................
                <div className="font-bold mt-1.5">(ดร.ชาญชัย วิชาการดี)</div>
                <div className="text-slate-500 text-[11px]">หัวหน้ากลุ่มสาระการเรียนรู้ฯ</div>
              </div>
              <div className="text-slate-500 text-[11px]">วันที่ ๗ กันยายน ๒๕๖๙</div>
            </div>

            <div className="space-y-8">
              <div>
                ลงชื่อ ...........................................................
                <div className="font-bold mt-1.5">(ผศ.ดร.สมชาย ปัญญาเลิศ)</div>
                <div className="text-slate-500 text-[11px]">ผู้อำนวยการสถานศึกษา</div>
              </div>
              <div className="text-slate-500 text-[11px]">วันที่ ๗ กันยายน ๒๕๖๙</div>
            </div>
          </div>

          {/* Document Footer */}
          <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-[10px] text-slate-400">
            <span>LearnWise Assessment Intelligence System • Certified Standards Gradebook</span>
            <span>หน้า 1 จาก 1 • ออกโดยระบบทะเบียนวัดผลดิจิทัล</span>
          </div>

        </div>
      </div>
    </div>
  );
};
