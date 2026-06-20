import { useEffect, useState } from "react";
import { Trash2, ChevronLeft, ChevronRight, Mail, Eye } from "lucide-react";
import { adminFetchContacts, adminDeleteContact } from "../api/client";

interface ContactItem {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  submitted_at: string;
}

export default function AdminContacts() {
  const [data, setData] = useState<ContactItem[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactItem | null>(null);

  const load = async (p: number) => {
    setLoading(true);
    const res = await adminFetchContacts(p);
    if (res) { setData(res.items); setPage(res.page); setPages(res.pages); }
    setLoading(false);
  };

  useEffect(() => { load(page); }, [page]);

  const del = async (id: number) => {
    if (!confirm("Delete this message?")) return;
    if (await adminDeleteContact(id)) load(page);
  };

  return (
    <div className="p-6 sm:p-8">
      <h1 className="font-display font-bold text-2xl text-gray-900 mb-6">Contact Messages</h1>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 w-24" />
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 text-gray-700">
                    <td className="px-4 py-3 font-medium">{r.name}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{r.email}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate text-xs">{r.subject}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{new Date(r.submitted_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setSelected(r)} className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Eye className="h-4 w-4" /></button>
                        <button onClick={() => del(r.id)} className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-gray-400">No messages yet.</td></tr>}
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

          {/* Message detail modal */}
          {selected && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelected(null)}>
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 relative shadow-2xl" onClick={e => e.stopPropagation()}>
                <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-bold text-lg text-gray-900">{selected.subject}</h3>
                </div>
                <div className="text-xs text-gray-500 mb-4">
                  <span className="font-semibold text-gray-700">{selected.name}</span> &lt;{selected.email}&gt;
                  <span className="ml-2">{new Date(selected.submitted_at).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
