let posts = [];

export async function loader() {
  return Response.json(posts);
}

export async function action({ request }) {
  const body = await request.json().catch(() => ({}));

  if (request.method === "POST") {
    if (!body.content) {
      return Response.json({ error: "Content is required" }, { status: 400 });
    }
    const post = {
      id: `local-${Date.now()}`,
      author_name: "You",
      user_name: "You",
      content: body.content,
      category: body.category || "alert",
      location_name: body.location_name || "",
      upvotes: 0,
      upvoted_by: [],
      created_at: new Date().toISOString(),
    };
    posts = [post, ...posts].slice(0, 50);
    return Response.json(post);
  }

  if (request.method === "PATCH") {
    posts = posts.map((post) =>
      post.id === body.post_id
        ? { ...post, upvotes: (post.upvotes || 0) + 1 }
        : post,
    );
    return Response.json(posts.find((post) => post.id === body.post_id) || null);
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
}
