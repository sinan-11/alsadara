import { NavLink, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../utils/AuthContext';
import toast from 'react-hot-toast';
import {
  HiOutlineViewGrid,
  HiOutlineCollection,
  HiOutlinePlusCircle,
  HiOutlineCog,
  HiOutlineLogout,
} from 'react-icons/hi';

const navItems = [
  { to: '/dashboard', icon: HiOutlineViewGrid, label: 'Dashboard' },
  { to: '/stock', icon: HiOutlineCollection, label: 'Stock' },
  { to: '/add-stock', icon: HiOutlinePlusCircle, label: 'Add Stock' },
  { to: '/settings', icon: HiOutlineCog, label: 'Settings' },
];

const Sidebar = ({ onClose }) => {
  const navigate = useNavigate();
  const { logoutUser } = useAuth();

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      logoutUser();
      toast.success('Signed out');
      navigate('/login');
    } catch {
      toast.error('Failed to sign out');
    }
  };

  const handleNav = () => {
    if (onClose) onClose();
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-150 ${
      isActive
        ? 'bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100'
        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
    }`;

  return (
    <div className="h-full bg-white border-r border-gray-100 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">AL SADARA</h1>
            <p className="text-[11px] text-gray-400 font-medium">Mobile Phones</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={linkClass}
            onClick={handleNav}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-gray-400 hover:text-red-600 hover:bg-red-50 w-full transition-all duration-150"
        >
          <HiOutlineLogout className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
