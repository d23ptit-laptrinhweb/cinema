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
      // The backend expects CreateUserRequest: username, email, password, maybe phone depending on your entity
      const response = await axiosClient.post('/sign-up', formData);
      if (response) {
        setSuccess('Đăng ký thành công! Hãy đăng nhập để tiếp tục.');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Có lỗi xảy ra khi đăng ký. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-12 px-4">
      <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl shadow-2xl max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Đăng Ký</h2>
          <p className="text-slate-400 text-sm">Trải nghiệm hệ thống đặt vé xem phim</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-sm font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/50 text-green-500 text-sm font-medium">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-400 text-sm font-medium mb-1.5" htmlFor="username">
              Tên đăng nhập
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-slate-400 text-sm font-medium mb-1.5" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-slate-400 text-sm font-medium mb-1.5" htmlFor="phone">
              Số điện thoại (Tùy chọn)
            </label>
            <input
              id="phone"
              name="phone"
              type="text"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-slate-400 text-sm font-medium mb-1.5" htmlFor="password">
              Mật khẩu
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full mt-8 bg-rose-500 hover:bg-rose-600 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 disabled:opacity-70 flex justify-center items-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              'Đăng Ký'
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-400 text-sm">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-rose-500 hover:text-rose-400 font-medium ml-1">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
