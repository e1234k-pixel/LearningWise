import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppDataContext";
import { 
  ShieldCheck, 
  Users, 
  FileText, 
  School, 
  Search, 
  UserPlus, 
  Lock, 
  Unlock, 
  RefreshCw, 
  Download, 
  Globe, 
  Sliders 
} from "lucide-react";
import { LamborghiniArcGauge } from "../components/cockpit/LamborghiniGauge";
import type { RoleType, AuditLogEntry } from "../types";

export const AdminDashboard: React.FC = () => {
  const { 
    users, 
    updateUserRole, 
    toggleUserStatus, 
    addUser, 
    googleConfig, 
    updateGoogleConfig, 
    auditLogs, 
    loadSeededClassroom
  } = useApp();

  const [activeTab, setActiveTab] = useState<"users" | "google" | "audit" | "classes">("users");

  // User Management Filters & Modals
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<RoleType>("student");
  const [newUserDept, setNewUserDept] = useState("");
  const [newUserSchoolId, setNewUserSchoolId] = useState("");

  // Audit Logs Filter
  const [auditCategoryFilter, setAuditCategoryFilter] = useState<string>("all");

  // Domain Config State
  const [newDomainInput, setNewDomainInput] = useState("");

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.schoolId && u.schoolId.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, searchQuery, roleFilter]);

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter(log => {
      return auditCategoryFilter === "all" || log.category === auditCategoryFilter;
    });
  }, [auditLogs, auditCategoryFilter]);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    addUser({
      name: newUserName.trim(),
      email: newUserEmail.trim().toLowerCase(),
      role: newUserRole,
      department: newUserDept.trim() || (newUserRole === "student" ? "มัธยมศึกษาปีที่ 4/1" : "กลุ่มสาระฯ วิทยาศาสตร์และเทคโนโลยี"),
      schoolId: newUserSchoolId.trim() || `ID-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "active"
    });

    setIsAddUserOpen(false);
    setNewUserName("");
    setNewUserEmail("");
    setNewUserDept("");
    setNewUserSchoolId("");
  };

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    const domainClean = newDomainInput.trim().toLowerCase().replace("@", "");
    if (!domainClean || googleConfig.allowedDomains.includes(domainClean)) return;

    updateGoogleConfig({
      allowedDomains: [...googleConfig.allowedDomains, domainClean]
    });
    setNewDomainInput("");
  };

  const handleRemoveDomain = (domainToRemove: string) => {
    if (googleConfig.allowedDomains.length <= 1) {
      alert("ต้องคงเหลือโดเมนที่อนุญาตไว้อย่างน้อย 1 โดเมน");
      return;
    }
    updateGoogleConfig({
      allowedDomains: googleConfig.allowedDomains.filter(d => d !== domainToRemove)
    });
  };

  const getRoleBadge = (role: RoleType) => {
    switch (role) {
      case "admin":
        return <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">🛡️ ผู้ดูแลระบบ</span>;
      case "teacher":
        return <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">👩‍🏫 ครูผู้สอน</span>;
      case "student":
        return <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">🎓 นักเรียน</span>;
    }
  };

  const getCategoryBadge = (cat: AuditLogEntry["category"]) => {
    switch (cat) {
      case "auth":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">🔐 AUTH</span>;
      case "academic":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">📚 ACADEMIC</span>;
      case "security":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">🛡️ SECURITY</span>;
      case "system":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">⚙️ SYSTEM</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <ShieldCheck size={14} className="text-purple-400" />
                <span>ADMIN MASTER CONSOLE</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">Google Workspace for Education</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              ศูนย์บริหารจัดการระบบและสิทธิ์ผู้ใช้งาน
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              {googleConfig.schoolName} • จัดการสิทธิ์การเข้าถึง ครู นักเรียน นโยบายความปลอดภัย และการเชื่อมโยง Google Workspace
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                if (window.confirm("ต้องการรีเฟรชสถานะและซิงก์ข้อมูลไดเรกทอรี Google Workspace หรือไม่?")) {
                  loadSeededClassroom();
                  alert("ซิงก์ข้อมูลบัญชีและห้องเรียนจาก Google Workspace เรียบร้อยแล้ว (100% Synchronized)");
                }
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 backdrop-blur-sm cursor-pointer transition-all active:scale-95 shadow-md"
            >
              <RefreshCw size={15} />
              <span>ซิงก์ Workspace Directory</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lamborghini Master Control Telemetry Cluster */}
      <div className="rounded-3xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800/80 p-5 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 font-mono">
              LAMBORGHINI MASTER ADMIN TELEMETRY
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">HOST: srv-master.school.ac.th • ISO 27001</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Gauge 1: System Uptime */}
          <div className="flex flex-col items-center bg-slate-900/60 p-3 rounded-2xl border border-slate-800/60">
            <LamborghiniArcGauge
              value={99.98}
              max={100}
              size="md"
              label="SYSTEM UPTIME"
              unit="%"
              color="verde"
              gear="D"
            />
            <span className="text-[10px] text-emerald-400 mt-1 font-mono">● All Systems Operational</span>
          </div>

          {/* Gauge 2: Google Active Sessions */}
          <div className="flex flex-col items-center bg-slate-900/60 p-3 rounded-2xl border border-slate-800/60">
            <LamborghiniArcGauge
              value={users.length}
              max={users.length + 5}
              size="md"
              label="GOOGLE ACCOUNTS"
              unit="USERS"
              color="blu"
              gear="S"
            />
            <span className="text-[10px] text-cyan-400 mt-1 font-mono">● 100% SSO Synced</span>
          </div>

          {/* Gauge 3: Database Quota */}
          <div className="flex flex-col items-center bg-slate-900/60 p-3 rounded-2xl border border-slate-800/60">
            <LamborghiniArcGauge
              value={42}
              max={100}
              size="md"
              label="STORAGE QUOTA"
              unit="%"
              color="giallo"
              gear="D"
            />
            <span className="text-[10px] text-amber-400 mt-1 font-mono">● 2.1 GB / 5.0 GB</span>
          </div>

          {/* Gauge 4: Security Score */}
          <div className="flex flex-col items-center bg-slate-900/60 p-3 rounded-2xl border border-slate-800/60">
            <LamborghiniArcGauge
              value={100}
              max={100}
              size="md"
              label="SECURITY AUDIT"
              unit="SCORE"
              color="viola"
              gear="P"
            />
            <span className="text-[10px] text-purple-400 mt-1 font-mono">● Zero Vulnerabilities</span>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "users"
              ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Users size={16} />
          <span>จัดการผู้ใช้งานและสิทธิ์ ({users.length} บัญชี)</span>
        </button>

        <button
          onClick={() => setActiveTab("google")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "google"
              ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Globe size={16} />
          <span>ตั้งค่า Google Workspace</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "audit"
              ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <FileText size={16} />
          <span>ประวัติความปลอดภัย (Audit Logs)</span>
        </button>

        <button
          onClick={() => setActiveTab("classes")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "classes"
              ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <School size={16} />
          <span>ข้อมูลหลักสูตรและชั้นเรียน</span>
        </button>
      </div>

      {/* TAB 1: User & Role Management */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ, อีเมล หรือรหัสประจำตัว..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
              />
            </div>

            {/* Filters & Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              >
                <option value="all">ทุกบทบาท (All Roles)</option>
                <option value="admin">🛡️ ผู้ดูแลระบบ (Admin)</option>
                <option value="teacher">👩‍🏫 ครูผู้สอน (Teacher)</option>
                <option value="student">🎓 นักเรียน (Student)</option>
              </select>

              <button
                onClick={() => setIsAddUserOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md shadow-purple-500/20 cursor-pointer transition-all active:scale-95"
              >
                <UserPlus size={15} />
                <span>+ เพิ่มผู้ใช้ใหม่</span>
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">ผู้ใช้งาน (User Profile)</th>
                    <th className="py-3 px-4">สังกัด / แผนก</th>
                    <th className="py-3 px-4">บทบาท (Role)</th>
                    <th className="py-3 px-4">สถานะ (Status)</th>
                    <th className="py-3 px-4">เข้าสู่ระบบล่าสุด (Google SSO)</th>
                    <th className="py-3 px-4 text-center">จัดการสิทธิ์ (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80"}
                            alt={u.name}
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{u.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Department / School ID */}
                      <td className="py-3 px-4 text-slate-700">
                        <div>{u.department || "-"}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{u.schoolId || "-"}</div>
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4">
                        {getRoleBadge(u.role)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {u.status === "active" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            เปิดใช้งาน (Active)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            ระงับการใช้งาน
                          </span>
                        )}
                      </td>

                      {/* Last Login */}
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(u.lastLoginAt).toLocaleString("th-TH", {
                          dateStyle: "short",
                          timeStyle: "short"
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Role changer select */}
                          <select
                            value={u.role}
                            onChange={(e) => updateUserRole(u.id, e.target.value as RoleType)}
                            className="px-2 py-1 text-[11px] font-medium rounded-lg border border-slate-200 bg-white hover:border-purple-400 cursor-pointer focus:outline-none"
                            title="เปลี่ยนบทบาทผู้ใช้"
                          >
                            <option value="admin">ปรับเป็น Admin</option>
                            <option value="teacher">ปรับเป็น ครู</option>
                            <option value="student">ปรับเป็น นักเรียน</option>
                          </select>

                          {/* Suspend/Activate Toggle */}
                          <button
                            onClick={() => toggleUserStatus(u.id)}
                            className={`p-1.5 rounded-lg border text-[11px] cursor-pointer transition-colors ${
                              u.status === "active"
                                ? "border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 bg-slate-50"
                                : "border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                            }`}
                            title={u.status === "active" ? "ระงับการใช้งาน" : "เปิดใช้งานบัญชี"}
                          >
                            {u.status === "active" ? <Lock size={13} /> : <Unlock size={13} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Google Workspace for Education Settings */}
      {activeTab === "google" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Domain Whitelist Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Globe size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">โดเมนโรงเรียนที่อนุญาต (Domain Whitelist)</h3>
                <p className="text-xs text-slate-500">จำกัดให้เฉพาะอีเมล Google Workspace ของโรงเรียนเท่านั้นที่เข้าสู่ระบบได้</p>
              </div>
            </div>

            {/* List of Allowed Domains */}
            <div className="space-y-2 pt-2">
              {googleConfig.allowedDomains.map((domain) => (
                <div key={domain} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-blue-700">@{domain}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Verified</span>
                  </div>
                  <button
                    onClick={() => handleRemoveDomain(domain)}
                    className="text-xs text-slate-400 hover:text-rose-600 font-medium cursor-pointer"
                  >
                    ลบออก
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Domain Form */}
            <form onSubmit={handleAddDomain} className="flex items-center gap-2 pt-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">@</span>
                <input
                  type="text"
                  placeholder="เช่น sathit.ac.th"
                  value={newDomainInput}
                  onChange={(e) => setNewDomainInput(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
              >
                + เพิ่มโดเมน
              </button>
            </form>
          </div>

          {/* Security & Provisioning Policies Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <Sliders size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">นโยบายการจัดสรรบัญชี (Provisioning Policy)</h3>
                <p className="text-xs text-slate-500">ตั้งค่านโยบายความปลอดภัยเมื่อมีผู้ใช้ใหม่ล็อกอินผ่าน Google</p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              {/* Toggle 1: Enforce Domain Restriction */}
              <div className="flex items-start justify-between gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div>
                  <div className="text-xs font-bold text-slate-900">บังคับใช้อีเมลโดเมนโรงเรียนเท่านั้น</div>
                  <div className="text-[11px] text-slate-500">บล็อกอีเมลสาธารณะ เช่น @gmail.com หรือโดเมนอื่นที่ไม่ได้ลงทะเบียน</div>
                </div>
                <input
                  type="checkbox"
                  checked={googleConfig.enforceDomainRestriction}
                  onChange={(e) => updateGoogleConfig({ enforceDomainRestriction: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded cursor-pointer mt-1"
                />
              </div>

              {/* Toggle 2: Auto-Provisioning */}
              <div className="flex items-start justify-between gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div>
                  <div className="text-xs font-bold text-slate-900">Auto-Provisioning (สร้างบัญชีให้อัตโนมัติ)</div>
                  <div className="text-[11px] text-slate-500">สร้างบัญชีนักเรียนให้อัตโนมัติเมื่อเด็กเข้าสู่ระบบด้วย Google ครั้งแรก</div>
                </div>
                <input
                  type="checkbox"
                  checked={googleConfig.autoProvisioning}
                  onChange={(e) => updateGoogleConfig({ autoProvisioning: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded cursor-pointer mt-1"
                />
              </div>

              {/* Default Role Selection */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">บทบาทเริ่มต้นสำหรับบัญชีใหม่</div>
                  <div className="text-[11px] text-slate-500">สิทธิ์ที่มอบหมายให้ทันทีเมื่อผู้ใช้ใหม่ล็อกอินเข้ามา</div>
                </div>
                <select
                  value={googleConfig.defaultRole}
                  onChange={(e) => updateGoogleConfig({ defaultRole: e.target.value as RoleType })}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white"
                >
                  <option value="student">🎓 นักเรียน (Student)</option>
                  <option value="teacher">👩‍🏫 ครูผู้สอน (Teacher)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Security & Audit Logs */}
      {activeTab === "audit" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">หมวดหมู่บันทึก:</span>
              <select
                value={auditCategoryFilter}
                onChange={(e) => setAuditCategoryFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 cursor-pointer"
              >
                <option value="all">ทั้งหมด (All Categories)</option>
                <option value="auth">🔐 การยืนยันตัวตน (Auth)</option>
                <option value="academic">📚 กิจกรรมวิชาการ (Academic)</option>
                <option value="security">🛡️ ความปลอดภัย (Security)</option>
                <option value="system">⚙️ ระบบ (System)</option>
              </select>
            </div>

            <button
              onClick={() => {
                const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
                const downloadAnchor = document.createElement("a");
                downloadAnchor.setAttribute("href", jsonStr);
                downloadAnchor.setAttribute("download", `audit-logs-${new Date().toISOString().split("T")[0]}.json`);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs"
            >
              <Download size={14} />
              <span>ดาวน์โหลด Audit Logs (JSON)</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">วันเวลา (Timestamp)</th>
                    <th className="py-3 px-4">ผู้กระทำ (User)</th>
                    <th className="py-3 px-4">หมวดหมู่</th>
                    <th className="py-3 px-4">การกระทำ (Action)</th>
                    <th className="py-3 px-4">รายละเอียด (Details)</th>
                    <th className="py-3 px-4 font-mono">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString("th-TH", {
                          dateStyle: "short",
                          timeStyle: "medium"
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{log.userName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{log.userEmail}</div>
                      </td>
                      <td className="py-3 px-4">
                        {getCategoryBadge(log.category)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {log.action}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={log.details}>
                        {log.details}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[10px] whitespace-nowrap">
                        {log.ipAddress}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Classroom & Term Settings */}
      {activeTab === "classes" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">ข้อมูลโครงสร้างรายวิชาและภาคเรียน</h3>
              <p className="text-xs text-slate-500">กำหนดปีการศึกษา ครูผู้สอนหลัก และตัวชี้วัดแกนกลางที่รับรองในระบบ</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              ● ภาคเรียนปัจจุบัน
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-xs text-slate-500 font-medium">ปีการศึกษา / ภาคเรียน</div>
              <div className="text-base font-bold text-slate-900 mt-1">ปีการศึกษา 2567 (ภาคเรียนที่ 1)</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-xs text-slate-500 font-medium">รหัสวิชาและชื่อวิชา</div>
              <div className="text-base font-bold text-slate-900 mt-1">ว31101 วิทยาการคำนวณ 1 (ม.4/1)</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-xs text-slate-500 font-medium">ครูผู้สอนหลัก</div>
              <div className="text-base font-bold text-slate-900 mt-1">ครูเมย์ ชลธิชา (may.ch@school.ac.th)</div>
            </div>
          </div>

          {/* Standards Information */}
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80">
            <div className="text-xs font-bold text-blue-900 mb-1">มาตรฐานตัวชี้วัดกระทรวงศึกษาธิการที่เชื่อมโยง:</div>
            <div className="text-xs text-blue-800">
              กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี • <strong>มาตรฐาน ว 4.2 สาระเทคโนโลยี (วิทยาการคำนวณ) ตัวชี้วัด ม.4/1:</strong> การออกแบบและเขียนโปรแกรมควบคุมแบบวนซ้ำ (Loops) พร้อมระบบประเมิน 6 มิติ (Unified 6-Point Rubric)
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">เพิ่มผู้ใช้งานใหม่เข้าสู่ระบบ</h3>
            <p className="text-xs text-slate-500 mb-4">ระบบจะสร้างสิทธิ์และผูกกับบัญชี Google Workspace ของโรงเรียน</p>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อ-นามสกุล</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น นายกิตติศักดิ์ เจริญพร"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">อีเมลโรงเรียน (Google Workspace)</label>
                <input
                  type="email"
                  required
                  placeholder="เช่น kittisak.j@school.ac.th"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">บทบาท (Role)</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as RoleType)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="student">🎓 นักเรียน</option>
                    <option value="teacher">👩‍🏫 ครูผู้สอน</option>
                    <option value="admin">🛡️ ผู้ดูแลระบบ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">รหัสประจำตัว</label>
                  <input
                    type="text"
                    placeholder="เช่น STD-40109"
                    value={newUserSchoolId}
                    onChange={(e) => setNewUserSchoolId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">แผนก / ห้องเรียน</label>
                <input
                  type="text"
                  placeholder="เช่น มัธยมศึกษาปีที่ 4/1"
                  value={newUserDept}
                  onChange={(e) => setNewUserDept(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md shadow-purple-500/20 cursor-pointer"
                >
                  บันทึกผู้ใช้
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
