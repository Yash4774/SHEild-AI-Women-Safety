import { useState, useRef, useEffect } from "react";
import { Animated, Vibration, Linking, Platform } from "react-native";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";

// IST time formatter (UTC+5:30)
function getISTTimestamp() {
  const now = new Date();
  const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  const dd = String(istTime.getUTCDate()).padStart(2, "0");
  const mm = String(istTime.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = istTime.getUTCFullYear();
  const hh = String(istTime.getUTCHours()).padStart(2, "0");
  const min = String(istTime.getUTCMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min} IST`;
}

export function sendLocationSMS(lat, lng) {
  const ts = getISTTimestamp();
  const body = encodeURIComponent(
    `🆘 SHEild AI EMERGENCY SOS!\n📍 Location: https://maps.google.com/?q=${lat},${lng}\n🕐 ${ts}\n⚠ I need immediate help! Please respond!`,
  );
  const url =
    Platform.OS === "ios" ? `sms:112&body=${body}` : `sms:112?body=${body}`;
  Linking.openURL(url).catch(() => Linking.openURL(`sms:?body=${body}`));
}

export function useSOSState() {
  const [sosActive, setSosActive] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [location, setLocation] = useState(null);
  const [sosTimestamp, setSosTimestamp] = useState("");
  const countdownRef = useRef(null);

  const ringScale = useRef(new Animated.Value(1)).current;
  const ring2Scale = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;
  const ringLoop = useRef(null);

  useEffect(() => {
    Location.requestForegroundPermissionsAsync().then(({ status }) => {
      if (status === "granted") {
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        }).then((loc) =>
          setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude }),
        );
      }
    });
    return () => {
      if (ringLoop.current) ringLoop.current.stop();
      Vibration.cancel();
    };
  }, []);

  useEffect(() => {
    if (sosActive) {
      ringLoop.current = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(ringScale, {
              toValue: 1.35,
              duration: 650,
              useNativeDriver: true,
            }),
            Animated.timing(ringScale, {
              toValue: 1,
              duration: 650,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(ring2Scale, {
              toValue: 1.58,
              duration: 900,
              useNativeDriver: true,
            }),
            Animated.timing(ring2Scale, {
              toValue: 1,
              duration: 900,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 480,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0.5,
              duration: 480,
              useNativeDriver: true,
            }),
          ]),
        ]),
      );
      ringLoop.current.start();
      // Loud repeating vibration alarm
      Vibration.vibrate([0, 500, 150, 500, 150, 800, 150, 500], true);
    } else {
      if (ringLoop.current) {
        ringLoop.current.stop();
        ringLoop.current = null;
      }
      ringScale.setValue(1);
      ring2Scale.setValue(1);
      glowAnim.setValue(0.5);
      Vibration.cancel();
    }
  }, [sosActive]);

  const triggerSOS = async (mode = "full") => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const ts = getISTTimestamp();
    setSosTimestamp(ts);
    setSosActive(true);
    setCountdown(5);

    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const lat = loc.coords.latitude,
          lng = loc.coords.longitude;
        setLocation({ lat, lng });

        // Log SOS to backend with IST timestamp
        await fetch("/api/sos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location_lat: lat,
            location_lng: lng,
            message: `🆘 SOS [${mode.toUpperCase()}] — ${ts} — https://maps.google.com/?q=${lat},${lng}`,
          }),
        });

        // Send SMS if mode requires it
        if (mode === "siren_sms" || mode === "full") {
          sendLocationSMS(lat, lng);
        }
      }
    } catch (e) {
      console.error("SOS backend error:", e);
    }
  };

  const cancelSOS = () => {
    clearInterval(countdownRef.current);
    setSosActive(false);
    setCountdown(0);
    Vibration.cancel();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return {
    sosActive,
    countdown,
    location,
    sosTimestamp,
    ringScale,
    ring2Scale,
    glowAnim,
    triggerSOS,
    cancelSOS,
  };
}
