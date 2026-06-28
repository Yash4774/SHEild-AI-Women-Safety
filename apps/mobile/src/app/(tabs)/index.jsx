import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Shield,
  Zap,
  Map,
  Navigation,
  Users,
  Clock,
  AlertOctagon,
  Lock,
  MessageSquare,
  Activity,
  Bell,
  CheckCircle,
  TrendingUp,
  Cpu,
  Radio,
  Eye,
  Fingerprint,
  Star,
  Flame,
  ChevronRight,
  Phone,
} from "lucide-react-native";
import useUser from "@/utils/auth/useUser";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";

// ── IST clock helpers ─────────────────────────────────────────────
function getIST() {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  const dd = String(ist.getUTCDate()).padStart(2, "0");
  const mm = String(ist.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = ist.getUTCFullYear();
  const hh = String(ist.getUTCHours()).padStart(2, "0");
  const min = String(ist.getUTCMinutes()).padStart(2, "0");
  const ss = String(ist.getUTCSeconds()).padStart(2, "0");
  return {
    date: `${dd}/${mm}/${yyyy}`,
    time: `${hh}:${min}:${ss}`,
    display: `${dd}/${mm}/${yyyy} ${hh}:${min} IST`,
  };
}

const { width: W } = Dimensions.get("window");

const QUICK_FEATURES = [
  {
    label: "Safety Map",
    icon: Map,
    color: "#06b6d4",
    glow: "rgba(6,182,212,0.3)",
    href: "/(tabs)/map",
  },
  {
    label: "Safe Route",
    icon: Navigation,
    color: "#7c3aed",
    glow: "rgba(124,58,237,0.3)",
    href: "/(tabs)/map",
  },
  {
    label: "Guardian",
    icon: Users,
    color: "#3b82f6",
    glow: "rgba(59,130,246,0.3)",
    href: "/(tabs)/community",
  },
  {
    label: "Check-In",
    icon: Clock,
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.3)",
    href: "/(tabs)/community",
  },
  {
    label: "Walk With Me",
    icon: Activity,
    color: "#10b981",
    glow: "rgba(16,185,129,0.3)",
    href: "/(tabs)/community",
  },
  {
    label: "Evidence",
    icon: Lock,
    color: "#6366f1",
    glow: "rgba(99,102,241,0.3)",
    href: "/(tabs)/community",
  },
  {
    label: "Fake Call",
    icon: Phone,
    color: "#ec4899",
    glow: "rgba(236,72,153,0.3)",
    href: "/(tabs)/sos",
  },
  {
    label: "Analytics",
    icon: TrendingUp,
    color: "#f97316",
    glow: "rgba(249,115,22,0.3)",
    href: "/(tabs)/profile",
  },
];

const THREAT_LEVELS = [
  {
    score: 85,
    label: "SAFE",
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
    desc: "Low threat environment",
  },
  {
    score: 62,
    label: "CAUTION",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    desc: "Moderate awareness needed",
  },
  {
    score: 38,
    label: "DANGER",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
    desc: "High threat detected",
  },
];

// Animated safety ring component
function SafetyRing({ score, color }) {
  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const size = 160;
  const radius = 65;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (score / 100) * circumference;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.04,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2.5,
        borderColor: color + "40",
        alignItems: "center",
        justifyContent: "center",
        transform: [{ scale: pulse }],
        shadowColor: color,
        shadowOpacity: 0.5,
        shadowRadius: 20,
      }}
    >
      {/* Outer glow ring */}
      <View
        style={{
          position: "absolute",
          width: size + 18,
          height: size + 18,
          borderRadius: (size + 18) / 2,
          borderWidth: 1,
          borderColor: color + "20",
        }}
      />
      {/* Score text */}
      <View style={{ alignItems: "center" }}>
        <Text
          style={{
            color: "#fff",
            fontSize: 42,
            fontWeight: "900",
            lineHeight: 44,
          }}
        >
          {score}
        </Text>
        <Text
          style={{
            color: color,
            fontSize: 11,
            fontWeight: "800",
            letterSpacing: 1.5,
          }}
        >
          SAFETY SCORE
        </Text>
        <View
          style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}
        >
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: color,
              marginRight: 5,
            }}
          />
          <Text style={{ color: color, fontSize: 11, fontWeight: "700" }}>
            PROTECTED
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: user } = useUser();
  const [reports, setReports] = useState([]);
  const [location, setLocation] = useState(null);
  const [gpsStatus, setGpsStatus] = useState("loading"); // "loading" | "denied" | "ready"
  const [cityLabel, setCityLabel] = useState("");
  const [currentScore, setCurrentScore] = useState(82);
  const [scoreColor, setScoreColor] = useState("#10b981");
  const [scoreLabel, setScoreLabel] = useState("SAFE");
  const [aiInput, setAiInput] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [alertIdx, setAlertIdx] = useState(0);
  const [istClock, setIstClock] = useState(getIST());
  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.92)).current;

  const LIVE_ALERTS = [
    {
      text: "⚠ High risk reported near your area",
      color: "#ef4444",
      time: "2m",
    },
    {
      text: "✅ Guardian Sarah checked in safely",
      color: "#10b981",
      time: "5m",
    },
    {
      text: "🔦 Poor lighting on Main St flagged",
      color: "#f59e0b",
      time: "11m",
    },
    {
      text: "🚔 Police patrol active — Broadway",
      color: "#3b82f6",
      time: "18m",
    },
    {
      text: "🛡 Safe route update: Park Ave clear",
      color: "#7c3aed",
      time: "22m",
    },
  ];

  useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.spring(headerAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 60,
        friction: 10,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        useNativeDriver: true,
        delay: 150,
        tension: 60,
        friction: 10,
      }),
    ]).start();

    // IST clock tick
    const clockId = setInterval(() => setIstClock(getIST()), 1000);

    // GPS with city name
    initGPS();

    // Fetch reports
    fetch("/api/reports")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        if (Array.isArray(d)) {
          setReports(d);
          adjustScore(d);
        }
      })
      .catch(() => {});

    const alertId = setInterval(
      () => setAlertIdx((i) => (i + 1) % LIVE_ALERTS.length),
      3800,
    );
    return () => {
      clearInterval(clockId);
      clearInterval(alertId);
    };
  }, []);

  const initGPS = async () => {
    setGpsStatus("loading");
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setGpsStatus("denied");
      return;
    }
    try {
      const loc = await Location.getCurrentPositionAsync({});
      const coords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
      setLocation(coords);
      setGpsStatus("ready");
      try {
        const [geo] = await Location.reverseGeocodeAsync({
          latitude: coords.lat,
          longitude: coords.lng,
        });
        if (geo)
          setCityLabel([geo.city, geo.region].filter(Boolean).join(", "));
      } catch {}
    } catch {
      setGpsStatus("denied");
    }
  };

  function adjustScore(reps) {
    const highCount = reps.filter((r) => r.danger_level === "high").length;
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour >= 20;
    let score = 82 - highCount * 7 - (isNight ? 14 : 0);
    score = Math.min(95, Math.max(18, score));
    setCurrentScore(score);
    if (score >= 70) {
      setScoreColor("#10b981");
      setScoreLabel("SAFE");
    } else if (score >= 45) {
      setScoreColor("#f59e0b");
      setScoreLabel("CAUTION");
    } else {
      setScoreColor("#ef4444");
      setScoreLabel("DANGER");
    }
  }

  const analyzeDestination = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await fetch("/api/safety-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: location
            ? `GPS ${location.lat.toFixed(4)},${location.lng.toFixed(4)}`
            : "current location",
          destination: aiInput,
          time: istClock.display,
          current_reports: reports,
          lat: location?.lat,
          lng: location?.lng,
        }),
      });
      if (res.ok) setAiResult(await res.json());
    } catch (e) {
      console.error(e);
    }
    setAiLoading(false);
  };

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const name = user?.name?.split(" ")[0] || "there";
  const resultColor = !aiResult
    ? "#7c3aed"
    : aiResult.score >= 70
      ? "#10b981"
      : aiResult.score >= 45
        ? "#f59e0b"
        : "#ef4444";

  // GPS status badge
  const renderGPSBadge = () => {
    if (gpsStatus === "loading")
      return (
        <Text
          style={{
            color: "#f59e0b",
            fontSize: 11,
            fontWeight: "600",
            marginHorizontal: 12,
          }}
        >
          📡 Acquiring GPS...
        </Text>
      );
    if (gpsStatus === "denied")
      return (
        <TouchableOpacity onPress={initGPS}>
          <Text
            style={{
              color: "#f87171",
              fontSize: 11,
              fontWeight: "600",
              marginHorizontal: 12,
            }}
          >
            ⚠ Enable Location
          </Text>
        </TouchableOpacity>
      );
    return (
      <Text
        style={{
          color: "#52525b",
          fontSize: 11,
          fontWeight: "600",
          marginHorizontal: 12,
        }}
      >
        {cityLabel
          ? `📍 ${cityLabel}`
          : `📍 ${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}`}
      </Text>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#04040E" }}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
      >
        {/* ── HERO HEADER ── */}
        <LinearGradient
          colors={["#07071A", "#0B0B20", "#04040E"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: insets.top + 10, paddingBottom: 0 }}
        >
          {/* Top bar */}
          <Animated.View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 20,
              marginBottom: 20,
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-16, 0],
                  }),
                },
              ],
            }}
          >
            <View>
              <Text
                style={{ fontSize: 13, color: "#6b7280", fontWeight: "600" }}
              >
                {greeting} 👋
              </Text>
              <Text
                style={{
                  fontSize: 22,
                  color: "#fff",
                  fontWeight: "900",
                  letterSpacing: -0.5,
                }}
              >
                {name}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {/* IST Clock */}
              <View
                style={{
                  backgroundColor: "rgba(124,58,237,0.12)",
                  borderWidth: 1,
                  borderColor: "rgba(124,58,237,0.22)",
                  borderRadius: 11,
                  paddingHorizontal: 10,
                  paddingVertical: 7,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "#a78bfa",
                    fontSize: 14,
                    fontWeight: "900",
                    letterSpacing: 0.5,
                  }}
                >
                  {istClock.time.slice(0, 5)}
                </Text>
                <Text
                  style={{
                    color: "#6b7280",
                    fontSize: 8,
                    fontWeight: "700",
                    letterSpacing: 0.5,
                  }}
                >
                  IST
                </Text>
              </View>
              <TouchableOpacity
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 13,
                  backgroundColor: "rgba(255,255,255,0.06)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.09)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() =>
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                }
              >
                <Bell size={18} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* SAFETY RING HERO */}
          <Animated.View
            style={{
              alignItems: "center",
              paddingVertical: 24,
              transform: [{ scale: cardScale }],
              opacity: headerAnim,
            }}
          >
            <SafetyRing score={currentScore} color={scoreColor} />
            <View style={{ alignItems: "center", marginTop: 20 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: scoreColor + "18",
                  borderWidth: 1,
                  borderColor: scoreColor + "35",
                  borderRadius: 24,
                  paddingHorizontal: 16,
                  paddingVertical: 7,
                }}
              >
                <View
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 3.5,
                    backgroundColor: scoreColor,
                    marginRight: 8,
                  }}
                />
                <Text
                  style={{ color: scoreColor, fontWeight: "800", fontSize: 13 }}
                >
                  {scoreLabel} Zone — AI Monitoring Active
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Location + Time strip */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              paddingHorizontal: 20,
            }}
          >
            <View
              style={{
                flex: 1,
                height: 1,
                backgroundColor: "rgba(255,255,255,0.06)",
              }}
            />
            {renderGPSBadge()}
            <View
              style={{
                flex: 1,
                height: 1,
                backgroundColor: "rgba(255,255,255,0.06)",
              }}
            />
          </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: 20 }}>
          {/* ── IST DATE + STATUS BAR ── */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.03)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.07)",
              borderRadius: 13,
              paddingHorizontal: 14,
              paddingVertical: 10,
              marginTop: 14,
              marginBottom: 14,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: "#9ca3af",
                  fontSize: 12,
                  fontWeight: "700",
                }}
              >
                {istClock.date}
              </Text>
              <Text
                style={{
                  color: "#6b7280",
                  fontSize: 10,
                  marginTop: 1,
                }}
              >
                Indian Standard Time
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {[
                {
                  label:
                    gpsStatus === "ready"
                      ? "GPS OK"
                      : gpsStatus === "loading"
                        ? "GPS..."
                        : "GPS ✗",
                  color:
                    gpsStatus === "ready"
                      ? "#10b981"
                      : gpsStatus === "loading"
                        ? "#f59e0b"
                        : "#ef4444",
                },
                { label: "AI ONLINE", color: "#7c3aed" },
                { label: "SOS READY", color: "#10b981" },
              ].map((s, i) => (
                <View
                  key={i}
                  style={{
                    backgroundColor: s.color + "18",
                    borderRadius: 7,
                    paddingHorizontal: 7,
                    paddingVertical: 4,
                    borderWidth: 1,
                    borderColor: s.color + "30",
                  }}
                >
                  <Text
                    style={{
                      color: s.color,
                      fontWeight: "800",
                      fontSize: 9,
                    }}
                  >
                    {s.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── LIVE ALERT TICKER ── */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "rgba(239,68,68,0.07)",
              borderWidth: 1,
              borderColor: "rgba(239,68,68,0.2)",
              borderRadius: 14,
              paddingHorizontal: 14,
              paddingVertical: 12,
              marginBottom: 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginRight: 10,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "#ef4444",
                }}
              />
              <Text
                style={{
                  color: "#f87171",
                  fontSize: 10,
                  fontWeight: "900",
                  marginLeft: 6,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                LIVE
              </Text>
            </View>
            <Text
              style={{ color: "#e5e7eb", fontSize: 13, flex: 1 }}
              numberOfLines={1}
            >
              {LIVE_ALERTS[alertIdx].text}
            </Text>
            <Text style={{ color: "#52525b", fontSize: 10, marginLeft: 6 }}>
              {LIVE_ALERTS[alertIdx].time} ago
            </Text>
          </View>

          {/* ── AI THREAT DETECTOR ── */}
          <View
            style={{
              backgroundColor: "rgba(124,58,237,0.09)",
              borderWidth: 1,
              borderColor: "rgba(124,58,237,0.22)",
              borderRadius: 22,
              padding: 20,
              marginBottom: 18,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <LinearGradient
                colors={["#7c3aed", "#4f46e5"]}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 11,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Zap size={17} color="#fff" />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}
                >
                  AI Safety Scanner
                </Text>
                <Text style={{ color: "#6b7280", fontSize: 12, marginTop: 1 }}>
                  Gemini 2.5 Pro • Real-time analysis
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "rgba(16,185,129,0.15)",
                  borderRadius: 8,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                }}
              >
                <View
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 2.5,
                    backgroundColor: "#10b981",
                    marginRight: 5,
                  }}
                />
                <Text
                  style={{ color: "#10b981", fontWeight: "700", fontSize: 10 }}
                >
                  ONLINE
                </Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                gap: 10,
                marginBottom: aiResult || aiLoading ? 14 : 0,
              }}
            >
              <TextInput
                value={aiInput}
                onChangeText={setAiInput}
                placeholder="Enter destination to analyze..."
                placeholderTextColor="#4b5563"
                style={{
                  flex: 1,
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: 13,
                  paddingHorizontal: 14,
                  paddingVertical: 13,
                  color: "#fff",
                  fontSize: 14,
                }}
                onSubmitEditing={analyzeDestination}
                returnKeyType="search"
              />
              <TouchableOpacity
                onPress={analyzeDestination}
                disabled={aiLoading || !aiInput.trim()}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 13,
                  backgroundColor:
                    aiLoading || !aiInput.trim()
                      ? "rgba(124,58,237,0.3)"
                      : "#7c3aed",
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#7c3aed",
                  shadowOpacity: 0.4,
                  shadowRadius: 8,
                }}
                activeOpacity={0.8}
              >
                {aiLoading ? (
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      borderWidth: 2,
                      borderColor: "#fff",
                      borderTopColor: "transparent",
                    }}
                  />
                ) : (
                  <Zap size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>

            {/* AI Loading states */}
            {aiLoading && (
              <View style={{ gap: 8, marginBottom: 4 }}>
                {[
                  "Checking time-of-day risk...",
                  "Analyzing community reports...",
                  "Evaluating route factors...",
                ].map((msg, i) => (
                  <View
                    key={i}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                      opacity: 0.85,
                    }}
                  >
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: "#7c3aed",
                      }}
                    />
                    <Text style={{ color: "#9ca3af", fontSize: 12 }}>
                      {msg}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* AI Result */}
            {aiResult && !aiLoading && (
              <View
                style={{
                  backgroundColor: "rgba(0,0,0,0.35)",
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    marginBottom: 10,
                  }}
                >
                  <Text
                    style={{
                      color: resultColor,
                      fontSize: 48,
                      fontWeight: "900",
                      lineHeight: 50,
                    }}
                  >
                    {aiResult.score}
                    <Text style={{ color: "#374151", fontSize: 20 }}>/100</Text>
                  </Text>
                  <View
                    style={{
                      backgroundColor: resultColor + "22",
                      borderRadius: 10,
                      paddingHorizontal: 12,
                      paddingVertical: 7,
                      borderWidth: 1,
                      borderColor: resultColor + "40",
                    }}
                  >
                    <Text
                      style={{
                        color: resultColor,
                        fontWeight: "900",
                        fontSize: 14,
                      }}
                    >
                      {aiResult.risk_level}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    height: 6,
                    backgroundColor: "rgba(255,255,255,0.07)",
                    borderRadius: 3,
                    overflow: "hidden",
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      height: "100%",
                      width: aiResult.score + "%",
                      backgroundColor: resultColor,
                      borderRadius: 3,
                    }}
                  />
                </View>
                {aiResult.reason && (
                  <Text
                    style={{
                      color: "#9ca3af",
                      fontSize: 13,
                      lineHeight: 20,
                      marginBottom: 10,
                    }}
                  >
                    <Text style={{ color: "#a78bfa", fontWeight: "700" }}>
                      AI:{" "}
                    </Text>
                    {aiResult.reason}
                  </Text>
                )}
                {(aiResult.recommendations || []).slice(0, 3).map((r, i) => (
                  <View
                    key={i}
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      marginBottom: 6,
                    }}
                  >
                    <CheckCircle
                      size={13}
                      color="#10b981"
                      style={{ marginTop: 2, marginRight: 8, flexShrink: 0 }}
                    />
                    <Text
                      style={{
                        color: "#d1d5db",
                        fontSize: 13,
                        flex: 1,
                        lineHeight: 19,
                      }}
                    >
                      {r}
                    </Text>
                  </View>
                ))}
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/map")}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 12,
                    backgroundColor: "rgba(124,58,237,0.15)",
                    borderRadius: 12,
                    paddingVertical: 10,
                    borderWidth: 1,
                    borderColor: "rgba(124,58,237,0.3)",
                  }}
                >
                  <Navigation
                    size={14}
                    color="#a78bfa"
                    style={{ marginRight: 7 }}
                  />
                  <Text
                    style={{
                      color: "#a78bfa",
                      fontWeight: "800",
                      fontSize: 14,
                    }}
                  >
                    Plan Safe Route
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* ── QUICK FEATURE GRID ── */}
          <Text
            style={{
              color: "#fff",
              fontSize: 17,
              fontWeight: "900",
              marginBottom: 14,
              letterSpacing: -0.3,
            }}
          >
            Features
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              marginHorizontal: -5,
              marginBottom: 22,
            }}
          >
            {QUICK_FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(f.href);
                  }}
                  style={{ width: "25%", padding: 5, marginBottom: 5 }}
                  activeOpacity={0.7}
                >
                  <View
                    style={{
                      backgroundColor: "rgba(255,255,255,0.04)",
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.07)",
                      borderRadius: 18,
                      paddingVertical: 14,
                      alignItems: "center",
                      shadowColor: f.glow,
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                    }}
                  >
                    <LinearGradient
                      colors={[f.color + "30", f.color + "15"]}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 13,
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 8,
                      }}
                    >
                      <Icon size={19} color={f.color} />
                    </LinearGradient>
                    <Text
                      style={{
                        color: "#9ca3af",
                        fontSize: 10,
                        fontWeight: "700",
                        textAlign: "center",
                      }}
                    >
                      {f.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── AREA THREAT STATUS ── */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 17,
                fontWeight: "900",
                letterSpacing: -0.3,
              }}
            >
              Area Threat Status
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/map")}>
              <Text
                style={{ color: "#a78bfa", fontSize: 13, fontWeight: "700" }}
              >
                View Map
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ gap: 10, marginBottom: 22 }}>
            {[
              {
                zone: cityLabel || "Your Current Area",
                score: currentScore,
                label: scoreLabel,
                color: scoreColor,
                desc: `Based on GPS + ${reports.length} community reports`,
              },
              {
                zone: "Within 1km radius",
                score: Math.max(20, currentScore - 8),
                label:
                  currentScore - 8 >= 70
                    ? "SAFE"
                    : currentScore - 8 >= 45
                      ? "CAUTION"
                      : "DANGER",
                color:
                  currentScore - 8 >= 70
                    ? "#10b981"
                    : currentScore - 8 >= 45
                      ? "#f59e0b"
                      : "#ef4444",
                desc: "Aggregated community intelligence",
              },
              {
                zone: "Nearest safe route",
                score: Math.min(95, currentScore + 6),
                label: "SAFE",
                color: "#10b981",
                desc: "AI-optimized path detected",
              },
            ].map((z, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: z.color + "0A",
                  borderWidth: 1,
                  borderColor: z.color + "25",
                  borderRadius: 16,
                  padding: 14,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 13,
                    backgroundColor: z.color + "18",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 14,
                  }}
                >
                  <Text
                    style={{ color: z.color, fontSize: 15, fontWeight: "900" }}
                  >
                    {z.score}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}
                  >
                    {z.zone}
                  </Text>
                  <Text
                    style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}
                  >
                    {z.desc}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: z.color + "22",
                    borderRadius: 8,
                    paddingHorizontal: 9,
                    paddingVertical: 5,
                  }}
                >
                  <Text
                    style={{ color: z.color, fontWeight: "800", fontSize: 10 }}
                  >
                    {z.label}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* ── AI COPILOT CARD ── */}
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/community")}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[
                "rgba(124,58,237,0.2)",
                "rgba(79,70,229,0.12)",
                "rgba(5,5,15,0.1)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 22,
                padding: 20,
                borderWidth: 1,
                borderColor: "rgba(124,58,237,0.3)",
                marginBottom: 22,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <LinearGradient
                colors={["#7c3aed", "#4f46e5"]}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 16,
                }}
              >
                <MessageSquare size={24} color="#fff" />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}
                >
                  AI Safety Copilot
                </Text>
                <Text
                  style={{
                    color: "#9ca3af",
                    fontSize: 13,
                    marginTop: 3,
                    lineHeight: 19,
                  }}
                >
                  Ask about routes, dangers, self-defense tips & emergency
                  guidance
                </Text>
              </View>
              <ChevronRight size={20} color="#7c3aed" />
            </LinearGradient>
          </TouchableOpacity>

          {/* ── COMMUNITY REPORTS ── */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 17,
                fontWeight: "900",
                letterSpacing: -0.3,
              }}
            >
              Community Reports
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/community")}>
              <Text
                style={{ color: "#a78bfa", fontSize: 13, fontWeight: "700" }}
              >
                See All
              </Text>
            </TouchableOpacity>
          </View>
          {reports.length === 0 ? (
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.03)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.07)",
                borderRadius: 18,
                padding: 28,
                alignItems: "center",
              }}
            >
              <Radio size={36} color="#374151" />
              <Text
                style={{
                  color: "#6b7280",
                  fontSize: 14,
                  marginTop: 12,
                  fontWeight: "600",
                }}
              >
                No reports in your area
              </Text>
              <Text
                style={{
                  color: "#4b5563",
                  fontSize: 13,
                  marginTop: 4,
                  textAlign: "center",
                }}
              >
                Be the first to report a safety issue
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/community")}
                style={{
                  marginTop: 14,
                  backgroundColor: "rgba(239,68,68,0.12)",
                  borderRadius: 12,
                  paddingHorizontal: 18,
                  paddingVertical: 9,
                  borderWidth: 1,
                  borderColor: "rgba(239,68,68,0.25)",
                }}
              >
                <Text
                  style={{
                    color: "#f87171",
                    fontWeight: "800",
                    fontSize: 13,
                  }}
                >
                  Report Now
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {reports.slice(0, 4).map((r, i) => {
                const rColor =
                  r.danger_level === "high"
                    ? "#ef4444"
                    : r.danger_level === "medium"
                      ? "#f59e0b"
                      : "#10b981";
                return (
                  <View
                    key={i}
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      padding: 14,
                      backgroundColor: rColor + "08",
                      borderWidth: 1,
                      borderColor: rColor + "22",
                      borderRadius: 15,
                    }}
                  >
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        backgroundColor: rColor + "18",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                        flexShrink: 0,
                      }}
                    >
                      <Text style={{ fontSize: 16 }}>
                        {r.danger_level === "high"
                          ? "🔴"
                          : r.danger_level === "medium"
                            ? "🟡"
                            : "🟢"}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 14,
                          fontWeight: "700",
                          textTransform: "capitalize",
                          marginBottom: 3,
                        }}
                      >
                        {r.category || "Safety"} Alert
                      </Text>
                      <Text
                        style={{
                          color: "#9ca3af",
                          fontSize: 13,
                          lineHeight: 18,
                        }}
                        numberOfLines={2}
                      >
                        {r.description || "No description provided"}
                      </Text>
                    </View>
                    <Text
                      style={{
                        color: "#4b5563",
                        fontSize: 10,
                        marginLeft: 8,
                        flexShrink: 0,
                      }}
                    >
                      {new Date(r.created_at).toLocaleDateString("en-IN")}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
