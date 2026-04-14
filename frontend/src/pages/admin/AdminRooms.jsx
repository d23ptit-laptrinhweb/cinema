import { useEffect, useMemo, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

const roomStatuses = ['ACTIVE', 'INACTIVE', 'MAINTENANCE'];
const roomTypes = ['TWO_D', 'THREE_D', 'IMAX', 'FOUR_DX'];

const roomTypeLabels = {
  TWO_D: '2D',
  THREE_D: '3D',
  IMAX: 'IMAX',
  FOUR_DX: '4DX',
};

const roomStatusLabels = {
  ACTIVE: 'Hoạt động',
  INACTIVE: 'Tạm dừng',
  MAINTENANCE: 'Bảo trì',
};

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranchId, setSelectedBranchId] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    roomType: 'TWO_D',
    seatCapacity: 50,
    status: 'ACTIVE',
    branchId: '',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchRooms();
    }
  }, [selectedBranchId, statusFilter]);

  const branchNameMap = useMemo(() => {
    return branches.reduce((acc, branch) => {
      acc[branch.branchId] = branch.name;
      return acc;
    }, {});
  }, [branches]);

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
        setFormData((prev) => ({ ...prev, branchId: branchList[0].branchId }));
      }
    } catch (error) {
      console.error(error);
      alert('Không thể tải dữ liệu phòng chiếu.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const params = {};
      if (selectedBranchId !== 'ALL') params.branchId = selectedBranchId;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await axiosClient.get('/room', { params });
      setRooms(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error(error);
      alert('Không thể tải danh sách phòng.');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      roomType: 'TWO_D',
      seatCapacity: 50,
      status: 'ACTIVE',
      branchId: branches[0]?.branchId || '',
    });
  };

  const openCreate = () => {
    setEditingRoom(null);
    resetForm();
    setShowModal(true);
  };

  const openEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      code: room.code || '',
      name: room.name || '',
      roomType: room.roomType || 'TWO_D',
      seatCapacity: room.seatCapacity || 1,
      status: room.status || 'ACTIVE',
      branchId: room.branchId || branches[0]?.branchId || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      seatCapacity: Number(formData.seatCapacity),
    };

    if (!payload.branchId) {
      alert('Vui lòng chọn chi nhánh.');
      return;
    }

    if (Number.isNaN(payload.seatCapacity) || payload.seatCapacity < 1) {
      alert('Sức chứa phải lớn hơn hoặc bằng 1.');
      return;
    }

    try {
      if (editingRoom) {
        await axiosClient.put(`/room/${editingRoom.id}`, payload);
      } else {
        await axiosClient.post('/room', payload);
      }
      setShowModal(false);
      await fetchRooms();
    } catch (error) {
      alert('Lỗi: ' + (error?.message || JSON.stringify(error)));
    }
  };

  const handleDelete = async (roomId) => {
    if (!confirm('Bạn có chắc muốn xoá phòng chiếu này?')) return;
    try {
      await axiosClient.delete(`/room/${roomId}`);
      await fetchRooms();
    } catch (error) {
      alert('Lỗi: ' + (error?.message || JSON.stringify(error)));
    }
  };

  const statusClassName = (status) => {
    if (status === 'ACTIVE') return 'bg-green-500/10 text-green-600';
    if (status === 'MAINTENANCE') return 'bg-amber-500/10 text-amber-600';
    return 'bg-zinc-500/10 text-zinc-600';
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
          <h2 className="text-xl font-bold">Quản lý phòng theo chi nhánh</h2>
          <p className="mt-1 text-sm text-zinc-600">Tạo, cập nhật và theo dõi trạng thái từng phòng chiếu tại mỗi chi nhánh.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 font-medium text-white transition hover:bg-red-700"
        >
          <PlusIcon className="h-5 w-5" />
          Thêm phòng
        </button>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-zinc-600">Lọc theo chi nhánh</label>
          <select
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-red-500 focus:outline-none"
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
          >
            <option value="ALL">Tất cả chi nhánh</option>
            {branches.map((branch) => (
              <option key={branch.branchId} value={branch.branchId}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">Lọc theo trạng thái</label>
          <select
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-red-500 focus:outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Tất cả trạng thái</option>
            {roomStatuses.map((status) => (
              <option key={status} value={status}>
                {roomStatusLabels[status] || status}
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
                <th className="px-4 py-3">Mã phòng</th>
                <th className="px-4 py-3">Tên phòng</th>
                <th className="px-4 py-3">Loại phòng</th>
                <th className="px-4 py-3">Sức chứa</th>
                <th className="px-4 py-3">Chi nhánh</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {rooms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-zinc-500">
                    Không có phòng chiếu phù hợp bộ lọc.
                  </td>
                </tr>
              ) : (
                rooms.map((room) => (
                  <tr key={room.id} className="border-b border-zinc-100 transition hover:bg-zinc-50">
                    <td className="px-4 py-3 font-mono text-xs text-zinc-600">{room.code}</td>
                    <td className="px-4 py-3 font-medium text-zinc-900">{room.name}</td>
                    <td className="px-4 py-3 text-zinc-700">{roomTypeLabels[room.roomType] || room.roomType}</td>
                    <td className="px-4 py-3 text-zinc-700">{room.seatCapacity}</td>
                    <td className="px-4 py-3 text-zinc-700">{branchNameMap[room.branchId] || room.branchId}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClassName(room.status)}`}>
                        {roomStatusLabels[room.status] || room.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(room)}
                          className="rounded-lg p-2 text-zinc-500 transition hover:bg-sky-50 hover:text-sky-600"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(room.id)}
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
              <h3 className="text-xl font-bold text-zinc-900">{editingRoom ? 'Sửa phòng chiếu' : 'Thêm phòng chiếu'}</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 transition hover:text-zinc-900">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-zinc-600">Mã phòng *</label>
                  <input
                    required
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-red-500 focus:outline-none"
                    value={formData.code}
                    onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-zinc-600">Tên phòng *</label>
                  <input
                    required
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-red-500 focus:outline-none"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm text-zinc-600">Loại phòng *</label>
                  <select
                    required
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-red-500 focus:outline-none"
                    value={formData.roomType}
                    onChange={(e) => setFormData((prev) => ({ ...prev, roomType: e.target.value }))}
                  >
                    {roomTypes.map((type) => (
                      <option key={type} value={type}>
                        {roomTypeLabels[type] || type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-zinc-600">Sức chứa *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-red-500 focus:outline-none"
                    value={formData.seatCapacity}
                    onChange={(e) => setFormData((prev) => ({ ...prev, seatCapacity: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-zinc-600">Trạng thái</label>
                  <select
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-red-500 focus:outline-none"
                    value={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                  >
                    {roomStatuses.map((status) => (
                      <option key={status} value={status}>
                        {roomStatusLabels[status] || status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm text-zinc-600">Chi nhánh *</label>
                <select
                  required
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-red-500 focus:outline-none"
                  value={formData.branchId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, branchId: e.target.value }))}
                >
                  <option value="">-- Chọn chi nhánh --</option>
                  {branches.map((branch) => (
                    <option key={branch.branchId} value={branch.branchId}>
                      {branch.name}
                    </option>
                  ))}
                </select>
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
                  {editingRoom ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
