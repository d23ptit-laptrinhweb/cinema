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
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-red-200/40 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-red-100/50 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600 shadow-lg shadow-red-600/30">
              <ShieldCheckIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900">Bảng Quản Trị</h1>
            <p className="mt-1 text-sm text-zinc-600">Đăng nhập để quản trị hệ thống</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              <span className="shrink-0">⚠️</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700" htmlFor="admin-username">
                Tên đăng nhập
              </label>
              <input
                id="admin-username"
                type="text"
                required
                autoFocus
                placeholder="admin"
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 transition-all placeholder:text-zinc-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700" htmlFor="admin-password">
                Mật khẩu
              </label>
              <input
                id="admin-password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 transition-all placeholder:text-zinc-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3.5 font-bold text-white transition-all hover:bg-red-700 disabled:opacity-60"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  <ShieldCheckIcon className="w-5 h-5" />
                  Đăng Nhập Quản Trị
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-zinc-200 pt-6 text-center">
            <a href="/" className="text-sm text-zinc-600 transition-colors hover:text-red-700">
              ← Quay về trang chủ
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
