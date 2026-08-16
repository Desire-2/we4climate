import { useEffect, useState, type ReactNode } from "react";

import {
  adminFetchApplications,
  adminUpdateApplicationStatus,
  adminUpdateApplicationNotes,
  adminBulkUpdateApplications,
  adminDeleteApplication,
  type ApiApplication,
} from "../api/client";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  reviewed: "bg-blue-100 text-blue-800 border-blue-200",
  shortlisted: "bg-purple-100 text-purple-800 border-purple-200",
  accepted: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-rose-100 text-rose-800 border-rose-200",
};

const statusIcon: Record<string, ReactNode> = {
  pending: <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />,
  reviewed: <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />,
  shortlisted: <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />,
  accepted: <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />,
  rejected: <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />,
};

const VALID_STATUSES = ["pending", "reviewed", "shortlisted", "accepted", "rejected"];

export default function AdminApplications() {
  const [data, setData] = useState<ApiApplication[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [editingNotes, setEditingNotes] = useState<number | null>(null);
  const [notesValue, setNotesValue] = useState("");
  const [detailApp, setDetailApp] = useState<ApiApplication | null>(null);

  const load = async (p: number) => {
    setLoading(true);
    const res = await adminFetchApplications(p, {
      status: filterStatus || undefined,
      search: search || undefined,
    });
    if (res) {
      setData(res.items);
      setPage(res.page);
      setPages(res.pages);
      setTotal(res.total_filtered ?? res.total);
      setStatusCounts(res.status_counts || {});
    }
    setLoading(false);
  };

  useEffect(() => { load(page); }, [page, filterStatus, search]);

  const updateStatus = async (id: number, status: string) => {
    if (await adminUpdateApplicationStatus(id, status)) load(page);
  };

  const saveNotes = async (id: number) => {
    if (await adminUpdateApplicationNotes(id, notesValue)) {
      setEditingNotes(null);
      load(page);
    }
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === data.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(data.map((r) => r.id)));
    }
  };

  const bulkAdvance = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Advance ${selected.size} selected applications to the next status?`)) return;
    const ids = Array.from(selected) as number[];
    const res = await adminBulkUpdateApplications(ids, { status: "reviewed" });
    if (res) {
      setSelected(new Set());
      load(page);
    }
  };

  const bulkReject = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Reject ${selected.size} selected applications?`)) return;
    const ids = Array.from(selected) as number[];
    const res = await adminBulkUpdateApplications(ids, { status: "rejected" });
    if (res) {
      setSelected(new Set());
      load(page);
    }
  };

  const del = async (id: number) => {
    if (!confirm("Delete this application permanently?")) return;
    if (await adminDeleteApplication(id)) load(page);
  };

  const nextStatus = (current: string): string => {
    const flow = ["pending", "reviewed", "shortlisted", "accepted"];
    const idx = flow.indexOf(current);
    return idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : current;
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleSearchKeyDown = (e: import("react").KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Applications</h1>
          <p className="text-sm text-gray-500 mt-1">
            {total} total application{total !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {selected.size > 0 && (
            <>
              <button
                onClick={bulkAdvance}
                className="px-3 py-1.5 text-[10px] sm:text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                Advance ({selected.size})
              </button>
              <button
                onClick={bulkReject}
                className="px-3 py-1.5 text-[10px] sm:text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
              >
                Reject ({selected.size})
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          {VALID_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setFilterStatus(filterStatus === s ? "" : s); setPage(1); }}
              className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-[9px] sm:text-[10px] font-bold border transition-all ${
                filterStatus === s
                  ? `${statusColors[s]} shadow-sm`
                  : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)} ({statusCounts[s] || 0})
            </button>
          ))}
          {filterStatus && (
            <button
              onClick={() => { setFilterStatus(""); setPage(1); }}
              className="px-2 py-1 text-[10px] font-bold text-gray-400 hover:text-gray-600 underline"
            >
              Clear
            </button>
          )}
        </div>
        <div className="w-full sm:w-auto ml-auto">
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search name or email..."
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none w-full sm:w-52"
            />
          <button
            onClick={handleSearch}
            className="px-2.5 py-1.5 text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Search
          </button>
        </div>
      </div>
    </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto bg-white rounded-2xl border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selected.size === data.length && data.length > 0}
                      onChange={selectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Opportunity</th>
                  <th className="px-4 py-3">Applicant</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Notes</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 w-40" />
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr key={r.id} className={`border-b border-gray-50 hover:bg-gray-50 text-gray-700 transition-colors ${selected.has(r.id) ? "bg-emerald-50/50" : ""}`}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(r.id)}
                        onChange={() => toggleSelect(r.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{r.id}</td>
                    <td className="px-4 py-3 text-xs font-medium max-w-[150px] truncate" title={r.opportunity_title || `#${r.opportunity_id}`}>
                      {r.opportunity_title || `#${r.opportunity_id}`}
                    </td>
                    <td className="px-4 py-3 font-medium text-xs">{r.applicant_name}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[180px] truncate">{r.applicant_email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusColors[r.status] || statusColors.pending}`}>
                        {statusIcon[r.status]}
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-[120px]">
                      {editingNotes === r.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={notesValue}
                            onChange={(e) => setNotesValue(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") saveNotes(r.id); if (e.key === "Escape") setEditingNotes(null); }}
                            className="px-2 py-0.5 text-[10px] border border-gray-300 rounded focus:border-emerald-500 focus:outline-none w-full"
                            autoFocus
                          />
                          <button onClick={() => saveNotes(r.id)} className="text-[10px] text-emerald-600 font-bold hover:underline">Save</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingNotes(r.id); setNotesValue(r.admin_notes || ""); }}
                          className="text-[10px] text-gray-400 hover:text-gray-600 truncate block max-w-[120px]"
                          title={r.admin_notes || "Click to add notes"}
                        >
                          {r.admin_notes || "+ add note"}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(r.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setDetailApp(r)}
                          className="px-3 py-2 text-[11px] font-semibold bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          View
                        </button>
                        {r.status !== "rejected" && r.status !== "accepted" && (
                          <button
                            onClick={() => updateStatus(r.id, nextStatus(r.status))}
                            className="px-3 py-2 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                          >
                            Advance
                          </button>
                        )}
                        {r.status !== "rejected" && r.status !== "accepted" && (
                          <button
                            onClick={() => updateStatus(r.id, "rejected")}
                            className="px-3 py-2 text-[11px] font-semibold bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
                          >
                            Reject
                          </button>
                        )}
                        <button onClick={() => del(r.id)} className="px-3 py-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-[11px] font-semibold">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-gray-400">
                      No applications found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile card layout */}
          <div className="md:hidden space-y-3">
            {data.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gray-400">#{r.id}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusColors[r.status] || statusColors.pending}`}>
                      {statusIcon[r.status]}
                      {r.status}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(r.submitted_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-0.5">{r.applicant_name}</p>
                <p className="text-xs text-gray-500 mb-1">{r.applicant_email}</p>
                <p className="text-xs text-gray-500 mb-3 truncate">{r.opportunity_title || `#${r.opportunity_id}`}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDetailApp(r)}
                    className="px-3 py-2 text-[11px] font-semibold bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    View
                  </button>
                  {r.status !== "rejected" && r.status !== "accepted" && (
                    <button
                      onClick={() => updateStatus(r.id, nextStatus(r.status))}
                      className="px-3 py-2 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      Advance
                    </button>
                  )}
                  {r.status !== "rejected" && r.status !== "accepted" && (
                    <button
                      onClick={() => updateStatus(r.id, "rejected")}
                      className="px-3 py-2 text-[11px] font-semibold bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
                    >
                      Reject
                    </button>
                  )}
                  <button onClick={() => del(r.id)} className="px-3 py-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-[11px] font-semibold ml-auto">
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {data.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                No applications found.
              </div>
            )}
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-5">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="p-2.5 rounded-xl border border-gray-200 disabled:opacity-30 hover:bg-gray-50">
                Prev
              </button>
              <span className="text-xs text-gray-500 font-mono">{page} / {pages}</span>
              <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="p-2.5 rounded-xl border border-gray-200 disabled:opacity-30 hover:bg-gray-50">
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Application Detail Modal */}
      {detailApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setDetailApp(null)}>
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setDetailApp(null)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
              Close
            </button>
            <div className="flex items-center gap-3 mb-5">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold border ${statusColors[detailApp.status] || statusColors.pending}`}>
                {statusIcon[detailApp.status]}
                {detailApp.status}
              </span>
              <span className="text-xs text-gray-400 font-mono">Application #{detailApp.id}</span>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Applicant</p>
                <p className="text-sm font-medium text-gray-900">{detailApp.applicant_name}</p>
                <p className="text-xs text-gray-500">{detailApp.applicant_email}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Opportunity</p>
                <p className="text-sm font-medium text-gray-900">{detailApp.opportunity_title || `#${detailApp.opportunity_id}`}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Resume</p>
                {detailApp.resume_url ? (
                  <a href={detailApp.resume_url} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:underline">
                    View Resume
                  </a>
                ) : (
                  <p className="text-xs text-gray-400">No resume uploaded</p>
                )}
              </div>
              {detailApp.cover_letter && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Cover Letter / Details</p>
                  <div className="text-xs text-gray-600 bg-gray-50 rounded-xl p-3 max-h-60 overflow-y-auto">
                    {(() => {
                      try {
                        const parsed = JSON.parse(detailApp.cover_letter);
                        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
                          // Check if this is a volunteer application with structured data
                          const hasVolunteerFields = parsed.fullName || parsed.motivation || parsed.programs;
                          if (hasVolunteerFields) {
                            return (
                              <div className="space-y-3">
                                {parsed.fullName && (
                                  <div>
                                    <p className="font-bold text-gray-700 mb-1">Applicant Profile</p>
                                    <p>Name: {parsed.fullName}</p>
                                    {parsed.nationality && <p>Nationality: {parsed.nationality}</p>}
                                    {parsed.occupation && <p>Occupation: {parsed.occupation}</p>}
                                    {parsed.organization && <p>Organization: {parsed.organization}</p>}
                                  </div>
                                )}
                                {parsed.programs && parsed.programs.length > 0 && (
                                  <div>
                                    <p className="font-bold text-gray-700 mb-1">Programs of Interest</p>
                                    <div className="flex flex-wrap gap-1">
                                      {parsed.programs.map((p: string) => (
                                        <span key={p} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-bold border border-emerald-200">{p}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {parsed.motivation && (
                                  <div>
                                    <p className="font-bold text-gray-700 mb-1">Motivation</p>
                                    <p className="whitespace-pre-wrap">{parsed.motivation}</p>
                                  </div>
                                )}
                                {parsed.hopeToLearn && (
                                  <div>
                                    <p className="font-bold text-gray-700 mb-1">Hope to Learn</p>
                                    <p className="whitespace-pre-wrap">{parsed.hopeToLearn}</p>
                                  </div>
                                )}
                                {parsed.contribution && (
                                  <div>
                                    <p className="font-bold text-gray-700 mb-1">Contribution</p>
                                    <p className="whitespace-pre-wrap">{parsed.contribution}</p>
                                  </div>
                                )}
                                {parsed.arrivalDate && (
                                  <div>
                                    <p className="font-bold text-gray-700 mb-1">Dates</p>
                                    <p>{parsed.arrivalDate} → {parsed.departureDate || 'TBD'} ({parsed.lengthOfStay || 'N/A'})</p>
                                  </div>
                                )}
                                {parsed.attachmentUrls && (
                                  <div>
                                    <p className="font-bold text-gray-700 mb-1">Attachments</p>
                                    <div className="space-y-1">
                                      {Object.entries(parsed.attachmentUrls).map(([key, url]) => (
                                        <a key={key} href={String(url)} target="_blank" rel="noopener noreferrer" className="block text-emerald-600 hover:underline">{key}: {String(url).split('/').pop()}</a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          }
                          return <pre className="whitespace-pre-wrap text-[11px]">{JSON.stringify(parsed, null, 2)}</pre>;
                        }
                        return <p className="whitespace-pre-wrap">{detailApp.cover_letter}</p>;
                      } catch {
                        return <p className="whitespace-pre-wrap">{detailApp.cover_letter}</p>;
                      }
                    })()}
                  </div>
                </div>
              )}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Admin Notes</p>
                <textarea
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  placeholder="Add internal notes about this applicant..."
                  className="w-full text-xs border border-gray-200 rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none resize-none"
                  rows={3}
                />
                <button
                  onClick={async () => {
                    if (await adminUpdateApplicationNotes(detailApp.id, notesValue)) {
                      load(page);
                      setDetailApp({ ...detailApp, admin_notes: notesValue });
                    }
                  }}
                  className="mt-1 px-3 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  Save Notes
                </button>
              </div>
              <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                <p className="text-[10px] text-gray-400 mr-auto">Submitted {new Date(detailApp.submitted_at).toLocaleString()}</p>
                {detailApp.status !== "rejected" && detailApp.status !== "accepted" && (
                  <button
                    onClick={async () => {
                      const ns = nextStatus(detailApp.status);
                      if (await adminUpdateApplicationStatus(detailApp.id, ns)) {
                        load(page);
                        setDetailApp({ ...detailApp, status: ns });
                      }
                    }}
                    className="px-3 py-1.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    Advance to {nextStatus(detailApp.status)}
                  </button>
                )}
                {detailApp.status !== "rejected" && detailApp.status !== "accepted" && (
                  <button
                    onClick={async () => {
                      if (await adminUpdateApplicationStatus(detailApp.id, "rejected")) {
                        load(page);
                        setDetailApp({ ...detailApp, status: "rejected" });
                      }
                    }}
                    className="px-3 py-1.5 text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
                  >
                    Reject
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
