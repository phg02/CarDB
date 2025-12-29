import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const token = params.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('No reset token found');
      navigate('/forgot-password');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) return toast.warn('Please fill both fields');
    if (newPassword !== confirmPassword) return toast.warn('Passwords do not match');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/reset-password', { token, newPassword, confirmPassword });
      toast.success(res.data?.message || 'Password reset successfully');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-gray-900 p-6 rounded border border-blue-300">
      <h2 className="text-2xl font-semibold text-white mb-4">Reset Password</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="text-sm text-gray-300">New password</label>
        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="px-3 py-2 rounded bg-gray-800 text-white border border-gray-700" />
        <label className="text-sm text-gray-300">Confirm password</label>
        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="px-3 py-2 rounded bg-gray-800 text-white border border-gray-700" />
        <button type="submit" disabled={loading} className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">{loading ? 'Submitting...' : 'Reset Password'}</button>
      </form>
    </div>
  );
}
