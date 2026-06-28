import { Linking, Platform } from "react-native";
import * as Haptics from "expo-haptics";

// ── IST time formatter (UTC+5:30) ──────────────────────────────────
export function getISTTimestamp() {
  const now = new Date();
  const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  const dd = String(istTime.getUTCDate()).padStart(2, "0");
  const mm = String(istTime.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = istTime.getUTCFullYear();
  const hh = String(istTime.getUTCHours()).padStart(2, "0");
  const min = String(istTime.getUTCMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min} IST`;
}

export function useISTClock() {
  return getISTTimestamp();
}

// ── Emergency call ────────────────────────────────────────────────
export function callEmergency(number) {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  Linking.openURL("tel:" + number);
}

// ── SMS with live location ────────────────────────────────────────
export function sendLocationSMS(lat, lng) {
  const ts = getISTTimestamp();
  const body = encodeURIComponent(
    `🆘 SHEild AI EMERGENCY SOS!\n📍 Location: https://maps.google.com/?q=${lat},${lng}\n🕐 ${ts}\n⚠ I need immediate help! Please respond!`,
  );
  const url =
    Platform.OS === "ios" ? `sms:112&body=${body}` : `sms:112?body=${body}`;
  Linking.openURL(url).catch(() => Linking.openURL(`sms:?body=${body}`));
}

export function formatPhoneNumber(number) {
  return number.replace(/(\d{1,4})(\d{3})(\d{3,4})/, "$1 $2 $3");
}
