import { useState, useRef } from "react";
import { Vibration } from "react-native";
import * as Haptics from "expo-haptics";

export function useFakeCall() {
  const [fakeCallActive, setFakeCallActive] = useState(false);
  const [fakeCallCaller, setFakeCallCaller] = useState(null);
  const [fakeCallCountdown, setFakeCallCountdown] = useState(0);
  const fakeCallRef = useRef(null);

  const triggerFakeCall = (caller) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setFakeCallCaller(caller);
    setFakeCallCountdown(caller.delay);
    fakeCallRef.current = setInterval(() => {
      setFakeCallCountdown((c) => {
        if (c <= 1) {
          clearInterval(fakeCallRef.current);
          setFakeCallActive(true);
          Vibration.vibrate([0, 1000, 500], true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const endFakeCall = () => {
    setFakeCallActive(false);
    setFakeCallCaller(null);
    setFakeCallCountdown(0);
    clearInterval(fakeCallRef.current);
    Vibration.cancel();
  };

  return {
    fakeCallActive,
    fakeCallCaller,
    fakeCallCountdown,
    triggerFakeCall,
    endFakeCall,
  };
}
