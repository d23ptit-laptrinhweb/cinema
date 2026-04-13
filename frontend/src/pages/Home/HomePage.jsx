import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { filmApi } from '../../api';
import SafeImage from '../../components/Common/SafeImage';
import { SkeletonBox } from '../../components/Common/Skeleton';
import EmptyState from '../../components/Common/EmptyState';

export default function HomePage() {
  const [nowShowing, setNowShowing] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bannerIndex, setBannerIndex] = useState(0);
  const navigate = useNavigate();
  const bannerTimer = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [nowRes, upRes] = await Promise.allSettled([
          filmApi.getNowShowing(),
          filmApi.getUpcoming(),
        ]);
        if (nowRes.status === 'fulfilled') setNowShowing(nowRes.value.data.result || []);
        if (upRes.status === 'fulfilled') setUpcoming(upRes.value.data.result || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto-slide banner
  const bannerFilms = nowShowing.length > 0 ? nowShowing.slice(0, 5) : [];
  useEffect(() => {
    if (bannerFilms.length <= 1) return;
    bannerTimer.current = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % bannerFilms.length);
    }, 5000);
    return () => clearInterval(bannerTimer.current);
  }, [bannerFilms.length]);

  // Search filter
  const filteredNowShowing = nowShowing.filter((f) =>
    f.filmName?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredUpcoming = upcoming.filter((f) =>
    f.filmName?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="page" style={{ padding: 0 }}>
        <div className="container" style={{ paddingTop: '80px' }}>
          <SkeletonBox height="450px" borderRadius="16px" className="mb-8" />
          <div className="film-grid" style={{ marginTop: '32px' }}>
            <SkeletonBox count={4} height="400px" borderRadius="12px" />
          </div>
        </div>
      </div>
    );
  }

  const currentBanner = bannerFilms[bannerIndex];

  return (
    <div className="page" style={{ padding: 0 }}>
      {/* ==================== HERO BANNER ==================== */}
      {currentBanner && (
        <div className="hero-banner" onClick={() => navigate(`/film/${currentBanner.filmId}`)}>
          <div className="hero-backdrop">
            <SafeImage
              src={currentBanner.thumbnailUrl}
              alt=""
              className="hero-backdrop-img"
              fallback=""
            />
            <div className="hero-gradient" />
          </div>

          <div className="hero-content container">
            <div className="hero-info">
              <div className="hero-badges">
                {currentBanner.ageRating && (
                  <span className="film-badge">{currentBanner.ageRating}</span>
                )}
                {currentBanner.durationMinutes && (
                  <span className="hero-meta-tag">🕐 {currentBanner.durationMinutes} phút</span>
                )}
                {currentBanner.language && (
                  <span className="hero-meta-tag">🌐 {currentBanner.language}</span>
                )}
              </div>
              <h1 className="hero-title">{currentBanner.filmName}</h1>
              <p className="hero-desc">
                {currentBanner.description?.substring(0, 180)}
                {currentBanner.description?.length > 180 ? '...' : ''}
              </p>
              <div className="hero-actions">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/film/${currentBanner.filmId}`);
                  }}
                >
                  🎟️ Đặt vé ngay
                </button>
              </div>
            </div>

            <div className="hero-poster">
              <SafeImage
                src={currentBanner.thumbnailUrl}
                alt={currentBanner.filmName}
              />
            </div>
          </div>

          {/* Dots Indicator */}
          {bannerFilms.length > 1 && (
            <div className="hero-dots">
              {bannerFilms.map((_, i) => (
                <button
                  key={i}
                  className={`hero-dot ${i === bannerIndex ? 'hero-dot--active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setBannerIndex(i);
                    clearInterval(bannerTimer.current);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================== SEARCH ==================== */}
      <div className="container" style={{ marginTop: 32 }}>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            type="text"
            placeholder="Tìm kiếm phim theo tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>
      </div>

      {/* ==================== PHIM ĐANG CHIẾU ==================== */}
      <section className="container section">
        <div className="section-header">
          <h2 className="section-title">
            <span className="section-icon">🔥</span>
            Phim đang chiếu
          </h2>
          <span className="section-count">{filteredNowShowing.length} phim</span>
        </div>

        {filteredNowShowing.length === 0 ? (
          <EmptyState 
            title="Không tìm thấy phim"
            message={search ? `Không tìm thấy kết quả nào cho "${search}".` : "Hiện tại chưa có phim nào đang chiếu."}
            buttonText="Xem tất cả phim"
          />
        ) : (
          <div className="film-grid">
            {filteredNowShowing.map((film) => (
              <motion.div
                key={film.filmId}
                className="card film-card"
                onClick={() => navigate(`/film/${film.filmId}`)}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="film-poster-wrap">
                  <SafeImage
                    className="film-poster"
                    src={film.thumbnailUrl}
                    alt={film.filmName}
                  />
                  <div className="film-overlay">
                    <button className="btn btn-primary btn-sm">Đặt vé</button>
                  </div>
                </div>
                <div className="film-info">
                  <h3 className="film-title">{film.filmName}</h3>
                  <div className="film-meta">
                    {film.durationMinutes && <span>🕐 {film.durationMinutes}p</span>}
                    {film.ageRating && <span className="film-badge">{film.ageRating}</span>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ==================== PHIM SẮP CHIẾU ==================== */}
      {filteredUpcoming.length > 0 && (
        <section className="container section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-icon">📅</span>
              Phim sắp chiếu
            </h2>
            <span className="section-count">{filteredUpcoming.length} phim</span>
          </div>

          <div className="film-grid">
            {filteredUpcoming.map((film) => (
              <motion.div
                key={film.filmId}
                className="card film-card film-card--upcoming"
                onClick={() => navigate(`/film/${film.filmId}`)}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="film-poster-wrap">
                  <SafeImage
                    className="film-poster"
                    src={film.thumbnailUrl}
                    alt={film.filmName}
                  />
                  <div className="film-upcoming-badge">Sắp chiếu</div>
                </div>
                <div className="film-info">
                  <h3 className="film-title">{film.filmName}</h3>
                  <div className="film-meta">
                    {film.releaseDate && <span>📅 {formatDate(film.releaseDate)}</span>}
                    {film.ageRating && <span className="film-badge">{film.ageRating}</span>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
