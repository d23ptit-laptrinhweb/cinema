import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { format, parseISO } from 'date-fns';

export default function AdminShowtimes() {
  const [showtimes, setShowtimes] = useState([]);
  const [films, setFilms] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedFilm, setSelectedFilm] = useState('');
  const [formData, setFormData] = useState({ roomId: '', filmId: '', startTime: '', endTime: '', status: 'OPEN' });

  const statuses = ['OPEN', 'CANCELLED', 'CLOSED'];

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [filmsRes, branchesRes, roomsRes] = await Promise.allSettled([
        axiosClient.get('/film'),
        axiosClient.get('/branch'),
        axiosClient.get('/room'),
      ]);
      setFilms(filmsRes.status === 'fulfilled' ? filmsRes.value || [] : []);
      setBranches(branchesRes.status === 'fulfilled' ? branchesRes.value || [] : []);
      setRooms(roomsRes.status === 'fulfilled' ? roomsRes.value || [] : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!selectedFilm) { setShowtimes([]); return; }
    const fetchShowtimes = async () => {
      try {
        const res = await axiosClient.get(`/showtime/film/${selectedFilm}`);
        setShowtimes(res || []);
      } catch { setShowtimes([]); }
    };
    fetchShowtimes();
  }, [selectedFilm]);

  const openCreate = () => {
    setEditing(null);
    setFormData({ roomId: '', filmId: selectedFilm || '', startTime: '', endTime: '', status: 'OPEN' });
    setShowModal(true);
  };

  const openEdit = (st) => {
    setEditing(st);
    setFormData({
      roomId: st.roomId || '',
      filmId: st.filmId || '',
      startTime: st.startTime ? st.startTime.slice(0, 16) : '',
      endTime: st.endTime ? st.endTime.slice(0, 16) : '',
      status: st.status || 'OPEN',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, roomId: Number(formData.roomId) };
    try {
      if (editing) { await axiosClient.put(`/showtime/${editing.showtimeId}`, payload); }
      else { await axiosClient.post('/showtime', payload); }
      setShowModal(false);
      // Refresh
      if (selectedFilm) {
        const res = await axiosClient.get(`/showtime/film/${selectedFilm}`);
        setShowtimes(res || []);
      }
    } catch (err) { alert('Lỗi: ' + (err?.message || JSON.stringify(err))); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xoá suất chiếu này?')) return;
    try {
      await axiosClient.delete(`/showtime/${id}`);
      setShowtimes(prev => prev.filter(s => s.showtimeId !== id));
    } catch (err) { alert('Lỗi: ' + (err?.message || JSON.stringify(err))); }
  };

  const getRoomName = (roomId) => rooms.find(r => r.roomId === roomId)?.name || roomId;

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold">Suất chiếu</h2>
          <p className="text-sm text-slate-400 mt-1">Chọn phim để xem danh sách suất chiếu</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors"><PlusIcon className="w-5 h-5" /> Thêm suất chiếu</button>
      </div>

      {/* Film selector */}
      <div className="mb-6">
        <select className="w-full sm:w-80 bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-500" value={selectedFilm} onChange={e => setSelectedFilm(e.target.value)}>
          <option value="">-- Chọn phim --</option>
          {films.map(f => <option key={f.filmId} value={f.filmId}>{f.filmName}</option>)}
        </select>
      </div>

      {selectedFilm && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-slate-500 border-b border-slate-800">
                <th className="px-4 py-3">Phòng</th><th className="px-4 py-3">Bắt đầu</th><th className="px-4 py-3">Kết thúc</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Hành động</th>
              </tr></thead>
              <tbody>
                {showtimes.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-slate-500">Chưa có suất chiếu cho phim này</td></tr>
                ) : showtimes.map(st => (
                  <tr key={st.showtimeId} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-white font-medium">{getRoomName(st.roomId)}</td>
                    <td className="px-4 py-3 text-slate-300">{st.startTime ? format(parseISO(st.startTime), 'HH:mm dd/MM/yyyy') : ''}</td>
                    <td className="px-4 py-3 text-slate-300">{st.endTime ? format(parseISO(st.endTime), 'HH:mm dd/MM/yyyy') : ''}</td>
                    <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${st.status === 'OPEN' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{st.status}</span></td>
                    <td className="px-4 py-3"><div className="flex gap-2">
                      <button onClick={() => openEdit(st)} className="p-2 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"><PencilIcon className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(st.showtimeId)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><TrashIcon className="w-4 h-4" /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">{editing ? 'Sửa suất chiếu' : 'Thêm suất chiếu'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><XMarkIcon className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Phim *</label>
                <select required className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-500" value={formData.filmId} onChange={e => setFormData({ ...formData, filmId: e.target.value })}>
                  <option value="">-- Chọn phim --</option>
                  {films.map(f => <option key={f.filmId} value={f.filmId}>{f.filmName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Phòng chiếu *</label>
                <select required className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-500" value={formData.roomId} onChange={e => setFormData({ ...formData, roomId: e.target.value })}>
                  <option value="">-- Chọn phòng --</option>
                  {rooms.map(r => <option key={r.roomId} value={r.roomId}>{r.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Bắt đầu *</label>
                  <input type="datetime-local" required className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-500" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Kết thúc *</label>
                  <input type="datetime-local" required className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-500" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Trạng thái</label>
                <select className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-500" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
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
