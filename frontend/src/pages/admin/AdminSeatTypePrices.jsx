import { useEffect, useMemo, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { PencilIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

const seatTypes = ['STANDARD', 'VIP', 'COUPLE'];

const defaultForm = {
  seatType: 'STANDARD',
  price: ''
};

export default function AdminSeatTypePrices() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(defaultForm);

  const existingSeatTypes = useMemo(
    () => new Set((prices || []).map((p) => p.seatType)),
    [prices]
  );

  const sortedPrices = useMemo(
    () => [...(prices || [])].sort((a, b) => String(a.seatType).localeCompare(String(b.seatType))),
    [prices]
  );

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    try {
      const res = await axiosClient.get('/seat-type-price');
      setPrices(res || []);
    } catch (err) {
      console.error(err);
      alert('Không tải được bảng giá loại ghế.');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    const availableType = seatTypes.find((type) => !existingSeatTypes.has(type)) || 'STANDARD';
    setEditing(null);
    setFormData({ seatType: availableType, price: '' });
    setShowModal(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setFormData({
      seatType: row.seatType,
      price: row.price
    });
    setShowModal(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();

    const payload = {
      price: Number(formData.price)
    };

    try {
      if (editing) {
        await axiosClient.put(`/seat-type-price/${editing.seatType}`, payload);
      } else {
        await axiosClient.post('/seat-type-price', {
          seatType: formData.seatType,
          ...payload
        });
      }

      setShowModal(false);
      await fetchPrices();
    } catch (err) {
      console.error(err);
      alert('Không thể lưu giá loại ghế. Vui lòng kiểm tra dữ liệu.');
    }
  };

  const canCreate = existingSeatTypes.size < seatTypes.length;

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
          <h2 className="text-xl font-bold text-white">Giá theo loại ghế</h2>
          <p className="text-sm text-slate-400 mt-1">Cập nhật giá vé cho từng seat type (STANDARD, VIP, COUPLE).</p>
        </div>
        <button
          onClick={openCreate}
          disabled={!canCreate}
          className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl font-medium transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Thêm loại ghế
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-800">
                <th className="px-4 py-3">Seat Type</th>
                <th className="px-4 py-3">Giá</th>
                <th className="px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {sortedPrices.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-slate-500">Chưa có dữ liệu giá</td>
                </tr>
              ) : (
                sortedPrices.map((row) => (
                  <tr key={row.seatType} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-slate-200 font-mono">{row.seatType}</td>
                    <td className="px-4 py-3 text-rose-400 font-semibold">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(row.price) || 0)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openEdit(row)}
                        className="p-2 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"
                      >
                        <PencilIcon className="w-4 h-4" />
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
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">{editing ? 'Cập nhật giá ghế' : 'Thêm giá ghế'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={submitForm} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Seat Type *</label>
                <select
                  disabled={Boolean(editing)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-500 disabled:opacity-70"
                  value={formData.seatType}
                  onChange={(e) => setFormData({ ...formData, seatType: e.target.value })}
                >
                  {seatTypes.map((type) => (
                    <option
                      key={type}
                      value={type}
                      disabled={!editing && existingSeatTypes.has(type)}
                    >
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Giá (VND) *</label>
                <input
                  type="number"
                  min={0}
                  required
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-500"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors">
                  Huỷ
                </button>
                <button type="submit" className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium transition-colors">
                  {editing ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
