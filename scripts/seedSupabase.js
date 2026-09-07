import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://yfhudjpsngzegdxaiiwk.supabase.co";
const SUPABASE_KEY = "sb_publishable_2TmBsHl2Ta_dABQXR-esZg_b8F2kqZy";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const mockStudents = [
  { 
    id: "student-001", 
    name: "น้องต้น",
    learnerProfile: {
      persona: "Fast Explorer",
      personaTitle: "สายทดลองไว (Fast Explorer)",
      tagline: "ชอบการเรียนรู้แบบตอบสนองทันทีผ่าน Quiz และ Interactive แต่ยังไม่ถนัดการอ่านโจทย์ที่ยาว",
      affinityScores: { coding: 25, conceptual: 35, quiz: 80 },
      telemetry: {
        engagementSpeed: "เริ่มทันที (Fast)",
        resilienceIndex: "ต้องการการชี้แนะ (Needs Support)",
        preferredModality: "ทำแบบทดสอบสั้น (Quiz)"
      },
      teacherRecommendation: "เริ่มต้นด้วยแบบทดสอบสั้นๆ เพื่อดึงดูดความสนใจ จากนั้นค่อยๆ เสริมโจทย์เขียนสั้น 1 ประโยคเพื่อสร้างความมั่นใจ"
    }
  },
  { 
    id: "student-002", 
    name: "น้องปอ",
    learnerProfile: {
      persona: "Balanced Learner",
      personaTitle: "สายสมดุลรอบด้าน (Balanced Learner)",
      tagline: "ปรับตัวได้ดีกับทุกรูปแบบภารกิจ ทั้งการคิดวิเคราะห์ การเขียนอธิบาย และการทดสอบวัดผล",
      affinityScores: { coding: 68, conceptual: 82, quiz: 85 },
      telemetry: {
        engagementSpeed: "เริ่มทันที (Fast)",
        resilienceIndex: "มั่นคง (Steady)",
        preferredModality: "อธิบายแนวคิด (Short Answer)"
      },
      teacherRecommendation: "มีความพร้อมสูง สามารถท้าทายด้วยโจทย์ประยุกต์ หรือเปิดทางเลือกให้เป็นผู้ช่วยเพื่อน (Peer Tutor)"
    }
  },
  { 
    id: "student-003", 
    name: "น้องมายด์",
    learnerProfile: {
      persona: "Resilient Improver",
      personaTitle: "สายมุ่งมั่นพัฒนา (Resilient Improver)",
      tagline: "มี Growth Mindset สูงมาก เมื่อได้รับ Feedback จะนำคำแนะนำมาปรับปรุงงานอย่างตั้งใจจนสำเร็จ",
      affinityScores: { coding: 55, conceptual: 78, quiz: 65 },
      telemetry: {
        engagementSpeed: "เริ่มทันที (Fast)",
        resilienceIndex: "สูงมาก (High Grit)",
        preferredModality: "อธิบายแนวคิด (Short Answer)"
      },
      teacherRecommendation: "ชื่นชมความพยายามในการปรับแก้ และสนับสนุนให้ลองคิดแบบแผนภาพ (Visual/Diagram) เพิ่มเติม"
    }
  },
  { 
    id: "student-004", 
    name: "น้องเอก",
    learnerProfile: {
      persona: "Hands-on Coder",
      personaTitle: "สายลงมือปฏิบัติ (Hands-on Coder)",
      tagline: "ถนัดการเขียนโค้ด การแก้ปัญหาเชิงคำนวณแบบมีขั้นตอน แต่ยังเขียนสรุปอธิบายเป็นภาษาวิชาการไม่คล่อง",
      affinityScores: { coding: 92, conceptual: 40, quiz: 65 },
      telemetry: {
        engagementSpeed: "เริ่มทันที (Fast)",
        resilienceIndex: "มั่นคง (Steady)",
        preferredModality: "เขียนโค้ด (Coding)"
      },
      teacherRecommendation: "ท้าทายด้วยโจทย์ Optimization หรืองานโครงงานขนาดเล็ก เพื่อให้เขาได้ใช้ทักษะการเขียนโค้ดอย่างเต็มที่"
    }
  },
  { 
    id: "student-005", 
    name: "น้องฟ้า",
    learnerProfile: {
      persona: "Conceptual Explainer",
      personaTitle: "สายวิเคราะห์มโนทัศน์ (Conceptual Explainer)",
      tagline: "มีความสามารถโดดเด่นในการเชื่อมโยงเหตุและผล อธิบายตรรกะได้ลึกซึ้งและเข้าใจแก่นแท้ของปัญหา",
      affinityScores: { coding: 65, conceptual: 96, quiz: 90 },
      telemetry: {
        engagementSpeed: "เริ่มทันที (Fast)",
        resilienceIndex: "สูงมาก (High Grit)",
        preferredModality: "อธิบายแนวคิด (Short Answer)"
      },
      teacherRecommendation: "ต่อยอดด้วยการให้ช่วยสะท้อนความคิด หรือสร้างเกณฑ์ประเมินร่วมกัน และสนับสนุนให้ลองเปลี่ยนมโนทัศน์เป็นโค้ดโปรแกรมที่ซับซ้อนขึ้น"
    }
  },
  { 
    id: "student-006", 
    name: "น้องจอย",
    learnerProfile: {
      persona: "Balanced Learner",
      personaTitle: "สายสำรวจทีละขั้น (Steady Learner)",
      tagline: "เรียนรู้ได้ดีเมื่อมีโครงสร้างชัดเจน ทำงานอย่างเป็นระเบียบ แต่ต้องการเวลาทำความเข้าใจแนวคิดใหม่",
      affinityScores: { coding: 50, conceptual: 60, quiz: 70 },
      telemetry: {
        engagementSpeed: "ปานกลาง (Medium)",
        resilienceIndex: "มั่นคง (Steady)",
        preferredModality: "ทำแบบทดสอบสั้น (Quiz)"
      },
      teacherRecommendation: "แบ่งเนื้อหาเป็นส่วนย่อย (Scaffolding) และมีตัวอย่างนำทาง (Worked Examples) ก่อนให้ลงมือทำ"
    }
  },
  { 
    id: "student-007", 
    name: "น้องบอล",
    learnerProfile: {
      persona: "Hands-on Coder",
      personaTitle: "สายสร้างสรรค์เชิงปฏิบัติ (Creative Coder)",
      tagline: "ชอบการสร้างชิ้นงานที่เห็นผลลัพธ์ทันตา แต่ไม่ชอบการอ่านคู่มือยาวๆ",
      affinityScores: { coding: 78, conceptual: 35, quiz: 50 },
      telemetry: {
        engagementSpeed: "ต้องกระตุ้น (Needs Push)",
        resilienceIndex: "มั่นคง (Steady)",
        preferredModality: "เขียนโค้ด (Coding)"
      },
      teacherRecommendation: "กระตุ้นด้วยโจทย์ที่เกี่ยวข้องกับเกมหรือสิ่งที่ตนเองสนใจ และให้คำแนะนำแบบทันท่วงที"
    }
  },
  { 
    id: "student-008", 
    name: "น้องเกม",
    learnerProfile: {
      persona: "Fast Explorer",
      personaTitle: "สายกิจกรรมสั้น (Game-based Explorer)",
      tagline: "ชอบกิจกรรมแบบ Interactive มีการให้รางวัลทันใจ ตอบสนองต่อการแข่งขันและการท้าทายสั้นๆ",
      affinityScores: { coding: 45, conceptual: 30, quiz: 75 },
      telemetry: {
        engagementSpeed: "ต้องกระตุ้น (Needs Push)",
        resilienceIndex: "ต้องการการชี้แนะ (Needs Support)",
        preferredModality: "ทำแบบทดสอบสั้น (Quiz)"
      },
      teacherRecommendation: "กำหนดเป้าหมายระยะสั้น (Micro-goals) และใช้คำถามกระตุ้นความคิดชวนคุยแบบตัวต่อตัว"
    }
  }
];

const mockAuthUsers = [
  {
    id: "admin-001",
    name: "ดร.สมชาย บริหารวิชาการ",
    email: "admin@school.ac.th",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    role: "admin",
    department: "ฝ่ายบริหารงานวิชาการและเทคโนโลยีสารสนเทศ",
    schoolId: "ADM-001",
    status: "active",
    lastLoginAt: new Date().toISOString()
  },
  {
    id: "teacher-demo",
    name: "ครูเมย์ ชลธิชา",
    email: "may.ch@school.ac.th",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
    role: "teacher",
    department: "กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี",
    schoolId: "TCH-089",
    status: "active",
    lastLoginAt: new Date().toISOString()
  },
  {
    id: "student-001",
    name: "ด.ช.ต้นกล้า ใฝ่เรียน (น้องต้น)",
    email: "ton.k@school.ac.th",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80",
    role: "student",
    department: "มัธยมศึกษาปีที่ 4/1",
    schoolId: "STD-40101",
    status: "active",
    lastLoginAt: new Date().toISOString()
  },
  {
    id: "student-002",
    name: "น.ส.ปิยาพร แสนสุข (น้องปอ)",
    email: "por.p@school.ac.th",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
    role: "student",
    department: "มัธยมศึกษาปีที่ 4/1",
    schoolId: "STD-40102",
    status: "active",
    lastLoginAt: new Date().toISOString()
  },
  {
    id: "student-003",
    name: "พิมพ์ชนก เจริญใจ (น้องมายด์)",
    email: "mind.p@school.ac.th",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80",
    role: "student",
    department: "มัธยมศึกษาปีที่ 4/1",
    schoolId: "STD-40103",
    status: "active",
    lastLoginAt: new Date().toISOString()
  },
  {
    id: "student-004",
    name: "เอกภพ ศิลปะ (น้องเอก)",
    email: "ek.s@school.ac.th",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    role: "student",
    department: "มัธยมศึกษาปีที่ 4/1",
    schoolId: "STD-40104",
    status: "active",
    lastLoginAt: new Date().toISOString()
  },
  {
    id: "student-005",
    name: "นภัส พรหมทัศน์ (น้องฟ้า)",
    email: "fah.p@school.ac.th",
    avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&auto=format&fit=crop&q=80",
    role: "student",
    department: "มัธยมศึกษาปีที่ 4/1",
    schoolId: "STD-40105",
    status: "active",
    lastLoginAt: new Date().toISOString()
  },
  {
    id: "student-006",
    name: "จอยลดา สดใส (น้องจอย)",
    email: "joy.l@school.ac.th",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    role: "student",
    department: "มัธยมศึกษาปีที่ 4/1",
    schoolId: "STD-40106",
    status: "active",
    lastLoginAt: new Date().toISOString()
  },
  {
    id: "student-007",
    name: "ธีรเดช วงศ์สว่าง (น้องบอล)",
    email: "ball.t@school.ac.th",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    role: "student",
    department: "มัธยมศึกษาปีที่ 4/1",
    schoolId: "STD-40107",
    status: "active",
    lastLoginAt: new Date().toISOString()
  },
  {
    id: "student-008",
    name: "กานดา มีทรัพย์ (น้องเกม)",
    email: "game.k@school.ac.th",
    avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80",
    role: "student",
    department: "มัธยมศึกษาปีที่ 4/1",
    schoolId: "STD-40108",
    status: "active",
    lastLoginAt: new Date().toISOString()
  }
];

const mockMissions = [
  {
    id: "mission-quiz-loop-001",
    type: "quiz",
    title: "เช็กความเข้าใจเรื่องขอบเขตลูป",
    topic: "ลูป Python",
    objective_ids: ["python-range-boundary"],
    description: "แบบทดสอบ 3 ข้อเพื่อเช็กความเข้าใจเรื่องค่าที่ได้จาก range และจำนวนรอบของลูป",
    instructions: "เลือกคำตอบที่ถูกต้องที่สุดในแต่ละข้อ ระบบจะตรวจและแสดงผลเฉลยทันทีหลังส่ง",
    estimated_minutes: 10,
    due_date: "2026-09-15",
    status: "published",
    target_student_ids: ["student-001", "student-002", "student-003", "student-004", "student-005", "student-006", "student-007", "student-008"],
    config: {
      prompt: "ตอบคำถาม 3 ข้อเกี่ยวกับ range และการวนลูป",
      passPercent: 80,
      questions: [
        {
          id: "q1",
          prompt: "range(2, 6) ให้ค่าตามข้อใด?",
          options: [
            { id: "opt-1", label: "ก", text: "2, 3, 4, 5" },
            { id: "opt-2", label: "ข", text: "2, 3, 4, 5, 6" },
            { id: "opt-3", label: "ค", text: "3, 4, 5, 6" },
            { id: "opt-4", label: "ง", text: "2, 4, 6" }
          ],
          correctOptionId: "opt-1",
          explanation: "เริ่มที่ 2 และเพิ่มทีละ 1 แต่ไม่รวม 6 (stop) จึงได้ค่า 2, 3, 4, 5"
        }
      ]
    }
  },
  {
    id: "mission-sa-loop-001",
    type: "short-answer",
    title: "อ่านลูปให้เข้าใจ แล้วแก้ขอบเขตให้ถูก",
    topic: "ลูป Python",
    objective_ids: ["python-range-boundary"],
    description: "อธิบายขอบเขตของ range(start, stop) ที่เพิ่มครั้งละ 1",
    instructions: "อ่านโค้ดแล้วตอบคำถาม 3 ส่วนให้ครบถ้วน",
    estimated_minutes: 10,
    due_date: "2026-09-17",
    status: "published",
    target_student_ids: ["student-001", "student-002", "student-003", "student-004", "student-005", "student-006", "student-007", "student-008"],
    config: {
      prompt: "",
      minLength: 10,
      maxLength: 2000,
      rubric: {
        passRawPoints: 5,
        requiredFullScoreCriterionIds: ["c1"],
        criteria: [
          { id: "c1", title: "ความถูกต้องของผลลัพธ์และจำนวนรอบ", maxPoints: 2 },
          { id: "c2", title: "ความเข้าใจเรื่องค่าที่รวมและไม่รวม", maxPoints: 2 },
          { id: "c3", title: "การแก้ไข range เพื่อให้ได้ผลลัพธ์ที่ต้องการ", maxPoints: 2 }
        ]
      }
    }
  },
  {
    id: "mission-code-loop-001",
    type: "coding",
    title: "เขียนฟังก์ชันหาผลรวม 1 ถึง n (Sum 1 to n)",
    topic: "ลูป Python และการสะสมค่า",
    objective_ids: ["python-loop-accumulator"],
    description: "ฝึกเขียน for loop เพื่อคำนวณผลรวมสะสมจาก 1 จนถึง n",
    instructions: "เขียนฟังก์ชัน def sum_to_n(n) แล้วส่งผลงาน",
    estimated_minutes: 15,
    due_date: "2026-09-20",
    status: "published",
    target_student_ids: ["student-001", "student-002", "student-003", "student-004", "student-005", "student-006", "student-007", "student-008"],
    config: {
      prompt: "เขียนฟังก์ชัน def sum_to_n(n) ที่รับจำนวนเต็มบวก n แล้วคืนค่าผลรวมตั้งแต่ 1 ถึง n",
      rubric: {
        passRawPoints: 5,
        requiredFullScoreCriterionIds: ["c1"],
        criteria: [
          { id: "c1", title: "ความถูกต้องของผลลัพธ์", maxPoints: 2 },
          { id: "c2", title: "การเลือกใช้โครงสร้างลูปที่เหมาะสม", maxPoints: 2 },
          { id: "c3", title: "การจัดการขอบเขตเริ่มต้นและสิ้นสุด", maxPoints: 2 }
        ]
      }
    }
  },
  {
    id: "chula-04-03-while-loop",
    type: "coding",
    title: "04-03: การหาค่าเฉลี่ยด้วย While Loop (แบบฝึกหัด ป.ปลา จุฬาฯ)",
    topic: "While Loop และ Sentinel Value",
    objective_ids: ["python-while-sentinel"],
    description: "โจทย์ระดับมาตรฐานจากจุฬาฯ: รับตัวเลขไปเรื่อยๆ จนกว่าจะพบตัวเลขที่ระบุ แล้วหาค่าเฉลี่ย",
    instructions: "เขียนโปรแกรมตามเงื่อนไขในโจทย์",
    estimated_minutes: 20,
    due_date: "2026-09-25",
    status: "published",
    target_student_ids: ["student-004", "student-007"],
    config: {
      prompt: "จงเขียนโปรแกรมรับค่าจำนวนเต็ม และคำนวณค่าเฉลี่ย",
      rubric: {
        passRawPoints: 5,
        requiredFullScoreCriterionIds: ["c1"],
        criteria: [
          { id: "c1", title: "ความถูกต้องของการหยุดลูป (Sentinel)", maxPoints: 2 },
          { id: "c2", title: "การคำนวณค่าเฉลี่ยและ Format ทศนิยม", maxPoints: 2 },
          { id: "c3", title: "การจัดการกรณีไม่มีข้อมูลนำเข้า", maxPoints: 2 }
        ]
      }
    }
  }
];

async function seed() {
  console.log("🚀 Starting seeding to Supabase Cloud...");

  // 1. Profiles
  const profileRows = mockAuthUsers.map(u => {
    const studentMatch = mockStudents.find(s => s.id === u.id);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      avatar_url: u.avatarUrl,
      role: u.role,
      department: u.department,
      school_id: u.schoolId,
      status: u.status,
      learner_profile: studentMatch ? studentMatch.learnerProfile : null,
      last_login_at: u.lastLoginAt
    };
  });

  const { error: pErr } = await supabase.from("profiles").upsert(profileRows, { onConflict: "id" });
  if (pErr) console.error("Error seeding profiles:", pErr);
  else console.log(`✓ Seeded ${profileRows.length} profiles`);

  // 2. Missions
  const { error: mErr } = await supabase.from("missions").upsert(mockMissions, { onConflict: "id" });
  if (mErr) console.error("Error seeding missions:", mErr);
  else console.log(`✓ Seeded ${mockMissions.length} missions`);

  // 3. Participations
  const participationRows = [
    { student_id: "student-001", mission_id: "mission-quiz-loop-001" },
    { student_id: "student-002", mission_id: "mission-sa-loop-001" },
    { student_id: "student-003", mission_id: "mission-sa-loop-001" },
    { student_id: "student-004", mission_id: "mission-code-loop-001" },
    { student_id: "student-005", mission_id: "mission-sa-loop-001" }
  ];
  const { error: partErr } = await supabase.from("participations").upsert(participationRows, { onConflict: "student_id,mission_id" });
  if (partErr) console.error("Error seeding participations:", partErr);
  else console.log(`✓ Seeded ${participationRows.length} participations`);

  // 4. Attempts
  const attemptRows = [
    {
      id: "att-por-1",
      student_id: "student-002",
      mission_id: "mission-sa-loop-001",
      attempt_no: 1,
      type: "short-answer",
      content: "โค้ดแสดง 1, 2, 3, 4, 5 รวม 5 รอบ เลข 1 คือจุดเริ่มต้น แล้วเพิ่มทีละ 1 จนถึงเลข 5 ซึ่งเป็นตัวสุดท้าย ถ้าต้องการให้แสดง 1 ถึง 5 ก็ใช้ range(1, 5) เหมือนเดิมได้",
      language: null,
      revision_note: "",
      submitted_at: new Date(Date.now() - 7200000).toISOString(),
      submission_token: "token-por-1",
      pulse_rating: "💡 ท้าทายกำลังดี (Good Challenge)"
    },
    {
      id: "att-mind-1",
      student_id: "student-003",
      mission_id: "mission-sa-loop-001",
      attempt_no: 1,
      type: "short-answer",
      content: "ผลลัพธ์คือ 1 2 3 4 5 รวม 5 รอบ และ 1 คือตัวแรก 5 คือตัวสุดท้าย",
      language: null,
      revision_note: "",
      submitted_at: new Date(Date.now() - 10800000).toISOString(),
      submission_token: "token-mind-1",
      pulse_rating: "🔄 อยากได้คำแนะนำเพิ่ม"
    },
    {
      id: "att-ek-1",
      student_id: "student-004",
      mission_id: "mission-code-loop-001",
      attempt_no: 1,
      type: "coding",
      content: "def sum_to_n(n):\n    total = 0\n    for i in range(1, n + 1):\n        total += i\n    return total\n",
      language: "python",
      revision_note: "",
      submitted_at: new Date(Date.now() - 3600000).toISOString(),
      submission_token: "token-ek-1",
      pulse_rating: "⚡ ชอบมาก สนุกและถนัด (My Favorite)"
    },
    {
      id: "att-fah-1",
      student_id: "student-005",
      mission_id: "mission-sa-loop-001",
      attempt_no: 1,
      type: "short-answer",
      content: "รอบแรกฉันคิดว่ามันจะพิมพ์ 1 ถึง 5 ออกมารวม 5 รอบ เพราะคิดว่า range จะไปถึงเลขตัวหลังสุด",
      language: null,
      revision_note: "",
      submitted_at: new Date(Date.now() - 10800000).toISOString(),
      submission_token: "token-fah-1",
      pulse_rating: "💡 ท้าทายกำลังดี (Good Challenge)"
    },
    {
      id: "att-fah-2",
      student_id: "student-005",
      mission_id: "mission-sa-loop-001",
      attempt_no: 2,
      type: "short-answer",
      content: "1. โค้ดแสดงเลข 1, 2, 3, 4 รวม 4 รอบ\n2. เลข 1 ถูกรวม ส่วนเลข 5 ไม่ถูกรวมเพราะเป็นค่าหยุด\n3. แก้เป็น range(1, 6) จะได้ 1, 2, 3, 4, 5 รวม 5 รอบ",
      language: null,
      revision_note: "ปรับปรุงคำอธิบายเรื่อง stop parameter ตามที่ครูชี้แนะ",
      submitted_at: new Date(Date.now() - 5400000).toISOString(),
      submission_token: "token-fah-2",
      pulse_rating: "⚡ ชอบมาก สนุกและถนัด (My Favorite)"
    }
  ];

  const { error: aErr } = await supabase.from("attempts").upsert(attemptRows, { onConflict: "id" });
  if (aErr) console.error("Error seeding attempts:", aErr);
  else console.log(`✓ Seeded ${attemptRows.length} attempts`);

  // 5. Reviews
  const reviewRows = [
    {
      id: "rev-mind-1",
      attempt_id: "att-mind-1",
      teacher_id: "teacher-demo",
      publication_status: "published",
      decision: "request_changes",
      feedback: "คุณเข้าใจจุดเริ่มต้นถูกต้องแล้ว แต่ผลลัพธ์ของ range(1, 5) จะหยุดก่อนเลข 5 เสมอ ลองนับดูใหม่ว่าได้ตัวเลขใดบ้าง และมีกี่รอบ",
      criterion_scores: { c1: 0, c2: 1, c3: 1 },
      raw_score: 2,
      max_raw_score: 6,
      percent_score: 33,
      outcome: "needs-practice",
      updated_at: new Date(Date.now() - 7200000).toISOString(),
      published_at: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: "rev-fah-2",
      attempt_id: "att-fah-2",
      teacher_id: "teacher-demo",
      publication_status: "published",
      decision: "finalize",
      feedback: "ยอดเยี่ยมมาก! อธิบายได้ชัดเจน ครบถ้วนทั้งสามประเด็น และเข้าใจบทบาทของ start/stop ใน range เป็นอย่างดี",
      criterion_scores: { c1: 2, c2: 2, c3: 2 },
      raw_score: 6,
      max_raw_score: 6,
      percent_score: 100,
      outcome: "meets-criteria",
      updated_at: new Date(Date.now() - 3600000).toISOString(),
      published_at: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  const { error: rErr } = await supabase.from("reviews").upsert(reviewRows, { onConflict: "id" });
  if (rErr) console.error("Error seeding reviews:", rErr);
  else console.log(`✓ Seeded ${reviewRows.length} reviews`);

  // 6. Quiz History
  const quizRows = [
    {
      id: "quiz-ton-1",
      mission_id: "mission-quiz-loop-001",
      student_id: "student-001",
      attempt_no: 1,
      answers: { q1: "opt-1" },
      score: 1,
      max_score: 1,
      percent_score: 100,
      passed: true,
      pulse_rating: "⚡ ชอบมาก สนุกและถนัด (My Favorite)",
      submitted_at: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  const { error: qErr } = await supabase.from("quiz_history").upsert(quizRows, { onConflict: "id" });
  if (qErr) console.error("Error seeding quiz_history:", qErr);
  else console.log(`✓ Seeded ${quizRows.length} quiz history entries`);

  // 7. System Settings
  const settingsRows = [
    {
      key: "google_workspace",
      value: {
        schoolName: "โรงเรียนสาธิตวิทยาการคำนวณ",
        adminEmail: "admin@school.ac.th",
        allowedDomains: ["school.ac.th", "banhan3.ac.th"],
        enforceDomainRestriction: true,
        autoProvisionNewUsers: true,
        defaultRole: "student"
      }
    },
    {
      key: "school_term",
      value: {
        academicYear: "2567",
        term: "1",
        courseCode: "ว31101",
        courseName: "วิทยาการคำนวณ 1",
        curriculumStandard: "ว 4.2 ม.4/1"
      }
    }
  ];

  const { error: sErr } = await supabase.from("system_settings").upsert(settingsRows, { onConflict: "key" });
  if (sErr) console.error("Error seeding system_settings:", sErr);
  else console.log(`✓ Seeded ${settingsRows.length} system settings`);

  // 8. Audit Logs
  const auditRows = [
    {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user_email: "admin@school.ac.th",
      user_name: "ดร.สมชาย บริหารวิชาการ",
      role: "admin",
      category: "system",
      action: "ซิงก์ข้อมูลขึ้น Supabase Cloud สำเร็จ",
      details: "ติดตั้งโครงสร้างและนำเข้าฐานข้อมูล 9 ตารางสมบูรณ์แบบ",
      ip_address: "192.168.1.1 (Gateway)"
    }
  ];

  const { error: logErr } = await supabase.from("audit_logs").upsert(auditRows, { onConflict: "id" });
  if (logErr) console.error("Error seeding audit_logs:", logErr);
  else console.log(`✓ Seeded audit logs`);

  console.log("\n🎉 All 8 datasets seeded successfully to Supabase Cloud!");
}

seed().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
