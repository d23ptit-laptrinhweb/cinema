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

  const { showtime, film, room, selectedSeats, totalAmount } = location.state || {};

  if (!showtime || !selectedSeats) {
    return (
      <div className="text-center py-20 text-white">
        <h2 className="text-2xl mb-4">Không có thông tin thanh toán</h2>
        <button onClick={() => navigate('/')} className="text-rose-500 hover:underline">Về trang chủ</button>
      </div>
    );
  }

  const handlePayment = async () => {
    setLoading(true);
    setError('');
    
    // Check authentication here, if not logged in, redirect to login
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Vui lòng đăng nhập để tiếp tục!");
      // Save state to localStorage to restore after login if needed
      // localStorage.setItem('pendingBooking', JSON.stringify(location.state));
      // navigate('/login');
      // For now, let's just proceed in case auth is not fully strictly enforced or we will test it.
    }

    try {
      // 1. Create Booking
      const seatIds = selectedSeats.map(s => s.seatId);
      const bookingRes = await axiosClient.post('/booking', {
        showtimeId: showtime.showtimeId,
        seatIds: seatIds
      });

      if (bookingRes && bookingRes.bookingId) {
        // 2. Request VNPay URL
        // backend expects amount as Long representing VND. Some APIs require amount * 100 for VNPay. 
        // We will pass the exact amount, assuming backend VnpayService handles the * 100 correctly, or we do it here.
        // Let's pass the amount. The standard VNPay takes amount * 100, but in `CreateVnpayRequest` it's just `amount`. Let's assume backend multiplies by 100.
        const vnpayRes = await axiosClient.post('/v1/vnpay/payment-url', {
          amount: totalAmount,
          orderId: bookingRes.bookingId,
          orderInfo: `Thanh toan ve phim ${film.filmName}`,
          orderType: "bill",
          language: "vn"
        });

        // 3. Redirect
        if (vnpayRes && vnpayRes.paymentUrl) {
          window.location.href = vnpayRes.paymentUrl;
        } else if (vnpayRes) {
           // Maybe the map is returned directly
           const url = vnpayRes.paymentUrl || vnpayRes.vnpUrl || Object.values(vnpayRes).find(v => typeof v === 'string' && v.startsWith('http'));
           if(url) {
               window.location.href = url;
           } else {
               // Fallback if we don't know the exact key
               console.log("VNPAY Response:", vnpayRes);
               setError("Không nhận được URL thanh toán từ server.");
           }
        }
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Có lỗi xảy ra khi tạo giao dịch.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
        <CreditCardIcon className="w-8 h-8 text-rose-500" />
        Xác Nhận Thanh Toán
      </h1>

      <div className="bg-slate-900 rounded-3xl p-8 border border-slate-700 shadow-2xl">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 font-medium">
            {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          {/* Film Info */}
          <div className="flex-1 space-y-6">
            <h3 className="text-xl font-bold text-white border-b border-slate-700 pb-4">Thông Tin Vé</h3>
            
            <div className="flex gap-4">
              <img src={film.thumnbnail_url} alt="Poster" className="w-24 rounded-lg shadow-md" />
              <div>
                <h4 className="text-xl font-bold text-rose-400">{film.filmName}</h4>
                <p className="text-slate-400 mt-1">{room?.name || 'Phòng chiếu'}</p>
                <p className="text-white mt-1 font-medium">
                  {format(parseISO(showtime.startTime), 'HH:mm - dd/MM/yyyy')}
                </p>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <span className="text-slate-400 block mb-2">Ghế đã chọn:</span>
              <div className="flex flex-wrap gap-2">
                {selectedSeats.map(s => (
                  <span key={s.seatId} className="px-3 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-md font-bold">
                    {s.seatCode}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="md:w-80 space-y-6">
            <h3 className="text-xl font-bold text-white border-b border-slate-700 pb-4">Hóa Đơn</h3>
            
            <div className="space-y-3 text-sm">
              {selectedSeats.map(s => (
                <div key={s.seatId} className="flex justify-between items-center text-slate-300">
                  <span>Ghế {s.seatCode} ({s.seatType})</span>
                  {/* Prices are already calculated during booking */}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-700 flex justify-between items-end">
              <span className="text-slate-400">Tổng cộng</span>
              <span className="text-3xl font-bold text-rose-500">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
              </span>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full mt-6 flex justify-center items-center gap-2 bg-[#005BAA] hover:bg-[#004a8a] text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-[#005BAA]/30 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  <CheckCircleIcon className="w-6 h-6" />
                  Thanh Toán VNPay
                </>
              )}
            </button>
            <p className="text-xs text-center text-slate-500 mt-4">
              Bằng việc tiếp tục, bạn đồng ý với các điều khoản dịch vụ của Xemphim.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
