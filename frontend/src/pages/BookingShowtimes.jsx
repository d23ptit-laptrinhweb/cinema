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
  const [rooms, setRooms] = useState([]);
  
  const [loading, setLoading] = useState(true);
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
        const [filmRes, showtimeRes, roomRes] = await Promise.all([
          axiosClient.get(`/film/${filmId}`).catch(() => null),
          axiosClient.get(`/showtime/film/${filmId}`).catch(() => []),
          axiosClient.get(`/room`).catch(() => [])
        ]);
        
        setFilm(filmRes);
        setShowtimes(showtimeRes || []);
        setRooms(roomRes || []);
      } catch (error) {
        console.error('Failed to fetch data for booking', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [filmId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!film) {
    return <div className="text-center text-white py-20">Không tìm thấy thông tin phim</div>;
  }

  // Filter showtimes by selected Date and sort by time
  const showtimesOnDate = showtimes
    .filter(st => {
      const stDate = parseISO(st.startTime);
      return isSameDay(stDate, selectedDate);
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  // Create a map of room info for quick lookup
  const roomMap = {};
  rooms.forEach(room => {
    roomMap[room.id] = room;
  });

  const getRoomTypeLabel = (type) => {
    const labels = { TWO_D: '2D', THREE_D: '3D', IMAX: 'IMAX' };
    return labels[type] || type;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Film header */}
      <div className="flex flex-col md:flex-row gap-6 mb-12 bg-slate-800/50 p-6 rounded-2xl border border-white/5">
        <img 
          src={film.thumnbnail_url || "https://via.placeholder.com/150x225"} 
          alt={film.filmName} 
          className="w-32 rounded-lg shadow-lg"
        />
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{film.filmName}</h1>
          <p className="text-slate-400 max-w-2xl">{film.description}</p>
        </div>
      </div>

      {/* Date Selector */}
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <CalendarDaysIcon className="w-6 h-6 text-rose-500" />
        Chọn Ngày Chiếu
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-4 mb-12 hide-scrollbar">
        {dates.map((date, idx) => {
          const isSelected = isSameDay(date, selectedDate);
          return (
            <button
              key={idx}
              onClick={() => setSelectedDate(date)}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-20 h-24 rounded-xl border transition-all ${
                isSelected 
                  ? 'bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-500/30' 
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span className="text-sm">{idx === 0 ? 'Hôm nay' : format(date, 'EEEE', { locale: vi })}</span>
              <span className="text-2xl font-bold mt-1">{format(date, 'dd')}</span>
              <span className="text-xs">{format(date, 'MM/yyyy')}</span>
            </button>
          );
        })}
      </div>

      {/* Showtimes List */}
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <MapPinIcon className="w-6 h-6 text-rose-500" />
        Chọn Suất Chiếu
      </h2>
      
      {showtimesOnDate.length === 0 ? (
        <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-12 text-center text-slate-400">
          Không có suất chiếu nào vào ngày này. Vui lòng chọn ngày khác!
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {showtimesOnDate.map(st => {
            const room = roomMap[st.roomId];
            return (
              <button
                key={st.showtimeId}
                onClick={() => navigate(`/booking/seat/${st.showtimeId}`)}
                className="group flex flex-col items-center bg-slate-800 border border-slate-700 hover:border-rose-500 rounded-xl p-4 transition-all hover:shadow-lg hover:shadow-rose-500/20 hover:bg-slate-700"
              >
                <span className="text-2xl font-bold text-white group-hover:text-rose-400 transition-colors">
                  {format(parseISO(st.startTime), 'HH:mm')}
                </span>
                {room && (
                  <>
                    <p className="text-xs text-slate-400 mt-2">{room.name}</p>
                    <span className="text-xs font-semibold text-rose-400 mt-1 bg-rose-400/10 px-2 py-1 rounded">
                      {getRoomTypeLabel(room.roomType)}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
