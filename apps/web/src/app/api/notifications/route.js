import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const uid = session.user.id;

    // Fetch stored notifications
    const stored = await sql`
      SELECT * FROM notifications WHERE user_id = ${uid}
      ORDER BY created_at DESC LIMIT 50
    `;

    // Generate real-time notifications from actual events
    const [reports, checkIns, walks, sos] = await Promise.all([
      sql`SELECT * FROM safety_reports WHERE user_id = ${uid} ORDER BY created_at DESC LIMIT 5`,
      sql`SELECT * FROM check_ins WHERE user_id = ${uid} AND status = 'pending' AND scheduled_arrival < NOW() ORDER BY created_at DESC LIMIT 5`,
      sql`SELECT * FROM walks WHERE user_id = ${uid} AND alert_triggered = true ORDER BY created_at DESC LIMIT 5`,
      sql`SELECT * FROM sos_history WHERE user_id = ${uid} ORDER BY created_at DESC LIMIT 5`,
    ]);

    const dynamic = [];

    // Missed check-ins → alert
    for (const ci of checkIns) {
      dynamic.push({
        id: `ci-${ci.id}`,
        type: "guardian",
        title: "Missed Check-In Alert",
        body: `You missed your check-in for ${ci.destination}. Emergency contact may be notified.`,
        href: "/checkin",
        read: false,
        created_at: ci.scheduled_arrival,
      });
    }

    // SOS activations
    for (const s of sos) {
      dynamic.push({
        id: `sos-${s.id}`,
        type: "sos",
        title: "SOS Activated",
        body: s.message || "Emergency SOS was triggered from your account.",
        href: "/sos",
        read: false,
        created_at: s.created_at,
      });
    }

    // Alerted walks
    for (const w of walks) {
      dynamic.push({
        id: `walk-${w.id}`,
        type: "danger",
        title: "Walk Alert Triggered",
        body: "An alert was triggered during your Walk With Me session.",
        href: "/walk",
        read: false,
        created_at: w.created_at,
      });
    }

    // Recent community reports from this user
    for (const r of reports) {
      dynamic.push({
        id: `rep-${r.id}`,
        type: "info",
        title: "Your Safety Report Filed",
        body: `Your ${r.category} report was submitted to the community safety map.`,
        href: "/map",
        read: true,
        created_at: r.created_at,
      });
    }

    // Merge stored + dynamic, deduplicate by id
    const seen = new Set();
    const merged = [...stored, ...dynamic]
      .filter((n) => {
        const key = String(n.id);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 60);

    return Response.json(merged);
  } catch (err) {
    console.error("GET /api/notifications error:", err);
    return Response.json(
      { error: "Failed to fetch notifications" },
      { status: 500 },
    );
  }
}

export async function PATCH(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id, read, markAll } = await request.json();

    if (markAll) {
      await sql`
        UPDATE notifications SET read = true WHERE user_id = ${session.user.id}
      `;
      return Response.json({ success: true });
    }

    if (id && typeof read === "boolean") {
      // Only update DB notifications (numeric ids)
      if (!isNaN(Number(id))) {
        await sql`
          UPDATE notifications SET read = ${read}
          WHERE id = ${Number(id)} AND user_id = ${session.user.id}
        `;
      }
      return Response.json({ success: true });
    }

    return Response.json({ error: "Invalid request" }, { status: 400 });
  } catch (err) {
    console.error("PATCH /api/notifications error:", err);
    return Response.json(
      { error: "Failed to update notification" },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await request.json();
    if (id && !isNaN(Number(id))) {
      await sql`
        DELETE FROM notifications WHERE id = ${Number(id)} AND user_id = ${session.user.id}
      `;
    }
    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/notifications error:", err);
    return Response.json(
      { error: "Failed to delete notification" },
      { status: 500 },
    );
  }
}
