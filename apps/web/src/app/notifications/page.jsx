import { useState, useEffect } from "react";
import {
  Bell,
  AlertTriangle,
  Navigation,
  Users,
  AlertOctagon,
  Info,
  CheckCircle,
  Trash2,
  RefreshCw,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { useTheme } from "@/components/ThemeProvider";

// ── No more fake ALL_NOTIFS — everything comes from /api/notifications ──

const NOTIF_CONFIG = {
  danger: {
    Icon: AlertTriangle,
    label: "Danger Alert",
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.25)",
    color: "#f87171",
  },
  guardian: {
    Icon: Users,
    label: "Guardian",
    bg: "rgba(59,130,246,0.1)",
    border: "rgba(59,130,246,0.25)",
    color: "#60a5fa",
  },
  sos: {
    Icon: AlertOctagon,
    label: "SOS Alert",
    bg: "rgba(249,115,22,0.1)",
    border: "rgba(249,115,22,0.25)",
    color: "#fb923c",
  },
  route: {
    Icon: Navigation,
    label: "Route Update",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.25)",
    color: "#fbbf24",
  },
  info: {
    Icon: Info,
    label: "Information",
    bg: "rgba(124,58,237,0.1)",
    border: "rgba(124,58,237,0.25)",
    color: "#a78bfa",
  },
};

const FILTERS = ["all", "danger", "guardian", "sos", "route", "info"];
const LOCAL_NOTIFICATIONS_KEY = "sheild-local-notifications";

function readLocalNotifications() {
  if (typeof window === "undefined") return [];
  try {
    const saved = window.localStorage.getItem(LOCAL_NOTIFICATIONS_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalNotifications(items) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(items));
  } catch {}
}

function timeAgo(iso) {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return "just now";
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

export default function NotificationsPage() {
  const { theme } = useTheme();
  const dark = theme === "dark";
  const [notifs, setNotifs] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const next = data.length ? data : readLocalNotifications();
        setNotifs(next);
        writeLocalNotifications(next);
      }
    } catch (err) {
      console.warn("Notifications API unavailable, using local list:", err);
      setNotifs(readLocalNotifications());
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const displayed =
    filter === "all" ? notifs : notifs.filter((n) => n.type === filter);
  const unread = notifs.filter((n) => !n.read).length;

  const markRead = async (id) => {
    setNotifs((p) => {
      const next = p.map((n) =>
        String(n.id) === String(id) ? { ...n, read: true } : n,
      );
      writeLocalNotifications(next);
      return next;
    });
    // Only persist for DB-backed notifications (numeric IDs)
    if (!isNaN(Number(id))) {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, read: true }),
      }).catch(console.warn);
    }
  };

  const markAllRead = async () => {
    setNotifs((p) => {
      const next = p.map((n) => ({ ...n, read: true }));
      writeLocalNotifications(next);
      return next;
    });
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    }).catch(console.warn);
  };

  const remove = async (id) => {
    setNotifs((p) => {
      const next = p.filter((n) => String(n.id) !== String(id));
      writeLocalNotifications(next);
      return next;
    });
    if (!isNaN(Number(id))) {
      await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      }).catch(console.warn);
    }
  };

  const surf = "var(--surface)";
  const bord = "var(--border)";
  const t1 = "var(--text1)";
  const t2 = "var(--text2)";

  return (
    <AppShell activePage="notifications">
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 20px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: t1,
                margin: 0,
                lineHeight: 1,
              }}
            >
              Notification Center
            </h1>
            <p style={{ fontSize: 12, color: t2, margin: "4px 0 0" }}>
              {loading
                ? "Loading…"
                : unread > 0
                  ? `${unread} unread alerts`
                  : "All caught up!"}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={fetchNotifs}
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: surf,
                border: `1px solid ${bord}`,
                color: t2,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 10,
                  background: surf,
                  border: `1px solid ${bord}`,
                  color: t2,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <CheckCircle size={13} /> Mark all read
              </button>
            )}
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              color: "#f87171",
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            {error} —{" "}
            <button
              onClick={fetchNotifs}
              style={{
                background: "none",
                border: "none",
                color: "#f87171",
                cursor: "pointer",
                fontWeight: 700,
                textDecoration: "underline",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 10,
            marginBottom: 20,
          }}
        >
          {[
            { label: "Total", val: notifs.length, color: "#a78bfa" },
            { label: "Unread", val: unread, color: "#ef4444" },
            {
              label: "Danger",
              val: notifs.filter((n) => n.type === "danger").length,
              color: "#f87171",
            },
            {
              label: "Guardian",
              val: notifs.filter((n) => n.type === "guardian").length,
              color: "#60a5fa",
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                background: surf,
                border: `1px solid ${bord}`,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>
                {loading ? "…" : s.val}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: t2,
                  marginTop: 2,
                  fontWeight: 600,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            marginBottom: 16,
          }}
        >
          {FILTERS.map((f) => {
            const cfg = f === "all" ? null : NOTIF_CONFIG[f];
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 9,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  background: active
                    ? cfg
                      ? cfg.bg
                      : "rgba(124,58,237,0.15)"
                    : surf,
                  border: `1px solid ${active ? (cfg ? cfg.border : "rgba(124,58,237,0.3)") : bord}`,
                  color: active ? (cfg ? cfg.color : "#a78bfa") : t2,
                }}
              >
                {cfg ? cfg.label : "All"}
              </button>
            );
          })}
        </div>

        {/* List */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 80,
                  borderRadius: 14,
                  background: surf,
                  border: `1px solid ${bord}`,
                  animation: "nShimmer 1.5s infinite",
                  backgroundSize: "200% 100%",
                  backgroundImage:
                    "linear-gradient(90deg,rgba(255,255,255,0.02) 25%,rgba(255,255,255,0.05) 50%,rgba(255,255,255,0.02) 75%)",
                }}
              />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <Bell size={48} color="#52525b" style={{ margin: "0 auto 16px" }} />
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: t1,
                marginBottom: 6,
              }}
            >
              No notifications yet
            </div>
            <div style={{ fontSize: 13, color: t2 }}>
              {filter !== "all"
                ? `No ${filter} notifications.`
                : "Activity from your safety features will appear here automatically."}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {displayed.map((n, i) => {
              const cfg = NOTIF_CONFIG[n.type] || NOTIF_CONFIG.info;
              const NIcon = cfg.Icon;
              const timeKey = n.created_at || n.time;
              return (
                <div
                  key={String(n.id)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "14px 16px",
                    borderRadius: 14,
                    background: n.read
                      ? surf
                      : dark
                        ? "rgba(124,58,237,0.05)"
                        : "rgba(124,58,237,0.04)",
                    border: `1px solid ${n.read ? bord : "rgba(124,58,237,0.18)"}`,
                    transition: "all 0.15s",
                    cursor: "pointer",
                    animation: `nIn 0.35s ${i * 0.04}s ease both`,
                  }}
                  onClick={() => {
                    markRead(n.id);
                    if (n.href) window.location.href = n.href;
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: cfg.bg,
                      border: `1px solid ${cfg.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: cfg.color,
                      flexShrink: 0,
                    }}
                  >
                    <NIcon size={17} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: t1,
                          flex: 1,
                          minWidth: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {n.title}
                      </div>
                      {!n.read && (
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "#7c3aed",
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <div style={{ fontSize: 11, color: t2, flexShrink: 0 }}>
                        {timeKey ? timeAgo(timeKey) : ""}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: t2, lineHeight: 1.45 }}>
                      {n.body}
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: cfg.color,
                          padding: "2px 8px",
                          borderRadius: 6,
                          background: cfg.bg,
                          border: `1px solid ${cfg.border}`,
                        }}
                      >
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(n.id);
                    }}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: "transparent",
                      border: "none",
                      color: t2,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.15s",
                    }}
                    title="Remove"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`
        @keyframes nIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes nShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
      `}</style>
    </AppShell>
  );
}
