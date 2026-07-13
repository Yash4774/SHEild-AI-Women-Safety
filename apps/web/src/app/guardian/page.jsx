import { useState, useEffect, useRef } from "react";
import {
  Shield,
  MapPin,
  Clock,
  CheckCircle,
  Users,
  Share2,
  Eye,
  Plus,
  Trash2,
  X,
  Phone,
  Mail,
  MessageCircle,
  Edit3,
  UserPlus,
  AlertTriangle,
} from "lucide-react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import AppShell from "@/components/AppShell";
import useUser from "@/utils/useUser";

const RELATIONSHIPS = [
  "Partner",
  "Family",
  "Friend",
  "Colleague",
  "Neighbor",
  "Other",
];

function AddGuardianModal({ onClose, onAdded }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    relationship: "Friend",
    whatsapp: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!form.phone && !form.email) {
      setError("Provide at least phone or email");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/guardians", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const guardian = await res.json();
      onAdded(guardian);
      onClose();
    } catch (err) {
      setError("Failed to add guardian: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0a0a12] border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <UserPlus size={18} className="text-blue-400" /> Add Guardian
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1.5">
              Full Name *
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Guardian's name"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50 placeholder-gray-600"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1.5">
              Relationship
            </label>
            <select
              value={form.relationship}
              onChange={(e) =>
                setForm((p) => ({ ...p, relationship: e.target.value }))
              }
              className="w-full border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500/50"
              style={{
                background: "#0d0d18",
                color: "#ffffff",
                WebkitAppearance: "menulist",
              }}
            >
              {RELATIONSHIPS.map((r) => (
                <option
                  key={r}
                  value={r}
                  style={{ background: "#0d0d18", color: "#ffffff" }}
                >
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1.5">
              Phone Number
            </label>
            <input
              value={form.phone}
              onChange={(e) =>
                setForm((p) => ({ ...p, phone: e.target.value }))
              }
              placeholder="+91 XXXXX XXXXX"
              type="tel"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50 placeholder-gray-600"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1.5">
              Email Address
            </label>
            <input
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
              placeholder="guardian@email.com"
              type="email"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50 placeholder-gray-600"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1.5">
              WhatsApp Number (optional)
            </label>
            <input
              value={form.whatsapp}
              onChange={(e) =>
                setForm((p) => ({ ...p, whatsapp: e.target.value }))
              }
              placeholder="+91 XXXXX XXXXX"
              type="tel"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50 placeholder-gray-600"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 font-bold text-sm hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Add Guardian"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GuardianPage() {
  const { data: user } = useUser();
  const mapsApiKey = import.meta.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const [guardians, setGuardians] = useState([]);
  const [loadingGuardians, setLoadingGuardians] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [trackingActive, setTrackingActive] = useState(false);
  const [currentPos, setCurrentPos] = useState(null);
  const [posHistory, setPosHistory] = useState([]);
  const [guardianLink, setGuardianLink] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [journeyDuration, setJourneyDuration] = useState(0);
  const [arrived, setArrived] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState("contacts"); // contacts | journey
  const watchRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchGuardians();
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentPos({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {},
      );
    }
    return () => {
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
      clearInterval(timerRef.current);
    };
  }, []);

  const fetchGuardians = async () => {
    setLoadingGuardians(true);
    try {
      const res = await fetch("/api/guardians");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) setGuardians(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load guardians");
    } finally {
      setLoadingGuardians(false);
    }
  };

  const deleteGuardian = async (id) => {
    if (!confirm("Remove this guardian from your network?")) return;
    try {
      const res = await fetch("/api/guardians", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setGuardians((prev) => prev.filter((g) => g.id !== id));
      setSuccess("Guardian removed.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to remove guardian: " + err.message);
    }
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }
    setTrackingActive(true);
    setJourneyDuration(0);
    setPosHistory([]);
    setArrived(false);
    const token = Math.random().toString(36).substring(2, 10);
    setGuardianLink(`${window.location.origin}/track/${token}`);
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCurrentPos(newPos);
        setPosHistory((prev) => [
          ...prev.slice(-50),
          { ...newPos, time: Date.now() },
        ]);
      },
      () => setError("Location access denied"),
      { enableHighAccuracy: true, maximumAge: 5000 },
    );
    timerRef.current = setInterval(
      () => setJourneyDuration((d) => d + 1),
      1000,
    );
    setActiveTab("journey");
  };

  const stopTracking = () => {
    if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
    clearInterval(timerRef.current);
    setTrackingActive(false);
    setArrived(true);
    setSuccess("Journey completed safely! Guardians notified. 🎉");
    setTimeout(() => setSuccess(null), 6000);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(guardianLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    } catch {
      setError("Could not copy link");
    }
  };

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const RELATIONSHIP_COLORS = {
    Partner: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    Family: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    Friend: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    Colleague: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    default: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  };

  return (
    <AppShell activePage="guardian">
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">Guardian Network</h1>
            <p className="text-gray-400 text-sm mt-1">
              Your trusted contacts who monitor your safety in real time
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all active:scale-95"
            >
              <Plus size={16} /> Add Guardian
            </button>
            {!trackingActive ? (
              <button
                onClick={startTracking}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all active:scale-95"
              >
                <Eye size={16} /> Start Journey
              </button>
            ) : (
              <button
                onClick={stopTracking}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all active:scale-95"
                style={{ animation: "grdPulseBtn 1.5s ease infinite" }}
              >
                <CheckCircle size={16} /> I Arrived Safely
              </button>
            )}
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between">
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

        {/* Active journey banner */}
        {trackingActive && (
          <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-4 flex-wrap">
            <div
              className="h-3 w-3 rounded-full bg-blue-400 flex-shrink-0"
              style={{ animation: "grdPulse 1.5s ease infinite" }}
            />
            <div className="flex-1">
              <div className="font-bold text-white text-sm">
                🛣 Journey Active — Live Tracking ON
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                Duration: {formatTime(journeyDuration)} · {posHistory.length}{" "}
                location points captured
              </div>
            </div>
            {guardianLink && (
              <button
                onClick={copyLink}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${linkCopied ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"}`}
              >
                <Share2 size={11} className="inline mr-1.5" />
                {linkCopied ? "Copied!" : "Copy Live Link"}
              </button>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { id: "contacts", label: `Contacts (${guardians.length})` },
            { id: "journey", label: "Journey & Map" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-5 py-2 rounded-xl text-sm font-bold border transition-all ${activeTab === t.id ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "border-white/5 text-gray-500 hover:border-white/10 hover:text-gray-300"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* CONTACTS TAB */}
        {activeTab === "contacts" && (
          <div>
            {loadingGuardians ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-24 rounded-2xl bg-white/[0.02] border border-white/5"
                    style={{
                      animation: "grdShimmer 1.5s infinite",
                      backgroundSize: "200% 100%",
                      backgroundImage:
                        "linear-gradient(90deg,rgba(255,255,255,0.02) 25%,rgba(255,255,255,0.05) 50%,rgba(255,255,255,0.02) 75%)",
                    }}
                  />
                ))}
              </div>
            ) : guardians.length === 0 ? (
              <div className="text-center py-20">
                <Users size={56} className="text-gray-700 mx-auto mb-4" />
                <h3 className="text-white font-bold mb-2 text-xl">
                  No Guardians Yet
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  Add trusted contacts who will be alerted during emergencies
                  and can monitor your journeys.
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all flex items-center gap-2 mx-auto"
                >
                  <UserPlus size={16} /> Add Your First Guardian
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {guardians.map((g, i) => {
                  const clr =
                    RELATIONSHIP_COLORS[g.relationship] ||
                    RELATIONSHIP_COLORS.default;
                  return (
                    <div
                      key={g.id}
                      className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all"
                      style={{ animation: `grdIn 0.4s ${i * 0.07}s ease both` }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                            {g.name[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">
                              {g.name}
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${clr}`}
                            >
                              {g.relationship}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteGuardian(g.id)}
                          className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Remove"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div className="space-y-2">
                        {g.phone && (
                          <a
                            href={`tel:${g.phone}`}
                            className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
                          >
                            <Phone
                              size={12}
                              className="text-blue-400 flex-shrink-0"
                            />{" "}
                            {g.phone}
                          </a>
                        )}
                        {g.email && (
                          <a
                            href={`mailto:${g.email}`}
                            className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
                          >
                            <Mail
                              size={12}
                              className="text-violet-400 flex-shrink-0"
                            />{" "}
                            {g.email}
                          </a>
                        )}
                        {g.whatsapp && (
                          <a
                            href={`https://wa.me/${g.whatsapp.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-xs text-gray-400 hover:text-emerald-400 transition-colors"
                          >
                            <MessageCircle
                              size={12}
                              className="text-emerald-400 flex-shrink-0"
                            />{" "}
                            WhatsApp
                          </a>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                          <CheckCircle size={9} className="text-emerald-500" />{" "}
                          Ready for SOS alerts
                        </div>
                        <div className="text-[10px] text-gray-600">
                          Added{" "}
                          {new Date(g.created_at).toLocaleDateString("en-IN")}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Add more card */}
                <button
                  onClick={() => setShowAddModal(true)}
                  className="p-5 rounded-2xl border border-dashed border-white/10 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all text-center flex flex-col items-center justify-center gap-3 min-h-[160px]"
                >
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Plus size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-400">
                      Add Guardian
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      Expand your safety network
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}

        {/* JOURNEY TAB */}
        {activeTab === "journey" && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              {/* Journey controls */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Shield size={14} className="text-blue-400" /> Journey Status
                </h3>
                {trackingActive ? (
                  <>
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <div className="text-xl font-black text-white">
                          {formatTime(journeyDuration)}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          Duration
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <div className="text-xl font-black text-white">
                          {posHistory.length}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          GPS Points
                        </div>
                      </div>
                    </div>
                    {guardianLink && (
                      <div>
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">
                          Live Link for Guardian
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[10px] text-gray-400 font-mono break-all mb-2">
                          {guardianLink}
                        </div>
                        <button
                          onClick={copyLink}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all border ${linkCopied ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"}`}
                        >
                          {linkCopied ? "✓ Copied!" : "Copy Guardian Link"}
                        </button>
                      </div>
                    )}
                    <button
                      onClick={stopTracking}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all"
                    >
                      <CheckCircle size={16} /> I Arrived Safely
                    </button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <Eye size={32} className="text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 text-xs mb-4">
                      Start a journey to share your live location with
                      guardians.
                    </p>
                    <button
                      onClick={startTracking}
                      className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all"
                    >
                      <Eye size={16} /> Start Journey
                    </button>
                  </div>
                )}
              </div>

              {/* Recent location points */}
              {posHistory.length > 0 && (
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <MapPin size={11} className="text-cyan-400" /> Route (
                    {posHistory.length} points)
                  </h3>
                  <div
                    className="space-y-1 max-h-40 overflow-y-auto"
                    style={{ scrollbarWidth: "none" }}
                  >
                    {posHistory
                      .slice(-8)
                      .reverse()
                      .map((p, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-[10px] text-gray-500"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                          <span>
                            {p.lat.toFixed(5)}, {p.lng.toFixed(5)}
                          </span>
                          <span className="ml-auto">
                            {new Date(p.time).toLocaleTimeString("en-IN")}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Map */}
            <div
              className="lg:col-span-2 rounded-2xl overflow-hidden border border-white/5"
              style={{ height: "480px" }}
            >
              {currentPos && mapsApiKey ? (
                <APIProvider apiKey={mapsApiKey}>
                  <Map
                    style={{ width: "100%", height: "100%" }}
                    center={currentPos}
                    zoom={15}
                    gestureHandling="greedy"
                    disableDefaultUI={false}
                    mapTypeControl={false}
                    streetViewControl={false}
                    colorScheme="DARK"
                  >
                    <Marker position={currentPos} title="Your Location" />
                  </Map>
                </APIProvider>
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-white/[0.02]">
                  <div className="text-center">
                    <MapPin size={40} className="text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">
                      {currentPos
                        ? "Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable the live map"
                        : "Enable location to see your position on the map"}
                    </p>
                    {currentPos && (
                      <p className="text-gray-600 text-xs mt-2">
                        {currentPos.lat.toFixed(5)}, {currentPos.lng.toFixed(5)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* How it works */}
        <div className="grid sm:grid-cols-4 gap-4 pt-2">
          {[
            {
              icon: UserPlus,
              color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
              title: "Add Guardians",
              desc: "Add trusted contacts to your safety network",
            },
            {
              icon: Eye,
              color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
              title: "Start Journey",
              desc: "Begin live GPS tracking when you travel",
            },
            {
              icon: Share2,
              color: "text-violet-400 bg-violet-500/10 border-violet-500/20",
              title: "Share Location",
              desc: "Send live map link to your guardians",
            },
            {
              icon: AlertTriangle,
              color: "text-red-400 bg-red-500/10 border-red-500/20",
              title: "Auto SOS Alert",
              desc: "Guardians alerted if you miss check-in",
            },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div
              key={title}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/5"
            >
              <div
                className={`inline-flex p-2 rounded-xl border mb-3 ${color}`}
              >
                <Icon size={14} />
              </div>
              <h3 className="text-xs font-bold text-white mb-1">{title}</h3>
              <p className="text-[10px] text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {showAddModal && (
        <AddGuardianModal
          onClose={() => setShowAddModal(false)}
          onAdded={(g) => setGuardians((prev) => [g, ...prev])}
        />
      )}

      <style>{`
        @keyframes grdPulse { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(1.3)} }
        @keyframes grdPulseBtn { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0)}50%{box-shadow:0 0 0 6px rgba(239,68,68,0)} }
        @keyframes grdIn { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        @keyframes grdShimmer { 0%{background-position:-200% 0}100%{background-position:200% 0} }
      `}</style>
    </AppShell>
  );
}
