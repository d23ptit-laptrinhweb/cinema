import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { uploadImage } from '../../api/cloudinary';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function AdminFilms() {
  const [films, setFilms] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFilm, setEditingFilm] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [formData, setFormData] = useState({
    filmName: '', description: '', durationMinutes: '', ageRating: 'P',
    language: '', subtitle: '', thumnbnail_url: '', releaseDate: '', endDate: '',
    status: 'NOW_SHOWING', genreIds: [],
  });

  const ageRatings = ['P', 'K', 'T13', 'T16', 'T18', 'C'];
  const filmStatuses = ['UPCOMING', 'NOW_SHOWING', 'ENDED', 'INACTIVE'];

  useEffect(() => {
    fetchFilms();
    fetchGenres();
  }, []);

  const fetchFilms = async () => {
    try {
      const res = await axiosClient.get('/film');
      setFilms(res || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchGenres = async () => {
    try {
      const res = await axiosClient.get('/genre');
      setGenres(res || []);
    } catch (e) { console.error(e); }
  };

  const openCreateModal = () => {
    setEditingFilm(null);
    setImageFile(null);
    setFormData({
      filmName: '', description: '', durationMinutes: '', ageRating: 'P',
      language: '', subtitle: '', thumnbnail_url: '', releaseDate: '', endDate: '',
      status: 'NOW_SHOWING', genreIds: [],
    });
    setShowModal(true);
  };

  const openEditModal = (film) => {
    setEditingFilm(film);
    setImageFile(null);
    setFormData({
      filmName: film.filmName || '',
      description: film.description || '',
      durationMinutes: film.durationMinutes || '',
      ageRating: film.ageRating || 'P',
      language: film.language || '',
      subtitle: film.subtitle || '',
      thumnbnail_url: film.thumnbnail_url || '',
      releaseDate: film.releaseDate || '',
      endDate: film.endDate || '',
      status: film.status || 'NOW_SHOWING',
      genreIds: film.genres?.map(g => g.id) || [],
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      let finalImageUrl = formData.thumnbnail_url;
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }
      const payload = {
        ...formData,
        thumnbnail_url: finalImageUrl,
        durationMinutes: parseInt(formData.durationMinutes) || null,
        genreIds: formData.genreIds.map(Number),
      };

      if (editingFilm) {
        await axiosClient.put(`/film/${editingFilm.filmId}`, payload);
      } else {
        await axiosClient.post('/film', payload);
      }
      setShowModal(false);
      fetchFilms();
    } catch (err) {
      alert('Lỗi: ' + (err?.message || JSON.stringify(err)));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn chắc chắn muốn xoá phim này?')) return;
    try {
      await axiosClient.delete(`/film/${id}`);
      fetchFilms();
    } catch (err) {
      alert('Lỗi xoá: ' + (err?.message || JSON.stringify(err)));
    }
  };

  const toggleGenre = (id) => {
    setFormData(prev => ({
      ...prev,
      genreIds: prev.genreIds.includes(id) ? prev.genreIds.filter(g => g !== id) : [...prev.genreIds, id],
    }));
  };

  if (loading) return <div className="flex justify-center py-20"><div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-red-600"></div></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-zinc-900">Danh sách phim ({films.length})</h2>
        <button onClick={openCreateModal} className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 font-medium text-white transition hover:bg-red-700">
          <PlusIcon className="w-5 h-5" /> Thêm phim
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-zinc-500">
                <th className="px-4 py-3">Poster</th>
                <th className="px-4 py-3">Tên phim</th>
                <th className="px-4 py-3">Thời lượng</th>
                <th className="px-4 py-3">Xếp hạng</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {films.map(film => (
                <tr key={film.filmId} className="border-b border-zinc-100 transition hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    {film.thumnbnail_url ? <img src={film.thumnbnail_url} alt="" className="h-16 w-12 rounded object-cover" /> : <div className="h-16 w-12 rounded bg-zinc-200" />}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 font-medium text-zinc-900">{film.filmName}</td>
                  <td className="px-4 py-3 text-zinc-600">{film.durationMinutes} phút</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 text-xs font-bold">{film.ageRating}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${film.status === 'NOW_SHOWING' ? 'bg-green-500/10 text-green-500' :
                        film.status === 'UPCOMING' ? 'bg-sky-500/10 text-sky-500' :
                          film.status === 'ENDED' ? 'bg-slate-500/10 text-slate-400' :
                            'bg-red-500/10 text-red-400'
                      }`}>{film.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEditModal(film)} className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-sky-50 hover:text-sky-600"><PencilIcon className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(film.filmId)} className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600"><TrashIcon className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-zinc-900">{editingFilm ? 'Sửa phim' : 'Thêm phim mới'}</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-zinc-900"><XMarkIcon className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm text-zinc-600">Tên phim *</label>
                  <input required className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-red-500 focus:outline-none" value={formData.filmName} onChange={e => setFormData({ ...formData, filmName: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-zinc-600">Thời lượng (phút)</label>
                  <input type="number" className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-red-500 focus:outline-none" value={formData.durationMinutes} onChange={e => setFormData({ ...formData, durationMinutes: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Xếp hạng tuổi</label>
                  <select className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-500" value={formData.ageRating} onChange={e => setFormData({ ...formData, ageRating: e.target.value })}>
                    {ageRatings.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Trạng thái</label>
                  <select className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-500" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                    {filmStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Ngôn ngữ</label>
                  <input className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-500" value={formData.language} onChange={e => setFormData({ ...formData, language: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Phụ đề</label>
                  <input className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-500" value={formData.subtitle} onChange={e => setFormData({ ...formData, subtitle: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Ngày khởi chiếu</label>
                  <input type="date" className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-500" value={formData.releaseDate} onChange={e => setFormData({ ...formData, releaseDate: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Ngày kết thúc</label>
                  <input type="date" className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-500" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-zinc-600 mb-1">Ảnh Poster (Upload hoặc nhập URL)</label>
                <div className="flex flex-col gap-2">
                  <input type="file" accept="image/*" className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2 text-zinc-700 file:mr-4 file:rounded-full file:border-0 file:bg-red-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-red-700" onChange={e => { setImageFile(e.target.files[0]); if (e.target.files[0]) { setFormData({ ...formData, thumnbnail_url: '' }); } }} />
                  {!imageFile && (
                    <input className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-red-500 focus:outline-none" placeholder="Hoặc nhập URL..." value={formData.thumnbnail_url} onChange={e => setFormData({ ...formData, thumnbnail_url: e.target.value })} />
                  )}
                  {(imageFile || formData.thumnbnail_url) && (
                    <div className="mx-auto mt-2 aspect-[2/3] w-32 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 sm:mx-0">
                      <img src={imageFile ? URL.createObjectURL(imageFile) : formData.thumnbnail_url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm text-zinc-600 mb-1">Mô tả</label>
                <textarea rows={3} className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-red-500 focus:outline-none" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-zinc-600 mb-2">Thể loại</label>
                <div className="flex flex-wrap gap-2">
                  {genres.map(g => (
                    <button type="button" key={g.id} onClick={() => toggleGenre(g.id)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${formData.genreIds.includes(g.id) ? 'bg-red-600 text-white' : 'border border-zinc-300 bg-zinc-50 text-zinc-600 hover:border-zinc-400'}`}>
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 border-t border-zinc-200 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-xl bg-zinc-100 px-5 py-2.5 text-zinc-600 transition-colors hover:text-zinc-900">Huỷ</button>
                <button type="submit" disabled={isUploading} className="rounded-xl bg-red-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50">
                  {isUploading ? 'Đang lưu...' : (editingFilm ? 'Cập nhật' : 'Tạo mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
