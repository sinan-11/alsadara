import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { mobileAPI } from '../services/api';
import { StockCardSkeleton } from '../components/Skeleton';
import ExportPdfButton from '../components/ExportPdfButton';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineSearch, HiOutlineX } from 'react-icons/hi';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'SOLD', label: 'Sold' },
];

const Stock = () => {
  const [mobiles, setMobiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const searchRef = useRef(null);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const fetchMobiles = useCallback(async (page, query, status) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const params = { search: query, page, limit: 20 };
      if (status !== 'ALL') params.status = status;
      const { data } = await mobileAPI.getMobiles(params);
      if (!controller.signal.aborted) {
        setMobiles(data.data.mobiles);
        setPagination(data.pagination);
      }
    } catch {
      if (!controller.signal.aborted) toast.error('Failed to load stock');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchMobiles(pagination.page, search, statusFilter), 300);
    return () => clearTimeout(debounceRef.current);
  }, [pagination.page, search, statusFilter, fetchMobiles]);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setPagination((p) => ({ ...p, page: 1 }));
      fetchMobiles(1, search, statusFilter);
    }
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setPagination((p) => ({ ...p, page: 1 }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Stock</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {pagination.total} mobile{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          to="/add-stock"
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-2xl text-sm font-semibold hover:bg-indigo-700 active:scale-[0.97] transition-all shadow-sm shadow-indigo-600/20"
        >
          <HiOutlinePlus className="w-5 h-5" />
          <span className="hidden sm:inline">Add Stock</span>
        </Link>
      </div>

      <div className="card mb-5 !p-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search "
              autoComplete="off"
              spellCheck={false}
              className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all"
            />
            {search && (
              <button
                onClick={() => { setSearch(''); searchRef.current?.focus(); setPagination((p) => ({ ...p, page: 1 })); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                <HiOutlineX className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <div className="flex bg-gray-100 rounded-xl p-0.5">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    statusFilter === opt.value
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <ExportPdfButton filters={{ search, status: statusFilter }} />
        </div>
      </div>

      {loading ? (
        <StockCardSkeleton count={5} />
      ) : mobiles.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <HiOutlineSearch className="w-7 h-7 text-gray-300" />
          </div>
          <p className="text-sm text-gray-400 mb-3">
            {search || statusFilter !== 'ALL' ? 'No results found' : 'No stock yet'}
          </p>
          {!search && statusFilter === 'ALL' && (
            <Link to="/add-stock" className="btn-primary inline-block text-sm px-6 w-auto">
              Add Mobile
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {mobiles.map((mobile) => (
              <Link
                key={mobile._id}
                to={`/stock/${mobile._id}`}
                className="card flex items-center justify-between !p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-gray-500">
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
                    <div className="flex items-center gap-2 mt-1">
                      {mobile.sellingPrice > 0 && (
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md">
                          ₹{mobile.sellingPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                      {mobile.storage && (
                        <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md">
                          {mobile.storage}
                        </span>
                      )}
                      {mobile.color && (
                        <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md">
                          {mobile.color}
                        </span>
                      )}
                    </div>
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

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-1">
              <p className="text-xs text-gray-400">
                Page {pagination.page} / {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 text-xs font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 transition-colors"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 text-xs font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Stock;
