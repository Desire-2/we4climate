import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { adminLogin, adminVerify, adminLogout } from "../api/client";

interface AuthState {
  token: string | null;
  username: string | null;
  loading: boolean;
  login: (u: string, p: string) => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("admin_token"),
  );
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    adminVerify().then((result) => {
      if (result === null) {
        // Backend is unreachable (network error) — keep the cached session alive
        // so the user isn't kicked to login on a momentary outage / dev restart.
        setUsername(localStorage.getItem("admin_username") || "Admin");
      } else if (!result.valid) {
        // Backend explicitly rejected the token — clear session
        localStorage.removeItem("admin_token");
        setToken(null);
      } else {
        // Token is valid — use admin data from the API response
        setUsername(result.admin?.username || localStorage.getItem("admin_username") || "Admin");
      }
      setLoading(false);
    });
  }, [token]);

  const login = async (u: string, p: string): Promise<string | null> => {
    const data = await adminLogin(u, p);
    if (!data) return "Invalid credentials or server unreachable.";
    setToken(data.token);
    setUsername(data.admin.username);
    localStorage.setItem("admin_username", data.admin.username);
    return null;
  };

  const logout = async () => {
    await adminLogout();
    setToken(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ token, username, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
