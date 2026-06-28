import { useState } from "react";
import useAuth from "@/utils/useAuth";

function SignInPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signInWithCredentials, signInWithGoogle } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      await signInWithCredentials({
        email,
        password,
        callbackUrl: "/dashboard",
        redirect: true,
      });
    } catch (err) {
      setError("Invalid email or password.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle({
        callbackUrl: "/dashboard",
        redirect: true,
      });
    } catch (err) {
      setError("Google sign-in failed.");
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0a0a0c] p-4 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.1),transparent_50%)]" />

      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Sign in to stay protected with SHEild AI.
          </p>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="mb-6 flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-white/10 active:scale-[0.98]"
        >
          <img
            src="https://www.google.com/favicon.ico"
            className="h-4 w-4"
            alt="Google"
          />
          Continue with Google
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#0a0a0c] px-2 text-gray-500">
              Or continue with email
            </span>
          </div>
        </div>

        <form noValidate onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sarah@example.com"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50"
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
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50"
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
            className="w-full rounded-xl bg-pink-600 px-4 py-3 text-base font-semibold text-white shadow-lg transition-all hover:bg-pink-700 hover:shadow-pink-500/25 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <a
              href="/account/signup"
              className="font-medium text-pink-400 hover:text-pink-300"
            >
              Create account
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignInPage;
