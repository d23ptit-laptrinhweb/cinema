import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, TagIcon } from '@heroicons/react/24/outline';

export default function AdminGenres() {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try { const res = await axiosClient.get('/genre'); setGenres(res || []); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditing(null); setName(''); setShowModal(true); };
  const openEdit = (g) => { setEditing(g); setName(g.name || ''); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await axiosClient.put(`/genre/${editing.id}`, { name }); }
      else { await axiosClient.post('/genre', { name }); }
      setShowModal(false); fetchData();
    } catch (err) { alert('Lỗi: ' + (err?.message || JSON.stringify(err))); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xoá thể loại này?')) return;
    try { await axiosClient.delete(`/genre/${id}`); fetchData(); }
    catch (err) { alert('Lỗi: ' + (err?.message || JSON.stringify(err))); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Thể loại ({genres.length})</h2>
        <button onClick={openCreate} className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors">
          <PlusIcon className="w-5 h-5" /> Thêm thể loại
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {genres.map(g => (
          <div key={g.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-violet-500/10 rounded-xl">
                <TagIcon className="w-5 h-5 text-violet-500" />
              </div>
              <span className="text-white font-medium">{g.name}</span>
            </div>
            <div className="flex gap-1">
              <button onClick={() => openEdit(g)} className="p-2 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"><PencilIcon className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(g.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><TrashIcon className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">{editing ? 'Sửa thể loại' : 'Thêm thể loại'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><XMarkIcon className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Tên thể loại *</label>
                <input required autoFocus className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-500" value={name} onChange={e => setName(e.target.value)} />
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
