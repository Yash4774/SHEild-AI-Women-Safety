function buildReply(messages) {
  const lastUserMsg = (messages || []).filter((m) => m.role === "user").pop();
  const text = String(lastUserMsg?.content || "").toLowerCase();
  const emergency =
    text.includes("follow") ||
    text.includes("unsafe") ||
    text.includes("danger") ||
    text.includes("stalk") ||
    text.includes("harass") ||
    text.includes("emergency");
  const route =
    text.includes("route") ||
    text.includes("travel") ||
    text.includes("night") ||
    text.includes("destination");

  if (emergency) {
    return [
      "I can help. If you are in immediate danger, call 112 now and move toward people, lights, or a staffed public place.",
      "",
      "- Do not go home if someone may be following you.",
      "- Call a trusted contact and keep them on the line.",
      "- Share your live location if possible.",
      "- Move toward shops, security desks, hospitals, metro stations, or busy streets.",
      "- Use the SOS hub if you need to alert guardians quickly.",
    ].join("\n");
  }

  if (route) {
    return [
      "For a safer route, prioritize visibility, people, and quick access to help.",
      "",
      "- Prefer main roads, metro/bus corridors, markets, hospitals, and well-lit streets.",
      "- Avoid isolated shortcuts, parks, alleys, construction areas, and empty service roads at night.",
      "- Share your route and ETA with a guardian before leaving.",
      "- Keep your phone charged and emergency contacts ready.",
      "- If the safety score is low, change transport mode, wait, or travel with someone.",
    ].join("\n");
  }

  return [
    "I am here for safety guidance.",
    "",
    "- For emergencies in India, call 112 first.",
    "- Share live location with a trusted contact.",
    "- Move toward a staffed, well-lit, public place if you feel unsafe.",
    "- Use Safe Route for route checks and SOS for urgent alerts.",
  ].join("\n");
}

export async function action({ request }) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
  const body = await request.json().catch(() => ({}));
  return Response.json({ reply: buildReply(body.messages) });
}
