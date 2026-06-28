import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    // Try loading the latest saved DNA
    const rows = await sql`
      SELECT * FROM safety_dna WHERE user_id = ${session.user.id}
      ORDER BY created_at DESC LIMIT 1
    `;
    if (rows.length > 0) return Response.json(rows[0]);
    return Response.json(null);
  } catch (err) {
    // Table may not exist yet
    console.error("GET /api/safety-dna error:", err);
    return Response.json(null);
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const uid = session.user.id;

    // Ensure table exists
    await sql`
      CREATE TABLE IF NOT EXISTS safety_dna (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        score INTEGER NOT NULL,
        risk_level TEXT NOT NULL,
        strengths TEXT[] DEFAULT '{}',
        weaknesses TEXT[] DEFAULT '{}',
        recommendations TEXT[] DEFAULT '{}',
        traits JSONB DEFAULT '{}',
        ai_analysis TEXT,
        report_count INTEGER DEFAULT 0,
        walk_count INTEGER DEFAULT 0,
        checkin_count INTEGER DEFAULT 0,
        evidence_count INTEGER DEFAULT 0,
        guardian_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Fetch all user data
    const [reports, walks, checkIns, evidence, guardians, sos] =
      await Promise.all([
        sql`SELECT * FROM safety_reports WHERE user_id = ${uid} ORDER BY created_at DESC`,
        sql`SELECT * FROM walks WHERE user_id = ${uid} ORDER BY created_at DESC`,
        sql`SELECT * FROM check_ins WHERE user_id = ${uid} ORDER BY created_at DESC`,
        sql`SELECT * FROM evidence_vault WHERE user_id = ${uid} ORDER BY created_at DESC`,
        sql`SELECT * FROM user_guardians WHERE user_id = ${uid}`,
        sql`SELECT * FROM sos_history WHERE user_id = ${uid} ORDER BY created_at DESC`,
      ]);

    if (
      reports.length === 0 &&
      walks.length === 0 &&
      checkIns.length === 0 &&
      evidence.length === 0 &&
      guardians.length === 0
    ) {
      return Response.json(
        {
          error: "insufficient_data",
          message:
            "Not enough activity data yet. Use the app more to generate your Safety DNA.",
        },
        { status: 422 },
      );
    }

    // Compute stats
    const safeWalks = walks.filter((w) => w.status === "completed").length;
    const arrivedCheckIns = checkIns.filter(
      (c) => c.status === "arrived",
    ).length;
    const checkInRate =
      checkIns.length > 0
        ? Math.round((arrivedCheckIns / checkIns.length) * 100)
        : 0;
    const highRiskReports = reports.filter(
      (r) => r.danger_level === "high",
    ).length;

    const baseUrl = process.env.NEXT_PUBLIC_CREATE_APP_URL;
    if (!baseUrl) {
      return Response.json(
        { error: "AI service not configured" },
        { status: 503 },
      );
    }

    const prompt = `You are SHEild AI — an advanced women's safety intelligence engine. 
Generate a comprehensive Safety DNA report for this user based on their REAL activity data:

USER ACTIVITY STATS:
- Safety reports filed: ${reports.length} (${highRiskReports} high-risk incidents)
- Walk With Me sessions: ${walks.length} (${safeWalks} completed safely)
- Smart Check-ins: ${checkIns.length} (${arrivedCheckIns} confirmed, ${checkInRate}% success rate)
- Evidence items in vault: ${evidence.length}
- Guardians in network: ${guardians.length}
- SOS activations: ${sos.length}

SCORING RULES:
- Base score: 40
- Each safe walk: +4 (max +24)
- Each check-in completed: +3 (max +18)  
- Each evidence item: +3 (max +15)
- Each guardian added: +5 (max +20)
- Each report filed: +2 (max +10)
- Check-in success rate bonus: up to +10
- SOS activations: -3 each (shows real emergencies)

Generate a JSON response with EXACTLY this structure (no markdown):
{
  "score": <integer 0-100 based on the rules above, NEVER round to 50 or 70 exactly>,
  "risk_level": "<Low|Moderate|High based on score: >=70=Low, 40-69=Moderate, <40=High>",
  "strengths": ["<3-4 specific strengths based on actual data>"],
  "weaknesses": ["<2-3 specific improvement areas based on gaps in actual data>"],
  "recommendations": ["<4-5 highly personalized actionable recommendations>"],
  "ai_analysis": "<3-4 sentences of personalized analysis based on actual numbers, empowering tone, specific to this user's data>",
  "traits": {
    "Proactive Safety": <0-100 based on walks+checkins>,
    "Community Engagement": <0-100 based on reports+evidence>,
    "Emergency Preparedness": <0-100 based on guardians+sos+evidence>,
    "Check-In Consistency": <0-100 based on check-in success rate>,
    "Evidence Collection": <0-100 based on vault items>,
    "Guardian Network": <0-100 based on guardian count>
  }
}`;

    const aiRes = await fetch(
      baseUrl + "/integrations/google-gemini-2-5-flash/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          stream: false,
        }),
      },
    );

    if (!aiRes.ok) {
      console.error("Gemini API returned", aiRes.status);
      return Response.json(
        { error: "AI service error: " + aiRes.status },
        { status: 502 },
      );
    }

    const aiData = await aiRes.json();
    const rawContent = aiData?.choices?.[0]?.message?.content || "";

    // Parse JSON from AI response
    let dnaResult = null;
    try {
      const jsonStart = rawContent.indexOf("{");
      const jsonEnd = rawContent.lastIndexOf("}");
      if (jsonStart !== -1 && jsonEnd !== -1) {
        dnaResult = JSON.parse(rawContent.slice(jsonStart, jsonEnd + 1));
      }
    } catch (parseErr) {
      console.error(
        "Failed to parse AI JSON:",
        parseErr,
        "\nRaw:",
        rawContent.substring(0, 300),
      );
    }

    if (!dnaResult || typeof dnaResult.score !== "number") {
      return Response.json(
        { error: "AI returned invalid response. Please retry." },
        { status: 502 },
      );
    }

    // Clamp score
    dnaResult.score = Math.min(100, Math.max(0, Math.round(dnaResult.score)));

    // Save to DB
    const [saved] = await sql`
      INSERT INTO safety_dna (user_id, score, risk_level, strengths, weaknesses, recommendations, traits, ai_analysis, report_count, walk_count, checkin_count, evidence_count, guardian_count)
      VALUES (
        ${uid},
        ${dnaResult.score},
        ${dnaResult.risk_level || "Moderate"},
        ${dnaResult.strengths || []},
        ${dnaResult.weaknesses || []},
        ${dnaResult.recommendations || []},
        ${JSON.stringify(dnaResult.traits || {})},
        ${dnaResult.ai_analysis || ""},
        ${reports.length},
        ${walks.length},
        ${checkIns.length},
        ${evidence.length},
        ${guardians.length}
      )
      RETURNING *
    `;

    return Response.json(saved);
  } catch (err) {
    console.error("POST /api/safety-dna error:", err);
    return Response.json(
      { error: "Server error: " + err.message },
      { status: 500 },
    );
  }
}
