import { useEffect, useState, type FormEvent } from "react";
import {
  Plus, Pencil, Trash2, ChevronLeft, ChevronRight,
  X, Eye, EyeOff, ExternalLink, Globe, FileText,
} from "lucide-react";
import {
  adminFetchOpportunities, adminCreateOpportunity,
  adminUpdateOpportunity, adminDeleteOpportunity,
  type ApiOpportunity,
} from "../api/client";

type OppForm = {
  title: string;
  type: string;
  location: string;
  deadline: string;
  description: string;
  requirements: string;
  is_external: boolean;
  external_url: string;
  is_active: boolean;
};

const emptyForm: OppForm = {
  title: "",
  type: "Job",
  location: "",
  deadline: "",
  description: "",
  requirements: "",
  is_external: false,
  external_url: "",
  is_active: true,
};

const typeColors: Record<string, string> = {
  Job: "bg-amber-100 text-amber-800 border-amber-200",
  Internship: "bg-indigo-100 text-indigo-800 border-indigo-200",
  Volunteer: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Workshop: "bg-purple-100 text-purple-800 border-purple-200",
};

export default function AdminOpportunities() {
  const [data, setData] = useState<ApiOpportunity[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ApiOpportunity | null>(null);
  const [form, setForm] = useState<OppForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showActive, setShowActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const load = async (p: number) => {
    setLoading(true);
    const res = await adminFetchOpportunities(p);
    if (res) { setData(res.items); setPage(res.page); setPages(res.pages); }
    setLoading(false);
  };

  useEffect(() => { load(page); }, [page]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (opp: ApiOpportunity) => {
    setEditing(opp);
    setForm({
      title: opp.title,
      type: opp.type,
      location: opp.location,
      deadline: opp.deadline || "",
      description: opp.description,
      requirements: opp.requirements.join("\n"),
      is_external: opp.is_external,
      external_url: opp.external_url || "",
      is_active: opp.is_active,
    });
    setErrors({});
    setShowModal(true);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.location.trim()) errs.location = "Location is required";
    if (!form.description.trim()) errs.description = "Description is required";
    if (form.description.trim().length < 10) errs.description = "Description must be at least 10 characters";
    if (form.is_external && !form.external_url.trim()) errs.external_url = "External URL is required for external postings";
    if (form.is_external && form.external_url.trim() && !form.external_url.startsWith("http")) errs.external_url = "URL must start with http:// or https://";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);

    const payload = {
      title: form.title.trim(),
      type: form.type,
      location: form.location.trim(),
      deadline: form.deadline.trim() || null,
      description: form.description.trim(),
      requirements: form.requirements
        .split("\n")
        .map((r) => r.trim())
        .filter(Boolean),
      is_external: form.is_external,
      external_url: form.is_external ? form.external_url.trim() : null,
      is_active: form.is_active,
    };

    if (editing) {
      await adminUpdateOpportunity(editing.id, payload);
    } else {
      await adminCreateOpportunity(payload);
    }

    setSaving(false);
    setShowModal(false);
    load(page);
  };

  const del = async (id: number) => {
    if (!confirm("Delete this opportunity permanently?")) return;
    if (await adminDeleteOpportunity(id)) load(page);
  };

  const toggleActive = async (opp: ApiOpportunity) => {
    await adminUpdateOpportunity(opp.id, { is_active: !opp.is_active });
    load(page);
  };

  const filteredData = showActive ? data : data.filter((o) => !o.is_active);

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Opportunities</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage job, internship, volunteer & workshop postings</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-md hover:shadow-lg active:scale-[0.97]"
        >
          <Plus className="h-4 w-4" />
          <span>New Posting</span>
        </button>
      </div>

      {/* Toggle active/inactive */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setShowActive(true)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            showActive ? "bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm" : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          Active ({data.filter((o) => o.is_active).length})
        </button>
        <button
          onClick={() => setShowActive(false)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            !showActive ? "bg-rose-100 text-rose-800 border border-rose-200 shadow-sm" : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          Inactive ({data.filter((o) => !o.is_active).length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="h-8 w-8 bg-gray-200 rounded-full" />
            <span className="text-sm">Loading opportunities…</span>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-[10px] uppercase tracking-widest text-gray-400 font-bold bg-gray-50/50">
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Deadline</th>
                  <th className="px-4 py-3">Apply</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 w-28" />
                </tr>
              </thead>
              <tbody>
                {filteredData.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-emerald-50/30 text-gray-700 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${typeColors[r.type] || "bg-gray-100 text-gray-600"}`}>
                        {r.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium max-w-[200px] truncate">{r.title}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{r.location}</td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-500">{r.deadline || "—"}</td>
                    <td className="px-4 py-3">
                      {r.is_external ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border bg-sky-100 text-sky-700 border-sky-200">
                          <ExternalLink className="h-3 w-3" />
                          External
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border bg-indigo-100 text-indigo-700 border-indigo-200">
                          <FileText className="h-3 w-3" />
                          Internal
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        r.is_active
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : "bg-gray-100 text-gray-500 border-gray-200"
                      }`}>
                        {r.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleActive(r)}
                          className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title={r.is_active ? "Deactivate" : "Activate"}
                        >
                          {r.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={() => openEdit(r)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => del(r.id)}
                          className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-8 w-8 text-gray-300" />
                        <p className="text-sm">No {showActive ? "active" : "inactive"} opportunities found.</p>
                        <button onClick={openCreate} className="text-xs text-emerald-600 font-semibold hover:text-emerald-500 underline">
                          Create your first posting
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-2 rounded-xl border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs text-gray-500 font-mono">{page} / {pages}</span>
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

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 relative shadow-2xl border border-emerald-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2.5 rounded-xl ${editing ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}>
                {editing ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              </div>
              <div>
                <h2 className="font-display font-bold text-xl text-gray-900">
                  {editing ? "Edit Opportunity" : "New Opportunity"}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {editing ? "Update the posting details below" : "Fill in the details for the new posting"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Community Forestry Coordinator"
                  className={`w-full bg-gray-50 border ${errors.title ? "border-rose-300" : "border-gray-200"} focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none transition-all`}
                />
                {errors.title && <p className="text-[10px] text-rose-500 mt-1">{errors.title}</p>}
              </div>

              {/* Type + Deadline row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Type *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none transition-all"
                  >
                    <option value="Job">Job</option>
                    <option value="Internship">Internship</option>
                    <option value="Volunteer">Volunteer</option>
                    <option value="Workshop">Workshop</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Deadline</label>
                  <input
                    type="text"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    placeholder="e.g. July 15, 2026"
                    className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Location *</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Kigali, Rwanda"
                  className={`w-full bg-gray-50 border ${errors.location ? "border-rose-300" : "border-gray-200"} focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none transition-all`}
                />
                {errors.location && <p className="text-[10px] text-rose-500 mt-1">{errors.location}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description *</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the role, responsibilities, and what makes this opportunity unique…"
                  className={`w-full bg-gray-50 border ${errors.description ? "border-rose-300" : "border-gray-200"} focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none transition-all resize-none`}
                />
                {errors.description && <p className="text-[10px] text-rose-500 mt-1">{errors.description}</p>}
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Requirements <span className="text-gray-400 font-normal">(one per line)</span>
                </label>
                <textarea
                  rows={4}
                  value={form.requirements}
                  onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                  placeholder="Bachelor's degree in Environmental Science&#10;Fluent in English and Kinyarwanda&#10;2+ years experience"
                  className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none transition-all resize-none font-mono"
                />
              </div>

              {/* External Toggle */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_external"
                    checked={form.is_external}
                    onChange={(e) => setForm({ ...form, is_external: e.target.checked, external_url: e.target.checked ? form.external_url : "" })}
                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <label htmlFor="is_external" className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-amber-600" />
                    External posting — applications handled outside We4Climate
                  </label>
                </div>
                {form.is_external && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">External Application URL *</label>
                    <input
                      type="url"
                      value={form.external_url}
                      onChange={(e) => setForm({ ...form, external_url: e.target.value })}
                      placeholder="https://example.com/apply"
                      className={`w-full bg-white border ${errors.external_url ? "border-rose-300" : "border-gray-200"} focus:border-amber-500 rounded-xl px-4 py-2 text-xs text-gray-900 focus:outline-none transition-all`}
                    />
                    {errors.external_url && <p className="text-[10px] text-rose-500 mt-1">{errors.external_url}</p>}
                    <p className="text-[10px] text-gray-400 mt-1">Users will be redirected to this URL to apply externally</p>
                  </div>
                )}
              </div>

              {/* Active */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="is_active" className="text-xs font-semibold text-gray-700">
                  Active — visible on the public opportunities page
                </label>
              </div>

              {/* Actions */}
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-xl text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-md disabled:opacity-50 hover:shadow-lg active:scale-[0.97]"
                >
                  {saving ? (
                    <span className="flex items-center gap-1.5">
                      <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Saving…
                    </span>
                  ) : editing ? "Update Posting" : "Create Posting"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
