import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

/* ------------------------------------------------------------------ */
/*  Navigation structure with categories                               */
/* ------------------------------------------------------------------ */

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

interface NavGroup {
  id: string;
  label: string;
  icon: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    id: "people",
    label: "People & Programs",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    items: [
      { path: "/admin/volunteers", label: "Volunteers", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
      { path: "/admin/opportunities", label: "Opportunities", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
      { path: "/admin/applications", label: "Applications", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
      { path: "/admin/pledges", label: "Pledges", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    ],
  },
  {
    id: "content",
    label: "Content & Engagement",
    icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
    items: [
      { path: "/admin/webinars", label: "Webinars", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" },
      { path: "/admin/weekly-challenges", label: "Challenges", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
      { path: "/admin/certificates", label: "Certificates", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" },
    ],
  },
  {
    id: "insights",
    label: "Impact & Data",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    items: [
      { path: "/admin/impact", label: "Impact", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
      { path: "/admin/districts", label: "Districts", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" },
    ],
  },
  {
    id: "communication",
    label: "Communication",
    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    items: [
      { path: "/admin/contacts", label: "Messages", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
    ],
  },
];

const dashboardLink: NavItem = {
  path: "/admin/dashboard",
  label: "Dashboard",
  icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
};

/* ------------------------------------------------------------------ */
/*  Helper: find which group contains the active path                  */
/* ------------------------------------------------------------------ */

function findActiveGroup(pathname: string): string | null {
  for (const group of navGroups) {
    if (group.items.some((item) => pathname === item.path || pathname.startsWith(item.path + "/"))) {
      return group.id;
    }
  }
  return null;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { username, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-expand the group that contains the active route
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const active = findActiveGroup(location.pathname);
    return active ? new Set([active]) : new Set();
  });

  // When route changes, ensure the active group is expanded
  useEffect(() => {
    const active = findActiveGroup(location.pathname);
    if (active) {
      setExpandedGroups((prev) => {
        if (prev.has(active)) return prev;
        return new Set([...prev, active]);
      });
    }
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-emerald-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" /></svg>
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

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {/* Dashboard — standalone top link */}
        <button
          onClick={() => navigate(dashboardLink.path)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
            isActive(dashboardLink.path)
              ? "bg-emerald-800/60 text-emerald-300 border-l-2 border-emerald-400"
              : "text-emerald-100/70 hover:text-white hover:bg-white/5"
          }`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={dashboardLink.icon} />
          </svg>
          <span>{dashboardLink.label}</span>
        </button>

        <div className="h-px bg-emerald-800/50 my-2" />

        {/* Collapsible groups */}
        {navGroups.map((group) => {
          const expanded = expandedGroups.has(group.id);
          const hasActiveChild = group.items.some((item) => isActive(item.path));

          return (
            <div key={group.id}>
              {/* Group header — click to expand/collapse */}
              <button
                onClick={() => toggleGroup(group.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                  hasActiveChild && !expanded
                    ? "text-emerald-300"
                    : "text-emerald-100/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={group.icon} />
                </svg>
                <span className="flex-1">{group.label}</span>
                <svg
                  className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                    expanded ? "rotate-90" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Submenu items */}
              {expanded && (
                <div className="ml-4 mt-0.5 space-y-0.5 border-l border-emerald-800/50 pl-3">
                  {group.items.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all text-left ${
                        isActive(item.path)
                          ? "bg-emerald-800/40 text-emerald-300"
                          : "text-emerald-100/60 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                      </svg>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom: Profile + Logout */}
      <div className="p-3 border-t border-emerald-800 space-y-1">
        <button
          onClick={() => navigate("/admin/profile")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
            location.pathname === "/admin/profile"
              ? "bg-emerald-800/60 text-emerald-300"
              : "text-emerald-100/70 hover:text-white hover:bg-white/5"
          }`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span className="truncate">{username}</span>
        </button>
        <button
          onClick={async () => {
            await logout();
            navigate("/admin");
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-rose-300 hover:bg-rose-900/20 transition-all"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-emerald-900 text-white rounded-xl shadow-lg hover:bg-emerald-800 transition-colors"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Desktop sidebar — fixed */}
      <aside className="hidden lg:flex w-64 bg-emerald-950 text-white h-full flex-col flex-shrink-0 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar — overlay drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[70]">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-emerald-950 text-white flex flex-col shadow-2xl animate-slide-in-left">
            <div className="flex items-center justify-end p-3">
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-emerald-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
