import { useState } from "react";
import useAuth from "@/utils/useAuth";

function SignUpPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const { signUpWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password || !name) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      await signUpWithCredentials({
        email,
        password,
        name,
        callbackUrl: "/dashboard",
        redirect: true,
      });
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0a0a0c] p-4 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]" />

      <form
        noValidate
        onSubmit={onSubmit}
        className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Join SHEild AI
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Your personal safety companion powered by AI.
          </p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Full Name
            </label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sarah Jane"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sarah@example.com"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-violet-600 px-4 py-3 text-base font-semibold text-white shadow-lg transition-all hover:bg-violet-700 hover:shadow-violet-500/25 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <p className="text-center text-sm text-gray-400">
            Already have an account?{" "}
            <a
              href="/account/signin"
              className="font-medium text-violet-400 hover:text-violet-300"
            >
              Sign in
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}

export default SignUpPage;
