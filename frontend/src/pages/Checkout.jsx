import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { CreditCardIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { format, parseISO } from 'date-fns';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingCode, setBookingCode] = useState('');

  const { showtime, film, room, selectedSeats, totalAmount } = location.state || {};

  if (!showtime || !selectedSeats) {
    return (
      <div className="page-shell py-20 text-center">
        <div className="card-soft p-10">
          <h2 className="mb-4 text-2xl font-black text-zinc-900">Không có thông tin thanh toán</h2>
          <button onClick={() => navigate('/')} className="font-semibold text-red-700 hover:text-red-800">
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const handlePayment = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { redirectAfterLogin: '/checkout', checkoutState: location.state } });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const seatIds = selectedSeats.map((s) => s.seatId);
      const bookingRes = await axiosClient.post('/booking', {
        showtimeId: showtime.showtimeId,
        seatIds,
      });

      if (!bookingRes?.bookingCode) {
        setError('Không tạo được đơn đặt vé. Vui lòng thử lại.');
        return;
      }

      setBookingCode(bookingRes.bookingCode);

      const vnpayRes = await axiosClient.post('/v1/vnpay/payment-url', {
        amount: Math.round(Number(totalAmount || 0)),
        orderId: bookingRes.bookingCode,
        orderInfo: `Thanh toan ve phim ${film.filmName}`,
        orderType: 'billpayment',
        language: 'vn',
      });

      const paymentUrl =
        vnpayRes?.paymentUrl ||
        vnpayRes?.vnpUrl ||
        Object.values(vnpayRes || {}).find((v) => typeof v === 'string' && v.startsWith('http'));

      if (paymentUrl) {
        window.location.href = paymentUrl;
        return;
      }

      setError('Không nhận được đường dẫn thanh toán VNPay.');
    } catch (err) {
      setError(err?.message || 'Có lỗi xảy ra khi tạo giao dịch.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell py-6">
      <div className="mb-6 flex items-center gap-3">
        <CreditCardIcon className="h-8 w-8 text-red-600" />
        <h1 className="text-3xl font-black text-zinc-900">Xác nhận thanh toán</h1>
      </div>

      <div className="card-soft p-6 md:p-8">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 font-medium text-red-700">
            {error}
          </div>
        )}

        {bookingCode && (
          <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
            Mã giao dịch: <span className="font-bold">{bookingCode}</span>
          </div>
        )}

        <div className="flex flex-col gap-8 md:flex-row">
          <div className="flex-1 space-y-6">
            <h3 className="border-b border-zinc-200 pb-4 text-xl font-black text-zinc-900">Thông tin vé</h3>
            
            <div className="flex gap-4">
              <img src={film.thumnbnail_url} alt="Poster" className="w-24 rounded-lg border border-zinc-200" />
              <div>
                <h4 className="text-xl font-black text-zinc-900">{film.filmName}</h4>
                <p className="mt-1 text-zinc-600">{room?.name || 'Phòng chiếu'}</p>
                <p className="mt-1 font-semibold text-zinc-800">
                  {format(parseISO(showtime.startTime), 'HH:mm - dd/MM/yyyy')}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <span className="mb-2 block text-zinc-600">Ghế đã chọn:</span>
              <div className="flex flex-wrap gap-2">
                {selectedSeats.map((s) => (
                  <span key={s.seatId} className="rounded-md border border-red-200 bg-red-50 px-3 py-1 font-bold text-red-700">
                    {s.seatCode}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="md:w-80 space-y-6">
            <h3 className="border-b border-zinc-200 pb-4 text-xl font-black text-zinc-900">Hóa đơn</h3>
            
            <div className="space-y-3 text-sm">
              {selectedSeats.map((s) => (
                <div key={s.seatId} className="flex items-center justify-between text-zinc-700">
                  <span>Ghế {s.seatCode} ({s.seatType})</span>
                </div>
              ))}
            </div>

            <div className="flex items-end justify-between border-t border-zinc-200 pt-4">
              <span className="text-zinc-600">Tổng cộng</span>
              <span className="text-3xl font-black text-red-700">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
              </span>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="btn-primary mt-6 w-full"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
              ) : (
                <>
                  <CheckCircleIcon className="h-6 w-6" />
                  Thanh toán VNPay
                </>
              )}
            </button>
            <p className="mt-4 text-center text-xs text-zinc-500">
              Tiếp tục đồng nghĩa với việc bạn đồng ý điều khoản sử dụng của Xemphim.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
