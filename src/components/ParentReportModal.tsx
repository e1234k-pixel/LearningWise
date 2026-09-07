import React from "react";
import { 
  Printer, 
  Download, 
  X, 
  Heart, 
  Award, 
  Sparkles,
  TrendingUp,
  Calendar
} from "lucide-react";
import { Student } from "../types";

export interface GradeSummaryItem {
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

interface ParentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  gradeSummary?: GradeSummaryItem;
}

export const ParentReportModal: React.FC<ParentReportModalProps> = ({
  isOpen,
  onClose,
  student,
  gradeSummary
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const profile = student.learnerProfile;
  const persona = profile?.persona || "Balanced Learner";
  const affinity = profile?.affinityScores || { coding: 70, conceptual: 75, quiz: 80 };
  const telemetry = profile?.telemetry || {
    engagementSpeed: "เริ่มทันที (Fast)",
    resilienceIndex: "มั่นคง (Steady)",
    preferredModality: "ลงมือปฏิบัติจริง (Hands-on)"
  };

  // Resolve scores & grade
  const score = gradeSummary?.rawScore ?? 5.8;
  const maxScore = gradeSummary?.maxScore ?? 6.0;
  const letterGrade = gradeSummary?.letterGrade ?? "4.0";
  const gradeLevel = gradeSummary?.gradeLevel ?? "ดีเยี่ยม (Mastered)";
  const pathway = gradeSummary?.pathway ?? (
    persona === "Hands-on Coder" ? "เขียนโปรแกรมแก้ปัญหาจริง (Coding Challenge)" :
    persona === "Conceptual Explainer" ? "วิเคราะห์ผังงานและอธิบายมโนทัศน์ (Conceptual Short-Answer)" :
    "แบบทดสอบตรรกะเชิงลึก (Logic Mastery Quiz)"
  );

  // Persona narratives tailored for parents
  const getParentNarrative = () => {
    switch (persona) {
      case "Hands-on Coder":
        return {
          title: "สายลงมือปฏิบัติสร้างสรรค์ (Hands-on Coder)",
          emoji: "💻",
          badgeColor: "bg-indigo-500/10 text-indigo-700 border-indigo-200",
          desc: "มีความโดดเด่นมากในการคิดเป็นลำดับขั้นตอนและชอบลงมือเขียนโปรแกรมจริงเพื่อแก้ปัญหา เมื่อเผชิญโจทย์ท้าทายจะมีความมุ่งมั่น จดจ่อกับการทดลองโค้ด และภาคภูมิใจเมื่อเห็นระบบทำงานได้สำเร็จ",
          homeTip: "ชื่นชมในความพยายามแก้ปัญหา (Debug) และสนับสนุนให้มีมุมทำการบ้านที่สงบ หากลูกพูดถึงโปรแกรมที่เขียน ขอให้รับฟังด้วยความสนใจแม้จะเป็นเรื่องเทคนิค จะช่วยเสริมความมั่นใจให้ลูกได้อย่างมหาศาล"
        };
      case "Conceptual Explainer":
        return {
          title: "สายวิเคราะห์และสื่อสารมโนทัศน์ (Conceptual Explainer)",
          emoji: "✍️",
          badgeColor: "bg-purple-500/10 text-purple-700 border-purple-200",
          desc: "มีความสามารถโดดเด่นในการคิดเชิงตรรกะที่ลึกซึ้ง และสื่อสารอธิบายเรื่องที่ซับซ้อนให้เข้าใจง่าย สามารถมองเห็นความเชื่อมโยงของภาพรวม และอธิบายเหตุผลเบื้องหลังการทำงานได้อย่างเป็นระบบ",
          homeTip: "เปิดโอกาสให้ลูกได้เล่าหรืออธิบายสิ่งที่ได้เรียนรู้ ชื่นชมทักษะการสื่อสารที่ชัดเจน การให้ลูกได้สอนหรือเล่าให้คนในบ้านฟังจะช่วยพัฒนาภาวะผู้นำทางความคิดของลูกได้อย่างยอดเยี่ยม"
        };
      case "Fast Explorer":
        return {
          title: "สายทดลองและตอบสนองไว (Fast Explorer)",
          emoji: "🎯",
          badgeColor: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
          desc: "มีความกระตือรือร้นสูงในการเรียนรู้สิ่งใหม่ กล้าคิดกล้าตอบ และเรียนรู้ได้ดีเยี่ยมผ่านเกมและแบบทดสอบเชิงโต้ตอบ (Interactive) ชอบความท้าทายที่เห็นผลลัพธ์อย่างรวดเร็ว",
          homeTip: "แบ่งเป้าหมายการอ่านหนังสือที่บ้านเป็นภารกิจสั้น ๆ (เช่น ครั้งละ 15-20 นาที) และให้กำลังใจเมื่อลูกอ่านโจทย์ยาวขึ้นอย่างใจเย็น ความรวดเร็วบวกกับความรอบคอบจะทำให้ลูกเก่งรอบด้าน"
        };
      case "Resilient Improver":
        return {
          title: "สายมุ่งมั่นพัฒนาไม่ยอมแพ้ (Resilient Improver)",
          emoji: "🔄",
          badgeColor: "bg-amber-500/10 text-amber-700 border-amber-200",
          desc: "มีทักษะชีวิตที่ทรงพลังที่สุดคือ 'ความเพียรพยายาม (Grit)' เมื่องานชิ้นแรกยังไม่สมบูรณ์ จะไม่ท้อถอยแต่นำข้อเสนอแนะของครูมาปรับปรุงแก้ไขจนผลงานรอบที่สองและสามยอดเยี่ยม",
          homeTip: "กล่าวชื่นชมที่ 'ความตั้งใจและความไม่ยอมแพ้' มากกว่าเพียงแค่ผลคะแนน ทักษะการยอมรับข้อผิดพลาดแล้วนำมาพัฒนาตนเองนี้คือหัวใจสำคัญที่จะทำให้ลูกประสบความสำเร็จในอนาคต"
        };
      default:
        return {
          title: "สายสมดุลรอบด้าน (Balanced Learner)",
          emoji: "⚖️",
          badgeColor: "bg-blue-500/10 text-blue-700 border-blue-200",
          desc: "มีพัฒนาการที่รอบด้านและสมดุล ปรับตัวเข้ากับรูปแบบภารกิจการเรียนรู้ได้ทุกประเภท สามารถเรียนรู้ได้ดีทั้งการเขียนโค้ด การคิดวิเคราะห์ และการทำแบบทดสอบ",
          homeTip: "ส่งเสริมให้ลูกได้ค้นหาความสนใจพิเศษเพิ่มเติม และสนับสนุนให้มีบทบาทเป็นเพื่อนคู่คิด (Peer Tutor) ช่วยเหลือเพื่อน ๆ ในชั้นเรียนเพื่อเสริมสร้างทักษะความฉลาดทางสังคม"
        };
    }
  };

  const narrative = getParentNarrative();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex justify-center p-2 sm:p-6 animate-fadeIn print:p-0 print:bg-white">
      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto print:border-none print:shadow-none print:rounded-none">
        
        {/* Modal Top Control Bar (Hidden when printing) */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-indigo-950 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center font-black text-base">
              👨‍👩‍👧‍👦
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black flex items-center gap-2">
                <span>ใบรายงานการค้นพบศักยภาพและพัฒนาการผู้เรียน (สำหรับผู้ปกครอง)</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Parent Growth Report
                </span>
              </h2>
              <p className="text-xs text-indigo-200">
                เอกสารสรุปสไตล์การเรียนรู้ จุดแข็ง ผลสัมฤทธิ์ และคำแนะนำสนับสนุนที่บ้าน
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <Printer size={14} />
              <span>พิมพ์รายงาน (Print)</span>
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

        {/* Printable Document Body (A4 Portrait friendly) */}
        <div className="p-6 sm:p-10 space-y-6 text-slate-900 bg-white" id="printable-parent-report">
          
          {/* Header Section */}
          <div className="border-b-2 border-indigo-900/20 pb-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center text-2xl font-black shadow-md shrink-0">
                  LW
                </div>
                <div>
                  <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                    โรงเรียนสาธิตนวัตกรรมวิทยาศาสตร์ • กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี
                  </div>
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-0.5">
                    ใบรายงานการค้นพบศักยภาพและพัฒนาการผู้เรียนรายบุคคล
                  </h1>
                  <p className="text-xs text-slate-500">
                    Individual Learner Superpower & Growth Portfolio (ภาคเรียนที่ 1 ปีการศึกษา 2569)
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                  <Calendar size={12} className="text-blue-600" />
                  <span>วันที่ออกรายงาน: 7 กันยายน 2569</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  วิชา ว31101 วิทยาการคำนวณ 1 (ม.4)
                </div>
              </div>
            </div>

            {/* Student Info Bar */}
            <div className="mt-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">ชื่อ-นามสกุลนักเรียน:</span>
                <span className="font-bold text-slate-900 text-sm">{student.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">เลขประจำตัวนักเรียน:</span>
                <span className="font-bold text-slate-800 font-mono">{student.id}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">ระดับชั้น / ห้องเรียน:</span>
                <span className="font-bold text-slate-800">มัธยมศึกษาปีที่ 4/1</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">ครูประจำวิชา:</span>
                <span className="font-bold text-slate-800">นางสาวเมทินี ชัยชนะ</span>
              </div>
            </div>
          </div>

          {/* Section 1: Superpower Discovery Card */}
          <div className="bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-slate-50 rounded-2xl p-5 border border-indigo-100 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100/80 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="text-indigo-600" size={18} />
                <h3 className="font-black text-sm text-indigo-950 uppercase tracking-wide">
                  ส่วนที่ 1: การค้นพบสไตล์และพลังพิเศษการเรียนรู้ (Learner Superpower)
                </h3>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${narrative.badgeColor}`}>
                <span>{narrative.emoji}</span>
                <span>{narrative.title}</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
              {narrative.desc}
            </p>

            {/* Modality Affinity Meters */}
            <div className="space-y-2 pt-1">
              <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>สัดส่วนความถนัดในรูปแบบการเรียนรู้ 3 ด้าน (Learning Modality Preference):</span>
                <span className="text-[11px] text-slate-500 font-normal">ประเมินจากพฤติกรรมการทำงานจริง (Telemetry)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {/* Coding Bar */}
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-900 flex items-center gap-1">
                      <span>💻</span> <span>สายเขียนโค้ด (Coding)</span>
                    </span>
                    <span className="font-black text-indigo-600">{affinity.coding}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" 
                      style={{ width: `${affinity.coding}%` }} 
                    />
                  </div>
                </div>

                {/* Conceptual Bar */}
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-purple-900 flex items-center gap-1">
                      <span>✍️</span> <span>สายวิเคราะห์มโนทัศน์</span>
                    </span>
                    <span className="font-black text-purple-600">{affinity.conceptual}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full" 
                      style={{ width: `${affinity.conceptual}%` }} 
                    />
                  </div>
                </div>

                {/* Quiz Bar */}
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-900 flex items-center gap-1">
                      <span>🎯</span> <span>สายทดสอบไว (Quiz)</span>
                    </span>
                    <span className="font-black text-emerald-600">{affinity.quiz}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full" 
                      style={{ width: `${affinity.quiz}%` }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Standards Mastery & Academic Achievement */}
          <div className="border border-slate-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Award className="text-amber-500" size={18} />
                <h3 className="font-black text-sm text-slate-900">
                  ส่วนที่ 2: ผลสัมฤทธิ์ตามตัวชี้วัดมาตรฐานหลักสูตรแกนกลาง (ว 4.2 ม.4/1)
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                ✓ บรรลุตามมาตรฐานกระทรวงศึกษาธิการ
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="sm:col-span-2 space-y-2 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px] block">ตัวชี้วัดที่ประเมิน:</span>
                  <span className="font-bold text-slate-800 text-xs">
                    ว 4.2 ม.4/1: การออกแบบและเขียนโปรแกรมควบคุมแบบวนซ้ำ (Loops) เพื่อแก้ปัญหา
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">เส้นทางที่นักเรียนใช้พิสูจน์ความเข้าใจ (Evidence Pathway):</span>
                  <span className="font-semibold text-indigo-700">
                    {pathway}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed italic bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  "ตามหลักการศึกษาแบบสากล (UDL) นักเรียนได้พิสูจน์ความเข้าใจเรื่องโครงสร้างลูปเทียบกับเกณฑ์ประเมินกลาง 6 คะแนนชุดเดียวกัน ได้ผลสัมฤทธิ์เท่าเทียมกับเพื่อนร่วมชั้นอย่างโปร่งใสและยุติธรรม"
                </p>
              </div>

              {/* Grade Callout */}
              <div className="bg-gradient-to-b from-emerald-50 to-teal-50/50 border border-emerald-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">ระดับผลการเรียน</span>
                <span className="text-3xl font-black text-emerald-600 my-1">เกรด {letterGrade}</span>
                <span className="text-xs font-bold text-emerald-900">{gradeLevel}</span>
                <span className="text-[11px] text-emerald-700 mt-1 font-mono">
                  คะแนนที่ได้: {score.toFixed(1)} / {maxScore.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Positive Learning Telemetry & Grit (ความอึด) */}
          <div className="border border-slate-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <TrendingUp className="text-blue-600" size={18} />
              <h3 className="font-black text-sm text-slate-900">
                ส่วนที่ 3: พฤติกรรมการเรียนรู้เชิงบวกและความมุ่งมั่น (Learning Telemetry & Grit)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[11px] block">ความเร็วในการเริ่มงาน:</span>
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1 mt-0.5">
                  <span>⚡</span> <span>{telemetry.engagementSpeed}</span>
                </span>
                <p className="text-[10px] text-slate-500 mt-1">มีความกระตือรือร้นและพร้อมรับความท้าทายใหม่</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[11px] block">ดัชนีความเพียรพยายาม (Grit):</span>
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1 mt-0.5">
                  <span>🛡️</span> <span>{telemetry.resilienceIndex}</span>
                </span>
                <p className="text-[10px] text-slate-500 mt-1">นำคำแนะนำไปทบทวนและปรับปรุงผลงานอย่างตั้งใจ</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[11px] block">รูปแบบที่ชอบที่สุด:</span>
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1 mt-0.5">
                  <span>⭐</span> <span>{telemetry.preferredModality}</span>
                </span>
                <p className="text-[10px] text-slate-500 mt-1">สร้างผลงานได้มีประสิทธิภาพสูงสุดในบรรยากาศนี้</p>
              </div>
            </div>
          </div>

          {/* Section 4: Parent Coaching Tips */}
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wide">
              <Heart size={16} className="text-amber-600 fill-amber-600" />
              <span>ส่วนที่ 4: คำแนะนำเฉพาะบุคคลสำหรับผู้ปกครองในการสนับสนุนที่บ้าน (Parent Coaching Tips)</span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed font-medium">
              {narrative.homeTip}
            </p>
          </div>

          {/* Section 5: Signatures & Certification */}
          <div className="pt-4 border-t-2 border-slate-900/20">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs">
              <div className="space-y-3">
                <div className="h-10 flex items-end justify-center">
                  <span className="font-serif italic text-sm text-slate-700 font-bold underline">เมทินี ชัยชนะ</span>
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <div className="font-bold text-slate-800">(นางสาวเมทินี ชัยชนะ)</div>
                  <div className="text-[11px] text-slate-500">ครูผู้สอนวิชาวิทยาการคำนวณ</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="h-10 flex items-end justify-center">
                  <span className="font-serif italic text-sm text-slate-700 font-bold underline">ปกรณ์ เจริญรัตน์</span>
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <div className="font-bold text-slate-800">(นายปกรณ์ เจริญรัตน์)</div>
                  <div className="text-[11px] text-slate-500">ครูที่ปรึกษาประจำชั้น ม.4/1</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="h-10 flex items-end justify-center text-slate-400">
                  <span>.......................................................</span>
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <div className="font-bold text-slate-800">(.......................................................)</div>
                  <div className="text-[11px] text-slate-500">ผู้ปกครองลงนามรับทราบ</div>
                </div>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-400 mt-6 print:mt-4">
              เอกสารนี้ออกโดยระบบประเมินผลการเรียนรู้รู้จริง LearnWise Classroom • ข้อมูลถูกต้องตรงตามสารบบ ปพ.5
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
