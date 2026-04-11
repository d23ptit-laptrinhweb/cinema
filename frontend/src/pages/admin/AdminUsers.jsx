import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { TrashIcon } from '@heroicons/react/24/outline';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchName, setSearchName] = useState('');

  useEffect(() => { fetchUsers(); }, [page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, size: 10 });
      if (searchName) params.append('username', searchName);
      const res = await axiosClient.get(`/users?${params.toString()}`);
      // The backend returns PageResponse with data, page, totalPages
      setUsers(res?.data || []);
      setTotalPages(res?.totalPages || 1);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleDelete = async (id) => {
    if (!confirm('Xoá người dùng này?')) return;
    try { await axiosClient.delete(`/users/${id}`); fetchUsers(); }
    catch (err) { alert('Lỗi: ' + (err?.message || JSON.stringify(err))); }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold">Người dùng</h2>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input placeholder="Tìm theo username..." className="bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-500 w-64" value={searchName} onChange={e => setSearchName(e.target.value)} />
          <button type="submit" className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors text-sm">Tìm</button>
        </form>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-rose-500"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-slate-500 border-b border-slate-800">
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Họ tên</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">SĐT</th>
                <th className="px-4 py-3">Quyền</th>
                <th className="px-4 py-3">Hành động</th>
              </tr></thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-slate-500">Không tìm thấy người dùng</td></tr>
                ) : users.map(u => (
                  <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{u.username}</td>
                    <td className="px-4 py-3 text-slate-300">{u.fullName || '-'}</td>
                    <td className="px-4 py-3 text-slate-300">{u.email}</td>
                    <td className="px-4 py-3 text-slate-300">{u.phoneNumber || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${u.role === 'ADMIN' ? 'bg-violet-500/10 text-violet-500' : 'bg-sky-500/10 text-sky-500'}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(u.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><TrashIcon className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-slate-800">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm disabled:opacity-30 hover:bg-slate-700 transition-colors">← Trước</button>
            <span className="text-sm text-slate-400">Trang {page} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm disabled:opacity-30 hover:bg-slate-700 transition-colors">Sau →</button>
          </div>
        )}
      </div>
    </div>
  );
}
