import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { HiOutlineCheck, HiOutlineShieldCheck } from 'react-icons/hi';

const Settings = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => { fetchUser(); }, []);

  const fetchUser = async () => {
    try {
      const { data } = await authAPI.getMe();
      setUser(data.data.user);
      setName(data.data.user.name);
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updateData = { name };
      if (currentPassword && newPassword) {
        if (newPassword !== confirmPassword) {
          toast.error('Passwords do not match');
          setSaving(false);
          return;
        }
        if (newPassword.length < 8) {
          toast.error('Password must be at least 8 characters');
          setSaving(false);
          return;
        }
        updateData.currentPassword = currentPassword;
        updateData.newPassword = newPassword;
      }
      const { data } = await authAPI.updateProfile(updateData);
      setUser(data.data.user);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Profile updated');
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your account</p>
      </div>

      {/* Profile card */}
      <div className="card mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-500/20">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <p className="text-base font-bold text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
          <HiOutlineShieldCheck className={`w-5 h-5 ${user?.isEmailVerified ? 'text-emerald-500' : 'text-gray-300'}`} />
          <span className="text-xs font-semibold text-gray-500">
            Email {user?.isEmailVerified ? 'Verified' : 'Not Verified'}
          </span>
        </div>
      </div>

      {/* Edit form */}
      <div className="card">
        <p className="section-title">Edit Profile</p>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" className="input-field" />
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold text-gray-400 mb-3">Change Password (optional)</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Current Password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="new-password" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" className="input-field" />
          </div>

          <button type="submit" disabled={saving} className="btn-primary flex items-center justify-center gap-2">
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <HiOutlineCheck className="w-5 h-5" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
