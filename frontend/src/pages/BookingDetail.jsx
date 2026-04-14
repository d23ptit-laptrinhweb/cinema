import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { format, parseISO } from 'date-fns';
import { ArrowLeftIcon, TicketIcon } from '@heroicons/react/24/outline';

const bookingStatusLabels = {
  PENDING: 'Chờ thanh toán',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  EXPIRED: 'Hết hạn',
};

const paymentStatusLabels = {
  PENDING: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  FAILED: 'Thất bại',
  CANCELLED: 'Đã hủy',
  EXPIRED: 'Hết hạn',
};

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(null);
  const [film, setFilm] = useState(null);
  const [room, setRoom] = useState(null);
  const [seats, setSeats] = useState([]);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const bookingRes = await axiosClient.get(`/booking/my-bookings/${id}`);
        setBooking(bookingRes);

        if (bookingRes?.filmId && bookingRes?.roomId) {
          const [filmRes, roomRes, seatsRes] = await Promise.all([
            axiosClient.get(`/film/${bookingRes.filmId}`).catch(() => null),
            axiosClient.get(`/room/${bookingRes.roomId}`).catch(() => null),
            axiosClient.get(`/seat/room/${bookingRes.roomId}`).catch(() => []),
          ]);

          setFilm(filmRes);
          setRoom(roomRes);
          setSeats(seatsRes || []);
        }
      } catch (err) {
        setError(err?.message || 'Không thể tải chi tiết vé.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="page-shell flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell py-20">
        <div className="card-soft p-10 text-center">
          <h2 className="mb-4 text-2xl font-black text-red-700">Không thể tải chi tiết vé</h2>
          <p className="mb-5 text-zinc-600">{error}</p>
          <button onClick={() => navigate('/my-bookings')} className="btn-primary">
            Quay lại lịch sử đặt vé
          </button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  const selectedSeats = (booking.tickets || [])
    .map((ticket) => {
      const seat = seats.find((item) => item.seatId === ticket.seatId);
      return {
        ...ticket,
        seatCode: seat?.seatCode || ticket.seatId,
        rowLabel: seat?.rowLabel || '',
        seatNumber: seat?.seatNumber || '',
        seatType: seat?.seatType || '',
      };
    })
    .filter(Boolean);

  const isExpiredBooking =
    booking?.status === 'PENDING' && booking?.expiresAt && new Date(booking.expiresAt).getTime() < Date.now();
  const bookingStatus = isExpiredBooking
    ? 'Hết hạn'
    : (bookingStatusLabels[booking.status] || booking.status);
  const paymentStatus = paymentStatusLabels[booking.paymentStatus] || booking.paymentStatus;

  return (
    <div className="page-shell py-6">
      <button
        onClick={() => navigate('/my-bookings')}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 transition hover:text-red-700"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        Quay lại lịch sử đặt vé
      </button>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="card-soft p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3 border-b border-zinc-200 pb-4">
            <TicketIcon className="h-7 w-7 text-red-600" />
            <div>
              <h1 className="text-2xl font-black text-zinc-900">Chi tiết vé</h1>
              <p className="text-sm text-zinc-500">Mã đặt vé: {booking.bookingCode}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Trạng thái đơn</p>
                <p className="mt-2 text-lg font-black text-zinc-900">{bookingStatus}</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Trạng thái thanh toán</p>
                <p className="mt-2 text-lg font-black text-zinc-900">{paymentStatus}</p>
              </div>
            </div>

            {film && (
              <div className="flex gap-4 border-b border-zinc-200 pb-5">
                <img src={film.thumnbnail_url} alt="Poster" className="w-24 rounded-xl border border-zinc-200 object-cover" />
                <div>
                  <h2 className="text-2xl font-black text-zinc-900">{film.filmName}</h2>
                  <p className="mt-1 text-zinc-600">{room?.name || 'Phòng chiếu'}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {booking?.showtimeStartTime ? format(parseISO(booking.showtimeStartTime), 'HH:mm - dd/MM/yyyy') : ''}
                  </p>
                </div>
              </div>
            )}

            <div>
              <h3 className="mb-3 text-lg font-black text-zinc-900">Danh sách ghế</h3>
              <div className="flex flex-wrap gap-2">
                {selectedSeats.length === 0 ? (
                  <span className="text-zinc-500">Chưa có ghế</span>
                ) : (
                  selectedSeats.map((seat) => (
                    <span key={seat.ticketId} className="rounded-md border border-red-200 bg-red-50 px-3 py-1 font-semibold text-red-700">
                      {seat.seatCode}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        <aside className="card-soft h-fit p-6">
          <h3 className="mb-4 text-xl font-black text-zinc-900">Thông tin giao dịch</h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-zinc-500">Mã đặt vé</span>
              <span className="text-right font-semibold text-zinc-900">{booking.bookingCode}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-zinc-500">Ngày tạo</span>
              <span className="text-right font-semibold text-zinc-900">
                {booking.createdAt ? format(parseISO(booking.createdAt), 'HH:mm dd/MM/yyyy') : '--'}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-zinc-500">Thanh toán lúc</span>
              <span className="text-right font-semibold text-zinc-900">
                {booking.paidAt ? format(parseISO(booking.paidAt), 'HH:mm dd/MM/yyyy') : '--'}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-zinc-500">Tổng tiền</span>
              <span className="text-right text-lg font-black text-red-700">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.totalAmount || 0)}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
