import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

const links = [
  { path: "/admin/dashboard", label: "Dashboard" },
  { path: "/admin/volunteers", label: "Volunteers" },
  { path: "/admin/opportunities", label: "Opportunities" },
  { path: "/admin/webinars", label: "Webinars" },
  { path: "/admin/pledges", label: "Pledges" },
  { path: "/admin/certificates", label: "Certificates" },
  { path: "/admin/weekly-challenges", label: "Challenges" },
  { path: "/admin/applications", label: "Applications" },
  { path: "/admin/contacts", label: "Messages" },
  { path: "/admin/impact", label: "Impact" },
  { path: "/admin/districts", label: "Districts" },
];

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { username, logout } = useAuth();

  return (
    <aside className="w-64 bg-emerald-950 text-white min-h-screen flex flex-col flex-shrink-0">
      <div className="p-5 border-b border-emerald-800">
        <div className="flex items-center gap-2.5">

          <div>
            <span className="font-display font-bold text-sm text-white block leading-tight">
              We4Climate
            </span>
            <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-mono">
              Admin Panel
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {links.map((link) => {
          const active = location.pathname === link.path;
          return (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                active
                  ? "bg-emerald-800/60 text-emerald-300 border-l-2 border-emerald-400"
                  : "text-emerald-100/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{link.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-3 border-t border-emerald-800 space-y-2">
        <button
          onClick={() => navigate("/admin/profile")}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${
            location.pathname === "/admin/profile"
              ? "bg-emerald-800/60 text-emerald-300"
              : "text-emerald-100/70 hover:text-white hover:bg-white/5"
          }`}
        >
          <span>{username}</span>
        </button>
        <button
          onClick={async () => {
            await logout();
            navigate("/admin");
          }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-rose-300 hover:bg-rose-900/20 transition-all"
        >
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
