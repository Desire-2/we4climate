import { useEffect, useState, type FormEvent } from "react";
import {
  Plus, X, Trash2, CheckCircle2, AlertCircle, Loader2, Calendar,
  Award, Eye, HelpCircle, ChevronDown, ChevronUp,
  Sparkles, ToggleLeft, ToggleRight, Clock,
} from "lucide-react";
import {
  adminFetchWeeklyChallenges,
  adminCreateWeeklyChallenge,
  adminUpdateWeeklyChallenge,
  adminDeleteWeeklyChallenge,
  type ApiWeeklyChallenge,
  type ApiWeeklyChallengeQuestion,
} from "../api/client";

interface QuestionForm {
  text: string;
  options: string[];
  correct: number;
  explanation: string;
}

const emptyQuestion = (): QuestionForm => ({
  text: "",
  options: ["", "", "", ""],
  correct: 0,
  explanation: "",
});

export default function AdminWeeklyChallenges() {
  const [challenges, setChallenges] = useState<ApiWeeklyChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  // Create / Edit modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [weekStart, setWeekStart] = useState("");
  const [weekEnd, setWeekEnd] = useState("");
  const [questions, setQuestions] = useState<QuestionForm[]>([emptyQuestion()]);
  const [isActive, setIsActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Expanded challenge ID for viewing questions
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Toast
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    const data = await adminFetchWeeklyChallenges();
    setChallenges(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // ── Open create modal ──
  const openCreate = () => {
    setEditingId(null);
    setTitle("");
    setWeekStart("");
    setWeekEnd("");
    setQuestions([emptyQuestion()]);
    setIsActive(false);
    setError("");
    setShowModal(true);
  };

  // ── Open edit modal ──
  const openEdit = (c: ApiWeeklyChallenge) => {
    setEditingId(c.id);
    setTitle(c.title);
    setWeekStart(c.week_start.slice(0, 10));
    setWeekEnd(c.week_end.slice(0, 10));
    setQuestions(
      c.questions.map((q) => ({
        text: q.text,
        options: q.options.length >= 2 ? q.options : ["", ""],
        correct: q.correct,
        explanation: q.explanation,
      })),
    );
    setIsActive(c.is_active);
    setError("");
    setShowModal(true);
  };

  // ── Question helpers ──
  const addQuestion = () => setQuestions([...questions, emptyQuestion()]);
  const removeQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };
  const updateQuestion = (idx: number, field: keyof QuestionForm, value: unknown) => {
    setQuestions(
      questions.map((q, i) => (i === idx ? { ...q, [field]: value } : q)),
    );
  };
  const updateOption = (qIdx: number, oIdx: number, value: string) => {
    setQuestions(
      questions.map((q, i) =>
        i === qIdx
          ? { ...q, options: q.options.map((o, j) => (j === oIdx ? value : o)) }
          : q,
      ),
    );
  };

  // ── Save ──
  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    // Validate questions
    for (const q of questions) {
      if (!q.text.trim()) { setError("Each question must have text."); setSaving(false); return; }
      if (q.options.some((o) => !o.trim())) { setError("All options must be filled in."); setSaving(false); return; }
      if (!q.explanation.trim()) { setError("Each question needs an explanation."); setSaving(false); return; }
    }

    const payload = {
      title: title.trim(),
      week_start: weekStart,
      week_end: weekEnd,
      questions: questions.map((q) => ({
        text: q.text.trim(),
        options: q.options.map((o) => o.trim()),
        correct: q.correct,
        explanation: q.explanation.trim(),
      })),
      is_active: isActive,
    };

    const result = editingId
      ? await adminUpdateWeeklyChallenge(editingId, payload)
      : await adminCreateWeeklyChallenge(payload as Omit<ApiWeeklyChallenge, "id" | "created_at">);

    setSaving(false);
    if (result) {
      setShowModal(false);
      showToast("success", editingId ? "Challenge updated" : "Challenge created");
      load();
    } else {
      setError("Failed to save challenge. Check fields and try again.");
    }
  };

  // ── Toggle active ──
  const toggleActive = async (c: ApiWeeklyChallenge) => {
    const result = await adminUpdateWeeklyChallenge(c.id, { is_active: !c.is_active });
    if (result) {
      showToast("success", result.is_active ? "Challenge activated" : "Challenge deactivated");
      load();
    } else {
      showToast("error", "Failed to toggle challenge");
    }
  };

  // ── Delete ──
  const del = async (id: number) => {
    if (!confirm("Delete this challenge permanently?")) return;
    if (await adminDeleteWeeklyChallenge(id)) {
      showToast("success", "Challenge deleted");
      load();
    } else {
      showToast("error", "Failed to delete challenge");
    }
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="p-6 sm:p-8 space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-xl border text-sm font-medium transition-all animate-in slide-in-from-right ${
          toast.type === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
            : "bg-rose-50 border-rose-200 text-rose-800"
        }`}>
          {toast.type === "success" ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-rose-500" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Weekly Challenges</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Create and manage weekly quiz challenges for the Advocacy Passport
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          New Challenge
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…
        </div>
      ) : challenges.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <Sparkles className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">No weekly challenges yet</p>
          <p className="text-xs text-gray-400 mt-1">Create your first challenge to power the Advocacy Passport quiz.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {challenges.map((c) => {
            const isExpanded = expandedId === c.id;
            const isCurrent = c.is_active;

            return (
              <div
                key={c.id}
                className={`bg-white rounded-2xl border-2 transition-all overflow-hidden ${
                  isCurrent ? "border-emerald-300 shadow-md" : "border-gray-100 hover:border-gray-200"
                }`}
              >
                {/* Card header */}
                <div className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                      isCurrent ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-500"
                    }`}>
                      <Award className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 truncate">{c.title}</span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Sparkles className="h-2.5 w-2.5" />
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(c.week_start).toLocaleDateString()} – {new Date(c.week_end).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <HelpCircle className="h-3 w-3" />
                          {c.questions.length} question{c.questions.length !== 1 ? "s" : ""}
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="h-3 w-3 text-emerald-500" />
                          <span className="font-semibold text-emerald-600">{c.completion_count || 0}</span>
                          completion{c.completion_count !== 1 ? "s" : ""}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(c.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => toggleActive(c)}
                      className={`p-2 rounded-lg transition-colors ${
                        isCurrent
                          ? "text-emerald-600 hover:bg-emerald-50"
                          : "text-gray-400 hover:bg-gray-100"
                      }`}
                      title={isCurrent ? "Deactivate" : "Activate"}
                    >
                      {isCurrent ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={() => openEdit(c)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => del(c.id)}
                      className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : c.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded questions preview */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-4 space-y-3 bg-gray-50/50">
                    {c.questions.map((q, qi) => (
                      <div key={qi} className="bg-white rounded-xl border border-gray-100 p-4">
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded mt-0.5 flex-shrink-0">
                            Q{qi + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-800">{q.text}</p>
                            <div className="mt-2 space-y-1">
                              {q.options.map((opt, oi) => (
                                <div
                                  key={oi}
                                  className={`text-xs px-3 py-1.5 rounded-lg ${
                                    oi === q.correct
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium"
                                      : "bg-gray-50 text-gray-500 border border-gray-100"
                                  }`}
                                >
                                  {oi === q.correct && <CheckCircle2 className="h-3 w-3 inline mr-1 text-emerald-500" />}
                                  {opt}
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-gray-400 mt-2 italic">{q.explanation}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto pt-12">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 sm:p-8 relative my-8">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-gray-900">
                  {editingId ? "Edit Challenge" : "New Weekly Challenge"}
                </h2>
                <p className="text-xs text-gray-500">
                  {editingId ? "Update the challenge questions and settings" : "Create a new weekly quiz challenge"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Challenge Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
                  placeholder="e.g. Week 1 — Ecosystem Restoration"
                />
              </div>

              {/* Date range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Week Start</label>
                  <input
                    type="date"
                    required
                    value={weekStart}
                    onChange={(e) => setWeekStart(e.target.value)}
                    max={weekEnd || undefined}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Week End</label>
                  <input
                    type="date"
                    required
                    value={weekEnd}
                    onChange={(e) => setWeekEnd(e.target.value)}
                    min={weekStart || undefined}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700">Questions</label>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Add Question
                  </button>
                </div>

                {questions.map((q, qi) => (
                  <div key={qi} className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Question {qi + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeQuestion(qi)}
                        className="p-1 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        disabled={questions.length <= 1}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={q.text}
                      onChange={(e) => updateQuestion(qi, "text", e.target.value)}
                      placeholder="Enter the question text…"
                      className="w-full bg-white border border-gray-200 focus:border-emerald-500 rounded-xl px-4 py-2 text-sm focus:outline-none transition-all"
                    />

                    <div className="space-y-2">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Options</span>
                      {q.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQuestion(qi, "correct", oi)}
                            className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              q.correct === oi
                                ? "border-emerald-500 bg-emerald-50"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                          >
                            {q.correct === oi && <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                          </button>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => updateOption(qi, oi, e.target.value)}
                            placeholder={`Option ${oi + 1}`}
                            className="flex-1 bg-white border border-gray-200 focus:border-emerald-500 rounded-lg px-3 py-1.5 text-sm focus:outline-none transition-all"
                          />
                        </div>
                      ))}
                      <p className="text-[10px] text-gray-400 ml-7">Select the radio to mark as correct answer</p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Explanation</label>
                      <textarea
                        value={q.explanation}
                        onChange={(e) => updateQuestion(qi, "explanation", e.target.value)}
                        placeholder="Explain why the correct answer is right…"
                        rows={2}
                        className="w-full bg-white border border-gray-200 focus:border-emerald-500 rounded-xl px-4 py-2 text-sm focus:outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Active toggle */}
              <label className="flex items-center gap-2.5 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isActive ? "text-emerald-600 bg-emerald-50" : "text-gray-400 bg-gray-100"
                  }`}
                >
                  {isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                </button>
                <div>
                  <span className="text-sm font-medium text-gray-700">Activate immediately</span>
                  <p className="text-xs text-gray-400">Only one challenge can be active at a time</p>
                </div>
              </label>

              {error && (
                <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                {saving ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                ) : (
                  <><Plus className="h-4 w-4" /> {editingId ? "Update Challenge" : "Create Challenge"}</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
