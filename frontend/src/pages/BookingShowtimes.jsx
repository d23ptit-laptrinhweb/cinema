import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { format, parseISO, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CalendarDaysIcon, MapPinIcon } from '@heroicons/react/24/outline';

export default function BookingShowtimes() {
  const { filmId } = useParams();
  const navigate = useNavigate();
  
  const [film, setFilm] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [branches, setBranches] = useState([]);
  const [rooms, setRooms] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dates, setDates] = useState([]);

  useEffect(() => {
    // Generate next 7 days for date selector
    const today = new Date();
    const next7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d;
    });
    setDates(next7Days);

    const fetchData = async () => {
      try {
        const [filmRes, showtimeRes, branchRes, roomRes] = await Promise.all([
          axiosClient.get(`/film/${filmId}`).catch(() => null),
          axiosClient.get(`/showtime/film/${filmId}`).catch(() => []),
          axiosClient.get(`/branch`).catch(() => []),
          axiosClient.get(`/room`).catch(() => [])
        ]);
        
        setFilm(filmRes);
        setShowtimes(showtimeRes || []);
        setBranches(branchRes || []);
        setRooms(roomRes || []);
      } catch (error) {
        setError(error?.message || 'Không thể tải suất chiếu.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [filmId]);

  if (loading) {
    return (
      <div className="page-shell flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-red-600"></div>
      </div>
    );
  }

  if (!film) {
    return (
      <div className="page-shell py-20">
        <div className="card-soft p-10 text-center text-zinc-600">Không tìm thấy thông tin phim</div>
      </div>
    );
  }

  // Filter showtimes by selected Date
  const showtimesOnDate = showtimes.filter(st => {
    const stDate = parseISO(st.startTime);
    return isSameDay(stDate, selectedDate) && st.status !== 'CANCELLED';
  });

  // Group by Branch
  const branchesWithShowtimes = branches.map(branch => {
    // Find rooms in this branch
    const branchRooms = rooms.filter(r => r.branchId === branch.branchId);
    const roomIds = branchRooms.map(r => r.id);
    
    // Find showtimes in these rooms
    const sts = showtimesOnDate.filter(st => roomIds.includes(st.roomId));
    
    return {
      ...branch,
      showtimes: sts.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
      branchRooms
    };
  }).filter(b => b.showtimes.length > 0);

  return (
    <div className="page-shell space-y-8 py-6">
      <section className="card-soft p-6 md:p-8">
        <div className="flex flex-col gap-5 md:flex-row">
          <img
            src={film.thumnbnail_url || 'https://via.placeholder.com/150x225'}
            alt={film.filmName}
            className="w-28 rounded-xl border border-zinc-200 object-cover"
          />
          <div className="space-y-3">
            <h1 className="text-3xl font-black text-zinc-900">{film.filmName}</h1>
            <p className="max-w-3xl text-zinc-600">{film.description || 'Chưa có mô tả phim.'}</p>
            <div className="inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
              Chọn ngày và suất chiếu phù hợp
            </div>
          </div>
        </div>
      </section>

      <section className="card-soft p-6">
        <h2 className="mb-5 flex items-center gap-2 text-xl font-black text-zinc-900">
          <CalendarDaysIcon className="h-6 w-6 text-red-600" />
          Chọn ngày chiếu
        </h2>
        <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-2">
        {dates.map((date, idx) => {
          const isSelected = isSameDay(date, selectedDate);
          return (
            <button
              key={idx}
              onClick={() => setSelectedDate(date)}
              className={`flex h-24 w-20 flex-shrink-0 flex-col items-center justify-center rounded-xl border transition ${
                isSelected 
                  ? 'border-red-600 bg-red-600 text-white' 
                  : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400'
              }`}
            >
              <span className="text-xs">{idx === 0 ? 'Hôm nay' : format(date, 'EEE', { locale: vi })}</span>
              <span className="text-2xl font-bold mt-1">{format(date, 'dd')}</span>
              <span className="text-xs">{format(date, 'MM/yyyy')}</span>
            </button>
          );
        })}
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="flex items-center gap-2 text-xl font-black text-zinc-900">
          <MapPinIcon className="h-6 w-6 text-red-600" />
          Chọn rạp và suất chiếu
        </h2>
      
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {branchesWithShowtimes.length === 0 ? (
        <div className="card-soft p-12 text-center text-zinc-600">
          Không có suất chiếu vào ngày này. Vui lòng thử ngày khác.
        </div>
      ) : (
        <div className="space-y-6">
          {branchesWithShowtimes.map(branch => (
            <div key={branch.branchId} className="card-soft overflow-hidden">
              <div className="border-b border-zinc-200 bg-zinc-50 p-4">
                <h3 className="text-lg font-black text-zinc-900">{branch.name}</h3>
                <p className="mt-1 text-sm text-zinc-600">{branch.address}</p>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-4">
                  {branch.showtimes.map(st => {
                    const room = branch.branchRooms.find(r => r.id === st.roomId);
                    return (
                      <button
                        key={st.showtimeId}
                        onClick={() => navigate(`/booking/seat/${st.showtimeId}`)}
                        className="group flex flex-col items-center rounded-lg border border-zinc-200 bg-white p-3 transition hover:border-red-500 hover:bg-red-50"
                      >
                        <span className="text-xl font-black text-zinc-900 transition group-hover:text-red-700">
                          {format(parseISO(st.startTime), 'HH:mm')}
                        </span>
                        <span className="mt-1 text-xs text-zinc-500">
                          {room ? room.name : 'Phòng chiếu'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </section>
    </div>
  );
}
