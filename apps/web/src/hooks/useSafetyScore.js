import { useState } from "react";

export function useSafetyScore(currentPos, reports) {
  const [destination, setDestination] = useState("");
  const [safetyScore, setSafetyScore] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState(null);

  const calculateScore = async () => {
    if (!destination.trim()) return;
    setCalculating(true);
    setError(null);
    setSafetyScore(null);
    try {
      const res = await fetch("/api/safety-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: currentPos
            ? "GPS " + currentPos.lat + "," + currentPos.lng
            : "current location",
          destination,
          time: new Date().toLocaleTimeString(),
          current_reports: reports,
          lat: currentPos?.lat,
          lng: currentPos?.lng,
        }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      setSafetyScore(data);
    } catch (err) {
      console.error(err);
      setError("Could not calculate score. Please try again.");
    } finally {
      setCalculating(false);
    }
  };

  return {
    destination,
    setDestination,
    safetyScore,
    calculating,
    error,
    calculateScore,
  };
}
