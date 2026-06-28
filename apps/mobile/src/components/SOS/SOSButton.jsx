import React from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Shield,
  X,
  Navigation,
  Volume2,
  Users,
  Mic,
} from "lucide-react-native";
import { SOS_FEATURES } from "@/constants/sosConstants";

export function SOSButton({
  sosActive,
  countdown,
  ringScale,
  ring2Scale,
  onPress,
}) {
  return (
    <View
      style={{
        alignItems: "center",
        paddingVertical: 36,
        marginBottom: 24,
      }}
    >
      {sosActive && (
        <>
          <Animated.View
            style={{
              position: "absolute",
              width: 220,
              height: 220,
              borderRadius: 110,
              borderWidth: 1.5,
              borderColor: "rgba(220,38,38,0.25)",
              transform: [{ scale: ring2Scale }],
            }}
          />
          <Animated.View
            style={{
              position: "absolute",
              width: 180,
              height: 180,
              borderRadius: 90,
              borderWidth: 2,
              borderColor: "rgba(220,38,38,0.4)",
              transform: [{ scale: ringScale }],
            }}
          />
        </>
      )}

      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        <LinearGradient
          colors={
            sosActive
              ? ["#991b1b", "#dc2626", "#ef4444"]
              : ["#7f1d1d", "#dc2626", "#b91c1c"]
          }
          style={{
            width: 150,
            height: 150,
            borderRadius: 75,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#dc2626",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: sosActive ? 0.9 : 0.55,
            shadowRadius: sosActive ? 40 : 24,
            elevation: 24,
          }}
        >
          {sosActive ? (
            <View style={{ alignItems: "center" }}>
              <X size={40} color="#fff" />
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "900",
                  fontSize: 20,
                  marginTop: 4,
                }}
              >
                {countdown}s
              </Text>
            </View>
          ) : (
            <View style={{ alignItems: "center" }}>
              <Shield size={52} color="#fff" />
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <Text
        style={{
          color: sosActive ? "#f87171" : "#fff",
          fontWeight: "900",
          fontSize: 22,
          marginTop: 22,
          letterSpacing: -0.5,
          textAlign: "center",
        }}
      >
        {sosActive ? "SOS ACTIVE — TAP TO CANCEL" : "Emergency SOS"}
      </Text>
      <Text
        style={{
          color: "#6b7280",
          fontSize: 14,
          marginTop: 6,
          textAlign: "center",
          paddingHorizontal: 20,
        }}
      >
        {sosActive
          ? "📍 Location shared • Contacts alerted • Recording active"
          : "Tap to share location, alert contacts & activate alarm"}
      </Text>

      {!sosActive && (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 8,
            marginTop: 16,
          }}
        >
          {SOS_FEATURES.map((f, i) => {
            const iconMap = {
              "Live Location": Navigation,
              Alarm: Volume2,
              Guardians: Users,
              "Voice SOS": Mic,
            };
            const Icon = iconMap[f.label];
            return (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderRadius: 10,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                }}
              >
                <Icon size={11} color={f.color} style={{ marginRight: 5 }} />
                <Text
                  style={{
                    color: "#9ca3af",
                    fontSize: 11,
                    fontWeight: "600",
                  }}
                >
                  {f.label}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
