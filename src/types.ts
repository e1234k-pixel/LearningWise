export type MissionType = "quiz" | "short-answer" | "coding";
export type MissionStatus = "published";

export interface CriterionLevel {
  [key: string]: string;
}

export interface Criterion {
  id: string;
  label: string;
  maxPoints: number;
  levels: CriterionLevel;
}

export interface Rubric {
  criteria: Criterion[];
  passRawPoints: number;
  requiredFullScoreCriterionIds: string[];
}

export interface QuizOption {
  id: string;
  label: string; // e.g. "ก", "ข", "ค", "ง"
  text: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
}

export interface CodeExample {
  input: string;
  output: string;
  note?: string;
}

export interface MissionConfig {
  prompt: string;
  minLength?: number | null;
  maxLength?: number | null;
  rubric?: Rubric;
  
  // Coding specific
  language?: string;
  starterCode?: string;
  inputConstraints?: string;
  examples?: CodeExample[];

  // Quiz specific
  questionIds?: string[];
  passPercent?: number;
  questions?: QuizQuestion[];
}

export interface Mission {
  id: string;
  type: MissionType;
  title: string;
  topic: string;
  objectiveIds: string[];
  description: string;
  instructions: string;
  estimatedMinutes: number;
  dueDate: string; // YYYY-MM-DD
  status: MissionStatus;
  targetStudentIds: string[];
  createdAt: string; // ISO-8601
  updatedAt: string; // ISO-8601
  config: MissionConfig;
}

export interface Draft {
  studentId: string;
  missionId: string;
  basedOnAttemptId: string | null;
  content: string;
  language: string | null;
  revisionNote: string;
  updatedAt: string; // ISO-8601
}

export interface Attempt {
  id: string;
  studentId: string;
  missionId: string;
  attemptNo: number;
  type: MissionType;
  content: string;
  language: string | null;
  revisionNote: string;
  submittedAt: string; // ISO-8601
  submissionToken: string;
  pulseRating?: string;
}

export type ReviewPublicationStatus = "draft" | "published";
export type ReviewDecision = "request_changes" | "finalize";
export type EvaluationOutcome = "not-assessed" | "meets-criteria" | "needs-practice" | "insufficient-evidence";

export interface Review {
  id: string;
  attemptId: string;
  teacherId: string;
  publicationStatus: ReviewPublicationStatus;
  decision: ReviewDecision | null;
  feedback: string;
  criterionScores: Record<string, number> | null;
  rawScore: number | null;
  maxRawScore: number;
  percentScore: number | null;
  outcome: EvaluationOutcome;
  updatedAt: string; // ISO-8601
  publishedAt: string | null; // ISO-8601
}

export interface QuizHistoryEntry {
  id: string;
  missionId: string;
  studentId: string;
  attemptNo: number;
  answers: Record<string, string>; // questionId -> optionId
  score: number;
  maxScore: number;
  percentScore: number;
  passed: boolean;
  submittedAt: string;
  pulseRating?: string;
}

export type LearnerPersona = 
  | "Hands-on Coder" 
  | "Conceptual Explainer" 
  | "Fast Explorer" 
  | "Balanced Learner" 
  | "Resilient Improver";

export interface LearnerTelemetry {
  engagementSpeed: "เริ่มทันที (Fast)" | "ปานกลาง (Medium)" | "ต้องกระตุ้น (Needs Push)";
  resilienceIndex: "สูงมาก (High Grit)" | "มั่นคง (Steady)" | "ต้องการการชี้แนะ (Needs Support)";
  preferredModality: "เขียนโค้ด (Coding)" | "อธิบายแนวคิด (Short Answer)" | "ทำแบบทดสอบสั้น (Quiz)";
}

export interface LearnerProfile {
  persona: LearnerPersona;
  personaTitle: string;
  tagline: string;
  affinityScores: {
    coding: number;      // 0 - 100
    conceptual: number;  // 0 - 100
    quiz: number;        // 0 - 100
  };
  telemetry: LearnerTelemetry;
  teacherRecommendation: string;
}

export interface Student {
  id: string;
  name: string;
  learnerProfile?: LearnerProfile;
}

export interface Envelope {
  schemaVersion: number;
  revision: number;
  missions: Mission[];
  students: Student[];
  objectives: any[];
  drafts: Draft[];
  participations: { studentId: string; missionId: string; startedAt: string }[];
  attempts: Attempt[];
  reviews: Review[];
  quizHistory: QuizHistoryEntry[];
  quizDrafts: any[];
  questions: QuizQuestion[];
  legacyRecords: any[];
}

export type RoleType = "admin" | "teacher" | "student";

export type UserRole = 
  | { type: "admin"; id: string }
  | { type: "teacher"; id: string }
  | { type: "student"; id: string };

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: RoleType;
  department?: string;
  schoolId?: string;
  status: "active" | "suspended";
  lastLoginAt: string; // ISO string
}

export interface GoogleWorkspaceConfig {
  allowedDomains: string[];
  enforceDomainRestriction: boolean;
  autoProvisioning: boolean;
  defaultRole: RoleType;
  schoolName: string;
  academicYear: string;
  currentTerm: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO string
  userEmail: string;
  userName: string;
  role: RoleType;
  category: "auth" | "academic" | "security" | "system";
  action: string;
  details: string;
  ipAddress: string;
}

// สถานะงานสำหรับแสดงผล
export type WorkStatus = "not-started" | "started" | "submitted" | "changes-requested" | "reviewed";
