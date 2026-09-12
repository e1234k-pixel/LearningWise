import { getSupabaseClient } from "../lib/supabase";
import type { 
  Envelope, 
  AuthUser, 
  GoogleWorkspaceConfig, 
  AuditLogEntry, 
  Attempt, 
  Review, 
  QuizHistoryEntry, 
  Mission, 
  Student,
  AiTutorConfig
} from "../types";

export interface CloudSyncResult {
  success: boolean;
  message: string;
  syncedCounts?: {
    profiles: number;
    missions: number;
    attempts: number;
    reviews: number;
    quizHistory: number;
    auditLogs: number;
  };
}

/**
 * ซิงก์ชุดข้อมูลทั้งหมดจาก Local State ขึ้นตารางฐานข้อมูล Supabase
 */
export async function seedAllToSupabase(
  envelope: Envelope,
  users: AuthUser[],
  googleConfig: GoogleWorkspaceConfig,
  auditLogs: AuditLogEntry[]
): Promise<CloudSyncResult> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: "ยังไม่ได้เชื่อมต่อ Supabase Client กรุณาระบุ URL และ Anon Key",
    };
  }

  try {
    // 1. Sync Profiles (รวม users และ students)
    const profileRows = users.map((u) => {
      const studentMatch = envelope.students.find((s) => s.id === u.id);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        avatar_url: u.avatarUrl || null,
        role: u.role,
        department: u.department || null,
        school_id: u.schoolId || null,
        status: u.status,
        learner_profile: studentMatch?.learnerProfile || null,
        last_login_at: u.lastLoginAt,
      };
    });

    const { error: profileErr } = await client
      .from("profiles")
      .upsert(profileRows, { onConflict: "id" });
    if (profileErr) throw profileErr;

    // 2. Sync Missions
    const missionRows = envelope.missions.map((m) => ({
      id: m.id,
      type: m.type,
      title: m.title,
      topic: m.topic,
      objective_ids: m.objectiveIds || [],
      description: m.description,
      instructions: m.instructions,
      estimated_minutes: m.estimatedMinutes,
      due_date: m.dueDate,
      status: m.status,
      target_student_ids: m.targetStudentIds || [],
      config: m.config,
    }));

    const { error: missionErr } = await client
      .from("missions")
      .upsert(missionRows, { onConflict: "id" });
    if (missionErr) throw missionErr;

    // 3. Sync Attempts
    if (envelope.attempts.length > 0) {
      const attemptRows = envelope.attempts.map((a) => ({
        id: a.id,
        student_id: a.studentId,
        mission_id: a.missionId,
        attempt_no: a.attemptNo,
        type: a.type,
        content: a.content,
        language: a.language || null,
        revision_note: a.revisionNote || "",
        submitted_at: a.submittedAt,
        submission_token: a.submissionToken,
        pulse_rating: a.pulseRating || null,
      }));

      const { error: attErr } = await client
        .from("attempts")
        .upsert(attemptRows, { onConflict: "id" });
      if (attErr) throw attErr;
    }

    // 4. Sync Reviews
    if (envelope.reviews.length > 0) {
      const reviewRows = envelope.reviews.map((r) => ({
        id: r.id,
        attempt_id: r.attemptId,
        teacher_id: r.teacherId,
        publication_status: r.publicationStatus,
        decision: r.decision,
        feedback: r.feedback,
        criterion_scores: r.criterionScores,
        raw_score: r.rawScore,
        max_raw_score: r.maxRawScore,
        percent_score: r.percentScore,
        outcome: r.outcome,
        updated_at: r.updatedAt,
        published_at: r.publishedAt,
      }));

      const { error: revErr } = await client
        .from("reviews")
        .upsert(reviewRows, { onConflict: "id" });
      if (revErr) throw revErr;
    }

    // 5. Sync Quiz History
    if (envelope.quizHistory.length > 0) {
      const quizRows = envelope.quizHistory.map((q) => ({
        id: q.id,
        mission_id: q.missionId,
        student_id: q.studentId,
        attempt_no: q.attemptNo,
        answers: q.answers,
        score: q.score,
        max_score: q.maxScore,
        percent_score: q.percentScore,
        passed: q.passed,
        pulse_rating: q.pulseRating || null,
        submitted_at: q.submittedAt,
      }));

      const { error: qErr } = await client
        .from("quiz_history")
        .upsert(quizRows, { onConflict: "id" });
      if (qErr) throw qErr;
    }

    // 6. Sync Audit Logs
    if (auditLogs.length > 0) {
      const logRows = auditLogs.map((l) => ({
        id: l.id,
        timestamp: l.timestamp,
        user_email: l.userEmail,
        user_name: l.userName,
        role: l.role,
        category: l.category,
        action: l.action,
        details: l.details,
        ip_address: l.ipAddress,
      }));

      const { error: logErr } = await client
        .from("audit_logs")
        .upsert(logRows, { onConflict: "id" });
      if (logErr) throw logErr;
    }

    // 7. Sync Google Config & System Settings
    const { error: setErr } = await client
      .from("system_settings")
      .upsert([
        { key: "google_workspace_config", value: googleConfig },
        { key: "last_sync_timestamp", value: new Date().toISOString() },
      ], { onConflict: "key" });
    if (setErr) throw setErr;

    return {
      success: true,
      message: "ซิงก์ข้อมูลขึ้น Supabase Cloud สำเร็จเรียบร้อยครบทุกตาราง!",
      syncedCounts: {
        profiles: profileRows.length,
        missions: missionRows.length,
        attempts: envelope.attempts.length,
        reviews: envelope.reviews.length,
        quizHistory: envelope.quizHistory.length,
        auditLogs: auditLogs.length,
      },
    };
  } catch (err: any) {
    console.error("Supabase Seed Error:", err);
    return {
      success: false,
      message: `เกิดข้อผิดพลาดในการซิงก์ข้อมูล: ${err.message || String(err)}`,
    };
  }
}

/**
 * ดึงข้อมูลสดจาก Supabase (ถ้ามี)
 */
export async function fetchFromSupabase(): Promise<{
  envelope?: Partial<Envelope>;
  users?: AuthUser[];
  auditLogs?: AuditLogEntry[];
  googleConfig?: GoogleWorkspaceConfig;
  aiTutorConfig?: AiTutorConfig;
} | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const [
      { data: profiles },
      { data: missions },
      { data: attempts },
      { data: reviews },
      { data: quizHistory },
      { data: auditLogs },
      { data: settings },
    ] = await Promise.all([
      client.from("profiles").select("*"),
      client.from("missions").select("*"),
      client.from("attempts").select("*"),
      client.from("reviews").select("*"),
      client.from("quiz_history").select("*"),
      client.from("audit_logs").select("*").order("timestamp", { ascending: false }).limit(100),
      client.from("system_settings").select("*"),
    ]);

    const result: any = {};

    if (profiles && profiles.length > 0) {
      result.users = profiles.map((p: any): AuthUser => ({
        id: p.id,
        name: p.name,
        email: p.email,
        avatarUrl: p.avatar_url,
        role: p.role,
        department: p.department,
        schoolId: p.school_id,
        status: p.status,
        lastLoginAt: p.last_login_at,
      }));

      // Map students
      const students: Student[] = profiles
        .filter((p: any) => p.role === "student")
        .map((p: any): Student => ({
          id: p.id,
          name: p.name,
          schoolId: p.school_id || undefined,
          email: p.email || undefined,
          learnerProfile: p.learner_profile || undefined,
        }));

      result.envelope = {
        students,
      };
    }

    if (missions && missions.length > 0) {
      const parsedMissions: Mission[] = missions.map((m: any) => ({
        id: m.id,
        type: m.type,
        title: m.title,
        topic: m.topic,
        objectiveIds: m.objective_ids || [],
        description: m.description,
        instructions: m.instructions,
        estimatedMinutes: m.estimated_minutes,
        dueDate: m.due_date,
        status: m.status,
        targetStudentIds: m.target_student_ids || [],
        createdAt: m.created_at,
        updatedAt: m.updated_at,
        config: m.config,
      }));

      result.envelope = {
        ...(result.envelope || {}),
        missions: parsedMissions,
      };
    }

    if (attempts) {
      result.envelope = {
        ...(result.envelope || {}),
        attempts: attempts.map((a: any): Attempt => ({
          id: a.id,
          studentId: a.student_id,
          missionId: a.mission_id,
          attemptNo: a.attempt_no,
          type: a.type,
          content: a.content,
          language: a.language,
          revisionNote: a.revision_note,
          submittedAt: a.submitted_at,
          submissionToken: a.submission_token,
          pulseRating: a.pulse_rating,
        })),
      };
    }

    if (reviews) {
      result.envelope = {
        ...(result.envelope || {}),
        reviews: reviews.map((r: any): Review => ({
          id: r.id,
          attemptId: r.attempt_id,
          teacherId: r.teacher_id,
          publicationStatus: r.publication_status,
          decision: r.decision,
          feedback: r.feedback,
          criterionScores: r.criterion_scores,
          rawScore: r.raw_score,
          maxRawScore: r.max_raw_score,
          percentScore: r.percent_score,
          outcome: r.outcome,
          updatedAt: r.updated_at,
          publishedAt: r.published_at,
        })),
      };
    }

    if (quizHistory) {
      result.envelope = {
        ...(result.envelope || {}),
        quizHistory: quizHistory.map((q: any): QuizHistoryEntry => ({
          id: q.id,
          missionId: q.mission_id,
          studentId: q.student_id,
          attemptNo: q.attempt_no,
          answers: q.answers,
          score: q.score,
          maxScore: q.max_score,
          percentScore: q.percent_score,
          passed: q.passed,
          pulseRating: q.pulse_rating,
          submittedAt: q.submitted_at,
        })),
      };
    }

    if (auditLogs) {
      result.auditLogs = auditLogs.map((l: any): AuditLogEntry => ({
        id: l.id,
        timestamp: l.timestamp,
        userEmail: l.user_email,
        userName: l.user_name,
        role: l.role,
        category: l.category,
        action: l.action,
        details: l.details,
        ipAddress: l.ip_address,
      }));
    }

    if (settings) {
      const gConfig = settings.find((s: any) => s.key === "google_workspace_config");
      if (gConfig?.value) {
        result.googleConfig = gConfig.value;
      }
      const aiConfig = settings.find((s: any) => s.key === "ai_tutor_config");
      if (aiConfig?.value) {
        result.aiTutorConfig = aiConfig.value;
      }
    }

    return result;
  } catch (err) {
    console.warn("Failed to fetch data from Supabase:", err);
    return null;
  }
}

/**
 * บันทึก Attempt เดี่ยวขึ้น Supabase แบบ Asynchronous
 */
export async function pushAttemptToCloud(attempt: Attempt): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from("attempts").upsert({
      id: attempt.id,
      student_id: attempt.studentId,
      mission_id: attempt.missionId,
      attempt_no: attempt.attemptNo,
      type: attempt.type,
      content: attempt.content,
      language: attempt.language,
      revision_note: attempt.revisionNote,
      submitted_at: attempt.submittedAt,
      submission_token: attempt.submissionToken,
      pulse_rating: attempt.pulseRating,
    }, { onConflict: "id" });
  } catch (err) {
    console.warn("Cloud push attempt error:", err);
  }
}

/**
 * บันทึก Review เดี่ยวขึ้น Supabase แบบ Asynchronous
 */
export async function pushReviewToCloud(review: Review): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from("reviews").upsert({
      id: review.id,
      attempt_id: review.attemptId,
      teacher_id: review.teacherId,
      publication_status: review.publicationStatus,
      decision: review.decision,
      feedback: review.feedback,
      criterion_scores: review.criterionScores,
      raw_score: review.rawScore,
      max_raw_score: review.maxRawScore,
      percent_score: review.percentScore,
      outcome: review.outcome,
      updated_at: review.updatedAt,
      published_at: review.publishedAt,
    }, { onConflict: "id" });
  } catch (err) {
    console.warn("Cloud push review error:", err);
  }
}

/**
 * บันทึก Quiz Attempt เดี่ยวขึ้น Supabase แบบ Asynchronous
 */
export async function pushQuizHistoryToCloud(entry: QuizHistoryEntry): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from("quiz_history").upsert({
      id: entry.id,
      mission_id: entry.missionId,
      student_id: entry.studentId,
      attempt_no: entry.attemptNo,
      answers: entry.answers,
      score: entry.score,
      max_score: entry.maxScore,
      percent_score: entry.percentScore,
      passed: entry.passed,
      pulse_rating: entry.pulseRating,
      submitted_at: entry.submittedAt,
    }, { onConflict: "id" });
  } catch (err) {
    console.warn("Cloud push quiz history error:", err);
  }
}

/**
 * บันทึก Audit Log เดี่ยวขึ้น Supabase แบบ Asynchronous
 */
export async function pushAuditLogToCloud(log: AuditLogEntry): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from("audit_logs").upsert({
      id: log.id,
      timestamp: log.timestamp,
      user_email: log.userEmail,
      user_name: log.userName,
      role: log.role,
      category: log.category,
      action: log.action,
      details: log.details,
      ip_address: log.ipAddress,
    }, { onConflict: "id" });
  } catch (err) {
    console.warn("Cloud push audit log error:", err);
  }
}

/**
 * บันทึกหรืออัปเดตข้อมูลผู้ใช้งาน (Profile) ขึ้น Supabase Cloud แบบ Real-time
 */
export async function pushUserToCloud(user: AuthUser, learnerProfile?: any): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from("profiles").upsert({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: user.avatarUrl || null,
      role: user.role,
      department: user.department || null,
      school_id: user.schoolId || null,
      status: user.status || "active",
      learner_profile: learnerProfile || null,
      last_login_at: user.lastLoginAt || new Date().toISOString(),
    }, { onConflict: "id" });

    if (error) {
      console.warn("Cloud push user error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Error in pushUserToCloud:", err);
    return false;
  }
}

/**
 * ลบข้อมูลผู้ใช้งาน (Profile) ออกจาก Supabase Cloud
 */
export async function deleteUserFromCloud(userId: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from("profiles").delete().eq("id", userId);
    if (error) {
      console.warn("Cloud delete user error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Error in deleteUserFromCloud:", err);
    return false;
  }
}

/**
 * บันทึกการตั้งค่า AI Tutor ขึ้น Supabase Cloud (ตาราง system_settings)
 */
export async function pushAiTutorConfigToCloud(config: AiTutorConfig): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from("system_settings").upsert({
      key: "ai_tutor_config",
      value: config,
    }, { onConflict: "key" });

    if (error) {
      console.warn("Cloud push AI tutor config error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Error in pushAiTutorConfigToCloud:", err);
    return false;
  }
}

/**
 * บันทึกการตั้งค่า Google Workspace Config (Domain Whitelist, Provisioning Policies) ขึ้น Supabase Cloud (ตาราง system_settings)
 */
export async function pushGoogleConfigToCloud(config: GoogleWorkspaceConfig): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from("system_settings").upsert({
      key: "google_workspace_config",
      value: config,
    }, { onConflict: "key" });

    if (error) {
      console.warn("Cloud push Google Workspace config error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Error in pushGoogleConfigToCloud:", err);
    return false;
  }
}



