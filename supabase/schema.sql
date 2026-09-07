-- ==============================================================================
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

-- 5. สร้างตารางประวัติรอบการส่งงาน (Attempts)
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

-- 6. สร้างตารางการตรวจและประเมินผลรูบริกของครู (Reviews)
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  attempt_id TEXT NOT NULL REFERENCES public.attempts(id) ON DELETE CASCADE,
  teacher_id TEXT NOT NULL,
  publication_status TEXT DEFAULT 'published',
  decision TEXT CHECK (decision IN ('request_changes', 'finalize')),
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
  score INT NOT NULL DEFAULT 0,
  max_score INT NOT NULL DEFAULT 5,
  percent_score NUMERIC NOT NULL DEFAULT 0,
  passed BOOLEAN NOT NULL DEFAULT false,
  pulse_rating TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. สร้างตารางบันทึกความปลอดภัยและประวัติระบบ (Audit Logs)
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

-- 9. สร้างตารางการตั้งค่าระบบ (System Settings)
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- เปิดใช้งาน Row Level Security (RLS) และกำหนด Policy เพื่อความปลอดภัย
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- กำหนด Public Access Policies สำหรับการใช้งานแอปพลิเคชัน (Anon & Authenticated)
DO $$ 
BEGIN
  -- Profiles
  DROP POLICY IF EXISTS "Allow all access to profiles" ON public.profiles;
  CREATE POLICY "Allow all access to profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

  -- Missions
  DROP POLICY IF EXISTS "Allow all access to missions" ON public.missions;
  CREATE POLICY "Allow all access to missions" ON public.missions FOR ALL USING (true) WITH CHECK (true);

  -- Participations
  DROP POLICY IF EXISTS "Allow all access to participations" ON public.participations;
  CREATE POLICY "Allow all access to participations" ON public.participations FOR ALL USING (true) WITH CHECK (true);

  -- Drafts
  DROP POLICY IF EXISTS "Allow all access to drafts" ON public.drafts;
  CREATE POLICY "Allow all access to drafts" ON public.drafts FOR ALL USING (true) WITH CHECK (true);

  -- Attempts
  DROP POLICY IF EXISTS "Allow all access to attempts" ON public.attempts;
  CREATE POLICY "Allow all access to attempts" ON public.attempts FOR ALL USING (true) WITH CHECK (true);

  -- Reviews
  DROP POLICY IF EXISTS "Allow all access to reviews" ON public.reviews;
  CREATE POLICY "Allow all access to reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);

  -- Quiz History
  DROP POLICY IF EXISTS "Allow all access to quiz_history" ON public.quiz_history;
  CREATE POLICY "Allow all access to quiz_history" ON public.quiz_history FOR ALL USING (true) WITH CHECK (true);

  -- Audit Logs
  DROP POLICY IF EXISTS "Allow all access to audit_logs" ON public.audit_logs;
  CREATE POLICY "Allow all access to audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

  -- System Settings
  DROP POLICY IF EXISTS "Allow all access to system_settings" ON public.system_settings;
  CREATE POLICY "Allow all access to system_settings" ON public.system_settings FOR ALL USING (true) WITH CHECK (true);
END $$;
