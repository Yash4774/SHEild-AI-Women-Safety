import { useState, useEffect, useRef } from "react";
import useUser from "@/utils/useUser";
import { useTheme } from "@/components/ThemeProvider";
import { useISTClock } from "@/hooks/useGPSLocation";
import {
  Shield,
  LayoutDashboard,
  Map,
  Navigation,
  Users,
  MessageSquare,
  Bell,
  User,
  AlertOctagon,
  Lock,
  BarChart3,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Home,
  Footprints,
  Clock,
  ChevronRight,
  ArrowLeft,
  AlertTriangle,
  Info,
  CheckCircle,
} from "lucide-react";

// ─── Navigation ──────────────────────────────────────────────────
const NAV = [
  { id: "home", label: "Home", icon: Home, href: "/" },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  { id: "map", label: "Safety Map", icon: Map, href: "/map" },
  {
    id: "safe-route",
    label: "Safe Route",
    icon: Navigation,
    href: "/safe-route",
  },
  { id: "guardian", label: "Guardian Network", icon: Users, href: "/guardian" },
  { id: "walk", label: "Walk With Me", icon: Footprints, href: "/walk" },
  {
    id: "ai-assistant",
    label: "AI Assistant",
    icon: MessageSquare,
    href: "/ai-assistant",
  },
  { id: "checkin", label: "Smart Check-In", icon: Clock, href: "/checkin" },
  { id: "vault", label: "Evidence Vault", icon: Lock, href: "/vault" },
  { id: "analytics", label: "Analytics", icon: BarChart3, href: "/analytics" },
  { id: "profile", label: "Safety DNA", icon: User, href: "/profile" },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    href: "/notifications",
  },
];

const SOS_NAV = {
  id: "sos",
  label: "Emergency Hub",
  icon: AlertOctagon,
  href: "/sos",
};

// ─── Notifications ────────────────────────────────────────────────
const SEED_NOTIFS = [
  {
    id: 1,
    type: "danger",
    title: "High-risk zone reported",
    body: "3 incidents near Central Park in the last hour.",
    time: "2m ago",
    read: false,
  },
  {
    id: 2,
    type: "guardian",
    title: "Guardian alert",
    body: "Sarah has not checked in — arrival was 20 min ago.",
    time: "18m ago",
    read: false,
  },
  {
    id: 3,
    type: "sos",
    title: "SOS signal nearby",
    body: "Community SOS detected 0.4 km from your location.",
    time: "1h ago",
    read: false,
  },
  {
    id: 4,
    type: "route",
    title: "Route safety update",
    body: "Your saved route passes a newly reported danger zone.",
    time: "3h ago",
    read: true,
  },
  {
    id: 5,
    type: "info",
    title: "5 new community reports",
    body: "New safety reports added to your area today.",
    time: "5h ago",
    read: true,
  },
];

const NOTIF_STYLE = {
  danger: {
    Icon: AlertTriangle,
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.25)",
    color: "#f87171",
  },
  guardian: {
    Icon: Users,
    bg: "rgba(59,130,246,0.1)",
    border: "rgba(59,130,246,0.25)",
    color: "#60a5fa",
  },
  sos: {
    Icon: AlertOctagon,
    bg: "rgba(249,115,22,0.1)",
    border: "rgba(249,115,22,0.25)",
    color: "#fb923c",
  },
  route: {
    Icon: Navigation,
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.25)",
    color: "#fbbf24",
  },
  info: {
    Icon: Info,
    bg: "rgba(124,58,237,0.1)",
    border: "rgba(124,58,237,0.25)",
    color: "#a78bfa",
  },
};

// ─── AppShell ─────────────────────────────────────────────────────
export default function AppShell({ children, activePage = "" }) {
  const { data: user, loading } = useUser();
  const { theme, toggle: toggleTheme } = useTheme();
  const clock = useISTClock();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState(SEED_NOTIFS);
  const [sosActive, setSosActive] = useState(false);
  const notifRef = useRef(null);

  const dark = theme === "dark";

  // ─ colors from CSS vars ─
  const bg1 = "var(--bg1)";
  const bg2 = "var(--bg2)";
  const surf = "var(--surface)";
  const bord = "var(--border)";
  const t1 = "var(--text1)";
  const t2 = "var(--text2)";

  // redirect unauthenticated users
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/account/signin";
    }
  }, [user, loading]);

  // close notif panel on outside click
  useEffect(() => {
    const handle = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const unread = notifs.filter((n) => !n.read).length;
  const markAllRead = () =>
    setNotifs((p) => p.map((n) => ({ ...n, read: true })));
  const markRead = (id) =>
    setNotifs((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)));

  // ─ SOS ─
  const triggerSOS = () => {
    setSosActive(true);
    if (typeof window !== "undefined") {
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (Ctx) {
          const ctx = new Ctx();
          for (let i = 0; i < 3; i++) {
            const osc = ctx.createOscillator(),
              gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = "square";
            osc.frequency.value = 880;
            gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.45);
            gain.gain.exponentialRampToValueAtTime(
              0.001,
              ctx.currentTime + i * 0.45 + 0.4,
            );
            osc.start(ctx.currentTime + i * 0.45);
            osc.stop(ctx.currentTime + i * 0.45 + 0.4);
          }
        }
      } catch (_) {}
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          fetch("/api/sos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              location_lat: pos.coords.latitude,
              location_lng: pos.coords.longitude,
              message: "EMERGENCY SOS",
            }),
          }).catch(() => {});
        });
      }
    }
    setTimeout(() => setSosActive(false), 6000);
  };

  // ─ loading screen ─
  if (loading) {
    return (
      <div
        style={{
          background: bg1,
          color: t1,
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              position: "relative",
              width: 64,
              height: 64,
              margin: "0 auto 20px",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                border: "2px solid rgba(124,58,237,0.3)",
                borderRadius: "50%",
                animation: "sPing 1.5s ease-in-out infinite",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 8,
                border: "2px solid rgba(124,58,237,0.6)",
                borderRadius: "50%",
                animation: "sPing 1.5s 0.3s ease-in-out infinite",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Shield size={26} color="#7c3aed" />
            </div>
          </div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: t2,
            }}
          >
            SHEild AI
          </p>
        </div>
        <style>{`@keyframes sPing{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.18);opacity:0.4}}`}</style>
      </div>
    );
  }

  if (!user) return null;

  const currentItem = [...NAV, SOS_NAV].find((n) => n.id === activePage);
  const pageTitle = currentItem?.label || "SHEild AI";

  // ─ Sidebar styles ─
  const sideStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    width: 264,
    zIndex: 50,
    display: "flex",
    flexDirection: "column",
    background: dark ? "rgba(8,8,15,0.97)" : "rgba(255,255,255,0.97)",
    borderRight: `1px solid ${bord}`,
    backdropFilter: "blur(24px)",
    transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
  };

  return (
    <>
      {/* ── Mobile overlay ─────────────────── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 45,
          }}
        />
      )}

      {/* ── Sidebar ─────────────────────────── */}
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <aside
          style={{
            ...sideStyle,
            transform: sidebarOpen ? "translateX(0)" : undefined,
          }}
          className={`sheild-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}
        >
          {/* Logo */}
          <div
            style={{
              padding: "18px 16px 14px",
              borderBottom: `1px solid ${bord}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <a
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 11,
                  background: "linear-gradient(135deg,#7c3aed,#db2777)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 18px rgba(124,58,237,0.35)",
                  flexShrink: 0,
                  position: "relative",
                }}
              >
                <Shield size={18} color="#fff" />
                <div
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#10b981",
                    border: `2px solid ${dark ? "#08080f" : "#fff"}`,
                  }}
                />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 900,
                    letterSpacing: "-0.4px",
                    color: t1,
                    lineHeight: 1.1,
                  }}
                >
                  SHEild<span style={{ color: "#a78bfa" }}> AI</span>
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#10b981",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginTop: 1,
                  }}
                >
                  ● Active Shield
                </div>
              </div>
            </a>
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: t2,
                cursor: "pointer",
                padding: 4,
                display: "none",
              }}
              className="sidebar-close-btn"
            >
              <X size={18} />
            </button>
          </div>

          {/* User */}
          <div
            style={{
              margin: "10px 10px 6px",
              padding: "11px 13px",
              borderRadius: 12,
              background:
                "linear-gradient(135deg,rgba(124,58,237,0.12),rgba(219,39,119,0.07))",
              border: "1px solid rgba(124,58,237,0.2)",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#7c3aed,#db2777)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 800,
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {(user.name || "U")[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: t1,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user.name || "User"}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: t2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user.email}
                </div>
              </div>
              <div
                style={{
                  padding: "3px 7px",
                  borderRadius: 7,
                  background: "rgba(124,58,237,0.18)",
                  border: "1px solid rgba(124,58,237,0.3)",
                  fontSize: 9,
                  color: "#a78bfa",
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                PRO
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav
            style={{
              flex: 1,
              padding: "4px 8px",
              overflowY: "auto",
              scrollbarWidth: "none",
            }}
          >
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = item.id === activePage;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 11px",
                    borderRadius: 11,
                    marginBottom: 1,
                    textDecoration: "none",
                    fontSize: 13,
                    fontWeight: active ? 700 : 500,
                    transition: "all 0.15s",
                    color: active ? "#a78bfa" : t2,
                    background: active ? "rgba(124,58,237,0.1)" : "transparent",
                    border: `1px solid ${active ? "rgba(124,58,237,0.22)" : "transparent"}`,
                    outline: "none",
                  }}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 9,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: active
                        ? "rgba(124,58,237,0.15)"
                        : "transparent",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={14} />
                  </div>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {active && (
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#7c3aed",
                        flexShrink: 0,
                      }}
                    />
                  )}
                  {item.id === "notifications" && unread > 0 && (
                    <div
                      style={{
                        minWidth: 18,
                        height: 18,
                        borderRadius: 9,
                        background: "#ef4444",
                        fontSize: 9,
                        color: "#fff",
                        fontWeight: 800,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 4px",
                        flexShrink: 0,
                      }}
                    >
                      {unread}
                    </div>
                  )}
                </a>
              );
            })}

            <div style={{ height: 1, background: bord, margin: "6px 4px" }} />

            {/* Emergency */}
            {(() => {
              const Icon = SOS_NAV.icon;
              const active = activePage === "sos";
              return (
                <a
                  href={SOS_NAV.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 11px",
                    borderRadius: 11,
                    textDecoration: "none",
                    fontSize: 13,
                    fontWeight: 700,
                    color: active ? "#fca5a5" : "#ef4444",
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    transition: "all 0.15s",
                  }}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 9,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(239,68,68,0.15)",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={14} />
                  </div>
                  {SOS_NAV.label}
                </a>
              );
            })()}
          </nav>

          {/* Sign out */}
          <div
            style={{
              padding: "8px 8px 14px",
              borderTop: `1px solid ${bord}`,
              flexShrink: 0,
            }}
          >
            <a
              href="/account/logout"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 11px",
                borderRadius: 11,
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 500,
                color: t2,
                transition: "all 0.15s",
              }}
            >
              <LogOut size={14} />
              Sign Out
            </a>
          </div>
        </aside>

        {/* ── Main ──────────────────────────── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minWidth: 0,
          }}
          className="sheild-main"
        >
          {/* Header */}
          <header
            style={{
              height: 58,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 18px",
              background: dark ? "rgba(8,8,15,0.88)" : "rgba(255,255,255,0.88)",
              backdropFilter: "blur(20px)",
              borderBottom: `1px solid ${bord}`,
              position: "sticky",
              top: 0,
              zIndex: 30,
            }}
          >
            {/* Left */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={() => setSidebarOpen(true)}
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
                className="sidebar-toggle-btn"
              >
                <Menu size={17} />
              </button>
              {activePage !== "" &&
                activePage !== "home" &&
                activePage !== "dashboard" && (
                  <button
                    onClick={() =>
                      window.history.length > 1
                        ? window.history.back()
                        : (window.location.href = "/dashboard")
                    }
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
                  >
                    <ArrowLeft size={15} />
                  </button>
                )}
              <div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: t1,
                    lineHeight: 1,
                  }}
                >
                  {pageTitle}
                </div>
                <div style={{ fontSize: 10, color: t2, marginTop: 1 }}>
                  SHEild AI
                </div>
              </div>
            </div>

            {/* Right */}
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              {/* IST Clock */}
              <div
                style={{
                  padding: "4px 10px",
                  borderRadius: 8,
                  background: "rgba(124,58,237,0.08)",
                  border: "1px solid rgba(124,58,237,0.18)",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
                className="header-ist-clock"
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 900,
                    color: "#a78bfa",
                    fontFamily: "monospace",
                    letterSpacing: "0.02em",
                    lineHeight: 1.2,
                  }}
                >
                  {clock.time}
                </div>
                <div
                  style={{
                    fontSize: 8,
                    color: "var(--text2)",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                  }}
                >
                  IST
                </div>
              </div>

              {/* Theme */}
              <button
                onClick={toggleTheme}
                title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
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
                  transition: "all 0.2s",
                }}
              >
                {dark ? <Sun size={15} /> : <Moon size={15} />}
              </button>

              {/* Bell + Notif Panel */}
              <div ref={notifRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setNotifOpen((o) => !o)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: notifOpen ? "rgba(124,58,237,0.15)" : surf,
                    border: `1px solid ${notifOpen ? "rgba(124,58,237,0.3)" : bord}`,
                    color: notifOpen ? "#a78bfa" : t2,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                    position: "relative",
                  }}
                >
                  <Bell size={15} />
                  {unread > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: 3,
                        right: 3,
                        width: 15,
                        height: 15,
                        borderRadius: "50%",
                        background: "#ef4444",
                        border: `2px solid ${dark ? "#08080f" : "#fff"}`,
                        fontSize: 8,
                        color: "#fff",
                        fontWeight: 800,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {unread > 9 ? "9+" : unread}
                    </div>
                  )}
                </button>

                {notifOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      right: 0,
                      width: 340,
                      zIndex: 60,
                      background: dark ? "#0d0d18" : "#ffffff",
                      border: `1px solid ${bord}`,
                      borderRadius: 16,
                      overflow: "hidden",
                      boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
                    }}
                  >
                    <div
                      style={{
                        padding: "12px 14px",
                        borderBottom: `1px solid ${bord}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 800, color: t1 }}>
                        Notifications
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        {unread > 0 && (
                          <span
                            style={{
                              fontSize: 10,
                              color: "#a78bfa",
                              fontWeight: 700,
                            }}
                          >
                            {unread} new
                          </span>
                        )}
                        <button
                          onClick={markAllRead}
                          style={{
                            fontSize: 10,
                            color: t2,
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          Mark all read
                        </button>
                      </div>
                    </div>
                    <div
                      style={{
                        maxHeight: 340,
                        overflowY: "auto",
                        scrollbarWidth: "none",
                      }}
                    >
                      {notifs.map((n) => {
                        const cfg = NOTIF_STYLE[n.type] || NOTIF_STYLE.info;
                        const NIcon = cfg.Icon;
                        return (
                          <div
                            key={n.id}
                            onClick={() => markRead(n.id)}
                            style={{
                              display: "flex",
                              gap: 11,
                              padding: "11px 14px",
                              cursor: "pointer",
                              borderBottom: `1px solid ${bord}`,
                              background: n.read
                                ? "transparent"
                                : dark
                                  ? "rgba(124,58,237,0.04)"
                                  : "rgba(124,58,237,0.03)",
                              transition: "background 0.15s",
                            }}
                          >
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 9,
                                background: cfg.bg,
                                border: `1px solid ${cfg.border}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: cfg.color,
                                flexShrink: 0,
                              }}
                            >
                              <NIcon size={13} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: t1,
                                  marginBottom: 2,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 5,
                                }}
                              >
                                {n.title}
                                {!n.read && (
                                  <div
                                    style={{
                                      width: 6,
                                      height: 6,
                                      borderRadius: "50%",
                                      background: "#7c3aed",
                                      flexShrink: 0,
                                    }}
                                  />
                                )}
                              </div>
                              <div
                                style={{
                                  fontSize: 11,
                                  color: t2,
                                  lineHeight: 1.4,
                                }}
                              >
                                {n.body}
                              </div>
                              <div
                                style={{
                                  fontSize: 10,
                                  color: "var(--text3,#52525b)",
                                  marginTop: 3,
                                }}
                              >
                                {n.time}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div
                      style={{
                        padding: "9px 14px",
                        borderTop: `1px solid ${bord}`,
                      }}
                    >
                      <a
                        href="/notifications"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 4,
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#a78bfa",
                          textDecoration: "none",
                        }}
                      >
                        View all notifications <ChevronRight size={11} />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* SOS */}
              <button
                onClick={triggerSOS}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 13px",
                  borderRadius: 9,
                  background: sosActive ? "#dc2626" : "rgba(220,38,38,0.14)",
                  border: `1px solid ${sosActive ? "#dc2626" : "rgba(220,38,38,0.3)"}`,
                  color: sosActive ? "#fff" : "#f87171",
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <AlertOctagon size={13} />
                {sosActive ? "SOS SENT!" : "SOS"}
              </button>
            </div>
          </header>

          {/* Content */}
          <main
            style={{ flex: 1, overflowY: "auto", background: "var(--bg1)" }}
          >
            {children}
          </main>
        </div>
      </div>

      <style>{`
        @keyframes sPing{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.18);opacity:0.4}}
        .sheild-sidebar { position:fixed; }
        .sheild-main { margin-left: 264px; }
        @media(max-width:1023px){
          .sheild-sidebar { transform: translateX(-100%); }
          .sheild-sidebar.sidebar-open { transform: translateX(0); }
          .sheild-main { margin-left: 0 !important; }
          .sidebar-toggle-btn { display: flex !important; }
          .sidebar-close-btn { display: flex !important; }
        }
        @media(min-width:1024px){
          .sheild-sidebar { transform: translateX(0) !important; }
          .sidebar-toggle-btn { display: none !important; }
          .sidebar-close-btn { display: none !important; }
        }
        @media(max-width:640px){ .header-ist-clock { display: none !important; } }
      `}</style>
    </>
  );
}
