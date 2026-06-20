import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  TreePine,
  Award,
  Briefcase,
  MessageSquare,
  Map,
  LogOut,
  Shield,
  BarChart,
  Megaphone,
  Sparkles,
  Monitor,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const links = [
  { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/opportunities", label: "Opportunities", icon: Megaphone },
  { path: "/admin/webinars", label: "Webinars", icon: Monitor },
  { path: "/admin/pledges", label: "Pledges", icon: TreePine },
  { path: "/admin/certificates", label: "Certificates", icon: Award },
  { path: "/admin/weekly-challenges", label: "Challenges", icon: Sparkles },
  { path: "/admin/applications", label: "Applications", icon: Briefcase },
  { path: "/admin/contacts", label: "Messages", icon: MessageSquare },
  { path: "/admin/impact", label: "Impact", icon: BarChart },
  { path: "/admin/districts", label: "Districts", icon: Map },
];

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { username, logout } = useAuth();

  return (
    <aside className="w-64 bg-emerald-950 text-white min-h-screen flex flex-col flex-shrink-0">
      <div className="p-5 border-b border-emerald-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500 rounded-lg">
            <Shield className="h-5 w-5 text-emerald-950" />
          </div>
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
          const Icon = link.icon;
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
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span>{link.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-3 border-t border-emerald-800 space-y-2">
        <div className="px-3 py-2 text-xs text-emerald-300/60 font-mono truncate">
          {username}
        </div>
        <button
          onClick={async () => {
            await logout();
            navigate("/admin");
          }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-rose-300 hover:bg-rose-900/20 transition-all"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
