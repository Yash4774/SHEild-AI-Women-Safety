import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PhoneCall, Phone } from "lucide-react-native";

export function FakeCallScreen({ caller, onEnd }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#0B1A0B" }}>
      <LinearGradient
        colors={["#0d240d", "#111a11", "#0B1A0B"]}
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 30,
        }}
      >
        <Text style={{ fontSize: 60, marginBottom: 12 }}>{caller.emoji}</Text>
        <Text
          style={{
            color: "#fff",
            fontSize: 28,
            fontWeight: "900",
            letterSpacing: -0.5,
            marginBottom: 6,
          }}
        >
          {caller.name}
        </Text>
        <Text
          style={{
            color: "#10b981",
            fontSize: 16,
            fontWeight: "700",
            marginBottom: 60,
          }}
        >
          Incoming call...
        </Text>
        <View
          style={{
            position: "absolute",
            bottom: 80,
            flexDirection: "row",
            gap: 60,
          }}
        >
          <TouchableOpacity
            onPress={onEnd}
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: "#dc2626",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#dc2626",
              shadowOpacity: 0.6,
              shadowRadius: 16,
            }}
          >
            <PhoneCall size={30} color="#fff" />
          </TouchableOpacity>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: "#10b981",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#10b981",
              shadowOpacity: 0.6,
              shadowRadius: 16,
            }}
          >
            <Phone size={30} color="#fff" />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
