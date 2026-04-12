import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { format, parseISO } from 'date-fns';
import { UserCircleIcon, TicketIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingDetail, setBookingDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

  const getBookingStatusMeta = (booking) => {
    if (booking?.paymentStatus === 'PAID' || booking?.status === 'COMPLETED') {
      return {
        label: 'Đã thanh toán',
        className: 'bg-green-500/20 text-green-500 border border-green-500/30'
      };
    }

    if (booking?.status === 'CANCELLED' || booking?.paymentStatus === 'CANCELLED') {
      return {
        label: 'Đã huỷ',
        className: 'bg-red-500/20 text-red-500 border border-red-500/30'
      };
    }

    if (booking?.status === 'EXPIRED') {
      return {
        label: 'Hết hạn',
        className: 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
      };
    }

    return {
      label: 'Chờ thanh toán',
      className: 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
    };
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      VNPAY: 'VNPay',
      CASH: 'Tien mat',
      CARD: 'The'
    };
    return labels[method] || method || 'N/A';
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const userRes = await axiosClient.get('/my-info');
        setUser(userRes);
      } catch (error) {
        console.error('Lỗi khi tải thông tin user', error);
        setErrorMsg(error?.message || JSON.stringify(error));
        if(error?.code === 401 || String(error).includes('401') || error?.status === 401) {
           localStorage.removeItem('token');
           navigate('/login');
           return;
        }
      }

      try {
        const bookingRes = await axiosClient.get('/booking/my-bookings/list');
        setBookings(bookingRes || []);
      } catch (error) {
        console.error('Lỗi khi tải lịch sử đặt vé', error);
        // Không block trang nếu chỉ booking lỗi
      }

      setLoading(false);
    };
    fetchProfileData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const openBookingDetail = async (booking) => {
    setSelectedBooking(booking);
    setDetailLoading(true);

    try {
      const showtime = booking.showtimeId
        ? await axiosClient.get(`/showtime/${booking.showtimeId}`).catch(() => null)
        : null;

      const [room, film, seatResults] = await Promise.all([
        showtime?.roomId ? axiosClient.get(`/room/${showtime.roomId}`).catch(() => null) : Promise.resolve(null),
        showtime?.filmId ? axiosClient.get(`/film/${showtime.filmId}`).catch(() => null) : Promise.resolve(null),
        Promise.all((booking.tickets || []).map((ticket) =>
          axiosClient.get(`/seat/${ticket.seatId}`).catch(() => null)
        ))
      ]);

      const seatLabels = seatResults
        .filter(Boolean)
        .map((seat) => seat.seatCode || `${seat.rowLabel}${seat.seatNumber}`)
        .sort();

      setBookingDetail({
        showtime,
        room,
        film,
        seatLabels
      });
    } catch (error) {
      console.error('Loi khi tai chi tiet giao dich', error);
      setBookingDetail({ showtime: null, room: null, film: null, seatLabels: [] });
    } finally {
      setDetailLoading(false);
    }
  };

  const closeBookingDetail = () => {
    setSelectedBooking(null);
    setBookingDetail(null);
    setDetailLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="text-center py-20 text-white">
        <h2 className="text-2xl mb-4 text-red-500">Lỗi lấy dữ liệu API!</h2>
        <p className="mb-4">Chi tiết: {errorMsg}</p>
        <button onClick={() => navigate('/login')} className="bg-slate-700 px-6 py-2 rounded-xl">Đăng nhập lại</button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20 text-white">
        <h2 className="text-2xl mb-4">Vui lòng đăng nhập để xem thông tin!</h2>
        <button onClick={() => navigate('/login')} className="bg-rose-500 px-6 py-2 rounded-xl">Đăng Nhập</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-8">
      {/* Sidebar Info */}
      <div className="w-full md:w-80 flex-shrink-0 space-y-6">
        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 text-center shadow-2xl relative">
          <button onClick={handleLogout} className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 transition-colors" title="Đăng Xuất">
            <ArrowRightOnRectangleIcon className="w-6 h-6" />
          </button>
          
          <UserCircleIcon className="w-24 h-24 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white tracking-wide">{user.username}</h2>
          <p className="text-slate-400 mb-6">{user.email}</p>

          <div className="text-left space-y-4 border-t border-slate-700 pt-6">
            <div>
              <span className="text-xs text-slate-500 uppercase font-bold tracking-wider block mb-1">Số điện thoại</span>
              <span className="text-slate-300 font-medium">{user.phone || 'Chưa cập nhật'}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase font-bold tracking-wider block mb-1">Quyền</span>
              <span className="text-slate-300 font-medium bg-slate-800 px-2 py-0.5 rounded">{user.role || 'USER'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Booking History */}
      <div className="flex-1 bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-10 shadow-2xl">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-700 pb-4">
          <TicketIcon className="w-7 h-7 text-rose-500" />
          Lịch Sử Đặt Vé
        </h3>

        {bookings.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-400 mb-4">Bạn chưa có giao dịch nào.</p>
            <button onClick={() => navigate('/')} className="text-rose-500 font-medium hover:underline">
              Khám phá phim ngay
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map(booking => (
              <button
                key={booking.bookingId}
                type="button"
                onClick={() => openBookingDetail(booking)}
                className="w-full text-left bg-slate-800 rounded-2xl border border-slate-600 p-6 flex flex-col md:flex-row gap-6 hover:border-rose-500/50 transition-colors"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                    <span className="text-xs text-slate-400 font-mono">Mã Đặt Vé: {booking.bookingId}</span>
                    <h4 className="text-xl font-bold text-rose-400 mt-1">Giao dịch vé phim</h4>
                    </div>
                    <span className={`${getBookingStatusMeta(booking).className} px-3 py-1 rounded font-bold text-sm`}>
                      {getBookingStatusMeta(booking).label}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 text-sm gap-y-2">
                     <div>
                       <span className="text-slate-500 block">Ngày đặt</span>
                       <span className="text-slate-200">{booking.createdAt ? format(parseISO(booking.createdAt), 'HH:mm dd/MM/yyyy') : 'N/A'}</span>
                     </div>
                     <div>
                       <span className="text-slate-500 block">Tổng tiền</span>
                       <span className="text-rose-400 font-bold">{formatCurrency(booking.totalAmount)}</span>
                     </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/70 p-4 flex items-center justify-center" onClick={closeBookingDetail}>
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-700">
              <h4 className="text-xl font-bold text-white">Chi tiết giao dịch</h4>
              <button type="button" className="text-slate-400 hover:text-white" onClick={closeBookingDetail}>Dong</button>
            </div>

            {detailLoading ? (
              <div className="py-10 flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-rose-500"></div>
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 block">Mã đơn</span>
                    <span className="text-slate-200 font-mono">{selectedBooking.bookingCode || selectedBooking.bookingId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Trạng thái</span>
                    <span className={`${getBookingStatusMeta(selectedBooking).className} inline-block px-2 py-1 rounded font-semibold`}>
                      {getBookingStatusMeta(selectedBooking).label}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Thời gian đặt</span>
                    <span className="text-slate-200">{selectedBooking.createdAt ? format(parseISO(selectedBooking.createdAt), 'HH:mm dd/MM/yyyy') : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Thanh toán</span>
                    <span className="text-slate-200">{getPaymentMethodLabel(selectedBooking.paymentMethod)} - {selectedBooking.paymentStatus || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Phim</span>
                    <span className="text-slate-200">{bookingDetail?.film?.filmName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Phòng</span>
                    <span className="text-slate-200">{bookingDetail?.room?.name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Suất chiếu</span>
                    <span className="text-slate-200">
                      {bookingDetail?.showtime?.startTime
                        ? format(parseISO(bookingDetail.showtime.startTime), 'HH:mm dd/MM/yyyy')
                        : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Tổng tiền</span>
                    <span className="text-rose-400 font-bold">{formatCurrency(selectedBooking.totalAmount)}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block mb-2">Ghế đã đặt</span>
                  {bookingDetail?.seatLabels?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {bookingDetail.seatLabels.map((seatLabel) => (
                        <span key={seatLabel} className="px-2 py-1 rounded bg-slate-800 border border-slate-600 text-slate-200">
                          {seatLabel}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-300">N/A</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
