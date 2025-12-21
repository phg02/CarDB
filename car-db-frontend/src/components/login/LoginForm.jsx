import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../../lib/utils";

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const {setAuth} = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Password validation
    if (!form.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      const response = await api.post(
        "/auth/login",
        {
          email: form.email,
          password: form.password,
        }
      );
      console.log('Login response:', response.data);
      setAuth({
        accessToken: response.data.accessToken,
        role: response.data.data.user.role,
        verified: response.data.data.user.verified,
        email: response.data.data.user.email
      });
      console.log('Auth state set:', { accessToken: !!response.data.accessToken, role: response.data.data.user.role });
      toast.success("Login successful!");
      navigate("/");
    } catch (err) {
      console.error('Login error:', err.response?.data);
      const errorMessage = err.response?.data?.message || "Login failed";
      toast.error(errorMessage);
    }
  };
  return (
    <div className="w-full max-w-md space-y-6 py-12">
      <div className="space-y-2">
        <label htmlFor="email" className="text-foreground text-sm font-semibold">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className={`w-full h-10 px-3 py-2 rounded-md border ${errors.email ? 'border-red-500' : 'border-border'} bg-input-bg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${errors.email ? 'focus:ring-red-500' : 'focus:ring-primary'}`}
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-foreground text-sm font-semibold">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className={`w-full h-10 px-3 py-2 rounded-md border ${errors.password ? 'border-red-500' : 'border-border'} bg-input-bg text-foreground placeholder:text-muted-foreground pr-10 focus:outline-none focus:ring-2 ${errors.password ? 'focus:ring-red-500' : 'focus:ring-primary'}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
      </div>      
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
          <input type="checkbox" className="w-4 h-4 rounded border-border" />
          Remember me
        </label>
        <a href="#" className="text-sm text-primary hover:underline">
          Forgot password?
        </a>
      </div>

      <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-12 rounded-md transition-colors" onClick={handleLogin}>
        Sign in
      </button>

      <p className="text-center text-sm text-foreground">
        Don't have an account?{" "}
        <a href="/" className="text-primary hover:underline">
          Sign up here
        </a>
      </p>
    </div>
  );
};
