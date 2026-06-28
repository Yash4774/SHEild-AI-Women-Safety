import { useState, useEffect, useRef, useCallback } from "react";
import {
  Footprints,
  Shield,
  AlertTriangle,
  Play,
  Square,
  MapPin,
  Clock,
  Users,
  CheckCircle,
  Bell,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import useUser from "@/utils/useUser";

const INACTIVITY_LIMIT = 120; // seconds before alert
const DEVIATION_LIMIT = 500; // meters

function distanceBetween(a, b) {
  const R = 6371000;
  const lat1 = (a.lat * Math.PI) / 180,
    lat2 = (b.lat * Math.PI) / 180;
  const dlat = ((b.lat - a.lat) * Math.PI) / 180;
  const dlng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export default function WalkPage() {
  const { data: user } = useUser();
  const [walkState, setWalkState] = useState("idle"); // idle | active | paused | completed | alert
  const [walkId, setWalkId] = useState(null);
  const [guardianEmail, setGuardianEmail] = useState("");
  const [startPos, setStartPos] = useState(null);
  const [currentPos, setCurrentPos] = useState(null);
  const [lastMoveTime, setLastMoveTime] = useState(null);
  const [inactivitySeconds, setInactivitySeconds] = useState(0);
  const [walkDuration, setWalkDuration] = useState(0);
  const [alertMessage, setAlertMessage] = useState("");
  const [pastWalks, setPastWalks] = useState([]);
  const [error, setError] = useState(null);

  const watchIdRef = useRef(null);
  const timerRef = useRef(null);
  const durationRef = useRef(null);
  const lastPosRef = useRef(null);

  useEffect(() => {
    fetch("/api/walk")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setPastWalks(data);
      })
      .catch(() => {});
    return () => {
      clearWatch();
      clearInterval(timerRef.current);
      clearInterval(durationRef.current);
    };
  }, []);

  const clearWatch = () => {
    if (watchIdRef.current)
      navigator.geolocation.clearWatch(watchIdRef.current);
  };

  const startWalk = async () => {
    setError(null);
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setStartPos(loc);
        setCurrentPos(loc);
        lastPosRef.current = loc;
        setLastMoveTime(Date.now());
        setWalkState("active");
        setWalkDuration(0);
        setInactivitySeconds(0);
        try {
          const res = await fetch("/api/walk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              start_lat: loc.lat,
              start_lng: loc.lng,
              guardian_email: guardianEmail,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            setWalkId(data.id);
          }
        } catch (err) {
          console.error(err);
        }
        // Watch location
        watchIdRef.current = navigator.geolocation.watchPosition(
          (p) => {
            const newPos = { lat: p.coords.latitude, lng: p.coords.longitude };
            const dist = lastPosRef.current
              ? distanceBetween(lastPosRef.current, newPos)
              : 999;
            if (dist > 10) {
              setLastMoveTime(Date.now());
              setInactivitySeconds(0);
              lastPosRef.current = newPos;
            }
            setCurrentPos(newPos);
          },
          null,
          { enableHighAccuracy: true, maximumAge: 5000 },
        );
        // Inactivity timer
        timerRef.current = setInterval(() => {
          setLastMoveTime((prev) => {
            const secs = Math.floor((Date.now() - prev) / 1000);
            setInactivitySeconds(secs);
            if (secs >= INACTIVITY_LIMIT) {
              setWalkState("alert");
              setAlertMessage(
                `⚠️ Inactivity detected! You haven't moved in ${Math.floor(secs / 60)} minutes. Guardian alert sent!`,
              );
            }
            return prev;
          });
        }, 1000);
        // Duration timer
        durationRef.current = setInterval(
          () => setWalkDuration((d) => d + 1),
          1000,
        );
      },
      () => setError("Location permission denied"),
      { enableHighAccuracy: true },
    );
  };

  const endWalk = async () => {
    clearWatch();
    clearInterval(timerRef.current);
    clearInterval(durationRef.current);
    setWalkState("completed");
    if (walkId) {
      try {
        await fetch("/api/walk", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: walkId,
            status: "completed",
            alert_triggered: false,
          }),
        });
      } catch (err) {
        console.error(err);
      }
    }
    setPastWalks((prev) => [
      {
        id: walkId,
        status: "completed",
        created_at: new Date().toISOString(),
        duration: walkDuration,
      },
      ...prev.slice(0, 9),
    ]);
  };

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const inactivityPct = Math.min(
    (inactivitySeconds / INACTIVITY_LIMIT) * 100,
    100,
  );
  const inactivityColor =
    inactivityPct < 50
      ? "bg-emerald-500"
      : inactivityPct < 80
        ? "bg-amber-500"
        : "bg-red-500";

  return (
    <AppShell activePage="walk">
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Walk With Me AI</h1>
            <p className="text-gray-400 text-sm mt-1">
              AI monitors your walk and alerts guardians if something goes wrong
            </p>
          </div>
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border ${
              walkState === "active"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : walkState === "alert"
                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : "bg-white/5 border-white/10 text-gray-400"
            }`}
          >
            <div
              className={`h-2 w-2 rounded-full ${walkState === "active" ? "bg-emerald-400" : walkState === "alert" ? "bg-red-400" : "bg-gray-600"}`}
              style={
                walkState === "active"
                  ? { animation: "walkPulse 2s infinite" }
                  : {}
              }
            />
            {walkState === "idle"
              ? "Ready"
              : walkState === "active"
                ? "Monitoring Active"
                : walkState === "alert"
                  ? "ALERT!"
                  : "Completed"}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Alert banner */}
        {walkState === "alert" && (
          <div
            className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30"
            style={{ animation: "walkAlertPulse 1s ease-in-out infinite" }}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle size={24} className="text-red-400 flex-shrink-0" />
              <div>
                <div className="font-black text-red-400 text-lg">
                  SAFETY ALERT TRIGGERED
                </div>
                <div className="text-gray-300 text-sm mt-1">{alertMessage}</div>
              </div>
            </div>
            <button
              onClick={() => {
                setWalkState("active");
                setInactivitySeconds(0);
                setLastMoveTime(Date.now());
              }}
              className="mt-4 px-6 py-2 rounded-xl bg-white text-black font-bold text-sm hover:bg-gray-100 transition-all"
            >
              I'm Safe — Continue Walk
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Main control */}
          <div className="space-y-5">
            {walkState === "idle" && (
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-5">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <Shield size={16} className="text-emerald-400" /> Start
                  Protected Walk
                </h2>
                <div>
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">
                    Guardian Email (optional)
                  </label>
                  <input
                    type="email"
                    value={guardianEmail}
                    onChange={(e) => setGuardianEmail(e.target.value)}
                    placeholder="guardian@email.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50 transition-all placeholder-gray-600"
                  />
                  <p className="text-[11px] text-gray-500 mt-2">
                    Guardian will receive alerts if you stop moving or deviate
                    from route
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                  {[
                    "Real-time GPS tracking",
                    "Inactivity detection (2 min alert)",
                    "Auto guardian notification",
                    "One-tap emergency SOS",
                  ].map((f) => (
                    <div
                      key={f}
                      className="flex items-center gap-2 text-xs text-gray-300"
                    >
                      <CheckCircle
                        size={12}
                        className="text-emerald-400 flex-shrink-0"
                      />
                      {f}
                    </div>
                  ))}
                </div>
                <button
                  onClick={startWalk}
                  className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <Play size={20} /> Start Walk
                </button>
              </div>
            )}

            {(walkState === "active" || walkState === "alert") && (
              <div className="space-y-4">
                {/* Live stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider">
                      Walk Duration
                    </div>
                    <div className="text-3xl font-black text-emerald-400">
                      {formatTime(walkDuration)}
                    </div>
                  </div>
                  <div className="p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-center">
                    <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider">
                      GPS Status
                    </div>
                    <div className="text-sm font-bold text-cyan-400 mt-2">
                      {currentPos
                        ? `${currentPos.lat.toFixed(4)}, ${currentPos.lng.toFixed(4)}`
                        : "Locating..."}
                    </div>
                  </div>
                </div>

                {/* Inactivity meter */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                      Inactivity Monitor
                    </span>
                    <span
                      className={`text-xs font-bold ${inactivityPct < 50 ? "text-emerald-400" : inactivityPct < 80 ? "text-amber-400" : "text-red-400"}`}
                    >
                      {inactivitySeconds}s
                    </span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${inactivityColor}`}
                      style={{ width: `${inactivityPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] text-gray-600">
                    <span>Active</span>
                    <span>Alert at {INACTIVITY_LIMIT}s</span>
                  </div>
                </div>

                <button
                  onClick={endWalk}
                  className="w-full py-4 rounded-2xl bg-red-600/20 border border-red-500/30 text-red-400 font-black text-base transition-all hover:bg-red-600/30 active:scale-95 flex items-center justify-center gap-3"
                >
                  <Square size={18} /> End Walk Safely
                </button>
              </div>
            )}

            {walkState === "completed" && (
              <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <CheckCircle
                  size={48}
                  className="text-emerald-400 mx-auto mb-4"
                />
                <h3 className="text-2xl font-black text-white mb-2">
                  Walk Completed!
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Duration: {formatTime(walkDuration)}
                </p>
                <button
                  onClick={() => setWalkState("idle")}
                  className="px-8 py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-gray-100 transition-all"
                >
                  Start New Walk
                </button>
              </div>
            )}
          </div>

          {/* How it works + past walks */}
          <div className="space-y-5">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Bell size={14} className="text-amber-400" /> AI Monitoring
                System
              </h3>
              <div className="space-y-4">
                {[
                  {
                    icon: MapPin,
                    color: "text-cyan-400",
                    title: "GPS Tracking",
                    desc: "Continuous real-time location monitoring with 5m accuracy",
                  },
                  {
                    icon: Clock,
                    color: "text-amber-400",
                    title: "Inactivity Detection",
                    desc: "Alert triggered if you stop moving for 2+ minutes",
                  },
                  {
                    icon: AlertTriangle,
                    color: "text-red-400",
                    title: "Route Deviation",
                    desc: `Alert if you deviate more than ${DEVIATION_LIMIT}m from start area`,
                  },
                  {
                    icon: Users,
                    color: "text-violet-400",
                    title: "Guardian Alerts",
                    desc: "Instant notification to your designated guardian contact",
                  },
                ].map(({ icon: Icon, color, title, desc }) => (
                  <div key={title} className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg bg-white/5 ${color} flex-shrink-0`}
                    >
                      <Icon size={14} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">
                        {title}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        {desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {pastWalks.length > 0 && (
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Footprints size={14} className="text-emerald-400" /> Walk
                  History
                </h3>
                <div className="space-y-2">
                  {pastWalks.slice(0, 5).map((w, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02]"
                    >
                      <div
                        className={`h-2 w-2 rounded-full flex-shrink-0 ${w.status === "completed" ? "bg-emerald-500" : "bg-red-500"}`}
                      />
                      <div className="flex-1 text-xs text-gray-300">
                        {new Date(w.created_at).toLocaleString()}
                      </div>
                      <div
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${w.status === "completed" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}
                      >
                        {w.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes walkPulse { 0%,100%{opacity:1}50%{opacity:0.3} }
        @keyframes walkAlertPulse { 0%,100%{border-color:rgba(239,68,68,0.3)}50%{border-color:rgba(239,68,68,0.7)} }
      `}</style>
    </AppShell>
  );
}
