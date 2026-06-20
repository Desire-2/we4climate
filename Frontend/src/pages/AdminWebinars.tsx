import { useEffect, useState, type FormEvent } from "react";
import {
  Plus, X, Trash2, CheckCircle2, AlertCircle, Loader2, Calendar,
  Clock, Users, Monitor, ToggleLeft, ToggleRight, Star, User,
  Pencil,
} from "lucide-react";
import {
  adminFetchWebinars,
  adminCreateWebinar,
  adminUpdateWebinar,
  adminDeleteWebinar,
  type ApiWebinar,
} from "../api/client";

export default function AdminWebinars() {
  const [webinars, setWebinars] = useState<ApiWebinar[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [speakerTitle, setSpeakerTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [maxCapacity, setMaxCapacity] = useState<number | "">("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Toast
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    const data = await adminFetchWebinars();
    setWebinars(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setTitle(""); setSpeaker(""); setSpeakerTitle(""); setDate(""); setTime("");
    setDescription(""); setMaxCapacity(""); setIsActive(true); setError("");
    setShowModal(true);
  };

  const openEdit = (w: ApiWebinar) => {
    setEditingId(w.id);
    setTitle(w.title); setSpeaker(w.speaker); setSpeakerTitle(w.speaker_title || "");
    setDate(w.date); setTime(w.time); setDescription(w.description);
    setMaxCapacity(w.max_capacity ?? ""); setIsActive(w.is_active); setError("");
    setShowModal(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true); setError("");

    const payload = {
      title: title.trim(), speaker: speaker.trim(),
      speaker_title: speakerTitle.trim() || null,
      date: date.trim(), time: time.trim(),
      description: description.trim(),
      max_capacity: maxCapacity === "" ? null : Number(maxCapacity),
      is_active: isActive,
    };

    const result = editingId
      ? await adminUpdateWebinar(editingId, payload)
      : await adminCreateWebinar(payload as any);

    setSaving(false);
    if (result) {
      setShowModal(false);
      showToast("success", editingId ? "Webinar updated" : "Webinar created");
      load();
    } else {
      setError("Failed to save webinar. Check fields and try again.");
    }
  };

  const toggleActive = async (w: ApiWebinar) => {
    const res = await adminUpdateWebinar(w.id, { is_active: !w.is_active });
    if (res) {
      showToast("success", res.is_active ? "Webinar activated" : "Webinar deactivated");
      load();
    } else showToast("error", "Failed to toggle webinar");
  };

  const del = async (id: number) => {
    if (!confirm("Delete this webinar permanently?")) return;
    if (await adminDeleteWebinar(id)) {
      showToast("success", "Webinar deleted");
      load();
    } else showToast("error", "Failed to delete webinar");
  };

  return (
    <div className="p-6 sm:p-8 space-y-6">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-xl border text-sm font-medium transition-all animate-in slide-in-from-right ${
          toast.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"
        }`}>
          {toast.type === "success" ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-rose-500" />}
          {toast.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Webinars</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage the Webinar Classroom — expert-led sessions</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm">
          <Plus className="h-3.5 w-3.5" /> New Webinar
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400"><Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…</div>
      ) : webinars.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <Monitor className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">No webinars yet</p>
          <p className="text-xs text-gray-400 mt-1">Create your first webinar for the community.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {webinars.map((w) => (
            <div key={w.id} className={`bg-white rounded-2xl border-2 transition-all p-5 ${
              w.is_active ? "border-emerald-300 shadow-md" : "border-gray-100 hover:border-gray-200"
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${w.is_active ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
                    <Monitor className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{w.title}</span>
                      {w.is_active && (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Star className="h-2.5 w-2.5 fill-emerald-400" /> Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-600">{w.speaker}</span>
                      {w.speaker_title && (
                        <span className="text-[10px] text-gray-400">— {w.speaker_title}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {w.date}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {w.time}</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span className="font-semibold text-emerald-600">{w.registered_count}</span>
                        {w.max_capacity ? (
                          <> / {w.max_capacity} seats</>
                        ) : (
                          <> registered</>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => toggleActive(w)} className={`p-2 rounded-lg transition-colors ${w.is_active ? "text-emerald-600 hover:bg-emerald-50" : "text-gray-400 hover:bg-gray-100"}`} title={w.is_active ? "Deactivate" : "Activate"}>
                    {w.is_active ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                  </button>
                  <button onClick={() => openEdit(w)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => del(w.id)} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 ml-12 line-clamp-2">{w.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto pt-12">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-6 sm:p-8 relative my-8">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-600"><Monitor className="h-5 w-5" /></div>
              <div>
                <h2 className="font-display font-bold text-lg text-gray-900">{editingId ? "Edit Webinar" : "New Webinar"}</h2>
                <p className="text-xs text-gray-500">Schedule an expert-led session for the community</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Title</label>
                  <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all" placeholder="e.g. Climate Resilience in Rwanda" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Speaker Name</label>
                  <input type="text" required value={speaker} onChange={(e) => setSpeaker(e.target.value)} className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all" placeholder="e.g. Dr. Jean d'Amour" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Speaker Title</label>
                  <input type="text" value={speakerTitle} onChange={(e) => setSpeakerTitle(e.target.value)} className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all" placeholder="e.g. REMA Delegate" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Date</label>
                  <input type="text" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all" placeholder="e.g. July 12, 2026" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Time</label>
                  <input type="text" required value={time} onChange={(e) => setTime(e.target.value)} className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all" placeholder="e.g. 2:00 PM - 4:00 PM CAT" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                  <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all resize-none" placeholder="Describe what attendees will learn..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Max Capacity (optional)</label>
                  <input type="number" min={1} value={maxCapacity} onChange={(e) => setMaxCapacity(e.target.value === "" ? "" : parseInt(e.target.value) || 0)} className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all" placeholder="Leave empty for unlimited" />
                </div>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                <button type="button" onClick={() => setIsActive(!isActive)} className={`p-1.5 rounded-lg transition-colors ${isActive ? "text-emerald-600 bg-emerald-50" : "text-gray-400 bg-gray-100"}`}>
                  {isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                </button>
                <span className="text-sm font-medium text-gray-700">Active & visible to users</span>
              </label>

              {error && <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{error}</p>}

              <button type="submit" disabled={saving} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Plus className="h-4 w-4" /> {editingId ? "Update Webinar" : "Create Webinar"}</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
