import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";

const SYSTEM_PROMPT = `You are SHEild AI — an advanced women's safety assistant powered by Google Gemini AI.

You provide expert guidance on:
- Real-time safety advice and emergency guidance
- Step-by-step help for dangerous situations (stalking, harassment, medical, lost)
- Safe route recommendations and travel safety tips
- Self-defense awareness and protective measures
- First aid and emergency response guidance
- Guardian network setup and management
- Evidence collection procedures
- Nearby emergency services information
- Community safety intelligence

Language: Respond in the same language the user writes in. Support both English and Hindi fluently.

Guidelines:
- Be direct, calm, clear, and actionable — never preachy
- Always prioritize user safety above all else
- For immediate danger: always instruct to call emergency services first (112 in India)
- Be empowering and encouraging
- Provide specific, actionable steps — not generic advice
- When in Hindi, use clear modern Hindi (not overly formal)`;

export async function POST(request) {
  try {
    let session = null;
    try {
      session = await auth();
    } catch (authError) {
      console.warn("Auth unavailable for AI chat:", authError.message);
    }
    const body = await request.json();
    const { messages, saveOnly } = body;

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: "Invalid messages" }, { status: 400 });
    }

    // saveOnly: frontend handles AI directly; backend just logs the session
    if (saveOnly) {
      if (session?.user?.id) {
        try {
          const lastUserMsg = messages.filter((m) => m.role === "user").pop();
          if (lastUserMsg) {
            await sql`
              INSERT INTO notifications (user_id, type, title, body, href)
              VALUES (${session.user.id}, 'info', 'AI Safety Chat',
                ${lastUserMsg.content.substring(0, 120)}, '/ai-assistant')
              ON CONFLICT DO NOTHING
            `;
          }
        } catch (dbErr) {
          console.warn("DB insert failed (non-critical):", dbErr.message);
        }
      }
      return Response.json({ success: true });
    }

    const createPayload = {
      messages: [
        { role: "user", content: SYSTEM_PROMPT },
        {
          role: "assistant",
          content:
            "Understood. I am SHEild AI, your personal safety copilot. I'm ready to provide expert safety guidance in English and Hindi. How can I help you today?",
        },
        ...messages.slice(-14), // keep last 14 messages for context
      ],
      stream: false,
    };

    let aiResponse = null;
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const res = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
          {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": geminiKey,
          },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: messages.slice(-14).map((message) => ({
              role: message.role === "assistant" ? "model" : "user",
              parts: [{ text: String(message.content || "") }],
            })),
            generationConfig: { temperature: 0.35, maxOutputTokens: 1000 },
          }),
        },
        );
        if (res.ok) {
          const data = await res.json();
          aiResponse = data?.candidates?.[0]?.content?.parts
            ?.map((part) => part.text || "")
            .join("")
            .trim();
        } else {
          console.warn("Gemini API returned", res.status);
        }
      } catch (e) {
        console.warn("Gemini API failed:", e.message);
      }
    }

    // Backwards-compatible support for projects still hosted on Create.
    const baseUrl = process.env.CREATE_APP_URL || process.env.NEXT_PUBLIC_CREATE_APP_URL;
    if (!aiResponse && baseUrl) {
      for (const endpoint of [
        "/integrations/google-gemini-2-5-flash/",
        "/integrations/google-gemini-2-5-pro/",
      ]) {
        try {
          const res = await fetch(baseUrl + endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(createPayload),
          });
          if (res.ok) {
            const data = await res.json();
            aiResponse = data?.choices?.[0]?.message?.content;
            if (aiResponse) break;
          }
        } catch (e) {
          console.warn(`Endpoint ${endpoint} failed:`, e.message);
        }
      }
    }

    if (!aiResponse) {
      return Response.json(
        { error: "AI assistant is not configured. Add GEMINI_API_KEY in Vercel." },
        { status: 503 },
      );
    }

    // Save chat message to DB if user is logged in
    if (session?.user?.id) {
      try {
        const lastUserMsg = messages.filter((m) => m.role === "user").pop();
        if (lastUserMsg) {
          await sql`
            INSERT INTO notifications (user_id, type, title, body, href)
            VALUES (${session.user.id}, 'info', 'AI Copilot Session', 
              ${lastUserMsg.content.substring(0, 120)}, '/ai-assistant')
            ON CONFLICT DO NOTHING
          `;
        }
      } catch (dbErr) {
        // Non-critical — don't fail the response
        console.warn("DB notification insert failed:", dbErr.message);
      }
    }

    return Response.json({ reply: aiResponse });
  } catch (error) {
    console.error("POST /api/ai-chat error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
