import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { format, parseISO } from 'date-fns';

export default function AdminShowtimes() {
  const [showtimes, setShowtimes] = useState([]);
  const [films, setFilms] = useState([]);
  const [branches, setBranches] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedFilm, setSelectedFilm] = useState('');
  const [selectedTableBranch, setSelectedTableBranch] = useState('ALL');
  const [selectedBranch, setSelectedBranch] = useState('');
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
    setSelectedBranch('');
    setFormData({ roomId: '', filmId: selectedFilm || '', startTime: '', endTime: '', status: 'OPEN' });
    setShowModal(true);
  };

  const openEdit = (st) => {
    const currentRoom = rooms.find(r => String(r.roomId ?? r.id) === String(st.roomId));
    setSelectedBranch(currentRoom?.branchId || '');
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
    try {
      if (editing) {
        const updatePayload = {
          startTime: formData.startTime,
          endTime: formData.endTime,
          status: formData.status,
        };
        await axiosClient.put(`/showtime/${editing.showtimeId}`, updatePayload);
      }
      else {
        const createPayload = {
          ...formData,
          roomId: Number(formData.roomId),
        };
        await axiosClient.post('/showtime', createPayload);
      }
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

  const filteredRooms = selectedBranch
    ? rooms.filter(r => r.branchId === selectedBranch)
    : [];

  const filteredShowtimes = selectedTableBranch === 'ALL'
    ? showtimes
    : showtimes.filter(st => {
      const room = rooms.find(r => String(r.roomId ?? r.id) === String(st.roomId));
      return room?.branchId === selectedTableBranch;
    });

  const getRoomName = (roomId) => {
    const room = rooms.find(r => String(r.roomId ?? r.id) === String(roomId));
    return room?.name || `Phòng #${roomId}`;
  };

  if (loading) return <div className="flex justify-center py-20"><div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-red-600"></div></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold">Suất chiếu</h2>
          <p className="mt-1 text-sm text-zinc-600">Chọn phim để xem danh sách suất chiếu</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 font-medium text-white transition hover:bg-red-700"><PlusIcon className="w-5 h-5" /> Thêm suất chiếu</button>
      </div>

      {/* Film selector */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <select className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-red-500 focus:outline-none" value={selectedFilm} onChange={e => setSelectedFilm(e.target.value)}>
          <option value="">-- Chọn phim --</option>
          {films.map(f => <option key={f.filmId} value={f.filmId}>{f.filmName}</option>)}
        </select>
        <select className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-red-500 focus:outline-none" value={selectedTableBranch} onChange={e => setSelectedTableBranch(e.target.value)}>
          <option value="ALL">-- Tất cả rạp --</option>
          {branches.map(b => <option key={b.branchId} value={b.branchId}>{b.name}</option>)}
        </select>
      </div>

      {selectedFilm && (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-zinc-200 text-left text-zinc-500">
                <th className="px-4 py-3">Phòng</th><th className="px-4 py-3">Bắt đầu</th><th className="px-4 py-3">Kết thúc</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Hành động</th>
              </tr></thead>
              <tbody>
                {filteredShowtimes.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-zinc-500">Chưa có suất chiếu cho phim này</td></tr>
                ) : filteredShowtimes.map(st => (
                  <tr key={st.showtimeId} className="border-b border-zinc-100 transition hover:bg-zinc-50">
                    <td className="px-4 py-3 font-medium text-zinc-900">{getRoomName(st.roomId)}</td>
                    <td className="px-4 py-3 text-zinc-600">{st.startTime ? format(parseISO(st.startTime), 'HH:mm dd/MM/yyyy') : ''}</td>
                    <td className="px-4 py-3 text-zinc-600">{st.endTime ? format(parseISO(st.endTime), 'HH:mm dd/MM/yyyy') : ''}</td>
                    <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${st.status === 'OPEN' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{st.status}</span></td>
                    <td className="px-4 py-3"><div className="flex gap-2">
                      <button onClick={() => openEdit(st)} className="rounded-lg p-2 text-zinc-500 transition hover:bg-sky-50 hover:text-sky-600"><PencilIcon className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(st.showtimeId)} className="rounded-lg p-2 text-zinc-500 transition hover:bg-red-50 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
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
          <div className="max-w-lg w-full rounded-2xl border border-zinc-200 bg-white p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-zinc-900">{editing ? 'Sửa suất chiếu' : 'Thêm suất chiếu'}</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-zinc-900"><XMarkIcon className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-600 mb-1">Phim *</label>
                <select required className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-red-500 focus:outline-none" value={formData.filmId} onChange={e => setFormData({ ...formData, filmId: e.target.value })}>
                  <option value="">-- Chọn phim --</option>
                  {films.map(f => <option key={f.filmId} value={f.filmId}>{f.filmName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-zinc-600 mb-1">Rạp / Chi nhánh *</label>
                <select
                  required
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-red-500 focus:outline-none"
                  value={selectedBranch}
                  onChange={e => {
                    setSelectedBranch(e.target.value);
                    setFormData({ ...formData, roomId: '' });
                  }}
                >
                  <option value="">-- Chọn rạp --</option>
                  {branches.map(b => <option key={b.branchId} value={b.branchId}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-zinc-600 mb-1">Phòng chiếu *</label>
                <select required disabled={!selectedBranch} className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-red-500 focus:outline-none disabled:bg-zinc-100" value={formData.roomId} onChange={e => setFormData({ ...formData, roomId: e.target.value })}>
                  <option value="">-- Chọn phòng --</option>
                  {filteredRooms.map(r => <option key={r.roomId ?? r.id} value={r.roomId ?? r.id}>{r.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-600 mb-1">Bắt đầu *</label>
                  <input type="datetime-local" required className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-red-500 focus:outline-none" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm text-zinc-600 mb-1">Kết thúc *</label>
                  <input type="datetime-local" required className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-red-500 focus:outline-none" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-zinc-600 mb-1">Trạng thái</label>
                <select className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-red-500 focus:outline-none" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
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
