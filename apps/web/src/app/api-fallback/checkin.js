let checkIns = [];

export async function loader() {
  return Response.json(checkIns);
}

export async function action({ request }) {
  const body = await request.json().catch(() => ({}));

  if (request.method === "POST") {
    const item = {
      id: `local-${Date.now()}`,
      destination: body.destination,
      scheduled_arrival: body.scheduled_arrival,
      emergency_contact: body.emergency_contact || "",
      status: "pending",
      dest_lat: body.dest_lat || null,
      dest_lng: body.dest_lng || null,
      dest_address: body.dest_address || body.destination || "",
      created_at: new Date().toISOString(),
    };
    checkIns = [item, ...checkIns].slice(0, 20);
    return Response.json(item);
  }

  if (request.method === "PATCH") {
    checkIns = checkIns.map((item) =>
      item.id === body.id ? { ...item, status: body.status || item.status } : item,
    );
    return Response.json(checkIns.find((item) => item.id === body.id) || null);
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
}
