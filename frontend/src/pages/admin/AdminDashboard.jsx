import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import {
  FilmIcon,
  BuildingOfficeIcon,
  UsersIcon,
  TicketIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    films: 0,
    branches: 0,
    bookings: 0,
    users: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [filmsRes, branchesRes, bookingsRes, usersRes] = await Promise.allSettled([
          axiosClient.get('/film'),
          axiosClient.get('/branch'),
          axiosClient.get('/booking'),
          axiosClient.get('/users?page=1&size=1'),
        ]);

        setStats({
          films: filmsRes.status === 'fulfilled' ? (filmsRes.value?.length || 0) : 0,
          branches: branchesRes.status === 'fulfilled' ? (branchesRes.value?.length || 0) : 0,
          bookings: bookingsRes.status === 'fulfilled' ? (bookingsRes.value?.length || 0) : 0,
          users: usersRes.status === 'fulfilled' ? (usersRes.value?.totalElements || 0) : 0,
        });

        if (bookingsRes.status === 'fulfilled') {
          setRecentBookings((bookingsRes.value || []).slice(0, 5));
        }
      } catch (error) {
        console.error('Dashboard stats error', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  const cards = [
    { title: 'Phim', value: stats.films, icon: FilmIcon, color: 'from-violet-500 to-purple-600', bg: 'bg-violet-500/10' },
    { title: 'Chi nhánh', value: stats.branches, icon: BuildingOfficeIcon, color: 'from-sky-500 to-cyan-600', bg: 'bg-sky-500/10' },
    { title: 'Đơn đặt vé', value: stats.bookings, icon: TicketIcon, color: 'from-rose-500 to-pink-600', bg: 'bg-rose-500/10' },
    { title: 'Người dùng', value: stats.users, icon: UsersIcon, color: 'from-amber-500 to-orange-600', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map(card => (
          <div key={card.title} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${card.bg}`}>
                <card.icon className={`w-6 h-6 bg-gradient-to-r ${card.color} bg-clip-text text-transparent`} style={{color: 'inherit'}} />
              </div>
              <ArrowTrendingUpIcon className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-bold text-white">{card.value}</p>
            <p className="text-sm text-slate-400 mt-1">{card.title}</p>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Đơn đặt vé gần đây</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-800">
                <th className="px-6 py-3 font-medium">Mã đơn</th>
                <th className="px-6 py-3 font-medium">Trạng thái</th>
                <th className="px-6 py-3 font-medium">Thanh toán</th>
                <th className="px-6 py-3 font-medium">Tổng tiền</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-500">Chưa có đơn đặt vé nào</td>
                </tr>
              ) : (
                recentBookings.map(b => (
                  <tr key={b.bookingId} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-300">{b.bookingCode || b.bookingId?.slice(0, 12)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        b.status === 'CONFIRMED' ? 'bg-green-500/10 text-green-500' :
                        b.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500' :
                        'bg-amber-500/10 text-amber-500'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        b.paymentStatus === 'PAID' ? 'bg-green-500/10 text-green-500' :
                        b.paymentStatus === 'CANCELLED' ? 'bg-red-500/10 text-red-500' :
                        'bg-amber-500/10 text-amber-500'
                      }`}>
                        {b.paymentStatus || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-rose-400 font-bold">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(b.totalAmount || 0)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
