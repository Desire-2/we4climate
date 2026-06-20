import { useEffect, useState } from "react";
import { Save, Trash2, Pencil } from "lucide-react";
import { adminFetchDistricts, adminUpdateDistrict, adminDeleteDistrict, type ApiDistrictMetric } from "../api/client";

interface EditState {
  [key: number]: { trees_planted: number; community_members: number; farmers_trained: number; active_sites: number };
}

export default function AdminDistricts() {
  const [data, setData] = useState<ApiDistrictMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState<EditState>({});
  const [editingId, setEditingId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await adminFetchDistricts();
    if (res) setData(res);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const startEdit = (r: ApiDistrictMetric) => {
    setEditingId(r.id);
    setEdits((prev) => ({
      ...prev,
      [r.id]: { trees_planted: r.trees_planted, community_members: r.community_members, farmers_trained: r.farmers_trained, active_sites: r.active_sites },
    }));
  };

  const save = async (id: number) => {
    const payload = edits[id];
    if (!payload) return;
    if (await adminUpdateDistrict(id, payload)) {
      setData((prev) => prev.map((r) => (r.id === id ? { ...r, ...payload } : r)));
      setEditingId(null);
    }
  };

  const del = async (id: number) => {
    if (!confirm("Delete this district?")) return;
    if (await adminDeleteDistrict(id)) load();
  };

  return (
    <div className="p-6 sm:p-8">
      <h1 className="font-display font-bold text-2xl text-gray-900 mb-6">District Metrics</h1>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                  <th className="px-4 py-3">District</th>
                  <th className="px-4 py-3">Trees</th>
                  <th className="px-4 py-3">Members</th>
                  <th className="px-4 py-3">Farmers</th>
                  <th className="px-4 py-3">Sites</th>
                  <th className="px-4 py-3 w-24" />
                </tr>
              </thead>
              <tbody>
                {data.map((r) => {
                  const isEditing = editingId === r.id;
                  const e = edits[r.id];
                  return (
                    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 text-gray-700">
                      <td className="px-4 py-3 font-semibold">{r.district_name}</td>
                      {(["trees_planted", "community_members", "farmers_trained", "active_sites"] as const).map((field) => (
                        <td key={field} className="px-4 py-3">
                          {isEditing ? (
                            <input
                              type="number"
                              value={e?.[field] ?? r[field]}
                              onChange={(ev) =>
                                setEdits((prev) => ({
                                  ...prev,
                                  [r.id]: { ...prev[r.id], [field]: parseInt(ev.target.value) || 0 },
                                }))
                              }
                              className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-emerald-400"
                            />
                          ) : (
                            <span className="font-mono text-sm">{r[field].toLocaleString()}</span>
                          )}
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {isEditing ? (
                            <button onClick={() => save(r.id)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><Save className="h-4 w-4" /></button>
                          ) : (
                            <button onClick={() => startEdit(r)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="h-4 w-4" /></button>
                          )}
                          <button onClick={() => del(r.id)} className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {data.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-gray-400">No districts configured.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
