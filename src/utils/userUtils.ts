import type { AuthUser, RoleType, Student, Envelope, LearnerProfile } from "../types";

/**
 * ตรวจสอบว่า ID เป็น UUID หรือรหัสที่ถูกเจนอัตโนมัติ (เช่น Supabase Auth UUID หรือ timestamp) หรือไม่
 */
export function isUuidLike(id: string): boolean {
  if (!id) return false;
  // Standard UUID format: 8-4-4-4-12 hex digits
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidPattern.test(id)) return true;
  // Long hyphenated IDs or timestamp IDs (e.g. user-171829...)
  if (id.length > 20 && (id.includes("-") || id.startsWith("user-"))) return true;
  return false;
}

/**
 * ตรวจสอบว่าผู้ใช้มาจากระบบ Google Workspace / Google OAuth หรือไม่
 */
export function isGoogleAccount(user?: AuthUser, rawId?: string): boolean {
  if (user) {
    if (user.department?.includes("Google Workspace") || user.department?.includes("Google")) return true;
    if (user.schoolId?.startsWith("GGL-") || user.schoolId?.startsWith("GEN-")) return true;
    if (isUuidLike(user.id)) return true;
    // If has email and is not mock teacher/admin/student
    if (user.email && !user.id.startsWith("admin-") && !user.id.startsWith("teacher-") && !user.id.startsWith("student-")) {
      return true;
    }
  }
  if (rawId && isUuidLike(rawId)) return true;
  return false;
}

/**
 * แปลงรหัสนักเรียนเป็นรหัสที่สะอาด อ่านง่าย และเป็นระเบียบ
 * ตัวอย่าง:
 * - student-001 -> student-001
 * - c586e91a-667c-432a-99cc-a069bcd42749 (ลำดับที่ 9) -> student-009
 */
export function getCleanStudentId(
  student: { id: string; schoolId?: string },
  index?: number,
  user?: AuthUser
): string {
  // หากเป็นรหัส mock รูปแบบมาตรฐานอยู่แล้ว (เช่น student-001)
  if (student.id.startsWith("student-") && student.id.length <= 15) {
    return student.id;
  }

  // หากมีลำดับ Index ในห้องเรียน (เช่น คนที่ 9 -> student-009)
  if (typeof index === "number" && index >= 0) {
    return `student-${String(index + 1).padStart(3, "0")}`;
  }

  // หากมี schoolId ที่ระบุไว้ (เช่น GGL-40109 หรือ STD-40109)
  if (student.schoolId) return student.schoolId;
  if (user?.schoolId) return user.schoolId;

  // Fallback: ใช้ตัวอักษร 4 ตัวแรกของ UUID
  const shortHash = student.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toLowerCase();
  return `student-${shortHash || "new"}`;
}

/**
 * ดึงชื่อประเภทบัญชีภาษาไทยที่เป็นมิตร
 * เช่น "Google Workspace", "นักเรียน", "ครูผู้สอน", "Admin"
 */
export function getAccountTypeLabel(
  role: RoleType,
  user?: AuthUser,
  rawId?: string
): string {
  if (isGoogleAccount(user, rawId)) {
    return "Google Workspace";
  }

  switch (role) {
    case "admin":
      return "Admin";
    case "teacher":
      return "ครูผู้สอน";
    case "student":
      return "นักเรียน";
    default:
      return "ผู้ใช้งาน";
  }
}

/**
 * สร้าง Label มาตรฐานสำหรับ Dropdown สลับบทบาท (RoleSelector)
 * รูปแบบ: [Icon] [ชื่อ] ([รหัส ID สะอาด]) ([ประเภทบัญชี])
 * ตัวอย่าง:
 * - 🛡️ อ.ดร.สมศักดิ์ นวัตกรรม (SCH-0001) (Admin)
 * - 👩‍🏫 ครูเมย์ ชลธิชา (TCH-0421) (ครูผู้สอน)
 * - 🎓 ต้นกล้า การดี (น้องต้น) (student-001) (นักเรียน)
 * - 🎓 เอกนรินทร์ อิ่มรส (student-009) (Google Workspace)
 */
export function formatUserOptionLabel(params: {
  icon?: string;
  name: string;
  id: string;
  role: RoleType;
  schoolId?: string;
  user?: AuthUser;
  index?: number;
}): string {
  const { icon, name, id, role, schoolId, user, index } = params;
  const isGoogle = isGoogleAccount(user, id);

  // คำนวณรหัส ID สะอาด
  let cleanId = id;
  if (role === "student") {
    cleanId = getCleanStudentId({ id, schoolId }, index, user);
  } else if (isUuidLike(id)) {
    cleanId = schoolId || user?.schoolId || (role === "admin" ? `admin-00${(index ?? 0) + 2}` : `teacher-00${(index ?? 0) + 2}`);
  } else if (schoolId) {
    cleanId = schoolId;
  }

  // ประเภทบัญชี
  const accountType = isGoogle ? "Google Workspace" : role === "admin" ? "Admin" : role === "teacher" ? "ครูผู้สอน" : "นักเรียน";

  const prefix = icon ? `${icon} ` : "";
  return `${prefix}${name} (${cleanId}) (${accountType})`;
}

/**
 * ค้นหา AuthUser ที่ตรงกับ Student จาก id หรือ name
 */
export function findMatchingUser(
  student: Student,
  users: AuthUser[]
): AuthUser | undefined {
  return users.find(u => u.id === student.id || u.name.trim().toLowerCase() === student.name.trim().toLowerCase());
}

/**
 * โพรไฟล์การเรียนรู้ตั้งต้นสำหรับนักเรียนใหม่ที่เข้ามาในห้องเรียนครูเมย์
 */
export const DEFAULT_NEW_STUDENT_PROFILE: LearnerProfile = {
  persona: "Balanced Learner",
  personaTitle: "สายสำรวจและพัฒนา (Adaptive Learner)",
  tagline: "นักเรียนห้องครูเมย์ ชลธิชา พร้อมฝึกฝนและพัฒนาทักษะการคิดเชิงคำนวณอย่างเป็นระบบ",
  affinityScores: { coding: 70, conceptual: 70, quiz: 75 },
  telemetry: {
    engagementSpeed: "เริ่มทันที (Fast)",
    resilienceIndex: "มั่นคง (Steady)",
    preferredModality: "เขียนโค้ด (Coding)"
  },
  teacherRecommendation: "ได้รับมอบหมายภารกิจจากครูเมย์เรียบร้อยแล้ว สามารถเริ่มทำแบบทดสอบ ข้อเขียน และเขียนโค้ดเพื่อส่งตรวจรับข้อเสนอแนะรายบุคคลได้ทันที"
};

/**
 * บรรจุนักเรียนใหม่เข้าเป็นนักเรียนห้องครูเมย์ (Teacher May - teacher-demo)
 * และมอบหมายภารกิจทั้งหมดของครูเมย์ให้นักเรียนทำส่งได้ทันที
 */
export function enrollStudentInTeacherMayClass(
  envelope: Envelope,
  student: Student
): Envelope {
  const studentWithProfile: Student = {
    ...student,
    learnerProfile: student.learnerProfile || DEFAULT_NEW_STUDENT_PROFILE
  };

  // 1. เพิ่มหรืออัปเดตนักเรียนในรายการ students
  const studentExists = envelope.students.some(s => s.id === student.id);
  const nextStudents = studentExists
    ? envelope.students.map(s => s.id === student.id ? { ...studentWithProfile, learnerProfile: s.learnerProfile || DEFAULT_NEW_STUDENT_PROFILE } : s)
    : [...envelope.students, studentWithProfile];

  // 2. มอบหมายภารกิจของครูเมย์ทั้งหมดให้นักเรียนมีสิทธิ์ทำและส่งได้ทันที
  const nextMissions = envelope.missions.map(mission => {
    const currentTargets = mission.targetStudentIds || [];
    if (!currentTargets.includes(student.id)) {
      return {
        ...mission,
        targetStudentIds: [...currentTargets, student.id]
      };
    }
    return mission;
  });

  return {
    ...envelope,
    students: nextStudents,
    missions: nextMissions
  };
}

/**
 * ตรวจสอบและซิงก์นักเรียนทุกคนในระบบ (โดยเฉพาะผู้ที่ Login ด้วย Google หรือสร้างใหม่)
 * ให้เข้าสังกัดห้องครูเมย์และได้รับมอบหมายงานของครูเมย์ครบถ้วนพร้อมส่งตรวจ
 */
export function ensureTeacherMayClassEnrollment(
  envelope: Envelope,
  allUsers?: AuthUser[]
): Envelope {
  const studentMap = new Map<string, Student>();
  
  // นำนักเรียนเดิมใน envelope เข้า map
  envelope.students.forEach(s => {
    studentMap.set(s.id, {
      ...s,
      learnerProfile: s.learnerProfile || DEFAULT_NEW_STUDENT_PROFILE
    });
  });

  // นำ user ที่เป็น student แต่ยังไม่อยู่ใน envelope เข้า map
  if (allUsers) {
    allUsers.filter(u => u.role === "student").forEach(u => {
      if (!studentMap.has(u.id)) {
        studentMap.set(u.id, {
          id: u.id,
          name: u.name,
          schoolId: u.schoolId,
          email: u.email,
          learnerProfile: DEFAULT_NEW_STUDENT_PROFILE
        });
      }
    });
  }

  const allStudentIds = Array.from(studentMap.keys());
  const updatedStudents = Array.from(studentMap.values());

  // มอบหมายภารกิจของห้องเรียนครูเมย์ให้นักเรียนทุกคนในห้อง
  const updatedMissions = envelope.missions.map(mission => {
    const targetSet = new Set(mission.targetStudentIds || []);
    allStudentIds.forEach(id => targetSet.add(id));
    return {
      ...mission,
      targetStudentIds: Array.from(targetSet)
    };
  });

  return {
    ...envelope,
    students: updatedStudents,
    missions: updatedMissions
  };
}

