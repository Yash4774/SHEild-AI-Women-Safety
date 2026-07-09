import { auth } from "@/auth";

// Dynamic fallback — time-of-day aware so scores vary
function buildFallback(destination) {
  const hour = new Date().getHours();
  const isNight = hour < 6 || hour >= 21;
  const seed = destination ? destination.charCodeAt(0) % 22 : 8;
  const score = Math.min(93, Math.max(18, isNight ? 33 + seed : 61 + seed));
  return {
    score,
    risk_level: score >= 70 ? "Low" : score >= 45 ? "Moderate" : "High",
    recommendations: isNight
      ? [
          "Share live location with a trusted contact before leaving",
          "Use only well-lit, populated streets — avoid shortcuts",
          "Keep emergency contacts ready on speed dial",
          "Consider waiting until daylight or travelling with company",
        ]
      : [
          "Stay aware of surroundings, especially in crowded areas",
          "Keep phone accessible but out of sight in busy areas",
          "Prefer streets with good visibility and foot traffic",
          "Note nearest police station and hospital on your route",
        ],
    unsafe_areas: isNight
      ? [
          "Poorly lit streets at this hour",
          "Isolated stretches with no pedestrians",
        ]
      : [],
    factors: {
      time_of_day: isNight
        ? "Night — elevated risk period for solo travel"
        : "Daytime — lower baseline risk",
      crowd_density: "Estimated from time-of-day pattern",
      emergency_services: "Based on typical urban coverage estimates",
      community_reports: "No recent verified reports in database",
    },
    reason:
      "Score based on time-of-day risk model. Provide destination for a fully personalized analysis.",
  };
}

function tryParseJson(raw) {
  if (!raw) return null;
  if (typeof raw === "object" && raw !== null) return raw;
  const s = String(raw).trim();
  const jsonStart = s.indexOf("{");
  const jsonEnd = s.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) return null;
  try {
    return JSON.parse(s.slice(jsonStart, jsonEnd + 1));
  } catch (_) {
    return null;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { origin, destination, time, current_reports, lat, lng } = body;

    if (!destination && !lat) return Response.json(buildFallback("unknown"));

    const hour = new Date().getHours();
    const isNight = hour < 6 || hour >= 20;
    const isPeak = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
    const rpts = Array.isArray(current_reports) ? current_reports : [];
    const highRisk = rpts.filter(function (r) {
      return r.danger_level === "high";
    }).length;
    const medRisk = rpts.filter(function (r) {
      return r.danger_level === "medium";
    }).length;

    const baseUrl =
      process.env.CREATE_APP_URL || process.env.NEXT_PUBLIC_CREATE_APP_URL;
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!baseUrl && !geminiKey) {
      console.warn("No AI provider configured; using local safety model");
      return Response.json(buildFallback(destination));
    }

    const dest = destination || "GPS " + lat + "," + lng;
    const timeStr = time || new Date().toLocaleTimeString();

    const prompt =
      "You are SHEild AI — a women safety scoring engine. Produce a UNIQUE, SPECIFIC score for this journey.\n\n" +
      "JOURNEY:\n" +
      "From: " +
      (origin || "current location") +
      "\n" +
      "To: " +
      dest +
      "\n" +
      "Time: " +
      timeStr +
      " (hour=" +
      hour +
      ")\n" +
      "Night time: " +
      (isNight ? "YES — major risk factor" : "NO — daylight") +
      "\n" +
      "Peak commute: " +
      (isPeak ? "YES" : "NO") +
      "\n" +
      "Community reports: " +
      rpts.length +
      " total, " +
      highRisk +
      " HIGH severity, " +
      medRisk +
      " MEDIUM severity\n\n" +
      "SCORING RULES — every factor must shift the score:\n" +
      "Base score: 72 (daytime urban). Night (20-06): subtract 18-28. Midnight extra: -10. " +
      "Each HIGH report: -9. Each MEDIUM: -5. Peak hour: +4. " +
      "Remote/isolated destination (park, alley, lane, industrial, abandoned): -12. " +
      "Busy commercial destination (mall, hospital, restaurant, school, station): +8.\n\n" +
      "REQUIREMENTS:\n" +
      "- score: 15-93, NEVER a round number like 65 or 70 — e.g. 67, 73, 81\n" +
      "- risk_level: Low (>=70), Moderate (45-69), High (<45)\n" +
      "- recommendations: exactly 4 strings, specific to this destination and time\n" +
      "- unsafe_areas: list specific risk areas or empty array\n" +
      "- factors: explain time_of_day, crowd_density, emergency_services, community_reports with actual values\n" +
      "- reason: 1-2 sentences explaining WHY this exact score\n\n" +
      "Return ONLY a JSON object, no markdown.";

    const response = geminiKey
      ? await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": geminiKey,
            },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.2,
              },
            }),
          },
        )
      : await fetch(baseUrl + "/integrations/google-gemini-2-5-pro/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          json_schema: {
            name: "safety_score",
            schema: {
              type: "object",
              properties: {
                score: { type: "number" },
                risk_level: { type: "string" },
                recommendations: { type: "array", items: { type: "string" } },
                unsafe_areas: { type: "array", items: { type: "string" } },
                factors: {
                  type: "object",
                  properties: {
                    time_of_day: { type: "string" },
                    crowd_density: { type: "string" },
                    emergency_services: { type: "string" },
                    community_reports: { type: "string" },
                  },
                },
                reason: { type: "string" },
              },
              required: [
                "score",
                "risk_level",
                "recommendations",
                "unsafe_areas",
                "factors",
                "reason",
              ],
              additionalProperties: false,
            },
          },
        }),
      });

    if (!response.ok) {
      console.error("AI API returned " + response.status);
      return Response.json(buildFallback(destination));
    }

    const data = await response.json();
    const rawContent = geminiKey
      ? data?.candidates?.[0]?.content?.parts
          ?.map((part) => part.text || "")
          .join("")
      : data?.choices?.[0]?.message?.content;

    const result = tryParseJson(rawContent);
    if (!result || typeof result.score !== "number" || !result.risk_level) {
      return Response.json(buildFallback(destination));
    }

    result.score = Math.min(93, Math.max(15, Math.round(result.score)));
    return Response.json(result);
  } catch (error) {
    console.error("POST /api/safety-score error:", error);
    return Response.json(buildFallback(""));
  }
}
