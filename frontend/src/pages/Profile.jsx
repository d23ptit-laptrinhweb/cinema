import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { UserCircleIcon, ArrowRightOnRectangleIcon, KeyIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    dob: '',
    gender: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const userRes = await axiosClient.get('/my-info');
        setUser(userRes);
        setProfileForm({
          fullName: userRes?.fullName || '',
          email: userRes?.email || '',
          phoneNumber: userRes?.phoneNumber || '',
          dob: userRes?.dob || '',
          gender: userRes?.gender || '',
        });
      } catch (error) {
        setErrorMsg(error?.message || JSON.stringify(error));
        if(error?.code === 401 || String(error).includes('401') || error?.status === 401) {
           localStorage.removeItem('token');
           localStorage.removeItem('refreshToken');
           navigate('/login');
           return;
        }
      }

      setLoading(false);
    };
    fetchProfileData();
  }, [navigate]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    setProfileSuccess('');
    setProfileError('');
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setPasswordSuccess('');
    setPasswordError('');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const payload = {
        fullName: profileForm.fullName?.trim() || null,
        email: profileForm.email?.trim() || null,
        phoneNumber: profileForm.phoneNumber?.trim() || null,
        dob: profileForm.dob || null,
        gender: profileForm.gender || null,
      };

      const updatedUser = await axiosClient.put('/my-info', payload);
      setUser(updatedUser);
      setProfileSuccess('Đã cập nhật thông tin cá nhân thành công.');
    } catch (error) {
      setProfileError(error?.message || 'Không thể cập nhật thông tin cá nhân.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangingPassword(true);
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp.');
      setChangingPassword(false);
      return;
    }

    try {
      await axiosClient.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordSuccess('Đổi mật khẩu thành công.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setPasswordError(error?.message || 'Không thể đổi mật khẩu.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    navigate('/');
  };

  const genderLabel = {
    MALE: 'Nam',
    FEMALE: 'Nữ',
    OTHER: 'Khác',
  };

  if (loading) {
    return (
      <div className="page-shell flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-red-600"></div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="page-shell py-20">
        <div className="card-soft p-10 text-center">
          <h2 className="mb-4 text-2xl font-black text-red-700">Lỗi tải dữ liệu API</h2>
          <p className="mb-5 text-zinc-600">Chi tiết: {errorMsg}</p>
          <button onClick={() => navigate('/login')} className="btn-primary">Đăng nhập lại</button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-shell py-20">
        <div className="card-soft p-10 text-center">
          <h2 className="mb-4 text-2xl font-black text-zinc-900">Vui lòng đăng nhập để xem thông tin</h2>
          <button onClick={() => navigate('/login')} className="btn-primary">Đăng nhập</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell py-6">
      <div className="mx-auto w-full max-w-[720px] space-y-6">
        <div className="card-soft relative p-8 text-center">
          <button onClick={handleLogout} className="absolute right-4 top-4 text-zinc-400 transition hover:text-red-600" title="Đăng xuất">
            <ArrowRightOnRectangleIcon className="h-6 w-6" />
          </button>
          
          <UserCircleIcon className="mx-auto mb-4 h-24 w-24 text-red-600" />
          <h2 className="text-2xl font-black tracking-wide text-zinc-900">{user.username}</h2>
          <p className="mb-6 text-zinc-600">{user.email}</p>

          <div className="space-y-4 border-t border-zinc-200 pt-6 text-left">
            <div>
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-500">Mã người dùng</span>
              <span className="font-medium text-zinc-800">{user.id || 'Chưa cập nhật'}</span>
            </div>
            <div>
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-500">Họ tên</span>
              <span className="font-medium text-zinc-800">{user.fullName || 'Chưa cập nhật'}</span>
            </div>
            <div>
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-500">Tên đăng nhập</span>
              <span className="font-medium text-zinc-800">{user.username || 'Chưa cập nhật'}</span>
            </div>
            <div>
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-500">Email</span>
              <span className="font-medium text-zinc-800">{user.email || 'Chưa cập nhật'}</span>
            </div>
            <div>
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-500">Số điện thoại</span>
              <span className="font-medium text-zinc-800">{user.phoneNumber || 'Chưa cập nhật'}</span>
            </div>
            <div>
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-500">Ngày sinh</span>
              <span className="font-medium text-zinc-800">{user.dob || 'Chưa cập nhật'}</span>
            </div>
            <div>
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-500">Giới tính</span>
              <span className="font-medium text-zinc-800">{genderLabel[user.gender] || 'Chưa cập nhật'}</span>
            </div>
            <div>
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-500">Quyền</span>
              <span className="rounded bg-zinc-100 px-2 py-0.5 font-medium text-zinc-800">{user.role || 'USER'}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="card-soft p-6">
          <h3 className="mb-5 flex items-center gap-2 text-xl font-black text-zinc-900">
            <UserCircleIcon className="h-6 w-6 text-red-600" />
            Cập nhật thông tin cá nhân
          </h3>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700">Họ tên</label>
              <input name="fullName" value={profileForm.fullName} onChange={handleProfileChange} className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-red-500" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700">Email</label>
              <input type="email" name="email" value={profileForm.email} onChange={handleProfileChange} className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-red-500" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700">Số điện thoại</label>
              <input name="phoneNumber" value={profileForm.phoneNumber} onChange={handleProfileChange} className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-red-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700">Ngày sinh</label>
                <input type="date" name="dob" value={profileForm.dob || ''} onChange={handleProfileChange} className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-red-500" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700">Giới tính</label>
                <select name="gender" value={profileForm.gender || ''} onChange={handleProfileChange} className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-red-500">
                  <option value="">Chưa chọn</option>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>
            </div>
          </div>

          {profileSuccess && <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">{profileSuccess}</p>}
          {profileError && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{profileError}</p>}

          <button type="submit" disabled={savingProfile} className="btn-primary mt-5 w-full">
            {savingProfile ? 'Đang lưu...' : 'Cập nhật thông tin'}
          </button>
        </form>

        <form onSubmit={handleChangePassword} className="card-soft p-6">
          <h3 className="mb-5 flex items-center gap-2 text-xl font-black text-zinc-900">
            <KeyIcon className="h-6 w-6 text-red-600" />
            Đổi mật khẩu
          </h3>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700">Mật khẩu hiện tại</label>
              <input type="password" name="currentPassword" value={passwordForm.currentPassword} onChange={handlePasswordChange} className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-red-500" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700">Mật khẩu mới</label>
              <input type="password" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-red-500" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700">Xác nhận mật khẩu mới</label>
              <input type="password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordChange} className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-red-500" />
            </div>
          </div>

          {passwordSuccess && <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">{passwordSuccess}</p>}
          {passwordError && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{passwordError}</p>}

          <button type="submit" disabled={changingPassword} className="btn-primary mt-5 w-full">
            {changingPassword ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
          </button>
        </form>
      </div>
    </div>
  );
}
