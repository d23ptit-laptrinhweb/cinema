import { useEffect, useMemo, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

const roomStatuses = ['ACTIVE', 'INACTIVE', 'MAINTENANCE'];
const roomTypes = ['TWO_D', 'THREE_D', 'IMAX', 'FOUR_DX'];
const seatTypes = ['STANDARD', 'VIP', 'COUPLE'];

const defaultRoomForm = {
  code: '',
  name: '',
  roomType: 'TWO_D',
  seatCapacity: '',
  status: 'ACTIVE'
};

const defaultSeatForm = {
  seatCode: '',
  rowLabel: '',
  seatNumber: '',
  seatType: 'STANDARD',
  isActive: true
};

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomForm, setRoomForm] = useState(defaultRoomForm);

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [seats, setSeats] = useState([]);
  const [seatLoading, setSeatLoading] = useState(false);

  const [showSeatModal, setShowSeatModal] = useState(false);
  const [seatForm, setSeatForm] = useState(defaultSeatForm);

  const sortedRooms = useMemo(
    () => [...rooms].sort((a, b) => String(a.code).localeCompare(String(b.code))),
    [rooms]
  );

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (!selectedRoom?.id) return;
    fetchSeats(selectedRoom.id);
  }, [selectedRoom?.id]);

  const fetchRooms = async () => {
    try {
      const res = await axiosClient.get('/room');
      setRooms(res || []);

      if (!selectedRoom?.id && res?.length) {
        setSelectedRoom(res[0]);
      } else if (selectedRoom?.id) {
        const refreshed = (res || []).find((r) => r.id === selectedRoom.id);
        setSelectedRoom(refreshed || null);
      }
    } catch (err) {
      console.error(err);
      alert('Không tải được danh sách phòng.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSeats = async (roomId) => {
    setSeatLoading(true);
    try {
      const res = await axiosClient.get(`/seat/room/${roomId}`);
      setSeats(res || []);
    } catch (err) {
      console.error(err);
      setSeats([]);
    } finally {
      setSeatLoading(false);
    }
  };

  const openCreateRoom = () => {
    setEditingRoom(null);
    setRoomForm(defaultRoomForm);
    setShowRoomModal(true);
  };

  const openEditRoom = (room) => {
    setEditingRoom(room);
    setRoomForm({
      code: room.code || '',
      name: room.name || '',
      roomType: room.roomType || 'TWO_D',
      seatCapacity: room.seatCapacity || '',
      status: room.status || 'ACTIVE'
    });
    setShowRoomModal(true);
  };

  const submitRoom = async (e) => {
    e.preventDefault();

    const payload = {
      ...roomForm,
      seatCapacity: Number(roomForm.seatCapacity)
    };

    try {
      if (editingRoom) {
        await axiosClient.put(`/room/${editingRoom.id}`, payload);
      } else {
        await axiosClient.post('/room', payload);
      }

      setShowRoomModal(false);
      await fetchRooms();
    } catch (err) {
      console.error(err);
      alert('Không thể lưu phòng. Vui lòng kiểm tra dữ liệu nhập.');
    }
  };

  const deleteRoom = async (roomId) => {
    if (!confirm('Bạn chắc chắn muốn xoá phòng này?')) return;

    try {
      await axiosClient.delete(`/room/${roomId}`);

      if (selectedRoom?.id === roomId) {
        setSelectedRoom(null);
        setSeats([]);
      }

      await fetchRooms();
    } catch (err) {
      console.error(err);
      alert('Xoá phòng thất bại.');
    }
  };

  const openCreateSeat = () => {
    if (!selectedRoom?.id) return;
    setSeatForm(defaultSeatForm);
    setShowSeatModal(true);
  };

  const submitSeat = async (e) => {
    e.preventDefault();
    if (!selectedRoom?.id) return;

    try {
      await axiosClient.post('/seat', {
        roomId: selectedRoom.id,
        seatCode: seatForm.seatCode,
        rowLabel: seatForm.rowLabel,
        seatNumber: Number(seatForm.seatNumber),
        seatType: seatForm.seatType,
        isActive: Boolean(seatForm.isActive)
      });

      setShowSeatModal(false);
      await fetchSeats(selectedRoom.id);
    } catch (err) {
      console.error(err);
      alert('Không thể tạo ghế. Kiểm tra mã ghế có bị trùng không.');
    }
  };

  const deleteSeat = async (seatId) => {
    if (!confirm('Bạn chắc chắn muốn xoá ghế này?')) return;
    if (!selectedRoom?.id) return;

    try {
      await axiosClient.delete(`/seat/${seatId}`);
      await fetchSeats(selectedRoom.id);
    } catch (err) {
      console.error(err);
      alert('Xoá ghế thất bại.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Quản lý phòng</h2>
          <p className="text-sm text-slate-400 mt-1">Tạo phòng và quản lý danh sách ghế theo từng phòng.</p>
        </div>
        <button
          onClick={openCreateRoom}
          className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Thêm phòng
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 text-sm text-slate-300">
            Danh sách phòng ({sortedRooms.length})
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-800">
                  <th className="px-4 py-3">Mã phòng</th>
                  <th className="px-4 py-3">Tên</th>
                  <th className="px-4 py-3">Loại</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {sortedRooms.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-500">Chưa có phòng</td>
                  </tr>
                ) : (
                  sortedRooms.map((room) => (
                    <tr
                      key={room.id}
                      className={`border-b border-slate-800/50 transition-colors ${
                        selectedRoom?.id === room.id ? 'bg-slate-800/50' : 'hover:bg-slate-800/30'
                      }`}
                    >
                      <td className="px-4 py-3 text-slate-200 font-mono">{room.code}</td>
                      <td className="px-4 py-3 text-white">{room.name}</td>
                      <td className="px-4 py-3 text-slate-300">{room.roomType}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          room.status === 'ACTIVE'
                            ? 'bg-green-500/10 text-green-500'
                            : room.status === 'MAINTENANCE'
                              ? 'bg-amber-500/10 text-amber-500'
                              : 'bg-slate-500/10 text-slate-400'
                        }`}>
                          {room.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => setSelectedRoom(room)}
                            className="px-2 py-1 rounded-lg text-xs text-slate-300 hover:bg-slate-700"
                          >
                            Ghế
                          </button>
                          <button
                            onClick={() => openEditRoom(room)}
                            className="p-2 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteRoom(room.id)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
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

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="text-sm text-slate-300">
              {selectedRoom ? `Ghế của phòng ${selectedRoom.name} (${selectedRoom.code})` : 'Chọn phòng để xem ghế'}
            </div>
            <button
              onClick={openCreateSeat}
              disabled={!selectedRoom}
              className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg text-sm"
            >
              <PlusIcon className="w-4 h-4" />
              Thêm ghế
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-800">
                  <th className="px-4 py-3">Mã ghế</th>
                  <th className="px-4 py-3">Hàng</th>
                  <th className="px-4 py-3">Số</th>
                  <th className="px-4 py-3">Loại</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {seatLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">Đang tải ghế...</td>
                  </tr>
                ) : !selectedRoom ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">Chọn một phòng ở bảng bên trái</td>
                  </tr>
                ) : seats.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">Phòng này chưa có ghế</td>
                  </tr>
                ) : (
                  [...seats]
                    .sort((a, b) => String(a.seatCode).localeCompare(String(b.seatCode)))
                    .map((seat) => (
                      <tr key={seat.seatId} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                        <td className="px-4 py-3 font-mono text-slate-200">{seat.seatCode}</td>
                        <td className="px-4 py-3 text-slate-300">{seat.rowLabel}</td>
                        <td className="px-4 py-3 text-slate-300">{seat.seatNumber}</td>
                        <td className="px-4 py-3 text-slate-300">{seat.seatType}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            seat.isActive ? 'bg-green-500/10 text-green-500' : 'bg-slate-500/10 text-slate-400'
                          }`}>
                            {seat.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => deleteSeat(seat.seatId)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showRoomModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowRoomModal(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">{editingRoom ? 'Sửa phòng' : 'Thêm phòng mới'}</h3>
              <button onClick={() => setShowRoomModal(false)} className="text-slate-400 hover:text-white">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={submitRoom} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Mã phòng *</label>
                  <input
                    required
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-500"
                    value={roomForm.code}
                    onChange={(e) => setRoomForm({ ...roomForm, code: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Tên phòng *</label>
                  <input
                    required
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-500"
                    value={roomForm.name}
                    onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Loại phòng</label>
                  <select
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-500"
                    value={roomForm.roomType}
                    onChange={(e) => setRoomForm({ ...roomForm, roomType: e.target.value })}
                  >
                    {roomTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Sức chứa *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-500"
                    value={roomForm.seatCapacity}
                    onChange={(e) => setRoomForm({ ...roomForm, seatCapacity: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Trạng thái</label>
                  <select
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-500"
                    value={roomForm.status}
                    onChange={(e) => setRoomForm({ ...roomForm, status: e.target.value })}
                  >
                    {roomStatuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setShowRoomModal(false)} className="px-5 py-2.5 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors">Huỷ</button>
                <button type="submit" className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium transition-colors">{editingRoom ? 'Cập nhật' : 'Tạo mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSeatModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowSeatModal(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Thêm ghế mới</h3>
              <button onClick={() => setShowSeatModal(false)} className="text-slate-400 hover:text-white">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={submitSeat} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Mã ghế *</label>
                  <input
                    required
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-500"
                    value={seatForm.seatCode}
                    onChange={(e) => setSeatForm({ ...seatForm, seatCode: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Hàng *</label>
                  <input
                    required
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-500"
                    value={seatForm.rowLabel}
                    onChange={(e) => setSeatForm({ ...seatForm, rowLabel: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Số ghế *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-500"
                    value={seatForm.seatNumber}
                    onChange={(e) => setSeatForm({ ...seatForm, seatNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Loại ghế</label>
                  <select
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-500"
                    value={seatForm.seatType}
                    onChange={(e) => setSeatForm({ ...seatForm, seatType: e.target.value })}
                  >
                    {seatTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={seatForm.isActive}
                      onChange={(e) => setSeatForm({ ...seatForm, isActive: e.target.checked })}
                    />
                    Ghế đang hoạt động
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setShowSeatModal(false)} className="px-5 py-2.5 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors">Huỷ</button>
                <button type="submit" className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium transition-colors">Tạo ghế</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
