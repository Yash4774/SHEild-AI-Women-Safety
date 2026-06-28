"use client";
import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Shield,
  Users,
  MapPin,
  Footprints,
  Clock,
  Lock,
  RefreshCw,
  Zap,
  MessageSquare,
  CheckCircle,
} from "lucide-react";
import AppShell from "@/components/AppShell";

function Bar({ value, max, color = "#7c3aed" }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div
      style={{
        height: 8,
        background: "rgba(255,255,255,0.05)",
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: color,
          borderRadius: 4,
          transition: "width 1.2s ease",
        }}
      />
    </div>
  );
}

function WeekChart({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const colors = [
    "#7c3aed",
    "#8b5cf6",
    "#a78bfa",
    "#7c3aed",
    "#6d28d9",
    "#7c3aed",
    "#8b5cf6",
  ];
  return (
    <div
      style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}
    >
      {data.map((d, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <div
            style={{
              flex: 1,
              width: "100%",
              display: "flex",
              alignItems: "flex-end",
            }}
          >
            <div
              style={{
                width: "100%",
                height:
                  max > 0 ? `${Math.max((d.value / max) * 100, 4)}%` : "4%",
                background: colors[i],
                borderRadius: "4px 4px 0 0",
                transition: "height 1s ease",
                minHeight: 4,
                position: "relative",
              }}
              title={`${d.label}: ${d.value} actions`}
            >
              {d.value > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: -18,
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: 9,
                    color: "#a78bfa",
                    fontWeight: 800,
                    whiteSpace: "nowrap",
                  }}
                >
                  {d.value}
                </div>
              )}
            </div>
          </div>
          <div style={{ fontSize: 9, color: "#52525b", textAlign: "center" }}>
            {d.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg, trend, loading }) {
  return (
    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-xl border ${bg}`}>
          <Icon size={16} className={color} />
        </div>
        {trend && (
          <span className="text-[10px] font-bold text-gray-600">{trend}</span>
        )}
      </div>
      <div className="text-2xl font-black text-white mb-1">
        {loading ? "…" : value}
      </div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [reports, setReports] = useState([]);
  const [walks, setWalks] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [sosHistory, setSosHistory] = useState([]);
  const [feedPosts, setFeedPosts] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [guardians, setGuardians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [dateFilter, setDateFilter] = useState("month");

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/reports").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/walk").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/checkin").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/sos").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/feed").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/evidence").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/guardians").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([rep, wlk, chk, sos, feed, ev, grd]) => {
        if (Array.isArray(rep)) setReports(rep);
        if (Array.isArray(wlk)) setWalks(wlk);
        if (Array.isArray(chk)) setCheckIns(chk);
        if (Array.isArray(sos)) setSosHistory(sos);
        if (Array.isArray(feed)) setFeedPosts(feed);
        if (Array.isArray(ev)) setEvidence(ev);
        if (Array.isArray(grd)) setGuardians(grd);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generateInsight = async () => {
    setLoadingInsight(true);
    try {
      const res = await fetch("/integrations/google-gemini-2-5-flash/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Analyze this women's safety app user data and generate 3-4 short, specific AI insights:
- Safety reports: ${reports.length}
- Walks: ${walks.length} (${walks.filter((w) => w.status === "completed").length} safe)
- Check-ins: ${checkIns.length} (${checkIns.filter((c) => c.status === "arrived").length} confirmed)
- Evidence vault: ${evidence.length} items
- Guardians: ${guardians.length}
- SOS events: ${sosHistory.length}
- Community posts: ${feedPosts.length}
- High risk reports: ${reports.filter((r) => r.danger_level === "high").length}

Generate exactly 3 insights like "Your safety engagement has increased 15% this week" or "You've successfully completed all your check-ins this month."
Be specific to the numbers above. Format as a JSON array of strings: ["insight 1", "insight 2", "insight 3"]
Only return the JSON array, no other text.`,
            },
          ],
          stream: false,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content || "[]";
        const start = content.indexOf("[");
        const end = content.lastIndexOf("]");
        if (start !== -1) {
          const parsed = JSON.parse(content.slice(start, end + 1));
          if (Array.isArray(parsed)) setAiInsight(parsed);
        }
      }
    } catch (err) {
      console.error("AI insight error:", err);
    } finally {
      setLoadingInsight(false);
    }
  };

  // Filter by date
  const now = new Date();
  const filterDate = (items) => {
    if (dateFilter === "today") {
      return items.filter((i) =>
        i.created_at?.startsWith(now.toISOString().split("T")[0]),
      );
    }
    if (dateFilter === "week") {
      const weekAgo = new Date(now - 7 * 86400000).toISOString();
      return items.filter((i) => i.created_at > weekAgo);
    }
    if (dateFilter === "month") {
      const monthAgo = new Date(now - 30 * 86400000).toISOString();
      return items.filter((i) => i.created_at > monthAgo);
    }
    return items;
  };

  const fReports = filterDate(reports);
  const fWalks = filterDate(walks);
  const fCheckIns = filterDate(checkIns);
  const fEvidence = filterDate(evidence);
  const fFeed = filterDate(feedPosts);

  const safeWalks = walks.filter((w) => w.status === "completed").length;
  const alertedWalks = walks.filter((w) => w.alert_triggered).length;
  const arrivedCheckIns = checkIns.filter((c) => c.status === "arrived").length;

  const catCounts = {};
  reports.forEach((r) => {
    catCounts[r.category || "other"] =
      (catCounts[r.category || "other"] || 0) + 1;
  });
  const catData = Object.entries(catCounts).slice(0, 6);
  const maxCat = Math.max(...catData.map(([, v]) => v), 1);

  const dangerCounts = {
    high: reports.filter((r) => r.danger_level === "high").length,
    medium: reports.filter((r) => r.danger_level === "medium").length,
    low: reports.filter((r) => r.danger_level === "low").length,
  };

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString("en", { weekday: "short" });
    const dayStr = d.toISOString().split("T")[0];
    const value = [
      ...reports,
      ...walks,
      ...checkIns,
      ...feedPosts,
      ...evidence,
    ].filter((item) => item.created_at?.startsWith(dayStr)).length;
    return { label, value };
  });

  const totalScore = Math.min(
    Math.round(
      (reports.length * 8 +
        walks.length * 12 +
        checkIns.length * 10 +
        evidence.length * 15 +
        feedPosts.length * 5) /
        5 +
        40,
    ),
    100,
  );

  const stats = [
    {
      label: "Safety Reports",
      val: reports.length,
      icon: AlertTriangle,
      color: "text-red-400",
      bg: "bg-red-500/10 border-red-500/20",
    },
    {
      label: "Safe Walks",
      val: safeWalks,
      icon: Footprints,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Check-Ins",
      val: checkIns.length,
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Evidence Files",
      val: evidence.length,
      icon: Lock,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10 border-indigo-500/20",
    },
    {
      label: "SOS Events",
      val: sosHistory.length,
      icon: Shield,
      color: "text-violet-400",
      bg: "bg-violet-500/10 border-violet-500/20",
    },
    {
      label: "Guardians",
      val: guardians.length,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "Feed Posts",
      val: feedPosts.length,
      icon: MessageSquare,
      color: "text-pink-400",
      bg: "bg-pink-500/10 border-pink-500/20",
    },
    {
      label: "Check-In Success",
      val:
        checkIns.length > 0
          ? `${Math.round((arrivedCheckIns / checkIns.length) * 100)}%`
          : "0%",
      icon: CheckCircle,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10 border-cyan-500/20",
    },
  ];

  return (
    <AppShell activePage="analytics">
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">Safety Analytics</h1>
            <p className="text-gray-400 text-sm mt-1">
              Real data from your safety activity — no placeholders
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Date filter */}
            <div className="flex gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/5">
              {["today", "week", "month", "all"].map((f) => (
                <button
                  key={f}
                  onClick={() => setDateFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${dateFilter === f ? "bg-violet-600 text-white" : "text-gray-500 hover:text-gray-300"}`}
                >
                  {f === "all"
                    ? "All Time"
                    : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <button
              onClick={fetchData}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <StatCard key={i} loading={loading} {...s} />
          ))}
        </div>

        {/* Overall safety score */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-600/15 to-pink-600/5 border border-violet-500/20 flex items-center gap-6 flex-wrap">
          <div className="text-center">
            <div className="text-4xl font-black bg-gradient-to-br from-violet-400 to-pink-400 bg-clip-text text-transparent">
              {loading ? "…" : totalScore}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">Safety Score</div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>Overall Activity Score</span>
              <span>{totalScore}/100</span>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all duration-1000"
                style={{ width: `${totalScore}%` }}
              />
            </div>
          </div>
          <div className="flex-shrink-0">
            <a
              href="/profile"
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition-all block"
            >
              View Safety DNA →
            </a>
          </div>
        </div>

        {/* Charts grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* 7-day activity */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <h2 className="font-bold text-white mb-1 flex items-center gap-2">
              <BarChart3 size={16} className="text-violet-400" /> 7-Day Activity
            </h2>
            <p className="text-xs text-gray-500 mb-5">
              Total safety actions per day from all features
            </p>
            {loading ? (
              <div className="h-32 flex items-center justify-center text-gray-600 text-sm">
                Loading…
              </div>
            ) : (
              <WeekChart data={last7} />
            )}
          </div>

          {/* Danger distribution */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <h2 className="font-bold text-white mb-5 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-400" /> Risk Level
              Distribution
            </h2>
            {reports.length === 0 ? (
              <div className="text-center py-8 text-gray-600 text-sm">
                No reports yet. Submit safety reports from the map.
              </div>
            ) : (
              <div className="space-y-5">
                {[
                  {
                    label: "High Risk",
                    count: dangerCounts.high,
                    color: "#ef4444",
                    bg: "rgba(239,68,68,0.15)",
                  },
                  {
                    label: "Medium Risk",
                    count: dangerCounts.medium,
                    color: "#f59e0b",
                    bg: "rgba(245,158,11,0.15)",
                  },
                  {
                    label: "Safe / Low Risk",
                    count: dangerCounts.low,
                    color: "#10b981",
                    bg: "rgba(16,185,129,0.15)",
                  },
                ].map((d) => (
                  <div key={d.label}>
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ background: d.color }}
                        />
                        <span className="text-xs text-gray-300 font-medium">
                          {d.label}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 font-bold">
                        {d.count} / {reports.length}
                      </span>
                    </div>
                    <Bar
                      value={d.count}
                      max={Math.max(reports.length, 1)}
                      color={d.color}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Report categories */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <h2 className="font-bold text-white mb-5 flex items-center gap-2">
              <MapPin size={16} className="text-cyan-400" /> Incident Categories
            </h2>
            {catData.length === 0 ? (
              <div className="text-center py-8 text-gray-600 text-sm">
                No reports yet. File safety reports from the Safety Map.
              </div>
            ) : (
              <div className="space-y-4">
                {catData.map(([label, count]) => (
                  <div key={label}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs text-gray-300 font-medium capitalize">
                        {label}
                      </span>
                      <span className="text-xs text-gray-500">{count}</span>
                    </div>
                    <Bar value={count} max={maxCat} color="#22d3ee" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Walk stats */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <h2 className="font-bold text-white mb-5 flex items-center gap-2">
              <Footprints size={16} className="text-emerald-400" /> Walk &
              Check-In Stats
            </h2>
            <div className="space-y-5">
              {[
                {
                  label: "Walks Completed Safely",
                  count: safeWalks,
                  total: walks.length,
                  color: "#10b981",
                },
                {
                  label: "Alerts Triggered",
                  count: alertedWalks,
                  total: Math.max(walks.length, 1),
                  color: "#ef4444",
                },
                {
                  label: "Check-Ins Confirmed",
                  count: arrivedCheckIns,
                  total: Math.max(checkIns.length, 1),
                  color: "#22d3ee",
                },
                {
                  label: "Evidence Uploads",
                  count: evidence.length,
                  total: Math.max(evidence.length, 1),
                  color: "#8b5cf6",
                },
              ].map((d) => (
                <div key={d.label}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs text-gray-300 font-medium">
                      {d.label}
                    </span>
                    <span className="text-xs text-gray-500 font-bold">
                      {d.count} / {d.total}
                    </span>
                  </div>
                  <Bar
                    value={d.count}
                    max={Math.max(d.total, 1)}
                    color={d.color}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-600/10 to-pink-600/5 border border-violet-500/20">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Zap size={16} className="text-yellow-400" /> AI Safety Insights
            </h2>
            <button
              onClick={generateInsight}
              disabled={loadingInsight || loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition-all disabled:opacity-50"
            >
              {loadingInsight ? (
                <>
                  <RefreshCw
                    size={11}
                    style={{ animation: "spin 1s linear infinite" }}
                  />{" "}
                  Generating…
                </>
              ) : (
                <>
                  <Zap size={11} /> Generate AI Insights
                </>
              )}
            </button>
          </div>

          {aiInsight ? (
            <div className="grid sm:grid-cols-3 gap-4">
              {aiInsight.map((insight, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-white/5 border border-white/5"
                >
                  <div className="text-xs font-bold text-violet-400 mb-2">
                    💡 Insight {i + 1}
                  </div>
                  <div className="text-sm text-gray-200 leading-relaxed">
                    {insight}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-4 gap-4 text-center">
              {[
                { val: reports.length, label: "Total Reports Filed" },
                {
                  val: feedPosts.filter((p) => p.upvotes > 0).length,
                  label: "Verified Posts",
                },
                { val: checkIns.length, label: "Check-Ins Scheduled" },
                { val: sosHistory.length, label: "SOS Activations" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="p-4 rounded-xl bg-white/5 border border-white/5"
                >
                  <div className="text-2xl font-black text-white mb-1">
                    {loading ? "…" : s.val}
                  </div>
                  <div className="text-[10px] text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes anaIn { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        @keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
      `}</style>
    </AppShell>
  );
}
