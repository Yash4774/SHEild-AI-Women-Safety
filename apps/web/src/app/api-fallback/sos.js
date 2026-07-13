let sosEvents = [];

export async function loader() {
  return Response.json(sosEvents);
}

export async function action({ request }) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const body = await request.json().catch(() => ({}));
  const event = {
    id: `local-${Date.now()}`,
    message: body.message || "SOS activated",
    location_lat: body.location_lat || null,
    location_lng: body.location_lng || null,
    created_at: new Date().toISOString(),
  };
  sosEvents = [event, ...sosEvents].slice(0, 20);
  return Response.json(event);
}
