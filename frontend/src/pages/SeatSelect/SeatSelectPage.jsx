import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ticketApi, bookingApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function SeatSelectPage() {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const stompClient = useRef(null);

  // ① REST: Load sơ đồ ghế lần đầu
  useEffect(() => {
    ticketApi.getByShowtimeId(showtimeId)
      .then((res) => setTickets(res.data.result || []))
      .catch(() => setError('Không thể tải sơ đồ ghế'))
      .finally(() => setLoading(false));
  }, [showtimeId]);

  // ② WebSocket: Lắng nghe cập nhật real-time
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/api/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/showtime/${showtimeId}/seats`, (message) => {
          const event = JSON.parse(message.body);
          // Cập nhật đúng ghế đó trong state
          setTickets((prev) =>
            prev.map((t) =>
              t.seatId === event.seatId
                ? { ...t, displayStatus: event.status }
                : t
            )
          );
          // Nếu ghế đang selected mà bị người khác giữ → bỏ chọn
          if (event.status !== 'AVAILABLE') {
            setSelectedSeats((prev) => prev.filter((id) => id !== event.seatId));
          }
        });
      },
    });

    client.activate();
    stompClient.current = client;

    return () => {
      client.deactivate();
    };
  }, [showtimeId]);

  // Group tickets by row
  const rows = tickets.reduce((acc, ticket) => {
    const row = ticket.seatCode?.charAt(0) || ticket.rowLabel || '?';
    if (!acc[row]) acc[row] = [];
    acc[row].push(ticket);
    return acc;
  }, {});

  // Sort rows alphabetically, seats by number
  const sortedRows = Object.entries(rows).sort(([a], [b]) => a.localeCompare(b));
  sortedRows.forEach(([, seats]) => {
    seats.sort((a, b) => (a.seatNumber || 0) - (b.seatNumber || 0));
  });

  const toggleSeat = (ticket) => {
    const status = ticket.displayStatus || ticket.ticketStatus;
    if (status === 'BOOKED' || status === 'HOLDING') return;

    setSelectedSeats((prev) => {
      if (prev.includes(ticket.seatId)) {
        return prev.filter((id) => id !== ticket.seatId);
      }
      return [...prev, ticket.seatId];
    });
  };

  const getSeatClass = (ticket) => {
    const status = ticket.displayStatus || ticket.ticketStatus;
    if (selectedSeats.includes(ticket.seatId)) return 'seat seat--selected';
    if (status === 'BOOKED') return 'seat seat--booked';
    if (status === 'HOLDING') return 'seat seat--holding';
    return 'seat seat--available';
  };

  const totalPrice = tickets
    .filter((t) => selectedSeats.includes(t.seatId))
    .reduce((sum, t) => sum + (t.price || 0), 0);

  const handleBooking = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (selectedSeats.length === 0) return;

    setBooking(true);
    setError('');
    try {
      const res = await bookingApi.create({
        showtimeId,
        seatIds: selectedSeats,
      });
      const bookingData = res.data.result;
      navigate(`/booking/${bookingData.bookingId}/payment`);
    } catch (err) {
      setError(err.response?.data?.message || 'Đặt vé thất bại. Vui lòng thử lại.');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner" /></div>;
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">💺 Chọn ghế</h1>
          <p className="page-subtitle">Chọn ghế ngồi và tiến hành đặt vé</p>
        </div>

        {error && <div className="error-message" style={{ marginBottom: 20 }}>{error}</div>}

        <div className="card" style={{ padding: 32 }}>
          {/* Screen */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
            <div className="seat-screen" />
          </div>

          {/* Seat map container for scrolling */}
          <div className="seat-map-wrapper">
            <div className="seat-map">
            {sortedRows.map(([row, seats]) => (
              <div key={row} className="seat-row">
                <span className="seat-row-label">{row}</span>
                {seats.map((ticket) => (
                  <div
                    key={ticket.ticketId}
                    className={getSeatClass(ticket)}
                    onClick={() => toggleSeat(ticket)}
                    title={`${ticket.seatCode || row + ticket.seatNumber} — ${(ticket.displayStatus || ticket.ticketStatus)}`}
                  >
                    {ticket.seatNumber || ''}
                  </div>
                ))}
                <span className="seat-row-label">{row}</span>
              </div>
            ))}
            </div>
          </div>

          {/* Legend */}
          <div className="seat-legend">
            <div className="seat-legend-item">
              <div className="seat-legend-dot" style={{ background: 'rgba(16,185,129,0.15)', borderColor: 'var(--seat-available)' }} />
              Trống
            </div>
            <div className="seat-legend-item">
              <div className="seat-legend-dot" style={{ background: 'rgba(59,130,246,0.3)', borderColor: 'var(--seat-selected)' }} />
              Đang chọn
            </div>
            <div className="seat-legend-item">
              <div className="seat-legend-dot" style={{ background: 'rgba(245,158,11,0.15)', borderColor: 'var(--seat-holding)' }} />
              Đang giữ
            </div>
            <div className="seat-legend-item">
              <div className="seat-legend-dot" style={{ background: 'rgba(239,68,68,0.15)', borderColor: 'var(--seat-booked)' }} />
              Đã đặt
            </div>
          </div>
        </div>

        {/* Booking bar */}
        {selectedSeats.length > 0 && (
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'rgba(17, 24, 39, 0.95)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid var(--border-light)',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
            zIndex: 100,
          }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{selectedSeats.length}</strong> ghế
            </span>
            <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '1.1rem' }}>
              {totalPrice.toLocaleString('vi-VN')}đ
            </span>
            <button
              className="btn btn-primary"
              onClick={handleBooking}
              disabled={booking}
            >
              {booking ? 'Đang xử lý...' : 'Đặt vé'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
