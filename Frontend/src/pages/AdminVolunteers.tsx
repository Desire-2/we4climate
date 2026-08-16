import { useEffect, useState, type ReactNode } from "react";

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
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-blue-100 text-blue-800 border-blue-200",
  active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  completed: "bg-purple-100 text-purple-800 border-purple-200",
  suspended: "bg-orange-100 text-orange-800 border-orange-200",
  rejected: "bg-rose-100 text-rose-800 border-rose-200",
};

const statusIcon: Record<string, ReactNode> = {
  pending: <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />,
  approved: <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />,
  active: <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />,
  completed: <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />,
  suspended: <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />,
  rejected: <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />,
};

const VALID_STATUSES = ["pending", "approved", "active", "completed", "suspended", "rejected"];

const INPUT_CLASS = "w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none transition-all";

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${color}`}>
      <p className="text-[10px] uppercase tracking-widest font-bold opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-display font-black">{value}</p>
    </div>
  );
}

function FieldRow({ label, value }: { label: string; value: string; key?: string }) {
  return (
    <div className="border-b border-gray-100 py-2.5 last:border-0">
      <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</dt>
      <dd className="mt-1 text-xs text-gray-700 leading-relaxed">{value || "—"}</dd>
    </div>
  );
}

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
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof adminFetchVolunteerStats>> | null>(null);
  const [hoursModal, setHoursModal] = useState<{ volId: number; name: string } | null>(null);
  const [hoursValue, setHoursValue] = useState("");
  const [notesValue, setNotesValue] = useState("");

  const load = async (p: number) => {
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
  };

  useEffect(() => { load(page); }, [page, filterStatus, search]);

  const loadStats = async () => {
    const s = await adminFetchVolunteerStats();
    setStats(s);
    setShowStats(true);
  };

  const updateStatus = async (id: number, status: string) => {
    if (await adminUpdateVolunteer(id, { status })) load(page);
  };

  const updateRating = async (id: number, rating: number | null) => {
    if (await adminUpdateVolunteer(id, { rating })) load(page);
  };

  const saveNotes = async (id: number) => {
    if (await adminUpdateVolunteer(id, { admin_notes: notesValue })) load(page);
  };

  const logHours = async () => {
    if (!hoursModal || !hoursValue) return;
    const hours = parseFloat(hoursValue);
    if (isNaN(hours) || hours <= 0) return;
    const res = await adminLogVolunteerHours(hoursModal.volId, hours);
    if (res) {
      setHoursModal(null);
      setHoursValue("");
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
    if (selected.size === data.length) setSelected(new Set());
    else setSelected(new Set(data.map((r) => r.id)));
  };

  const bulkApprove = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Approve ${selected.size} selected volunteers?`)) return;
    if (await adminBulkUpdateVolunteers(Array.from(selected), { status: "approved" })) {
      setSelected(new Set());
      load(page);
    }
  };

  const bulkReject = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Reject ${selected.size} selected volunteers?`)) return;
    if (await adminBulkUpdateVolunteers(Array.from(selected), { status: "rejected" })) {
      setSelected(new Set());
      load(page);
    }
  };

  const del = async (id: number) => {
    if (!confirm("Delete this volunteer record permanently?")) return;
    if (await adminDeleteVolunteer(id)) load(page);
  };

  const nextStatus = (current: string): string => {
    const flow = ["pending", "approved", "active", "completed"];
    const idx = flow.indexOf(current);
    return idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : current;
  };

  const handleSearch = () => { setSearch(searchInput); setPage(1); };

  const renderDetailSection = (title: string, fields: Array<[string, string]>) => (
    <div className="mb-4">
      <h4 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">{title}</h4>
      <dl>{fields.map(([label, value]) => <FieldRow key={label} label={label} value={value} />)}</dl>
    </div>
  );

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Volunteer Management</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total volunteer{total !== 1 ? "s" : ""} registered</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <>
              <button onClick={bulkApprove} className="px-3 py-1.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors">
                Approve ({selected.size})
              </button>
              <button onClick={bulkReject} className="px-3 py-1.5 text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors">
                Reject ({selected.size})
              </button>
            </>
          )}
          <a
            href={adminExportVolunteersUrl(filterStatus ? { status: filterStatus } : undefined)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Export CSV
          </a>
          <button
            onClick={loadStats}
            className="px-3 py-1.5 text-[10px] font-bold bg-emerald-600 text-white border border-emerald-200 rounded-lg hover:bg-emerald-500 transition-colors shadow-md"
          >
            Stats Dashboard
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {VALID_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setFilterStatus(filterStatus === s ? "" : s); setPage(1); }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                filterStatus === s
                  ? `${statusColors[s]} shadow-sm`
                  : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)} ({statusCounts[s] || 0})
            </button>
          ))}
          {filterStatus && (
            <button onClick={() => { setFilterStatus(""); setPage(1); }} className="px-2 py-1 text-[10px] font-bold text-gray-400 hover:text-gray-600 underline">
              Clear
            </button>
          )}
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
            placeholder="Search name, email..."
            className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none w-52"
          />
          <button onClick={handleSearch} className="px-2.5 py-1.5 text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors">
            Search
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="h-8 w-8 bg-gray-200 rounded-full" />
            <span className="text-sm">Loading volunteers...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-[10px] uppercase tracking-widest text-gray-400 font-bold bg-gray-50/50">
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" checked={selected.size === data.length && data.length > 0} onChange={selectAll} className="rounded border-gray-300" />
                  </th>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Programs</th>
                  <th className="px-4 py-3">Dates</th>
                  <th className="px-4 py-3">Hours</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 w-40" />
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr key={r.id} className={`border-b border-gray-50 hover:bg-emerald-50/30 text-gray-700 transition-colors ${selected.has(r.id) ? "bg-emerald-50/50" : ""}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)} className="rounded border-gray-300" />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{r.id}</td>
                    <td className="px-4 py-3 font-medium text-xs max-w-[160px] truncate">{r.full_name}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[180px] truncate">{r.email}</td>
                    <td className="px-4 py-3 text-xs max-w-[150px] truncate">{(r.programs || []).join(", ")}</td>
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono whitespace-nowrap">
                      {r.arrival_date || "—"} → {r.departure_date || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono">{r.hours_logged}h</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => updateRating(r.id, r.rating === star ? null : star)}
                            className={`text-xs ${star <= (r.rating || 0) ? "text-amber-400" : "text-gray-200 hover:text-amber-300"}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusColors[r.status] || statusColors.pending}`}>
                        {statusIcon[r.status]}
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setDetailVol(r); setNotesValue(r.admin_notes || ""); }} className="px-2 py-1 text-[10px] font-bold bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                          View
                        </button>
                        {r.status !== "rejected" && r.status !== "completed" && (
                          <button onClick={() => updateStatus(r.id, nextStatus(r.status))} className="px-2 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors">
                            Advance
                          </button>
                        )}
                        <button onClick={() => { setHoursModal({ volId: r.id, name: r.full_name }); setHoursValue(""); }} className="px-2 py-1 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                          +Hours
                        </button>
                        <button onClick={() => del(r.id)} className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-[10px] font-bold">
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-sm">No volunteers found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-5">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="p-2 rounded-xl border border-gray-200 disabled:opacity-30 hover:bg-gray-50">Prev</button>
              <span className="text-xs text-gray-500 font-mono">{page} / {pages}</span>
              <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="p-2 rounded-xl border border-gray-200 disabled:opacity-30 hover:bg-gray-50">Next</button>
            </div>
          )}
        </>
      )}

      {/* Volunteer Detail Modal */}
      {detailVol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setDetailVol(null)}>
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setDetailVol(null)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
              Close
            </button>

            <div className="flex items-center gap-3 mb-5">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold border ${statusColors[detailVol.status] || statusColors.pending}`}>
                {statusIcon[detailVol.status]}
                {detailVol.status}
              </span>
              <span className="text-xs text-gray-400 font-mono">VOL-{detailVol.id}</span>
              <span className="text-xs text-gray-400 ml-auto">{detailVol.hours_logged}h logged</span>
            </div>

            {renderDetailSection("Personal Information", [
              ["Full Name", detailVol.full_name],
              ["Email", detailVol.email],
              ["Phone", detailVol.phone],
              ["Gender", detailVol.gender],
              ["Date of Birth", detailVol.date_of_birth],
              ["Nationality", detailVol.nationality],
              ["Country of Residence", detailVol.country_of_residence],
              ["Passport Number", detailVol.passport_number],
              ["Occupation", detailVol.occupation],
              ["Organization", detailVol.organization],
            ])}

            {renderDetailSection("Emergency Contact", [
              ["Name", detailVol.emergency_full_name],
              ["Relationship", detailVol.emergency_relationship],
              ["Country", detailVol.emergency_country],
              ["Phone", detailVol.emergency_phone],
              ["Email", detailVol.emergency_email],
            ])}

            {renderDetailSection("Placement", [
              ["Programs", (detailVol.programs || []).join(", ")],
              ["Other Program", detailVol.other_program],
              ["Arrival Date", detailVol.arrival_date],
              ["Departure Date", detailVol.departure_date],
              ["Length of Stay", detailVol.length_of_stay],
              ["Availability", detailVol.availability],
            ])}

            {renderDetailSection("Experience & Motivation", [
              ["Educational Background", detailVol.educational_background],
              ["Professional Experience", detailVol.professional_experience],
              ["Technical Skills", detailVol.technical_skills],
              ["Languages", detailVol.languages_spoken],
              ["Previous Volunteer Experience", detailVol.previous_volunteer_experience],
              ["Certifications", detailVol.relevant_certifications],
              ["Motivation", detailVol.motivation],
              ["Hope to Learn", detailVol.hope_to_learn],
              ["Contribution", detailVol.contribution],
            ])}

            {renderDetailSection("Health & Stay", [
              ["Medical Conditions", detailVol.medical_conditions],
              ["Allergies", detailVol.allergies],
              ["Dietary Requirements", detailVol.dietary_requirements],
              ["Emergency Medical Info", detailVol.emergency_medical_info],
              ["Accommodation", detailVol.need_accommodation],
              ["Room Preference", detailVol.room_preference],
              ["Invitation Letter", detailVol.need_invitation_letter],
              ["Airport Pickup", detailVol.need_airport_pickup],
              ["Arrival Airport", detailVol.expected_arrival_airport],
              ["Flight Details", detailVol.flight_details],
            ])}

            {renderDetailSection("Documents", [
              ["Passport Copy", detailVol.passport_copy_url ? "Uploaded" : "Not uploaded"],
              ["Passport Photo", detailVol.passport_photo_url ? "Uploaded" : "Not uploaded"],
              ["CV", detailVol.cv_url ? "Uploaded" : "Not uploaded"],
              ["Motivation Letter", detailVol.motivation_letter_url ? "Uploaded" : "Not uploaded"],
              ["Recommendation Letter", detailVol.recommendation_letter_url ? "Uploaded" : "Not uploaded"],
              ["Certificates", detailVol.certificates_url ? "Uploaded" : "Not uploaded"],
            ])}

            <div className="mt-4 space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Admin Notes</p>
                <textarea
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  placeholder="Add internal notes about this volunteer..."
                  className="w-full text-xs border border-gray-200 rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none resize-none"
                  rows={3}
                />
                <button
                  onClick={async () => {
                    if (await adminUpdateVolunteer(detailVol.id, { admin_notes: notesValue })) {
                      load(page);
                      setDetailVol({ ...detailVol, admin_notes: notesValue });
                    }
                  }}
                  className="mt-1 px-3 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  Save Notes
                </button>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                <p className="text-[10px] text-gray-400 mr-auto">Submitted {new Date(detailVol.submitted_at).toLocaleString()}</p>
                {detailVol.status !== "rejected" && detailVol.status !== "completed" && (
                  <button
                    onClick={async () => {
                      const ns = nextStatus(detailVol.status);
                      if (await adminUpdateVolunteer(detailVol.id, { status: ns })) {
                        load(page);
                        setDetailVol({ ...detailVol, status: ns });
                      }
                    }}
                    className="px-3 py-1.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    Advance to {nextStatus(detailVol.status)}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hours Logging Modal */}
      {hoursModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setHoursModal(null)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 relative shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display font-bold text-lg text-gray-900 mb-1">Log Volunteer Hours</h3>
            <p className="text-xs text-gray-500 mb-4">For {hoursModal.name}</p>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Hours *</label>
              <input
                type="number"
                step="0.5"
                min="0.1"
                value={hoursValue}
                onChange={(e) => setHoursValue(e.target.value)}
                placeholder="e.g. 4"
                className={INPUT_CLASS}
                autoFocus
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setHoursModal(null)} className="px-4 py-2 text-xs font-semibold bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={logHours} className="px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-colors shadow-md">Add Hours</button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Dashboard Modal */}
      {showStats && stats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowStats(false)}>
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowStats(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
              Close
            </button>
            <h2 className="font-display font-bold text-xl text-gray-900 mb-6">Volunteer Statistics</h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <StatCard label="Total" value={stats.total} color="bg-gray-50 border-gray-200 text-gray-900" />
              <StatCard label="Pending" value={stats.pending} color="bg-amber-50 border-amber-200 text-amber-900" />
              <StatCard label="Active" value={stats.active} color="bg-emerald-50 border-emerald-200 text-emerald-900" />
              <StatCard label="Completed" value={stats.completed} color="bg-purple-50 border-purple-200 text-purple-900" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              <StatCard label="Total Hours" value={`${stats.total_hours_logged}h`} color="bg-blue-50 border-blue-200 text-blue-900" />
              <StatCard label="Avg Hours" value={`${stats.average_hours}h`} color="bg-teal-50 border-teal-200 text-teal-900" />
              <StatCard label="Approved" value={stats.approved} color="bg-indigo-50 border-indigo-200 text-indigo-900" />
            </div>

            {stats.top_programs.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Top Programs</h3>
                <div className="space-y-2">
                  {stats.top_programs.map((p) => (
                    <div key={p.name} className="flex items-center gap-3">
                      <span className="text-xs text-gray-700 min-w-[160px] truncate">{p.name}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(p.count / stats.total) * 100}%` }} />
                      </div>
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
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(n.count / stats.total) * 100}%` }} />
                      </div>
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
