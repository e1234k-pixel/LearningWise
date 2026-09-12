import { useApp } from "../context/AppDataContext";
import { Sparkles, RotateCcw, GraduationCap, School, ShieldAlert, ChevronDown, ShieldCheck, LogOut } from "lucide-react";
import { formatUserOptionLabel, findMatchingUser } from "../utils/userUtils";

export const RoleSelector = () => {
  const { 
    role, 
    setRole, 
    envelope, 
    resetData, 
    loadSeededClassroom, 
    currentUser, 
    logout, 
    openGoogleModal,
    users
  } = useApp();

  const getRoleLabel = () => {
    if (role.type === "admin") {
      const u = users.find(user => user.id === role.id && user.role === "admin");
      return u?.name || "ผู้ดูแลระบบ";
    }
    if (role.type === "teacher") {
      const u = users.find(user => user.id === role.id && user.role === "teacher");
      return u?.name || "ครูเมย์";
    }
    return envelope.students.find(s => s.id === role.id)?.name || "นักเรียน";
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-purple-100/70 shadow-xs">
      {/* Top Demo Disclaimer & Google Status Banner */}
      <div className="bg-gradient-to-r from-pink-50/80 via-purple-50/70 to-indigo-50/80 border-b border-purple-100/60 px-3 sm:px-6 py-1.5 text-[11px] sm:text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
          <ShieldAlert size={14} className="text-purple-500 shrink-0" />
          <span className="line-clamp-1">
            LearnWise Classroom — ระบบเชื่อมโยง Google Workspace for Education และการประเมินตามมาตรฐาน ว 4.2
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Google SSO Status / Sign-In Button */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/90 border border-purple-100 shadow-2xs text-[11px]">
              <img 
                src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80"} 
                alt={currentUser.name} 
                className="w-4 h-4 rounded-full object-cover"
              />
              <span className="font-semibold text-slate-700 max-w-[120px] truncate">{currentUser.name}</span>
              <span className="text-[10px] text-slate-400 font-mono hidden md:inline">({currentUser.email})</span>
              <button
                onClick={logout}
                className="ml-1 text-slate-400 hover:text-rose-600 cursor-pointer p-0.5"
                title="ออกจากระบบ Google"
              >
                <LogOut size={12} />
              </button>
            </div>
          ) : (
            <button
              onClick={openGoogleModal}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold text-slate-700 bg-white border border-purple-100 hover:bg-purple-50/50 cursor-pointer transition-all shadow-2xs"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>เข้าสู่ระบบ Google</span>
            </button>
          )}

          <button
            onClick={() => {
              if (window.confirm("ต้องการโหลดชุดข้อมูลจำลองห้องเรียน (มีงานส่งแล้ว รอตรวจ ให้แก้ไข และตรวจจบ) หรือไม่?")) {
                loadSeededClassroom();
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold text-purple-700 bg-purple-50/80 border border-purple-200/70 hover:bg-purple-100 cursor-pointer active:scale-95 shadow-2xs"
            title="จำลองสถานะนักเรียน 8 คนในห้องเรียนจริงพร้อมคิวตรวจ"
          >
            <Sparkles size={12} className="text-purple-600 shrink-0" />
            <span>โหลดห้องเรียนจำลอง</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm("ต้องการล้างข้อมูลทั้งหมดแล้วคืนค่าเป็นกระดานว่างเริ่มต้นหรือไม่?")) {
                resetData();
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-rose-600 hover:border-rose-200 cursor-pointer active:scale-95 shadow-2xs"
            title="รีเซ็ตข้อมูลเป็นค่าว่างเปล่า"
          >
            <RotateCcw size={12} className="shrink-0" />
            <span>ล้างค่า</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-indigo-400 via-purple-400 to-pink-400 flex items-center justify-center text-white shadow-md shadow-purple-200/50 ring-2 ring-purple-100 transition-transform duration-300 hover:scale-105">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg text-slate-800 tracking-tight font-sans">LearnWise</span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/70">
                  v1.4 Enterprise
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Google Workspace for Education & Learning Cockpit</p>
            </div>
          </div>

          {/* Active Role Pill for Mobile (Visible only on xs) */}
          <div className="sm:hidden flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
            {getRoleLabel()}
          </div>
        </div>

        {/* Role Switcher Section */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-purple-50/50 p-1 sm:p-1.5 rounded-2xl border border-purple-100/70 w-full sm:w-auto justify-between sm:justify-start overflow-x-auto">
          {/* Quick Switch to Admin */}
          <button
            onClick={() => setRole({ type: "admin", id: "admin-001" })}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none ${
              role.type === "admin"
                ? "bg-white text-purple-700 shadow-xs border border-purple-200/80 scale-[1.02]"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
            title="สลับเป็นผู้ดูแลระบบ (Admin)"
          >
            <ShieldCheck size={15} className={role.type === "admin" ? "text-purple-600" : "text-slate-500"} />
            <span className="whitespace-nowrap">ผู้ดูแลระบบ</span>
          </button>

          {/* Quick Switch to Teacher */}
          <button
            onClick={() => setRole({ type: "teacher", id: "teacher-demo" })}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none ${
              role.type === "teacher"
                ? "bg-white text-indigo-700 shadow-xs border border-indigo-200/80 scale-[1.02]"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
            title="สลับเป็นครูผู้สอน"
          >
            <School size={15} className={role.type === "teacher" ? "text-indigo-600" : "text-slate-500"} />
            <span className="whitespace-nowrap">ครูเมย์</span>
          </button>

          {/* Quick Switch to Student-004 (Ek Hands-on Coder) */}
          <button
            onClick={() => setRole({ type: "student", id: "student-004" })}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${
              role.type === "student" && role.id === "student-004"
                ? "bg-white text-emerald-700 shadow-xs border border-emerald-200/80 scale-[1.02]"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
            title="สลับเป็นน้องเอก (สายเขียนโค้ด)"
          >
            <GraduationCap size={15} className={role.type === "student" && role.id === "student-004" ? "text-emerald-600" : "text-slate-500"} />
            <span className="whitespace-nowrap">น้องเอก</span>
          </button>

          {/* Dropdown for All Users */}
          <div className="relative inline-block text-xs shrink-0 flex-1 sm:flex-initial">
            <select
              className="w-full sm:w-auto appearance-none bg-white text-slate-700 font-medium pl-2.5 pr-7 py-1.5 rounded-xl border border-purple-100 shadow-2xs hover:border-purple-200 hover:bg-purple-50/40 focus:outline-none focus:ring-2 focus:ring-purple-400/30 focus:border-purple-300 text-xs cursor-pointer transition-all"
              value={`${role.type}:${role.id}`}
              onChange={(e) => {
                const [type, id] = e.target.value.split(":");
                setRole({ type: type as "admin" | "teacher" | "student", id });
              }}
            >
              <optgroup label="ผู้ดูแลระบบโรงเรียน (Admin)">
                {users.filter(u => u.role === "admin").length > 0 ? (
                  users.filter(u => u.role === "admin").map((u, idx) => (
                    <option key={u.id} value={`admin:${u.id}`}>
                      {formatUserOptionLabel({
                        icon: "🛡️",
                        name: u.name,
                        id: u.id,
                        role: "admin",
                        schoolId: u.schoolId,
                        user: u,
                        index: idx
                      })}
                    </option>
                  ))
                ) : (
                  <option value="admin:admin-001">🛡️ อ.ดร.สมศักดิ์ นวัตกรรม (SCH-0001) (Admin)</option>
                )}
              </optgroup>
              <optgroup label="ครูผู้สอน">
                {users.filter(u => u.role === "teacher").length > 0 ? (
                  users.filter(u => u.role === "teacher").map((u, idx) => (
                    <option key={u.id} value={`teacher:${u.id}`}>
                      {formatUserOptionLabel({
                        icon: "👩‍🏫",
                        name: u.name,
                        id: u.id,
                        role: "teacher",
                        schoolId: u.schoolId,
                        user: u,
                        index: idx
                      })}
                    </option>
                  ))
                ) : (
                  <option value="teacher:teacher-demo">👩‍🏫 ครูเมย์ ชลธิชา (TCH-0421) (ครูผู้สอน)</option>
                )}
              </optgroup>
              <optgroup label={`นักเรียนห้องครูเมย์ (${envelope.students.length} คน)`}>
                {envelope.students.map((s, idx) => {
                  const matchingUser = findMatchingUser(s, users);
                  return (
                    <option key={s.id} value={`student:${s.id}`}>
                      {formatUserOptionLabel({
                        icon: "🎓",
                        name: s.name,
                        id: s.id,
                        role: "student",
                        schoolId: s.schoolId || matchingUser?.schoolId,
                        user: matchingUser,
                        index: idx
                      })}
                    </option>
                  );
                })}
              </optgroup>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-purple-400">
              <ChevronDown size={13} />
            </div>
          </div>

          {/* Google Sign-in Modal Trigger button */}
          <button
            onClick={openGoogleModal}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-all cursor-pointer shrink-0 shadow-2xs"
            title="เปิดหน้าต่าง Google Workspace Sign-In"
          >
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span className="hidden md:inline">Google Login</span>
          </button>
        </div>
      </div>
    </header>
  );
};
