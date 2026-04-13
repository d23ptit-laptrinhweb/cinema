import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { bookingApi } from '../../api';
import EmptyState from '../../components/Common/EmptyState';
import DigitalTicket from '../../components/Ticket/DigitalTicket';

const STATUS_MAP = {
  PENDING: { label: 'Chờ thanh toán', color: '#f59e0b', icon: '⏳' },
  COMPLETED: { label: 'Đã hoàn tất', color: '#22c55e', icon: '✅' },
  CANCELLED: { label: 'Đã huỷ', color: '#ef4444', icon: '❌' },
  EXPIRED: { label: 'Hết hạn', color: '#6b7280', icon: '⌛' },
};

const PAYMENT_MAP = {
  PENDING: { label: 'Chờ thanh toán', color: '#f59e0b' },
  PAID: { label: 'Đã thanh toán', color: '#22c55e' },
  FAILED: { label: 'Thất bại', color: '#ef4444' },
  CANCELLED: { label: 'Đã huỷ', color: '#6b7280' },
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, COMPLETED, CANCELLED
  const [showQR, setShowQR] = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await bookingApi.getMyBookings();
        const data = res.data.result || [];
        // Sort by createdAt desc
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setBookings(data);
      } catch (err) {
        console.error('Lỗi khi tải vé', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Bạn có chắc muốn huỷ đơn đặt vé này?')) return;
    try {
      await bookingApi.cancel(bookingId);
      setBookings(prev =>
        prev.map(b => b.bookingId === bookingId
          ? { ...b, status: 'CANCELLED', paymentStatus: 'CANCELLED' }
          : b
        )
      );
    } catch (err) {
      alert('Không thể huỷ vé: ' + (err.response?.data?.message || err.message));
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false,
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 đ';
    return Number(amount).toLocaleString('vi-VN') + ' đ';
  };

  const filteredBookings = filter === 'ALL'
    ? bookings
    : bookings.filter(b => b.status === filter);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">🎟️ Vé của tôi</h1>
          <p className="page-subtitle">Lịch sử đặt vé và trạng thái thanh toán</p>
        </div>

        {/* Filter tabs */}
        <div className="booking-filter-bar">
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'PENDING', label: '⏳ Chờ thanh toán' },
            { key: 'COMPLETED', label: '✅ Đã hoàn tất' },
            { key: 'CANCELLED', label: '❌ Đã huỷ' },
          ].map(tab => (
            <button
              key={tab.key}
              className={`booking-filter-tab ${filter === tab.key ? 'booking-filter-tab--active' : ''}`}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
              {tab.key !== 'ALL' && (
                <span className="booking-filter-count">
                  {bookings.filter(b => b.status === tab.key).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Booking list */}
        {filteredBookings.length === 0 ? (
          <EmptyState 
            title="Bạn chưa có vé nào"
            message={filter === 'ALL' 
              ? "Có vẻ như bạn chưa đặt vé nào tại CinemaHub. Hãy chọn một bộ phim và trải nghiệm ngay nhé!" 
              : `Bạn không có đơn hàng nào ở trạng thái "${STATUS_MAP[filter]?.label || filter}".`}
            buttonText="Tìm phim đặt vé ngay"
          />
        ) : (
          <div className="booking-list">
            {filteredBookings.map(booking => {
              const ticketData = {
                ...booking,
                startTime: booking.showtimeStart,
                branchName: booking.branchName || 'Chi nhánh CinemaHub'
              };

              return (
                <div key={booking.bookingId} style={{ marginBottom: 40, width: '100%' }}>
                  <DigitalTicket booking={ticketData} />
                  
                  {booking.status === 'PENDING' && (
                    <div style={{ marginTop: 12, textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                      <button
                        className="btn btn-primary"
                        onClick={() => navigate(`/payment/${booking.bookingId}`)}
                      > 💳 Thanh toán ngay </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleCancel(booking.bookingId)}
                      > ❌ Hủy vé </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QR Modal */}
      {showQR && (
        <div className="modal-overlay" onClick={() => setShowQR(null)}>
          <div className="modal-content" style={{ maxWidth: 400, aspectRatio: 'auto', padding: 40, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowQR(null)}>×</button>
            <h3 style={{ marginBottom: 20 }}>Mã vé của bạn</h3>
            <div style={{ background: 'white', padding: 24, borderRadius: 16, display: 'inline-block', marginBottom: 20 }}>
              <QRCodeSVG value={showQR} size={240} />
            </div>
            <p style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: 2, fontFamily: 'monospace', color: 'white' }}>{showQR}</p>
            <p style={{ color: 'var(--text-secondary)', marginTop: 12, fontSize: '0.9rem' }}>
              Vui lòng đưa mã này cho nhân viên tại quầy để nhận vé.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
