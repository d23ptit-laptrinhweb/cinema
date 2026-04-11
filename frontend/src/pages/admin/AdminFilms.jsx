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

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Danh sách phim ({films.length})</h2>
        <button onClick={openCreateModal} className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors">
          <PlusIcon className="w-5 h-5" /> Thêm phim
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-800">
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
                <tr key={film.filmId} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3">
                    {film.thumnbnail_url ? <img src={film.thumnbnail_url} alt="" className="w-12 h-16 object-cover rounded" /> : <div className="w-12 h-16 bg-slate-700 rounded" />}
                  </td>
                  <td className="px-4 py-3 font-medium text-white max-w-[200px] truncate">{film.filmName}</td>
                  <td className="px-4 py-3 text-slate-300">{film.durationMinutes} phút</td>
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
                      <button onClick={() => openEditModal(film)} className="p-2 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"><PencilIcon className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(film.filmId)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><TrashIcon className="w-4 h-4" /></button>
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
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">{editingFilm ? 'Sửa phim' : 'Thêm phim mới'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><XMarkIcon className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Tên phim *</label>
                  <input required className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-500" value={formData.filmName} onChange={e => setFormData({ ...formData, filmName: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Thời lượng (phút)</label>
                  <input type="number" className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-500" value={formData.durationMinutes} onChange={e => setFormData({ ...formData, durationMinutes: e.target.value })} />
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
                <label className="block text-sm text-slate-400 mb-1">Ảnh Poster (Upload hoặc nhập URL)</label>
                <div className="flex flex-col gap-2">
                  <input type="file" accept="image/*" className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-rose-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-500/10 file:text-rose-500 hover:file:bg-rose-500/20" onChange={e => { setImageFile(e.target.files[0]); if (e.target.files[0]) { setFormData({ ...formData, thumnbnail_url: '' }); } }} />
                  {!imageFile && (
                    <input className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-500" placeholder="Hoặc nhập URL..." value={formData.thumnbnail_url} onChange={e => setFormData({ ...formData, thumnbnail_url: e.target.value })} />
                  )}
                  {(imageFile || formData.thumnbnail_url) && (
                    <div className="mt-2 w-32 aspect-[2/3] rounded-lg overflow-hidden bg-slate-800 border border-slate-700 mx-auto sm:mx-0">
                      <img src={imageFile ? URL.createObjectURL(imageFile) : formData.thumnbnail_url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Mô tả</label>
                <textarea rows={3} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-500 resize-none" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Thể loại</label>
                <div className="flex flex-wrap gap-2">
                  {genres.map(g => (
                    <button type="button" key={g.id} onClick={() => toggleGenre(g.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${formData.genreIds.includes(g.id) ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500'}`}>
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors">Huỷ</button>
                <button type="submit" disabled={isUploading} className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50">
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
