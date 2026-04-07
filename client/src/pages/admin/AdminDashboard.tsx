import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getStats, getUsers } from '../../api/admin';
import { ChatStats, User } from '../../types';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Avatar from '../../components/common/Avatar';
import Loader from '../../components/common/Loader';
import {
  FaUsers, FaUserCheck, FaComments,
  FaUserPlus, FaArrowRight, FaChartLine, FaInbox,
  FaCalendarDay, FaCalendarWeek,
} from 'react-icons/fa';
import { formatDate } from '../../utils/helpers';

// ── Helpers ──────────────────────────────────────────────────────────────────

const pct = (part: number, total: number) =>
  total === 0 ? 0 : Math.round((part / total) * 100);

// ── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ReactNode;
  iconBg: string;
  trend?: { value: string; positive: boolean };
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sub, icon, iconBg, trend }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className={`${iconBg} w-11 h-11 rounded-xl flex items-center justify-center text-white text-lg shadow-sm`}>
        {icon}
      </div>
      {trend && (
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trend.positive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
          {trend.positive ? '▲' : '▼'} {trend.value}
        </span>
      )}
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────────────

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<ChatStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStats(), getUsers({ page: 1, limit: 6 })])
      .then(([statsRes, usersRes]) => {
        setStats(statsRes.data.data);
        setRecentUsers(usersRes.data.data.users);
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const timeGreeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      {/* Main content — offset for mobile top bar */}
      <main className="flex-1 min-w-0 pt-14 md:pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">

          {/* Page header */}
          <div className="mb-7">
            <p className="text-sm text-gray-400 font-medium">{timeGreeting} 👋</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-0.5">Admin Dashboard</h1>
            <p className="text-sm text-gray-400 mt-1">
              {now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32"><Loader /></div>
          ) : stats ? (
            <div className="space-y-6">

              {/* ── Row 1: Primary KPIs ── */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Total Parents"
                  value={stats.totalUsers}
                  sub={`${stats.activeUsers} active · ${stats.inactiveUsers} inactive`}
                  icon={<FaUsers />}
                  iconBg="bg-blue-500"
                  trend={{ value: `${pct(stats.activeUsers, stats.totalUsers)}% active`, positive: true }}
                />
                <StatCard
                  label="Active Users"
                  value={stats.activeUsers}
                  sub={`${pct(stats.activeUsers, stats.totalUsers)}% of total`}
                  icon={<FaUserCheck />}
                  iconBg="bg-emerald-500"
                />
                <StatCard
                  label="Total Messages"
                  value={stats.totalMessages.toLocaleString()}
                  sub={`Avg ${stats.avgMessagesPerUser} per parent`}
                  icon={<FaComments />}
                  iconBg="bg-violet-500"
                />
                <StatCard
                  label="Total Chats"
                  value={stats.totalChats}
                  sub="Unique parent sessions"
                  icon={<FaInbox />}
                  iconBg="bg-orange-500"
                />
              </div>

              {/* ── Row 2: Activity KPIs ── */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="New Parents Today"
                  value={stats.newUsersToday}
                  icon={<FaCalendarDay />}
                  iconBg="bg-sky-500"
                  trend={stats.newUsersToday > 0 ? { value: 'today', positive: true } : undefined}
                />
                <StatCard
                  label="New This Week"
                  value={stats.newUsersThisWeek}
                  icon={<FaCalendarWeek />}
                  iconBg="bg-teal-500"
                />
                <StatCard
                  label="New This Month"
                  value={stats.newUsersThisMonth}
                  icon={<FaUserPlus />}
                  iconBg="bg-indigo-500"
                />
                <StatCard
                  label="Messages Today"
                  value={stats.messagesToday}
                  sub="User messages only"
                  icon={<FaChartLine />}
                  iconBg="bg-pink-500"
                  trend={stats.messagesToday > 0 ? { value: 'active', positive: true } : undefined}
                />
              </div>

              {/* ── Row 3: Platform health bar + recent users ── */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Platform Health */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
                    <FaChartLine className="text-violet-500" /> Platform Health
                  </h2>

                  {/* User engagement */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-gray-600 font-medium">Active Rate</span>
                        <span className="font-semibold text-gray-900">{pct(stats.activeUsers, stats.totalUsers)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct(stats.activeUsers, stats.totalUsers)}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-gray-600 font-medium">Chat Adoption</span>
                        <span className="font-semibold text-gray-900">{pct(stats.totalChats, stats.totalUsers)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct(stats.totalChats, stats.totalUsers)}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-gray-600 font-medium">Inactive Users</span>
                        <span className="font-semibold text-gray-900">{pct(stats.inactiveUsers, stats.totalUsers)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-400 rounded-full" style={{ width: `${pct(stats.inactiveUsers, stats.totalUsers)}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Quick numbers */}
                  <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-xl font-bold text-gray-900">{stats.avgMessagesPerUser}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Avg msgs / user</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-gray-900">{stats.messagesToday}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Msgs today</p>
                    </div>
                  </div>
                </div>

                {/* Recent Parents */}
                <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                      <FaUsers className="text-blue-500" /> Recent Parents
                    </h2>
                    <Link
                      to="/admin/users"
                      className="flex items-center gap-1 text-blue-600 text-sm hover:text-blue-700 font-medium transition-colors"
                    >
                      View all <FaArrowRight className="text-xs" />
                    </Link>
                  </div>

                  {/* Desktop table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {['Parent', 'Email', 'Status', 'Joined'].map(h => (
                            <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {recentUsers.map(u => (
                          <tr key={u._id} className="hover:bg-gray-50/70 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center space-x-3">
                                <Avatar src={u.avatar} name={u.name} size="sm" />
                                <span className="font-medium text-gray-900 truncate max-w-[140px]">{u.name}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-gray-500 truncate max-w-[160px]">{u.email}</td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                u.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-green-500' : 'bg-red-400'}`} />
                                {u.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-gray-400 text-xs">{formatDate(u.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile card list */}
                  <div className="sm:hidden divide-y divide-gray-100">
                    {recentUsers.map(u => (
                      <div key={u._id} className="px-5 py-4 flex items-center gap-3">
                        <Avatar src={u.avatar} name={u.name} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{u.name}</p>
                          <p className="text-xs text-gray-400 truncate">{u.email}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            u.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                          }`}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-xs text-gray-400">{formatDate(u.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {recentUsers.length === 0 && (
                    <div className="px-6 py-12 text-center text-gray-400 text-sm">No users yet.</div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
