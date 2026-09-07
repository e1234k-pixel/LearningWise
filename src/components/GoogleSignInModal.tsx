import React, { useState } from "react";
import { useApp } from "../context/AppDataContext";
import { X, ShieldCheck, UserPlus, AlertCircle, ArrowRight } from "lucide-react";
import type { AuthUser } from "../types";

export const GoogleSignInModal: React.FC = () => {
  const { 
    isGoogleModalOpen, 
    closeGoogleModal, 
    loginWithGoogle, 
    users, 
    googleConfig 
  } = useApp();

  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isGoogleModalOpen) return null;

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const emailTrimmed = customEmail.trim().toLowerCase();
    if (!emailTrimmed || !emailTrimmed.includes("@")) {
      setErrorMessage("กรุณากรอกอีเมล Google ที่ถูกต้อง");
      return;
    }

    const domain = emailTrimmed.split("@")[1];
    const isDomainAllowed = googleConfig.allowedDomains.some(d => domain.endsWith(d.toLowerCase()));

    if (googleConfig.enforceDomainRestriction && !isDomainAllowed) {
      setErrorMessage(`อีเมลต้องลงท้ายด้วยโดเมนของโรงเรียน (${googleConfig.allowedDomains.map(d => "@" + d).join(", ")})`);
      return;
    }

    loginWithGoogle({
      email: emailTrimmed,
      name: customName.trim() || emailTrimmed.split("@")[0],
    });
  };

  const getRoleBadge = (role: AuthUser["role"]) => {
    switch (role) {
      case "admin":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">🛡️ ผู้ดูแลระบบ (Admin)</span>;
      case "teacher":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">👩‍🏫 ครูผู้สอน (Teacher)</span>;
      case "student":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">🎓 นักเรียน (Student)</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden text-slate-800 transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          {/* Google 4-Color SVG Logo */}
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span className="font-semibold text-sm text-slate-700">Google Workspace</span>
          </div>

          <button
            onClick={closeGoogleModal}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            title="ปิดหน้าต่าง"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="px-6 py-2">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">เข้าสู่ระบบด้วย Google</h2>
          <p className="text-xs text-slate-500 mt-1">
            เลือกบัญชีเพื่อเข้าใช้งานแพลตฟอร์ม <span className="font-semibold text-blue-600">LearnWise Classroom</span>
          </p>

          {/* School Domain Verification Pill */}
          <div className="mt-3.5 mb-4 flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-[11px] text-blue-900">
            <ShieldCheck size={16} className="text-blue-600 shrink-0" />
            <div className="flex-1">
              <span className="font-medium">โดเมนที่ได้รับอนุญาต:</span>{" "}
              <span className="font-mono font-semibold text-blue-700">
                {googleConfig.allowedDomains.map(d => "@" + d).join(", ")}
              </span>
            </div>
          </div>

          {/* Account Selector List */}
          {!showCustomForm ? (
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {users.slice(0, 6).map((u) => (
                <button
                  key={u.id}
                  onClick={() => loginWithGoogle(u)}
                  className="w-full flex items-center justify-between p-2.5 rounded-2xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50/40 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={u.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80"}
                      alt={u.name}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 group-hover:ring-blue-400 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-slate-900 truncate group-hover:text-blue-600">
                        {u.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate font-mono">
                        {u.email}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 ml-2">
                    {getRoleBadge(u.role)}
                  </div>
                </button>
              ))}

              {/* Use Another Account Button */}
              <button
                onClick={() => setShowCustomForm(true)}
                className="w-full mt-2 flex items-center gap-3 p-3 rounded-2xl border border-dashed border-slate-300 hover:border-blue-400 hover:bg-slate-50 transition-all text-xs font-semibold text-slate-700 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                  <UserPlus size={16} />
                </div>
                <span>ใช้บัญชี Google อื่น (กรอกอีเมล)</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleCustomLogin} className="space-y-3 py-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  อีเมล Google ของโรงเรียน
                </label>
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="เช่น student01@school.ac.th"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อ-นามสกุล (ไม่บังคับ)
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="เช่น นายธนากร สุขใจ"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>

              {errorMessage && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomForm(false);
                    setErrorMessage(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                >
                  ย้อนกลับ
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  <span>เข้าสู่ระบบ</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-4 px-6 py-3.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Google Workspace for Education</span>
          <div className="flex items-center gap-3">
            <span className="hover:underline cursor-pointer">ความเป็นส่วนตัว</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">ข้อกำหนด</span>
          </div>
        </div>
      </div>
    </div>
  );
};
