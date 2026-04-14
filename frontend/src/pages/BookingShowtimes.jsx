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
  const [showtimeLoading, setShowtimeLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedBranchId, setSelectedBranchId] = useState(null);
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
        const [filmRes, branchRes, roomRes] = await Promise.all([
          axiosClient.get(`/film/${filmId}`).catch(() => null),
          axiosClient.get(`/branch`).catch(() => []),
          axiosClient.get(`/room`).catch(() => [])
        ]);
        
        setFilm(filmRes);
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

  useEffect(() => {
    if (branches.length > 0 && !selectedBranchId) {
      setSelectedBranchId(branches[0].branchId);
    }
  }, [branches, selectedBranchId]);

  useEffect(() => {
    const fetchShowtimes = async () => {
      try {
        setShowtimeLoading(true);
        setError('');

        const params = {
          filmId,
          date: format(selectedDate, 'yyyy-MM-dd')
        };

        params.branchId = selectedBranchId;

        const showtimeRes = await axiosClient.get('/showtime/filter', { params });
        setShowtimes(showtimeRes || []);
      } catch (error) {
        setShowtimes([]);
        setError(error?.message || 'Không thể tải suất chiếu.');
      } finally {
        setShowtimeLoading(false);
      }
    };

    if (filmId && selectedBranchId) {
      fetchShowtimes();
    }
  }, [filmId, selectedDate, selectedBranchId]);

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

  // Keep only future and valid showtimes
  const now = new Date();
  const filteredShowtimes = showtimes.filter(st => {
    const stDate = parseISO(st.startTime);
    return stDate > now && st.status !== 'CANCELLED';
  });

  const selectedBranch = branches.find((branch) => branch.branchId === selectedBranchId);
  const branchRooms = rooms.filter((room) => room.branchId === selectedBranchId);

  const getRoomById = (roomId) => branchRooms.find((room) => String(room.roomId ?? room.id) === String(roomId));

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

      <section className="card-soft p-6">
        <h2 className="mb-5 flex items-center gap-2 text-xl font-black text-zinc-900">
          <MapPinIcon className="h-6 w-6 text-red-600" />
          Lọc theo rạp
        </h2>
        <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-2">
          {branches.map((branch) => (
            <button
              key={branch.branchId}
              onClick={() => setSelectedBranchId(branch.branchId)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                selectedBranchId === branch.branchId
                  ? 'border-red-600 bg-red-600 text-white'
                  : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400'
              }`}
            >
              {branch.name}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="flex items-center gap-2 text-xl font-black text-zinc-900">
          <MapPinIcon className="h-6 w-6 text-red-600" />
          Suất chiếu
        </h2>
      
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {!selectedBranchId ? (
        <div className="card-soft p-12 text-center text-zinc-600">
          Hiện chưa có rạp để hiển thị suất chiếu.
        </div>
      ) : showtimeLoading ? (
        <div className="card-soft flex min-h-[200px] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-red-600"></div>
        </div>
      ) : filteredShowtimes.length === 0 ? (
        <div className="card-soft p-12 text-center text-zinc-600">
          Không có suất chiếu vào ngày này. Vui lòng thử ngày khác.
        </div>
      ) : (
        <div className="card-soft overflow-hidden">
          <div className="border-b border-zinc-200 bg-zinc-50 p-4">
            <h3 className="text-lg font-black text-zinc-900">{selectedBranch?.name || 'Rạp đã chọn'}</h3>
            <p className="mt-1 text-sm text-zinc-600">{selectedBranch?.address || 'Đang cập nhật địa chỉ'}</p>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-4">
              {filteredShowtimes
                .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                .map((st) => {
                  const room = getRoomById(st.roomId);
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
      )}
      </section>
    </div>
  );
}
