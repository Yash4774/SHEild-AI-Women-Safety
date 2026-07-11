import { useEffect } from "react";

export default function AuthSessionPage() {
  useEffect(() => {
    window.location.replace("/account/signin");
  }, []);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0a0a0c] text-white">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-violet-500 border-t-transparent mx-auto" />
        <p className="text-gray-400 italic">Checking session...</p>
      </div>
    </div>
  );
}

