import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { location_lat, location_lng, message } = body;

    const rows = await sql`
      INSERT INTO sos_history (user_id, location_lat, location_lng, message, status)
      VALUES (${session.user.id}, ${location_lat || 0}, ${location_lng || 0}, ${message || "SOS Emergency"}, 'active')
      RETURNING *
    `;
    return Response.json(rows[0]);
  } catch (err) {
    console.error("POST /api/sos error:", err);
    return Response.json(
      { error: "Failed to create SOS record" },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const rows = await sql`
      SELECT * FROM sos_history
      WHERE user_id = ${session.user.id}
      ORDER BY created_at DESC
      LIMIT 20
    `;
    return Response.json(rows);
  } catch (err) {
    console.error("GET /api/sos error:", err);
    return Response.json(
      { error: "Failed to fetch SOS history" },
      { status: 500 },
    );
  }
}
