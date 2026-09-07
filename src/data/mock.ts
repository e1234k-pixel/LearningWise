import type { Envelope, Mission, QuizQuestion, Attempt, Review, QuizHistoryEntry, AuthUser, GoogleWorkspaceConfig, AuditLogEntry } from "../types";
import { CHULA_EXERCISE_PRESETS } from "./chulaExercises";

const getFutureDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
};

export const mockStudents = [
  { 
    id: "student-001", 
    name: "น้องต้น",
    learnerProfile: {
      persona: "Fast Explorer" as const,
      personaTitle: "สายทดลองไว (Fast Explorer)",
      tagline: "ชอบการเรียนรู้แบบตอบสนองทันทีผ่าน Quiz และ Interactive แต่ยังไม่ถนัดการอ่านโจทย์ที่ยาว",
      affinityScores: { coding: 25, conceptual: 35, quiz: 80 },
      telemetry: {
        engagementSpeed: "เริ่มทันที (Fast)" as const,
        resilienceIndex: "ต้องการการชี้แนะ (Needs Support)" as const,
        preferredModality: "ทำแบบทดสอบสั้น (Quiz)" as const
      },
      teacherRecommendation: "เริ่มต้นด้วยแบบทดสอบสั้นๆ เพื่อดึงดูดความสนใจ จากนั้นค่อยๆ เสริมโจทย์เขียนสั้น 1 ประโยคเพื่อสร้างความมั่นใจ"
    }
  },
  { 
    id: "student-002", 
    name: "น้องปอ",
    learnerProfile: {
      persona: "Balanced Learner" as const,
      personaTitle: "สายสมดุลรอบด้าน (Balanced Learner)",
      tagline: "ปรับตัวได้ดีกับทุกรูปแบบภารกิจ ทั้งการคิดวิเคราะห์ การเขียนอธิบาย และการทดสอบวัดผล",
      affinityScores: { coding: 68, conceptual: 82, quiz: 85 },
      telemetry: {
        engagementSpeed: "เริ่มทันที (Fast)" as const,
        resilienceIndex: "มั่นคง (Steady)" as const,
        preferredModality: "อธิบายแนวคิด (Short Answer)" as const
      },
      teacherRecommendation: "มีความพร้อมสูง สามารถท้าทายด้วยโจทย์ประยุกต์ หรือเปิดทางเลือกให้เป็นผู้ช่วยเพื่อน (Peer Tutor)"
    }
  },
  { 
    id: "student-003", 
    name: "น้องมายด์",
    learnerProfile: {
      persona: "Resilient Improver" as const,
      personaTitle: "สายมุ่งมั่นพัฒนา (Resilient Improver)",
      tagline: "มี Growth Mindset สูงมาก เมื่อได้รับ Feedback จะนำคำแนะนำมาปรับปรุงงานอย่างตั้งใจจนสำเร็จ",
      affinityScores: { coding: 55, conceptual: 78, quiz: 65 },
      telemetry: {
        engagementSpeed: "ปานกลาง (Medium)" as const,
        resilienceIndex: "สูงมาก (High Grit)" as const,
        preferredModality: "อธิบายแนวคิด (Short Answer)" as const
      },
      teacherRecommendation: "ส่งเสริมด้วย Feedback ที่เฉพาะเจาะจงและชื่นชมความพยายามในรอบปรับปรุง (Praise the Process)"
    }
  },
  { 
    id: "student-004", 
    name: "น้องเอก",
    learnerProfile: {
      persona: "Hands-on Coder" as const,
      personaTitle: "สายลงมือทำ (Hands-on Coder)",
      tagline: "ถนัดการเขียนโค้ดและแก้ปัญหาด้วยการลงมือทำจริง สนุกกับการหาข้อผิดพลาดและ Debug โค้ด",
      affinityScores: { coding: 92, conceptual: 40, quiz: 65 },
      telemetry: {
        engagementSpeed: "เริ่มทันที (Fast)" as const,
        resilienceIndex: "สูงมาก (High Grit)" as const,
        preferredModality: "เขียนโค้ด (Coding)" as const
      },
      teacherRecommendation: "ให้เริ่มจากภารกิจ Coding ก่อนเพื่อสร้างความกระตือรือร้น แล้วค่อยชวนให้อธิบายสิ่งที่เขียนเป็นคำพูดสั้นๆ เพื่อเสริมทักษะ Conceptual"
    }
  },
  { 
    id: "student-005", 
    name: "น้องฟ้า",
    learnerProfile: {
      persona: "Conceptual Explainer" as const,
      personaTitle: "สายวิเคราะห์มโนทัศน์ (Conceptual Explainer)",
      tagline: "มีความสามารถโดดเด่นในการเชื่อมโยงเหตุและผล อธิบายตรรกะได้ลึกซึ้งและเข้าใจแก่นแท้ของปัญหา",
      affinityScores: { coding: 65, conceptual: 96, quiz: 90 },
      telemetry: {
        engagementSpeed: "เริ่มทันที (Fast)" as const,
        resilienceIndex: "สูงมาก (High Grit)" as const,
        preferredModality: "อธิบายแนวคิด (Short Answer)" as const
      },
      teacherRecommendation: "ต่อยอดด้วยการให้ช่วยสะท้อนความคิด หรือสร้างเกณฑ์ประเมินร่วมกัน และสนับสนุนให้ลองเปลี่ยนมโนทัศน์เป็นโค้ดโปรแกรมที่ซับซ้อนขึ้น"
    }
  },
  { 
    id: "student-006", 
    name: "น้องจอย",
    learnerProfile: {
      persona: "Balanced Learner" as const,
      personaTitle: "สายสำรวจทีละขั้น (Steady Learner)",
      tagline: "เรียนรู้ได้ดีเมื่อมีโครงสร้างชัดเจน ทำงานอย่างเป็นระเบียบ แต่ต้องการเวลาทำความเข้าใจแนวคิดใหม่",
      affinityScores: { coding: 50, conceptual: 60, quiz: 70 },
      telemetry: {
        engagementSpeed: "ปานกลาง (Medium)" as const,
        resilienceIndex: "มั่นคง (Steady)" as const,
        preferredModality: "ทำแบบทดสอบสั้น (Quiz)" as const
      },
      teacherRecommendation: "แบ่งเนื้อหาเป็นส่วนย่อย (Scaffolding) และมีตัวอย่างนำทาง (Worked Examples) ก่อนให้ลงมือทำ"
    }
  },
  { 
    id: "student-007", 
    name: "น้องบอล",
    learnerProfile: {
      persona: "Hands-on Coder" as const,
      personaTitle: "สายสร้างสรรค์เชิงปฏิบัติ (Creative Coder)",
      tagline: "ชอบการสร้างชิ้นงานที่เห็นผลลัพธ์ทันตา แต่ไม่ชอบการอ่านคู่มือยาวๆ",
      affinityScores: { coding: 78, conceptual: 35, quiz: 50 },
      telemetry: {
        engagementSpeed: "ต้องกระตุ้น (Needs Push)" as const,
        resilienceIndex: "มั่นคง (Steady)" as const,
        preferredModality: "เขียนโค้ด (Coding)" as const
      },
      teacherRecommendation: "กระตุ้นด้วยโจทย์ที่เกี่ยวข้องกับเกมหรือสิ่งที่ตนเองสนใจ และให้คำแนะนำแบบทันท่วงที"
    }
  },
  { 
    id: "student-008", 
    name: "น้องเกม",
    learnerProfile: {
      persona: "Fast Explorer" as const,
      personaTitle: "สายกิจกรรมสั้น (Game-based Explorer)",
      tagline: "ชอบกิจกรรมแบบ Interactive มีการให้รางวัลทันใจ ตอบสนองต่อการแข่งขันและการท้าทายสั้นๆ",
      affinityScores: { coding: 45, conceptual: 30, quiz: 75 },
      telemetry: {
        engagementSpeed: "ต้องกระตุ้น (Needs Push)" as const,
        resilienceIndex: "ต้องการการชี้แนะ (Needs Support)" as const,
        preferredModality: "ทำแบบทดสอบสั้น (Quiz)" as const
      },
      teacherRecommendation: "กำหนดเป้าหมายระยะสั้น (Micro-goals) และใช้คำถามกระตุ้นความคิดชวนคุยแบบตัวต่อตัว"
    }
  },
];

export const mockQuizQuestions: QuizQuestion[] = [
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
    explanation: "เริ่มที่ 2 และเพิ่มทีละ 1 แต่ไม่รวม 6 (stop) จึงได้ค่า 2, 3, 4, 5 รวมทั้งหมด 4 ค่า"
  },
  {
    id: "q2",
    prompt: "ลูปต่อไปนี้ทำงานกี่รอบ?\n\nfor number in range(1, 4):\n    print(number)",
    options: [
      { id: "opt-1", label: "ก", text: "2 รอบ" },
      { id: "opt-2", label: "ข", text: "3 รอบ" },
      { id: "opt-3", label: "ค", text: "4 รอบ" },
      { id: "opt-4", label: "ง", text: "5 รอบ" }
    ],
    correctOptionId: "opt-2",
    explanation: "ตัวแปร number จะมีค่าเป็น 1, 2, และ 3 ตามลำดับ จึงวนทำงานทั้งหมด 3 รอบ"
  },
  {
    id: "q3",
    prompt: "หากต้องการให้ลูปใช้ค่าตั้งแต่ 1 ถึง 5 ครบทุกค่า ควรใช้ข้อใด?",
    options: [
      { id: "opt-1", label: "ก", text: "range(1, 5)" },
      { id: "opt-2", label: "ข", text: "range(0, 5)" },
      { id: "opt-3", label: "ค", text: "range(1, 6)" },
      { id: "opt-4", label: "ง", text: "range(2, 6)" }
    ],
    correctOptionId: "opt-3",
    explanation: "การรวมเลข 5 ต้องตั้ง stop เป็น 6 เพราะ range จะหยุดก่อนค่า stop เสมอ ส่วนค่าเริ่มต้น start ต้องเป็น 1"
  }
];

export const mockQuizMission: Mission = {
  id: "mission-quiz-loop-001",
  type: "quiz",
  title: "เช็กความเข้าใจเรื่องขอบเขตลูป",
  topic: "ลูป Python",
  objectiveIds: ["python-range-boundary"],
  description: "แบบทดสอบ 3 ข้อเพื่อเช็กความเข้าใจเรื่องค่าที่ได้จาก range และจำนวนรอบของลูป",
  instructions: "เลือกคำตอบที่ถูกต้องที่สุดในแต่ละข้อ ระบบจะตรวจและแสดงผลเฉลยทันทีหลังส่ง สามารถทำซ้ำเพื่อฝึกฝนได้",
  estimatedMinutes: 10,
  dueDate: getFutureDate(5),
  status: "published",
  targetStudentIds: mockStudents.map(s => s.id),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  config: {
    prompt: "ตอบคำถาม 3 ข้อเกี่ยวกับ range และการวนลูป",
    passPercent: 80,
    questions: mockQuizQuestions
  }
};

export const mockShortAnswerMission: Mission = {
  id: "mission-sa-loop-001",
  type: "short-answer",
  title: "อ่านลูปให้เข้าใจ แล้วแก้ขอบเขตให้ถูก",
  topic: "ลูป Python",
  objectiveIds: ["python-range-boundary"],
  description: "อธิบายขอบเขตของ range(start, stop) ที่เพิ่มครั้งละ 1",
  instructions: `อ่านโค้ดนี้โดยยังไม่ต้องรัน:\n\n\`\`\`python\nfor number in range(1, 5):\n    print(number)\n\`\`\`\n\nตอบให้ครบสามส่วน:\n1. โค้ดแสดงตัวเลขใดบ้างตามลำดับ และลูปทำงานกี่รอบ?\n2. อธิบายบทบาทของเลข 1 และ 5 ใน range(1, 5) ว่าตัวใดถูกรวมและตัวใดไม่ถูกรวม\n3. ถ้าต้องการแสดงเลข 1 ถึง 5 ครบทุกตัว ให้แก้เฉพาะ range(...) แล้วเขียนตัวเลขที่คาดว่าจะแสดงและจำนวนรอบหลังแก้ไข`,
  estimatedMinutes: 10,
  dueDate: getFutureDate(7),
  status: "published",
  targetStudentIds: mockStudents.map(s => s.id),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  config: {
    prompt: "",
    minLength: 10,
    maxLength: 2000,
    rubric: {
      criteria: [
        {
          id: "c1",
          label: "A. ความถูกต้องของผลลัพธ์และจำนวนรอบ",
          maxPoints: 2,
          levels: {
            "0": "ไม่ระบุผลลัพธ์ หรือคำตอบไม่สัมพันธ์กับลูปนี้",
            "1": "ระบุรายละเอียดถูกบางส่วน เช่น เริ่มที่ 1 และเพิ่มทีละ 1 แต่รายการค่าหรือจำนวนรอบยังผิด",
            "2": "ระบุ 1, 2, 3, 4 ตามลำดับ และ 4 รอบถูกต้องทั้งคู่"
          }
        },
        {
          id: "c2",
          label: "B. เหตุผลเรื่องขอบเขต",
          maxPoints: 2,
          levels: {
            "0": "ไม่อธิบาย หรือไม่มีข้ออธิบายที่ถูกต้อง",
            "1": "อธิบายจุดเริ่มหรือการเพิ่มทีละ 1 ได้ แต่ยังไม่อธิบายหรือเข้าใจผิดว่ารวม stop",
            "2": "อธิบายว่าเริ่มที่ 1 รวมค่าเริ่มต้น และหยุดก่อน 5 เพราะไม่รวม stop"
          }
        },
        {
          id: "c3",
          label: "C. การแก้ไขและตรวจสอบคำตอบ",
          maxPoints: 2,
          levels: {
            "0": "ไม่แก้ขอบเขต หรือขอบเขตใหม่ยังไม่แสดง 1 ถึง 5 ตามโจทย์",
            "1": "แก้เป็น range(1, 6) ถูกต้อง แต่ยังขาดหรือระบุรายการค่า/จำนวนรอบผิด",
            "2": "แก้เป็น range(1, 6) พร้อมระบุ 1, 2, 3, 4, 5 และ 5 รอบถูกต้อง"
          }
        }
      ],
      passRawPoints: 5,
      requiredFullScoreCriterionIds: ["c1"]
    }
  }
};

export const mockCodingMission: Mission = {
  id: "mission-code-loop-001",
  type: "coding",
  title: "บวกให้ครบถึงตัวสุดท้าย (sum_to_n)",
  topic: "ลูป Python",
  objectiveIds: ["python-accumulate-loop"],
  description: "เขียนฟังก์ชัน sum_to_n(n) เพื่อหาผลรวมจำนวนเต็มตั้งแต่ 1 ถึง n (รวม n ด้วย)",
  instructions: `เขียนฟังก์ชัน sum_to_n(n) โดยเติมลูปเพื่อบวกจำนวนเต็มตั้งแต่ 1 ถึง n ครบทุกค่า\n\nเงื่อนไขข้อมูลเข้า: n เป็นจำนวนเต็มตั้งแต่ 1 ขึ้นไป\n\nสิ่งที่ต้องทำ:\n1. เขียนโค้ดลูปบวกสะสมในฟังก์ชัน sum_to_n(n)\n2. อธิบายเหตุผลที่เลือกขอบเขต range ในคอมเมนต์\n3. เขียนแสดงการไล่ค่า (Trace) สำหรับ n = 1 และ n = 3 ในคอมเมนต์\n\n*หมายเหตุ: งานนี้ครูผู้สอนเป็นผู้ตรวจโค้ดและคอมเมนต์ด้วยตนเอง ระบบไม่มีการรันโค้ดจริง*`,
  estimatedMinutes: 20,
  dueDate: getFutureDate(10),
  status: "published",
  targetStudentIds: mockStudents.map(s => s.id),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  config: {
    prompt: "เขียนฟังก์ชัน sum_to_n(n)",
    language: "python",
    starterCode: `# อธิบายเหตุผลที่เลือกขอบเขต range ตรงนี้:\n# ...\n\n# ไล่ค่า n = 1: number แต่ละรอบและ total หลังบวก\n# ...\n\n# ไล่ค่า n = 3: number แต่ละรอบและ total หลังบวก\n# ...\n\ndef sum_to_n(n):\n    total = 0\n    # เติมลูปเพื่อบวกจำนวนเต็มตั้งแต่ 1 ถึง n\n    for number in range(1, n + 1):\n        total = total + number\n    return total\n`,
    inputConstraints: "n เป็นจำนวนเต็มตั้งแต่ 1 ขึ้นไป (n >= 1)",
    examples: [
      { input: "sum_to_n(1)", output: "1", note: "บวกเลข 1 เพียงตัวเดียว" },
      { input: "sum_to_n(3)", output: "6", note: "1 + 2 + 3 = 6" },
      { input: "sum_to_n(5)", output: "15", note: "1 + 2 + 3 + 4 + 5 = 15" }
    ],
    rubric: {
      criteria: [
        {
          id: "c1",
          label: "A. ขอบเขตและผลลัพธ์ถูกต้อง",
          maxPoints: 2,
          levels: {
            "0": "ขอบเขตไม่ถูกต้อง ผลลัพธ์ผิดพลาด",
            "1": "ขอบเขตเริ่มถูก แต่ขาดค่า n (เช่น ใช้ range(1, n)) ทำให้บวกไม่ถึงตัวสุดท้าย",
            "2": "ใช้ range(1, n + 1) ถูกต้อง และคืนค่าผลรวมถูกต้องสมบูรณ์"
          }
        },
        {
          id: "c2",
          label: "B. โครงสร้างการบวกสะสม",
          maxPoints: 2,
          levels: {
            "0": "ไม่ใช้ลูป หรือไม่มีตัวแปรสะสมค่า",
            "1": "ตั้งค่า total เริ่มต้นถูก แต่การบวกในลูปยังไม่ถูกต้อง",
            "2": "ตั้ง total = 0 นอกลูป และวนบวกสะสม total = total + number ครบถ้วน"
          }
        },
        {
          id: "c3",
          label: "C. การอธิบายและไล่ค่าในคอมเมนต์",
          maxPoints: 2,
          levels: {
            "0": "ไม่มีคอมเมนต์อธิบาย",
            "1": "มีคอมเมนต์แต่ไล่ค่าไม่ครบทั้ง n=1 และ n=3",
            "2": "อธิบายเหตุผลเรื่อง stop = n + 1 ชัดเจน และไล่ค่า n=1 กับ n=3 ถูกต้องครบถ้วน"
          }
        }
      ],
      passRawPoints: 5,
      requiredFullScoreCriterionIds: ["c1"]
    }
  }
};

const chula0403 = CHULA_EXERCISE_PRESETS.find(p => p.id === "chula-04-03")!;
const chula0301 = CHULA_EXERCISE_PRESETS.find(p => p.id === "chula-03-01")!;
const chula0405 = CHULA_EXERCISE_PRESETS.find(p => p.id === "chula-04-05")!;

export const mockChulaCodingMission: Mission = {
  id: "mission-chula-04-03",
  type: "coding",
  title: chula0403.title,
  topic: chula0403.topic,
  objectiveIds: ["python-while-accumulate"],
  description: chula0403.description,
  instructions: chula0403.instructions,
  estimatedMinutes: chula0403.estimatedMinutes,
  dueDate: getFutureDate(14),
  status: "published",
  targetStudentIds: ["student-004", "student-007", "student-002"], // Hands-on Coder & Balanced
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  config: {
    prompt: chula0403.title,
    language: "python",
    starterCode: chula0403.starterCode,
    inputConstraints: chula0403.inputConstraints,
    examples: chula0403.examples,
    rubric: chula0403.rubric
  }
};

export const mockChulaShortAnswerMission: Mission = {
  id: "mission-chula-03-01",
  type: "short-answer",
  title: chula0301.title,
  topic: chula0301.topic,
  objectiveIds: ["python-flowchart-logic"],
  description: chula0301.description,
  instructions: chula0301.instructions,
  estimatedMinutes: chula0301.estimatedMinutes,
  dueDate: getFutureDate(10),
  status: "published",
  targetStudentIds: ["student-005", "student-003", "student-002"], // Conceptual Explainer & Balanced
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  config: {
    prompt: chula0301.title,
    minLength: 20,
    maxLength: 3000,
    rubric: chula0301.rubric
  }
};

export const mockChulaQuizMission: Mission = {
  id: "mission-chula-04-05",
  type: "quiz",
  title: chula0405.title,
  topic: chula0405.topic,
  objectiveIds: ["python-exam-grading-logic"],
  description: chula0405.description,
  instructions: chula0405.instructions,
  estimatedMinutes: chula0405.estimatedMinutes,
  dueDate: getFutureDate(7),
  status: "published",
  targetStudentIds: ["student-001", "student-006", "student-008", "student-002"], // Fast Explorer, Improver & Balanced
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  config: {
    prompt: chula0405.title,
    passPercent: 80,
    questions: chula0405.questions
  }
};

export const initialEnvelope: Envelope = {
  schemaVersion: 1,
  revision: 1,
  missions: [
    mockQuizMission,
    mockShortAnswerMission,
    mockCodingMission,
    mockChulaCodingMission,
    mockChulaShortAnswerMission,
    mockChulaQuizMission
  ],
  students: mockStudents,
  objectives: [],
  drafts: [],
  participations: [],
  attempts: [],
  reviews: [],
  quizHistory: [],
  quizDrafts: [],
  questions: [...mockQuizQuestions, ...(chula0405.questions || [])],
  legacyRecords: [],
};

export const createSeededEnvelope = (): Envelope => {
  const now = Date.now();
  const oneHourAgo = new Date(now - 3600000).toISOString();
  const twoHoursAgo = new Date(now - 7200000).toISOString();
  const threeHoursAgo = new Date(now - 10800000).toISOString();

  // Nong Por (student-002): Submitted SA Round 1 (Pending in queue)
  const attPor1: Attempt = {
    id: "att-por-1",
    studentId: "student-002",
    missionId: "mission-sa-loop-001",
    attemptNo: 1,
    type: "short-answer",
    content: "โค้ดแสดง 1, 2, 3, 4, 5 รวม 5 รอบ เลข 1 คือจุดเริ่มต้น แล้วเพิ่มทีละ 1 จนถึงเลข 5 ซึ่งเป็นตัวสุดท้าย ถ้าต้องการให้แสดง 1 ถึง 5 ก็ใช้ range(1, 5) เหมือนเดิมได้",
    language: null,
    revisionNote: "",
    submittedAt: twoHoursAgo,
    submissionToken: "token-por-1",
    pulseRating: "💡 ท้าทายกำลังดี (Good Challenge)"
  };

  // Nong Mind (student-003): Changes Requested on SA Round 1
  const attMind1: Attempt = {
    id: "att-mind-1",
    studentId: "student-003",
    missionId: "mission-sa-loop-001",
    attemptNo: 1,
    type: "short-answer",
    content: "ผลลัพธ์คือ 1 2 3 4 5 รวม 5 รอบ และ 1 คือตัวแรก 5 คือตัวสุดท้าย",
    language: null,
    revisionNote: "",
    submittedAt: threeHoursAgo,
    submissionToken: "token-mind-1",
    pulseRating: "🔄 อยากได้คำแนะนำเพิ่ม"
  };

  const revMind1: Review = {
    id: "rev-mind-1",
    attemptId: "att-mind-1",
    teacherId: "teacher-demo",
    publicationStatus: "published",
    decision: "request_changes",
    feedback: "คุณเข้าใจจุดเริ่มต้นถูกต้องแล้ว แต่ผลลัพธ์ของ range(1, 5) จะหยุดก่อนเลข 5 เสมอ ลองนับดูใหม่ว่าได้ตัวเลขใดบ้าง และมีกี่รอบ",
    criterionScores: { c1: 0, c2: 1, c3: 1 },
    rawScore: 2,
    maxRawScore: 6,
    percentScore: 33,
    outcome: "needs-practice",
    updatedAt: twoHoursAgo,
    publishedAt: twoHoursAgo
  };

  // Nong Ek (student-004): Submitted Coding Round 1 (Pending in queue)
  const attEk1: Attempt = {
    id: "att-ek-1",
    studentId: "student-004",
    missionId: "mission-code-loop-001",
    attemptNo: 1,
    type: "coding",
    content: "def sum_to_n(n):\n    total = 0\n    for i in range(1, n + 1):\n        total += i\n    return total\n",
    language: "python",
    revisionNote: "",
    submittedAt: oneHourAgo,
    submissionToken: "token-ek-1",
    pulseRating: "⚡ ชอบมาก สนุกและถนัด (My Favorite)"
  };

  // Nong Fah (student-005): Completed SA (Round 1 & 2) -> Reviewed & Meets Criteria
  const attFah1: Attempt = {
    id: "att-fah-1",
    studentId: "student-005",
    missionId: "mission-sa-loop-001",
    attemptNo: 1,
    type: "short-answer",
    content: "รอบแรกฉันคิดว่ามันจะพิมพ์ 1 ถึง 5 ออกมารวม 5 รอบ เพราะคิดว่า range จะไปถึงเลขตัวหลังสุดเหมือนกับการนับเลขทั่วไป",
    language: null,
    revisionNote: "",
    submittedAt: threeHoursAgo,
    submissionToken: "token-fah-1",
    pulseRating: "💡 ท้าทายกำลังดี (Good Challenge)"
  };

  const revFah1: Review = {
    id: "rev-fah-1",
    attemptId: "att-fah-1",
    teacherId: "teacher-demo",
    publicationStatus: "published",
    decision: "request_changes",
    feedback: "การนับจุดเริ่มต้นถูกต้องแล้วค่ะ แต่ใน Python ฟังก์ชัน range(start, stop) จะไม่รวมตัวเลข stop นะคะ ลองตรวจสอบอีกครั้งว่าตัวเลขสุดท้ายที่ออกมาคืออะไร และทำให้นับได้กี่รอบ",
    criterionScores: { c1: 0, c2: 1, c3: 1 },
    rawScore: 2,
    maxRawScore: 6,
    percentScore: 33,
    outcome: "needs-practice",
    updatedAt: twoHoursAgo,
    publishedAt: twoHoursAgo
  };

  const attFah2: Attempt = {
    id: "att-fah-2",
    studentId: "student-005",
    missionId: "mission-sa-loop-001",
    attemptNo: 2,
    type: "short-answer",
    content: "ผลลัพธ์ของโค้ดคือ:\n1\n2\n3\n4\n\nเพราะ range(1, 5) เริ่มจาก 1 และหยุดก่อน 5 ทำให้มีตัวเลข 1, 2, 3, 4 เท่านั้น รวมทำงานทั้งหมด 4 รอบ",
    language: null,
    revisionNote: "ปรับแก้ตัวเลขที่พิมพ์ออกมาให้หยุดที่ 4 และแก้วิธีนับจำนวนรอบให้ถูกต้องตามที่ range ทำงานจริง",
    submittedAt: oneHourAgo,
    submissionToken: "token-fah-2",
    pulseRating: "⚡ เข้าใจกระจ่าง (Mastered)"
  };

  const revFah2: Review = {
    id: "rev-fah-2",
    attemptId: "att-fah-2",
    teacherId: "teacher-demo",
    publicationStatus: "published",
    decision: "finalize",
    feedback: "คุณแก้ความเข้าใจเรื่อง stop ได้ถูกต้องแล้ว และใช้ลำดับตัวเลขตรวจจำนวนรอบได้ ต่อไปลองใช้หลักเดียวกันกับลูปที่ต้องบวกเลข 1 ถึงค่าที่กำหนด",
    criterionScores: { c1: 2, c2: 2, c3: 2 },
    rawScore: 6,
    maxRawScore: 6,
    percentScore: 100,
    outcome: "meets-criteria",
    updatedAt: new Date(now - 1800000).toISOString(),
    publishedAt: new Date(now - 1800000).toISOString()
  };

  // Quiz histories:
  // Nong Ton (student-001): 0/3 (needs practice as per Demo doc)
  const qhTon: QuizHistoryEntry = {
    id: "qh-ton-1",
    missionId: "mission-quiz-loop-001",
    studentId: "student-001",
    attemptNo: 1,
    answers: { q1: "opt-2", q2: "opt-3", q3: "opt-1" },
    score: 0,
    maxScore: 3,
    percentScore: 0,
    passed: false,
    submittedAt: threeHoursAgo,
    pulseRating: "🧩 อยากได้คำใบ้เพิ่ม (Need More Guidance)"
  };

  // Nong Por (student-002): 3/3 (100% passed)
  const qhPor: QuizHistoryEntry = {
    id: "qh-por-1",
    missionId: "mission-quiz-loop-001",
    studentId: "student-002",
    attemptNo: 1,
    answers: { q1: "opt-1", q2: "opt-2", q3: "opt-3" },
    score: 3,
    maxScore: 3,
    percentScore: 100,
    passed: true,
    submittedAt: twoHoursAgo,
    pulseRating: "⚡ สนุกและถนัดมาก (My Favorite)"
  };

  // Nong Fah (student-005): 3/3 (100% passed)
  const qhFah: QuizHistoryEntry = {
    id: "qh-fah-1",
    missionId: "mission-quiz-loop-001",
    studentId: "student-005",
    attemptNo: 1,
    answers: { q1: "opt-1", q2: "opt-2", q3: "opt-3" },
    score: 3,
    maxScore: 3,
    percentScore: 100,
    passed: true,
    submittedAt: twoHoursAgo,
    pulseRating: "⚡ เข้าใจกระจ่าง (Mastered)"
  };

  // Nong Joy (student-006): 2/3 (66.7% needs practice)
  const qhJoy: QuizHistoryEntry = {
    id: "qh-joy-1",
    missionId: "mission-quiz-loop-001",
    studentId: "student-006",
    attemptNo: 1,
    answers: { q1: "opt-1", q2: "opt-1", q3: "opt-3" },
    score: 2,
    maxScore: 3,
    percentScore: 66.7,
    passed: false,
    submittedAt: oneHourAgo,
    pulseRating: "💡 ท้าทายกำลังดี (Good Challenge)"
  };

  return {
    schemaVersion: 1,
    revision: 2,
    missions: [
      mockQuizMission,
      mockShortAnswerMission,
      mockCodingMission,
      mockChulaCodingMission,
      mockChulaShortAnswerMission,
      mockChulaQuizMission
    ],
    students: mockStudents,
    objectives: [],
    drafts: [
      {
        studentId: "student-007",
        missionId: "mission-sa-loop-001",
        basedOnAttemptId: null,
        content: "กำลังอ่านโจทย์และวิเคราะห์ค่าใน range...",
        language: null,
        revisionNote: "",
        updatedAt: oneHourAgo
      },
      {
        studentId: "student-003",
        missionId: "mission-sa-loop-001",
        basedOnAttemptId: "att-mind-1",
        content: "ผลลัพธ์คือ 1 2 3 4 เพราะ range หยุดก่อน 5...",
        language: null,
        revisionNote: "กำลังปรับแก้ความเข้าใจเรื่อง stop",
        updatedAt: oneHourAgo
      }
    ],
    participations: [
      { studentId: "student-001", missionId: "mission-quiz-loop-001", startedAt: threeHoursAgo },
      { studentId: "student-002", missionId: "mission-sa-loop-001", startedAt: twoHoursAgo },
      { studentId: "student-002", missionId: "mission-quiz-loop-001", startedAt: twoHoursAgo },
      { studentId: "student-003", missionId: "mission-sa-loop-001", startedAt: threeHoursAgo },
      { studentId: "student-004", missionId: "mission-code-loop-001", startedAt: oneHourAgo },
      { studentId: "student-005", missionId: "mission-sa-loop-001", startedAt: threeHoursAgo },
      { studentId: "student-005", missionId: "mission-quiz-loop-001", startedAt: twoHoursAgo },
      { studentId: "student-006", missionId: "mission-quiz-loop-001", startedAt: oneHourAgo },
      { studentId: "student-007", missionId: "mission-sa-loop-001", startedAt: oneHourAgo }
    ],
    attempts: [attPor1, attMind1, attEk1, attFah1, attFah2],
    reviews: [revMind1, revFah1, revFah2],
    quizHistory: [qhTon, qhPor, qhFah, qhJoy],
    quizDrafts: [],
    questions: [...mockQuizQuestions, ...(chula0405.questions || [])],
    legacyRecords: []
  };
};

export const mockAuthUsers: AuthUser[] = [
  {
    id: "admin-001",
    name: "อ.ดร.สมศักดิ์ นวัตกรรม",
    email: "admin@school.ac.th",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    role: "admin",
    department: "ฝ่ายเทคโนโลยีสารสนเทศและวิชาการ",
    schoolId: "SCH-0001",
    status: "active",
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 15).toISOString() // 15 mins ago
  },
  {
    id: "teacher-demo",
    name: "ครูเมย์ ชลธิชา",
    email: "may.ch@school.ac.th",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
    role: "teacher",
    department: "กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี",
    schoolId: "TCH-0421",
    status: "active",
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    id: "student-001",
    name: "ต้นกล้า การดี (น้องต้น)",
    email: "ton.k@school.ac.th",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80",
    role: "student",
    department: "มัธยมศึกษาปีที่ 4/1",
    schoolId: "STD-40101",
    status: "active",
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 90).toISOString()
  },
  {
    id: "student-002",
    name: "ปรียา สุขสวัสดิ์ (น้องปอ)",
    email: "por.p@school.ac.th",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
    role: "student",
    department: "มัธยมศึกษาปีที่ 4/1",
    schoolId: "STD-40102",
    status: "active",
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 120).toISOString()
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
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 180).toISOString()
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
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 60).toISOString()
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
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
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
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 140).toISOString()
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
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 200).toISOString()
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
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 240).toISOString()
  }
];

export const initialGoogleConfig: GoogleWorkspaceConfig = {
  allowedDomains: ["school.ac.th", "learnwise.edu"],
  enforceDomainRestriction: true,
  autoProvisioning: true,
  defaultRole: "student",
  schoolName: "โรงเรียนสาธิตนวัตกรรมวิทยาการ (Demo Academy)",
  academicYear: "2567",
  currentTerm: "1"
};

export const initialAuditLogs: AuditLogEntry[] = [
  {
    id: "log-001",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    userEmail: "admin@school.ac.th",
    userName: "อ.ดร.สมศักดิ์ นวัตกรรม",
    role: "admin",
    category: "auth",
    action: "Google OAuth 2.0 Sign-In",
    details: "เข้าสู่ระบบสำเร็จผ่านบัญชี Google Workspace (Single Sign-On)",
    ipAddress: "192.168.1.10 (School Wi-Fi)"
  },
  {
    id: "log-002",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    userEmail: "may.ch@school.ac.th",
    userName: "ครูเมย์ ชลธิชา",
    role: "teacher",
    category: "academic",
    action: "Export Grade Sheet (SGS CSV)",
    details: "ดาวน์โหลดคะแนนประเมิน ว 4.2 ม.4/1 รูปแบบ UTF-8 with BOM สำหรับระบบ SGS",
    ipAddress: "192.168.1.42 (Faculty Staff)"
  },
  {
    id: "log-003",
    timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    userEmail: "may.ch@school.ac.th",
    userName: "ครูเมย์ ชลธิชา",
    role: "teacher",
    category: "academic",
    action: "Generate Official Transcript (ปพ.5)",
    details: "สร้างเอกสารแบบบันทึกผลการพัฒนาคุณภาพผู้เรียน (ปพ.5) ฉบับทางการ",
    ipAddress: "192.168.1.42 (Faculty Staff)"
  },
  {
    id: "log-004",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    userEmail: "ek.s@school.ac.th",
    userName: "เอกภพ ศิลปะ (น้องเอก)",
    role: "student",
    category: "auth",
    action: "Google OAuth 2.0 Sign-In",
    details: "เข้าสู่ระบบเพื่อทำภารกิจเขียนโค้ด (Coding Challenge 04-03)",
    ipAddress: "192.168.2.104 (Computer Lab 1)"
  },
  {
    id: "log-005",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    userEmail: "admin@school.ac.th",
    userName: "อ.ดร.สมศักดิ์ นวัตกรรม",
    role: "admin",
    category: "security",
    action: "Google Workspace Domain Sync",
    details: "ตรวจสอบสถานะการซิงก์โดเมน @school.ac.th พร้อมใช้งาน 100%",
    ipAddress: "192.168.1.10 (School Wi-Fi)"
  }
];
