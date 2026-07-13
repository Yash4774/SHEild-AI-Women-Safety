let evidence = [];

export async function loader() {
  return Response.json(evidence);
}

export async function action({ request }) {
  const body = await request.json().catch(() => ({}));

  if (request.method === "POST") {
    const item = {
      id: `local-${Date.now()}`,
      file_url: body.file_url || "",
      file_type: body.file_type || "other",
      description: body.description || "Evidence item",
      location_name: body.location_name || "Unknown location",
      created_at: new Date().toISOString(),
    };
    evidence = [item, ...evidence].slice(0, 50);
    return Response.json(item);
  }

  if (request.method === "DELETE") {
    evidence = evidence.filter((item) => item.id !== body.id);
    return Response.json({ success: true });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
}
