import { useEffect, useMemo, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { PlusIcon, XMarkIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

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

  // Seat action panel (click on seat in map)
  const [activeSeat, setActiveSeat] = useState(null); // seat clicked in map

  // Modal for create / edit
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

  // Build grid rows from seats
  const seatRows = useMemo(() => {
    const rowMap = {};
    seats.forEach((seat) => {
      const row = seat.rowLabel;
      if (!rowMap[row]) rowMap[row] = [];
      rowMap[row].push(seat);
    });
    const sortedKeys = Object.keys(rowMap).sort();
    sortedKeys.forEach((row) => {
      rowMap[row].sort((a, b) => Number(a.seatNumber) - Number(b.seatNumber));
    });
    return { rowMap, sortedKeys };
  }, [seats]);

  const openCreate = () => {
    if (!selectedRoomId) {
      alert('Vui lòng chọn phòng trước khi thêm ghế.');
      return;
    }
    setEditingSeat(null);
    setFormData({ seatCode: '', rowLabel: '', seatNumber: 1, seatType: 'STANDARD', isActive: true });
    setShowModal(true);
  };

  const openEdit = (seat) => {
    setActiveSeat(null);
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
    if (!selectedRoomId) { alert('Vui lòng chọn phòng.'); return; }

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
      setActiveSeat(null);
      await fetchSeatsByRoom(selectedRoomId);
    } catch (error) {
      alert('Lỗi: ' + (error?.message || JSON.stringify(error)));
    }
  };

  const getSeatStyle = (seat) => {
    const base = 'flex h-9 w-9 items-center justify-center rounded-md text-xs font-bold transition cursor-pointer select-none';
    if (!seat.isActive) return `${base} border border-zinc-300 bg-zinc-200 text-zinc-400 cursor-not-allowed`;
    if (activeSeat?.seatId === seat.seatId) return `${base} border-2 border-red-600 bg-red-600 text-white scale-110 shadow-lg`;
    if (seat.seatType === 'VIP') return `${base} border border-amber-400 bg-amber-50 text-amber-700 hover:bg-amber-100`;
    if (seat.seatType === 'COUPLE') return `${base} w-[72px] border border-fuchsia-300 bg-fuchsia-50 text-fuchsia-700 hover:bg-fuchsia-100`;
    return `${base} border border-zinc-300 bg-white text-zinc-700 hover:border-blue-400 hover:bg-blue-50`;
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
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-bold">Quản lý ghế theo phòng</h2>
          <p className="mt-1 text-sm text-zinc-600">Chọn phòng, nhấn vào ghế để chỉnh sửa hoặc xoá.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 font-medium text-white transition hover:bg-red-700"
        >
          <PlusIcon className="h-5 w-5" />
          Thêm ghế
        </button>
      </div>

      {/* Filters */}
      <div className="mb-5 grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-zinc-600">Chi nhánh</label>
          <select
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-red-500 focus:outline-none"
            value={selectedBranchId}
            onChange={(e) => { setSelectedBranchId(e.target.value); setActiveSeat(null); }}
          >
            <option value="">-- Chọn chi nhánh --</option>
            {branches.map((branch) => (
              <option key={branch.branchId} value={branch.branchId}>{branch.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">Phòng</label>
          <select
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-red-500 focus:outline-none"
            value={selectedRoomId}
            onChange={(e) => { setSelectedRoomId(e.target.value); setActiveSeat(null); }}
            disabled={!selectedBranchId}
          >
            <option value="">-- Chọn phòng --</option>
            {filteredRooms.map((room) => (
              <option key={room.id} value={room.id}>{room.code} - {room.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Seat Map + Action Panel */}
      {!selectedRoomId ? (
        <div className="rounded-2xl border border-zinc-200 bg-white py-16 text-center text-zinc-500 shadow-sm">
          Vui lòng chọn phòng để xem sơ đồ ghế.
        </div>
      ) : seats.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white py-16 text-center text-zinc-500 shadow-sm">
          Phòng này chưa có ghế nào.
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
          {/* Seat map */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            {/* Screen */}
            <div className="mb-8 text-center">
              <div className="mx-auto h-10 w-full max-w-md rounded-t-[50%] border-t-4 border-red-400/60 bg-gradient-to-b from-red-100 to-transparent">
                <span className="relative top-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Màn hình</span>
              </div>
            </div>

            <div className="hide-scrollbar flex flex-col items-center gap-2.5 overflow-x-auto pb-4">
              {seatRows.sortedKeys.map((row) => (
                <div key={row} className="flex items-center gap-2">
                  <div className="w-6 text-center text-sm font-bold text-zinc-400">{row}</div>
                  <div className="flex gap-1.5">
                    {seatRows.rowMap[row].map((seat) => (
                      <button
                        key={seat.seatId}
                        className={getSeatStyle(seat)}
                        onClick={() => setActiveSeat(activeSeat?.seatId === seat.seatId ? null : seat)}
                        title={`${seat.seatCode} — ${seatTypeLabels[seat.seatType] || seat.seatType}`}
                      >
                        {seat.seatNumber}
                      </button>
                    ))}
                  </div>
                  <div className="w-6 text-center text-sm font-bold text-zinc-400">{row}</div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-5 flex flex-wrap justify-center gap-4 border-t border-zinc-100 pt-5 text-xs text-zinc-500">
              <div className="flex items-center gap-1.5">
                <div className="h-4 w-4 rounded border border-zinc-300 bg-white" />
                <span>Thường</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-4 w-4 rounded border border-amber-400 bg-amber-50" />
                <span>VIP</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-4 w-7 rounded border border-fuchsia-300 bg-fuchsia-50" />
                <span>Couple</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-4 w-4 rounded border border-red-600 bg-red-600" />
                <span>Đang chọn</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-4 w-4 rounded border border-zinc-300 bg-zinc-200" />
                <span>Ngưng dùng</span>
              </div>
            </div>
          </div>

          {/* Action panel */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm h-fit lg:sticky lg:top-24">
            {!activeSeat ? (
              <div className="py-8 text-center text-sm text-zinc-400">
                <div className="mb-2 text-3xl"></div>
                Nhấn vào ghế để xem chi tiết và chỉnh sửa
              </div>
            ) : (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-zinc-900">Ghế {activeSeat.seatCode}</h3>
                  <button
                    onClick={() => setActiveSeat(null)}
                    className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <dl className="mb-5 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">Mã ghế</dt>
                    <dd className="font-mono font-medium text-zinc-900">{activeSeat.seatCode}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">Hàng</dt>
                    <dd className="font-medium text-zinc-900">{activeSeat.rowLabel}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">Số ghế</dt>
                    <dd className="font-medium text-zinc-900">{activeSeat.seatNumber}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">Loại ghế</dt>
                    <dd>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${activeSeat.seatType === 'VIP'
                          ? 'bg-amber-100 text-amber-700'
                          : activeSeat.seatType === 'COUPLE'
                            ? 'bg-fuchsia-100 text-fuchsia-700'
                            : 'bg-zinc-100 text-zinc-700'
                        }`}>
                        {seatTypeLabels[activeSeat.seatType] || activeSeat.seatType}
                      </span>
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">Trạng thái</dt>
                    <dd>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${activeSeat.isActive ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'
                        }`}>
                        {activeSeat.isActive ? 'Đang dùng' : 'Ngưng dùng'}
                      </span>
                    </dd>
                  </div>
                </dl>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => openEdit(activeSeat)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-700"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Chỉnh sửa ghế
                  </button>
                  <button
                    onClick={() => handleDelete(activeSeat.seatId)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Xoá ghế này
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
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
                      <option key={type} value={type}>{seatTypeLabels[type] || type}</option>
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
