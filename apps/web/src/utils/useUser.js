import * as React from "react";
import { STORAGE_KEY } from "@/utils/useAuth";

function readStoredUser() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

const useUser = () => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const refetchUser = React.useCallback(() => {
    setUser(readStoredUser());
    setLoading(false);
  }, []);

  React.useEffect(() => {
    refetchUser();

    window.addEventListener("storage", refetchUser);
    window.addEventListener("sheild-auth-change", refetchUser);

    return () => {
      window.removeEventListener("storage", refetchUser);
      window.removeEventListener("sheild-auth-change", refetchUser);
    };
  }, [refetchUser]);

  return {
    user,
    data: user,
    loading,
    refetch: refetchUser,
  };
};

export { useUser };
export default useUser;
