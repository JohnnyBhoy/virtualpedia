import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getUserById, updateUserStatus, getUserChat } from '../../api/admin';
import { User, Message } from '../../types';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Avatar from '../../components/common/Avatar';
import Loader from '../../components/common/Loader';
import { FaArrowLeft } from 'react-icons/fa';
import { formatDate, formatDateTime } from '../../utils/helpers';

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

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
    try {
      const res = await updateUserStatus(id, !user.isActive);
      setUser(res.data.data.user);
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
    } catch { toast.error('Failed to update status'); }
  };

  if (loading) return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 p-8"><Loader /></main>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 p-8 max-w-4xl">
        <button onClick={() => navigate('/admin/users')} className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors">
          <FaArrowLeft /><span>Back to Users</span>
        </button>

        {user && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar src={user.avatar} name={user.name} size="lg" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                  <p className="text-gray-500">{user.email}</p>
                  <p className="text-gray-400 text-sm mt-1">Joined {formatDate(user.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
                <button
                  onClick={handleToggle}
                  className={`text-sm px-4 py-2 rounded-xl transition-colors ${user.isActive ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                >
                  {user.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat History */}
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Chat History ({messages.length} messages)</h3>
          </div>
          <div className="p-6 max-h-96 overflow-y-auto space-y-4">
            {messages.length === 0 ? (
              <p className="text-gray-400 text-center py-6">No chat history</p>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                      {formatDateTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDetail;
