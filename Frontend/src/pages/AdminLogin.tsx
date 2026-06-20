import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Shield, Eye, EyeOff, LogIn, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const { token, loading, login } = useAuth();
  const navigate = useNavigate();

  // Already authenticated — redirect to dashboard
  if (!loading && token) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Still checking auth status
  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-950 flex items-center justify-center">
        <Loader2 className="h-6 w-6 text-emerald-400 animate-spin" />
      </div>
    );
  }
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const err = await login(username, password);
    setBusy(false);
    if (err) {
      setError(err);
    } else {
      navigate("/admin/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-emerald-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-emerald-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-3 mb-4 group/flickr">
            {/* Flickr-styled pulsing dots — same branding cue as the navbar */}
            <span className="w-3 h-3 bg-[#0063db] rounded-full animate-pulse group-hover/flickr:animate-none" style={{ animationDelay: '0ms', animationDuration: '2s' }} />
            <div className="inline-flex p-3 bg-emerald-100 rounded-2xl text-emerald-700">
              <Shield className="h-8 w-8" />
            </div>
            <span className="w-3 h-3 bg-[#ff0084] rounded-full animate-pulse group-hover/flickr:animate-none" style={{ animationDelay: '300ms', animationDuration: '2.4s' }} />
          </div>
          <h1 className="font-display font-bold text-2xl text-gray-900">
            Admin Login
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            We4Climate Management Panel
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
              placeholder="admin"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            {busy ? (
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
