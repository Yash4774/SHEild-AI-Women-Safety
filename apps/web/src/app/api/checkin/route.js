import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const rows = await sql`
      SELECT * FROM check_ins
      WHERE user_id = ${session.user.id}
      ORDER BY created_at DESC
      LIMIT 20
    `;
    return Response.json(rows);
  } catch (err) {
    console.error("GET /api/checkin error:", err);
    return Response.json(
      { error: "Failed to fetch check-ins" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const {
      destination,
      scheduled_arrival,
      emergency_contact,
      dest_lat,
      dest_lng,
      dest_address,
    } = body;
    if (!destination || !scheduled_arrival) {
      return Response.json(
        { error: "Destination and arrival time are required" },
        { status: 400 },
      );
    }
    const rows = await sql`
      INSERT INTO check_ins (user_id, destination, scheduled_arrival, emergency_contact, status, dest_lat, dest_lng, dest_address)
      VALUES (
        ${session.user.id},
        ${destination},
        ${scheduled_arrival},
        ${emergency_contact || ""},
        'pending',
        ${dest_lat || null},
        ${dest_lng || null},
        ${dest_address || ""}
      )
      RETURNING *
    `;
    return Response.json(rows[0]);
  } catch (err) {
    console.error("POST /api/checkin error:", err);
    return Response.json(
      { error: "Failed to create check-in" },
      { status: 500 },
    );
  }
}

export async function PATCH(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { id, status } = body;
    const rows = await sql`
      UPDATE check_ins
      SET status = ${status}
      WHERE id = ${id} AND user_id = ${session.user.id}
      RETURNING *
    `;
    return Response.json(rows[0]);
  } catch (err) {
    console.error("PATCH /api/checkin error:", err);
    return Response.json(
      { error: "Failed to update check-in" },
      { status: 500 },
    );
  }
}

export async function loader({ request }) {
  if (request.method !== "GET") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
  return GET(request);
}

export async function action({ request }) {
  if (request.method === "POST") return POST(request);
  if (request.method === "PATCH") return PATCH(request);
  return Response.json({ error: "Method not allowed" }, { status: 405 });
}
