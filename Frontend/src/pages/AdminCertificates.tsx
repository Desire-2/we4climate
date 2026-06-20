import { useEffect, useState, type FormEvent } from "react";
import {
  Trash2, ChevronLeft, ChevronRight, Search, Plus, X,
  Award, FileText, Mail, User, Star, Download,
  CheckCircle2, AlertCircle, Loader2, Pencil,
  Filter, BarChart3,
} from "lucide-react";
import {
  adminFetchCertificates, adminFetchCertificateStats,
  adminCreateCertificate, adminUpdateCertificate, adminDeleteCertificate,
  type ApiCertificate,
} from "../api/client";

export default function AdminCertificates() {
  const [data, setData] = useState<ApiCertificate[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Stats
  const [stats, setStats] = useState<{
    total: number;
    perfect_scores: number;
    score_distribution: Record<string, number>;
  } | null>(null);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newScore, setNewScore] = useState(3);
  const [saving, setSaving] = useState(false);
  const [createError, setCreateError] = useState("");

  // Edit state (inline)
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  // Feedback toast
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // Load stats on mount
  useEffect(() => {
    adminFetchCertificateStats().then(setStats);
  }, []);

  const load = async (p: number, q?: string) => {
    setLoading(true);
    const res = await adminFetchCertificates(p, q ?? search);
    if (res) {
      setData(res.items);
      setPage(res.page);
      setPages(res.pages);
      setTotal(res.total);
    } else {
      setData([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(page); }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
    load(1, searchInput);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
    load(1, "");
  };

  // ── Create ──
  const openCreate = () => {
    setNewName("");
    setNewEmail("");
    setNewScore(3);
    setCreateError("");
    setShowCreate(true);
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setCreateError("");
    const result = await adminCreateCertificate({
      recipient_name: newName.trim(),
      recipient_email: newEmail.trim(),
      score: newScore,
    });
    setSaving(false);
    if (result) {
      setShowCreate(false);
      showToast("success", `Certificate ${result.certificate_code} issued to ${result.recipient_name}`);
      load(page, search);
      adminFetchCertificateStats().then(setStats);
    } else {
      setCreateError("Failed to issue certificate. Check the fields and try again.");
    }
  };

  // ── Edit ──
  const startEdit = (cert: ApiCertificate) => {
    setEditingId(cert.id);
    setEditName(cert.recipient_name);
    setEditEmail(cert.recipient_email);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: number) => {
    const result = await adminUpdateCertificate(id, {
      recipient_name: editName.trim(),
      recipient_email: editEmail.trim(),
    });
    if (result) {
      setEditingId(null);
      showToast("success", "Certificate updated");
      load(page, search);
    } else {
      showToast("error", "Failed to update certificate");
    }
  };

  // ── Delete ──
  const del = async (id: number) => {
    if (!confirm("Delete this certificate permanently?")) return;
    if (await adminDeleteCertificate(id)) {
      showToast("success", "Certificate deleted");
      load(page, search);
      adminFetchCertificateStats().then(setStats);
    } else {
      showToast("error", "Failed to delete certificate");
    }
  };

  // ── Export CSV ──
  const exportCsv = () => {
    const headers = ["Code", "Name", "Email", "Score", "Issued"];
    const rows = data.map((r) =>
      [r.certificate_code, r.recipient_name, r.recipient_email, r.score, new Date(r.issued_at).toISOString()].join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `certificates-page-${page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6">
      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-xl border text-sm font-medium transition-all animate-in slide-in-from-right ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-500" />
          )}
          {toast.message}
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Certificates</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage community advocate certificates</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCsv}
            disabled={data.length === 0}
            className="px-4 py-2 border border-gray-200 hover:bg-gray-50 disabled:opacity-40 rounded-xl text-xs font-semibold text-gray-600 transition-all flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            Issue Certificate
          </button>
        </div>
      </div>

      {/* ── Stats summary ── */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-600">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Total Issued</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 rounded-xl text-amber-600">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-900">{stats.perfect_scores}</span>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Perfect 3/3</p>
            </div>
          </div>
          {Object.entries(stats.score_distribution).map(([score, count]) => (
            <div key={score} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 rounded-xl text-blue-600">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900">{count}</span>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Score {score}/3</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Search bar ── */}
      <form onSubmit={handleSearch} className="flex items-center gap-2.5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, email, or code…"
            className="w-full pl-9 pr-9 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400 transition-all"
          />
          {searchInput && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
        >
          <Filter className="h-3.5 w-3.5" />
          Search
        </button>
        {search && (
          <span className="text-xs text-gray-400 font-mono">
            {total} result{total !== 1 ? "s" : ""}
          </span>
        )}
      </form>

      {/* ── Table ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Loading…
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                  <th className="px-4 py-3.5">Code</th>
                  <th className="px-4 py-3.5">Recipient</th>
                  <th className="px-4 py-3.5">Email</th>
                  <th className="px-4 py-3.5 text-center">Score</th>
                  <th className="px-4 py-3.5">Issued</th>
                  <th className="px-4 py-3.5 w-28 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-gray-50 hover:bg-gray-50/80 text-gray-700 transition-colors"
                  >
                    {/* Code */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                        {r.certificate_code}
                      </span>
                    </td>

                    {/* Name (editable inline) */}
                    <td className="px-4 py-3">
                      {editingId === r.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-emerald-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                          autoFocus
                        />
                      ) : (
                        <span className="font-medium flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-gray-400" />
                          {r.recipient_name}
                        </span>
                      )}
                    </td>

                    {/* Email (editable inline) */}
                    <td className="px-4 py-3">
                      {editingId === r.id ? (
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-emerald-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                        />
                      ) : (
                        <span className="text-xs text-gray-500 flex items-center gap-1.5">
                          <Mail className="h-3 w-3 text-gray-400" />
                          {r.recipient_email}
                        </span>
                      )}
                    </td>

                    {/* Score */}
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          r.score === 3
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <Star className={`h-3 w-3 ${r.score === 3 ? "fill-amber-400 text-amber-400" : "text-gray-400"}`} />
                        {r.score}/3
                      </span>
                    </td>

                    {/* Issued date */}
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(r.issued_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {editingId === r.id ? (
                          <>
                            <button
                              onClick={() => saveEdit(r.id)}
                              className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Save"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Cancel"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(r)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => del(r.id)}
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-gray-400">
                      <Award className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      <p className="font-medium">No certificates found</p>
                      {search ? (
                        <p className="text-xs mt-1">Try a different search term</p>
                      ) : (
                        <p className="text-xs mt-1">Issue your first certificate to get started</p>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-2 rounded-xl border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-mono text-gray-500">
                {page} / {pages}
                <span className="text-gray-300 ml-2">({total} total)</span>
              </span>
              <button
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 rounded-xl border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Create Modal ── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 relative animate-in zoom-in-95">
            <button
              onClick={() => setShowCreate(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-gray-900">Issue Certificate</h2>
                <p className="text-xs text-gray-500">Create a new community advocate certificate</p>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Recipient Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
                  placeholder="e.g. Iradukunda Alice"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Recipient Email</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
                  placeholder="alice@example.org"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Score</label>
                <div className="flex items-center gap-3">
                  {[1, 2, 3].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewScore(s)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                        newScore === s
                          ? "bg-amber-50 border-amber-300 text-amber-700"
                          : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      {s}/3
                      {s === 3 && <Star className="h-3 w-3 inline ml-1 fill-amber-400 text-amber-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {createError && (
                <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                  {createError}
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <><Plus className="h-4 w-4" /> Issue Certificate</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
