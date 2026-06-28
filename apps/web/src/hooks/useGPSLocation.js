import { useState, useEffect } from "react";

// IST helpers
export function getNowIST() {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  const pad = (n) => String(n).padStart(2, "0");
  return {
    full: `${pad(ist.getUTCDate())}/${pad(ist.getUTCMonth() + 1)}/${ist.getUTCFullYear()} ${pad(ist.getUTCHours())}:${pad(ist.getUTCMinutes())}:${pad(ist.getUTCSeconds())} IST`,
    time: `${pad(ist.getUTCHours())}:${pad(ist.getUTCMinutes())}:${pad(ist.getUTCSeconds())}`,
    date: `${pad(ist.getUTCDate())}/${pad(ist.getUTCMonth() + 1)}/${ist.getUTCFullYear()}`,
  };
}

export function useISTClock() {
  const [clock, setClock] = useState(getNowIST());
  useEffect(() => {
    const id = setInterval(() => setClock(getNowIST()), 1000);
    return () => clearInterval(id);
  }, []);
  return clock;
}

export function useGPSLocation() {
  const [currentPos, setCurrentPos] = useState(null);
  const [cityName, setCityName] = useState("");
  const [gpsStatus, setGpsStatus] = useState("acquiring"); // acquiring | connected | denied

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGpsStatus("denied");
      return;
    }
    setGpsStatus("acquiring");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude,
          lng = pos.coords.longitude;
        setCurrentPos({ lat, lng });
        setGpsStatus("connected");
        // Reverse geocode for city name
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&accept-language=en`,
          );
          if (res.ok) {
            const data = await res.json();
            const city =
              data.address?.city ||
              data.address?.town ||
              data.address?.state_district ||
              "";
            const state = data.address?.state || "";
            setCityName([city, state].filter(Boolean).join(", "));
          }
        } catch {}
      },
      () => setGpsStatus("denied"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  return { currentPos, gpsStatus, cityName };
}
