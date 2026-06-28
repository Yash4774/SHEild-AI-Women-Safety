import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

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
      return Response.json(
        { error: "Failed to fetch reports" },
        { status: 500 },
      );
    }
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { location_lat, location_lng, danger_level, description, category } =
      await request.json();

    const [newReport] = await sql`
      INSERT INTO safety_reports (user_id, location_lat, location_lng, danger_level, description, category)
      VALUES (${session.user.id}, ${location_lat}, ${location_lng}, ${danger_level}, ${description}, ${category})
      RETURNING *
    `;

    return Response.json(newReport);
  } catch (error) {
    console.error("POST /api/reports error", error);
    return Response.json({ error: "Failed to create report" }, { status: 500 });
  }
}
