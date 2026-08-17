import { useState } from 'react';
import { mobileAPI } from '../services/api';
import ImeiInput from '../components/ImeiInput';
import toast from 'react-hot-toast';
import { HiOutlineCheck, HiOutlineRefresh } from 'react-icons/hi';

const AddStock = () => {
  const [loading, setLoading] = useState(false);
  const [imei1, setImei1] = useState('');
  const [imei2, setImei2] = useState('');
  const [key, setKey] = useState(0);
  const [formData, setFormData] = useState({
    brand: '', model: '', ram: '', storage: '', color: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imei1 || imei1.length !== 15) {
      toast.error('IMEI 1 must be 15 digits');
      return;
    }
    setLoading(true);
    try {
      await mobileAPI.addMobile({ imei1, imei2: imei2 || undefined, ...formData });
      toast.success('Mobile added');
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setImei1('');
    setImei2('');
    setFormData({ brand: '', model: '', ram: '', storage: '', color: '' });
    setKey((k) => k + 1);
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add Stock</h1>
        <p className="text-sm text-gray-400 mt-1">Scan IMEI then fill in details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* IMEI Section */}
        <div className="card">
          <p className="section-title">IMEI</p>
          <div className="space-y-3">
            <ImeiInput
              key={`imei1-${key}`}
              value={imei1}
              onChange={setImei1}
              label="IMEI 1 *"
              placeholder=""
              autoFocus
            />
            <ImeiInput
              key={`imei2-${key}`}
              value={imei2}
              onChange={setImei2}
              label="IMEI 2"
              placeholder=""
            />
          </div>
        </div>

        {/* Details */}
        <div className="card">
          <p className="section-title">Phone Details</p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Brand *</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
                autoComplete="off"
                placeholder=""
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Model *</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                required
                autoComplete="off"
                placeholder=""
                className="input-field"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">RAM</label>
                <input
                  type="text"
                  name="ram"
                  value={formData.ram}
                  onChange={handleChange}
                  autoComplete="off"
                  placeholder=""
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Storage</label>
                <input
                  type="text"
                  name="storage"
                  value={formData.storage}
                  onChange={handleChange}
                  autoComplete="off"
                  placeholder=""
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Color</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  autoComplete="off"
                  placeholder=""
                  className="input-field"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-2">
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <HiOutlineCheck className="w-5 h-5" />
            )}
            {loading ? 'Adding...' : 'Add Mobile'}
          </button>
          <button type="button" onClick={resetForm} className="btn-secondary flex items-center justify-center gap-2 w-auto px-5">
            <HiOutlineRefresh className="w-5 h-5" />
            Clear
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStock;
