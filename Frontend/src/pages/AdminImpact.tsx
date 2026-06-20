import { useEffect, useState } from "react";
import {
  Map, TreePine, Users, GraduationCap, Milestone, Quote, Plus, Save,
  Trash2, Pencil, X, Eye, EyeOff, Sparkles, Globe,
  ChevronDown, ChevronUp, Target, Lightbulb,
} from "lucide-react";
import {
  adminFetchDistricts, adminCreateDistrict, adminUpdateDistrict, adminDeleteDistrict,
  adminFetchStories, adminCreateStory, adminUpdateStory, adminDeleteStory,
  adminFetchYearlyTargets, adminCreateYearlyTarget, adminUpdateYearlyTarget, adminDeleteYearlyTarget,
  adminFetchGoals, adminCreateGoal, adminUpdateGoal, adminDeleteGoal,
  type ApiDistrictMetric, type ApiImpactStory, type ApiYearlyTarget, type ApiImpactGoal,
} from "../api/client";

/* ──────────────────────────────────────────────────────────────────── */
/*  Types                                                              */
/* ──────────────────────────────────────────────────────────────────── */

const PROVINCES = [
  { key: "west", label: "Western Province" },
  { key: "north", label: "Northern Province" },
  { key: "east", label: "Eastern Province" },
  { key: "south", label: "Southern Province" },
  { key: "kigali", label: "Kigali City" },
];

const PROVINCE_COLORS: Record<string, string> = {
  west: "bg-amber-100 text-amber-700 border-amber-300",
  north: "bg-blue-100 text-blue-700 border-blue-300",
  east: "bg-emerald-100 text-emerald-700 border-emerald-300",
  south: "bg-purple-100 text-purple-700 border-purple-300",
  kigali: "bg-rose-100 text-rose-700 border-rose-300",
};

/* ──────────────────────────────────────────────────────────────────── */
/*  Toast                                                              */
/* ──────────────────────────────────────────────────────────────────── */

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-bold flex items-center gap-3 ${
      type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
    }`}>
      <span>{message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100"><X className="h-4 w-4" /></button>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */
/*  Utility: PNG-friendly SVG District Map Preview                     */
/* ──────────────────────────────────────────────────────────────────── */

function DistrictMapPreview({ districts, activeId }: { districts: ApiDistrictMetric[]; activeId: number | null }) {
  return (
    <div className="relative w-full aspect-[4/3] bg-emerald-50/30 rounded-2xl border border-emerald-100 overflow-hidden">
      <svg viewBox="0 0 400 300" className="w-full h-full">
        {/* Province paths (simplified) */}
        <path d="M70 45 L105 80 L130 125 L115 185 L90 250 L20 275 L15 230 L45 180 L25 130 L45 85 L35 60 Z"
          className="fill-emerald-800/[0.06] stroke-emerald-300/40 stroke-[1.5]" />
        <path d="M70 45 L120 25 L160 15 L200 18 L250 30 L230 115 L195 115 L130 125 L105 80 Z"
          className="fill-emerald-800/[0.06] stroke-emerald-300/40 stroke-[1.5]" />
        <path d="M250 30 L330 25 L385 110 L365 235 L290 250 L230 255 L240 155 L230 115 Z"
          className="fill-emerald-800/[0.06] stroke-emerald-300/40 stroke-[1.5]" />
        <path d="M240 155 L200 165 L180 140 L195 115 L130 125 L115 185 L90 250 L115 275 L170 285 L230 255 Z"
          className="fill-emerald-800/[0.06] stroke-emerald-300/40 stroke-[1.5]" />
        <path d="M195 115 L230 115 L240 155 L200 165 L180 140 Z"
          className="fill-emerald-800/[0.08] stroke-emerald-300/40 stroke-[1.5]" />

        {/* Province labels */}
        <text x="65" y="145" className="fill-emerald-400/50 text-[10px] font-black uppercase tracking-wider select-none">West</text>
        <text x="160" y="65" className="fill-emerald-400/50 text-[10px] font-black uppercase tracking-wider select-none">North</text>
        <text x="290" y="145" className="fill-emerald-400/50 text-[10px] font-black uppercase tracking-wider select-none">East</text>
        <text x="140" y="215" className="fill-emerald-400/50 text-[10px] font-black uppercase tracking-wider select-none">South</text>
        <text x="195" y="138" className="fill-emerald-600/70 text-[8px] font-black uppercase tracking-wider select-none">Kigali</text>

        {/* District pins */}
        {districts.map((d) => {
          const isActive = d.id === activeId;
          return (
            <g key={d.id}>
              <circle
                cx={d.map_coords_x * 4} cy={d.map_coords_y * 3}
                r={isActive ? 8 : 6}
                className={isActive ? "fill-emerald-600 stroke-white stroke-2" : "fill-emerald-500/70 stroke-white/80 stroke-[1.5]"}
              />
              {isActive && (
                <text
                  x={d.map_coords_x * 4} y={(d.map_coords_y * 3) - 14}
                  textAnchor="middle"
                  className="fill-emerald-700 text-[9px] font-bold select-none"
                >
                  {d.district_name}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */
/*  Main Admin Impact Page                                             */
/* ──────────────────────────────────────────────────────────────────── */

export default function AdminImpact() {
  const [tab, setTab] = useState<"districts" | "stories" | "targets" | "goals">("districts");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // ── Districts state ──
  const [districts, setDistricts] = useState<ApiDistrictMetric[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(true);
  const [editingDistrict, setEditingDistrict] = useState<ApiDistrictMetric | null>(null);
  const [showDistrictForm, setShowDistrictForm] = useState(false);
  const [districtForm, setDistrictForm] = useState<Omit<ApiDistrictMetric, "id">>({
    district_name: "", province: "Eastern Province", province_key: "east",
    description: "", species: [], map_coords_x: 50, map_coords_y: 50,
    trees_planted: 0, community_members: 0, farmers_trained: 0, active_sites: 0,
  });
  const [speciesInput, setSpeciesInput] = useState("");

  // ── Yearly targets state ──
  const [targets, setTargets] = useState<ApiYearlyTarget[]>([]);
  const [loadingTargets, setLoadingTargets] = useState(true);
  const [showTargetForm, setShowTargetForm] = useState(false);
  const [editingTarget, setEditingTarget] = useState<ApiYearlyTarget | null>(null);
  const [targetForm, setTargetForm] = useState({ year: new Date().getFullYear(), trees_target: 0, members_target: 0, farmers_target: 0, sites_target: 0 });

  // ── Goals state ──
  const [goals, setGoals] = useState<ApiImpactGoal[]>([]);
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<ApiImpactGoal | null>(null);
  const [goalForm, setGoalForm] = useState({ title: "", description: "", icon: "Sparkles", milestone: "", action_details: "", sort_order: 0, is_active: true });

  // ── Stories state ──
  const [stories, setStories] = useState<ApiImpactStory[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [showStoryForm, setShowStoryForm] = useState(false);
  const [editingStory, setEditingStory] = useState<ApiImpactStory | null>(null);
  const [storyForm, setStoryForm] = useState({
    name: "", title: "", quote: "", initials: "", district_name: "", is_active: true, sort_order: 0,
  });

  // ── Load data ──
  const loadDistricts = async () => {
    setLoadingDistricts(true);
    const res = await adminFetchDistricts();
    if (res) setDistricts(res);
    setLoadingDistricts(false);
  };
  const loadGoals = async () => {
    setLoadingGoals(true);
    const res = await adminFetchGoals();
    if (res) setGoals(res);
    setLoadingGoals(false);
  };
  const loadTargets = async () => {
    setLoadingTargets(true);
    const res = await adminFetchYearlyTargets();
    if (res) setTargets(res);
    setLoadingTargets(false);
  };
  const loadStories = async () => {
    setLoadingStories(true);
    const res = await adminFetchStories();
    if (res) setStories(res);
    setLoadingStories(false);
  };

  useEffect(() => { loadDistricts(); loadStories(); loadTargets(); loadGoals(); }, []);

  const showToast = (message: string, type: "success" | "error") => setToast({ message, type });

  // ════════════════════════════════════════════════════════════════════
  //  District Actions
  // ════════════════════════════════════════════════════════════════════

  const openNewDistrict = () => {
    setEditingDistrict(null);
    setDistrictForm({
      district_name: "", province: "Eastern Province", province_key: "east",
      description: "", species: [], map_coords_x: 50, map_coords_y: 50,
      trees_planted: 0, community_members: 0, farmers_trained: 0, active_sites: 0,
    });
    setSpeciesInput("");
    setShowDistrictForm(true);
  };

  const openEditDistrict = (d: ApiDistrictMetric) => {
    setEditingDistrict(d);
    setDistrictForm({
      district_name: d.district_name, province: d.province, province_key: d.province_key,
      description: d.description, species: d.species, map_coords_x: d.map_coords_x,
      map_coords_y: d.map_coords_y, trees_planted: d.trees_planted,
      community_members: d.community_members, farmers_trained: d.farmers_trained,
      active_sites: d.active_sites,
    });
    setSpeciesInput("");
    setShowDistrictForm(true);
  };

  const addSpecies = () => {
    const s = speciesInput.trim();
    if (s && !districtForm.species.includes(s)) {
      setDistrictForm((prev) => ({ ...prev, species: [...prev.species, s] }));
    }
    setSpeciesInput("");
  };

  const removeSpecies = (idx: number) => {
    setDistrictForm((prev) => ({ ...prev, species: prev.species.filter((_, i) => i !== idx) }));
  };

  const saveDistrict = async () => {
    if (!districtForm.district_name.trim()) {
      showToast("District name is required", "error");
      return;
    }
    if (editingDistrict) {
      const res = await adminUpdateDistrict(editingDistrict.id, districtForm);
      if (res) { showToast("District updated", "success"); loadDistricts(); setShowDistrictForm(false); }
      else showToast("Failed to update district", "error");
    } else {
      const res = await adminCreateDistrict(districtForm);
      if (res) { showToast("District created", "success"); loadDistricts(); setShowDistrictForm(false); }
      else showToast("Failed to create district", "error");
    }
  };

  const deleteDistrict = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}" district?`)) return;
    if (await adminDeleteDistrict(id)) {
      showToast("District deleted", "success");
      loadDistricts();
    } else showToast("Failed to delete district", "error");
  };

  // ════════════════════════════════════════════════════════════════════
  //  Yearly Target Actions
  // ════════════════════════════════════════════════════════════════════

  const openNewTarget = () => {
    setEditingTarget(null);
    setTargetForm({ year: new Date().getFullYear(), trees_target: 0, members_target: 0, farmers_target: 0, sites_target: 0 });
    setShowTargetForm(true);
  };

  const openEditTarget = (t: ApiYearlyTarget) => {
    setEditingTarget(t);
    setTargetForm({
      year: t.year,
      trees_target: t.trees_target,
      members_target: t.members_target,
      farmers_target: t.farmers_target,
      sites_target: t.sites_target,
    });
    setShowTargetForm(true);
  };

  const saveTarget = async () => {
    if (!targetForm.year) {
      showToast("Year is required", "error");
      return;
    }
    if (editingTarget) {
      const res = await adminUpdateYearlyTarget(editingTarget.id, targetForm);
      if (res) { showToast("Target updated", "success"); loadTargets(); setShowTargetForm(false); }
      else showToast("Failed to update target", "error");
    } else {
      const res = await adminCreateYearlyTarget(targetForm);
      if (res) { showToast("Target created", "success"); loadTargets(); setShowTargetForm(false); }
      else showToast("Failed to create target", "error");
    }
  };

  const deleteTarget = async (id: number, year: number) => {
    if (!confirm(`Delete target for ${year}?`)) return;
    if (await adminDeleteYearlyTarget(id)) {
      showToast("Target deleted", "success");
      loadTargets();
    } else showToast("Failed to delete target", "error");
  };

  // ════════════════════════════════════════════════════════════════════
  //  Goal Actions
  // ════════════════════════════════════════════════════════════════════

  const openNewGoal = () => {
    setEditingGoal(null);
    setGoalForm({ title: "", description: "", icon: "Sparkles", milestone: "", action_details: "", sort_order: 0, is_active: true });
    setShowGoalForm(true);
  };

  const openEditGoal = (g: ApiImpactGoal) => {
    setEditingGoal(g);
    setGoalForm({ title: g.title, description: g.description, icon: g.icon, milestone: g.milestone, action_details: g.action_details, sort_order: g.sort_order, is_active: g.is_active });
    setShowGoalForm(true);
  };

  const saveGoal = async () => {
    if (!goalForm.title.trim() || !goalForm.description.trim()) {
      showToast("Title and description are required", "error"); return;
    }
    const payload = { ...goalForm, sort_order: goalForm.sort_order || 0 };
    if (editingGoal) {
      const res = await adminUpdateGoal(editingGoal.id, payload);
      if (res) { showToast("Goal updated", "success"); loadGoals(); setShowGoalForm(false); }
      else showToast("Failed to update goal", "error");
    } else {
      const res = await adminCreateGoal(payload);
      if (res) { showToast("Goal created", "success"); loadGoals(); setShowGoalForm(false); }
      else showToast("Failed to create goal", "error");
    }
  };

  const deleteGoal = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    if (await adminDeleteGoal(id)) { showToast("Goal deleted", "success"); loadGoals(); }
    else showToast("Failed to delete goal", "error");
  };

  const toggleGoalActive = async (g: ApiImpactGoal) => {
    const res = await adminUpdateGoal(g.id, { is_active: !g.is_active });
    if (res) { loadGoals(); showToast(res.is_active ? "Goal activated" : "Goal deactivated", "success"); }
  };

  // ════════════════════════════════════════════════════════════════════
  //  Story Actions
  // ════════════════════════════════════════════════════════════════════

  const openNewStory = () => {
    setEditingStory(null);
    setStoryForm({ name: "", title: "", quote: "", initials: "", district_name: "", is_active: true, sort_order: 0 });
    setShowStoryForm(true);
  };

  const openEditStory = (s: ApiImpactStory) => {
    setEditingStory(s);
    setStoryForm({
      name: s.name, title: s.title, quote: s.quote, initials: s.initials,
      district_name: s.district_name, is_active: s.is_active, sort_order: s.sort_order,
    });
    setShowStoryForm(true);
  };

  const saveStory = async () => {
    if (!storyForm.name.trim() || !storyForm.quote.trim()) {
      showToast("Name and quote are required", "error");
      return;
    }
    const payload = {
      ...storyForm,
      initials: storyForm.initials || storyForm.name.slice(0, 2).toUpperCase(),
    };
    if (editingStory) {
      const res = await adminUpdateStory(editingStory.id, payload);
      if (res) { showToast("Story updated", "success"); loadStories(); setShowStoryForm(false); }
      else showToast("Failed to update story", "error");
    } else {
      const res = await adminCreateStory(payload);
      if (res) { showToast("Story created", "success"); loadStories(); setShowStoryForm(false); }
      else showToast("Failed to create story", "error");
    }
  };

  const deleteStory = async (id: number, name: string) => {
    if (!confirm(`Delete story by "${name}"?`)) return;
    if (await adminDeleteStory(id)) {
      showToast("Story deleted", "success");
      loadStories();
    } else showToast("Failed to delete story", "error");
  };

  const toggleStoryActive = async (s: ApiImpactStory) => {
    const res = await adminUpdateStory(s.id, { is_active: !s.is_active });
    if (res) { loadStories(); showToast(res.is_active ? "Story activated" : "Story deactivated", "success"); }
  };

  const moveStory = async (s: ApiImpactStory, dir: -1 | 1) => {
    const idx = stories.findIndex((x) => x.id === s.id);
    const target = idx + dir;
    if (target < 0 || target >= stories.length) return;
    const swapped = [...stories];
    const temp = { ...swapped[idx], sort_order: swapped[target].sort_order };
    swapped[idx] = { ...swapped[idx], sort_order: swapped[target].sort_order };
    swapped[target] = { ...swapped[target], sort_order: temp.sort_order };

    // Optimistic update
    setStories(swapped);
    const res1 = await adminUpdateStory(s.id, { sort_order: swapped[idx].sort_order });
    const res2 = await adminUpdateStory(swapped[target].id, { sort_order: swapped[target].sort_order });
    if (!res1 || !res2) loadStories(); // re-fetch on failure
  };

  // ── Render ──
  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Impact Content</h1>
          <p className="text-sm text-gray-500 mt-1">Manage districts, stories, and impact data for the public site</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit mb-8">
        <button
          onClick={() => setTab("districts")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            tab === "districts" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Map className="h-4 w-4" /> Districts
        </button>
        <button
          onClick={() => setTab("stories")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            tab === "stories" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Quote className="h-4 w-4" /> Stories
        </button>
        <button
          onClick={() => setTab("targets")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            tab === "targets" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Target className="h-4 w-4" /> Targets
        </button>
        <button
          onClick={() => setTab("goals")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            tab === "goals" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Lightbulb className="h-4 w-4" /> Goals
        </button>
      </div>

      {/* ════════════════════════════════════════ */}
      {/*  DISTRICTS TAB                          */}
      {/* ════════════════════════════════════════ */}
      {tab === "districts" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left + Center: District cards */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                {districts.length} District{districts.length !== 1 ? "s" : ""}
              </span>
              <button
                onClick={openNewDistrict}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> New District
              </button>
            </div>

            {loadingDistricts ? (
              <div className="text-center py-12 text-gray-400">Loading…</div>
            ) : districts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                <Map className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-400 font-medium">No districts configured yet</p>
                <button onClick={openNewDistrict} className="mt-3 text-sm text-emerald-600 font-semibold hover:underline">Create your first district</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {districts.map((d) => (
                  <div key={d.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all group">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-display font-bold text-gray-900">{d.district_name}</h3>
                        <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${PROVINCE_COLORS[d.province_key] || "bg-gray-100 text-gray-500"}`}>
                          {d.province}
                        </span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditDistrict(d)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => deleteDistrict(d.id, d.district_name)} className="p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                    {/* Mini metrics */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500"><TreePine className="h-3.5 w-3.5 text-emerald-500" /><span className="font-semibold text-gray-700">{d.trees_planted.toLocaleString()}</span> trees</div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500"><Users className="h-3.5 w-3.5 text-blue-500" /><span className="font-semibold text-gray-700">{d.community_members.toLocaleString()}</span> members</div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500"><GraduationCap className="h-3.5 w-3.5 text-amber-500" /><span className="font-semibold text-gray-700">{d.farmers_trained.toLocaleString()}</span> farmers</div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500"><Milestone className="h-3.5 w-3.5 text-purple-500" /><span className="font-semibold text-gray-700">{d.active_sites}</span> sites</div>
                    </div>
                    {d.species && d.species.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {d.species.map((s, i) => (
                          <span key={i} className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Map preview + form */}
          <div className="space-y-4">
            {/* Map Preview */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                <Globe className="h-3.5 w-3.5" /> Map Preview
              </h3>
              <DistrictMapPreview districts={districts} activeId={editingDistrict?.id ?? null} />
            </div>

            {/* District Form */}
            {showDistrictForm && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                <h3 className="font-display font-bold text-gray-900">
                  {editingDistrict ? `Edit: ${editingDistrict.district_name}` : "New District"}
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-1">Name</label>
                    <input value={districtForm.district_name} onChange={(e) => setDistrictForm((p) => ({ ...p, district_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" placeholder="e.g. Bugesera" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-1">Province</label>
                    <select value={districtForm.province_key} onChange={(e) => {
                      const key = e.target.value;
                      const p = PROVINCES.find((x) => x.key === key);
                      setDistrictForm((prev) => ({ ...prev, province_key: key, province: p?.label || key }));
                    }} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400">
                      {PROVINCES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-1">Map X</label>
                      <input type="number" min={0} max={100} value={districtForm.map_coords_x}
                        onChange={(e) => setDistrictForm((p) => ({ ...p, map_coords_x: Number(e.target.value) }))}
                        className="w-20 px-2 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-1">Map Y</label>
                      <input type="number" min={0} max={100} value={districtForm.map_coords_y}
                        onChange={(e) => setDistrictForm((p) => ({ ...p, map_coords_y: Number(e.target.value) }))}
                        className="w-20 px-2 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-1">Species</label>
                  <div className="flex gap-2 mb-2">
                    <input value={speciesInput} onChange={(e) => setSpeciesInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSpecies())}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" placeholder="Add species..." />
                    <button onClick={addSpecies} className="px-3 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200">Add</button>
                  </div>
                  {districtForm.species.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {districtForm.species.map((s, i) => (
                        <span key={i} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg flex items-center gap-1">
                          {s}
                          <button onClick={() => removeSpecies(i)} className="hover:text-red-500"><X className="h-3 w-3" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-1">Description</label>
                  <textarea value={districtForm.description} onChange={(e) => setDistrictForm((p) => ({ ...p, description: e.target.value }))}
                    rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" placeholder="Describe this district's impact..." />
                </div>

                {/* Key metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-1"><TreePine className="h-3 w-3 inline mr-1" />Trees</label>
                    <input type="number" value={districtForm.trees_planted} onChange={(e) => setDistrictForm((p) => ({ ...p, trees_planted: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-1"><Users className="h-3 w-3 inline mr-1" />Members</label>
                    <input type="number" value={districtForm.community_members} onChange={(e) => setDistrictForm((p) => ({ ...p, community_members: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-1"><GraduationCap className="h-3 w-3 inline mr-1" />Farmers</label>
                    <input type="number" value={districtForm.farmers_trained} onChange={(e) => setDistrictForm((p) => ({ ...p, farmers_trained: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-1"><Milestone className="h-3 w-3 inline mr-1" />Sites</label>
                    <input type="number" value={districtForm.active_sites} onChange={(e) => setDistrictForm((p) => ({ ...p, active_sites: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button onClick={saveDistrict} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2">
                    <Save className="h-4 w-4" /> {editingDistrict ? "Update District" : "Create District"}
                  </button>
                  <button onClick={() => setShowDistrictForm(false)} className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════ */}
      {/*  YEARLY TARGETS TAB                     */}
      {/* ════════════════════════════════════════ */}
      {tab === "targets" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left + Center: Target cards */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                {targets.length} Year{targets.length !== 1 ? "s" : ""} configured
              </span>
              <button
                onClick={openNewTarget}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> New Target
              </button>
            </div>

            {loadingTargets ? (
              <div className="text-center py-12 text-gray-400">Loading…</div>
            ) : targets.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                <Target className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-400 font-medium">No yearly targets set</p>
                <p className="text-xs text-gray-300 mt-1">Set targets for trees, members, farmers, and sites per year to power the impact chart.</p>
                <button onClick={openNewTarget} className="mt-3 text-sm text-emerald-600 font-semibold hover:underline">Create your first target</button>
              </div>
            ) : (
              <div className="space-y-3">
                {targets.map((t) => (
                  <div key={t.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-100 rounded-xl">
                          <Target className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-lg text-gray-900">{t.year}</h3>
                          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Yearly Targets</span>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditTarget(t)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => deleteTarget(t.id, t.year)} className="p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>

                    {/* Metrics grid */}
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-emerald-50 rounded-xl p-3 text-center">
                        <div className="text-2xl font-display font-black text-emerald-700">{t.trees_target.toLocaleString()}</div>
                        <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mt-0.5"><TreePine className="h-3 w-3 inline mr-1" />Trees</div>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-3 text-center">
                        <div className="text-2xl font-display font-black text-blue-700">{t.members_target.toLocaleString()}</div>
                        <div className="text-[10px] text-blue-500 font-bold uppercase tracking-wider mt-0.5"><Users className="h-3 w-3 inline mr-1" />Members</div>
                      </div>
                      <div className="bg-amber-50 rounded-xl p-3 text-center">
                        <div className="text-2xl font-display font-black text-amber-700">{t.farmers_target.toLocaleString()}</div>
                        <div className="text-[10px] text-amber-500 font-bold uppercase tracking-wider mt-0.5"><GraduationCap className="h-3 w-3 inline mr-1" />Farmers</div>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-3 text-center">
                        <div className="text-2xl font-display font-black text-purple-700">{t.sites_target.toLocaleString()}</div>
                        <div className="text-[10px] text-purple-500 font-bold uppercase tracking-wider mt-0.5"><Milestone className="h-3 w-3 inline mr-1" />Sites</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Target form */}
          <div>
            {showTargetForm && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 sticky top-6">
                <h3 className="font-display font-bold text-gray-900">
                  {editingTarget ? `Edit: ${editingTarget.year} Targets` : "New Yearly Target"}
                </h3>

                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-1">Year</label>
                  <input type="number" min={2020} max={2100} value={targetForm.year}
                    onChange={(e) => setTargetForm((p) => ({ ...p, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-1"><TreePine className="h-3 w-3 inline mr-1" />Trees Target</label>
                    <input type="number" value={targetForm.trees_target}
                      onChange={(e) => setTargetForm((p) => ({ ...p, trees_target: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-1"><Users className="h-3 w-3 inline mr-1" />Members Target</label>
                    <input type="number" value={targetForm.members_target}
                      onChange={(e) => setTargetForm((p) => ({ ...p, members_target: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-1"><GraduationCap className="h-3 w-3 inline mr-1" />Farmers Target</label>
                    <input type="number" value={targetForm.farmers_target}
                      onChange={(e) => setTargetForm((p) => ({ ...p, farmers_target: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-1"><Milestone className="h-3 w-3 inline mr-1" />Sites Target</label>
                    <input type="number" value={targetForm.sites_target}
                      onChange={(e) => setTargetForm((p) => ({ ...p, sites_target: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button onClick={saveTarget} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2">
                    <Save className="h-4 w-4" /> {editingTarget ? "Update" : "Create"}
                  </button>
                  <button onClick={() => setShowTargetForm(false)} className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════ */}
      {/*  GOALS TAB (10 Pillars)                 */}
      {/* ════════════════════════════════════════ */}
      {tab === "goals" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left + Center: Goal cards */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                {goals.filter((g) => g.is_active).length} Active · {goals.length} Total
              </span>
              <button onClick={openNewGoal} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 transition-colors">
                <Plus className="h-3.5 w-3.5" /> New Goal
              </button>
            </div>

            {loadingGoals ? (
              <div className="text-center py-12 text-gray-400">Loading…</div>
            ) : goals.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                <Lightbulb className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-400 font-medium">No goals configured yet</p>
                <p className="text-xs text-gray-300 mt-1">Create the 10 Pillars of Change that appear on the About page.</p>
                <button onClick={openNewGoal} className="mt-3 text-sm text-emerald-600 font-semibold hover:underline">Create your first goal</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {goals.map((g) => (
                  <div key={g.id} className={`bg-white rounded-2xl border p-5 hover:shadow-md transition-all group ${g.is_active ? "border-gray-100" : "border-gray-200/50 bg-gray-50/50"}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-100 rounded-xl">
                          <Lightbulb className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-gray-900 text-sm">{g.title}</h3>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${g.is_active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                            {g.is_active ? "Active" : "Hidden"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditGoal(g)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => toggleGoalActive(g)} className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg">{g.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button>
                        <button onClick={() => deleteGoal(g.id, g.title)} className="p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">{g.description}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1.5 rounded-lg">
                      <Sparkles className="h-3 w-3" />
                      <span className="truncate">{g.milestone}</span>
                    </div>
                    {g.action_details && (
                      <p className="text-[10px] text-gray-400 mt-2 line-clamp-2 italic">{g.action_details}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Goal form */}
          <div>
            {showGoalForm && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 sticky top-6">
                <h3 className="font-display font-bold text-gray-900">{editingGoal ? `Edit: ${editingGoal.title}` : "New Goal"}</h3>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-1">Title</label>
                  <input value={goalForm.title} onChange={(e) => setGoalForm((p) => ({ ...p, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" placeholder="e.g. Community & Expert Dialogues" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-1">Icon</label>
                  <input value={goalForm.icon} onChange={(e) => setGoalForm((p) => ({ ...p, icon: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" placeholder="e.g. Eye, Users, Lightbulb, Globe2" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-1">Milestone</label>
                  <input value={goalForm.milestone} onChange={(e) => setGoalForm((p) => ({ ...p, milestone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" placeholder="e.g. 24 Climate Webinars completed" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-1">Description</label>
                  <textarea value={goalForm.description} onChange={(e) => setGoalForm((p) => ({ ...p, description: e.target.value }))}
                    rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" placeholder="Strategic vision..." />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-1">Action Details</label>
                  <textarea value={goalForm.action_details} onChange={(e) => setGoalForm((p) => ({ ...p, action_details: e.target.value }))}
                    rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" placeholder="How communities can support this..." />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Active on site</label>
                  <button onClick={() => setGoalForm((p) => ({ ...p, is_active: !p.is_active }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${goalForm.is_active ? "bg-emerald-500" : "bg-gray-300"}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${goalForm.is_active ? "translate-x-5" : ""}`} />
                  </button>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={saveGoal} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2">
                    <Save className="h-4 w-4" /> {editingGoal ? "Update" : "Create"}
                  </button>
                  <button onClick={() => setShowGoalForm(false)} className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════ */}
      {/*  STORIES TAB                            */}
      {/* ════════════════════════════════════════ */}
      {tab === "stories" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left + Center: Story cards */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                {stories.filter((s) => s.is_active).length} Active · {stories.length} Total
              </span>
              <button
                onClick={openNewStory}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> New Story
              </button>
            </div>

            {loadingStories ? (
              <div className="text-center py-12 text-gray-400">Loading…</div>
            ) : stories.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                <Quote className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-400 font-medium">No impact stories yet</p>
                <button onClick={openNewStory} className="mt-3 text-sm text-emerald-600 font-semibold hover:underline">Add your first story</button>
              </div>
            ) : (
              <div className="space-y-3">
                {stories.map((s, idx) => (
                  <div key={s.id} className={`bg-white rounded-2xl border p-5 transition-all group hover:shadow-md ${
                    s.is_active ? "border-gray-100" : "border-gray-200/50 bg-gray-50/50"
                  }`}>
                    <div className="flex items-start gap-4">
                      {/* Reorder buttons */}
                      <div className="flex flex-col gap-0.5 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => moveStory(s, -1)} disabled={idx === 0} className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-20"><ChevronUp className="h-3.5 w-3.5" /></button>
                        <button onClick={() => moveStory(s, 1)} disabled={idx === stories.length - 1} className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-20"><ChevronDown className="h-3.5 w-3.5" /></button>
                      </div>

                      {/* Avatar */}
                      <div className="h-12 w-12 rounded-full bg-emerald-800 flex items-center justify-center font-bold text-emerald-200 border border-emerald-600 shrink-0 text-sm">
                        {s.initials || s.name.slice(0, 2).toUpperCase()}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-gray-900">{s.name}</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            s.is_active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"
                          }`}>{s.is_active ? "Active" : "Hidden"}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{s.title}</p>
                        {s.district_name && (
                          <span className="text-[10px] text-blue-500 font-medium">{s.district_name}</span>
                        )}
                        <p className="text-xs text-gray-400 italic mt-2 line-clamp-2 bg-gray-50 p-3 rounded-xl">&ldquo;{s.quote}&rdquo;</p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => toggleStoryActive(s)} className="p-2 text-gray-400 hover:text-amber-500 hover:bg-gray-100 rounded-lg transition-colors" title={s.is_active ? "Deactivate" : "Activate"}>
                          {s.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button onClick={() => openEditStory(s)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => deleteStory(s.id, s.name)} className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Story form */}
          <div>
            {showStoryForm && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 sticky top-6">
                <h3 className="font-display font-bold text-gray-900">
                  {editingStory ? `Edit: ${editingStory.name}` : "New Story"}
                </h3>

                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-1">Name</label>
                  <input value={storyForm.name} onChange={(e) => setStoryForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" placeholder="e.g. Anathole Murekezi" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-1">Title / Role</label>
                    <input value={storyForm.title} onChange={(e) => setStoryForm((p) => ({ ...p, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" placeholder="e.g. Smallholder Shareholder" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-1">Initials</label>
                    <input value={storyForm.initials} onChange={(e) => setStoryForm((p) => ({ ...p, initials: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" placeholder="Auto from name" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-1">District / Location</label>
                  <input value={storyForm.district_name} onChange={(e) => setStoryForm((p) => ({ ...p, district_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" placeholder="e.g. Kayonza District" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-1">Quote / Testimonial</label>
                  <textarea value={storyForm.quote} onChange={(e) => setStoryForm((p) => ({ ...p, quote: e.target.value }))}
                    rows={5} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" placeholder="Their inspiring story..." />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Active on site</label>
                  <button
                    onClick={() => setStoryForm((p) => ({ ...p, is_active: !p.is_active }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${storyForm.is_active ? "bg-emerald-500" : "bg-gray-300"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${storyForm.is_active ? "translate-x-5" : ""}`} />
                  </button>
                </div>

                <div className="flex gap-2 pt-2">
                  <button onClick={saveStory} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2">
                    <Save className="h-4 w-4" /> {editingStory ? "Update Story" : "Create Story"}
                  </button>
                  <button onClick={() => setShowStoryForm(false)} className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
