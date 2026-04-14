import { useEffect, useMemo, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

const seatTypes = ['STANDARD', 'VIP', 'COUPLE'];

const seatTypeLabels = {
  STANDARD: 'Ghế thường',
  VIP: 'Ghế VIP',
  COUPLE: 'Ghế đôi',
};

export default function AdminRoomSeats() {
  const [branches, setBranches] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingSeat, setEditingSeat] = useState(null);
  const [formData, setFormData] = useState({
    seatCode: '',
    rowLabel: '',
    seatNumber: 1,
    seatType: 'STANDARD',
    isActive: true,
  });

  const filteredRooms = useMemo(() => {
    if (!selectedBranchId) return [];
    return rooms.filter((room) => room.branchId === selectedBranchId);
  }, [rooms, selectedBranchId]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!selectedBranchId) {
      setSelectedRoomId('');
      setSeats([]);
      return;
    }

    const roomExists = filteredRooms.some((room) => String(room.id) === String(selectedRoomId));
    if (!roomExists) {
      setSelectedRoomId('');
      setSeats([]);
    }
  }, [selectedBranchId, filteredRooms, selectedRoomId]);

  useEffect(() => {
    if (!selectedRoomId) {
      setSeats([]);
      return;
    }
    fetchSeatsByRoom(selectedRoomId);
  }, [selectedRoomId]);

  const fetchInitialData = async () => {
    try {
      const [branchRes, roomRes] = await Promise.allSettled([
        axiosClient.get('/branch'),
        axiosClient.get('/room'),
      ]);

      const branchList = branchRes.status === 'fulfilled' && Array.isArray(branchRes.value) ? branchRes.value : [];
      const roomList = roomRes.status === 'fulfilled' && Array.isArray(roomRes.value) ? roomRes.value : [];

      setBranches(branchList);
      setRooms(roomList);

      if (branchList.length > 0) {
        setSelectedBranchId(branchList[0].branchId);
      }
    } catch (error) {
      console.error(error);
      alert('Không thể tải dữ liệu ghế.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSeatsByRoom = async (roomId) => {
    try {
      const res = await axiosClient.get(`/seat/room/${roomId}`);
      setSeats(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error(error);
      setSeats([]);
      alert('Không thể tải danh sách ghế của phòng này.');
    }
  };

  const openCreate = () => {
    if (!selectedRoomId) {
      alert('Vui lòng chọn phòng trước khi thêm ghế.');
      return;
    }
    setEditingSeat(null);
    setFormData({
      seatCode: '',
      rowLabel: '',
      seatNumber: 1,
      seatType: 'STANDARD',
      isActive: true,
    });
    setShowModal(true);
  };

  const openEdit = (seat) => {
    setEditingSeat(seat);
    setFormData({
      seatCode: seat.seatCode || '',
      rowLabel: seat.rowLabel || '',
      seatNumber: seat.seatNumber || 1,
      seatType: seat.seatType || 'STANDARD',
      isActive: Boolean(seat.isActive),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRoomId) {
      alert('Vui lòng chọn phòng.');
      return;
    }

    const payload = {
      roomId: Number(selectedRoomId),
      seatCode: formData.seatCode.trim(),
      rowLabel: formData.rowLabel.trim(),
      seatNumber: Number(formData.seatNumber),
      seatType: formData.seatType,
      isActive: formData.isActive,
    };

    if (!payload.seatCode || !payload.rowLabel) {
      alert('Vui lòng nhập đầy đủ mã ghế và hàng ghế.');
      return;
    }

    if (Number.isNaN(payload.seatNumber) || payload.seatNumber < 1) {
      alert('Số ghế phải lớn hơn hoặc bằng 1.');
      return;
    }

    try {
      if (editingSeat) {
        await axiosClient.put(`/seat/${editingSeat.seatId}`, payload);
      } else {
        await axiosClient.post('/seat', payload);
      }
      setShowModal(false);
      await fetchSeatsByRoom(selectedRoomId);
    } catch (error) {
      alert('Lỗi: ' + (error?.message || JSON.stringify(error)));
    }
  };

  const handleDelete = async (seatId) => {
    if (!confirm('Bạn có chắc muốn xoá ghế này?')) return;
    try {
      await axiosClient.delete(`/seat/${seatId}`);
      await fetchSeatsByRoom(selectedRoomId);
    } catch (error) {
      alert('Lỗi: ' + (error?.message || JSON.stringify(error)));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-bold">Quản lý ghế theo phòng</h2>
          <p className="mt-1 text-sm text-zinc-600">Chọn chi nhánh và phòng để tạo hoặc chỉnh sửa từng ghế.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 font-medium text-white transition hover:bg-red-700"
        >
          <PlusIcon className="h-5 w-5" />
          Thêm ghế
        </button>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-zinc-600">Chi nhánh</label>
          <select
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-red-500 focus:outline-none"
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
          >
            <option value="">-- Chọn chi nhánh --</option>
            {branches.map((branch) => (
              <option key={branch.branchId} value={branch.branchId}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-zinc-600">Phòng</label>
          <select
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-red-500 focus:outline-none"
            value={selectedRoomId}
            onChange={(e) => setSelectedRoomId(e.target.value)}
            disabled={!selectedBranchId}
          >
            <option value="">-- Chọn phòng --</option>
            {filteredRooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.code} - {room.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-zinc-500">
                <th className="px-4 py-3">Mã ghế</th>
                <th className="px-4 py-3">Hàng</th>
                <th className="px-4 py-3">Số ghế</th>
                <th className="px-4 py-3">Loại ghế</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {!selectedRoomId ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-zinc-500">
                    Vui lòng chọn phòng để xem danh sách ghế.
                  </td>
                </tr>
              ) : seats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-zinc-500">
                    Phòng này chưa có ghế.
                  </td>
                </tr>
              ) : (
                seats
                  .slice()
                  .sort((a, b) => {
                    const rowCompare = String(a.rowLabel || '').localeCompare(String(b.rowLabel || ''));
                    if (rowCompare !== 0) return rowCompare;
                    return Number(a.seatNumber || 0) - Number(b.seatNumber || 0);
                  })
                  .map((seat) => (
                    <tr key={seat.seatId} className="border-b border-zinc-100 transition hover:bg-zinc-50">
                      <td className="px-4 py-3 font-mono text-xs text-zinc-700">{seat.seatCode}</td>
                      <td className="px-4 py-3 text-zinc-700">{seat.rowLabel}</td>
                      <td className="px-4 py-3 text-zinc-700">{seat.seatNumber}</td>
                      <td className="px-4 py-3 text-zinc-700">{seatTypeLabels[seat.seatType] || seat.seatType}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                            seat.isActive ? 'bg-green-500/10 text-green-600' : 'bg-zinc-500/10 text-zinc-600'
                          }`}
                        >
                          {seat.isActive ? 'Đang dùng' : 'Ngưng dùng'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(seat)}
                            className="rounded-lg p-2 text-zinc-500 transition hover:bg-sky-50 hover:text-sky-600"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(seat.seatId)}
                            className="rounded-lg p-2 text-zinc-500 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-zinc-900">{editingSeat ? 'Sửa ghế' : 'Thêm ghế'}</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 transition hover:text-zinc-900">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-zinc-600">Mã ghế *</label>
                  <input
                    required
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-red-500 focus:outline-none"
                    value={formData.seatCode}
                    onChange={(e) => setFormData((prev) => ({ ...prev, seatCode: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-zinc-600">Hàng ghế *</label>
                  <input
                    required
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-red-500 focus:outline-none"
                    value={formData.rowLabel}
                    onChange={(e) => setFormData((prev) => ({ ...prev, rowLabel: e.target.value.toUpperCase() }))}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm text-zinc-600">Số ghế *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-red-500 focus:outline-none"
                    value={formData.seatNumber}
                    onChange={(e) => setFormData((prev) => ({ ...prev, seatNumber: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-zinc-600">Loại ghế</label>
                  <select
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-red-500 focus:outline-none"
                    value={formData.seatType}
                    onChange={(e) => setFormData((prev) => ({ ...prev, seatType: e.target.value }))}
                  >
                    {seatTypes.map((type) => (
                      <option key={type} value={type}>
                        {seatTypeLabels[type] || type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-zinc-600">Trạng thái</label>
                  <select
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-red-500 focus:outline-none"
                    value={formData.isActive ? 'ACTIVE' : 'INACTIVE'}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.value === 'ACTIVE' }))}
                  >
                    <option value="ACTIVE">Đang dùng</option>
                    <option value="INACTIVE">Ngưng dùng</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-zinc-200 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl bg-zinc-100 px-5 py-2.5 text-zinc-600 transition hover:text-zinc-900"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-red-600 px-5 py-2.5 font-medium text-white transition hover:bg-red-700"
                >
                  {editingSeat ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
