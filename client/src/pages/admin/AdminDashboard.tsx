import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getStats, getUsers } from '../../api/admin';
import { ChatStats, User } from '../../types';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Avatar from '../../components/common/Avatar';
import Loader from '../../components/common/Loader';
import { FaUsers, FaUserCheck, FaUserTimes, FaComments } from 'react-icons/fa';
import { formatDate } from '../../utils/helpers';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<ChatStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getStats(),
      getUsers({ page: 1, limit: 5 }),
    ])
      .then(([statsRes, usersRes]) => {
        setStats(statsRes.data.data);
        setRecentUsers(usersRes.data.data.users);
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: 'Total Parents', value: stats.totalUsers, icon: <FaUsers />, color: 'bg-blue-500' },
    { label: 'Active', value: stats.activeUsers, icon: <FaUserCheck />, color: 'bg-green-500' },
    { label: 'Inactive', value: stats.inactiveUsers, icon: <FaUserTimes />, color: 'bg-red-400' },
    { label: 'Total Messages', value: stats.totalMessages, icon: <FaComments />, color: 'bg-purple-500' },
  ] : [];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>
        {loading ? <Loader /> : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {statCards.map(card => (
                <div key={card.label} className="bg-white rounded-2xl shadow-sm p-6">
                  <div className={`${card.color} text-white w-10 h-10 rounded-xl flex items-center justify-center mb-4`}>
                    {card.icon}
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-gray-500 text-sm mt-1">{card.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Recent Parents</h2>
                <Link to="/admin/users" className="text-blue-600 text-sm hover:underline">View all</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                    <tr>
                      {['Parent', 'Email', 'Status', 'Joined'].map(h => (
                        <th key={h} className="px-6 py-3 text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentUsers.map(u => (
                      <tr key={u._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <Avatar src={u.avatar} name={u.name} size="sm" />
                            <span className="font-medium text-gray-900">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{formatDate(u.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
