import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { format, parseISO } from 'date-fns';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axiosClient.get('/booking');
        setBookings(res || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!confirm('Bạn chắc chắn muốn huỷ đơn này?')) return;
    try {
      await axiosClient.delete(`/booking/${id}`);
      setBookings(prev => prev.map(b => b.bookingId === id ? { ...b, status: 'CANCELLED' } : b));
    } catch (err) { alert('Lỗi: ' + (err?.message || JSON.stringify(err))); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Tất cả đơn đặt vé ({bookings.length})</h2>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-800">
                <th className="px-4 py-3">Mã đơn</th>
                <th className="px-4 py-3">Người dùng</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Thanh toán</th>
                <th className="px-4 py-3">Tổng tiền</th>
                <th className="px-4 py-3">Ngày tạo</th>
                <th className="px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-500">Chưa có đơn đặt vé</td></tr>
              ) : (
                bookings.map(b => (
                  <tr key={b.bookingId} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">{b.bookingCode || b.bookingId?.slice(0, 12)}</td>
                    <td className="px-4 py-3 text-slate-300">{b.userId?.slice(0, 8)}...</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        b.status === 'CONFIRMED' ? 'bg-green-500/10 text-green-500' :
                        b.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500' :
                        'bg-amber-500/10 text-amber-500'
                      }`}>{b.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        b.paymentStatus === 'PAID' ? 'bg-green-500/10 text-green-500' :
                        b.paymentStatus === 'CANCELLED' ? 'bg-red-500/10 text-red-500' :
                        'bg-amber-500/10 text-amber-500'
                      }`}>{b.paymentStatus || 'N/A'}</span>
                    </td>
                    <td className="px-4 py-3 text-rose-400 font-bold">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(b.totalAmount || 0)}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {b.createdAt ? format(parseISO(b.createdAt), 'HH:mm dd/MM/yyyy') : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      {b.status === 'PENDING' && (
                        <button onClick={() => handleCancel(b.bookingId)} className="px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-colors">Huỷ</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
