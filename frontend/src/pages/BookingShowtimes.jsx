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

  // Filter showtimes by selected Date
  const showtimesOnDate = showtimes.filter(st => {
    const stDate = parseISO(st.startTime);
    return isSameDay(stDate, selectedDate);
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

      {/* Showtimes by Branch */}
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <MapPinIcon className="w-6 h-6 text-rose-500" />
        Chọn Rạp & Suất Chiếu
      </h2>
      
      {branchesWithShowtimes.length === 0 ? (
        <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-12 text-center text-slate-400">
          Không có suất chiếu nào vào ngày này. Vui lòng chọn ngày khác!
        </div>
      ) : (
        <div className="space-y-6">
          {branchesWithShowtimes.map(branch => (
            <div key={branch.branchId} className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
              <div className="bg-slate-900/50 p-4 border-b border-slate-700">
                <h3 className="text-lg font-bold text-white">{branch.name}</h3>
                <p className="text-sm text-slate-400 mt-1">{branch.address}</p>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-4">
                  {branch.showtimes.map(st => {
                    const room = branch.branchRooms.find(r => r.id === st.roomId);
                    return (
                      <button
                        key={st.showtimeId}
                        onClick={() => navigate(`/booking/seat/${st.showtimeId}`)}
                        className="group flex flex-col items-center bg-slate-900 border border-slate-700 hover:border-rose-500 rounded-lg p-3 transition-all hover:shadow-lg hover:shadow-rose-500/20"
                      >
                        <span className="text-xl font-bold text-white group-hover:text-rose-400 transition-colors">
                          {format(parseISO(st.startTime), 'HH:mm')}
                        </span>
                        <span className="text-xs text-slate-400 mt-1">
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
    </div>
  );
}
