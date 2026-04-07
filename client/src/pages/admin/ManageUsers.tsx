import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getUsers, updateUserStatus } from '../../api/admin';
import { User } from '../../types';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Avatar from '../../components/common/Avatar';
import Loader from '../../components/common/Loader';
import { FaSearch, FaEye } from 'react-icons/fa';
import { formatDate } from '../../utils/helpers';

const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUsers({ page, limit: 10, search });
      setUsers(res.data.data.users);
      setTotalPages(res.data.data.totalPages);
      setTotal(res.data.data.total);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggle = async (user: User) => {
    try {
      await updateUserStatus(user._id, !user.isActive);
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch { toast.error('Failed to update status'); }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Parents ({total})</h1>
        </div>

        <form onSubmit={handleSearch} className="flex space-x-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full border border-gray-300 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm hover:bg-blue-700 transition-colors">Search</button>
        </form>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? <Loader /> : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  {['Parent', 'Email', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
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
                    <td className="px-6 py-4 space-x-2">
                      <Link to={`/admin/users/${u._id}`} className="inline-flex items-center space-x-1 text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                        <FaEye /><span>View</span>
                      </Link>
                      <button
                        onClick={() => handleToggle(u)}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${u.isActive ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && users.length === 0 && (
            <p className="text-center text-gray-500 py-10">No users found</p>
          )}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
              <div className="space-x-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors">Prev</button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors">Next</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ManageUsers;
