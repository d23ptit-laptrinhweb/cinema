import { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const requestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axiosClient.post('/auth/forgot-password', { email });
      setSuccess('OTP đã được gửi về email của bạn.');
      setStep(2);
    } catch (err) {
      setError(err?.message || 'Không thể gửi OTP. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axiosClient.post('/auth/reset-password', {
        email,
        OTP: otp,
        newPassword,
      });
      setSuccess('Đặt lại mật khẩu thành công. Bạn có thể đăng nhập ngay.');
      setStep(3);
    } catch (err) {
      setError(err?.message || 'OTP không hợp lệ hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-xl px-4 py-14">
      <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-black text-black">Quên mật khẩu</h1>
        <p className="mt-2 text-sm text-zinc-600">Khôi phục tài khoản bằng OTP email.</p>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {success}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={requestOtp} className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-200"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              {loading ? 'Đang gửi OTP...' : 'Gửi OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={resetPassword} className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700" htmlFor="otp">
                OTP
              </label>
              <input
                id="otp"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-200"
                placeholder="Nhập mã OTP"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700" htmlFor="password">
                Mật khẩu mới
              </label>
              <input
                id="password"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-200"
                placeholder="Nhập mật khẩu mới"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              {loading ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm text-zinc-700">
            Bạn đã đặt lại mật khẩu xong. Vui lòng đăng nhập lại.
          </div>
        )}

        <div className="mt-6 text-sm text-zinc-600">
          <Link to="/login" className="font-semibold text-red-700 hover:text-red-800">
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </section>
  );
}
