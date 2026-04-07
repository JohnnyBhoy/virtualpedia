import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaTachometerAlt, FaUsers, FaSignOutAlt, FaStethoscope } from 'react-icons/fa';

const AdminSidebar: React.FC = () => {
  const { logout } = useAuth();

  const navItems = [
    { to: '/admin', end: true, icon: <FaTachometerAlt />, label: 'Dashboard' },
    { to: '/admin/users', icon: <FaUsers />, label: 'Users' },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col min-h-screen">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <FaStethoscope className="text-blue-400 text-xl" />
          <span className="font-bold text-lg">VirtualPedia</span>
        </div>
        <p className="text-gray-400 text-xs mt-1">Admin Panel</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            {item.icon}<span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="flex items-center space-x-2 text-gray-400 hover:text-white text-sm transition-colors w-full"
        >
          <FaSignOutAlt /><span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
