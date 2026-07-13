import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

const FALLBACK_REPORTS = [
  {
    id: "fallback-safe-zone",
    location_lat: 28.6139,
    location_lng: 77.209,
    danger_level: "low",
    category: "safe_area",
    description: "Demo safe zone. Connect DATABASE_URL to load live community reports.",
    reporter_name: "SHEild AI",
    created_at: new Date().toISOString(),
  },
];

export async function GET(request) {
  try {
    // Cast user_id (text) to integer for JOIN with auth_users (id = integer)
    const reports = await sql`
      SELECT r.*, u.name as reporter_name 
      FROM safety_reports r
      LEFT JOIN auth_users u ON r.user_id::integer = u.id
      ORDER BY r.created_at DESC
    `;
    return Response.json(reports);
  } catch (error) {
    // Fallback: return reports without user join if type cast fails
    try {
      const reports =
        await sql`SELECT * FROM safety_reports ORDER BY created_at DESC`;
      return Response.json(reports);
    } catch (fallbackErr) {
      console.error("GET /api/reports error", fallbackErr);
      return Response.json(FALLBACK_REPORTS);
    }
  }
}

export async function POST(request) {
  let body = null;
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    body = await request.json();
    const { location_lat, location_lng, danger_level, description, category } =
      body;

    const [newReport] = await sql`
      INSERT INTO safety_reports (user_id, location_lat, location_lng, danger_level, description, category)
      VALUES (${session.user.id}, ${location_lat}, ${location_lng}, ${danger_level}, ${description}, ${category})
      RETURNING *
    `;

    return Response.json(newReport);
  } catch (error) {
    console.error("POST /api/reports error", error);
    if (body) {
      return Response.json({
        id: `local-${Date.now()}`,
        ...body,
        reporter_name: "You",
        created_at: new Date().toISOString(),
      });
    }
    return Response.json({ error: "Failed to create report" }, { status: 500 });
  }
}

export async function loader({ request }) {
  if (request.method !== "GET") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
  return GET(request);
}

export async function action({ request }) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
  return POST(request);
}
