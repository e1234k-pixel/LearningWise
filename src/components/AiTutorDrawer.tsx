import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppDataContext";
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Check, 
  Code, 
  Lightbulb, 
  Bug, 
  BookOpen, 
  HelpCircle, 
  ArrowRight, 
  Zap,
  Minimize2,
  Trash2
} from "lucide-react";
import { askGeminiAiTutor, type AiRequestContext } from "../services/aiTutorService";
import type { AiChatMessage } from "../types";

export interface AiTutorDrawerProps {
  activeMissionId?: string;
}

export const AiTutorDrawer: React.FC<AiTutorDrawerProps> = ({ activeMissionId }) => {
  const { 
    role, 
    envelope, 
    aiTutorConfig, 
    isAiDrawerOpen, 
    closeAiDrawer, 
    openAiDrawer, 
    initialAiPrompt 
  } = useApp();

  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: "welcome-1",
      sender: "assistant",
      text: "สวัสดีครับ! ครูคือ **AI Tutor** ผู้ช่วยประจำวิชาวิทยาการคำนวณ 1 🤖✨\n\nมีคำถามเกี่ยวกับโจทย์ ออกแบบขั้นตอนวิธี หรืออยากให้ช่วยดูจุดที่โค้ดติดขัด บอกครูได้เลยนะ! (ครูจะช่วยชี้แนะและให้คำใบ้โดยไม่สปอยคำตอบครับ)",
      timestamp: new Date().toISOString(),
      modelUsed: aiTutorConfig.model || "gemini-2.5-flash",
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const studentId = role.type === "student" ? role.id : "";
  const currentStudent = envelope.students.find(s => s.id === studentId);

  // หาภารกิจและแบบร่างที่นักเรียนกำลังทำอยู่
  const activeMission = (activeMissionId ? envelope.missions.find(m => m.id === activeMissionId) : null)
    || (envelope.drafts.find(d => d.studentId === studentId) ? envelope.missions.find(m => m.id === envelope.drafts.find(d => d.studentId === studentId)?.missionId) : null)
    || envelope.missions[0];

  const activeDraft = envelope.drafts.find(d => d.studentId === studentId && d.missionId === activeMission?.id);

  // เลื่อนจอลงด้านล่างอัตโนมัติเมื่อมีข้อความใหม่
  useEffect(() => {
    if (isAiDrawerOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAiDrawerOpen]);

  // หากมีการส่ง initialAiPrompt เข้ามาเมื่อเปิด Drawer
  useEffect(() => {
    if (initialAiPrompt && isAiDrawerOpen) {
      handleSendMessage(initialAiPrompt);
    }
  }, [initialAiPrompt, isAiDrawerOpen]);

  // ซ่อน Floating button หากไม่ใช่ Role นักเรียน หรือถูกปิดระบบ
  if (role.type !== "student" || !aiTutorConfig.enabled) {
    return null;
  }

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isLoading) return;

    const userMessage: AiChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    if (!customText) setInputText("");
    setIsLoading(true);

    // เตรียมบริบทงานปัจจุบันของนักเรียน
    const context: AiRequestContext = {
      mission: activeMission,
      draftContent: activeDraft?.content || "",
      studentName: currentStudent?.name || "นักเรียน",
      persona: currentStudent?.learnerProfile?.persona,
      rubric: activeMission?.config?.rubric,
    };

    try {
      const result = await askGeminiAiTutor(newHistory, context, aiTutorConfig);
      const aiReply: AiChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "assistant",
        text: result.text,
        timestamp: new Date().toISOString(),
        modelUsed: result.modelUsed,
      };
      setMessages([...newHistory, aiReply]);
    } catch (err: any) {
      const errorReply: AiChatMessage = {
        id: `err-${Date.now()}`,
        sender: "assistant",
        text: `ขออภัยครับ เกิดข้อผิดพลาดในการประมวลผลคำตอบ: ${err.message || String(err)}`,
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages([...newHistory, errorReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const clearChat = () => {
    if (window.confirm("ต้องการล้างประวัติการสนทนากับ AI Tutor หรือไม่?")) {
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          sender: "assistant",
          text: "เริ่มการสนทนาใหม่แล้วครับ! มีข้อสงสัยหรืออยากให้ครูช่วยชี้แนะตรงไหน ถามมาได้เลยครับ ✨",
          timestamp: new Date().toISOString(),
          modelUsed: aiTutorConfig.model || "gemini-2.5-flash",
        }
      ]);
    }
  };

  // เรนเดอร์ข้อความพร้อมโค้ดบล็อก
  const renderMessageContent = (text: string, msgId: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const lines = part.slice(3, -3).trim().split("\n");
        const firstLine = lines[0].trim();
        const hasLang = /^[a-zA-Z0-9_-]+$/.test(firstLine);
        const language = hasLang ? firstLine : "python";
        const codeContent = hasLang ? lines.slice(1).join("\n") : lines.join("\n");
        const codeId = `${msgId}-code-${index}`;

        return (
          <div key={index} className="my-2 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900 text-slate-100 text-xs font-mono">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/90 border-b border-slate-700/70 text-[11px] text-slate-300">
              <span className="font-semibold text-blue-400">{language}</span>
              <button
                type="button"
                onClick={() => handleCopyCode(codeContent, codeId)}
                className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-white cursor-pointer transition-colors"
              >
                {copiedCodeId === codeId ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                <span>{copiedCodeId === codeId ? "คัดลอกแล้ว" : "คัดลอก"}</span>
              </button>
            </div>
            <pre className="p-3 overflow-x-auto text-[11px] leading-relaxed text-slate-100">
              <code>{codeContent}</code>
            </pre>
          </div>
        );
      }

      // ธรรมดา: แปลง bold ** และ bullet points
      const formattedLines = part.split("\n").map((line, lIdx) => {
        // หัวข้อหรือตัวหนา
        let renderedLine: React.ReactNode = line;
        if (line.startsWith("- ") || line.startsWith("* ")) {
          renderedLine = <span className="pl-1 block">• {line.substring(2)}</span>;
        }

        return (
          <React.Fragment key={lIdx}>
            {renderedLine}
            {lIdx < part.split("\n").length - 1 && <br />}
          </React.Fragment>
        );
      });

      return <span key={index}>{formattedLines}</span>;
    });
  };

  return (
    <>
      {/* 1. Floating Action Trigger Button (มุมขวาล่าง) */}
      {!isAiDrawerOpen && (
        <button
          onClick={() => openAiDrawer()}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl shadow-blue-500/30 border-2 border-white/60 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer group"
          title="เปิดห้องแชท AI Tutor ผู้ช่วยเรียนรู้"
        >
          <div className="relative">
            <Bot size={22} className="animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white"></span>
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold leading-none flex items-center gap-1">
              <span>AI Tutor</span>
              <Sparkles size={12} className="text-amber-300" />
            </div>
            <div className="text-[10px] text-blue-100 font-medium leading-tight">
              {aiTutorConfig.apiKey ? "Gemini 2.5 Flash" : "ครูผู้ช่วยจำลอง"}
            </div>
          </div>
        </button>
      )}

      {/* 2. Slide-out Drawer / Chat Window */}
      {isAiDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:pr-6 pointer-events-none animate-in fade-in duration-200">
          <div 
            className="w-full sm:w-[460px] h-[85vh] sm:h-[650px] max-h-[92vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 pointer-events-auto flex flex-col overflow-hidden text-slate-800 transition-all duration-200"
          >
            {/* Drawer Top Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-xs">
                  <Bot size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs">LearnWise AI Tutor</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      LIVE
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <span>{aiTutorConfig.apiKey ? (aiTutorConfig.model || "gemini-2.5-flash") : "Socratic Mode (Offline)"}</span>
                    <span>•</span>
                    <span className="capitalize">{aiTutorConfig.teachingStyle}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={clearChat}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title="ล้างประวัติการสนทนา"
                >
                  <Trash2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={closeAiDrawer}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title="ย่อหน้าต่าง"
                >
                  <Minimize2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={closeAiDrawer}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title="ปิดหน้าต่าง"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Context Notice Pill */}
            {activeMission && (
              <div className="px-3.5 py-1.5 bg-blue-50/80 border-b border-blue-100 flex items-center justify-between text-[11px] text-blue-900 shrink-0">
                <div className="flex items-center gap-1.5 truncate">
                  <BookOpen size={13} className="text-blue-600 shrink-0" />
                  <span className="font-medium">ภารกิจ:</span>
                  <span className="font-bold truncate">{activeMission.title}</span>
                </div>
                {currentStudent?.learnerProfile && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-200/80 font-semibold text-blue-800 shrink-0">
                    {currentStudent.learnerProfile.persona}
                  </span>
                )}
              </div>
            )}

            {/* Quick Prompt Starters */}
            <div className="px-3 py-2 bg-slate-50/90 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0 no-scrollbar">
              <button
                type="button"
                onClick={() => handleSendMessage("ช่วยอธิบายโจทย์และแนวคิดของงานนี้ให้เข้าใจง่ายๆ หน่อยครับ")}
                disabled={isLoading}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 whitespace-nowrap cursor-pointer transition-colors shadow-2xs active:scale-95 disabled:opacity-50"
              >
                <Lightbulb size={12} className="text-amber-500" />
                <span>อธิบายโจทย์</span>
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage("ช่วยดูโค้ดที่ฉันเขียนอยู่หน่อยว่ามีจุดติดขัดตรงไหน (ขอคำใบ้ อย่าเพิ่งเฉลยนะ)")}
                disabled={isLoading}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 whitespace-nowrap cursor-pointer transition-colors shadow-2xs active:scale-95 disabled:opacity-50"
              >
                <Bug size={12} className="text-rose-500" />
                <span>ขอคำใบ้โค้ด</span>
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage("ช่วยตรวจทานตามเกณฑ์รูบริกว่าผลงานของฉันครบถ้วนหรือยัง")}
                disabled={isLoading}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 whitespace-nowrap cursor-pointer transition-colors shadow-2xs active:scale-95 disabled:opacity-50"
              >
                <Check size={12} className="text-emerald-500" />
                <span>ตรวจตามรูบริก</span>
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage("ช่วยยกตัวอย่างกรณีทดสอบ (Test Case) เพิ่มเติมให้หน่อย")}
                disabled={isLoading}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 whitespace-nowrap cursor-pointer transition-colors shadow-2xs active:scale-95 disabled:opacity-50"
              >
                <Code size={12} className="text-purple-500" />
                <span>ตัวอย่าง Test Case</span>
              </button>
            </div>

            {/* Message Chat Scroll Area */}
            <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs bg-slate-50/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.sender === "assistant" && (
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs mt-0.5">
                      <Bot size={15} />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3 shadow-xs ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white rounded-tr-xs"
                        : msg.isError
                        ? "bg-rose-50 border border-rose-200 text-rose-800 rounded-tl-xs"
                        : "bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs"
                    }`}
                  >
                    <div className="leading-relaxed font-sans break-words">
                      {renderMessageContent(msg.text, msg.id)}
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-1.5 pt-1 border-t border-slate-100/50 text-[9px] opacity-75">
                      <span>{new Date(msg.timestamp).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}</span>
                      {msg.sender === "assistant" && msg.modelUsed && (
                        <span className="font-mono">{msg.modelUsed}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing / Loading Spinner */}
              {isLoading && (
                <div className="flex items-center gap-2 text-slate-500 text-xs pl-2">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                    <RefreshCw size={14} className="animate-spin" />
                  </div>
                  <div className="p-2.5 rounded-2xl bg-white border border-slate-200 text-[11px] font-medium text-slate-600 flex items-center gap-1.5 shadow-xs">
                    <span>AI Tutor กำลังคิดและวิเคราะห์แนวคิด...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-white border-t border-slate-200 shrink-0 space-y-1.5"
            >
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="พิมพ์ถามแนวคิด หรือขอคำใบ้จาก AI Tutor..."
                  disabled={isLoading}
                  className="w-full pl-3.5 pr-12 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  className="absolute right-1.5 p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-all active:scale-95 disabled:opacity-40"
                  title="ส่งข้อความ"
                >
                  <Send size={14} />
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                <span>⚡ ขับเคลื่อนด้วย Google Gemini API (Socratic Method)</span>
                <span className="hidden sm:inline">ว 4.2 ม.4 • LearnWise</span>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
