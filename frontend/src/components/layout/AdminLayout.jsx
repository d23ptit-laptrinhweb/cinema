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
} from '@heroicons/react/24/outline';

const menuItems = [
  { name: 'Tổng quan', path: '/admin', icon: ChartBarIcon },
  { name: 'Quản lý phim', path: '/admin/films', icon: FilmIcon },
  { name: 'Thể loại', path: '/admin/genres', icon: TagIcon },
  { name: 'Chi nhánh', path: '/admin/branches', icon: BuildingOfficeIcon },
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
          alert('Bạn không có quyền truy cập trang admin!');
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
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
          <Link to="/admin" className="flex items-center gap-2">
            <TicketIcon className="w-7 h-7 text-rose-500" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-rose-600">
              Admin Panel
            </span>
          </Link>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <XMarkIcon className="w-6 h-6" />
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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-rose-500/10 text-rose-500 shadow-inner'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-sm font-bold">
              {user?.username?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.username}</p>
              <p className="text-xs text-slate-500">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 text-sm text-slate-400 hover:text-rose-500 transition-colors px-2 py-2 rounded-lg hover:bg-slate-800">
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-30">
          <button className="lg:hidden mr-4 text-slate-400 hover:text-white" onClick={() => setSidebarOpen(true)}>
            <Bars3Icon className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-slate-200">
            {menuItems.find(i => i.path === location.pathname)?.name || 'Admin'}
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
