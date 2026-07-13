let notifications = [];

export async function loader() {
  return Response.json(notifications);
}

export async function action({ request }) {
  const body = await request.json().catch(() => ({}));

  if (request.method === "PATCH") {
    if (body.markAll) {
      notifications = notifications.map((item) => ({ ...item, read: true }));
      return Response.json({ success: true });
    }
    notifications = notifications.map((item) =>
      String(item.id) === String(body.id)
        ? { ...item, read: Boolean(body.read) }
        : item,
    );
    return Response.json({ success: true });
  }

  if (request.method === "DELETE") {
    notifications = notifications.filter(
      (item) => String(item.id) !== String(body.id),
    );
    return Response.json({ success: true });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
}
