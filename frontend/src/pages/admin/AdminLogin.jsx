import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { ShieldCheckIcon } from '@heroicons/react/24/solid';

export default function AdminLogin() {
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
      // 1. Đăng nhập
      const loginRes = await axiosClient.post('/auth/login', { username, password });
      if (!loginRes?.accessToken) {
        setError('Đăng nhập thất bại.');
        return;
      }

      localStorage.setItem('token', loginRes.accessToken);
      if (loginRes.refreshToken) {
        localStorage.setItem('refreshToken', loginRes.refreshToken);
      }

      // 2. Kiểm tra quyền ADMIN
      const userInfo = await axiosClient.get('/my-info');
      if (userInfo?.role !== 'ADMIN') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setError('Tài khoản không có quyền Admin.');
        return;
      }

      navigate('/admin');
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-500 to-rose-700 rounded-2xl shadow-lg shadow-rose-500/30 mb-4">
              <ShieldCheckIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-slate-500 text-sm mt-1">Đăng nhập để quản trị hệ thống</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium flex items-center gap-2">
              <span className="shrink-0">⚠️</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-slate-400 text-sm font-medium mb-1.5" htmlFor="admin-username">
                Tên đăng nhập
              </label>
              <input
                id="admin-username"
                type="text"
                required
                autoFocus
                placeholder="admin"
                className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all placeholder:text-slate-600"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-slate-400 text-sm font-medium mb-1.5" htmlFor="admin-password">
                Mật khẩu
              </label>
              <input
                id="admin-password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all placeholder:text-slate-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 disabled:opacity-60 flex justify-center items-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  <ShieldCheckIcon className="w-5 h-5" />
                  Đăng Nhập Admin
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <a href="/" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
              ← Quay về trang chủ
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
