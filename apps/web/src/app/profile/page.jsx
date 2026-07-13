"use client";
import { useState, useEffect } from "react";
import {
  Shield,
  Zap,
  Award,
  Star,
  TrendingUp,
  Target,
  Footprints,
  MessageSquare,
  Lock,
  Clock,
  AlertOctagon,
  RefreshCw,
  User,
  CheckCircle,
  X,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import useUser from "@/utils/useUser";

const BADGES = [
  {
    id: "first_walk",
    icon: "🚶‍♀️",
    name: "First Walk",
    desc: "Completed your first Walk With Me session",
    color: "emerald",
  },
  {
    id: "community_hero",
    icon: "🦸‍♀️",
    name: "Community Hero",
    desc: "Posted 5+ safety alerts to the community",
    color: "pink",
  },
  {
    id: "vault_keeper",
    icon: "🔐",
    name: "Vault Keeper",
    desc: "Uploaded evidence to your secure vault",
    color: "indigo",
  },
  {
    id: "guardian_angel",
    icon: "👼",
    name: "Guardian Angel",
    desc: "Added 2+ guardians to your network",
    color: "blue",
  },
  {
    id: "check_in_pro",
    icon: "✅",
    name: "Check-In Pro",
    desc: "Successfully completed 3+ check-ins",
    color: "amber",
  },
  {
    id: "safety_reporter",
    icon: "📋",
    name: "Safety Reporter",
    desc: "Filed your first community safety report",
    color: "cyan",
  },
  {
    id: "sos_ready",
    icon: "🆘",
    name: "SOS Ready",
    desc: "Activated SOS or set up emergency network",
    color: "red",
  },
  {
    id: "shield_level_2",
    icon: "🛡️",
    name: "Shield Level 2",
    desc: "Used 5+ different safety features",
    color: "violet",
  },
];

const COLOR_MAP = {
  emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  pink: "bg-pink-500/10 border-pink-500/20 text-pink-400",
  indigo: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
  blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  cyan: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
  red: "bg-red-500/10 border-red-500/20 text-red-400",
  violet: "bg-violet-500/10 border-violet-500/20 text-violet-400",
};

const TRAIT_ICONS = {
  "Proactive Safety": Target,
  "Community Engagement": MessageSquare,
  "Emergency Preparedness": Shield,
  "Check-In Consistency": Clock,
  "Evidence Collection": Lock,
  "Guardian Network": User,
};
const TRAIT_COLORS = {
  "Proactive Safety": "bg-violet-500",
  "Community Engagement": "bg-pink-500",
  "Emergency Preparedness": "bg-emerald-500",
  "Check-In Consistency": "bg-amber-500",
  "Evidence Collection": "bg-indigo-500",
  "Guardian Network": "bg-blue-500",
};

export default function ProfilePage() {
  const { data: user } = useUser();
  const [reports, setReports] = useState([]);
  const [walks, setWalks] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [vault, setVault] = useState([]);
  const [feedPosts, setFeedPosts] = useState([]);
  const [guardians, setGuardians] = useState([]);
  const [dna, setDna] = useState(null);
  const [generatingDna, setGeneratingDna] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dnaError, setDnaError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/reports").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/walk").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/checkin").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/evidence").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/feed").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/guardians").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/safety-dna").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([rep, wlk, chk, ev, feed, grd, dnaData]) => {
        if (Array.isArray(rep)) setReports(rep);
        if (Array.isArray(wlk)) setWalks(wlk);
        if (Array.isArray(chk)) setCheckIns(chk);
        if (Array.isArray(ev)) setVault(ev);
        if (Array.isArray(feed)) setFeedPosts(feed);
        if (Array.isArray(grd)) setGuardians(grd);
        if (dnaData && dnaData.id) setDna(dnaData);
      })
      .catch((err) => {
        console.warn("Profile activity APIs unavailable, using defaults:", err);
        setError(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const generateDna = async () => {
    setGeneratingDna(true);
    setDnaError(null);
    setError(null);
    try {
      const res = await fetch("/api/safety-dna", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "insufficient_data") {
          setDnaError(data.message);
        } else {
          setDnaError(data.error || "Generation failed. Please try again.");
        }
        return;
      }
      setDna(data);
      setSuccess("✓ Safety DNA generated successfully!");
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      console.error(err);
      setDnaError("Could not connect to AI service. Please try again.");
    } finally {
      setGeneratingDna(false);
    }
  };

  // Badges based on real data
  const earnedBadgeIds = new Set();
  if (walks.length > 0) earnedBadgeIds.add("first_walk");
  if (feedPosts.length >= 5) earnedBadgeIds.add("community_hero");
  if (vault.length > 0) earnedBadgeIds.add("vault_keeper");
  if (guardians.length >= 2) earnedBadgeIds.add("guardian_angel");
  if (reports.length > 0) earnedBadgeIds.add("safety_reporter");
  if (checkIns.filter((c) => c.status === "arrived").length >= 3)
    earnedBadgeIds.add("check_in_pro");
  if (earnedBadgeIds.size >= 3) earnedBadgeIds.add("shield_level_2");

  // Score: use AI-generated DNA score or compute locally
  const displayScore =
    dna?.score ??
    Math.min(
      Math.round(
        (reports.length * 8 +
          walks.length * 12 +
          checkIns.length * 10 +
          vault.length * 15 +
          feedPosts.length * 5 +
          earnedBadgeIds.size * 7) /
          5 +
          40,
      ),
      100,
    );
  const displayLevel =
    displayScore >= 80
      ? "Expert"
      : displayScore >= 60
        ? "Advanced"
        : displayScore >= 40
          ? "Intermediate"
          : "Beginner";

  // Traits: from AI DNA or computed from real data
  const traitsToShow = dna?.traits
    ? Object.entries(dna.traits)
    : [
        [
          "Proactive Safety",
          Math.min(100, 40 + walks.length * 8 + checkIns.length * 5),
        ],
        [
          "Community Engagement",
          Math.min(100, 20 + feedPosts.length * 12 + reports.length * 6),
        ],
        [
          "Emergency Preparedness",
          Math.min(
            100,
            50 + (vault.length > 0 ? 15 : 0) + guardians.length * 8,
          ),
        ],
        [
          "Check-In Consistency",
          checkIns.length === 0
            ? 0
            : Math.min(
                100,
                Math.round(
                  (checkIns.filter((c) => c.status === "arrived").length /
                    checkIns.length) *
                    100,
                ),
              ),
        ],
        ["Evidence Collection", Math.min(100, vault.length * 20)],
        ["Guardian Network", Math.min(100, guardians.length * 25)],
      ];

  return (
    <AppShell activePage="profile">
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white">Safety DNA Profile</h1>
          <p className="text-gray-400 text-sm mt-1">
            AI-powered personal safety analysis from your real activity data
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between gap-3">
            <span>{error}</span>
            <button onClick={() => setError(null)}>
              <X size={14} />
            </button>
          </div>
        )}
        {success && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            {success}
          </div>
        )}

        {/* Profile card */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-violet-600/20 to-pink-600/10 border border-violet-500/20 flex flex-col md:flex-row items-center gap-6">
          <div className="relative flex-shrink-0">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-black text-4xl shadow-xl shadow-violet-500/30">
              {user?.name ? user.name[0].toUpperCase() : "S"}
            </div>
            <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-emerald-500 border-2 border-[#050508] flex items-center justify-center">
              <Shield size={14} className="text-white" />
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-black text-white mb-1">
              {user?.name || "SHEild User"}
            </h2>
            <div className="text-sm text-gray-400 mb-4">{user?.email}</div>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-400 text-xs font-bold">
                <Zap size={11} /> Safety Level: {displayLevel}
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <Award size={11} /> {earnedBadgeIds.size} Badges Earned
              </div>
              {dna && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
                  <CheckCircle size={11} /> AI DNA Generated
                </div>
              )}
            </div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-black bg-gradient-to-br from-violet-400 to-pink-400 bg-clip-text text-transparent">
              {loading ? "…" : displayScore}
            </div>
            <div className="text-xs text-gray-500 mt-1">Safety DNA Score</div>
            <div className="mt-2 h-2 w-24 bg-white/5 rounded-full overflow-hidden mx-auto">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all duration-1000"
                style={{ width: `${displayScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[
            {
              val: reports.length,
              label: "Reports",
              icon: AlertOctagon,
              color: "text-red-400",
            },
            {
              val: walks.length,
              label: "Walks",
              icon: Footprints,
              color: "text-emerald-400",
            },
            {
              val: checkIns.length,
              label: "Check-Ins",
              icon: Clock,
              color: "text-amber-400",
            },
            {
              val: vault.length,
              label: "Evidence",
              icon: Lock,
              color: "text-indigo-400",
            },
            {
              val: guardians.length,
              label: "Guardians",
              icon: User,
              color: "text-blue-400",
            },
            {
              val: feedPosts.length,
              label: "Posts",
              icon: MessageSquare,
              color: "text-pink-400",
            },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center"
              >
                <Icon size={16} className={`${s.color} mx-auto mb-2`} />
                <div className="text-xl font-black text-white">
                  {loading ? "…" : s.val}
                </div>
                <div className="text-[10px] text-gray-500">{s.label}</div>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* DNA Traits */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <h2 className="font-bold text-white mb-5 flex items-center gap-2">
              <TrendingUp size={16} className="text-violet-400" /> Safety DNA
              Traits
              {dna && (
                <span className="ml-auto text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                  AI Generated
                </span>
              )}
            </h2>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-8 rounded bg-white/[0.03]" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {traitsToShow.map(([label, score]) => {
                  const Icon = TRAIT_ICONS[label] || Shield;
                  const barColor = TRAIT_COLORS[label] || "bg-violet-500";
                  const numScore =
                    typeof score === "number"
                      ? Math.min(100, Math.max(0, Math.round(score)))
                      : parseInt(score) || 0;
                  return (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Icon size={12} className="text-gray-400" />
                          <span className="text-xs text-gray-300 font-medium">
                            {label}
                          </span>
                        </div>
                        <span className="text-xs font-black text-white">
                          {numScore}
                        </span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${barColor} transition-all duration-1000`}
                          style={{ width: `${numScore}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* AI DNA Analysis */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col">
            <h2 className="font-bold text-white mb-4 flex items-center gap-2">
              <Zap size={16} className="text-yellow-400" /> AI Safety DNA
              Analysis
            </h2>

            {dnaError && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm mb-4">
                {dnaError}
              </div>
            )}

            {dna?.ai_analysis ? (
              <div className="flex-1 flex flex-col gap-3">
                <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/20 text-sm text-gray-200 leading-relaxed">
                  {dna.ai_analysis}
                </div>
                {dna.strengths?.length > 0 && (
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                    <div className="text-xs font-bold text-emerald-400 mb-2">
                      ✓ Your Strengths
                    </div>
                    {dna.strengths.map((s, i) => (
                      <div key={i} className="text-xs text-gray-300 mb-1">
                        • {s}
                      </div>
                    ))}
                  </div>
                )}
                {dna.weaknesses?.length > 0 && (
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <div className="text-xs font-bold text-amber-400 mb-2">
                      ⚡ Areas to Improve
                    </div>
                    {dna.weaknesses.map((w, i) => (
                      <div key={i} className="text-xs text-gray-300 mb-1">
                        • {w}
                      </div>
                    ))}
                  </div>
                )}
                {dna.recommendations?.length > 0 && (
                  <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                    <div className="text-xs font-bold text-blue-400 mb-2">
                      🎯 Recommendations
                    </div>
                    {dna.recommendations.map((r, i) => (
                      <div key={i} className="text-xs text-gray-300 mb-1">
                        • {r}
                      </div>
                    ))}
                  </div>
                )}
                <div className="text-[10px] text-gray-600">
                  Generated:{" "}
                  {dna.created_at
                    ? new Date(dna.created_at).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                      }) + " IST"
                    : "Recently"}
                </div>
                <button
                  onClick={generateDna}
                  disabled={generatingDna}
                  className="w-full py-2.5 rounded-xl border border-white/10 text-gray-400 font-bold text-xs hover:bg-white/5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {generatingDna ? (
                    <>
                      <RefreshCw
                        size={11}
                        style={{ animation: "spin 1s linear infinite" }}
                      />{" "}
                      Regenerating…
                    </>
                  ) : (
                    <>
                      <RefreshCw size={11} /> Regenerate DNA
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-6 gap-4">
                <div className="h-16 w-16 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <Zap size={28} className="text-violet-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm mb-1">
                    Generate Your Safety DNA
                  </p>
                  <p className="text-gray-400 text-xs leading-relaxed max-w-xs mx-auto">
                    Our Gemini AI will analyze your real activity data — walks,
                    check-ins, reports, guardians — and generate a personalized
                    safety profile.
                  </p>
                </div>
                {!loading &&
                  reports.length +
                    walks.length +
                    checkIns.length +
                    vault.length +
                    guardians.length ===
                    0 && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs w-full text-left">
                      💡 Not enough activity data yet. Use the app more to
                      generate your Safety DNA. Try: add a guardian, complete a
                      walk, or schedule a check-in.
                    </div>
                  )}
                <button
                  onClick={generateDna}
                  disabled={generatingDna || loading}
                  className="px-8 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {generatingDna ? (
                    <>
                      <RefreshCw
                        size={14}
                        style={{ animation: "spin 1s linear infinite" }}
                      />{" "}
                      Analyzing with AI…
                    </>
                  ) : (
                    "Generate My Safety DNA"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Badges */}
        <div>
          <h2 className="font-bold text-white mb-5 flex items-center gap-2">
            <Star size={16} className="text-yellow-400" /> Safety Achievements (
            {earnedBadgeIds.size}/{BADGES.length})
          </h2>
          {!loading && earnedBadgeIds.size === 0 && (
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center text-sm text-gray-500 mb-4">
              No badges earned yet. Complete walks, add guardians, upload
              evidence, and file reports to unlock achievements.
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {BADGES.map((badge, i) => {
              const earned = earnedBadgeIds.has(badge.id);
              const cls = COLOR_MAP[badge.color];
              return (
                <div
                  key={badge.id}
                  className={`p-5 rounded-2xl border transition-all ${earned ? `${cls} shadow-lg` : "bg-white/[0.01] border-white/5 opacity-40"}`}
                  style={{ animation: `badgeIn 0.4s ${i * 0.06}s ease both` }}
                >
                  <div
                    className="text-3xl mb-3 text-center"
                    style={earned ? {} : { filter: "grayscale(100%)" }}
                  >
                    {badge.icon}
                  </div>
                  <div className="text-sm font-bold text-white text-center mb-1">
                    {badge.name}
                  </div>
                  <div className="text-[10px] text-gray-500 text-center leading-relaxed">
                    {badge.desc}
                  </div>
                  {earned && (
                    <div className="mt-3 text-center text-[10px] font-black text-emerald-400 uppercase tracking-wider">
                      ✓ Earned
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes badgeIn { from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)} }
        @keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
      `}</style>
    </AppShell>
  );
}
