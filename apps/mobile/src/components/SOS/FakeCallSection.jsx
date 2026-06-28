import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Clock, Phone } from "lucide-react-native";
import { FAKE_CALLERS } from "@/constants/fakeCallers";

export function FakeCallSection({ fakeCallCountdown, onTriggerFakeCall }) {
  return (
    <View>
      <Text
        style={{
          color: "#fff",
          fontSize: 17,
          fontWeight: "900",
          marginBottom: 6,
        }}
      >
        Fake Call Generator
      </Text>
      <Text style={{ color: "#6b7280", fontSize: 14, marginBottom: 18 }}>
        Schedule a fake incoming call to escape an uncomfortable situation
      </Text>
      {fakeCallCountdown > 0 && (
        <View
          style={{
            backgroundColor: "rgba(245,158,11,0.1)",
            borderWidth: 1,
            borderColor: "rgba(245,158,11,0.25)",
            borderRadius: 14,
            padding: 16,
            marginBottom: 16,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Clock size={18} color="#f59e0b" style={{ marginRight: 12 }} />
          <Text
            style={{
              color: "#fbbf24",
              fontWeight: "700",
              fontSize: 16,
            }}
          >
            Calling in {fakeCallCountdown}s...
          </Text>
        </View>
      )}
      <View style={{ gap: 10 }}>
        {FAKE_CALLERS.map((caller, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => onTriggerFakeCall(caller)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.04)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
              borderRadius: 16,
              padding: 16,
            }}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 28, marginRight: 14 }}>
              {caller.emoji}
            </Text>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "700",
                  fontSize: 15,
                }}
              >
                {caller.name}
              </Text>
              <Text style={{ color: "#6b7280", fontSize: 13, marginTop: 2 }}>
                Rings in {caller.delay} seconds
              </Text>
            </View>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 11,
                backgroundColor: "rgba(16,185,129,0.15)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Phone size={16} color="#10b981" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
