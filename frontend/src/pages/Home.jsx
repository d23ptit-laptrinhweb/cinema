import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { PlayIcon, StarIcon } from '@heroicons/react/24/solid';

export default function Home() {
  const [nowShowing, setNowShowing] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('now');

  useEffect(() => {
    const fetchFilms = async () => {
      try {
        const [nowShowingRes, upcomingRes] = await Promise.all([
          axiosClient.get('/film/now-showing'),
          axiosClient.get('/film/upcoming')
        ]);
        setNowShowing(nowShowingRes || []);
        setUpcoming(upcomingRes || []);
      } catch (error) {
        console.error('Failed to fetch films:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFilms();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  const displayedMovies = activeTab === 'now' ? nowShowing : upcoming;

  return (
    <div className="pb-16">
      {/* Hero Section */}
      <div className="relative h-[70vh] w-full bg-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={nowShowing[0]?.thumnbnail_url || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop"} 
            alt="Hero Banner"
            className="w-full h-full object-cover opacity-40 blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/50 to-transparent" />
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            {nowShowing.length > 0 && (
              <div className="max-w-2xl animate-fade-in-up">
                <span className="inline-block py-1 px-3 rounded-full bg-rose-500/20 text-rose-400 text-sm font-semibold mb-4 border border-rose-500/30">
                  Đang Chiếu
                </span>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                  {nowShowing[0].filmName}
                </h1>
                <p className="text-lg text-slate-300 mb-8 line-clamp-3">
                  {nowShowing[0].description}
                </p>
                <div className="flex items-center gap-4">
                  <Link 
                    to={`/film/${nowShowing[0].filmId}`}
                    className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-full font-semibold transition-all shadow-lg shadow-rose-500/30 hover:scale-105"
                  >
                    <PlayIcon className="w-5 h-5" />
                    Đặt Vé Ngay
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Movie List with Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-10">
          <button
            onClick={() => setActiveTab('now')}
            className={`px-6 py-3 rounded-full font-bold text-sm transition-all ${
              activeTab === 'now'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700'
            }`}
          >
            Đang Chiếu
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-6 py-3 rounded-full font-bold text-sm transition-all ${
              activeTab === 'upcoming'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700'
            }`}
          >
            Sắp Chiếu
          </button>
        </div>

        {/* Movie Grid */}
        <MovieSection title={activeTab === 'now' ? 'Phim Đang Chiếu' : 'Phim Sắp Chiếu'} movies={displayedMovies} />
      </div>
    </div>
  );
}

function MovieSection({ title, movies }) {
  if (!movies || movies.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white relative pl-4 after:content-[''] after:absolute after:left-0 after:top-1/2 after:-translate-y-1/2 after:w-1.5 after:h-6 after:bg-rose-500 after:rounded-full">
          {title}
        </h2>
        <Link to="#" className="text-rose-400 hover:text-rose-300 font-medium transition-colors">
          Xem tất cả &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {movies.map(movie => (
          <Link key={movie.filmId} to={`/film/${movie.filmId}`} className="group">
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-4 bg-slate-800 shadow-xl">
              <img 
                src={movie.thumnbnail_url || "https://via.placeholder.com/400x600?text=No+Image"} 
                alt={movie.filmName}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <button className="bg-rose-500 hover:bg-rose-600 text-white w-full py-2 rounded-xl font-medium transition-colors shadow-lg shadow-rose-500/30">
                  Mua Vé
                </button>
              </div>
              {/* Age rating badge */}
              {movie.ageRating && (
               <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-bold font-mono text-orange-400 border border-white/10">
                 {movie.ageRating}
               </div>
              )}
            </div>
            <h3 className="font-semibold text-slate-200 group-hover:text-rose-400 transition-colors line-clamp-1 mb-1">
              {movie.filmName}
            </h3>
            <div className="flex items-center text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <StarIcon className="w-4 h-4 text-amber-400" /> 
                {/* Random score for UI */}
                {((Math.random() * 2) + 7).toFixed(1)}
              </span>
              <span className="mx-2">•</span>
              <span>{movie.durationMinutes} phút</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
