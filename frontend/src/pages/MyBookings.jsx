import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { format, parseISO } from 'date-fns';
import { TicketIcon } from '@heroicons/react/24/outline';

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const bookingRes = await axiosClient.get('/booking/my-bookings/list');
        setBookings(bookingRes || []);
      } catch (error) {
        setErrorMsg(error?.message || 'Không thể tải lịch sử đặt vé.');
        if (error?.code === 401 || String(error).includes('401') || error?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          navigate('/login');
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate]);

  const sortedBookings = [...bookings].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });

  if (loading) {
    return (
      <div className="page-shell flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-red-600"></div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="page-shell py-20">
        <div className="card-soft p-10 text-center">
          <h2 className="mb-4 text-2xl font-black text-red-700">Không thể tải lịch sử đặt vé</h2>
          <p className="mb-5 text-zinc-600">Chi tiết: {errorMsg}</p>
          <button onClick={() => navigate('/')} className="btn-primary">Về trang chủ</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell py-6">
      <div className="card-soft p-6 md:p-10">
        <h3 className="mb-6 flex items-center gap-2 border-b border-zinc-200 pb-4 text-2xl font-black text-zinc-900">
          <TicketIcon className="h-7 w-7 text-red-600" />
          Vé của tôi
        </h3>

        {sortedBookings.length === 0 ? (
          <div className="py-10 text-center">
            <p className="mb-4 text-zinc-600">Bạn chưa có giao dịch nào.</p>
            <button onClick={() => navigate('/')} className="font-semibold text-red-700 hover:text-red-800">
              Khám phá phim ngay
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedBookings.map((booking) => (
              <button
                key={booking.bookingId}
                onClick={() => navigate(`/booking/history/${booking.bookingId}`)}
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-left transition hover:border-red-300 hover:bg-red-50/40"
              >
                <div className="flex-1 space-y-2">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs text-zinc-500">Mã đặt vé: {booking.bookingCode || booking.bookingId}</span>
                      <h4 className="mt-1 text-xl font-black text-zinc-900">Giao dịch vé phim</h4>
                    </div>

                    <span className="rounded border border-amber-300 bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700">{booking.status}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div>
                      <span className="block text-zinc-500">Ngày đặt</span>
                      <span className="text-zinc-800">
                        {booking.createdAt ? format(parseISO(booking.createdAt), 'HH:mm dd/MM/yyyy') : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-zinc-500">Tổng tiền</span>
                      <span className="font-bold text-red-700">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.totalAmount || 0)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 border-t border-zinc-200 pt-3 text-sm text-zinc-600">
                    Số vé: <span className="font-semibold text-zinc-900">{booking.tickets?.length || 0}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
