import { useState, useEffect, useCallback } from "react";
import {
  APIProvider,
  Map,
  Marker,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import {
  MapPin,
  Zap,
  AlertTriangle,
  CheckCircle,
  Search,
  Plus,
  X,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import useUser from "@/utils/useUser";

const RISK_COLORS = { high: "#ef4444", medium: "#f59e0b", low: "#10b981" };
const RISK_LABELS = {
  high: "🔴 High Risk",
  medium: "🟡 Medium Risk",
  low: "🟢 Safe Zone",
};

// IST time helper
function getIST() {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(ist.getUTCDate())}/${pad(ist.getUTCMonth() + 1)}/${ist.getUTCFullYear()} ${pad(ist.getUTCHours())}:${pad(ist.getUTCMinutes())} IST`;
}

export default function MapPage() {
  const { data: user } = useUser();
  const mapsApiKey = import.meta.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const [center, setCenter] = useState({ lat: 28.6139, lng: 77.209 }); // New Delhi default
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [clickedPos, setClickedPos] = useState(null);
  const [clickScore, setClickScore] = useState(null);
  const [loadingScore, setLoadingScore] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [newReport, setNewReport] = useState({
    description: "",
    category: "harassment",
    danger_level: "medium",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [gpsStatus, setGpsStatus] = useState("acquiring"); // acquiring | connected | denied
  const [cityName, setCityName] = useState("");

  useEffect(() => {
    if (navigator.geolocation) {
      setGpsStatus("acquiring");
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGpsStatus("connected");
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&zoom=10&accept-language=en`,
            );
            if (res.ok) {
              const data = await res.json();
              const city =
                data.address?.city ||
                data.address?.town ||
                data.address?.state_district ||
                "";
              const state = data.address?.state || "";
              setCityName([city, state].filter(Boolean).join(", "));
            }
          } catch {}
        },
        () => setGpsStatus("denied"),
        { enableHighAccuracy: true, timeout: 10000 },
      );
    } else {
      setGpsStatus("denied");
    }
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/reports");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) setReports(data);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Failed to load safety reports");
    }
  };

  const handleMapClick = useCallback(
    async (e) => {
      const lat = e.detail.latLng.lat,
        lng = e.detail.latLng.lng;
      setClickedPos({ lat, lng });
      setClickScore(null);
      setLoadingScore(true);
      try {
        const res = await fetch("/api/safety-score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            origin: "current location",
            destination: `${lat},${lng}`,
            time: getIST(),
            current_reports: reports,
          }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setClickScore(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingScore(false);
      }
    },
    [reports],
  );

  const submitReport = async () => {
    if (!newReport.description) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newReport,
          location_lat: center.lat,
          location_lng: center.lng,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setShowReportForm(false);
      setNewReport({
        description: "",
        category: "harassment",
        danger_level: "medium",
      });
      fetchReports();
    } catch (err) {
      console.error(err);
      setError("Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  const scoreColor = clickScore
    ? clickScore.score >= 70
      ? "text-emerald-400"
      : clickScore.score >= 40
        ? "text-amber-400"
        : "text-red-400"
    : "";
  const scoreBg = clickScore
    ? clickScore.score >= 70
      ? "bg-emerald-500"
      : clickScore.score >= 40
        ? "bg-amber-500"
        : "bg-red-500"
    : "";

  const gpsCfg =
    gpsStatus === "connected"
      ? {
          label: cityName || "GPS Connected",
          color: "#10b981",
          bg: "rgba(16,185,129,0.12)",
          border: "rgba(16,185,129,0.3)",
          pulse: false,
        }
      : gpsStatus === "acquiring"
        ? {
            label: "Acquiring GPS...",
            color: "#f59e0b",
            bg: "rgba(245,158,11,0.12)",
            border: "rgba(245,158,11,0.3)",
            pulse: true,
          }
        : {
            label: "Enable Location",
            color: "#ef4444",
            bg: "rgba(239,68,68,0.12)",
            border: "rgba(239,68,68,0.3)",
            pulse: false,
          };

  return (
    <AppShell activePage="map">
      <div
        className="flex flex-col h-full"
        style={{ height: "calc(100vh - 64px)" }}
      >
        {/* Top controls */}
        <div
          className="p-4 border-b border-white/5 flex items-center gap-3 flex-shrink-0 bg-[#08080f]/50"
          style={{ flexWrap: "wrap" }}
        >
          {/* GPS Status badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 12px",
              borderRadius: 9,
              background: gpsCfg.bg,
              border: `1px solid ${gpsCfg.border}`,
              fontSize: 11,
              fontWeight: 700,
              color: gpsCfg.color,
              whiteSpace: "nowrap",
              cursor: gpsStatus === "denied" ? "pointer" : "default",
            }}
            onClick={
              gpsStatus === "denied"
                ? () => window.location.reload()
                : undefined
            }
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: gpsCfg.color,
                animation: gpsCfg.pulse ? "mapPulse 1s infinite" : "none",
              }}
            />
            {gpsCfg.label}
          </div>

          <div className="flex items-center gap-2 text-xs flex-1">
            {[
              { c: "#ef4444", l: "🔴 High Risk" },
              { c: "#f59e0b", l: "🟡 Medium" },
              { c: "#10b981", l: "🟢 Safe Zone" },
            ].map((r) => (
              <div
                key={r.l}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5"
              >
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: r.c }}
                />
                <span className="text-gray-300 text-xs">{r.l}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <MapPin size={12} /> Click any location for AI score
          </div>
          <button
            onClick={() => setShowReportForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition-all active:scale-95"
          >
            <Plus size={14} /> Report Incident
          </button>
        </div>

        {error && (
          <div className="mx-4 mt-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          {/* Map */}
          <div className="flex-1 relative">
            {mapsApiKey ? (
            <APIProvider apiKey={mapsApiKey}>
              <Map
                style={{ width: "100%", height: "100%" }}
                defaultCenter={center}
                defaultZoom={14}
                gestureHandling="greedy"
                disableDefaultUI={false}
                mapTypeControl={false}
                streetViewControl={false}
                colorScheme="DARK"
                onClick={handleMapClick}
              >
                {gpsStatus === "connected" && (
                  <Marker
                    position={center}
                    title={
                      cityName ? `You are here — ${cityName}` : "Your Location"
                    }
                  />
                )}
                {reports.map((report, idx) => (
                  <Marker
                    key={idx}
                    position={{
                      lat: report.location_lat,
                      lng: report.location_lng,
                    }}
                    title={`${RISK_LABELS[report.danger_level]}: ${report.category}`}
                    onClick={() => setSelectedReport(report)}
                  />
                ))}
                {clickedPos && (
                  <Marker
                    position={clickedPos}
                    title={`Analyzed at ${getIST()}`}
                  />
                )}
                {selectedReport && (
                  <InfoWindow
                    position={{
                      lat: selectedReport.location_lat,
                      lng: selectedReport.location_lng,
                    }}
                    onCloseClick={() => setSelectedReport(null)}
                  >
                    <div className="p-2 text-black">
                      <div className="font-bold text-sm mb-1 capitalize">
                        {selectedReport.category} Alert
                      </div>
                      <div className="text-xs text-gray-600 mb-1">
                        {RISK_LABELS[selectedReport.danger_level]}
                      </div>
                      <div className="text-xs">
                        {selectedReport.description}
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </Map>
            </APIProvider>
            ) : (
              <div className="h-full w-full bg-[#08080f] flex items-center justify-center p-6">
                <div className="max-w-md text-center">
                  <MapPin size={44} className="text-violet-400 mx-auto mb-4" />
                  <h3 className="text-white font-black text-lg mb-2">
                    Safety map is ready
                  </h3>
                  <p className="text-gray-400 text-sm leading-6 mb-5">
                    Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable the live Google
                    map. Reports and AI safety scoring still work without it.
                  </p>
                  <button
                    onClick={() => handleMapClick({ detail: { latLng: center } })}
                    className="px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm"
                  >
                    Analyze Current Area
                  </button>
                </div>
              </div>
            )}
            {loadingScore && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl bg-[#08080f]/90 backdrop-blur-xl border border-white/10 text-sm text-gray-300 flex items-center gap-3">
                <div
                  className="h-4 w-4 rounded-full border-2 border-violet-500 border-t-transparent"
                  style={{ animation: "mapSpin 0.8s linear infinite" }}
                />
                Analyzing location safety...
              </div>
            )}
            {gpsStatus === "acquiring" && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-2xl bg-[#08080f]/90 backdrop-blur-xl border border-amber-500/30 text-sm text-amber-400 flex items-center gap-3">
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    border: "2px solid #f59e0b",
                    borderTopColor: "transparent",
                    animation: "mapSpin 0.8s linear infinite",
                  }}
                />
                Acquiring GPS location...
              </div>
            )}
          </div>

          {/* Side panel */}
          {(clickScore || reports.length > 0) && (
            <div className="w-80 border-l border-white/5 bg-[#08080f]/80 backdrop-blur-xl overflow-y-auto flex-shrink-0">
              {clickScore && (
                <div className="p-5 border-b border-white/5">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                    <Zap size={12} className="text-violet-400" /> AI Safety
                    Analysis
                  </h3>
                  <p className="text-[10px] text-gray-600 mb-3">{getIST()}</p>
                  <div className={`text-4xl font-black mb-2 ${scoreColor}`}>
                    {clickScore.score}
                    <span className="text-xl text-gray-600">/100</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full ${scoreBg}`}
                      style={{
                        width: `${clickScore.score}%`,
                        transition: "width 0.8s ease",
                      }}
                    />
                  </div>
                  <div className={`text-xs font-bold mb-4 ${scoreColor}`}>
                    {clickScore.risk_level} Risk Zone
                  </div>
                  {(clickScore.recommendations || [])
                    .slice(0, 3)
                    .map((r, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-xs text-gray-400 mb-2"
                      >
                        <CheckCircle
                          size={10}
                          className="text-emerald-500 mt-0.5 flex-shrink-0"
                        />
                        {r}
                      </div>
                    ))}
                </div>
              )}
              <div className="p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <AlertTriangle size={12} className="text-amber-400" /> Danger
                  Zones ({reports.length})
                </h3>
                <div className="space-y-3">
                  {reports.slice(0, 10).map((r, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setCenter({ lat: r.location_lat, lng: r.location_lng });
                        setSelectedReport(r);
                      }}
                      className="w-full text-left p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className="h-2 w-2 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: RISK_COLORS[r.danger_level],
                          }}
                        />
                        <span className="text-xs font-bold text-white capitalize">
                          {r.category}
                        </span>
                        <span className="ml-auto text-[10px] text-gray-600">
                          {new Date(r.created_at).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 line-clamp-2">
                        {r.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Report modal */}
        {showReportForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#0a0a12] border border-white/10 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-white">
                  Report Incident
                </h2>
                <button
                  onClick={() => setShowReportForm(false)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">
                    Category
                  </label>
                  <select
                    value={newReport.category}
                    onChange={(e) =>
                      setNewReport((p) => ({ ...p, category: e.target.value }))
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50"
                  >
                    <option value="harassment">Harassment</option>
                    <option value="stalking">Stalking</option>
                    <option value="assault">Assault</option>
                    <option value="theft">Theft</option>
                    <option value="unsafe_area">Unsafe Area</option>
                    <option value="poor_lighting">Poor Lighting</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">
                    Danger Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["low", "medium", "high"].map((l) => (
                      <button
                        key={l}
                        onClick={() =>
                          setNewReport((p) => ({ ...p, danger_level: l }))
                        }
                        className={`py-2 rounded-xl text-xs font-bold border transition-all capitalize ${newReport.danger_level === l ? "border-white/30 bg-white/10 text-white" : "border-white/5 text-gray-500 hover:border-white/10"}`}
                      >
                        {l === "low" ? "🟢" : l === "medium" ? "🟡" : "🔴"} {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">
                    Description
                  </label>
                  <textarea
                    value={newReport.description}
                    onChange={(e) =>
                      setNewReport((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe what happened..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 resize-none placeholder-gray-600"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  📍 Using your current location
                  {gpsStatus === "connected" && cityName
                    ? ` — ${cityName}`
                    : ""}
                </p>
                <button
                  onClick={submitReport}
                  disabled={submitting || !newReport.description}
                  className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes mapSpin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        @keyframes mapPulse { 0%,100%{opacity:1}50%{opacity:0.3} }
      `}</style>
    </AppShell>
  );
}
