import { useCallback } from "react";

const STORAGE_KEY = "sheild_ai_user";

function getCallbackUrl(options) {
  if (typeof window === "undefined") return options?.callbackUrl || "/";

  const urlCallback = new URLSearchParams(window.location.search).get(
    "callbackUrl",
  );

  return urlCallback || options?.callbackUrl || "/dashboard";
}

function buildUser({ email, name, image }) {
  const normalizedEmail =
    typeof email === "string" && email.trim().length > 0
      ? email.trim()
      : "demo@sheild.ai";

  return {
    id: normalizedEmail,
    email: normalizedEmail,
    name:
      typeof name === "string" && name.trim().length > 0
        ? name.trim()
        : normalizedEmail.split("@")[0] || "SHEild User",
    image: typeof image === "string" ? image : null,
  };
}

function saveUser(user) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("sheild-auth-change"));
}

function redirectTo(callbackUrl) {
  if (typeof window !== "undefined") {
    window.location.href = callbackUrl;
  }
}

function useAuth() {
  const signInWithCredentials = useCallback((options = {}) => {
    const user = buildUser(options);
    saveUser(user);
    redirectTo(getCallbackUrl(options));
    return Promise.resolve({ ok: true, user });
  }, []);

  const signUpWithCredentials = useCallback((options = {}) => {
    const user = buildUser(options);
    saveUser(user);
    redirectTo(getCallbackUrl(options));
    return Promise.resolve({ ok: true, user });
  }, []);

  const signInWithGoogle = useCallback((options = {}) => {
    const user = buildUser({
      email: "google.user@sheild.ai",
      name: "Google User",
      image: "https://www.google.com/favicon.ico",
    });
    saveUser(user);
    redirectTo(getCallbackUrl(options));
    return Promise.resolve({ ok: true, user });
  }, []);

  const signOut = useCallback((options = {}) => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event("sheild-auth-change"));
      window.location.href = options.callbackUrl || "/";
    }
    return Promise.resolve({ ok: true });
  }, []);

  return {
    signInWithCredentials,
    signUpWithCredentials,
    signInWithGoogle,
    signInWithFacebook: signInWithGoogle,
    signInWithTwitter: signInWithGoogle,
    signInWithApple: signInWithGoogle,
    signOut,
  };
}

export { STORAGE_KEY };
export default useAuth;
