import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axiosClient.post('/sign-up', formData);
      if (response) {
        setSuccess('Đăng ký thành công! Hãy đăng nhập để tiếp tục.');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError(err?.message || 'Có lỗi xảy ra khi đăng ký. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_20px_45px_rgba(0,0,0,0.12)] md:grid-cols-[1fr_1fr]">
        <div className="relative hidden bg-black p-10 text-white md:block">
          <div className="absolute -right-8 -top-8 h-44 w-44 rounded-full bg-red-600/30 blur-3xl" />
          <h2 className="relative text-4xl font-black leading-tight">Tạo tài khoản mới</h2>
          <p className="relative mt-4 text-zinc-300">
            Đăng ký để đặt vé nhanh hơn, lưu lịch sử và quản lý thông tin cá nhân.
          </p>
        </div>

        <div className="p-8 md:p-10">
        <div className="text-center mb-8">
          <h2 className="mb-2 text-3xl font-black text-zinc-900">Đăng ký</h2>
          <p className="text-sm text-zinc-600">Trải nghiệm hệ thống đặt vé xem phim</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700" htmlFor="username">
              Tên đăng nhập
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700" htmlFor="phone">
              Số điện thoại (tùy chọn)
            </label>
            <input
              id="phone"
              name="phone"
              type="text"
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700" htmlFor="password">
              Mật khẩu
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="btn-primary mt-8 w-full"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
            ) : (
              'Đăng ký'
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-zinc-600">
          Đã có tài khoản?{' '}
          <Link to="/login" className="ml-1 font-semibold text-red-700 hover:text-red-800">
            Đăng nhập ngay
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
}
