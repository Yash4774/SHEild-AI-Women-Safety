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
    const session = await auth();
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

    const baseUrl = process.env.NEXT_PUBLIC_CREATE_APP_URL;
    if (!baseUrl) {
      return Response.json(
        { error: "AI service not configured" },
        { status: 503 },
      );
    }

    // Build payload with system prompt prepended
    const payload = {
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

    // Try Gemini 2.5 Flash first (faster), fallback to Pro
    let aiResponse = null;
    const endpoints = [
      "/integrations/google-gemini-2-5-flash/",
      "/integrations/google-gemini-2-5-pro/",
    ];

    for (const endpoint of endpoints) {
      try {
        const res = await fetch(baseUrl + endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          const content = data?.choices?.[0]?.message?.content;
          if (content) {
            aiResponse = content;
            break;
          }
        }
      } catch (e) {
        console.warn(`Endpoint ${endpoint} failed:`, e.message);
      }
    }

    if (!aiResponse) {
      return Response.json(
        { error: "AI service temporarily unavailable" },
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
