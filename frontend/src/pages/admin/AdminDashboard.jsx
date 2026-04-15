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
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-red-600"></div>
      </div>
    );
  }

  const cards = [
    { title: 'Phim', value: stats.films, icon: FilmIcon, bg: 'bg-red-50 text-red-700' },
    { title: 'Chi nhánh', value: stats.branches, icon: BuildingOfficeIcon, bg: 'bg-zinc-100 text-zinc-700' },
    { title: 'Người dùng', value: stats.users, icon: UsersIcon, bg: 'bg-zinc-100 text-zinc-700' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map(card => (
          <div key={card.title} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className={`rounded-xl p-3 ${card.bg}`}>
                <card.icon className="h-6 w-6" />
              </div>
              <ArrowTrendingUpIcon className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-black text-zinc-900">{card.value}</p>
            <p className="mt-1 text-sm text-zinc-500">{card.title}</p>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}

    </div>
  );
}
