import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getUsers, updateUserStatus } from '../../api/admin';
import { User } from '../../types';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Avatar from '../../components/common/Avatar';
import Loader from '../../components/common/Loader';
import {
  FaSearch, FaEye, FaUsers, FaUserCheck, FaUserTimes,
  FaToggleOn, FaToggleOff, FaChevronLeft, FaChevronRight,
} from 'react-icons/fa';
import { formatDate } from '../../utils/helpers';

const LIMIT = 10;

const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [draftSearch, setDraftSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUsers({ page, limit: LIMIT, search });
      setUsers(res.data.data.users);
      setTotalPages(res.data.data.totalPages);
      setTotal(res.data.data.total);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(draftSearch);
  };

  const handleClearSearch = () => {
    setDraftSearch('');
    setSearch('');
    setPage(1);
  };

  const handleToggle = async (u: User) => {
    setToggling(u._id);
    try {
      await updateUserStatus(u._id, !u.isActive);
      toast.success(`${u.name} ${u.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchUsers();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setToggling(null);
    }
  };

  const activeCount = users.filter(u => u.isActive).length;
  const inactiveCount = users.filter(u => !u.isActive).length;

  const from = total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const to = Math.min(page * LIMIT, total);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 min-w-0 pt-14 md:pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Parents</h1>
            <p className="text-sm text-gray-400 mt-1">View, search, and manage all registered parents</p>
          </div>

          {/* Summary pills */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
              <FaUsers className="text-blue-500" />
              <span className="text-sm font-semibold text-gray-700">{total}</span>
              <span className="text-xs text-gray-400">Total</span>
            </div>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
              <FaUserCheck className="text-emerald-500" />
              <span className="text-sm font-semibold text-gray-700">{activeCount}</span>
              <span className="text-xs text-gray-400">Active (this page)</span>
            </div>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
              <FaUserTimes className="text-red-400" />
              <span className="text-sm font-semibold text-gray-700">{inactiveCount}</span>
              <span className="text-xs text-gray-400">Inactive (this page)</span>
            </div>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-3 mb-5">
            <div className="relative flex-1 max-w-lg">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
              <input
                type="text"
                value={draftSearch}
                onChange={e => setDraftSearch(e.target.value)}
                placeholder="Search by name or email…"
                className="w-full border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              />
              {draftSearch && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
                >×</button>
              )}
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-colors"
            >
              Search
            </button>
          </form>

          {/* Table card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

            {loading ? (
              <div className="py-24 flex justify-center"><Loader /></div>
            ) : users.length === 0 ? (
              <div className="py-20 text-center">
                <FaUsers className="text-4xl text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">No parents found</p>
                {search && <p className="text-sm text-gray-400 mt-1">Try a different search term</p>}
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {['Parent', 'Email', 'Status', 'Joined', 'Actions'].map(h => (
                          <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {users.map(u => (
                        <tr key={u._id} className="hover:bg-gray-50/80 transition-colors group">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar src={u.avatar} name={u.name} size="sm" />
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 truncate max-w-[160px]">{u.name}</p>
                                <p className="text-xs text-gray-400">Parent</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-gray-500 text-sm truncate max-w-[200px]">{u.email}</td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              u.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-green-500' : 'bg-red-400'}`} />
                              {u.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">{formatDate(u.createdAt)}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/admin/users/${u._id}`}
                                className="inline-flex items-center gap-1.5 text-xs bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-600 px-3 py-1.5 rounded-lg font-medium transition-colors"
                              >
                                <FaEye className="text-xs" /> View
                              </Link>
                              <button
                                onClick={() => handleToggle(u)}
                                disabled={toggling === u._id}
                                className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                                  u.isActive
                                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                                }`}
                              >
                                {u.isActive ? <FaToggleOff /> : <FaToggleOn />}
                                {toggling === u._id ? '…' : u.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile card list */}
                <div className="sm:hidden divide-y divide-gray-100">
                  {users.map(u => (
                    <div key={u._id} className="px-4 py-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar src={u.avatar} name={u.name} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{u.name}</p>
                          <p className="text-xs text-gray-400 truncate">{u.email}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                          u.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                        }`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Joined {formatDate(u.createdAt)}</span>
                        <div className="flex gap-2">
                          <Link
                            to={`/admin/users/${u._id}`}
                            className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 px-3 py-1.5 rounded-lg font-medium transition-colors"
                          >
                            <FaEye className="text-xs" /> View
                          </Link>
                          <button
                            onClick={() => handleToggle(u)}
                            disabled={toggling === u._id}
                            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                              u.isActive ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
                            }`}
                          >
                            {toggling === u._id ? '…' : u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="px-5 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-sm text-gray-400">
                  Showing <span className="font-semibold text-gray-700">{from}–{to}</span> of <span className="font-semibold text-gray-700">{total}</span> parents
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    <FaChevronLeft className="text-xs" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce<(number | '...')[]>((acc, p, i, arr) => {
                      if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === '...' ? (
                        <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p as number)}
                          className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                            page === p
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    <FaChevronRight className="text-xs" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManageUsers;
