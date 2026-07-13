let walks = [];

export async function loader() {
  return Response.json(walks);
}

export async function action({ request }) {
  const body = await request.json().catch(() => ({}));

  if (request.method === "POST") {
    const walk = {
      id: `local-${Date.now()}`,
      start_lat: body.start_lat || null,
      start_lng: body.start_lng || null,
      guardian_email: body.guardian_email || "",
      status: "active",
      alert_triggered: false,
      created_at: new Date().toISOString(),
    };
    walks = [walk, ...walks].slice(0, 20);
    return Response.json(walk);
  }

  if (request.method === "PATCH") {
    walks = walks.map((walk) =>
      walk.id === body.id
        ? {
            ...walk,
            status: body.status || walk.status,
            alert_triggered: Boolean(body.alert_triggered),
            ended_at: new Date().toISOString(),
          }
        : walk,
    );
    return Response.json(walks.find((walk) => walk.id === body.id) || null);
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
}
