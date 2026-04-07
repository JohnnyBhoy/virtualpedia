import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaTachometerAlt, FaUsers, FaSignOutAlt, FaStethoscope, FaBars, FaTimes,
} from 'react-icons/fa';

const navItems = [
  { to: '/admin', end: true, icon: <FaTachometerAlt />, label: 'Dashboard' },
  { to: '/admin/users', icon: <FaUsers />, label: 'Manage Users' },
];

const AdminSidebar: React.FC = () => {
  const { logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-700/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FaStethoscope className="text-blue-400 text-xl" />
            <span className="font-bold text-lg text-white tracking-tight">VirtualPedia</span>
          </div>
          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setMobileOpen(false)}
          >
            <FaTimes />
          </button>
        </div>
        <span className="mt-1 inline-block text-xs font-semibold uppercase tracking-widest text-blue-400 bg-blue-900/40 px-2 py-0.5 rounded-full">
          Admin Panel
        </span>
      </div>

      {/* Admin profile mini card */}
      <div className="px-6 py-4 border-b border-gray-700/40">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase() ?? 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name ?? 'Admin'}</p>
            <p className="text-xs text-gray-400 truncate">{(user as any)?.email ?? ''}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 px-3 mb-2">Main Menu</p>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-700/60">
        <button
          onClick={logout}
          className="flex items-center space-x-3 text-gray-400 hover:text-red-400 text-sm transition-colors w-full px-3 py-2 rounded-xl hover:bg-gray-800 group"
        >
          <FaSignOutAlt className="group-hover:text-red-400" />
          <span>Logout</span>
        </button>
        <p className="text-xs text-gray-600 text-center mt-3">VirtualPedia © {new Date().getFullYear()}</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900 border-b border-gray-700 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FaStethoscope className="text-blue-400" />
          <span className="font-bold text-white">VirtualPedia</span>
          <span className="text-xs text-blue-400 font-semibold">Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-gray-400 hover:text-white p-1"
        >
          <FaBars className="text-xl" />
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div className={`md:hidden fixed top-0 left-0 z-50 h-full w-72 bg-gray-900 transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-gray-900 flex-col min-h-screen sticky top-0">
        {sidebarContent}
      </aside>
    </>
  );
};

export default AdminSidebar;
