import { useState } from 'react';
import api from '../lib/axios';
import { toast } from 'react-toastify';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return toast.warn('Please enter your email');
        setLoading(true);
        try {
            const res = await api.post('/api/auth/forgot-password', { email });
            toast.success(res.data?.message || 'If an account exists, a reset link was sent');
            setEmail('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to request password reset');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-12 bg-gray-900 p-6 rounded border border-blue-300">
            <h2 className="text-2xl font-semibold text-white mb-4">Forgot Password</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <label className="text-sm text-gray-300">Enter your account email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="px-3 py-2 rounded bg-gray-800 text-white border border-gray-700"
                    placeholder="you@example.com"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
            </form>
        </div>
    );
}