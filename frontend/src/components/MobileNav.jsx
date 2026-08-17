import { NavLink } from 'react-router-dom';
import {
  HiOutlineViewGrid,
  HiOutlineCollection,
  HiOutlinePlusCircle,
  HiOutlineCog,
} from 'react-icons/hi';

const navItems = [
  { to: '/dashboard', icon: HiOutlineViewGrid, label: 'Home' },
  { to: '/stock', icon: HiOutlineCollection, label: 'Stock' },
  { to: '/add-stock', icon: HiOutlinePlusCircle, label: 'Add' },
  { to: '/settings', icon: HiOutlineCog, label: 'Settings' },
];

const MobileNav = () => {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/80 backdrop-blur-xl border-t border-gray-200/50 pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-150 min-w-[60px] ${
                isActive
                  ? 'text-indigo-600'
                  : 'text-gray-400 active:text-gray-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-indigo-50' : ''}`}>
                  <item.icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
                </div>
                <span className={`text-[10px] font-semibold ${isActive ? 'text-indigo-600' : ''}`}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;
