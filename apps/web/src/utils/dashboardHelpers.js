export function getGreeting(userName) {
  return userName ? userName.split(" ")[0] : "there";
}

export function getTimeGreeting() {
  const hour = new Date().getHours();
  return hour < 12
    ? "Good morning"
    : hour < 17
      ? "Good afternoon"
      : "Good evening";
}

export function calculateWeekActivity(reports, feedPosts) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const ds = d.toISOString().split("T")[0];
    return [...reports, ...feedPosts].filter((x) =>
      x.created_at?.startsWith(ds),
    ).length;
  });
}
