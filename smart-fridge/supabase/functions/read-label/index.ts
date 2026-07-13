// Supabase Edge Function: read-label
// รับรูปฉลากสินค้า → เรียก Claude API (vision) อ่านชื่อ/วันหมดอายุ/โซเดียม/น้ำตาล
// → ตอบกลับเป็น JSON โครงสร้างคงที่ (structured outputs)
//
// Secrets ที่ต้องตั้ง (ฝั่งเซิร์ฟเวอร์ ไม่อยู่ในแอป):
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
// SUPABASE_URL / SUPABASE_ANON_KEY ถูก inject ให้อัตโนมัติ

import Anthropic from "npm:@anthropic-ai/sdk";
import { createClient } from "npm:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LABEL_SCHEMA = {
  type: "object",
  properties: {
    readable: {
      type: "boolean",
      description: "true ถ้าอ่านฉลากได้อย่างน้อยชื่อสินค้า",
    },
    name_th: {
      type: ["string", "null"],
      description: "ชื่อสินค้าสั้นๆ ภาษาไทย (ถ้าฉลากเป็นอังกฤษให้ทับศัพท์)",
    },
    expiry_date: {
      type: ["string", "null"],
      description: "วันหมดอายุรูปแบบ YYYY-MM-DD (ค.ศ.) หรือ null ถ้าไม่พบ",
    },
    category: {
      type: ["string", "null"],
      enum: ["cooked", "veg", "fruit", "meat", "seafood", "dairy", "bakery", null],
      description: "หมวดอาหารที่ใกล้เคียงที่สุด",
    },
    sodium_mg: {
      type: ["number", "null"],
      description: "โซเดียมต่อหนึ่งหน่วยบริโภค (มิลลิกรัม)",
    },
    sugar_g: {
      type: ["number", "null"],
      description: "น้ำตาลต่อหนึ่งหน่วยบริโภค (กรัม)",
    },
  },
  required: ["readable", "name_th", "expiry_date", "category", "sodium_mg", "sugar_g"],
  additionalProperties: false,
} as const;

const PROMPT = `อ่านฉลากสินค้าอาหารในรูปนี้ แล้วดึงข้อมูลต่อไปนี้:
1. ชื่อสินค้า (ภาษาไทยสั้นๆ)
2. วันหมดอายุ — มองหา EXP, EXD, BBF, Best Before, ควรบริโภคก่อน ฯลฯ
   ระวังปีพุทธศักราช: ถ้าปีมากกว่า 2400 ให้ลบ 543 เป็นคริสต์ศักราช
   (เช่น 15/08/2569 → 2026-08-15) รูปแบบวันที่ไทยมักเป็น วัน/เดือน/ปี
   ถ้ามีทั้ง MFG (วันผลิต) และ EXP ให้ใช้ EXP เท่านั้น
3. หมวดอาหารที่ใกล้เคียงที่สุด
4. โซเดียม (mg) และน้ำตาล (g) ต่อหนึ่งหน่วยบริโภค จากตารางโภชนาการถ้ามี
ข้อมูลใดอ่านไม่ได้หรือไม่มีบนฉลาก ให้ใส่ null อย่าเดา
ถ้ารูปไม่ใช่ฉลากสินค้าหรืออ่านไม่ออกเลย ให้ readable = false`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });

  try {
    // ให้เฉพาะผู้ใช้ที่ล็อกอินแล้วเรียกได้ (กันคนอื่นเผาโควตา API key เรา)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return json({ error: "ต้องเข้าสู่ระบบก่อน" }, 401);
    }

    const { image_base64, media_type } = await req.json();
    if (typeof image_base64 !== "string" || image_base64.length === 0) {
      return json({ error: "ไม่พบรูปภาพ" }, 400);
    }

    const anthropic = new Anthropic({
      apiKey: Deno.env.get("ANTHROPIC_API_KEY")!,
    });

    const response = await anthropic.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 2048,
      thinking: { type: "adaptive" },
      output_config: { format: { type: "json_schema", schema: LABEL_SCHEMA } },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: media_type ?? "image/jpeg",
                data: image_base64,
              },
            },
            { type: "text", text: PROMPT },
          ],
        },
      ],
    });

    if (response.stop_reason === "refusal" || response.stop_reason === "max_tokens") {
      return json({ readable: false });
    }

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return json({ readable: false });
    }

    return json(JSON.parse(textBlock.text));
  } catch (e) {
    console.error("read-label error:", e);
    // แอปฝั่ง client จะ fallback เป็นกรอกเองเมื่อได้ error
    return json({ error: "อ่านฉลากไม่สำเร็จ" }, 500);
  }
});
