import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function AdminBranches() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ branchCode: '', name: '', address: '', city: '', phone: '', status: 'ACTIVE' });

  const statuses = ['ACTIVE', 'INACTIVE', 'MAINTENANCE'];

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try { const res = await axiosClient.get('/branch'); setBranches(res || []); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditing(null); setFormData({ branchCode: '', name: '', address: '', city: '', phone: '', status: 'ACTIVE' }); setShowModal(true); };
  const openEdit = (b) => { setEditing(b); setFormData({ branchCode: b.branchCode || '', name: b.name || '', address: b.address || '', city: b.city || '', phone: b.phone || '', status: b.status || 'ACTIVE' }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await axiosClient.put(`/branch/${editing.branchId}`, formData); }
      else { await axiosClient.post('/branch', formData); }
      setShowModal(false); fetchData();
    } catch (err) { alert('Lỗi: ' + (err?.message || JSON.stringify(err))); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xoá chi nhánh này?')) return;
    try { await axiosClient.delete(`/branch/${id}`); fetchData(); }
    catch (err) { alert('Lỗi: ' + (err?.message || JSON.stringify(err))); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-red-600"></div></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Chi nhánh ({branches.length})</h2>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 font-medium text-white transition hover:bg-red-700"><PlusIcon className="w-5 h-5" /> Thêm chi nhánh</button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-zinc-200 text-left text-zinc-500">
              <th className="px-4 py-3">Mã</th><th className="px-4 py-3">Tên</th><th className="px-4 py-3">Địa chỉ</th><th className="px-4 py-3">Thành phố</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Hành động</th>
            </tr></thead>
            <tbody>
              {branches.map(b => (
                <tr key={b.branchId} className="border-b border-zinc-100 transition hover:bg-zinc-50">
                  <td className="px-4 py-3 font-mono text-xs text-zinc-600">{b.branchCode}</td>
                  <td className="px-4 py-3 font-medium text-zinc-900">{b.name}</td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-zinc-600">{b.address}</td>
                  <td className="px-4 py-3 text-zinc-600">{b.city}</td>
                  <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${b.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500' : 'bg-slate-500/10 text-slate-400'}`}>{b.status}</span></td>
                  <td className="px-4 py-3"><div className="flex gap-2">
                    <button onClick={() => openEdit(b)} className="rounded-lg p-2 text-zinc-500 transition hover:bg-sky-50 hover:text-sky-600"><PencilIcon className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(b.branchId)} className="rounded-lg p-2 text-zinc-500 transition hover:bg-red-50 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="max-w-lg w-full rounded-2xl border border-zinc-200 bg-white p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-zinc-900">{editing ? 'Sửa chi nhánh' : 'Thêm chi nhánh'}</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-zinc-900"><XMarkIcon className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: 'Mã chi nhánh *', key: 'branchCode', required: true },
                { label: 'Tên chi nhánh *', key: 'name', required: true },
                { label: 'Địa chỉ', key: 'address' },
                { label: 'Thành phố', key: 'city' },
                { label: 'Số điện thoại', key: 'phone' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm text-zinc-600 mb-1">{f.label}</label>
                  <input required={f.required} className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-red-500 focus:outline-none" value={formData[f.key]} onChange={e => setFormData({...formData, [f.key]: e.target.value})} />
                </div>
              ))}
              <div>
                <label className="block text-sm text-zinc-600 mb-1">Trạng thái</label>
                <select className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-red-500 focus:outline-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-xl bg-zinc-100 px-5 py-2.5 text-zinc-600 transition hover:text-zinc-900">Huỷ</button>
                <button type="submit" className="rounded-xl bg-red-600 px-5 py-2.5 font-medium text-white transition hover:bg-red-700">{editing ? 'Cập nhật' : 'Tạo mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
