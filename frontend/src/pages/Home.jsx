import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { ClockIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const [nowShowing, setNowShowing] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
        setError(error?.message || 'Không thể tải danh sách phim lúc này.');
      } finally {
        setLoading(false);
      }
    };
    fetchFilms();
  }, []);

  if (loading) {
    return (
      <div className="page-shell flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-red-600"></div>
      </div>
    );
  }

  const displayedMovies = activeTab === 'now' ? nowShowing : upcoming;

  return (
    <div className="pb-8">
      <section className="page-shell space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="section-title">Danh sach phim</h2>
          <div className="flex items-center rounded-xl border border-zinc-200 bg-white p-1">
            <button
              onClick={() => setActiveTab('now')}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'now' ? 'bg-red-600 text-white' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Đang chiếu
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'upcoming' ? 'bg-red-600 text-white' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Sắp chiếu
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <MovieSection title={activeTab === 'now' ? 'Phim đang chiếu' : 'Phim sắp chiếu'} movies={displayedMovies} />
      </section>
    </div>
  );
}

function MovieSection({ title, movies }) {
  if (!movies || movies.length === 0) {
    return (
      <div className="card-soft p-10 text-center text-zinc-600">
        Chưa có phim trong danh mục này.
      </div>
    );
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-black text-zinc-900">{title}</h2>
      </div>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {movies.map((movie) => (
          <Link key={movie.filmId} to={`/film/${movie.filmId}`} className="card-soft group overflow-hidden rounded-2xl border-zinc-200 transition hover:-translate-y-1 hover:shadow-xl">
            <div className="aspect-[2/3] overflow-hidden bg-zinc-100">
              <img
                src={movie.thumnbnail_url || 'https://via.placeholder.com/400x600?text=No+Image'}
                alt={movie.filmName}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </div>

            <div className="space-y-2 p-4">
              <h3 className="line-clamp-2 min-h-[48px] text-sm font-bold text-zinc-900 sm:text-base">
                {movie.filmName}
              </h3>

              <div className="flex items-center gap-2 text-xs text-zinc-600 sm:text-sm">
                <ClockIcon className="h-4 w-4 text-red-600" />
                <span>{movie.durationMinutes || '--'} phút</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] font-semibold uppercase text-zinc-600">
                  {movie.status || 'NOW'}
                </span>
                <span className="text-sm font-semibold text-red-700 group-hover:text-red-800">Đặt vé</span>
              </div>

              {movie.ageRating && (
                <div className="pt-1 text-xs font-semibold text-zinc-500">Độ tuổi: {movie.ageRating}</div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
