import React, { useState } from "react"
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({name:"",  phone:"", email:"", password:"", confirmPassword:""});
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Phone validation
    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10,}$/.test(form.phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = "Please enter a valid phone number (at least 10 digits)";
    }

    // Password validation
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try{
      await axios.post(
        "/api/auth/register",
        {
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password
        },
        { withCredentials: true }
      );
      toast.success("Registration successful! Please login.");
      navigate("/login");
    }catch(err){
      const errorMessage = err.response?.data?.message || "Registration failed";
      toast.error(errorMessage);
    }
  }
  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2">
        <label htmlFor="name" className="text-foreground text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          type="text"
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={`w-full h-12 px-4 rounded-md bg-card border ${errors.name ? 'border-red-500' : 'border-border'} text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${errors.name ? 'focus:ring-red-500' : 'focus:ring-primary'}`}
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-foreground text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className={`w-full h-12 px-4 rounded-md bg-card border ${errors.email ? 'border-red-500' : 'border-border'} text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${errors.email ? 'focus:ring-red-500' : 'focus:ring-primary'}`}
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="phone" className="text-foreground text-sm font-medium">
          Phone Number
        </label>
        <input
          id="phone"
          type="tel"
          placeholder="Enter your phone number"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className={`w-full h-12 px-4 rounded-md bg-card border ${errors.phone ? 'border-red-500' : 'border-border'} text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${errors.phone ? 'focus:ring-red-500' : 'focus:ring-primary'}`}
        />
        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-foreground text-sm font-medium">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className={`w-full h-12 px-4 pr-12 rounded-md bg-card border ${errors.password ? 'border-red-500' : 'border-border'} text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${errors.password ? 'focus:ring-red-500' : 'focus:ring-primary'}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-foreground text-sm font-medium">
          Confirm password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            className={`w-full h-12 px-4 pr-12 rounded-md bg-card border ${errors.confirmPassword ? 'border-red-500' : 'border-border'} text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${errors.confirmPassword ? 'focus:ring-red-500' : 'focus:ring-primary'}`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
      </div>

      <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-12 rounded-md transition-colors" onClick={handleRegister}>
        Create My Account
      </button>

      <p className="text-center text-sm text-foreground">
        Already have an account?{" "}
        <a href="#" className="text-primary hover:underline">
          Login here
        </a>
      </p>
    </div>
  )
}
