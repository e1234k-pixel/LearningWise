import type { AiTutorConfig, AiChatMessage, Mission, Rubric, LearnerPersona } from "../types";

export const DEFAULT_AI_TUTOR_CONFIG: AiTutorConfig = {
  enabled: true,
  provider: "gemini",
  apiKey: "",
  model: "gemini-2.5-flash",
  teachingStyle: "socratic",
  temperature: 0.7,
  maxTokens: 1000,
  systemPrompt: `คุณคือ 'AI Tutor' ครูผู้ช่วยและที่ปรึกษา AI ประจำวิชาวิทยาการคำนวณ 1 (ว 4.2 ม.4) บนแพลตฟอร์ม LearnWise Classroom
หน้าที่ของคุณ:
1. ชี้แนะแนวคิด กระตุ้นการคิดเชิงคำนวณ (Computational Thinking) และช่วยแกะรอยข้อผิดพลาด (Debugging)
2. ใช้หลัก Socratic Method: ให้คำใบ้ทีละระดับ (Scaffolding Hints) และตั้งคำถามนำทาง ห้ามเฉลยโค้ดคำตอบสมบูรณ์ 100% ที่เด็กสามารถคัดลอกส่งครูได้โดยตรง
3. ใช้ภาษาไทยที่สุภาพ อบอุ่น เป็นกันเอง ให้กำลังใจ และมี Emoji ประกอบให้น่าอ่าน
4. หากตรวจพบว่าโค้ดติด SyntaxError หรือ LogicError ให้ชี้แนะจุดสังเกต เช่น ลำดับเงื่อนไข if-elif, การแปลงชนิดข้อมูล int()/float(), หรือการเยื้องย่อหน้า (Indentation)
5. ปรับคำอธิบายให้เข้ากับสไตล์ของผู้เรียน (UDL Framework)`
};

export interface AiRequestContext {
  mission?: Mission;
  draftContent?: string;
  studentName?: string;
  persona?: LearnerPersona;
  rubric?: Rubric;
}

/**
 * ทดสอบการเชื่อมต่อ Google Gemini API
 */
export async function testGeminiApiConnection(
  config: AiTutorConfig
): Promise<{ success: boolean; latencyMs?: number; message: string; sampleResponse?: string }> {
  if (!config.apiKey || !config.apiKey.trim()) {
    return {
      success: false,
      message: "กรุณาระบุ Gemini API Key ก่อนทำการทดสอบ",
    };
  }

  const startTime = performance.now();
  const model = config.model || "gemini-2.5-flash";
  const baseUrl = config.baseUrl || "https://generativelanguage.googleapis.com/v1beta";
  const endpoint = `${baseUrl}/models/${model}:generateContent?key=${config.apiKey.trim()}`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: "สวัสดี! ตอบสั้นๆ ไม่เกิน 1 ประโยคเพื่อยืนยันว่าพร้อมทำงานเป็น AI Tutor" }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 100,
        }
      })
    });

    const latencyMs = Math.round(performance.now() - startTime);

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData.error?.message || `HTTP ${response.status} ${response.statusText}`;
      return {
        success: false,
        latencyMs,
        message: `เชื่อมต่อไม่สำเร็จ: ${errMsg}`,
      };
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text || "เชื่อมต่อสำเร็จ!";

    return {
      success: true,
      latencyMs,
      message: `เชื่อมต่อ Google Gemini (${model}) สำเร็จ! (ความเร็ว: ${latencyMs} ms)`,
      sampleResponse: candidateText.trim(),
    };
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - startTime);
    return {
      success: false,
      latencyMs,
      message: `เกิดข้อผิดพลาดในการส่งคำขอ: ${err.message || String(err)}`,
    };
  }
}

/**
 * ส่งคำถามไปยัง AI Tutor พร้อมบริบทของภารกิจและโค้ดปัจจุบัน
 */
export async function askGeminiAiTutor(
  messages: AiChatMessage[],
  context: AiRequestContext,
  config: AiTutorConfig
): Promise<{ text: string; modelUsed: string; isRealApi: boolean }> {
  // หากไม่ได้เปิดใช้งาน
  if (!config.enabled) {
    return {
      text: "ระบบ AI Tutor ถูกปิดการใช้งานชั่วคราวโดยผู้ดูแลระบบ กรุณาติดต่อครูผู้สอน",
      modelUsed: "offline",
      isRealApi: false,
    };
  }

  // สร้าง Enhanced Context สำหรับให้ AI ทราบสถานการณ์ของนักเรียน
  const contextParts: string[] = [];

  if (context.studentName) {
    contextParts.push(`ชื่อผู้เรียน: ${context.studentName}`);
  }
  if (context.persona) {
    contextParts.push(`สไตล์การเรียนรู้ (UDL Persona): ${context.persona}`);
  }
  if (context.mission) {
    contextParts.push(`โจทย์ภารกิจปัจจุบัน: ${context.mission.title} (${context.mission.type})`);
    contextParts.push(`คำอธิบายภารกิจ: ${context.mission.description}`);
    if (context.mission.instructions) {
      contextParts.push(`คำชี้แจง: ${context.mission.instructions}`);
    }
    if (context.mission.config?.prompt) {
      contextParts.push(`เงื่อนไขโจทย์: ${context.mission.config.prompt}`);
    }
  }
  if (context.rubric && context.rubric.criteria?.length > 0) {
    const criteriaSummary = context.rubric.criteria.map(c => `- ${c.label} (คะแนนเต็ม ${c.maxPoints} คะแนน)`).join("\n");
    contextParts.push(`เกณฑ์การประเมิน (Rubric):\n${criteriaSummary}`);
  }
  if (context.draftContent && context.draftContent.trim()) {
    contextParts.push(`โค้ดหรือคำตอบปัจจุบันที่นักเรียนพิมพ์อยู่ในขณะนี้:\n\`\`\`\n${context.draftContent}\n\`\`\``);
  }

  const fullSystemInstruction = `${config.systemPrompt}\n\n[บริบทแวดล้อมของผู้เรียนในขณะนี้]\n${contextParts.join("\n\n")}`;

  // หากไม่มี API Key ให้ใช้ Fallback Response ที่ฉลาดและเป็นมิตรกับผู้ใช้
  if (!config.apiKey || !config.apiKey.trim()) {
    const latestUserMsg = messages[messages.length - 1]?.text || "";
    return {
      text: generateSmartFallbackResponse(latestUserMsg, context),
      modelUsed: "simulated-socratic",
      isRealApi: false,
    };
  }

  // เรียก Google Gemini REST API จริง
  const model = config.model || "gemini-2.5-flash";
  const baseUrl = config.baseUrl || "https://generativelanguage.googleapis.com/v1beta";
  const endpoint = `${baseUrl}/models/${model}:generateContent?key=${config.apiKey.trim()}`;

  // แปลงประวัติการสนทนาเข้าสู่ฟอร์แมต Gemini contents
  const geminiContents = messages.map(m => ({
    role: m.sender === "user" ? "user" : "model",
    parts: [{ text: m.text }]
  }));

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: fullSystemInstruction }]
        },
        contents: geminiContents,
        generationConfig: {
          temperature: config.temperature ?? 0.7,
          maxOutputTokens: config.maxTokens ?? 1000,
        }
      })
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const errMsg = errJson.error?.message || `HTTP ${response.status}`;
      console.warn("Gemini API Error:", errMsg);
      return {
        text: `⚠️ **เกิดข้อผิดพลาดในการเชื่อมต่อ Gemini API:** ${errMsg}\n\n*คำแนะนำ: กรุณาตรวจสอบ Gemini API Key ในหน้า Admin Dashboard หรือใช้งานคำใบ้เบื้องต้นได้ตามปกติครับ*`,
        modelUsed: model,
        isRealApi: true,
      };
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "ขออภัยครับ ไม่สามารถสร้างคำตอบได้ในขณะนี้";

    return {
      text: replyText,
      modelUsed: model,
      isRealApi: true,
    };
  } catch (err: any) {
    console.error("Gemini fetch error:", err);
    return {
      text: `⚠️ **การเชื่อมต่ออินเทอร์เน็ตขัดข้อง:** ${err.message || String(err)}\n\n(AI Tutor กำลังสลับไปใช้โหมดให้คำใบ้ในเครื่องชั่วคราว)\n\n${generateSmartFallbackResponse(messages[messages.length - 1]?.text || "", context)}`,
      modelUsed: "offline-fallback",
      isRealApi: false,
    };
  }
}

/**
 * ฟังก์ชันสร้างคำใบ้เชิงโสเครติสในเครื่อง กรณีที่ยังไม่ได้ตั้งค่า API Key เพื่อไม่ให้นักเรียนสะดุด
 */
function generateSmartFallbackResponse(userPrompt: string, context: AiRequestContext): string {
  const promptLower = userPrompt.toLowerCase();
  const missionTitle = context.mission?.title || "ภารกิจการเรียนรู้";

  if (promptLower.includes("อธิบาย") || promptLower.includes("โจทย์") || promptLower.includes("แนวคิด")) {
    return `สวัสดีครับ! ครู AI ยินดีช่วยอธิบายแนวคิดของ **"${missionTitle}"** ให้ครับ 💡\n\n- **เป้าหมายหลัก:** โจทย์นี้ต้องการฝึกทักษะการออกแบบขั้นตอนวิธี (Algorithm) และการใช้โครงสร้างแบบมีเงื่อนไขในภาษา Python\n- **จุดเริ่มต้นที่แนะนำ:**\n  1. สังเกตข้อมูลนำเข้า (Input) ว่ามีชนิดข้อมูลเป็นอะไร เช่น ข้อความ (str) หรือ ตัวเลข (int/float)\n  2. ออกแบบขั้นตอนการเปรียบเทียบทีละขั้น เช่น ใช้ \`if\`, \`elif\`, และ \`else\`\n  3. ผลลัพธ์สุดท้ายควรแสดงผลให้ตรงกับรูปแบบที่โจทย์กำหนดเป๊ะๆ\n\nลองเริ่มลงมือเขียนโครงสร้างเริ่มต้นดู แล้วถ้าติดขัดตรงไหน ส่งโค้ดมาให้ครูช่วยดูคำใบ้ต่อได้เลยนะครับ! 🚀`;
  }

  if (promptLower.includes("โค้ด") || promptLower.includes("บั๊ก") || promptLower.includes("ผิด") || promptLower.includes("ช่วยดู")) {
    if (context.draftContent) {
      return `ครูได้ดูโค้ดที่เธอกำลังเขียนแล้วครับ! 👍\n\nลองตรวจสอบ 3 จุดสังเกตนี้ดูนะ:\n1. **การรับค่า Input:** ฟังก์ชัน \`input()\` จะคืนค่าเป็นข้อความเสมอ อย่าลืมแปลงเป็น \`float()\` หรือ \`int()\` ก่อนนำไปคำนวณนะ\n2. **การเยื้องย่อหน้า (Indentation):** บรรทัดหลังเครื่องหมาย \`:\` ของคำสั่ง \`if\` ต้องเคาะเว้นวรรค 4 เคาะให้เท่ากันเสมอ\n3. **ลำดับการเปรียบเทียบ:** หากเรียงช่วงคะแนนจากมากไปน้อย เช่น \`>= 80\` ก่อน \`>= 70\` เงื่อนไขจะไม่ข้ามการทำงาน\n\nลองปรับแก้จุดนี้ดู แล้วกดบันทึกหรือรันผลลัพธ์ดูอีกครั้งนะครับ! ✨`;
    }
    return `ส่งโค้ดที่เธอเขียนอยู่ในกล่องข้อความมาได้เลยครับ ครูจะช่วยวิเคราะห์จุดที่ติดขัดและให้คำใบ้โดยไม่สปอยคำตอบแน่นอน! 😊`;
  }

  if (promptLower.includes("รูบริก") || promptLower.includes("เกณฑ์") || promptLower.includes("คะแนน")) {
    return `สำหรับการประเมินของ **"${missionTitle}"** มีเกณฑ์หลักดังนี้ครับ 📋\n\n- **ความถูกต้องตามข้อกำหนด (Correctness):** โค้ดสามารถรับค่าและคำนวณได้ถูกต้องตามกรณีทดสอบทุกเงื่อนไข\n- **คุณภาพของโค้ด (Code Quality):** การตั้งชื่อตัวแปรที่สื่อความหมายและการจัดระเบียบย่อหน้าสะอาดตา\n- **การรับมือข้อผิดพลาด (Edge Cases):** หากใส่ค่าที่อยู่นอกช่วงหรือใส่ค่าผิดชนิด ระบบควรจัดการได้อย่างไร\n\nลองตรวจสอบผลงานของตนเองเทียบกับเกณฑ์เหล่านี้ก่อนกดส่งงานรอบสุดท้ายนะ! 🌟`;
  }

  return `ยินดีด้วยที่มุ่งมั่นเรียนรู้นะครับ! 🌟 สำหรับคำถามของเธอ ครูแนะนำให้ลองสังเกตโจทย์และแบ่งปัญหาออกเป็นข้อย่อยๆ (Decomposition)\n\nหากต้องการคำใบ้เกี่ยวกับโค้ด หรืออยากให้อธิบายส่วนใดเพิ่มเติม พิมพ์บอกครูได้เลยนะ หรือจะกดปุ่มลัดด้านล่างเพื่อเริ่มถามก็ได้ครับ! 💡`;
}
