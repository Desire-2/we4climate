import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { useAuth } from "../contexts/AuthContext";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-950 flex items-center justify-center">
        <span className="h-6 w-6 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
