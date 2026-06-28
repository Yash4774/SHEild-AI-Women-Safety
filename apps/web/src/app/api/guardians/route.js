import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const rows = await sql`
      SELECT * FROM user_guardians
      WHERE user_id = ${session.user.id}
      ORDER BY created_at DESC
    `;
    return Response.json(rows);
  } catch (err) {
    console.error("GET /api/guardians error:", err);
    return Response.json(
      { error: "Failed to fetch guardians" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { name, phone, email, relationship, whatsapp } = await request.json();
    if (!name)
      return Response.json({ error: "Name is required" }, { status: 400 });

    const [row] = await sql`
      INSERT INTO user_guardians (user_id, name, phone, email, relationship, whatsapp)
      VALUES (${session.user.id}, ${name}, ${phone || ""}, ${email || ""}, ${relationship || "Contact"}, ${whatsapp || ""})
      RETURNING *
    `;

    // Log a notification
    try {
      await sql`
        INSERT INTO notifications (user_id, type, title, body, href)
        VALUES (${session.user.id}, 'guardian', 'Guardian Added',
          ${`${name} added to your Guardian Network`}, '/guardian')
      `;
    } catch (_) {}

    return Response.json(row);
  } catch (err) {
    console.error("POST /api/guardians error:", err);
    return Response.json({ error: "Failed to add guardian" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await request.json();
    await sql`
      DELETE FROM user_guardians
      WHERE id = ${id} AND user_id = ${session.user.id}
    `;
    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/guardians error:", err);
    return Response.json(
      { error: "Failed to delete guardian" },
      { status: 500 },
    );
  }
}
