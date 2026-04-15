import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { format, parseISO } from 'date-fns';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 1, size: 10, totalElements: 0, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [bookingCodeFilter, setBookingCodeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ status: 'PENDING', paymentStatus: 'PENDING' });
  const [saving, setSaving] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const params = { page, size };
        if (bookingCodeFilter.trim()) {
          params.bookingCode = bookingCodeFilter.trim();
        }
        if (dateFilter) {
          params.date = dateFilter;
        }

        const res = await axiosClient.get('/booking', { params });
        setBookings(res?.data || []);
        setPageInfo({
          page: res?.page || 1,
          size: res?.size || size,
          totalElements: res?.totalElements || 0,
          totalPages: res?.totalPages || 0,
        });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchBookings();
  }, [page, size, bookingCodeFilter, dateFilter]);

  const beginEdit = (booking) => {
    setEditingId(booking.bookingId);
    setEditForm({
      status: booking.status || 'PENDING',
      paymentStatus: booking.paymentStatus || 'PENDING',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ status: 'PENDING', paymentStatus: 'PENDING' });
  };

  const saveEdit = async (id) => {
    setSaving(true);
    try {
      const updated = await axiosClient.put(`/booking/${id}`, editForm);
      setBookings((prev) => prev.map((b) => (b.bookingId === id ? updated : b)));
      setEditingId(null);
    } catch (err) {
      alert('Lỗi cập nhật: ' + (err?.message || JSON.stringify(err)));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Bạn chắc chắn muốn huỷ đơn này?')) return;
    try {
      await axiosClient.delete(`/booking/${id}`);
      setBookings(prev => prev.map(b => b.bookingId === id ? { ...b, status: 'CANCELLED' } : b));
    } catch (err) { alert('Lỗi: ' + (err?.message || JSON.stringify(err))); }
  };

  const handleViewDetail = async (id) => {
    setShowDetailModal(true);
    setDetailLoading(true);
    setDetailError('');
    setSelectedBooking(null);

    try {
      const detail = await axiosClient.get(`/booking/${id}`);
      setSelectedBooking(detail);
    } catch (err) {
      setDetailError(err?.message || 'Không thể tải chi tiết booking.');
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-red-600"></div></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Tất cả đơn đặt vé ({pageInfo.totalElements})</h2>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <input
          value={bookingCodeFilter}
          onChange={(e) => {
            setPage(1);
            setBookingCodeFilter(e.target.value);
          }}
          placeholder="Tìm theo mã booking"
          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-red-500"
        />
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => {
            setPage(1);
            setDateFilter(e.target.value);
          }}
          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-red-500"
        />
        <button
          onClick={() => {
            setPage(1);
            setBookingCodeFilter('');
            setDateFilter('');
          }}
          className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
        >
          Xóa bộ lọc
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-zinc-500">
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
                <tr><td colSpan={7} className="py-8 text-center text-zinc-500">Chưa có đơn đặt vé</td></tr>
              ) : (
                bookings.map(b => (
                  <tr key={b.bookingId} className="border-b border-zinc-100 transition hover:bg-zinc-50">
                    <td className="px-4 py-3 font-mono text-xs text-zinc-600">{b.bookingCode || b.bookingId?.slice(0, 12)}</td>
                    <td className="px-4 py-3 text-zinc-600">{b.userId?.slice(0, 8)}...</td>
                    <td className="px-4 py-3">
                      {editingId === b.bookingId ? (
                        <select
                          value={editForm.status}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                          className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs font-semibold text-zinc-800"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                          <option value="EXPIRED">EXPIRED</option>
                        </select>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          b.status === 'COMPLETED' ? 'bg-green-500/10 text-green-600' :
                          b.status === 'EXPIRED' ? 'bg-zinc-500/10 text-zinc-600' :
                          b.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500' :
                          'bg-amber-500/10 text-amber-500'
                        }`}>{b.status}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === b.bookingId ? (
                        <select
                          value={editForm.paymentStatus}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, paymentStatus: e.target.value }))}
                          className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs font-semibold text-zinc-800"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PAID">PAID</option>
                          <option value="CANCELLED">CANCELLED</option>
                          <option value="EXPIRED">EXPIRED</option>
                        </select>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          b.paymentStatus === 'PAID' ? 'bg-green-500/10 text-green-600' :
                          b.paymentStatus === 'EXPIRED' ? 'bg-zinc-500/10 text-zinc-600' :
                          b.paymentStatus === 'CANCELLED' ? 'bg-red-500/10 text-red-500' :
                          'bg-amber-500/10 text-amber-500'
                        }`}>{b.paymentStatus || 'N/A'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold text-red-700">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(b.totalAmount || 0)}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {b.createdAt ? format(parseISO(b.createdAt), 'HH:mm dd/MM/yyyy') : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {editingId === b.bookingId ? (
                          <>
                            <button
                              onClick={() => saveEdit(b.bookingId)}
                              disabled={saving}
                              className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                            >
                              {saving ? 'Đang lưu...' : 'Lưu'}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-3 py-1.5 bg-zinc-200 text-zinc-700 rounded-lg text-xs font-bold hover:bg-zinc-300 transition-colors"
                            >
                              Hủy sửa
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleViewDetail(b.bookingId)}
                              className="px-3 py-1.5 bg-zinc-500/10 text-zinc-700 rounded-lg text-xs font-bold hover:bg-zinc-500/20 transition-colors"
                            >
                              Xem
                            </button>
                            <button
                              onClick={() => beginEdit(b)}
                              className="px-3 py-1.5 bg-blue-500/10 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-500/20 transition-colors"
                            >
                              Sửa
                            </button>
                            {b.status === 'PENDING' && (
                              <button onClick={() => handleCancel(b.bookingId)} className="px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-colors">Huỷ</button>
                            )}
                          </>
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

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-zinc-600">
          Trang {pageInfo.page} / {Math.max(pageInfo.totalPages, 1)}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page <= 1}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-semibold text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Trước
          </button>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, Math.max(pageInfo.totalPages, 1)))}
            disabled={page >= Math.max(pageInfo.totalPages, 1)}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-semibold text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </div>

      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowDetailModal(false)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between border-b border-zinc-200 pb-3">
              <h3 className="text-lg font-black text-zinc-900">Chi tiết booking</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                Đóng
              </button>
            </div>

            {detailLoading ? (
              <div className="flex min-h-[180px] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-red-600"></div>
              </div>
            ) : detailError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                {detailError}
              </div>
            ) : selectedBooking ? (
              <div className="space-y-4 text-sm">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                    <p className="text-zinc-500">Mã booking</p>
                    <p className="font-semibold text-zinc-900">{selectedBooking.bookingCode || selectedBooking.bookingId}</p>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                    <p className="text-zinc-500">Người dùng</p>
                    <p className="font-semibold text-zinc-900">{selectedBooking.userId || 'N/A'}</p>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                    <p className="text-zinc-500">Trạng thái đơn</p>
                    <p className="font-semibold text-zinc-900">{selectedBooking.status || 'N/A'}</p>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                    <p className="text-zinc-500">Trạng thái thanh toán</p>
                    <p className="font-semibold text-zinc-900">{selectedBooking.paymentStatus || 'N/A'}</p>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                    <p className="text-zinc-500">Suất chiếu</p>
                    <p className="font-semibold text-zinc-900">{selectedBooking.showtimeId || 'N/A'}</p>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                    <p className="text-zinc-500">Tổng tiền</p>
                    <p className="font-semibold text-red-700">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedBooking.totalAmount || 0)}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-zinc-500">Ngày tạo</p>
                    <p className="font-semibold text-zinc-900">
                      {selectedBooking.createdAt ? format(parseISO(selectedBooking.createdAt), 'HH:mm dd/MM/yyyy') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Thanh toán lúc</p>
                    <p className="font-semibold text-zinc-900">
                      {selectedBooking.paidAt ? format(parseISO(selectedBooking.paidAt), 'HH:mm dd/MM/yyyy') : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200 p-3">
                  <p className="mb-2 font-semibold text-zinc-900">Danh sách vé ({selectedBooking.tickets?.length || 0})</p>
                  {selectedBooking.tickets?.length ? (
                    <div className="space-y-2">
                      {selectedBooking.tickets.map((ticket) => (
                        <div key={ticket.ticketId} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2">
                          <span className="text-zinc-700">Ghế: {ticket.seatId}</span>
                          <span className="font-semibold text-zinc-900">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(ticket.price || 0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-500">Không có dữ liệu vé.</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
