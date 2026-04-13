import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import './DigitalTicket.css';

const DigitalTicket = ({ booking }) => {
  const ticketRef = useRef(null);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleTimeString('vi-VN', {
      hour: '2-digit', minute: '2-digit'
    });
  };

  const handleDownload = () => {
    if (ticketRef.current === null) return;
    
    // Force dimensions and horizontal layout for the captured image
    // to ensure it never cuts off or misaligns regardless of screen size.
    toPng(ticketRef.current, { 
      cacheBust: true, 
      pixelRatio: 3, 
      width: 850,
      height: 300,
      style: {
        transform: 'scale(1)',
        display: 'flex',
        flexDirection: 'row',
        width: '850px',
        height: '300px',
        margin: '0',
        padding: '0',
        borderRadius: '16px',
        backgroundColor: '#ffffff'
      }
    })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `CinemaHub-Ticket-${booking.bookingCode || 'booking'}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Lỗi khi tải vé:', err);
      });
  };

  return (
    <div className="ticket-container">
      <div className="digital-ticket" ref={ticketRef}>
        {/* Left Part: Movie Info */}
        <div className="ticket-main">
          <div className="ticket-header">
            <span className="ticket-brand">🎬 CinemaHub</span>
            <span className="ticket-status-tag">
              {booking.status === 'COMPLETED' ? 'VÉ HỢP LỆ' : 'CHỜ THANH TOÁN'}
            </span>
          </div>
          
          <h2 className="ticket-movie-title">{booking.filmName}</h2>
          
          <div className="ticket-info-grid">
            <div className="info-item">
              <label>Ngày chiếu</label>
              <span>{formatDate(booking.startTime)}</span>
            </div>
            <div className="info-item">
              <label>Suất chiếu</label>
              <span>{formatTime(booking.startTime)}</span>
            </div>
            <div className="info-item">
              <label>Phòng</label>
              <span>{booking.roomName || 'Phòng chiếu'}</span>
            </div>
            <div className="info-item">
              <label>Ghế</label>
              <span className="info-accent">{booking.seatCodes?.join(', ') || '—'}</span>
            </div>
          </div>

          <div className="ticket-footer">
            <div className="info-item">
              <label>Rạp</label>
              <span>{booking.branchName || 'Chi nhánh CinemaHub'}</span>
            </div>
            <div className="info-item" style={{ textAlign: 'right' }}>
              <label>Mã đơn hàng</label>
              <span style={{ fontFamily: 'monospace', fontWeight: 800 }}>{booking.bookingCode || 'BK-XXXXXX'}</span>
            </div>
          </div>
        </div>

        {/* Perforation Line */}
        <div className="ticket-divider">
          <div className="perforation-top"></div>
          <div className="dashed-line"></div>
          <div className="perforation-bottom"></div>
        </div>

        {/* Right Part: QR Code */}
        <div className="ticket-stub">
          <div className="qr-container">
            <QRCodeSVG 
              value={booking.bookingCode || booking.bookingId || 'CinemaHub'} 
              size={120}
              level="H"
              includeMargin={true}
            />
          </div>
          <p className="stub-text">Quét mã để nhận vé</p>
        </div>
      </div>

      <div className="ticket-actions-row">
        <button className="btn-download-ticket" onClick={handleDownload}>
          📥 Tải vé về máy
        </button>
      </div>
    </div>
  );
};

export default DigitalTicket;
