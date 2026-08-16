import { useEffect, useState, useRef, useCallback, type ReactNode } from "react";

import {
  adminFetchVolunteers,
  adminUpdateVolunteer,
  adminLogVolunteerHours,
  adminDeleteVolunteer,
  adminBulkUpdateVolunteers,
  adminFetchVolunteerStats,
  adminExportVolunteersUrl,
  type ApiVolunteer,
} from "../api/client";

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-blue-50 text-blue-700 border-blue-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-purple-50 text-purple-700 border-purple-200",
  suspended: "bg-orange-50 text-orange-700 border-orange-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
};

const statusDot: Record<string, string> = {
  pending: "bg-amber-500",
  approved: "bg-blue-500",
  active: "bg-emerald-500",
  completed: "bg-purple-500",
  suspended: "bg-orange-500",
  rejected: "bg-rose-500",
};

const statusNext: Record<string, string | null> = {
  pending: "approved",
  approved: "active",
  active: "completed",
  completed: null,
  suspended: "active",
  rejected: null,
};

const VALID_STATUSES = ["pending", "approved", "active", "completed", "suspended", "rejected"];

const INPUT_CLASS =
  "w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none transition-all";

/* ─────────────────────────────────────────────────────────── */
/*  Tiny helpers                                               */
/* ─────────────────────────────────────────────────────────── */

function StatCard({ label, value, color, icon }: { label: string; value: number | string; color: string; icon: ReactNode }) {
  return (
    <div className={`rounded-2xl border p-5 ${color} flex items-start gap-3`}>
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="text-[10px] uppercase tracking-widest font-bold opacity-60">{label}</p>
        <p className="mt-1 text-2xl font-display font-black">{value}</p>
      </div>
    </div>
  );
}

function FieldRow({ label, value }: { label: string; value: string; key?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 shrink-0 min-w-[130px]">{label}</span>
      <span className="text-xs text-gray-700 leading-relaxed text-right">{value || "—"}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Action Dropdown (per row)                                  */
/* ─────────────────────────────────────────────────────────── */

function ActionDropdown({
  vol,
  onAction,
}: {
  vol: ApiVolunteer;
  onAction: (action: string, vol: ApiVolunteer) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const next = statusNext[vol.status];

  const items: Array<{ label: string; action: string; color: string; icon: string }> = [];
  if (next) items.push({ label: `Advance → ${next}`, action: "advance", color: "text-emerald-700 hover:bg-emerald-50", icon: "→" });
  if (vol.status !== "approved" && vol.status !== "completed") items.push({ label: "Approve", action: "approve", color: "text-blue-700 hover:bg-blue-50", icon: "✓" });
  if (vol.status !== "rejected" && vol.status !== "completed") items.push({ label: "Reject", action: "reject", color: "text-rose-600 hover:bg-rose-50", icon: "✕" });
  if (vol.status !== "suspended" && vol.status !== "rejected" && vol.status !== "completed") items.push({ label: "Suspend", action: "suspend", color: "text-orange-600 hover:bg-orange-50", icon: "⏸" });
  if (vol.status !== "completed" && vol.status !== "rejected") items.push({ label: "Mark Completed", action: "complete", color: "text-purple-700 hover:bg-purple-50", icon: "★" });
  items.push({ label: "Log Hours", action: "hours", color: "text-indigo-700 hover:bg-indigo-50", icon: "+" });
  items.push({ label: "View Details", action: "view", color: "text-gray-700 hover:bg-gray-50", icon: "👁" });
  items.push({ label: "Delete", action: "delete", color: "text-rose-500 hover:bg-rose-50", icon: "🗑" });

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
        title="Actions"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-2">
          {items.map((item) => (
            <button
              key={item.action}
              onClick={() => { setOpen(false); onAction(item.action, vol); }}
              className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center gap-2.5 transition-colors ${item.color}`}
            >
              <span className="text-sm w-4 text-center">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Status Change Modal (approve / reject / suspend / etc.)    */
/* ─────────────────────────────────────────────────────────── */

function StatusChangeModal({
  vol,
  newStatus,
  onClose,
  onConfirm,
}: {
  vol: ApiVolunteer;
  newStatus: string;
  onClose: () => void;
  onConfirm: (message: string) => void;
}) {
  const [message, setMessage] = useState("");
  const labels: Record<string, { title: string; desc: string; color: string; btn: string }> = {
    approved: { title: "Approve Application", desc: `Approve ${vol.full_name}'s volunteer application? They will receive an email with next steps.`, color: "bg-emerald-600 hover:bg-emerald-500", btn: "Approve & Send Email" },
    rejected: { title: "Reject Application", desc: `Reject ${vol.full_name}'s volunteer application? They will receive a professional decline email.`, color: "bg-rose-600 hover:bg-rose-500", btn: "Reject & Send Email" },
    suspended: { title: "Suspend Volunteer", desc: `Temporarily suspend ${vol.full_name}'s participation? They will be notified by email.`, color: "bg-orange-600 hover:bg-orange-500", btn: "Suspend & Notify" },
    active: { title: "Activate Volunteer", desc: `Move ${vol.full_name} to active status? They will receive a welcome-back email.`, color: "bg-emerald-600 hover:bg-emerald-500", btn: "Activate" },
    completed: { title: "Mark as Completed", desc: `Mark ${vol.full_name}'s volunteer program as completed? They will receive a thank-you email.`, color: "bg-purple-600 hover:bg-purple-500", btn: "Complete & Thank" },
  };

  const cfg = labels[newStatus] || labels.approved;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold ${newStatus === "approved" ? "bg-emerald-500" : newStatus === "rejected" ? "bg-rose-500" : newStatus === "suspended" ? "bg-orange-500" : "bg-purple-500"}`}>
            {newStatus === "approved" ? "✓" : newStatus === "rejected" ? "✕" : newStatus === "suspended" ? "⏸" : "★"}
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-gray-900">{cfg.title}</h3>
            <p className="text-xs text-gray-500">VOL-{vol.id}</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed mb-4">{cfg.desc}</p>

        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            {newStatus === "rejected" ? "Reason (required)" : "Message to volunteer (optional)"}
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              newStatus === "approved"
                ? "Welcome aboard! We look forward to seeing you..."
                : newStatus === "rejected"
                ? "After careful review, we are unable to proceed..."
                : newStatus === "completed"
                ? "Thank you for your incredible contribution..."
                : "Optional details for the volunteer..."
            }
            className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:border-emerald-500 focus:outline-none resize-none"
            rows={3}
            autoFocus
          />
        </div>

        <div className="flex items-center gap-2 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(message)}
            disabled={newStatus === "rejected" && !message.trim()}
            className={`px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-colors shadow-md disabled:opacity-40 disabled:cursor-not-allowed ${cfg.color}`}
          >
            {cfg.btn}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Main Page                                                  */
/* ─────────────────────────────────────────────────────────── */

export default function AdminVolunteers() {
  const [data, setData] = useState<ApiVolunteer[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalFiltered, setTotalFiltered] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [detailVol, setDetailVol] = useState<ApiVolunteer | null>(null);
  const [notesValue, setNotesValue] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof adminFetchVolunteerStats>> | null>(null);
  const [hoursModal, setHoursModal] = useState<{ volId: number; name: string } | null>(null);
  const [hoursValue, setHoursValue] = useState("");
  const [statusModal, setStatusModal] = useState<{ vol: ApiVolunteer; newStatus: string } | null>(null);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    const res = await adminFetchVolunteers(p, {
      status: filterStatus || undefined,
      search: search || undefined,
    });
    if (res) {
      setData(res.items);
      setPage(res.page);
      setPages(res.pages);
      setTotal(res.total);
      setTotalFiltered(res.total_filtered);
      setStatusCounts(res.status_counts || {});
    }
    setLoading(false);
  }, [filterStatus, search]);

  useEffect(() => { load(page); }, [page, load]);

  const updateStatus = async (id: number, status: string, status_message?: string) => {
    if (await adminUpdateVolunteer(id, { status, status_message: status_message || "" })) load(page);
  };

  const updateRating = async (id: number, rating: number | null) => {
    if (await adminUpdateVolunteer(id, { rating })) load(page);
  };

  const logHours = async () => {
    if (!hoursModal || !hoursValue) return;
    const hours = parseFloat(hoursValue);
    if (isNaN(hours) || hours <= 0) return;
    const res = await adminLogVolunteerHours(hoursModal.volId, hours);
    if (res) { setHoursModal(null); setHoursValue(""); load(page); }
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };
  const selectAll = () => { if (selected.size === data.length) setSelected(new Set()); else setSelected(new Set(data.map((r) => r.id))); };

  const bulkStatus = async (status: string) => {
    if (selected.size === 0) return;
    if (!confirm(`${status.charAt(0).toUpperCase() + status.slice(1)} ${selected.size} selected volunteers?`)) return;
    if (await adminBulkUpdateVolunteers(Array.from(selected), { status })) { setSelected(new Set()); load(page); }
  };

  const del = async (id: number) => {
    if (!confirm("Delete this volunteer record permanently?")) return;
    if (await adminDeleteVolunteer(id)) load(page);
  };

  const handleAction = useCallback((action: string, vol: ApiVolunteer) => {
    switch (action) {
      case "advance": {
        const next = statusNext[vol.status];
        if (next) setStatusModal({ vol, newStatus: next });
        break;
      }
      case "approve": setStatusModal({ vol, newStatus: "approved" }); break;
      case "reject": setStatusModal({ vol, newStatus: "rejected" }); break;
      case "suspend": setStatusModal({ vol, newStatus: "suspended" }); break;
      case "complete": setStatusModal({ vol, newStatus: "completed" }); break;
      case "hours": setHoursModal({ volId: vol.id, name: vol.full_name }); setHoursValue(""); break;
      case "view": setDetailVol(vol); setNotesValue(vol.admin_notes || ""); break;
      case "delete": del(vol.id); break;
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-100 px-6 sm:px-8 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-gray-900">Volunteer Management</h1>
              <p className="text-xs text-gray-500 mt-0.5">{total} total &middot; {totalFiltered} shown{filterStatus ? ` (${filterStatus})` : ""}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selected.size > 0 && (
              <>
                <button onClick={() => bulkStatus("approved")} className="px-3 py-2 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Approve ({selected.size})
                </button>
                <button onClick={() => bulkStatus("rejected")} className="px-3 py-2 text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 rounded-xl hover:bg-rose-100 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Reject ({selected.size})
                </button>
              </>
            )}
            <a href={adminExportVolunteersUrl(filterStatus ? { status: filterStatus } : undefined)} target="_blank" rel="noopener noreferrer" className="px-3 py-2 text-xs font-bold bg-white text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              Export CSV
            </a>
            <button onClick={() => { setStats(null); adminFetchVolunteerStats().then((s) => { setStats(s); setShowStats(true); }); }} className="px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-600/20 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              Stats
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {/* ── Filters ── */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {VALID_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setFilterStatus(filterStatus === s ? "" : s); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1.5 ${
                filterStatus === s ? `${statusColors[s]} shadow-sm` : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusDot[s]}`} />
              {s.charAt(0).toUpperCase() + s.slice(1)}
              <span className="ml-0.5 opacity-60">{statusCounts[s] || 0}</span>
            </button>
          ))}
          {filterStatus && (
            <button onClick={() => { setFilterStatus(""); setPage(1); }} className="px-2 py-1 text-[11px] font-bold text-gray-400 hover:text-gray-600 underline ml-1">Clear</button>
          )}
          <div className="flex items-center gap-1.5 ml-auto">
            <div className="relative">
              <svg className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
                placeholder="Search name, email, nationality..."
                className="pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none w-56"
              />
            </div>
          </div>
        </div>

        {/* ── Table ── */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center gap-3 text-gray-400">
              <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Loading volunteers…</span>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-[10px] uppercase tracking-widest text-gray-400 font-bold bg-gray-50/80">
                    <th className="px-4 py-3 w-10">
                      <input type="checkbox" checked={selected.size === data.length && data.length > 0} onChange={selectAll} className="rounded border-gray-300" />
                    </th>
                    <th className="px-4 py-3">Volunteer</th>
                    <th className="px-4 py-3">Programs</th>
                    <th className="px-4 py-3">Dates</th>
                    <th className="px-4 py-3 text-center">Hours</th>
                    <th className="px-4 py-3 text-center">Rating</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 w-12" />
                  </tr>
                </thead>
                <tbody>
                  {data.map((r) => (
                    <tr key={r.id} className={`border-b border-gray-50 hover:bg-emerald-50/20 transition-colors ${selected.has(r.id) ? "bg-emerald-50/40" : ""}`}>
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)} className="rounded border-gray-300" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                            {r.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-900 truncate max-w-[140px]">{r.full_name}</p>
                            <p className="text-[11px] text-gray-400 truncate max-w-[160px]">{r.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {(r.programs || []).slice(0, 2).map((p) => (
                            <span key={p} className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">{p}</span>
                          ))}
                          {(r.programs || []).length > 2 && (
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">+{(r.programs || []).length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-gray-500 font-mono whitespace-nowrap">
                        {r.arrival_date || "—"} → {r.departure_date || "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs font-bold text-gray-700">{r.hours_logged}h</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} onClick={() => updateRating(r.id, r.rating === star ? null : star)} className={`text-xs transition-colors ${star <= (r.rating || 0) ? "text-amber-400" : "text-gray-200 hover:text-amber-300"}`}>★</button>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${statusColors[r.status] || statusColors.pending}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusDot[r.status] || "bg-gray-400"}`} />
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <ActionDropdown vol={r} onAction={handleAction} />
                      </td>
                    </tr>
                  ))}
                  {data.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-16 text-gray-400">
                        <div className="flex flex-col items-center gap-3">
                          <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          <p className="text-sm font-medium">No volunteers found</p>
                          <p className="text-xs">Try adjusting your filters or search query</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition-colors">← Prev</button>
                <span className="text-xs text-gray-400 font-mono px-3">{page} / {pages}</span>
                <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition-colors">Next →</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Status Change Modal ── */}
      {statusModal && (
        <StatusChangeModal
          vol={statusModal.vol}
          newStatus={statusModal.newStatus}
          onClose={() => setStatusModal(null)}
          onConfirm={(msg) => { updateStatus(statusModal.vol.id, statusModal.newStatus, msg); setStatusModal(null); }}
        />
      )}

      {/* ── Volunteer Detail Modal ── */}
      {detailVol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setDetailVol(null)}>
          <div className="bg-white rounded-3xl max-w-2xl w-full relative shadow-2xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Sticky header */}
            <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold">
                  {detailVol.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg text-gray-900">{detailVol.full_name}</h2>
                  <p className="text-xs text-gray-400">VOL-{detailVol.id} &middot; {detailVol.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${statusColors[detailVol.status]}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusDot[detailVol.status]}`} />
                  {detailVol.status}
                </span>
                <button onClick={() => setDetailVol(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="px-6 sm:px-8 py-5 overflow-y-auto flex-1 space-y-5">
              {renderDetailGroup("Personal Information", [
                ["Full Name", detailVol.full_name], ["Email", detailVol.email], ["Phone", detailVol.phone],
                ["Gender", detailVol.gender], ["Date of Birth", detailVol.date_of_birth], ["Nationality", detailVol.nationality],
                ["Country of Residence", detailVol.country_of_residence], ["Passport Number", detailVol.passport_number],
                ["Occupation", detailVol.occupation], ["Organization", detailVol.organization],
              ])}
              {renderDetailGroup("Emergency Contact", [
                ["Name", detailVol.emergency_full_name], ["Relationship", detailVol.emergency_relationship],
                ["Country", detailVol.emergency_country], ["Phone", detailVol.emergency_phone], ["Email", detailVol.emergency_email],
              ])}
              {renderDetailGroup("Placement", [
                ["Programs", (detailVol.programs || []).join(", ")], ["Other Program", detailVol.other_program],
                ["Arrival", detailVol.arrival_date], ["Departure", detailVol.departure_date],
                ["Length of Stay", detailVol.length_of_stay], ["Availability", detailVol.availability],
              ])}
              {renderDetailGroup("Experience & Motivation", [
                ["Education", detailVol.educational_background], ["Professional Experience", detailVol.professional_experience],
                ["Technical Skills", detailVol.technical_skills], ["Languages", detailVol.languages_spoken],
                ["Prior Volunteer Work", detailVol.previous_volunteer_experience], ["Certifications", detailVol.relevant_certifications],
                ["Motivation", detailVol.motivation], ["Hope to Learn", detailVol.hope_toLearn || detailVol.hope_to_learn],
                ["Contribution", detailVol.contribution],
              ])}
              {renderDetailGroup("Health & Travel", [
                ["Medical Conditions", detailVol.medical_conditions], ["Allergies", detailVol.allergies],
                ["Dietary", detailVol.dietary_requirements], ["Emergency Medical", detailVol.emergency_medical_info],
                ["Accommodation", detailVol.need_accommodation], ["Room Preference", detailVol.room_preference],
                ["Invitation Letter", detailVol.need_invitation_letter], ["Airport Pickup", detailVol.need_airport_pickup],
                ["Arrival Airport", detailVol.expected_arrival_airport], ["Flight Details", detailVol.flight_details],
              ])}
              {renderDetailGroup("Documents", [
                ["Passport Copy", detailVol.passport_copy_url ? "✓ Uploaded" : "—"], ["Passport Photo", detailVol.passport_photo_url ? "✓ Uploaded" : "—"],
                ["CV", detailVol.cv_url ? "✓ Uploaded" : "—"], ["Motivation Letter", detailVol.motivation_letter_url ? "✓ Uploaded" : "—"],
                ["Recommendation Letter", detailVol.recommendation_letter_url ? "✓ Uploaded" : "—"],
                ["Certificates", detailVol.certificates_url ? "✓ Uploaded" : "—"],
              ])}

              {/* Status message if present */}
              {detailVol.status_message && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-[10px] uppercase tracking-widest text-amber-600 font-bold mb-1">Last Status Message</p>
                  <p className="text-xs text-amber-800 leading-relaxed">{detailVol.status_message}</p>
                </div>
              )}

              {/* Admin notes */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1.5">Admin Notes</p>
                <textarea value={notesValue} onChange={(e) => setNotesValue(e.target.value)} placeholder="Internal notes about this volunteer…" className="w-full text-xs border border-gray-200 rounded-xl p-3 focus:border-emerald-500 focus:outline-none resize-none" rows={3} />
                <button
                  onClick={async () => {
                    if (await adminUpdateVolunteer(detailVol.id, { admin_notes: notesValue })) { load(page); setDetailVol({ ...detailVol, admin_notes: notesValue }); }
                  }}
                  className="mt-2 px-3 py-1.5 text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Save Notes
                </button>
              </div>
            </div>

            {/* Sticky footer */}
            <div className="px-6 sm:px-8 py-4 border-t border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50 rounded-b-3xl">
              <p className="text-[11px] text-gray-400">Submitted {new Date(detailVol.submitted_at).toLocaleDateString()}</p>
              <div className="flex gap-2">
                {statusNext[detailVol.status] && (
                  <button onClick={() => { setDetailVol(null); setStatusModal({ vol: detailVol, newStatus: statusNext[detailVol.status]! }); }} className="px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-colors shadow-md">
                    Advance to {statusNext[detailVol.status]}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Hours Modal ── */}
      {hoursModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setHoursModal(null)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 relative shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display font-bold text-lg text-gray-900 mb-1">Log Volunteer Hours</h3>
            <p className="text-xs text-gray-500 mb-4">For {hoursModal.name}</p>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Hours *</label>
              <input type="number" step="0.5" min="0.1" value={hoursValue} onChange={(e) => setHoursValue(e.target.value)} placeholder="e.g. 4" className={INPUT_CLASS} autoFocus />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setHoursModal(null)} className="px-4 py-2 text-xs font-semibold bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={logHours} className="px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-colors shadow-md">Add Hours</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Stats Modal ── */}
      {showStats && stats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowStats(false)}>
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowStats(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="font-display font-bold text-xl text-gray-900 mb-6">Volunteer Statistics</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <StatCard label="Total" value={stats.total} color="bg-gray-50 border-gray-200 text-gray-900" icon={<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
              <StatCard label="Pending" value={stats.pending} color="bg-amber-50 border-amber-200 text-amber-900" icon={<svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
              <StatCard label="Active" value={stats.active} color="bg-emerald-50 border-emerald-200 text-emerald-900" icon={<svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} />
              <StatCard label="Completed" value={stats.completed} color="bg-purple-50 border-purple-200 text-purple-900" icon={<svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              <StatCard label="Total Hours" value={`${stats.total_hours_logged}h`} color="bg-blue-50 border-blue-200 text-blue-900" icon={<svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
              <StatCard label="Avg Hours" value={`${stats.average_hours}h`} color="bg-teal-50 border-teal-200 text-teal-900" icon={<svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} />
              <StatCard label="Approved" value={stats.approved} color="bg-indigo-50 border-indigo-200 text-indigo-900" icon={<svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>} />
            </div>
            {stats.top_programs.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Top Programs</h3>
                <div className="space-y-2">
                  {stats.top_programs.map((p) => (
                    <div key={p.name} className="flex items-center gap-3">
                      <span className="text-xs text-gray-700 min-w-[160px] truncate">{p.name}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(p.count / stats.total) * 100}%` }} /></div>
                      <span className="text-[10px] font-mono text-gray-400">{p.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {stats.top_nationalities.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Top Nationalities</h3>
                <div className="space-y-2">
                  {stats.top_nationalities.map((n) => (
                    <div key={n.name} className="flex items-center gap-3">
                      <span className="text-xs text-gray-700 min-w-[120px]">{n.name}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${(n.count / stats.total) * 100}%` }} /></div>
                      <span className="text-[10px] font-mono text-gray-400">{n.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Detail section helper (used inside the modal)              */
/* ─────────────────────────────────────────────────────────── */

function renderDetailGroup(title: string, fields: Array<[string, string | undefined]>) {
  return (
    <div>
      <h4 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">{title}</h4>
      <div className="bg-gray-50/50 rounded-xl px-4">
        {fields.map(([label, value]) => (
          <FieldRow key={label} label={label} value={value || ""} />
        ))}
      </div>
    </div>
  );
}
