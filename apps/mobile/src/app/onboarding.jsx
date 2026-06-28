import { useState, useRef } from "react";
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Animated,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Shield,
  Navigation,
  Users,
  Zap,
  CheckCircle,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";

const { width: W } = Dimensions.get("window");

const SLIDES = [
  {
    gradient: ["#0A0320", "#160840", "#04040E"],
    accentColor: "#7c3aed",
    icon: Shield,
    emoji: "🛡",
    title: "Your AI Safety Shield",
    subtitle:
      "SHEild AI monitors your environment 24/7, providing real-time safety scores, live threat detection and AI-powered protection.",
    features: [
      "Real-time safety scoring",
      "AI threat detection",
      "24/7 monitoring",
    ],
  },
  {
    gradient: ["#03120A", "#073020", "#04040E"],
    accentColor: "#10b981",
    icon: Navigation,
    emoji: "🗺",
    title: "Smart Safe Routes",
    subtitle:
      "AI analyzes crime data, lighting, crowd density and community reports to find the safest path to your destination.",
    features: ["Safest route planning", "Live heatmap", "Safe places nearby"],
  },
  {
    gradient: ["#120310", "#350820", "#04040E"],
    accentColor: "#ec4899",
    icon: Users,
    emoji: "👥",
    title: "Guardian Network",
    subtitle:
      "Connect with trusted family and friends. Share your live location, set check-ins and get instant emergency alerts.",
    features: ["Live location sharing", "Smart check-ins", "Emergency alerts"],
  },
  {
    gradient: ["#120A00", "#2D1800", "#04040E"],
    accentColor: "#ef4444",
    icon: Zap,
    emoji: "🆘",
    title: "Instant Emergency SOS",
    subtitle:
      "One tap sends your live location to all contacts. Voice commands, fake call generator and AI emergency copilot — all built in.",
    features: [
      "Voice-activated SOS",
      "Fake call generator",
      "AI emergency copilot",
    ],
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const goToNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const next = currentSlide + 1;
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
      scrollRef.current?.scrollTo({ x: next * W, animated: true });
      setCurrentSlide(next);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.replace("/(tabs)");
    }
  };

  const skip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace("/(tabs)");
  };

  const slide = SLIDES[currentSlide];
  const Icon = slide.icon;

  return (
    <View style={{ flex: 1, backgroundColor: "#04040E" }}>
      <StatusBar style="light" />
      <LinearGradient colors={slide.gradient} style={{ flex: 1 }}>
        {/* Skip button */}
        <View
          style={{
            paddingTop: insets.top + 16,
            paddingHorizontal: 24,
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          <TouchableOpacity
            onPress={skip}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              backgroundColor: "rgba(255,255,255,0.07)",
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            <Text style={{ color: "#9ca3af", fontSize: 14, fontWeight: "600" }}>
              Skip
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <Animated.View
          style={{
            flex: 1,
            opacity: fadeAnim,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 32,
          }}
        >
          {/* Icon */}
          <View style={{ marginBottom: 32, position: "relative" }}>
            <LinearGradient
              colors={[slide.accentColor + "40", slide.accentColor + "18"]}
              style={{
                width: 120,
                height: 120,
                borderRadius: 36,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: slide.accentColor + "40",
              }}
            >
              <Text style={{ fontSize: 56 }}>{slide.emoji}</Text>
            </LinearGradient>
            {/* Glow ring */}
            <View
              style={{
                position: "absolute",
                width: 140,
                height: 140,
                borderRadius: 44,
                borderWidth: 1,
                borderColor: slide.accentColor + "20",
                top: -10,
                left: -10,
              }}
            />
          </View>

          <Text
            style={{
              color: "#fff",
              fontSize: 30,
              fontWeight: "900",
              textAlign: "center",
              letterSpacing: -0.8,
              marginBottom: 14,
              lineHeight: 36,
            }}
          >
            {slide.title}
          </Text>
          <Text
            style={{
              color: "#9ca3af",
              fontSize: 16,
              textAlign: "center",
              lineHeight: 24,
              marginBottom: 32,
            }}
          >
            {slide.subtitle}
          </Text>

          {/* Feature list */}
          <View style={{ gap: 12, width: "100%" }}>
            {slide.features.map((f, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: slide.accentColor + "12",
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: slide.accentColor + "25",
                }}
              >
                <CheckCircle
                  size={16}
                  color={slide.accentColor}
                  style={{ marginRight: 12 }}
                />
                <Text
                  style={{ color: "#e5e7eb", fontSize: 15, fontWeight: "600" }}
                >
                  {f}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Bottom area */}
        <View
          style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }}
        >
          {/* Dots */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
              marginBottom: 24,
            }}
          >
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={{
                  height: 6,
                  borderRadius: 3,
                  width: i === currentSlide ? 24 : 6,
                  backgroundColor:
                    i === currentSlide
                      ? slide.accentColor
                      : "rgba(255,255,255,0.2)",
                }}
              />
            ))}
          </View>

          {/* CTA */}
          <TouchableOpacity onPress={goToNext} activeOpacity={0.85}>
            <LinearGradient
              colors={[slide.accentColor, slide.accentColor + "CC"]}
              style={{
                borderRadius: 18,
                paddingVertical: 18,
                alignItems: "center",
                shadowColor: slide.accentColor,
                shadowOpacity: 0.5,
                shadowRadius: 16,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "900", fontSize: 18 }}>
                {currentSlide < SLIDES.length - 1
                  ? "Continue →"
                  : "Get Started 🛡"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}
