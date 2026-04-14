import { useEffect, useMemo, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { PlusIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';

const seatTypeLabels = {
  STANDARD: 'Ghế thường',
  VIP: 'Ghế VIP',
  COUPLE: 'Ghế đôi',
};

const allSeatTypes = ['STANDARD', 'VIP', 'COUPLE'];

export default function AdminSeatPrices() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState('');
  const [formData, setFormData] = useState({ seatType: 'STANDARD', price: '' });

  const existingTypes = useMemo(() => prices.map((item) => item.seatType), [prices]);

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    try {
      const res = await axiosClient.get('/seat-type-price');
      setPrices(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error(error);
      alert('Không thể tải danh sách giá vé.');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    const firstAvailableType = allSeatTypes.find((type) => !existingTypes.includes(type)) || allSeatTypes[0];
    setEditingType('');
    setFormData({ seatType: firstAvailableType, price: '' });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingType(item.seatType);
    setFormData({ seatType: item.seatType, price: item.price ?? '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { price: Number(formData.price) };

    if (Number.isNaN(payload.price) || payload.price <= 0) {
      alert('Giá vé phải là số lớn hơn 0.');
      return;
    }

    try {
      if (editingType) {
        await axiosClient.put(`/seat-type-price/${editingType}`, payload);
      } else {
        await axiosClient.post('/seat-type-price', {
          seatType: formData.seatType,
          price: payload.price,
        });
      }
      setShowModal(false);
      await fetchPrices();
    } catch (error) {
      alert('Lỗi: ' + (error?.message || JSON.stringify(error)));
    }
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined || Number.isNaN(Number(price))) {
      return '-';
    }
    return Number(price).toLocaleString('vi-VN') + ' đ';
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-red-600"></div>
      </div>
    );
  }

  const canCreateMore = existingTypes.length < allSeatTypes.length;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">Quản lý giá vé theo loại ghế</h2>
          <p className="mt-1 text-sm text-zinc-600">Thiết lập giá chuẩn cho từng loại ghế trong hệ thống.</p>
        </div>
        <button
          onClick={openCreate}
          disabled={!canCreateMore}
          className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          <PlusIcon className="h-5 w-5" />
          Thêm loại ghế
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-zinc-500">
                <th className="px-4 py-3">Loại ghế</th>
                <th className="px-4 py-3">Giá vé</th>
                <th className="px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {prices.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-zinc-500">
                    Chưa có cấu hình giá vé.
                  </td>
                </tr>
              ) : (
                prices.map((item) => (
                  <tr key={item.seatType} className="border-b border-zinc-100 transition hover:bg-zinc-50">
                    <td className="px-4 py-3 font-medium text-zinc-900">{seatTypeLabels[item.seatType] || item.seatType}</td>
                    <td className="px-4 py-3 text-zinc-700">{formatPrice(item.price)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openEdit(item)}
                        className="rounded-lg p-2 text-zinc-500 transition hover:bg-sky-50 hover:text-sky-600"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
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
            className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-zinc-900">{editingType ? 'Cập nhật giá vé' : 'Thêm giá vé'}</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 transition hover:text-zinc-900">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-zinc-600">Loại ghế *</label>
                <select
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-red-500 focus:outline-none disabled:bg-zinc-100"
                  value={formData.seatType}
                  disabled={Boolean(editingType)}
                  onChange={(e) => setFormData((prev) => ({ ...prev, seatType: e.target.value }))}
                >
                  {allSeatTypes
                    .filter((type) => editingType || !existingTypes.includes(type) || type === formData.seatType)
                    .map((type) => (
                      <option key={type} value={type}>
                        {seatTypeLabels[type] || type}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm text-zinc-600">Giá vé (VNĐ) *</label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  required
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-red-500 focus:outline-none"
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                />
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
                  {editingType ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
