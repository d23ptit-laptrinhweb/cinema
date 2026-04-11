import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { format, parseISO } from 'date-fns';
import { InformationCircleIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

export default function BookingSeat() {
  const { showtimeId } = useParams();
  const navigate = useNavigate();

  const [showtime, setShowtime] = useState(null);
  const [film, setFilm] = useState(null);
  const [room, setRoom] = useState(null);
  const [seats, setSeats] = useState([]);
  const [bookedSeatIds, setBookedSeatIds] = useState([]);
  const [prices, setPrices] = useState({});
  const [selectedSeats, setSelectedSeats] = useState([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch showtime details
        const stRes = await axiosClient.get(`/showtime/${showtimeId}`);
        setShowtime(stRes);

        if (stRes) {
          // 2. Fetch related data in parallel
          const [filmRes, roomRes, seatRes, ticketRes, priceRes] = await Promise.all([
            axiosClient.get(`/film/${stRes.filmId}`),
            axiosClient.get(`/room/${stRes.roomId}`).catch(() => null),
            axiosClient.get(`/seat/room/${stRes.roomId}`),
            axiosClient.get(`/ticket/showtime/${showtimeId}`),
            axiosClient.get('/seat-type-price')
          ]);

          setFilm(filmRes);
          setRoom(roomRes);
          setSeats(seatRes || []);
          
          const bookedIds = (ticketRes || []).filter(t => t.ticketStatus === 'BOOKED' || t.ticketStatus === 'PAID').map(t => t.seatId);
          setBookedSeatIds(bookedIds);

          const priceMap = {};
          (priceRes || []).forEach(p => {
            priceMap[p.seatType] = p.price;
          });
          setPrices(priceMap);
        }
      } catch (error) {
        console.error('Failed to load booking details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [showtimeId]);

  const toggleSeat = (seat) => {
    if (bookedSeatIds.includes(seat.seatId) || !seat.isActive) return;

    setSelectedSeats(prev => {
      const isSelected = prev.some(s => s.seatId === seat.seatId);
      if (isSelected) {
        return prev.filter(s => s.seatId !== seat.seatId);
      } else {
        if (prev.length >= 8) {
          alert('Bạn chỉ được chọn tối đa 8 ghế');
          return prev;
        }
        return [...prev, seat];
      }
    });
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seat) => {
      return total + (prices[seat.seatType] || 0);
    }, 0);
  };

  const handleCheckout = () => {
    if (selectedSeats.length === 0) return;
    // We could use Zustand here, but passing via navigate state is also okay for simplicity
    navigate('/checkout', {
      state: {
        showtime,
        film,
        room,
        selectedSeats,
        totalAmount: calculateTotal(),
        prices
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!showtime) {
    return <div className="text-center text-white py-20">Không tìm thấy thông tin suất chiếu</div>;
  }

  // Group seats by row
  const rows = {};
  seats.forEach(seat => {
    const row = seat.rowLabel;
    if (!rows[row]) rows[row] = [];
    rows[row].push(seat);
  });
  // Sort rows alphabetically
  const sortedRows = Object.keys(rows).sort();
  // Sort seats within row by seatNumber
  sortedRows.forEach(row => {
    rows[row].sort((a, b) => a.seatNumber - b.seatNumber);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
      {/* Left: Seat Map */}
      <div className="flex-1 bg-slate-900 rounded-3xl p-6 border border-slate-700 shadow-2xl">
        <div className="text-center mb-12">
          <div className="w-full max-w-xl mx-auto h-12 bg-gradient-to-b from-white/20 to-transparent rounded-t-[50%] border-t-4 border-rose-500/50 relative shadow-[0_15px_30px_-5px_rgba(244,63,94,0.3)]">
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-slate-400 font-bold tracking-widest uppercase text-sm">
              Màn Hình
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 items-center overflow-x-auto pb-8 hide-scrollbar">
          {sortedRows.map(row => (
            <div key={row} className="flex items-center gap-3">
              <div className="w-6 text-center text-slate-500 font-bold">{row}</div>
              <div className="flex gap-2">
                {rows[row].map(seat => {
                  const isBooked = bookedSeatIds.includes(seat.seatId) || !seat.isActive;
                  const isSelected = selectedSeats.some(s => s.seatId === seat.seatId);
                  const isVip = seat.seatType === 'VIP';
                  const isCouple = seat.seatType === 'COUPLE';

                  let seatClass = "w-8 h-8 md:w-10 md:h-10 rounded-t-lg rounded-b-sm flex items-center justify-center text-xs font-medium cursor-pointer transition-all disabled:cursor-not-allowed";
                  
                  if (isBooked) {
                    seatClass += " bg-slate-700 text-slate-500 opacity-50 cursor-not-allowed";
                  } else if (isSelected) {
                    seatClass += " bg-rose-500 text-white shadow-lg shadow-rose-500/40 ring-2 ring-rose-300";
                  } else {
                    if (isVip) {
                      seatClass += " bg-amber-500/20 text-amber-500 border border-amber-500/30 hover:bg-amber-500/40";
                    } else if (isCouple) {
                      seatClass += " bg-pink-500/20 text-pink-500 border border-pink-500/30 hover:bg-pink-500/40 w-[72px] md:w-[88px]"; // Wider for couple
                    } else {
                      seatClass += " bg-slate-800 text-slate-300 border border-slate-600 hover:border-slate-400 hover:bg-slate-700"; // Normal
                    }
                  }

                  return (
                    <button
                      key={seat.seatId}
                      onClick={() => toggleSeat(seat)}
                      disabled={isBooked}
                      className={seatClass}
                    >
                      {seat.seatNumber}
                    </button>
                  );
                })}
              </div>
              <div className="w-6 text-center text-slate-500 font-bold">{row}</div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-8 pt-8 border-t border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-800 border border-slate-600"></div>
            <span>Ghế Thường</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-amber-500/20 border border-amber-500/30"></div>
            <span>Ghế VIP</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-rose-500"></div>
            <span className="text-white">Đang Chọn</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-700 opacity-50"></div>
            <span>Đã Bán</span>
          </div>
        </div>
      </div>

      {/* Right: Booking Summary */}
      <div className="lg:w-96">
        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 sticky top-24 shadow-xl">
          {film && (
            <div className="flex gap-4 mb-6 pb-6 border-b border-slate-700">
              <img src={film.thumnbnail_url} alt="Thumbnail" className="w-20 rounded-md shadow outline outline-1 outline-white/10" />
              <div>
                <h3 className="font-bold text-white text-lg leading-tight">{film.filmName}</h3>
                <p className="text-xs text-slate-400 mt-1">{film.durationMinutes} phút</p>
                {film.ageRating && (
                  <span className="inline-block mt-2 px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/30">
                    {film.ageRating}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="space-y-4 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-slate-400">Rạp chiếu</span>
              <span className="text-white font-medium text-right">{room?.name || 'Đang chờ cập nhật'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Suất chiếu</span>
              <span className="text-white font-medium">
                {showtime?.startTime ? format(parseISO(showtime.startTime), 'HH:mm - dd/MM/yyyy') : ''}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-slate-400">Ghế chọn</span>
              <div className="flex gap-1 flex-wrap justify-end max-w-[60%]">
                {selectedSeats.length === 0 ? (
                  <span className="text-slate-500">Chưa chọn ghế</span>
                ) : (
                  selectedSeats.map(s => (
                    <span key={s.seatId} className="px-2 py-1 bg-rose-500/20 text-rose-400 rounded block font-medium">
                      {s.seatCode}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-6 mb-6">
            <div className="flex justify-between items-end">
              <span className="text-slate-400">Tổng tiền</span>
              <span className="text-3xl font-bold text-rose-500">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateTotal())}
              </span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={selectedSeats.length === 0}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <ShoppingCartIcon className="w-5 h-5" />
            Tiếp tục thanh toán
          </button>
        </div>
      </div>
    </div>
  );
}
