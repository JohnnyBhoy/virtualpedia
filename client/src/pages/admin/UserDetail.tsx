import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getUserById, updateUserStatus, getUserChat } from '../../api/admin';
import { User, Message } from '../../types';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Avatar from '../../components/common/Avatar';
import Loader from '../../components/common/Loader';
import {
  FaArrowLeft, FaEnvelope, FaCalendarAlt, FaComments,
  FaUserCheck, FaUserTimes, FaToggleOn, FaToggleOff,
} from 'react-icons/fa';
import { formatDate, formatDateTime } from '../../utils/helpers';

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([getUserById(id), getUserChat(id)])
      .then(([userRes, chatRes]) => {
        setUser(userRes.data.data.user);
        setMessages(chatRes.data.data.messages);
      })
      .catch(() => toast.error('Failed to load user'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleToggle = async () => {
    if (!user || !id) return;
    setToggling(true);
    try {
      const res = await updateUserStatus(id, !user.isActive);
      setUser(res.data.data.user);
      toast.success(`${user.name} ${user.isActive ? 'deactivated' : 'activated'}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setToggling(false);
    }
  };

  const userMessages = messages.filter(m => m.role === 'user');
  const drPediaMessages = messages.filter(m => m.role === 'assistant');

  if (loading) return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 pt-14 md:pt-0 flex items-center justify-center">
        <Loader />
      </main>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 min-w-0 pt-14 md:pt-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-8">

          {/* Back button */}
          <button
            onClick={() => navigate('/admin/users')}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors group"
          >
            <FaArrowLeft className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Manage Users
          </button>

          {user && (
            <>
              {/* Profile card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-5">
                {/* Colored top banner */}
                <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600" />
                <div className="px-6 pb-6">
                  {/* Avatar overlaps banner */}
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-10">
                    <div className="flex items-end gap-4">
                      <div className="ring-4 ring-white rounded-full shadow-md flex-shrink-0">
                        <Avatar src={user.avatar} name={user.name} size="lg" />
                      </div>
                      <div className="pb-1">
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">{user.name}</h2>
                        <span className="text-xs font-semibold uppercase tracking-wide text-blue-500">Parent</span>
                      </div>
                    </div>
                    {/* Status + toggle */}
                    <div className="flex items-center gap-3 pb-1">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${
                        user.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'
                      }`}>
                        {user.isActive ? <FaUserCheck className="text-xs" /> : <FaUserTimes className="text-xs" />}
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={handleToggle}
                        disabled={toggling}
                        className={`inline-flex items-center gap-2 text-sm px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 shadow-sm ${
                          user.isActive
                            ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                            : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                        }`}
                      >
                        {user.isActive ? <FaToggleOff /> : <FaToggleOn />}
                        {toggling ? 'Updating…' : user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>

                  {/* Info grid */}
                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                      <FaEnvelope className="text-blue-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Email</p>
                        <p className="text-sm text-gray-700 font-medium truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                      <FaCalendarAlt className="text-indigo-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Joined</p>
                        <p className="text-sm text-gray-700 font-medium">{formatDate(user.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                      <FaComments className="text-violet-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Total Messages</p>
                        <p className="text-sm text-gray-700 font-medium">{messages.length} messages</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4 mb-5">
                {[
                  { label: 'Total Exchanges', value: Math.floor(messages.length / 2), color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Questions Asked', value: userMessages.length, color: 'text-violet-600', bg: 'bg-violet-50' },
                  { label: 'Dr. Pedia Replies', value: drPediaMessages.length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map(s => (
                  <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center border border-white shadow-sm`}>
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">{s.label}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Chat History */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <FaComments className="text-violet-500" />
                Chat History
              </h3>
              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full font-medium">
                {messages.length} messages
              </span>
            </div>

            <div className="p-5 max-h-[520px] overflow-y-auto space-y-3 bg-gradient-to-b from-slate-50/60 to-white">
              {messages.length === 0 ? (
                <div className="py-16 text-center">
                  <FaComments className="text-4xl text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 font-medium">No chat history yet</p>
                  <p className="text-xs text-gray-400 mt-1">This parent hasn't sent any messages</p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-sm flex-shrink-0 mb-0.5 shadow-sm">
                        🩺
                      </div>
                    )}
                    <div className={`max-w-[75%] sm:max-w-[65%] rounded-2xl px-4 py-3 shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      <p className={`text-xs mt-1.5 ${msg.role === 'user' ? 'text-blue-200 text-right' : 'text-gray-400'}`}>
                        {msg.role === 'user' ? 'Parent' : 'Dr. Pedia'} · {formatDateTime(msg.timestamp)}
                      </p>
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mb-0.5 shadow-sm">
                        {user?.name?.charAt(0).toUpperCase() ?? 'P'}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDetail;
