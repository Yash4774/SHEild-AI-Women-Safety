export async function loader() {
  return Response.json(null);
}

export async function action({ request }) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  return Response.json({
    id: `local-${Date.now()}`,
    score: 64,
    traits: {
      "Proactive Safety": 65,
      "Community Engagement": 50,
      "Emergency Preparedness": 70,
      "Check-In Consistency": 45,
      "Evidence Collection": 35,
      "Guardian Network": 60,
    },
    ai_analysis:
      "Demo Safety DNA generated from local activity while cloud AI/database services are unavailable.",
    strengths: ["Uses multiple safety tools", "Can build a guardian network"],
    weaknesses: ["Add more real activity to improve accuracy"],
    recommendations: [
      "Add at least one guardian",
      "Schedule a check-in before travel",
      "File reports for unsafe areas",
    ],
    created_at: new Date().toISOString(),
  });
}
