import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { filmApi, genreApi } from '../../api';
import SafeImage from '../../components/Common/SafeImage';

const FilmManagement = () => {
  const [films, setFilms] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFilm, setEditingFilm] = useState(null);
  const [formData, setFormData] = useState({
    filmName: '',
    description: '',
    durationMinutes: '',
    ageRating: 'P',
    language: 'Việt Nam',
    subtitle: 'Tiếng Việt',
    thumbnailUrl: '',
    trailerUrl: '',
    releaseDate: '',
    endDate: '',
    status: 'UPCOMING',
    genreIds: []
  });

  const fetchFilms = async () => {
    try {
      setLoading(true);
      const res = await filmApi.getAll();
      setFilms(res.data.result || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách phim:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const res = await genreApi.getAll();
      setGenres(res.data.result || []);
    } catch (err) {
      console.error('Lỗi khi tải thể loại:', err);
    }
  };

  useEffect(() => {
    fetchFilms();
    fetchGenres();
  }, []);

  const handleOpenModal = (film = null) => {
    if (film) {
      setEditingFilm(film);
      setFormData({
        filmName: film.filmName || '',
        description: film.description || '',
        durationMinutes: film.durationMinutes || '',
        ageRating: film.ageRating || 'P',
        language: film.language || 'Việt Nam',
        subtitle: film.subtitle || 'Tiếng Việt',
        thumbnailUrl: film.thumbnailUrl || '',
        trailerUrl: film.trailerUrl || '',
        releaseDate: film.releaseDate ? film.releaseDate.split('T')[0] : '',
        endDate: film.endDate ? film.endDate.split('T')[0] : '',
        status: film.status || 'UPCOMING',
        genreIds: film.genres?.map(g => g.genreId) || []
      });
    } else {
      setEditingFilm(null);
      setFormData({
        filmName: '',
        description: '',
        durationMinutes: '',
        ageRating: 'P',
        language: 'Việt Nam',
        subtitle: 'Tiếng Việt',
        thumbnailUrl: '',
        trailerUrl: '',
        releaseDate: '',
        endDate: '',
        status: 'UPCOMING',
        genreIds: []
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFilm(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenreToggle = (genreId) => {
    setFormData(prev => {
      const exists = prev.genreIds.includes(genreId);
      if (exists) {
        return { ...prev, genreIds: prev.genreIds.filter(id => id !== genreId) };
      } else {
        return { ...prev, genreIds: [...prev.genreIds, genreId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFilm) {
        await filmApi.update(editingFilm.filmId, formData);
        toast.success(`Cập nhật phim "${formData.filmName}" thành công!`);
      } else {
        await filmApi.create(formData);
        toast.success(`Thêm phim "${formData.filmName}" thành công!`);
      }
      handleCloseModal();
      fetchFilms();
    } catch (err) {
      toast.error('Đã có lỗi xảy ra: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (filmId, filmName) => {
    if (window.confirm(`Bạn có chắc chắn muốn xoá phim "${filmName}"?`)) {
      try {
        await filmApi.delete(filmId);
        toast.success(`Xoá phim "${filmName}" thành công!`);
        fetchFilms();
      } catch (err) {
        toast.error('Lỗi khi xoá: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const filteredFilms = films.filter((film) =>
    film.filmName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusInfo = (status) => {
    const map = {
      NOW_SHOWING: { label: 'Đang chiếu', className: 'status--active' },
      UPCOMING: { label: 'Sắp chiếu', className: 'status--pending' },
      ENDED: { label: 'Đã kết thúc', className: 'status--inactive' },
      INACTIVE: { label: 'Ngừng hoạt động', className: 'status--inactive' },
    };
    return map[status] || { label: status, className: '' };
  };

  if (loading && !isModalOpen) {
    return <div className="loading"><div className="spinner" /></div>;
  }

  return (
    <div className="admin-films">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Quản lý Phim</h1>
          <p className="page-subtitle">
            Tổng cộng <strong>{films.length}</strong> phim trong hệ thống.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Thêm phim mới
        </button>
      </div>

      <div className="admin-table-card">
        <div className="table-header">
          <div style={{ position: 'relative', maxWidth: '320px', flex: 1 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="input"
              placeholder="Tìm tên phim..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px', background: 'var(--bg-input)' }}
            />
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {filteredFilms.length} kết quả
          </span>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>#</th>
              <th>Tên phim</th>
              <th>Thể loại</th>
              <th>Thời lượng</th>
              <th>Ngày chiếu</th>
              <th>Trạng thái</th>
              <th style={{ width: '120px' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredFilms.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  {searchTerm ? 'Không tìm thấy phim nào' : 'Chưa có phim nào trong hệ thống'}
                </td>
              </tr>
            ) : (
              filteredFilms.map((film, idx) => {
                const statusInfo = getStatusInfo(film.status);
                return (
                  <tr key={film.filmId || idx}>
                    <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <SafeImage
                          src={film.thumbnailUrl}
                          alt={film.filmName}
                          style={{
                            width: '40px', height: '56px', borderRadius: '6px',
                            objectFit: 'cover', background: 'var(--bg-secondary)',
                          }}
                          fallback="https://via.placeholder.com/40x56?text=No+Img"
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{film.filmName}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {film.ageRating && <span>{film.ageRating}</span>}
                            {film.language && <span> · {film.language}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {film.genres?.map((g, i) => (
                          <span key={i} className="film-badge">{g.name}</span>
                        )) || '—'}
                      </div>
                    </td>
                    <td>{film.durationMinutes ? `${film.durationMinutes} phút` : '—'}</td>
                    <td>
                      {film.releaseDate
                        ? new Date(film.releaseDate).toLocaleDateString('vi-VN')
                        : '—'}
                    </td>
                    <td>
                      <span className={`status-badge ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-ghost btn-sm" title="Sửa" onClick={() => handleOpenModal(film)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button className="btn btn-ghost btn-sm" title="Xóa" style={{ color: '#ef4444' }} onClick={() => handleDelete(film.filmId, film.filmName)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Film Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content admin-modal" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{editingFilm ? 'Chỉnh sửa phim' : 'Thêm phim mới'}</h2>
              <button onClick={handleCloseModal} className="modal-close" style={{ position: 'static', fontSize: '1.5rem' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="auth-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Tên phim</label>
                <input 
                  type="text" 
                  name="filmName" 
                  className="input" 
                  value={formData.filmName} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="Nhập tên phim..."
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Mô tả</label>
                <textarea 
                  name="description" 
                  className="input" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  placeholder="Nhập mô tả phim..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Thời lượng (phút)</label>
                <input 
                  type="number" 
                  name="durationMinutes" 
                  className="input" 
                  value={formData.durationMinutes} 
                  onChange={handleInputChange} 
                  placeholder="Ví dụ: 120"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Độ tuổi (Rating)</label>
                <select name="ageRating" className="input" value={formData.ageRating} onChange={handleInputChange}>
                  <option value="P">P - Mọi độ tuổi</option>
                  <option value="K">K - Dưới 13 tuối (với người giám hộ)</option>
                  <option value="T13">T13 - Từ 13 tuổi</option>
                  <option value="T16">T16 - Từ 16 tuổi</option>
                  <option value="T18">T18 - Từ 18 tuổi</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Ngôn ngữ</label>
                <input type="text" name="language" className="input" value={formData.language} onChange={handleInputChange} />
              </div>

              <div className="form-group">
                <label className="form-label">Phụ đề</label>
                <input type="text" name="subtitle" className="input" value={formData.subtitle} onChange={handleInputChange} />
              </div>

              <div className="form-group">
                <label className="form-label">Ngày khởi chiếu</label>
                <input type="date" name="releaseDate" className="input" value={formData.releaseDate} onChange={handleInputChange} />
              </div>

              <div className="form-group">
                <label className="form-label">Ngày kết thúc (dự kiến)</label>
                <input type="date" name="endDate" className="input" value={formData.endDate} onChange={handleInputChange} />
              </div>

              <div className="form-group">
                <label className="form-label">Trạng thái</label>
                <select name="status" className="input" value={formData.status} onChange={handleInputChange}>
                  <option value="UPCOMING">Sắp chiếu</option>
                  <option value="NOW_SHOWING">Đang chiếu</option>
                  <option value="ENDED">Đã kết thúc</option>
                  <option value="INACTIVE">Ngừng hoạt động</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Poster URL</label>
                <input type="text" name="thumbnailUrl" className="input" value={formData.thumbnailUrl} onChange={handleInputChange} placeholder="https://..." />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Trailer URL (Youtube Embed)</label>
                <input type="text" name="trailerUrl" className="input" value={formData.trailerUrl} onChange={handleInputChange} placeholder="https://youtube.com/embed/..." />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Thể loại</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  {genres.map(genre => (
                    <label key={genre.genreId} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                      <input 
                        type="checkbox" 
                        checked={formData.genreIds.includes(genre.genreId)} 
                        onChange={() => handleGenreToggle(genre.genreId)}
                        style={{ cursor: 'pointer' }}
                      />
                      {genre.name}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingFilm ? 'Lưu thay đổi' : 'Thêm phim'}
                </button>
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary" style={{ flex: 1 }}>
                  Huỷ bỏ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilmManagement;
