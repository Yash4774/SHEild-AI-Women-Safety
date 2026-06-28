import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import useUser from "@/utils/auth/useUser";
import { useSOSState } from "@/hooks/useSOSState";
import { useFakeCall } from "@/hooks/useFakeCall";
import { SOSButton } from "@/components/SOS/SOSButton";
import { SectionTabs } from "@/components/SOS/SectionTabs";
import { AICopilotSection } from "@/components/SOS/AICopilotSection";
import { FakeCallSection } from "@/components/SOS/FakeCallSection";
import { VoiceSOSSection } from "@/components/SOS/VoiceSOSSection";
import { EmergencyContactsSection } from "@/components/SOS/EmergencyContactsSection";
import { FakeCallScreen } from "@/components/SOS/FakeCallScreen";
import {
  Volume2,
  MessageSquare,
  Flashlight,
  Shield,
  X,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";

const SOS_MODES = [
  { id: "siren", label: "Siren Only", icon: Volume2, color: "#f59e0b" },
  {
    id: "siren_sms",
    label: "Siren + SMS",
    icon: MessageSquare,
    color: "#ef4444",
  },
  {
    id: "siren_flash",
    label: "Siren + Flash",
    icon: Flashlight,
    color: "#f97316",
  },
  { id: "full", label: "Full Emergency", icon: Shield, color: "#dc2626" },
];

export default function SOSScreen() {
  const insets = useSafeAreaInsets();
  const { data: user } = useUser();
  const [activeMode, setActiveMode] = useState(null);
  const [voiceActive, setVoiceActive] = useState(false);
  const [activeSection, setActiveSection] = useState("sos");
  const [sosMode, setSosMode] = useState("full");

  const {
    sosActive,
    countdown,
    location,
    sosTimestamp,
    ringScale,
    ring2Scale,
    glowAnim,
    triggerSOS,
    cancelSOS,
  } = useSOSState();

  const {
    fakeCallActive,
    fakeCallCaller,
    fakeCallCountdown,
    triggerFakeCall,
    endFakeCall,
  } = useFakeCall();

  if (fakeCallActive && fakeCallCaller) {
    return (
      <>
        <StatusBar style="light" />
        <FakeCallScreen caller={fakeCallCaller} onEnd={endFakeCall} />
      </>
    );
  }

  // Full-screen active SOS view
  if (sosActive) {
    const modeObj = SOS_MODES.find((m) => m.id === sosMode) || SOS_MODES[3];
    return (
      <View style={{ flex: 1, backgroundColor: "#0a0000" }}>
        <StatusBar style="light" />
        <LinearGradient
          colors={["#1a0000", "#2d0000", "#0a0000"]}
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 24,
            paddingTop: insets.top,
          }}
        >
          {/* Pulsing rings */}
          <Animated.View
            style={{
              position: "absolute",
              width: 290,
              height: 290,
              borderRadius: 145,
              borderWidth: 1.5,
              borderColor: "rgba(220,38,38,0.2)",
              transform: [{ scale: ring2Scale }],
            }}
          />
          <Animated.View
            style={{
              position: "absolute",
              width: 215,
              height: 215,
              borderRadius: 108,
              borderWidth: 2,
              borderColor: "rgba(220,38,38,0.38)",
              transform: [{ scale: ringScale }],
            }}
          />

          <Text
            style={{
              color: "#f87171",
              fontSize: 12,
              fontWeight: "900",
              letterSpacing: 4,
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            🔴 ALARM ACTIVE
          </Text>
          <Text
            style={{
              color: "#ff3333",
              fontSize: 58,
              fontWeight: "900",
              textAlign: "center",
              letterSpacing: -2,
              lineHeight: 60,
              marginBottom: 8,
            }}
          >
            HELP!
          </Text>
          <Text
            style={{
              color: "#fca5a5",
              fontSize: 16,
              textAlign: "center",
              marginBottom: 6,
            }}
          >
            Location shared • Vibration alarm
          </Text>
          {countdown > 0 && (
            <Text
              style={{
                color: "#f59e0b",
                fontSize: 14,
                fontWeight: "700",
                marginBottom: 6,
              }}
            >
              {countdown}s
            </Text>
          )}
          <Text
            style={{
              color: "#6b7280",
              fontSize: 11,
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            {sosTimestamp}
          </Text>

          <View
            style={{
              flexDirection: "row",
              backgroundColor: modeObj.color + "18",
              borderRadius: 14,
              paddingHorizontal: 14,
              paddingVertical: 8,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: modeObj.color + "35",
            }}
          >
            <Text
              style={{ color: modeObj.color, fontWeight: "800", fontSize: 13 }}
            >
              {modeObj.label}
            </Text>
          </View>

          {location && (
            <View
              style={{
                backgroundColor: "rgba(239,68,68,0.12)",
                borderWidth: 1,
                borderColor: "rgba(239,68,68,0.28)",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 9,
                marginBottom: 44,
              }}
            >
              <Text
                style={{
                  color: "#f87171",
                  fontSize: 11,
                  fontWeight: "700",
                  textAlign: "center",
                }}
              >
                📍 {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
              </Text>
            </View>
          )}

          {/* BIG WHITE STOP BUTTON */}
          <TouchableOpacity
            onPress={cancelSOS}
            activeOpacity={0.85}
            style={{ alignItems: "center" }}
          >
            <View
              style={{
                width: 155,
                height: 155,
                borderRadius: 78,
                backgroundColor: "#ffffff",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#fff",
                shadowOpacity: 0.35,
                shadowRadius: 32,
                elevation: 20,
              }}
            >
              <Text
                style={{
                  color: "#dc2626",
                  fontSize: 30,
                  fontWeight: "900",
                  letterSpacing: 3,
                }}
              >
                STOP
              </Text>
              <X size={22} color="#dc2626" style={{ marginTop: 6 }} />
            </View>
          </TouchableOpacity>
          <Text style={{ color: "#52525b", fontSize: 13, marginTop: 18 }}>
            Tap STOP to cancel emergency
          </Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#04040E" }}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
      >
        <LinearGradient
          colors={["#130505", "#0c0308", "#04040E"]}
          style={{
            paddingTop: insets.top + 12,
            paddingHorizontal: 20,
            paddingBottom: 20,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 26,
              fontWeight: "900",
              letterSpacing: -0.5,
            }}
          >
            Emergency Hub
          </Text>
          <Text style={{ color: "#6b7280", fontSize: 14, marginTop: 3 }}>
            Alarm • Fake Call • AI Copilot • Contacts
          </Text>
        </LinearGradient>

        <View style={{ paddingHorizontal: 20 }}>
          {/* SOS Mode Selector */}
          <Text
            style={{
              color: "#fff",
              fontSize: 15,
              fontWeight: "900",
              marginBottom: 10,
            }}
          >
            SOS Mode
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              gap: 8,
              marginBottom: 18,
              paddingRight: 4,
            }}
            style={{ maxHeight: 56, flexGrow: 0 }}
          >
            {SOS_MODES.map((mode) => {
              const Icon = mode.icon;
              const active = sosMode === mode.id;
              return (
                <TouchableOpacity
                  key={mode.id}
                  onPress={() => {
                    setSosMode(mode.id);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  activeOpacity={0.8}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 7,
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 14,
                      backgroundColor: active
                        ? mode.color + "20"
                        : "rgba(255,255,255,0.04)",
                      borderWidth: 1.5,
                      borderColor: active
                        ? mode.color + "55"
                        : "rgba(255,255,255,0.08)",
                    }}
                  >
                    <Icon size={14} color={active ? mode.color : "#6b7280"} />
                    <Text
                      style={{
                        color: active ? mode.color : "#9ca3af",
                        fontWeight: "800",
                        fontSize: 13,
                      }}
                    >
                      {mode.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <SOSButton
            sosActive={sosActive}
            countdown={countdown}
            ringScale={ringScale}
            ring2Scale={ring2Scale}
            onPress={sosActive ? cancelSOS : () => triggerSOS(sosMode)}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              gap: 8,
              marginBottom: 20,
              paddingRight: 4,
            }}
            style={{ maxHeight: 44, flexGrow: 0 }}
          >
            <SectionTabs
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />
          </ScrollView>

          {activeSection === "sos" && (
            <AICopilotSection
              activeMode={activeMode}
              onModeChange={setActiveMode}
            />
          )}
          {activeSection === "fakecall" && (
            <FakeCallSection
              fakeCallCountdown={fakeCallCountdown}
              onTriggerFakeCall={triggerFakeCall}
            />
          )}
          {activeSection === "voice" && (
            <VoiceSOSSection
              voiceActive={voiceActive}
              onToggleVoice={setVoiceActive}
            />
          )}
          {activeSection === "contacts" && (
            <EmergencyContactsSection location={location} />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
