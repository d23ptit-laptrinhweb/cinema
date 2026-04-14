import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserCircleIcon, TicketIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'; // Thêm icon Đăng xuất

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation(); // Dùng location để trigger re-render khi chuyển trang
  const token = localStorage.getItem('token');
  const adminToken = localStorage.getItem('adminToken');

  const links = [
    { to: '/my-bookings', label: 'Vé của tôi', auth: true },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/95 text-white backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <TicketIcon className="h-8 w-8 text-red-500 transition-transform duration-300 group-hover:scale-110" />
              <span className="text-2xl font-black tracking-tight text-white">
                Xemphim
              </span>
            </Link>
            <div className="hidden gap-6 md:flex">
              {links
                .filter((item) => !item.auth || token)
                .map((item) => {
                  const active = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`text-sm font-semibold transition ${active ? 'text-red-400' : 'text-zinc-300 hover:text-white'}`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {token ? (
              <>
                {adminToken && (
                  <Link
                    to="/admin"
                    className="hidden rounded-lg border border-red-500/40 bg-red-500/20 px-3 py-2 text-xs font-bold uppercase tracking-wide text-red-200 hover:bg-red-500/30 sm:inline-block"
                  >
                    Admin
                  </Link>
                )}
                <Link to="/profile" className="flex items-center gap-2 text-zinc-300 transition-colors hover:text-white">
                  <UserCircleIcon className="h-6 w-6" />
                  <span className="hidden sm:inline">Tài khoản</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="ml-1 flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-zinc-200 transition hover:border-red-500/50 hover:text-red-300"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span className="hidden sm:inline">Đăng xuất</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="flex items-center gap-2 text-zinc-300 transition-colors hover:text-white">
                  <UserCircleIcon className="h-6 w-6" />
                  <span className="hidden sm:inline">Đăng nhập</span>
                </Link>
                <Link to="/register" className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700">
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
