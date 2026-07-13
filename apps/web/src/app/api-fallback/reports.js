const REPORTS = [
  {
    id: "safe-zone-demo",
    location_lat: 28.6139,
    location_lng: 77.209,
    danger_level: "low",
    category: "safe_area",
    description: "Demo safe zone. Connect DATABASE_URL to enable live community reports.",
    reporter_name: "SHEild AI",
    created_at: new Date().toISOString(),
  },
  {
    id: "lighting-demo",
    location_lat: 28.62,
    location_lng: 77.215,
    danger_level: "medium",
    category: "poor_lighting",
    description: "Use caution here after dark and prefer main roads.",
    reporter_name: "SHEild AI",
    created_at: new Date().toISOString(),
  },
];

export async function loader() {
  return Response.json(REPORTS);
}

export async function action({ request }) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
  const body = await request.json().catch(() => ({}));
  return Response.json({
    id: `local-${Date.now()}`,
    ...body,
    reporter_name: "You",
    created_at: new Date().toISOString(),
  });
}
