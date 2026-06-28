import { useState, useEffect } from "react";

export function useDashboardData() {
  const [reports, setReports] = useState([]);
  const [feedPosts, setFeedPosts] = useState([]);
  const [sosHistory, setSosHistory] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/reports").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/feed").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/sos").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([reps, feed, sos]) => {
        if (Array.isArray(reps)) setReports(reps);
        if (Array.isArray(feed)) setFeedPosts(feed);
        if (Array.isArray(sos)) setSosHistory(sos);
        setLoaded(true);
      })
      .catch(console.error);
  }, []);

  return { reports, feedPosts, sosHistory, loaded };
}
