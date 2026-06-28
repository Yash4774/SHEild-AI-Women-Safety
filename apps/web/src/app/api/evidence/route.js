import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await sql`
      SELECT * FROM evidence_vault 
      WHERE user_id = ${session.user.id}
      ORDER BY created_at DESC
    `;
    return Response.json(items);
  } catch (error) {
    console.error("GET /api/evidence error", error);
    return Response.json(
      { error: "Failed to fetch evidence" },
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

    const { file_url, file_type, description, location_name } =
      await request.json();

    const [newItem] = await sql`
      INSERT INTO evidence_vault (user_id, file_url, file_type, description, location_name)
      VALUES (${session.user.id}, ${file_url}, ${file_type}, ${description}, ${location_name})
      RETURNING *
    `;

    return Response.json(newItem);
  } catch (error) {
    console.error("POST /api/evidence error", error);
    return Response.json(
      { error: "Failed to create evidence record" },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await request.json();
    if (!id) return Response.json({ error: "ID required" }, { status: 400 });

    await sql`
      DELETE FROM evidence_vault
      WHERE id = ${id} AND user_id = ${session.user.id}
    `;
    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/evidence error", error);
    return Response.json(
      { error: "Failed to delete evidence" },
      { status: 500 },
    );
  }
}
