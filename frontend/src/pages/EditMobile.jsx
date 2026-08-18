import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mobileAPI } from '../services/api';
import ImeiInput from '../components/ImeiInput';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { HiOutlineCheck } from 'react-icons/hi';

const EditMobile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imei1, setImei1] = useState('');
  const [imei2, setImei2] = useState('');
  const [hasImei, setHasImei] = useState(true);
  const [formData, setFormData] = useState({
    brand: '', model: '', ram: '', storage: '', color: '', status: 'AVAILABLE',
    purchasePrice: '', sellingPrice: '',
  });

  useEffect(() => { fetchMobile(); }, [id]);

  const fetchMobile = async () => {
    try {
      const { data } = await mobileAPI.getMobileById(id);
      const m = data.data.mobile;
      setHasImei(m.hasImei !== false);
      setImei1(m.imei1 || '');
      setImei2(m.imei2 || '');
      setFormData({
        brand: m.brand, model: m.model, ram: m.ram || '',
        storage: m.storage || '', color: m.color || '', status: m.status,
        purchasePrice: m.purchasePrice || '',
        sellingPrice: m.sellingPrice || '',
      });
    } catch {
      toast.error('Mobile not found');
      navigate('/stock');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (hasImei) {
      if (!imei1 || imei1.length !== 15) {
        toast.error('IMEI 1 must be 15 digits');
        return;
      }
    }
    setSaving(true);
    try {
      const payload = {
        hasImei,
        brand: formData.brand,
        model: formData.model,
        ram: formData.ram,
        storage: formData.storage,
        color: formData.color,
        status: formData.status,
        purchasePrice: formData.purchasePrice ? Number(formData.purchasePrice) : 0,
        sellingPrice: formData.sellingPrice ? Number(formData.sellingPrice) : 0,
      };
      if (hasImei) {
        payload.imei1 = imei1;
        payload.imei2 = imei2 || undefined;
      }
      await mobileAPI.updateMobile(id, payload);
      toast.success('Updated');
      navigate(`/stock/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner /></div>;

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Mobile</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <p className="section-title mb-0">IMEI</p>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span className="text-xs font-semibold text-gray-500">No IMEI (Tab)</span>
              <button
                type="button"
                onClick={() => setHasImei((v) => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  hasImei ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    hasImei ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>
          {hasImei && (
            <div className="space-y-3">
              <ImeiInput value={imei1} onChange={setImei1} label="IMEI 1 *" />
              <ImeiInput value={imei2} onChange={setImei2} label="IMEI 2" />
            </div>
          )}
          {!hasImei && (
            <p className="text-xs text-gray-400 bg-gray-50 rounded-xl p-3 text-center">
              IMEI fields are hidden for items without IMEI (tabs, accessories, etc.)
            </p>
          )}
        </div>

        <div className="card">
          <p className="section-title">Details</p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Brand *</label>
              <input type="text" name="brand" value={formData.brand} onChange={handleChange} required autoComplete="off" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Model *</label>
              <input type="text" name="model" value={formData.model} onChange={handleChange} required autoComplete="off" className="input-field" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">RAM</label>
                <input type="text" name="ram" value={formData.ram} onChange={handleChange} autoComplete="off" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Storage</label>
                <input type="text" name="storage" value={formData.storage} onChange={handleChange} autoComplete="off" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Color</label>
                <input type="text" name="color" value={formData.color} onChange={handleChange} autoComplete="off" className="input-field" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} autoComplete="off" className="input-field">
                <option value="AVAILABLE">Available</option>
                <option value="SOLD">Sold</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <p className="section-title">Pricing</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Purchase Price</label>
              <input type="number" name="purchasePrice" value={formData.purchasePrice} onChange={handleChange} min="0" autoComplete="off" placeholder="0" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Selling Price</label>
              <input type="number" name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} min="0" autoComplete="off" placeholder="0" className="input-field" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary flex items-center justify-center gap-2">
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <HiOutlineCheck className="w-5 h-5" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => navigate(`/stock/${id}`)} className="btn-secondary w-auto px-5">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMobile;
