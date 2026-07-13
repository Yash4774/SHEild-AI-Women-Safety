let guardians = [];

export async function loader() {
  return Response.json(guardians);
}

export async function action({ request }) {
  const body = await request.json().catch(() => ({}));

  if (request.method === "POST") {
    if (!body.name) {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }

    const guardian = {
      id: `local-${Date.now()}`,
      name: body.name,
      phone: body.phone || "",
      email: body.email || "",
      relationship: body.relationship || "Friend",
      whatsapp: body.whatsapp || "",
      created_at: new Date().toISOString(),
    };
    guardians = [guardian, ...guardians].slice(0, 50);
    return Response.json(guardian);
  }

  if (request.method === "DELETE") {
    guardians = guardians.filter((guardian) => guardian.id !== body.id);
    return Response.json({ success: true });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
}
