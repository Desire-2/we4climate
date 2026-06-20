import { useEffect, useState } from "react";
import {
  Trash2, ChevronLeft, ChevronRight, Search,
  TreePine, Users, MapPin, Calendar,
} from "lucide-react";
import { adminFetchPledges, adminDeletePledge, type ApiPledge } from "../api/client";

export default function AdminPledges() {
  const [data, setData] = useState<ApiPledge[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const load = async (p: number) => {
    setLoading(true);
    const res = await adminFetchPledges(p);
    if (res) {
      setData(res.items);
      setPage(res.page);
      setPages(res.pages);
    }
    setLoading(false);
  };

  useEffect(() => { load(page); }, [page]);

  const del = async (id: number) => {
    if (!confirm("Delete this pledge permanently?")) return;
    if (await adminDeletePledge(id)) load(page);
  };

  const filtered = data.filter((r) =>
    !searchTerm ||
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.tree_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalTrees = data.reduce((sum, r) => sum + r.trees_count, 0);

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-gray-900">Pledges</h1>
        <p className="text-sm text-gray-500 mt-1">Community tree-planting pledges submitted by users</p>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <TreePine className="h-4 w-4" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Total Trees</span>
          </div>
          <span className="font-display font-black text-2xl text-gray-900">{totalTrees.toLocaleString()}</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Users className="h-4 w-4" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Pledges</span>
          </div>
          <span className="font-display font-black text-2xl text-gray-900">{data.length}</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 text-purple-600 mb-1">
            <MapPin className="h-4 w-4" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Avg Per Pledge</span>
          </div>
          <span className="font-display font-black text-2xl text-gray-900">
            {data.length > 0 ? Math.round(totalTrees / data.length) : 0}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-xs mb-4">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, district..."
          className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all"
        />
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="h-8 w-8 bg-gray-200 rounded-full" />
            <span className="text-sm">Loading pledges…</span>
          </div>
        </div>
      ) : filtered.length > 0 ? (
        <>
          <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-[10px] uppercase tracking-widest text-gray-400 font-bold bg-gray-50/50">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">District</th>
                  <th className="px-4 py-3">Trees</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 w-16" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-emerald-50/30 text-gray-700 transition-colors">
                    <td className="px-4 py-3 font-medium">{r.name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border bg-gray-100 text-gray-600 border-gray-200">
                        <MapPin className="h-3 w-3" />
                        {r.district}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-display font-bold text-emerald-700 text-base">{r.trees_count}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px] truncate">{r.tree_type}</td>
                    <td className="px-4 py-3 text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(r.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => del(r.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
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
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <TreePine className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          {searchTerm ? (
            <p className="text-sm text-gray-500">No pledges match your search.</p>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-1">No pledges yet.</p>
              <p className="text-xs text-gray-400">Pledges appear here when users submit them from the Community Action Desk.</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
