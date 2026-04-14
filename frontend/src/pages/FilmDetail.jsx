import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { CalendarIcon, ClockIcon, TicketIcon } from '@heroicons/react/24/outline';

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
      } catch {
        setError('Không tìm thấy phim');
      } finally {
        setLoading(false);
      }
    };
    fetchFilm();
  }, [id]);

  if (loading) {
    return (
      <div className="page-shell flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-red-600"></div>
      </div>
    );
  }

  if (error || !film) {
    return (
      <div className="page-shell py-20">
        <div className="card-soft p-10 text-center text-zinc-600">{error || 'Có lỗi xảy ra'}</div>
      </div>
    );
  }

  return (
    <div className="page-shell py-6">
      <div className="card-soft overflow-hidden border-black/10">
        <div className="grid gap-7 p-6 md:grid-cols-[340px_1fr] md:p-10">
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
            <img
              src={film.thumnbnail_url || 'https://via.placeholder.com/400x600?text=No+Image'}
              alt={film.filmName}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="animate-rise">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              {film.ageRating && (
                <span className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                  {film.ageRating}
                </span>
              )}
              {film.status && (
                <span className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-700">
                  {film.status}
                </span>
              )}
            </div>

            <h1 className="text-4xl font-black leading-tight text-zinc-900">{film.filmName}</h1>

            <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-zinc-600">
              <span className="inline-flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-red-600" />
                {film.durationMinutes || '--'} phút
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-red-600" />
                Khởi chiếu: {film.releaseDate || '--'}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {(film.genres || []).map((g) => (
                <span key={g.id || g.name} className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-600">
                  {g.name}
                </span>
              ))}
            </div>

            <p className="mt-6 max-w-3xl leading-relaxed text-zinc-700">{film.description || 'Chưa có mô tả phim.'}</p>

            <div className="mt-7 grid max-w-xl grid-cols-2 gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm">
              <div>
                <p className="text-zinc-500">Ngôn ngữ</p>
                <p className="font-semibold text-zinc-900">{film.language || 'Đang cập nhật'}</p>
              </div>
              <div>
                <p className="text-zinc-500">Phụ đề</p>
                <p className="font-semibold text-zinc-900">{film.subtitle || 'Không'}</p>
              </div>
            </div>

            <button onClick={() => navigate(`/booking/film/${film.filmId}`)} className="btn-primary mt-7">
              <TicketIcon className="h-5 w-5" />
              Đặt vé ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
