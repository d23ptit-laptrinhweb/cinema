import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        navigate('/');
      } else {
        setError('Đăng nhập thất bại. Không nhận được token.');
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-20 px-4">
      <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl shadow-2xl max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Đăng Nhập</h2>
          <p className="text-slate-400 text-sm">Chào mừng bạn quay lại với Xemphim</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-400 text-sm font-medium mb-1.5" htmlFor="username">
              Tên đăng nhập
            </label>
            <input
              id="username"
              type="text"
              required
              placeholder="username"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-slate-400 text-sm font-medium" htmlFor="password">
                Mật khẩu
              </label>
              <Link to="/forgot-password" className="text-sm text-rose-500 hover:text-rose-400">
                Quên mật khẩu?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-8 bg-rose-500 hover:bg-rose-600 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 disabled:opacity-70 flex justify-center items-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              'Đăng Nhập'
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-400 text-sm">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-rose-500 hover:text-rose-400 font-medium ml-1">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
