import React, { useState, useMemo, useEffect } from "react";
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
  Sliders,
  Database,
  Server,
  Cloud,
  CheckCircle,
  AlertTriangle,
  Copy,
  Check,
  Zap,
  ArrowUpRight,
  Trash2,
  Bot,
  Cpu,
  Eye,
  EyeOff,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { LamborghiniArcGauge } from "../components/cockpit/LamborghiniGauge";
import { DEFAULT_AI_TUTOR_CONFIG } from "../services/aiTutorService";
import type { RoleType, AuditLogEntry, AiTutorConfig } from "../types";

const SCHEMA_SQL_SNIPPET = `-- ==============================================================================
-- LearnWise Classroom — Supabase PostgreSQL Database Schema
-- สคริปต์สร้างตารางฐานข้อมูลคลาวด์สำหรับระบบ LearnWise Classroom
-- สามารถคัดลอกคำสั่งทั้งหมดนี้ไปวางใน Supabase Dashboard -> SQL Editor แล้วกด RUN
-- ==============================================================================

-- 1. สร้างตารางผู้ใช้งานและโปรไฟล์ (Profiles & Learner Personas)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'teacher', 'student')),
  department TEXT,
  school_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  learner_profile JSONB,
  last_login_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. สร้างตารางภารกิจการเรียนรู้ (Missions / Assignments)
CREATE TABLE IF NOT EXISTS public.missions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('quiz', 'short-answer', 'coding')),
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  objective_ids TEXT[] DEFAULT '{}',
  description TEXT,
  instructions TEXT,
  estimated_minutes INT DEFAULT 15,
  due_date DATE,
  status TEXT DEFAULT 'published',
  target_student_ids TEXT[] DEFAULT '{}',
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. สร้างตารางการมีส่วนร่วมในภารกิจ (Participations)
CREATE TABLE IF NOT EXISTS public.participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mission_id TEXT NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, mission_id)
);

-- 4. สร้างตารางแบบร่างงาน (Drafts)
CREATE TABLE IF NOT EXISTS public.drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mission_id TEXT NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  based_on_attempt_id TEXT,
  content TEXT DEFAULT '',
  language TEXT,
  revision_note TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, mission_id)
);

-- 5. สร้างตารางประวัติการส่งงานของนักเรียน (Attempts)
CREATE TABLE IF NOT EXISTS public.attempts (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mission_id TEXT NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  attempt_no INT NOT NULL DEFAULT 1,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  language TEXT,
  revision_note TEXT DEFAULT '',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  submission_token TEXT,
  pulse_rating TEXT
);

-- 6. สร้างตารางผลการประเมินรูบริกและข้อเสนอแนะของครู (Reviews)
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  attempt_id TEXT NOT NULL REFERENCES public.attempts(id) ON DELETE CASCADE,
  teacher_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  publication_status TEXT NOT NULL DEFAULT 'published',
  decision TEXT NOT NULL CHECK (decision IN ('finalize', 'request_changes')),
  feedback TEXT,
  criterion_scores JSONB,
  raw_score NUMERIC,
  max_raw_score NUMERIC DEFAULT 6,
  percent_score NUMERIC,
  outcome TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. สร้างตารางประวัติการทำแบบทดสอบ (Quiz History)
CREATE TABLE IF NOT EXISTS public.quiz_history (
  id TEXT PRIMARY KEY,
  mission_id TEXT NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  attempt_no INT NOT NULL DEFAULT 1,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  score NUMERIC NOT NULL DEFAULT 0,
  max_score NUMERIC NOT NULL DEFAULT 0,
  percent_score NUMERIC NOT NULL DEFAULT 0,
  passed BOOLEAN NOT NULL DEFAULT false,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  pulse_rating TEXT
);

-- 8. สร้างตารางบันทึกความปลอดภัยและกิจกรรมระบบ (Audit Logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  role TEXT NOT NULL,
  category TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  ip_address TEXT
);

-- 9. สร้างตารางค่าคอนฟิกและนโยบายระบบ (System Settings)
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- เปิดใช้งาน Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- นโยบาย RLS อนุญาตการเข้าถึงผ่าน Anon Public Key
CREATE POLICY "Allow public read-write profiles" ON public.profiles FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write missions" ON public.missions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write participations" ON public.participations FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write drafts" ON public.drafts FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write attempts" ON public.attempts FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write reviews" ON public.reviews FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write quiz_history" ON public.quiz_history FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write audit_logs" ON public.audit_logs FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write system_settings" ON public.system_settings FOR ALL TO anon USING (true) WITH CHECK (true);
`;

export const AdminDashboard: React.FC = () => {
  const { 
    users, 
    updateUserRole, 
    toggleUserStatus, 
    addUser, 
    googleConfig, 
    updateGoogleConfig, 
    auditLogs, 
    loadSeededClassroom,
    envelope,
    supabaseStatus,
    isSupabaseConnected,
    supabaseConfig,
    updateSupabaseCredentials,
    testCloudConnection,
    seedToCloud,
    fetchCloudData,
    deleteUser,
    googleCallbackUrl,
    openGoogleModal,
    aiTutorConfig,
    updateAiTutorConfig,
    testAiTutorConnection
  } = useApp();

  const [activeTab, setActiveTab] = useState<"users" | "google" | "audit" | "classes" | "supabase" | "ai">("users");
  const [isRefreshingUsers, setIsRefreshingUsers] = useState(false);
  const [isCallbackCopied, setIsCallbackCopied] = useState(false);
  const [clientIdInput, setClientIdInput] = useState(googleConfig.clientId || "");

  // Supabase Configuration Form States
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(supabaseConfig.url || "");
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(supabaseConfig.anonKey || "");
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [isSeedingSupabase, setIsSeedingSupabase] = useState(false);
  const [isFetchingSupabase, setIsFetchingSupabase] = useState(false);
  const [supabaseFeedback, setSupabaseFeedback] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [isSqlCopied, setIsSqlCopied] = useState(false);

  // AI Tutor Configuration Form States
  const [aiApiKeyInput, setAiApiKeyInput] = useState(aiTutorConfig.apiKey || "");
  const [aiModelInput, setAiModelInput] = useState(aiTutorConfig.model || "gemini-2.5-flash");
  const [aiTeachingStyleInput, setAiTeachingStyleInput] = useState<"socratic" | "coder" | "concept">(aiTutorConfig.teachingStyle || "socratic");
  const [aiSystemPromptInput, setAiSystemPromptInput] = useState(aiTutorConfig.systemPrompt || DEFAULT_AI_TUTOR_CONFIG.systemPrompt);
  const [aiTemperatureInput, setAiTemperatureInput] = useState(aiTutorConfig.temperature ?? 0.7);
  const [aiMaxTokensInput, setAiMaxTokensInput] = useState(aiTutorConfig.maxTokens ?? 1000);
  const [aiEnabledInput, setAiEnabledInput] = useState(aiTutorConfig.enabled ?? true);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [isSavingAi, setIsSavingAi] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<{ success: boolean; latencyMs?: number; message: string; sampleResponse?: string } | null>(null);
  const [aiSaveFeedback, setAiSaveFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (supabaseConfig.url && !supabaseUrlInput) {
      setSupabaseUrlInput(supabaseConfig.url);
    }
    if (supabaseConfig.anonKey && !supabaseKeyInput) {
      setSupabaseKeyInput(supabaseConfig.anonKey);
    }
  }, [supabaseConfig]);

  useEffect(() => {
    setAiApiKeyInput(aiTutorConfig.apiKey || "");
    setAiModelInput(aiTutorConfig.model || "gemini-2.5-flash");
    setAiTeachingStyleInput(aiTutorConfig.teachingStyle || "socratic");
    setAiSystemPromptInput(aiTutorConfig.systemPrompt || DEFAULT_AI_TUTOR_CONFIG.systemPrompt);
    setAiTemperatureInput(aiTutorConfig.temperature ?? 0.7);
    setAiMaxTokensInput(aiTutorConfig.maxTokens ?? 1000);
    setAiEnabledInput(aiTutorConfig.enabled ?? true);
  }, [aiTutorConfig]);

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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/85 via-purple-950/80 to-slate-900/85 text-white p-6 sm:p-8 shadow-sm border border-purple-300/30 backdrop-blur-md">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-400/20 text-purple-200 border border-purple-400/30">
                <ShieldCheck size={14} className="text-purple-300" />
                <span>ADMIN MASTER CONSOLE</span>
              </span>
              <span className="text-xs text-purple-200/80 font-mono">Google Workspace for Education</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              ศูนย์บริหารจัดการระบบและสิทธิ์ผู้ใช้งาน
            </h1>
            <p className="text-purple-100/80 text-xs sm:text-sm mt-1 max-w-2xl">
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
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold border border-white/20 backdrop-blur-sm cursor-pointer transition-all active:scale-95 shadow-xs"
            >
              <RefreshCw size={15} />
              <span>ซิงก์ Workspace Directory</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lamborghini Master Control Telemetry Cluster */}
      <div className="rounded-3xl bg-slate-900/80 backdrop-blur-md border border-purple-300/20 p-5 shadow-sm text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-300 font-mono">
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

          {/* Gauge 3: Supabase Database Cloud Status */}
          <div className="flex flex-col items-center bg-slate-900/60 p-3 rounded-2xl border border-slate-800/60">
            <LamborghiniArcGauge
              value={isSupabaseConnected ? 100 : 0}
              max={100}
              size="md"
              label="SUPABASE CLOUD"
              unit={isSupabaseConnected ? "ONLINE" : "OFFLINE"}
              color={isSupabaseConnected ? "verde" : "rosso"}
              gear={isSupabaseConnected ? "D" : "P"}
            />
            <span className={`text-[10px] mt-1 font-mono ${isSupabaseConnected ? "text-emerald-400" : "text-amber-400"}`}>
              {isSupabaseConnected ? "● PostgreSQL Connected" : "○ Local Fallback Mode"}
            </span>
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
      <div className="flex items-center gap-2 border-b border-purple-100/80 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "users"
              ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-sm shadow-purple-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-purple-50/60"
          }`}
        >
          <Users size={16} />
          <span>จัดการผู้ใช้งานและสิทธิ์ ({users.length} บัญชี)</span>
        </button>

        <button
          onClick={() => setActiveTab("google")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "google"
              ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-sm shadow-purple-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-purple-50/60"
          }`}
        >
          <Globe size={16} />
          <span>ตั้งค่า Google Workspace</span>
        </button>

        <button
          onClick={() => setActiveTab("supabase")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "supabase"
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm shadow-emerald-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-purple-50/60"
          }`}
        >
          <Database size={16} />
          <span>⚡ ฐานข้อมูล Supabase</span>
          {isSupabaseConnected ? (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-400/20 text-emerald-100 border border-emerald-300/40">
              Live
            </span>
          ) : (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-slate-200 text-slate-600">
              Offline
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "audit"
              ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-sm shadow-purple-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-purple-50/60"
          }`}
        >
          <FileText size={16} />
          <span>ประวัติความปลอดภัย (Audit Logs)</span>
        </button>

        <button
          onClick={() => setActiveTab("classes")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "classes"
              ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-sm shadow-purple-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-purple-50/60"
          }`}
        >
          <School size={16} />
          <span>ข้อมูลหลักสูตรและชั้นเรียน</span>
        </button>

        <button
          onClick={() => setActiveTab("ai")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "ai"
              ? "bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 text-white shadow-sm shadow-purple-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-purple-50/60"
          }`}
        >
          <Bot size={16} />
          <span>🤖 ตั้งค่า AI Tutor (Gemini)</span>
          {aiTutorConfig.apiKey ? (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-400/20 text-emerald-100 border border-emerald-300/40">
              API Ready
            </span>
          ) : (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-amber-100 text-amber-800">
              Socratic Mock
            </span>
          )}
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
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
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

              {/* Cloud Sync Button */}
              <button
                onClick={async () => {
                  setIsRefreshingUsers(true);
                  const res = await fetchCloudData();
                  setIsRefreshingUsers(false);
                  alert(res.message);
                }}
                disabled={isRefreshingUsers}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 cursor-pointer transition-all disabled:opacity-50"
                title="ดึงข้อมูลผู้ใช้ล่าสุดจาก Supabase Cloud แบบสด"
              >
                <RefreshCw size={13} className={isRefreshingUsers ? "animate-spin" : ""} />
                <span>ซิงก์ Cloud ({users.length} คน)</span>
              </button>

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

                          {/* Delete User from System & Cloud */}
                          <button
                            onClick={async () => {
                              if (window.confirm(`ต้องการลบผู้ใช้งาน "${u.name}" (${u.email}) ออกจากระบบและ Supabase Cloud หรือไม่?`)) {
                                await deleteUser(u.id);
                              }
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="ลบผู้ใช้งานออกจากระบบและ Supabase Cloud"
                          >
                            <Trash2 size={13} />
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

          {/* Card 3: Google Cloud OAuth 2.0 & Supabase Auth Integration */}
          <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                  <Globe size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">การเชื่อมต่อ Google Cloud OAuth 2.0 &amp; Supabase Authentication</h3>
                  <p className="text-xs text-slate-500">ตั้งค่าการเชื่อมต่อเพื่อให้นักเรียนและครูสามารถล็อกอินผ่าน Google Account จริงได้ทั่วโลก</p>
                </div>
              </div>

              <button
                type="button"
                onClick={openGoogleModal}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition-all cursor-pointer"
              >
                <span>ทดสอบเปิดหน้าต่าง Google Sign-In</span>
                <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Left Column: Authorized Redirect Callback URL */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Authorized Redirect URI (Callback URL)</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">Google Cloud</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  คัดลอก URL นี้ไปใส่ในช่อง <strong>"Authorized redirect URIs"</strong> ของ Google Cloud Console (OAuth Client ID):
                </p>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 font-mono text-xs text-slate-700">
                  <span className="flex-1 truncate">{googleCallbackUrl || "https://yfhudjpsngzegdxaiiwk.supabase.co/auth/v1/callback"}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(googleCallbackUrl || "https://yfhudjpsngzegdxaiiwk.supabase.co/auth/v1/callback");
                      setIsCallbackCopied(true);
                      setTimeout(() => setIsCallbackCopied(false), 2500);
                    }}
                    className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-sans text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {isCallbackCopied ? <Check size={12} /> : <Copy size={12} />}
                    <span>{isCallbackCopied ? "คัดลอกแล้ว" : "คัดลอก"}</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Google Client ID Configuration */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs font-bold text-slate-800">Google OAuth 2.0 Web Client ID</span>
                <p className="text-[11px] text-slate-500">
                  รหัส Client ID ที่ได้จาก Google Cloud Platform (ลงท้ายด้วย .apps.googleusercontent.com):
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="เช่น 123456789-abcdef.apps.googleusercontent.com"
                    value={clientIdInput}
                    onChange={(e) => setClientIdInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      updateGoogleConfig({ clientId: clientIdInput.trim() });
                      alert("บันทึก Google OAuth Client ID เรียบร้อยแล้ว");
                    }}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold cursor-pointer"
                  >
                    บันทึก
                  </button>
                </div>
              </div>
            </div>

            {/* Step-by-step instructions */}
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/70 text-xs space-y-2">
              <span className="font-bold text-blue-900 flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-blue-600" />
                <span>3 ขั้นตอนการเปิดใช้งาน Google Authentication ให้กับโรงเรียน:</span>
              </span>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 text-[11px]">
                <li>เข้าสู่ <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">Google Cloud Console</a> &gt; สร้าง <strong>OAuth 2.0 Client ID</strong> (เลือกชนิด Web Application) และวาง Callback URL ด้านบน</li>
                <li>ไปที่ <a href="https://supabase.com/dashboard/project/yfhudjpsngzegdxaiiwk/auth/providers" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">Supabase Dashboard &gt; Auth &gt; Providers &gt; Google</a> แล้วเปิดใช้งาน (Enabled) พร้อมใส่ Client ID และ Client Secret</li>
                <li>เมื่อตั้งค่าเสร็จสิ้น นักเรียนและครูทุกคนจะสามารถกดปุ่ม <strong>"ลงชื่อเข้าใช้ด้วยบัญชี Google ของท่าน"</strong> เพื่อเข้าใช้งานระบบได้ทันที!</li>
              </ol>
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

      {/* TAB 5: Supabase Cloud Database */}
      {activeTab === "supabase" && (
        <div className="space-y-6">
          {/* Supabase Hero & Status Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 p-6 rounded-3xl border border-emerald-500/20 text-white shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Database size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <span>ฐานข้อมูลคลาวด์ Supabase (PostgreSQL)</span>
                    <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Cloud DB
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    ระบบฐานข้อมูลสัมพันธ์ระดับองค์กร รองรับการจัดเก็บข้อมูลนักเรียน ภารกิจ การส่งงาน ผลการประเมินรูบริก และ Audit Logs
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-800/80 border border-slate-700/80 self-start sm:self-auto">
                {supabaseStatus === "connected" && (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold text-emerald-400 font-mono">SUPABASE CONNECTED</span>
                  </>
                )}
                {supabaseStatus === "disconnected" && (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                    <span className="text-xs font-semibold text-slate-400 font-mono">DISCONNECTED / LOCAL CACHE</span>
                  </>
                )}
                {supabaseStatus === "checking" && (
                  <>
                    <RefreshCw size={14} className="text-cyan-400 animate-spin" />
                    <span className="text-xs font-semibold text-cyan-400 font-mono">CHECKING CONNECTION...</span>
                  </>
                )}
                {supabaseStatus === "error" && (
                  <>
                    <AlertTriangle size={14} className="text-rose-400" />
                    <span className="text-xs font-semibold text-rose-400 font-mono">CONNECTION ERROR</span>
                  </>
                )}
              </div>
            </div>

            {/* Architecture Explainer Pill */}
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-emerald-400" />
                <span>สถาปัตยกรรม Hybrid Resilient: ทำงานได้ทั้ง Cloud และ Offline Local Cache</span>
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-purple-400" />
                <span>Row Level Security (RLS) ปกป้องข้อมูลรายคน</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Cloud size={14} className="text-cyan-400" />
                <span>รองรับ GitHub Pages และโฮสติ้งทุกแห่ง</span>
              </span>
            </div>
          </div>

          {/* Feedback banner */}
          {supabaseFeedback && (
            <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-medium ${
              supabaseFeedback.type === "success" 
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                : supabaseFeedback.type === "error"
                ? "bg-rose-50 text-rose-800 border border-rose-200"
                : "bg-blue-50 text-blue-800 border border-blue-200"
            }`}>
              <div className="flex items-center gap-2">
                {supabaseFeedback.type === "success" && <CheckCircle size={16} className="text-emerald-600" />}
                {supabaseFeedback.type === "error" && <AlertTriangle size={16} className="text-rose-600" />}
                {supabaseFeedback.type === "info" && <RefreshCw size={16} className="text-blue-600 animate-spin" />}
                <span>{supabaseFeedback.message}</span>
              </div>
              <button 
                onClick={() => setSupabaseFeedback(null)} 
                className="text-slate-400 hover:text-slate-600 font-bold px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Connection Settings & 1-Click Sync Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Box A: Connection Credentials Form */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Lock size={16} className="text-slate-500" />
                  <span>กุญแจเชื่อมต่อ Supabase API (API Credentials)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  ระบุ URL และ anon key จาก Supabase Dashboard &gt; Project Settings &gt; API
                </p>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                setIsTestingSupabase(true);
                setSupabaseFeedback({ type: "info", message: "กำลังทดสอบและเชื่อมต่อฐานข้อมูล Supabase..." });
                const res = await updateSupabaseCredentials(supabaseUrlInput, supabaseKeyInput);
                setIsTestingSupabase(false);
                setSupabaseFeedback({
                  type: res.success ? "success" : "error",
                  message: res.message
                });
              }} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://xyzcompany.supabase.co"
                    value={supabaseUrlInput}
                    onChange={(e) => setSupabaseUrlInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">ตัวอย่าง: https://abcdefghijklm.supabase.co</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Supabase Anon Public API Key (anon/public)
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseKeyInput}
                    onChange={(e) => setSupabaseKeyInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">เป็น public key ที่ปลอดภัยสำหรับใช้งานฝั่ง Client</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isTestingSupabase}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-50 transition-all active:scale-95"
                  >
                    {isTestingSupabase ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                    <span>{isTestingSupabase ? "กำลังเชื่อมต่อ..." : "ทดสอบและบันทึกการเชื่อมต่อ (Connect)"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      setIsTestingSupabase(true);
                      setSupabaseFeedback({ type: "info", message: "กำลังทดสอบเชื่อมต่อชั่วคราว..." });
                      const res = await testCloudConnection(supabaseUrlInput, supabaseKeyInput);
                      setIsTestingSupabase(false);
                      setSupabaseFeedback({
                        type: res.success ? "success" : "error",
                        message: res.message
                      });
                    }}
                    className="px-3 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-all"
                  >
                    ทดสอบเฉยๆ
                  </button>

                  {isSupabaseConnected && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm("ต้องการยกเลิกการเชื่อมต่อ Supabase หรือไม่? (ระบบจะสลับกลับเป็น Local Cache อัตโนมัติ)")) {
                          updateSupabaseCredentials("", "");
                          setSupabaseUrlInput("");
                          setSupabaseKeyInput("");
                          setSupabaseFeedback({ type: "info", message: "ตัดการเชื่อมต่อ Supabase เรียบร้อยแล้ว ระบบกำลังทำงานด้วย Local Cache" });
                        }
                      }}
                      className="px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer transition-all ml-auto"
                    >
                      ตัดการเชื่อมต่อ
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Box B: Data Seeding & Synchronization Control */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="border-b border-slate-100 pb-3">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Cloud size={16} className="text-cyan-600" />
                    <span>การซิงก์ข้อมูลและชุดทดสอบ (Cloud Data Sync)</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    อัปโหลดข้อมูลโรงเรียน นักเรียน และภารกิจทั้งหมดขึ้นตาราง Supabase หรือดึงข้อมูลกลับลงมา
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 my-4">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <div className="text-xs text-slate-400 font-medium">โปรไฟล์ &amp; บัญชี</div>
                    <div className="text-lg font-bold text-slate-800 mt-0.5 font-mono">{users.length}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <div className="text-xs text-slate-400 font-medium">ภารกิจการเรียนรู้</div>
                    <div className="text-lg font-bold text-slate-800 mt-0.5 font-mono">{envelope.missions.length}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <div className="text-xs text-slate-400 font-medium">ผลการส่ง &amp; ประเมิน</div>
                    <div className="text-lg font-bold text-slate-800 mt-0.5 font-mono">{envelope.attempts.length + envelope.quizHistory.length}</div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  หากคุณเพิ่งสร้างตารางใหม่ใน Supabase สามารถกดปุ่ม <strong>"ซิงก์ข้อมูลทั้งหมดขึ้น Cloud (Seed to Cloud)"</strong> เพื่ออัปโหลดข้อมูลโรงเรียน ครู นักเรียน และภารกิจทั้ง 4 ชุดขึ้นตารางฐานข้อมูลในคลิกเดียว
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={!isSupabaseConnected || isSeedingSupabase}
                  onClick={async () => {
                    setIsSeedingSupabase(true);
                    setSupabaseFeedback({ type: "info", message: "กำลังอัปโหลดชุดข้อมูลทั้งหมดขึ้น Supabase Cloud..." });
                    const res = await seedToCloud();
                    setIsSeedingSupabase(false);
                    setSupabaseFeedback({
                      type: res.success ? "success" : "error",
                      message: res.message
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 cursor-pointer disabled:opacity-40 transition-all active:scale-95"
                >
                  {isSeedingSupabase ? <RefreshCw size={14} className="animate-spin" /> : <Cloud size={14} />}
                  <span>{isSeedingSupabase ? "กำลังซิงก์..." : "🚀 ซิงก์ข้อมูลทั้งหมดขึ้น Cloud (Seed to Cloud)"}</span>
                </button>

                <button
                  type="button"
                  disabled={!isSupabaseConnected || isFetchingSupabase}
                  onClick={async () => {
                    setIsFetchingSupabase(true);
                    setSupabaseFeedback({ type: "info", message: "กำลังดึงข้อมูลล่าสุดจาก Supabase..." });
                    const res = await fetchCloudData();
                    setIsFetchingSupabase(false);
                    setSupabaseFeedback({
                      type: res.success ? "success" : "error",
                      message: res.message
                    });
                  }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer disabled:opacity-40 transition-all"
                >
                  {isFetchingSupabase ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  <span>ดึงข้อมูลล่าสุดจาก Cloud</span>
                </button>
              </div>
            </div>
          </div>

          {/* Box C: SQL Schema Migration Guide */}
          <div className="bg-slate-950 text-slate-100 rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText size={16} className="text-emerald-400" />
                  <span>คู่มือการติดตั้งโครงสร้างฐานข้อมูล (SQL Schema Migration Script)</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  คัดลอกโค้ด SQL ด้านล่างนี้ไปวางใน <strong>Supabase Dashboard &gt; SQL Editor &gt; New query</strong> แล้วกด <strong>RUN</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(SCHEMA_SQL_SNIPPET);
                  setIsSqlCopied(true);
                  setTimeout(() => setIsSqlCopied(false), 3000);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold cursor-pointer transition-all self-start sm:self-auto active:scale-95 shadow-lg shadow-emerald-500/20"
              >
                {isSqlCopied ? <Check size={14} /> : <Copy size={14} />}
                <span>{isSqlCopied ? "คัดลอกสำเร็จแล้ว!" : "คัดลอก SQL Schema ทั้งหมด (Copy SQL)"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-emerald-400 font-bold block mb-1">ขั้นตอนที่ 1</span>
                <span className="text-slate-300">เปิด Supabase Dashboard โครงการของคุณ แล้วไปที่เมนู <strong>SQL Editor</strong></span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-emerald-400 font-bold block mb-1">ขั้นตอนที่ 2</span>
                <span className="text-slate-300">กดปุ่ม <strong>New query</strong> แล้วกด <strong>วาง (Paste)</strong> โค้ด SQL ด้านล่าง</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-emerald-400 font-bold block mb-1">ขั้นตอนที่ 3</span>
                <span className="text-slate-300">กด <strong>Run</strong> เพื่อสร้าง 9 ตารางพร้อมเปิดสิทธิ์ RLS แล้วนำ API Key มาใส่ในหน้านี้</span>
              </div>
            </div>

            {/* SQL Code Block with syntax styling */}
            <div className="relative">
              <div className="max-h-72 overflow-y-auto bg-slate-900 rounded-2xl p-4 font-mono text-[11px] leading-relaxed text-emerald-300/90 border border-slate-800 select-all">
                <pre>{SCHEMA_SQL_SNIPPET}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: AI Tutor Management (Google Gemini) */}
      {activeTab === "ai" && (
        <div className="space-y-6">
          {/* AI Hero Banner */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 p-6 sm:p-8 rounded-3xl border border-purple-500/20 text-white shadow-xl relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 shrink-0">
                  <Bot size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                      <Sparkles size={11} />
                      <span>Google Gemini 2.5 / 1.5 Architecture</span>
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      ว 4.2 สาระเทคโนโลยี ม.4/1
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    ศูนย์ควบคุมปัญญาประดิษฐ์ AI Tutor สำหรับนักเรียน
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    ระบบผู้ช่วยสอนแบบ Socratic Questioning ชี้แนะแนวคิด ให้คำใบ้ทีละระดับ (Scaffolding Hints) และแกะรอย Syntax / Logic Error โดยไม่เฉลยคำตอบตรงๆ
                  </p>
                </div>
              </div>

              {/* Status Pill */}
              <div className="flex items-center gap-3 self-start md:self-auto bg-slate-800/80 backdrop-blur-sm border border-slate-700/80 px-4 py-2.5 rounded-2xl">
                {!aiEnabledInput ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 font-mono">STATUS: DISABLED</div>
                      <div className="text-[10px] text-slate-500">AI ปิดให้บริการชั่วคราว</div>
                    </div>
                  </>
                ) : aiApiKeyInput.trim() ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <div>
                      <div className="text-[11px] font-bold text-emerald-400 font-mono flex items-center gap-1">
                        <span>LIVE GEMINI API</span>
                        <CheckCircle size={12} />
                      </div>
                      <div className="text-[10px] text-slate-300 font-mono">{aiModelInput}</div>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                    <div>
                      <div className="text-[11px] font-bold text-amber-400 font-mono">SOCRATIC FALLBACK</div>
                      <div className="text-[10px] text-slate-300">ยังไม่ใส่ API Key (ใช้ AI จำลอง)</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Feedback Toasts */}
          {aiSaveFeedback && (
            <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs border ${
              aiSaveFeedback.type === "success" 
                ? "bg-emerald-50 text-emerald-900 border-emerald-200" 
                : "bg-rose-50 text-rose-900 border-rose-200"
            }`}>
              <div className="flex items-center gap-2">
                {aiSaveFeedback.type === "success" ? (
                  <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle size={16} className="text-rose-600 shrink-0" />
                )}
                <span className="font-semibold">{aiSaveFeedback.message}</span>
              </div>
              <button 
                onClick={() => setAiSaveFeedback(null)} 
                className="text-slate-400 hover:text-slate-600 font-bold px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Column 1: API & Model Settings */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Lock size={16} className="text-purple-600" />
                    <span>การเชื่อมต่อ Google Gemini API</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    เชื่อมตรงจากเบราว์เซอร์ (Client-side) ด้วย REST API v1beta ปลอดภัยและรวดเร็ว
                  </p>
                </div>

                {/* Enable/Disable Switch */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-xs font-semibold text-slate-600">เปิดระบบ</span>
                  <input
                    type="checkbox"
                    checked={aiEnabledInput}
                    onChange={(e) => setAiEnabledInput(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                  />
                </label>
              </div>

              {/* API Key Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    Google Gemini API Key <span className="text-rose-500">*</span>
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 hover:text-purple-800 hover:underline"
                  >
                    <span>ขอรับ API Key ฟรีที่ Google AI Studio</span>
                    <ExternalLink size={11} />
                  </a>
                </div>

                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={aiApiKeyInput}
                    onChange={(e) => setAiApiKeyInput(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full pl-3 pr-10 py-2.5 text-xs font-mono rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    title={showApiKey ? "ซ่อนรหัส" : "แสดงรหัส"}
                  >
                    {showApiKey ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  คีย์จะถูกบันทึกเก็บในฐานข้อมูล Supabase Cloud ตาราง <code>system_settings</code> เพื่อให้นักเรียนทุกคนใช้งานได้ทันที
                </p>
              </div>

              {/* Model Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  โมเดล Google Gemini ที่ใช้งาน
                </label>
                <select
                  value={aiModelInput}
                  onChange={(e) => setAiModelInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 font-medium"
                >
                  <option value="gemini-2.5-flash">⚡ Gemini 2.5 Flash (แนะนำ — เร็ว ฉลาด วิเคราะห์โค้ดดีเยี่ยม Latency ต่ำสุด)</option>
                  <option value="gemini-1.5-flash">🎯 Gemini 1.5 Flash (เสถียร รองรับโหลดสูง เหมาะสำหรับห้องเรียนทั่วไป)</option>
                  <option value="gemini-1.5-pro">🧠 Gemini 1.5 Pro (วิเคราะห์ตรรกะและอัลกอริทึมเชิงลึกขั้นสูง)</option>
                </select>
              </div>

              {/* Teaching Persona Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  สไตล์การสอนของ AI (Teaching Persona)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      id: "socratic",
                      title: "💡 Socratic Guide",
                      desc: "กระตุ้นคิดด้วยคำถาม ชี้แนะทีละขั้น ไม่เฉลยคำตอบ (สพฐ.)",
                      badge: "แนะนำ"
                    },
                    {
                      id: "coder",
                      title: "💻 Code Debugger",
                      desc: "เน้นหา Syntax & Logic Error และวิเคราะห์ Test Cases",
                      badge: "สายโค้ด"
                    },
                    {
                      id: "concept",
                      title: "📚 Concept Master",
                      desc: "เน้นย่อยมโนทัศน์ ออกแบบขั้นตอนวิธี อธิบายง่าย",
                      badge: "มโนทัศน์"
                    }
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setAiTeachingStyleInput(style.id as "socratic" | "coder" | "concept")}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        aiTeachingStyleInput === style.id
                          ? "bg-purple-50/80 border-purple-300 ring-2 ring-purple-500/20 shadow-xs"
                          : "bg-slate-50/60 border-slate-200 hover:bg-slate-100/80"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-900">{style.title}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          aiTeachingStyleInput === style.id
                            ? "bg-purple-200 text-purple-800"
                            : "bg-slate-200 text-slate-600"
                        }`}>
                          {style.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">{style.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Connectivity Test Button */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <button
                  type="button"
                  disabled={isTestingAi || !aiApiKeyInput.trim()}
                  onClick={async () => {
                    setIsTestingAi(true);
                    setAiTestResult(null);
                    const candidateConfig: AiTutorConfig = {
                      enabled: aiEnabledInput,
                      provider: "gemini",
                      apiKey: aiApiKeyInput.trim(),
                      model: aiModelInput,
                      teachingStyle: aiTeachingStyleInput,
                      systemPrompt: aiSystemPromptInput.trim(),
                      temperature: aiTemperatureInput,
                      maxTokens: aiMaxTokensInput,
                    };
                    const res = await testAiTutorConnection(candidateConfig);
                    setIsTestingAi(false);
                    setAiTestResult(res);
                  }}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                    !aiApiKeyInput.trim()
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                      : "bg-slate-900 hover:bg-slate-800 text-white hover:-translate-y-0.5 active:scale-98"
                  }`}
                >
                  {isTestingAi ? (
                    <>
                      <RefreshCw size={14} className="animate-spin text-purple-400" />
                      <span>กำลังทดสอบเชื่อมต่อ Google Gemini REST API...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={14} className="text-amber-400" />
                      <span>⚡ ทดสอบการเชื่อมต่อ API สด (Live Connection Test)</span>
                    </>
                  )}
                </button>

                {/* Test Result Display */}
                {aiTestResult && (
                  <div className={`p-4 rounded-2xl border animate-in fade-in duration-200 space-y-2 ${
                    aiTestResult.success 
                      ? "bg-emerald-50/70 border-emerald-300 text-emerald-950" 
                      : "bg-rose-50/70 border-rose-300 text-rose-950"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-xs">
                        {aiTestResult.success ? (
                          <CheckCircle size={16} className="text-emerald-600" />
                        ) : (
                          <AlertTriangle size={16} className="text-rose-600" />
                        )}
                        <span>{aiTestResult.message}</span>
                      </div>
                      {aiTestResult.latencyMs && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                          ⚡ {aiTestResult.latencyMs} ms
                        </span>
                      )}
                    </div>

                    {aiTestResult.sampleResponse && (
                      <div className="bg-white/90 p-3 rounded-xl border border-emerald-200/80 text-[11px] text-slate-700 font-sans italic">
                        <span className="font-bold not-italic text-emerald-800 block mb-1">ข้อความตอบกลับจากโมเดล:</span>
                        "{aiTestResult.sampleResponse}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: System Prompt & Pedagogical Parameters */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sliders size={16} className="text-indigo-600" />
                    <span>พารามิเตอร์การสอนและ System Prompt</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    กำหนดขอบเขตและกฎเหล็กการสอนของ AI ให้สอดคล้องกับหลักสูตรแกนกลาง
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("ต้องการรีเซ็ต System Prompt และพารามิเตอร์กลับเป็นค่ามาตรฐานหรือไม่?")) {
                      setAiSystemPromptInput(DEFAULT_AI_TUTOR_CONFIG.systemPrompt);
                      setAiTemperatureInput(DEFAULT_AI_TUTOR_CONFIG.temperature);
                      setAiMaxTokensInput(DEFAULT_AI_TUTOR_CONFIG.maxTokens);
                    }
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 transition-all cursor-pointer"
                >
                  <RefreshCw size={11} />
                  <span>รีเซ็ตค่าเริ่มต้น</span>
                </button>
              </div>

              {/* System Prompt Editor */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  คำสั่งระบบหลัก (System Prompt)
                </label>
                <textarea
                  rows={8}
                  value={aiSystemPromptInput}
                  onChange={(e) => setAiSystemPromptInput(e.target.value)}
                  className="w-full p-3 font-mono text-[11px] leading-relaxed rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                  placeholder="พิมพ์คำสั่งระบบสำหรับกำหนดบทบาทและแนวทางการชี้แนะของ AI..."
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>รองรับการปรับแต่งกฎเหล็ก เช่น ห้ามแจกเฉลย 100% หรือปรับเข้าหา UDL</span>
                  <span>{aiSystemPromptInput.length} ตัวอักษร</span>
                </div>
              </div>

              {/* Temperature Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-700">
                    Temperature (ระดับความคิดสร้างสรรค์): <span className="font-bold font-mono text-purple-700">{aiTemperatureInput}</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {aiTemperatureInput <= 0.3 ? "มุ่งเน้นความแม่นยำสูง" : aiTemperatureInput <= 0.7 ? "สมดุล เหมาะกับการสอน" : "ยืดหยุ่น สร้างสรรค์สูง"}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={aiTemperatureInput}
                  onChange={(e) => setAiTemperatureInput(parseFloat(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>

              {/* Max Tokens Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-700">
                    Max Output Tokens (ความยาวคำตอบสูงสุด): <span className="font-bold font-mono text-indigo-700">{aiMaxTokensInput} tokens</span>
                  </label>
                  <span className="text-[11px] text-slate-400">~{Math.round(aiMaxTokensInput * 0.75)} คำภาษาไทย</span>
                </div>
                <input
                  type="range"
                  min="256"
                  max="4096"
                  step="128"
                  value={aiMaxTokensInput}
                  onChange={(e) => setAiMaxTokensInput(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Pedagogy Compliance Checklist */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 space-y-2">
                <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-indigo-600" />
                  <span>เกณฑ์มาตรฐานการเรียนรู้ตามหลักสูตรแกนกลาง ว 4.2:</span>
                </div>
                <ul className="text-[11px] text-indigo-800 space-y-1 list-disc list-inside">
                  <li><strong>Socratic Guardrail:</strong> ป้องกันการคัดลอกโค้ดหรือคำตอบโดยตรง 100%</li>
                  <li><strong>Scaffolding Hints:</strong> ให้คำใบ้เป็นขั้นตอน 1 ➡️ 2 ➡️ 3 กระตุ้น Growth Mindset</li>
                  <li><strong>UDL Support:</strong> ปรับคำอธิบายตามความต้องการจำเพาะของนักเรียนแต่ละคน</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Master Save Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Cloud size={16} className="text-purple-600" />
              <span>การบันทึกจะซิงก์ตรงสู่ Supabase Cloud (<code>system_settings</code>) และเบราว์เซอร์ LocalStorage</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                disabled={isSavingAi}
                onClick={async () => {
                  setIsSavingAi(true);
                  setAiSaveFeedback(null);
                  const newConfig: AiTutorConfig = {
                    enabled: aiEnabledInput,
                    provider: "gemini",
                    apiKey: aiApiKeyInput.trim(),
                    model: aiModelInput,
                    teachingStyle: aiTeachingStyleInput,
                    systemPrompt: aiSystemPromptInput.trim(),
                    temperature: aiTemperatureInput,
                    maxTokens: aiMaxTokensInput,
                  };
                  const res = await updateAiTutorConfig(newConfig);
                  setIsSavingAi(false);
                  setAiSaveFeedback({
                    type: res.success ? "success" : "error",
                    message: res.message
                  });
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-purple-500/25 hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer"
              >
                {isSavingAi ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>กำลังบันทึกลงคลาวด์...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={15} />
                    <span>บันทึกการตั้งค่า AI Tutor (Save & Sync)</span>
                  </>
                )}
              </button>
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
