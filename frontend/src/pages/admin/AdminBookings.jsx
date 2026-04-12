import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { format, parseISO } from 'date-fns';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBooking, setEditingBooking] = useState(null);
  const [statusValue, setStatusValue] = useState('PENDING');
  const [paymentStatusValue, setPaymentStatusValue] = useState('PENDING');
  const [paymentMethodValue, setPaymentMethodValue] = useState('VNPAY');
  const [providerTxnIdValue, setProviderTxnIdValue] = useState('');
  const [updating, setUpdating] = useState(false);

  const bookingStatuses = ['PENDING', 'COMPLETED', 'CANCELLED', 'EXPIRED'];
  const paymentStatuses = ['PENDING', 'PAID', 'CANCELLED'];
  const paymentMethods = ['VNPAY', 'CARD', 'CASH'];

  const getStatusBadgeClass = (status) => {
    if (status === 'COMPLETED') return 'bg-green-500/10 text-green-500';
    if (status === 'CANCELLED') return 'bg-red-500/10 text-red-500';
    if (status === 'EXPIRED') return 'bg-slate-500/20 text-slate-300';
    return 'bg-amber-500/10 text-amber-500';
  };

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

  const openEdit = (booking) => {
    setEditingBooking(booking);
    setStatusValue(booking.status || 'PENDING');
    setPaymentStatusValue(booking.paymentStatus || 'PENDING');
    setPaymentMethodValue(booking.paymentMethod || 'VNPAY');
    setProviderTxnIdValue(booking.providerTxnId || '');
  };

  const closeEdit = () => {
    setEditingBooking(null);
    setStatusValue('PENDING');
    setPaymentStatusValue('PENDING');
    setPaymentMethodValue('VNPAY');
    setProviderTxnIdValue('');
    setUpdating(false);
  };

  const handleUpdateBooking = async (e) => {
    e.preventDefault();
    if (!editingBooking) return;

    setUpdating(true);
    try {
      const updated = await axiosClient.put(`/booking/${editingBooking.bookingId}`, {
        status: statusValue,
        paymentStatus: paymentStatusValue,
        paymentMethod: paymentMethodValue,
        providerTxnId: providerTxnIdValue
      });
      setBookings(prev => prev.map(b => b.bookingId === editingBooking.bookingId ? updated : b));
      closeEdit();
    } catch (err) {
      alert('Lỗi: ' + (err?.message || JSON.stringify(err)));
      setUpdating(false);
    }
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
                        getStatusBadgeClass(b.status)
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
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(b)}
                          className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-500/20 transition-colors"
                        >
                          Sửa
                        </button>
                        {b.status === 'PENDING' && (
                          <button onClick={() => handleCancel(b.bookingId)} className="px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-colors">Huỷ</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingBooking && (
        <div className="fixed inset-0 z-50 bg-black/70 p-4 flex items-center justify-center" onClick={closeEdit}>
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-4">Chỉnh sửa đơn đặt vé</h3>
            <p className="text-sm text-slate-400 mb-4 font-mono">{editingBooking.bookingCode || editingBooking.bookingId}</p>

            <form onSubmit={handleUpdateBooking} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Trạng thái booking</label>
                <select
                  value={statusValue}
                  onChange={(e) => setStatusValue(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-rose-500"
                >
                  {bookingStatuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Trạng thái thanh toán</label>
                <select
                  value={paymentStatusValue}
                  onChange={(e) => setPaymentStatusValue(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-rose-500"
                >
                  {paymentStatuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Phương thức thanh toán</label>
                <select
                  value={paymentMethodValue}
                  onChange={(e) => setPaymentMethodValue(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-rose-500"
                >
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Mã giao dịch cổng thanh toán</label>
                <input
                  value={providerTxnIdValue}
                  onChange={(e) => setProviderTxnIdValue(e.target.value)}
                  placeholder="VD: VNP123456"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 rounded-lg bg-rose-500 text-white font-semibold hover:bg-rose-600 disabled:opacity-60"
                >
                  {updating ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
