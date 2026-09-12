import { useState } from "react";
import { useApp } from "../context/AppDataContext";
import { X, Plus, BookOpen, Code, HelpCircle, Check, Users } from "lucide-react";
import type { Mission, MissionType } from "../types";
import { CHULA_EXERCISE_PRESETS, ChulaExercisePreset } from "../data/chulaExercises";
import { getCleanStudentId, isGoogleAccount, findMatchingUser } from "../utils/userUtils";

export const AssignmentCreatorModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { envelope, createMission, users } = useApp();

  const [type, setType] = useState<MissionType>("short-answer");
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("ลูป Python");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState(15);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  });
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(envelope.students.map(s => s.id));
  const [starterCode, setStarterCode] = useState("def my_solution():\n    # เขียนโค้ดที่นี่\n    pass\n");
  const [isUdlChoice, setIsUdlChoice] = useState(false);
  const [calibrationStep, setCalibrationStep] = useState<0 | 1 | 2 | 3>(3);
  const [simulationNotice, setSimulationNotice] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("");
  const [presetCategoryFilter, setPresetCategoryFilter] = useState<"all" | "coding" | "short-answer" | "quiz">("all");

  if (!isOpen) return null;

  const handleToggleStudent = (id: string) => {
    if (selectedStudentIds.includes(id)) {
      if (selectedStudentIds.length === 1) {
        alert("ต้องมอบหมายให้นักเรียนอย่างน้อย 1 คน");
        return;
      }
      setSelectedStudentIds(selectedStudentIds.filter(s => s !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const handleSelectAllStudents = () => {
    if (selectedStudentIds.length === envelope.students.length) {
      setSelectedStudentIds([envelope.students[0].id]);
    } else {
      setSelectedStudentIds(envelope.students.map(s => s.id));
    }
  };

  const handleAutoAssignByPersona = () => {
    if (calibrationStep < 3) {
      setSimulationNotice(`⚠️ ยังไม่สามารถ Auto-Assign ได้: ระบบต้องการหลักฐาน 3 ชิ้นงานเพื่อสอบทานก่อน (ขณะนี้มีเพียง ${calibrationStep}/3 ชิ้นงาน) กรุณาเลือกนักเรียนด้วยตนเอง หรือคลิกจำลองระดับ 3/3 ชิ้นงานด้านบน`);
      return;
    }
    setSimulationNotice(null);
    let matchedIds: string[] = [];
    if (type === "coding") {
      matchedIds = envelope.students
        .filter(s => s.learnerProfile?.persona === "Hands-on Coder")
        .map(s => s.id);
    } else if (type === "short-answer") {
      matchedIds = envelope.students
        .filter(s => s.learnerProfile?.persona === "Conceptual Explainer" || s.learnerProfile?.persona === "Resilient Improver")
        .map(s => s.id);
    } else if (type === "quiz") {
      matchedIds = envelope.students
        .filter(s => s.learnerProfile?.persona === "Fast Explorer" || s.learnerProfile?.persona === "Balanced Learner")
        .map(s => s.id);
    }

    if (matchedIds.length === 0) {
      matchedIds = envelope.students.map(s => s.id);
    }
    setSelectedStudentIds(matchedIds);
  };

  const filteredPresets = CHULA_EXERCISE_PRESETS.filter(p => {
    if (presetCategoryFilter === "all") return true;
    return p.type === presetCategoryFilter;
  });

  const handleSelectPreset = (preset: ChulaExercisePreset) => {
    setSelectedPresetId(preset.id);
    setType(preset.type);
    setTitle(preset.title);
    setTopic(preset.topic);
    setDescription(preset.description);
    setInstructions(preset.instructions);
    setEstimatedMinutes(preset.estimatedMinutes);
    if (preset.starterCode) {
      setStarterCode(preset.starterCode);
    }
    // Auto-select students matching the recommended persona
    let matchedIds = envelope.students
      .filter(s => s.learnerProfile?.persona === preset.recommendedPersona)
      .map(s => s.id);
    if (matchedIds.length === 0) {
      matchedIds = envelope.students.map(s => s.id);
    }
    setSelectedStudentIds(matchedIds);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("กรุณาระบุชื่องาน (1-80 ตัวอักษร)");
      return;
    }
    if (!instructions.trim()) {
      alert("กรุณาระบุคำชี้แจงหรือโจทย์");
      return;
    }
    if (selectedStudentIds.length === 0) {
      alert("กรุณาเลือกนักเรียนผู้รับมอบหมายอย่างน้อย 1 คน");
      return;
    }

    const newMissionId = `mission-${type === "coding" ? "code" : type === "quiz" ? "quiz" : "sa"}-${Date.now()}`;
    const activePreset = CHULA_EXERCISE_PRESETS.find(p => p.id === selectedPresetId);

    const newMission: Mission = {
      id: newMissionId,
      type,
      title: title.trim(),
      topic: topic.trim(),
      objectiveIds: ["custom-objective"],
      description: description.trim() || title.trim(),
      instructions: instructions.trim(),
      estimatedMinutes: Number(estimatedMinutes) || 15,
      dueDate,
      status: "published",
      targetStudentIds: selectedStudentIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      config: {
        prompt: title.trim(),
        minLength: type === "short-answer" ? 10 : undefined,
        maxLength: 2000,
        language: type === "coding" ? "python" : undefined,
        starterCode: type === "coding" ? starterCode : undefined,
        inputConstraints: activePreset?.inputConstraints,
        examples: activePreset?.examples,
        passPercent: type === "quiz" ? 80 : undefined,
        questions: activePreset?.questions,
        rubric: activePreset?.rubric || {
          criteria: [
            {
              id: "c1",
              label: "A. ความถูกต้องของผลลัพธ์",
              maxPoints: 2,
              levels: {
                "0": "ผลลัพธ์ไม่ถูกต้อง หรือไม่ได้คำตอบตามโจทย์",
                "1": "ถูกต้องบางส่วน แต่ยังมีจุดผิดพลาด",
                "2": "ถูกต้องสมบูรณ์ตามโจทย์กำหนด"
              }
            },
            {
              id: "c2",
              label: "B. โครงสร้างและหลักการ",
              maxPoints: 2,
              levels: {
                "0": "โครงสร้างไม่ถูกต้อง",
                "1": "โครงสร้างถูกต้องบางส่วน",
                "2": "โครงสร้างและตรรกะถูกต้องชัดเจน"
              }
            },
            {
              id: "c3",
              label: "C. การอธิบายและตรวจสอบ",
              maxPoints: 2,
              levels: {
                "0": "ไม่อธิบาย",
                "1": "อธิบายไม่ครบถ้วน",
                "2": "อธิบายเหตุผลและตรวจสอบคำตอบชัดเจน"
              }
            }
          ],
          passRawPoints: 5,
          requiredFullScoreCriterionIds: ["c1"]
        }
      }
    };

    createMission(newMission);
    alert(`สร้างภารกิจ "${title.trim()}" สำเร็จและมอบหมายให้นักเรียน ${selectedStudentIds.length} คนเรียบร้อยแล้ว!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Plus size={18} />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900">สร้างภารกิจการเรียนรู้ใหม่</h2>
              <p className="text-xs text-slate-500">กำหนดโจทย์ เกณฑ์ประเมิน และมอบหมายนักเรียน</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
          {/* Preset Library from Chula Engineering Python Textbook */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-indigo-50/50 to-blue-50 border border-indigo-100 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100/80 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
                  📚
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                    <span>คลังโจทย์แบบฝึกหัดคอมพิวเตอร์ จุฬาฯ (Chula Exercise Presets)</span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded-full">
                      รศ. ดร. สมชาย
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    คลิกเลือกโจทย์สำเร็จรูปเพื่อกรอกข้อมูล คำชี้แจง โค้ดตั้งต้น และจัดกลุ่ม Persona ให้อัตโนมัติ 1 คลิก
                  </p>
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-1 shrink-0 text-xs">
                <button
                  type="button"
                  onClick={() => setPresetCategoryFilter("all")}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                    presetCategoryFilter === "all" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  ทั้งหมด ({CHULA_EXERCISE_PRESETS.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPresetCategoryFilter("coding")}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                    presetCategoryFilter === "coding" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  💻 โค้ด
                </button>
                <button
                  type="button"
                  onClick={() => setPresetCategoryFilter("short-answer")}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                    presetCategoryFilter === "short-answer" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  ✍️ มโนทัศน์
                </button>
                <button
                  type="button"
                  onClick={() => setPresetCategoryFilter("quiz")}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                    presetCategoryFilter === "quiz" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  🎯 ควิซ
                </button>
              </div>
            </div>

            {/* Presets Horizontal / Grid Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {filteredPresets.map(preset => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? "bg-white border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs"
                        : "bg-white/80 border-slate-200 hover:bg-white hover:border-indigo-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 w-full">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                          {preset.code}
                        </span>
                        <span className="font-bold text-xs text-slate-900 line-clamp-1">
                          {preset.title.split(": ")[1] || preset.title}
                        </span>
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                        preset.type === "coding"
                          ? "bg-blue-100 text-blue-800"
                          : preset.type === "short-answer"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {preset.type === "coding" ? "💻 Code" : preset.type === "short-answer" ? "✍️ Concept" : "🎯 Quiz"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between w-full text-[10px] text-slate-500">
                      <span className="line-clamp-1">{preset.topic}</span>
                      <span className="font-semibold text-indigo-600 shrink-0">{preset.badgeLabel}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedPresetId && (
              <div className="text-[11px] text-emerald-800 font-semibold flex items-center justify-between bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <span>✓ นำเข้าข้อมูลโจทย์และเลือกกลุ่มนักเรียนสาย {CHULA_EXERCISE_PRESETS.find(p => p.id === selectedPresetId)?.recommendedPersona} เรียบร้อยแล้ว</span>
                <button
                  type="button"
                  onClick={() => setSelectedPresetId("")}
                  className="text-[10px] text-slate-500 hover:text-slate-800 underline ml-2"
                >
                  ล้างค่า
                </button>
              </div>
            )}
          </div>

          {/* Mission Type Picker */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800">ประเภทงาน (Mission Type):</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setType("short-answer")}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition cursor-pointer ${
                  type === "short-answer" 
                    ? "bg-blue-50 border-blue-500 text-blue-900 font-bold ring-2 ring-blue-500/20" 
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <BookOpen size={18} className={type === "short-answer" ? "text-blue-600" : "text-slate-400"} />
                <span>คำตอบสั้น (Short Answer)</span>
              </button>

              <button
                type="button"
                onClick={() => setType("coding")}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition cursor-pointer ${
                  type === "coding" 
                    ? "bg-indigo-50 border-indigo-500 text-indigo-900 font-bold ring-2 ring-indigo-500/20" 
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Code size={18} className={type === "coding" ? "text-indigo-600" : "text-slate-400"} />
                <span>เขียนโค้ด (Coding)</span>
              </button>

              <button
                type="button"
                onClick={() => setType("quiz")}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition cursor-pointer ${
                  type === "quiz" 
                    ? "bg-purple-50 border-purple-500 text-purple-900 font-bold ring-2 ring-purple-500/20" 
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <HelpCircle size={18} className={type === "quiz" ? "text-purple-600" : "text-slate-400"} />
                <span>แบบทดสอบ (Quiz)</span>
              </button>
            </div>
          </div>

          {/* UDL Multi-Modal Choice Mode Banner */}
          <div className="p-3.5 bg-gradient-to-r from-indigo-50/80 via-purple-50/60 to-blue-50/60 border border-indigo-200/80 rounded-2xl flex items-start gap-3 shadow-2xs">
            <input
              type="checkbox"
              id="udl-toggle"
              checked={isUdlChoice}
              onChange={(e) => setIsUdlChoice(e.target.checked)}
              className="mt-1 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="udl-toggle" className="cursor-pointer text-xs space-y-0.5">
              <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                <span>🌟 เปิดโหมด UDL Multi-Modal Choice (ผู้เรียนเลือกวิธีพิสูจน์ความเข้าใจเอง)</span>
                <span className="text-[10px] bg-indigo-200/80 text-indigo-900 font-black px-2 py-0.5 rounded-full">UDL Principle</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                วัตถุประสงค์การเรียนรู้เดียวกัน แต่อนุญาตให้นักเรียนเลือกส่งหลักฐานตามสไตล์ที่ถนัด (สายโค้ดเลือก Coding, สายอธิบายเลือก Short Answer, สายวัดผลเร็วเลือก Quiz) เพื่อตอบโจทย์ความแตกต่างระหว่างบุคคล
              </p>
            </label>
          </div>

          {/* Title & Topic */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-bold text-slate-800">ชื่องาน (1-80 ตัวอักษร): *</label>
              <input
                type="text"
                required
                maxLength={80}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น วิเคราะห์ลูป while หรือเขียนฟังก์ชันหาเลขคู่..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs sm:text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800">หมวดหมู่/หัวข้อ:</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs sm:text-sm"
              >
                <option value="ลูป Python">ลูป Python</option>
                <option value="ฟังก์ชันและการคืนค่า">ฟังก์ชันและการคืนค่า</option>
                <option value="เงื่อนไข if-else">เงื่อนไข if-else</option>
                <option value="รายการและ List">รายการและ List</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800">คำอธิบายย่อ:</label>
            <input
              type="text"
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="สรุปสั้นๆ ว่างานนี้ต้องการให้นักเรียนเข้าใจสิ่งใด..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs sm:text-sm"
            />
          </div>

          {/* Instructions / Problem Prompt */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800">คำชี้แจงและโจทย์ (Prompt): *</label>
            <textarea
              required
              rows={4}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="ระบุโจทย์ เงื่อนไข และสิ่งที่ต้องการให้นักเรียนตอบหรือเขียน..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs sm:text-sm leading-relaxed"
            />
          </div>

          {/* Starter code if coding */}
          {type === "coding" && (
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800">โค้ดตั้งต้น (Starter Code):</label>
              <textarea
                rows={4}
                value={starterCode}
                onChange={(e) => setStarterCode(e.target.value)}
                className="w-full p-2.5 bg-slate-950 text-emerald-300 font-mono text-xs rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          )}

          {/* Estimates & Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800">เวลาคาดการณ์ (นาที):</label>
              <input
                type="number"
                min={5}
                max={180}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs sm:text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800">กำหนดส่ง (Due Date):</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Target Students Assignment with Smart Dispatch */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            {/* Profile Calibration Status Bar & Interactive Simulation Stepper */}
            <div className={`p-4 rounded-2xl border transition-all space-y-3 text-xs ${
              calibrationStep === 3
                ? "bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-emerald-300 shadow-2xs"
                : calibrationStep === 2
                ? "bg-gradient-to-r from-blue-50 to-white border-blue-300 shadow-2xs"
                : calibrationStep === 1
                ? "bg-gradient-to-r from-amber-50 to-white border-amber-300 shadow-2xs"
                : "bg-gradient-to-r from-slate-100 to-white border-slate-300 shadow-2xs"
            }`}>
              {/* Stepper Controls for Committee Demo */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/5 pb-2.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <span>🎯 ระบบสอบทานข้อมูล 3 เส้า (Triangulation Calibration):</span>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-500 mr-1">จำลองให้กรรมการดู:</span>
                  <button
                    type="button"
                    onClick={() => { setCalibrationStep(0); setSimulationNotice(null); }}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold transition cursor-pointer ${
                      calibrationStep === 0 ? "bg-slate-800 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    0/3 งาน (0%)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCalibrationStep(1); setSimulationNotice(null); }}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold transition cursor-pointer ${
                      calibrationStep === 1 ? "bg-amber-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    1/3 งาน (33%)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCalibrationStep(2); setSimulationNotice(null); }}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold transition cursor-pointer ${
                      calibrationStep === 2 ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    2/3 งาน (67%)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCalibrationStep(3); setSimulationNotice(null); }}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold transition cursor-pointer ${
                      calibrationStep === 3 ? "bg-emerald-600 text-white shadow-xs" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    ⭐ 3/3 งาน (100% สมบูรณ์)
                  </button>
                </div>
              </div>

              {/* Progress Bar & Status Text */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-700">
                    {calibrationStep === 0 && "🔴 สัปดาห์แรก (0/3 ชิ้นงาน): ยังไม่มีข้อมูลร่องรอยการเรียนรู้"}
                    {calibrationStep === 1 && "🟡 สัปดาห์ที่ 1 ปลาย (1/3 ชิ้นงาน): ผ่าน Diagnostic Quiz เริ่มตรวจจับความเร็วคิด"}
                    {calibrationStep === 2 && "🔵 สัปดาห์ที่ 2 (2/3 ชิ้นงาน): ผ่าน Short Answer ยืนยันความเข้าใจมโนทัศน์"}
                    {calibrationStep === 3 && "🟢 สัปดาห์ที่ 3 (3/3 ชิ้นงาน): สามเส้าครบถ้วน (Quiz + Concept + Code) ล็อคความแม่นยำ 100%"}
                  </span>
                  <span className="font-bold text-slate-900">
                    {calibrationStep === 0 ? "ความมั่นใจ 0%" : calibrationStep === 1 ? "ความมั่นใจ 33%" : calibrationStep === 2 ? "ความมั่นใจ 67%" : "ความมั่นใจ 100%"}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      calibrationStep === 3 ? "bg-emerald-500" : calibrationStep === 2 ? "bg-blue-500" : calibrationStep === 1 ? "bg-amber-500" : "bg-slate-300"
                    }`}
                    style={{ width: `${(calibrationStep / 3) * 100}%` }}
                  />
                </div>
              </div>

              {/* Dispatch Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <div className="text-[11px] text-slate-600">
                  {calibrationStep === 3 ? (
                    <span className="text-emerald-800 font-medium">✓ ระบบพร้อมจัดสรรงานเฉพาะทางแบบ 1-Click โดยไม่สร้างภาระให้ครู</span>
                  ) : (
                    <span className="text-amber-800 font-medium">⚠️ ระบบล็อคไว้ ไม่สุ่มสี่สุ่มห้าจัดสรรงานจนกว่าจะได้หลักฐานครบ 3 ชิ้น</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAutoAssignByPersona}
                  disabled={calibrationStep < 3}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-bold rounded-lg text-xs transition-all self-start sm:self-auto ${
                    calibrationStep === 3
                      ? "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-xs hover:shadow cursor-pointer active:scale-95"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
                  }`}
                  title={calibrationStep === 3 ? "ระบบจะเลือกเฉพาะนักเรียนที่มีสไตล์ตรงกับประเภทงานนี้ให้อัตโนมัติ" : "ต้องครบ 3 ชิ้นงานก่อน"}
                >
                  <span>{calibrationStep === 3 ? "🪄 จัดสรรอัตโนมัติตาม Persona" : "🔒 ล็อคระบบ (ต้องครบ 3 ชิ้นงาน)"}</span>
                </button>
              </div>

              {/* Notice if attempted to click when locked */}
              {simulationNotice && (
                <div className="p-2.5 bg-amber-100 text-amber-900 rounded-lg text-[11px] font-medium border border-amber-200 animate-fadeIn">
                  {simulationNotice}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <Users size={14} className="text-slate-500" />
                <span>มอบหมายให้นักเรียน ({selectedStudentIds.length} จาก {envelope.students.length} คน):</span>
              </label>
              <button
                type="button"
                onClick={handleSelectAllStudents}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
              >
                {selectedStudentIds.length === envelope.students.length ? "ล้างการเลือก" : "เลือกทุกคนทั้งห้อง"}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {envelope.students.map((s, idx) => {
                const isSelected = selectedStudentIds.includes(s.id);
                const persona = s.learnerProfile?.persona;
                const matchingUser = findMatchingUser(s, users);
                const cleanId = getCleanStudentId(s, idx, matchingUser);
                const isGoogle = isGoogleAccount(matchingUser, s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleToggleStudent(s.id)}
                    className={`p-2.5 rounded-xl text-xs flex flex-col items-start gap-1 border transition cursor-pointer text-left ${
                      isSelected 
                        ? "bg-blue-50 border-blue-400 text-blue-900 font-bold ring-2 ring-blue-400/20 shadow-2xs" 
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold truncate">{s.name}</span>
                      {isSelected && <Check size={13} className="text-blue-600 shrink-0" />}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-mono">{cleanId}</span>
                      {persona ? (
                        <span className="text-[10px] text-slate-500 font-normal">
                          {persona === "Hands-on Coder" ? "💻 Coder" :
                           persona === "Conceptual Explainer" ? "✍️ Explainer" :
                           persona === "Fast Explorer" ? "🎯 Explorer" :
                           persona === "Resilient Improver" ? "🔄 Improver" : "⚖️ Balanced"}
                        </span>
                      ) : isGoogle ? (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-600 border border-blue-200 font-medium font-sans">
                          Google
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-600 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition cursor-pointer"
            >
              บันทึกและมอบหมายงาน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
