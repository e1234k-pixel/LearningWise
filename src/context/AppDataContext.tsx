import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { 
  Envelope, 
  UserRole, 
  Draft, 
  Attempt, 
  Review, 
  Mission, 
  WorkStatus, 
  QuizHistoryEntry,
  AuthUser,
  GoogleWorkspaceConfig,
  AuditLogEntry,
  RoleType,
  Student,
  AiTutorConfig
} from "../types";
import { 
  initialEnvelope, 
  createSeededEnvelope, 
  mockQuizQuestions, 
  mockStudents,
  mockAuthUsers,
  initialGoogleConfig,
  initialAuditLogs
} from "../data/mock";
import { 
  getStoredSupabaseConfig, 
  saveSupabaseConfig, 
  testSupabaseConnection,
  getSupabaseClient,
  signInWithGoogleOAuth as supabaseSignInWithGoogleOAuth,
  signOutFromSupabase,
  getGoogleCallbackUrl
} from "../lib/supabase";
import {
  seedAllToSupabase,
  fetchFromSupabase,
  pushAttemptToCloud,
  pushReviewToCloud,
  pushQuizHistoryToCloud,
  pushAuditLogToCloud,
  pushUserToCloud,
  deleteUserFromCloud,
  pushAiTutorConfigToCloud,
  pushGoogleConfigToCloud,
  type CloudSyncResult
} from "../services/supabaseService";
import {
  DEFAULT_AI_TUTOR_CONFIG,
  testGeminiApiConnection
} from "../services/aiTutorService";
import {
  enrollStudentInTeacherMayClass,
  ensureTeacherMayClassEnrollment,
  computeRealLearnerProfile
} from "../utils/userUtils";

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: AuthUser | null;
  users: AuthUser[];
  googleConfig: GoogleWorkspaceConfig;
  auditLogs: AuditLogEntry[];
  aiTutorConfig: AiTutorConfig;
  updateAiTutorConfig: (config: Partial<AiTutorConfig>) => Promise<{ success: boolean; message: string }>;
  testAiTutorConnection: (config?: AiTutorConfig) => Promise<{ success: boolean; message: string; latencyMs?: number }>;
  isAiDrawerOpen: boolean;
  openAiDrawer: (initialPrompt?: string) => void;
  closeAiDrawer: () => void;
  initialAiPrompt: string | null;
  isGoogleModalOpen: boolean;
  openGoogleModal: () => void;
  closeGoogleModal: () => void;
  loginWithGoogle: (account: AuthUser | { email: string; name: string; avatarUrl?: string }) => void;
  signInWithGoogleOAuth: () => Promise<{ success: boolean; message?: string }>;
  googleOAuthError: string | null;
  clearGoogleOAuthError: () => void;
  googleCallbackUrl: string;
  logout: () => void;
  updateUserRole: (userId: string, newRole: RoleType) => void;
  toggleUserStatus: (userId: string) => void;
  addUser: (newUser: Omit<AuthUser, "id" | "lastLoginAt">) => void;
  deleteUser: (userId: string) => Promise<void>;
  updateGoogleConfig: (config: Partial<GoogleWorkspaceConfig>) => void;
  logAudit: (action: string, category: "auth" | "academic" | "security" | "system", details: string) => void;
  envelope: Envelope;
  saveDraft: (draft: Draft) => void;
  submitAttempt: (draft: Draft) => void;
  submitQuiz: (missionId: string, studentId: string, answers: Record<string, string>) => QuizHistoryEntry | null;
  requestChanges: (attemptId: string, feedback: string) => void;
  finalizeReview: (attemptId: string, feedback: string, scores: Record<string, number>) => void;
  getWorkStatus: (studentId: string, missionId: string) => WorkStatus;
  createMission: (mission: Mission) => void;
  recordPulseRating: (type: "attempt" | "quiz", id: string, pulseRating: string) => void;
  resetData: () => void;
  loadSeededClassroom: () => void;

  // Supabase Cloud State & Sync
  supabaseStatus: "connected" | "disconnected" | "checking" | "error";
  isSupabaseConnected: boolean;
  supabaseConfig: { url: string; anonKey: string };
  updateSupabaseCredentials: (url: string, anonKey: string) => Promise<{ success: boolean; message: string }>;
  testCloudConnection: (url?: string, anonKey?: string) => Promise<{ success: boolean; message: string }>;
  seedToCloud: () => Promise<CloudSyncResult>;
  fetchCloudData: () => Promise<{ success: boolean; message: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = "learnwise.classroom.v1";
const DEMO_ROLE_KEY = "learnwise.demo.session.v1";
const USERS_KEY = "learnwise.users.v1";
const AUTH_USER_KEY = "learnwise.auth.user.v1";
const GOOGLE_CONFIG_KEY = "learnwise.google.config.v1";
const AUDIT_LOGS_KEY = "learnwise.audit.logs.v1";
const AI_TUTOR_CONFIG_KEY = "learnwise.ai.tutor.config.v1";

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRoleState] = useState<UserRole>({ type: "teacher", id: "teacher-demo" });
  const [envelope, setEnvelope] = useState<Envelope>(initialEnvelope);
  const [users, setUsers] = useState<AuthUser[]>(mockAuthUsers);
  const [currentUser, setCurrentUserState] = useState<AuthUser | null>(mockAuthUsers[1]); // Default to Teacher May
  const [googleConfig, setGoogleConfig] = useState<GoogleWorkspaceConfig>(() => {
    try {
      const saved = localStorage.getItem(GOOGLE_CONFIG_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialGoogleConfig;
  });
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(initialAuditLogs);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleOAuthError, setGoogleOAuthError] = useState<string | null>(null);
  const clearGoogleOAuthError = () => setGoogleOAuthError(null);
  const [googleCallbackUrl] = useState<string>(getGoogleCallbackUrl());

  // AI Tutor States
  const [aiTutorConfig, setAiTutorConfig] = useState<AiTutorConfig>(DEFAULT_AI_TUTOR_CONFIG);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [initialAiPrompt, setInitialAiPrompt] = useState<string | null>(null);

  const openAiDrawer = (prompt?: string) => {
    if (prompt) setInitialAiPrompt(prompt);
    setIsAiDrawerOpen(true);
  };
  const closeAiDrawer = () => {
    setIsAiDrawerOpen(false);
    setInitialAiPrompt(null);
  };

  // Detect OAuth error in URL on mount
  useEffect(() => {
    try {
      const hash = window.location.hash || "";
      const search = window.location.search || "";
      const hashParams = new URLSearchParams(hash.startsWith("#") ? hash.substring(1) : "");
      const searchParams = new URLSearchParams(search.startsWith("?") ? search.substring(1) : "");

      const errorMsg = 
        hashParams.get("error_description") || 
        hashParams.get("error") || 
        searchParams.get("error_description") || 
        searchParams.get("error");

      if (errorMsg) {
        const decoded = decodeURIComponent(errorMsg).replace(/\+/g, " ");
        console.warn("OAuth Callback Notice:", decoded);
        setGoogleOAuthError(decoded);
        window.history.replaceState(null, "", window.location.pathname);
      }
    } catch {
      // ignore
    }
  }, []);

  // Supabase Connection State
  const [supabaseStatus, setSupabaseStatus] = useState<"connected" | "disconnected" | "checking" | "error">("checking");
  const [supabaseConfigState, setSupabaseConfigState] = useState<{ url: string; anonKey: string }>({ url: "", anonKey: "" });

  useEffect(() => {
    const conf = getStoredSupabaseConfig();
    setSupabaseConfigState({ url: conf.url, anonKey: conf.anonKey });
    if (conf.isConfigured) {
      testSupabaseConnection(conf.url, conf.anonKey)
        .then(res => {
          const isConn = res.success;
          setSupabaseStatus(isConn ? "connected" : "error");
          if (isConn) {
            // Auto-fetch fresh data from Supabase Cloud on startup
            fetchFromSupabase().then(cloudData => {
              if (cloudData?.users && cloudData.users.length > 0) {
                setUsers(cloudData.users);
                localStorage.setItem(USERS_KEY, JSON.stringify(cloudData.users));
              }
              if (cloudData?.envelope) {
                setEnvelope(prev => {
                  const merged: Envelope = {
                    ...prev,
                    ...(cloudData.envelope?.missions ? { missions: cloudData.envelope.missions } : {}),
                    ...(cloudData.envelope?.attempts ? { attempts: cloudData.envelope.attempts } : {}),
                    ...(cloudData.envelope?.reviews ? { reviews: cloudData.envelope.reviews } : {}),
                    ...(cloudData.envelope?.quizHistory ? { quizHistory: cloudData.envelope.quizHistory } : {}),
                    ...(cloudData.envelope?.students ? { students: cloudData.envelope.students } : {}),
                  };
                  const reconciled = ensureTeacherMayClassEnrollment(merged, cloudData.users || users);
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(reconciled));
                  return reconciled;
                });
              }
              if (cloudData?.aiTutorConfig) {
                setAiTutorConfig(prev => {
                  const merged = { ...prev, ...cloudData.aiTutorConfig };
                  localStorage.setItem(AI_TUTOR_CONFIG_KEY, JSON.stringify(merged));
                  return merged;
                });
              }
              if (cloudData?.googleConfig) {
                setGoogleConfig(prev => {
                  const merged = { ...prev, ...cloudData.googleConfig };
                  localStorage.setItem(GOOGLE_CONFIG_KEY, JSON.stringify(merged));
                  return merged;
                });
              }
            }).catch(e => console.warn("Auto-fetch error on startup:", e));
          }
        })
        .catch(() => {
          setSupabaseStatus("error");
        });
    } else {
      setSupabaseStatus("disconnected");
    }
  }, []);

  // Supabase Realtime Listener for Profiles
  useEffect(() => {
    if (supabaseStatus !== "connected") return;
    const client = getSupabaseClient();
    if (!client) return;

    const channel = client
      .channel("realtime-profiles-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          // Whenever any profile is added, updated, or deleted on Supabase
          fetchFromSupabase().then(cloudData => {
            if (cloudData?.users && cloudData.users.length > 0) {
              setUsers(cloudData.users);
              localStorage.setItem(USERS_KEY, JSON.stringify(cloudData.users));
            }
            if (cloudData?.envelope?.students) {
              setEnvelope(prev => {
                const nextEnv = ensureTeacherMayClassEnrollment(
                  { ...prev, students: cloudData.envelope!.students! },
                  cloudData.users || users
                );
                localStorage.setItem(STORAGE_KEY, JSON.stringify(nextEnv));
                return nextEnv;
              });
            }
          }).catch(e => console.warn("Realtime sync error:", e));
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "system_settings" },
        () => {
          // Whenever system_settings (googleConfig or aiTutorConfig) changes on Supabase
          fetchFromSupabase().then(cloudData => {
            if (cloudData?.googleConfig) {
              setGoogleConfig(prev => {
                const merged = { ...prev, ...cloudData.googleConfig };
                localStorage.setItem(GOOGLE_CONFIG_KEY, JSON.stringify(merged));
                return merged;
              });
            }
            if (cloudData?.aiTutorConfig) {
              setAiTutorConfig(prev => {
                const merged = { ...prev, ...cloudData.aiTutorConfig };
                localStorage.setItem(AI_TUTOR_CONFIG_KEY, JSON.stringify(merged));
                return merged;
              });
            }
          }).catch(e => console.warn("Realtime system_settings sync error:", e));
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [supabaseStatus]);

  // Supabase Google OAuth State Listener
  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) return;

    const { data: authListener } = client.auth.onAuthStateChange(async (event, session) => {
      if ((event === "SIGNED_IN" || event === "USER_UPDATED") && session?.user) {
        const suUser = session.user;
        const email = (suUser.email || "").trim().toLowerCase();
        if (!email) return;

        const name = 
          suUser.user_metadata?.full_name || 
          suUser.user_metadata?.name || 
          email.split("@")[0] || 
          "Google User";
        const avatarUrl = 
          suUser.user_metadata?.avatar_url || 
          suUser.user_metadata?.picture || 
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80";

        // Check domain whitelist if enforced
        const emailDomain = email.split("@")[1] || "";
        const isDomainAllowed = googleConfig.allowedDomains.some(d => emailDomain.toLowerCase().endsWith(d.toLowerCase()));
        
        if (googleConfig.enforceDomainRestriction && !isDomainAllowed && !email.includes("admin")) {
          alert(`ไม่อนุญาตให้เข้าสู่ระบบด้วยบัญชี @${emailDomain}\nเนื่องจากนโยบายโรงเรียนจำกัดเฉพาะโดเมน: ${googleConfig.allowedDomains.map(d => "@" + d).join(", ")}`);
          await client.auth.signOut();
          return;
        }

        // Look for existing user or provision new user
        let targetUser = users.find(u => u.email.toLowerCase() === email);
        if (!targetUser) {
          const detectedRole: RoleType = email.includes("admin") 
            ? "admin" 
            : (email.includes("teacher") || email.includes("kru") ? "teacher" : googleConfig.defaultRole);

          targetUser = {
            id: suUser.id || `user-${Date.now()}`,
            name,
            email,
            avatarUrl,
            role: detectedRole,
            department: detectedRole === "student" ? "นักเรียนห้องครูเมย์ (Google Workspace)" : "ฝ่ายวิชาการ",
            schoolId: `GGL-${Math.floor(10000 + Math.random() * 90000)}`,
            status: "active",
            lastLoginAt: new Date().toISOString()
          };

          const updated = [...users.filter(u => u.email.toLowerCase() !== email), targetUser];
          setUsers(updated);
          localStorage.setItem(USERS_KEY, JSON.stringify(updated));

          if (detectedRole === "student") {
            const newStudent: Student = {
              id: targetUser.id,
              name: targetUser.name,
              schoolId: targetUser.schoolId,
              email: targetUser.email,
              learnerProfile: undefined
            };
            setEnvelope(prev => {
              const nextEnv = enrollStudentInTeacherMayClass(prev, newStudent);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(nextEnv));
              return nextEnv;
            });
          }

          pushUserToCloud(targetUser).catch(err => console.warn("Cloud push error:", err));
        } else {
          targetUser = {
            ...targetUser,
            name: name || targetUser.name,
            avatarUrl: avatarUrl || targetUser.avatarUrl,
            department: targetUser.role === "student" ? "นักเรียนห้องครูเมย์ (Google Workspace)" : targetUser.department,
            lastLoginAt: new Date().toISOString()
          };

          const updated = users.map(u => u.id === targetUser!.id ? targetUser! : u);
          setUsers(updated);
          localStorage.setItem(USERS_KEY, JSON.stringify(updated));
          pushUserToCloud(targetUser).catch(err => console.warn("Cloud update error:", err));

          if (targetUser.role === "student") {
            const studentObj: Student = {
              id: targetUser.id,
              name: targetUser.name,
              schoolId: targetUser.schoolId,
              email: targetUser.email,
              learnerProfile: undefined
            };
            setEnvelope(prev => {
              const nextEnv = enrollStudentInTeacherMayClass(prev, studentObj);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(nextEnv));
              return nextEnv;
            });
          }
        }

        if (targetUser.status === "suspended") {
          alert("บัญชีนี้ถูกระงับการใช้งานชั่วคราวโดยผู้ดูแลระบบ กรุณาติดต่อฝ่ายสารสนเทศ");
          await client.auth.signOut();
          return;
        }

        setCurrentUserState(targetUser);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(targetUser));
        const newRole: UserRole = { type: targetUser.role, id: targetUser.id };
        setRoleState(newRole);
        localStorage.setItem(DEMO_ROLE_KEY, JSON.stringify(newRole));

        logAudit(
          "Google OAuth Sign-In",
          "auth",
          `เข้าสู่ระบบสำเร็จผ่าน Google OAuth จริง: ${email} (${targetUser.role.toUpperCase()})`
        );

        setIsGoogleModalOpen(false);

        // Clean URL hash
        if (window.location.hash && (window.location.hash.includes("access_token") || window.location.hash.includes("error"))) {
          window.history.replaceState(null, "", window.location.pathname);
        }
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [users, googleConfig]);

  useEffect(() => {
    // Load Users
    const savedUsers = localStorage.getItem(USERS_KEY);
    let activeUsers = mockAuthUsers;
    if (savedUsers) {
      try {
        activeUsers = JSON.parse(savedUsers);
        // Ensure all mockAuthUsers are included
        mockAuthUsers.forEach(mu => {
          if (!activeUsers.some(u => u.id === mu.id)) {
            activeUsers.push(mu);
          }
        });
        setUsers(activeUsers);
      } catch (e) {
        console.error("Failed to parse users", e);
        setUsers(mockAuthUsers);
      }
    } else {
      localStorage.setItem(USERS_KEY, JSON.stringify(mockAuthUsers));
    }

    // Load Google Config
    const savedConfig = localStorage.getItem(GOOGLE_CONFIG_KEY);
    if (savedConfig) {
      try {
        setGoogleConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Failed to parse google config", e);
      }
    }

    // Load AI Tutor Config
    const savedAiConfig = localStorage.getItem(AI_TUTOR_CONFIG_KEY);
    if (savedAiConfig) {
      try {
        setAiTutorConfig({ ...DEFAULT_AI_TUTOR_CONFIG, ...JSON.parse(savedAiConfig) });
      } catch (e) {
        console.error("Failed to parse AI tutor config", e);
      }
    }

    // Load Audit Logs
    const savedLogs = localStorage.getItem(AUDIT_LOGS_KEY);
    if (savedLogs) {
      try {
        setAuditLogs(JSON.parse(savedLogs));
      } catch (e) {
        console.error("Failed to parse audit logs", e);
      }
    }

    // Load Auth User
    const savedAuthUser = localStorage.getItem(AUTH_USER_KEY);
    if (savedAuthUser) {
      try {
        setCurrentUserState(JSON.parse(savedAuthUser));
      } catch (e) {
        console.error("Failed to parse auth user", e);
      }
    }

    // Load Envelope
    const savedEnvelope = localStorage.getItem(STORAGE_KEY);
    if (savedEnvelope) {
      try {
        const parsed: Envelope = JSON.parse(savedEnvelope);
        initialEnvelope.missions.forEach(m => {
          const idx = parsed.missions.findIndex(x => x.id === m.id);
          if (idx === -1) {
            parsed.missions.push(m);
          } else {
            parsed.missions[idx] = {
              ...parsed.missions[idx],
              title: m.title,
              description: m.description,
              instructions: m.instructions,
              config: m.config,
            };
          }
        });
        if (!parsed.quizHistory) parsed.quizHistory = [];
        parsed.questions = initialEnvelope.questions;
        const reconciled = ensureTeacherMayClassEnrollment(parsed, activeUsers);
        setEnvelope(reconciled);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reconciled));
      } catch (e) {
        console.error("Failed to parse envelope", e);
        const seeded = createSeededEnvelope();
        const reconciled = ensureTeacherMayClassEnrollment(seeded, activeUsers);
        setEnvelope(reconciled);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reconciled));
      }
    } else {
      const seeded = createSeededEnvelope();
      const reconciled = ensureTeacherMayClassEnrollment(seeded, activeUsers);
      setEnvelope(reconciled);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reconciled));
    }

    const savedRole = localStorage.getItem(DEMO_ROLE_KEY);
    if (savedRole) {
      try {
        setRoleState(JSON.parse(savedRole));
      } catch (e) {
        console.error("Failed to parse demo role", e);
      }
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem(DEMO_ROLE_KEY, JSON.stringify(newRole));
    
    // Sync current user avatar and profile
    const matched = users.find(u => {
      if (newRole.type === "admin") return u.role === "admin" && (u.id === newRole.id || u.id === "admin-001");
      if (newRole.type === "teacher") return u.role === "teacher" && (u.id === newRole.id || u.id === "teacher-demo");
      return u.id === newRole.id;
    });

    if (matched) {
      setCurrentUserState(matched);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(matched));
    }
  };

  const logAudit = (action: string, category: "auth" | "academic" | "security" | "system", details: string) => {
    const entry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userEmail: currentUser?.email || "anonymous@school.ac.th",
      userName: currentUser?.name || "ระบบสาธิต",
      role: (role.type as RoleType),
      category,
      action,
      details,
      ipAddress: "192.168.1.55 (Intranet)"
    };
    setAuditLogs(prev => {
      const updated = [entry, ...prev].slice(0, 100);
      localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(updated));
      return updated;
    });
    // Cloud push in background (silent fallback if offline)
    pushAuditLogToCloud(entry).catch(() => {});
  };

  const openGoogleModal = () => setIsGoogleModalOpen(true);
  const closeGoogleModal = () => setIsGoogleModalOpen(false);

  const loginWithGoogle = (account: AuthUser | { email: string; name: string; avatarUrl?: string }) => {
    let targetUser = users.find(u => u.email.toLowerCase() === account.email.toLowerCase());
    
    if (!targetUser) {
      // Auto-provision user if allowed
      const emailDomain = account.email.split("@")[1] || "";
      const isDomainAllowed = googleConfig.allowedDomains.some(d => emailDomain.toLowerCase().endsWith(d.toLowerCase()));
      
      if (googleConfig.enforceDomainRestriction && !isDomainAllowed) {
        alert(`ไม่อนุญาตให้เข้าสู่ระบบด้วยโดเมน @${emailDomain}\nกรุณาใช้บัญชี Google Workspace ของโรงเรียน (${googleConfig.allowedDomains.map(d => "@" + d).join(", ")})`);
        return;
      }

      targetUser = {
        id: `user-${Date.now()}`,
        name: account.name || account.email.split("@")[0],
        email: account.email,
        avatarUrl: account.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
        role: googleConfig.defaultRole,
        department: googleConfig.defaultRole === "student" ? "นักเรียนห้องครูเมย์ (Google Workspace)" : "ฝ่ายวิชาการ",
        schoolId: `GEN-${Math.floor(10000 + Math.random() * 90000)}`,
        status: "active",
        lastLoginAt: new Date().toISOString()
      };

      const updatedUsers = [...users, targetUser];
      setUsers(updatedUsers);
      localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));

      // Push newly provisioned user to Supabase Cloud
      pushUserToCloud(targetUser).catch(err => console.warn("Cloud push user error:", err));

      if (targetUser.role === "student") {
        const studentObj: Student = {
          id: targetUser.id,
          name: targetUser.name,
          schoolId: targetUser.schoolId,
          email: targetUser.email,
          learnerProfile: undefined
        };
        setEnvelope(prev => {
          const nextEnv = enrollStudentInTeacherMayClass(prev, studentObj);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextEnv));
          return nextEnv;
        });
      }
    } else {
      // Update last login
      targetUser = { 
        ...targetUser, 
        department: targetUser.role === "student" ? "นักเรียนห้องครูเมย์ (Google Workspace)" : targetUser.department,
        lastLoginAt: new Date().toISOString() 
      };
      const updatedUsers = users.map(u => u.id === targetUser!.id ? targetUser! : u);
      setUsers(updatedUsers);
      localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));

      // Update last login in Supabase Cloud
      pushUserToCloud(targetUser).catch(err => console.warn("Cloud update login error:", err));

      if (targetUser.role === "student") {
        const studentObj: Student = {
          id: targetUser.id,
          name: targetUser.name,
          schoolId: targetUser.schoolId,
          email: targetUser.email,
          learnerProfile: undefined
        };
        setEnvelope(prev => {
          const nextEnv = enrollStudentInTeacherMayClass(prev, studentObj);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextEnv));
          return nextEnv;
        });
      }
    }

    if (targetUser.status === "suspended") {
      alert("บัญชีนี้ถูกระงับการใช้งานชั่วคราวโดยผู้ดูแลระบบ กรุณาติดต่อฝ่ายสารสนเทศ");
      return;
    }

    setCurrentUserState(targetUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(targetUser));

    const newRole: UserRole = { type: targetUser.role, id: targetUser.id };
    setRoleState(newRole);
    localStorage.setItem(DEMO_ROLE_KEY, JSON.stringify(newRole));

    logAudit(
      "Google OAuth 2.0 Sign-In", 
      "auth", 
      `เข้าสู่ระบบสำเร็จผ่าน Google Workspace: ${targetUser.email} (${targetUser.role.toUpperCase()})`
    );

    setIsGoogleModalOpen(false);
  };

  const signInWithGoogleOAuth = async (): Promise<{ success: boolean; message?: string }> => {
    setGoogleOAuthError(null);
    const res = await supabaseSignInWithGoogleOAuth();
    if (!res.success) {
      const errMsg = res.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ Google OAuth";
      setGoogleOAuthError(errMsg);
      return { success: false, message: errMsg };
    }
    return { success: true };
  };

  const logout = () => {
    if (currentUser) {
      logAudit("User Sign-Out", "auth", `ออกจากระบบ: ${currentUser.email}`);
    }
    signOutFromSupabase().catch(e => console.warn("Supabase signout:", e));
    setCurrentUserState(null);
    localStorage.removeItem(AUTH_USER_KEY);
    // Reset to Teacher Demo as fallback
    const fallbackRole: UserRole = { type: "teacher", id: "teacher-demo" };
    setRoleState(fallbackRole);
    localStorage.setItem(DEMO_ROLE_KEY, JSON.stringify(fallbackRole));
  };

  const updateUserRole = (userId: string, newRole: RoleType) => {
    let updatedUserObj: AuthUser | null = null;
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        updatedUserObj = { ...u, role: newRole };
        return updatedUserObj;
      }
      return u;
    });
    setUsers(updatedUsers);
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    
    if (currentUser?.id === userId) {
      const updatedSelf = { ...currentUser, role: newRole };
      setCurrentUserState(updatedSelf);
      setRoleState({ type: newRole, id: userId });
    }

    if (updatedUserObj) {
      pushUserToCloud(updatedUserObj).catch(err => console.warn("Cloud update role error:", err));
    }

    logAudit("Update User Role", "security", `ปรับเปลี่ยนสิทธิ์ผู้ใช้ ${userId} เป็น ${newRole.toUpperCase()} [ซิงก์ Cloud]`);
  };

  const toggleUserStatus = (userId: string) => {
    let updatedUserObj: AuthUser | null = null;
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        const newStatus = u.status === "active" ? ("suspended" as const) : ("active" as const);
        updatedUserObj = { ...u, status: newStatus };
        logAudit("Toggle Account Status", "security", `เปลี่ยนสถานะบัญชี ${u.email} เป็น ${newStatus} [ซิงก์ Cloud]`);
        return updatedUserObj;
      }
      return u;
    });
    setUsers(updatedUsers);
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));

    if (updatedUserObj) {
      pushUserToCloud(updatedUserObj).catch(err => console.warn("Cloud update status error:", err));
    }
  };

  const addUser = (newUser: Omit<AuthUser, "id" | "lastLoginAt">) => {
    const created: AuthUser = {
      ...newUser,
      id: `user-${Date.now()}`,
      lastLoginAt: new Date().toISOString()
    };
    const updated = [...users, created];
    setUsers(updated);
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));

    // If role is student, also sync into envelope.students and assign Teacher May's missions
    if (created.role === "student") {
      const newStudent: Student = {
        id: created.id,
        name: created.name,
        schoolId: created.schoolId,
        email: created.email,
        learnerProfile: undefined
      };
      setEnvelope(prev => {
        const nextEnv = enrollStudentInTeacherMayClass(prev, newStudent);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextEnv));
        return nextEnv;
      });
    }

    // PUSH TO SUPABASE CLOUD IMMEDIATELY
    pushUserToCloud(created).catch(err => {
      console.warn("Failed to push new user to Supabase:", err);
    });

    logAudit("Provision New User", "security", `สร้างผู้ใช้ใหม่: ${created.email} (${created.role}) [ซิงก์ Cloud สำเร็จ]`);
  };

  const deleteUser = async (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (!target) return;

    const updated = users.filter(u => u.id !== userId);
    setUsers(updated);
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));

    if (target.role === "student") {
      setEnvelope(prev => {
        const nextEnv = {
          ...prev,
          students: prev.students.filter(s => s.id !== userId)
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextEnv));
        return nextEnv;
      });
    }

    // DELETE FROM SUPABASE CLOUD IMMEDIATELY
    deleteUserFromCloud(userId).catch(err => {
      console.warn("Failed to delete user from Supabase:", err);
    });

    logAudit("Delete User", "security", `ลบผู้ใช้งาน: ${target.email} (${target.role}) [ลบจาก Cloud สำเร็จ]`);
  };

  const updateGoogleConfig = (newConfig: Partial<GoogleWorkspaceConfig>) => {
    const merged = { ...googleConfig, ...newConfig };
    setGoogleConfig(merged);
    localStorage.setItem(GOOGLE_CONFIG_KEY, JSON.stringify(merged));
    
    // PUSH TO SUPABASE CLOUD IMMEDIATELY
    pushGoogleConfigToCloud(merged).catch(err => {
      console.warn("Failed to push google config to Supabase:", err);
    });

    logAudit("Update Google Workspace Config", "system", `อัปเดตการตั้งค่าโดเมน Google Workspace: ${merged.allowedDomains.join(", ")} [ซิงก์ Cloud]`);
  };

  const updateEnvelope = (newEnvelope: Envelope) => {
    newEnvelope.revision += 1;
    setEnvelope(newEnvelope);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newEnvelope));
  };

  const saveDraft = (draft: Draft) => {
    const newEnvelope = { ...envelope };
    const existingIdx = newEnvelope.drafts.findIndex(
      (d) => d.studentId === draft.studentId && d.missionId === draft.missionId
    );
    
    // Add participation if first time
    if (!newEnvelope.participations.find(p => p.studentId === draft.studentId && p.missionId === draft.missionId)) {
      newEnvelope.participations.push({
        studentId: draft.studentId,
        missionId: draft.missionId,
        startedAt: new Date().toISOString()
      });
    }

    if (existingIdx >= 0) {
      newEnvelope.drafts[existingIdx] = draft;
    } else {
      newEnvelope.drafts.push(draft);
    }
    updateEnvelope(newEnvelope);
  };

  const submitAttempt = (draft: Draft) => {
    const newEnvelope = { ...envelope };
    
    const previousAttempts = newEnvelope.attempts.filter(
      (a) => a.studentId === draft.studentId && a.missionId === draft.missionId
    );
    
    const mission = newEnvelope.missions.find(m => m.id === draft.missionId);
    if (!mission) return;

    const newAttempt: Attempt = {
      id: `attempt-${Date.now()}`,
      studentId: draft.studentId,
      missionId: draft.missionId,
      attemptNo: previousAttempts.length + 1,
      type: mission.type,
      content: draft.content,
      language: draft.language,
      revisionNote: draft.revisionNote,
      submittedAt: new Date().toISOString(),
      submissionToken: `token-${Date.now()}`
    };

    newEnvelope.attempts.push(newAttempt);
    // clear draft
    newEnvelope.drafts = newEnvelope.drafts.filter(
      (d) => !(d.studentId === draft.studentId && d.missionId === draft.missionId)
    );
    
    // Recompute real learner profile from actual submitted work traces
    const realProfile = computeRealLearnerProfile(draft.studentId, newEnvelope);
    newEnvelope.students = newEnvelope.students.map(s => 
      s.id === draft.studentId ? { ...s, learnerProfile: realProfile } : s
    );

    updateEnvelope(newEnvelope);
    // Cloud push in background (silent fallback if offline)
    pushAttemptToCloud(newAttempt).catch(() => {});
  };

  const submitQuiz = (missionId: string, studentId: string, answers: Record<string, string>): QuizHistoryEntry | null => {
    const newEnvelope = { ...envelope };
    const mission = newEnvelope.missions.find(m => m.id === missionId);
    if (!mission || mission.type !== "quiz") return null;

    const questions = mission.config.questions || mockQuizQuestions;
    let correctCount = 0;

    questions.forEach(q => {
      if (answers[q.id] === q.correctOptionId) {
        correctCount++;
      }
    });

    const maxScore = questions.length;
    const percentScore = Number(((correctCount / maxScore) * 100).toFixed(1));
    const passThreshold = mission.config.passPercent || 80;
    const passed = percentScore >= passThreshold;

    const previousQuizAttempts = newEnvelope.quizHistory.filter(
      h => h.missionId === missionId && h.studentId === studentId
    );

    const historyEntry: QuizHistoryEntry = {
      id: `quiz-attempt-${Date.now()}`,
      missionId,
      studentId,
      attemptNo: previousQuizAttempts.length + 1,
      answers,
      score: correctCount,
      maxScore,
      percentScore,
      passed,
      submittedAt: new Date().toISOString()
    };

    newEnvelope.quizHistory.push(historyEntry);

    // Also mark participation if not present
    if (!newEnvelope.participations.some(p => p.studentId === studentId && p.missionId === missionId)) {
      newEnvelope.participations.push({
        studentId,
        missionId,
        startedAt: new Date().toISOString()
      });
    }

    // Recompute real learner profile from actual submitted work traces
    const realProfile = computeRealLearnerProfile(studentId, newEnvelope);
    newEnvelope.students = newEnvelope.students.map(s => 
      s.id === studentId ? { ...s, learnerProfile: realProfile } : s
    );

    updateEnvelope(newEnvelope);
    // Cloud push in background (silent fallback if offline)
    pushQuizHistoryToCloud(historyEntry).catch(() => {});
    return historyEntry;
  };

  const requestChanges = (attemptId: string, feedback: string) => {
    const newEnvelope = { ...envelope };
    const newReview: Review = {
      id: `review-${Date.now()}`,
      attemptId,
      teacherId: "teacher-demo",
      publicationStatus: "published",
      decision: "request_changes",
      feedback,
      criterionScores: null,
      rawScore: null,
      maxRawScore: 6,
      percentScore: null,
      outcome: "not-assessed",
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
    };
    newEnvelope.reviews.push(newReview);

    const targetAttempt = newEnvelope.attempts.find(a => a.id === attemptId);
    if (targetAttempt) {
      const realProfile = computeRealLearnerProfile(targetAttempt.studentId, newEnvelope);
      newEnvelope.students = newEnvelope.students.map(s => 
        s.id === targetAttempt.studentId ? { ...s, learnerProfile: realProfile } : s
      );
    }

    updateEnvelope(newEnvelope);
  };

  const finalizeReview = (attemptId: string, feedback: string, scores: Record<string, number>) => {
    const newEnvelope = { ...envelope };
    const attempt = newEnvelope.attempts.find(a => a.id === attemptId);
    if (!attempt) return;
    
    const mission = newEnvelope.missions.find(m => m.id === attempt.missionId);
    if (!mission || !mission.config.rubric) return;

    const rubric = mission.config.rubric;
    let rawScore = 0;
    Object.values(scores).forEach(s => rawScore += s);
    
    let isPass = rawScore >= rubric.passRawPoints;
    for (const reqId of rubric.requiredFullScoreCriterionIds) {
      const crit = rubric.criteria.find(c => c.id === reqId);
      if (crit && scores[reqId] < crit.maxPoints) {
        isPass = false;
      }
    }

    const newReview: Review = {
      id: `review-${Date.now()}`,
      attemptId,
      teacherId: "teacher-demo",
      publicationStatus: "published",
      decision: "finalize",
      feedback,
      criterionScores: scores,
      rawScore,
      maxRawScore: 6,
      percentScore: Number(((rawScore / 6) * 100).toFixed(1)),
      outcome: isPass ? "meets-criteria" : "needs-practice",
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
    };
    newEnvelope.reviews.push(newReview);

    // Recompute real learner profile from actual submitted & evaluated work traces
    const realProfile = computeRealLearnerProfile(attempt.studentId, newEnvelope);
    newEnvelope.students = newEnvelope.students.map(s => 
      s.id === attempt.studentId ? { ...s, learnerProfile: realProfile } : s
    );

    updateEnvelope(newEnvelope);
    // Cloud push in background (silent fallback if offline)
    pushReviewToCloud(newReview).catch(() => {});
  };

  const createMission = (newMission: Mission) => {
    const newEnvelope = { ...envelope };
    newEnvelope.missions.unshift(newMission);
    updateEnvelope(newEnvelope);
  };

  const getWorkStatus = (studentId: string, missionId: string): WorkStatus => {
    const mission = envelope.missions.find(m => m.id === missionId);
    
    // Quiz handling
    if (mission && mission.type === "quiz") {
      const history = envelope.quizHistory.filter(h => h.studentId === studentId && h.missionId === missionId);
      if (history.length > 0) return "reviewed";
      const hasParticipation = envelope.participations.some(p => p.studentId === studentId && p.missionId === missionId);
      if (hasParticipation) return "started";
      return "not-started";
    }

    // Short-answer & Coding handling
    const attempts = envelope.attempts.filter(a => a.studentId === studentId && a.missionId === missionId);
    
    if (attempts.length > 0) {
      const latestAttempt = attempts[attempts.length - 1];
      const reviews = envelope.reviews.filter(r => r.attemptId === latestAttempt.id && r.publicationStatus === "published");
      
      if (reviews.length > 0) {
        const latestReview = reviews[reviews.length - 1];
        if (latestReview.decision === "finalize") return "reviewed";
        if (latestReview.decision === "request_changes") return "changes-requested";
      }
      return "submitted";
    }

    const hasDraft = envelope.drafts.some(d => d.studentId === studentId && d.missionId === missionId);
    const hasParticipation = envelope.participations.some(p => p.studentId === studentId && p.missionId === missionId);
    
    if (hasDraft || hasParticipation) return "started";
    
    return "not-started";
  };

  const recordPulseRating = (type: "attempt" | "quiz", id: string, pulseRating: string) => {
    const newEnvelope = { ...envelope };
    if (type === "attempt") {
      const att = newEnvelope.attempts.find(a => a.id === id);
      if (att) {
        att.pulseRating = pulseRating;
      }
    } else {
      const q = newEnvelope.quizHistory.find(item => item.id === id);
      if (q) {
        q.pulseRating = pulseRating;
      }
    }
    updateEnvelope(newEnvelope);
  };

  const resetData = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(DEMO_ROLE_KEY);
    localStorage.removeItem(USERS_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(GOOGLE_CONFIG_KEY);
    localStorage.removeItem(AUDIT_LOGS_KEY);
    setEnvelope(initialEnvelope);
    setUsers(mockAuthUsers);
    setCurrentUserState(mockAuthUsers[1]);
    setGoogleConfig(initialGoogleConfig);
    setAuditLogs(initialAuditLogs);
    setRoleState({ type: "teacher", id: "teacher-demo" });
  };

  const loadSeededClassroom = () => {
    const seeded = createSeededEnvelope();
    setEnvelope(seeded);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  };

  const updateSupabaseCredentials = async (url: string, anonKey: string): Promise<{ success: boolean; message: string }> => {
    setSupabaseStatus("checking");
    const res = await testSupabaseConnection(url, anonKey);
    if (res.success) {
      saveSupabaseConfig(url, anonKey);
      setSupabaseConfigState({ url: url.trim(), anonKey: anonKey.trim() });
      setSupabaseStatus("connected");
      logAudit("บันทึกการตั้งค่า Supabase", "system", `เชื่อมต่อฐานข้อมูล Supabase Cloud สำเร็จ (${url.trim()})`);
      return { success: true, message: "เชื่อมต่อ Supabase สำเร็จและบันทึกการตั้งค่าเรียบร้อยแล้ว" };
    } else {
      setSupabaseStatus("error");
      return { success: false, message: res.message };
    }
  };

  const testCloudConnection = async (url?: string, anonKey?: string): Promise<{ success: boolean; message: string }> => {
    return await testSupabaseConnection(url, anonKey);
  };

  const seedToCloud = async (): Promise<CloudSyncResult> => {
    const res = await seedAllToSupabase(envelope, users, googleConfig, auditLogs);
    if (res.success) {
      logAudit("ซิงก์ข้อมูลขึ้น Supabase", "system", "นำเข้าโครงสร้างและข้อมูลขึ้นฐานข้อมูล Supabase Cloud สำเร็จ");
    }
    return res;
  };

  const fetchCloudData = async (): Promise<{ success: boolean; message: string }> => {
    const data = await fetchFromSupabase();
    if (!data) {
      return { success: false, message: "ไม่สามารถดึงข้อมูลจาก Supabase ได้ กรุณาตรวจสอบการเชื่อมต่อ" };
    }
    if (data.users && data.users.length > 0) {
      setUsers(data.users);
      localStorage.setItem(USERS_KEY, JSON.stringify(data.users));
    }
    if (data.envelope) {
      setEnvelope(prev => {
        const merged: Envelope = {
          ...prev,
          ...(data.envelope?.missions ? { missions: data.envelope.missions } : {}),
          ...(data.envelope?.attempts ? { attempts: data.envelope.attempts } : {}),
          ...(data.envelope?.reviews ? { reviews: data.envelope.reviews } : {}),
          ...(data.envelope?.quizHistory ? { quizHistory: data.envelope.quizHistory } : {}),
          ...(data.envelope?.students ? { students: data.envelope.students } : {}),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return merged;
      });
    }
    if (data.auditLogs && data.auditLogs.length > 0) {
      setAuditLogs(data.auditLogs);
      localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(data.auditLogs));
    }
    if (data.aiTutorConfig) {
      setAiTutorConfig(prev => {
        const merged = { ...prev, ...data.aiTutorConfig };
        localStorage.setItem(AI_TUTOR_CONFIG_KEY, JSON.stringify(merged));
        return merged;
      });
    }
    if (data.googleConfig) {
      setGoogleConfig(prev => {
        const merged = { ...prev, ...data.googleConfig };
        localStorage.setItem(GOOGLE_CONFIG_KEY, JSON.stringify(merged));
        return merged;
      });
    }
    return { success: true, message: "ดึงข้อมูลล่าสุดจาก Supabase Cloud สำเร็จ" };
  };

  const updateAiTutorConfig = async (partial: Partial<AiTutorConfig>): Promise<{ success: boolean; message: string }> => {
    try {
      const updated = { ...aiTutorConfig, ...partial };
      setAiTutorConfig(updated);
      localStorage.setItem(AI_TUTOR_CONFIG_KEY, JSON.stringify(updated));

      const cloudRes = await pushAiTutorConfigToCloud(updated);
      logAudit("Update AI Tutor Config", "system", `อัปเดตการตั้งค่า AI Tutor (Model: ${updated.model}, Style: ${updated.teachingStyle})`);
      return { 
        success: true, 
        message: cloudRes 
          ? "บันทึกการตั้งค่า AI Tutor และซิงก์สู่ Supabase Cloud เรียบร้อยแล้ว" 
          : "บันทึกการตั้งค่าในเบราว์เซอร์แล้ว (Supabase ยังไม่ได้เชื่อมต่อ)" 
      };
    } catch (e: any) {
      return { success: false, message: e?.message || "บันทึกการตั้งค่าล้มเหลว" };
    }
  };

  const testAiTutorConnection = async (overrideConfig?: AiTutorConfig) => {
    return await testGeminiApiConnection(overrideConfig || aiTutorConfig);
  };

  return (
    <AppContext.Provider value={{
      role, 
      setRole, 
      currentUser,
      users,
      googleConfig,
      auditLogs,
      aiTutorConfig,
      updateAiTutorConfig,
      testAiTutorConnection,
      isAiDrawerOpen,
      openAiDrawer,
      closeAiDrawer,
      initialAiPrompt,
      isGoogleModalOpen,
      openGoogleModal,
      closeGoogleModal,
      loginWithGoogle,
      signInWithGoogleOAuth,
      googleOAuthError,
      clearGoogleOAuthError,
      googleCallbackUrl,
      logout,
      updateUserRole,
      toggleUserStatus,
      addUser,
      deleteUser,
      updateGoogleConfig,
      logAudit,
      envelope, 
      saveDraft, 
      submitAttempt, 
      submitQuiz, 
      requestChanges, 
      finalizeReview, 
      getWorkStatus, 
      createMission, 
      recordPulseRating,
      resetData,
      loadSeededClassroom,
      supabaseStatus,
      isSupabaseConnected: supabaseStatus === "connected",
      supabaseConfig: supabaseConfigState,
      updateSupabaseCredentials,
      testCloudConnection,
      seedToCloud,
      fetchCloudData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
