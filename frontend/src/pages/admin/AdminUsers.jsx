import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../../api/axiosClient';
import { TrashIcon } from '@heroicons/react/24/outline';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchName, setSearchName] = useState('');

  const fetchUsers = useCallback(async () => {
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
  }, [page, searchName]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

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
          <input placeholder="Tìm theo tên đăng nhập..." className="w-64 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-red-500 focus:outline-none" value={searchName} onChange={e => setSearchName(e.target.value)} />
          <button type="submit" className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700">Tìm</button>
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex justify-center py-12"><div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-red-600"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-zinc-200 text-left text-zinc-500">
                <th className="px-4 py-3">Tên đăng nhập</th>
                <th className="px-4 py-3">Họ tên</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">SĐT</th>
                <th className="px-4 py-3">Quyền</th>
                <th className="px-4 py-3">Hành động</th>
              </tr></thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-zinc-500">Không tìm thấy người dùng</td></tr>
                ) : users.map(u => (
                  <tr key={u.id} className="border-b border-zinc-100 transition hover:bg-zinc-50">
                    <td className="px-4 py-3 font-medium text-zinc-900">{u.username}</td>
                    <td className="px-4 py-3 text-zinc-600">{u.fullName || '-'}</td>
                    <td className="px-4 py-3 text-zinc-600">{u.email}</td>
                    <td className="px-4 py-3 text-zinc-600">{u.phoneNumber || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${u.role === 'ADMIN' ? 'bg-violet-500/10 text-violet-500' : 'bg-sky-500/10 text-sky-500'}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(u.id)} className="rounded-lg p-2 text-zinc-500 transition hover:bg-red-50 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 border-t border-zinc-200 p-4">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm text-zinc-700 transition hover:bg-zinc-200 disabled:opacity-30">← Trước</button>
            <span className="text-sm text-zinc-600">Trang {page} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm text-zinc-700 transition hover:bg-zinc-200 disabled:opacity-30">Sau →</button>
          </div>
        )}
      </div>
    </div>
  );
}
