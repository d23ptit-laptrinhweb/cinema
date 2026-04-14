import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectAfterLogin = location.state?.redirectAfterLogin;
  const checkoutState = location.state?.checkoutState;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axiosClient.post('/auth/login', { username, password });
      if (response && response.accessToken) {
        localStorage.setItem('token', response.accessToken);
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
        if (redirectAfterLogin) {
          navigate(redirectAfterLogin, { state: checkoutState || null });
        } else {
          navigate('/');
        }
      } else {
        setError('Đăng nhập thất bại. Không nhận được token.');
      }
    } catch (err) {
      setError(err?.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_20px_45px_rgba(0,0,0,0.12)] md:grid-cols-[1fr_1fr]">
        <div className="relative hidden bg-black p-10 text-white md:block">
          <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-red-600/30 blur-3xl" />
          <h2 className="relative text-4xl font-black leading-tight">Trở lại rạp phim của bạn</h2>
          <p className="relative mt-4 text-zinc-300">
            Đăng nhập để theo dõi booking, thanh toán nhanh và lưu lịch sử vé.
          </p>
        </div>

        <div className="p-8 md:p-10">
        <div className="text-center mb-8">
          <h2 className="mb-2 text-3xl font-black text-zinc-900">Đăng nhập</h2>
          <p className="text-sm text-zinc-600">Chào mừng bạn quay lại với Xemphim</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700" htmlFor="username">
              Tên đăng nhập
            </label>
            <input
              id="username"
              type="text"
              required
              placeholder="username"
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-medium text-zinc-700" htmlFor="password">
                Mật khẩu
              </label>
              <Link to="/forgot-password" className="text-sm font-semibold text-red-700 hover:text-red-800">
                Quên mật khẩu?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-8 w-full"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-zinc-600">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="ml-1 font-semibold text-red-700 hover:text-red-800">
            Đăng ký ngay
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
}
