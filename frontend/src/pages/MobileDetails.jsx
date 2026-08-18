import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { mobileAPI } from '../services/api';
import { formatDate } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';

const MobileDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mobile, setMobile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchMobile(); }, [id]);

  const fetchMobile = async () => {
    try {
      const { data } = await mobileAPI.getMobileById(id);
      setMobile(data.data.mobile);
    } catch {
      toast.error('Mobile not found');
      navigate('/stock');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await mobileAPI.deleteMobile(id);
      toast.success('Deleted');
      navigate('/stock');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
      setShowDelete(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner /></div>;
  if (!mobile) return null;

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {mobile.brand} {mobile.model}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {[mobile.ram, mobile.storage, mobile.color].filter(Boolean).join(' / ') || 'No details'}
            </p>
          </div>
          <span className={`flex-shrink-0 px-3 py-1.5 text-xs font-bold rounded-full uppercase tracking-wide ${
            mobile.status === 'AVAILABLE'
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-amber-50 text-amber-600'
          }`}>
            {mobile.status === 'AVAILABLE' ? 'In Stock' : 'Sold'}
          </span>
        </div>
      </div>

      {/* IMEI card */}
      <div className="card mb-4">
        <p className="section-title">IMEI</p>
        {mobile.hasImei === false ? (
          <div className="p-3 bg-gray-50 rounded-xl text-center">
            <span className="text-sm text-gray-400 italic">No IMEI - Item without IMEI</span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-xs font-semibold text-gray-400">IMEI 1</span>
              <span className="text-sm font-mono font-semibold text-gray-800">{mobile.imei1}</span>
            </div>
            {mobile.imei2 && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-xs font-semibold text-gray-400">IMEI 2</span>
                <span className="text-sm font-mono font-semibold text-gray-800">{mobile.imei2}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Details card */}
      <div className="card mb-4">
        <p className="section-title">Details</p>
        <div className="space-y-2">
          {[
            { label: 'Brand', value: mobile.brand },
            { label: 'Model', value: mobile.model },
            { label: 'RAM', value: mobile.ram },
            { label: 'Storage', value: mobile.storage },
            { label: 'Color', value: mobile.color },
            { label: 'Purchase Price', value: mobile.purchasePrice > 0 ? `₹${mobile.purchasePrice.toLocaleString('en-IN')}` : null },
            { label: 'Selling Price', value: mobile.sellingPrice > 0 ? `₹${mobile.sellingPrice.toLocaleString('en-IN')}` : null },
            { label: 'Added', value: formatDate(mobile.createdAt) },
          ].filter((r) => r.value).map((row) => (
            <div key={row.label} className="flex items-center justify-between py-2">
              <span className="text-xs font-semibold text-gray-400">{row.label}</span>
              <span className={`text-sm font-medium ${row.label === 'Selling Price' ? 'text-indigo-600 font-bold' : 'text-gray-700'}`}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link to={`/stock/${id}/edit`} className="btn-primary flex items-center justify-center gap-2">
          <HiOutlinePencil className="w-5 h-5" />
          Edit
        </Link>
        <button
          onClick={() => setShowDelete(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-red-50 text-red-600 rounded-2xl font-semibold hover:bg-red-100 active:scale-[0.97] transition-all"
        >
          <HiOutlineTrash className="w-5 h-5" />
          Delete
        </button>
      </div>

      <ConfirmDialog
        isOpen={showDelete}
        title="Delete Mobile"
        message="This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
};

export default MobileDetails;
