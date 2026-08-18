import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import { DashboardSkeleton } from '../components/Skeleton';
import toast from 'react-hot-toast';
import {
  HiOutlineViewGrid,
  HiOutlineCheckCircle,
  HiOutlineShoppingBag,
} from 'react-icons/hi';

const statCardConfig = [
  { key: 'total', label: 'Total', icon: HiOutlineViewGrid, color: 'from-indigo-500 to-indigo-600', bg: 'bg-indigo-50', text: 'text-indigo-600' },
  { key: 'available', label: 'Available', icon: HiOutlineCheckCircle, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  { key: 'sold', label: 'Sold', icon: HiOutlineShoppingBag, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-600' },
];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchStats = async () => {
      try {
        const { data } = await dashboardAPI.getStats();
        if (!cancelled) setStats(data.data);
      } catch {
        if (!cancelled) toast.error('Failed to load dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchStats();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Your stock overview</p>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        {statCardConfig.map((stat) => (
          <div key={stat.key} className="card text-center sm:text-left">
            <div className={`w-10 h-10 ${stat.bg} rounded-2xl flex items-center justify-center mb-3 mx-auto sm:mx-0`}>
              <stat.icon className={`w-5 h-5 ${stat.text}`} />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats?.[stat.key] || 0}</p>
            <p className="text-xs font-medium text-gray-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">Recently Added</h2>
          <Link to="/stock" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
            View All
          </Link>
        </div>

        {stats?.recentMobiles?.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <HiOutlineViewGrid className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-sm text-gray-400 mb-3">No mobiles yet</p>
            <Link to="/add-stock" className="btn-primary inline-block text-sm px-6">
              Add First Mobile
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {stats?.recentMobiles?.map((mobile) => (
              <Link
                key={mobile._id}
                to={`/stock/${mobile._id}`}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-gray-500">
                      {mobile.brand?.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {mobile.brand} {mobile.model}
                    </p>
                    <p className="text-xs font-mono text-gray-400 truncate">
                      {mobile.hasImei === false ? (
                        <span className="font-sans text-gray-400 italic">No IMEI</span>
                      ) : (
                        mobile.imei1
                      )}
                    </p>
                  </div>
                </div>
                <span className={`flex-shrink-0 px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wide ${
                  mobile.status === 'AVAILABLE'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-amber-50 text-amber-600'
                }`}>
                  {mobile.status === 'AVAILABLE' ? 'In Stock' : 'Sold'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
