import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';
import axiosClient from '../api/axiosClient';
import { format, parseISO } from 'date-fns';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

export default function BookingSeat() {
  const { showtimeId } = useParams();
  const navigate = useNavigate();

  const [showtime, setShowtime] = useState(null);
  const [film, setFilm] = useState(null);
  const [room, setRoom] = useState(null);
  const [seats, setSeats] = useState([]);
  const [holdingSeatIds, setHoldingSeatIds] = useState([]);
  const [bookedSeatIds, setBookedSeatIds] = useState([]);
  const [prices, setPrices] = useState({});
  const [selectedSeats, setSelectedSeats] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const wsClientRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stRes = await axiosClient.get(`/showtime/${showtimeId}`);
        setShowtime(stRes);

        if (stRes) {
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

          const holdingIds = (ticketRes || [])
            .filter((t) => (t.displayStatus || t.ticketStatus) === 'HOLDING')
            .map((t) => t.seatId);
          const bookedIds = (ticketRes || [])
            .filter((t) => (t.displayStatus || t.ticketStatus) === 'BOOKED')
            .map((t) => t.seatId);

          setHoldingSeatIds(holdingIds);
          setBookedSeatIds(bookedIds);

          const priceMap = {};
          (priceRes || []).forEach(p => {
            priceMap[p.seatType] = p.price;
          });
          setPrices(priceMap);
        }
      } catch (error) {
        setError(error?.message || 'Không thể tải sơ đồ ghế.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [showtimeId]);

  useEffect(() => {
    const socketUrl = `${window.location.origin}/api/ws`;
    console.log('WebSocket connecting to:', socketUrl);

    const client = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      reconnectDelay: 5000,
      onStompError: (frame) => {
        console.error('WebSocket STOMP error:', frame);
      },
    });

    client.onConnect = () => {
      console.log('WebSocket connected, subscribing to:', `/topic/showtime/${showtimeId}/seats`);
      client.subscribe(`/topic/showtime/${showtimeId}/seats`, (message) => {
        console.log('WebSocket message received:', message.body);
        try {
          const payload = JSON.parse(message.body || '{}');
          const seatId = payload.seatId;
          const status = payload.status;

          console.log('Parsed payload:', { seatId, status });

          if (!seatId || !status) {
            console.warn('Invalid payload:', { seatId, status });
            return;
          }

          if (status === 'HOLDING') {
            console.log('Setting seat HOLDING:', seatId);
            setHoldingSeatIds((prev) => (prev.includes(seatId) ? prev : [...prev, seatId]));
            setSelectedSeats((prev) => prev.filter((seat) => seat.seatId !== seatId));
          } else if (status === 'BOOKED') {
            console.log('Setting seat BOOKED:', seatId);
            setHoldingSeatIds((prev) => prev.filter((id) => id !== seatId));
            setBookedSeatIds((prev) => (prev.includes(seatId) ? prev : [...prev, seatId]));
            setSelectedSeats((prev) => prev.filter((seat) => seat.seatId !== seatId));
          } else if (status === 'AVAILABLE') {
            console.log('Setting seat AVAILABLE:', seatId);
            setHoldingSeatIds((prev) => prev.filter((id) => id !== seatId));
            setBookedSeatIds((prev) => prev.filter((id) => id !== seatId));
          }
        } catch (err) {
          console.error('Error parsing message:', err, message.body);
        }
      });
    };

    client.onDisconnect = () => {
      console.log('WebSocket disconnected');
    };

    client.activate();
    wsClientRef.current = client;

    return () => {
      if (wsClientRef.current) {
        console.log('Cleaning up WebSocket');
        wsClientRef.current.deactivate();
        wsClientRef.current = null;
      }
    };
  }, [showtimeId]);

  const toggleSeat = (seat) => {
    const isUnavailable = holdingSeatIds.includes(seat.seatId) || bookedSeatIds.includes(seat.seatId) || !seat.isActive;
    if (isUnavailable) return;

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
      <div className="page-shell flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-red-600"></div>
      </div>
    );
  }

  if (!showtime) {
    return (
      <div className="page-shell py-20">
        <div className="card-soft p-10 text-center text-zinc-600">Không tìm thấy thông tin suất chiếu</div>
      </div>
    );
  }

  const rows = {};
  seats.forEach(seat => {
    const row = seat.rowLabel;
    if (!rows[row]) rows[row] = [];
    rows[row].push(seat);
  });
  const sortedRows = Object.keys(rows).sort();
  sortedRows.forEach(row => {
    rows[row].sort((a, b) => a.seatNumber - b.seatNumber);
  });

  return (
    <div className="page-shell grid gap-7 py-6 lg:grid-cols-[1fr_370px]">
      <section className="card-soft p-6 md:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto h-12 w-full max-w-xl rounded-t-[50%] border-t-4 border-red-500/60 bg-gradient-to-b from-red-100 to-transparent">
            <span className="relative top-5 text-xs font-bold uppercase tracking-[0.2em] text-zinc-600">
              Màn hình
            </span>
          </div>
        </div>

        <div className="hide-scrollbar flex flex-col items-center gap-3 overflow-x-auto pb-6">
          {sortedRows.map(row => (
            <div key={row} className="flex items-center gap-3">
              <div className="w-6 text-center text-sm font-bold text-zinc-500">{row}</div>
              <div className="flex gap-2">
                {rows[row].map(seat => {
                  const isHolding = holdingSeatIds.includes(seat.seatId);
                  const isBooked = bookedSeatIds.includes(seat.seatId);
                  const isInactive = !seat.isActive;
                  const isBlocked = isHolding || isBooked || isInactive;
                  const isSelected = selectedSeats.some(s => s.seatId === seat.seatId);
                  const isVip = seat.seatType === 'VIP';
                  const isCouple = seat.seatType === 'COUPLE';

                  let seatClass = 'flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold transition md:h-10 md:w-10';

                  if (isBooked) {
                    seatClass += ' cursor-not-allowed border border-zinc-300 bg-zinc-200 text-zinc-500';
                  } else if (isHolding) {
                    seatClass += ' cursor-not-allowed border border-orange-600 bg-orange-500 text-white';
                  } else if (isInactive) {
                    seatClass += ' cursor-not-allowed border border-zinc-300 bg-zinc-200 text-zinc-500';
                  } else if (isSelected) {
                    seatClass += ' border border-red-700 bg-red-600 text-white';
                  } else {
                    if (isVip) {
                      seatClass += ' border border-amber-400 bg-amber-50 text-amber-700 hover:bg-amber-100';
                    } else if (isCouple) {
                      seatClass += ' w-[72px] border border-fuchsia-300 bg-fuchsia-50 text-fuchsia-700 hover:bg-fuchsia-100 md:w-[88px]';
                    } else {
                      seatClass += ' border border-zinc-300 bg-white text-zinc-700 hover:border-red-400 hover:bg-red-50';
                    }
                  }

                  return (
                    <button
                      key={seat.seatId}
                      onClick={() => toggleSeat(seat)}
                      disabled={isBlocked}
                      className={seatClass}
                    >
                      {seat.seatNumber}
                    </button>
                  );
                })}
              </div>
              <div className="w-6 text-center text-sm font-bold text-zinc-500">{row}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-zinc-200 pt-6 text-sm text-zinc-600 sm:grid-cols-6">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded border border-zinc-300 bg-white"></div>
            <span>Thường</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded border border-amber-400 bg-amber-50"></div>
            <span>VIP</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-8 rounded border border-fuchsia-300 bg-fuchsia-50"></div>
            <span>Couple</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded border border-red-700 bg-red-600"></div>
            <span>Đang chọn</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded border border-orange-600 bg-orange-500"></div>
            <span>Đang giữ chỗ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded border border-zinc-300 bg-zinc-200"></div>
            <span>Đã đặt</span>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}
      </section>

      <aside className="card-soft h-fit p-6 lg:sticky lg:top-24">
        {film && (
          <div className="mb-5 flex gap-4 border-b border-zinc-200 pb-5">
            <img src={film.thumnbnail_url} alt="Thumbnail" className="w-20 rounded-md border border-zinc-200" />
            <div>
              <h3 className="text-lg font-black leading-tight text-zinc-900">{film.filmName}</h3>
              <p className="mt-1 text-xs text-zinc-500">{film.durationMinutes} phút</p>
              {film.ageRating && (
                <span className="mt-2 inline-block rounded border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-bold text-red-700">
                  {film.ageRating}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="mb-6 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">Phòng</span>
            <span className="text-right font-semibold text-zinc-900">{room?.name || 'Đang cập nhật'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Suất chiếu</span>
            <span className="font-semibold text-zinc-900">
              {showtime?.startTime ? format(parseISO(showtime.startTime), 'HH:mm - dd/MM/yyyy') : ''}
            </span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-zinc-500">Ghế chọn</span>
            <div className="flex gap-1 flex-wrap justify-end max-w-[60%]">
              {selectedSeats.length === 0 ? (
                <span className="text-zinc-500">Chưa chọn ghế</span>
              ) : (
                selectedSeats.map(s => (
                  <span key={s.seatId} className="block rounded bg-red-50 px-2 py-1 font-semibold text-red-700">
                    {s.seatCode}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mb-6 border-t border-zinc-200 pt-5">
          <div className="flex justify-between items-end">
            <span className="text-zinc-500">Tổng tiền</span>
            <span className="text-3xl font-black text-red-700">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateTotal())}
            </span>
          </div>
        </div>

        <button
          onClick={handleCheckout}
          disabled={selectedSeats.length === 0}
          className="btn-primary w-full"
        >
          <ShoppingCartIcon className="h-5 w-5" />
          Tiếp tục thanh toán
        </button>
      </aside>
    </div>
  );
}
