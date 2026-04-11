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

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Chi nhánh ({branches.length})</h2>
        <button onClick={openCreate} className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors"><PlusIcon className="w-5 h-5" /> Thêm chi nhánh</button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-slate-500 border-b border-slate-800">
              <th className="px-4 py-3">Mã</th><th className="px-4 py-3">Tên</th><th className="px-4 py-3">Địa chỉ</th><th className="px-4 py-3">Thành phố</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Hành động</th>
            </tr></thead>
            <tbody>
              {branches.map(b => (
                <tr key={b.branchId} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-slate-300">{b.branchCode}</td>
                  <td className="px-4 py-3 font-medium text-white">{b.name}</td>
                  <td className="px-4 py-3 text-slate-300 max-w-[200px] truncate">{b.address}</td>
                  <td className="px-4 py-3 text-slate-300">{b.city}</td>
                  <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${b.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500' : 'bg-slate-500/10 text-slate-400'}`}>{b.status}</span></td>
                  <td className="px-4 py-3"><div className="flex gap-2">
                    <button onClick={() => openEdit(b)} className="p-2 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"><PencilIcon className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(b.branchId)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><TrashIcon className="w-4 h-4" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">{editing ? 'Sửa chi nhánh' : 'Thêm chi nhánh'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><XMarkIcon className="w-6 h-6" /></button>
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
                  <label className="block text-sm text-slate-400 mb-1">{f.label}</label>
                  <input required={f.required} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-500" value={formData[f.key]} onChange={e => setFormData({...formData, [f.key]: e.target.value})} />
                </div>
              ))}
              <div>
                <label className="block text-sm text-slate-400 mb-1">Trạng thái</label>
                <select className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-500" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors">Huỷ</button>
                <button type="submit" className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium transition-colors">{editing ? 'Cập nhật' : 'Tạo mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
