import { useAuth } from '../utils/AuthContext';
import { HiOutlineMenu, HiOutlineBell } from 'react-icons/hi';

const Navbar = ({ onMenuToggle }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl border-b border-gray-100/50">
      <div className="flex items-center justify-between px-4 lg:px-8 h-16">
        {/* Mobile: hamburger + logo */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={onMenuToggle}
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <HiOutlineMenu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span className="text-base font-bold text-gray-900">AL SADARA</span>
          </div>
        </div>

        {/* Desktop: just the right side */}
        <div className="hidden lg:block" />

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors relative">
            <HiOutlineBell className="w-5 h-5 text-gray-500" />
          </button>
          <div className="flex items-center gap-2.5 pl-3 border-l border-gray-100">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-gray-800 leading-tight">{user?.name}</p>
              <p className="text-[11px] text-gray-400">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
