import { MissionType, Rubric, QuizQuestion, CodeExample, LearnerPersona } from "../types";

export interface ChulaExercisePreset {
  id: string;
  code: string; // e.g. "04-03", "03-01"
  chapter: string; // e.g. "04: Repetition", "03: Selection"
  title: string;
  topic: string;
  type: MissionType;
  description: string;
  instructions: string;
  estimatedMinutes: number;
  starterCode?: string;
  inputConstraints?: string;
  examples?: CodeExample[];
  questions?: QuizQuestion[];
  rubric: Rubric;
  recommendedPersona: LearnerPersona;
  badgeLabel: string;
}

export const CHULA_EXERCISE_PRESETS: ChulaExercisePreset[] = [
  // =========================================================================
  // 1. Coding Challenge: 04-03 ค่าเฉลี่ย (While Loop)
  // =========================================================================
  {
    id: "chula-04-03",
    code: "04-03",
    chapter: "04: Repetition (for, while)",
    title: "04-03: การหาค่าเฉลี่ยด้วย While Loop จนกว่าจะพบ 'q'",
    topic: "โครงสร้างควบคุมแบบวนซ้ำ (While Loop)",
    type: "coding",
    description: "รับตัวเลขจำนวนจริงเข้ามาทีละบรรทัดไม่จำกัดจำนวน จนกว่าจะพบตัวอักษร 'q' แล้วคำนวณและแสดงค่าเฉลี่ยของตัวเลขทั้งหมด",
    instructions: `จงเขียนโปรแกรมหาค่าเฉลี่ยของชุดข้อมูลที่รับจากแป้นพิมพ์
ข้อมูลนำเข้า:
- จำนวนจริงบรรทัดละหนึ่งจำนวน
- บรรทัดสุดท้ายเป็นตัวอักษร 'q' เพื่อบอกจุดสิ้นสุดข้อมูล

ข้อมูลส่งออก:
- ค่าเฉลี่ยของข้อมูลที่รับเข้ามา โดยแสดงเลขหลังจุดทศนิยม 2 ตำแหน่ง (ใช้ round(avg, 2))
- หากไม่มีข้อมูลตัวเลขเลย (กด 'q' ทันที) ให้แสดงข้อความว่า "No Data"

ตัวอย่าง:
Input:
10
20
30
41.5
q
Output:
25.38`,
    estimatedMinutes: 20,
    starterCode: `# 04-03: การหาค่าเฉลี่ย
total = 0.0
count = 0

while True:
    line = input().strip()
    if line == 'q':
        break
    # แปลงข้อมูลและสะสมค่าผลรวมและจำนวน
    num = float(line)
    total += num
    count += 1

# ตรวจสอบและแสดงผล
if count == 0:
    print("No Data")
else:
    avg = total / count
    print(round(avg, 2))
`,
    inputConstraints: "จำนวนจริงบวกหรือลบ บรรทัดละ 1 จำนวน สิ้นสุดด้วย 'q'",
    examples: [
      { input: "10\\n20\\n30\\n41.5\\nq", output: "25.38", note: "ผลรวม 101.5 หาร 4 ได้ 25.375 ปัดเป็น 25.38" },
      { input: "10\\n20\\nq", output: "15.0", note: "ผลรวม 30 หาร 2 ได้ 15.0" },
      { input: "q", output: "No Data", note: "ไม่มีข้อมูลเข้ามาเลย" }
    ],
    rubric: {
      criteria: [
        {
          id: "c1",
          label: "A. เงื่อนไขการจบลูปและการหยุดด้วย 'q'",
          maxPoints: 2,
          levels: {
            "0": "ลูปไม่รู้จบ (Infinite Loop) หรือไม่สามารถตรวจจับตัวอักษร 'q' ได้",
            "1": "หยุดเมื่อพบ 'q' ได้แต่ประมวลผลข้อมูลตัวสุดท้ายผิดพลาด",
            "2": "ควบคุมโครงสร้าง While Loop และออกจากลูปเมื่อพบ 'q' ได้อย่างสมบูรณ์"
          }
        },
        {
          id: "c2",
          label: "B. การสะสมผลรวมและการนับจำนวนข้อมูล (Accumulator Pattern)",
          maxPoints: 2,
          levels: {
            "0": "ไม่สะสมค่าหรือไม่ได้นับจำนวนข้อมูล",
            "1": "สะสมค่าผลรวมหรือจำนวนนับตกหล่นบางกรณี",
            "2": "สะสมผลรวมและนับจำนวนตัวเลขถูกต้องทุกกรณี"
          }
        },
        {
          id: "c3",
          label: "C. การจัดการกรณีพิเศษ (Edge Case: No Data) และการปัดเศษ",
          maxPoints: 2,
          levels: {
            "0": "เกิดข้อผิดพลาด ZeroDivisionError เมื่อไม่มีข้อมูล",
            "1": "แสดงผลทศนิยมไม่ตรง 2 ตำแหน่ง",
            "2": "แสดง No Data เมื่อ count=0 และปัดเศษทศนิยม 2 ตำแหน่งถูกต้องสมบูรณ์"
          }
        }
      ],
      passRawPoints: 5,
      requiredFullScoreCriterionIds: ["c1"]
    },
    recommendedPersona: "Hands-on Coder",
    badgeLabel: "💻 สาย Coder แนะนำ"
  },

  // =========================================================================
  // 2. Coding Challenge: 04-10 Run-Length Encoding
  // =========================================================================
  {
    id: "chula-04-10",
    code: "04-10",
    chapter: "04: Repetition (for, while)",
    title: "04-10: การบีบอัดข้อความด้วย Run-Length Encoding (RLE)",
    topic: "การวนซ้ำและการประมวลผลสตริง",
    type: "coding",
    description: "ถ้ามีสตริงที่มีตัวอักษรซ้ำกันติดๆ กัน เช่น 'AAAAAAAAAABBBB' จงบีบอัดให้อยู่ในรูปแบบ 'A 10 B 4'",
    instructions: `จงเขียนโปรแกรมรับสตริงหนึ่งบรรทัด เพื่อเปลี่ยนเป็นสตริงในรูปแบบ run-length encoding แล้วแสดงทางจอภาพ

ข้อมูลนำเข้า:
- สตริงหนึ่งบรรทัด ประกอบด้วยตัวอักษรภาษาอังกฤษตัวใหญ่เท่านั้น

ข้อมูลส่งออก:
- สตริงในรูปแบบ run-length encoding แต่ละคู่คั่นด้วยช่องว่าง

ตัวอย่าง:
Input:
ABBA
Output:
A 1 B 2 A 1

Input:
ZZZZZZZZZZZZZZZZZZZZZZZZZZZZ
Output:
Z 28`,
    estimatedMinutes: 25,
    starterCode: `# 04-10: Run-Length Encoding
text = input().strip()

if len(text) == 0:
    print("")
else:
    result = []
    current_char = text[0]
    count = 1
    
    for i in range(1, len(text)):
        if text[i] == current_char:
            count += 1
        else:
            result.append(f"{current_char} {count}")
            current_char = text[i]
            count = 1
            
    result.append(f"{current_char} {count}")
    print(" ".join(result))
`,
    inputConstraints: "ตัวอักษรภาษาอังกฤษตัวพิมพ์ใหญ่ A-Z ไม่มีความยาวเกิน 1,000 ตัวอักษร",
    examples: [
      { input: "ABBA", output: "A 1 B 2 A 1", note: "A 1 ตัว, B 2 ตัว, A 1 ตัว" },
      { input: "AAAAABBB", output: "A 5 B 3", note: "A 5 ตัว, B 3 ตัว" }
    ],
    rubric: {
      criteria: [
        {
          id: "c1",
          label: "A. ความถูกต้องของการนับตัวอักษรที่ติดกัน",
          maxPoints: 2,
          levels: {
            "0": "นับตัวอักษรผิดพลาด ไม่ตรวจจับตัวติดกัน",
            "1": "นับถูกบางส่วนแต่กลุ่มสุดท้ายตกหล่น",
            "2": "ตรวจจับและนับตัวอักษรที่ซ้ำกันต่อเนื่องได้ครบถ้วน"
          }
        },
        {
          id: "c2",
          label: "B. การเปลี่ยนผ่านสถานะ (State Transition Logic)",
          maxPoints: 2,
          levels: {
            "0": "ไม่รีเซ็ต count เมื่อเจอตัวอักษรใหม่",
            "1": "รีเซ็ตค่าแต่นำตัวอักษรเดิมมาต่อท้ายผิดตำแหน่ง",
            "2": "รีเซ็ตและบันทึกอักขระใหม่พร้อมจำนวนได้อย่างสมบูรณ์"
          }
        },
        {
          id: "c3",
          label: "C. การแสดงผลและกรณีสตริงสั้น",
          maxPoints: 2,
          levels: {
            "0": "รูปแบบเว้นวรรคผิด หรือเกิด Index Error",
            "1": "รูปแบบคลาดเคลื่อนเล็กน้อย",
            "2": "แสดงผลคั่นด้วยช่องว่างถูกต้องตรงตามสเปกทุกประการ"
          }
        }
      ],
      passRawPoints: 5,
      requiredFullScoreCriterionIds: ["c1"]
    },
    recommendedPersona: "Hands-on Coder",
    badgeLabel: "💻 สาย Coder แนะนำ"
  },

  // =========================================================================
  // 3. Coding Challenge: 07-07 ตรวจสอบความปลอดภัยของรหัสผ่าน
  // =========================================================================
  {
    id: "chula-07-07",
    code: "07-07",
    chapter: "07: String and File Processing",
    title: "07-07: เครื่องมือตรวจสอบความปลอดภัยของรหัสผ่าน (Password Validator)",
    topic: "การประมวลผลสตริงและเงื่อนไขความปลอดภัย",
    type: "coding",
    description: "ตรวจสอบรหัสผ่านว่าขาดคุณสมบัติสำคัญด้านความปลอดภัยข้อใดบ้าง ตามเกณฑ์ 6 ข้อของระบบรักษาความปลอดภัย",
    instructions: `รหัสผ่านที่ดีต้องมีลักษณะสำคัญดังนี้:
1. ต้องมีความยาวอย่างน้อย 8 ตัวอักษร
2. ต้องมีตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่ ตัวเลข และสัญลักษณ์อื่น ๆ
3. ต้องไม่มีอักขระ 4 ตัวใดที่ติดกันซ้ำกัน (เช่น aaaa)
4. ต้องไม่มีอักขระ 4 ตัวใดที่ติดกันเป็นลำดับตัวเลข (เช่น 1234, 4321)
5. ต้องไม่มีอักขระ 4 ตัวใดที่ติดกันเป็นลำดับตัวอักษร (เช่น abcd, dcba)
6. ต้องไม่มีอักขระ 4 ตัวใดที่ติดกันเป็นลำดับปุ่มแป้นพิมพ์ (เช่น asdf, qwer)

จงเขียนโปรแกรมตรวจสอบรหัสผ่าน หากผ่านทุกข้อให้พิมพ์ "OK" หากไม่ผ่านให้แสดงข้อความเตือนตามลำดับ`,
    estimatedMinutes: 30,
    starterCode: `# 07-07: ตรวจสอบความปลอดภัยของรหัสผ่าน
password = input().strip()
errors = []

# 1. ความยาว
if len(password) < 8:
    errors.append("Less than 8 characters")

# 2. องค์ประกอบ
has_lower = any(c.islower() for c in password)
has_upper = any(c.isupper() for c in password)
has_digit = any(c.isdigit() for c in password)
has_symbol = any(not c.isalnum() for c in password)

if not has_lower:
    errors.append("No lowercase letters")
if not has_upper:
    errors.append("No uppercase letters")
if not has_digit:
    errors.append("No numbers")
if not has_symbol:
    errors.append("No symbols")

if len(errors) == 0:
    print("OK")
else:
    for err in errors:
        print(err)
`,
    inputConstraints: "สตริงรหัสผ่านความยาว 1 ถึง 100 ตัวอักษร",
    examples: [
      { input: "pass", output: "Less than 8 characters\\nNo uppercase letters\\nNo numbers\\nNo symbols", note: "ขาด 4 เงื่อนไข" },
      { input: "ILoveProgrammingInPython2110101$", output: "OK", note: "ผ่านเกณฑ์สมบูรณ์" }
    ],
    rubric: {
      criteria: [
        {
          id: "c1",
          label: "A. ความถูกต้องของการตรวจสอบชนิดอักขระ",
          maxPoints: 2,
          levels: {
            "0": "ตรวจจับตัวพิมพ์ใหญ่/เล็กหรือตัวเลขไม่ถูกต้อง",
            "1": "ตรวจสัญลักษณ์พิเศษคลาดเคลื่อนบางตัว",
            "2": "จำแนกและตรวจสอบอักขระครบทั้ง 4 ประเภทได้อย่างแม่นยำ"
          }
        },
        {
          id: "c2",
          label: "B. การจัดลำดับการแจ้งเตือนตามข้อกำหนด",
          maxPoints: 2,
          levels: {
            "0": "ลำดับข้อความแจ้งเตือนไม่ตรงตามเกณฑ์",
            "1": "ข้อความบางรายการสะกดผิด",
            "2": "แสดงรายการข้อผิดพลาดเรียงลำดับถูกต้องสมบูรณ์"
          }
        },
        {
          id: "c3",
          label: "C. การแสดงผลลัพธ์กรณีรหัสผ่านปลอดภัย (OK)",
          maxPoints: 2,
          levels: {
            "0": "ไม่แสดงผล OK แม้รหัสผ่านจะถูกต้อง",
            "1": "มีอักขระส่วนเกินปนออกมา",
            "2": "แสดง OK ชัดเจนเมื่อผ่านทุกเงื่อนไข"
          }
        }
      ],
      passRawPoints: 5,
      requiredFullScoreCriterionIds: ["c1"]
    },
    recommendedPersona: "Hands-on Coder",
    badgeLabel: "💻 สาย Coder แนะนำ"
  },

  // =========================================================================
  // 4. Conceptual Short-Answer: 03-01 ผังงานการตัดเกรด
  // =========================================================================
  {
    id: "chula-03-01",
    code: "03-01",
    chapter: "03: Selection (if-elif-else)",
    title: "03-01: การวิเคราะห์ผังงานการตัดเกรด (Flowchart to Code Logic)",
    topic: "โครงสร้างทางเลือกและการจัดลำดับเงื่อนไข",
    type: "short-answer",
    description: "วิเคราะห์ผังงานการตัดเกรด A, B, C, D, F และอธิบายว่าทำไมลำดับของเงื่อนไขจึงมีความสำคัญอย่างยิ่งต่อผลลัพธ์",
    instructions: `จากโจทย์ 03-01: ผังงานการตัดเกรด
มีเงื่อนไขตามลำดับ:
1. ถ้าคะแนน s >= 80 ได้เกรด "A"
2. มิฉะนั้นถ้า s >= 70 ได้เกรด "B"
3. มิฉะนั้นถ้า s >= 60 ได้เกรด "C"
4. มิฉะนั้นถ้า s >= 50 ได้เกรด "D"
5. มิฉะนั้นได้เกรด "F"

จงอธิบายและตอบคำถาม 3 ประเด็นต่อไปนี้:
1. หากโปรแกรมเมอร์เขียนเงื่อนไขสลับกัน โดยเอา 'if s >= 50: return "D"' ไว้เป็นเงื่อนไขแรก จะเกิดข้อผิดพลาดร้ายแรงอย่างไรกับนักเรียนที่ได้คะแนน 95 คะแนน?
2. เพราะเหตุใดในโครงสร้าง if-elif-else จึงไม่จำเป็นต้องเขียนเงื่อนไขซ้ำซ้อน เช่น 'elif s >= 70 and s < 80:'?
3. จงเขียนโค้ด Python ที่ถูกต้องสั้นกระชับเพื่อแปลงผังงานนี้เป็นคำสั่งที่พร้อมใช้งาน`,
    estimatedMinutes: 20,
    rubric: {
      criteria: [
        {
          id: "c1",
          label: "A. ความเข้าใจลำดับการประเมินผลเงื่อนไข (Evaluation Order)",
          maxPoints: 2,
          levels: {
            "0": "ไม่อธิบายหรือเข้าใจผิดเกี่ยวกับลำดับการทำงานของ if",
            "1": "อธิบายได้ว่าเด็ก 95 จะได้เกรด D แต่ไม่อธิบายกลไก Short-circuit",
            "2": "อธิบายชัดเจนว่าเงื่อนไขแรกที่เป็นจริงจะดักจับค่าทันที ทำให้เงื่อนไขหลังไม่มีโอกาสทำงาน"
          }
        },
        {
          id: "c2",
          label: "B. การตัดเงื่อนไขที่ซ้ำซ้อนด้วย elif (Redundancy Elimination)",
          maxPoints: 2,
          levels: {
            "0": "ยังไม่เข้าใจว่า elif ทำงานต่อเมื่อเงื่อนไขก่อนหน้าเป็นเท็จ",
            "1": "อธิบายได้บางส่วนแต่ยังไม่เชื่อมโยงกับค่าความจริง",
            "2": "อธิบายชัดเจนว่าเมื่อมาถึง elif s >= 70 แปลว่า s < 80 เป็นจริงอยู่แล้วโดยอัตโนมัติ"
          }
        },
        {
          id: "c3",
          label: "C. ตัวอย่างโค้ด Python ที่กระชับและถูกต้อง",
          maxPoints: 2,
          levels: {
            "0": "ไม่เขียนโค้ดหรือไวยากรณ์ผิดพลาดอย่างรุนแรง",
            "1": "โค้ดทำงานได้แต่ยังมีเงื่อนไขซ้ำซ้อน",
            "2": "เขียนโครงสร้าง if-elif-else ครบ 5 ระดับถูกต้องตามหลักการเขียนโปรแกรมที่ดี"
          }
        }
      ],
      passRawPoints: 5,
      requiredFullScoreCriterionIds: ["c1"]
    },
    recommendedPersona: "Conceptual Explainer",
    badgeLabel: "✍️ สาย Explainer แนะนำ"
  },

  // =========================================================================
  // 5. Conceptual Short-Answer: 05-06 ข้อความคาดการณ์ Collatz
  // =========================================================================
  {
    id: "chula-05-06",
    code: "05-06",
    chapter: "05: List Processing",
    title: "05-06: การสืบสวนข้อความคาดการณ์ Collatz (Collatz Loop Tracing)",
    topic: "การติดตามการวนซ้ำและการเปลี่ยนแปลงค่าในลูป",
    type: "short-answer",
    description: "วิเคราะห์พฤติกรรมการวนซ้ำของสมมติฐาน Collatz (3n + 1) และอธิบายการติดตามค่าจนลู่เข้าสู่เลข 1",
    instructions: `จากโจทย์ 05-06: ปัญหา Collatz
กำหนดกฎการเปลี่ยนค่า n:
- ขณะที่ n != 1:
  - ถ้า n เป็นเลขคู่: n = n // 2
  - ถ้า n เป็นเลขคี่: n = 3*n + 1

จงอธิบายและตอบคำถาม 3 ประเด็น:
1. จงเขียน Trace Table แสดงค่าของ n ในแต่ละรอบ เมื่อเริ่มต้นที่ n = 6 จนกระทั่งกลายเป็น 1 (ระบุลำดับทุกขั้น)
2. เหตุใดจึงต้องใช้ While Loop แทนที่จะใช้ For Loop ในการแก้ปัญหานี้?
3. ในทางทฤษฎีการเขียนโปรแกรม มีความเสี่ยงที่ While Loop ในข้อความคาดการณ์ Collatz จะกลายเป็น Infinite Loop หรือไม่ เพราะเหตุใด?`,
    estimatedMinutes: 20,
    rubric: {
      criteria: [
        {
          id: "c1",
          label: "A. ความถูกต้องของการไล่ค่า Trace Table (Execution Tracing)",
          maxPoints: 2,
          levels: {
            "0": "คำนวณลำดับผิดพลาดตั้งแต่ต้น",
            "1": "ลำดับตัวเลขถูกต้องบางส่วนแต่คำนวณจำนวนรอบผิด",
            "2": "ไล่ลำดับ 6 -> 3 -> 10 -> 5 -> 16 -> 8 -> 4 -> 2 -> 1 ถูกต้องครบถ้วน 8 ขั้น"
          }
        },
        {
          id: "c2",
          label: "B. การเปรียบเทียบความเหมาะสมของ While Loop vs For Loop",
          maxPoints: 2,
          levels: {
            "0": "ไม่สามารถแยกความแตกต่างระหว่าง while และ for",
            "1": "อธิบายได้แต่เหตุผลยังไม่สมบูรณ์",
            "2": "ระบุชัดเจนว่า While เหมาะกับการวนซ้ำที่ไม่ทราบจำนวนรอบล่วงหน้า (Indefinite Iteration)"
          }
        },
        {
          id: "c3",
          label: "C. การวิเคราะห์ปัญหาการจบลูป (Halting Problem Insight)",
          maxPoints: 2,
          levels: {
            "0": "ไม่อธิบายประเด็น Infinite Loop",
            "1": "อธิบายเพียงว่ายังไม่มีใครพิสูจน์ได้",
            "2": "อธิบายเชื่อมโยงได้อย่างลึกซึ้งว่าเป็น Unsolved Problem ทางคณิตศาสตร์ที่ยังไม่รับประกันการจบลูปสำหรับทุกจำนวนจริงบวก"
          }
        }
      ],
      passRawPoints: 5,
      requiredFullScoreCriterionIds: ["c1"]
    },
    recommendedPersona: "Conceptual Explainer",
    badgeLabel: "✍️ สาย Explainer แนะนำ"
  },

  // =========================================================================
  // 6. Logic Mastery Quiz: 04-05 การตรวจคำตอบปรนัย
  // =========================================================================
  {
    id: "chula-04-05",
    code: "04-05",
    chapter: "04: Repetition (for, while)",
    title: "04-05: แบบทดสอบตรรกะการตรวจข้อสอบปรนัย (Multiple Choice Grader Quiz)",
    topic: "ตรรกะการเปรียบเทียบสตริงและการตรวจจับข้อผิดพลาด",
    type: "quiz",
    description: "ทดสอบความเข้าใจตรรกะการวนลูปตรวจข้อสอบ การเข้าถึง Index ของสตริง 2 ชุด และการตรวจสอบความยาว",
    instructions: "ทำแบบทดสอบตรรกะเชิงการเขียนโปรแกรม 5 ข้อ เกณฑ์ผ่าน 80% (ตอบถูกอย่างน้อย 4 จาก 5 ข้อ)",
    estimatedMinutes: 15,
    questions: [
      {
        id: "q1",
        prompt: "จากโจทย์ 04-05 หากสตริงเฉลยคือ 'AAABC' และคำตอบนักเรียนคือ 'AABCC' โปรแกรมเปรียบเทียบทีละตัวอักษร นักเรียนคนนี้ตอบถูกกี่ข้อ?",
        options: [
          { id: "a", label: "ก", text: "2 ข้อ" },
          { id: "b", label: "ข", text: "3 ข้อ (ข้อ 1=A, ข้อ 2=A, ข้อ 5=C)" },
          { id: "c", label: "ค", text: "4 ข้อ" },
          { id: "d", label: "ง", text: "5 ข้อ" }
        ],
        correctOptionId: "b",
        explanation: "เปรียบเทียบทีละคู่: sol[0]=='A'==ans[0] (ถูก), sol[1]=='A'==ans[1] (ถูก), sol[2]=='A'!=ans[2]=='B' (ผิด), sol[3]=='B'!=ans[3]=='C' (ผิด), sol[4]=='C'==ans[4] (ถูก) รวมถูก 3 ข้อ"
      },
      {
        id: "q2",
        prompt: "หากสตริงเฉลยมีความยาว 10 ตัวอักษร แต่คำตอบของนักเรียนมีความยาว 8 ตัวอักษร โปรแกรมควรดำเนินการอย่างไรเป็นอันดับแรก?",
        options: [
          { id: "a", label: "ก", text: "ตรวจเฉพาะ 8 ข้อแรก แล้วให้คะแนนตามนั้น" },
          { id: "b", label: "ข", text: "เติม 'X' ให้ครบ 10 ตัวอักษรแล้วค่อยตรวจ" },
          { id: "c", label: "ค", text: "ตรวจสอบเงื่อนไข len(sol) != len(ans) ทันทีก่อนเข้าลูป แล้วแสดง 'Incomplete answer'" },
          { id: "d", label: "ง", text: "เกิด Error ทันทีในคำสั่ง input()" }
        ],
        correctOptionId: "c",
        explanation: "การเขียนโปรแกรมที่ดีต้องตรวจสอบเงื่อนไขความถูกต้องของ Input (Validation) ก่อน หากความยาวไม่เท่ากัน ให้แจ้ง Incomplete answer ทันทีเพื่อป้องกัน IndexError ในลูป"
      },
      {
        id: "q3",
        prompt: "โค้ดส่วนใดต่อไปนี้เขียนการวนลูปตรวจข้อสอบปรนัยได้กระชับและเป็น Pythonic ที่สุด?",
        options: [
          { id: "a", label: "ก", text: "score = sum(1 for s, a in zip(solution, student) if s == a)" },
          { id: "b", label: "ข", text: "score = len(solution) - len(student)" },
          { id: "c", label: "ค", text: "score = solution.count(student)" },
          { id: "d", label: "ง", text: "score = int(solution == student)" }
        ],
        correctOptionId: "a",
        explanation: "ฟังก์ชัน zip() ช่วยจับคู่ตัวอักษรในตำแหน่งเดียวกันของทั้งสองสตริง และ sum() พร้อม Generator Expression ทำหน้าที่นับจำนวนคู่ที่ตรงกันได้อย่างมีประสิทธิภาพและกระชับ"
      },
      {
        id: "q4",
        prompt: "หากเฉลยคือ 'AAAAA' และคำตอบของนักเรียนคือ 'BBBBB' ผลลัพธ์คะแนนที่ได้คือข้อใด?",
        options: [
          { id: "a", label: "ก", text: "0 คะแนน" },
          { id: "b", label: "ข", text: "5 คะแนน" },
          { id: "c", label: "ค", text: "Incomplete answer" },
          { id: "d", label: "ง", text: "Invalid input" }
        ],
        correctOptionId: "a",
        explanation: "ความยาวเท่ากันทั้งสองสตริง (5 ตัวอักษร) แต่ไม่มีตัวอักษรใดตรงกันเลยในแต่ละตำแหน่ง คะแนนจึงเป็น 0 อย่างถูกต้อง"
      },
      {
        id: "q5",
        prompt: "ข้อใดคือประโยชน์หลักของการนำแนวคิดในโจทย์ 04-05 ไปประยุกต์ใช้ในระบบ LearnWise Assessment?",
        options: [
          { id: "a", label: "ก", text: "ใช้ตรวจผลข้อสอบ Quiz อัตโนมัติแบบ Real-time และคืน Feedback ได้ในเสี้ยววินาที" },
          { id: "b", label: "ข", text: "ใช้คำนวณราคาฮาร์ดแวร์ของคอมพิวเตอร์" },
          { id: "c", label: "ค", text: "ใช้แทนที่ครูผู้สอนในการบรรยายในห้องเรียน" },
          { id: "d", label: "ง", text: "ใช้บีบอัดไฟล์วิดีโอการสอน" }
        ],
        correctOptionId: "a",
        explanation: "ตรรกะการเปรียบเทียบคีย์คำตอบปรนัยคือรากฐานของระบบ Auto-Grading ใน LearnWise ที่ทำให้นักเรียนรู้ผลคะแนนพร้อมคำอธิบายได้ทันที"
      }
    ],
    rubric: {
      criteria: [
        {
          id: "c1",
          label: "ความแม่นยำในการทำแบบทดสอบตรรกะ (Auto-graded)",
          maxPoints: 6,
          levels: {
            "0": "คะแนนต่ำกว่า 60%",
            "2": "คะแนน 60-79%",
            "4": "คะแนน 80-99% (ผ่านเกณฑ์)",
            "6": "คะแนนเต็ม 100% (ดีเยี่ยม)"
          }
        }
      ],
      passRawPoints: 5,
      requiredFullScoreCriterionIds: ["c1"]
    },
    recommendedPersona: "Fast Explorer",
    badgeLabel: "🎯 สาย Explorer แนะนำ"
  },

  // =========================================================================
  // 7. Logic Mastery Quiz: 02-01 เลขประจำตัวประชาชน (Check Digit)
  // =========================================================================
  {
    id: "chula-02-01",
    code: "02-01",
    chapter: "02: Basic String & List",
    title: "02-01: แบบทดสอบตรรกะเลขประจำตัวประชาชน (Check Digit Arithmetic)",
    topic: "การประมวลผลตัวเลขและคณิตศาสตร์มอดุโล (Modulo)",
    type: "quiz",
    description: "ทดสอบความเข้าใจสูตรการคำนวณ Check Digit เลขบัตรประชาชน 13 หลักและการนำสูตรคณิตศาสตร์มาเขียนโค้ด",
    instructions: "ทำแบบทดสอบตรรกะ 5 ข้อ เกณฑ์ผ่าน 80%",
    estimatedMinutes: 15,
    questions: [
      {
        id: "q1",
        prompt: "เลขบัตรประจำตัวประชาชนของไทยมีทั้งหมดกี่หลัก และหลักใดเรียกว่า Check Digit?",
        options: [
          { id: "a", label: "ก", text: "10 หลัก และหลักแรกสุดคือ Check Digit" },
          { id: "b", label: "ข", text: "13 หลัก และหลักสุดท้าย (หลักขวาสุด) คือ Check Digit" },
          { id: "c", label: "ค", text: "12 หลัก และหลักที่ 7 คือ Check Digit" },
          { id: "d", label: "ง", text: "16 หลัก และไม่มี Check Digit" }
        ],
        correctOptionId: "b",
        explanation: "เลขบัตรประชาชนไทยมี 13 หลัก โดยหลักที่ 13 (ขวาสุด) คือ Check Digit ที่คำนวณจาก 12 หลักแรกเพื่อตรวจสอบความถูกต้องในการกรอกข้อมูล"
      },
      {
        id: "q2",
        prompt: "ในสูตรคำนวณ Check Digit ตัวคูณของเลขแต่ละหลักเรียงจากหลักซ้ายสุด (n0) ไปถึงหลักที่ 12 (n11) คือข้อใด?",
        options: [
          { id: "a", label: "ก", text: "คูณด้วย 1 ทุกหลัก" },
          { id: "b", label: "ข", text: "คูณด้วย 13, 12, 11, ..., 2 ตามลำดับถอยหลัง" },
          { id: "c", label: "ค", text: "คูณด้วย 2, 3, 4, ..., 13 ตามลำดับเดินหน้า" },
          { id: "d", label: "ง", text: "คูณด้วย 10 เสมอ" }
        ],
        correctOptionId: "b",
        explanation: "สูตรทางการกำหนดให้ถ่วงน้ำหนักด้วย 13 คูณหลักแรก ถอยลงไปเรื่อย ๆ จนถึง 2 คูณหลักที่ 12"
      },
      {
        id: "q3",
        prompt: "การนำผลลัพธ์มาคำนวณด้วย `mod 11` มีความหมายตรงกับข้อใดในภาษา Python?",
        options: [
          { id: "a", label: "ก", text: "การหารเอาผลลัพธ์แบบปัดเศษทิ้งด้วยคำสั่ง //" },
          { id: "b", label: "ข", text: "การหาเศษที่เหลือจากการหารด้วยเครื่องหมาย % 11" },
          { id: "c", label: "ค", text: "การคูณด้วย 11" },
          { id: "d", label: "ง", text: "การยกกำลังด้วย 11" }
        ],
        correctOptionId: "b",
        explanation: "ตัวดำเนินการ modulo ในคณิตศาสตร์ตรงกับตัวดำเนินการ % ในภาษา Python ซึ่งใช้สำหรับหาเศษเหลือจากการหาร"
      },
      {
        id: "q4",
        prompt: "ถ้าผู้ใช้งานกรอกเลขบัตรประชาชนมาเป็นสตริงยาว 12 หลักติดกัน เช่น '123456789012' วิธีใดเข้าถึงเลขแต่ละตัวเพื่อนำมาคูณได้ถูกต้อง?",
        options: [
          { id: "a", label: "ก", text: "int(s[i]) เพื่อแปลงอักขระตำแหน่งที่ i เป็นจำนวนเต็มก่อนคูณ" },
          { id: "b", label: "ข", text: "s[i] * weight โดยไม่ต้องแปลงเป็น int" },
          { id: "c", label: "ค", text: "s * 13" },
          { id: "d", label: "ง", text: "len(s[i])" }
        ],
        correctOptionId: "a",
        explanation: "ในสตริง ตัวอักษรคือ string type หากนำไปคูณโดยไม่แปลงเป็น int จะเป็นการทำ String Repetition (ทำซ้ำข้อความ) ไม่ใช่การคูณเชิงคณิตศาสตร์"
      },
      {
        id: "q5",
        prompt: "หากต้องการแสดงผลเลขบัตรประชาชนในรูปแบบมาตรฐาน '1 2345 67890 12 1' ควรใช้ฟังก์ชันใดใน Python เพื่อจัดรูปแบบให้สวยงาม?",
        options: [
          { id: "a", label: "ก", text: "f-string เช่น f'{s[0]} {s[1:5]} {s[5:10]} {s[10:12]} {check_digit}'" },
          { id: "b", label: "ข", text: "s.strip()" },
          { id: "c", label: "ค", text: "s.lower()" },
          { id: "d", label: "ง", text: "math.sqrt(s)" }
        ],
        correctOptionId: "a",
        explanation: "การใช้ String Slicing ร่วมกับ f-string ช่วยแบ่งกลุ่มตัวเลข 1, 4, 5, 2, 1 หลักได้อย่างถูกต้องและอ่านง่ายที่สุด"
      }
    ],
    rubric: {
      criteria: [
        {
          id: "c1",
          label: "ความเข้าใจเชิงตรรกะและการประมวลผลตัวเลข (Auto-graded)",
          maxPoints: 6,
          levels: {
            "0": "คะแนนต่ำกว่า 60%",
            "2": "คะแนน 60-79%",
            "4": "คะแนน 80-99% (ผ่านเกณฑ์)",
            "6": "คะแนนเต็ม 100% (ดีเยี่ยม)"
          }
        }
      ],
      passRawPoints: 5,
      requiredFullScoreCriterionIds: ["c1"]
    },
    recommendedPersona: "Fast Explorer",
    badgeLabel: "🎯 สาย Explorer แนะนำ"
  },

  // =========================================================================
  // 8. Coding Challenge: P-07 เป่ายิ้งฉุบ (Rock-Paper-Scissors Simulator)
  // =========================================================================
  {
    id: "chula-p-07",
    code: "P-07",
    chapter: "แบบฝึกปฏิบัติเพิ่มเติม (P-Series)",
    title: "P-07: แบบจำลองเกมเป่ายิ้งฉุบ (Rock-Paper-Scissors Simulator)",
    topic: "การจำลองสถานการณ์และการจัดการตรรกะเกม",
    type: "coding",
    description: "จำลองการแข่งขันเป่ายิ้งฉุบระหว่างผู้เล่น 2 คน หาผู้ชนะคนแรกที่ชนะครบ m ครั้ง หรือสรุปผลเสมอหากแข่งครบ 3m เกม",
    instructions: `เกมเป่ายิ้งฉุบ: R (ค้อน), S (กรรไกร), P (กระดาษ)
กฎ: ค้อนชนะกรรไกร, กรรไกรชนะกระดาษ, กระดาษชนะค้อน

เงื่อนไขการแข่งขัน:
- ผู้เล่นที่ชนะครบ m ครั้งก่อนเป็นผู้ชนะการแข่งขัน (Player 1 wins หรือ Player 2 wins)
- หากแข่งขันไปจนถึง 3*m เกมแล้วยังไม่มีใครชนะครบ m ครั้ง ให้ถือว่า เสมอ (Tie)

ข้อมูลนำเข้า:
- บรรทัดแรกคือ m (จำนวนครั้งที่ต้องชนะ)
- บรรทัดต่อๆ มาประกอบด้วยอักขระ 2 ตัวคั่นด้วยช่องว่าง แทนการออกของ Player 1 และ Player 2

ข้อมูลส่งออก:
- บรรทัดแรกแสดงจำนวนครั้งที่ Player 1 ชนะ ตามด้วย Player 2 ชนะ คั่นด้วยช่องว่าง
- บรรทัดที่สองแสดงข้อความสรุปผู้ชนะ (Player 1 wins / Player 2 wins / Tie)`,
    estimatedMinutes: 25,
    starterCode: `# P-07: เป่ายิ้งฉุบ
m = int(input())

p1_wins = 0
p2_wins = 0
games_played = 0
max_games = 3 * m

while p1_wins < m and p2_wins < m and games_played < max_games:
    line = input().strip().split()
    p1 = line[0]
    p2 = line[1]
    games_played += 1
    
    if p1 == p2:
        pass
    elif (p1 == 'R' and p2 == 'S') or (p1 == 'S' and p2 == 'P') or (p1 == 'P' and p2 == 'R'):
        p1_wins += 1
    else:
        p2_wins += 1

print(f"{p1_wins} {p2_wins}")
if p1_wins == m:
    print("Player 1 wins")
elif p2_wins == m:
    print("Player 2 wins")
else:
    print("Tie")
`,
    inputConstraints: "m เป็นจำนวนเต็มบวก 1 <= m <= 100",
    examples: [
      { input: "1\\nR P", output: "0 1\\nPlayer 2 wins", note: "กระดาษชนะค้อน Player 2 ชนะ" },
      { input: "1\\nR R\\nP P\\nS P", output: "1 0\\nPlayer 1 wins", note: "เสมอ 2 ตา ตาสาม Player 1 ชนะ" }
    ],
    rubric: {
      criteria: [
        {
          id: "c1",
          label: "A. ความถูกต้องของตรรกะการตัดสินแพ้ชนะค้อน-กรรไกร-กระดาษ",
          maxPoints: 2,
          levels: {
            "0": "ตัดสินผลผิดพลาดในบางกรณี",
            "1": "ตัดสินผลถูกแต่กรณีเสมอคำนวณผิด",
            "2": "ตัดสินผลแพ้-ชนะ-เสมอ ถูกต้องสมบูรณ์ทั้ง 9 กรณี"
          }
        },
        {
          id: "c2",
          label: "B. การควบคุมลูปและการหยุดตามเงื่อนไข (Termination Logic)",
          maxPoints: 2,
          levels: {
            "0": "ลูปไม่หยุดเมื่อมีคนชนะครบ m ครั้ง",
            "1": "ลูปหยุดแต่เงื่อนไข 3*m ไม่ทำงาน",
            "2": "หยุดเมื่อชนะครบ m ครั้ง หรือเมื่อครบ 3*m เกมอย่างถูกต้องสมบูรณ์"
          }
        },
        {
          id: "c3",
          label: "C. การแสดงผลลัพธ์คะแนนและข้อความสรุป",
          maxPoints: 2,
          levels: {
            "0": "รูปแบบข้อความผิดพลาด",
            "1": "จำนวนตัวเลขถูกต้องแต่ข้อความผิด",
            "2": "แสดงคะแนนทั้งสองฝั่งและข้อความสรุปถูกต้องตรงตามตัวอย่าง"
          }
        }
      ],
      passRawPoints: 5,
      requiredFullScoreCriterionIds: ["c1"]
    },
    recommendedPersona: "Hands-on Coder",
    badgeLabel: "💻 สาย Coder / 🎯 Explorer"
  }
];
