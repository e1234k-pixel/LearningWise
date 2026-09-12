import type { AuthUser, RoleType, Student } from "../types";

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
