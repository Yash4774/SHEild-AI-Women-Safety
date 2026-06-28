import { useState, useEffect } from "react";

export function useAlertRotation(alertCount, interval = 3800) {
  const [alertIdx, setAlertIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setAlertIdx((i) => (i + 1) % alertCount),
      interval,
    );
    return () => clearInterval(id);
  }, [alertCount, interval]);

  return alertIdx;
}
