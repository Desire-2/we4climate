import { useEffect, useState, type FormEvent } from "react";
import {
  adminFetchProfile,
  adminUpdateProfile,
  adminChangePassword,
  type ApiAdminProfile,
} from "../api/client";
import { useAuth } from "../contexts/AuthContext";

export default function AdminProfile() {
  const { setUsername } = useAuth() as { setUsername: (u: string | null) => void };

  const [profile, setProfile] = useState<ApiAdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Username form
  const [usernameVal, setUsernameVal] = useState("");
  const [usernameMsg, setUsernameMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [usernameBusy, setUsernameBusy] = useState(false);

  // Password form
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwMsg, setPwMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [pwBusy, setPwBusy] = useState(false);

  useEffect(() => {
    adminFetchProfile().then((p) => {
      setProfile(p);
      if (p) setUsernameVal(p.username);
      setLoading(false);
    });
  }, []);

  const handleUsername = async (e: FormEvent) => {
    e.preventDefault();
    setUsernameMsg(null);
    const trimmed = usernameVal.trim();
    if (!trimmed || trimmed.length < 3) {
      setUsernameMsg({ type: "err", text: "Username must be at least 3 characters." });
      return;
    }
    setUsernameBusy(true);
    const result = await adminUpdateProfile(trimmed);
    setUsernameBusy(false);
    if (!result) {
      setUsernameMsg({ type: "err", text: "Failed to update username. It may already be taken." });
    } else {
      setProfile(result);
      setUsernameVal(result.username);
      setUsername(result.username);
      localStorage.setItem("admin_username", result.username);
      setUsernameMsg({ type: "ok", text: "Username updated successfully." });
    }
  };

  const handlePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (newPw.length < 6) {
      setPwMsg({ type: "err", text: "New password must be at least 6 characters." });
      return;
    }
    if (newPw !== confirmPw) {
      setPwMsg({ type: "err", text: "New passwords do not match." });
      return;
    }
    setPwBusy(true);
    const result = await adminChangePassword(currentPw, newPw);
    setPwBusy(false);
    if (!result) {
      setPwMsg({ type: "err", text: "Failed to change password. Check your current password." });
    } else {
      setPwMsg({ type: "ok", text: "Password changed successfully." });
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="h-6 w-6 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your admin account</p>
      </div>

      {/* Account info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Account Information</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Username</span>
            <span className="font-medium text-gray-900">{profile?.username}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">User ID</span>
            <span className="font-medium text-gray-900">#{profile?.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Created</span>
            <span className="font-medium text-gray-900">
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Update username */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Update Username</h2>
        <form onSubmit={handleUsername} className="flex gap-3 items-end">
          <div className="flex-1">
            <input
              type="text"
              value={usernameVal}
              onChange={(e) => setUsernameVal(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
              placeholder="New username"
              required
            />
          </div>
          <button
            type="submit"
            disabled={usernameBusy}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all whitespace-nowrap"
          >
            {usernameBusy ? "Saving..." : "Save"}
          </button>
        </form>
        {usernameMsg && (
          <p className={`mt-3 text-xs px-3 py-2 rounded-xl border ${
            usernameMsg.type === "ok"
              ? "text-emerald-700 bg-emerald-50 border-emerald-200"
              : "text-rose-600 bg-rose-50 border-rose-200"
          }`}>
            {usernameMsg.text}
          </p>
        )}
      </div>

      {/* Change password */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Change Password</h2>
        <form onSubmit={handlePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">New Password</label>
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
              placeholder="At least 6 characters"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
              required
            />
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={pwBusy}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all"
            >
              {pwBusy ? "Changing..." : "Change Password"}
            </button>
            {pwMsg && (
              <p className={`text-xs ${
                pwMsg.type === "ok" ? "text-emerald-600" : "text-rose-600"
              }`}>
                {pwMsg.text}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
