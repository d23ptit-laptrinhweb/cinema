import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import {
  FilmIcon,
  BuildingOfficeIcon,
  UsersIcon,
  TicketIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  TagIcon,
  Squares2X2Icon,
  CurrencyDollarIcon,
  ViewColumnsIcon,
} from '@heroicons/react/24/outline';

const menuItems = [
  { name: 'Tổng quan', path: '/admin', icon: ChartBarIcon },
  { name: 'Quản lý phim', path: '/admin/films', icon: FilmIcon },
  { name: 'Thể loại', path: '/admin/genres', icon: TagIcon },
  { name: 'Chi nhánh', path: '/admin/branches', icon: BuildingOfficeIcon },
  { name: 'Phòng chiếu', path: '/admin/rooms', icon: Squares2X2Icon },
  { name: 'Ghế theo phòng', path: '/admin/room-seats', icon: ViewColumnsIcon },
  { name: 'Giá vé', path: '/admin/seat-prices', icon: CurrencyDollarIcon },
  { name: 'Suất chiếu', path: '/admin/showtimes', icon: ClockIcon },
  { name: 'Đơn đặt vé', path: '/admin/bookings', icon: TicketIcon },
  { name: 'Người dùng', path: '/admin/users', icon: UsersIcon },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosClient.get('/my-info');
        setUser(res);
        if (res.role !== 'ADMIN') {
          alert('Bạn không có quyền truy cập trang quản trị!');
          navigate('/');
        }
      } catch {
        navigate('/admin/login');
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    navigate('/admin/login');
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 text-zinc-900">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 border-r border-zinc-200 bg-white flex flex-col transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-6">
          <Link to="/admin" className="flex items-center gap-2">
            <TicketIcon className="h-7 w-7 text-red-600" />
            <span className="text-xl font-black text-zinc-900">
              Bảng Quản Trị
            </span>
          </Link>
          <button className="text-zinc-500 hover:text-zinc-800 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-red-50 text-red-700'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-zinc-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white">
              {user?.username?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-zinc-900">{user?.username}</p>
              <p className="text-xs text-zinc-500">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-zinc-600 transition-colors hover:bg-red-50 hover:text-red-700">
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-zinc-200 bg-white/90 px-6 backdrop-blur-md">
          <button className="mr-4 text-zinc-500 hover:text-zinc-900 lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Bars3Icon className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold text-zinc-900">
            {menuItems.find(i => i.path === location.pathname)?.name || 'Quản trị'}
          </h1>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
