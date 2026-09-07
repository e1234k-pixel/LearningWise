# 🎓 LearnWise Classroom — Platform & Supercar Telemetry

> **แพลตฟอร์มการจัดการเรียนรู้ วิเคราะห์ความถนัดรายบุคคล (Learner Affinity Profiling) และประเมินผลตามมาตรฐานตัวชี้วัด ว 4.2 ม.4/1 พร้อมแผงหน้าปัดดิจิทัลสไตล์ซูเปอร์คาร์ Lamborghini Cockpit และระบบยืนยันตัวตน Google Workspace for Education**

[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-blue?logo=github)](https://pages.github.com/)

---

## 🌟 จุดเด่นและฟังก์ชันสำคัญของระบบ (Key Features)

### 🏎️ 1. Lamborghini Supercar Digital Cockpit & Telemetry
- **Central Velocity Tachometer (0–100 km/h):** มาตรวัดความเร็วในการบรรลุตัวชี้วัดของห้องเรียน พร้อมเกียร์ดิจิทัล `[S] (SPORT)`, `[D] (DRIVE)`, `[P] (PARK)`, `[R] (REVERSE)`
- **สวิตช์โหมดการขับขี่ ANIMA Driving Modes:** ปรับสลับระหว่าง `STRADA` (Street Mode สำหรับการเรียนการสอนปกติ) ⇄ `CORSA` (Track Mode สีแดงเรซซิ่งสำหรับช่วงเร่งสปีดตัดเกรด)
- **มาตรวัดทรงโค้ง 240 องศา (240° Arc Gauges):** ส่องสว่างด้วยเส้นนีออนสะท้อนสถิติตัวชี้วัด (Mastery Rate, Class Average, Grade 4.0, UDL Diversity)
- **แถบไฟ LED ทรงเชฟรอนเฉียง 12 เม็ด (Slanted Chevron LED Bars):** ถอดแบบจากเอกลักษณ์ไฟเดย์ไลท์รูปตัว Y ของ Lamborghini Revuelto ในการ์ด Superpower ฝั่งนักเรียน

### 🛡️ 2. ระบบยืนยันตัวตนและผู้ดูแลระบบ (Google Workspace SSO & Admin Console)
- **Google Account Authentication:** เข้าสู่ระบบด้วย Google Identity Services พร้อม 1-Click Account Chooser
- **Domain Whitelist Validator:** ตรวจสอบความปลอดภัยจำกัดเฉพาะอีเมลโดเมนโรงเรียน เช่น `@school.ac.th`
- **Admin Master Console:**
  - 👥 **จัดการผู้ใช้และสิทธิ์:** ค้นหา กรองบทบาท ปรับสิทธิ์ (Admin / ครู / นักเรียน) ระงับ/เปิดใช้งานบัญชี
  - 🌐 **ตั้งค่า Google Workspace:** รายการโดเมนที่อนุญาต, Auto-Provisioning สำหรับนักเรียนใหม่
  - 📜 **Security & Audit Logs:** ประวัติการเข้าใช้งาน การส่งออกเกรด ปพ.5 และ SGS พร้อม IP Address และปุ่มดาวน์โหลด JSON
  - 🏫 **โครงสร้างหลักสูตร:** เชื่อมโยงรายวิชา ว31101 วิทยาการคำนวณ 1 (ม.4/1)

### 📚 3. คลังโจทย์แบบฝึกปฏิบัติจุฬาฯ (Chula Exercise Preset Library)
- บรรจุโจทย์มาตรฐาน 8 ข้อจากตำรา **"เริ่มเรียนเขียนโปรแกรม จุฬาลงกรณ์มหาวิทยาลัย" (รศ. ดร. สมชาย ประสิทธิ์จูตระกูล)**
- รองรับ 3 เส้นทางการส่งงานตามกรอบ UDL:
  - 💻 **โจทย์เขียนโปรแกรม (Coding Challenge):** เช่น ข้อ 04-03 While Loop หาค่าเฉลี่ย, 04-10 RLE บีบอัดข้อความ, 07-07 ตรวจรหัสผ่าน
  - ✍️ **โจทย์มโนทัศน์ (Conceptual Short-Answer):** เช่น ข้อ 03-01 วิเคราะห์ผังงาน Flowchart, 05-06 Collatz Loop Tracing
  - 🎯 **แบบทดสอบตรรกะไว (Logic Quiz 5 ข้อ):** เช่น ข้อ 04-05 ตรวจข้อสอบปรนัย, 02-01 Check Digit บัตรประชาชน

### 🎯 4. ระบบการประเมินและการตัดเกรดมาตรฐาน (Unified Standards Gradebook)
- **Triangulation Calibration (0/3 ➔ 3/3 Baseline Tasks):** กลไกคัดกรองความถนัดอย่างแม่นยำก่อนปลดล็อค Smart Auto-Assign
- **ตัวชี้วัดกระทรวงศึกษาธิการ ว 4.2 ม.4/1:** ประเมินด้วยรูบริกกลาง 6 มิติ (Unified 6-Point Rubric) อย่างโปร่งใสและยุติธรรม
- **แบบบันทึกผลการพัฒนาคุณภาพผู้เรียน (ปพ. 5):** พรีวิวและสั่งพิมพ์เอกสาร A4 ฉบับทางการ พร้อมช่องลงนาม 3 ฝ่าย
- **ส่งออกไฟล์ Excel/CSV (SGS):** บันทึกด้วยฟอร์แมต UTF-8 with BOM รองรับการเปิดใน Microsoft Excel ภาษาไทย 100%
- **ใบรายงานผู้ปกครอง (Parent Growth Report):** เอกสารรายงานพัฒนาการและศักยภาพผู้เรียน 1 หน้า A4

---

## 🚀 วิธีการติดตั้งและรันในเครื่อง (Local Development)

```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. เริ่มต้นรัน Dev Server
npm run dev
```

เปิดเว็บเบราว์เซอร์ไปที่ `http://localhost:5173/`

---

## 🌐 วิธีการ Deploy ขึ้น GitHub Pages (Deployment Guide)

### วิธีที่ 1: Deploy ผ่าน GitHub Actions อัตโนมัติ (แนะนำ)
1. Push โค้ดทั้งหมดขึ้น GitHub Repository:
   ```bash
   git add .
   git commit -m "feat: complete LearnWise Classroom prototype with Google Auth and Lamborghini Cockpit"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
   git push -u origin main
   ```
2. บนหน้าเว็บ GitHub ไปที่ **Settings** ➔ **Pages**
3. ในส่วน **Build and deployment** ➔ **Source**:
   - เลือกเป็น **GitHub Actions**
4. ระบบจะทำการ Build และ Publish ขึ้น GitHub Pages อัตโนมัติทันที!

### วิธีที่ 2: Deploy ด้วยคำสั่ง gh-pages 1 คลิก
```bash
npm run deploy
```
คำสั่งนี้จะ Build โปรเจกต์ลงโฟลเดอร์ `dist/` และพุชขึ้น branch `gh-pages` โดยอัตโนมัติ

---

## 👥 บัญชีทดสอบในระบบ (Demo Accounts)

| บทบาท (Role) | ชื่อ-สกุล | อีเมล Google Workspace | สไตล์การเรียนรู้ (Persona) |
| :--- | :--- | :--- | :--- |
| 🛡️ **Admin** | อ.ดร.สมศักดิ์ นวัตกรรม | `admin@school.ac.th` | ผู้ดูแลระบบโรงเรียน / สารสนเทศ |
| 👩‍🏫 **Teacher** | ครูเมย์ ชลธิชา | `may.ch@school.ac.th` | ครูผู้สอนประจำวิชา ว31101 |
| 🎓 **Student** | นายเอกภพ ศิลปะ (น้องเอก) | `ek.s@school.ac.th` | 💻 Hands-on Coder |
| 🎓 **Student** | น.ส.นภัส พรหมทัศน์ (น้องฟ้า) | `fah.p@school.ac.th` | ✍️ Conceptual Explainer |
| 🎓 **Student** | นายต้นกล้า การดี (น้องต้น) | `ton.k@school.ac.th` | 🎯 Fast Explorer |
