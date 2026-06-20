import { useEffect, useState, type ReactNode } from "react";
import { Trash2, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock } from "lucide-react";
import { adminFetchApplications, adminUpdateApplicationStatus, adminDeleteApplication, type ApiApplication } from "../api/client";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  reviewed: "bg-blue-100 text-blue-800 border-blue-200",
  shortlisted: "bg-purple-100 text-purple-800 border-purple-200",
  accepted: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-rose-100 text-rose-800 border-rose-200",
};

const statusIcon: Record<string, ReactNode> = {
  pending: <Clock className="h-3 w-3" />,
  reviewed: <CheckCircle2 className="h-3 w-3" />,
  shortlisted: <CheckCircle2 className="h-3 w-3" />,
  accepted: <CheckCircle2 className="h-3 w-3" />,
  rejected: <XCircle className="h-3 w-3" />,
};

export default function AdminApplications() {
  const [data, setData] = useState<ApiApplication[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = async (p: number) => {
    setLoading(true);
    const res = await adminFetchApplications(p);
    if (res) { setData(res.items); setPage(res.page); setPages(res.pages); }
    setLoading(false);
  };

  useEffect(() => { load(page); }, [page]);

  const updateStatus = async (id: number, status: string) => {
    if (await adminUpdateApplicationStatus(id, status)) load(page);
  };

  const del = async (id: number) => {
    if (!confirm("Delete this application?")) return;
    if (await adminDeleteApplication(id)) load(page);
  };

  const nextStatus = (current: string): string => {
    const flow = ["pending", "reviewed", "shortlisted", "accepted"];
    const idx = flow.indexOf(current);
    return idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : current;
  };

  return (
    <div className="p-6 sm:p-8">
      <h1 className="font-display font-bold text-2xl text-gray-900 mb-6">Applications</h1>
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Opportunity</th>
                  <th className="px-4 py-3">Applicant</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 w-24" />
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 text-gray-700">
                    <td className="px-4 py-3 font-mono text-xs">{r.opportunity_id}</td>
                    <td className="px-4 py-3 font-medium max-w-[180px] truncate">{r.applicant_name}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{r.applicant_email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusColors[r.status] || statusColors.pending}`}>
                        {statusIcon[r.status] || null}
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{new Date(r.submitted_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {r.status !== "rejected" && r.status !== "accepted" && (
                          <button
                            onClick={() => updateStatus(r.id, nextStatus(r.status))}
                            className="px-2 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                          >
                            Advance
                          </button>
                        )}
                        {r.status === "pending" && (
                          <button
                            onClick={() => updateStatus(r.id, "rejected")}
                            className="px-2 py-1 text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
                          >
                            Reject
                          </button>
                        )}
                        <button onClick={() => del(r.id)} className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && <tr><td colSpan={7} className="text-center py-10 text-gray-400">No applications yet.</td></tr>}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-5">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-xl border border-gray-200 disabled:opacity-30 hover:bg-gray-50"><ChevronLeft className="h-4 w-4" /></button>
              <span className="text-xs text-gray-500 font-mono">{page} / {pages}</span>
              <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="p-2 rounded-xl border border-gray-200 disabled:opacity-30 hover:bg-gray-50"><ChevronRight className="h-4 w-4" /></button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
