import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    const rows = await sql`
      SELECT * FROM walks WHERE user_id = ${session.user.id}
      ORDER BY created_at DESC LIMIT 10
    `;
    return Response.json(rows);
  } catch (err) {
    console.error("GET /api/walk error:", err);
    return Response.json({ error: "Failed to fetch walks" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const { start_lat, start_lng, guardian_email } = body;
    const rows = await sql`
      INSERT INTO walks (user_id, start_lat, start_lng, guardian_email, status)
      VALUES (${session.user.id}, ${start_lat || 0}, ${start_lng || 0}, ${guardian_email || ""}, 'active')
      RETURNING *
    `;
    return Response.json(rows[0]);
  } catch (err) {
    console.error("POST /api/walk error:", err);
    return Response.json({ error: "Failed to start walk" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const { id, status, alert_triggered } = body;
    const rows = await sql`
      UPDATE walks
      SET status = ${status || "completed"},
          alert_triggered = ${alert_triggered || false},
          ended_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND user_id = ${session.user.id}
      RETURNING *
    `;
    return Response.json(rows[0]);
  } catch (err) {
    console.error("PATCH /api/walk error:", err);
    return Response.json({ error: "Failed to update walk" }, { status: 500 });
  }
}
