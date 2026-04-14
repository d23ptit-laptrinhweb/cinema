import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { filmApi, showtimeApi, branchApi, roomApi } from '../../api';
import SafeImage from '../../components/Common/SafeImage';

export default function FilmDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [film, setFilm] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [branches, setBranches] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const filmRes = await filmApi.getById(id);
        setFilm(filmRes.data.result);
      } catch (err) {
        console.error('Film fetch error:', err);
      }

      try {
        const [showtimeRes, branchRes, roomRes] = await Promise.allSettled([
          showtimeApi.getByFilm(id),
          branchApi.getAll(),
          roomApi.getAll()
        ]);

        if (showtimeRes.status === 'fulfilled') setShowtimes(showtimeRes.value.data.result || []);
        if (branchRes.status === 'fulfilled') setBranches(branchRes.value.data.result || []);
        if (roomRes.status === 'fulfilled') setRooms(roomRes.value.data.result || []);
      } catch (err) {
        console.error('Showtime/Branch fetch error:', err);
      }

      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) {
    return <div className="loading"><div className="spinner" /></div>;
  }

  if (!film) {
    return <div className="page"><div className="container"><p>Không tìm thấy phim.</p></div></div>;
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getEmbedUrl = (url) => {
    if (!url) return '';
    try {
      // Trường hợp Admin nhập trực tiếp ID (eg: dQw4w9WgXcQ)
      if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
        return `https://www.youtube.com/embed/${url.trim()}?autoplay=1`;
      }
      
      const parsedUrl = new URL(url);
      
      // Trường hợp link chuẩn m.youtube.com hoặc www.youtube.com
      if (parsedUrl.hostname.includes('youtube.com')) {
        if (parsedUrl.pathname === '/watch') {
          const v = parsedUrl.searchParams.get('v');
          if (v) return `https://www.youtube.com/embed/${v}?autoplay=1`;
        }
        if (parsedUrl.pathname.startsWith('/shorts/')) {
          const id = parsedUrl.pathname.split('/shorts/')[1].split('/')[0];
          if (id) return `https://www.youtube.com/embed/${id}?autoplay=1`;
        }
        if (parsedUrl.pathname.startsWith('/embed/')) {
           // Giữ nguyên link embed, chỉ thêm autoplay
           if (!parsedUrl.searchParams.has('autoplay')) {
             parsedUrl.searchParams.set('autoplay', '1');
           }
           return parsedUrl.toString();
        }
      }
      
      // Trường hợp link rút gọn youtu.be
      if (parsedUrl.hostname === 'youtu.be') {
        const id = parsedUrl.pathname.substring(1).split('?')[0];
        if (id) return `https://www.youtube.com/embed/${id}?autoplay=1`;
      }
      
      // Fallback fallback: Regex cho những URL kì dị
      const regExp = /(?:youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([a-zA-Z0-9_-]+)/;
      const match = url.match(regExp);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
      }
      
      return url;
    } catch (e) {
      // Catch error (ví dụ Admin dán nguyên cục mã <iframe> HTML vào) -> Tách bằng Regex
      const regExp = /(?:youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([a-zA-Z0-9_-]+)/;
      const match = url.match(regExp);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
      }
      return url;
    }
  };

  // Group: Date -> Branch Name -> Showtimes Array
  const groupedShowtimes = showtimes.reduce((acc, st) => {
    const room = rooms.find(r => r.id === st.roomId);
    const branchId = room ? room.branchId : null;
    const branch = branches.find(b => b.branchId === branchId) || { name: 'Rạp khác' };

    const dateKey = st.startTime ? st.startTime.split('T')[0] : 'unknown';

    if (!acc[dateKey]) acc[dateKey] = {};
    if (!acc[dateKey][branch.name]) acc[dateKey][branch.name] = [];

    acc[dateKey][branch.name].push({ ...st, branchName: branch.name, roomName: room?.name });

    return acc;
  }, {});

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          {/* Poster Wrap */}
          <div style={{ position: 'relative', alignSelf: 'flex-start' }}>
            <SafeImage
              src={film.thumbnailUrl}
              alt={film.filmName}
              style={{
                width: 280,
                height: 420,
                borderRadius: 'var(--radius-lg)',
                flexShrink: 0,
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border)',
              }}
            />
            
            {film.trailerUrl && (
              <button 
                className="btn btn-primary"
                onClick={() => setShowTrailer(true)}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  padding: 0,
                  fontSize: '1.5rem',
                  boxShadow: '0 0 30px var(--accent-glow)',
                }}
                title="Xem Trailer"
              >
                ▶
              </button>
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 300 }}>
            <h1 className="page-title" style={{ marginBottom: 16 }}>{film.filmName}</h1>

            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              {film.ageRating && <span className="film-badge" style={{ fontSize: '0.85rem', padding: '4px 12px' }}>{film.ageRating}</span>}
              {film.durationMinutes && (
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  🕐 {film.durationMinutes} phút
                </span>
              )}
              {film.language && (
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  🌐 {film.language}
                </span>
              )}
            </div>

            {film.description && (
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 24 }}>
                {film.description}
              </p>
            )}

            {film.releaseDate && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 32 }}>
                📅 Khởi chiếu: {formatDate(film.releaseDate)}
              </p>
            )}

            {/* CTA for trailer */}
            {film.trailerUrl && (
              <button 
                className="btn btn-secondary" 
                style={{ marginBottom: 32, gap: 10 }}
                onClick={() => setShowTrailer(true)}
              >
                🎬 Xem Trailer
              </button>
            )}

            {/* Showtimes */}
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 16 }}>🎟️ Chọn suất chiếu</h2>

            {Object.keys(groupedShowtimes).length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>Chưa có suất chiếu cho phim này.</p>
            ) : (
              Object.entries(groupedShowtimes).map(([date, branchesMap]) => (
                <div key={date} style={{ marginBottom: 32 }}>
                  <h3 style={{
                    color: 'var(--accent)',
                    borderBottom: '1px solid var(--border)',
                    paddingBottom: 8,
                    marginBottom: 16
                  }}>
                    📆 {formatDate(date)}
                  </h3>

                  {Object.entries(branchesMap).map(([branchName, sts]) => (
                    <div key={branchName} style={{ marginBottom: 20 }}>
                      <p style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 10 }}>
                        🏢 {branchName}
                      </p>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {sts.map((st) => (
                          <button
                            key={st.showtimeId || st.id}
                            className="btn btn-secondary"
                            onClick={() => navigate(`/showtime/${st.showtimeId || st.id}/seats`)}
                            style={{ minWidth: 80, flexDirection: 'column', gap: 4, padding: '8px 16px' }}
                          >
                            <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>{formatTime(st.startTime)}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{st.roomName || 'Phòng'}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && film.trailerUrl && (
        <div className="modal-overlay" onClick={() => setShowTrailer(false)}>
          <div className="modal-content modal-video" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowTrailer(false)}>×</button>
            <iframe
              width="100%"
              height="100%"
              src={getEmbedUrl(film.trailerUrl)}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}
