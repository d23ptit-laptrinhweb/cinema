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

  if (loading) return <div className="flex justify-center py-20"><div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-red-600"></div></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Thể loại ({genres.length})</h2>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 font-medium text-white transition hover:bg-red-700">
          <PlusIcon className="w-5 h-5" /> Thêm thể loại
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {genres.map(g => (
          <div key={g.id} className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-red-50 p-2.5">
                <TagIcon className="h-5 w-5 text-red-700" />
              </div>
              <span className="font-medium text-zinc-900">{g.name}</span>
            </div>
            <div className="flex gap-1">
              <button onClick={() => openEdit(g)} className="rounded-lg p-2 text-zinc-500 transition hover:bg-sky-50 hover:text-sky-600"><PencilIcon className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(g.id)} className="rounded-lg p-2 text-zinc-500 transition hover:bg-red-50 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="max-w-sm w-full rounded-2xl border border-zinc-200 bg-white p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-zinc-900">{editing ? 'Sửa thể loại' : 'Thêm thể loại'}</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-zinc-900"><XMarkIcon className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-600 mb-1">Tên thể loại *</label>
                <input required autoFocus className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-red-500 focus:outline-none" value={name} onChange={e => setName(e.target.value)} />
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
