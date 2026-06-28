import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const rows = await sql`
      SELECT f.*, u.name as user_name
      FROM feed_posts f
      LEFT JOIN auth_users u ON f.user_id::integer = u.id
      ORDER BY f.created_at DESC
      LIMIT 50
    `;
    return Response.json(rows);
  } catch (err) {
    console.error("GET /api/feed error:", err);
    return Response.json({ error: "Failed to fetch feed" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { content, category, location_name } = body;
    if (!content) {
      return Response.json({ error: "Content is required" }, { status: 400 });
    }
    const rows = await sql`
      INSERT INTO feed_posts (user_id, author_name, content, category, location_name)
      VALUES (${session.user.id}, ${session.user.name || "Anonymous"}, ${content}, ${category || "alert"}, ${location_name || ""})
      RETURNING *
    `;
    return Response.json(rows[0]);
  } catch (err) {
    console.error("POST /api/feed error:", err);
    return Response.json({ error: "Failed to create post" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { post_id } = body;
    const userId = String(session.user.id);

    const existing =
      await sql`SELECT upvoted_by, upvotes FROM feed_posts WHERE id = ${post_id}`;
    if (!existing.length)
      return Response.json({ error: "Post not found" }, { status: 404 });

    const post = existing[0];
    const alreadyVoted = post.upvoted_by && post.upvoted_by.includes(userId);

    if (alreadyVoted) {
      const rows = await sql`
        UPDATE feed_posts
        SET upvotes = upvotes - 1,
            upvoted_by = array_remove(upvoted_by, ${userId})
        WHERE id = ${post_id}
        RETURNING *
      `;
      return Response.json(rows[0]);
    } else {
      const rows = await sql`
        UPDATE feed_posts
        SET upvotes = upvotes + 1,
            upvoted_by = array_append(upvoted_by, ${userId})
        WHERE id = ${post_id}
        RETURNING *
      `;
      return Response.json(rows[0]);
    }
  } catch (err) {
    console.error("PATCH /api/feed error:", err);
    return Response.json({ error: "Failed to upvote" }, { status: 500 });
  }
}
