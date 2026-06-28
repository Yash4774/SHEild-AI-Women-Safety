import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import MapView, { Marker, Circle, PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import {
  Map,
  Navigation,
  Shield,
  CheckCircle,
  MapPin,
  Zap,
  Eye,
  Star,
} from "lucide-react-native";
import { StatusBar } from "expo-status-bar";

const { width: W } = Dimensions.get("window");

const ROUTE_TYPES = [
  {
    id: "safest",
    label: "Safest Route",
    icon: Shield,
    color: "#10b981",
    desc: "Lowest crime, best lighting",
  },
  {
    id: "fastest",
    label: "Fastest Route",
    icon: Zap,
    color: "#f59e0b",
    desc: "Quickest — moderate safety",
  },
  {
    id: "night",
    label: "Night Safe",
    icon: Eye,
    color: "#7c3aed",
    desc: "24h businesses & cameras",
  },
  {
    id: "women",
    label: "Women Safe",
    icon: Star,
    color: "#ec4899",
    desc: "Maximum female safety",
  },
];

const STATIC_SAFE_PLACES = [
  {
    name: "Police Station",
    type: "police",
    emoji: "🚔",
    color: "#3b82f6",
    lat: 40.7549,
    lng: -73.9962,
  },
  {
    name: "Hospital",
    type: "hospital",
    emoji: "🏥",
    color: "#ef4444",
    lat: 40.7397,
    lng: -73.9754,
  },
  {
    name: "Women's Safe Space",
    type: "shelter",
    emoji: "🏠",
    color: "#7c3aed",
    lat: 40.7128,
    lng: -74.006,
  },
  {
    name: "Public Library",
    type: "safe",
    emoji: "📚",
    color: "#10b981",
    lat: 40.7532,
    lng: -73.9822,
  },
];

// IST time format helper
function formatIST(date = new Date()) {
  const ist = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
  const h = String(ist.getUTCHours()).padStart(2, "0");
  const m = String(ist.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m} IST`;
}

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  // GPS states: null=loading, "denied"=denied, object=success
  const [location, setLocation] = useState(null);
  const [gpsStatus, setGpsStatus] = useState("loading"); // "loading" | "denied" | "ready"
  const [cityLabel, setCityLabel] = useState("");
  const [reports, setReports] = useState([]);
  const [destination, setDestination] = useState("");
  const [safetyResult, setSafetyResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeRoute, setActiveRoute] = useState(null);
  const [activeSection, setActiveSection] = useState("map");
  const mapRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    initLocation();
    fetchReports();
  }, []);

  const initLocation = async () => {
    setGpsStatus("loading");
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setGpsStatus("denied");
      return;
    }
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
      setLocation(coords);
      setGpsStatus("ready");
      // Reverse geocode for city label
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

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/reports");
      if (res.ok) {
        const d = await res.json();
        if (Array.isArray(d)) setReports(d);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const analyzeRoute = async () => {
    if (!destination.trim()) return;
    setAnalyzing(true);
    setSafetyResult(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const res = await fetch("/api/safety-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: location
            ? `GPS ${location.lat.toFixed(4)},${location.lng.toFixed(4)}`
            : "current location",
          destination,
          time: formatIST(),
          current_reports: reports,
          lat: location?.lat,
          lng: location?.lng,
        }),
      });
      if (res.ok) setSafetyResult(await res.json());
    } catch (e) {
      console.error(e);
    }
    setAnalyzing(false);
  };

  const resultColor = !safetyResult
    ? "#7c3aed"
    : safetyResult.score >= 70
      ? "#10b981"
      : safetyResult.score >= 45
        ? "#f59e0b"
        : "#ef4444";

  const ZONES = [
    {
      name: "High Risk Zone A",
      risk: "high",
      lat: 40.7829,
      lng: -73.9654,
      count: reports.filter((r) => r.danger_level === "high").length + 5,
      desc: "Multiple incidents reported recently",
    },
    {
      name: "Caution Area B",
      risk: "medium",
      lat: 40.758,
      lng: -73.9855,
      count: 3,
      desc: "Moderate risk — stay alert",
    },
    {
      name: "Safe Corridor C",
      risk: "low",
      lat: 40.7614,
      lng: -73.9776,
      count: 1,
      desc: "Generally safe — standard caution",
    },
    {
      name: "Moderate Risk D",
      risk: "medium",
      lat: 40.7114,
      lng: -73.9727,
      count: 4,
      desc: "Evening caution advised",
    },
    {
      name: cityLabel || "Your Current Area",
      risk:
        reports.filter((r) => r.danger_level === "high").length > 2
          ? "high"
          : reports.length > 0
            ? "medium"
            : "low",
      lat: location?.lat || 40.758,
      lng: location?.lng || -73.985,
      count: reports.length,
      desc: `Based on ${reports.length} community reports`,
    },
  ];
  const filteredZones =
    activeFilter === "all"
      ? ZONES
      : ZONES.filter((z) => z.risk === activeFilter);

  // GPS badge component
  const GPSBadge = () => {
    if (gpsStatus === "loading")
      return (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "rgba(245,158,11,0.12)",
            borderWidth: 1,
            borderColor: "rgba(245,158,11,0.3)",
            borderRadius: 12,
            paddingHorizontal: 10,
            paddingVertical: 6,
          }}
        >
          <ActivityIndicator
            size="small"
            color="#f59e0b"
            style={{ marginRight: 6 }}
          />
          <Text style={{ color: "#fbbf24", fontWeight: "700", fontSize: 11 }}>
            Acquiring GPS...
          </Text>
        </View>
      );
    if (gpsStatus === "denied")
      return (
        <TouchableOpacity
          onPress={initLocation}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "rgba(239,68,68,0.12)",
            borderWidth: 1,
            borderColor: "rgba(239,68,68,0.3)",
            borderRadius: 12,
            paddingHorizontal: 10,
            paddingVertical: 6,
          }}
        >
          <Text style={{ color: "#f87171", fontWeight: "700", fontSize: 11 }}>
            Enable Location
          </Text>
        </TouchableOpacity>
      );
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "rgba(16,185,129,0.12)",
          borderWidth: 1,
          borderColor: "rgba(16,185,129,0.3)",
          borderRadius: 12,
          paddingHorizontal: 10,
          paddingVertical: 6,
        }}
      >
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: "#10b981",
            marginRight: 6,
          }}
        />
        <Text style={{ color: "#10b981", fontWeight: "700", fontSize: 11 }}>
          GPS CONNECTED
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#04040E" }}>
      <StatusBar style="light" />

      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        {/* Header */}
        <LinearGradient
          colors={["#07071A", "#04040E"]}
          style={{
            paddingTop: insets.top + 12,
            paddingHorizontal: 20,
            paddingBottom: 14,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <View>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 24,
                  fontWeight: "900",
                  letterSpacing: -0.5,
                }}
              >
                Safety Map
              </Text>
              {cityLabel ? (
                <Text
                  style={{
                    color: "#6b7280",
                    fontSize: 13,
                    marginTop: 2,
                  }}
                >
                  📍 {cityLabel}
                </Text>
              ) : (
                <Text
                  style={{
                    color: "#6b7280",
                    fontSize: 13,
                    marginTop: 2,
                  }}
                >
                  Live heatmap + Safe route planner
                </Text>
              )}
            </View>
            <GPSBadge />
          </View>

          {/* Coords bar when connected */}
          {location && gpsStatus === "ready" && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "rgba(16,185,129,0.06)",
                borderRadius: 10,
                paddingHorizontal: 10,
                paddingVertical: 6,
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  color: "#6b7280",
                  fontSize: 11,
                  flex: 1,
                }}
              >
                {location.lat.toFixed(5)}, {location.lng.toFixed(5)} ·{" "}
                {formatIST()}
              </Text>
            </View>
          )}

          {/* Section tabs */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: 14,
              padding: 4,
            }}
          >
            {[
              { id: "map", label: "Live Map" },
              { id: "route", label: "Safe Route" },
              { id: "places", label: "Safe Places" },
            ].map((s) => (
              <TouchableOpacity
                key={s.id}
                onPress={() => {
                  setActiveSection(s.id);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={{
                  flex: 1,
                  paddingVertical: 9,
                  borderRadius: 11,
                  backgroundColor:
                    activeSection === s.id ? "#7c3aed" : "transparent",
                  alignItems: "center",
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={{
                    color: activeSection === s.id ? "#fff" : "#6b7280",
                    fontWeight: "800",
                    fontSize: 13,
                  }}
                >
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
        >
          {/* ── LIVE MAP ── */}
          {activeSection === "map" && (
            <View style={{ paddingHorizontal: 20 }}>
              {/* MapView */}
              <View
                style={{
                  borderRadius: 22,
                  overflow: "hidden",
                  marginTop: 8,
                  marginBottom: 14,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                }}
              >
                {location ? (
                  <MapView
                    ref={mapRef}
                    provider={PROVIDER_DEFAULT}
                    style={{ width: "100%", height: 280 }}
                    initialRegion={{
                      latitude: location.lat,
                      longitude: location.lng,
                      latitudeDelta: 0.025,
                      longitudeDelta: 0.025,
                    }}
                    showsUserLocation
                    showsMyLocationButton={false}
                    showsCompass={false}
                  >
                    {reports.map((r, i) => (
                      <Circle
                        key={i}
                        center={{
                          latitude: r.location_lat,
                          longitude: r.location_lng,
                        }}
                        radius={250}
                        fillColor={
                          r.danger_level === "high"
                            ? "rgba(239,68,68,0.2)"
                            : r.danger_level === "medium"
                              ? "rgba(245,158,11,0.16)"
                              : "rgba(16,185,129,0.14)"
                        }
                        strokeColor={
                          r.danger_level === "high"
                            ? "rgba(239,68,68,0.5)"
                            : r.danger_level === "medium"
                              ? "rgba(245,158,11,0.4)"
                              : "rgba(16,185,129,0.35)"
                        }
                        strokeWidth={1.5}
                      />
                    ))}
                    {/* Static risk zones */}
                    {[
                      {
                        lat: 40.7829,
                        lng: -73.9654,
                        color: "rgba(239,68,68,0.18)",
                        stroke: "rgba(239,68,68,0.5)",
                      },
                      {
                        lat: 40.758,
                        lng: -73.9855,
                        color: "rgba(245,158,11,0.14)",
                        stroke: "rgba(245,158,11,0.4)",
                      },
                      {
                        lat: 40.7614,
                        lng: -73.9776,
                        color: "rgba(16,185,129,0.12)",
                        stroke: "rgba(16,185,129,0.35)",
                      },
                    ].map((z, i) => (
                      <Circle
                        key={"z" + i}
                        center={{
                          latitude: z.lat,
                          longitude: z.lng,
                        }}
                        radius={400}
                        fillColor={z.color}
                        strokeColor={z.stroke}
                        strokeWidth={1.5}
                      />
                    ))}
                    {STATIC_SAFE_PLACES.map((p, i) => (
                      <Marker
                        key={i}
                        coordinate={{ latitude: p.lat, longitude: p.lng }}
                        title={p.name}
                        description={p.type}
                      />
                    ))}
                  </MapView>
                ) : (
                  <View
                    style={{
                      height: 280,
                      backgroundColor: "rgba(255,255,255,0.03)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Map size={42} color="#374151" />
                    <Text
                      style={{
                        color: "#6b7280",
                        fontSize: 14,
                        marginTop: 14,
                        fontWeight: "600",
                      }}
                    >
                      {gpsStatus === "loading"
                        ? "Acquiring GPS location..."
                        : "GPS permission required"}
                    </Text>
                    {gpsStatus === "denied" && (
                      <TouchableOpacity
                        onPress={initLocation}
                        style={{
                          marginTop: 14,
                          backgroundColor: "rgba(124,58,237,0.15)",
                          borderRadius: 12,
                          paddingHorizontal: 20,
                          paddingVertical: 10,
                        }}
                      >
                        <Text
                          style={{
                            color: "#a78bfa",
                            fontWeight: "700",
                            fontSize: 14,
                          }}
                        >
                          Enable Location
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>

              {/* Legend */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                {[
                  { label: "Safe", color: "#10b981" },
                  { label: "Caution", color: "#f59e0b" },
                  { label: "Danger", color: "#ef4444" },
                ].map((l) => (
                  <View
                    key={l.label}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: l.color + "12",
                      borderRadius: 10,
                      paddingHorizontal: 12,
                      paddingVertical: 7,
                      borderWidth: 1,
                      borderColor: l.color + "28",
                    }}
                  >
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: l.color,
                        marginRight: 6,
                      }}
                    />
                    <Text
                      style={{
                        color: "#e5e7eb",
                        fontSize: 12,
                        fontWeight: "600",
                      }}
                    >
                      {l.label}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Filter */}
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
                {[
                  { id: "all", label: "All Zones" },
                  { id: "high", label: "🔴 High" },
                  { id: "medium", label: "🟡 Medium" },
                  { id: "low", label: "🟢 Safe" },
                ].map((f) => (
                  <TouchableOpacity
                    key={f.id}
                    onPress={() => setActiveFilter(f.id)}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: 11,
                      backgroundColor:
                        activeFilter === f.id
                          ? "rgba(124,58,237,0.2)"
                          : "rgba(255,255,255,0.04)",
                      borderWidth: 1,
                      borderColor:
                        activeFilter === f.id
                          ? "rgba(124,58,237,0.4)"
                          : "rgba(255,255,255,0.07)",
                      alignItems: "center",
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={{
                        color: activeFilter === f.id ? "#a78bfa" : "#6b7280",
                        fontWeight: "700",
                        fontSize: 10,
                        textAlign: "center",
                      }}
                    >
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "900",
                  marginBottom: 10,
                }}
              >
                Risk Zones ({filteredZones.length})
              </Text>
              <View style={{ gap: 10 }}>
                {filteredZones.map((zone, i) => {
                  const zc =
                    zone.risk === "high"
                      ? "#ef4444"
                      : zone.risk === "medium"
                        ? "#f59e0b"
                        : "#10b981";
                  const open = selectedZone?.name === zone.name;
                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => {
                        setSelectedZone(open ? null : zone);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      activeOpacity={0.8}
                    >
                      <View
                        style={{
                          backgroundColor: zc + "0A",
                          borderWidth: 1,
                          borderColor: open
                            ? zc + "45"
                            : "rgba(255,255,255,0.07)",
                          borderRadius: 16,
                          padding: 14,
                        }}
                      >
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <View
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: 5,
                              backgroundColor: zc,
                              marginRight: 12,
                            }}
                          />
                          <Text
                            style={{
                              color: "#fff",
                              fontWeight: "700",
                              fontSize: 14,
                              flex: 1,
                            }}
                          >
                            {zone.name}
                          </Text>
                          <Text
                            style={{
                              color: "#6b7280",
                              fontSize: 12,
                              marginRight: 8,
                            }}
                          >
                            {zone.count} reports
                          </Text>
                          <View
                            style={{
                              backgroundColor: zc + "22",
                              borderRadius: 8,
                              paddingHorizontal: 9,
                              paddingVertical: 4,
                            }}
                          >
                            <Text
                              style={{
                                color: zc,
                                fontWeight: "800",
                                fontSize: 10,
                                textTransform: "uppercase",
                              }}
                            >
                              {zone.risk}
                            </Text>
                          </View>
                        </View>
                        {open && (
                          <View style={{ marginTop: 10, gap: 8 }}>
                            <Text
                              style={{
                                color: "#9ca3af",
                                fontSize: 13,
                                lineHeight: 19,
                              }}
                            >
                              {zone.desc}
                            </Text>
                            {location && (
                              <TouchableOpacity
                                onPress={() =>
                                  mapRef.current?.animateToRegion(
                                    {
                                      latitude: zone.lat,
                                      longitude: zone.lng,
                                      latitudeDelta: 0.008,
                                      longitudeDelta: 0.008,
                                    },
                                    800,
                                  )
                                }
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  backgroundColor: "rgba(255,255,255,0.05)",
                                  borderRadius: 10,
                                  paddingHorizontal: 12,
                                  paddingVertical: 8,
                                }}
                              >
                                <Navigation
                                  size={13}
                                  color="#a78bfa"
                                  style={{ marginRight: 7 }}
                                />
                                <Text
                                  style={{
                                    color: "#a78bfa",
                                    fontWeight: "700",
                                    fontSize: 13,
                                  }}
                                >
                                  Show on map
                                </Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* ── SAFE ROUTE ── */}
          {activeSection === "route" && (
            <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
              <View
                style={{
                  backgroundColor: "rgba(124,58,237,0.1)",
                  borderWidth: 1,
                  borderColor: "rgba(124,58,237,0.25)",
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
                      width: 40,
                      height: 40,
                      borderRadius: 13,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 13,
                    }}
                  >
                    <Navigation size={19} color="#fff" />
                  </LinearGradient>
                  <View>
                    <Text
                      style={{ color: "#fff", fontWeight: "900", fontSize: 17 }}
                    >
                      AI Route Planner
                    </Text>
                    <Text style={{ color: "#6b7280", fontSize: 13 }}>
                      Gemini 2.5 Pro • {cityLabel || "GPS Analysis"}
                    </Text>
                  </View>
                </View>
                <TextInput
                  value={destination}
                  onChangeText={setDestination}
                  placeholder="Where are you going?"
                  placeholderTextColor="#4b5563"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.06)",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.12)",
                    borderRadius: 14,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    color: "#fff",
                    fontSize: 15,
                    marginBottom: 12,
                  }}
                  returnKeyType="search"
                  onSubmitEditing={analyzeRoute}
                />
                <TouchableOpacity
                  onPress={analyzeRoute}
                  disabled={analyzing || !destination.trim()}
                  style={{
                    backgroundColor:
                      analyzing || !destination.trim()
                        ? "rgba(124,58,237,0.3)"
                        : "#7c3aed",
                    borderRadius: 14,
                    paddingVertical: 14,
                    alignItems: "center",
                  }}
                  activeOpacity={0.8}
                >
                  {analyzing ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text
                      style={{ color: "#fff", fontWeight: "900", fontSize: 15 }}
                    >
                      Analyze Route Safety
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Route type selector */}
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "900",
                  marginBottom: 14,
                }}
              >
                Route Type
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginHorizontal: -5,
                  marginBottom: 18,
                }}
              >
                {ROUTE_TYPES.map((route) => {
                  const Icon = route.icon;
                  const isActive = activeRoute?.id === route.id;
                  return (
                    <TouchableOpacity
                      key={route.id}
                      onPress={() => {
                        setActiveRoute(isActive ? null : route);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      style={{ width: "50%", padding: 5 }}
                      activeOpacity={0.8}
                    >
                      <View
                        style={{
                          backgroundColor: isActive
                            ? route.color + "18"
                            : "rgba(255,255,255,0.03)",
                          borderWidth: 1,
                          borderColor: isActive
                            ? route.color + "40"
                            : "rgba(255,255,255,0.07)",
                          borderRadius: 18,
                          padding: 16,
                        }}
                      >
                        <LinearGradient
                          colors={[route.color + "30", route.color + "12"]}
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: 13,
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 10,
                          }}
                        >
                          <Icon size={19} color={route.color} />
                        </LinearGradient>
                        <Text
                          style={{
                            color: isActive ? route.color : "#fff",
                            fontWeight: "800",
                            fontSize: 14,
                            marginBottom: 3,
                          }}
                        >
                          {route.label}
                        </Text>
                        <Text style={{ color: "#6b7280", fontSize: 11 }}>
                          {route.desc}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {safetyResult && (
                <View
                  style={{
                    backgroundColor: resultColor + "0C",
                    borderWidth: 1,
                    borderColor: resultColor + "30",
                    borderRadius: 20,
                    padding: 20,
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
                        fontSize: 52,
                        fontWeight: "900",
                        lineHeight: 54,
                      }}
                    >
                      {safetyResult.score}
                      <Text style={{ color: "#374151", fontSize: 22 }}>
                        /100
                      </Text>
                    </Text>
                    <View
                      style={{
                        backgroundColor: resultColor + "22",
                        borderRadius: 12,
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderWidth: 1,
                        borderColor: resultColor + "40",
                      }}
                    >
                      <Text
                        style={{
                          color: resultColor,
                          fontWeight: "900",
                          fontSize: 15,
                        }}
                      >
                        {safetyResult.risk_level}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      height: 8,
                      backgroundColor: "rgba(255,255,255,0.08)",
                      borderRadius: 4,
                      overflow: "hidden",
                      marginBottom: 14,
                    }}
                  >
                    <View
                      style={{
                        height: "100%",
                        width: safetyResult.score + "%",
                        backgroundColor: resultColor,
                        borderRadius: 4,
                      }}
                    />
                  </View>
                  {/* Route metrics */}
                  <View
                    style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}
                  >
                    {[
                      {
                        label: "Safety",
                        val: safetyResult.score + "/100",
                        col: resultColor,
                      },
                      {
                        label: "Lighting",
                        val: safetyResult.score >= 60 ? "Good" : "Poor",
                        col: safetyResult.score >= 60 ? "#10b981" : "#f59e0b",
                      },
                      {
                        label: "Crowd",
                        val: safetyResult.score >= 50 ? "High" : "Low",
                        col: safetyResult.score >= 50 ? "#10b981" : "#ef4444",
                      },
                    ].map((m, i) => (
                      <View
                        key={i}
                        style={{
                          flex: 1,
                          backgroundColor: "rgba(255,255,255,0.04)",
                          borderRadius: 10,
                          padding: 10,
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: m.col,
                            fontWeight: "900",
                            fontSize: 14,
                          }}
                        >
                          {m.val}
                        </Text>
                        <Text
                          style={{
                            color: "#6b7280",
                            fontSize: 10,
                            marginTop: 3,
                          }}
                        >
                          {m.label}
                        </Text>
                      </View>
                    ))}
                  </View>
                  {safetyResult.reason && (
                    <Text
                      style={{
                        color: "#9ca3af",
                        fontSize: 13,
                        lineHeight: 20,
                        marginBottom: 14,
                      }}
                    >
                      <Text style={{ color: "#a78bfa", fontWeight: "700" }}>
                        AI:{" "}
                      </Text>
                      {safetyResult.reason}
                    </Text>
                  )}
                  {(safetyResult.recommendations || [])
                    .slice(0, 4)
                    .map((r, i) => (
                      <View
                        key={i}
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-start",
                          marginBottom: 8,
                        }}
                      >
                        <CheckCircle
                          size={13}
                          color="#10b981"
                          style={{
                            marginTop: 2,
                            marginRight: 8,
                            flexShrink: 0,
                          }}
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
                </View>
              )}
            </View>
          )}

          {/* ── SAFE PLACES ── */}
          {activeSection === "places" && (
            <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
              {[
                {
                  emoji: "🚔",
                  label: "Police Stations",
                  color: "#3b82f6",
                  items: [
                    "Nearest Police Station",
                    "Traffic Control Room",
                    "Women Police Station",
                  ],
                },
                {
                  emoji: "🏥",
                  label: "Hospitals & Medical",
                  color: "#ef4444",
                  items: [
                    "Government Hospital",
                    "Primary Health Center",
                    "Emergency Clinic",
                  ],
                },
                {
                  emoji: "💜",
                  label: "Women's Help Centers",
                  color: "#7c3aed",
                  items: [
                    "Women Helpline Center",
                    "One Stop Crisis Center",
                    "Shelter Home",
                  ],
                },
                {
                  emoji: "☕",
                  label: "24-Hour Safe Places",
                  color: "#10b981",
                  items: [
                    "24h Petrol Station",
                    "Railway Station",
                    "Bus Stand (24h)",
                  ],
                },
              ].map((cat, ci) => (
                <View key={ci} style={{ marginBottom: 20 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <Text style={{ fontSize: 22, marginRight: 10 }}>
                      {cat.emoji}
                    </Text>
                    <Text
                      style={{ color: "#fff", fontSize: 16, fontWeight: "900" }}
                    >
                      {cat.label}
                    </Text>
                  </View>
                  <View style={{ gap: 10 }}>
                    {cat.items.map((item, ii) => (
                      <View
                        key={ii}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: cat.color + "0A",
                          borderWidth: 1,
                          borderColor: cat.color + "22",
                          borderRadius: 14,
                          padding: 14,
                        }}
                      >
                        <View
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 11,
                            backgroundColor: cat.color + "18",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 12,
                          }}
                        >
                          <MapPin size={15} color={cat.color} />
                        </View>
                        <Text
                          style={{
                            color: "#fff",
                            fontWeight: "700",
                            fontSize: 14,
                            flex: 1,
                          }}
                        >
                          {item}
                        </Text>
                        <Navigation size={16} color={cat.color} />
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}
