import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserCircleIcon, TicketIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'; // Thêm icon Đăng xuất

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation(); // Dùng location để trigger re-render khi chuyển trang
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0f172a]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Main nav */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <TicketIcon className="w-8 h-8 text-rose-500 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-rose-600">
                Xemphim
              </span>
            </Link>
            
          </div>

          {/* User actions */}
          <div className="flex items-center gap-4">
            {token ? (
              <>
                <Link to="/profile" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                  <UserCircleIcon className="w-6 h-6" />
                  <span className="hidden sm:inline">Trang cá nhân</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-2 text-rose-500 hover:text-rose-400 transition-colors ml-4">
                  <ArrowRightOnRectangleIcon className="w-6 h-6" />
                  <span className="hidden sm:inline">Đăng xuất</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                  <UserCircleIcon className="w-6 h-6" />
                  <span className="hidden sm:inline">Đăng nhập</span>
                </Link>
                <Link to="/register" className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-full font-medium transition-colors shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40">
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
