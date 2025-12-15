# Frontend Implementation Examples

## 1. Auth Service Setup

### `src/services/authService.js`
```javascript
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth';

// Create axios instance with defaults
const authAPI = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies
});

export const authService = {
  // Send OTP
  sendOTP: async (email) => {
    const response = await authAPI.post('/send-otp', { email });
    return response.data;
  },

  // Verify OTP and complete registration
  verifyOTP: async (email, otp, name, phone, password) => {
    const response = await authAPI.post('/verify-otp', {
      email,
      otp,
      name,
      phone,
      password,
    });
    return response.data;
  },

  // Login
  login: async (email, password) => {
    const response = await authAPI.post('/login', { email, password });
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await authAPI.post('/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token, newPassword, confirmPassword) => {
    const response = await authAPI.post('/reset-password', {
      token,
      newPassword,
      confirmPassword,
    });
    return response.data;
  },

  // Refresh token
  refreshToken: async () => {
    const response = await authAPI.post('/refresh-token', {});
    return response.data;
  },

  // Logout
  logout: async () => {
    const token = localStorage.getItem('accessToken');
    const response = await authAPI.post('/logout', {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

// Export axios instance for other API calls
export default authAPI;
```

---

## 2. State Management (Zustand)

### `src/store/authStore.js`
```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isLoggedIn: false,
      isVerified: false,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user }),
      setAccessToken: (token) => set({ accessToken: token }),
      setIsLoggedIn: (status) => set({ isLoggedIn: status }),
      setIsVerified: (status) => set({ isVerified: status }),
      setIsLoading: (status) => set({ isLoading: status }),
      setError: (error) => set({ error }),

      login: (data) => {
        set({
          user: data.user,
          accessToken: data.accessToken,
          isLoggedIn: true,
          isVerified: data.user.verified,
          error: null,
        });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          isLoggedIn: false,
          isVerified: false,
          error: null,
        });
        localStorage.removeItem('accessToken');
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ accessToken: state.accessToken }),
    }
  )
);
```

---

## 3. API Interceptor Setup

### `src/utils/apiClient.js`
```javascript
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { accessToken } = await authService.refreshToken();
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 4. Registration Component (2-Step Form)

### `src/components/register/RegisterForm.jsx`
```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../../services/authService';

export default function RegisterForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email/OTP, 2: Details
  const [loading, setLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Step 1: Email & OTP
  const [formStep1, setFormStep1] = useState({
    email: '',
    otp: '',
  });

  // Step 2: Details
  const [formStep2, setFormStep2] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  // Handle Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!formStep1.email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.sendOTP(formStep1.email);
      if (response.success) {
        toast.success('OTP sent to your email!');
        setOtpTimer(600); // 10 minutes in seconds
        startOtpTimer();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // OTP Timer
  const startOtpTimer = () => {
    const interval = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!formStep1.otp) {
      toast.error('Please enter OTP');
      return;
    }

    setStep(2);
  };

  // Handle Complete Registration
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formStep2.name || formStep2.name.length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }

    if (!formStep2.phone || formStep2.phone.length < 10) {
      toast.error('Phone number must be at least 10 digits');
      return;
    }

    if (!formStep2.password || formStep2.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (formStep2.password !== formStep2.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.verifyOTP(
        formStep1.email,
        formStep1.otp,
        formStep2.name,
        formStep2.phone,
        formStep2.password
      );

      if (response.success) {
        toast.success('Registration completed! Please login');
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <form onSubmit={(e) => { e.preventDefault(); }} className="space-y-4">
        <div>
          <input
            type="email"
            placeholder="Email"
            value={formStep1.email}
            onChange={(e) => setFormStep1({ ...formStep1, email: e.target.value })}
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        {otpTimer > 0 ? (
          <div className="text-center text-sm text-gray-600">
            OTP expires in: {formatTime(otpTimer)}
          </div>
        ) : null}

        <button
          onClick={handleSendOTP}
          disabled={loading || otpTimer > 0}
          className="w-full bg-blue-500 text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Sending...' : otpTimer > 0 ? 'OTP Sent' : 'Send OTP'}
        </button>

        {otpTimer > 0 && (
          <div>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              maxLength="6"
              value={formStep1.otp}
              onChange={(e) =>
                setFormStep1({ ...formStep1, otp: e.target.value })
              }
              className="w-full px-4 py-2 border rounded"
            />
            <button
              onClick={handleVerifyOTP}
              disabled={formStep1.otp.length !== 6}
              className="w-full bg-green-500 text-white py-2 rounded mt-2 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>Name</label>
        <input
          type="text"
          value={formStep2.name}
          onChange={(e) => setFormStep2({ ...formStep2, name: e.target.value })}
          className="w-full px-4 py-2 border rounded"
        />
      </div>

      <div>
        <label>Email (Read-only)</label>
        <input
          type="email"
          value={formStep1.email}
          disabled
          className="w-full px-4 py-2 border rounded bg-gray-100"
        />
      </div>

      <div>
        <label>Phone</label>
        <input
          type="tel"
          value={formStep2.phone}
          onChange={(e) => setFormStep2({ ...formStep2, phone: e.target.value })}
          className="w-full px-4 py-2 border rounded"
        />
      </div>

      <div>
        <label>Password</label>
        <input
          type="password"
          value={formStep2.password}
          onChange={(e) => setFormStep2({ ...formStep2, password: e.target.value })}
          className="w-full px-4 py-2 border rounded"
        />
      </div>

      <div>
        <label>Confirm Password</label>
        <input
          type="password"
          value={formStep2.confirmPassword}
          onChange={(e) =>
            setFormStep2({ ...formStep2, confirmPassword: e.target.value })
          }
          className="w-full px-4 py-2 border rounded"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="w-full bg-gray-500 text-white py-2 rounded"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Account'}
        </button>
      </div>
    </form>
  );
}
```

---

## 5. Login Component

### `src/pages/Login.jsx`
```javascript
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login(form.email, form.password);
      if (response.success) {
        // Store token
        localStorage.setItem('accessToken', response.accessToken);
        
        // Update store
        login(response.data);
        
        toast.success('Login successful!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <h1 className="text-3xl font-bold text-center mb-6">Login</h1>

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full px-4 py-2 border rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full px-4 py-2 border rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <div className="text-center space-y-2">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-500">
              Register
            </Link>
          </p>
          <p>
            <Link to="/forgot-password" className="text-blue-500">
              Forgot Password?
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
```

---

## 6. Protected Route Component

### `src/components/ProtectedRoute.jsx`
```javascript
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function ProtectedRoute({ children }) {
  const { isLoggedIn, isVerified } = useAuthStore();

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  if (!isVerified) {
    return <Navigate to="/verify-email" />;
  }

  return children;
}
```

---

## 7. Forgot Password Component

### `src/pages/ForgotPassword.jsx`
```javascript
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        setSent(true);
        toast.success('Check your email for reset link');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md text-center space-y-4">
          <h2 className="text-2xl font-bold">Check Your Email</h2>
          <p>We've sent a password reset link to {email}</p>
          <p className="text-sm text-gray-600">
            The link will expire in 1 hour.
          </p>
          <Link to="/login" className="text-blue-500">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <h1 className="text-3xl font-bold text-center mb-6">Forgot Password</h1>

        <p className="text-gray-600 text-center mb-4">
          Enter your email and we'll send you a password reset link.
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>

        <Link to="/login" className="block text-center text-blue-500">
          Back to Login
        </Link>
      </form>
    </div>
  );
}
```

---

## 8. Reset Password Component

### `src/pages/ResetPassword.jsx`
```javascript
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset link');
      navigate('/login');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.newPassword || !form.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (form.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.resetPassword(
        token,
        form.newPassword,
        form.confirmPassword
      );

      if (response.success) {
        toast.success('Password reset successful! Please login');
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <h1 className="text-3xl font-bold text-center mb-6">Reset Password</h1>

        <input
          type="password"
          placeholder="New Password"
          value={form.newPassword}
          onChange={(e) =>
            setForm({ ...form, newPassword: e.target.value })
          }
          className="w-full px-4 py-2 border rounded"
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={(e) =>
            setForm({ ...form, confirmPassword: e.target.value })
          }
          className="w-full px-4 py-2 border rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}
```

---

## 9. App.jsx with Protected Routes

### `src/App.jsx`
```javascript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Footer />
      <ToastContainer />
    </Router>
  );
}
```

---

## 10. Navbar with Logout

### `src/components/Navbar.jsx`
```javascript
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';

export default function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authService.logout();
      logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          CarDB
        </Link>

        <div className="flex gap-4">
          {!isLoggedIn ? (
            <>
              <Link to="/login" className="hover:text-gray-300">
                Login
              </Link>
              <Link to="/register" className="hover:text-gray-300">
                Register
              </Link>
            </>
          ) : (
            <>
              <span className="px-4 py-2">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
```

---

These examples provide a complete foundation for implementing the authentication system on the frontend. Adjust styling and components as needed for your design.
