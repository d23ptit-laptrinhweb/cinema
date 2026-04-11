import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { CalendarIcon, ClockIcon, TicketIcon } from '@heroicons/react/24/outline';
import { PlayIcon } from '@heroicons/react/24/solid';

export default function FilmDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [film, setFilm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFilm = async () => {
      try {
        const response = await axiosClient.get(`/film/${id}`);
        setFilm(response || {});
      } catch (err) {
        setError('Không tìm thấy phim');
      } finally {
        setLoading(false);
      }
    };
    fetchFilm();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (error || !film) {
    return <div className="text-center text-white py-20">{error || 'Có lỗi xảy ra'}</div>;
  }

  return (
    <div className="pb-20">
      {/* Backdrop */}
      <div className="relative h-[60vh] w-full bg-slate-900 border-b border-white/10">
        <div className="absolute inset-0">
          <img 
            src={film.thumnbnail_url || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop"} 
            alt="Backdrop"
            className="w-full h-full object-cover opacity-50 blur-sm brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/80 to-transparent" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-48 z-10">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          {/* Poster */}
          <div className="w-64 md:w-80 flex-shrink-0 animate-fade-in-up">
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-rose-500/20 border border-white/10 relative group">
              <img 
                src={film.thumnbnail_url || "https://via.placeholder.com/400x600?text=No+Image"} 
                alt={film.filmName}
                className="w-full aspect-[2/3] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button className="bg-rose-500 text-white rounded-full p-4 hover:scale-110 transition-transform">
                  <PlayIcon className="w-8 h-8" />
                </button>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 text-white pt-4 md:pt-12">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {film.ageRating && (
               <span className="px-3 py-1 rounded-md bg-orange-500/20 border border-orange-500/50 text-orange-400 font-bold font-mono text-sm">
                 {film.ageRating}
               </span>
              )}
              {film.status === 'PRE_RELEASE' && (
                <span className="px-3 py-1 rounded-md bg-blue-500/20 border border-blue-500/50 text-blue-400 font-semibold text-sm">
                  Sắp Chiếu
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {film.filmName}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-slate-300 mb-8">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-rose-400" />
                <span>{film.durationMinutes} phút</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-rose-400" />
                <span>{film.releaseDate}</span>
              </div>
              {film.genres && film.genres.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {film.genres.map(g => (
                    <span key={g.id} className="px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-300 border border-slate-700">
                      {g.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-3">Nội Dung Phim</h3>
              <p className="text-slate-400 leading-relaxed max-w-3xl">
                {film.description || "Chưa có thông tin mô tả."}
              </p>
            </div>

            {/* Additional info */}
            <div className="grid grid-cols-2 max-w-lg mb-10 gap-y-4 text-sm text-slate-400">
              <div>
                <span className="block text-slate-500 mb-1">Ngôn ngữ</span>
                <span className="text-white font-medium">{film.language || 'Tiếng Việt'}</span>
              </div>
              <div>
                <span className="block text-slate-500 mb-1">Phụ đề</span>
                <span className="text-white font-medium">{film.subtitle || 'Không'}</span>
              </div>
            </div>

            <button 
              onClick={() => navigate(`/booking/film/${film.filmId}`)}
              className="flex items-center gap-3 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:-translate-y-1"
            >
              <TicketIcon className="w-6 h-6" />
              Mua Vé Ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
